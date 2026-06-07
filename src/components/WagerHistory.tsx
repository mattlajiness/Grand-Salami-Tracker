import { useState, useEffect, useMemo } from 'react';
import { History, Trophy, Frown, Calendar, TrendingUp, TrendingDown, ChevronRight, Loader2, Target, Activity, Trash2, RefreshCw, Flame, Zap, Twitter } from 'lucide-react';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { MLBGame } from '../services/mlbService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

interface WagerRecord {
  id: string;
  line: number;
  side: 'OVER' | 'UNDER';
  date: string;
  createdAt: any;
}

interface WagerHistoryProps {
  historicalGames: any[];
  isOpen: boolean;
  onClose: () => void;
  userWagers: WagerRecord[];
  historicalTotals: Record<string, number>;
  currentStreak: { type: 'WIN' | 'LOSS' | 'PUSH'; count: number } | null;
  isLoading: boolean;
  onDeleteWager?: (wagerId: string) => void;
  voidDates?: Record<string, boolean>;
  sport?: string;
}

export function WagerHistory({ 
  historicalGames, 
  isOpen, 
  onClose, 
  userWagers, 
  historicalTotals, 
  currentStreak, 
  isLoading,
  onDeleteWager,
  voidDates = {},
  sport = 'MLB'
}: WagerHistoryProps) {
  const { user } = useAuth();
  const [wagers, setWagers] = useState<WagerRecord[]>(userWagers);
  const [deletingWagerId, setDeletingWagerId] = useState<string | null>(null);

  useEffect(() => {
    setWagers(userWagers);
  }, [userWagers]);

  const stats = useMemo(() => {
    let wins = 0;
    let losses = 0;
    let pushes = 0;
    let voids = 0;
    let graded = 0;

    wagers.forEach((wager) => {
      const isWagerVoid = voidDates && voidDates[wager.date];
      if (isWagerVoid) {
        voids++;
        graded++;
        return;
      }
      const finalTotal = historicalTotals[wager.date];
      const hasData = finalTotal !== undefined;
      if (hasData) {
        graded++;
        const isPush = finalTotal === wager.line;
        if (isPush) {
          pushes++;
        } else {
          const isWin = wager.side === 'OVER' ? finalTotal > wager.line : finalTotal < wager.line;
          if (isWin) {
            wins++;
          } else {
            losses++;
          }
        }
      }
    });

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const hasTodayPendingWager = wagers.some(w => w.date === todayStr && historicalTotals[w.date] === undefined && !(voidDates && voidDates[w.date]));
    const activeWagersCount = hasTodayPendingWager ? 1 : 0;
    const totalDecided = wins + losses;
    const winRate = totalDecided > 0 ? Math.round((wins / totalDecided) * 100) : 0;

    return {
      wins,
      losses,
      pushes,
      voids,
      graded,
      activeWagersCount,
      winRate
    };
  }, [wagers, historicalTotals, voidDates]);

  const handleDelete = (wagerId: string) => {
    setDeletingWagerId(wagerId);
  };

  const executeDelete = async (wagerId: string, date: string) => {
    if (!user) return;
    try {
      const wagerDocRef = doc(db, 'users', user.uid, 'wagers', wagerId);
      await deleteDoc(wagerDocRef);
      setWagers(prev => prev.filter(w => w.id !== wagerId));
      if (onDeleteWager) {
        onDeleteWager(wagerId);
      }
      toast.info('WAGER REMOVED FROM HISTORY 🗑️', {
        description: `Wager for ${date} has been deleted.`
      });
    } catch (error) {
      console.error("Error deleting wager:", error);
      toast.error('Failed to delete wager. Please try again.');
    } finally {
      setDeletingWagerId(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] relative overflow-hidden"
          >
            <div className="stitching-top" />
            
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-salami-red/10 flex items-center justify-center border border-salami-red/20 text-salami-red">
                  <History className="w-3.5 h-3.5 sm:w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-mono font-black text-white uppercase tracking-widest">Wager History</h2>
                  <p className="text-[8px] sm:text-[9px] font-mono text-slate-500 uppercase tracking-widest">Review your past performance</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors"
              >
                <ChevronRight className="w-4.5 h-4.5 sm:w-5 h-5 rotate-90" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              {/* Streak Header */}
              {currentStreak && !isLoading && (
                <div className="mb-6 p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden relative group">
                  <div className={cn(
                    "absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full blur-3xl opacity-20",
                    currentStreak.type === 'WIN' ? "bg-emerald-500" : currentStreak.type === 'LOSS' ? "bg-red-500" : "bg-blue-500"
                  )} />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border-2 shadow-lg transition-transform group-hover:scale-110 duration-500",
                        currentStreak.type === 'WIN' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : 
                        currentStreak.type === 'LOSS' ? "bg-red-500/10 border-red-500/30 text-red-400" : 
                        "bg-blue-500/10 border-blue-500/30 text-blue-400"
                      )}>
                        {currentStreak.type === 'WIN' ? <Flame className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" /> : 
                         currentStreak.type === 'LOSS' ? <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" /> : 
                         <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 rotate-180" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-tighter">Salami Streak</h3>
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[7px] font-mono font-black uppercase tracking-widest border",
                            currentStreak.type === 'WIN' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : 
                            currentStreak.type === 'LOSS' ? "bg-red-500/20 text-red-400 border-red-500/30" : 
                            "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          )}>
                            {currentStreak.type === 'WIN' ? 'Hot' : currentStreak.type === 'LOSS' ? 'Cold' : 'Stable'}
                          </span>
                        </div>
                        <p className="text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">
                          {currentStreak.count} {currentStreak.type}{currentStreak.count > 1 ? (currentStreak.type === 'PUSH' ? 'ES' : 'S') : ''} IN A ROW
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto border-t border-slate-900/60 pt-3 sm:border-0 sm:pt-0">
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                          `I am currently on a ${currentStreak.count}-game ${currentStreak.type} streak on Grand Salami Tracker! ${currentStreak.type === 'WIN' ? '🔥🏆' : currentStreak.type === 'LOSS' ? '📉' : '🔄'} Track daily Grand Salami total runs line in real-time https://grandsalami.bet via @Salamipace #GrandSalami #SalamiStreak`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-blue-500/20 bg-blue-500/15 hover:bg-blue-600/25 text-[#1DA1F2] transition-colors text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-widest"
                      >
                        <Twitter className="w-3 h-3" />
                        <span>Share Streak</span>
                      </a>

                      <div className="text-right">
                        <div className="flex items-baseline justify-end gap-1">
                          <span className={cn(
                            "text-2xl sm:text-3xl font-mono font-black tracking-tighter",
                            currentStreak.type === 'WIN' ? "text-emerald-400" : currentStreak.type === 'LOSS' ? "text-red-400" : "text-blue-400"
                          )}>
                            {currentStreak.count}
                          </span>
                          <Zap className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 mb-1", currentStreak.type === 'WIN' ? "text-emerald-500" : "text-slate-700")} />
                        </div>
                        <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest block">Day Streak</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Overall Statistics Row */}
              {!isLoading && wagers.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-slate-950/45 border border-slate-800/80 p-3 rounded-xl flex flex-col justify-between group">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] sm:text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest">RECORD</span>
                      <Trophy className="w-3.5 h-3.5 text-emerald-500 opacity-60" />
                    </div>
                    <div className="mt-2.5">
                      <span className="text-lg sm:text-xl font-mono font-black text-white tracking-tight">
                        {stats.wins}W-{stats.losses}L{stats.pushes > 0 ? `-${stats.pushes}P` : ''}{stats.voids > 0 ? ` (${stats.voids}V)` : ''}
                      </span>
                    </div>
                    <span className="text-[7px] sm:text-[8px] font-mono text-slate-600 uppercase tracking-widest mt-1 block">
                      {stats.graded} / {wagers.length} GRADED
                    </span>
                  </div>

                  <div className="bg-slate-950/45 border border-slate-800/80 p-3 rounded-xl flex flex-col justify-between group">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] sm:text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest">WIN RATE</span>
                      <Activity className="w-3.5 h-3.5 text-blue-500 opacity-60" />
                    </div>
                    <div className="mt-2.5">
                      <span className="text-lg sm:text-xl font-mono font-black text-blue-400 tracking-tight">
                        {stats.winRate}%
                      </span>
                    </div>
                    <span className="text-[7px] sm:text-[8px] font-mono text-slate-600 uppercase tracking-widest mt-1 block">
                      DECIDED GAMES
                    </span>
                  </div>

                  <div className="bg-slate-950/45 border border-slate-800/80 p-3 rounded-xl flex flex-col justify-between group">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] sm:text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest">PENDING</span>
                      <Calendar className="w-3.5 h-3.5 text-orange-500 opacity-60 animate-pulse" />
                    </div>
                    <div className="mt-2.5">
                      <span className="text-lg sm:text-xl font-mono font-black text-slate-200 tracking-tight">
                        {stats.activeWagersCount}
                      </span>
                    </div>
                    <span className="text-[7px] sm:text-[8px] font-mono text-slate-600 uppercase tracking-widest mt-1 block">
                      AWAITING RESULT
                    </span>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-8 h-8 text-salami-red animate-spin opacity-50" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">Auditing your history...</span>
                </div>
              ) : wagers.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/50 text-slate-600">
                    <Target className="w-8 h-8 opacity-20" />
                  </div>
                  <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest">No history found</h3>
                  <p className="text-slate-600 font-mono text-[9px] uppercase tracking-widest mt-2">Start tracking to see your performance here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {wagers.map((wager) => {
                    const isWagerVoid = voidDates && voidDates[wager.date];
                    const finalTotal = historicalTotals[wager.date];
                    const hasData = finalTotal !== undefined || isWagerVoid;
                    const isPush = hasData && !isWagerVoid && finalTotal === wager.line;
                    const isWin = hasData && !isWagerVoid && !isPush && (wager.side === 'OVER' ? finalTotal > wager.line : finalTotal < wager.line);
                    const isToday = wager.date === format(new Date(), 'yyyy-MM-dd');
                    const isMLB = (sport || 'MLB').toUpperCase() === 'MLB';
                    const unitLabel = isMLB ? 'Runs' : 'Goals';
                    
                    return (
                      <div 
                        key={wager.id}
                        className={cn(
                          "relative group overflow-hidden bg-slate-950 border rounded-xl p-4 transition-all duration-300",
                          isToday && !hasData ? "border-blue-500/30" :
                          isWagerVoid ? "border-amber-500/30 hover:border-amber-500/50" :
                          hasData 
                            ? isWin ? "border-green-500/30 hover:border-green-500/50" : isPush ? "border-blue-500/30 hover:border-blue-500/50" : "border-red-500/30 hover:border-red-500/50"
                            : "border-slate-800 hover:border-slate-700"
                        )}
                      >
                        {/* Delete Button - Floating */}
                        <button 
                          onClick={() => handleDelete(wager.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-500 hover:border-red-500/30 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-20"
                          title="Delete record"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>

                        {/* Inline Delete Confirmation Overlay */}
                        {deletingWagerId === wager.id && (
                          <div className="absolute inset-0 bg-slate-950/95 border border-red-500/20 rounded-xl z-30 flex flex-col sm:flex-row items-center justify-between p-4 gap-3">
                            <div className="flex items-center gap-2">
                              <Trash2 className="w-4 h-4 text-red-500 animate-pulse" />
                              <div>
                                <span className="text-[10px] font-mono font-black text-red-500 uppercase tracking-widest block leading-3">Delete This Wager?</span>
                                <span className="text-[7px] font-mono text-slate-500 uppercase tracking-wider block mt-0.5">This action is irreversible</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingWagerId(null);
                                }}
                                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-800 text-slate-400 font-mono text-[8px] uppercase tracking-widest transition-colors font-black"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  executeDelete(wager.id, wager.date);
                                }}
                                className="px-2.5 py-1 rounded bg-red-950/40 border border-red-900/40 text-red-500 hover:bg-red-950/70 hover:text-red-300 font-mono text-[8px] uppercase tracking-widest transition-colors font-black"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Background Indicator */}
                        {hasData && (
                          <div className={cn(
                            "absolute top-0 right-0 w-24 h-24 -mt-12 -mr-12 rounded-full blur-2xl opacity-10",
                            isWagerVoid ? "bg-amber-500" : isWin ? "bg-green-500" : isPush ? "bg-blue-500" : "bg-red-500"
                          )} />
                        )}

                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center border",
                                isToday && !hasData ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                                isWagerVoid ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                                hasData 
                                  ? isWin ? "bg-green-500/10 border-green-500/20 text-green-500" : isPush ? "bg-blue-500/10 border-blue-500/20 text-blue-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                                  : "bg-slate-800 border-slate-700 text-slate-600"
                            )}>
                              {isToday && !hasData ? <Activity className="w-5 h-5 animate-pulse" /> : 
                               isWagerVoid ? <RefreshCw className="w-5 h-5 text-amber-500" /> :
                               hasData ? (isWin ? <Trophy className="w-5 h-5" /> : isPush ? <RefreshCw className="w-5 h-5" /> : <Frown className="w-5 h-5" />) : <Calendar className="w-5 h-5" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "text-[11px] font-black uppercase tracking-tight",
                                  isToday ? "text-blue-400" : "text-white"
                                )}>
                                  {isToday ? 'Today\'s Wager' : format(parseISO(wager.date), 'EEEE, MMM d')}
                                </span>
                                {isToday && !isWagerVoid && (
                                  <span className="text-[7px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    ACTIVE
                                  </span>
                                )}
                                {isWagerVoid && (
                                  <span className="text-[7px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-widest bg-amber-500/20 text-amber-500 border border-amber-500/30">
                                    VOID (PPD)
                                  </span>
                                )}
                                {hasData && !isWagerVoid && (
                                  <span className={cn(
                                    "text-[7px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-widest",
                                    isWin ? "bg-green-500/20 text-green-500" : isPush ? "bg-blue-500/20 text-blue-500" : "bg-red-500/20 text-red-500"
                                  )}>
                                    {isWin ? 'WON' : isPush ? 'PUSH' : 'LOST'}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Line</span>
                                <span className="text-[10px] font-mono font-black text-slate-300">
                                  {wager.line} {wager.side}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest block mb-1">Result</span>
                            <div className="flex items-baseline justify-end gap-1">
                              <span className={cn(
                                "text-lg font-mono font-black",
                                isWagerVoid ? "text-amber-500" :
                                hasData 
                                  ? (isWin ? "text-green-500" : isPush ? "text-blue-500" : "text-red-500")
                                  : "text-slate-700"
                              )}>
                                {isWagerVoid ? 'VOID' : (hasData ? finalTotal : '---')}
                              </span>
                              {!isWagerVoid && (
                                <span className="text-[8px] font-mono text-slate-600 uppercase tracking-tighter">{unitLabel}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Progress bar comparison */}
                        {hasData && !isWagerVoid && (
                          <div className="mt-3 h-1 bg-slate-900 rounded-full overflow-hidden relative">
                            <div 
                              className="absolute top-0 h-full bg-slate-800 z-10 w-0.5"
                              style={{ left: `${Math.min((wager.line / (Math.max(finalTotal, wager.line) * 1.1)) * 100, 100)}%` }}
                            />
                            <div 
                              className={cn(
                                "h-full transition-all duration-1000",
                                isWin ? "bg-green-500" : isPush ? "bg-blue-500" : "bg-red-500"
                              )}
                              style={{ width: `${Math.min((finalTotal / (Math.max(finalTotal, wager.line) * 1.1)) * 100, 100)}%` }}
                            />
                          </div>
                        )}
                        {!hasData && !isWagerVoid && (
                          <div className="mt-3 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-pulse" />
                            <span className="text-[7px] font-mono text-slate-600 uppercase tracking-widest">
                              Historical totals beyond 7 days not calculated
                            </span>
                          </div>
                        )}
                        {isWagerVoid && (
                          <div className="mt-3 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-[7px] font-mono text-amber-500 uppercase tracking-widest">
                              Game postponed or canceled - Wager voided
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase tracking-widest px-4 sm:px-8">
              <span>Showing last {wagers.length} entries</span>
              <button 
                onClick={onClose}
                className="text-salami-red font-black hover:text-red-400 transition-colors"
              >
                CLOSE MODAL
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
