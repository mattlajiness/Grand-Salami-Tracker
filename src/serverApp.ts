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

    // Augment with live confirmed goalies for this target slate date
    try {
      const confirmedMap = await getLiveConfirmedGoalies(date);
      if (data.games && Array.isArray(data.games)) {
        data.games.forEach((g: any) => {
          const awayAbbr = g.awayTeam?.abbrev?.toUpperCase();
          const homeAbbr = g.homeTeam?.abbrev?.toUpperCase();
          if (awayAbbr && confirmedMap[awayAbbr]) {
            g.awayGoalie = {
              ...confirmedMap[awayAbbr],
              starter: confirmedMap[awayAbbr].confirmed
            };
          }
          if (homeAbbr && confirmedMap[homeAbbr]) {
            g.homeGoalie = {
              ...confirmedMap[homeAbbr],
              starter: confirmedMap[homeAbbr].confirmed
            };
          }
        });
      }
    } catch (confErr) {
      console.warn("[NHL Proxy] Error augmenting confirmed goalies:", confErr);
    }

    // Background warm team offense trends for slate teams so cards open instantly
    if (data.games && Array.isArray(data.games)) {
      const slateTeams = Array.from(new Set(data.games.flatMap((g: any) => [
        g.awayTeam?.abbrev?.toUpperCase(),
        g.homeTeam?.abbrev?.toUpperCase()
      ]).filter(Boolean))) as string[];
      warmTeamsRecentOffense(slateTeams).catch(() => {});
    }

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
  CHI: { id: 8481519, firstName: 'Spencer', lastName: 'Knight' },
  COL: { id: 8475809, firstName: 'Scott', lastName: 'Wedgewood' },
  DAL: { id: 8479979, firstName: 'Jake', lastName: 'Oettinger' },
  DET: { id: 8476434, firstName: 'John', lastName: 'Gibson' },
  EDM: { id: 8480947, firstName: 'Kevin', lastName: 'Lankinen' },
  FLA: { id: 8474593, firstName: 'Jacob', lastName: 'Markstrom' },
  LAK: { id: 8475311, firstName: 'Darcy', lastName: 'Kuemper' },
  MIN: { id: 8475717, firstName: 'Calvin', lastName: 'Pickard' },
  MTL: { id: 8482487, firstName: 'Jakub', lastName: 'Dobes' },
  NJD: { id: 8474596, firstName: 'Jake', lastName: 'Allen' },
  NSH: { id: 8477424, firstName: 'Juuse', lastName: 'Saros' },
  NYI: { id: 8478009, firstName: 'Ilya', lastName: 'Sorokin' },
  NYR: { id: 8478048, firstName: 'Igor', lastName: 'Shesterkin' },
  OTT: { id: 8476999, firstName: 'Linus', lastName: 'Ullmark' },
  PHI: { id: 8478435, firstName: 'Dan', lastName: 'Vladar' },
  PIT: { id: 8481668, firstName: 'Arturs', lastName: 'Silovs' },
  SEA: { id: 8478916, firstName: 'Joey', lastName: 'Daccord' },
  SJS: { id: 8478406, firstName: 'Mackenzie', lastName: 'Blackwood' },
  STL: { id: 8476412, firstName: 'Jordan', lastName: 'Binnington' },
  TBL: { id: 8476883, firstName: 'Andrei', lastName: 'Vasilevskiy' },
  TOR: { id: 8475683, firstName: 'Sergei', lastName: 'Bobrovsky' },
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

// Team Recent Offense Trends (Last 3 Games)
export interface TeamRecentOffense {
  team: string;
  totalGoalsFor: number;
  totalGoalsAgainst: number;
  avgGoalsFor: number;
  avgGoalsAgainst: number;
  avgTotalGoals: number;
  sampleSize: number;
  trend: 'HOT' | 'COLD' | 'STEADY';
  last3: Array<{
    gameId: number;
    date: string;
    opponent: string;
    isHome: boolean;
    goalsFor: number;
    goalsAgainst: number;
    result: string;
    totalGoals: number;
  }>;
}

const teamRecentOffenseCache = new Map<string, { data: TeamRecentOffense; timestamp: number }>();

