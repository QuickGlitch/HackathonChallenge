import express from "express";

const router = express.Router();

// GET /api/orders - Get all orders (admin endpoint)
router.get("/", async (req, res) => {
  try {
    const orders = await req.prisma.order.findMany({
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

// GET /api/orders/:id - Get a single order
router.get("/:id", async (req, res) => {
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

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// POST /api/orders - Create a new order
router.post("/", async (req, res) => {
  try {
    const { items, total, customer, payment } = req.body;

    if (!items || !items.length || !total || !customer) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create the order with items
    const order = await req.prisma.order.create({
      data: {
        total: parseFloat(total),
        status: "pending",
        customerName: customer.name,
        customerEmail: customer.email,
        shippingAddress: `${customer.address}, ${customer.city} ${customer.zipCode}`,
        items: {
          create: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: parseFloat(item.price),
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

// PUT /api/orders/:id/status - Update order status
router.put("/:id/status", async (req, res) => {
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
