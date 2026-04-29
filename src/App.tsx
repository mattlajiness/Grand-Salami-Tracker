import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { fetchMLBGames, MLBGame } from './services/mlbService';
import { calculateLiveThreat, calculateSmartProjection } from './lib/projectionEngine';
import { GrandSalamiHeader } from './components/GrandSalamiHeader';
import { calculateFatigueStats } from './lib/fatigueEngine';
import { getParkFactor, getTeamOffensePower } from './lib/leagueConstants';
import { GameLog } from './components/GameLog';
import { WagerTracker } from './components/WagerTracker';
import { RunTrends } from './components/RunTrends';
import { BullpenFatigueReport } from './components/BullpenFatigueReport';
import { InfoSection } from './components/InfoSection';
import { LogoExport } from './components/LogoExport';
import { UserAdminPanel } from './components/UserAdminPanel';
import { WagerHistory } from './components/WagerHistory';
import { FeedbackSection } from './components/FeedbackSection';
import { Calendar, Share2, Droplets, Activity } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useAuth } from './contexts/AuthContext';
import { db } from './firebase';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { format, subDays } from 'date-fns';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [games, setGames] = useState<MLBGame[]>([]);
  const [historicalGames, setHistoricalGames] = useState<MLBGame[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [gameLines, setGameLines] = useState<Record<number, number>>({});
  const [betLine, setBetLine] = useState<number | ''>('');
  const [betType, setBetType] = useState<'over' | 'under'>('over');
  const [isWagerLoading, setIsWagerLoading] = useState(false);
  
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
      console.error("Error fetching game lines:", error);
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
      const mlbData = await fetchMLBGames(today);
      
      setGames(mlbData || []);
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
    if (!Array.isArray(games)) return 0;
    return games.reduce((acc, game) => {
      // Strictly filter to ensure we aren't counting games from other days due to API data shifts
      if (game.officialDate && game.officialDate !== todayStr) return acc;

      const isPostponed = (game.status?.detailedState || '').toLowerCase().includes('postponed') || 
                         (game.status?.detailedState || '').toLowerCase().includes('canceled');
      if (isPostponed) return acc;

      const awayScore = game?.teams?.away?.score || 0;
      const homeScore = game?.teams?.home?.score || 0;
      return acc + awayScore + homeScore;
    }, 0);
  }, [games]);

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
        const hasRISP = !!offense?.second || !!offense?.third;
        
        if (offense && hasRISP) {
          liveThreats += calculateLiveThreat({
            first: !!offense.first,
            second: !!offense.second,
            third: !!offense.third,
            outs: game.linescore?.outs || 0
          });
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

  // Load Wager Data for global access
  useEffect(() => {
    const loadWager = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      if (user) {
        setIsWagerLoading(true);
        try {
          const wagerDoc = doc(db, 'users', user.uid, 'wagers', today);
          const snap = await getDoc(wagerDoc);
          if (snap.exists()) {
            const data = snap.data();
            setBetLine(data.line);
            setBetType(data.side.toLowerCase() as 'over' | 'under');
          }
        } catch (error) {
          console.error("Error loading wager:", error);
        } finally {
          setIsWagerLoading(false);
        }
      } else {
        const savedLine = localStorage.getItem('salami_bet_line');
        const savedType = localStorage.getItem('salami_bet_type');
        if (savedLine) setBetLine(parseFloat(savedLine));
        if (savedType) setBetType(savedType as 'over' | 'under');
      }
    };
    loadWager();
  }, [user]);

  const projectedTotal = useMemo(() => {
    // Requirement for stabilization: at least 1 full inning cumulative across the slate
    if (stats.playedInnings >= 1.0) {
      return calculateSmartProjection(currentTotal, stats.playedInnings, stats.totalExpectedInnings, stats.liveThreats);
    }
    return null;
  }, [currentTotal, stats.playedInnings, stats.totalExpectedInnings, stats.liveThreats]);

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

          {games.length === 0 && !isRefreshing && !isInitialLoad ? (
            <div className="dashboard-card p-12 text-center bg-slate-900 border-slate-800">
              <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800 shadow-inner">
                <Calendar className="w-10 h-10 text-slate-700" />
              </div>
              <h3 className="text-white font-black text-2xl mb-3 tracking-tighter uppercase">No Games Found</h3>
              <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed">
                We couldn't find any MLB games scheduled for <span className="text-white bg-slate-800 px-2 py-0.5 rounded">{format(new Date(), 'MMMM do, yyyy').toUpperCase()}</span>.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4">
                <button 
                  onClick={loadLiveData}
                  className="px-8 py-3 bg-salami-red hover:bg-red-700 text-white rounded-xl font-black text-[11px] uppercase tracking-[0.3em] transition-all active:scale-95 shadow-lg shadow-red-900/20"
                >
                  Force Sync Now
                </button>
                <div className="flex items-center gap-2 text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                  <Activity className="w-3 h-3" />
                  Requesting MLB Stats API...
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="order-2 lg:order-1 lg:col-span-3">
                <GameLog games={games} gameLines={gameLines} manualLines={gameLines} />
              </div>
              
              <div className="order-1 lg:order-2 lg:col-span-1 space-y-6">
                {isAdmin && (
                  <div className="space-y-6">
                    <UserAdminPanel />
                  </div>
                )}



                <WagerTracker 
                  currentTotal={currentTotal}
                  playedInnings={stats.playedInnings}
                  totalExpectedInnings={stats.totalExpectedInnings}
                  isFinished={stats.isFinished}
                  gameCount={stats.gameCount}
                  finalCount={stats.finalCount}
                  liveThreats={stats.liveThreats}
                  betLine={betLine}
                  setBetLine={setBetLine}
                  betType={betType}
                  setBetType={setBetType}
                  projectedTotal={projectedTotal}
                  todayStr={todayStr}
                  onOpenHistory={() => setIsHistoryModalOpen(true)}
                />

                <div className="hidden lg:block space-y-6">
                  <BullpenFatigueReport 
                    historicalGames={historicalGames} 
                    todayGames={games} 
                    isLoading={historyLoading} 
                  />
                </div>

                {/* Desktop Run Trends */}
                <div className="hidden lg:block">
                  <RunTrends 
                    historicalGames={historicalGames}
                    currentTotal={currentTotal}
                    games={games}
                    gameLines={gameLines}
                    manualLines={gameLines}
                  />
                </div>
              </div>

              {/* Mobile Run Trends & PreGameAudit - Placed under the GameLog (Scoreboard) */}
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
            </div>
          )}

          <InfoSection />

          <WagerHistory 
            historicalGames={historicalGames} 
            isOpen={isHistoryModalOpen} 
            onClose={() => setIsHistoryModalOpen(false)} 
          />

          <FeedbackSection />
        </div>
      </main>

      <footer className="mt-12 py-12 border-t border-slate-800 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.2em]">
            <a href="#how-it-works" className="hover:text-salami-red transition-colors">How it works</a>
            <span className="w-1 h-1 rounded-full bg-slate-800" />
            <a href="https://twitter.com/Salamipace" target="_blank" rel="noreferrer" className="hover:text-[#1DA1F2] transition-colors">Twitter</a>
            <span className="w-1 h-1 rounded-full bg-slate-800" />
            <a href="https://www.mlb.com" target="_blank" rel="noreferrer" className="hover:text-salami-red transition-colors">MLB.com</a>
            <span className="w-1 h-1 rounded-full bg-slate-800" />
            <span className="text-slate-700">v1.1.4</span>
          </div>
          <p className="text-[10px] text-slate-600 font-mono tracking-widest">
            DATA PROVIDED BY MLB STATS API • UPDATES EVERY 60S
          </p>
          <p className="text-[9px] text-slate-700 font-mono mt-2">
            © {new Date().getFullYear()} GRAND SALAMI TRACKER • FOR ENTERTAINMENT PURPOSES ONLY
          </p>
        </div>
      </footer>
    </div>
  );
}
