import { useState, Fragment } from 'react';
import { MLBGame } from '../services/mlbService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Activity, RefreshCw, ChevronDown, ChevronUp, User, Info, Wind, Thermometer, Cloud, Sun, CloudRain, CloudLightning, MapPin } from 'lucide-react';

interface GameLogProps {
  games: MLBGame[];
}

export function GameLog({ games }: GameLogProps) {
  const [expandedGameId, setExpandedGameId] = useState<number | null>(null);

  const toggleGame = (gameId: number) => {
    setExpandedGameId(expandedGameId === gameId ? null : gameId);
  };

  return (
    <div className="dashboard-card border-slate-200 shadow-xl transition-all duration-300">
      <div className="stitching-top" />
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-salami-red rounded-full" />
          <h2 className="font-mono font-black text-slate-900 uppercase tracking-tighter text-xl">
            Daily Scorecard
          </h2>
        </div>
        <div className="flex gap-4 text-[10px] font-mono text-slate-500 font-bold items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" /> FINAL
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-salami-red shadow-[0_0_5px_rgba(225,29,72,0.5)] animate-pulse" /> LIVE
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <div className="w-2 h-2 rounded-full bg-slate-300" /> PREVIEW
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-slate-100">
        {games.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 opacity-20" />
            </div>
            <div className="font-black uppercase tracking-widest text-sm mb-1">No Active Slate</div>
            <div className="text-[10px] font-mono">WAITING FOR NEXT SCHEDULED PITCH</div>
          </div>
        ) : (
          <div>
            {/* Mobile View: Card List */}
            <div className="block md:hidden divide-y divide-slate-100">
              {games.map((game, index) => {
                const total = (game.teams.away.score || 0) + (game.teams.home.score || 0);
                const isExpanded = expandedGameId === game.gamePk;

                return (
                  <motion.div
                    key={game.gamePk}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex flex-col"
                  >
                    <div 
                      className="p-4 space-y-4 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => toggleGame(game.gamePk)}
                    >
                      <div className="flex items-center justify-between">
                        <div className={cn(
                          "text-[8px] font-mono font-black px-2 py-0.5 rounded shadow-sm",
                          game.status.abstractGameState === 'Live' ? "bg-red-600 text-white" :
                          game.status.abstractGameState === 'Final' ? "bg-green-600 text-white" :
                          "bg-slate-200 text-slate-600"
                        )}>
                          {game.status.abstractGameState === 'Live' && game.linescore?.currentInningOrdinal 
                            ? `${game.linescore.isTopInning ? 'TOP' : 'BOT'} ${game.linescore.currentInningOrdinal}`.toUpperCase()
                            : game.status.detailedState.toUpperCase()}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-slate-400 font-bold">
                            {game.status.abstractGameState === 'Preview' 
                              ? new Date(game.gameDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : game.status.abstractGameState === 'Live' ? "IN PROGRESS" : "FINAL"}
                          </span>
                          {isExpanded ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-8 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img 
                                src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`} 
                                alt=""
                                className="w-5 h-5 object-contain"
                                referrerPolicy="no-referrer"
                              />
                              <span className="text-[11px] font-bold text-slate-700 truncate max-w-[100px]">
                                {game.teams.away.team.name.split(' ').pop()}
                              </span>
                            </div>
                            <span className="font-mono font-black text-sm text-slate-900">
                              {game.teams.away.score ?? '-'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img 
                                src={`https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`} 
                                alt=""
                                className="w-5 h-5 object-contain"
                                referrerPolicy="no-referrer"
                              />
                              <span className="text-[11px] font-bold text-slate-700 truncate max-w-[100px]">
                                {game.teams.home.team.name.split(' ').pop()}
                              </span>
                            </div>
                            <span className="font-mono font-black text-sm text-slate-900">
                              {game.teams.home.score ?? '-'}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-4 flex flex-col items-center border-l border-slate-100 justify-center gap-2">
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-mono font-black text-salami-red leading-none">{total}</span>
                            <span className="text-[7px] font-mono text-slate-400 font-black mt-1 uppercase tracking-tighter">Total</span>
                          </div>
                          {game.weather && (
                            <div className="flex items-center gap-2 pt-1 border-t border-slate-50 w-full justify-center">
                              <div className="flex items-center gap-1">
                                <Thermometer className="w-2.5 h-2.5 text-salami-red" />
                                <span className="text-[9px] font-mono font-bold text-slate-600">{game.weather.temp}°</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Wind className="w-2.5 h-2.5 text-blue-400" />
                                <span className="text-[9px] font-mono font-bold text-slate-600">{(game.weather.wind || '').split(' ')[0]}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-slate-50"
                        >
                          <div className="p-4 pt-0 border-t border-slate-100">
                            <GameDetailView game={game} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-3 data-label">Matchup</th>
                    <th className="px-6 py-3 data-label text-center">Weather</th>
                    <th className="px-6 py-3 data-label text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {games.map((game, index) => {
                    const total = (game.teams.away.score || 0) + (game.teams.home.score || 0);
                    const isExpanded = expandedGameId === game.gamePk;

                    return (
                      <Fragment key={game.gamePk}>
                        <motion.tr
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={cn(
                            "hover:bg-slate-50 transition-colors group cursor-pointer",
                            isExpanded && "bg-slate-50"
                          )}
                          onClick={() => toggleGame(game.gamePk)}
                        >
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-white flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm">
                                    <img 
                                      src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`} 
                                      alt={game.teams.away.team.name}
                                      className="w-6 h-6 object-contain"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <span className="font-bold text-slate-700 tracking-tight">{game.teams.away.team.name}</span>
                                </div>
                                <span className={cn(
                                  "font-mono font-black text-lg",
                                  game.status.abstractGameState === 'Final' && (game.teams.away.score ?? 0) > (game.teams.home.score ?? 0) ? "text-slate-900" : "text-slate-500"
                                )}>
                                  {(game.teams.away.score ?? 0).toString().padStart(2, '0')}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-white flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm">
                                    <img 
                                      src={`https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`} 
                                      alt={game.teams.home.team.name}
                                      className="w-6 h-6 object-contain"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <span className="font-bold text-slate-700 tracking-tight">{game.teams.home.team.name}</span>
                                </div>
                                <span className={cn(
                                  "font-mono font-black text-lg",
                                  game.status.abstractGameState === 'Final' && (game.teams.home.score ?? 0) > (game.teams.away.score ?? 0) ? "text-slate-900" : "text-slate-500"
                                )}>
                                  {(game.teams.home.score ?? 0).toString().padStart(2, '0')}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center bg-slate-50/30">
                            {game.weather ? (
                              <div className="inline-flex flex-col items-center gap-1">
                                <div className="flex items-center gap-2">
                                  <Thermometer className="w-3 h-3 text-salami-red" />
                                  <span className="text-xs font-mono font-black text-slate-900">{game.weather.temp}°</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Wind className="w-3 h-3 text-blue-400" />
                                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-tighter">
                                    {(game.weather.wind || '').split(',')[0]}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Indoor</span>
                            )}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-mono font-black text-salami-red">
                                  TOTAL: {total}
                                </span>
                              </div>
                              <div className={cn(
                                "text-[9px] font-mono font-black px-2 py-1 rounded inline-block shadow-sm",
                                game.status.abstractGameState === 'Live' ? "bg-red-600 text-white" :
                                game.status.abstractGameState === 'Final' ? "bg-green-600 text-white" :
                                "bg-slate-200 text-slate-600"
                              )}>
                                {game.status.abstractGameState === 'Live' && game.linescore?.currentInningOrdinal 
                                  ? `${game.linescore.isTopInning ? 'TOP' : 'BOT'} ${game.linescore.currentInningOrdinal}`.toUpperCase()
                                  : game.status.detailedState.toUpperCase()}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="text-[9px] font-mono text-slate-400 font-bold">
                                  {game.status.abstractGameState === 'Preview' 
                                    ? new Date(game.gameDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : game.status.abstractGameState === 'Live' ? "IN PROGRESS" : "FINAL"}
                                </div>
                                {isExpanded ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.tr
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="bg-slate-50/50"
                            >
                              <td colSpan={3} className="px-6 py-6 border-t border-slate-100">
                                <GameDetailView game={game} />
                              </td>
                            </motion.tr>
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

function GameDetailView({ game }: { game: MLBGame }) {
  const linescore = game.linescore;
  if (!linescore) return (
    <div className="flex items-center justify-center p-8 text-slate-400 font-mono text-[10px] uppercase tracking-widest">
      No detailed data available yet
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Line Score Table */}
      <div className="md:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
              {game.venue?.name || 'Unknown Venue'}
            </span>
          </div>
          {game.weather && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Thermometer className="w-3 h-3 text-salami-red" />
                <span className="text-[10px] font-mono font-black text-slate-700">{game.weather.temp}°F</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wind className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] font-mono font-black text-slate-700">{game.weather.wind}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cloud className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{game.weather.condition}</span>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[10px] font-mono border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-slate-200">
                <th className="text-left py-2 font-black uppercase tracking-widest">Team</th>
                {linescore.innings?.map(inn => (
                  <th key={inn.num} className="text-center px-2 py-2">{inn.num}</th>
                ))}
                <th className="text-center px-3 py-2 border-l border-slate-200 font-black text-slate-900">R</th>
                <th className="text-center px-3 py-2 text-slate-500">H</th>
                <th className="text-center px-3 py-2 text-slate-500">E</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 font-bold text-slate-700 uppercase tracking-tighter">
                  {game.teams.away.team.name.split(' ').pop()}
                </td>
                {linescore.innings?.map(inn => (
                  <td key={inn.num} className="text-center px-2 py-3 text-slate-500">{inn.away.runs ?? '-'}</td>
                ))}
                <td className="text-center px-3 py-3 border-l border-slate-200 font-black text-salami-red bg-slate-100/50">
                  {linescore.teams.away.runs ?? 0}
                </td>
                <td className="text-center px-3 py-3 text-slate-500">{linescore.teams.away.hits ?? 0}</td>
                <td className="text-center px-3 py-3 text-slate-500">{linescore.teams.away.errors ?? 0}</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-slate-700 uppercase tracking-tighter">
                  {game.teams.home.team.name.split(' ').pop()}
                </td>
                {linescore.innings?.map(inn => (
                  <td key={inn.num} className="text-center px-2 py-3 text-slate-500">{inn.home.runs ?? '-'}</td>
                ))}
                <td className="text-center px-3 py-3 border-l border-slate-200 font-black text-salami-red bg-slate-100/50">
                  {linescore.teams.home.runs ?? 0}
                </td>
                <td className="text-center px-3 py-3 text-slate-500">{linescore.teams.home.hits ?? 0}</td>
                <td className="text-center px-3 py-3 text-slate-500">{linescore.teams.home.errors ?? 0}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {game.status.abstractGameState === 'Live' && (
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200">
              <User className="w-3 h-3 text-salami-red" />
              <div className="flex flex-col">
                <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest">At Bat</span>
                <span className="text-[10px] font-bold text-slate-900">{linescore.offense?.batter?.fullName || '---'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200">
              <Activity className="w-3 h-3 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest">Pitching</span>
                <span className="text-[10px] font-bold text-slate-900">{linescore.defense?.pitcher?.fullName || '---'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Diamond & Count */}
      <div className="flex flex-col items-center justify-center space-y-6 border-l border-slate-100 pl-8">
        {game.status.abstractGameState === 'Live' ? (
          <>
            <div className="relative w-24 h-24 rotate-45 border-2 border-slate-200">
              {/* Bases */}
              <div className={cn("absolute -top-2 -left-2 w-4 h-4 border border-slate-300", linescore.offense?.second ? "bg-salami-red shadow-[0_0_10px_rgba(225,29,72,0.5)]" : "bg-slate-100")} title="2nd Base" />
              <div className={cn("absolute -bottom-2 -left-2 w-4 h-4 border border-slate-300", linescore.offense?.third ? "bg-salami-red shadow-[0_0_10px_rgba(225,29,72,0.5)]" : "bg-slate-100")} title="3rd Base" />
              <div className={cn("absolute -top-2 -right-2 w-4 h-4 border border-slate-300", linescore.offense?.first ? "bg-salami-red shadow-[0_0_10px_rgba(225,29,72,0.5)]" : "bg-slate-100")} title="1st Base" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border border-slate-300 bg-slate-800" title="Home Plate" />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Balls</span>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={cn("w-2 h-2 rounded-full", (linescore.balls || 0) >= i ? "bg-green-500" : "bg-slate-200")} />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Strikes</span>
                  <div className="flex gap-1 mt-1">
                    {[1, 2].map(i => (
                      <div key={i} className={cn("w-2 h-2 rounded-full", (linescore.strikes || 0) >= i ? "bg-salami-red" : "bg-slate-200")} />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Outs</span>
                  <div className="flex gap-1 mt-1">
                    {[1, 2].map(i => (
                      <div key={i} className={cn("w-2 h-2 rounded-full", (linescore.outs || 0) >= i ? "bg-slate-900" : "bg-slate-200")} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-center space-y-2">
            <Info className="w-8 h-8 text-slate-200" />
            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-relaxed">
              {game.status.abstractGameState === 'Final' ? 'Game Complete' : 'Game Scheduled'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