async function fetchTeamRecentOffense(teamAbbrev: string): Promise<TeamRecentOffense> {
  const team = (teamAbbrev || '').toUpperCase();
  if (!team) {
    return {
      team: '',
      totalGoalsFor: 0,
      totalGoalsAgainst: 0,
      avgGoalsFor: 0,
      avgGoalsAgainst: 0,
      avgTotalGoals: 0,
      sampleSize: 0,
      trend: 'STEADY',
      last3: []
    };
  }

  const now = Date.now();
  const cached = teamRecentOffenseCache.get(team);
  if (cached && now - cached.timestamp < 900000 && cached.data.sampleSize > 0) { // 15 minutes cache
    return cached.data;
  }

  // 1. Primary: Official NHL API schedule
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`https://api-web.nhle.com/v1/club-schedule-season/${team}/20262027`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const pastGames = (data.games || [])
        .filter((g: any) => g.gameState === "OFF" || g.gameState === "FINAL")
        .sort((a: any, b: any) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime());

      if (pastGames.length > 0) {
        const recent = pastGames.slice(-3);
        const last3 = recent.map((g: any) => {
          const isHome = g.homeTeam?.abbrev === team;
          const gf = isHome ? (g.homeTeam?.score ?? 0) : (g.awayTeam?.score ?? 0);
          const ga = isHome ? (g.awayTeam?.score ?? 0) : (g.homeTeam?.score ?? 0);
          const opp = isHome ? g.awayTeam?.abbrev : g.homeTeam?.abbrev;
          const isOT = g.periodDescriptor?.periodType === "OT" || g.periodDescriptor?.periodType === "SO";
          const result = gf > ga ? (isOT ? "OTW" : "W") : (isOT ? "OTL" : "L");
          return {
            gameId: g.id,
            date: g.gameDate,
            opponent: opp || '',
            isHome,
            goalsFor: gf,
            goalsAgainst: ga,
            result,
            totalGoals: gf + ga
          };
        });

        const totalGoalsFor = last3.reduce((sum: number, g: any) => sum + g.goalsFor, 0);
        const totalGoalsAgainst = last3.reduce((sum: number, g: any) => sum + g.goalsAgainst, 0);
        const sampleSize = last3.length;
        const avgGoalsFor = sampleSize > 0 ? parseFloat((totalGoalsFor / sampleSize).toFixed(1)) : 0;
        const avgGoalsAgainst = sampleSize > 0 ? parseFloat((totalGoalsAgainst / sampleSize).toFixed(1)) : 0;
        const avgTotalGoals = sampleSize > 0 ? parseFloat(((totalGoalsFor + totalGoalsAgainst) / sampleSize).toFixed(1)) : 0;
        const trend: 'HOT' | 'COLD' | 'STEADY' = avgGoalsFor >= 3.7 ? 'HOT' : (avgGoalsFor <= 2.3 ? 'COLD' : 'STEADY');

        const resultObj: TeamRecentOffense = {
          team,
          totalGoalsFor,
          totalGoalsAgainst,
          avgGoalsFor,
          avgGoalsAgainst,
          avgTotalGoals,
          sampleSize,
          trend,
          last3
        };

        teamRecentOffenseCache.set(team, { data: resultObj, timestamp: now });
        return resultObj;
      }
    }
  } catch (err: any) {
    console.warn(`[NHL Schedule] Primary fetch failed for ${team}: ${err?.message || err}`);
  }

  // 2. Secondary Fallback: ESPN Team Schedule API
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const espnRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${team.toLowerCase()}/schedule`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeout);

    if (espnRes.ok) {
      const espnData = await espnRes.json();
      const pastEvents = (espnData.events || []).filter((e: any) => e.competitions?.[0]?.status?.type?.completed);

      if (pastEvents.length > 0) {
        const last3Events = pastEvents.slice(-3);
        const last3 = last3Events.map((e: any) => {
          const comp = e.competitions[0];
          const teamCompetitor = comp.competitors.find((c: any) => (c.team?.abbreviation || "").toUpperCase() === team);
          const oppCompetitor = comp.competitors.find((c: any) => (c.team?.abbreviation || "").toUpperCase() !== team);
          const isHome = teamCompetitor?.homeAway === "home";
          const gf = parseInt(teamCompetitor?.score?.value ?? "0", 10) || 0;
          const ga = parseInt(oppCompetitor?.score?.value ?? "0", 10) || 0;
          const opp = (oppCompetitor?.team?.abbreviation || "").toUpperCase();
          const isWinner = Boolean(teamCompetitor?.winner);
          const dateStr = (e.date || "").split("T")[0];
          const isOT = comp.status?.type?.detail?.includes("OT") || comp.status?.type?.detail?.includes("SO");
          const result = isWinner ? (isOT ? "OTW" : "W") : (isOT ? "OTL" : "L");
          return {
            gameId: parseInt(e.id, 10) || 0,
            date: dateStr,
            opponent: opp,
            isHome,
            goalsFor: gf,
            goalsAgainst: ga,
            result,
            totalGoals: gf + ga
          };
        });

        const totalGoalsFor = last3.reduce((s: number, g: any) => s + g.goalsFor, 0);
        const totalGoalsAgainst = last3.reduce((s: number, g: any) => s + g.goalsAgainst, 0);
        const sampleSize = last3.length;
        const avgGoalsFor = sampleSize > 0 ? parseFloat((totalGoalsFor / sampleSize).toFixed(1)) : 0;
        const avgGoalsAgainst = sampleSize > 0 ? parseFloat((totalGoalsAgainst / sampleSize).toFixed(1)) : 0;
        const avgTotalGoals = sampleSize > 0 ? parseFloat(((totalGoalsFor + totalGoalsAgainst) / sampleSize).toFixed(1)) : 0;
        const trend: 'HOT' | 'COLD' | 'STEADY' = avgGoalsFor >= 3.7 ? 'HOT' : (avgGoalsFor <= 2.3 ? 'COLD' : 'STEADY');

        const resultObj: TeamRecentOffense = {
          team,
          totalGoalsFor,
          totalGoalsAgainst,
          avgGoalsFor,
          avgGoalsAgainst,
          avgTotalGoals,
          sampleSize,
          trend,
          last3
        };

        teamRecentOffenseCache.set(team, { data: resultObj, timestamp: now });
        return resultObj;
      }
    }
  } catch (err: any) {
    console.warn(`[ESPN Schedule Fallback] Failed for ${team}: ${err?.message || err}`);
  }

  // If both failed, return existing cached data if any
  if (cached && cached.data.sampleSize > 0) {
    return cached.data;
  }

  return {
    team,
    totalGoalsFor: 0,
    totalGoalsAgainst: 0,
    avgGoalsFor: 0,
    avgGoalsAgainst: 0,
    avgTotalGoals: 0,
    sampleSize: 0,
    trend: 'STEADY',
    last3: []
  };
}

// Background cache warming function
async function warmTeamsRecentOffense(teams: string[]): Promise<void> {
  const missing = teams.filter(t => {
    const c = teamRecentOffenseCache.get(t);
    return !c || c.data.sampleSize === 0 || Date.now() - c.timestamp > 900000;
  });
  if (missing.length === 0) return;
  console.log(`[Team Offense Trends] Warming cache for ${missing.length} teams: ${missing.join(', ')}`);
  await Promise.allSettled(missing.map(t => fetchTeamRecentOffense(t)));
}

// Routes for team recent offense trends
app.get("/api/nhl/team-recent-offense/:team", async (req, res) => {
  const team = (req.params.team || '').toUpperCase();
  const data = await fetchTeamRecentOffense(team);
  res.json(data);
});

app.get("/api/nhl/teams-recent-offense", async (req, res) => {
  const teamsParam = req.query.teams as string;
  const teams = teamsParam 
    ? teamsParam.split(',').map(t => t.trim().toUpperCase()).filter(Boolean)
    : NHL_ALL_TEAMS;

  const results = await Promise.all(teams.map(t => fetchTeamRecentOffense(t)));
  const map: Record<string, TeamRecentOffense> = {};
  for (const r of results) {
    map[r.team] = r;
  }
  res.json(map);
});

const TEAM_NAME_TO_ABBREV: Record<string, string> = {
  'anaheim ducks': 'ANA',
  'boston bruins': 'BOS',
  'buffalo sabres': 'BUF',
  'carolina hurricanes': 'CAR',
  'columbus blue jackets': 'CBJ',
  'calgary flames': 'CGY',
  'chicago blackhawks': 'CHI',
  'colorado avalanche': 'COL',
  'dallas stars': 'DAL',
  'detroit red wings': 'DET',
  'edmonton oilers': 'EDM',
  'florida panthers': 'FLA',
  'los angeles kings': 'LAK',
  'minnesota wild': 'MIN',
  'montreal canadiens': 'MTL',
  'new jersey devils': 'NJD',
  'nashville predators': 'NSH',
  'new york islanders': 'NYI',
  'new york rangers': 'NYR',
  'ottawa senators': 'OTT',
  'philadelphia flyers': 'PHI',
  'pittsburgh penguins': 'PIT',
  'seattle kraken': 'SEA',
  'san jose sharks': 'SJS',
  'st. louis blues': 'STL',
  'st louis blues': 'STL',
  'tampa bay lightning': 'TBL',
  'toronto maple leafs': 'TOR',
  'utah mammoth': 'UTA',
  'utah hockey club': 'UTA',
  'utah': 'UTA',
  'vancouver canucks': 'VAN',
  'vegas golden knights': 'VGK',
  'winnipeg jets': 'WPG',
  'washington capitals': 'WSH'
};

const GOALIE_NAME_TO_NHL_ID: Record<string, number> = {
  'gibson': 8476434,
  'tarasov': 8480193,
  'daccord': 8478916,
  'grubauer': 8475831,
  'thompson': 8480313,
  'lindgren': 8479292,
  'shesterkin': 8478048,
  'korpisalo': 8476914,
  'silovs': 8481668,
  'murashov': 8483703,
  'greaves': 8482982,
  'talbot': 8475660,
  'skinner': 8479973,
  'hellebuyck': 8476945,
  'dostal': 8480843,
  'brossoit': 8476316,
  'husso': 8478024,
  'swayman': 8480280,
  'dipietro': 8480022,
  'bobrovsky': 8475683,
  'stolarz': 8476932,
  'woll': 8479361,
  'vladar': 8478435,
  'markstrom': 8474593,
  'schmid': 8481033,
  'allen': 8474596,
  'daws': 8482076,
  'dobes': 8482487,
  'montembeault': 8478470,
  'fowler': 8484196,
  'lankinen': 8480947,
  'demko': 8477967,
  'andersen': 8475883,
  'jarry': 8477465,
  'levi': 8482221,
  'vasilevskiy': 8476883,
  'hildeby': 8483710,
  'saros': 8477424,
  'annunen': 8481020,
  'luukkonen': 8480045,
  'lyon': 8479312,
  'ellis': 8481551,
  'wolf': 8481692,
  'cooley': 8482445,
  'wedgewood': 8475809,
  'blackwood': 8478406,
  'knight': 8481519,
  'soderblom': 8482821,
  'askarov': 8482137,
  'nedeljkovic': 8477968,
  'binnington': 8476412,
  'hofer': 8480981,
  'gustavsson': 8479406,
  'wallstedt': 8482661,
  'pickard': 8475717,
  'kochetkov': 8481611,
  'primeau': 8480051,
  'bussi': 8483548,
  'sorokin': 8478009,
  'varlamov': 8473575,
  'ullmark': 8476999,
  'ersson': 8481035,
  'oettinger': 8479979,
  'desmith': 8479193,
  'vejmelka': 8478872,
  'cossa': 8482657,
  'kuemper': 8475311,
  'forsberg': 8476341
};

// ESPN & Daily Faceoff Confirmed Goalies Sync
interface ConfirmedGoalieInfo {
  name: string;
  firstName?: string;
  lastName?: string;
  sweaterNumber?: number;
  headshot?: string;
  status: string;
  confirmed: boolean;
  espnId?: string;
  playerId?: number;
}

const espnGoaliesCache = new Map<string, { goalies: Record<string, ConfirmedGoalieInfo>; timestamp: number }>();

async function getLiveConfirmedGoalies(dateInput?: string): Promise<Record<string, ConfirmedGoalieInfo>> {
  const now = Date.now();
  let dateParam = '';
  if (dateInput && dateInput !== 'now' && dateInput !== 'live' && dateInput !== 'demo' && dateInput !== 'pre-slate') {
    dateParam = dateInput.replace(/[^0-9]/g, '');
  } else {
    dateParam = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  }

  const cached = espnGoaliesCache.get(dateParam);
  if (cached && now - cached.timestamp < 45000) {
    return cached.goalies;
  }

  try {
    const url = dateParam
      ? `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=${dateParam}`
      : `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (!res.ok) throw new Error(`ESPN responded with ${res.status}`);
    const data = await res.json();
    const espnGoalies: Record<string, ConfirmedGoalieInfo> = {};
    const normalizeAbbrev = (abbr: string) => {
      const map: Record<string, string> = { "NJ": "NJD", "TB": "TBL", "SJ": "SJS", "LA": "LAK", "MON": "MTL", "WAS": "WSH" };
      return map[abbr] || abbr;
    };

    data.events?.forEach((e: any) => {
      e.competitions?.[0]?.competitors?.forEach((c: any) => {
        const teamAbbr = normalizeAbbrev(c.team?.abbreviation);
        const p = c.probables?.[0];
        if (p?.athlete) {
          const isConfirmed = p.status?.type === "confirmed" || (p.status?.name || "").toLowerCase() === "confirmed";
          const athleteLast = (p.athlete.displayName?.split(" ").slice(-1)[0] || "").toLowerCase();
          const nhlId = GOALIE_NAME_TO_NHL_ID[athleteLast] || NHL_PRIMARY_STARTERS[teamAbbr]?.id;
          const masklessHeadshot = nhlId 
            ? `https://assets.nhle.com/mugs/nhl/latest/${nhlId}.png`
            : p.athlete.headshot;

          espnGoalies[teamAbbr] = {
            name: p.athlete.displayName,
            firstName: p.athlete.displayName?.split(" ")[0],
            lastName: p.athlete.displayName?.split(" ").slice(1).join(" "),
            sweaterNumber: parseInt(p.athlete.jersey) || undefined,
            headshot: masklessHeadshot,
            status: p.status?.name || (isConfirmed ? "Confirmed" : "Expected"),
            confirmed: isConfirmed,
            espnId: p.athlete.id,
            playerId: nhlId
          };
        }
      });
    });

    // Augment with Daily Faceoff (confirmed, likely, projected)
    try {
      const dfRes = await fetch("https://www.dailyfaceoff.com/starting-goalies", {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36" }
      });
      if (dfRes.ok) {
        const html = await dfRes.text();
        const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
        if (nextDataMatch) {
          const dfData = JSON.parse(nextDataMatch[1]);
          const dfItems = dfData.props?.pageProps?.data || [];
          dfItems.forEach((item: any) => {
            const awayAbbr = TEAM_NAME_TO_ABBREV[item.awayTeamName?.toLowerCase()] || item.awayTeamSlug?.slice(0, 3)?.toUpperCase();
            const homeAbbr = TEAM_NAME_TO_ABBREV[item.homeTeamName?.toLowerCase()] || item.homeTeamSlug?.slice(0, 3)?.toUpperCase();

            if (awayAbbr && item.awayGoalieName) {
              const dfConf = (item.awayNewsStrengthName || '').toLowerCase().includes('confirm');
              const awayLast = (item.awayGoalieName.split(" ").slice(-1)[0] || "").toLowerCase();
              const awayNhlId = GOALIE_NAME_TO_NHL_ID[awayLast] || NHL_PRIMARY_STARTERS[awayAbbr]?.id;
              const awayMaskless = awayNhlId ? `https://assets.nhle.com/mugs/nhl/latest/${awayNhlId}.png` : undefined;

              if (!espnGoalies[awayAbbr] || dfConf) {
                espnGoalies[awayAbbr] = {
                  name: item.awayGoalieName,
                  firstName: item.awayGoalieName.split(" ")[0],
                  lastName: item.awayGoalieName.split(" ").slice(1).join(" "),
                  headshot: awayMaskless || espnGoalies[awayAbbr]?.headshot,
                  status: item.awayNewsStrengthName || espnGoalies[awayAbbr]?.status || 'Expected',
                  confirmed: dfConf || espnGoalies[awayAbbr]?.confirmed || false,
                  playerId: awayNhlId || espnGoalies[awayAbbr]?.playerId
                };
              }
            }
            if (homeAbbr && item.homeGoalieName) {
              const dfConf = (item.homeNewsStrengthName || '').toLowerCase().includes('confirm');
              const homeLast = (item.homeGoalieName.split(" ").slice(-1)[0] || "").toLowerCase();
              const homeNhlId = GOALIE_NAME_TO_NHL_ID[homeLast] || NHL_PRIMARY_STARTERS[homeAbbr]?.id;
              const homeMaskless = homeNhlId ? `https://assets.nhle.com/mugs/nhl/latest/${homeNhlId}.png` : undefined;

              if (!espnGoalies[homeAbbr] || dfConf) {
                espnGoalies[homeAbbr] = {
                  name: item.homeGoalieName,
                  firstName: item.homeGoalieName.split(" ")[0],
                  lastName: item.homeGoalieName.split(" ").slice(1).join(" "),
                  headshot: homeMaskless || espnGoalies[homeAbbr]?.headshot,
                  status: item.homeNewsStrengthName || espnGoalies[homeAbbr]?.status || 'Expected',
                  confirmed: dfConf || espnGoalies[homeAbbr]?.confirmed || false,
                  playerId: homeNhlId || espnGoalies[homeAbbr]?.playerId
                };
              }
            }
          });
        }
      }
    } catch {
      // Best-effort supplement
    }

    espnGoaliesCache.set(dateParam, { goalies: espnGoalies, timestamp: now });
    return espnGoalies;
  } catch (err) {
    console.error("[ESPN Goalie Confirmation Sync] Failed:", err);
    return espnGoaliesCache.get(dateParam)?.goalies || {};
  }
}

