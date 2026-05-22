import { MLBGame } from '../services/mlbService';
import { motion } from 'motion/react';
import { Flame, Trophy, Activity, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface DailyApexProps {
  games: MLBGame[];
}

export function DailyApex({ games }: DailyApexProps) {
  const apexGame = [...games].sort((a, b) => {
    const scoreA = (a.teams.away.score || 0) + (a.teams.home.score || 0);
    const scoreB = (b.teams.away.score || 0) + (b.teams.home.score || 0);
    return scoreB - scoreA;
  })[0];

  if (!apexGame || (apexGame.teams.away.score || 0) + (apexGame.teams.home.score || 0) === 0) {
    return null;
  }

  const totalRuns = (apexGame.teams.away.score || 0) + (apexGame.teams.home.score || 0);
  const isLive = apexGame.status.abstractGameState === 'Live';
  const isFinal = apexGame.status.abstractGameState === 'Final';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 rounded-xl border border-slate-800/80 p-4 shadow-xl shadow-black/20 overflow-hidden relative group"
    >
      {/* Background Pulse Effect */}
      {isLive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -right-4 -top-4 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"
          />
        </div>
      )}

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isLive ? "bg-orange-500/10 text-orange-500" : "bg-emerald-500/10 text-emerald-500"
          )}>
            {isLive ? <Activity className="w-4 h-4 animate-pulse" /> : <Trophy className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">
                {isLive ? 'Live Apex Game' : 'Daily Apex (Final)'}
              </span>
              {isLive && (
                <span className="flex h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
              )}
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-tight">
              {apexGame.teams.away.team.abbreviation} @ {apexGame.teams.home.team.abbreviation}
            </h3>
            <span className="text-[9px] text-slate-400 font-medium block leading-none mt-0.5">
              Highest scoring game of the day
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">Total Runs</span>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-2xl font-black italic tracking-tighter leading-none transition-colors",
                totalRuns >= 12 ? "text-orange-500" : "text-white"
              )}>
                {totalRuns}
              </span>
              {totalRuns >= 10 && (
                <Zap className="w-4 h-4 text-orange-500 fill-orange-500/20" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-800/50 pt-3">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest leading-none mb-1">Status</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              {isLive ? `${apexGame.linescore?.currentInningOrdinal} Inning` : apexGame.status.detailedState}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest leading-none mb-1">Score</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              {apexGame.teams.away.score} - {apexGame.teams.home.score}
            </span>
          </div>
        </div>
        
        {isLive && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-950/50 rounded-md border border-slate-800/50">
            <Flame className="w-3 h-3 text-orange-500" />
            <span className="text-[8px] font-mono font-black text-orange-400 uppercase tracking-widest">High Intensity</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
