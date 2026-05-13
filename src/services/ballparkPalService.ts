import { format } from 'date-fns';

/**
 * Ballpark Pal API Service
 * Sourced via BallparkPal.com
 */

export interface BallparkPalFactor {
  game: string; // e.g. "TB @ CLE"
  runs: number;
  hr: number;
  hits: number;
  temp?: number;
  wind?: string;
  condition?: string;
  edge?: number;
}

let factorsCache: Record<string, {
  data: BallparkPalFactor[];
  timestamp: number;
}> = {};

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function fetchBallparkPalFactors(date?: string): Promise<BallparkPalFactor[]> {
  const now = Date.now();
  const cacheKey = date || format(new Date(), 'yyyy-MM-dd');
  
  const cached = factorsCache[cacheKey];
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  try {
    const ts = Date.now();
    const url = date 
      ? `/api/ballpark-pal/park-factors?date=${date}&_ts=${ts}` 
      : `/api/ballpark-pal/park-factors?_ts=${ts}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Ballpark Pal API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[BallparkPal] Raw Data:', data);
    
    if (data.error) {
      console.warn('[BallparkPal] Server reported error:', data.error, data.details || '');
      throw new Error(data.error);
    }
    
    // Support various API v1 response structures
    let rawItems: any[] = [];
    if (data.data?.items && Array.isArray(data.data.items)) {
      rawItems = data.data.items;
    } else if (data.data && Array.isArray(data.data)) {
      rawItems = data.data;
    } else if (Array.isArray(data.items)) {
      rawItems = data.items;
    } else if (Array.isArray(data)) {
      rawItems = data;
    } else if (typeof data === 'object' && data !== null) {
      // Final attempt: check for list keys
      const entries = data.park_factors || Object.values(data).find(v => Array.isArray(v));
      if (Array.isArray(entries)) {
        rawItems = entries;
      }
    }
    
    console.log(`[BallparkPal] Normalizing ${rawItems.length} items`);

    // Map new API fields to our interface
    const normalizedData: BallparkPalFactor[] = rawItems.map(item => {
      // If it's already in the correct format, return as is
      if (item.game && item.runs !== undefined) return item;

      // Handle new API v1 format (teamAway, teamHome, runsPercent, etc.)
      const game = item.teamAway && item.teamHome ? `${item.teamAway} @ ${item.teamHome}` : (item.game || 'Unknown');
      
      // Calculate multipliers from percentages (e.g., 10% -> 1.10)
      const runs = item.runsPercent !== undefined ? (1 + (parseFloat(item.runsPercent) / 100)) : (item.runs || 1.0);
      const hr = item.homeRunsPercent !== undefined ? (1 + (parseFloat(item.homeRunsPercent) / 100)) : (item.hr || 1.0);
      const hits = item.singlesPercent !== undefined ? (1 + (parseFloat(item.singlesPercent) / 100)) : (item.hits || 1.0);

      return {
        game,
        runs,
        hr,
        hits,
        temp: item.temp,
        wind: item.wind,
        condition: item.condition,
        edge: item.runsAmount || item.edge
      };
    });

    factorsCache[cacheKey] = {
      data: normalizedData,
      timestamp: now
    };

    return normalizedData;
  } catch (error) {
    console.error('Error fetching Ballpark Pal factors:', error);
    // Propagate the error so App.tsx can show the configuration alert
    throw error;
  }
}

const TEAM_MAPPINGS: Record<string, string[]> = {
  'ARI': ['AZ', 'ARI'],
  'AZ': ['ARI', 'AZ'],
  'CHW': ['CWS', 'CHW'],
  'CWS': ['CHW', 'CWS'],
  'KC': ['KCA', 'KC'],
  'KCA': ['KC', 'KCA'],
  'SD': ['SDN', 'SD'],
  'SDN': ['SD', 'SDN'],
  'SF': ['SFN', 'SF'],
  'SFN': ['SF', 'SFN'],
  'TB': ['TBA', 'TB'],
  'TBA': ['TB', 'TBA'],
  'WAS': ['WSH', 'WAS'],
  'WSH': ['WAS', 'WSH'],
  'LAD': ['LA', 'LAD'],
  'LA': ['LAD', 'LA'],
  'NYY': ['NYY'],
  'NYM': ['NYM']
};

function normalizeAbbr(abbr: string): string[] {
  const upper = abbr.toUpperCase();
  return TEAM_MAPPINGS[upper] || [upper];
}

export function findGameFactor(factors: BallparkPalFactor[], awayAbbr: string, homeAbbr: string, awayName: string = '', homeName: string = ''): BallparkPalFactor | null {
  if (!factors || factors.length === 0) return null;
  
  const aAbbrs = normalizeAbbr(awayAbbr);
  const hAbbrs = normalizeAbbr(homeAbbr);
  const aName = (awayName || '').toUpperCase();
  const hName = (homeName || '').toUpperCase();

  // Try matching by abbreviation variants
  for (const a of aAbbrs) {
    for (const h of hAbbrs) {
      const matched = factors.find(f => {
        const gameStr = f.game.toUpperCase();
        // Ballpark Pal often uses @ or vs
        const parts = gameStr.split(/[@vs]/).map(p => p.trim());
        if (parts.length >= 2) {
          const palAway = parts[0];
          const palHome = parts[parts.length - 1]; // Support names like "CHICAGO @ CLEVELAND"
          return (palAway.includes(a) || a.includes(palAway)) && (palHome.includes(h) || h.includes(palHome));
        }
        return gameStr.includes(a) && gameStr.includes(h);
      });
      if (matched) return matched;
    }
  }

  // Fallback to name-based matching
  return factors.find(f => {
    const gameStr = f.game.toUpperCase();
    const parts = gameStr.split(/[@vs]/).map(p => p.trim());
    if (parts.length < 2) return false;
    
    const palAway = parts[0];
    const palHome = parts[parts.length - 1];

    const matchAway = aName.includes(palAway) || palAway.includes(aName.split(' ').pop() || '!!!');
    const matchHome = hName.includes(palHome) || palHome.includes(hName.split(' ').pop() || '!!!');

    return matchAway && matchHome;
  }) || null;
}
