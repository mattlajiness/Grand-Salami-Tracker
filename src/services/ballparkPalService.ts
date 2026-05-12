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

let factorsCache: {
  data: BallparkPalFactor[];
  timestamp: number;
} | null = null;

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function fetchBallparkPalFactors(): Promise<BallparkPalFactor[]> {
  const now = Date.now();
  if (factorsCache && (now - factorsCache.timestamp < CACHE_TTL)) {
    return factorsCache.data;
  }

  try {
    const response = await fetch('/api/ballpark-pal/park-factors');
    if (!response.ok) {
      throw new Error(`Ballpark Pal API Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Support new API v1 format: { meta: {}, data: { items: [...] } }
    let rawItems: any[] = [];
    if (data.data?.items && Array.isArray(data.data.items)) {
      rawItems = data.data.items;
    } else if (Array.isArray(data)) {
      rawItems = data;
    } else if (typeof data === 'object' && data !== null) {
      const entries = data.park_factors || data.data || Object.values(data);
      if (Array.isArray(entries)) {
        rawItems = entries;
      }
    }

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

    factorsCache = {
      data: normalizedData,
      timestamp: now
    };

    return normalizedData;
  } catch (error) {
    console.error('Error fetching Ballpark Pal factors:', error);
    return factorsCache?.data || [];
  }
}

export function findGameFactor(factors: BallparkPalFactor[], awayAbbr: string, homeAbbr: string): BallparkPalFactor | null {
  if (!factors || factors.length === 0) return null;

  return factors.find(f => {
    const gameStr = f.game.toUpperCase();
    return (gameStr.includes(awayAbbr.toUpperCase()) && gameStr.includes(homeAbbr.toUpperCase()));
  }) || null;
}
