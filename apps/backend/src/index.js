import express from "express";
import cors from "cors";
import pino from "pino";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

// Import routes
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import userRoutes from "./routes/users.js";
import adminRoutes from "./routes/admin.js";
import scoresRoutes from "./routes/scores.js";
import forumRoutes from "./routes/forum.js";
import hackathonRoutes from "./routes/hackathon.js";

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create pino logger
const logger = pino({
  level: process.env.LOG_LEVEL === "production" ? "info" : "debug",
  transport: {
    targets: [
      {
        target: "pino-pretty",
        level: "info",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
      {
        target: "pino/file",
        level: process.env.NODE_ENV === "production" ? "info" : "debug",
        options: {
          destination: path.join(logsDir, "access.log"),
          mkdir: true,
        },
      },
    ],
  },
});

// Create HTTP logger middleware
const httpLogger = pinoHttp({ logger });

const app = express();
const port = process.env.PORT || 3001;

// Initialize Prisma
const prisma = new PrismaClient();

// Bot activity tracking
let botActivityState = {
  isActive: false,
  startedAt: null,
  lastUpdated: null,
};

// SSE clients for bot activity
const botActivityClients = new Set();

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 10 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  validate: { trustProxy: false }, // Disable trust proxy validation for intentional vulnerabilities
  skip: (req) => {
    // Skip rate limiting for scoreboard endpoints
    return req.path.startsWith("/api/scores");
  },
});

// Middleware
app.set("trust proxy", true); // Trust proxy headers for IP address detection
// app.use(helmet());
app.use(
  cors({
    origin: true, // Allow all origins for development
    credentials: true, // Allow cookies to be sent
  })
);
app.use(httpLogger); // Pino HTTP logger
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Serve static files
app.use("/static", express.static(path.join(process.cwd(), "src", "static")));

// Make Prisma available to all routes
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes); // Honeypot admin routes
app.use("/api/scores", scoresRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/hackathon", hackathonRoutes);

// SSE endpoint for bot activity stream
app.get("/api/bot-activity/stream", (req, res) => {
  // Set SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  // Send current state immediately
  res.write(`data: ${JSON.stringify(botActivityState)}\n\n`);

  // Add client to the set
  botActivityClients.add(res);

  // Send heartbeat every 30 seconds to keep connection alive
  const heartbeatInterval = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 30000);

  // Remove client on disconnect
  req.on("close", () => {
    clearInterval(heartbeatInterval);
    botActivityClients.delete(res);
    logger.info(
      `SSE client disconnected. Active clients: ${botActivityClients.size}`
    );
  });

  logger.info(
    `New SSE client connected. Active clients: ${botActivityClients.size}`
  );
});

// Bot activity update endpoint
app.post("/api/bot-activity", express.json(), (req, res) => {
  const { isActive, startedAt } = req.body;

  // Update bot activity state
  botActivityState = {
    isActive: isActive || false,
    startedAt: startedAt || null,
    lastUpdated: new Date().toISOString(),
  };

  logger.info(`Bot activity updated:`, botActivityState);

  // Broadcast to all connected SSE clients
  const message = `data: ${JSON.stringify(botActivityState)}\n\n`;
  botActivityClients.forEach((client) => {
    try {
      client.write(message);
    } catch (error) {
      logger.error("Error writing to SSE client:", error);
      botActivityClients.delete(client);
    }
  });

  res.json({ success: true, activeClients: botActivityClients.size });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
  logger.info(`API documentation available at http://localhost:${port}/api`);
});
