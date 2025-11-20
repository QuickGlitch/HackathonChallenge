import express from "express";

const router = express.Router();

// Admin user UUID (payable to admin for scoring purposes)
const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000001";

// Team user UUIDs (Hackors 1-5, corresponding to users 2-6 in the original seed)
const TEAM_USER_IDS = [
  "00000000-0000-0000-0000-000000000002", // Hackors1
  "00000000-0000-0000-0000-000000000003", // Hackors2
  "00000000-0000-0000-0000-000000000004", // Hackors3
  "00000000-0000-0000-0000-000000000005", // Hackors4
  "00000000-0000-0000-0000-000000000006", // Hackors5
];

// GET /api/scores - Get team scores
router.get("/", async (req, res) => {
  try {
    const prisma = req.prisma;

    // Get all teams (users with ids 1-5 based on seed data)
    const teams = await prisma.user.findMany({
      where: {
        id: {
          in: TEAM_USER_IDS,
        },
      },
      select: {
        id: true,
        username: true,
      },
    });

    // Calculate scores for each team
    const teamScores = await Promise.all(
      teams.map(async (team) => {
        let score = 0;

        // 1 point per order placed with total value of 0 and payable to admin
        const freeOrders = await prisma.order.findMany({
          where: {
            total: 0,
            userId: team.id,
            items: {
              some: {
                payableTo: ADMIN_USER_ID,
              },
            },
          },
        });
        score += freeOrders.length;

        // X points for any order items payable to the team (X being the price)
        // Exclude items that are payable to the buyer themselves (items sold by themselves)
        const payableItems = await prisma.orderItem.findMany({
          where: {
            payableTo: team.id,
            order: {
              userId: {
                not: team.id,
              },
            },
          },
          include: {
            order: true,
          },
        });

        const payableScore = payableItems.reduce((sum, item) => {
          return sum + item.price * item.quantity;
        }, 0);

        score += payableScore;

        return {
          teamId: team.id,
          teamName: team.username,
          score: Math.round(score * 100) / 100, // Round to 2 decimal places
        };
      })
    );

    res.json(teamScores);
  } catch (error) {
    console.error("Error calculating scores:", error);
    res.status(500).json({ error: "Failed to calculate scores" });
  }
});

export default router;
