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
      const timeoutId = setTimeout(() => controller.abort('MLBPrefetchTimeout'), 20000); // 20s for schedule
      const res = await fetch(retryUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      return res;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.warn(`Fetch timed out for ${retryUrl}, retries remaining: ${retries}`);
      }
      if (retries > 0) {
        await new Promise(r => setTimeout(r, 1000));
        return fetchWithRetry(retryUrl, retries - 1);
      }
      throw err;
    }
  };

  const urlObj = new URL('https://statsapi.mlb.com/api/v1/schedule');
  urlObj.searchParams.append('sportId', '1');
  urlObj.searchParams.append('hydrate', 'linescore,team,weather,venue,probablePitcher,boxscore,officials');
  urlObj.searchParams.append('_t', Math.floor(Date.now() / 60000).toString()); // Minute-level cache busting
  
  if (startDate && endDate) {
    urlObj.searchParams.append('startDate', startDate);
    urlObj.searchParams.append('endDate', endDate);
  } else if (date) {
    try {
      const targetDate = parseISO(date);
      const start = format(subDays(targetDate, 1), 'yyyy-MM-dd');
      const end = format(addDays(targetDate, 1), 'yyyy-MM-dd');
      urlObj.searchParams.append('startDate', start);
      urlObj.searchParams.append('endDate', end);
    } catch (e) {
      urlObj.searchParams.append('date', date);
    }
  }
  
  try {
    const response = await fetchWithRetry(urlObj.toString());

    if (!response.ok) {
      // If we have a cached version, use it during API errors
      if (scheduleCache && (Date.now() - scheduleCache.timestamp < SCHEDULE_CACHE_TTL * 15)) {
        console.warn('Using stale schedule cache due to API error');
        return scheduleCache.data;
      }
      throw new Error(`MLB API Error: ${response.status}`);
    }
    
    const data: MLBScheduleResponse = await response.json();
    
    if (!data || !data.dates || !Array.isArray(data.dates) || data.dates.length === 0) {
      console.warn('No games found for this period');
      return [];
    }

    let rawGames: MLBGame[] = [];
    try {
      if (startDate && endDate) {
        rawGames = data.dates.flatMap(d => (d.games || []).map(g => ({ ...g, officialDate: d.date })));
      } else if (date) {
        const dayData = data.dates.find(d => d.date === date);
        if (dayData) {
          rawGames = (dayData.games || []).map(g => ({ ...g, officialDate: dayData.date }));
        } else {
          // If the specific day requested isn't found, return empty array instead of falling back to yesterday
          console.warn(`No games found in API response for specific date: ${date}`);
          rawGames = [];
        }
      } else if (data.dates[0]) {
        rawGames = (data.dates[0].games || []).map(g => ({ ...g, officialDate: data.dates[0].date }));
      }
    } catch (e) {
      console.error('Error parsing MLB games data:', e);
      return [];
    }

    // Enrich with boxscores if missing for final games AND pre-fetch forecast for future games
    const enrichedGames = await Promise.all(rawGames.map(async (game) => {
      let enrichedGame = { ...game };

      // 1. Boxscore enrichment
      if (game.status.abstractGameState === 'Final' && (!game.boxscore?.teams.home.pitchers || game.boxscore.teams.home.pitchers.length === 0)) {
        try {
          const boxResponse = await fetch(`https://statsapi.mlb.com/api/v1/game/${game.gamePk}/boxscore`);
          if (boxResponse.ok) {
            const boxData = await boxResponse.json();
            enrichedGame.boxscore = {
              teams: {
                away: { pitchers: boxData.teams.away.pitchers || [] },
                home: { pitchers: boxData.teams.home.pitchers || [] }
              }
            };
          }
        } catch (e) {}
      }

      // 2. Weather Forecast enrichment for Preview/Live games missing weather
      if (!enrichedGame.weather || !enrichedGame.weather.temp) {
        const forecast = await fetchWeatherForecast(game.teams.home.team.id, game.gameDate, game.venue?.name);
        if (forecast) {
          enrichedGame.weather = {
            condition: forecast.condition,
            temp: forecast.temp.toString(),
            wind: `${forecast.windSpeed} mph, Dir ${forecast.windDir}`,
            isForecast: true
          };
        }
      }

      // 3. Over/Under TotalLine enrichment
      try {
        const oddsUrl = `https://statsapi.mlb.com/api/v1/game/${game.gamePk}/contextMetrics?hydrate=odds`;
        const oddsRes = await fetch(oddsUrl);
        if (oddsRes.ok) {
          const oddsData = await oddsRes.json();
          enrichedGame.totalLine = oddsData.odds?.[0]?.total;
        }
      } catch (e) {}

      return enrichedGame;
    }));

    let resultGames = enrichedGames;

    // Enrich with pitcher stats
    const pitcherIds = new Set<number>();
    resultGames.forEach(game => {
      if (game.teams.away.probablePitcher?.id) pitcherIds.add(game.teams.away.probablePitcher.id);
      if (game.teams.home.probablePitcher?.id) pitcherIds.add(game.teams.home.probablePitcher.id);
    });

    if (pitcherIds.size > 0) {
      let statsMap: Record<number, string> = {};
      const now = Date.now();
      
      if (pitcherStatsCache && (now - pitcherStatsCache.lastFetched < CACHE_TTL)) {
        statsMap = pitcherStatsCache.data;
      } else {
        statsMap = await fetchPitcherStats(Array.from(pitcherIds));
        pitcherStatsCache = { data: statsMap, lastFetched: now };
      }

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
