import { useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Flame, Snowflake, Info, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { NHLGame } from '../services/nhlService';
import { format, parseISO, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

interface NHLGoalTrendsProps {
  historicalGames: NHLGame[];
  games: NHLGame[];
  gameLines: Record<number, number>;
  manualLines?: Record<number, number>;
}

export function NHLGoalTrends({ 
  historicalGames, 
  games, 
  gameLines, 
  manualLines = {} 
}: NHLGoalTrendsProps) {
  const trends = useMemo(() => {
    const dailyTotals: Record<string, number> = {};
    const gameCounts: Record<string, number> = {};
    const REGULAR_SEASON_START = '2026-09-29';
    
    // Only count regular season games from season start onwards
    historicalGames.forEach(game => {
      const date = game.gameDate ? game.gameDate.split('T')[0] : '';
      if (!date || date < REGULAR_SEASON_START) return;
      if (game.gameType && game.gameType !== 2) return;

      const goals = (game.awayTeam.score || 0) + (game.homeTeam.score || 0);
      dailyTotals[date] = (dailyTotals[date] || 0) + goals;
      gameCounts[date] = (gameCounts[date] || 0) + 1;
    });

    // Also track today's live/finished regular season games
    let todayLiveGoals = 0;
    let todayLiveCount = 0;
    let todayFinishedCount = 0;

    games.forEach(game => {
      if (game.gameType && game.gameType !== 2) return;
      todayLiveCount++;
      const score = (game.awayTeam.score || 0) + (game.homeTeam.score || 0);
      todayLiveGoals += score;
      if (game.gameState === 'FINAL' || game.gameState === 'OFF' || game.gameState === 'OVER') {
        todayFinishedCount++;
      }
    });

    // Baseline goal average in modern NHL is roughly 6.1 goals per game
    const BASELINE_NHL_GPG = 6.1;

    // 7-day rolling window ending with Today (Opening Day is Day 1)
    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const daysAgo = 6 - i;
      const date = format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');
      const isToday = daysAgo === 0;
      const isPreSeason = date < REGULAR_SEASON_START;
      
      let total = 0;
      let count = 0;

      if (isToday) {
        total = todayLiveGoals;
        count = todayLiveCount;
      } else {
        total = dailyTotals[date] || 0;
        count = gameCounts[date] || 0;
      }

      const gpg = count > 0 ? total / count : 0;
      
      return {
        date,
        displayDate: isToday ? 'TODAY' : format(parseISO(date), 'MM/dd'),
        dayName: isToday ? 'OPN' : format(parseISO(date), 'EEE'),
        total,
        count,
        gpg,
        isToday,
        isPreSeason,
        isAboveAvg: gpg > BASELINE_NHL_GPG
      };
    });

    // Analyze completed days in the regular season
    const completedRegularSeasonDays = chartData.filter(d => !d.isPreSeason && d.count > 0 && (!d.isToday || todayFinishedCount === d.count));
    const isNewSeason = completedRegularSeasonDays.length === 0;

    const totalGoals = completedRegularSeasonDays.reduce((acc, d) => acc + d.total, 0);
    const totalGames = completedRegularSeasonDays.reduce((acc, d) => acc + d.count, 0);
    const avgGoals = completedRegularSeasonDays.length > 0 ? totalGoals / completedRegularSeasonDays.length : 0;
    const avgGPG = totalGames > 0 ? totalGoals / totalGames : BASELINE_NHL_GPG;

    // Calculate NHL Ice Temperature
    let temp: 'HOT' | 'COLD' | 'NEUTRAL' | 'NEW SEASON' = 'NEW SEASON';
    if (!isNewSeason) {
      const recentDays = completedRegularSeasonDays.slice(-3);
      const recentAvgGPG = recentDays.reduce((acc, d) => acc + d.gpg, 0) / recentDays.length;
      temp = recentAvgGPG > 6.4 ? 'HOT' : recentAvgGPG < 5.8 ? 'COLD' : 'NEUTRAL';
    }

    // Calculate Volatility
    let volatilityScore: 'HIGH' | 'LOW' | 'STABLE' | 'CALIBRATING' = 'CALIBRATING';
    if (completedRegularSeasonDays.length >= 2) {
      const variance = completedRegularSeasonDays.reduce((acc, d) => acc + Math.pow(d.gpg - avgGPG, 2), 0) / completedRegularSeasonDays.length;
      const volatility = Math.sqrt(variance);
      volatilityScore = volatility > 0.8 ? 'HIGH' : volatility < 0.4 ? 'LOW' : 'STABLE';
    }

    // Current Slate O/U Analysis
    const liveOU = {
      over: 0,
      under: 0,
      push: 0,
      ready: 0,
      totalWithLines: 0
    };

    games.forEach(game => {
      const line = manualLines[game.id] || gameLines[game.id];
      if (!line) return;

      liveOU.totalWithLines++;
      const score = (game.awayTeam.score || 0) + (game.homeTeam.score || 0);
      
      if (game.gameState === 'FINAL' || game.gameState === 'OFF' || game.gameState === 'OVER') {
        if (score > line) liveOU.over++;
        else if (score < line) liveOU.under++;
        else liveOU.push++;
      } else if (game.gameState === 'LIVE' || game.gameState === 'CRIT') {
        const period = game.periodDescriptor?.number || 1;
        // Simple period pace multiplier (3 periods in NHL)
        const playedPeriods = period - 1 + (game.clock?.inIntermission ? 0 : 0.5);
        const pace = playedPeriods > 0 ? (score / playedPeriods) * 3 : score;
        
        if (score > line || pace > line) liveOU.over++;
        else if (pace < line) liveOU.under++;
        else liveOU.push++;
      } else {
        liveOU.ready++;
      }
    });

    return {
      chartData,
      avgGoals,
      avgGPG,
      temp,
      isNewSeason,
      volatilityScore,
      liveOU
    };
  }, [historicalGames, games, gameLines, manualLines]);

  const hasGamesWithLines = trends.liveOU.totalWithLines > 0;
  const isAllPending = trends.liveOU.ready === trends.liveOU.totalWithLines && trends.liveOU.totalWithLines > 0;
  const totalTracked = trends.liveOU.over + trends.liveOU.under + trends.liveOU.push;

  return (
    <div className="dashboard-card p-6 bg-slate-900/50 border-slate-800 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-inner">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-black text-sm uppercase tracking-widest font-sans">Hockey Pulse</h3>
            </div>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">7-Day Goal Velocity</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right font-mono">
            <span className="text-[9px] text-slate-500 uppercase block tracking-widest">Ice Temp</span>
            <div className={cn(
              "flex items-center gap-1.5 font-black text-xs uppercase tracking-widest",
              trends.temp === 'HOT' ? "text-orange-500" : 
              trends.temp === 'COLD' ? "text-blue-400" : 
              trends.temp === 'NEW SEASON' ? "text-cyan-400" : "text-slate-400"
            )}>
              {trends.temp === 'HOT' ? <Flame className="w-3 h-3" /> : 
               trends.temp === 'COLD' ? <Snowflake className="w-3 h-3" /> : 
               <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />}
              {trends.temp}
            </div>
          </div>
        </div>
      </div>

      {/* Main Graph */}
      <div className="h-48 w-full mb-6 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trends.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="displayDate" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700, fontFamily: 'monospace' }}
              dy={10}
            />
            <YAxis hide domain={[0, 'auto']} />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-2xl backdrop-blur-md font-mono">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase">{data.dayName} {data.displayDate}</p>
                        <span className={cn(
                          "text-[8px] px-1.5 py-0.5 rounded font-bold uppercase",
                          data.isToday ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "bg-slate-800 text-slate-400"
                        )}>
                          {data.isToday ? `${data.count} GAMES • OPENER` : data.isPreSeason ? 'OFFSEASON' : `${data.count} GAMES`}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-[8px] text-slate-600 uppercase font-sans">Total Goals</p>
                          <p className="text-sm font-black text-white">
                            {data.isPreSeason ? '0 (Offseason)' : data.isToday ? `${data.total} Live` : data.total}
                          </p>
                        </div>
                        {!data.isPreSeason && data.count > 0 && (
                          <div className="border-l border-slate-800 pl-4">
                            <p className="text-[8px] text-slate-600 uppercase font-sans">Goals/Game</p>
                            <p className={cn("text-sm font-black", data.isAboveAvg ? "text-cyan-400" : "text-slate-400")}>
                              {data.gpg > 0 ? data.gpg.toFixed(1) : '--'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {trends.avgGoals > 0 && (
              <ReferenceLine y={trends.avgGoals} stroke="#06b6d4" strokeDasharray="3 3" opacity={0.3} />
            )}
            <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={24}>
              {trends.chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isToday ? '#06b6d4' : entry.total > 0 ? (entry.isAboveAvg ? '#06b6d4' : '#3b82f6') : '#1e293b'} 
                  fillOpacity={entry.isToday ? 1 : entry.total > 0 ? 0.8 : 0.3}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Today's NHL O/U Live Tracker */}
      {games.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <div className="flex items-center justify-between mb-3 text-[9px] font-mono font-black uppercase tracking-widest text-slate-500">
            <span>Current NHL O/U Trends</span>
            <span className={cn(
              "text-[8px] px-2 py-0.5 rounded-full border",
              isAllPending ? "bg-cyan-500/10 border-cyan-505/30 text-cyan-400" : "bg-cyan-500/10 border-cyan-500/30 text-cyan-450"
            )}>
              {isAllPending ? 'PRE-GAME' : !hasGamesWithLines ? 'AWAITING LINES' : 'LIVE TRANSIT'}
            </span>
          </div>

          {!hasGamesWithLines ? (
            <div className="py-2 text-center">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest italic">
                Awaiting betting lines for today's NHL matches...
              </p>
            </div>
          ) : isAllPending ? (
            <div className="py-2 text-center flex flex-col items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-500/20 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <p className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-widest">
                {trends.liveOU.ready} NHL Games Programmed
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-3 rounded-full overflow-hidden flex bg-slate-800">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(trends.liveOU.over / Math.max(totalTracked, 1)) * 100}%` }}
                    className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(trends.liveOU.push / Math.max(totalTracked, 1)) * 100}%` }}
                    className="h-full bg-blue-500"
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(trends.liveOU.under / Math.max(totalTracked, 1)) * 100}%` }}
                    className="h-full bg-slate-700"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-y-1.5 mt-3 font-mono">
                <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                    <span className="text-[10px] font-black text-white">{trends.liveOU.over} OVER</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                    <span className="text-[10px] font-black text-slate-400">{trends.liveOU.under} UNDER</span>
                  </div>
                  {trends.liveOU.push > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-[10px] font-black text-blue-400">{trends.liveOU.push} PUSH</span>
                    </div>
                  )}
                </div>
                {trends.liveOU.ready > 0 && (
                  <span className="text-[8.5px] text-slate-500 uppercase tracking-tight">+{trends.liveOU.ready} Pending</span>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800 font-mono">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Info className="w-3 h-3 text-slate-600" />
            <span className="text-[9px] text-slate-500 uppercase tracking-widest leading-none block">Volatility</span>
          </div>
          <div className="flex items-center gap-2 bg-transparent">
            <span className="text-sm font-black text-white leading-none">{trends.volatilityScore}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className={cn(
                    "w-1 h-3 rounded-full",
                    trends.volatilityScore === 'HIGH' ? "bg-cyan-500" : 
                    trends.volatilityScore === 'STABLE' && i <= 2 ? "bg-blue-500" :
                    trends.volatilityScore === 'LOW' && i === 1 ? "bg-green-500" : 
                    trends.volatilityScore === 'CALIBRATING' ? "bg-cyan-500/40 animate-pulse" : "bg-slate-800"
                  )} 
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1 text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest leading-none block">
              {trends.isNewSeason ? 'Baseline GPG' : '7-Day Avg GPG'}
            </span>
            <Activity className="w-3 h-3 text-slate-600" />
          </div>
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-sm font-black text-white leading-none">{trends.avgGPG.toFixed(2)}</span>
            <span className="text-[8px] text-slate-600 uppercase">
              {trends.isNewSeason ? 'Baseline' : 'Goals/Game'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800/50">
        <p className="text-[9px] text-slate-500 font-medium leading-relaxed italic">
          {trends.isNewSeason 
            ? "2026-27 NHL Regular Season begins today! The 7-Day Hockey Pulse has restarted for Opening Night. Goal velocity, ice temperature, and volatility will calibrate in real time as Opening Night games conclude."
            : trends.temp === 'HOT' 
            ? "League-wide scoring is clicking. Goalies are showing fatigue indicators. Target: OVER." 
            : trends.temp === 'COLD' 
            ? "Goalies are locked into a rhythm. Low penalty ratios. Target: UNDER."
            : "Ice speeds and goals are pacing standard parameters. Evaluate goalie performance metrics for edges."}
        </p>
      </div>
    </div>
  );
}
