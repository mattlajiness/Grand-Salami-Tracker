import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Trophy, Sun, Moon, RefreshCw, Calendar, HelpCircle, LogIn, LogOut, User as UserIcon, Clock, Wind, Thermometer, Check, Twitter, UserPlus, Target, AlertTriangle } from 'lucide-react';
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
  betLine?: number | '';
  betType?: 'over' | 'under';
  projectedTotal?: number | null;
  isFinished?: boolean;
  weatherSummary?: { avgTemp: number; highWindGames: number } | null;
}

export function GrandSalamiHeader({ 
  currentTotal, 
  gameCount, 
  finalCount, 
  liveCount,
  onRefresh,
  isRefreshing,
  lastUpdated,
  games,
  betLine = '',
  betType = 'over',
  projectedTotal = null,
  isFinished = false,
  weatherSummary = null
}: GrandSalamiHeaderProps) {
  const { user, signIn, signOut } = useAuth();
  const [relativeTime, setRelativeTime] = useState(formatDistanceToNow(lastUpdated, { addSuffix: true }));
  const [isSigningIn, setIsSigningIn] = useState(false);

  const isAdmin = user?.email?.toLowerCase() === 'mattlajiness@gmail.com';

  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTime(formatDistanceToNow(lastUpdated, { addSuffix: true }));
    }, 10000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const handleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIframe = window.self !== window.top;

    const toastId = toast.loading('Connecting to Google...');
    trackEvent('login_attempt', { method: 'google', isMobile, isIframe });
    
    try {
      await signIn();
      trackEvent('login_success');
      toast.success('Successfully authenticated!', { id: toastId });
    } catch (error: any) {
      console.error('Sign in error:', error);
      trackEvent('login_error', { error: String(error), code: error?.code });
      
      if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/popup-closed-by-user' || (isMobile && isIframe)) {
        toast.error('Sign-in window blocked or failed.', {
          id: toastId,
          description: 'Mobile browsers often block login inside an iframe. Click "Open Site" to fix.',
          action: {
            label: 'Open Site',
            onClick: () => {
              window.open(window.location.href, '_blank');
              trackEvent('open_tab_fallback_click');
            }
          },
          duration: 10000
        });
      } else {
        toast.error('Sign in failed. Please try again.', { id: toastId });
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const [showCheck, setShowCheck] = useState(false);
  const prevRefreshing = useRef(isRefreshing);

  useEffect(() => {
    if (prevRefreshing.current && !isRefreshing) {
      // When refreshing stops, show checkmark briefly
      setShowCheck(true);
      const timer = setTimeout(() => setShowCheck(false), 2000);
      return () => clearTimeout(timer);
    }
    prevRefreshing.current = isRefreshing;
  }, [isRefreshing]);

  const getStatus = () => {
    if (betLine === '') return null;
    const line = parseFloat(betLine.toString());
    if (isFinished) {
      if (currentTotal === line) return 'PUSH';
      const won = betType === 'over' ? currentTotal > line : currentTotal < line;
      return won ? 'WON' : 'LOST';
    }
    if (projectedTotal === null) return 'CALIBRATING';
    if (betType === 'over') {
      if (currentTotal > line) return 'WINNING';
      return (projectedTotal || 0) > line ? 'ON TRACK' : 'BEHIND';
    } else {
      if (currentTotal > line) return 'LOST';
      return (projectedTotal || 0) < line ? 'ON TRACK' : 'DANGER';
    }
  };

  const status = getStatus();

  return (
    <div className="space-y-4">
      {/* Mobile Iframe Alert - Proactive Escape */}
      {!user && window.self !== window.top && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-3 flex items-center justify-between gap-4 sm:hidden"
        >
          <div className="flex items-center gap-3">
            <UserPlus className="w-4 h-4 text-blue-400" />
            <p className="text-[10px] font-mono text-slate-300 font-bold uppercase tracking-tight leading-tight">
              Trouble joining on mobile? 
            </p>
          </div>
          <button 
            onClick={() => window.open(window.location.href, '_blank')}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-[9px] font-black uppercase tracking-widest text-white whitespace-nowrap"
          >
            Open in Browser
          </button>
        </motion.div>
      )}

      <div className="dashboard-card p-4 sm:p-6 mb-6 border-none shadow-2xl transition-colors duration-300 bg-slate-900 text-white">
      <div className="stitching-top opacity-50" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-salami-red to-transparent" />
      
      {/* Top Header Section */}
      <div className="flex items-center justify-between gap-4 mb-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center group">
            {/* The Baseball Body */}
            <div className="absolute inset-0 rounded-full bg-white border-2 border-slate-200 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform duration-500" />
            
            {/* The Seams and Salami */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-1 sm:p-1.5 z-10 group-hover:rotate-12 transition-transform duration-500">
              <path 
                d="M 28 15 Q 48 50 28 85" 
                fill="none" 
                stroke="#e11d48" 
                strokeWidth="4" 
                strokeDasharray="3 3" 
                strokeLinecap="round"
              />
              <path 
                d="M 72 15 Q 52 50 72 85" 
                fill="none" 
                stroke="#e11d48" 
                strokeWidth="4" 
                strokeDasharray="3 3" 
                strokeLinecap="round"
              />
              <g transform="rotate(-15 50 50)">
                <rect 
                  x="22" y="38" width="56" height="24" rx="12" 
                  fill="#fb7185" 
                  className="shadow-sm"
                />
                <circle cx="32" cy="46" r="2" fill="white" fillOpacity="0.7" />
                <circle cx="42" cy="54" r="1.5" fill="white" fillOpacity="0.6" />
                <circle cx="52" cy="44" r="2.2" fill="white" fillOpacity="0.8" />
                <circle cx="64" cy="52" r="1.8" fill="white" fillOpacity="0.5" />
                <rect 
                  x="22" y="38" width="56" height="24" rx="12" 
                  fill="none" 
                  stroke="#be123c" 
                  strokeWidth="1" 
                  strokeOpacity="0.3"
                />
              </g>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-black tracking-tighter text-sm sm:text-lg leading-none text-white whitespace-nowrap">GRAND SALAMI</span>
            <span className="text-[7px] sm:text-[8px] font-mono text-salami-red font-black tracking-[0.3em] sm:tracking-[0.4em] mt-0.5 uppercase mb-1">Live Tracker</span>
          </div>
        </div>

        {/* User Auth & Date (Top Right) */}
        <div className="flex items-center gap-3">
          <div className="hidden xs:flex items-center gap-2 text-[9px] font-mono px-2 py-1 rounded-full border text-slate-500 bg-slate-800/50 border-slate-800">
            <Calendar className="w-2.5 h-2.5 text-salami-red" />
            {format(new Date(), 'MMM dd').toUpperCase()}
          </div>

          <div className="w-[1px] h-4 bg-slate-800 hidden xs:block" />

          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end mr-1">
                <span className="text-[9px] font-black uppercase tracking-tighter leading-none text-white">{user.displayName?.split(' ')[0]}</span>
                <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest leading-none mt-0.5">{isAdmin ? 'ADMIN' : 'PRO'}</span>
              </div>
              <button 
                onClick={() => signOut()}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 transition-all active:scale-95 text-slate-400 hover:text-salami-red"
                title="Sign Out"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-all text-[8px] font-black uppercase tracking-widest text-slate-300"
              >
                <LogIn className="w-2.5 h-2.5 text-salami-red" />
                <span>Sign In</span>
              </button>
              <button 
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="flex items-center gap-1.5 px-2 py-1 bg-salami-red hover:bg-red-700 rounded-md transition-all text-[8px] font-black uppercase tracking-widest text-white shadow-lg shadow-red-900/20"
              >
                <UserPlus className="w-2.5 h-2.5" />
                <span>JOIN</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-start gap-2">
          <button 
            onClick={() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[9px] font-mono font-black uppercase tracking-widest bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
          >
            <HelpCircle className="w-3 h-3 text-salami-red" />
            <span className="hidden sm:inline">Knowledge Base</span>
            <span className="sm:hidden">KB</span>
          </button>

          <a 
            href="https://twitter.com/Salamipace" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[9px] font-mono font-black uppercase tracking-widest bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 group"
          >
            <Twitter className="w-3 h-3 text-[#1DA1F2]" />
            <span className="hidden md:inline">@Salamipace</span>
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-start sm:justify-end gap-3 w-full sm:w-auto">

          {betLine !== '' && (
            <div className="flex sm:hidden flex-col items-start gap-1">
              <div className="flex items-center gap-1 opacity-50 px-1">
                <Target className="w-2.5 h-2.5 text-blue-400" />
                <span className="text-[7px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400">Live Wager</span>
              </div>
              <div className={cn(
                "flex items-center gap-3 px-3 py-1.5 rounded-full border shadow-lg",
                status === 'WON' || status === 'WINNING' || status === 'ON TRACK' ? "bg-green-500/10 border-green-500/30 text-green-400" :
                status === 'PUSH' ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                "bg-red-500/10 border-red-500/30 text-red-500"
              )}>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-mono font-bold leading-none">{betType.toUpperCase()} {betLine}</span>
                  <span className="text-[6px] font-mono opacity-60 uppercase mt-0.5">Your Bet</span>
                </div>
                <div className="w-[1px] h-4 bg-slate-700/50" />
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono font-black leading-none">{projectedTotal || '---'}</span>
                    <span className="text-[6px] font-mono opacity-60 uppercase">PROJ</span>
                  </div>
                  <span className="text-[6px] font-mono font-black uppercase tracking-tighter">{status}</span>
                </div>
              </div>
            </div>
          )}

          {weatherSummary && (
            <div className="flex flex-col items-start sm:items-end gap-1">
              <div className="flex items-center gap-1 opacity-50 px-1">
                <div className="w-1 h-1 rounded-full bg-salami-red" />
                <span className="text-[7px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400">Daily Conditions</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-slate-700 bg-slate-800/50 shadow-lg shadow-black/20">
                <div className="flex items-center gap-1.5">
                  <Thermometer className="w-3 h-3 text-salami-red" />
                  <div className="flex flex-col">
                    <span className="text-[8px] sm:text-[10px] font-mono font-black text-white leading-none">{weatherSummary.avgTemp}°</span>
                    <span className="text-[6px] font-mono text-slate-500 font-bold uppercase tracking-tighter">AVG TMP</span>
                  </div>
                </div>
                {weatherSummary.highWindGames > 0 && (
                  <div className="flex items-center gap-1.5 border-l border-slate-700 pl-1.5 sm:pl-3">
                    <Wind className="w-3 h-3 text-blue-400" />
                    <div className="flex flex-col">
                      <span className="text-[8px] sm:text-[10px] font-mono font-black text-white leading-none">{weatherSummary.highWindGames}</span>
                      <span className="text-[6px] font-mono text-slate-500 font-bold uppercase tracking-tighter">WINDY</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <button 
            onClick={() => {
              trackEvent('refresh_data');
              onRefresh();
            }}
            disabled={isRefreshing}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 sm:p-2.5 rounded-lg border transition-all disabled:opacity-50 active:scale-95 relative overflow-hidden",
              isRefreshing 
                ? "bg-slate-800 border-salami-red/50 shadow-[0_0_15px_rgba(225,29,72,0.2)]" 
                : "bg-slate-900 hover:bg-slate-800 border-slate-700 active:border-salami-red/50",
              showCheck && !isRefreshing ? "border-green-500/50 bg-green-500/5" : ""
            )}
          >
            <AnimatePresence mode="wait">
              {isRefreshing ? (
                <div key="refreshing" className="relative">
                  <RefreshCw className="w-3.5 h-3.5 text-salami-red animate-spin" />
                </div>
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-8 relative z-10">
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
  </div>
  );
}
