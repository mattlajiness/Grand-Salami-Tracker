import { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchMLBGames, MLBGame } from './services/mlbService';
import { calculateLiveThreat } from './lib/projectionEngine';
import { GrandSalamiHeader } from './components/GrandSalamiHeader';
import { GameLog } from './components/GameLog';
import { WagerTracker } from './components/WagerTracker';
import { RunTrends } from './components/RunTrends';
import { PreGameAudit } from './components/PreGameAudit';
import { InfoSection } from './components/InfoSection';
import { LogoExport } from './components/LogoExport';
import { UserAdminPanel } from './components/UserAdminPanel';
import { Calendar, Share2, Droplets } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useAuth } from './contexts/AuthContext';
import { format, subDays } from 'date-fns';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [games, setGames] = useState<MLBGame[]>([]);
  const [historicalGames, setHistoricalGames] = useState<MLBGame[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const isLogoMode = new URLSearchParams(window.location.search).get('logo') === 'true';

  const loadHistoricalData = useCallback(async () => {
    try {
      const fiveDaysAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd');
      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
      const historyData = await fetchMLBGames(undefined, fiveDaysAgo, yesterday);
      setHistoricalGames(historyData || []);
    } catch (error) {
      console.error('Error loading historical data:', error);
    }
  }, []);

  const loadLiveData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const mlbData = await fetchMLBGames(today);
      setGames(mlbData || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error in loadLiveData:', error);
      toast.error('Error loading live game data.');
    } finally {
      setIsRefreshing(false);
      setIsInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    loadHistoricalData();
    loadLiveData();
    
    const interval = setInterval(loadLiveData, 60000);
    return () => clearInterval(interval);
  }, [loadHistoricalData, loadLiveData]);

  const currentTotal = useMemo(() => {
    if (!Array.isArray(games)) return 0;
    return games.reduce((acc, game) => {
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
        totalExpectedInnings: 0,
        playedInnings: 0,
        isFinished: false
      };
    }

    const final = games.filter(g => g?.status?.abstractGameState === 'Final').length;
    const live = games.filter(g => g?.status?.abstractGameState === 'Live').length;
    
    const totalExpected = games.length * 9;
    let liveThreats = 0;

    const played = games.reduce((acc, game) => {
      if (!game?.status) return acc;
      if (game.status.abstractGameState === 'Final') return acc + 9;
      if (game.status.abstractGameState === 'Live') {
        const inning = game.linescore?.currentInning || 1;
        const isTop = game.linescore?.isTopInning ?? true;

        // Calculate live threat for this game
        if (game.linescore?.offense) {
          liveThreats += calculateLiveThreat({
            first: !!game.linescore.offense.first,
            second: !!game.linescore.offense.second,
            third: !!game.linescore.offense.third,
            outs: game.linescore.outs || 0
          });
        }

        return acc + (inning - 1) + (isTop ? 0.25 : 0.75);
      }
      return acc;
    }, 0);

    return {
      finalCount: final,
      liveCount: live,
      totalExpectedInnings: totalExpected,
      playedInnings: played,
      liveThreats,
      isFinished: final === games.length,
      hasRainRisk: games.some(g => {
        const cond = g.weather?.condition?.toLowerCase() || '';
        const status = g.status.detailedState.toLowerCase();
        const rainKeywords = ['rain', 'shower', 'storm', 'drizzle', 'precip', 'thunder', 'lightning', 'mist', 'overcast'];
        return rainKeywords.some(keyword => cond.includes(keyword)) || status.includes('delay');
      })
    };
  }, [games]);

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
          <span className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-[0.3em] animate-pulse">
            Authenticating...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-12 transition-colors duration-300">
      <Toaster position="top-center" richColors theme="dark" />
      
      <main className="max-w-5xl mx-auto px-4 pt-8">
        <div className="space-y-6">
          {stats.hasRainRisk && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-3 flex items-center justify-between px-6"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Droplets className="w-4 h-4 text-blue-400 animate-pulse" />
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
            onRefresh={loadLiveData}
            isRefreshing={isRefreshing}
            lastUpdated={lastUpdated}
            games={games}
          />

          {games.length === 0 && !isRefreshing && !isInitialLoad ? (
            <div className="dashboard-card p-12 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                <Calendar className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-white font-black text-xl mb-2">No Games Scheduled</h3>
              <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
                There are no MLB games found for today's slate.
              </p>
              <button 
                onClick={loadLiveData}
                className="mt-6 px-6 py-2 bg-salami-red text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-colors"
              >
                Check Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="order-2 lg:order-1 lg:col-span-2">
                <GameLog games={games} />
              </div>
              
              <div className="order-1 lg:order-2 space-y-6">
                {isAdmin && (
                  <UserAdminPanel />
                )}

                <WagerTracker 
                  currentTotal={currentTotal}
                  playedInnings={stats.playedInnings}
                  totalExpectedInnings={stats.totalExpectedInnings}
                  isFinished={stats.isFinished}
                  gameCount={games.length}
                  finalCount={stats.finalCount}
                  liveThreats={stats.liveThreats}
                />

                <div className="hidden lg:block">
                  <PreGameAudit games={games} />
                </div>

                {/* Desktop Run Trends */}
                <div className="hidden lg:block">
                  <RunTrends 
                    historicalGames={historicalGames}
                    currentTotal={currentTotal}
                  />
                </div>
              </div>

              {/* Mobile Run Trends & PreGameAudit - Placed under the GameLog (Scoreboard) */}
              <div className="order-3 lg:hidden space-y-6">
                <PreGameAudit games={games} />
                <RunTrends 
                  historicalGames={historicalGames}
                  currentTotal={currentTotal}
                />
              </div>
            </div>
          )}

          <InfoSection />
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
