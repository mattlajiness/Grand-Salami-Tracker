import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { DetailedVenueFactors } from "./src/lib/leagueConstants.ts";

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      // Suppress logging for common source files and assets to reduce noise
      const isAsset = req.url.match(/\.(ts|tsx|js|jsx|css|svg|png|jpg|jpeg|ico|woff2?)$/) || req.url.includes('/node_modules/');
      if (!isAsset || res.statusCode >= 400) {
        console.log(`[Server] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
      }
    });
    next();
  });

  // API routes go here
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/v1/parkfactors", (req, res) => {
    res.json({
      success: true,
      data: DetailedVenueFactors,
      metadata: {
        lastUpdated: new Date().toISOString(),
        source: "Bundled Baseline",
        version: "1.0.0",
        live: false
      }
    });
  });

  app.get("/api/v1/mlb/debug", async (req, res) => {
    try {
      const url = "https://statsapi.mlb.com/api/v1/schedule?sportId=1";
      const start = Date.now();
      const response = await fetch(url);
      const duration = Date.now() - start;
      const data = await response.json().catch(() => ({ error: "Not JSON" })) as any;
      
      res.json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        durationMs: duration,
        url: url,
        hasData: !!data && !data.error,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    }
  });

  app.get("/api/v1/mlb/*", async (req, res) => {
    const subpath = req.params[0];
    const parts = req.originalUrl.split("?");
    const query = parts.length > 1 ? `?${parts[1]}` : "";
    const url = `https://statsapi.mlb.com/api/v1/${subpath}${query}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        if (response.status !== 404) {
          console.error(`[MLB Proxy] API Error ${response.status}: ${url}`);
        }
        
        return res.status(response.status).json({ 
          error: "MLB API Error", 
          status: response.status,
          apiError: errorBody.slice(0, 100),
          url: url
        });
      }
      
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return res.json(data);
      } else {
        const text = await response.text().catch(() => "");
        return res.status(502).json({ 
          error: "Invalid response from MLB API (Expected JSON)", 
          contentType,
          preview: text.slice(0, 100),
          url: url
        });
      }
    } catch (error) {
      console.error("[MLB Proxy] Fatal:", error);
      res.status(500).json({ 
        error: "Proxy Failed", 
        message: error instanceof Error ? error.message : String(error),
        url: url 
      });
    }
  });

  app.get("/api/v1/debug/ballparkpal", (req, res) => {
    res.json({
      message: "Ballpark Pal integration disabled",
      timestamp: new Date().toISOString()
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: process.cwd(),
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