// Endpoint to get confirmed starting goalies across target slate
app.get("/api/nhl/confirmed-goalies", async (req, res) => {
  const date = (req.query.date as string) || '';
  const goalies = await getLiveConfirmedGoalies(date);
  res.json(goalies);
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

    const awayAbbrev = (data.awayTeam?.abbrev || '').toUpperCase();
    const homeAbbrev = (data.homeTeam?.abbrev || '').toUpperCase();

    // 2. Check matchup leaders (source for upcoming pre-season & regular season games)
    const matchupAwayLeaders = data.matchup?.goalieComparison?.awayTeam?.leaders || [];
    const matchupHomeLeaders = data.matchup?.goalieComparison?.homeTeam?.leaders || [];
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
      // If unconfirmed backup was set, ensure primary starter is probable
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
      // If unconfirmed backup was set, ensure primary starter is probable
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

    // Merge live confirmed starting goalies from ESPN
    try {
      const gameDateStr = data.gameDate || (data.startTimeUTC ? data.startTimeUTC.slice(0, 10) : '');
      const confirmedMap = await getLiveConfirmedGoalies(gameDateStr);
      const awayConfirmed = confirmedMap[awayAbbrev];
      const homeConfirmed = confirmedMap[homeAbbrev];

      if (awayConfirmed) {
        data.awayTeam.probableStartingGoalie = {
          ...(data.awayTeam.probableStartingGoalie || {}),
          name: awayConfirmed.name,
          firstName: awayConfirmed.firstName || data.awayTeam.probableStartingGoalie?.firstName,
          lastName: awayConfirmed.lastName || data.awayTeam.probableStartingGoalie?.lastName,
          sweaterNumber: awayConfirmed.sweaterNumber || data.awayTeam.probableStartingGoalie?.sweaterNumber,
          headshot: data.awayTeam.probableStartingGoalie?.headshot || awayConfirmed.headshot,
          confirmed: awayConfirmed.confirmed,
          status: awayConfirmed.status,
          starter: awayConfirmed.confirmed
        };
        if (awayConfirmed.confirmed && !data.awayTeam.goaltender) {
          data.awayTeam.goaltender = data.awayTeam.probableStartingGoalie;
        }
      }

      if (homeConfirmed) {
        data.homeTeam.probableStartingGoalie = {
          ...(data.homeTeam.probableStartingGoalie || {}),
          name: homeConfirmed.name,
          firstName: homeConfirmed.firstName || data.homeTeam.probableStartingGoalie?.firstName,
          lastName: homeConfirmed.lastName || data.homeTeam.probableStartingGoalie?.lastName,
          sweaterNumber: homeConfirmed.sweaterNumber || data.homeTeam.probableStartingGoalie?.sweaterNumber,
          headshot: data.homeTeam.probableStartingGoalie?.headshot || homeConfirmed.headshot,
          confirmed: homeConfirmed.confirmed,
          status: homeConfirmed.status,
          starter: homeConfirmed.confirmed
        };
        if (homeConfirmed.confirmed && !data.homeTeam.goaltender) {
          data.homeTeam.goaltender = data.homeTeam.probableStartingGoalie;
        }
      }
    } catch (confErr) {
      console.warn("[NHL Proxy] Error merging confirmed goalies in game details:", confErr);
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

// Warm cache for all NHL teams on startup
setTimeout(() => {
  warmTeamsRecentOffense(NHL_ALL_TEAMS).catch(err => {
    console.warn("[Team Offense Trends] Initial warming error:", err);
  });
}, 1000);

export default app;
