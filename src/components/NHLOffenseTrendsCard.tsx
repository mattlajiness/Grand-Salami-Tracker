import { useState, useEffect, useCallback } from 'react';
import { NHLGame } from '../services/nhlService';
import { Flame, RotateCw, Activity, Sparkles, Trophy, Calendar } from 'lucide-react';
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

// Client-side in-memory cache to guarantee instant re-opens without network latency
const clientTrendsCache = new Map<string, TeamRecentOffense>();

interface NHLOffenseTrendsCardProps {
  game: NHLGame;
  preloadedAwayTrends?: TeamRecentOffense | null;
  preloadedHomeTrends?: TeamRecentOffense | null;
  className?: string;
}

export function NHLOffenseTrendsCard({ 
  game, 
  preloadedAwayTrends, 
  preloadedHomeTrends, 
  className 
}: NHLOffenseTrendsCardProps) {
  const awayAbbrev = (game.awayTeam?.abbrev || '').toUpperCase();
  const homeAbbrev = (game.homeTeam?.abbrev || '').toUpperCase();

  // Seed cache from props if provided
  if (preloadedAwayTrends && preloadedAwayTrends.sampleSize > 0) {
    clientTrendsCache.set(awayAbbrev, preloadedAwayTrends);
  }
  if (preloadedHomeTrends && preloadedHomeTrends.sampleSize > 0) {
    clientTrendsCache.set(homeAbbrev, preloadedHomeTrends);
  }

  const [awayTrends, setAwayTrends] = useState<TeamRecentOffense | null>(() => {
    return preloadedAwayTrends || clientTrendsCache.get(awayAbbrev) || null;
  });

  const [homeTrends, setHomeTrends] = useState<TeamRecentOffense | null>(() => {
    return preloadedHomeTrends || clientTrendsCache.get(homeAbbrev) || null;
  });

  const [loading, setLoading] = useState<boolean>(() => {
    const hasAway = Boolean(preloadedAwayTrends?.sampleSize || clientTrendsCache.get(awayAbbrev)?.sampleSize);
    const hasHome = Boolean(preloadedHomeTrends?.sampleSize || clientTrendsCache.get(homeAbbrev)?.sampleSize);
    return !(hasAway && hasHome);
  });

  const [retrying, setRetrying] = useState<boolean>(false);

  // Sync state if preloaded props change
  useEffect(() => {
    if (preloadedAwayTrends && preloadedAwayTrends.sampleSize > 0) {
      clientTrendsCache.set(awayAbbrev, preloadedAwayTrends);
      setAwayTrends(preloadedAwayTrends);
    }
  }, [preloadedAwayTrends, awayAbbrev]);

  useEffect(() => {
    if (preloadedHomeTrends && preloadedHomeTrends.sampleSize > 0) {
      clientTrendsCache.set(homeAbbrev, preloadedHomeTrends);
      setHomeTrends(preloadedHomeTrends);
    }
  }, [preloadedHomeTrends, homeAbbrev]);

  const loadTrends = useCallback(async (isManualRetry = false) => {
    if (!awayAbbrev && !homeAbbrev) return;

    if (isManualRetry) {
      setRetrying(true);
    }

    try {
      const res = await fetch(`/api/nhl/teams-recent-offense?teams=${awayAbbrev},${homeAbbrev}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data && typeof data === 'object') {
        if (data[awayAbbrev] && data[awayAbbrev].sampleSize > 0) {
          clientTrendsCache.set(awayAbbrev, data[awayAbbrev]);
          setAwayTrends(data[awayAbbrev]);
        }
        if (data[homeAbbrev] && data[homeAbbrev].sampleSize > 0) {
          clientTrendsCache.set(homeAbbrev, data[homeAbbrev]);
          setHomeTrends(data[homeAbbrev]);
        }
      }
    } catch (err) {
      console.warn('Failed to load recent offense trends:', err);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [awayAbbrev, homeAbbrev]);

  useEffect(() => {
    const cachedAway = clientTrendsCache.get(awayAbbrev);
    const cachedHome = clientTrendsCache.get(homeAbbrev);

    if (cachedAway && cachedAway.sampleSize > 0) setAwayTrends(cachedAway);
    if (cachedHome && cachedHome.sampleSize > 0) setHomeTrends(cachedHome);

    if (
      (!cachedAway || cachedAway.sampleSize === 0) ||
      (!cachedHome || cachedHome.sampleSize === 0)
    ) {
      setLoading(true);
      loadTrends();
    } else {
      setLoading(false);
    }
  }, [awayAbbrev, homeAbbrev, loadTrends]);

  const combinedGpg = (awayTrends?.avgGoalsFor || 0) + (homeTrends?.avgGoalsFor || 0);

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
        <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-3 sm:p-4 space-y-3 font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center p-1 shrink-0">
                <img src={teamLogo} alt={teamAbbrev} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div>
                <span className="font-black text-white text-sm">{teamAbbrev}</span>
                <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider ml-1">
                  ({isHome ? 'Home' : 'Away'})
                </span>
              </div>
            </div>

            <button
              onClick={() => loadTrends(true)}
              disabled={retrying}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[9px] font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={cn("w-2.5 h-2.5", retrying && "animate-spin")} />
              <span>{retrying ? 'Syncing...' : 'Retry'}</span>
            </button>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Retrieving recent 3-game logs...</span>
            <button 
              onClick={() => loadTrends(true)}
              className="text-salami-red hover:underline font-bold text-[9px] cursor-pointer"
            >
              Tap to fetch
            </button>
          </div>
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
          <div className="h-44 bg-slate-900/50 rounded-xl border border-slate-800 animate-pulse flex flex-col items-center justify-center gap-2 text-slate-500 font-mono text-xs">
            <RotateCw className="w-4 h-4 animate-spin text-slate-600" />
            <span>Loading {awayAbbrev} recent trends...</span>
          </div>
          <div className="h-44 bg-slate-900/50 rounded-xl border border-slate-800 animate-pulse flex flex-col items-center justify-center gap-2 text-slate-500 font-mono text-xs">
            <RotateCw className="w-4 h-4 animate-spin text-slate-600" />
            <span>Loading {homeAbbrev} recent trends...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Side-by-Side Team Offense Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {renderTeamSection(awayAbbrev, game.awayTeam?.logo, awayTrends, false)}
            {renderTeamSection(homeAbbrev, game.homeTeam?.logo, homeTrends, true)}
          </div>
        </>
      )}
    </div>
  );
}
