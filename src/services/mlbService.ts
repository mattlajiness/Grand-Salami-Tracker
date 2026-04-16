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
      probablePitcher?: {
        id: number;
        fullName: string;
        era?: string;
      };
    };
    home: {
      score?: number;
      team: {
        id: number;
        name: string;
      };
      probablePitcher?: {
        id: number;
        fullName: string;
        era?: string;
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
  boxscore?: {
    teams: {
      away: { pitchers: number[] };
      home: { pitchers: number[] };
    };
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
  url.searchParams.append('hydrate', 'linescore,team,weather,venue,probablePitcher,boxscore');
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
    
    if (!data || !data.dates || !Array.isArray(data.dates) || data.dates.length === 0) {
      console.warn('No games found for this period');
      return [];
    }

    let games: MLBGame[] = [];
    try {
      if (startDate && endDate) {
        games = data.dates.flatMap(d => (d.games || []).map(g => ({ ...g, officialDate: d.date })));
      } else if (data.dates[0]) {
        games = (data.dates[0].games || []).map(g => ({ ...g, officialDate: data.dates[0].date }));
      }
    } catch (e) {
      console.error('Error parsing MLB games data:', e);
      return [];
    }

    // Enrich with pitcher stats
    const pitcherIds = new Set<number>();
    games.forEach(game => {
      if (game.teams.away.probablePitcher?.id) pitcherIds.add(game.teams.away.probablePitcher.id);
      if (game.teams.home.probablePitcher?.id) pitcherIds.add(game.teams.home.probablePitcher.id);
    });

    if (pitcherIds.size > 0) {
      const statsMap = await fetchPitcherStats(Array.from(pitcherIds));
      games = games.map(game => {
        const newGame = { ...game };
        if (newGame.teams.away.probablePitcher?.id) {
          newGame.teams.away.probablePitcher.era = statsMap[newGame.teams.away.probablePitcher.id];
        }
        if (newGame.teams.home.probablePitcher?.id) {
          newGame.teams.home.probablePitcher.era = statsMap[newGame.teams.home.probablePitcher.id];
        }
        return newGame;
      });
    }

    return games;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('MLB API Request timed out');
    } else {
      console.error('Error fetching MLB games:', error);
    }
    return [];
  }
}

async function fetchPitcherStats(pitcherIds: number[]): Promise<Record<number, string>> {
  const statsMap: Record<number, string> = {};
  
  // Batch in groups of 50 (MLB API limit is usually around here)
  const batches = [];
  for (let i = 0; i < pitcherIds.length; i += 50) {
    batches.push(pitcherIds.slice(i, i + 50));
  }

  await Promise.all(batches.map(async (batch) => {
    try {
      const url = `https://statsapi.mlb.com/api/v1/people?personIds=${batch.join(',')}&hydrate=stats(group=[pitching],type=[season])`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) return;
      
      const data = await response.json();
      if (data && data.people) {
        data.people.forEach((person: any) => {
          const era = person.stats?.[0]?.splits?.[0]?.stat?.era;
          if (era) {
            statsMap[person.id] = era;
          }
        });
      }
    } catch (error) {
      console.error('Error fetching pitcher stats batch:', error);
    }
  }));

  return statsMap;
}
