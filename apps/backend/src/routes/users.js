import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";

// POST /api/users - Create a new user
router.post("/", async (req, res) => {
  try {
    const { username, password, name, role = "customer" } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
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
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(tokenPayload, JWT_REFRESH_SECRET, {
      expiresIn: "5m",
    });

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 5 * 60 * 1000, // 5 minutes
    });

    res.json({
      message: "Login successful",
      user: {
        username: user.username,
        name: user.name,
        role: user.role,
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

    const tokenPayload = { username: user.username, role: user.role };
    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: "15m",
    });

    // Set new access token as cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({ message: "Token refreshed successfully" });
  });
});

// POST /api/users/logout - Logout user by clearing cookies
router.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
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

// GET /api/users/:username - Get specific user
router.get("/:username", authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;

    // Users can only view their own profile, unless they're admin
    if (req.user.username !== username && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

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
});

// PUT /api/users/:username - Update user
router.put("/:username", authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const { name, password, role, PII } = req.body;

    // Users can only update their own profile, unless they're admin
    if (req.user.username !== username && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

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
});

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

// GET /api/users/profile/me - Get current user's profile
router.get("/profile/me", authenticateToken, async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({
      where: { username: req.user.username },
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
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
