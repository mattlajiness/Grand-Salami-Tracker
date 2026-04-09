import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Route to proxy Odds API requests
  app.get("/api/odds", async (req, res) => {
    const apiKey = process.env.VITE_ODDS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "VITE_ODDS_API_KEY is not configured on the server." });
    }

    const url = `https://api.the-odds-api.com/v4/sports/baseball_mlb/odds/?apiKey=${apiKey}&regions=us&markets=totals&oddsFormat=decimal`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).json({ error: `Odds API responded with ${response.status}` });
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Proxy Error:", error);
      res.status(500).json({ error: "Failed to fetch odds from upstream provider." });
    }
  });

  // API Route to check if config is present
  app.get("/api/config", (req, res) => {
    res.json({
      hasOddsKey: !!process.env.VITE_ODDS_API_KEY
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
