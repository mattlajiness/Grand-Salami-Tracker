import { useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { MLBGame } from '../services/mlbService';
import { format, parseISO, subDays } from 'date-fns';

interface RunTrendsProps {
  historicalGames: MLBGame[];
  currentTotal: number;
}

export function RunTrends({ historicalGames, currentTotal }: RunTrendsProps) {
  const trends = useMemo(() => {
    const dailyTotals: Record<string, number> = {};
    
    historicalGames.forEach(game => {
      const date = game.officialDate || game.gameDate.split('T')[0];
      const runs = (game.teams.away.score || 0) + (game.teams.home.score || 0);
      dailyTotals[date] = (dailyTotals[date] || 0) + runs;
    });

    // Get last 5 days (excluding today)
    const last5Days = Array.from({ length: 5 }).map((_, i) => {
      const date = format(subDays(new Date(), i + 1), 'yyyy-MM-dd');
      return {
        date,
        displayDate: format(parseISO(date), 'EEE MM/dd'),
        total: dailyTotals[date] || 0
      };
    }).reverse();

    const avgRuns = last5Days.reduce((acc, d) => acc + d.total, 0) / 5;
    const maxRuns = Math.max(...last5Days.map(d => d.total), 1);

    return {
      last5Days,
      avgRuns,
      maxRuns
    };
  }, [historicalGames]);

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-salami-red" />
          </div>
          <div>
            <h3 className="text-white font-black text-xs uppercase tracking-widest">Run Trends</h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase">Last 5 Days Reference</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">5-Day Avg</span>
          <span className="text-sm font-mono font-black text-white">{trends.avgRuns.toFixed(1)}</span>
        </div>
      </div>

      <div className="space-y-4">
        {trends.last5Days.map((day, idx) => {
          const isAboveAvg = day.total > trends.avgRuns;
          const isBelowAvg = day.total < trends.avgRuns;
          const diff = Math.abs(day.total - trends.avgRuns).toFixed(1);

          return (
            <div key={day.date} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-slate-600" />
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter">
                    {day.displayDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-white">{day.total}</span>
                  <div className={
                    `flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-mono font-black uppercase
                    ${isAboveAvg ? 'bg-green-500/10 text-green-400' : isBelowAvg ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-500'}`
                  }>
                    {isAboveAvg ? <ArrowUpRight className="w-2 h-2" /> : isBelowAvg ? <ArrowDownRight className="w-2 h-2" /> : <Minus className="w-2 h-2" />}
                    {diff}
                  </div>
                </div>
              </div>
              
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(day.total / trends.maxRuns) * 100}%` }}
                  transition={{ delay: idx * 0.1, duration: 0.8 }}
                  className={`h-full rounded-full ${isAboveAvg ? 'bg-salami-red' : 'bg-slate-600'}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Current Session</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black text-white">{currentTotal}</span>
            <span className={`text-[9px] font-mono font-black ${currentTotal > trends.avgRuns ? 'text-green-400' : 'text-slate-500'}`}>
              {currentTotal > trends.avgRuns ? 'ABOVE AVG' : 'BELOW AVG'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
