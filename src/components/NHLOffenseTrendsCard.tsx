import { useState, useEffect } from 'react';
import { NHLGame } from '../services/nhlService';
import { Flame, TrendingDown, Activity, Sparkles, Trophy, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

export interface GameRecord {
  gameId: number;
  date: string;
  opponent: string;
  isHome: boolean;
  goalsFor: number;
  goalsAgainst: number;
  result: string;
  totalGoals: number;
}

export interface TeamRecentOffense {
  team: string;
  totalGoalsFor: number;
  totalGoalsAgainst: number;
  avgGoalsFor: number;
  avgGoalsAgainst: number;
  avgTotalGoals: number;
  sampleSize: number;
  trend: 'HOT' | 'COLD' | 'STEADY';
  last3: GameRecord[];
}

interface NHLOffenseTrendsCardProps {
  game: NHLGame;
  className?: string;
}

export function NHLOffenseTrendsCard({ game, className }: NHLOffenseTrendsCardProps) {
  const awayAbbrev = (game.awayTeam?.abbrev || '').toUpperCase();
  const homeAbbrev = (game.homeTeam?.abbrev || '').toUpperCase();

  const [awayTrends, setAwayTrends] = useState<TeamRecentOffense | null>(null);
  const [homeTrends, setHomeTrends] = useState<TeamRecentOffense | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/nhl/teams-recent-offense?teams=${awayAbbrev},${homeAbbrev}`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (data[awayAbbrev]) setAwayTrends(data[awayAbbrev]);
        if (data[homeAbbrev]) setHomeTrends(data[homeAbbrev]);
      })
      .catch(err => {
        console.warn('Failed to load recent offense trends:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [awayAbbrev, homeAbbrev]);

  const combinedGpg = (awayTrends?.avgGoalsFor || 0) + (homeTrends?.avgGoalsFor || 0);
  const totalCombinedGoalsLast3 = (awayTrends?.totalGoalsFor || 0) + (homeTrends?.totalGoalsFor || 0);

  const getPaceBadge = (combined: number) => {
    if (combined >= 6.8) {
      return {
        label: '🔥 High-Scoring Offense Matchup',
        color: 'bg-red-950/40 border-red-500/50 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]',
        desc: 'Both teams are firing offensively entering tonight.'
      };
    }
    if (combined <= 5.0) {
      return {
        label: '❄️ Low-Scoring / Slump Matchup',
        color: 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400',
        desc: 'Offenses have struggled to generate goals over the last 3 games.'
      };
    }
    return {
      label: '⚡ Balanced Scoring Pace',
      color: 'bg-blue-950/40 border-blue-500/40 text-blue-400',
      desc: 'Offenses performing right around league average (6.1 GPG).'
    };
  };

  const paceInfo = getPaceBadge(combinedGpg);

  const renderTeamSection = (
    teamAbbrev: string,
    teamLogo: string,
    trends: TeamRecentOffense | null,
    isHome: boolean
  ) => {
    if (!trends || trends.sampleSize === 0) {
      return (
        <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-3 sm:p-4 space-y-3">
          <div className="flex items-center gap-2.5">
            <img src={teamLogo} alt={teamAbbrev} className="w-7 h-7 object-contain" referrerPolicy="no-referrer" />
            <span className="font-black text-white text-sm">{teamAbbrev}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">No recent games data available.</div>
        </div>
      );
    }

    const diff = trends.totalGoalsFor - trends.totalGoalsAgainst;

    return (
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-3 sm:p-4 space-y-3 font-mono">
        {/* Team Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center p-1 shrink-0 shadow-sm">
              <img src={teamLogo} alt={teamAbbrev} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-sm tracking-tight">{teamAbbrev}</span>
                <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">
                  ({isHome ? 'Home' : 'Away'})
                </span>
              </div>
              <span className="text-[8.5px] text-slate-400 block font-medium">
                Last {trends.sampleSize} Games
              </span>
            </div>
          </div>

          {/* Trend Pill */}
          <span className={cn(
            "text-[8px] px-2 py-0.5 rounded border uppercase font-black tracking-wider shrink-0",
            trends.trend === 'HOT' ? "bg-red-950/40 border-red-500/50 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.2)]" :
            trends.trend === 'COLD' ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-400" :
            "bg-blue-950/40 border-blue-500/40 text-blue-400"
          )}>
            {trends.trend === 'HOT' ? '🔥 Hot Offense' : trends.trend === 'COLD' ? '❄️ Cold' : '⚡ Steady'}
          </span>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 text-center">
          <div>
            <span className="text-[7.5px] text-slate-500 uppercase tracking-widest block font-bold mb-0.5">
              Total Goals
            </span>
            <span className="text-sm sm:text-base font-black text-white tracking-tight">
              {trends.totalGoalsFor}
            </span>
            <span className="text-[7.5px] text-slate-400 block">
              {trends.avgGoalsFor} / game
            </span>
          </div>

          <div className="border-l border-slate-800">
            <span className="text-[7.5px] text-slate-500 uppercase tracking-widest block font-bold mb-0.5">
              Allowed (GA)
            </span>
            <span className="text-sm sm:text-base font-black text-slate-300 tracking-tight">
              {trends.totalGoalsAgainst}
            </span>
            <span className="text-[7.5px] text-slate-400 block">
              {trends.avgGoalsAgainst} / game
            </span>
          </div>

          <div className="border-l border-slate-800">
            <span className="text-[7.5px] text-slate-500 uppercase tracking-widest block font-bold mb-0.5">
              Goal Diff
            </span>
            <span className={cn(
              "text-sm sm:text-base font-black tracking-tight",
              diff > 0 ? "text-emerald-400" : diff < 0 ? "text-rose-400" : "text-slate-300"
            )}>
              {diff > 0 ? `+${diff}` : diff}
            </span>
            <span className="text-[7.5px] text-slate-400 block">
              {trends.avgTotalGoals} tot/gm
            </span>
          </div>
        </div>

        {/* Game-by-Game Form Chips */}
        <div className="space-y-1.5">
          <span className="text-[7.5px] text-slate-500 uppercase font-black tracking-widest block">
            Game-by-Game Scores (Recent First)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {trends.last3.map((g, idx) => {
              const isWin = g.result.startsWith('W');
              const isOTL = g.result === 'OTL';
              const cleanDate = g.date ? g.date.split('-').slice(1).join('/') : '';

              return (
                <div 
                  key={idx}
                  className="bg-slate-950 border border-slate-800/80 rounded-md p-1.5 flex items-center justify-between text-[8.5px]"
                >
                  <div className="flex items-center gap-1 min-w-0">
                    <span className={cn(
                      "font-black px-1 py-0.2 rounded text-[7.5px] shrink-0",
                      isWin ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60" :
                      isOTL ? "bg-amber-950 text-amber-400 border border-amber-800/60" :
                      "bg-rose-950 text-rose-400 border border-rose-800/60"
                    )}>
                      {g.result}
                    </span>
                    <span className="text-slate-400 truncate">
                      {g.isHome ? 'vs' : '@'} {g.opponent}
                    </span>
                  </div>

                  <div className="font-black text-right shrink-0">
                    <span className="text-white">{g.goalsFor}</span>
                    <span className="text-slate-500">-</span>
                    <span className="text-slate-400">{g.goalsAgainst}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-4 font-mono", className)}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-800/70 flex items-center justify-center shrink-0 shadow-sm">
            <Flame className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h4 className="text-[12px] sm:text-[13px] font-black text-white uppercase tracking-wider">
              Offensive Trends (Last 3 Games)
            </h4>
            <span className="text-[8.5px] text-slate-400">
              Total goals scored & offensive output leading into tonight's game
            </span>
          </div>
        </div>

        {/* Combined Grand Salami Indicator */}
        {!loading && (awayTrends || homeTrends) && (
          <div className={cn(
            "px-2.5 py-1 rounded border text-[8px] font-black uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto",
            paceInfo.color
          )}>
            <span>{paceInfo.label}</span>
            <span className="border-l border-current/30 pl-1.5 opacity-90">
              {combinedGpg.toFixed(1)} Combined GPG
            </span>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 bg-slate-900/50 rounded-xl border border-slate-800 animate-pulse" />
          <div className="h-44 bg-slate-900/50 rounded-xl border border-slate-800 animate-pulse" />
        </div>
      ) : (
        <>
          {/* Side-by-Side Team Offense Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {renderTeamSection(awayAbbrev, game.awayTeam.logo, awayTrends, false)}
            {renderTeamSection(homeAbbrev, game.homeTeam.logo, homeTrends, true)}
          </div>
        </>
      )}
    </div>
  );
}
