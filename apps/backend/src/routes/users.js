import express from "express";
import jwt from "jsonwebtoken";
import bcrypt, { encodeBase64 } from "bcryptjs";
import {
  authenticateToken,
  requireAdmin,
  requireUserOrAdmin,
} from "../middleware/auth.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Token expiration times
const ACCESS_TOKEN_EXPIRY = "1m";
const REFRESH_TOKEN_EXPIRY = "24h";

// Cookie maxAge in milliseconds
const ACCESS_TOKEN_MAX_AGE = 1 * 60 * 1000; // 1 minute
const REFRESH_TOKEN_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

// POST /api/users - Create a new user
router.post("/", async (req, res) => {
  try {
    const { username, password, name, role = "customer" } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // If trying to create an admin user, require authentication and admin role
    if (role === "admin") {
      // Check if user is authenticated
      let token = req.cookies?.accessToken;
      if (!token) {
        const authHeader = req.headers["authorization"];
        token = authHeader && authHeader.split(" ")[1];
      }

      if (!token) {
        return res.status(401).json({
          error: "Authentication required to create admin users",
        });
      }

      // Verify token and check if user is admin
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== "admin") {
          return res.status(403).json({
            error: "Only admins can create admin users",
          });
        }
      } catch (tokenError) {
        return res.status(403).json({
          error: "Invalid or expired token",
        });
      }
    }

    // Check if user already exists
    const existingUser = await req.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await req.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role,
      },
      select: {
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/users/login - User login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Find user
    const user = await req.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };
    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
    const refreshToken = jwt.sign(tokenPayload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.USE_SECURE_COOKIES === "true", // Use secure cookies when HTTPS is available
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.USE_SECURE_COOKIES === "true",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: "/api/users/refresh",
    });

    res.json({
      message: "Login successful",
      user: {
        username: user.username,
        id: user.id,
        name: user.name,
        role: user.role,
        tkn: Buffer.from(accessToken).toString("base64"),
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/users/refresh - Refresh access token
router.post("/refresh", (req, res) => {
  // Try to get refresh token from request body (backward compatibility) or cookies
  let refreshToken = req.body.refreshToken || req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ error: "Invalid or expired refresh token" });
    }

    const tokenPayload = {
      userId: user.userId,
      username: user.username,
      role: user.role,
    };
    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    // Set new access token as cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.USE_SECURE_COOKIES === "true",
      sameSite: "strict",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    res.json({ message: "Token refreshed successfully" });
  });
});

// POST /api/users/logout - Logout user by clearing cookies
router.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken", { path: "/api/users/refresh" });
  res.json({ message: "Logged out successfully" });
});

// GET /api/users - Get all users (admin only)
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await req.prisma.user.findMany({
      select: {
        username: true,
        name: true,
        role: true,
        PII: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users/me - Get current user's profile
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({
      where: { username: req.user.username },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        PII: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users/:username - Get specific user
router.get(
  "/:username",
  authenticateToken,
  requireUserOrAdmin(),
  async (req, res) => {
    try {
      const { username } = req.params;

      const user = await req.prisma.user.findUnique({
        where: { username },
        select: {
          username: true,
          name: true,
          role: true,
          PII: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PUT /api/users/:username - Update user
router.put(
  "/:username",
  authenticateToken,
  requireUserOrAdmin(),
  async (req, res) => {
    try {
      const { username } = req.params;
      const { name, password, role, PII } = req.body;

      // Only admins can change roles
      if (role && req.user.role !== "admin") {
        return res
          .status(403)
          .json({ error: "Only admins can change user roles" });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (PII !== undefined) updateData.PII = PII;
      if (role !== undefined) updateData.role = role;

      // Hash password if provided
      if (password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(password, saltRounds);
      }

      const user = await req.prisma.user.update({
        where: { username },
        data: updateData,
        select: {
          username: true,
          name: true,
          role: true,
          PII: true,
          updatedAt: true,
        },
      });

      res.json({
        message: "User updated successfully",
        user,
      });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "User not found" });
      }
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// DELETE /api/users/:username - Delete user (admin only)
router.delete(
  "/:username",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { username } = req.params;

      await req.prisma.user.delete({
        where: { username },
      });

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "User not found" });
      }
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
