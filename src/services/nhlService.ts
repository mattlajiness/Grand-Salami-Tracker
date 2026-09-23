import { format } from 'date-fns';

export interface NHLGame {
  id: number;
  gameState: 'PRE' | 'LIVE' | 'OFF' | 'FINAL' | 'CRIT' | 'FUT' | 'OVER' | string;
  startTimeUTC: string;
  gameDate: string;
  venue: {
    default: string;
  };
  awayTeam: {
    id: number;
    abbrev: string;
    logo: string;
    score?: number;
    sog?: number;
  };
  homeTeam: {
    id: number;
    abbrev: string;
    logo: string;
    score?: number;
    sog?: number;
  };
  periodDescriptor?: {
    number: number;
    periodType: string;
  };
  clock?: {
    timeRemaining: string;
    secondsRemaining: number;
    inIntermission: boolean;
  };
  situation?: {
    homeTeam?: {
      situationCode?: string;
      strength?: number;
    };
    awayTeam?: {
      situationCode?: string;
      strength?: number;
    };
    situationCode?: string;
    strength?: number;
  };
  boxscore?: any;
  // Starting Goalie info from landing
  awayGoalie?: NHLGoalie;
  homeGoalie?: NHLGoalie;
}

export interface NHLGoalie {
  playerId: number;
  firstInitial: string;
  lastName: string;
  savePct?: string;
  gaa?: string;
  record?: string;
}

export interface NHLScoreResponse {
  date: string;
  games: NHLGame[];
}

const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      return typeof window !== 'undefined' && window.sessionStorage ? sessionStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem(key, value);
      }
    } catch {}
  }
};
const safeSessionStorage = safeLocalStorage;

export async function fetchNHLGames(date?: string): Promise<NHLGame[]> {
  const targetDate = date || format(new Date(), 'yyyy-MM-dd');
  let url = `/api/nhl/scores/${targetDate}`;

  try {
    let response = await fetch(url);
    
    // Fallback to "now" if the specific date endpoint fails
    if (!response.ok) {
        console.warn(`NHL fetch failed for ${targetDate}, trying 'now' fallback...`);
        url = `/api/nhl/scores/now`;
        response = await fetch(url);
    }
    
    if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: response.statusText };
        }
        throw new Error(`NHL Proxy Error ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data: NHLScoreResponse = await response.json();
    const games = data.games || [];
    
    if (games.length > 0) {
      try {
        safeLocalStorage.setItem(`nhl_games_cache_${targetDate}`, JSON.stringify({
          data: games,
          timestamp: Date.now()
        }));
      } catch (e) {}
    }
    
    return games;
  } catch (error: any) {
    const cacheKey = `nhl_games_cache_${targetDate}`;
    const stored = safeLocalStorage.getItem(cacheKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.warn(`Fetch NHL games failed, using persistent localStorage cache from ${new Date(parsed.timestamp).toISOString()}:`, error.message);
        return parsed.data;
      } catch (e) {}
    }

    console.warn('Error fetching NHL games (returning empty array):', {
      message: error.message,
      url: url
    });
    return [];
  }
}

// Client-side in-memory cache and in-flight request tracker for NHL game details
const clientGameDetailsCache = new Map<number, { data: any; timestamp: number }>();
const inFlightGameDetailsRequests = new Map<number, Promise<any>>();

export async function fetchNHLGameDetails(gameId: number): Promise<any> {
  // 1. Check in-memory cache
  const cached = clientGameDetailsCache.get(gameId);
  const now = Date.now();
  if (cached) {
    const isLive = cached.data?.gameState === 'LIVE' || cached.data?.gameState === 'CRIT';
    const ttl = isLive ? 30000 : 300000; // 30s for live, 5m for finished/upcoming
    if (now - cached.timestamp < ttl) {
      return cached.data;
    }
  }

  // 2. Check if a request for this gameId is already in flight (deduplicate calls)
  if (inFlightGameDetailsRequests.has(gameId)) {
    return inFlightGameDetailsRequests.get(gameId);
  }

  // 3. Check sessionStorage cache
  const sessionKey = `nhl_game_details_${gameId}`;
  const sessionData = safeSessionStorage.getItem(sessionKey);
  if (sessionData) {
    try {
      const parsed = JSON.parse(sessionData);
      if (now - parsed.timestamp < 120000) {
        clientGameDetailsCache.set(gameId, { data: parsed.data, timestamp: parsed.timestamp });
        return parsed.data;
      }
    } catch {}
  }

  const url = `/api/nhl/game/${gameId}`;
  const requestPromise = (async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`NHL Game Details Proxy Error: ${response.status}`);
      }
      const data = await response.json();
      
      // Store in caches
      clientGameDetailsCache.set(gameId, { data, timestamp: Date.now() });
      safeSessionStorage.setItem(sessionKey, JSON.stringify({ data, timestamp: Date.now() }));
      
      return data;
    } catch (error) {
      console.warn(`Error fetching NHL game details for ${gameId}:`, error);
      // If we had an expired cache in memory or session, return it as fallback
      if (cached?.data) {
        return cached.data;
      }
      if (sessionData) {
        try {
          return JSON.parse(sessionData).data;
        } catch {}
      }
      // Cache null with short 15s TTL so we don't spam in a tight loop
      clientGameDetailsCache.set(gameId, { data: null, timestamp: Date.now() - 285000 });
      return null;
    } finally {
      inFlightGameDetailsRequests.delete(gameId);
    }
  })();

  inFlightGameDetailsRequests.set(gameId, requestPromise);
  return requestPromise;
}

