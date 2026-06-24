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
        whip?: string;
        wins?: number;
        losses?: number;
        recent?: string;
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
        whip?: string;
        wins?: number;
        losses?: number;
        recent?: string;
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

// Cache for individual pitcher stats to reduce API load
const pitcherStatsCache: Record<number, { stats: any; fetchedAt: number }> = {};
const PITCHER_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Cache for schedule data to handle transient fetch failures
let scheduleCache: {
  data: MLBGame[];
  timestamp: number;
} | null = null;

const SCHEDULE_CACHE_TTL = 60 * 1000; // 1 minute fallback cache

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

  const urlObj = new URL('/api/mlb/schedule', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
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

    // Enrich with boxscores if missing for final games
    const enrichedGames: MLBGame[] = [];
    const batchSize = 3;
    for (let i = 0; i < rawGames.length; i += batchSize) {
      const batch = rawGames.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(async (game) => {
        let enrichedGame = { ...game };

        // 1. Boxscore enrichment
        if (game.status.abstractGameState === 'Final' && (!game.boxscore?.teams.home.pitchers || game.boxscore.teams.home.pitchers.length === 0)) {
          try {
            const boxResponse = await fetch(`/api/mlb/game/${game.gamePk}/boxscore`);
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
          } catch (e) {
            console.error("Weather enrichment failed", e);
          }
        }

        // 3. Over/Under TotalLine enrichment
        try {
          const oddsUrl = `/api/mlb/game/${game.gamePk}/contextMetrics?hydrate=odds`;
          const oddsRes = await fetch(oddsUrl);
          if (oddsRes.ok) {
            const oddsData = await oddsRes.json();
            enrichedGame.totalLine = oddsData.odds?.[0]?.total;
          }
        } catch (e) {}

        return enrichedGame;
      }));
      enrichedGames.push(...batchResults);
    }

    let resultGames = enrichedGames;

    // Enrich with pitcher stats
    const pitcherIdsWithOpponents: { id: number, opponentId: number }[] = [];
    resultGames.forEach(game => {
      if (game.teams.away.probablePitcher?.id) {
        pitcherIdsWithOpponents.push({ 
          id: game.teams.away.probablePitcher.id, 
          opponentId: game.teams.home.team.id 
        });
      }
      if (game.teams.home.probablePitcher?.id) {
        pitcherIdsWithOpponents.push({ 
          id: game.teams.home.probablePitcher.id, 
          opponentId: game.teams.away.team.id 
        });
      }
    });

    if (pitcherIdsWithOpponents.length > 0) {
      const statsMap: Record<number, any> = {};
      const now = Date.now();
      
      const missingPitchers = pitcherIdsWithOpponents.filter(p => {
        const cached = pitcherStatsCache[p.id];
        return !cached || (now - cached.fetchedAt > PITCHER_CACHE_TTL);
      });

      if (missingPitchers.length > 0) {
        const seasonYear = date ? date.split('-')[0] : '2026';
        const fetchedStats = await fetchPitcherStats(missingPitchers, seasonYear);
        
        // Save to cache
        Object.keys(fetchedStats).forEach(idStr => {
          const id = parseInt(idStr, 10);
          pitcherStatsCache[id] = {
            stats: fetchedStats[id],
            fetchedAt: now
          };
        });
      }

      // Populate statsMap from cache
      pitcherIdsWithOpponents.forEach(p => {
        const cached = pitcherStatsCache[p.id];
        if (cached) {
          statsMap[p.id] = cached.stats;
        }
      });

      resultGames = resultGames.map(game => {
        const awayPitcher = game.teams.away.probablePitcher;
        const homePitcher = game.teams.home.probablePitcher;
        
        return {
          ...game,
          teams: {
            ...game.teams,
            away: {
              ...game.teams.away,
              probablePitcher: awayPitcher ? {
                ...awayPitcher,
                ...statsMap[awayPitcher.id]
              } : undefined
            },
            home: {
              ...game.teams.home,
              probablePitcher: homePitcher ? {
                ...homePitcher,
                ...statsMap[homePitcher.id]
              } : undefined
            }
          }
        };
      });
    }

    // Update cache
    if (resultGames.length > 0) {
      scheduleCache = {
        data: resultGames,
        timestamp: Date.now()
      };
      
      try {
        const cacheKey = `mlb_games_cache_${date || startDate || 'default'}`;
        safeLocalStorage.setItem(cacheKey, JSON.stringify({
          data: resultGames,
          timestamp: Date.now()
        }));
      } catch (e) {}
    }

    return resultGames;
  } catch (error) {
    const cacheKey = `mlb_games_cache_${date || startDate || 'default'}`;
    const stored = safeLocalStorage.getItem(cacheKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.warn(`Fetch MLB games failed, using persistent localStorage cache from ${new Date(parsed.timestamp).toISOString()}:`, error);
        return parsed.data;
      } catch (e) {}
    }

    if (scheduleCache && (Date.now() - scheduleCache.timestamp < SCHEDULE_CACHE_TTL * 30)) {
      console.warn('Fetch failed, returning cached data:', error);
      return scheduleCache.data;
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('MLB API Request timed out');
    } else {
      console.warn('Error fetching MLB games (returning empty array):', error);
    }
    return [];
  }
}

