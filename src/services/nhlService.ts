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
  };
  homeTeam: {
    id: number;
    abbrev: string;
    logo: string;
    score?: number;
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
    return data.games || [];
  } catch (error: any) {
    console.error('Error fetching NHL games:', {
      message: error.message,
      url: url,
      stack: error.stack
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
