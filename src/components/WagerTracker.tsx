import { useState, useEffect, useRef, useMemo } from 'react';
import { Target, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, XCircle, Bell, BellOff, Save, Cloud, RefreshCw, Activity, Trophy, Frown, Sparkles, History, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, getDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';
import { trackEvent } from '../lib/analytics';
import { calculateSmartProjection, getConfidenceScore } from '../lib/projectionEngine';
import confetti from 'canvas-confetti';

interface WagerTrackerProps {
  currentTotal: number;
  playedInnings: number;
  totalExpectedInnings: number;
  isFinished: boolean;
  gameCount: number;
  finalCount: number;
  liveThreats?: number;
  betLine: number | '';
  setBetLine: (val: number | '') => void;
  betType: 'over' | 'under';
  setBetType: (val: 'over' | 'under') => void;
  projectedTotal: number | null;
  onOpenHistory?: () => void;
  todayStr?: string;
  currentStreak?: { type: 'WIN' | 'LOSS' | 'PUSH'; count: number } | null;
  sport?: 'MLB' | 'NHL';
  historicalTotals?: Record<string, number>;
  userWagers?: any[];
}

export function WagerTracker({ 
  currentTotal, 
  playedInnings, 
  totalExpectedInnings, 
  isFinished,
  gameCount,
  finalCount,
  liveThreats = 0,
  betLine,
  setBetLine,
  betType,
  setBetType,
  projectedTotal,
  onOpenHistory,
  todayStr,
  currentStreak,
  sport = 'MLB',
  historicalTotals = {},
  userWagers = []
}: WagerTrackerProps) {
  const isMLB = sport === 'MLB';
  const unitName = isMLB ? 'runs' : 'goals';
  const shortUnit = isMLB ? 'R/G' : 'G/G';
  const timeUnit = isMLB ? 'innings' : 'periods';
  const gameUnit = isMLB ? 'innings' : 'periods';
  const gameStandard = isMLB ? 9 : 3;
  const { user, profile, updateProfile } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const notificationsEnabled = profile?.notificationsEnabled ?? true;

  const lastNotifiedStatus = useRef<string | null>(null);
  const notifiedKeys = useRef<Set<string>>(new Set());
  const hasShownIframeTip = useRef<boolean>(false);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [historicalResult, setHistoricalResult] = useState<{
    line: number;
    total: number;
    status: 'WON' | 'LOST' | 'PUSH';
    date: string;
  } | null>(null);
  const today = todayStr || format(new Date(), 'yyyy-MM-dd');

  // Save to LocalStorage ONLY (for non-logged in persistence between sessions)
  useEffect(() => {
    if (!user && betLine !== '') {
      localStorage.setItem(`${sport}_salami_bet_line`, betLine.toString());
      localStorage.setItem(`${sport}_salami_bet_type`, betType);
      localStorage.setItem(`${sport}_salami_bet_date`, today);
    }
  }, [betLine, betType, user, sport, today]);

  const handleSave = async () => {
    if (betLine === '') {
      toast.error('Please enter a bet line first');
      return;
    }

    setIsSyncing(true);
    try {
      trackEvent('manual_save_wager', { line: betLine, side: betType, sport });
      if (user) {
        const wagerDoc = doc(db, 'users', user.uid, 'wagers', `${sport}_${today}`);
        await setDoc(wagerDoc, {
          userId: user.uid,
          line: betLine,
          side: betType.toUpperCase(),
          date: today,
          sport,
          createdAt: Timestamp.now()
        });
        setLastSynced(new Date());
        toast.success('WAGER SAVED TO CLOUD ☁️', {
          description: `Tracking ${betType.toUpperCase()} ${betLine} for today.`
        });
      } else {
        localStorage.setItem('salami_bet_line', betLine.toString());
        localStorage.setItem('salami_bet_type', betType);
        toast.success('WAGER SAVED LOCALLY 💾', {
          description: 'Sign in to build your Salami Streak and sync across devices!'
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/wagers/${today}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClear = async () => {
    setBetLine('');
    trackEvent('clear_wager', { platform: user ? 'cloud' : 'local' });
    
    if (user) {
      setIsSyncing(true);
      try {
        const wagerDoc = doc(db, 'users', user.uid, 'wagers', `${sport}_${today}`);
        await deleteDoc(wagerDoc);
        setLastSynced(null);
        toast.info('WAGER REMOVED FROM CLOUD 🗑️');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/wagers/${today}`);
      } finally {
        setIsSyncing(false);
      }
    } else {
      localStorage.removeItem(`${sport}_salami_bet_line`);
      localStorage.removeItem(`${sport}_salami_bet_type`);
      localStorage.removeItem(`${sport}_salami_bet_date`);
      toast.info('WAGER CLEARED');
    }
  };

  const completionPercentage = totalExpectedInnings > 0 
    ? Math.round((playedInnings / totalExpectedInnings) * 100) 
    : 0;

  const confidence = getConfidenceScore(completionPercentage);

  const isStabilizing = playedInnings > 0 && playedInnings < 3;

  const remainingInnings = totalExpectedInnings - playedInnings;
  const currentPace = playedInnings > 0 ? (currentTotal / playedInnings) * gameStandard : 0;
  
  const linePace = (betLine !== '' && totalExpectedInnings > 0) ? (parseFloat(betLine.toString()) / totalExpectedInnings) * gameStandard : 0;
  
  const requiredPace = (betLine !== '' && remainingInnings > 0) 
    ? ((parseFloat(betLine.toString()) - currentTotal) / remainingInnings) * gameStandard
    : 0;

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
      // If Over bet hits the line mid-game, it is WON (Settled)
      if (currentTotal > line) return 'WON';
      return projectedTotal > line ? 'ON TRACK' : 'BEHIND';
    } else {
      // If Under bet exceeds the line mid-game, it is LOST (Settled)
      if (currentTotal > line) return 'LOST';
      return projectedTotal < line ? 'ON TRACK' : 'DANGER';
    }
  };

  const status = getStatus();

  const playSound = (type: 'win' | 'loss') => {
    const audio = new Audio(
      type === 'win' 
        ? 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3' // Success chime
        : 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3' // Subtle error/loss
    );
    audio.volume = 0.4;
    audio.play().catch(e => console.log('Audio play blocked:', e));
  };

  const triggerWinCelebration = () => {
    if (typeof window === 'undefined') return;

    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      try {
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
        });
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
        });
      } catch (err) {
        console.error('Confetti error caught:', err);
        clearInterval(interval);
      }
    }, 250);
  };

  // Notification Logic
  useEffect(() => {
    // We allow WON/LOST mid-game (settled), but PUSH requires isFinished
    if (!notificationsEnabled || !status || betLine === '') return;
    
    // If not finished, we only notify if it's already WON or LOST (early settlement)
    if (!isFinished && status !== 'WON' && status !== 'LOST') return;

    const notificationKey = `notified_${today}_${betLine}_${betType}_${status}`;
    const alreadyNotified = localStorage.getItem(notificationKey) || notifiedKeys.current.has(notificationKey);

    if (alreadyNotified) return;

    // 1. Terminal States (WON/LOST/PUSH) - Wager is notified when settled either mid-game or at end
    if (status === 'WON' && lastNotifiedStatus.current !== 'WON') {
      playSound('win');
      triggerWinCelebration();
      setShowResultModal(true);
      const msg = isFinished ? "SLATE FINAL" : "LEVEL REACHED EARLY";
      const toastId = `wager-won-${today}`;
      toast.success('WAGER WON! 🏆', {
        id: toastId,
        description: `${msg} - Total: ${currentTotal} (Line: ${betLine})`,
        duration: 15000,
      });
      sendBrowserNotification('WAGER WON! 🏆', `Status: ${msg}. Final Total: ${currentTotal} (Line: ${betLine})`);
      lastNotifiedStatus.current = 'WON';
      notifiedKeys.current.add(notificationKey);
      localStorage.setItem(notificationKey, 'true');
    } else if (status === 'PUSH' && isFinished && lastNotifiedStatus.current !== 'PUSH') {
      playSound('win');
      setShowResultModal(true);
      const toastId = `wager-push-${today}`;
      toast.info('WAGER PUSHED 🤝', {
        id: toastId,
        description: `Total: ${currentTotal} (Line: ${betLine})`,
        duration: 15000,
      });
      sendBrowserNotification('WAGER PUSHED 🤝', `Final Total: ${currentTotal} (Line: ${betLine})`);
      lastNotifiedStatus.current = 'PUSH';
      notifiedKeys.current.add(notificationKey);
      localStorage.setItem(notificationKey, 'true');
    } else if (status === 'LOST' && lastNotifiedStatus.current !== 'LOST') {
      playSound('loss');
      setShowResultModal(true);
      const msg = isFinished ? "SLATE FINAL" : "LINE EXCEEDED";
      const toastId = `wager-lost-${today}`;
      toast.error('WAGER LOST ❌', {
        id: toastId,
        description: `${msg} - Total: ${currentTotal} (Line: ${betLine})`,
        duration: 15000,
      });
      sendBrowserNotification('WAGER LOST ❌', `Status: ${msg}. Total: ${currentTotal} (Line: ${betLine})`);
      lastNotifiedStatus.current = 'LOST';
      notifiedKeys.current.add(notificationKey);
      localStorage.setItem(notificationKey, 'true');
    } 
  }, [status, notificationsEnabled, currentTotal, betLine, projectedTotal, betType, isFinished, today]);

  // Historical Settlement Check (Handles "Next Day" notifications)
  useEffect(() => {
    if (!notificationsEnabled || !historicalTotals || Object.keys(historicalTotals).length === 0) return;

    const checkSettlement = (wager: { line: number, side: string, date: string }) => {
      if (wager.date === today) return;
      
      const finalTotal = historicalTotals[wager.date];
      if (finalTotal === undefined) return;

      const side = wager.side.toUpperCase();
      const isPush = finalTotal === wager.line;
      const isWin = !isPush && (side === 'OVER' ? finalTotal > wager.line : finalTotal < wager.line);
      const resStatus = isWin ? 'WON' : isPush ? 'PUSH' : 'LOST';

      const notificationKey = `notified_settlement_${sport}_${wager.date}_${wager.line}_${side}_${resStatus}`;
      if (!localStorage.getItem(notificationKey) && !notifiedKeys.current.has(notificationKey)) {
        setHistoricalResult({
          line: wager.line,
          total: finalTotal,
          status: resStatus,
          date: wager.date
        });
        
        // Trigger celebration if it was a win
        if (resStatus === 'WON') {
          playSound('win');
          triggerWinCelebration();
        } else if (resStatus === 'LOST') {
          playSound('loss');
        } else {
          playSound('win');
        }

        setShowResultModal(true);
        notifiedKeys.current.add(notificationKey);
        localStorage.setItem(notificationKey, 'true');
        
        const title = resStatus === 'WON' ? 'PAST WAGER WON! 🏆' : resStatus === 'PUSH' ? 'PAST WAGER PUSHED 🤝' : 'PAST WAGER LOST ❌';
        const body = `Your wager for ${wager.date} settled at ${finalTotal} (Line: ${wager.line})`;
        const toastId = `historical-settlement-${sport}-${wager.date}`;
        
        toast(title, {
          id: toastId,
          description: body,
          duration: 20000,
        });
        sendBrowserNotification(title, body);
      }
    };

    if (user && userWagers.length > 0) {
      // Find the most recent wager that isn't today
      const pastWagers = userWagers.filter(w => w.date !== today);
      if (pastWagers.length > 0) {
        checkSettlement({
          line: pastWagers[0].line,
          side: pastWagers[0].side,
          date: pastWagers[0].date
        });
      }
    } else if (!user) {
      const savedLine = localStorage.getItem(`${sport}_salami_bet_line`);
      const savedType = localStorage.getItem(`${sport}_salami_bet_type`);
      const savedDate = localStorage.getItem(`${sport}_salami_bet_date`);
      
      if (savedLine && savedType && savedDate) {
        checkSettlement({
          line: parseFloat(savedLine),
          side: savedType,
          date: savedDate
        });
      }
    }
  }, [historicalTotals, userWagers, user, today, sport, notificationsEnabled]);

  // Proactive Permission Check
  useEffect(() => {
    if (notificationsEnabled && betLine !== '' && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      } else if (Notification.permission === "denied") {
        // Only toast once per session if denied but feature is "on"
        const sessionKey = 'denied_notified';
        if (!sessionStorage.getItem(sessionKey)) {
          toast.warning('NOTIFICATIONS BLOCKED 🚫', {
            description: 'Check your browser settings to allow SALAMI-PACE alerts.'
          });
          sessionStorage.setItem(sessionKey, 'true');
        }
      }
    }
  }, [notificationsEnabled, betLine]);

  const sendBrowserNotification = (title: string, body: string) => {
    if (!("Notification" in window)) return;
    
    // Check if we are in an iframe
    const isIframe = window.self !== window.top;
    if (isIframe && !hasShownIframeTip.current) {
      console.warn('Notifications typically blocked in iframes. Open app in new tab.');
      // Special instruction toast for iframe users - only show once per session
      toast.info('TIP: OPEN IN NEW TAB 🚀', {
        id: 'iframe-notification-tip',
        description: 'For full push notifications, open Salami Tracker in its own browser tab.'
      });
      hasShownIframeTip.current = true;
    }
    
    try {
      if (Notification.permission === "granted") {
        new Notification(title, { 
          body, 
          icon: 'https://cdn-icons-png.flaticon.com/512/3515/3515320.png',
          tag: 'salami-pace-alert'
        });
      }
    } catch (e) {
      console.error('Notification error:', e);
    }
  };

  const toggleNotifications = () => {
    trackEvent('toggle_notifications', { enabled: !notificationsEnabled });
    if (!notificationsEnabled && "Notification" in window) {
      Notification.requestPermission();
      toast.info('ALERTS ENABLED 🔔', {
        description: 'You will now receive alerts for results and significant pace shifts.',
      });
    }
    if (user) {
      updateProfile({ notificationsEnabled: !notificationsEnabled });
    } else {
      localStorage.setItem('salami_notifications', (!notificationsEnabled).toString());
      window.location.reload(); 
    }
  };

  return (
    <div className="dashboard-card border-slate-800 shadow-2xl transition-all duration-300">
      <div className="stitching-top" />
      
      {/* Result Modal Overlay */}
      <AnimatePresence>
        {showResultModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => {
              setShowResultModal(false);
              setHistoricalResult(null);
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "max-w-md w-full dashboard-card p-8 text-center relative overflow-hidden",
                (historicalResult?.status || status) === 'WON' ? "border-green-500/50" : (historicalResult?.status || status) === 'PUSH' ? "border-blue-500/50" : "border-red-500/50"
              )}
              onClick={e => e.stopPropagation()}
            >
              <div className="stitching-top" />
              
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
                (historicalResult?.status || status) === 'WON' ? "bg-green-500/20 text-green-500" : (historicalResult?.status || status) === 'PUSH' ? "bg-blue-500/20 text-blue-500" : "bg-red-500/20 text-red-500"
              )}>
                {(historicalResult?.status || status) === 'WON' ? <Trophy className="w-10 h-10" /> : (historicalResult?.status || status) === 'PUSH' ? <RefreshCw className="w-10 h-10" /> : <Frown className="w-10 h-10" />}
              </div>

              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                {(historicalResult?.status || status) === 'WON' ? 'Wager Won!' : (historicalResult?.status || status) === 'PUSH' ? 'Wager Pushed' : 'Wager Lost'}
              </h2>
              
              {historicalResult && (
                <p className="text-[10px] font-mono font-black text-blue-400 uppercase tracking-widest mb-2">
                  Settlement for {format(parseISO(historicalResult.date), 'EEEE, MMM d')}
                </p>
              )}
              
              <p className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-8">
                {(historicalResult?.status || status) === 'WON' 
                  ? "The slate finished in your favor. Great call!" 
                  : (historicalResult?.status || status) === 'PUSH'
                  ? "Final score matched the line exactly. No win, no loss."
                  : "The slate didn't go your way this time."
                }
              </p>

              <div className="bg-slate-950 rounded-xl p-6 border border-slate-800 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <span className="text-[10px] font-mono font-black text-slate-500 uppercase block">Your Line</span>
                    <span className="text-2xl font-mono font-black text-white">{historicalResult?.line || betLine}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-black text-slate-500 uppercase block">Final Total</span>
                    <span className={cn(
                      "text-2xl font-mono font-black",
                      (historicalResult?.status || status) === 'WON' ? "text-green-500" : (historicalResult?.status || status) === 'PUSH' ? "text-blue-500" : "text-red-500"
                    )}>{historicalResult?.total || currentTotal}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  setShowResultModal(false);
                  setHistoricalResult(null);
                }}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-xl transition-all border border-slate-700"
              >
                Close Summary
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h3 className="font-mono font-black text-white flex items-center gap-2 uppercase tracking-tighter">
              <Target className="w-4 h-4 text-salami-red" />
              Wager Tracker
            </h3>
            {user && (
              <div className="flex items-center gap-1 mt-1">
                <Cloud className={cn("w-2.5 h-2.5", isSyncing ? "text-blue-500 animate-pulse" : "text-green-500")} />
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                  {isSyncing ? 'Syncing...' : lastSynced ? `Synced ${format(lastSynced, 'HH:mm')}` : 'Cloud Active'}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-2">
                {currentStreak && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-lg border font-mono font-black text-[8px] uppercase tracking-widest",
                      currentStreak.type === 'WIN' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                      currentStreak.type === 'LOSS' ? "bg-red-500/10 border-red-500/30 text-red-400" :
                      "bg-blue-500/10 border-blue-500/30 text-blue-400"
                    )}
                  >
                    {currentStreak.type === 'WIN' ? <Flame className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {currentStreak.count} {currentStreak.type}
                  </motion.div>
                )}
                <button 
                  onClick={onOpenHistory}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white hover:border-slate-700 transition-all group"
                >
                  <History className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest">History</span>
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleNotifications}
                className={cn(
                  "p-2 rounded-lg border transition-all duration-300 group relative",
                  notificationsEnabled 
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-400" 
                    : "bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600"
                )}
                title={notificationsEnabled ? "Disable Alerts" : "Enable Alerts"}
              >
                {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                {notificationsEnabled && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="data-label">Bet Line (O/U)</label>
              <input
                type="number"
                step="0.5"
                value={betLine}
                onChange={(e) => setBetLine(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="e.g. 120.5"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-salami-red/20 focus:border-salami-red transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="data-label">Option</label>
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setBetType('over')}
                  className={cn(
                    "flex-1 py-1.5 rounded-md text-[10px] font-black transition-all uppercase tracking-widest",
                    betType === 'over' ? "bg-slate-800 text-salami-red shadow-sm" : "text-slate-500 hover:text-slate-400"
                  )}
                >
                  Over
                </button>
                <button
                  onClick={() => setBetType('under')}
                  className={cn(
                    "flex-1 py-1.5 rounded-md text-[10px] font-black transition-all uppercase tracking-widest",
                    betType === 'under' ? "bg-slate-800 text-salami-red shadow-sm" : "text-slate-500 hover:text-slate-400"
                  )}
                >
                  Under
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSave}
              disabled={isSyncing || betLine === ''}
              className={cn(
                "flex items-center justify-center gap-2 py-2 rounded-lg font-mono font-black text-[10px] uppercase tracking-[0.2em] transition-all border",
                betLine === '' 
                  ? "bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed" 
                  : "bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600/20 shadow-lg shadow-blue-500/5"
              )}
            >
              {isSyncing ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Save className="w-3 h-3" />
              )}
              {isSyncing ? 'Saving...' : 'Save Wager'}
            </button>
            <button
              onClick={handleClear}
              className="flex items-center justify-center gap-2 py-2 rounded-lg font-mono font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-slate-800 text-slate-500 hover:bg-slate-900 hover:text-slate-400"
            >
              Clear
            </button>
          </div>

          {/* Status Display */}
          <AnimatePresence mode="wait">
            {betLine !== '' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className={cn(
                  "p-4 rounded-xl border-2 flex items-center justify-between",
                  status === 'WON' || status === 'ON TRACK' 
                    ? "bg-green-500/10 border-green-500/20 text-green-500" 
                    : status === 'PUSH'
                    ? "bg-blue-500/10 border-blue-500/20 text-blue-500"
                    : status === 'DANGER' || status === 'BEHIND'
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                    : status === 'CALIBRATING'
                    ? "bg-slate-800 border-slate-700 text-slate-400"
                    : "bg-red-500/10 border-red-500/20 text-red-500"
                )}>
                  <div className="flex items-center gap-3">
                    {status === 'WON' || status === 'ON TRACK' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : status === 'PUSH' ? (
                      <RefreshCw className="w-6 h-6" />
                    ) : status === 'LOST' ? (
                      <XCircle className="w-6 h-6" />
                    ) : status === 'CALIBRATING' ? (
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    ) : (
                      <AlertCircle className="w-6 h-6" />
                    )}
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest block opacity-70">
                        Current Status
                      </span>
                      <span className="text-xl font-black tracking-tighter leading-none">
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest block opacity-70">
                      Smart Projection
                    </span>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        {liveThreats > 0.5 && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="w-2 h-2 rounded-full bg-salami-red shadow-[0_0_8px_rgba(225,29,72,0.8)]"
                            title="Live Scoring Threat Detected"
                          />
                        )}
                        <span className="text-xl font-mono font-black">
                          {projectedTotal !== null ? projectedTotal.toString().padStart(3, '0') : '---'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={cn("text-[7px] font-mono font-bold uppercase", confidence.color)}>
                          {confidence.label} CONFIDENCE
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pace Comparison */}
                {!isFinished && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className={cn(
                      "border rounded-lg p-3 transition-colors",
                      betType === 'over'
                        ? (currentPace >= linePace ? "bg-green-500/10 border-green-500/20" : "bg-amber-500/10 border-amber-500/20")
                        : (currentPace <= linePace ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20")
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className={cn("w-3 h-3", betType === 'over' ? (currentPace >= linePace ? "text-green-500" : "text-amber-500") : (currentPace <= linePace ? "text-green-500" : "text-red-500"))} />
                        <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest">
                          Current Pace
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className={cn(
                          "text-sm font-mono font-black",
                          betType === 'over'
                            ? (currentPace >= linePace ? "text-green-500" : "text-amber-500")
                            : (currentPace <= linePace ? "text-green-500" : "text-red-500")
                        )}>
                          {currentPace.toFixed(2)}
                        </span>
                        <span className="text-[7px] font-mono text-slate-500 uppercase">{shortUnit}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-3 h-3 text-slate-600" />
                        <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest">
                          {betType === 'over' ? 'Target Pace' : 'Max Pace'}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-mono font-black text-white">
                          {linePace.toFixed(2)}
                        </span>
                        <span className="text-[7px] font-mono text-slate-500 uppercase">{shortUnit}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Threshold */}
                {!isFinished && remainingInnings > 0 && (
                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-3 h-3 text-salami-red" />
                        <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest">
                          Live Break-Even Pace (Remaining)
                        </span>
                      </div>
                      <span className={cn(
                        "text-[10px] font-mono font-black",
                        betType === 'over' ? "text-salami-red" : "text-blue-500"
                      )}>
                        {betType.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] text-slate-500 font-medium leading-tight max-w-[70%]">
                        {betType === 'over' 
                          ? `Need to average ${requiredPace.toFixed(2)} ${unitName} per game for the rest of the day to hit the line.`
                          : `Must stay below ${requiredPace.toFixed(2)} ${unitName} per game for the rest of the day to stay under.`
                        }
                      </p>
                      <div className="text-right">
                        <span className="text-lg font-mono font-black text-white">
                          {Math.max(0, requiredPace).toFixed(2)}
                        </span>
                        <span className="text-[7px] font-mono text-slate-500 uppercase block">{shortUnit}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Projection Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="data-label">Projection vs Line</span>
                    <span className="text-[10px] font-mono font-bold text-slate-600">
                      LINE: {betLine}
                    </span>
                  </div>
                  <div className="h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
                    <div 
                      className="absolute top-0 h-full bg-slate-800/50 border-r-2 border-slate-700 z-10"
                      style={{ left: `${Math.min((parseFloat(betLine.toString()) / (projectedTotal || 200)) * 100, 100)}%` }}
                    />
                    <motion.div 
                      className={cn(
                        "h-full transition-all duration-1000",
                        projectedTotal === null 
                          ? "bg-slate-800"
                          : (betType === 'over' ? projectedTotal > parseFloat(betLine.toString()) : projectedTotal < parseFloat(betLine.toString()))
                            ? "bg-green-500"
                            : "bg-red-500"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${projectedTotal === null ? 0 : Math.min((projectedTotal / (parseFloat(betLine.toString()) * 1.2 || 200)) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[9px] font-mono text-slate-600 text-center uppercase tracking-widest">
                    Projected based on {completionPercentage}% slate completion
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {betLine === '' && (
            <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20 group hover:border-slate-700 transition-all">
              <div className="w-12 h-12 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800 group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6 text-salami-red animate-pulse" />
              </div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">Begin Your Salami Streak</h4>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-4 px-4">
                Enter your wager above to track today's progress with real-time projections.
              </p>
              {!user && (
                <div className="pt-4 border-t border-slate-800/50">
                  <p className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter mb-3">
                    Sign in to track your <span className="text-blue-400 font-black italic">Historical Salami Streak</span> and get notified as soon as wagers settle.
                  </p>
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-lg text-[9px] font-black text-blue-400 uppercase tracking-widest hover:bg-blue-600/20 transition-all"
                  >
                    <History className="w-3.5 h-3.5" />
                    Join the History Tracker
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
