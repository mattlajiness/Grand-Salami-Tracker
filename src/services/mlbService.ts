import { format, subDays, addDays, parseISO } from 'date-fns';

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
        abbreviation?: string;
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
        abbreviation?: string;
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
    isForecast?: boolean;
  };
  venue?: {
    name: string;
    id: number;
  };
  officials?: {
    official: {
      id: number;
      fullName: string;
      link: string;
    };
    officialType: string;
  }[];
  boxscore?: {
    teams: {
      away: { pitchers: number[] };
      home: { pitchers: number[] };
    };
  };
  gameDate: string;
  officialDate?: string;
  totalLine?: number;
}

export interface MLBScheduleResponse {
  dates: {
    date: string;
    games: MLBGame[];
  }[];
}

// Cache for pitcher stats to reduce API load
let pitcherStatsCache: {
  data: Record<number, string>;
  lastFetched: number;
} | null = null;

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Cache for schedule data to handle transient fetch failures
let scheduleCache: {
  data: MLBGame[];
  timestamp: number;
} | null = null;

const SCHEDULE_CACHE_TTL = 60 * 1000; // 1 minute fallback cache

import { fetchWeatherForecast } from './weatherService';

export async function fetchMLBGames(date?: string, startDate?: string, endDate?: string): Promise<MLBGame[]> {
  const fetchWithRetry = async (retryUrl: string, retries = 2): Promise<Response> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); 
      console.log(`[MLB Service] Fetching: ${retryUrl} (Attempt: ${3 - retries})`);
      const res = await fetch(retryUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      return res;
    } catch (err) {
      console.warn(`[MLB Service] Fetch error for ${retryUrl}:`, err);
      if (retries > 0) {
        await new Promise(r => setTimeout(r, 2000));
        return fetchWithRetry(retryUrl, retries - 1);
      }
      throw err;
    }
  };

  const searchParams = new URLSearchParams();
  searchParams.append('sportId', '1');
  // Use a safer set of hydrations
  searchParams.append('hydrate', 'linescore,team,weather,venue,probablePitcher');
  searchParams.append('_t', Math.floor(Date.now() / 60000).toString()); 
  
  if (startDate && endDate) {
    searchParams.append('startDate', startDate);
    searchParams.append('endDate', endDate);
  } else if (date) {
    searchParams.append('date', date);
  }
  
  const relativeUrl = `/api/v1/mlb/schedule?${searchParams.toString()}`;
  
  try {
    const response = await fetchWithRetry(relativeUrl);

    if (!response.ok) {
      if (scheduleCache && (Date.now() - scheduleCache.timestamp < SCHEDULE_CACHE_TTL * 15)) {
        return scheduleCache.data;
      }
      throw new Error(`MLB API Error: ${response.status}`);
    }
    
    const data: MLBScheduleResponse = await response.json();
    console.log(`[MLB Service] Raw data received for ${date || startDate}:`, JSON.stringify(data).slice(0, 200));
    
    if (!data || !data.dates || !Array.isArray(data.dates) || data.dates.length === 0) {
      console.warn(`[MLB Service] No dates returned for ${date || startDate}. Full response:`, JSON.stringify(data));
      return [];
    }

    const rawGames = data.dates.flatMap(d => (d.games || []).map(g => ({ ...g, officialDate: d.date })));
    
    if (rawGames.length === 0) {
      console.warn(`[MLB Service] No games returned for ${date || startDate}`);
      return [];
    }

    // Optional Weather Forecast enrichment for preview games missing weather
    const gamesToEnrich = rawGames.map(async (game) => {
      let enrichedGame = { ...game };

      if (!enrichedGame.weather || !enrichedGame.weather.temp) {
        try {
          const forecast = await fetchWeatherForecast(game.teams.home.team.id, game.gameDate, game.venue?.name);
          if (forecast) {
            enrichedGame.weather = {
              condition: forecast.condition,
              temp: forecast.temp.toString(),
              wind: `${forecast.windSpeed} mph, ${forecast.windDir}`,
              isForecast: true
            };
          }
        } catch (e) {}
      }

      // Check for odds if not included in hydrate (sometimes it isn't)
      if (!enrichedGame.totalLine) {
        try {
          const oddsRes = await fetch(`/api/v1/mlb/game/${game.gamePk}/contextMetrics?hydrate=odds`);
          if (oddsRes.ok) {
            const oddsData = await oddsRes.json();
            if (oddsData?.odds?.[0]?.total) {
              enrichedGame.totalLine = oddsData.odds[0].total;
            }
          }
        } catch (e) {}
      }

      return enrichedGame;
    });

    let resultGames = await Promise.all(gamesToEnrich);

    // Enrich with pitcher stats
    const pitcherIds = new Set<number>();
    resultGames.forEach(game => {
      if (game.teams.away.probablePitcher?.id) pitcherIds.add(game.teams.away.probablePitcher.id);
      if (game.teams.home.probablePitcher?.id) pitcherIds.add(game.teams.home.probablePitcher.id);
    });

    if (pitcherIds.size > 0) {
      try {
        const statsMap = await fetchPitcherStats(Array.from(pitcherIds));
        resultGames = resultGames.map(game => {
          const newGame = { ...game };
          if (newGame.teams.away.probablePitcher?.id) {
            newGame.teams.away.probablePitcher.era = statsMap[newGame.teams.away.probablePitcher.id];
          }
          if (newGame.teams.home.probablePitcher?.id) {
            newGame.teams.home.probablePitcher.era = statsMap[newGame.teams.home.probablePitcher.id];
          }
          return newGame;
        });
      } catch (e) {
        console.error("Failed to fetch pitcher stats", e);
      }
    }

    // Update cache
    if (resultGames.length > 0) {
      scheduleCache = {
        data: resultGames,
        timestamp: Date.now()
      };
    }

    return resultGames;
  } catch (error) {
    if (scheduleCache && (Date.now() - scheduleCache.timestamp < SCHEDULE_CACHE_TTL * 30)) {
      console.warn('Fetch failed, returning cached data:', error);
      return scheduleCache.data;
    }
    console.error('Error fetching MLB games:', error);
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
      const url = `/api/v1/mlb/people?personIds=${batch.join(',')}&hydrate=stats(group=[pitching],type=[season])`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort('PitcherStatsTimeout'), 20000); // 20s per batch
      
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
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Pitcher stats fetch timed out after 20s');
      } else {
        console.error('Error fetching pitcher stats batch:', error);
      }
    }
  }));

  return statsMap;
}
