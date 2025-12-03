import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  authenticateToken,
  optionalAuthentication,
} from '../middleware/auth.js';
import { validatePrice } from '../utils/validation.js';

const router = express.Router();

// Helper function to ensure image URLs are absolute
function ensureAbsoluteImageUrl(imageUrl) {
  if (!imageUrl) return 'https://via.placeholder.com/300x200';

  // If it's already absolute, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's relative, make it absolute
  if (imageUrl.startsWith('/static/')) {
    const baseUrl =
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
    return `${baseUrl}${imageUrl}`;
  }

  return imageUrl;
}
// POST /api/products/register - Register a new product by a user (authenticated)
router.post('/register', authenticateToken, async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;
    const userId = req.user.userId; // Get user ID from authenticated token

    if (!name || !description || !price) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: name, description, price' });
    }

    // Validate price
    const priceValidation = validatePrice(price);
    if (!priceValidation.valid) {
      return res.status(400).json({ error: priceValidation.error });
    }
    const productPrice = priceValidation.value;

    // Handle image URL
    let imageUrl = image || 'https://via.placeholder.com/300x200'; // default image

    const product = await req.prisma.product.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price: productPrice,
        image: imageUrl,
        category: category?.trim() || 'General',
        payableTo: userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Product registered successfully',
      product,
    });
  } catch (error) {
    console.error('Error registering product:', error);
    res.status(500).json({ error: 'Failed to register product' });
  }
});

// GET /api/products - Get all products
router.get('/', optionalAuthentication, async (req, res) => {
  try {
    // Check if user is admin (from optional authentication)
    const isAdmin = req.user && req.user.role === 'admin';

    // Check for honeypot cookie
    const hasHoneyCookie = req.cookies && req.cookies.honey === 'pot';

    // Build query filter - non-admins only see released products
    // Also filter out honeypot products unless the honey cookie is present
    const whereFilter = {
      ...(isAdmin ? {} : { released: true }),
      ...(hasHoneyCookie ? {} : { honeypot: false }),
    };

    const products = await req.prisma.product.findMany({
      where: whereFilter,
      orderBy: { createdAt: 'desc' },
    });

    // Ensure all image URLs are absolute
    const productsWithAbsoluteUrls = products.map((product) => ({
      ...product,
      image: ensureAbsoluteImageUrl(product.image),
    }));

    res.json(productsWithAbsoluteUrls);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/search - Search products by name (CONTROLLED SQL injection for training)
router.get('/search', optionalAuthentication, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res
        .status(400)
        .json({ error: "Search query parameter 'q' is required" });
    }

    // LIMITED SQL injection vulnerability for training purposes
    // This allows reading from products table but prevents destructive operations
    // and access to other tables

    // Basic input sanitization to prevent destructive operations
    const dangerousKeywords = [
      // Destructive operations
      'delete',
      'drop',
      'truncate',
      'insert',
      'update',
      'alter',
      'create',
      // System functions and procedures
      'exec',
      'execute',
      'sp_',
      'xp_',
      'dbms_',
      'utl_',
      'sys_eval',
      // Schema inspection
      'information_schema',
      'pg_catalog',
      'sys.',
      'master.',
      'msdb.',
      'tempdb.',
      'pg_tables',
      'pg_class',
      'pg_namespace',
      'pg_proc',
      'pg_user',
      // Other table names
      'users',
      'orders',
      'order_items',
      'forum_messages',
      // File operations and command execution
      'load_file',
      'into outfile',
      'into dumpfile',
      'load data',
      // Additional dangerous functions
      'benchmark',
      'sleep',
      'waitfor',
      'pg_sleep',
    ];

    const queryLower = q.toLowerCase().replace(/\s+/g, ' ').trim();
    const containsDangerous = dangerousKeywords.some((keyword) =>
      queryLower.includes(keyword.toLowerCase())
    );

    if (containsDangerous) {
      return res.status(400).json({
        error:
          'For hackathon purposes, this query is blocked try simpler / less harmful injections.',
      });
    }

    // Additional check for multiple statements (basic)
    if (queryLower.includes(';') && queryLower.split(';').length > 2) {
      return res.status(400).json({
        error:
          'For hackathon purposes, multi-statement queries are blocked try simpler / less harmful injections.',
      });
    }

    // CONTROLLED VULNERABILITY: Limited SQL injection in a constrained context
    // This allows SQL injection but limits it to the products table only
    // Note: Admin check for released products is intentionally bypassable via SQL injection
    const isAdmin = req.user && req.user.role === 'admin';
    const releasedFilter = isAdmin ? '' : 'AND released = true';

    const rawQuery = `
      SELECT id, name, description, price, image, category, released, "payableTo", "createdAt", "updatedAt"
      FROM products 
      WHERE name ILIKE '%${q}%' ${releasedFilter}
      ORDER BY "createdAt" DESC
    `;

    let products;

    // Execute in a transaction with read-only mode to prevent modifications
    try {
      products = await req.prisma.$transaction(async (prisma) => {
        // Set transaction to read-only to prevent any modifications
        await prisma.$executeRaw`SET TRANSACTION READ ONLY`;
        return await prisma.$queryRawUnsafe(rawQuery);
      });
    } catch (dbError) {
      // If there's a database error, don't expose details
      console.error('Database query error:', dbError);
      throw new Error('Search failed');
    }

    // Ensure all image URLs are absolute
    const productsWithAbsoluteUrls = products.map((product) => ({
      ...product,
      image: ensureAbsoluteImageUrl(product.image),
    }));

    res.json(productsWithAbsoluteUrls);
  } catch (error) {
    console.error('Error searching products:', error);

    // Don't expose detailed database errors that might help attackers
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// GET /api/products/:id - Get a single product
router.get('/:id', optionalAuthentication, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await req.prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Intentional IDOR vulnerability: Non-released products are visible to anyone who looks for them
    // const isAdmin = req.user && req.user.role === "admin";
    // if (!product.released && !isAdmin) {
    //   return res.status(404).json({ error: "Product not found" });
    // }

    // Ensure image URL is absolute
    const productWithAbsoluteUrl = {
      ...product,
      image: ensureAbsoluteImageUrl(product.image),
    };

    res.json(productWithAbsoluteUrl);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products - Create a new product
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, price, image, category, released } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Only admins can create unreleased products
    if (released === false && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ error: 'Only admins can create unreleased products' });
    }

    const product = await req.prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image: image || 'https://via.placeholder.com/300x200',
        category: category || 'General',
        released: released !== undefined ? released : true,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id - Update a product
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category, released } = req.body;

    // Only admins can modify the released status
    if (released !== undefined && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ error: 'Only admins can modify release status' });
    }

    const product = await req.prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(image && { image }),
        ...(category && { category }),
        ...(released !== undefined && { released }),
      },
    });

    res.json(product);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await req.prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
