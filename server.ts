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

  app.get("/api/v1/mlb/*", async (req, res) => {
    try {
      const fullPath = req.path;
      const mlbPath = fullPath.replace(/^\/api\/v1\/mlb\//, "");
      const queryIndex = req.originalUrl.indexOf("?");
      const queryParams = queryIndex !== -1 ? req.originalUrl.substring(queryIndex + 1) : "";
      
      const url = `https://statsapi.mlb.com/api/v1/${mlbPath}${queryParams ? `?${queryParams}` : ""}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404 && url.includes('contextMetrics')) {
          return res.status(404).json({ error: "No metrics available" });
        }
        return res.status(response.status).json({ error: `MLB API Error` });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Proxy Failed" });
    }
  });

  app.get("/api/v1/debug/mlb", async (req, res) => {
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

  app.get("/api/v1/debug/ballparkpal", (req, res) => {
    res.json({
      message: "Ballpark Pal integration disabled",
      timestamp: new Date().toISOString()
    });
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
