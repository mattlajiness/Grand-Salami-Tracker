import { useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Minus, Flame, Snowflake, Info, Activity } from 'lucide-react';
import { MLBGame } from '../services/mlbService';
import { format, parseISO, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

interface RunTrendsProps {
  historicalGames: MLBGame[];
  currentTotal: number;
}

export function RunTrends({ historicalGames, currentTotal }: RunTrendsProps) {
  const trends = useMemo(() => {
    const dailyTotals: Record<string, number> = {};
    const gameCounts: Record<string, number> = {};
    
    historicalGames.forEach(game => {
      const date = game.officialDate || game.gameDate.split('T')[0];
      const runs = (game.teams.away.score || 0) + (game.teams.home.score || 0);
      dailyTotals[date] = (dailyTotals[date] || 0) + runs;
      gameCounts[date] = (gameCounts[date] || 0) + 1;
    });

    // Get last 7 days (excluding today)
    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const date = format(subDays(new Date(), i + 1), 'yyyy-MM-dd');
      const total = dailyTotals[date] || 0;
      const count = gameCounts[date] || 0;
      const rpg = count > 0 ? total / count : 0;
      
      return {
        date,
        displayDate: format(parseISO(date), 'MM/dd'),
        dayName: format(parseISO(date), 'EEE'),
        total,
        count,
        rpg,
        isAboveAvg: rpg > 8.6
      };
    }).reverse();

    const avgRuns = chartData.reduce((acc, d) => acc + d.total, 0) / chartData.length;
    const avgRPG = chartData.reduce((acc, d) => acc + d.rpg, 0) / chartData.length;
    
    // Calculate "Temperature"
    const recent3Days = chartData.slice(-3);
    const recentAvgRPG = recent3Days.reduce((acc, d) => acc + d.rpg, 0) / 3;
    const temp = recentAvgRPG > 9.0 ? 'HOT' : recentAvgRPG < 8.0 ? 'COLD' : 'NEUTRAL';
    
    // Calculate Volatility (Standard Deviation of RPG)
    const variance = chartData.reduce((acc, d) => acc + Math.pow(d.rpg - avgRPG, 2), 0) / chartData.length;
    const volatility = Math.sqrt(variance);
    const volatilityScore = volatility > 1.5 ? 'HIGH' : volatility < 0.8 ? 'LOW' : 'STABLE';

    return {
      chartData,
      avgRuns,
      avgRPG,
      temp,
      recentAvgRPG,
      volatilityScore
    };
  }, [historicalGames]);

  return (
    <div className="dashboard-card p-6 bg-slate-900/50 border-slate-800 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-salami-red/5 rounded-full -mr-16 -mt-16 blur-2xl" />
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-inner">
            <TrendingUp className="w-5 h-5 text-salami-red" />
          </div>
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-widest">League Pulse</h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">7-Day Run Velocity</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-widest">League Temp</span>
            <div className={cn(
              "flex items-center gap-1.5 font-black text-xs uppercase tracking-widest",
              trends.temp === 'HOT' ? "text-orange-500" : trends.temp === 'COLD' ? "text-blue-400" : "text-slate-400"
            )}>
              {trends.temp === 'HOT' ? <Flame className="w-3 h-3" /> : trends.temp === 'COLD' ? <Snowflake className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
              {trends.temp}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-48 w-full mb-8 -ml-4">
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
                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-mono font-black text-slate-500 uppercase">{data.dayName} {data.displayDate}</p>
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                          {data.count} GAMES
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-[8px] font-mono text-slate-600 uppercase">Total Runs</p>
                          <p className="text-sm font-black text-white">{data.total}</p>
                        </div>
                        <div className="border-l border-slate-800 pl-4">
                          <p className="text-[8px] font-mono text-slate-600 uppercase">Runs/Game</p>
                          <p className={cn("text-sm font-black", data.isAboveAvg ? "text-salami-red" : "text-slate-400")}>
                            {data.rpg.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={8.6 * 15} stroke="#e11d48" strokeDasharray="3 3" opacity={0.3} />
            <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={24}>
              {trends.chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isAboveAvg ? '#e11d48' : '#334155'} 
                  fillOpacity={entry.isAboveAvg ? 0.9 : 0.6}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Info className="w-3 h-3 text-slate-600" />
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Volatility</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white">{trends.volatilityScore}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className={cn(
                    "w-1 h-3 rounded-full",
                    trends.volatilityScore === 'HIGH' ? "bg-salami-red" : 
                    trends.volatilityScore === 'STABLE' && i <= 2 ? "bg-blue-500" :
                    trends.volatilityScore === 'LOW' && i === 1 ? "bg-green-500" : "bg-slate-800"
                  )} 
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1 text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">7-Day RPG</span>
            <Activity className="w-3 h-3 text-slate-600" />
          </div>
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-sm font-black text-white">{trends.avgRPG.toFixed(2)}</span>
            <span className="text-[8px] font-mono text-slate-600 uppercase">Runs/Game</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800/50">
        <p className="text-[9px] text-slate-500 font-medium leading-relaxed italic">
          {trends.temp === 'HOT' 
            ? "League scoring is peaking. Bullpens are likely taxed. Edge: OVER." 
            : trends.temp === 'COLD' 
            ? "Pitchers are in a rhythm. League-wide velocity is high. Edge: UNDER."
            : "Scoring is stabilized near historical averages. Look for park-specific edges."}
        </p>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
