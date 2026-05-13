import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { fetchMLBGames, MLBGame } from './services/mlbService';
import { fetchNHLGames, NHLGame } from './services/nhlService';
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
import { BullpenFatigueReport } from './components/BullpenFatigueReport';
import { InfoSection } from './components/InfoSection';
import { DailyApex } from './components/DailyApex';
import { LogoExport } from './components/LogoExport';
import { UserAdminPanel } from './components/UserAdminPanel';
import { WagerHistory } from './components/WagerHistory';
import { FeedbackSection } from './components/FeedbackSection';
import { BallparkPalLogo } from './components/BallparkPalLogo';
import { Calendar, Share2, Droplets, Activity, ExternalLink, Smartphone, LogIn, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useAuth } from './contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot, doc, getDoc, query, orderBy, getDocs } from 'firebase/firestore';
import { format, subDays } from 'date-fns';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [activeSport, setActiveSport] = useState<'MLB' | 'NHL'>('MLB');
  const [games, setGames] = useState<MLBGame[]>([]);
  const [nhlGames, setNhlGames] = useState<NHLGame[]>([]);
  const [parkFactors, setParkFactors] = useState<BallparkPalFactor[]>([]);
  const [palConfigured, setPalConfigured] = useState(true);
  const [historicalGames, setHistoricalGames] = useState<MLBGame[]>([]);
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
  
  const isLogoMode = new URLSearchParams(window.location.search).get('logo') === 'true';
  const isFetchingRef = useRef(false);

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
      const historicalResults = await Promise.all(
        datesToFetch.map(date => fetchMLBGames(date))
      );
      const combinedHistory = historicalResults.flat();
      setHistoricalGames(combinedHistory || []);
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
      const results = await Promise.allSettled([
        fetchMLBGames(today),
        fetchNHLGames(today),
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
      
      setGames(mlbResult || []);
      setNhlGames(nhlResult || []);
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
  }, []);

  useEffect(() => {
    loadHistoricalData();
    loadLiveData(true);
    
    // Original 1-minute heartbeat (silent background updates)
    const interval = setInterval(() => {
      loadLiveData();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [loadHistoricalData, loadLiveData]);

  const [todayStr] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  const currentTotal = useMemo(() => {
    if (activeSport === 'MLB') {
      if (!Array.isArray(games)) return 0;
      return games.reduce((acc, game) => {
        if (game.officialDate && game.officialDate !== todayStr) return acc;
        const isPostponed = (game.status?.detailedState || '').toLowerCase().includes('postponed') || 
                           (game.status?.detailedState || '').toLowerCase().includes('canceled');
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
      const isWrongDay = g.officialDate && g.officialDate !== todayStr;
      return !state.includes('postponed') && !state.includes('canceled') && !isWrongDay;
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

  // Group historical games by date for results
  const historicalTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    historicalGames.forEach(game => {
      const date = game.officialDate || format(new Date(game.gameDate), 'yyyy-MM-dd');
      if (!totals[date]) totals[date] = 0;
      totals[date] += (game.teams.away.score || 0) + (game.teams.home.score || 0);
    });
    return totals;
  }, [historicalGames]);

  // Load Wager Data for global access
  useEffect(() => {
    const loadWagers = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      if (user) {
        setIsWagerLoading(true);
        try {
          // Get today's wager for tracker state - scoped by sport
          const todayWagerDoc = doc(db, 'users', user.uid, 'wagers', `${activeSport}_${today}`);
          const snap = await getDoc(todayWagerDoc);
          if (snap.exists()) {
            const data = snap.data();
            setBetLine(data.line);
            setBetType(data.side.toLowerCase() as 'over' | 'under');
          } else {
            setBetLine(''); // Reset if no wager today for this sport
          }

          // Get all wagers for streak calculation
          const wagersRef = collection(db, 'users', user.uid, 'wagers');
          const q = query(wagersRef, orderBy('date', 'desc'));
          const wagerSnap = await getDocs(q);
          const fetchedWagers = wagerSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          setUserWagers(fetchedWagers);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}/wagers`);
        } finally {
          setIsWagerLoading(false);
        }
      } else {
        const savedLine = localStorage.getItem(`${activeSport}_salami_bet_line`);
        const savedType = localStorage.getItem(`${activeSport}_salami_bet_type`);
        const savedDate = localStorage.getItem(`${activeSport}_salami_bet_date`);
        
        if (savedDate && savedDate !== today) {
          // It's a past wager, WagerTracker will handle settlement notification
          // but we shouldn't show it as today's active wager
          setBetLine('');
        } else {
          if (savedLine) setBetLine(parseFloat(savedLine));
          else setBetLine('');
          if (savedType) setBetType(savedType as 'over' | 'under');
        }
      }
    };
    loadWagers();
  }, [user, activeSport]);

  const currentStreak = useMemo(() => {
    if (userWagers.length === 0) return null;
    
    const settled = userWagers.filter(w => historicalTotals[w.date] !== undefined);
    if (settled.length === 0) return null;

    let streakCount = 0;
    let streakType: 'WIN' | 'LOSS' | 'PUSH' | null = null;

    for (let i = 0; i < settled.length; i++) {
        const wager = settled[i];
        const finalTotal = historicalTotals[wager.date];
        const isPush = finalTotal === wager.line;
        const isWin = !isPush && (wager.side === 'OVER' ? finalTotal > wager.line : finalTotal < wager.line);
        const result = isWin ? 'WIN' : isPush ? 'PUSH' : 'LOSS';

        if (i === 0) {
            streakType = result as any;
            streakCount = 1;
        } else if (result === streakType) {
            streakCount++;
        } else {
            break;
        }
    }

    return { type: streakType, count: streakCount };
  }, [userWagers, historicalTotals]);

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
      
      <main className="max-w-7xl mx-auto px-4 pt-8">
        {/* Sport Tab Switcher */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => setActiveSport('MLB')}
            className={cn(
              "flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border-2 relative overflow-hidden group",
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
              "flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border-2 relative group",
              activeSport === 'NHL' 
                ? "bg-slate-900 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.1)]" 
                : "bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-400"
            )}
          >
            <div className="relative z-10 flex flex-col items-center gap-0.5">
              <span>NHL Salami</span>
              <span className="text-[7px] font-mono text-blue-400 opacity-80 tracking-widest leading-none">Coming Soon</span>
            </div>
            {activeSport === 'NHL' && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-50"
              />
            )}
            <div className="absolute top-2 right-3">
              <div className="px-1.5 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-[6px] text-blue-400 font-black animate-pulse">BETA</div>
            </div>
          </button>
        </div>

        <div className="space-y-6">
          {stats.hasRainRisk && (
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
              gameCount={games.length}
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
            />
          ) : nhlStats && (
            <NHLGrandSalamiHeader 
              currentTotal={currentTotal}
              gameCount={nhlStats.gameCount}
              finalCount={nhlStats.finalCount}
              liveCount={nhlStats.liveCount}
              onRefresh={() => loadLiveData(true)}
              isRefreshing={isRefreshing}
              lastUpdated={lastUpdated}
              games={nhlGames}
              betLine={betLine}
              betType={betType}
              projectedTotal={null}
              isFinished={nhlStats.isFinished}
            />
          )}

          {activeSport === 'MLB' && !palConfigured && (
            <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center gap-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-[11px] font-black text-orange-400 uppercase tracking-widest">Ballpark Pal Integration Offline</h4>
                <p className="text-[10px] text-orange-400/60 font-mono uppercase leading-tight">
                  The daily environmental factor API is not yielding data. Ensure BALLPARK_PAL_API_KEY is configured in Settings.
                </p>
              </div>
              <button 
                onClick={() => loadLiveData(true)}
                className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all"
              >
                Retry
              </button>
            </div>
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
              <div className="order-2 lg:order-1 lg:col-span-3">
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
                  sport={activeSport}
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
                  projectedTotal={activeSport === 'MLB' ? projectedTotal : null}
                  todayStr={todayStr}
                  onOpenHistory={() => setIsHistoryModalOpen(true)}
                  currentStreak={currentStreak}
                  historicalTotals={historicalTotals}
                  userWagers={userWagers}
                />

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
            historicalGames={historicalGames} 
            isOpen={isHistoryModalOpen} 
            onClose={() => setIsHistoryModalOpen(false)} 
            userWagers={userWagers}
            historicalTotals={historicalTotals}
            currentStreak={currentStreak}
            isLoading={isWagerLoading}
          />

          <FeedbackSection />
        </div>
      </main>

      <footer className="mt-12 py-12 border-t border-slate-800 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.2em]">
            <a href="#how-it-works" className="hover:text-salami-red transition-colors">How it works</a>
            <span className="w-1 h-1 rounded-full bg-slate-800" />
            <a href="https://ballparkpal.com" target="_blank" rel="noreferrer" className="text-emerald-500/80 hover:text-emerald-400 transition-colors flex items-center gap-1.5 border border-emerald-500/10 rounded-full px-2 py-0.5 bg-emerald-500/5 group">
              <BallparkPalLogo className="w-4 h-4 transition-transform group-hover:scale-110" />
              Ballpark Pal
              <ExternalLink className="w-2.5 h-2.5 opacity-50" />
            </a>
            <span className="w-1 h-1 rounded-full bg-slate-800" />
            <a href="https://twitter.com/Salamipace" target="_blank" rel="noreferrer" className="hover:text-[#1DA1F2] transition-colors">Twitter</a>
            <span className="w-1 h-1 rounded-full bg-slate-800" />
            <a href="https://ais-pre-vccr6fawtybbglnmzdudam-387114323884.us-east1.run.app" target="_blank" rel="noreferrer" className="hover:text-salami-red transition-colors">Shared v1.3.1</a>
            <span className="w-1 h-1 rounded-full bg-slate-800" />
            <span className="text-slate-700">v1.3.1</span>
            <span className="w-1 h-1 rounded-full bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <div className={`w-1 h-1 rounded-full ${parkFactors.length > 0 ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : (palConfigured ? 'bg-slate-700' : 'bg-red-500')}`} />
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                PAL API {(parkFactors.length > 0 && palConfigured) ? 'ON' : (palConfigured ? 'WAIT' : 'OFF')}
              </span>
            </div>
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
        {!user && window.self !== window.top && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 z-[100] md:hidden"
          >
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Smartphone className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Mobile Access</h4>
                  <p className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter leading-tight">
                    Login restricted in preview. Open in browser to sync wagers.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  window.open(window.location.href, '_blank');
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap shadow-lg shadow-blue-900/40 active:scale-95 transition-all"
              >
                <span>Launch App</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
