import { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchMLBGames, MLBGame } from './services/mlbService';
import { GrandSalamiHeader } from './components/GrandSalamiHeader';
import { GameLog } from './components/GameLog';
import { WagerTracker } from './components/WagerTracker';
import { RunTrends } from './components/RunTrends';
import { InfoSection } from './components/InfoSection';
import { Calendar, Share2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useAuth } from './contexts/AuthContext';
import { format, subDays } from 'date-fns';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const { loading: authLoading } = useAuth();
  const [games, setGames] = useState<MLBGame[]>([]);
  const [historicalGames, setHistoricalGames] = useState<MLBGame[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const fiveDaysAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd');
      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

      const [mlbData, historyData] = await Promise.all([
        fetchMLBGames(today),
        fetchMLBGames(undefined, fiveDaysAgo, yesterday)
      ]);

      setGames(mlbData || []);
      setHistoricalGames(historyData || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error in loadData:', error);
      toast.error('Error loading game data.');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  const currentTotal = useMemo(() => games.reduce((acc, game) => {
    return acc + (game.teams.away.score || 0) + (game.teams.home.score || 0);
  }, 0), [games]);

  const stats = useMemo(() => {
    const final = games.filter(g => g.status.abstractGameState === 'Final').length;
    const live = games.filter(g => g.status.abstractGameState === 'Live').length;
    
    const totalExpected = games.length * 9;
    const played = games.reduce((acc, game) => {
      if (game.status.abstractGameState === 'Final') return acc + 9;
      if (game.status.abstractGameState === 'Live') {
        const inning = game.linescore?.currentInning || 1;
        const isTop = game.linescore?.isTopInning ?? true;
        return acc + (inning - 1) + (isTop ? 0.25 : 0.75);
      }
      return acc;
    }, 0);

    return {
      finalCount: final,
      liveCount: live,
      totalExpectedInnings: totalExpected,
      playedInnings: played,
      isFinished: games.length > 0 && final === games.length
    };
  }, [games]);

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
          <GrandSalamiHeader 
            currentTotal={currentTotal}
            gameCount={games.length}
            finalCount={stats.finalCount}
            liveCount={stats.liveCount}
            onRefresh={loadData}
            isRefreshing={isRefreshing}
            lastUpdated={lastUpdated}
            games={games}
          />

          {games.length === 0 && !isRefreshing ? (
            <div className="dashboard-card p-12 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                <Calendar className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-white font-black text-xl mb-2">No Games Scheduled</h3>
              <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
                There are no MLB games found for today's slate.
              </p>
              <button 
                onClick={loadData}
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
                <WagerTracker 
                  currentTotal={currentTotal}
                  playedInnings={stats.playedInnings}
                  totalExpectedInnings={stats.totalExpectedInnings}
                  isFinished={stats.isFinished}
                  gameCount={games.length}
                  finalCount={stats.finalCount}
                />

                {/* Desktop Run Trends */}
                <div className="hidden lg:block">
                  <RunTrends 
                    historicalGames={historicalGames}
                    currentTotal={currentTotal}
                  />
                </div>
              </div>

              {/* Mobile Run Trends - Placed under the GameLog (Scoreboard) */}
              <div className="order-3 lg:hidden">
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
            <a href="https://www.mlb.com" target="_blank" rel="noreferrer" className="hover:text-salami-red transition-colors">MLB.com</a>
            <span className="w-1 h-1 rounded-full bg-slate-800" />
            <span className="text-slate-700">v1.1.3</span>
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
