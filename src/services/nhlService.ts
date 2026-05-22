import { format } from 'date-fns';

export interface NHLGame {
  id: number;
  gameState: 'PRE' | 'LIVE' | 'OFF' | 'FINAL' | 'CRIT';
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
      return typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } catch {}
  }
};

export async function fetchNHLGames(date?: string): Promise<NHLGame[]> {
  const targetDate = date || format(new Date(), 'yyyy-MM-dd');
  const url = `/api/nhl/scores?date=${targetDate}`;

  try {
    const response = await fetch(url);
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

export async function fetchNHLGameDetails(gameId: number): Promise<any> {
  const url = `/api/nhl/game/${gameId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NHL Game Details Proxy Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching NHL game details for ${gameId}:`, error);
    return null;
  }
}
