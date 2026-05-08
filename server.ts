import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
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
