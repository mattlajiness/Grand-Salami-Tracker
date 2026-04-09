import { MLBGame } from '../services/mlbService';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Activity } from 'lucide-react';

interface GameLogProps {
  games: (MLBGame & { overUnder?: number })[];
}

export function GameLog({ games }: GameLogProps) {
  return (
    <div className="dashboard-card border-slate-300 dark:border-slate-800">
      <div className="stitching-top" />
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-field-green rounded-full" />
          <h2 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter text-xl">
            Daily Scorecard
          </h2>
        </div>
        <div className="flex gap-6 text-[10px] font-mono text-slate-500 font-bold">
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
      
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {games.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 opacity-20" />
            </div>
            <div className="font-black uppercase tracking-widest text-sm mb-1">No Active Slate</div>
            <div className="text-[10px] font-mono">WAITING FOR NEXT SCHEDULED PITCH</div>
          </div>
        ) : (
          <div>
            {/* Mobile View: Card List */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {games.map((game, index) => {
                const total = (game.teams.away.score || 0) + (game.teams.home.score || 0);
                return (
                  <motion.div
                    key={game.gamePk}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-4 space-y-4"
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
                      <span className="text-[9px] font-mono text-slate-400 font-bold">
                        {game.status.abstractGameState === 'Preview' 
                          ? new Date(game.gameDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : game.status.abstractGameState === 'Live' ? "IN PROGRESS" : "FINAL"}
                      </span>
                    </div>

                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-7 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img 
                              src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`} 
                              alt=""
                              className="w-5 h-5 object-contain"
                              referrerPolicy="no-referrer"
                            />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[100px]">
                              {game.teams.away.team.name.split(' ').pop()}
                            </span>
                          </div>
                          <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
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
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[100px]">
                              {game.teams.home.team.name.split(' ').pop()}
                            </span>
                          </div>
                          <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                            {game.teams.home.score ?? '-'}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-2 flex flex-col items-center border-l border-slate-100 dark:border-slate-800">
                        <span className="text-lg font-mono font-black text-salami-red leading-none">{total}</span>
                        <span className="text-[6px] font-mono text-slate-400 font-bold mt-1">TOTAL</span>
                      </div>

                      <div className="col-span-3 flex flex-col items-center border-l border-slate-100 dark:border-slate-800">
                        <span className={cn(
                          "text-sm font-mono font-black leading-none",
                          game.overUnder ? "text-slate-900 dark:text-white" : "text-slate-400"
                        )}>
                          {game.overUnder ?? '--'}
                        </span>
                        <span className="text-[6px] font-mono text-slate-400 font-bold mt-1">O/U LINE</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-3 data-label">Matchup</th>
                    <th className="px-6 py-3 data-label text-center">Total</th>
                    <th className="px-6 py-3 data-label text-center">O/U Line</th>
                    <th className="px-6 py-3 data-label text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {games.map((game, index) => {
                    const total = (game.teams.away.score || 0) + (game.teams.home.score || 0);
                    return (
                      <motion.tr
                        key={game.gamePk}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                                  <img 
                                    src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`} 
                                    alt={game.teams.away.team.name}
                                    className="w-6 h-6 object-contain"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <span className="font-bold text-slate-700 dark:text-slate-200 tracking-tight">{game.teams.away.team.name}</span>
                              </div>
                              <span className={cn(
                                "font-mono font-black text-lg",
                                game.status.abstractGameState === 'Final' && game.teams.away.score! > game.teams.home.score! ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-600"
                              )}>
                                {game.teams.away.score ?? '-'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                                  <img 
                                    src={`https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`} 
                                    alt={game.teams.home.team.name}
                                    className="w-6 h-6 object-contain"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <span className="font-bold text-slate-700 dark:text-slate-200 tracking-tight">{game.teams.home.team.name}</span>
                              </div>
                              <span className={cn(
                                "font-mono font-black text-lg",
                                game.status.abstractGameState === 'Final' && game.teams.home.score! > game.teams.away.score! ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-600"
                              )}>
                                {game.teams.home.score ?? '-'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center bg-slate-50/30 dark:bg-slate-800/10">
                          <div className="inline-flex flex-col items-center">
                            <span className="text-2xl font-mono font-black text-salami-red tracking-tighter">
                              {total}
                            </span>
                            <span className="text-[8px] font-mono text-slate-400 font-bold">RUNS</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className={cn(
                            "inline-flex flex-col items-center",
                            !game.overUnder && "opacity-40"
                          )}>
                            <span className={cn(
                              "text-lg font-mono font-black",
                              game.overUnder ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                            )}>
                              {game.overUnder ?? '--'}
                            </span>
                            <span className="text-[7px] font-mono text-slate-400 font-bold">
                              {game.overUnder ? 'O/U' : 'TBD'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className={cn(
                            "text-[9px] font-mono font-black px-2 py-1 rounded inline-block mb-1 shadow-sm",
                            game.status.abstractGameState === 'Live' ? "bg-red-600 text-white" :
                            game.status.abstractGameState === 'Final' ? "bg-green-600 text-white" :
                            "bg-slate-200 text-slate-600"
                          )}>
                            {game.status.abstractGameState === 'Live' && game.linescore?.currentInningOrdinal 
                              ? `${game.linescore.isTopInning ? 'TOP' : 'BOT'} ${game.linescore.currentInningOrdinal}`.toUpperCase()
                              : game.status.detailedState.toUpperCase()}
                          </div>
                          <div className="text-[9px] font-mono text-slate-400 font-bold">
                            {game.status.abstractGameState === 'Preview' 
                              ? new Date(game.gameDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : game.status.abstractGameState === 'Live' ? "IN PROGRESS" : "FINAL"}
                          </div>
                        </td>
                      </motion.tr>
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
