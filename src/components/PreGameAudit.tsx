import { MLBGame } from '../services/mlbService';
import { Target, Wind, Thermometer, ShieldAlert, Sparkles, Zap, ShieldCheck, BatteryWarning } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface PreGameAuditProps {
  games: MLBGame[];
}

export function PreGameAudit({ games }: PreGameAuditProps) {
  const previewGames = games.filter(g => g.status.abstractGameState === 'Preview');
  
  if (previewGames.length === 0) {
    return (
      <div className="dashboard-card p-6 border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-salami-red" />
          <h2 className="text-[10px] font-mono font-black text-white uppercase tracking-[0.2em]">Slate Audit</h2>
        </div>
        <p className="text-[10px] font-mono text-slate-500 uppercase text-center py-4">All games are currently live or finished.</p>
      </div>
    );
  }

  const parseWind = (windStr: string = '') => {
    const normalized = windStr.toLowerCase();
    const speedMatch = normalized.match(/\d+/);
    const speed = speedMatch ? parseInt(speedMatch[0]) : 0;
    
    if (normalized.includes('out') || normalized.includes('to lf') || normalized.includes('to rf') || normalized.includes('to cf')) {
      return { direction: 'OUT', speed };
    }
    if (normalized.includes('in') || normalized.includes('from lf') || normalized.includes('from rf') || normalized.includes('from cf')) {
      return { direction: 'IN', speed };
    }
    return { direction: 'CROSS', speed };
  };

  const getMatchupStrength = (game: MLBGame) => {
    const awayId = game.teams.away.team.id;
    const homeId = game.teams.home.team.id;
    const awayEra = parseFloat(game.teams.away.probablePitcher?.era || '4.00');
    const homeEra = parseFloat(game.teams.home.probablePitcher?.era || '4.00');
    const combinedEra = awayEra + homeEra;
    
    // Coors Field (Rockies) and Athletics Home games are shootout risks
    if (homeId === 115) return { label: 'COORS SHOOTOUT', color: 'text-orange-400', icon: Zap };
    if (homeId === 133) return { label: 'OAK SHOOTOUT', color: 'text-orange-400', icon: Zap };
    
    if (combinedEra > 10) return { label: 'SHOOTOUT', color: 'text-red-400', icon: Zap };
    if (combinedEra < 7) return { label: 'PITCHER DUEL', color: 'text-blue-400', icon: ShieldCheck };
    return { label: 'BALANCED', color: 'text-slate-400', icon: Target };
  };

  const getBullpenFatigue = (game: MLBGame) => {
    // Audit bullpen usage for PREVIEW games by checking if they are in a series
    // For this context, we will look at boxscore data if available (though usually empty for preview)
    // Or we provide a "Fatigue Warning" based on team usage stats if we can derive them.
    // Since we are live, we'll check if the team is using a lot of pitchers in the CURRENT game (if early) 
    // or flag it as a "High Usage" alert.
    const awayPitchers = game.boxscore?.teams.away.pitchers.length || 0;
    const homePitchers = game.boxscore?.teams.home.pitchers.length || 0;
    
    return {
      away: awayPitchers >= 4,
      home: homePitchers >= 4
    };
  };

  return (
    <div className="dashboard-card border-none shadow-xl bg-slate-900 text-white overflow-hidden">
      <div className="stitching-top opacity-30" />
      <div className="p-5 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-salami-red/10 flex items-center justify-center border border-salami-red/20">
              <Sparkles className="w-4 h-4 text-salami-red" />
            </div>
            <div>
              <h2 className="text-xs font-mono font-black text-white uppercase tracking-[0.2em]">Pre-Game Audit</h2>
              <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">Scoring Environments & Forecasts</p>
            </div>
          </div>
          <div className="px-2 py-1 rounded bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono font-black text-salami-red">{previewGames.length}</span>
            <span className="text-[7px] font-mono text-slate-600 ml-1 uppercase">Upcoming</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
        {previewGames.map((game, idx) => {
          const wind = parseWind(game.weather?.wind);
          const strength = getMatchupStrength(game);
          const fatigue = getBullpenFatigue(game);
          const isHot = (parseFloat(game.weather?.temp || '70') > 85);

          return (
            <motion.div 
              key={game.gamePk}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    <img 
                      src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`} 
                      className="w-4 h-4" 
                      alt=""
                    />
                    <img 
                      src={`https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`} 
                      className="w-4 h-4" 
                      alt=""
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-tighter">
                    {game.teams.away.team.name.split(' ').pop()} @ {game.teams.home.team.name.split(' ').pop()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <strength.icon className={cn("w-3 h-3", strength.color)} />
                  <span className={cn("text-[8px] font-mono font-black uppercase tracking-widest", strength.color)}>
                    {strength.label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Wind Report */}
                <div className={cn(
                  "flex items-center gap-2 p-1.5 rounded-lg border",
                  wind.direction === 'OUT' && wind.speed > 8 ? "bg-red-500/5 border-red-500/20" : 
                  wind.direction === 'IN' && wind.speed > 8 ? "bg-blue-500/5 border-blue-500/20" :
                  "bg-slate-900 border-slate-800"
                )}>
                  <Wind className={cn(
                    "w-3 h-3",
                    wind.direction === 'OUT' ? "text-red-400" : wind.direction === 'IN' ? "text-blue-400" : "text-slate-500"
                  )} />
                  <div className="flex flex-col">
                    <span className="text-[7px] font-mono text-slate-500 uppercase leading-none">Wind</span>
                    <span className="text-[9px] font-mono font-black text-white">
                      {wind.speed} MPH {wind.direction}
                    </span>
                  </div>
                </div>

                {/* Temp Report */}
                <div className={cn(
                  "flex items-center gap-2 p-1.5 rounded-lg border",
                  isHot ? "bg-orange-500/5 border-orange-500/20" : "bg-slate-900 border-slate-800"
                )}>
                  <Thermometer className={cn("w-3 h-3", isHot ? "text-orange-400" : "text-slate-500")} />
                  <div className="flex flex-col">
                    <span className="text-[7px] font-mono text-slate-500 uppercase leading-none">Temp</span>
                    <span className="text-[9px] font-mono font-black text-white">
                      {game.weather?.temp || '--'}°
                    </span>
                  </div>
                </div>
              </div>

              {/* Fatigue Alert */}
              {(fatigue.away || fatigue.home) && (
                <div className="mt-2 flex items-center gap-2 bg-amber-500/5 border border-amber-500/10 rounded-lg p-1.5">
                  <BatteryWarning className="w-3 h-3 text-amber-500" />
                  <span className="text-[8px] font-mono font-black text-amber-500 uppercase tracking-widest">
                    Bullpen Alert: {fatigue.away ? 'Away' : ''}{fatigue.away && fatigue.home ? ' & ' : ''}{fatigue.home ? 'Home' : ''} Exhaustion
                  </span>
                </div>
              )}

              {/* Pitcher Data */}
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[6px] font-mono text-slate-500 uppercase tracking-widest">Combined ERA</span>
                  <span className="text-[10px] font-mono font-black text-slate-300">
                    {(parseFloat(game.teams.away.probablePitcher?.era || '4.00') + parseFloat(game.teams.home.probablePitcher?.era || '4.00')).toFixed(2)}
                  </span>
                </div>
                {wind.direction === 'OUT' && wind.speed > 10 && (
                  <div className="flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    <ShieldAlert className="w-2.5 h-2.5 text-red-500 animate-pulse" />
                    <span className="text-[7px] font-mono font-black text-red-500 uppercase">Wind Boost Active</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="p-3 bg-slate-950/80 border-t border-slate-800">
        <p className="text-[8px] font-mono text-slate-600 text-center uppercase tracking-widest leading-none">
          Audit focuses on high-impact environmental factors for O/U lines
        </p>
      </div>
    </div>
  );
}
