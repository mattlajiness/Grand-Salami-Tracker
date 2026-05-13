import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { TwitterApi } from "twitter-api-v2";

// Load environment variables from .env file
dotenv.config();

// Fix for CJS/ESM compatibility - using a safer approach
const isESM = typeof import.meta !== 'undefined' && import.meta.url;
let _filename = '';
let _dirname = '';

if (isESM) {
  _filename = fileURLToPath(import.meta.url);
  _dirname = path.dirname(_filename);
} else {
  _filename = typeof __filename !== 'undefined' ? __filename : '';
  _dirname = typeof __dirname !== 'undefined' ? __dirname : '';
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Ballpark Pal Proxy
  app.get("/api/ballpark-pal/park-factors", async (req, res) => {
    try {
      const apiKey = process.env.BALLPARK_PAL_API_KEY;
      if (!apiKey) {
        console.warn("BALLPARK_PAL_API_KEY missing from environment");
        return res.status(500).json({ error: "BALLPARK_PAL_API_KEY not configured" });
      }

      const date = req.query.date || new Date().toISOString().split('T')[0];
      const url = `https://ballparkpal.com/api/v1/parkfactors?date=${date}`;
      console.log(`[BallparkPal] Fetching date: ${date}`);

      const response = await fetch(url, {
        headers: {
          'X-API-KEY': apiKey
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[BallparkPal] Status:", response.status, errorText);
        return res.status(response.status).json({ error: "Failed to fetch from Ballpark Pal" });
      }

      const data = await response.json();
      console.log(`[BallparkPal] Success. Received ${Array.isArray(data?.data?.items) ? data.data.items.length : (data.items ? data.items.length : 'unknown')} items`);
      res.json(data);
    } catch (error) {
      console.error("[BallparkPal] Proxy Error:", error);
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

  // NHL Game Details Proxy
  app.get("/api/nhl/game/:gameId", async (req, res) => {
    try {
      const { gameId } = req.params;
      const url = `https://api-web.nhle.com/v1/gamecenter/${gameId}/landing`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch NHL game details" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("NHL Game Details Proxy Error:", error);
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
    // In production, server.cjs is IN dist/, so distPath is either current dir or process.cwd()/dist
    let distPath = path.join(process.cwd(), "dist");
    if (!fs.existsSync(distPath)) {
      distPath = _dirname; // Fallback to current directory of server.cjs
    }
    
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
