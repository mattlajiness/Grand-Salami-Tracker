import { useState, Fragment, useEffect } from 'react';
import { NHLGame, fetchNHLGameDetails, NHLGoalie } from '../services/nhlService';
import { SIMULATED_DETAILS } from '../services/nhlMockData';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Activity, ChevronDown, ChevronUp, Info, Clock, AlertTriangle, ShieldCheck, Zap, Edit2, Save, CalendarRange, Eye, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Timestamp, doc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { NHLPeriodGoalsChart } from './NHLPeriodGoalsChart';
import { NHLPowerPlayTracker } from './NHLPowerPlayTracker';
import { NHLGoalieStatsCard } from './NHLGoalieStatsCard';

interface NHLGameLogProps {
  games: NHLGame[];
  gameLines: Record<number, number>;
  manualLines?: Record<number, number>;
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
}

export function NHLGameLog({ 
  games, 
  gameLines, 
  manualLines = {}, 
  selectedDate = 'today', 
  onSelectDate 
}: NHLGameLogProps) {
  const { user } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === 'mattlajiness@gmail.com';
  
  const [expandedGameId, setExpandedGameId] = useState<number | null>(null);
  const [gameDetailsCache, setGameDetailsCache] = useState<Record<number, any>>({});
  const [filter, setFilter] = useState<'All' | 'LIVE' | 'FINAL' | 'PRE'>('All');
  const [showChart, setShowChart] = useState(true);

  // Helper check for team on a back-to-back (B2B) night
  const isTeamB2B = (teamAbbrev: string, gameDateStr: string) => {
    if (!gameDateStr) return false;
    // For demo/simulation or pre-slate modes, return true for specific teams to show off the badges
    if (selectedDate === 'demo' || selectedDate === 'pre-slate') {
      return ['TOR', 'NYR', 'EDM', 'DAL', 'BOS'].includes(teamAbbrev);
    }
    return false;
  };

  // Pre-fetch details for all games to back the period goals visualization chart
  useEffect(() => {
    if (!games || games.length === 0) return;

    const fetchAllDetails = async () => {
      // Find missing game IDs that are not present in the details cache
      const missingIds = games
        .map(g => g.id)
        .filter(id => !gameDetailsCache[id]);

      if (missingIds.length === 0) return;

      // Fetch details in parallel in the background
      const results = await Promise.all(
        missingIds.map(async (id) => {
          if (id >= 9990) {
            return { id, details: SIMULATED_DETAILS[id] };
          }
          try {
            const details = await fetchNHLGameDetails(id);
            return { id, details };
          } catch (error) {
            console.error(`Error fetching NHL game details for ID ${id}:`, error);
            return { id, details: null };
          }
        })
      );

      setGameDetailsCache(prev => {
        const next = { ...prev };
        results.forEach(({ id, details }) => {
          if (details) {
            next[id] = details;
          }
        });
        return next;
      });
    };

    fetchAllDetails();
  }, [games]);

  useEffect(() => {
    if (expandedGameId && !gameDetailsCache[expandedGameId]) {
      if (expandedGameId >= 9990) {
        // Return simulated details
        const details = SIMULATED_DETAILS[expandedGameId];
        if (details) {
          setGameDetailsCache(prev => ({ ...prev, [expandedGameId]: details }));
        }
        return;
      }

      const fetchDetails = async () => {
        const details = await fetchNHLGameDetails(expandedGameId);
        if (details) {
          setGameDetailsCache(prev => ({ ...prev, [expandedGameId]: details }));
        }
      };
      fetchDetails();
    }
  }, [expandedGameId, gameDetailsCache]);

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
    if (filter === 'LIVE') return game.gameState === 'LIVE' || game.gameState === 'CRIT';
    if (filter === 'FINAL') return game.gameState === 'FINAL' || game.gameState === 'OFF';
    return game.gameState === filter;
  });

  return (
    <div className="dashboard-card border-slate-800 shadow-xl transition-all duration-300">
      <div className="stitching-top" />
      <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-blue-600 rounded-full" />
          <div className="flex flex-col">
            <h2 className="font-mono font-black text-white uppercase tracking-tighter text-xl flex items-center gap-2">
              NHL Scoreboard
              {selectedDate === 'demo' && (
                <span className="text-[8px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded uppercase font-mono tracking-widest animate-pulse">
                  Simulation Active
                </span>
              )}
            </h2>
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-[0.2em] mt-0.5 flex items-center gap-2">
              Live updates • Including critical and off-ice reviews (Beta)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Chart Toggle Button */}
          <button
            onClick={() => setShowChart(!showChart)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-widest transition-all border flex items-center gap-1.5 cursor-pointer",
              showChart
                ? "bg-blue-950/40 border-blue-500 text-blue-400 font-extrabold shadow-sm"
                : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700"
            )}
            title="Toggle Period Scoring Charts"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            {showChart ? "Hide Chart" : "Show Chart"}
          </button>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['All', 'LIVE', 'FINAL', 'PRE'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer",
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
      </div>

      {/* NHL Period Goals Visualization Chart */}
      <AnimatePresence>
        {showChart && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-950/20 border-b border-slate-800"
          >
            <NHLPeriodGoalsChart 
              games={games}
              gameDetailsCache={gameDetailsCache}
              gameLines={gameLines}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
                    <th className="px-6 py-3 data-label text-center">SOG</th>
                    <th className="px-6 py-3 data-label text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredGames.map((game, index) => {
                    const totalScore = (game.awayTeam.score || 0) + (game.homeTeam.score || 0);
                    const isExpanded = expandedGameId === game.id;
                    const awayPP = game.situation?.awayTeam?.strength && game.situation.awayTeam.strength > game.situation.homeTeam?.strength!;
                    const homePP = game.situation?.homeTeam?.strength && game.situation.homeTeam.strength > game.situation.awayTeam?.strength!;
                    const isAwayB2B = isTeamB2B(game.awayTeam.abbrev, game.gameDate);
                    const isHomeB2B = isTeamB2B(game.homeTeam.abbrev, game.gameDate);

                    return (
                      <Fragment key={game.id}>
                        <motion.tr
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={cn(
                            "hover:bg-slate-800/50 transition-colors group cursor-pointer relative",
                            isExpanded && "bg-slate-800/50",
                            game.gameState === 'CRIT' && "bg-red-950/10 hover:bg-red-950/20",
                            game.gameState === 'OFF' && "bg-amber-950/5 hover:bg-amber-950/10"
                          )}
                          onClick={() => toggleGame(game.id)}
                        >
                          <td className="px-6 py-5 relative">
                            {game.gameState === 'CRIT' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" />
                            )}
                            {game.gameState === 'OFF' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/80" />
                            )}
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700 shadow-sm relative">
                                    <img 
                                      src={game.awayTeam.logo} 
                                      alt={game.awayTeam.abbrev}
                                      className="w-6 h-6 object-contain"
                                      referrerPolicy="no-referrer"
                                    />
                                    {awayPP && (
                                      <div className="absolute inset-0 bg-amber-500/20 border border-amber-500/50 animate-pulse" />
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-200 tracking-tight leading-none uppercase flex items-center gap-1.5">
                                      {game.awayTeam.abbrev}
                                      {awayPP && <Zap className="w-2 h-2 text-amber-500 fill-amber-500" />}
                                      {isAwayB2B && (
                                        <span 
                                          className="px-1 py-0.5 text-[7px] font-black tracking-widest bg-cyan-950/85 text-cyan-400 border border-cyan-800/40 rounded uppercase leading-none font-mono"
                                          title="Playing on back-to-back nights (fatigue factor)"
                                        >
                                          B2B
                                        </span>
                                      )}
                                    </span>
                                  </div>
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
                                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700 shadow-sm relative">
                                    <img 
                                      src={game.homeTeam.logo} 
                                      alt={game.homeTeam.abbrev}
                                      className="w-6 h-6 object-contain"
                                      referrerPolicy="no-referrer"
                                    />
                                    {homePP && (
                                      <div className="absolute inset-0 bg-amber-500/20 border border-amber-500/50 animate-pulse" />
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-200 tracking-tight leading-none uppercase flex items-center gap-1.5">
                                      {game.homeTeam.abbrev}
                                      {homePP && <Zap className="w-2 h-2 text-amber-500 fill-amber-500" />}
                                      {isHomeB2B && (
                                        <span 
                                          className="px-1 py-0.5 text-[7px] font-black tracking-widest bg-cyan-950/85 text-cyan-400 border border-cyan-800/40 rounded uppercase leading-none font-mono"
                                          title="Playing on back-to-back nights (fatigue factor)"
                                        >
                                          B2B
                                        </span>
                                      )}
                                    </span>
                                  </div>
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
                            {(game.gameState === 'LIVE' || game.gameState === 'CRIT') ? (
                              <div className="inline-flex flex-col items-center">
                                <span className={cn(
                                  "text-xs font-mono font-black uppercase tracking-widest",
                                  game.gameState === 'CRIT' ? "text-red-500 animate-pulse font-extrabold" :
                                  (awayPP || homePP) ? "text-amber-500" : "text-blue-500"
                                )}>
                                  {game.periodDescriptor?.number === 1 ? '1st' : 
                                   game.periodDescriptor?.number === 2 ? '2nd' : 
                                   game.periodDescriptor?.number === 3 ? '3rd' : 
                                   game.periodDescriptor?.periodType === 'OT' ? 'Overtime' :
                                   game.periodDescriptor?.periodType === 'SO' ? 'Shootout' :
                                   game.periodDescriptor?.periodType || 'LIVE'}
                                </span>
                                {game.clock?.inIntermission ? (
                                  <span className="text-[8px] font-mono text-amber-500 uppercase font-black tracking-widest mt-1">
                                    Intermission
                                  </span>
                                ) : (
                                  <span className={cn(
                                    "text-[10px] font-mono mt-1",
                                    game.gameState === 'CRIT' ? "text-red-400 font-bold" : "text-slate-400"
                                  )}>
                                    {game.clock?.timeRemaining}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className={cn(
                                "text-[10px] font-mono uppercase tracking-widest font-black",
                                game.gameState === 'OFF' ? "text-amber-500 animate-pulse" : "text-slate-500"
                              )}>
                                {game.gameState === 'OFF' ? 'End on Ice' :
                                 game.gameState === 'FINAL' ? 'Complete' : 'Scheduled'}
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
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         handleSaveLine(game.id);
                                       }}
                                       className="p-1 hover:bg-slate-800 rounded text-green-500 cursor-pointer"
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
                                           isAdmin && "hover:text-blue-500 cursor-pointer underline decoration-dotted decoration-slate-700 underline-offset-4"
                                         )}
                                         onClick={(e) => {
                                           if (isAdmin) {
                                             e.stopPropagation();
                                             setEditingLineId(game.id);
                                             setTempLine((manualLines[game.id] ?? gameLines[game.id] ?? 6.5).toString());
                                           }
                                         }}
                                       >
                                         {(manualLines[game.id] ?? gameLines[game.id]) !== undefined ? (manualLines[game.id] ?? gameLines[game.id]).toFixed(1) : '6.5'}
                                       </span>
                                       {isAdmin && (
                                         <button
                                           onClick={(e) => {
                                             e.stopPropagation();
                                             setEditingLineId(game.id);
                                             setTempLine((manualLines[game.id] ?? gameLines[game.id] ?? 6.5).toString());
                                           }}
                                           className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors cursor-pointer"
                                         >
                                           <Edit2 className="w-3 h-3" />
                                         </button>
                                       )}
                                     </div>
                                     <span className="text-[7px] font-mono text-slate-500 font-bold uppercase tracking-widest mt-0.5">O/U Line</span>
                                   </div>
                                 )}
                               </div>
                             </div>
                          </td>
                          <td className="px-6 py-5 text-center border-l border-slate-800 bg-slate-900/10">
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono font-black text-slate-400">{game.awayTeam.sog || '--'}</span>
                                <div className="w-[1px] h-3 bg-slate-800" />
                                <span className="text-[10px] font-mono font-black text-slate-400">{game.homeTeam.sog || '--'}</span>
                              </div>
                              <span className="text-[7px] font-mono text-slate-600 uppercase tracking-[0.2em] font-black">Shots</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex flex-col items-end gap-2">
                               <div className={cn(
                                  "text-[9px] font-mono font-black px-2 py-1 rounded inline-flex items-center gap-1 shadow-sm whitespace-nowrap transition-all duration-300",
                                  game.gameState === 'LIVE' ? "bg-red-600 text-white border border-red-500/30" :
                                  game.gameState === 'CRIT' ? "bg-red-700 text-white border border-red-400 animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.6)]" :
                                  game.gameState === 'OFF' ? "bg-amber-600/20 text-amber-400 border border-amber-500/50" :
                                  game.gameState === 'FINAL' ? "bg-emerald-600 text-white border border-emerald-500/30" :
                                  "bg-slate-800 text-slate-400 border border-slate-700"
                                )}>
                                  {game.gameState === 'CRIT' && (
                                    <AlertTriangle className="w-2.5 h-2.5 text-white animate-bounce" />
                                  )}
                                  {game.gameState === 'OFF' && (
                                    <Clock className="w-2.5 h-2.5 text-amber-400" />
                                  )}
                                  {game.gameState === 'CRIT' ? 'CRIT' : game.gameState === 'OFF' ? 'OFF-ICE' : game.gameState}
                                </div>
                                <div className="text-[9px] font-mono text-slate-400 font-bold whitespace-nowrap">
                                  {game.gameState === 'PRE' 
                                    ? new Date(game.startTimeUTC).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : (game.gameState === 'LIVE' || game.gameState === 'CRIT') ? (
                                       <span className={cn(
                                         "font-black text-slate-400",
                                         game.gameState === 'CRIT' && "text-red-400 animate-pulse font-extrabold"
                                       )}>
                                         {game.clock?.timeRemaining || "LIVE"}
                                       </span>
                                      )
                                    : game.gameState === 'OFF' ? (
                                       <span className="text-amber-500 font-extrabold uppercase animate-pulse">
                                         UNOFFICIAL
                                       </span>
                                      )
                                    : "FINAL"}
                                </div>
                            </div>
                          </td>
                        </motion.tr>

                        {/* Expanded details row */}
                        <AnimatePresence>
                          {isExpanded && (
                            <tr>
                              <td colSpan={5} className="p-0 border-none">
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden bg-slate-950/50"
                                >
                                  <div className="px-3 py-4 sm:px-6 sm:py-6 border-b border-slate-800/50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                      {/* Live Power Play / Situation Monitor */}
                                      <NHLPowerPlayTracker game={game} />

                                      {/* Starting & Live Goalie Performance Stats */}
                                      <div className="bg-slate-900 rounded-xl border border-slate-800 p-3 sm:p-4 space-y-3 sm:space-y-4">
                                        <div className="flex items-center gap-2 mb-1">
                                          <ShieldCheck className="w-4 h-4 text-blue-400" />
                                          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">
                                            {(game.gameState === 'LIVE' || game.gameState === 'CRIT' || game.gameState === 'OFF') ? 'Starting & In-Game Goalies' : 'Probable Starting Goalies'}
                                          </h4>
                                        </div>
                                        
                                        {!gameDetailsCache[game.id] ? (
                                          <div className="flex items-center justify-center py-8">
                                            <div className="w-5 h-5 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                          </div>
                                        ) : (
                                          <div className="space-y-4 border-none">
                                            {/* Away Goalie */}
                                            {(() => {
                                              const isLiveType = game.gameState === 'LIVE' || game.gameState === 'CRIT' || game.gameState === 'OFF';
                                              const goalie = isLiveType 
                                                ? (gameDetailsCache[game.id].awayTeam?.goaltender || gameDetailsCache[game.id].awayTeam?.probableStartingGoalie)
                                                : gameDetailsCache[game.id].awayTeam?.probableStartingGoalie;
                                              
                                              return (
                                                <NHLGoalieStatsCard 
                                                  game={game}
                                                  isHome={false}
                                                  goalieData={goalie}
                                                />
                                              );
                                            })()}

                                            {/* Home Goalie */}
                                            {(() => {
                                              const isLiveType = game.gameState === 'LIVE' || game.gameState === 'CRIT' || game.gameState === 'OFF';
                                              const goalie = isLiveType 
                                                ? (gameDetailsCache[game.id].homeTeam?.goaltender || gameDetailsCache[game.id].homeTeam?.probableStartingGoalie)
                                                : gameDetailsCache[game.id].homeTeam?.probableStartingGoalie;
                                              
                                              return (
                                                <NHLGoalieStatsCard 
                                                  game={game}
                                                  isHome={true}
                                                  goalieData={goalie}
                                                />
                                              );
                                            })()}
                                          </div>
                                        )}
                                      </div>

                                      {/* Game Stats / Trends */}
                                      <div className="bg-slate-900 rounded-xl border border-slate-800 p-3 sm:p-4">
                                        <div className="flex items-center gap-2 mb-4">
                                          <Zap className="w-4 h-4 text-amber-500" />
                                          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Live Performance Analytics</h4>
                                        </div>
                                        
                                        {!gameDetailsCache[game.id] ? (
                                          <div className="flex items-center justify-center py-8">
                                            <div className="w-5 h-5 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                                          </div>
                                        ) : (
                                          <div className="space-y-4">
                                            {/* Scoring Summary */}
                                            <div className="space-y-2">
                                              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black">Recent Scoring</span>
                                              <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                                {gameDetailsCache[game.id].summary?.scoring?.map((period: any, pIdx: number) => (
                                                  <div key={pIdx} className="space-y-1">
                                                    {period.goals?.map((goal: any, gIdx: number) => (
                                                      <div key={gIdx} className="flex items-center justify-between text-[9px] bg-slate-950 p-2 rounded border border-slate-800/50">
                                                        <div className="flex items-center gap-2">
                                                          <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[7px] font-black">
                                                            {goal.teamAbbrev}
                                                          </div>
                                                          <span className="text-white font-bold">{goal.name} ({goal.goalsToDate})</span>
                                                        </div>
                                                        <span className="font-mono text-slate-500">{goal.timeInPeriod} - P{period.period}</span>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )) || (
                                                  <div className="text-[9px] font-mono text-slate-600 italic py-2">No goals scored yet</div>
                                                )}
                                              </div>
                                            </div>

                                            {/* Shot Differential Analytics */}
                                            {gameDetailsCache[game.id].summary?.teamStats && (
                                              <div className="space-y-3 pt-2 border-t border-slate-800/50">
                                                <div className="flex flex-col gap-1">
                                                  <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                                                    <span>Offensive Volume (SOG)</span>
                                                    <span className="text-white">
                                                      {gameDetailsCache[game.id].awayTeam.abbrev} {gameDetailsCache[game.id].summary.teamStats.find((s: any) => s.category === 'sog')?.awayValue} 
                                                      • 
                                                      {gameDetailsCache[game.id].homeTeam.abbrev} {gameDetailsCache[game.id].summary.teamStats.find((s: any) => s.category === 'sog')?.homeValue}
                                                    </span>
                                                  </div>
                                                  {(() => {
                                                    const sogStat = gameDetailsCache[game.id].summary.teamStats.find((s: any) => s.category === 'sog');
                                                    if (!sogStat) return null;
                                                    const awayVal = parseInt(sogStat.awayValue);
                                                    const homeVal = parseInt(sogStat.homeValue);
                                                    const total = awayVal + homeVal || 1;
                                                    const pct = (awayVal / total) * 100;
                                                    return (
                                                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 flex">
                                                        <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                                                        <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${100-pct}%` }} />
                                                      </div>
                                                    );
                                                  })()}
                                                </div>
                                              </div>
                                            )}

                                            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter leading-relaxed">
                                              Shot volume analytics updated following every on-ice transition. Strength indicators reflect active penalty clock status.
                                            </p>
                                          </div>
                                        )}
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
