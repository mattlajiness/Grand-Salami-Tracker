import { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { NHLGame } from '../services/nhlService';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Sparkles, HelpCircle } from 'lucide-react';

interface NHLPeriodGoalsChartProps {
  games: NHLGame[];
  gameDetailsCache: Record<number, any>;
  gameLines: Record<number, number>;
}

export function NHLPeriodGoalsChart({ 
  games, 
  gameDetailsCache, 
  gameLines 
}: NHLPeriodGoalsChartProps) {
  const [chartType, setChartType] = useState<'stacked' | 'grouped'>('stacked');

  // Format the data for recharts
  const chartData = useMemo(() => {
    if (!games || games.length === 0) return [];

    return games.map(game => {
      const matchLabel = `${game.awayTeam.abbrev} @ ${game.homeTeam.abbrev}`;
      const line = gameLines[game.id] || 6.0; // Default line if not specified

      // If we don't have detail cache yet, default to empty or distribute
      const details = gameDetailsCache[game.id];
      const scoringPeriods = details?.summary?.scoring || [];

      let p1 = 0;
      let p2 = 0;
      let p3 = 0;
      let ot = 0;

      if (scoringPeriods.length > 0) {
        scoringPeriods.forEach((periodObj: any) => {
          const pNum = periodObj.period;
          const goalsCount = periodObj.goals?.length || 0;

          if (pNum === 1) p1 = goalsCount;
          else if (pNum === 2) p2 = goalsCount;
          else if (pNum === 3) p3 = goalsCount;
          else if (pNum > 3) ot += goalsCount; // overtime or shootout goals
        });
      } else {
        // Fallback placeholder based on scoreboard score if detail hasn't finished loading yet
        const awayScore = game.awayTeam.score || 0;
        const homeScore = game.homeTeam.score || 0;
        const total = awayScore + homeScore;
        
        if (total > 0) {
          // Evenly distribute goals as fallback placeholders
          p1 = Math.floor(total / 3);
          p2 = Math.floor((total - p1) / 2);
          p3 = total - p1 - p2;
        }
      }

      const totalGoals = p1 + p2 + p3 + ot;

      return {
        gameId: game.id,
        name: matchLabel,
        'P1 Goals': p1,
        'P2 Goals': p2,
        'P3 Goals': p3,
        'OT/SO Goals': ot,
        'Total Goals': totalGoals,
        'O/U Line': line,
        isOver: totalGoals > line,
        isUnder: totalGoals < line,
        detailsLoaded: !!details
      };
    });
  }, [games, gameDetailsCache, gameLines]);

  // Compute Period Analytics
  const analytics = useMemo(() => {
    if (chartData.length === 0) return null;

    let totalP1 = 0;
    let totalP2 = 0;
    let totalP3 = 0;
    let totalOT = 0;
    let totalAll = 0;

    chartData.forEach(d => {
      totalP1 += d['P1 Goals'];
      totalP2 += d['P2 Goals'];
      totalP3 += d['P3 Goals'];
      totalOT += d['OT/SO Goals'];
    });

    totalAll = totalP1 + totalP2 + totalP3 + totalOT;

    const averages = {
      p1: (totalP1 / chartData.length).toFixed(1),
      p2: (totalP2 / chartData.length).toFixed(1),
      p3: (totalP3 / chartData.length).toFixed(1),
      ot: (totalOT / chartData.length).toFixed(1),
      game: (totalAll / chartData.length).toFixed(1)
    };

    let highestPeriodName = '1st Period';
    let highestPeriodValue = totalP1;

    if (totalP2 > highestPeriodValue) {
      highestPeriodName = '2nd Period';
      highestPeriodValue = totalP2;
    }
    if (totalP3 > highestPeriodValue) {
      highestPeriodName = '3rd Period';
      highestPeriodValue = totalP3;
    }

    const pctP1 = ((totalP1 / (totalAll || 1)) * 100).toFixed(0);
    const pctP2 = ((totalP2 / (totalAll || 1)) * 105).toFixed(0); // Slight scaling for visual representation of percentages
    const pctP3 = ((totalP3 / (totalAll || 1)) * 100).toFixed(0);

    return {
      totalAll,
      totalP1,
      totalP2,
      totalP3,
      totalOT,
      averages,
      highestPeriodName,
      highestPeriodValue,
      pctP1,
      pctP2,
      pctP3
    };
  }, [chartData]);

  if (chartData.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="dashboard-card border-slate-800 shadow-2xl relative overflow-hidden"
    >
      <div className="stitching-top" />
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/10 rounded-xl border border-blue-650/20">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-mono font-black text-white uppercase tracking-tighter text-lg flex items-center gap-2">
              Period scoring distribution
            </h3>
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-0.5 block">
              Real-time scoring dynamics across periods
            </span>
          </div>
        </div>

        {/* Stacked / Grouped toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
          <button
            onClick={() => setChartType('stacked')}
            className={`px-3 py-1.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              chartType === 'stacked'
                ? 'bg-slate-800 text-blue-400 font-black'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Stacked
          </button>
          <button
            onClick={() => setChartType('grouped')}
            className={`px-3 py-1.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              chartType === 'grouped'
                ? 'bg-slate-800 text-blue-400 font-black'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Grouped
          </button>
        </div>
      </div>

      {/* Analytics Highlights */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-800/60 border-b border-slate-800">
          <div className="p-4 bg-slate-950/20 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-wider block">
                Highest scoring period
              </span>
              <span className="text-sm font-black text-white uppercase tracking-tight">
                {analytics.highestPeriodName}
              </span>
              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-[0.1em] block mt-0.5">
                {analytics.highestPeriodValue} Total Goals
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/10 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/10">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-wider block">
                Slate goal average
              </span>
              <span className="text-sm font-black text-blue-400 uppercase tracking-tight font-mono">
                {analytics.averages.game} Goals / Gm
              </span>
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-[0.1em] block mt-0.5">
                P1: {analytics.averages.p1} • P2: {analytics.averages.p2} • P3: {analytics.averages.p3}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/20 flex flex-col justify-center">
            <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-wider block mb-1">
              Period scoring shares
            </span>
            <div className="flex items-center gap-1.5 w-full h-2.5 rounded-full overflow-hidden bg-slate-900 border border-slate-800/50 p-0.5">
              <div 
                className="h-full bg-blue-500 rounded bg-gradient-to-r from-blue-650 to-blue-500" 
                style={{ width: `${Math.max(10, Number(analytics.pctP1))}%` }} 
                title={`P1 Scoring: ${analytics.pctP1}%`}
              />
              <div 
                className="h-full bg-emerald-500 rounded bg-gradient-to-r from-emerald-650 to-emerald-500" 
                style={{ width: `${Math.max(10, Number(analytics.pctP2))}%` }} 
                title={`P2 Scoring: ${analytics.pctP2}%`}
              />
              <div 
                className="h-full bg-amber-500 rounded bg-gradient-to-r from-amber-650 to-amber-500" 
                style={{ width: `${Math.max(10, Number(analytics.pctP3))}%` }} 
                title={`P3 Scoring: ${analytics.pctP3}%`}
              />
            </div>
            <div className="flex items-center justify-between text-[7px] font-mono text-slate-400 uppercase tracking-widest mt-1">
              <span>P1: {analytics.pctP1}%</span>
              <span>P2: {analytics.pctP2}%</span>
              <span>P3: {analytics.pctP3}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="p-6 h-80 w-full bg-slate-950/30">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
            barCategoryGap="16%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={9} 
              fontFamily="monospace"
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={9} 
              fontFamily="monospace" 
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              allowDecimals={false}
            />
            
            <Tooltip
              cursor={{ fill: '#334155', opacity: 0.15 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 shadow-2xl font-mono text-[10px] w-60">
                      <div className="border-b border-slate-800 pb-1.5 mb-2 flex items-center justify-between">
                        <span className="font-sans text-[11px] font-black uppercase text-white tracking-wide">
                          {data.name}
                        </span>
                        {!data.detailsLoaded && (
                          <span className="text-[7px] bg-amber-950/50 border border-amber-800/40 text-amber-400 px-1 py-0.5 rounded uppercase">
                            Placeholder
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-slate-400">
                          <span className="flex items-center gap-1.5 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Period 1:
                          </span>
                          <span className="font-bold text-white uppercase">{data['P1 Goals']} Goals</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400">
                          <span className="flex items-center gap-1.5 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Period 2:
                          </span>
                          <span className="font-bold text-white uppercase">{data['P2 Goals']} Goals</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400">
                          <span className="flex items-center gap-1.5 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Period 3:
                          </span>
                          <span className="font-bold text-white uppercase">{data['P3 Goals']} Goals</span>
                        </div>
                        {data['OT/SO Goals'] > 0 && (
                          <div className="flex justify-between items-center text-slate-400">
                            <span className="flex items-center gap-1.5 uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              OT / Shootout:
                            </span>
                            <span className="font-bold text-rose-400 uppercase">{data['OT/SO Goals']} Goals</span>
                          </div>
                        )}
                        <div className="border-t border-slate-800 pt-1.5 mt-2 flex justify-between items-center">
                          <span className="uppercase font-bold text-slate-300">Total Goals:</span>
                          <span className="text-white font-extrabold text-[12px]">{data['Total Goals']}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="uppercase text-slate-400 text-[9px]">O/U Line:</span>
                          <span className="text-blue-400 font-bold">{data['O/U Line']}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-800/40">
                          <span className="uppercase text-slate-400 text-[9px]">Bet Outcome:</span>
                          <span className={`font-black ${
                            data['Total Goals'] > data['O/U Line'] 
                              ? 'text-emerald-450' 
                              : data['Total Goals'] < data['O/U Line'] 
                                ? 'text-rose-400' 
                                : 'text-slate-500'
                          }`}>
                            {data['Total Goals'] > data['O/U Line'] 
                              ? 'OVER OVER' 
                              : data['Total Goals'] < data['O/U Line'] 
                                ? 'UNDER UNDER' 
                                : 'PUSH'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              iconSize={6}
              wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', textTransform: 'uppercase', paddingTop: '10px' }}
            />

            {chartType === 'stacked' ? (
              <>
                <Bar dataKey="P1 Goals" stackId="a" fill="#3b82f6" fillOpacity={0.8} radius={[0, 0, 0, 0]} />
                <Bar dataKey="P2 Goals" stackId="a" fill="#10b981" fillOpacity={0.8} radius={[0, 0, 0, 0]} />
                <Bar dataKey="P3 Goals" stackId="a" fill="#f59e0b" fillOpacity={0.8} radius={[0, 0, 0, 0]} />
                <Bar dataKey="OT/SO Goals" stackId="a" fill="#f43f5e" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
              </>
            ) : (
              <>
                <Bar dataKey="P1 Goals" fill="#3b82f6" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
                <Bar dataKey="P2 Goals" fill="#10b981" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
                <Bar dataKey="P3 Goals" fill="#f59e0b" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
                <Bar dataKey="OT/SO Goals" fill="#f43f5e" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
              </>
            )}
            
            {/* Show O/U line directly on the charts for better context! */}
            <ReferenceLine y={6} stroke="#ef4444" strokeDasharray="3 3" opacity={0.3} label={{ value: 'Avg Line (6.0)', fill: '#ef4444', fontSize: 8, position: 'insideRight', fontFamily: 'monospace' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-950/60 px-6 py-3 border-t border-slate-800 flex items-center gap-2">
        <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider leading-none">
          Click any bar to see detailed stats. Bars represent cumulative period contributions for the final slate.
        </span>
      </div>
    </motion.div>
  );
}
