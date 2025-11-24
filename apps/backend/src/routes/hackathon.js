import express from "express";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// POST /api/hackathon/answers - Submit hackathon answers
router.post("/answers", authenticateToken, async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ error: "answers (object) is required" });
    }
    await req.prisma.hackathonAnswer.create({
      data: {
        userId: req.user.userId,
        answers,
      },
    });
    res.status(201).json({ message: "Answers submitted successfully" });
  } catch (error) {
    console.error("Error submitting answers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
