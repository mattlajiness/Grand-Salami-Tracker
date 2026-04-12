import { useState, useEffect, useRef } from 'react';
import { Target, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, XCircle, Bell, BellOff, Save, Cloud, RefreshCw, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { trackEvent } from '../lib/analytics';

interface WagerTrackerProps {
  currentTotal: number;
  playedInnings: number;
  totalExpectedInnings: number;
  isFinished: boolean;
  gameCount: number;
  finalCount: number;
}

export function WagerTracker({ 
  currentTotal, 
  playedInnings, 
  totalExpectedInnings, 
  isFinished,
  gameCount,
  finalCount
}: WagerTrackerProps) {
  const { user, profile, updateProfile } = useAuth();
  const [betLine, setBetLine] = useState<number | ''>('');
  const [betType, setBetType] = useState<'over' | 'under'>('over');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const notificationsEnabled = profile?.notificationsEnabled ?? true;

  const lastNotifiedStatus = useRef<string | null>(null);
  const today = format(new Date(), 'yyyy-MM-dd');

  // Load from Firestore or LocalStorage
  useEffect(() => {
    const loadWager = async () => {
      if (user) {
        setIsSyncing(true);
        try {
          const wagerDoc = doc(db, 'users', user.uid, 'wagers', today);
          const snap = await getDoc(wagerDoc);
          if (snap.exists()) {
            const data = snap.data();
            setBetLine(data.line);
            setBetType(data.side.toLowerCase() as 'over' | 'under');
            setLastSynced(new Date());
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}/wagers/${today}`);
        } finally {
          setIsSyncing(false);
        }
      } else {
        const savedLine = localStorage.getItem('salami_bet_line');
        const savedType = localStorage.getItem('salami_bet_type');
        if (savedLine) setBetLine(parseFloat(savedLine));
        if (savedType) setBetType(savedType as 'over' | 'under');
      }
    };
    loadWager();
  }, [user, today]);

  // Save to Firestore or LocalStorage
  useEffect(() => {
    const saveWager = async () => {
      if (betLine === '') return;

      trackEvent('save_wager', { line: betLine, side: betType });
      if (user) {
        setIsSyncing(true);
        try {
          const wagerDoc = doc(db, 'users', user.uid, 'wagers', today);
          await setDoc(wagerDoc, {
            userId: user.uid,
            line: betLine,
            side: betType.toUpperCase(),
            date: today,
            createdAt: Timestamp.now()
          });
          setLastSynced(new Date());
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/wagers/${today}`);
        } finally {
          setIsSyncing(false);
        }
      } else {
        localStorage.setItem('salami_bet_line', betLine.toString());
        localStorage.setItem('salami_bet_type', betType);
      }
    };

    const timeout = setTimeout(saveWager, 1000);
    return () => clearTimeout(timeout);
  }, [betLine, betType, user, today]);

  const projectedTotal = playedInnings > 0.25 
    ? Math.round((currentTotal / playedInnings) * totalExpectedInnings) 
    : null;

  const isStabilizing = playedInnings > 0 && playedInnings < 3;

  const completionPercentage = totalExpectedInnings > 0 
    ? Math.round((playedInnings / totalExpectedInnings) * 100) 
    : 0;

  const remainingInnings = totalExpectedInnings - playedInnings;
  const currentPace = playedInnings > 0 ? (currentTotal / playedInnings) * 9 : 0;
  
  const linePace = betLine !== '' ? (parseFloat(betLine.toString()) / totalExpectedInnings) * 9 : 0;
  
  const requiredPace = (betLine !== '' && remainingInnings > 0) 
    ? ((parseFloat(betLine.toString()) - currentTotal) / remainingInnings) * 9
    : 0;

  const getStatus = () => {
    if (betLine === '') return null;

    const line = parseFloat(betLine.toString());
    
    if (isFinished) {
      const won = betType === 'over' ? currentTotal > line : currentTotal < line;
      return won ? 'WON' : 'LOST';
    }

    if (projectedTotal === null) return 'CALIBRATING';

    if (betType === 'over') {
      if (currentTotal > line) return 'WINNING';
      return projectedTotal > line ? 'ON TRACK' : 'BEHIND';
    } else {
      if (currentTotal > line) return 'LOST';
      return projectedTotal < line ? 'ON TRACK' : 'DANGER';
    }
  };

  const status = getStatus();

  // Notification Logic
  useEffect(() => {
    if (!notificationsEnabled || !status || betLine === '') return;

    // Only notify on terminal states or significant changes
    if (status === 'WON' && lastNotifiedStatus.current !== 'WON') {
      toast.success('WAGER WON! 🏆', {
        description: `Final Total: ${currentTotal} (Line: ${betLine})`,
        duration: 10000,
      });
      sendBrowserNotification('WAGER WON! 🏆', `Final Total: ${currentTotal} (Line: ${betLine})`);
      lastNotifiedStatus.current = 'WON';
    } else if (status === 'LOST' && lastNotifiedStatus.current !== 'LOST') {
      toast.error('WAGER LOST ❌', {
        description: `Total: ${currentTotal} (Line: ${betLine})`,
        duration: 10000,
      });
      sendBrowserNotification('WAGER LOST ❌', `Total: ${currentTotal} (Line: ${betLine})`);
      lastNotifiedStatus.current = 'LOST';
    }
  }, [status, notificationsEnabled, currentTotal, betLine]);

  const sendBrowserNotification = (title: string, body: string) => {
    if (!("Notification" in window)) return;
    
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: '/favicon.ico' });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, { body, icon: '/favicon.ico' });
        }
      });
    }
  };

  const toggleNotifications = () => {
    trackEvent('toggle_notifications', { enabled: !notificationsEnabled });
    if (!notificationsEnabled && "Notification" in window) {
      Notification.requestPermission();
    }
    if (user) {
      updateProfile({ notificationsEnabled: !notificationsEnabled });
    } else {
      localStorage.setItem('salami_notifications', (!notificationsEnabled).toString());
      window.location.reload(); // Simple way to refresh local state for this demo
    }
  };

  return (
    <div className="dashboard-card border-slate-800 shadow-2xl transition-all duration-300">
      <div className="stitching-top" />
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
            <button 
              onClick={toggleNotifications}
              className={cn(
                "p-2 rounded-lg border transition-all",
                notificationsEnabled 
                  ? "bg-green-500/10 border-green-500/20 text-green-500" 
                  : "bg-slate-800 border-slate-700 text-slate-500"
              )}
              title={notificationsEnabled ? "Notifications Enabled" : "Notifications Disabled"}
            >
            {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
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
                  status === 'WON' || status === 'WINNING' || status === 'ON TRACK' 
                    ? "bg-green-500/10 border-green-500/20 text-green-500" 
                    : status === 'DANGER' || status === 'BEHIND'
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                    : status === 'CALIBRATING'
                    ? "bg-slate-800 border-slate-700 text-slate-400"
                    : "bg-red-500/10 border-red-500/20 text-red-500"
                )}>
                  <div className="flex items-center gap-3">
                    {status === 'WON' || status === 'WINNING' || status === 'ON TRACK' ? (
                      <CheckCircle2 className="w-6 h-6" />
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
                      Projected
                    </span>
                    <div className="flex flex-col items-end">
                      <span className="text-xl font-mono font-black">
                        {projectedTotal !== null ? projectedTotal.toString().padStart(3, '0') : '---'}
                      </span>
                      {isStabilizing && (
                        <span className="text-[7px] font-mono text-amber-500 font-bold animate-pulse">
                          STABILIZING...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pace Comparison */}
                {!isFinished && betLine !== '' && (
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
                        <span className="text-[7px] font-mono text-slate-500 uppercase">R/G</span>
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
                        <span className="text-[7px] font-mono text-slate-500 uppercase">R/G</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Threshold */}
                {!isFinished && betLine !== '' && remainingInnings > 0 && (
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
                          ? `Need to average ${requiredPace.toFixed(2)} runs per game for the rest of the day to hit the line.`
                          : `Must stay below ${requiredPace.toFixed(2)} runs per game for the rest of the day to stay under.`
                        }
                      </p>
                      <div className="text-right">
                        <span className="text-lg font-mono font-black text-white">
                          {Math.max(0, requiredPace).toFixed(2)}
                        </span>
                        <span className="text-[7px] font-mono text-slate-500 uppercase block">R/G</span>
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
            <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
              <p className="text-xs text-slate-600 font-mono uppercase tracking-widest">
                Enter your wager details above to track your bet live
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
