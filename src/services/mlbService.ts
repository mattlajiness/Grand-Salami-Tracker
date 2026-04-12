/**
 * MLB Stats API Types (Simplified)
 */

export interface MLBGame {
  gamePk: number;
  status: {
    abstractGameState: 'Live' | 'Final' | 'Preview';
    codedGameState: string;
    detailedState: string;
    statusCode: string;
  };
  teams: {
    away: {
      score?: number;
      team: {
        id: number;
        name: string;
      };
    };
    home: {
      score?: number;
      team: {
        id: number;
        name: string;
      };
    };
  };
  linescore?: {
    currentInning?: number;
    currentInningOrdinal?: string;
    inningState?: string;
    inningHalf?: string;
    isTopInning?: boolean;
    innings: {
      num: number;
      ordinalNum: string;
      home: { runs?: number; hits?: number; errors?: number };
      away: { runs?: number; hits?: number; errors?: number };
    }[];
    teams: {
      home: { runs?: number; hits?: number; errors?: number };
      away: { runs?: number; hits?: number; errors?: number };
    };
    defense?: {
      pitcher?: { id: number; fullName: string };
      batter?: { id: number; fullName: string };
    };
    offense?: {
      batter?: { id: number; fullName: string };
      onDeck?: { id: number; fullName: string };
      inHole?: { id: number; fullName: string };
      pitcher?: { id: number; fullName: string };
      first?: { id: number; fullName: string };
      second?: { id: number; fullName: string };
      third?: { id: number; fullName: string };
    };
    balls?: number;
    strikes?: number;
    outs?: number;
  };
  weather?: {
    condition: string;
    temp: string;
    wind: string;
  };
  venue?: {
    name: string;
    id: number;
  };
  gameDate: string;
  officialDate?: string;
}

export interface MLBScheduleResponse {
  dates: {
    date: string;
    games: MLBGame[];
  }[];
}

export async function fetchMLBGames(date?: string, startDate?: string, endDate?: string): Promise<MLBGame[]> {
  const url = new URL('https://statsapi.mlb.com/api/v1/schedule/games/?sportId=1');
  url.searchParams.append('hydrate', 'linescore,team,weather,venue');
  url.searchParams.append('_t', Date.now().toString()); // Cache buster
  
  if (startDate && endDate) {
    url.searchParams.append('startDate', startDate);
    url.searchParams.append('endDate', endDate);
  } else if (date) {
    url.searchParams.append('date', date);
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`MLB API Error: ${response.status}`);
    
    const data: MLBScheduleResponse = await response.json();
    
    if (!data || !data.dates || data.dates.length === 0) {
      console.warn('No games found for this period');
      return [];
    }

    // If it's a range, we might want all games from all dates
    if (startDate && endDate) {
      return data.dates.flatMap(d => (d.games || []).map(g => ({ ...g, officialDate: d.date })));
    }

    return (data.dates[0].games || []).map(g => ({ ...g, officialDate: data.dates[0].date }));
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('MLB API Request timed out');
    } else {
      console.error('Error fetching MLB games:', error);
    }
    return [];
  }
}
