import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// NHL API Proxy
app.get("/api/nhl/scores/:date", async (req, res) => {
  const date = req.params.date || new Date().toISOString().split('T')[0];
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

// In-memory cache for NHL Game Details to prevent throttling and redundant remote calls
interface NHLDetailsCacheEntry {
  data: any;
  timestamp: number;
}
const nhlDetailsCache = new Map<string, NHLDetailsCacheEntry>();

// Helper to determine the starter/active goalie from boxscore goalies
function findActiveGoalie(goalies: any[]): any {
  if (!goalies || goalies.length === 0) return null;
  // Look for goalie with actual ice time or shots faced or decision
  const active = goalies.find((g: any) => {
    const toi = g.toi || '';
    const hasToi = toi && toi !== '00:00' && toi !== '0:00';
    const hasShots = typeof g.shotsAgainst === 'number' && g.shotsAgainst > 0;
    const hasDecision = !!g.decision;
    return hasToi || hasShots || hasDecision;
  });
  return active || goalies[0];
}

// NHL Game Details Proxy
app.get("/api/nhl/game/:gameId", async (req, res) => {
  const { gameId } = req.params;
  const now = Date.now();

  // Check cache first
  const cached = nhlDetailsCache.get(gameId);
  if (cached) {
    const isLive = cached.data?.gameState === 'LIVE' || cached.data?.gameState === 'CRIT';
    const isFinal = cached.data?.gameState === 'FINAL' || cached.data?.gameState === 'OFF' || cached.data?.gameState === 'OVER';
    const ttl = isLive ? 30000 : (isFinal ? 300000 : 120000); // 30s live, 5m final, 2m pre
    if (now - cached.timestamp < ttl) {
      return res.json(cached.data);
    }
  }

  const landingUrl = `https://api-web.nhle.com/v1/gamecenter/${gameId}/landing`;
  const boxscoreUrl = `https://api-web.nhle.com/v1/gamecenter/${gameId}/boxscore`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json'
    };

    const [landingRes, boxscoreRes] = await Promise.allSettled([
      fetch(landingUrl, { signal: controller.signal, headers }),
      fetch(boxscoreUrl, { signal: controller.signal, headers })
    ]);
    clearTimeout(timeout);

    let landingData: any = null;
    if (landingRes.status === 'fulfilled' && landingRes.value.ok) {
      landingData = await landingRes.value.json();
    }

    let boxscoreData: any = null;
    if (boxscoreRes.status === 'fulfilled' && boxscoreRes.value.ok) {
      try {
        boxscoreData = await boxscoreRes.value.json();
      } catch (e) {
        console.warn(`[NHL Details Proxy] Boxscore parse failed for ${gameId}`);
      }
    }

    if (!landingData && !boxscoreData) {
      if (cached) {
        console.warn(`[NHL Details Proxy] Upstream failed for ${gameId}, returning cached data`);
        return res.json(cached.data);
      }
      return res.status(502).json({ error: "Failed to fetch NHL game details" });
    }

    const data = landingData || boxscoreData;
    if (boxscoreData) {
      data.boxscore = boxscoreData;
      if (boxscoreData.playerByGameStats) {
        data.playerByGameStats = boxscoreData.playerByGameStats;
      }
    }

    // Ensure team objects exist
    if (!data.awayTeam) data.awayTeam = {};
    if (!data.homeTeam) data.homeTeam = {};

    // 1. Check boxscore playerByGameStats (primary source for in-game & finished games)
    const awayBoxGoalies = boxscoreData?.playerByGameStats?.awayTeam?.goalies || [];
    const homeBoxGoalies = boxscoreData?.playerByGameStats?.homeTeam?.goalies || [];

    if (awayBoxGoalies.length > 0) {
      const activeAway = findActiveGoalie(awayBoxGoalies);
      if (activeAway) {
        data.awayTeam.goaltender = activeAway;
      }
      data.awayTeam.goalies = awayBoxGoalies;
    }
    if (homeBoxGoalies.length > 0) {
      const activeHome = findActiveGoalie(homeBoxGoalies);
      if (activeHome) {
        data.homeTeam.goaltender = activeHome;
      }
      data.homeTeam.goalies = homeBoxGoalies;
    }

    // 2. Check matchup leaders (source for upcoming pre-season & regular season games)
    const matchupAwayLeaders = data.matchup?.goalieComparison?.awayTeam?.leaders || [];
    const matchupHomeLeaders = data.matchup?.goalieComparison?.homeTeam?.leaders || [];

    if (!data.awayTeam.probableStartingGoalie && matchupAwayLeaders.length > 0) {
      data.awayTeam.probableStartingGoalie = matchupAwayLeaders[0];
    }
    if (!data.homeTeam.probableStartingGoalie && matchupHomeLeaders.length > 0) {
      data.homeTeam.probableStartingGoalie = matchupHomeLeaders[0];
    }

    // Update in-memory cache
    nhlDetailsCache.set(gameId, { data, timestamp: now });

    res.json(data);
  } catch (error: any) {
    console.error("NHL Game Details Proxy Error:", error);
    if (cached) {
      console.warn(`[NHL Details Proxy] Error fetching ${gameId}, serving cached copy`);
      return res.json(cached.data);
    }
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
