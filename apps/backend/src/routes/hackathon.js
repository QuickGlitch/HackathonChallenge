import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Point values
const POINTS = {
  ctfFlag: 5000000,
  piiPerTeam: 100000,
  unreleasedProduct: 100000,
};

// Helper function to normalize strings for comparison (case-insensitive, trim whitespace)
function normalizeString(str) {
  return (str || '').trim().toLowerCase();
}

// Helper function to fetch CTF text from file
function getCTFText() {
  // hardcoded since CTF isn't meant to be accesible from here
  return 'Maybe the the real CTF is the friends we made along the way.';
}

// Helper function to calculate scores
async function calculateScores(answers, prisma) {
  let ctfFlagPoints = 0;
  let piiPoints = 0;
  let unreleasedProductPoints = 0;

  // Fetch correct answers from database
  const [users, unreleasedProduct, ctfText] = await Promise.all([
    // Fetch all Hackors team users with their PII in a single query
    prisma.user.findMany({
      where: {
        username: {
          in: ['Hackors1', 'Hackors2', 'Hackors3', 'Hackors4', 'Hackors5'],
        },
      },
      select: {
        username: true,
        PII: true,
      },
    }),
    // Fetch the unreleased product
    prisma.product.findFirst({
      where: {
        released: false,
      },
      select: {
        description: true,
      },
    }),
    // Fetch CTF text from file
    getCTFText(),
  ]);

  console.log('Unreleased product:', unreleasedProduct);

  // Create a map of username -> PII for easy lookup
  const piiMap = {};
  users.forEach((user) => {
    const fieldName = `${user.username.toLowerCase()}PII`;
    piiMap[fieldName] = user.PII;
  });

  // Check CTF flag
  if (normalizeString(answers.ctfText) === normalizeString(ctfText)) {
    ctfFlagPoints = POINTS.ctfFlag;
  }

  // Check unreleased product description
  if (
    unreleasedProduct &&
    normalizeString(answers.unreleasedProduct) ===
      normalizeString(unreleasedProduct.description)
  ) {
    unreleasedProductPoints = POINTS.unreleasedProduct;
  }

  // Check PII for each team
  const piiFields = [
    'hackors1PII',
    'hackors2PII',
    'hackors3PII',
    'hackors4PII',
    'hackors5PII',
  ];

  for (const field of piiFields) {
    if (answers[field] && piiMap[field]) {
      if (normalizeString(answers[field]) === normalizeString(piiMap[field])) {
        piiPoints += POINTS.piiPerTeam;
      }
    }
  }

  const totalPoints = ctfFlagPoints + piiPoints + unreleasedProductPoints;

  return {
    ctfFlagPoints,
    piiPoints,
    unreleasedProductPoints,
    totalPoints,
  };
}

// POST /api/hackathon/answers - Submit hackathon answers
router.post('/answers', authenticateToken, async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'answers (object) is required' });
    }

    // Get the current user's username to prevent self-scoring
    const currentUser = await req.prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { username: true },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove the user's own PII field from answers to prevent self-scoring
    const userPiiField = `${currentUser.username.toLowerCase()}PII`;
    if (answers[userPiiField]) {
      req.log.warn({
        userId: req.user.userId,
        username: currentUser.username,
        attemptedField: userPiiField,
        msg: 'User attempted to submit their own PII for points',
      });

      // Remove their own PII field
      delete answers[userPiiField];
    } // Save the raw answers
    await req.prisma.hackathonAnswer.create({
      data: {
        userId: req.user.userId,
        answers,
      },
    });

    // Calculate scores
    const scores = await calculateScores(answers, req.prisma);

    // Update or create the hackathon score record
    await req.prisma.hackathonScore.upsert({
      where: { userId: req.user.userId },
      update: {
        ctfFlagPoints: scores.ctfFlagPoints,
        piiPoints: scores.piiPoints,
        unreleasedProductPoints: scores.unreleasedProductPoints,
        totalPoints: scores.totalPoints,
      },
      create: {
        userId: req.user.userId,
        ctfFlagPoints: scores.ctfFlagPoints,
        piiPoints: scores.piiPoints,
        unreleasedProductPoints: scores.unreleasedProductPoints,
        totalPoints: scores.totalPoints,
      },
    });

    res.status(201).json({
      message: 'Answers submitted successfully',
      scores: {
        ctfFlagPoints: scores.ctfFlagPoints,
        piiPoints: scores.piiPoints,
        unreleasedProductPoints: scores.unreleasedProductPoints,
        totalPoints: scores.totalPoints,
      },
    });
  } catch (error) {
    console.error('Error submitting answers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
