import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { fetchMLBGames, MLBGame } from './services/mlbService';
import { fetchNHLGames, NHLGame } from './services/nhlService';
import { SIMULATED_GAMES, PRE_SLATE_GAMES, tickSimulatedGames } from './services/nhlMockData';
import { fetchBallparkPalFactors, BallparkPalFactor } from './services/ballparkPalService';
import { calculateLiveThreat, calculateSmartProjection } from './lib/projectionEngine';
import { GrandSalamiHeader } from './components/GrandSalamiHeader';
import { NHLGrandSalamiHeader } from './components/NHLGrandSalamiHeader';
import { NHLGameLog } from './components/NHLGameLog';
import { cn } from './lib/utils';
import { calculateFatigueStats, calculateBullpenScore } from './lib/fatigueEngine';
import { getParkFactor, getTeamOffensePower } from './lib/leagueConstants';
import { GameLog } from './components/GameLog';
import { WagerTracker } from './components/WagerTracker';
import { RunTrends } from './components/RunTrends';
import { NHLGoalTrends } from './components/NHLGoalTrends';
import { BullpenFatigueReport } from './components/BullpenFatigueReport';
import { InfoSection } from './components/InfoSection';
import { DailyApex } from './components/DailyApex';
import { LogoExport } from './components/LogoExport';
import { UserAdminPanel } from './components/UserAdminPanel';
import { WagerHistory } from './components/WagerHistory';
import { FeedbackSection } from './components/FeedbackSection';
import { BallparkPalLogo } from './components/BallparkPalLogo';
import { ParkFactorsReport } from './components/ParkFactorsReport';
import { Leaderboard } from './components/Leaderboard';
import { Calendar, Share2, Droplets, Activity, ExternalLink, Smartphone, LogIn, AlertTriangle, XCircle, RefreshCw, Library, CalendarRange, Eye, CloudSun, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useAuth } from './contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot, doc, getDoc, query, orderBy, getDocs, setDoc } from 'firebase/firestore';
import { format, subDays } from 'date-fns';
import { AnimatePresence, motion } from 'motion/react';
import { safeStorage } from './lib/safeStorage';

const IS_IFRAME = (() => {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.parent;
  } catch (e) {
    return true;
  }
})();

interface StreakStats {
  current: { type: 'WIN' | 'LOSS' | 'PUSH' | null; count: number };
  max: number;
}

function calculateStreakStats(sportWagers: any[], totals: Record<string, number>, voidDates: Record<string, boolean> = {}): StreakStats {
  if (sportWagers.length === 0) return { current: { type: null, count: 0 }, max: 0 };

  const settled = sportWagers.filter(w => totals[w.date] !== undefined || voidDates[w.date]);
  if (settled.length === 0) return { current: { type: null, count: 0 }, max: 0 };

  let currentCount = 0;
  let currentType: 'WIN' | 'LOSS' | 'PUSH' | null = null;
  let hasSetCurrent = false;

  for (let i = 0; i < settled.length; i++) {
    const wager = settled[i];
    if (voidDates[wager.date]) {
      continue;
    }
    const finalTotal = totals[wager.date];
    const isPush = finalTotal === wager.line;
    const isWin = !isPush && (wager.side === 'OVER' ? finalTotal > wager.line : finalTotal < wager.line);
    const result = isWin ? 'WIN' : isPush ? 'PUSH' : 'LOSS';

    if (!hasSetCurrent) {
      currentType = result;
      currentCount = 1;
      hasSetCurrent = true;
    } else if (result === currentType) {
      currentCount++;
    } else {
      break;
    }
  }

  let maxWinStreak = 0;
  let runningWinStreak = 0;

  for (let i = settled.length - 1; i >= 0; i--) {
    const wager = settled[i];
    if (voidDates[wager.date]) {
      continue;
    }
    const finalTotal = totals[wager.date];
    const isPush = finalTotal === wager.line;
    const isWin = !isPush && (wager.side === 'OVER' ? finalTotal > wager.line : finalTotal < wager.line);

    if (isWin) {
      runningWinStreak++;
      if (runningWinStreak > maxWinStreak) {
        maxWinStreak = runningWinStreak;
      }
    } else if (isPush) {
      // Push does not break winning streak
    } else {
      runningWinStreak = 0;
    }
  }

  return {
    current: { type: currentType, count: currentCount },
    max: maxWinStreak
  };
}

