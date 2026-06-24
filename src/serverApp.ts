import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
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

// MLB API Proxies to bypass browser CORS limitations and secure data retrieval
app.get("/api/mlb/schedule", async (req, res) => {
  const queryStr = req.originalUrl.split('?')[1] || '';
  const urlObj = new URL(`https://statsapi.mlb.com/api/v1/schedule?${queryStr}`);

  console.log(`[MLB Schedule Proxy] Fetching: ${urlObj.toString()}`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(urlObj.toString(), { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch MLB schedule" });
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("MLB Schedule Proxy Error:", error);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

app.get("/api/mlb/people", async (req, res) => {
  const queryStr = req.originalUrl.split('?')[1] || '';
  const urlObj = new URL(`https://statsapi.mlb.com/api/v1/people?${queryStr}`);

  console.log(`[MLB People Proxy] Fetching: ${urlObj.toString()}`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(urlObj.toString(), { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch MLB people stats" });
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("MLB People Proxy Error:", error);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

app.get("/api/mlb/game/:gamePk/boxscore", async (req, res) => {
  const { gamePk } = req.params;
  const url = `https://statsapi.mlb.com/api/v1/game/${gamePk}/boxscore`;

  console.log(`[MLB Boxscore Proxy] Fetching: ${url}`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch MLB boxscore" });
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("MLB Boxscore Proxy Error:", error);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

app.get("/api/mlb/game/:gamePk/contextMetrics", async (req, res) => {
  const { gamePk } = req.params;
  const queryStr = req.originalUrl.split('?')[1] || '';
  const urlObj = new URL(`https://statsapi.mlb.com/api/v1/game/${gamePk}/contextMetrics?${queryStr}`);

  console.log(`[MLB ContextMetrics Proxy] Fetching: ${urlObj.toString()}`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(urlObj.toString(), { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch MLB context metrics" });
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("MLB ContextMetrics Proxy Error:", error);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;
