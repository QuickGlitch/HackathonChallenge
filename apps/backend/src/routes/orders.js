import express from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Admin user UUID (fallback for payableTo)
const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000001";

// Helper function to get client IP address
function getClientIpAddress(req) {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    "unknown"
  );
}

// GET /api/orders - Get orders (all for admins, own orders for users)
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Build query filter based on user role
    const whereFilter =
      req.user.role === "admin"
        ? {} // Admins can see all orders
        : { userId: req.user.userId }; // Regular users only see their own orders

    const orders = await req.prisma.order.findMany({
      where: whereFilter,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/:id - Get a single order (with ownership check)
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await req.prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if user has permission to view this order
    if (req.user.role !== "admin" && order.userId !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "Access denied: You can only view your own orders" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// POST /api/orders - Create a new order
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { items, total, customer, payment } = req.body;

    if (!items || !items.length || total == null || !customer) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate total quantity of items does not exceed 10
    const totalQuantity = items.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    if (totalQuantity > 10) {
      return res.status(400).json({
        error: "Cart limit exceeded: Maximum 10 items allowed in total",
      });
    }

    // Get client IP address
    const clientIpAddress = getClientIpAddress(req);

    // Create the order with items
    const order = await req.prisma.order.create({
      data: {
        total: parseFloat(total),
        status: "pending",
        userId: req.user.userId,
        customerName: customer.name,
        clientIpAddress: clientIpAddress,
        items: {
          create: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: parseFloat(item.price),
            payableTo: item.payableTo || ADMIN_USER_ID, // Use the payableTo from the cart item, fallback to admin
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // In a real application, you would process the payment here
    // For this demo, we'll just simulate a successful payment

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// PUT /api/orders/:id/status - Update order status (admin only)
router.put("/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await req.prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json(order);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Order not found" });
    }
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

export default router;
