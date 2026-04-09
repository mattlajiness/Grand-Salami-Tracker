import { useEffect, useState, useCallback } from 'react';
import { fetchMLBGames, MLBGame } from './services/mlbService';
import { fetchMLBOdds, OddsResponse } from './services/oddsService';
import { GrandSalamiHeader } from './components/GrandSalamiHeader';
import { GameLog } from './components/GameLog';
import { WagerTracker } from './components/WagerTracker';
import { InfoSection } from './components/InfoSection';
import { RefreshCw, Calendar, Sun, Moon } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { loading: authLoading } = useAuth();
  const [games, setGames] = useState<(MLBGame & { overUnder?: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('salami_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('salami_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [mlbData, oddsData] = await Promise.all([
        fetchMLBGames(),
        fetchMLBOdds().catch(err => {
          console.error('Odds API Error:', err);
          if (err.message === 'INVALID_API_KEY') {
            toast.error('Invalid Odds API Key. Please check your settings.');
          } else {
            toast.error('Failed to fetch betting lines.');
          }
          return [];
        })
      ]);

      if (!mlbData || mlbData.length === 0) {
        setGames([]);
        return;
      }

      // Merge odds into games
      console.log(`Fetched ${mlbData.length} games and ${oddsData.length} betting lines.`);
      
      const mergedGames = mlbData.map(game => {
        const awayName = game.teams.away.team.name;
        const homeName = game.teams.home.team.name;

        // Find matching game in odds data
        const match = oddsData.find(o => {
          const oAway = o.away_team.toLowerCase();
          const oHome = o.home_team.toLowerCase();
          const gAway = awayName.toLowerCase();
          const gHome = homeName.toLowerCase();

          // Try exact match first
          if (oAway === gAway && oHome === gHome) return true;

          // Try matching by the last word (team nickname)
          const gAwayNick = gAway.split(' ').pop() || '';
          const gHomeNick = gHome.split(' ').pop() || '';
          const oAwayNick = oAway.split(' ').pop() || '';
          const oHomeNick = oHome.split(' ').pop() || '';

          if (gAwayNick && oAwayNick && gAwayNick === oAwayNick && 
              gHomeNick && oHomeNick && gHomeNick === oHomeNick) {
            return true;
          }

          // Fallback to inclusion
          return (oAway.includes(gAway) || gAway.includes(oAway)) && 
                 (oHome.includes(gHome) || gHome.includes(oHome));
        });

        let overUnder: number | undefined;
        if (match && match.bookmakers.length > 0) {
          // Look for totals market in any bookmaker
          const bookmaker = match.bookmakers.find(b => b.markets.some(m => m.key === 'totals')) || match.bookmakers[0];
          const market = bookmaker.markets.find(m => m.key === 'totals');
          if (market && market.outcomes.length > 0) {
            overUnder = market.outcomes[0].point;
          }
        }

        return { ...game, overUnder };
      });

      setGames(mergedGames);
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

  const currentTotal = games.reduce((acc, game) => {
    return acc + (game.teams.away.score || 0) + (game.teams.home.score || 0);
  }, 0);

  const finalCount = games.filter(g => g.status.abstractGameState === 'Final').length;
  const liveCount = games.filter(g => g.status.abstractGameState === 'Live').length;
  const previewCount = games.filter(g => g.status.abstractGameState === 'Preview').length;
  
  // Calculate granular slate completion based on innings played
  const totalExpectedInnings = games.length * 9;
  const playedInnings = games.reduce((acc, game) => {
    if (game.status.abstractGameState === 'Final') return acc + 9;
    if (game.status.abstractGameState === 'Live') {
      const inning = game.linescore?.currentInning || 1;
      const isTop = game.linescore?.isTopInning ?? true;
      // Top 1 = 0.25, Bot 1 = 0.5, Top 2 = 1.25, etc.
      // This gives a smoother projection than just counting final games
      return acc + (inning - 1) + (isTop ? 0.25 : 0.75);
    }
    return acc;
  }, 0);

  const completionPercentage = totalExpectedInnings > 0 
    ? Math.min(100, Math.round((playedInnings / totalExpectedInnings) * 100)) 
    : 0;

  const isFinished = games.length > 0 && finalCount === games.length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
            <div className="absolute inset-0 border-4 border-salami-red rounded-full border-t-transparent animate-spin" />
          </div>
          <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">
            Authenticating...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-salami-bg dark:bg-slate-950 pb-12 transition-colors duration-300">
      <Toaster position="top-center" richColors theme={isDarkMode ? 'dark' : 'light'} />
      
      <main className="max-w-5xl mx-auto px-4 pt-8">
        <div className="animate-in fade-in duration-700">
            <GrandSalamiHeader 
              currentTotal={currentTotal}
              gameCount={games.length}
              finalCount={finalCount}
              liveCount={liveCount}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              onRefresh={loadData}
              isRefreshing={isRefreshing}
              lastUpdated={lastUpdated}
            />

          {games.length === 0 && !isRefreshing ? (
            <div className="dashboard-card p-12 text-center bg-slate-900 border-none shadow-xl">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                <Calendar className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-white font-black text-xl mb-2">No Games Scheduled</h3>
              <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">
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
              <div className="lg:col-span-2">
                <GameLog games={games} />
              </div>
              
              <div className="space-y-6">
                {/* Wager Tracker */}
                <WagerTracker 
                  currentTotal={currentTotal}
                  playedInnings={playedInnings}
                  totalExpectedInnings={totalExpectedInnings}
                  isFinished={isFinished}
                  gameCount={games.length}
                  finalCount={finalCount}
                />

                {/* Quick Stats */}
                <div className="dashboard-card bg-slate-900 text-white border-none shadow-xl">
                  <div className="stitching-top opacity-20" />
                  <div className="p-6 relative z-10">
                    <h3 className="font-black mb-6 text-slate-500 text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                      <div className="w-1 h-3 bg-salami-red" />
                      Run Distribution
                    </h3>
                    <div className="space-y-4">
                      {games.slice(0, 6).map(game => (
                        <div key={game.gamePk} className="flex items-center justify-between border-b border-slate-800 pb-2 last:border-0">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              <img 
                                src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`} 
                                alt="" 
                                className="w-4 h-4 object-contain bg-white rounded-full p-0.5 border border-slate-700"
                                referrerPolicy="no-referrer"
                              />
                              <img 
                                src={`https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`} 
                                alt="" 
                                className="w-4 h-4 object-contain bg-white rounded-full p-0.5 border border-slate-700"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter">
                              {game.teams.away.team.name.split(' ').pop()} @ {game.teams.home.team.name.split(' ').pop()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {game.status.abstractGameState === 'Live' && game.linescore?.currentInningOrdinal && (
                              <span className="text-[8px] font-mono font-bold text-salami-red">
                                {game.linescore.isTopInning ? 'T' : 'B'}{game.linescore.currentInningOrdinal.replace(/[^0-9]/g, '')}
                              </span>
                            )}
                            <div className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                              <span className="text-xs font-black font-mono text-salami-red">
                                {((game.teams.away.score || 0) + (game.teams.home.score || 0)).toString().padStart(2, '0')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {games.length > 6 && (
                        <p className="text-[9px] text-slate-600 text-center pt-2 font-mono font-bold uppercase tracking-widest">
                          + {games.length - 6} Additional Matchups
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <InfoSection />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-12 border-t border-slate-200 dark:border-slate-800 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 text-[10px] font-mono font-black text-slate-400 uppercase tracking-[0.2em]">
            <a href="#how-it-works" className="hover:text-salami-red transition-colors">How it works</a>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <a href="https://www.mlb.com" target="_blank" rel="noreferrer" className="hover:text-salami-red transition-colors">MLB.com</a>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="text-slate-600">v1.0.4</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest">
            DATA PROVIDED BY MLB STATS API • UPDATES EVERY 60S
          </p>
          <p className="text-[9px] text-slate-600 font-mono mt-2">
            © {new Date().getFullYear()} GRAND SALAMI TRACKER • FOR ENTERTAINMENT PURPOSES ONLY
          </p>
        </div>
      </footer>
    </div>
  );
}
