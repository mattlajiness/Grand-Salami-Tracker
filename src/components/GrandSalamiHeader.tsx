import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Trophy, Sun, Moon, RefreshCw, Calendar, HelpCircle, LogIn, LogOut, User as UserIcon, Clock, Wind, Thermometer, Check, Twitter } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { MLBGame } from '../services/mlbService';
import { trackEvent } from '../lib/analytics';

interface GrandSalamiHeaderProps {
  currentTotal: number;
  gameCount: number;
  finalCount: number;
  liveCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date;
  games: MLBGame[];
}

export function GrandSalamiHeader({ 
  currentTotal, 
  gameCount, 
  finalCount, 
  liveCount,
  onRefresh,
  isRefreshing,
  lastUpdated,
  games
}: GrandSalamiHeaderProps) {
  const { user, signIn, signOut } = useAuth();
  const [relativeTime, setRelativeTime] = useState(formatDistanceToNow(lastUpdated, { addSuffix: true }));
  const [isSigningIn, setIsSigningIn] = useState(false);

  const isAdmin = user?.email?.toLowerCase() === 'mattlajiness@gmail.com';

  const weatherSummary = useMemo(() => {
    if (!games || !games.length) return null;
    const gamesWithWeather = games.filter(g => g?.weather?.temp && g?.weather?.wind);
    if (!gamesWithWeather.length) return null;

    const avgTemp = Math.round(gamesWithWeather.reduce((acc, g) => acc + (parseInt(g.weather!.temp) || 0), 0) / gamesWithWeather.length);
    const highWindGames = gamesWithWeather.filter(g => {
      const windStr = g.weather?.wind || '';
      const windMatch = windStr.match(/\d+/);
      const windSpeed = windMatch ? parseInt(windMatch[0]) : 0;
      return windSpeed > 12;
    }).length;

    return { avgTemp, highWindGames };
  }, [games]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTime(formatDistanceToNow(lastUpdated, { addSuffix: true }));
    }, 10000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    trackEvent('login_attempt', { method: 'google' });
    try {
      await signIn();
      trackEvent('login_success');
    } catch (error) {
      console.error('Sign in error:', error);
      trackEvent('login_error', { error: String(error) });
      toast.error('Sign in failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    if (isRefreshing) {
      setShowCheck(false);
    } else {
      // When refreshing stops, show checkmark briefly
      setShowCheck(true);
      const timer = setTimeout(() => setShowCheck(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isRefreshing]);

  return (
    <div className="dashboard-card p-6 mb-6 border-none shadow-2xl transition-colors duration-300 bg-slate-900 text-white">
      <div className="stitching-top opacity-50" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-salami-red to-transparent" />
      
      {/* Top Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center group">
            {/* The Baseball Body */}
            <div className="absolute inset-0 rounded-full bg-white border-2 border-slate-200 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform duration-500" />
            
            {/* The Seams and Salami */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-1.5 z-10 group-hover:rotate-12 transition-transform duration-500">
              {/* Left Seam */}
              <path 
                d="M 28 15 Q 48 50 28 85" 
                fill="none" 
                stroke="#e11d48" 
                strokeWidth="4" 
                strokeDasharray="3 3" 
                strokeLinecap="round"
              />
              {/* Right Seam */}
              <path 
                d="M 72 15 Q 52 50 72 85" 
                fill="none" 
                stroke="#e11d48" 
                strokeWidth="4" 
                strokeDasharray="3 3" 
                strokeLinecap="round"
              />
              
              {/* The Salami Log */}
              <g transform="rotate(-15 50 50)">
                {/* Main Log Body */}
                <rect 
                  x="22" 
                  y="38" 
                  width="56" 
                  height="24" 
                  rx="12" 
                  fill="#fb7185" 
                  className="shadow-sm"
                />
                {/* Salami Texture (Fat Spots) */}
                <circle cx="32" cy="46" r="2" fill="white" fillOpacity="0.7" />
                <circle cx="42" cy="54" r="1.5" fill="white" fillOpacity="0.6" />
                <circle cx="52" cy="44" r="2.2" fill="white" fillOpacity="0.8" />
                <circle cx="64" cy="52" r="1.8" fill="white" fillOpacity="0.5" />
                {/* Salami Casing Detail */}
                <rect 
                  x="22" 
                  y="38" 
                  width="56" 
                  height="24" 
                  rx="12" 
                  fill="none" 
                  stroke="#be123c" 
                  strokeWidth="1" 
                  strokeOpacity="0.3"
                />
              </g>
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black tracking-tighter text-lg leading-none text-white">GRAND SALAMI</span>
            </div>
            <span className="text-[8px] font-mono text-salami-red font-black tracking-[0.4em] mt-0.5 uppercase">Live Tracker</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[10px] font-black uppercase tracking-tighter leading-none text-white">{user.displayName}</span>
                <span className={cn(
                  "text-[8px] font-mono uppercase tracking-widest mt-0.5",
                  isAdmin ? "text-blue-400 font-black" : "text-slate-500"
                )}>
                  {isAdmin ? 'ADMIN ACCESS' : 'PRO MEMBER'}
                </span>
              </div>
              <button 
                onClick={() => signOut()}
                className="p-2 rounded-lg border transition-all active:scale-95 group bg-slate-800 hover:bg-slate-700 border-slate-700"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-salami-red" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="flex items-center gap-2 px-3 py-1.5 bg-salami-red hover:bg-red-700 rounded-lg transition-all text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-red-900/20 active:scale-95 disabled:opacity-50"
            >
              {isSigningIn ? <RefreshCw className="w-3 h-3 animate-spin" /> : <LogIn className="w-3 h-3" />}
              Sign In
            </button>
          )}

          <button 
            onClick={() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[9px] font-mono font-black uppercase tracking-widest bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
            title="Knowledge Base"
          >
            <HelpCircle className="w-3 h-3 text-salami-red" />
            <span className="hidden sm:inline">Knowledge Base</span>
            <span className="sm:hidden">KB</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-[9px] font-mono px-3 py-1.5 rounded-full border text-slate-400 bg-slate-800 border-slate-700">
            <Calendar className="w-3 h-3 text-salami-red" />
            {format(new Date(), 'MMM dd').toUpperCase()}
          </div>

          <a 
            href="https://twitter.com/Salamipace" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[9px] font-mono font-black uppercase tracking-widest bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 group"
            title="Follow @Salamipace"
          >
            <Twitter className="w-3 h-3 text-[#1DA1F2] group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline">@Salamipace</span>
          </a>

          {weatherSummary && (
            <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-slate-700 bg-slate-800/50">
              <div className="flex items-center gap-1.5">
                <Thermometer className="w-3 h-3 text-salami-red" />
                <span className="text-[8px] sm:text-[9px] font-mono font-black text-slate-300">{weatherSummary.avgTemp}° AVG</span>
              </div>
              {weatherSummary.highWindGames > 0 && (
                <div className="flex items-center gap-1.5 border-l border-slate-700 pl-2 sm:pl-3">
                  <Wind className="w-3 h-3 text-blue-400" />
                  <span className="text-[8px] sm:text-[9px] font-mono font-black text-slate-300">{weatherSummary.highWindGames} WINDY</span>
                </div>
              )}
            </div>
          )}
          
          <button 
            onClick={() => {
              trackEvent('refresh_data');
              onRefresh();
            }}
            disabled={isRefreshing}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 sm:p-2 rounded-lg border transition-all disabled:opacity-50 active:scale-95 relative overflow-hidden",
              isRefreshing 
                ? "bg-slate-800 border-salami-red/50 shadow-[0_0_15px_rgba(225,29,72,0.2)]" 
                : "bg-slate-900 hover:bg-slate-800 border-slate-700 active:border-salami-red/50",
              showCheck && !isRefreshing ? "border-green-500/50 bg-green-500/5" : ""
            )}
          >
            <AnimatePresence mode="wait">
              {isRefreshing ? (
                <motion.div
                  key="refreshing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-salami-red animate-spin" />
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-salami-red rounded-full -z-10"
                  />
                </motion.div>
              ) : showCheck ? (
                <motion.div
                  key="check"
                  initial={{ opacity: 0, scale: 0.5, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="flex items-center justify-center"
                >
                  <Check className="w-3.5 h-3.5 text-green-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="sm:hidden text-[9px] font-mono font-black text-white uppercase tracking-widest leading-none">
              {isRefreshing ? 'Syncing' : 'Refresh'}
            </span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-lg bg-slate-800 border-slate-700">
              <Trophy className="w-5 h-5 text-salami-red" />
            </div>
            <div>
              <span className="data-label block">Grand Salami Tracker</span>
              <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-[0.2em]">Major League Baseball</h2>
            </div>
          </div>
          
          <div className="flex items-end gap-4">
            <div 
              className="font-mono font-black tracking-tighter px-4 py-2 rounded-lg border-2 transition-all duration-300 shadow-inner text-5xl sm:text-7xl md:text-8xl min-w-[140px] sm:min-w-[160px] text-center bg-slate-950 border-slate-900 text-salami-red shadow-[0_0_30px_rgba(225,29,72,0.15)]"
              style={{
                textShadow: '0 0 15px rgba(225, 29, 72, 0.7), 0 0 30px rgba(225, 29, 72, 0.3)'
              }}
            >
              {(currentTotal || 0).toString().padStart(3, '0')}
            </div>
            <div className="pb-2">
              <span className="text-salami-red font-mono font-black text-2xl block leading-none tracking-tighter">RUNS</span>
              <span className="text-slate-500 font-mono text-[10px] block mt-1 uppercase">Total Scored</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 md:gap-12 p-6 rounded-2xl border backdrop-blur-sm bg-slate-800/50 border-slate-700/50">
          <div className="flex flex-col items-center">
            <span className="data-label mb-1">Slate</span>
            <span className="text-3xl font-mono font-black text-white">{gameCount}</span>
            <span className="text-[8px] font-mono text-slate-600 uppercase mt-1">Games</span>
          </div>
          <div className="flex flex-col items-center border-x px-6 md:px-12 border-slate-700">
            <span className="data-label mb-1">Final</span>
            <span className="text-3xl font-mono font-black text-green-400">{finalCount}</span>
            <span className="text-[8px] font-mono text-slate-600 uppercase mt-1">Complete</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="data-label mb-1">Live</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-mono font-black text-salami-red">{liveCount}</span>
              {liveCount > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-3 h-3 rounded-full bg-salami-red shadow-[0_0_10px_rgba(225,29,72,0.8)]"
                />
              )}
            </div>
            <span className="text-[8px] font-mono text-slate-600 uppercase mt-1">In Play</span>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-slate-800">
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 font-bold">
            <div className="relative flex items-center justify-center w-3 h-3">
              <Activity className="w-3 h-3 text-salami-red relative z-10" />
              <motion.div 
                animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-salami-red rounded-full"
              />
            </div>
            <span className="tracking-widest">REAL-TIME FEED</span>
            <div className="flex items-center gap-1.5 text-[8px] text-slate-600 ml-2 px-2 py-0.5 rounded border bg-slate-800/50 border-slate-700/50">
              <Clock className="w-2.5 h-2.5" />
              <span>{relativeTime.toUpperCase()}</span>
            </div>
          </div>
          
          <div className="flex sm:hidden items-center gap-2">
            <span className="text-[10px] font-mono font-black text-slate-400">
              {Math.round((finalCount / (gameCount || 1)) * 100)}%
            </span>
            <span className="text-[8px] font-mono text-slate-600 uppercase">CLOSED</span>
          </div>
        </div>

        <div className="w-full sm:flex-1 h-2 rounded-full overflow-hidden border shadow-inner bg-slate-800 border-slate-700">
          <motion.div 
            className="h-full bg-gradient-to-r from-salami-red to-red-400 shadow-[0_0_10px_rgba(225,29,72,0.4)]"
            initial={{ width: 0 }}
            animate={{ width: `${(finalCount / (gameCount || 1)) * 100}%` }}
          />
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[10px] font-mono font-black text-slate-400">
            {Math.round((finalCount / (gameCount || 1)) * 100)}%
          </span>
          <span className="text-[8px] font-mono text-slate-600 uppercase">CLOSED</span>
        </div>
      </div>
    </div>
  );
}
