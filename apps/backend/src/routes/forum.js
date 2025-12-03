import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/forum - Get all forum messages
router.get('/', async (req, res) => {
  try {
    const messages = await req.prisma.forumMessage.findMany({
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching forum messages:', error);
    res.status(500).json({ error: 'Failed to fetch forum messages' });
  }
});

// GET /api/forum/:id - Get a specific forum message
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const message = await req.prisma.forumMessage.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    if (!message) {
      return res.status(404).json({ error: 'Forum message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error('Error fetching forum message:', error);
    res.status(500).json({ error: 'Failed to fetch forum message' });
  }
});

// POST /api/forum - Create a new forum message ("forgot" to add authentication)
// VULNERABILITY: No input sanitization - allows XSS attacks
router.post('/', async (req, res) => {
  try {
    const { title, body, userId } = req.body;
    // const userId = req.user.userId;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    // INTENTIONALLY VULNERABLE: No sanitization of title and body
    // This allows XSS attacks through script injection
    const newMessage = await req.prisma.forumMessage.create({
      data: {
        title: title, // Raw input - XSS vulnerable
        body: body, // Raw input - XSS vulnerable
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error creating forum message:', error);
    res.status(500).json({ error: 'Failed to create forum message' });
  }
});

// PUT /api/forum/:id - Update a forum message (requires authentication)
// VULNERABILITY: No input sanitization and weak authorization
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body } = req.body;
    const userId = req.user.userId;

    const existingMessage = await req.prisma.forumMessage.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingMessage) {
      return res.status(404).json({ error: 'Forum message not found' });
    }

    // VULNERABILITY: Only checking if user exists, not if they own the message
    // This could allow unauthorized edits
    if (existingMessage.authorId !== userId && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ error: 'Not authorized to edit this message' });
    }

    // INTENTIONALLY VULNERABLE: No sanitization of title and body
    const updatedMessage = await req.prisma.forumMessage.update({
      where: { id: parseInt(id) },
      data: {
        title: title || existingMessage.title, // Raw input - XSS vulnerable
        body: body || existingMessage.body, // Raw input - XSS vulnerable
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    res.json(updatedMessage);
  } catch (error) {
    console.error('Error updating forum message:', error);
    res.status(500).json({ error: 'Failed to update forum message' });
  }
});

// DELETE /api/forum/:id - Delete a forum message (requires authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const existingMessage = await req.prisma.forumMessage.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingMessage) {
      return res.status(404).json({ error: 'Forum message not found' });
    }

    if (existingMessage.authorId !== userId && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ error: 'Not authorized to delete this message' });
    }

    await req.prisma.forumMessage.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Forum message deleted successfully' });
  } catch (error) {
    console.error('Error deleting forum message:', error);
    res.status(500).json({ error: 'Failed to delete forum message' });
  }
});

export default router;
