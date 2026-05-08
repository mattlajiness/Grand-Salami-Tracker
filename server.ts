import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { DetailedVenueFactors } from "./src/lib/leagueConstants.ts";
import { fetchParkFactors, getCachedFactors, getFetchStatus } from "./src/services/ballparkPalService.ts";

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initial fetch on startup
  fetchParkFactors().catch(err => console.error("Initial fetch failed:", err));

  // Set up periodic refresh every 6 hours
  setInterval(() => {
    fetchParkFactors().catch(err => console.error("Periodic fetch failed:", err));
  }, 1000 * 60 * 60 * 6);

  // API routes go here
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/v1/parkfactors", (req, res) => {
    const dynamicFactors = getCachedFactors();
    res.json({
      success: true,
      data: dynamicFactors || DetailedVenueFactors,
      metadata: {
        lastUpdated: new Date(getCachedFactors() ? getFetchStatus()?.time || Date.now() : Date.now()).toISOString(),
        source: dynamicFactors ? "Ball Park Pal Live" : "Bundled Baseline",
        version: "1.0.0",
        live: !!dynamicFactors
      }
    });
  });

  app.get("/api/v1/mlb/*", async (req, res) => {
    try {
      // Get the path correctly, removing leading /api/v1/mlb/
      const fullPath = req.path;
      const mlbPath = fullPath.replace(/^\/api\/v1\/mlb\//, "");
      
      // Get the query string exactly as it came in to preserve formatting/encoding
      const queryIndex = req.originalUrl.indexOf("?");
      const queryParams = queryIndex !== -1 ? req.originalUrl.substring(queryIndex + 1) : "";
      
      const url = `https://statsapi.mlb.com/api/v1/${mlbPath}${queryParams ? `?${queryParams}` : ""}`;
      
      console.log(`Proxying MLB Request: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": "MLB-Salami-Tracker/1.0",
          "Accept": "application/json"
        }
      });
      
      if (!response.ok) {
        if (response.status === 404 && url.includes('contextMetrics')) {
          // Silently handle 404 for contextMetrics as it's common for games without published odds
          return res.status(404).json({ error: "No metrics or odds available for this game" });
        }
        console.error(`MLB API Error: ${response.status} ${response.statusText} at ${url}`);
        return res.status(response.status).json({ error: `MLB API Error: ${response.statusText}` });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("MLB Proxy Error:", error);
      res.status(500).json({ error: "Failed to fetch from MLB API" });
    }
  });

  app.get("/api/v1/debug/mlb", async (req, res) => {
    try {
      const url = "https://statsapi.mlb.com/api/v1/schedule?sportId=1";
      const start = Date.now();
      const response = await fetch(url);
      const duration = Date.now() - start;
      
      res.json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        durationMs: duration,
        url: url,
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
    const status = getFetchStatus();
    const apiKey = process.env.BALLPARKPAL_API_KEY;
    
    res.json({
      hasApiKey: !!apiKey,
      apiKeyLast4: apiKey ? `***${apiKey.slice(-4)}` : null,
      lastFetch: status,
      isLive: !!getCachedFactors(),
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
