import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { TwitterApi } from "twitter-api-v2";

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Ballpark Pal Proxy
  app.get("/api/ballpark-pal/park-factors", async (req, res) => {
    try {
      const apiKey = process.env.BALLPARK_PAL_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "BALLPARK_PAL_API_KEY not configured" });
      }

      // Found the correct API endpoint and auth method
      const date = req.query.date || new Date().toISOString().split('T')[0];
      const url = `https://ballparkpal.com/api/v1/parkfactors?date=${date}`;
      const response = await fetch(url, {
        headers: {
          'X-API-KEY': apiKey
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ballpark Pal fetch error:", response.status, errorText);
        return res.status(response.status).json({ error: "Failed to fetch from Ballpark Pal" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Ballpark Pal Proxy Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // NHL API Proxy
  app.get("/api/nhl/scores", async (req, res) => {
    try {
      const date = req.query.date || new Date().toISOString().split('T')[0];
      const url = `https://api-web.nhle.com/v1/score/${date}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        // Fallback to "now"
        const nowResponse = await fetch('https://api-web.nhle.com/v1/score/now');
        if (nowResponse.ok) {
          const nowData = await nowResponse.json();
          return res.json(nowData);
        }
        return res.status(response.status).json({ error: "Failed to fetch from NHL API" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("NHL Proxy Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // API routes go here
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