async function fetchPitcherStats(pitcherInfo: { id: number, opponentId: number }[], seasonYear: string = '2026'): Promise<Record<number, any>> {
  const statsMap: Record<number, any> = {};
  const pitcherIds = pitcherInfo.map(p => p.id);
  
  // Batch in groups of 50
  const batches = [];
  for (let i = 0; i < pitcherIds.length; i += 50) {
    batches.push(pitcherIds.slice(i, i + 50));
  }

  await Promise.all(batches.map(async (batch) => {
    try {
      // Query without restricting season filter globally to allow robust fallback to prior seasons
      const url = `/api/mlb/people?personIds=${batch.join(',')}&hydrate=stats(group=[pitching],type=[season,yearByYear,gameLog])`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort('PitcherStatsTimeout'), 20000);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) return;
      
      const data = await response.json();
      if (data && data.people) {
        data.people.forEach((person: any) => {
          const stats: any = {};
          
          // Season & yearByYear stats with robust fallback to most recent active season
          let bestSplit: any = null;
          let bestSplitYear = 0;

          if (person.stats) {
            person.stats.forEach((statGroup: any) => {
              const groupName = (statGroup.group?.displayName || statGroup.group?.value || '').toLowerCase();
              
              if (groupName === 'pitching' && statGroup.splits) {
                statGroup.splits.forEach((split: any) => {
                  const splitYear = parseInt(split.season || '0', 10);
                  if (split.stat && splitYear > 0 && splitYear <= parseInt(seasonYear, 10)) {
                    if (splitYear > bestSplitYear) {
                      bestSplit = split;
                      bestSplitYear = splitYear;
                    } else if (splitYear === bestSplitYear && bestSplit) {
                      const curGames = split.stat.gamesPlayed || 0;
                      const prevGames = bestSplit.stat.gamesPlayed || 0;
                      if (curGames > prevGames) {
                        bestSplit = split;
                      }
                    }
                  }
                });
              }
            });
          }

          if (bestSplit?.stat) {
            stats.era = bestSplit.stat.era;
            stats.whip = bestSplit.stat.whip;
            stats.wins = bestSplit.stat.wins;
            stats.losses = bestSplit.stat.losses;
          }

          // Last 3 games from gameLog with robust matching
          const gameLogStats = person.stats?.find((s: any) => {
            const typeName = (s.type?.displayName || s.type?.value || '').toLowerCase();
            const groupName = (s.group?.displayName || s.group?.value || '').toLowerCase();
            return typeName === 'gamelog' && groupName === 'pitching';
          });

          if (gameLogStats?.splits?.length > 0) {
            const lastThree = gameLogStats.splits.slice(-3);
            let totalER = 0;
            let totalOuts = 0;
            
            lastThree.forEach((split: any) => {
              if (split.stat) {
                totalER += split.stat.earnedRuns || 0;
                const ipStr = split.stat.inningsPitched || "0";
                const [whole, partial] = ipStr.split('.');
                totalOuts += (parseInt(whole) || 0) * 3 + (partial ? parseInt(partial) : 0);
              }
            });

            if (totalOuts > 0) {
              const recentEra = (totalER * 9) / (totalOuts / 3);
              stats.recent = recentEra.toFixed(2);
            } else {
              stats.recent = "0.00";
            }
          }
          
          statsMap[person.id] = stats;
        });
      }
    } catch (error) {
      console.error('Error fetching pitcher stats batch:', error);
    }
  }));

  return statsMap;
}
