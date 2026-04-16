import { MLBGame } from '../services/mlbService';
import { motion } from 'motion/react';
import { Activity, Thermometer, User, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface BullpenReportProps {
  games: MLBGame[];
}

export function BullpenReport({ games }: BullpenReportProps) {
  const liveGames = games.filter(g => g.status.abstractGameState === 'Live');
  
  const getPitcherCount = (game: MLBGame, side: 'away' | 'home') => {
    return game.boxscore?.teams[side].pitchers?.length || 1;
  };

  const taxedTeams = liveGames.flatMap(game => {
    const teams = [];
    const awayPitchers = getPitcherCount(game, 'away');
    const homePitchers = getPitcherCount(game, 'home');
    
    if (awayPitchers >= 4) {
      teams.push({
        teamId: game.teams.away.team.id,
        teamName: game.teams.away.team.name,
        pitchersUsed: awayPitchers,
        inning: game.linescore?.currentInning || 0,
        scoreDiff: (game.teams.away.score || 0) - (game.teams.home.score || 0)
      });
    }
    
    if (homePitchers >= 4) {
      teams.push({
        teamId: game.teams.home.team.id,
        teamName: game.teams.home.team.name,
        pitchersUsed: homePitchers,
        inning: game.linescore?.currentInning || 0,
        scoreDiff: (game.teams.home.score || 0) - (game.teams.away.score || 0)
      });
    }
    
    return teams;
  }).sort((a, b) => b.pitchersUsed - a.pitchersUsed);

  if (liveGames.length === 0) return null;

  return (
    <div className="dashboard-card p-6 bg-slate-900/50 border-slate-800 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="font-mono font-black text-white uppercase tracking-tighter text-lg">
            Bullpen Fatigue Report
          </h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 rounded-full border border-slate-800">
          <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">Live Updates</span>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {taxedTeams.length > 0 ? (
          taxedTeams.map((team, idx) => (
            <motion.div 
              key={team.teamId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-blue-500/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={`https://www.mlbstatic.com/team-logos/${team.teamId}.svg`} 
                  alt=""
                  className="w-6 h-6 object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-white uppercase tracking-tight">{team.teamName}</span>
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                    Inning {team.inning} • {team.scoreDiff > 0 ? '+' : ''}{team.scoreDiff} Runs
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className={cn(
                    "text-xs font-mono font-black",
                    team.pitchersUsed >= 6 ? "text-salami-red" : "text-blue-400"
                  )}>
                    {team.pitchersUsed} PITCHERS
                  </span>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-1 h-2 rounded-full",
                          i < team.pitchersUsed 
                            ? (team.pitchersUsed >= 6 ? "bg-salami-red" : "bg-blue-500") 
                            : "bg-slate-800"
                        )} 
                      />
                    ))}
                  </div>
                </div>
                {team.pitchersUsed >= 6 && (
                  <div className="p-1.5 bg-salami-red/10 rounded-lg" title="Bullpen is heavily taxed">
                    <AlertCircle className="w-4 h-4 text-salami-red animate-bounce" />
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-8 text-center bg-slate-950/50 rounded-lg border border-dashed border-slate-800">
            <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest leading-relaxed">
              No significant bullpen fatigue detected.<br/>Most starting rotations are still providing length.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800">
        <p className="text-[8px] font-mono text-slate-500 leading-relaxed uppercase tracking-widest">
          <span className="text-blue-400">💡 Insight:</span> High pitcher count in early innings (before the 6th) 
          usually leads to scoring surges as middle-relief units face heavy hitting lineups.
        </p>
      </div>
    </div>
  );
}
