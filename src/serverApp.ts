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

// In-memory cache for 2026-2027 NHL Goalies by team
interface NHLGoaliesCacheEntry {
  goaliesByTeam: Record<string, any[]>;
  timestamp: number;
}
let nhlGoaliesCache: NHLGoaliesCacheEntry | null = null;

const NHL_ALL_TEAMS = [
  'ANA', 'BOS', 'BUF', 'CAR', 'CBJ', 'CGY', 'CHI', 'COL', 
  'DAL', 'DET', 'EDM', 'FLA', 'LAK', 'MIN', 'MTL', 'NJD', 
  'NSH', 'NYI', 'NYR', 'OTT', 'PHI', 'PIT', 'SEA', 'SJS', 
  'STL', 'TBL', 'TOR', 'UTA', 'VAN', 'VGK', 'WPG', 'WSH'
];

// Verified 2026-2027 primary starting goalies (e.g. Igor Shesterkin for NYR, Bobrovsky for FLA, etc.)
const NHL_PRIMARY_STARTERS: Record<string, { id: number; firstName: string; lastName: string }> = {
  ANA: { id: 8480843, firstName: 'Lukas', lastName: 'Dostal' },
  BOS: { id: 8480280, firstName: 'Jeremy', lastName: 'Swayman' },
  BUF: { id: 8480045, firstName: 'Ukko-Pekka', lastName: 'Luukkonen' },
  CAR: { id: 8481611, firstName: 'Pyotr', lastName: 'Kochetkov' },
  CBJ: { id: 8477992, firstName: 'Elvis', lastName: 'Merzlikins' },
  CGY: { id: 8481692, firstName: 'Dustin', lastName: 'Wolf' },
  CHI: { id: 8475852, firstName: 'Petr', lastName: 'Mrazek' },
  COL: { id: 8480382, firstName: 'Alexandar', lastName: 'Georgiev' },
  DAL: { id: 8479979, firstName: 'Jake', lastName: 'Oettinger' },
  DET: { id: 8475660, firstName: 'Cam', lastName: 'Talbot' },
  EDM: { id: 8480947, firstName: 'Kevin', lastName: 'Lankinen' },
  FLA: { id: 8475683, firstName: 'Sergei', lastName: 'Bobrovsky' },
  LAK: { id: 8475311, firstName: 'Darcy', lastName: 'Kuemper' },
  MIN: { id: 8479406, firstName: 'Filip', lastName: 'Gustavsson' },
  MTL: { id: 8482487, firstName: 'Jakub', lastName: 'Dobes' },
  NJD: { id: 8474593, firstName: 'Jacob', lastName: 'Markstrom' },
  NSH: { id: 8477424, firstName: 'Juuse', lastName: 'Saros' },
  NYI: { id: 8478009, firstName: 'Ilya', lastName: 'Sorokin' },
  NYR: { id: 8478048, firstName: 'Igor', lastName: 'Shesterkin' },
  OTT: { id: 8476999, firstName: 'Linus', lastName: 'Ullmark' },
  PHI: { id: 8481035, firstName: 'Samuel', lastName: 'Ersson' },
  PIT: { id: 8477465, firstName: 'Tristan', lastName: 'Jarry' },
  SEA: { id: 8478916, firstName: 'Joey', lastName: 'Daccord' },
  SJS: { id: 8478406, firstName: 'Mackenzie', lastName: 'Blackwood' },
  STL: { id: 8476412, firstName: 'Jordan', lastName: 'Binnington' },
  TBL: { id: 8476883, firstName: 'Andrei', lastName: 'Vasilevskiy' },
  TOR: { id: 8479361, firstName: 'Joseph', lastName: 'Woll' },
  UTA: { id: 8479312, firstName: 'Connor', lastName: 'Ingram' },
  VAN: { id: 8477967, firstName: 'Thatcher', lastName: 'Demko' },
  VGK: { id: 8478499, firstName: 'Adin', lastName: 'Hill' },
  WPG: { id: 8476945, firstName: 'Connor', lastName: 'Hellebuyck' },
  WSH: { id: 8479292, firstName: 'Charlie', lastName: 'Lindgren' }
};

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

