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
    console.log('Ballpark Pal raw data:', data);
    
    // Support new API v1 format: { meta: {}, data: { items: [...] } }
    let rawItems: any[] = [];
    if (data.data?.items && Array.isArray(data.data.items)) {
      rawItems = data.data.items;
    } else if (Array.isArray(data)) {
      rawItems = data;
    } else if (typeof data === 'object' && data !== null) {
      // Check for various possible keys
      const entries = data.park_factors || data.data || (Array.isArray(data.items) ? data.items : null) || Object.values(data).find(v => Array.isArray(v));
      if (Array.isArray(entries)) {
        rawItems = entries;
      }
    }
    
    console.log(`Processing ${rawItems.length} items from Ballpark Pal`);

    // Map new API fields to our interface
    const normalizedData: BallparkPalFactor[] = rawItems.map(item => {
      // If it's already in the correct format, return as is
      if (item.game && item.runs !== undefined) return item;

      // Handle new API v1 format
      return {
        game: `${item.teamAway} @ ${item.teamHome}`,
        runs: 1 + (item.runsPercent / 100),
        hr: 1 + (item.homeRunsPercent / 100),
        hits: 1 + (item.singlesPercent / 100),
        edge: item.runsAmount // Using runsAmount as edge/impact
      };
    });

    factorsCache[cacheKey] = {
      data: normalizedData,
      timestamp: now
    };

    return normalizedData;
  } catch (error) {
    console.error('Error fetching Ballpark Pal factors:', error);
    return factorsCache[cacheKey]?.data || [];
  }
}

export function findGameFactor(factors: BallparkPalFactor[], awayAbbr: string, homeAbbr: string, awayName: string = '', homeName: string = ''): BallparkPalFactor | null {
  if (!factors || factors.length === 0) return null;
  
  const aAbbr = (awayAbbr || '').toUpperCase();
  const hAbbr = (homeAbbr || '').toUpperCase();
  const aName = (awayName || '').toUpperCase();
  const hName = (homeName || '').toUpperCase();

  // Try matching by abbreviation first (if available)
  if (aAbbr && hAbbr) {
    const matched = factors.find(f => {
      const gameStr = f.game.toUpperCase();
      // Ballpark Pal often uses 2 or 3 letter abbreviations
      const isMatch = (gameStr.includes(aAbbr) && gameStr.includes(hAbbr));
      return isMatch;
    });
    if (matched) {
      console.log(`Matched ${aAbbr}@${hAbbr} via abbreviation in ${matched.game}`);
      return matched;
    }
  }

  // Fallback to matching by names if abbreviations fail or are missing
  const matchedByName = factors.find(f => {
    const gameStr = f.game.toUpperCase();
    const parts = gameStr.split('@').map(p => p.trim());
    if (parts.length !== 2) return false;
    
    const palAway = parts[0];
    const palHome = parts[1];

    // Check if team names are contained in the Pal game string
    const matchAway = (aAbbr && palAway.includes(aAbbr)) || (aName && aName.includes(palAway)) || (palAway && aName.includes(palAway));
    const matchHome = (hAbbr && palHome.includes(hAbbr)) || (hName && hName.includes(palHome)) || (palHome && hName.includes(palHome));

    return matchAway && matchHome;
  }) || null;

  if (matchedByName) {
    console.log(`Matched ${aName}@${hName} via name in ${matchedByName.game}`);
  } else if (factors.length > 0) {
    console.warn(`No match found for ${aAbbr || aName} @ ${hAbbr || hName} among ${factors.length} factors. First factor: ${factors[0].game}`);
  }

  return matchedByName;
}
