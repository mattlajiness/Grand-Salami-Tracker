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
        throw new Error(`NHL Proxy Error: ${response.status}`);
    }

    const data: NHLScoreResponse = await response.json();
    return data.games || [];
  } catch (error) {
    console.error('Error fetching NHL games:', error);
    return [];
  }
}
