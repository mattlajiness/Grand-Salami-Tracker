import { MLBGame } from '../services/mlbService';
import { BatteryWarning, Info, AlertCircle } from 'lucide-react';
import { useMemo } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { format, subDays } from 'date-fns';

interface BullpenFatigueReportProps {
  historicalGames: MLBGame[];
  todayGames: MLBGame[];
}

interface TeamFatigue {
  teamId: number;
  teamName: string;
  usageYesterday: number;
  usageLast3Days: number;
  fatigueLevel: 'LOW' | 'MED' | 'HIGH';
}

export function BullpenFatigueReport({ historicalGames, todayGames }: BullpenFatigueReportProps) {
  const fatigueData = useMemo(() => {
    const stats: Record<number, { name: string; counts: number[] }> = {};
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    // Process historical data
    historicalGames.forEach(game => {
      const teams = [
        { id: game.teams.away.team.id, name: game.teams.away.team.name, pitchers: game.boxscore?.teams.away.pitchers.length || 0 },
        { id: game.teams.home.team.id, name: game.teams.home.team.name, pitchers: game.boxscore?.teams.home.pitchers.length || 0 }
      ];

      teams.forEach(t => {
        if (!stats[t.id]) stats[t.id] = { name: t.name, counts: [] };
        if (t.pitchers > 0) stats[t.id].counts.push(t.pitchers);
      });
    });

    // Calculate fatigue for teams playing today
    const reports: TeamFatigue[] = [];
    const playingTeamIds = new Set<number>();
    todayGames.forEach(g => {
      playingTeamIds.add(g.teams.away.team.id);
      playingTeamIds.add(g.teams.home.team.id);
    });

    playingTeamIds.forEach(id => {
      const teamStats = stats[id];
      if (!teamStats) return;

      const usage = teamStats.counts.slice(-3); // Last 3 games
      const usageYesterday = usage[usage.length - 1] || 0;
      const avgUsage = usage.reduce((a, b) => a + b, 0) / (usage.length || 1);
      
      let level: 'LOW' | 'MED' | 'HIGH' = 'LOW';
      if (usageYesterday >= 6 || avgUsage >= 5) level = 'HIGH';
      else if (usageYesterday >= 4 || avgUsage >= 3.5) level = 'MED';

      if (level !== 'LOW') {
        reports.push({
          teamId: id,
          teamName: teamStats.name,
          usageYesterday,
          usageLast3Days: parseFloat(avgUsage.toFixed(1)),
          fatigueLevel: level
        });
      }
    });

    return reports.sort((a, b) => (b.usageYesterday + b.usageLast3Days) - (a.usageYesterday + a.usageLast3Days));
  }, [historicalGames, todayGames]);

  if (fatigueData.length === 0) {
    return (
      <div className="dashboard-card border-none shadow-xl bg-slate-900 text-white overflow-hidden">
        <div className="stitching-top opacity-30" />
        <div className="p-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
            <BatteryWarning className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-black text-white uppercase tracking-[0.2em]">Bullpen Fatigue: Clear</h2>
            <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">No high-stress indicators detected today</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card border-none shadow-xl bg-slate-900 text-white overflow-hidden">
      <div className="stitching-top opacity-30" />
      <div className="p-5 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <BatteryWarning className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-black text-white uppercase tracking-[0.2em]">Bullpen Fatigue Report</h2>
            <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">Historical Usage & Stress Analysis</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {fatigueData.map((team, idx) => (
          <motion.div 
            key={team.teamId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={cn(
              "p-3 rounded-xl border flex items-center justify-between",
              team.fatigueLevel === 'HIGH' ? "bg-red-500/5 border-red-500/20" : "bg-amber-500/5 border-amber-500/20"
            )}
          >
            <div className="flex items-center gap-3">
              <img 
                src={`https://www.mlbstatic.com/team-logos/${team.teamId}.svg`} 
                className="w-6 h-6 object-contain" 
                alt=""
              />
              <div>
                <span className="text-[10px] font-black text-white uppercase tracking-tight block">
                  {team.teamName}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn(
                    "text-[7px] font-mono font-black px-1 rounded",
                    team.fatigueLevel === 'HIGH' ? "bg-red-500 text-white" : "bg-amber-500 text-slate-900"
                  )}>
                    {team.fatigueLevel} STRESS
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex flex-col">
                <span className="text-[7px] font-mono text-slate-500 uppercase leading-none">Pitched Yesterday</span>
                <span className={cn(
                  "text-[11px] font-mono font-black",
                  team.usageYesterday >= 6 ? "text-red-400" : "text-white"
                )}>
                  {team.usageYesterday} PITCHERS
                </span>
              </div>
              <div className="flex flex-col mt-1">
                <span className="text-[6px] font-mono text-slate-500 uppercase leading-none">3-Day Avg</span>
                <span className="text-[8px] font-mono font-bold text-slate-400">
                  {team.usageLast3Days} PER GAME
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-start gap-2">
        <Info className="w-3 h-3 text-slate-600 mt-0.5 shrink-0" />
        <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest leading-relaxed">
          High stress bullpens often lead to scoring surges in the 6th-9th innings. 
          Audit assumes 1 starter + X relievers.
        </p>
      </div>
    </div>
  );
}
