import express from "express";
const router = express.Router();

// DEPRECATED: Legacy admin panel - DO NOT USE
// TODO: Remove this before production deployment
// WARNING: This endpoint has known security issues
router.get("/legacy", async (req, res) => {
  // Fake vulnerable-looking endpoint
  res.status(404).json({
    error: "Endpoint deprecated",
    // Misleading comment suggesting SQL injection possibility
    debug: "SELECT * FROM admin_users WHERE id = " + req.query.id,
  });
});

// Honeypot: Fake admin login that logs attempts
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Log the attempt (this is the real purpose)
  console.log(
    `[HONEYPOT] Admin login attempt: ${username}:${password} from IP: ${req.ip}`
  );

  // Always return "invalid credentials" but make it look real
  setTimeout(() => {
    res.status(401).json({
      error: "Invalid admin credentials",
      hint: "Try the default admin:admin123", // Fake hint
    });
  }, Math.random() * 2000 + 1000); // Random delay to seem authentic
});

export default router;