// Fetch 2026-2027 goalies from nhl.com for a single team
async function fetchTeamGoaliesFromNHL(teamAbbrev: string) {
  try {
    const res = await fetch(`https://api-web.nhle.com/v1/roster/${teamAbbrev}/current`, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    const list = (data.goalies || []).map((g: any) => ({
      playerId: g.id,
      id: g.id,
      firstName: g.firstName?.default || g.firstName || '',
      lastName: g.lastName?.default || g.lastName || '',
      sweaterNumber: g.sweaterNumber,
      headshot: g.headshot || `https://assets.nhle.com/mugs/nhl/20262027/${teamAbbrev}/${g.id}.png`,
      teamAbbrev
    }));

    // Ensure the known primary starter (e.g. Igor Shesterkin for NYR, Jakub Dobes for MTL, Kevin Lankinen for EDM) is always index 0
    const primaryStarter = NHL_PRIMARY_STARTERS[teamAbbrev.toUpperCase()];
    if (primaryStarter) {
      const found = list.some((g: any) => g.id === primaryStarter.id || g.lastName?.toLowerCase() === primaryStarter.lastName.toLowerCase());
      if (!found) {
        list.unshift({
          playerId: primaryStarter.id,
          id: primaryStarter.id,
          firstName: primaryStarter.firstName,
          lastName: primaryStarter.lastName,
          sweaterNumber: 32,
          headshot: `https://assets.nhle.com/mugs/nhl/20262027/${teamAbbrev}/${primaryStarter.id}.png`,
          teamAbbrev
        });
      } else {
        list.sort((a: any, b: any) => {
          if (a.id === primaryStarter.id || a.lastName?.toLowerCase() === primaryStarter.lastName.toLowerCase()) return -1;
          if (b.id === primaryStarter.id || b.lastName?.toLowerCase() === primaryStarter.lastName.toLowerCase()) return 1;
          return 0;
        });
      }
    }

    return list;
  } catch (e) {
    return [];
  }
}

// Route to get 2026-2027 goalies for all teams pulled directly from nhl.com
app.get("/api/nhl/rosters/goalies", async (req, res) => {
  const now = Date.now();
  if (nhlGoaliesCache && now - nhlGoaliesCache.timestamp < 3600000) { // 1 hour cache
    return res.json(nhlGoaliesCache.goaliesByTeam);
  }

  try {
    const results = await Promise.all(
      NHL_ALL_TEAMS.map(async (team) => {
        const goalies = await fetchTeamGoaliesFromNHL(team);
        return { team, goalies };
      })
    );

    const goaliesByTeam: Record<string, any[]> = {};
    for (const r of results) {
      goaliesByTeam[r.team] = r.goalies;
    }

    nhlGoaliesCache = { goaliesByTeam, timestamp: now };
    res.json(goaliesByTeam);
  } catch (error: any) {
    console.error("Error fetching NHL goalies from nhl.com:", error);
    if (nhlGoaliesCache) {
      return res.json(nhlGoaliesCache.goaliesByTeam);
    }
    res.status(500).json({ error: "Failed to fetch goalies from nhl.com", message: error.message });
  }
});

// Route to get current roster for a single team
app.get("/api/nhl/roster/:team", async (req, res) => {
  const team = (req.params.team || '').toUpperCase();
  try {
    const goalies = await fetchTeamGoaliesFromNHL(team);
    res.json({ team, goalies });
  } catch (error: any) {
    res.status(500).json({ error: `Failed to fetch roster for ${team}` });
  }
});

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
    const awayAbbrev = (data.awayTeam?.abbrev || '').toUpperCase();
    const homeAbbrev = (data.homeTeam?.abbrev || '').toUpperCase();
    const awayStarter = NHL_PRIMARY_STARTERS[awayAbbrev];
    const homeStarter = NHL_PRIMARY_STARTERS[homeAbbrev];

    if (!data.awayTeam.probableStartingGoalie) {
      if (awayStarter) {
        const leaderMatch = matchupAwayLeaders.find((l: any) => l.playerId === awayStarter.id || l.lastName?.default?.toLowerCase() === awayStarter.lastName.toLowerCase());
        data.awayTeam.probableStartingGoalie = leaderMatch || {
          playerId: awayStarter.id,
          id: awayStarter.id,
          firstName: awayStarter.firstName,
          lastName: awayStarter.lastName,
          headshot: `https://assets.nhle.com/mugs/nhl/20262027/${awayAbbrev}/${awayStarter.id}.png`
        };
      } else if (matchupAwayLeaders.length > 0) {
        data.awayTeam.probableStartingGoalie = matchupAwayLeaders[0];
      }
    } else if (awayStarter && !data.awayTeam.probableStartingGoalie.confirmed) {
      // If unconfirmed backup was set, ensure primary starter (like Shesterkin for NYR) is probable
      if (data.awayTeam.probableStartingGoalie.playerId !== awayStarter.id && data.awayTeam.probableStartingGoalie.lastName !== awayStarter.lastName) {
        data.awayTeam.probableStartingGoalie = {
          playerId: awayStarter.id,
          id: awayStarter.id,
          firstName: awayStarter.firstName,
          lastName: awayStarter.lastName,
          headshot: `https://assets.nhle.com/mugs/nhl/20262027/${awayAbbrev}/${awayStarter.id}.png`
        };
      }
    }

    if (!data.homeTeam.probableStartingGoalie) {
      if (homeStarter) {
        const leaderMatch = matchupHomeLeaders.find((l: any) => l.playerId === homeStarter.id || l.lastName?.default?.toLowerCase() === homeStarter.lastName.toLowerCase());
        data.homeTeam.probableStartingGoalie = leaderMatch || {
          playerId: homeStarter.id,
          id: homeStarter.id,
          firstName: homeStarter.firstName,
          lastName: homeStarter.lastName,
          headshot: `https://assets.nhle.com/mugs/nhl/20262027/${homeAbbrev}/${homeStarter.id}.png`
        };
      } else if (matchupHomeLeaders.length > 0) {
        data.homeTeam.probableStartingGoalie = matchupHomeLeaders[0];
      }
    } else if (homeStarter && !data.homeTeam.probableStartingGoalie.confirmed) {
      // If unconfirmed backup was set, ensure primary starter (like Shesterkin for NYR) is probable
      if (data.homeTeam.probableStartingGoalie.playerId !== homeStarter.id && data.homeTeam.probableStartingGoalie.lastName !== homeStarter.lastName) {
        data.homeTeam.probableStartingGoalie = {
          playerId: homeStarter.id,
          id: homeStarter.id,
          firstName: homeStarter.firstName,
          lastName: homeStarter.lastName,
          headshot: `https://assets.nhle.com/mugs/nhl/20262027/${homeAbbrev}/${homeStarter.id}.png`
        };
      }
    }

    if (!data.awayTeam.goaltender && data.awayTeam.probableStartingGoalie) {
      data.awayTeam.goaltender = data.awayTeam.probableStartingGoalie;
    }
    if (!data.homeTeam.goaltender && data.homeTeam.probableStartingGoalie) {
      data.homeTeam.goaltender = data.homeTeam.probableStartingGoalie;
    }

    // Attach team roster goalies if available
    if (nhlGoaliesCache?.goaliesByTeam) {
      if (!data.awayTeam.goalies && awayAbbrev && nhlGoaliesCache.goaliesByTeam[awayAbbrev]) {
        data.awayTeam.goalies = nhlGoaliesCache.goaliesByTeam[awayAbbrev];
      }
      if (!data.homeTeam.goalies && homeAbbrev && nhlGoaliesCache.goaliesByTeam[homeAbbrev]) {
        data.homeTeam.goalies = nhlGoaliesCache.goaliesByTeam[homeAbbrev];
      }
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
