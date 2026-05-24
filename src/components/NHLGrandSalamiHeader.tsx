import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, Calendar, HelpCircle, LogIn, LogOut, Clock, Thermometer, Check, Twitter, UserPlus, ShoppingBag, Activity } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { NHLGame } from '../services/nhlService';
import { trackEvent } from '../lib/analytics';
import { SalamiLogo } from './SalamiLogo';

interface NHLGrandSalamiHeaderProps {
  currentTotal: number;
  homeTotal?: number;
  awayTotal?: number;
  gameCount: number;
  finalCount: number;
  liveCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date;
  games: NHLGame[];
  betLine?: number | '';
  betType?: 'over' | 'under';
  projectedTotal?: number | null;
  isFinished?: boolean;
}

export function NHLGrandSalamiHeader({ 
  currentTotal, 
  homeTotal = 0,
  awayTotal = 0,
  gameCount, 
  finalCount, 
  liveCount,
  onRefresh,
  isRefreshing,
  lastUpdated,
  betLine = '',
  betType = 'over',
  projectedTotal = null,
  isFinished = false,
}: NHLGrandSalamiHeaderProps) {
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
    
    try {
      await signIn();
      trackEvent('login_success');
      toast.success('Successfully authenticated!', { id: toastId });
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error?.code === 'auth/popup-blocked' || (isMobile && isIframe)) {
        toast.error('Sign-in window blocked or failed.', {
          id: toastId,
          action: {
            label: 'Open Site',
            onClick: () => window.open(window.location.href, '_blank')
          },
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
      <div className="dashboard-card p-4 sm:p-6 mb-6 border-none shadow-2xl transition-colors duration-300 bg-slate-900 text-white">
        <div className="stitching-top opacity-50" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent" />
        
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full" />
              <SalamiLogo className="w-12 h-12 relative z-10" sport="NHL" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-mono font-black tracking-tighter text-sm sm:text-xl leading-none text-white whitespace-nowrap uppercase">
                  NHL GRAND SALAMI
                </h1>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[6px] font-black text-blue-400 uppercase tracking-widest leading-none">WIP</span>
              </div>
              <span className="text-[7px] sm:text-[9px] font-mono text-blue-500 font-black tracking-[0.3em] sm:tracking-[0.4em] mt-0.5 uppercase mb-1">Hockey Live Tracker</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden xs:flex items-center gap-2 text-[9px] font-mono px-2 py-1 rounded-full border text-slate-500 bg-slate-800/50 border-slate-800">
              <Calendar className="w-2.5 h-2.5 text-blue-500" />
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
                  className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 transition-all active:scale-95 text-slate-400 hover:text-blue-500"
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
                  <LogIn className="w-2.5 h-2.5 text-blue-500" />
                  <span>Sign In</span>
                </button>
                <button 
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="flex items-center gap-1.5 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded-md transition-all text-[8px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/20"
                >
                  <UserPlus className="w-2.5 h-2.5" />
                  <span>JOIN</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div className="flex flex-wrap items-center justify-start gap-2">
            <button 
              type="button"
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[9px] font-mono font-black uppercase tracking-widest bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 select-none touch-manipulation"
            >
              <HelpCircle className="w-3 h-3 text-blue-500" />
              <span className="hidden sm:inline">How it Works</span>
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
            <button 
              onClick={() => {
                trackEvent('refresh_data');
                onRefresh();
              }}
              disabled={isRefreshing}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 sm:p-2.5 rounded-lg border transition-all disabled:opacity-50 active:scale-95 relative overflow-hidden",
                isRefreshing 
                  ? "bg-slate-800 border-blue-600/50 shadow-[0_0_15px_rgba(37,99,235,0.2)]" 
                  : "bg-slate-900 hover:bg-slate-800 border-slate-700 active:border-blue-600/50",
                showCheck && !isRefreshing ? "border-green-500/50 bg-green-500/5" : ""
              )}
            >
              <AnimatePresence mode="wait">
                {isRefreshing ? (
                  <div key="refreshing" className="relative">
                    <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
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
                <Trophy className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <span className="data-label block">Grand Salami Tracker</span>
                <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-[0.2em]">National Hockey League</h2>
              </div>
            </div>
            
            <div className="flex items-end gap-4 select-none touch-manipulation">
              <div 
                className="font-mono font-black tracking-tighter px-4 py-2 rounded-lg border-2 transition-all duration-300 shadow-inner text-5xl sm:text-7xl md:text-8xl min-w-[140px] sm:min-w-[160px] text-center bg-slate-950 border-slate-900 text-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.15)]"
                style={{
                  textShadow: '0 0 15px rgba(37, 99, 235, 0.7), 0 0 30px rgba(37, 99, 235, 0.3)'
                }}
              >
                {(currentTotal || 0).toString().padStart(3, '0')}
              </div>
              <div className="pb-2">
                <span className="text-blue-500 font-mono font-black text-2xl block leading-none tracking-tighter">GOALS</span>
                <span className="text-slate-500 font-mono text-[10px] block mt-1 uppercase">Total Scored</span>
              </div>
            </div>

            {/* Split Scorecard Widget for Home/Away Tracker */}
            <div className="flex items-center gap-3 mt-4 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950/60 max-w-[280px]">
              <div className="flex-1 text-center">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block mb-0.5">Away Goals</span>
                <span className="text-lg font-mono font-black text-rose-400">{awayTotal}</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-800" />
              <div className="flex-1 text-center">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block mb-0.5">Home Goals</span>
                <span className="text-lg font-mono font-black text-emerald-400">{homeTotal}</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-800" />
              <div className="flex-1 text-center">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block mb-0.5">Spread</span>
                <span className="text-xs font-mono font-black text-blue-400 block mt-0.5">
                  {homeTotal === awayTotal ? 'EVEN' : homeTotal > awayTotal ? `H -${homeTotal - awayTotal}` : `A -${awayTotal - homeTotal}`}
                </span>
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
                <span className="text-3xl font-mono font-black text-blue-500">{liveCount}</span>
                {liveCount > 0 && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.8)]"
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
                <Activity className="w-3 h-3 text-blue-500 relative z-10" />
              </div>
              <span className="tracking-widest">REAL-TIME FEED</span>
              <div className="flex items-center gap-1.5 text-[8px] text-slate-600 ml-2 px-2 py-0.5 rounded border bg-slate-800/50 border-slate-700/50">
                <Clock className="w-2.5 h-2.5" />
                <span>{relativeTime.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="w-full sm:flex-1 h-2 rounded-full overflow-hidden border shadow-inner bg-slate-800 border-slate-700">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
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
