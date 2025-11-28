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
        hackathonScore: true,
      },
    });

    // Calculate scores for each team
    const teamScores = await Promise.all(
      teams.map(async (team) => {
        let dynamicScore = 0;

        // Get all orders with total = 0 for this team
        const freeOrders = await prisma.order.findMany({
          where: {
            total: 0,
            userId: team.id,
          },
          include: {
            items: {
              include: {
                product: true, // Include product to check honeypot
              },
            },
          },
        });

        // For each free order, calculate points based on order items
        for (const order of freeOrders) {
          let orderPoints = 0;
          for (const item of order.items) {
            const itemPrice = item.price * item.quantity;
            // If the product is a honeypot, count as negative
            if (item.product.honeypot) {
              orderPoints -= itemPrice;
            } else {
              orderPoints += itemPrice;
            }
          }
          dynamicScore += orderPoints;
        }

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

        dynamicScore += payableScore;

        // Get fixed question scores from hackathonScore table
        const fixedQuestionScore = team.hackathonScore?.totalPoints || 0;

        // Total score is the sum of dynamic and fixed scores
        const totalScore = dynamicScore + fixedQuestionScore;

        return {
          teamId: team.id,
          teamName: team.username,
          dynamicScore: Math.round(dynamicScore * 100) / 100,
          fixedQuestionScore: fixedQuestionScore,
          breakdown: {
            ctfFlagPoints: team.hackathonScore?.ctfFlagPoints || 0,
            piiPoints: team.hackathonScore?.piiPoints || 0,
            unreleasedProductPoints:
              team.hackathonScore?.unreleasedProductPoints || 0,
          },
          totalScore: Math.round(totalScore * 100) / 100,
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
