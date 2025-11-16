import express from "express";
import multer from "multer";
import path from "path";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Helper function to ensure image URLs are absolute
function ensureAbsoluteImageUrl(imageUrl) {
  if (!imageUrl) return "https://via.placeholder.com/300x200";

  // If it's already absolute, return as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // If it's relative, make it absolute
  if (imageUrl.startsWith("/static/")) {
    const baseUrl =
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
    return `${baseUrl}${imageUrl}`;
  }

  return imageUrl;
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "src", "static", "images"));
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random number
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "product-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// POST /api/products/register - Register a new product by a user (authenticated)
router.post(
  "/register",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, description, price, category } = req.body;
      const userId = req.user.userId; // Get user ID from authenticated token

      if (!name || !description || !price) {
        return res
          .status(400)
          .json({ error: "Missing required fields: name, description, price" });
      }

      // Validate price is a number
      const productPrice = parseFloat(price);
      if (isNaN(productPrice) || productPrice <= 0) {
        return res
          .status(400)
          .json({ error: "Price must be a valid positive number" });
      }

      // Handle image file
      let imageUrl = "https://via.placeholder.com/300x200"; // default image
      if (req.file) {
        // Create the full URL path for the uploaded image
        const baseUrl =
          process.env.BASE_URL ||
          `http://localhost:${process.env.PORT || 3001}`;
        imageUrl = `${baseUrl}/static/images/${req.file.filename}`;
      }

      const product = await req.prisma.product.create({
        data: {
          name: name.trim(),
          description: description.trim(),
          price: productPrice,
          image: imageUrl,
          category: category?.trim() || "General",
          payableTo: userId,
        },
      });

      res.status(201).json({
        success: true,
        message: "Product registered successfully",
        product,
      });
    } catch (error) {
      console.error("Error registering product:", error);
      res.status(500).json({ error: "Failed to register product" });
    }
  }
);

// GET /api/products - Get all products
router.get("/", async (req, res) => {
  try {
    const products = await req.prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Ensure all image URLs are absolute
    const productsWithAbsoluteUrls = products.map((product) => ({
      ...product,
      image: ensureAbsoluteImageUrl(product.image),
    }));

    res.json(productsWithAbsoluteUrls);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/search - Search products by name (VULNERABLE to SQL injection for training)
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res
        .status(400)
        .json({ error: "Search query parameter 'q' is required" });
    }

    // VULNERABILITY: Direct string interpolation into raw SQL query
    // This allows SQL injection attacks for training purposes
    const rawQuery = `
      SELECT id, name, description, price, image, category, "payableTo", "createdAt", "updatedAt"
      FROM products 
      WHERE name ILIKE '%${q}%' 
      ORDER BY "createdAt" DESC
    `;

    const products = await req.prisma.$queryRawUnsafe(rawQuery);

    // Ensure all image URLs are absolute
    const productsWithAbsoluteUrls = products.map((product) => ({
      ...product,
      image: ensureAbsoluteImageUrl(product.image),
    }));

    res.json(productsWithAbsoluteUrls);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ error: "Failed to search products" });
  }
});

// GET /api/products/:id - Get a single product
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await req.prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Ensure image URL is absolute
    const productWithAbsoluteUrl = {
      ...product,
      image: ensureAbsoluteImageUrl(product.image),
    };

    res.json(productWithAbsoluteUrl);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST /api/products - Create a new product
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const product = await req.prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image: image || "https://via.placeholder.com/300x200",
        category: category || "General",
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /api/products/:id - Update a product
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category } = req.body;

    const product = await req.prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(image && { image }),
        ...(category && { category }),
      },
    });

    res.json(product);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/products/:id - Delete a product
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await req.prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
