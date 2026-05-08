import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
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
      // Get the path correctly, removing leading /api/v1/mlb/
      const fullPath = req.path;
      const mlbPath = fullPath.replace(/^\/api\/v1\/mlb\//, "");
      
      // Get the query string exactly as it came in to preserve formatting/encoding
      const queryIndex = req.originalUrl.indexOf("?");
      const queryParams = queryIndex !== -1 ? req.originalUrl.substring(queryIndex + 1) : "";
      
      const url = `https://statsapi.mlb.com/api/v1/${mlbPath}${queryParams ? `?${queryParams}` : ""}`;
      
      console.log(`[MLB Proxy] Fetching: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json"
        }
      });
      
      if (!response.ok) {
        if (response.status === 404 && url.includes('contextMetrics')) {
          return res.status(404).json({ error: "No metrics or odds available" });
        }
        const errorText = await response.text().catch(() => "Unknown error");
        console.error(`[MLB Proxy] API Error: ${response.status} ${response.statusText} for ${url}. Body: ${errorText.slice(0, 200)}`);
        return res.status(response.status).json({ error: `MLB API Error: ${response.statusText}`, details: errorText.slice(0, 200) });
      }
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return res.json(data);
      } else {
        const text = await response.text();
        console.warn(`[MLB Proxy] Expected JSON but got ${contentType} from ${url}`);
        return res.send(text);
      }
    } catch (error) {
      console.error("[MLB Proxy] Fatal Error:", error);
      res.status(500).json({ 
        error: "Internal Proxy Error", 
        message: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.get("/api/v1/debug/mlb", async (req, res) => {
    try {
      const url = "https://statsapi.mlb.com/api/v1/schedule?sportId=1";
      const start = Date.now();
      const response = await fetch(url);
      const duration = Date.now() - start;
      const data = await response.json().catch(() => ({ error: "Not JSON" }));
      
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
