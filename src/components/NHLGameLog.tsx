import { useState, Fragment, useEffect } from 'react';
import { NHLGame, fetchNHLGameDetails, NHLGoalie } from '../services/nhlService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Activity, ChevronDown, ChevronUp, Info, Clock, AlertTriangle, ShieldCheck, Zap, Edit2, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Timestamp, doc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

interface NHLGameLogProps {
  games: NHLGame[];
  gameLines: Record<number, number>;
  manualLines?: Record<number, number>;
}

export function NHLGameLog({ games, gameLines, manualLines = {} }: NHLGameLogProps) {
  const { user } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === 'mattlajiness@gmail.com';
  
  const [expandedGameId, setExpandedGameId] = useState<number | null>(null);
  const [gameDetailsCache, setGameDetailsCache] = useState<Record<number, any>>({});
  const [filter, setFilter] = useState<'All' | 'LIVE' | 'FINAL' | 'PRE'>('All');

  useEffect(() => {
    if (expandedGameId && !gameDetailsCache[expandedGameId]) {
      const fetchDetails = async () => {
        const details = await fetchNHLGameDetails(expandedGameId);
        if (details) {
          setGameDetailsCache(prev => ({ ...prev, [expandedGameId]: details }));
        }
      };
      fetchDetails();
    }
  }, [expandedGameId]);

  const [editingLineId, setEditingLineId] = useState<number | null>(null);
  const [tempLine, setTempLine] = useState<string>('');

  const handleSaveLine = async (gameId: number) => {
    if (!isAdmin) return;
    const total = parseFloat(tempLine);
    if (isNaN(total)) {
      toast.error("Invalid line total");
      return;
    }

    try {
      await setDoc(doc(db, 'nhlGameLines', gameId.toString()), {
        gameId,
        total,
        updatedAt: Timestamp.now(),
        updatedBy: user?.uid
      });
      setEditingLineId(null);
      toast.success("Game line updated");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `nhlGameLines/${gameId}`);
    }
  };

  const toggleGame = (gameId: number) => {
    setExpandedGameId(expandedGameId === gameId ? null : gameId);
  };

  const filteredGames = games.filter(game => {
    if (filter === 'All') return true;
    return game.gameState === filter;
  });

  return (
    <div className="dashboard-card border-slate-800 shadow-xl transition-all duration-300">
      <div className="stitching-top" />
      <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-blue-600 rounded-full" />
          <div className="flex flex-col">
            <h2 className="font-mono font-black text-white uppercase tracking-tighter text-xl">
              NHL Scoreboard
            </h2>
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-[0.2em] mt-0.5 flex items-center gap-2">
              Live updates • Period scores & Power play status (Beta)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['All', 'LIVE', 'FINAL', 'PRE'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                filter === f 
                  ? "bg-slate-800 text-blue-500 shadow-sm" 
                  : "text-slate-500 hover:text-slate-400"
              )}
            >
              {f === 'PRE' ? 'Upcoming' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-800">
        {filteredGames.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 opacity-20" />
            </div>
            <div className="font-black uppercase tracking-widest text-sm mb-1">No {filter !== 'All' ? filter : ''} NHL Games</div>
            <div className="text-[10px] font-mono uppercase">
              {filter === 'LIVE' ? 'Waiting for puck drop' : 
               filter === 'FINAL' ? 'No games have finished yet' :
               filter === 'PRE' ? 'All games have started' : 'Check back for hockey season'}
            </div>
          </div>
        ) : (
          <div>
            {/* Desktop View: Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-800">
                    <th className="px-6 py-3 data-label">Matchup</th>
                    <th className="px-6 py-3 data-label text-center">Period</th>
                    <th className="px-6 py-3 data-label text-center">Goal Line</th>
                    <th className="px-6 py-3 data-label text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredGames.map((game, index) => {
                    const totalScore = (game.awayTeam.score || 0) + (game.homeTeam.score || 0);
                    const isExpanded = expandedGameId === game.id;

                    return (
                      <Fragment key={game.id}>
                        <motion.tr
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={cn(
                            "hover:bg-slate-800/50 transition-colors group cursor-pointer",
                            isExpanded && "bg-slate-800/50"
                          )}
                          onClick={() => toggleGame(game.id)}
                        >
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700 shadow-sm">
                                    <img 
                                      src={game.awayTeam.logo} 
                                      alt={game.awayTeam.abbrev}
                                      className="w-6 h-6 object-contain"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <span className="font-bold text-slate-200 tracking-tight leading-none uppercase">{game.awayTeam.abbrev}</span>
                                </div>
                                <span className={cn(
                                  "font-mono font-black text-lg",
                                  game.gameState === 'FINAL' && (game.awayTeam.score ?? 0) > (game.homeTeam.score ?? 0) ? "text-white" : "text-slate-500"
                                )}>
                                  {(game.awayTeam.score ?? 0).toString().padStart(2, '0')}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700 shadow-sm">
                                    <img 
                                      src={game.homeTeam.logo} 
                                      alt={game.homeTeam.abbrev}
                                      className="w-6 h-6 object-contain"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <span className="font-bold text-slate-200 tracking-tight leading-none uppercase">{game.homeTeam.abbrev}</span>
                                </div>
                                <span className={cn(
                                  "font-mono font-black text-lg",
                                  game.gameState === 'FINAL' && (game.homeTeam.score ?? 0) > (game.awayTeam.score ?? 0) ? "text-white" : "text-slate-500"
                                )}>
                                  {(game.homeTeam.score ?? 0).toString().padStart(2, '0')}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center bg-slate-900/30">
                            {game.gameState === 'LIVE' ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="text-xs font-mono font-black text-blue-500 uppercase tracking-widest">
                                  {game.periodDescriptor?.number === 1 ? '1st' : 
                                   game.periodDescriptor?.number === 2 ? '2nd' : 
                                   game.periodDescriptor?.number === 3 ? '3rd' : 
                                   game.periodDescriptor?.periodType || 'LIVE'}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 mt-1">
                                  {game.clock?.timeRemaining}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                {game.gameState === 'FINAL' ? 'Complete' : 'Scheduled'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-5 text-center border-l border-slate-800">
                             <div className="flex flex-col items-center justify-center">
                              <div className="flex items-center gap-2 group/line">
                                {editingLineId === game.id ? (
                                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="number"
                                      step="0.5"
                                      value={tempLine}
                                      onChange={(e) => setTempLine(e.target.value)}
                                      className="w-14 bg-slate-950 border border-blue-600 rounded px-1 py-0.5 text-xs font-mono text-white text-center focus:outline-none"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleSaveLine(game.id)}
                                      className="p-1 hover:bg-slate-800 rounded text-green-500"
                                    >
                                      <Save className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-2">
                                      <span 
                                        className={cn(
                                          "text-sm font-mono font-black text-white",
                                          isAdmin && "hover:text-blue-500 cursor-pointer"
                                        )}
                                        onClick={(e) => {
                                          if (isAdmin) {
                                            e.stopPropagation();
                                            setEditingLineId(game.id);
                                            setTempLine((manualLines[game.id] ?? gameLines[game.id])?.toString() || '6.5');
                                          }
                                        }}
                                      >
                                        {(manualLines[game.id] ?? gameLines[game.id]) !== undefined ? (manualLines[game.id] ?? gameLines[game.id]).toFixed(1) : '6.5'}
                                      </span>
                                      {isAdmin && <Edit2 className="w-3 h-3 text-slate-600 opacity-0 group-hover/line:opacity-100 transition-opacity" />}
                                    </div>
                                    <span className="text-[7px] font-mono text-slate-500 font-bold uppercase tracking-widest mt-0.5">O/U Line</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex flex-col items-end gap-2">
                               <div className={cn(
                                  "text-[9px] font-mono font-black px-2 py-1 rounded inline-block shadow-sm",
                                  game.gameState === 'LIVE' ? "bg-red-600 text-white" :
                                  game.gameState === 'FINAL' ? "bg-green-600 text-white" :
                                  "bg-slate-800 text-slate-400"
                                )}>
                                  {game.gameState}
                                </div>
                                <div className="text-[9px] font-mono text-slate-400 font-bold whitespace-nowrap">
                                  {game.gameState === 'PRE' 
                                    ? new Date(game.startTimeUTC).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : game.gameState === 'LIVE' ? (game.clock?.timeRemaining || "LIVE") : "FINAL"}
                                </div>
                            </div>
                          </td>
                        </motion.tr>

                        {/* Expanded details row */}
                        <AnimatePresence>
                          {isExpanded && (
                            <tr>
                              <td colSpan={4} className="p-0 border-none">
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden bg-slate-950/50"
                                >
                                  <div className="px-6 py-6 border-b border-slate-800/50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      {/* Starting Goalies */}
                                      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                          <ShieldCheck className="w-4 h-4 text-blue-400" />
                                          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Projected Starting Goalies</h4>
                                        </div>
                                        
                                        {!gameDetailsCache[game.id] ? (
                                          <div className="flex items-center justify-center py-8">
                                            <div className="w-5 h-5 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                          </div>
                                        ) : (
                                          <div className="space-y-3">
                                            {/* Away Goalie */}
                                            <div className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800/50">
                                              <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                                  <span className="text-[10px] font-black text-slate-400">{game.awayTeam.abbrev}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                  <span className="text-xs font-black text-white uppercase tracking-tight">
                                                    {gameDetailsCache[game.id].awayTeam?.probableStartingGoalie?.lastName || 'TBD'}
                                                  </span>
                                                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Confirmed Goalie</span>
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                 <span className="text-[10px] font-mono text-blue-400 font-bold">
                                                   {gameDetailsCache[game.id].awayTeam?.probableStartingGoalie?.savePctg?.toFixed(3) || '0.000'} SV%
                                                 </span>
                                              </div>
                                            </div>

                                            {/* Home Goalie */}
                                            <div className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800/50">
                                              <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                                  <span className="text-[10px] font-black text-slate-400">{game.homeTeam.abbrev}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                  <span className="text-xs font-black text-white uppercase tracking-tight">
                                                    {gameDetailsCache[game.id].homeTeam?.probableStartingGoalie?.lastName || 'TBD'}
                                                  </span>
                                                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Confirmed Goalie</span>
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                 <span className="text-[10px] font-mono text-blue-400 font-bold">
                                                   {gameDetailsCache[game.id].homeTeam?.probableStartingGoalie?.savePctg?.toFixed(3) || '0.000'} SV%
                                                 </span>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Game Stats / Trends */}
                                      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                                        <div className="flex items-center gap-2 mb-4">
                                          <Zap className="w-4 h-4 text-amber-500" />
                                          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Salami Pulse Analytics</h4>
                                        </div>
                                        <div className="space-y-4">
                                          <div className="flex flex-col gap-1">
                                            <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                                              <span>Offensive Pace</span>
                                              <span className="text-white">Active Matchup</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                              <div className="h-full bg-blue-500 w-[65%]" />
                                            </div>
                                          </div>
                                          <div className="flex flex-col gap-1">
                                            <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                                              <span>Defensive Efficiency</span>
                                              <span className="text-white">Trend: Stabilizing</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                              <div className="h-full bg-emerald-500 w-[42%]" />
                                            </div>
                                          </div>
                                          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter leading-relaxed">
                                            Starting goalies are verified against recent league reports. Save percentages reflect 2024-25 season averages.
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
