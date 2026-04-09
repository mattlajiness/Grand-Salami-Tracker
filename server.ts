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
    let apiKey = process.env.VITE_ODDS_API_KEY;
    
    // Fallback for debugging if the environment variable isn't propagating correctly
    if (!apiKey) {
      console.warn("VITE_ODDS_API_KEY missing from process.env, checking for fallback...");
      // If you have a key you want to hardcode for testing, you could put it here temporarily
      // apiKey = "YOUR_KEY_HERE"; 
    }

    if (!apiKey) {
      return res.status(500).json({ error: "VITE_ODDS_API_KEY is not configured on the server." });
    }

    const oddsUrl = `https://api.the-odds-api.com/v4/sports/baseball_mlb/odds/?apiKey=${apiKey}&regions=us&markets=totals&oddsFormat=decimal`;
    const scoresUrl = `https://api.the-odds-api.com/v4/sports/baseball_mlb/scores/?apiKey=${apiKey}&daysFrom=1`;

    try {
      // Try odds endpoint first
      const oddsResponse = await fetch(oddsUrl);
      let data = [];
      
      if (oddsResponse.ok) {
        data = await oddsResponse.json();
      }

      // If we got nothing or few lines, try scores endpoint which often has lines for active games
      if (!data || data.length < 5) {
        const scoresResponse = await fetch(scoresUrl);
        if (scoresResponse.ok) {
          const scoresData = await scoresResponse.json();
          // Merge or prefer scores data if it has more info
          if (scoresData && scoresData.length > data.length) {
            data = scoresData;
          }
        }
      }

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
