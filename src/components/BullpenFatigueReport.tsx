import { MLBGame } from '../services/mlbService';
import { BatteryWarning, Info, Activity, History, Users, Timer } from 'lucide-react';
import { useMemo } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { format, subDays, parseISO } from 'date-fns';

interface BullpenFatigueReportProps {
  historicalGames: MLBGame[];
  todayGames: MLBGame[];
  isLoading?: boolean;
}

interface TeamFatigue {
  teamId: number;
  teamName: string;
  usageYesterday: number;
  usageLast3Days: number;
  consecutiveArms: number; // Pitchers used 2+ days in a row
  starterDepth: number;     // Avg innings by starters last 3 games
  fatigueLevel: 'LOW' | 'MED' | 'HIGH';
  flags: string[];
}

export function BullpenFatigueReport({ historicalGames, todayGames, isLoading }: BullpenFatigueReportProps) {
  const fatigueData = useMemo(() => {
    if (isLoading || historicalGames.length === 0) return [];
    const teamStats: Record<number, { 
      name: string; 
      pitcherHistory: Record<number, string[]>; // pitcherId -> dates
      starterInnings: number[];
      pitcherCounts: number[];
    }> = {};

    // Process historical data
    // Sort historical games by date to track streaks
    const sortedGames = [...historicalGames].sort((a, b) => 
      parseISO(a.officialDate || '').getTime() - parseISO(b.officialDate || '').getTime()
    );

    sortedGames.forEach(game => {
      const homeId = game.teams.home.team.id;
      const awayId = game.teams.away.team.id;

      if (!teamStats[homeId]) teamStats[homeId] = { name: game.teams.home.team.name, pitcherHistory: {}, starterInnings: [], pitcherCounts: [] };
      if (!teamStats[awayId]) teamStats[awayId] = { name: game.teams.away.team.name, pitcherHistory: {}, starterInnings: [], pitcherCounts: [] };

      // Track starters (1st pitcher listed usually)
      const homePitchers = game.boxscore?.teams.home.pitchers || [];
      const awayPitchers = game.boxscore?.teams.away.pitchers || [];

      // Logic: linescore.innings is usually an array of scores. We can check how many innings the game went.
      // But more simply: how many pitchers were used helps determine reliever volume.
      teamStats[homeId].pitcherCounts.push(homePitchers.length);
      teamStats[awayId].pitcherCounts.push(awayPitchers.length);

      // Track specific pitcher appearances by date
      homePitchers.forEach(pId => {
        if (!teamStats[homeId].pitcherHistory[pId]) teamStats[homeId].pitcherHistory[pId] = [];
        teamStats[homeId].pitcherHistory[pId].push(game.officialDate || '');
      });
      awayPitchers.forEach(pId => {
        if (!teamStats[awayId].pitcherHistory[pId]) teamStats[awayId].pitcherHistory[pId] = [];
        teamStats[awayId].pitcherHistory[pId].push(game.officialDate || '');
      });

      // Simple heuristic for starter depth (first pitcher innings)
      // Since precise IP per pitcher isn't in this boxscore summary easily, 
      // we use pitcher count as an inverse proxy for starter depth.
      // 5+ pitchers used = starter went short.
      const homeDepth = homePitchers.length > 5 ? 4 : homePitchers.length > 4 ? 5 : 6;
      const awayDepth = awayPitchers.length > 5 ? 4 : awayPitchers.length > 4 ? 5 : 6;
      teamStats[homeId].starterInnings.push(homeDepth);
      teamStats[awayId].starterInnings.push(awayDepth);
    });

    const reports: TeamFatigue[] = [];
    const playingTeamIds = new Set<number>();
    todayGames.forEach(g => {
      playingTeamIds.add(g.teams.away.team.id);
      playingTeamIds.add(g.teams.home.team.id);
    });

    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const twoDaysAgo = format(subDays(new Date(), 2), 'yyyy-MM-dd');

    playingTeamIds.forEach(id => {
      const stats = teamStats[id];
      if (!stats) return;

      const recentUsage = stats.pitcherCounts.slice(-3);
      const recentDepth = stats.starterInnings.slice(-3);
      
      const usageYesterday = recentUsage[recentUsage.length - 1] || 0;
      const avgUsage = recentUsage.reduce((a, b) => a + b, 0) / (recentUsage.length || 1);
      const avgDepth = recentDepth.reduce((a, b) => a + b, 0) / (recentDepth.length || 1);
      
      // Calculate consecutive appearances
      let consecutiveArms = 0;
      Object.values(stats.pitcherHistory).forEach(dates => {
        if (dates.includes(yesterday) && dates.includes(twoDaysAgo)) {
          consecutiveArms++;
        }
      });

      const flags = [];
      if (usageYesterday >= 6) flags.push("Heavy Usage Yesterday");
      if (consecutiveArms >= 2) flags.push(`${consecutiveArms} Back-to-Back Arms`);
      if (avgDepth < 5) flags.push("Rotation Strain (Short Starters)");

      let level: 'LOW' | 'MED' | 'HIGH' = 'LOW';
      if (flags.length >= 2 || usageYesterday >= 7) level = 'HIGH';
      else if (flags.length >= 1 || avgUsage >= 4.5) level = 'MED';

      if (level !== 'LOW') {
        reports.push({
          teamId: id,
          teamName: stats.name,
          usageYesterday,
          usageLast3Days: parseFloat(avgUsage.toFixed(1)),
          consecutiveArms,
          starterDepth: parseFloat(avgDepth.toFixed(1)),
          fatigueLevel: level,
          flags
        });
      }
    });

    return reports.sort((a, b) => b.flags.length - a.flags.length);
  }, [historicalGames, todayGames, isLoading]);

  if (isLoading) {
    return (
      <div className="dashboard-card border-none shadow-xl bg-slate-900 text-white overflow-hidden">
        <div className="stitching-top opacity-30" />
        <div className="p-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center animate-pulse">
            <BatteryWarning className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-black text-slate-500 uppercase tracking-[0.2em]">Auditing Bullpens...</h2>
            <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest mt-0.5">Calculating historical stress</p>
          </div>
        </div>
      </div>
    );
  }

  if (historicalGames.length === 0) {
    return (
      <div className="dashboard-card border-none shadow-xl bg-slate-900 text-white overflow-hidden">
        <div className="stitching-top opacity-30" />
        <div className="p-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <BatteryWarning className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-black text-white uppercase tracking-[0.2em]">History Unavailable</h2>
            <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">Could not fetch previous game data</p>
          </div>
        </div>
      </div>
    );
  }

  if (fatigueData.length === 0) {
    return (
      <div className="dashboard-card border-none shadow-xl bg-slate-900 text-white overflow-hidden">
        <div className="stitching-top opacity-30" />
        <div className="p-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
            <BatteryWarning className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-black text-white uppercase tracking-[0.2em]">Bullpen Fatigue: Optimal</h2>
            <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">Arms are fresh across the slate</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card border-none shadow-xl bg-slate-900 text-white overflow-hidden">
      <div className="stitching-top opacity-30" />
      <div className="p-5 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <BatteryWarning className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xs font-mono font-black text-white uppercase tracking-[0.2em]">Usage Audit (Pro)</h2>
              <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">Back-to-Back & Depth Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3 text-slate-500" />
            <span className="text-[9px] font-mono text-slate-500 font-bold">{fatigueData.length} FLAG</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
        {fatigueData.map((team, idx) => (
          <motion.div 
            key={team.teamId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={cn(
              "relative p-4 rounded-xl border overflow-hidden",
              team.fatigueLevel === 'HIGH' ? "bg-red-500/5 border-red-500/20" : "bg-amber-500/5 border-amber-500/10"
            )}
          >
            {/* Background Accent */}
            <div className={cn(
               "absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-10",
               team.fatigueLevel === 'HIGH' ? "bg-red-500" : "bg-amber-500"
            )} />

            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={`https://www.mlbstatic.com/team-logos/${team.teamId}.svg`} 
                    className="w-10 h-10 object-contain drop-shadow-lg" 
                    alt=""
                  />
                  {team.fatigueLevel === 'HIGH' && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping absolute" />
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full relative" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-[11px] font-black text-white uppercase tracking-tighter">
                    {team.teamName}
                  </h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {team.flags.map((flag, fIdx) => (
                      <span key={fIdx} className="text-[6px] font-mono font-black px-1.5 py-0.5 bg-slate-950/80 text-white rounded border border-white/5 uppercase">
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <span className={cn(
                  "text-[8px] font-mono font-black px-2 py-0.5 rounded uppercase tracking-widest",
                  team.fatigueLevel === 'HIGH' ? "bg-red-500 text-white" : "bg-amber-500 text-slate-900"
                )}>
                  {team.fatigueLevel}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5">
              <div className="flex flex-col">
                <div className="flex items-center gap-1 mb-0.5">
                  <Activity className="w-2.5 h-2.5 text-slate-500" />
                  <span className="text-[6px] font-mono text-slate-500 uppercase tracking-widest">Yesterday</span>
                </div>
                <span className="text-[10px] font-mono font-black text-white">
                  {team.usageYesterday} ARMS
                </span>
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-1 mb-0.5">
                  <History className="w-2.5 h-2.5 text-slate-500" />
                  <span className="text-[6px] font-mono text-slate-500 uppercase tracking-widest">B2B Streak</span>
                </div>
                <span className={cn(
                  "text-[10px] font-mono font-black",
                  team.consecutiveArms > 0 ? "text-amber-400" : "text-white"
                )}>
                  {team.consecutiveArms} PROD
                </span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1 mb-0.5">
                  <Timer className="w-2.5 h-2.5 text-slate-500" />
                  <span className="text-[6px] font-mono text-slate-500 uppercase tracking-widest">Start Depth</span>
                </div>
                <span className={cn(
                  "text-[10px] font-mono font-black",
                  team.starterDepth < 5 ? "text-red-400" : "text-white"
                )}>
                  ~{team.starterDepth} IP
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-slate-950/80 border-t border-slate-800 space-y-2">
        <div className="flex items-start gap-2">
          <Info className="w-3 h-3 text-slate-600 mt-0.5 shrink-0" />
          <p className="text-[8px] font-mono text-slate-600 uppercase tracking-widest leading-relaxed">
            Audit identifies back-to-back (B2B) reliever usage and starter sustainability. 
            High flags = Higher likelihood of mid-inning scoring volatility.
          </p>
        </div>
      </div>
    </div>
  );
}
