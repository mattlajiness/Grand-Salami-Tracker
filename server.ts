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

  // NHL API Proxy
  app.get("/api/nhl/scores", async (req, res) => {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const url = `https://api-web.nhle.com/v1/score/${date}`;
    console.log(`[NHL Proxy] Fetching scores for ${date}: ${url}`);
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });
      clearTimeout(timeout);
      
      if (!response.ok) {
        console.warn(`[NHL Proxy] URL ${url} failed with status ${response.status}. Trying fallback 'now'...`);
        // Fallback to "now"
        const nowUrl = 'https://api-web.nhle.com/v1/score/now';
        const nowResponse = await fetch(nowUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json'
          }
        });
        
        if (nowResponse.ok) {
          const nowData = await nowResponse.json();
          console.log(`[NHL Proxy] Fallback 'now' successful.`);
          return res.json(nowData);
        }
        
        console.error(`[NHL Proxy] Both ${url} and fallback failed.`);
        return res.status(response.status).json({ error: "Failed to fetch from NHL API" });
      }

      const data = await response.json();
      console.log(`[NHL Proxy] Successfully fetched ${data.games?.length || 0} games.`);
      res.json(data);
    } catch (error: any) {
      console.error("NHL Proxy Error:", error);
      const isTimeout = error.name === 'AbortError';
      res.status(isTimeout ? 504 : 500).json({ 
        error: isTimeout ? "Gateway Timeout" : "Internal Server Error",
        message: error.message 
      });
    }
  });

  // NHL Game Details Proxy
  app.get("/api/nhl/game/:gameId", async (req, res) => {
    const { gameId } = req.params;
    const url = `https://api-web.nhle.com/v1/gamecenter/${gameId}/landing`;
    console.log(`[NHL Details Proxy] Fetching details for ${gameId}: ${url}`);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });
      clearTimeout(timeout);
      
      if (!response.ok) {
        console.warn(`[NHL Details Proxy] Failed for ${gameId} with status ${response.status}`);
        return res.status(response.status).json({ error: "Failed to fetch NHL game details" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("NHL Game Details Proxy Error:", error);
      const isTimeout = error.name === 'AbortError';
      res.status(isTimeout ? 504 : 500).json({ 
        error: isTimeout ? "Gateway Timeout" : "Internal Server Error",
        message: error.message 
      });
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