export default function App() {
  const { user, profile, isOnline, loading: authLoading } = useAuth();
  const [activeSport, setActiveSport] = useState<'MLB' | 'NHL'>('MLB');
  const [games, setGames] = useState<MLBGame[]>([]);
  const [nhlGames, setNhlGames] = useState<NHLGame[]>([]);
  const [selectedNhlDate, setSelectedNhlDate] = useState<string>('demo');
  const [parkFactors, setParkFactors] = useState<BallparkPalFactor[]>([]);
  const [palConfigured, setPalConfigured] = useState(true);
  const [historicalGames, setHistoricalGames] = useState<MLBGame[]>([]);
  const [historicalNhlGames, setHistoricalNhlGames] = useState<NHLGame[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [gameLines, setGameLines] = useState<Record<number, number>>({});
  const [nhlGameLines, setNhlGameLines] = useState<Record<number, number>>({});
  const [betLine, setBetLine] = useState<number | ''>('');
  const [betType, setBetType] = useState<'over' | 'under'>('over');
  const [isWagerLoading, setIsWagerLoading] = useState(false);
  const [userWagers, setUserWagers] = useState<any[]>([]);
  const [showParkFactors, setShowParkFactors] = useState<boolean>(() => {
    const saved = safeStorage.getItem('salami_show_park_factors');
    return saved !== 'false';
  });
  const [mobileBannerDismissed, setMobileBannerDismissed] = useState(false);
  const [mobileBannerMinimized, setMobileBannerMinimized] = useState(false);

  const handleToggleParkFactors = () => {
    setShowParkFactors(prev => {
      safeStorage.setItem('salami_show_park_factors', String(!prev));
      return !prev;
    });
  };
  
  const isLogoMode = new URLSearchParams(window.location.search).get('logo') === 'true';
  const isFetchingRef = useRef(false);
  const prevMlbScoresRef = useRef<Record<number, { away: number; home: number }>>({});
  const isInitialMlbLoadRef = useRef(true);

  useEffect(() => {
    const q = collection(db, 'gameLines');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lines: Record<number, number> = {};
      snapshot.forEach(doc => {
        lines[parseInt(doc.id)] = doc.data().total;
      });
      setGameLines(lines);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'gameLines');
      } catch (e) {
        // Keep the app working despite the logged error
        console.warn("Failed to stream game lines - verifying connectivity...");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = collection(db, 'nhlGameLines');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lines: Record<number, number> = {};
      snapshot.forEach(doc => {
        lines[parseInt(doc.id)] = doc.data().total;
      });
      setNhlGameLines(lines);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'nhlGameLines');
      } catch (e) {
        console.warn("Failed to stream NHL game lines");
      }
    });

    return () => unsubscribe();
  }, []);

  const loadHistoricalData = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const datesToFetch = [1, 2, 3, 4, 5, 6, 7].map(d => format(subDays(new Date(), d), 'yyyy-MM-dd'));
      
      const mlbPromises = datesToFetch.map(date => fetchMLBGames(date).catch(() => []));
      const nhlPromises = datesToFetch.map(date => fetchNHLGames(date).catch(() => []));
      
      const [mlbResults, nhlResults] = await Promise.all([
        Promise.all(mlbPromises),
        Promise.all(nhlPromises)
      ]);

      const combinedMlbHistory = mlbResults.flat();
      const combinedNhlHistory = nhlResults.flat();

      // Filter out only the postponed San Francisco Giants @ Atlanta Braves game on 2026-06-16
      const filteredMlbHistory = (combinedMlbHistory || []).filter(game => {
        if (!game) return false;
        const gameDateStr = game.officialDate;
        const isTargetDate = gameDateStr === '2026-06-16';
        const isGiantsBraves = (
          (game.teams?.home?.team?.id === 115 && game.teams?.away?.team?.id === 94) ||
          (game.teams?.home?.team?.id === 94 && game.teams?.away?.team?.id === 115) ||
          (game.teams?.home?.team?.name?.toLowerCase().includes('braves') && game.teams?.away?.team?.name?.toLowerCase().includes('giants')) ||
          (game.teams?.home?.team?.name?.toLowerCase().includes('giants') && game.teams?.away?.team?.name?.toLowerCase().includes('braves'))
        );
        return !(isTargetDate && isGiantsBraves);
      });

      setHistoricalGames(filteredMlbHistory);
      setHistoricalNhlGames(combinedNhlHistory || []);
    } catch (error) {
      console.error('Error loading historical data:', error);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadLiveData = useCallback(async (forced = false) => {
    if (isFetchingRef.current && !forced) return;
    
    isFetchingRef.current = true;
    if (forced) setIsRefreshing(true);
    
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const nhlDateStr = (selectedNhlDate === 'today' || selectedNhlDate === 'demo' || selectedNhlDate === 'pre-slate') 
        ? today 
        : selectedNhlDate;

      const results = await Promise.allSettled([
        fetchMLBGames(today),
        (selectedNhlDate === 'demo' || selectedNhlDate === 'pre-slate') ? Promise.resolve([]) : fetchNHLGames(nhlDateStr),
        fetchBallparkPalFactors(today)
      ]);
      
      const mlbResult = results[0].status === 'fulfilled' ? results[0].value : [];
      const nhlResult = results[1].status === 'fulfilled' ? results[1].value : [];
      const palResult = results[2].status === 'fulfilled' ? results[2].value : [];

      if (results[2].status === 'rejected') {
        setPalConfigured(false);
        const errorMsg = results[2].reason?.message || '';
        console.warn('Ballpark Pal Data Unavailable:', errorMsg);
      } else {
        setPalConfigured(true);
      }
      
      // Filter out only the postponed Giants @ Braves game from June 16, 2026
      const filteredMlbResult = (mlbResult || []).filter(game => {
        if (!game) return false;
        const gameDateStr = game.officialDate;
        const isTargetDate = gameDateStr === '2026-06-16';
        const isGiantsBraves = (
          (game.teams?.home?.team?.id === 115 && game.teams?.away?.team?.id === 94) ||
          (game.teams?.home?.team?.id === 94 && game.teams?.away?.team?.id === 115) ||
          (game.teams?.home?.team?.name?.toLowerCase().includes('braves') && game.teams?.away?.team?.name?.toLowerCase().includes('giants')) ||
          (game.teams?.home?.team?.name?.toLowerCase().includes('giants') && game.teams?.away?.team?.name?.toLowerCase().includes('braves'))
        );
        return !(isTargetDate && isGiantsBraves);
      });

      setGames(filteredMlbResult);
      if (selectedNhlDate !== 'demo' && selectedNhlDate !== 'pre-slate') {
        setNhlGames(nhlResult || []);
      }
      setParkFactors(palResult || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error in loadLiveData:', error);
      if (forced) toast.error('Error loading live game data.');
    } finally {
      isFetchingRef.current = false;
      setIsRefreshing(false);
      setIsInitialLoad(false);
    }
  }, [selectedNhlDate, loadHistoricalData]);

  useEffect(() => {
    loadHistoricalData();
    loadLiveData(true);
    
    // Original 1-minute heartbeat (silent background updates)
    const interval = setInterval(() => {
      loadLiveData();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [loadHistoricalData, loadLiveData]);

  // NHL Demo Ticker Effect
  useEffect(() => {
    if (selectedNhlDate !== 'demo') return;
    
    // Initialize standard simulation on activation
    setNhlGames(JSON.parse(JSON.stringify(SIMULATED_GAMES)));
    
    const interval = setInterval(() => {
      setNhlGames(prev => {
        const ticked = tickSimulatedGames(prev);
        // Toast about dramatic goals - Suppressed if active tab is MLB
        ticked.forEach((game, idx) => {
          const prevGame = prev[idx];
          if (prevGame) {
            const prevAway = prevGame.awayTeam?.score || 0;
            const prevHome = prevGame.homeTeam?.score || 0;
            const newAway = game.awayTeam?.score || 0;
            const newHome = game.homeTeam?.score || 0;
            if (newAway > prevAway) {
              if (activeSport === 'NHL') {
                toast(`🚨 GOAL! ${game.awayTeam.abbrev} scores! It's now ${newAway}-${newHome} vs ${game.homeTeam.abbrev}`, {
                  icon: '🏒',
                  duration: 4000
                });
              }
            } else if (newHome > prevHome) {
              if (activeSport === 'NHL') {
                toast(`🚨 GOAL! ${game.homeTeam.abbrev} scores! It's now ${newAway}-${newHome} vs ${game.awayTeam.abbrev}`, {
                  icon: '🏒',
                  duration: 4000
                });
              }
            }
          }
        });
        return ticked;
      });
    }, 3000); // tick every 3 seconds for active simulation
    
    return () => clearInterval(interval);
  }, [selectedNhlDate, activeSport]);

  // NHL Pre-slate Simulation Effect
  useEffect(() => {
    if (selectedNhlDate !== 'pre-slate') return;
    
    // Initialize standard scheduled games
    setNhlGames(JSON.parse(JSON.stringify(PRE_SLATE_GAMES)));
  }, [selectedNhlDate]);

  // MLB Run Scored Alerts System
  useEffect(() => {
    if (!games || games.length === 0) return;

    if (isInitialMlbLoadRef.current) {
      const initialScores: Record<number, { away: number; home: number }> = {};
      games.forEach(g => {
        initialScores[g.gamePk] = {
          away: g.teams?.away?.score || 0,
          home: g.teams?.home?.score || 0
        };
      });
      prevMlbScoresRef.current = initialScores;
      isInitialMlbLoadRef.current = false;
      return;
    }

    games.forEach(g => {
      const prev = prevMlbScoresRef.current[g.gamePk];
      if (prev) {
        const currentAway = g.teams?.away?.score || 0;
        const currentHome = g.teams?.home?.score || 0;

        const awayDiff = currentAway - prev.away;
        const homeDiff = currentHome - prev.home;

        if (awayDiff > 0 || homeDiff > 0) {
          try {
            const enabledNotifs = JSON.parse(safeStorage.getItem('salami_individual_game_notifs') || '{}');
            if (enabledNotifs[g.gamePk]) {
              let scoringTeam = '';
              let scoreMsg = '';

              if (awayDiff > 0 && homeDiff > 0) {
                scoringTeam = 'Both teams';
                scoreMsg = `scored runs! Now ${g.teams?.away?.team?.name || 'Away'} ${currentAway} - ${currentHome} ${g.teams?.home?.team?.name || 'Home'}`;
              } else if (awayDiff > 0) {
                scoringTeam = g.teams?.away?.team?.name || 'Away Team';
                scoreMsg = `scored a run! Now ${g.teams?.away?.team?.name || 'Away'} ${currentAway} - ${currentHome} ${g.teams?.home?.team?.name || 'Home'}`;
              } else {
                scoringTeam = g.teams?.home?.team?.name || 'Home Team';
                scoreMsg = `scored a run! Now ${g.teams?.away?.team?.name || 'Away'} ${currentAway} - ${currentHome} ${g.teams?.home?.team?.name || 'Home'}`;
              }

              const title = `⚾ MLB Run Scored: ${g.venue?.name || 'Salami Tracker'}`;
              const body = `${scoringTeam} ${scoreMsg}`;

              // 1. In-App Toast
              toast.success(body, {
                icon: '⚾',
                duration: 6000
              });

              // 2. Real Browser Notification
              if ("Notification" in window && Notification.permission === "granted") {
                const options = {
                  body,
                  icon: 'https://cdn-icons-png.flaticon.com/512/3515/3515320.png',
                  tag: `salami-run-scored-${g.gamePk}-${Date.now()}`
                };

                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistration().then(reg => {
                    if (reg && 'showNotification' in reg) {
                      reg.showNotification(title, options);
                    } else {
                      try {
                        new Notification(title, options);
                      } catch (err) {
                        console.warn('App Notification standard constructor fallback failed:', err);
                      }
                    }
                  }).catch(() => {
                    try {
                      new Notification(title, options);
                    } catch (err) {
                      console.warn('App Notification standard constructor fallback catch failed:', err);
                    }
                  });
                } else {
                  try {
                    new Notification(title, options);
                  } catch (err) {
                    console.warn('App Notification constructor failed:', err);
                  }
                }
              }
            }
          } catch (e) {
            console.error('Error handling game scored notification:', e);
          }
        }
      }

      // Update current score ref
      prevMlbScoresRef.current[g.gamePk] = {
        away: g.teams?.away?.score || 0,
        home: g.teams?.home?.score || 0
      };
    });
  }, [games]);

  const [todayStr] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  const currentTotal = useMemo(() => {
    if (activeSport === 'MLB') {
      if (!Array.isArray(games)) return 0;
      return games.reduce((acc, game) => {
        if (game.officialDate && game.officialDate !== todayStr) return acc;
        const detailedState = (game.status?.detailedState || '').toLowerCase();
        const statusCode = (game.status?.statusCode || '').toUpperCase();
        const isPostponed = detailedState.includes('postponed') || 
                            detailedState.includes('canceled') || 
                            detailedState.includes('cancelled') || 
                            statusCode === 'C' || 
                            statusCode === 'CD' || 
                            statusCode === 'PPD' || 
                            statusCode === 'CNCL';
        if (isPostponed) return acc;
        const awayScore = game?.teams?.away?.score || 0;
        const homeScore = game?.teams?.home?.score || 0;
        return acc + awayScore + homeScore;
      }, 0);
    } else {
      if (!Array.isArray(nhlGames)) return 0;
      return nhlGames.reduce((acc, game) => {
        const awayScore = game.awayTeam?.score || 0;
        const homeScore = game.homeTeam?.score || 0;
        return acc + awayScore + homeScore;
      }, 0);
    }
  }, [games, nhlGames, activeSport, todayStr]);

  const homeTotal = useMemo(() => {
    if (activeSport === 'MLB') {
      if (!Array.isArray(games)) return 0;
      return games.reduce((acc, game) => {
        if (game.officialDate && game.officialDate !== todayStr) return acc;
        const detailedState = (game.status?.detailedState || '').toLowerCase();
        const statusCode = (game.status?.statusCode || '').toUpperCase();
        const isPostponed = detailedState.includes('postponed') || 
                            detailedState.includes('canceled') || 
                            detailedState.includes('cancelled') || 
                            statusCode === 'C' || 
                            statusCode === 'CD' || 
                            statusCode === 'PPD' || 
                            statusCode === 'CNCL';
        if (isPostponed) return acc;
        return acc + (game?.teams?.home?.score || 0);
      }, 0);
    } else {
      if (!Array.isArray(nhlGames)) return 0;
      return nhlGames.reduce((acc, game) => {
        return acc + (game.homeTeam?.score || 0);
      }, 0);
    }
  }, [games, nhlGames, activeSport, todayStr]);

  const awayTotal = useMemo(() => {
    if (activeSport === 'MLB') {
      if (!Array.isArray(games)) return 0;
      return games.reduce((acc, game) => {
        if (game.officialDate && game.officialDate !== todayStr) return acc;
        const detailedState = (game.status?.detailedState || '').toLowerCase();
        const statusCode = (game.status?.statusCode || '').toUpperCase();
        const isPostponed = detailedState.includes('postponed') || 
                            detailedState.includes('canceled') || 
                            detailedState.includes('cancelled') || 
                            statusCode === 'C' || 
                            statusCode === 'CD' || 
                            statusCode === 'PPD' || 
                            statusCode === 'CNCL';
        if (isPostponed) return acc;
        return acc + (game?.teams?.away?.score || 0);
      }, 0);
    } else {
      if (!Array.isArray(nhlGames)) return 0;
      return nhlGames.reduce((acc, game) => {
        return acc + (game.awayTeam?.score || 0);
      }, 0);
    }
  }, [games, nhlGames, activeSport, todayStr]);

  const nhlStats = useMemo(() => {
    if (activeSport !== 'NHL' || !Array.isArray(nhlGames)) return null;
    const final = nhlGames.filter(g => g.gameState === 'FINAL' || g.gameState === 'OFF').length;
    const live = nhlGames.filter(g => g.gameState === 'LIVE' || g.gameState === 'CRIT').length;
    
    let playedPeriods = 0;
    nhlGames.forEach(game => {
      if (game.gameState === 'FINAL' || game.gameState === 'OFF') {
        playedPeriods += 3;
      } else if (game.gameState === 'LIVE' || game.gameState === 'CRIT') {
        const period = game.periodDescriptor?.number || 1;
        playedPeriods += (period - 1);
        // Add clock progress if available
        if (game.clock?.timeRemaining) {
          const [min, sec] = game.clock.timeRemaining.split(':').map(Number);
          if (!isNaN(min)) {
            const remainingSec = (min * 60) + (sec || 0);
            const totalSec = 20 * 60; // 20 min periods
            playedPeriods += (totalSec - remainingSec) / totalSec;
          }
        }
      }
    });

    return {
      finalCount: final,
      liveCount: live,
      gameCount: nhlGames.length,
      playedPeriods,
      totalExpectedPeriods: nhlGames.length * 3,
      isFinished: final === nhlGames.length && nhlGames.length > 0
    };
  }, [nhlGames, activeSport]);

  const stats = useMemo(() => {
    if (!Array.isArray(games) || games.length === 0) {
      return {
        finalCount: 0,
        liveCount: 0,
        gameCount: 0,
        totalExpectedInnings: 0,
        playedInnings: 0,
        isFinished: false,
        liveThreats: 0,
        weatherSummary: null,
        fatigue: { maxFatigueCount: 0, highFatigueCount: 0 },
        leagueMetrics: null
      };
    }

    // Filter out games that won't be played or are from the wrong day
    const activeGames = games.filter(g => {
      const state = (g.status?.detailedState || '').toLowerCase();
      const statusCode = (g.status?.statusCode || '').toUpperCase();
      const isWrongDay = g.officialDate && g.officialDate !== todayStr;
      const isPostponed = state.includes('postponed') || 
                          state.includes('canceled') || 
                          state.includes('cancelled') || 
                          statusCode === 'C' || 
                          statusCode === 'CD' || 
                          statusCode === 'PPD' || 
                          statusCode === 'CNCL';
      return !isPostponed && !isWrongDay;
    });

    if (activeGames.length === 0) {
      return {
        finalCount: 0,
        liveCount: 0,
        totalExpectedInnings: 0,
        playedInnings: 0,
        isFinished: false,
        liveThreats: 0,
        weatherSummary: null,
        fatigue: { maxFatigueCount: 0, highFatigueCount: 0 },
        leagueMetrics: null
      };
    }

    const final = activeGames.filter(g => g?.status?.abstractGameState === 'Final').length;
    const live = activeGames.filter(g => g?.status?.abstractGameState === 'Live').length;
    
    const isActuallyFinished = final === activeGames.length && activeGames.length > 0;
    
    // Default to 9 innings per game
    const totalExpected = activeGames.length * 9;
    let liveThreats = 0;

    const played = activeGames.reduce((acc, game) => {
      if (!game?.status) return acc;
      
      if (game.status.abstractGameState === 'Final') {
        const finalInnings = game.linescore?.innings?.length || 9;
        return acc + finalInnings;
      }

      if (game.status.abstractGameState === 'Live') {
        const inning = game.linescore?.currentInning || 1;
        const isTop = game.linescore?.isTopInning ?? true;

        const offense = game.linescore?.offense;
        const hasRunners = !!offense?.first || !!offense?.second || !!offense?.third;
        const outs = game.linescore?.outs || 0;
        
        if (offense && hasRunners) {
          let threatVal = calculateLiveThreat({
            first: !!offense.first,
            second: !!offense.second,
            third: !!offense.third,
            outs
          });

          // High Leverage Calibration: Boost threat value if < 2 outs with runners
          // This factors in the increased probability of situational scoring (sac flies, productive outs)
          if (outs < 2) {
            threatVal *= 1.2; 
          }

          liveThreats += threatVal;
        }

        return acc + (inning - 1) + (isTop ? 0.25 : 0.75);
      }
      return acc;
    }, 0);

    // Multi-component Weather Summary
    const gamesWithWeather = activeGames.filter(g => g?.weather?.temp && g?.weather?.wind);
    let weatherSummary = null;
    if (gamesWithWeather.length > 0) {
      const avgTemp = Math.round(gamesWithWeather.reduce((acc, g) => acc + (parseInt(g.weather!.temp) || 0), 0) / gamesWithWeather.length);
      const highWindGames = gamesWithWeather.filter(g => {
        const windStr = g.weather?.wind || '';
        const windMatch = windStr.match(/\d+/);
        const windSpeed = windMatch ? parseInt(windMatch[0]) : 0;
        return windSpeed > 12;
      }).length;
      weatherSummary = { avgTemp, highWindGames };
    }

    // Fatigue Analysis for Model
    const fatigue = calculateFatigueStats(historicalGames, activeGames);

    // League Metrics (Park Factors & Team Offense)
    let leagueMetrics = null;
    if (activeGames.length > 0) {
      const parkTotal = activeGames.reduce((acc, g) => acc + getParkFactor(g.venue?.name || ''), 0);
      const offenseTotal = activeGames.reduce((acc, g) => {
        const awayPower = getTeamOffensePower(g.teams.away.team.name);
        const homePower = getTeamOffensePower(g.teams.home.team.name);
        return acc + (awayPower + homePower) / 2;
      }, 0);
      
      leagueMetrics = {
        avgParkFactor: parkTotal / activeGames.length,
        avgTeamOffense: offenseTotal / activeGames.length
      };
    }

    const rainKeywords = ['rain', 'shower', 'storm', 'drizzle', 'precip', 'thunder', 'lightning', 'mist'];
    
    return {
      finalCount: final,
      liveCount: live,
      gameCount: activeGames.length,
      totalExpectedInnings: totalExpected,
      playedInnings: Math.min(played, totalExpected + 10), 
      liveThreats,
      weatherSummary,
      fatigue,
      leagueMetrics,
      isFinished: isActuallyFinished,
      hasRainRisk: activeGames.some(g => {
        const cond = g.weather?.condition?.toLowerCase() || '';
        const status = (g.status?.detailedState || '').toLowerCase();
        const statusCode = g.status?.statusCode?.toUpperCase() || '';
        const isRainy = rainKeywords.some(keyword => cond.includes(keyword));
        const isDelay = status.includes('delay') || statusCode === 'D' || statusCode === 'DR' || statusCode === 'DI';
        const isDelayedAndOvercast = isDelay && (cond.includes('overcast') || cond.includes('cloud') || isRainy);
        return isRainy || isDelayedAndOvercast;
      })
    };
  }, [games, historicalGames]);

  // Group historical games by date for results with robust de-duplication
  const mlbHistoricalTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    const seenGames = new Set<string>();
    const uniqueMlbGames = historicalGames.filter(g => {
      const key = `${g.gamePk}_${g.officialDate || ''}`;
      if (!g.gamePk || seenGames.has(key)) return false;
      seenGames.add(key);
      return true;
    });
    
    // Group games by date first
    const gamesByDate: Record<string, typeof uniqueMlbGames> = {};
    uniqueMlbGames.forEach(game => {
      const date = game.officialDate || format(new Date(game.gameDate), 'yyyy-MM-dd');
      if (!gamesByDate[date]) {
        gamesByDate[date] = [];
      }
      gamesByDate[date].push(game);
    });

    // Populate total runs for a date only if there is at least one game, 
    // and all of them are finished (not active or preview)
    Object.entries(gamesByDate).forEach(([date, dateGames]) => {
      const hasPreviewOrLive = dateGames.some(g => {
        const state = g.status?.abstractGameState;
        return state === 'Preview' || state === 'Live';
      });

      const hasFinal = dateGames.some(g => {
        const state = g.status?.abstractGameState;
        return state === 'Final';
      });

      if (hasFinal && !hasPreviewOrLive) {
        let totalRuns = 0;
        dateGames.forEach(g => {
          totalRuns += (g.teams.away.score || 0) + (g.teams.home.score || 0);
        });
        totals[date] = totalRuns;
      }
    });

    return totals;
  }, [historicalGames]);

  const nhlHistoricalTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    const seenGames = new Set<number>();
    const uniqueNhlGames = historicalNhlGames.filter(g => {
      if (!g.id || seenGames.has(g.id)) return false;
      seenGames.add(g.id);
      return true;
    });

    // Group games by date first
    const gamesByDate: Record<string, typeof uniqueNhlGames> = {};
    uniqueNhlGames.forEach(game => {
      const date = game.gameDate ? game.gameDate.split('T')[0] : '';
      if (date) {
        if (!gamesByDate[date]) {
          gamesByDate[date] = [];
        }
        gamesByDate[date].push(game);
      }
    });

    // Populate total goals for a date only if there is at least one game,
    // and all of them are finished (not PRE, LIVE, or CRIT)
    Object.entries(gamesByDate).forEach(([date, dateGames]) => {
      const hasPreviewOrLive = dateGames.some(g => {
        const state = g.gameState;
        return state === 'PRE' || state === 'LIVE' || state === 'CRIT';
      });

      const hasFinalOrOff = dateGames.some(g => {
        const state = g.gameState;
        return state === 'FINAL' || state === 'OFF';
      });

      if (hasFinalOrOff && !hasPreviewOrLive) {
        let totalGoals = 0;
        dateGames.forEach(g => {
          totalGoals += (g.awayTeam?.score || 0) + (g.homeTeam?.score || 0);
        });
        totals[date] = totalGoals;
      }
    });

    return totals;
  }, [historicalNhlGames]);

  const historicalTotals = useMemo(() => {
    const totals = { ...(activeSport === 'MLB' ? mlbHistoricalTotals : nhlHistoricalTotals) };
    const isTodayFinished = activeSport === 'MLB' ? stats.isFinished : (nhlStats?.isFinished ?? false);
    if (isTodayFinished) {
      totals[todayStr] = currentTotal;
    }
    return totals;
  }, [mlbHistoricalTotals, nhlHistoricalTotals, activeSport, stats.isFinished, nhlStats?.isFinished, todayStr, currentTotal]);

  const mlbVoidDates = useMemo(() => {
    const voids: Record<string, boolean> = {};
    const seenPks = new Set<string>();
    const uniqueMlbGames = historicalGames.concat(games).filter(g => {
      const key = `${g.gamePk}_${g.officialDate || ''}`;
      if (!g.gamePk || seenPks.has(key)) return false;
      seenPks.add(key);
      return true;
    });

    uniqueMlbGames.forEach(g => {
      const date = g.officialDate || (g.gameDate ? format(new Date(g.gameDate), "yyyy-MM-dd") : "");
      if (!date) return;
      const state = (g.status?.detailedState || "").toLowerCase();
      const statusCode = g.status?.statusCode?.toUpperCase() || "";
      const isPostponed = state.includes("postponed") || state.includes("canceled") || state.includes("cancelled") || statusCode === "C" || statusCode === "CD" || statusCode === "PPD" || statusCode === "CNCL";
      if (isPostponed) {
        voids[date] = true;
      }
    });

    // Explicitly mark the postponed game on 2026-06-16 as voided
    voids['2026-06-16'] = true;

    // Yesterday shouldn't be voided
    delete voids['2026-06-21'];

    return voids;
  }, [historicalGames, games]);

  const nhlVoidDates = useMemo(() => {
    const voids: Record<string, boolean> = {};
    const seenIds = new Set<number>();
    const uniqueNhlGames = historicalNhlGames.concat(nhlGames).filter(g => {
      if (!g.id || seenIds.has(g.id)) return false;
      seenIds.add(g.id);
      return true;
    });

    uniqueNhlGames.forEach(g => {
      const date = g.gameDate ? g.gameDate.split("T")[0] : "";
      if (!date) return;
      const scheduleState = (g as any).gameScheduleState || "";
      const isPostponed = scheduleState === "PPD" || scheduleState === "CNCL" || (g as any).gameState === "PPD" || (g as any).gameState === "CNCL";
      if (isPostponed) {
        voids[date] = true;
      }
    });
    return voids;
  }, [historicalNhlGames, nhlGames]);

  const voidDates = useMemo(() => {
    return activeSport === "MLB" ? mlbVoidDates : nhlVoidDates;
  }, [mlbVoidDates, nhlVoidDates, activeSport]);

  // Dynamic prefetch of older historical wagers' dates to ensure historical totals are complete
  const fetchedDatesRef = useRef<Set<string>>(new Set());

  // Populate fetchedDatesRef with the standard last 7 days since those are fetched initially
  useEffect(() => {
    const dates = [1, 2, 3, 4, 5, 6, 7].map(d => format(subDays(new Date(), d), 'yyyy-MM-dd'));
    dates.forEach(d => {
      fetchedDatesRef.current.add(`MLB_${d}`);
      fetchedDatesRef.current.add(`NHL_${d}`);
    });
  }, []);

  useEffect(() => {
    if (userWagers.length === 0) return;

    const fetchUniqueWagerDates = async () => {
      const mlbDatesToFetch: string[] = [];
      const nhlDatesToFetch: string[] = [];

      userWagers.forEach(wager => {
        const sport = (wager.sport || 'MLB').toUpperCase();
        const dateKey = `${sport}_${wager.date}`;
        
        if (!fetchedDatesRef.current.has(dateKey)) {
          fetchedDatesRef.current.add(dateKey);
          if (sport === 'MLB') {
            mlbDatesToFetch.push(wager.date);
          } else if (sport === 'NHL') {
            nhlDatesToFetch.push(wager.date);
          }
        }
      });

      if (mlbDatesToFetch.length === 0 && nhlDatesToFetch.length === 0) return;

      try {
        if (mlbDatesToFetch.length > 0) {
          const results = await Promise.all(
            mlbDatesToFetch.map(date => fetchMLBGames(date))
          );
          const rawNewGames = results.flat().filter(Boolean);
          const newGames = rawNewGames.filter(game => {
            if (!game) return false;
            const gameDateStr = game.officialDate;
            const isTargetDate = gameDateStr === '2026-06-16';
            const isGiantsBraves = (
              (game.teams?.home?.team?.id === 115 && game.teams?.away?.team?.id === 94) ||
              (game.teams?.home?.team?.id === 94 && game.teams?.away?.team?.id === 115) ||
              (game.teams?.home?.team?.name?.toLowerCase().includes('braves') && game.teams?.away?.team?.name?.toLowerCase().includes('giants')) ||
              (game.teams?.home?.team?.name?.toLowerCase().includes('giants') && game.teams?.away?.team?.name?.toLowerCase().includes('braves'))
            );
            return !(isTargetDate && isGiantsBraves);
          });
          if (newGames.length > 0) {
            setHistoricalGames(prev => {
              const combined = [...prev, ...newGames];
              const unique = Array.from(new Map(combined.map(g => [`${g.gamePk}_${g.officialDate || ''}`, g])).values());
              return unique;
            });
          }
        }

        if (nhlDatesToFetch.length > 0) {
          const results = await Promise.all(
            nhlDatesToFetch.map(date => fetchNHLGames(date))
          );
          const newGames = results.flat().filter(Boolean);
          if (newGames.length > 0) {
            setHistoricalNhlGames(prev => {
              const combined = [...prev, ...newGames];
              const unique = Array.from(new Map(combined.map(g => [g.id, g])).values());
              return unique;
            });
          }
        }
      } catch (error) {
        console.error('Error fetching older wager historical scores:', error);
      }
    };

    fetchUniqueWagerDates();
  }, [userWagers]);

  // Load Wager Data in real-time for global access and leaderboard sync
  useEffect(() => {
    if (!user) {
      setUserWagers(prev => prev.length > 0 ? [] : prev);
      return;
    }

    setIsWagerLoading(true);
    const wagersRef = collection(db, 'users', user.uid, 'wagers');
    const q = query(wagersRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedWagers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setUserWagers(fetchedWagers);
      setIsWagerLoading(false);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/wagers`);
      } catch (e) {
        console.warn("Failed to stream real-time user wagers:", e);
      }
      setIsWagerLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Load initial local wager into userWagers state for logged out users on load/sport change
  useEffect(() => {
    if (user) return; // Managed by Firestore real-time snapshot listener instead

    const today = format(new Date(), 'yyyy-MM-dd');
    const savedLine = safeStorage.getItem(`${activeSport}_salami_bet_line`);
    const savedType = safeStorage.getItem(`${activeSport}_salami_bet_type`);
    const savedDate = safeStorage.getItem(`${activeSport}_salami_bet_date`);

    if (savedDate === today && savedLine) {
      const lineVal = parseFloat(savedLine);
      const isOver = (savedType || 'over').toUpperCase() === 'OVER';
      setUserWagers(prev => {
        const hasWager = prev.some(w => 
          w.id === `${activeSport}_${today}` && 
          w.line === lineVal && 
          w.side === (isOver ? 'OVER' : 'UNDER')
        );
        if (hasWager && prev.length === 1) return prev;
        return [
          {
            id: `${activeSport}_${today}`,
            line: lineVal,
            side: isOver ? 'OVER' : 'UNDER',
            date: today,
            sport: activeSport,
            createdAt: new Date().toISOString()
          }
        ];
      });
    } else {
      setUserWagers(prev => {
        if (prev.length > 0) return [];
        return prev;
      });
    }
  }, [user, activeSport]);

  // Synchronize local input state (betLine, betType) with today's wager from db/cache
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (user) {
      const todayWager = userWagers.find(w => w.date === today && (w.sport || 'MLB').toUpperCase() === activeSport.toUpperCase());
      if (todayWager) {
        setBetLine(todayWager.line);
        setBetType(todayWager.side.toLowerCase() as 'over' | 'under');
        
        // Sync/Cache to safeStorage so it is available immediately on reload
        safeStorage.setItem(`${activeSport}_salami_bet_line`, todayWager.line.toString());
        safeStorage.setItem(`${activeSport}_salami_bet_type`, todayWager.side.toLowerCase());
        safeStorage.setItem(`${activeSport}_salami_bet_date`, today);
      } else {
        // Keep the local betLine if there is one for today instead of blindly resetting to ''
        const savedLine = safeStorage.getItem(`${activeSport}_salami_bet_line`);
        const savedType = safeStorage.getItem(`${activeSport}_salami_bet_type`);
        const savedDate = safeStorage.getItem(`${activeSport}_salami_bet_date`);
        if (savedLine && savedDate === today) {
          setBetLine(parseFloat(savedLine));
          if (savedType) setBetType(savedType as 'over' | 'under');
        } else {
          setBetLine(''); // Reset if no local or cloud wager today for this sport
        }
      }
    } else {
      const savedLine = safeStorage.getItem(`${activeSport}_salami_bet_line`);
      const savedType = safeStorage.getItem(`${activeSport}_salami_bet_type`);
      const savedDate = safeStorage.getItem(`${activeSport}_salami_bet_date`);
      
      if (savedDate && savedDate !== today) {
        // It's a past wager, WagerTracker will handle settlement notification
        // but we shouldn't show it as today's active wager
        setBetLine('');
      } else {
        if (savedLine) {
          const lineVal = parseFloat(savedLine);
          setBetLine(lineVal);
          if (savedType) setBetType(savedType as 'over' | 'under');
        } else {
          setBetLine('');
        }
      }
    }
  }, [user, userWagers, activeSport]);

  const activeUserWagers = useMemo(() => {
    return userWagers.filter(w => (w.sport || 'MLB').toUpperCase() === activeSport.toUpperCase());
  }, [userWagers, activeSport]);

  const handleSaveWager = useCallback((savedWager: any) => {
    setUserWagers(prev => {
      const filtered = prev.filter(w => w.id !== savedWager.id);
      return [savedWager, ...filtered];
    });
  }, []);

  const handleClearWager = useCallback((wagerId: string) => {
    setUserWagers(prev => prev.filter(w => w.id !== wagerId));
  }, []);

  const handleDeleteWager = useCallback((wagerId: string) => {
    setUserWagers(prev => prev.filter(w => w.id !== wagerId));
    const today = format(new Date(), 'yyyy-MM-dd');
    if (wagerId === `${activeSport}_${today}`) {
      setBetLine('');
    }
  }, [activeSport]);

  const currentStreak = useMemo(() => {
    if (activeUserWagers.length === 0) return null;
    
    const settled = activeUserWagers.filter(w => historicalTotals[w.date] !== undefined || voidDates[w.date]);
    if (settled.length === 0) return null;

    let streakCount = 0;
    let streakType: 'WIN' | 'LOSS' | 'PUSH' | null = null;
    let hasSetCurrent = false;

    for (let i = 0; i < settled.length; i++) {
        const wager = settled[i];
        if (voidDates[wager.date]) {
            continue;
        }
        const finalTotal = historicalTotals[wager.date];
        const isPush = finalTotal === wager.line;
        const isWin = !isPush && (wager.side === 'OVER' ? finalTotal > wager.line : finalTotal < wager.line);
        const result = isWin ? 'WIN' : isPush ? 'PUSH' : 'LOSS';

        if (!hasSetCurrent) {
            streakType = result as any;
            streakCount = 1;
            hasSetCurrent = true;
        } else if (result === streakType) {
            streakCount++;
        } else {
            break;
        }
    }

    if (!hasSetCurrent) return null;

    return { type: streakType as any, count: streakCount };
  }, [activeUserWagers, historicalTotals, voidDates]);

  // Synchronize streak leaderboard information
  const calculatedLeaderboardData = useMemo(() => {
    if (!user) return null;

    const mlbWagers = userWagers.filter(w => (w.sport || 'MLB').toUpperCase() === 'MLB');
    const nhlWagers = userWagers.filter(w => (w.sport || 'MLB').toUpperCase() === 'NHL');

    const mlbStats = calculateStreakStats(mlbWagers, mlbHistoricalTotals, mlbVoidDates);
    const nhlStats = calculateStreakStats(nhlWagers, nhlHistoricalTotals, nhlVoidDates);

    return {
      userId: user.uid,
      displayName: profile?.displayName || user.displayName || 'Anonymous Salami Bettor',
      mlbStreak: mlbStats.current.type === 'WIN' ? mlbStats.current.count : 0,
      mlbMaxStreak: mlbStats.max,
      nhlStreak: nhlStats.current.type === 'WIN' ? nhlStats.current.count : 0,
      nhlMaxStreak: nhlStats.max,
    };
  }, [user, profile, userWagers, mlbHistoricalTotals, nhlHistoricalTotals, mlbVoidDates, nhlVoidDates]);

  useEffect(() => {
    if (!calculatedLeaderboardData || !user) return;

    const syncLeaderboard = async () => {
      try {
        const docRef = doc(db, 'leaderboard', user.uid);
        const cacheString = JSON.stringify(calculatedLeaderboardData);
        const cacheKey = `leaderboard_sync_cache_${user.uid}`;
        if (safeStorage.getItem(cacheKey) === cacheString) {
          return;
        }

        await setDoc(docRef, {
          ...calculatedLeaderboardData,
          updatedAt: new Date().toISOString(),
        }, { merge: true });

        safeStorage.setItem(cacheKey, cacheString);
      } catch (error) {
        console.error('Error syncing leaderboard stats:', error);
      }
    };

    const handler = setTimeout(syncLeaderboard, 2000);
    return () => clearTimeout(handler);
  }, [calculatedLeaderboardData, user]);

  const projectedTotal = useMemo(() => {
    if (activeSport === 'MLB') {
      // Requirement for stabilization: at least 1 full inning cumulative across the slate
      if (stats.playedInnings >= 1.0) {
        const fatigueScore = calculateBullpenScore(stats.fatigue);
        
        return calculateSmartProjection(
          currentTotal, 
          stats.playedInnings, 
          stats.totalExpectedInnings, 
          stats.liveThreats,
          fatigueScore,
          betLine
        );
      }
    } else if (activeSport === 'NHL') {
      if (nhlStats && nhlStats.playedPeriods >= 0.5) {
        // Simple linear projection for NHL
        return Math.round((currentTotal / nhlStats.playedPeriods) * nhlStats.totalExpectedPeriods);
      }
    }
    return null;
  }, [currentTotal, stats.playedInnings, stats.totalExpectedInnings, stats.liveThreats, stats.fatigue, betLine, activeSport, nhlStats]);

  const isAdmin = user?.email?.toLowerCase() === 'mattlajiness@gmail.com';

  if (isLogoMode) {
    return <LogoExport />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
            <div className="absolute inset-0 border-4 border-salami-red rounded-full border-t-transparent animate-spin" />
          </div>
          <span className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-[0.3em]">
            Authenticating...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-12 transition-colors duration-300">
      <Toaster position="top-center" richColors theme="dark" />
      
      {!isOnline && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-305 text-amber-400 px-4 py-2 text-center text-[9px] font-mono tracking-wider flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top duration-350 relative z-50">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
          <span>OFFLINE SYNC ACTIVE • BUILDING SALAMI STREAKS SECURELY IN CACHE</span>
        </div>
      )}
      
      <main className="max-w-7xl mx-auto px-4 pt-8">
        {/* Sport Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8 pt-4">
          <div className="flex-1 flex gap-3 sm:gap-4">
            <button 
              onClick={() => setActiveSport('MLB')}
              className={cn(
                "flex-1 py-4 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all border-2 relative overflow-hidden group",
                activeSport === 'MLB' 
                  ? "bg-slate-900 border-salami-red text-white shadow-[0_0_20px_rgba(225,29,72,0.1)]" 
                  : "bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-400"
              )}
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-salami-red animate-pulse" />
                MLB Salami
              </div>
              {activeSport === 'MLB' && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-salami-red/10 to-transparent opacity-50"
                />
              )}
            </button>
            <button 
              onClick={() => setActiveSport('NHL')}
              className={cn(
                "flex-1 py-4 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all border-2 relative group",
                activeSport === 'NHL' 
                  ? "bg-slate-900 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.1)]" 
                  : "bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-400"
              )}
            >
              <div className="relative z-10 flex flex-col items-center gap-1">
                <span>NHL Salami</span>
                <span className="text-[7px] text-blue-400/70 font-mono tracking-widest leading-none">(Work in Progress)</span>
              </div>
              {activeSport === 'NHL' && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-50"
                />
              )}
            </button>
          </div>
        </div>

        {/* NHL Date/Showcase Selector (Always visible on NHL view) */}
        {activeSport === 'NHL' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 font-mono"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <CalendarRange className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase text-white tracking-widest">
                  NHL Slate Selector
                </span>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">
                  Pick a historical sheet or live ticker simulation
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedNhlDate('today')}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer",
                    selectedNhlDate === 'today'
                      ? "bg-blue-600 border-blue-500 text-white font-extrabold shadow-[0_0_12px_rgba(37,99,235,0.3)]"
                      : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  )}
                >
                  📅 Today (Live API)
                </button>
                <button
                  onClick={() => setSelectedNhlDate('2026-03-24')}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer",
                    selectedNhlDate === '2026-03-24'
                      ? "bg-blue-600 border-blue-500 text-white font-extrabold shadow-[0_0_12px_rgba(37,99,235,0.3)]"
                      : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  )}
                >
                  🏒 March 24 (11 Gms)
                </button>
                <button
                  onClick={() => setSelectedNhlDate('2026-04-11')}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer",
                    selectedNhlDate === '2026-04-11'
                      ? "bg-blue-600 border-blue-500 text-white font-extrabold shadow-[0_0_12px_rgba(37,99,235,0.3)]"
                      : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  )}
                >
                  🏒 April 11 (14 Gms)
                </button>
                <button
                  onClick={() => setSelectedNhlDate('demo')}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer relative overflow-hidden",
                    selectedNhlDate === 'demo'
                      ? "bg-cyan-950/60 border-cyan-500 text-cyan-300 font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse"
                      : "bg-teal-950/25 border-teal-900/40 text-teal-400 hover:text-teal-350 hover:border-teal-700"
                  )}
                >
                  <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-ping mr-1" />
                  🚨 Simulated Showcase
                </button>
                <button
                  onClick={() => setSelectedNhlDate('pre-slate')}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer relative overflow-hidden",
                    selectedNhlDate === 'pre-slate'
                      ? "bg-purple-950/65 border-purple-500 text-purple-300 font-extrabold shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  )}
                >
                  <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mr-1 animate-pulse" />
                  🔮 NHL Pre-Slate (Demo)
                </button>
              </div>

              <div className="flex items-center gap-2 pl-3 border-l border-slate-850">
                <span className="text-[9px] uppercase font-black text-slate-500">Custom:</span>
                <input
                  type="date"
                  min="2025-10-01"
                  max="2026-06-30"
                  value={(selectedNhlDate !== 'today' && selectedNhlDate !== 'demo' && selectedNhlDate !== 'pre-slate' && selectedNhlDate !== '2026-03-24' && selectedNhlDate !== '2026-04-11') ? selectedNhlDate : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedNhlDate(e.target.value);
                    }
                  }}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-250 rounded-lg px-2.5 py-1.5 text-[10px] font-mono focus:outline-none focus:border-blue-500/50 cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-6">
          {activeSport === 'MLB' && stats.hasRainRisk && (
                <motion.div  
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-3 flex items-center justify-between px-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Droplets className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-black text-blue-400 uppercase tracking-widest block">Weather Alert</span>
                      <p className="text-[11px] font-mono text-slate-300 uppercase tracking-tight">Active precipitation detected in one or more games. Monitor for delays.</p>
                    </div>
                  </div>
                  <div className="hidden sm:block text-[8px] font-mono text-slate-500 uppercase tracking-widest text-right">
                    Canceled games may void<br/>Grand Salami wagers
                  </div>
                </motion.div>
              )}

              {activeSport === 'MLB' ? (
                <GrandSalamiHeader 
                  currentTotal={currentTotal}
                  homeTotal={homeTotal}
                  awayTotal={awayTotal}
                  gameCount={stats.gameCount}
                  finalCount={stats.finalCount}
                  liveCount={stats.liveCount}
                  onRefresh={() => loadLiveData(true)}
                  isRefreshing={isRefreshing}
                  lastUpdated={lastUpdated}
                  games={games}
                  betLine={betLine}
                  betType={betType}
                  projectedTotal={projectedTotal}
                  isFinished={stats.isFinished}
                  weatherSummary={stats.weatherSummary}
                  voidDates={voidDates}
                  todayStr={todayStr}
                />
              ) : nhlStats && (
                <NHLGrandSalamiHeader 
                  currentTotal={currentTotal}
                  homeTotal={homeTotal}
                  awayTotal={awayTotal}
                  gameCount={nhlStats.gameCount}
                  finalCount={nhlStats.finalCount}
                  liveCount={nhlStats.liveCount}
                  onRefresh={() => loadLiveData(true)}
                  isRefreshing={isRefreshing}
                  lastUpdated={lastUpdated}
                  games={nhlGames}
                  betLine={betLine}
                  betType={betType}
                  projectedTotal={projectedTotal}
                  isFinished={nhlStats.isFinished}
                  voidDates={voidDates}
                  todayStr={todayStr}
                />
              )}

              {((activeSport === 'MLB' && games.length === 0) || (activeSport === 'NHL' && nhlGames.length === 0)) && !isRefreshing && !isInitialLoad ? (
                <div className="dashboard-card p-12 text-center bg-slate-900 border-slate-800">
                  <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800 shadow-inner">
                    <Calendar className="w-10 h-10 text-slate-700" />
                  </div>
                  <h3 className="text-white font-black text-2xl mb-3 tracking-tighter uppercase">No Games Found</h3>
                  <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed">
                    We couldn't find any {activeSport} games scheduled for <span className="text-white bg-slate-800 px-2 py-0.5 rounded">{format(new Date(), 'MMMM do, yyyy').toUpperCase()}</span>.
                  </p>
                  <div className="mt-8 flex flex-col items-center gap-4">
                    <button 
                      onClick={() => loadLiveData(true)}
                      className="px-8 py-3 bg-salami-red hover:bg-red-700 text-white rounded-xl font-black text-[11px] uppercase tracking-[0.3em] transition-all active:scale-95 shadow-lg shadow-red-900/20"
                    >
                      Force Sync Now
                    </button>
                    <div className="flex items-center gap-2 text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                      <Activity className="w-3 h-3" />
                      Requesting {activeSport} Stats API...
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="order-2 lg:order-1 lg:col-span-3 space-y-6">
                    {activeSport === 'MLB' && parkFactors.length > 0 && (
                      showParkFactors ? (
                        <ParkFactorsReport 
                          factors={parkFactors} 
                          onHide={handleToggleParkFactors} 
                        />
                      ) : (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={handleToggleParkFactors}
                          className="w-full py-3.5 px-5 bg-slate-950 hover:bg-slate-900 border border-slate-900 rounded-2xl flex items-center justify-between transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/15 transition-colors">
                              <CloudSun className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="text-left">
                              <span className="text-xs font-black uppercase tracking-wider text-white">Atmospheric Park Factors</span>
                              <span className="text-[10px] font-mono text-slate-500 block mt-0.5">Sourced via Ballpark Pal Sync • Click to expand environmental multipliers</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl group-hover:border-slate-700 transition-colors text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-300">
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                            <span>Expand Factors</span>
                          </div>
                        </motion.button>
                      )
                    )}
                    {activeSport === 'MLB' ? (
                      <GameLog 
                        games={games} 
                        gameLines={gameLines} 
                        manualLines={gameLines} 
                        parkFactors={parkFactors}
                      />
                    ) : (
                      <NHLGameLog 
                        games={nhlGames}
                        gameLines={nhlGameLines}
                        manualLines={nhlGameLines}
                        selectedDate={selectedNhlDate}
                        onSelectDate={setSelectedNhlDate}
                      />
                    )}
                  </div>
                  
                  <div className="order-1 lg:order-2 lg:col-span-1 space-y-6">
                    {isAdmin && (
                      <div className="space-y-6">
                        <UserAdminPanel />
                      </div>
                    )}

                    <WagerTracker 
                      sport={activeSport as 'MLB' | 'NHL'}
                      currentTotal={currentTotal}
                      playedInnings={activeSport === 'MLB' ? stats.playedInnings : (nhlStats?.playedPeriods || 0)}
                      totalExpectedInnings={activeSport === 'MLB' ? stats.totalExpectedInnings : (nhlStats?.totalExpectedPeriods || 0)}
                      isFinished={activeSport === 'MLB' ? stats.isFinished : (nhlStats?.isFinished || false)}
                      gameCount={activeSport === 'MLB' ? stats.gameCount : (nhlStats?.gameCount || 0)}
                      finalCount={activeSport === 'MLB' ? stats.finalCount : (nhlStats?.finalCount || 0)}
                      liveThreats={activeSport === 'MLB' ? stats.liveThreats : 0}
                      betLine={betLine}
                      setBetLine={setBetLine}
                      betType={betType}
                      setBetType={setBetType}
                      projectedTotal={projectedTotal}
                      todayStr={todayStr}
                      onOpenHistory={() => setIsHistoryModalOpen(true)}
                      currentStreak={currentStreak}
                      historicalTotals={historicalTotals}
                      userWagers={activeUserWagers}
                      onSaveWager={handleSaveWager}
                      onClearWager={handleClearWager}
                      voidDates={voidDates}
                    />

                    {user && (
                      <Leaderboard 
                        currentUserId={user?.uid} 
                        activeSport={activeSport} 
                      />
                    )}

                    {activeSport === 'MLB' && <DailyApex games={games} />}

                    {activeSport === 'MLB' && (
                      <div className="hidden lg:block space-y-6">
                        <BullpenFatigueReport 
                          historicalGames={historicalGames} 
                          todayGames={games} 
                          isLoading={historyLoading} 
                        />
                      </div>
                    )}

                    {/* Desktop Run Trends */}
                    {activeSport === 'MLB' && (
                      <div className="hidden lg:block">
                        <RunTrends 
                          historicalGames={historicalGames}
                          currentTotal={currentTotal}
                          games={games}
                          gameLines={gameLines}
                          manualLines={gameLines}
                        />
                      </div>
                    )}

                    {/* Desktop NHL Goal Trends */}
                    {activeSport === 'NHL' && (
                      <div className="hidden lg:block">
                        <NHLGoalTrends 
                          historicalGames={historicalNhlGames}
                          games={nhlGames}
                          gameLines={nhlGameLines}
                          manualLines={nhlGameLines}
                        />
                      </div>
                    )}
                  </div>

                  {/* Mobile Run Trends & PreGameAudit - Placed under the GameLog (Scoreboard) */}
                  {activeSport === 'MLB' && (
                    <div className="order-3 lg:hidden space-y-6">
                      <RunTrends 
                        historicalGames={historicalGames}
                        currentTotal={currentTotal}
                        games={games}
                        gameLines={gameLines}
                        manualLines={gameLines}
                      />
                      <BullpenFatigueReport 
                        historicalGames={historicalGames} 
                        todayGames={games} 
                        isLoading={historyLoading}
                      />
                    </div>
                  )}

                  {/* Mobile NHL Goal Trends */}
                  {activeSport === 'NHL' && (
                    <div className="order-3 lg:hidden space-y-6">
                      <NHLGoalTrends 
                        historicalGames={historicalNhlGames}
                        games={nhlGames}
                        gameLines={nhlGameLines}
                        manualLines={nhlGameLines}
                      />
                    </div>
                  )}
                </div>
              )}

          {/* Hidden SEO Text for Search Indexing */}
          <div className="sr-only">
            <h2>MLB Grand Salami Betting Tracker & Predictive Model</h2>
            <p>
              Track the daily MLB Grand Salami total runs line in real-time. Our advanced predictive model analyzes game pace, bullpen depth, 
              and ballpark factors to provide automated pace tracking and score projections for every MLB slate. 
              Compare live grand salami betting lines across major sportsbooks and identify high-value total run picks.
            </p>
          </div>

          <InfoSection sport={activeSport} />

          <WagerHistory 
            historicalGames={activeSport === 'MLB' ? historicalGames : historicalNhlGames} 
            isOpen={isHistoryModalOpen} 
            onClose={() => setIsHistoryModalOpen(false)} 
            userWagers={activeUserWagers}
            historicalTotals={historicalTotals}
            currentStreak={currentStreak}
            isLoading={isWagerLoading}
            onDeleteWager={handleDeleteWager}
            voidDates={voidDates}
            sport={activeSport}
          />

          <FeedbackSection />
        </div>
      </main>

      <footer className="mt-12 py-12 border-t border-slate-800 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-y-4 gap-x-6 text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.2em]">
            <a href="#how-it-works" className="hover:text-salami-red transition-colors">Knowledge Base</a>
            <span className="w-1 h-1 rounded-full bg-slate-800" />
            <a href="https://ballparkpal.com" target="_blank" rel="noreferrer" className="text-emerald-500/80 hover:text-emerald-400 transition-colors flex items-center gap-1.5 border border-emerald-500/10 rounded-full px-2 py-0.5 bg-emerald-500/5 group">
              <BallparkPalLogo className="w-4 h-4 transition-transform group-hover:scale-110" />
              Ballpark Data
              <ExternalLink className="w-2.5 h-2.5 opacity-50" />
            </a>
            <span className="w-1 h-1 rounded-full bg-slate-800" />
            <a href="https://twitter.com/Salamipace" target="_blank" rel="noreferrer" className="hover:text-[#1DA1F2] transition-colors">Twitter</a>
            <span className="w-1 h-1 rounded-full bg-slate-800" />
            <a href="https://ais-pre-vccr6fawtybbglnmzdudam-387114323884.us-east1.run.app" target="_blank" rel="noreferrer" className="hover:text-salami-red transition-colors">Shared v1.4.1</a>
            <span className="w-1 h-1 rounded-full bg-slate-800" />
            <span className="text-slate-700">v1.4.1</span>
          </div>
          <p className="text-[10px] text-slate-600 font-mono tracking-widest">
            DATA PROVIDED BY MLB STATS API • UPDATES EVERY 60S
          </p>
          <p className="text-[9px] text-slate-700 font-mono mt-2">
            © {new Date().getFullYear()} GRAND SALAMI TRACKER • FOR ENTERTAINMENT PURPOSES ONLY
          </p>
        </div>
      </footer>

      {/* Mobile Iframe Alert - Sticky Bottom Overlay */}
      <AnimatePresence>
        {!user && IS_IFRAME && !mobileBannerDismissed && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-5 left-4 right-4 z-[100] md:hidden"
          >
            {mobileBannerMinimized ? (
              /* Minimized Compact Chip */
              <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-full px-3.5 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex items-center justify-between gap-2.5">
                <div 
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => setMobileBannerMinimized(false)}
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <Smartphone className="w-3 h-3 text-blue-400" />
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-wider">Mobile Access</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => {
                      window.open(window.location.href, '_blank');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Launch</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                  <button 
                    onClick={() => setMobileBannerMinimized(false)}
                    className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Expand"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setMobileBannerDismissed(true)}
                    className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Full Expanded Banner */
              <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-2xl p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center border border-blue-500/30 shrink-0">
                      <Smartphone className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-0.5">Mobile Access</h4>
                      <p className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter leading-tight">
                        Login restricted in preview iframe.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => setMobileBannerMinimized(true)}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Shrink / Minimize"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setMobileBannerDismissed(true)}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
                  <span className="text-[8.5px] font-mono text-slate-400 uppercase tracking-tight">
                    Open in browser tab to sign in & sync wagers
                  </span>
                  <button 
                    onClick={() => {
                      window.open(window.location.href, '_blank');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] font-black uppercase tracking-wider text-white whitespace-nowrap shadow-md shadow-blue-900/40 active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    <span>Launch App</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
