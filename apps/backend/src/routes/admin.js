import express from "express";
const router = express.Router();

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
