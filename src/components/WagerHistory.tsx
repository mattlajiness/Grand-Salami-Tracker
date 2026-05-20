import { useState, useEffect, useMemo } from 'react';
import { History, Trophy, Frown, Calendar, TrendingUp, TrendingDown, ChevronRight, Loader2, Target, Activity, Trash2, RefreshCw, Flame, Zap } from 'lucide-react';
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
}

export function WagerHistory({ 
  historicalGames, 
  isOpen, 
  onClose, 
  userWagers, 
  historicalTotals, 
  currentStreak, 
  isLoading,
  onDeleteWager
}: WagerHistoryProps) {
  const { user } = useAuth();
  const [wagers, setWagers] = useState<WagerRecord[]>(userWagers);

  useEffect(() => {
    setWagers(userWagers);
  }, [userWagers]);

  const handleDelete = async (wagerId: string, date: string) => {
    if (!user) return;
    
    if (confirm(`Are you sure you want to remove the wager for ${date}?`)) {
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
      }
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
            
            <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-salami-red/10 flex items-center justify-center border border-salami-red/20 text-salami-red">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-mono font-black text-white uppercase tracking-widest">Wager History</h2>
                  <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Review your past performance</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-90" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {/* Streak Header */}
              {currentStreak && !isLoading && (
                <div className="mb-6 p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden relative group">
                  <div className={cn(
                    "absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full blur-3xl opacity-20",
                    currentStreak.type === 'WIN' ? "bg-emerald-500" : currentStreak.type === 'LOSS' ? "bg-red-500" : "bg-blue-500"
                  )} />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-lg transition-transform group-hover:scale-110 duration-500",
                        currentStreak.type === 'WIN' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : 
                        currentStreak.type === 'LOSS' ? "bg-red-500/10 border-red-500/30 text-red-400" : 
                        "bg-blue-500/10 border-blue-500/30 text-blue-400"
                      )}>
                        {currentStreak.type === 'WIN' ? <Flame className="w-6 h-6 animate-pulse" /> : 
                         currentStreak.type === 'LOSS' ? <TrendingDown className="w-6 h-6" /> : 
                         <RefreshCw className="w-6 h-6 rotate-180" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-white uppercase tracking-tighter">Salami Streak</h3>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-widest border",
                            currentStreak.type === 'WIN' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : 
                            currentStreak.type === 'LOSS' ? "bg-red-500/20 text-red-400 border-red-500/30" : 
                            "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          )}>
                            {currentStreak.type === 'WIN' ? 'Hot' : currentStreak.type === 'LOSS' ? 'Cold' : 'Stable'}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">
                          {currentStreak.count} {currentStreak.type}{currentStreak.count > 1 ? (currentStreak.type === 'PUSH' ? 'ES' : 'S') : ''} IN A ROW
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className={cn(
                          "text-3xl font-mono font-black tracking-tighter",
                          currentStreak.type === 'WIN' ? "text-emerald-400" : currentStreak.type === 'LOSS' ? "text-red-400" : "text-blue-400"
                        )}>
                          {currentStreak.count}
                        </span>
                        <Zap className={cn("w-4 h-4 mb-1", currentStreak.type === 'WIN' ? "text-emerald-500" : "text-slate-700")} />
                      </div>
                      <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest block">Day Streak</span>
                    </div>
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
                    const finalTotal = historicalTotals[wager.date];
                    const hasData = finalTotal !== undefined;
                    const isPush = hasData && finalTotal === wager.line;
                    const isWin = hasData && !isPush && (wager.side === 'OVER' ? finalTotal > wager.line : finalTotal < wager.line);
                    const isToday = wager.date === format(new Date(), 'yyyy-MM-dd');
                    
                    return (
                      <div 
                        key={wager.id}
                        className={cn(
                          "relative group overflow-hidden bg-slate-950 border rounded-xl p-4 transition-all duration-300",
                          isToday && !hasData ? "border-blue-500/30" :
                          hasData 
                            ? isWin ? "border-green-500/30 hover:border-green-500/50" : isPush ? "border-blue-500/30 hover:border-blue-500/50" : "border-red-500/30 hover:border-red-500/50"
                            : "border-slate-800 hover:border-slate-700"
                        )}
                      >
                        {/* Delete Button - Floating */}
                        <button 
                          onClick={() => handleDelete(wager.id, wager.date)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-600 hover:text-red-500 hover:border-red-500/30 transition-all opacity-0 group-hover:opacity-100 z-20"
                          title="Delete record"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>

                        {/* Background Indicator */}
                        {hasData && (
                          <div className={cn(
                            "absolute top-0 right-0 w-24 h-24 -mt-12 -mr-12 rounded-full blur-2xl opacity-10",
                            isWin ? "bg-green-500" : isPush ? "bg-blue-500" : "bg-red-500"
                          )} />
                        )}

                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center border",
                              isToday && !hasData ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                              hasData 
                                ? isWin ? "bg-green-500/10 border-green-500/20 text-green-500" : isPush ? "bg-blue-500/10 border-blue-500/20 text-blue-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                                : "bg-slate-800 border-slate-700 text-slate-600"
                            )}>
                              {isToday && !hasData ? <Activity className="w-5 h-5 animate-pulse" /> : 
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
                                {isToday && (
                                  <span className="text-[7px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    ACTIVE
                                  </span>
                                )}
                                {hasData && (
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
                                hasData 
                                  ? (isWin ? "text-green-500" : isPush ? "text-blue-500" : "text-red-500")
                                  : "text-slate-700"
                              )}>
                                {hasData ? finalTotal : '---'}
                              </span>
                              <span className="text-[8px] font-mono text-slate-600 uppercase tracking-tighter">Runs</span>
                            </div>
                          </div>
                        </div>

                        {/* Progress bar comparison */}
                        {hasData && (
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
                        {!hasData && (
                          <div className="mt-3 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-pulse" />
                            <span className="text-[7px] font-mono text-slate-600 uppercase tracking-widest">
                              Historical totals beyond 7 days not calculated
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase tracking-widest px-8">
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
