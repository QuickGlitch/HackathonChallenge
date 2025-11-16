import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  let token = req.cookies?.accessToken;

  // If no token in cookies, try to get it from Authorization header
  if (!token) {
    const authHeader = req.headers["authorization"];
    token = authHeader && authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Middleware to check if user can access another user's resource (self or admin)
export const requireUserOrAdmin = (userParam = "username") => {
  return (req, res, next) => {
    const targetUser = req.params[userParam];

    // Users can only access their own resources, unless they're admin
    if (req.user.username !== targetUser && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  };
};
