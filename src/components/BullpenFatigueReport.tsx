import { MLBGame } from '../services/mlbService';
import { BatteryWarning, Info, Activity, History, Users, Timer, Flame, Zap, CheckCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { format, subDays, parseISO } from 'date-fns';

const getTeamAbbreviation = (teamId: number, teamName: string = ''): string => {
  const m: Record<number, string> = {
    109: "ARI", 144: "ATL", 110: "BAL", 111: "BOS", 112: "CHC",
    145: "CWS", 113: "CIN", 114: "CLE", 115: "COL", 116: "DET",
    117: "HOU", 118: "KC", 108: "LAA", 119: "LAD", 146: "MIA",
    158: "MIL", 142: "MIN", 121: "NYM", 147: "NYY", 133: "OAK",
    143: "PHI", 134: "PIT", 135: "SD", 137: "SF", 136: "SEA",
    138: "STL", 139: "TB", 140: "TEX", 141: "TOR", 120: "WSH"
  };
  if (m[teamId]) return m[teamId];
  const safeName = teamName || '';
  if (safeName.toLowerCase().includes("las vegas") || safeName.toLowerCase().includes("athletics")) return "ATH";
  const words = safeName.replace(/[^a-zA-Z\s]/g, "").split(/\s+/);
  if (words.length >= 2) {
    return (words[0].substring(0, 1) + words[1].substring(0, 2)).toUpperCase();
  }
  return safeName.substring(0, 3).toUpperCase();
};

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
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'HIGH' | 'MED' | 'LOW'>('ALL');
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

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
      
      let teamName = stats?.name;
      if (!teamName) {
        const matchingGame = todayGames.find(g => g.teams.away.team.id === id || g.teams.home.team.id === id);
        if (matchingGame) {
          teamName = matchingGame.teams.away.team.id === id ? matchingGame.teams.away.team.name : matchingGame.teams.home.team.name;
        } else {
          teamName = `Team ${id}`;
        }
      }

      const recentUsage = stats ? stats.pitcherCounts.slice(-3) : [];
      const recentDepth = stats ? stats.starterInnings.slice(-3) : [];
      
      const usageYesterday = recentUsage[recentUsage.length - 1] || 0;
      const avgUsage = recentUsage.length > 0 ? recentUsage.reduce((a, b) => a + b, 0) / recentUsage.length : 3.5;
      const avgDepth = recentDepth.length > 0 ? recentDepth.reduce((a, b) => a + b, 0) / recentDepth.length : 5.5;
      
      // Calculate consecutive appearances
      let consecutiveArms = 0;
      if (stats) {
        Object.values(stats.pitcherHistory).forEach(dates => {
          if (dates.includes(yesterday) && dates.includes(twoDaysAgo)) {
            consecutiveArms++;
          }
        });
      }

      const flags = [];
      if (usageYesterday >= 6) flags.push("Heavy Usage Yesterday");
      if (consecutiveArms >= 2) flags.push(`${consecutiveArms} Back-to-Back Arms`);
      if (avgDepth < 5) flags.push("Rotation Strain (Short Starters)");

      let level: 'LOW' | 'MED' | 'HIGH' = 'LOW';
      if (flags.length >= 2 || usageYesterday >= 7) level = 'HIGH';
      else if (flags.length >= 1 || avgUsage >= 4.5) level = 'MED';

      reports.push({
        teamId: id,
        teamName,
        usageYesterday,
        usageLast3Days: parseFloat(avgUsage.toFixed(1)),
        consecutiveArms,
        starterDepth: parseFloat(avgDepth.toFixed(1)),
        fatigueLevel: level,
        flags
      });
    });

    const fatiguePriority = { HIGH: 2, MED: 1, LOW: 0 };
    return reports.sort((a, b) => {
      if (fatiguePriority[b.fatigueLevel] !== fatiguePriority[a.fatigueLevel]) {
        return fatiguePriority[b.fatigueLevel] - fatiguePriority[a.fatigueLevel];
      }
      return b.flags.length - a.flags.length;
    });
  }, [historicalGames, todayGames, isLoading]);

  const { highCount, medCount, lowCount } = useMemo(() => {
    let high = 0, med = 0, low = 0;
    fatigueData.forEach(t => {
      if (t.fatigueLevel === 'HIGH') high++;
      else if (t.fatigueLevel === 'MED') med++;
      else if (t.fatigueLevel === 'LOW') low++;
    });
    return {
      highCount: high,
      medCount: med,
      lowCount: low
    };
  }, [fatigueData]);

  // Create lookup map
  const reportsMap = useMemo(() => {
    const map: Record<number, TeamFatigue> = {};
    fatigueData.forEach(r => {
      map[r.teamId] = r;
    });
    return map;
  }, [fatigueData]);


  // Get active team spotlight model
  const selectedTeam = useMemo(() => {
    if (selectedTeamId === null) return null;
    const found = fatigueData.find(t => t.teamId === selectedTeamId);
    if (found) return found;

    // Check fallback for restauraunted teams that have no history
    const matchingGame = todayGames.find(g => g.teams.away.team.id === selectedTeamId || g.teams.home.team.id === selectedTeamId);
    if (matchingGame) {
      const isAway = matchingGame.teams.away.team.id === selectedTeamId;
      return {
        teamId: selectedTeamId,
        teamName: isAway ? matchingGame.teams.away.team.name : matchingGame.teams.home.team.name,
        usageYesterday: 0,
        usageLast3Days: 3.5,
        consecutiveArms: 0,
        starterDepth: 5.5,
        fatigueLevel: 'LOW' as const,
        flags: []
      };
    }
    return null;
  }, [selectedTeamId, fatigueData, todayGames]);

  // Handle detailed list entries downstream
  const filteredData = useMemo(() => {
    if (selectedFilter === 'ALL') {
      // Return flagged stress groups (HIGH + MED) for clean alert screen
      return fatigueData.filter(t => t.fatigueLevel === 'HIGH' || t.fatigueLevel === 'MED');
    }
    return fatigueData.filter(t => t.fatigueLevel === selectedFilter);
  }, [fatigueData, selectedFilter]);

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

  return (
    <div className="dashboard-card border-none shadow-xl bg-slate-900 text-white overflow-hidden">
      <div className="stitching-top opacity-30" />
      
      {/* Header */}
      <div className="p-5 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <BatteryWarning className="w-4 h-4 text-amber-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xs font-mono font-black text-white uppercase tracking-[0.2em]">Usage Audit (Pro)</h2>
              <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">Back-to-Back & Depth Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3 text-slate-500" />
            <span className="text-[9px] font-mono text-slate-500 font-bold">{highCount + medCount} ACTIVE ALERTS</span>
          </div>
        </div>
      </div>

      {/* Spotlight Segment */}
      {selectedTeam && (
        <div className="mx-4 mt-4 p-4 bg-slate-950/90 rounded-xl border border-sky-500/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-500/10 via-sky-500/50 to-sky-500/10" />
          
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <img 
                src={`https://www.mlbstatic.com/team-logos/${selectedTeam.teamId}.svg`} 
                className="w-8 h-8 object-contain drop-shadow" 
                alt=""
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-[11px] font-black text-white uppercase tracking-tight">
                    {selectedTeam.teamName}
                  </h4>
                  <span className={cn(
                    "text-[7px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-wider",
                    selectedTeam.fatigueLevel === 'HIGH' ? "bg-red-500 text-white animate-pulse" :
                    selectedTeam.fatigueLevel === 'MED' ? "bg-amber-500 text-slate-900" :
                    "bg-emerald-500 text-slate-900"
                  )}>
                    {selectedTeam.fatigueLevel}
                  </span>
                </div>
                <p className="text-[7px] font-mono text-sky-400 uppercase tracking-widest mt-0.5">
                  Spotlight Assessment
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedTeamId(null)}
              className="text-[7px] font-mono text-slate-400 hover:text-white uppercase tracking-widest bg-slate-900 hover:bg-slate-800 px-2 py-1 rounded border border-slate-800 transition"
            >
              CLOSE [X]
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/5 bg-slate-900/30 px-2 rounded-lg">
            <div className="flex flex-col">
              <span className="text-[6px] font-mono text-slate-500 uppercase tracking-widest">Yesterday</span>
              <span className="text-[10px] font-mono font-black text-white mt-0.5">
                {selectedTeam.usageYesterday} ARMS
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[6px] font-mono text-slate-500 uppercase tracking-widest">B2B Streak</span>
              <span className="text-[10px] font-mono font-black text-white mt-0.5">
                {selectedTeam.consecutiveArms} PITCHERS
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[6px] font-mono text-slate-500 uppercase tracking-widest">Avg Starter IP</span>
              <span className={cn(
                "text-[10px] font-mono font-black mt-0.5",
                selectedTeam.starterDepth < 5 ? "text-red-400" : "text-white"
              )}>
                ~{selectedTeam.starterDepth} IP / GS
              </span>
            </div>
          </div>

          <div className="mt-2.5">
            <span className="text-[6px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
              Active Stress Flags
            </span>
            {selectedTeam.flags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedTeam.flags.map((flag, fIdx) => (
                  <span key={fIdx} className="text-[6px] font-mono font-black px-1.5 py-0.5 bg-slate-900 text-amber-400 rounded border border-white/5 uppercase">
                    ⚠️ {flag}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1">
                ✓ No active stress alerts. Bullpen is optimally rested.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main List Feed */}
      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
        {filteredData.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center bg-slate-950/20 rounded-xl border border-slate-800/40">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2 opacity-80" />
            <h4 className="text-[10px] font-mono text-white font-bold uppercase tracking-widest">
              Rest State Reached
            </h4>
            <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-1">
              {selectedFilter === 'ALL' 
                ? "All active bullpens are optimally rested with no stress alerts." 
                : `No teams matching the ${selectedFilter} fatigue category.`}
            </p>
          </div>
        ) : (
          filteredData.map((team, idx) => (
            <motion.div 
              key={team.teamId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedTeamId(selectedTeamId === team.teamId ? null : team.teamId)}
              className={cn(
                "relative p-4 rounded-xl border overflow-hidden transition-all duration-300 cursor-pointer",
                team.fatigueLevel === 'HIGH' ? "bg-red-500/5 border-red-500/20 hover:border-red-500/35" : 
                team.fatigueLevel === 'MED' ? "bg-amber-500/5 border-amber-500/10 hover:border-amber-500/25" :
                "bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/25",
                selectedTeamId === team.teamId && "ring-2 ring-sky-400 border-transparent shadow-[0_0_15px_rgba(56,189,248,0.15)]"
              )}
            >
              {/* Background Accent */}
              <div className={cn(
                "absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-10",
                team.fatigueLevel === 'HIGH' ? "bg-red-500" : 
                team.fatigueLevel === 'MED' ? "bg-amber-500" : "bg-emerald-500"
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
                      {team.flags.length > 0 ? (
                        team.flags.map((flag, fIdx) => (
                          <span key={fIdx} className="text-[6px] font-mono font-black px-1.5 py-0.5 bg-slate-950/80 text-white rounded border border-white/5 uppercase">
                            {flag}
                          </span>
                        ))
                      ) : (
                        <span className="text-[6px] font-mono font-black px-1.5 py-0.5 bg-emerald-950/40 text-emerald-400 rounded border border-emerald-500/10 uppercase">
                          No alerts detected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className={cn(
                    "text-[8px] font-mono font-black px-2 py-0.5 rounded uppercase tracking-widest",
                    team.fatigueLevel === 'HIGH' ? "bg-red-500 text-white" : 
                    team.fatigueLevel === 'MED' ? "bg-amber-500 text-slate-900" :
                    "bg-emerald-500 text-slate-900"
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
          ))
        )}
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
