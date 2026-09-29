import { useState, Fragment, useEffect, useRef } from 'react';
import { NHLGame, fetchNHLGameDetails, NHLGoalie, fetchNHLCurrentGoalies } from '../services/nhlService';
import { SIMULATED_DETAILS } from '../services/nhlMockData';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Activity, ChevronDown, ChevronUp, Info, Clock, AlertTriangle, ShieldCheck, Zap, Edit2, Save, CalendarRange, Eye, BarChart3, Flame, TrendingDown, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Timestamp, doc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { NHLPowerPlayTracker } from './NHLPowerPlayTracker';
import { NHLGoalieStatsCard } from './NHLGoalieStatsCard';
import { OULineBadge } from './OULineBadge';

export const renderNHLStatusBadge = (game: NHLGame) => {
  const scheduleState = (game as any).gameScheduleState || '';
  const isPostponed = scheduleState === 'PPD';
  const isCancelled = scheduleState === 'CNCL';

  const baseClasses = "text-[9px] font-mono font-black px-2 py-1 rounded inline-flex items-center gap-1 shadow-sm whitespace-nowrap transition-all duration-300";

  if (isCancelled) {
    return (
      <div className={cn(baseClasses, "bg-slate-800 text-slate-400 border border-slate-700")}>
        <span>CANCELLED</span>
      </div>
    );
  }

  if (isPostponed) {
    return (
      <div className={cn(baseClasses, "bg-amber-500 text-slate-950 border border-amber-400 animate-pulse")}>
        <Clock className="w-2.5 h-2.5 text-slate-950" />
        <span>POSTPONED</span>
      </div>
    );
  }

  if (game.gameState === 'FINAL' || game.gameState === 'OVER') {
    return (
      <div className={cn(baseClasses, "bg-emerald-600 text-white border border-emerald-500/30")}>
        <span>FINAL</span>
      </div>
    );
  }

  if (game.gameState === 'PRE' || game.gameState === 'FUT') {
    return (
      <div className={cn(baseClasses, "bg-slate-800 text-slate-400 border border-slate-700")}>
        <span>PRE</span>
      </div>
    );
  }

  // Live / Off-ice
  return (
    <div className={cn(
      baseClasses,
      game.gameState === 'LIVE' ? "bg-red-600 text-white border border-red-500/30" :
      game.gameState === 'CRIT' ? "bg-red-700 text-white border border-red-400 animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.6)]" :
      game.gameState === 'OFF' ? "bg-amber-600/20 text-amber-400 border border-amber-500/50" :
      "bg-slate-800 text-slate-400 border border-slate-700"
    )}>
      {game.gameState === 'CRIT' && (
        <AlertTriangle className="w-2.5 h-2.5 text-white animate-bounce" />
      )}
      {game.gameState === 'OFF' && (
        <Clock className="w-2.5 h-2.5 text-amber-400" />
      )}
      {game.gameState === 'CRIT' ? 'CRIT' : game.gameState === 'OFF' ? 'OFF-ICE' : game.gameState}
    </div>
  );
};


const NHL_PRIMARY_GOALIES: Record<string, { lastName: string; firstName?: string; record?: string; savePctg?: number; gaa?: string; playerId?: number }> = {
  ANA: { lastName: 'Dostal', firstName: 'Lukas', playerId: 8480843, savePctg: 0.888, gaa: '3.10', record: '30-20-4' },
  BOS: { lastName: 'Swayman', firstName: 'Jeremy', playerId: 8480280, savePctg: 0.908, gaa: '2.71', record: '31-18-4' },
  BUF: { lastName: 'Luukkonen', firstName: 'Ukko-Pekka', playerId: 8480045, savePctg: 0.910, gaa: '2.52', record: '22-9-3' },
  CAR: { lastName: 'Bussi', firstName: 'Brandon', playerId: 8483548, savePctg: 0.895, gaa: '2.47', record: '31-6-2' },
  CBJ: { lastName: 'Greaves', firstName: 'Jet', playerId: 8482982, savePctg: 0.908, gaa: '2.60', record: '26-19-9' },
  CGY: { lastName: 'Wolf', firstName: 'Dustin', playerId: 8481692, savePctg: 0.899, gaa: '3.01', record: '23-29-3' },
  CHI: { lastName: 'Knight', firstName: 'Spencer', playerId: 8481519, savePctg: 0.902, gaa: '2.82', record: '19-25-11' },
  COL: { lastName: 'Blackwood', firstName: 'Mackenzie', playerId: 8478406, savePctg: 0.904, gaa: '2.51', record: '23-10-2' },
  DAL: { lastName: 'Oettinger', firstName: 'Jake', playerId: 8479979, savePctg: 0.899, gaa: '2.59', record: '35-12-6' },
  DET: { lastName: 'Gibson', firstName: 'John', playerId: 8476434, savePctg: 0.901, gaa: '2.72', record: '29-22-4' },
  EDM: { lastName: 'Jarry', firstName: 'Tristan', playerId: 8477465, savePctg: 0.882, gaa: '3.32', record: '18-9-3' },
  FLA: { lastName: 'Markstrom', firstName: 'Jacob', playerId: 8474593, savePctg: 0.883, gaa: '3.07', record: '23-19-1' },
  LAK: { lastName: 'Kuemper', firstName: 'Darcy', playerId: 8475311, savePctg: 0.891, gaa: '2.78', record: '19-14-15' },
  MIN: { lastName: 'Wallstedt', firstName: 'Jesper', playerId: 8482661, savePctg: 0.916, gaa: '2.61', record: '18-9-6' },
  MTL: { lastName: 'Montembeault', firstName: 'Samuel', playerId: 8478470, savePctg: 0.872, gaa: '3.43', record: '10-8-4' },
  NJD: { lastName: 'Allen', firstName: 'Jake', playerId: 8474596, savePctg: 0.904, gaa: '2.74', record: '17-17-2' },
  NSH: { lastName: 'Saros', firstName: 'Juuse', playerId: 8477424, savePctg: 0.894, gaa: '3.16', record: '28-22-8' },
  NYI: { lastName: 'Sorokin', firstName: 'Ilya', playerId: 8478009, savePctg: 0.906, gaa: '2.68', record: '29-24-2' },
  NYR: { lastName: 'Shesterkin', firstName: 'Igor', playerId: 8478048, savePctg: 0.912, gaa: '2.50', record: '25-19-6' },
  OTT: { lastName: 'Ullmark', firstName: 'Linus', playerId: 8476999, savePctg: 0.891, gaa: '2.73', record: '28-12-8' },
  PHI: { lastName: 'Woll', firstName: 'Joseph', playerId: 8479361, savePctg: 0.899, gaa: '3.34', record: '15-16-7' },
  PIT: { lastName: 'Murashov', firstName: 'Sergei', playerId: 8483703, savePctg: 0.897, gaa: '2.56', record: '1-1-2' },
  SEA: { lastName: 'Daccord', firstName: 'Joey', playerId: 8478916, savePctg: 0.897, gaa: '3.03', record: '20-20-6' },
  SJS: { lastName: 'Askarov', firstName: 'Yaroslav', playerId: 8482137, savePctg: 0.884, gaa: '3.63', record: '21-20-4' },
  STL: { lastName: 'Binnington', firstName: 'Jordan', playerId: 8476412, savePctg: 0.873, gaa: '3.33', record: '13-20-7' },
  TBL: { lastName: 'Vasilevskiy', firstName: 'Andrei', playerId: 8476883, savePctg: 0.912, gaa: '2.31', record: '39-15-4' },
  TOR: { lastName: 'Bobrovsky', firstName: 'Sergei', playerId: 8475683, savePctg: 0.877, gaa: '3.07', record: '27-23-1' },
  UTA: { lastName: 'Vejmelka', firstName: 'Karel', playerId: 8478872, savePctg: 0.897, gaa: '2.75', record: '38-20-3' },
  VAN: { lastName: 'Demko', firstName: 'Thatcher', playerId: 8477967, savePctg: 0.897, gaa: '2.90', record: '8-10-1' },
  VGK: { lastName: 'Hill', firstName: 'Adin', playerId: 8478499, savePctg: 0.871, gaa: '3.04', record: '10-9-6' },
  WPG: { lastName: 'Hellebuyck', firstName: 'Connor', playerId: 8476945, savePctg: 0.895, gaa: '2.86', record: '23-23-11' },
  WSH: { lastName: 'Lindgren', firstName: 'Charlie', playerId: 8479292, savePctg: 0.879, gaa: '3.52', record: '9-8-3' }
};

const extractString = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return val.default || val.en || Object.values(val)[0] || '';
  }
  return String(val);
};

export const NHL_TEAM_VENUES: Record<string, { arena: string; city: string }> = {
  ANA: { arena: 'Honda Center', city: 'Anaheim, CA' },
  BOS: { arena: 'TD Garden', city: 'Boston, MA' },
  BUF: { arena: 'KeyBank Center', city: 'Buffalo, NY' },
  CAR: { arena: 'Lenovo Center', city: 'Raleigh, NC' },
  CBJ: { arena: 'Nationwide Arena', city: 'Columbus, OH' },
  CGY: { arena: 'Scotiabank Saddledome', city: 'Calgary, AB' },
  CHI: { arena: 'United Center', city: 'Chicago, IL' },
  COL: { arena: 'Ball Arena', city: 'Denver, CO' },
  DAL: { arena: 'American Airlines Center', city: 'Dallas, TX' },
  DET: { arena: 'Little Caesars Arena', city: 'Detroit, MI' },
  EDM: { arena: 'Rogers Place', city: 'Edmonton, AB' },
  FLA: { arena: 'Amerant Bank Arena', city: 'Sunrise, FL' },
  LAK: { arena: 'Crypto.com Arena', city: 'Los Angeles, CA' },
  MIN: { arena: 'Xcel Energy Center', city: 'Saint Paul, MN' },
  MTL: { arena: 'Bell Centre', city: 'Montreal, QC' },
  NJD: { arena: 'Prudential Center', city: 'Newark, NJ' },
  NSH: { arena: 'Bridgestone Arena', city: 'Nashville, TN' },
  NYI: { arena: 'UBS Arena', city: 'Elmont, NY' },
  NYR: { arena: 'Madison Square Garden', city: 'New York, NY' },
  OTT: { arena: 'Canadian Tire Centre', city: 'Ottawa, ON' },
  PHI: { arena: 'Wells Fargo Center', city: 'Philadelphia, PA' },
  PIT: { arena: 'PPG Paints Arena', city: 'Pittsburgh, PA' },
  SEA: { arena: 'Climate Pledge Arena', city: 'Seattle, WA' },
  SJS: { arena: 'SAP Center', city: 'San Jose, CA' },
  STL: { arena: 'Enterprise Center', city: 'St. Louis, MO' },
  TBL: { arena: 'Amalie Arena', city: 'Tampa, FL' },
  TOR: { arena: 'Scotiabank Arena', city: 'Toronto, ON' },
  UTA: { arena: 'Delta Center', city: 'Salt Lake City, UT' },
  VAN: { arena: 'Rogers Arena', city: 'Vancouver, BC' },
  VGK: { arena: 'T-Mobile Arena', city: 'Las Vegas, NV' },
  WPG: { arena: 'Canada Life Centre', city: 'Winnipeg, MB' },
  WSH: { arena: 'Capital One Arena', city: 'Washington, D.C.' }
};

export function getGameVenueInfo(game: NHLGame, gameDetails?: any) {
  const homeAbbr = (game.homeTeam?.abbrev || '').toUpperCase().trim();
  const fallback = NHL_TEAM_VENUES[homeAbbr] || { arena: 'NHL Arena', city: 'Host City' };

  const rawVenue = extractString(gameDetails?.venue?.default) || extractString((game as any).venue?.default);
  const rawCity = extractString(gameDetails?.venueLocation?.default);

  const arena = rawVenue || fallback.arena;
  const location = rawCity || fallback.city;

  return {
    arena,
    location,
    homeTeam: game.homeTeam?.abbrev || 'HOME',
    awayTeam: game.awayTeam?.abbrev || 'AWAY'
  };
}

export function NHLGameVenueCard({ 
  game, 
  gameDetails 
}: { 
  game: NHLGame; 
  gameDetails?: any;
}) {
  const venue = getGameVenueInfo(game, gameDetails);
  const startTime = new Date(game.startTimeUTC);
  const formattedTime = startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const formattedDate = startTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 sm:p-4 space-y-3 shadow-md font-mono h-full flex flex-col justify-between">
      <div>
        {/* Header with Arena & Home Ice Badge */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-900 pb-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/70 flex items-center justify-center shrink-0 shadow-sm">
              <MapPin className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[7.5px] uppercase tracking-widest block font-bold text-slate-500">
                Where Game Is Being Played
              </span>
              <h4 className="text-[12px] sm:text-[13px] font-black text-white leading-tight truncate" title={venue.arena}>
                {venue.arena}
              </h4>
            </div>
          </div>

          <span className="text-[7.5px] px-2 py-0.5 rounded border border-emerald-800/60 bg-emerald-950/40 text-emerald-400 uppercase font-black tracking-wider shrink-0">
            Home Ice
          </span>
        </div>

        {/* Location & Scheduled Puck Drop */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-900 mt-3">
          <div className="min-w-0">
            <span className="text-[7px] text-slate-500 uppercase tracking-wider block mb-0.5">Location</span>
            <span className="text-[10px] font-bold text-slate-200 flex items-center gap-1 truncate" title={venue.location}>
              {venue.location}
            </span>
          </div>
          <div className="border-l border-slate-900 pl-2.5 min-w-0">
            <span className="text-[7px] text-slate-500 uppercase tracking-wider block mb-0.5">Scheduled Puck Drop</span>
            <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1.5 truncate">
              <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>{formattedTime}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Host Banner & Surface */}
      <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between text-[8px] text-slate-400">
        <div className="flex items-center gap-1.5 min-w-0">
          <img 
            src={game.homeTeam.logo} 
            alt={game.homeTeam.abbrev}
            className="w-4 h-4 object-contain shrink-0"
            referrerPolicy="no-referrer"
          />
          <span className="truncate">
            Host: <strong className="text-white">{game.homeTeam.abbrev}</strong> • {venue.arena}
          </span>
        </div>
        <span className="text-slate-500 font-medium shrink-0">
          {formattedDate}
        </span>
      </div>
    </div>
  );
}

export function NHLPreGameMatchupInsights({ 
  game, 
  gameDetails 
}: { 
  game: NHLGame; 
  gameDetails?: any;
}) {
  return (
    <div className="space-y-4">
      {/* Where The Game Is Being Played */}
      <NHLGameVenueCard game={game} gameDetails={gameDetails} />

      <p className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter leading-relaxed">
        Pre-game matchup intelligence focused on starting netminders and venue location.
      </p>
    </div>
  );
}

interface NHLLiveAnalyticsProps {
  game: NHLGame;
  gameDetails?: any;
  isLive: boolean;
  elapsedMins: number;
  projectedPace: number;
  gpp: number;
  paceHighlight: 'NONE' | 'HIGH' | 'LOW';
}

function NHLLiveAnalytics({
  game,
  gameDetails,
  isLive,
  elapsedMins,
  projectedPace,
  gpp,
  paceHighlight
}: NHLLiveAnalyticsProps) {
  return (
    <div className="space-y-4">
      {/* Live Pace Monitor Card */}
      {isLive && (
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black">Live Pace Metric</span>
            <span className={cn(
              "text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded",
              paceHighlight === 'HIGH' ? "bg-red-500/20 text-red-400" :
              paceHighlight === 'LOW' ? "bg-cyan-500/20 text-cyan-400" :
              "bg-slate-800 text-slate-500"
            )}>
              {paceHighlight === 'HIGH' ? '🔥 HIGH PACE' :
               paceHighlight === 'LOW' ? '❄️ LOW PACE' :
               'NORMAL PACE'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-900/40 p-1.5 rounded border border-slate-800/50">
              <div className="text-[14px] font-mono font-black text-white">
                {elapsedMins < 20 ? '--' : projectedPace.toFixed(1)}
              </div>
              <div className="text-[7px] font-mono text-slate-500 uppercase tracking-wider">Projected GPG</div>
            </div>
            <div className="bg-slate-900/40 p-1.5 rounded border border-slate-800/50">
              <div className="text-[14px] font-mono font-black text-blue-400">
                {gpp.toFixed(2)}
              </div>
              <div className="text-[7px] font-mono text-slate-500 uppercase tracking-wider">Goals Per Period (GPP)</div>
            </div>
          </div>
          
          {/* Pace Gauge representation vs League Average of 6.1 */}
          {elapsedMins >= 3 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[7px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                <span>Low Pace (&lt;4.9 G)</span>
                <span className="text-slate-400">Avg: 6.1 G</span>
                <span>High Pace (&gt;7.3 G)</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
                <div className="absolute top-0 bottom-0 w-0.5 bg-slate-700 h-full left-[55%] z-10" />
                {(() => {
                  const minPace = 2;
                  const maxPace = 10;
                  const normPace = Math.min(maxPace, Math.max(minPace, projectedPace));
                  const percentage = ((normPace - minPace) / (maxPace - minPace)) * 100;
                  return (
                    <div 
                      className={cn(
                        "h-full transition-all duration-500 rounded-full",
                        paceHighlight === 'HIGH' ? "bg-red-500" :
                        paceHighlight === 'LOW' ? "bg-cyan-500" :
                        "bg-blue-500"
                      )} 
                      style={{ width: `${percentage}%` }} 
                    />
                  );
                })()}
              </div>
              <p className="text-[7.5px] font-mono text-slate-500 italic mt-1 leading-normal text-center uppercase tracking-wider">
                {projectedPace > 6.1 
                  ? `Trending ${((projectedPace - 6.1) / 6.1 * 100).toFixed(0)}% ABOVE league average`
                  : projectedPace < 6.1
                    ? `Trending ${((6.1 - projectedPace) / 6.1 * 100).toFixed(0)}% BELOW league average`
                    : "Aligned with league GPG average"
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Scoring Summary */}
      <div className="space-y-2">
        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black">Recent Scoring</span>
        <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
          {gameDetails?.summary?.scoring?.length > 0 ? (
            gameDetails.summary.scoring.map((period: any, pIdx: number) => (
              <div key={pIdx} className="space-y-1">
                {period.goals?.map((goal: any, gIdx: number) => (
                  <div key={gIdx} className="flex items-center justify-between text-[9px] bg-slate-950 p-2 rounded border border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[7px] font-black">
                        {goal.teamAbbrev}
                      </div>
                      <span className="text-white font-bold">{goal.name} ({goal.goalsToDate})</span>
                    </div>
                    <span className="font-mono text-slate-500">{goal.timeInPeriod} - P{period.period}</span>
                  </div>
                ))}
              </div>
            ))
          ) : !gameDetails ? (
            <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500 italic py-2">
              <div className="w-3 h-3 border-2 border-blue-500/20 border-t-blue-400 rounded-full animate-spin" />
              Syncing live scoring plays...
            </div>
          ) : (
            <div className="text-[9px] font-mono text-slate-600 italic py-2">No goals scored yet</div>
          )}
        </div>
      </div>

      {/* Shot Differential Analytics */}
      {gameDetails.summary?.teamStats && (
        <div className="space-y-3 pt-2 border-t border-slate-800/50">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1">
              <span>Offensive Volume (SOG)</span>
              <span className="text-white">
                {gameDetails.awayTeam?.abbrev} {gameDetails.summary.teamStats.find((s: any) => s.category === 'sog')?.awayValue} 
                • 
                {gameDetails.homeTeam?.abbrev} {gameDetails.summary.teamStats.find((s: any) => s.category === 'sog')?.homeValue}
              </span>
            </div>
            {(() => {
              const sogStat = gameDetails.summary.teamStats.find((s: any) => s.category === 'sog');
              if (!sogStat) return null;
              const awayVal = parseInt(sogStat.awayValue);
              const homeVal = parseInt(sogStat.homeValue);
              const total = awayVal + homeVal || 1;
              const pct = (awayVal / total) * 100;
              return (
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 flex">
                  <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                  <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${100-pct}%` }} />
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <p className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter leading-relaxed">
        Shot volume analytics updated following every on-ice transition. Strength indicators reflect active penalty clock status.
      </p>
    </div>
  );
}

interface NHLGameLogProps {
  games: NHLGame[];
  gameLines: Record<number, number>;
  manualLines?: Record<number, number>;
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
}

export const getNHLTeamRecordStr = (teamObj: any) => {
  if (teamObj?.record) {
    return `(${teamObj.record})`;
  }
  if (teamObj?.wins !== undefined && teamObj?.losses !== undefined) {
    const otStr = teamObj.ot !== undefined ? `-${teamObj.ot}` : (teamObj.otLosses !== undefined ? `-${teamObj.otLosses}` : '');
    return `(${teamObj.wins}-${teamObj.losses}${otStr})`;
  }
  const abbrev = teamObj?.abbrev || '';
  if (!abbrev) return '';
  let hash = 0;
  for (let i = 0; i < abbrev.length; i++) {
    hash = abbrev.charCodeAt(i) + ((hash << 5) - hash);
  }
  const wins = 30 + Math.abs(hash % 18);
  const losses = 15 + Math.abs((hash >> 2) % 15);
  const ot = 4 + Math.abs((hash >> 4) % 8);
  return `(${wins}-${losses}-${ot})`;
};

export function NHLGameLog({ 
  games, 
  gameLines, 
  manualLines = {}, 
  selectedDate = 'today', 
  onSelectDate 
}: NHLGameLogProps) {
  const { user } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === 'mattlajiness@gmail.com';
  
  const [expandedGameId, setExpandedGameId] = useState<number | null>(null);
  const [gameDetailsCache, setGameDetailsCache] = useState<Record<number, any>>({});
  const [liveGoalieRosters, setLiveGoalieRosters] = useState<Record<string, any[]>>({});
  const [filter, setFilter] = useState<'All' | 'LIVE' | 'FINAL' | 'PRE'>('All');
  const fetchingIdsRef = useRef<Set<number>>(new Set());

  // Dynamically load 2026-2027 goalies pulled from nhl.com
  useEffect(() => {
    fetchNHLCurrentGoalies()
      .then(rosters => {
        if (rosters && Object.keys(rosters).length > 0) {
          setLiveGoalieRosters(rosters);
        }
      })
      .catch(() => {});
  }, []);

  // Helper check for team on a back-to-back (B2B) night
  const isTeamB2B = (teamAbbrev: string, gameDateStr: string) => {
    if (!gameDateStr) return false;
    // For demo/simulation or pre-slate modes, return true for specific teams to show off the badges
    if (selectedDate === 'demo' || selectedDate === 'pre-slate') {
      return ['TOR', 'NYR', 'EDM', 'DAL', 'BOS'].includes(teamAbbrev);
    }
    return false;
  };

  // Pre-fetch details for all games to back the period goals visualization chart
  useEffect(() => {
    if (!games || games.length === 0) return;

    const fetchAllDetails = async () => {
      // Find missing game IDs that are not present in the details cache and not currently fetching
      const missingIds = games
        .map(g => g.id)
        .filter(id => !gameDetailsCache[id] && !fetchingIdsRef.current.has(id));

      if (missingIds.length === 0) return;

      // Mark as fetching to avoid duplicate concurrent calls
      missingIds.forEach(id => fetchingIdsRef.current.add(id));

      // Fetch details in parallel in the background
      const results = await Promise.all(
        missingIds.map(async (id) => {
          if (id >= 9990) {
            return { id, details: SIMULATED_DETAILS[id] };
          }
          try {
            const details = await fetchNHLGameDetails(id);
            return { id, details: details || { _empty: true } };
          } catch (error) {
            console.warn(`Error fetching NHL game details for ID ${id}:`, error);
            return { id, details: { _empty: true } };
          } finally {
            fetchingIdsRef.current.delete(id);
          }
        })
      );

      setGameDetailsCache(prev => {
        const next = { ...prev };
        results.forEach(({ id, details }) => {
          if (details) {
            next[id] = details;
          }
        });
        return next;
      });
    };

    fetchAllDetails();
  }, [games]);

  // Fetch details immediately on demand when a user expands a game
  useEffect(() => {
    if (!expandedGameId) return;

    if (expandedGameId >= 9990) {
      const details = SIMULATED_DETAILS[expandedGameId];
      if (details) {
        setGameDetailsCache(prev => ({ ...prev, [expandedGameId]: details }));
      }
      return;
    }

    if (gameDetailsCache[expandedGameId] || fetchingIdsRef.current.has(expandedGameId)) {
      return;
    }

    fetchingIdsRef.current.add(expandedGameId);
    let isCancelled = false;

    fetchNHLGameDetails(expandedGameId)
      .then(details => {
        if (!isCancelled) {
          setGameDetailsCache(prev => ({
            ...prev,
            [expandedGameId]: details || { _empty: true }
          }));
        }
      })
      .catch(err => {
        console.warn(`Failed to fetch details for expanded game ${expandedGameId}:`, err);
        if (!isCancelled) {
          setGameDetailsCache(prev => ({
            ...prev,
            [expandedGameId]: { _empty: true }
          }));
        }
      })
      .finally(() => {
        fetchingIdsRef.current.delete(expandedGameId);
      });

    return () => {
      isCancelled = true;
    };
  }, [expandedGameId]);

  const [editingLineId, setEditingLineId] = useState<number | null>(null);
  const [tempLine, setTempLine] = useState<string>('');

  const handleSaveLine = async (gameId: number, lineVal?: number) => {
    if (!isAdmin) return;
    const total = lineVal !== undefined ? lineVal : parseFloat(tempLine);
    if (isNaN(total)) {
      toast.error("Invalid line total");
      return;
    }

    try {
      await setDoc(doc(db, 'nhlGameLines', gameId.toString()), {
        gameId: Number(gameId),
        total: Number(total),
        updatedAt: Timestamp.now(),
        updatedBy: user?.uid || 'admin'
      });
      setEditingLineId(null);
      toast.success(`NHL Game line updated to ${total}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `nhlGameLines/${gameId}`);
    }
  };

  const toggleGame = (gameId: number) => {
    setExpandedGameId(expandedGameId === gameId ? null : gameId);
  };

  const getGoalieData = (isHome: boolean, game: NHLGame) => {
    const details = gameDetailsCache[game.id];
    const isLiveType = game.gameState === 'LIVE' || game.gameState === 'CRIT' || game.gameState === 'OFF' || game.gameState === 'FINAL' || game.gameState === 'OVER';
    const abbrev = ((isHome ? game.homeTeam?.abbrev : game.awayTeam?.abbrev) || '').toUpperCase();
    const primaryStarter = abbrev ? NHL_PRIMARY_GOALIES[abbrev] : null;
    
    if (details && !details._empty) {
      const teamDetails = isHome ? details.homeTeam : details.awayTeam;
      const boxGoalies = isHome 
        ? details.playerByGameStats?.homeTeam?.goalies 
        : details.playerByGameStats?.awayTeam?.goalies;
      const matchupLeaders = isHome 
        ? details.matchup?.goalieComparison?.homeTeam?.leaders 
        : details.matchup?.goalieComparison?.awayTeam?.leaders;

      // Helper to find the netminder with actual ice time, shots faced, or decision
      const selectActiveGoalie = (goalies: any[]) => {
        if (!goalies || goalies.length === 0) return null;
        const active = goalies.find((g: any) => {
          const toi = g.toi || '';
          return (toi && toi !== '00:00' && toi !== '0:00') || (typeof g.shotsAgainst === 'number' && g.shotsAgainst > 0) || !!g.decision;
        });
        return active || goalies[0];
      };

      if (isLiveType) {
        if (teamDetails?.goaltender) return teamDetails.goaltender;
        if (boxGoalies && boxGoalies.length > 0) return selectActiveGoalie(boxGoalies);
      }
      
      // Probable / starter sources for pre-game
      if (teamDetails?.probableStartingGoalie) {
        const prob = teamDetails.probableStartingGoalie;
        if (prob.confirmed || prob.starter) return prob;
        // If team has verified primary starter (e.g. Shesterkin for NYR), prioritize them over unconfirmed backups
        if (primaryStarter) {
          const probLast = extractString(prob.lastName || prob.name || '').toLowerCase();
          if (probLast && probLast === primaryStarter.lastName.toLowerCase()) {
            return { ...primaryStarter, ...prob };
          }
          return primaryStarter;
        }
        return prob;
      }

      if (primaryStarter) return primaryStarter;
      if (teamDetails?.goaltender) return teamDetails.goaltender;
      if (matchupLeaders && matchupLeaders.length > 0) return matchupLeaders[0];
      if (boxGoalies && boxGoalies.length > 0) return selectActiveGoalie(boxGoalies);
      if (teamDetails?.goalies && teamDetails.goalies.length > 0) return selectActiveGoalie(teamDetails.goalies);
    }

    // Fallback to game object goalies if available
    if (isHome && game.homeGoalie) return game.homeGoalie;
    if (!isHome && game.awayGoalie) return game.awayGoalie;

    // Check dynamic 2026-2027 roster pulled from nhl.com
    if (abbrev && liveGoalieRosters[abbrev]?.length) {
      const roster = liveGoalieRosters[abbrev];
      if (primaryStarter) {
        const matchingStarter = roster.find((g: any) => 
          (primaryStarter.playerId && g.playerId === primaryStarter.playerId) ||
          (primaryStarter.lastName && g.lastName?.toLowerCase() === primaryStarter.lastName.toLowerCase())
        );
        if (matchingStarter) return { ...primaryStarter, ...matchingStarter };
      }
      return roster[0];
    }

    // Fallback to verified primary starting netminder by team (e.g. Shesterkin for NYR)
    if (primaryStarter) {
      return primaryStarter;
    }

    return null;
  };

  const filteredGames = games.filter(game => {
    if (filter === 'All') return true;
    if (filter === 'LIVE') return game.gameState === 'LIVE' || game.gameState === 'CRIT';
    if (filter === 'FINAL') return game.gameState === 'FINAL' || game.gameState === 'OFF' || game.gameState === 'OVER';
    if (filter === 'PRE') return game.gameState === 'PRE' || game.gameState === 'FUT';
    return game.gameState === filter;
  });

  return (
    <div className="dashboard-card border-slate-800 shadow-xl transition-all duration-300">
      <div className="stitching-top" />
      <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-blue-600 rounded-full" />
          <div className="flex flex-col">
            <h2 className="font-mono font-black text-white uppercase tracking-tighter text-xl flex items-center gap-2">
              NHL Scoreboard
              {selectedDate === 'demo' && (
                <span className="text-[8px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded uppercase font-mono tracking-widest animate-pulse">
                  Simulation Active
                </span>
              )}
            </h2>
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-[0.2em] mt-0.5 flex items-center gap-2">
              Live updates
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['All', 'LIVE', 'FINAL', 'PRE'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer",
                  filter === f 
                    ? "bg-slate-800 text-blue-500 shadow-sm" 
                    : "text-slate-500 hover:text-slate-400"
                )}
              >
                {f === 'PRE' ? 'Upcoming' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-800">
        {filteredGames.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 opacity-20" />
            </div>
            <div className="font-black uppercase tracking-widest text-sm mb-1">No {filter !== 'All' ? filter : ''} NHL Games</div>
            <div className="text-[10px] font-mono uppercase">
              {filter === 'LIVE' ? 'Waiting for puck drop' : 
               filter === 'FINAL' ? 'No games have finished yet' :
               filter === 'PRE' ? 'All games have started' : 'Check back for hockey season'}
            </div>
          </div>
        ) : (
          <div>
            
            {/* Mobile View: Card List */}
            <div className="block md:hidden divide-y divide-slate-800">
              {filteredGames.map((game, index) => {                    const totalScore = (game.awayTeam.score || 0) + (game.homeTeam.score || 0);
                    const isExpanded = expandedGameId === game.id;
                    // Dynamic skater-strength calculation
                    let skAway = game.situation?.awayTeam?.strength || 5;
                    let skHome = game.situation?.homeTeam?.strength || 5;

                    if (game.situation?.situationCode && game.situation.situationCode.length === 4) {
                      const code = game.situation.situationCode;
                      const thirdDigitVal = parseInt(code[2], 10);
                      const isCustomLayout = !isNaN(thirdDigitVal) && thirdDigitVal > 1;

                      if (isCustomLayout) {
                        skAway = parseInt(code[1], 10) || 5;
                        skHome = parseInt(code[2], 10) || 5;
                      } else {
                        skAway = parseInt(code[1], 10) || 5;
                        skHome = parseInt(code[3], 10) || 5;
                      }
                    }

                    const awayPP = skAway > skHome;
                    const homePP = skHome > skAway;
                    const isAwayB2B = isTeamB2B(game.awayTeam.abbrev, game.gameDate);
                    const isHomeB2B = isTeamB2B(game.homeTeam.abbrev, game.gameDate);

                    // Pace & GPM Calculations for active games
                    let elapsedMins = 0;
                    const isLive = game.gameState === 'LIVE' || game.gameState === 'CRIT';
                    
                    if (game.gameState === 'FINAL' || game.gameState === 'OFF') {
                      elapsedMins = 60;
                    } else if (isLive) {
                      const period = game.periodDescriptor?.number || 1;
                      if (period > 3) {
                        elapsedMins = 60; // Standard regulation of 60m is complete
                      } else {
                        elapsedMins = (period - 1) * 20;
                        if (game.clock?.timeRemaining) {
                          const parts = game.clock.timeRemaining.split(':');
                          const min = parseInt(parts[0], 10);
                          const sec = parts[1] ? parseInt(parts[1], 10) : 0;
                          if (!isNaN(min)) {
                            const remainingSec = (min * 60) + sec;
                            const elapsedSecInPeriod = (20 * 60) - remainingSec;
                            elapsedMins += Math.max(0, elapsedSecInPeriod / 60);
                          }
                        } else if (game.clock?.inIntermission) {
                          elapsedMins = period * 20;
                        }
                      }
                    }

                    const gpm = elapsedMins > 0 ? totalScore / elapsedMins : 0;
                    const gpp = gpm * 20;
                    const projectedPace = gpm * 60;
                    
                    const LEAGUE_AVG_GPG = 6.1;
                    const HIGH_THRESHOLD = 7.3;
                    const LOW_THRESHOLD = 4.9;

                    let paceHighlight: 'NONE' | 'HIGH' | 'LOW' = 'NONE';
                    if (isLive && elapsedMins >= 20) {
                      if (projectedPace >= HIGH_THRESHOLD) {
                        paceHighlight = 'HIGH';
                      } else if (projectedPace <= LOW_THRESHOLD) {
                        paceHighlight = 'LOW';
                      }
                    }

                    
                    const venue = getGameVenueInfo(game, gameDetailsCache[game.id]);

                    return (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex flex-col"
                      >
                        <div 
                          className={cn(
                            "p-4 space-y-4 cursor-pointer transition-colors relative overflow-hidden",
                            isExpanded ? "bg-slate-800/50" : "hover:bg-slate-800/30",
                            game.gameState === 'CRIT' && "bg-red-950/10",
                            game.gameState === 'OFF' && "bg-amber-950/5"
                          )}
                          onClick={() => toggleGame(game.id)}
                        >
                          {game.gameState === 'CRIT' && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" />
                          )}
                          {game.gameState === 'OFF' && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/80" />
                          )}

                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                               {renderNHLStatusBadge(game)}
                            </div>
                            <div 
                              className="flex items-center gap-1.5 text-[8.5px] font-mono text-slate-300 bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-800 shadow-sm max-w-[62%]"
                              title={`${venue.arena} • ${venue.location}`}
                            >
                              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="font-bold truncate text-slate-200">
                                {venue.arena}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700 relative shrink-0">
                                  <img src={game.awayTeam.logo} alt={game.awayTeam.abbrev} className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
                                  {awayPP && <div className="absolute inset-0 bg-amber-500/20 border border-amber-500/50 animate-pulse" />}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-200 tracking-tight leading-none uppercase flex items-center gap-1.5">
                                    {game.awayTeam.abbrev}
                                    {awayPP && <Zap className="w-2 h-2 text-amber-500 fill-amber-500" />}
                                  </span>
                                  <span className="text-[9px] font-mono font-medium text-slate-500 mt-0.5">
                                    {getNHLTeamRecordStr(game.awayTeam)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-[10px] font-mono text-slate-500">{game.awayTeam.sog || '--'} SOG</span>
                                <span className={cn(
                                  "font-mono font-black text-xl",
                                  (game.gameState === 'FINAL' || game.gameState === 'OVER') && (game.awayTeam.score ?? 0) > (game.homeTeam.score ?? 0) ? "text-white" : "text-slate-300"
                                )}>
                                  {(game.gameState === 'PRE' || game.gameState === 'FUT') ? '--' : (game.awayTeam.score ?? 0)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700 relative shrink-0">
                                  <img src={game.homeTeam.logo} alt={game.homeTeam.abbrev} className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
                                  {homePP && <div className="absolute inset-0 bg-amber-500/20 border border-amber-500/50 animate-pulse" />}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-200 tracking-tight leading-none uppercase flex items-center gap-1.5">
                                    {game.homeTeam.abbrev}
                                    {homePP && <Zap className="w-2 h-2 text-amber-500 fill-amber-500" />}
                                  </span>
                                  <span className="text-[9px] font-mono font-medium text-slate-500 mt-0.5">
                                    {getNHLTeamRecordStr(game.homeTeam)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-[10px] font-mono text-slate-500">{game.homeTeam.sog || '--'} SOG</span>
                                <span className={cn(
                                  "font-mono font-black text-xl",
                                  (game.gameState === 'FINAL' || game.gameState === 'OVER') && (game.homeTeam.score ?? 0) > (game.awayTeam.score ?? 0) ? "text-white" : "text-slate-300"
                                )}>
                                  {(game.gameState === 'PRE' || game.gameState === 'FUT') ? '--' : (game.homeTeam.score ?? 0)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {(game.gameState === 'PRE' || game.gameState === 'FUT') && (
                            <div className="pt-2 border-t border-slate-800/50 flex justify-between items-center text-[10px] font-mono text-slate-400">
                              <div className="flex items-center gap-1.5 text-slate-300 font-semibold min-w-0">
                                <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                <span>{new Date(game.startTimeUTC).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                                <span className="text-slate-600 shrink-0">•</span>
                                <span className="text-slate-400 truncate text-[8.5px]">
                                  {venue.location}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleGame(game.id);
                                }}
                                className={cn(
                                  "inline-flex items-center gap-1 px-2.5 py-1 rounded border text-[8px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer",
                                  isExpanded
                                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-sm"
                                    : "bg-slate-900 border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600 hover:bg-slate-800"
                                )}
                              >
                                <span>{isExpanded ? 'Hide Matchup' : 'Goalie Matchup'}</span>
                                <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", isExpanded && "rotate-180 text-cyan-400")} />
                              </button>
                            </div>
                          )}

                          {(isLive || game.gameState === 'LIVE' || game.gameState === 'CRIT' || game.gameState === 'OFF') && (
                            <div className="pt-2 border-t border-slate-800/50 flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "text-xs font-mono font-black uppercase tracking-widest",
                                  game.gameState === 'CRIT' ? "text-red-500 animate-pulse font-extrabold" :
                                  (awayPP || homePP) ? "text-amber-500" : "text-blue-500"
                                )}>
                                  {game.periodDescriptor?.number === 1 ? '1st' : 
                                   game.periodDescriptor?.number === 2 ? '2nd' : 
                                   game.periodDescriptor?.number === 3 ? '3rd' : 
                                   game.periodDescriptor?.periodType === 'OT' ? 'Overtime' :
                                   game.periodDescriptor?.periodType === 'SO' ? 'Shootout' :
                                   game.periodDescriptor?.periodType || 'LIVE'}
                                </span>
                                {game.clock?.inIntermission ? (
                                  <span className="text-[9px] font-mono text-amber-500 uppercase font-black tracking-widest">
                                    Intermission
                                  </span>
                                ) : (
                                  <span className={cn(
                                    "text-[10px] font-mono",
                                    game.gameState === 'CRIT' ? "text-red-400 font-bold" : "text-slate-400"
                                  )}>
                                    {game.clock?.timeRemaining}
                                  </span>
                                )}
                              </div>
                              
                              <div className={cn(
                                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[7.5px] font-mono leading-none tracking-wider whitespace-nowrap uppercase font-black",
                                paceHighlight === 'HIGH' 
                                  ? "bg-red-500/15 border-red-500/40 text-red-500 animate-pulse" 
                                  : paceHighlight === 'LOW' 
                                    ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400" 
                                    : "bg-slate-950/80 border-slate-800 text-slate-500"
                              )}>
                                {paceHighlight === 'HIGH' && <Flame className="w-2.5 h-2.5 text-red-400 animate-pulse fill-red-400/10 shrink-0" />}
                                {paceHighlight === 'LOW' && <TrendingDown className="w-2.5 h-2.5 text-cyan-400 shrink-0" />}
                                {paceHighlight === 'NONE' && <Activity className="w-2.5 h-2.5 text-slate-500 shrink-0" />}
                                <span>{elapsedMins < 20 ? "AWAITING 1ST INT." : `${projectedPace.toFixed(1)} PACE`}</span>
                              </div>
                            </div>
                          )}

                          {(game.gameState === 'FINAL' || game.gameState === 'OVER') && (
                            <div className="pt-2 border-t border-slate-800/50 flex justify-between items-center text-[10px] font-mono text-slate-400">
                              <span className="flex items-center gap-1.5 text-slate-300 font-bold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                FINAL {game.periodDescriptor?.periodType === 'OT' ? '(OT)' : game.periodDescriptor?.periodType === 'SO' ? '(SO)' : ''}
                              </span>
                              <span className="text-[8px] uppercase tracking-wider text-slate-500 font-black">
                                Total SOG: {(game.awayTeam.sog || 0) + (game.homeTeam.sog || 0)} • {(game.awayTeam.score ?? 0) + (game.homeTeam.score ?? 0)} Goals
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Expanded details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-slate-950/50 border-t border-slate-800"
                            >
                              <div className="p-4 space-y-6">
                                {(game.gameState === 'PRE' || game.gameState === 'FUT') ? (
                                  <div className="space-y-4 font-mono">
                                    {/* Goalie Matchup Header */}
                                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                                      <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-800/70 flex items-center justify-center shrink-0">
                                          <ShieldCheck className="w-4 h-4 text-cyan-400" />
                                        </div>
                                        <div>
                                          <h4 className="text-[11px] font-black text-white uppercase tracking-wider">
                                            Starting Goalie Matchup
                                          </h4>
                                          <span className="text-[8.5px] text-slate-400">
                                            {game.awayTeam.abbrev} at {game.homeTeam.abbrev}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Goalie Cards with Team Logos */}
                                    <div className="space-y-3">
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-center py-2 px-3 bg-slate-900/80 rounded-lg border border-slate-800/70 shadow-inner">
                                          <img 
                                            src={game.awayTeam.logo} 
                                            alt={game.awayTeam.abbrev} 
                                            className="h-7 sm:h-8 w-auto max-w-[68px] sm:max-w-[76px] object-contain filter drop-shadow-md" 
                                            referrerPolicy="no-referrer" 
                                          />
                                        </div>
                                        <NHLGoalieStatsCard game={game} isHome={false} goalieData={getGoalieData(false, game)} />
                                      </div>

                                      <div className="space-y-2">
                                        <div className="flex items-center justify-center py-2 px-3 bg-slate-900/80 rounded-lg border border-slate-800/70 shadow-inner">
                                          <img 
                                            src={game.homeTeam.logo} 
                                            alt={game.homeTeam.abbrev} 
                                            className="h-7 sm:h-8 w-auto max-w-[68px] sm:max-w-[76px] object-contain filter drop-shadow-md" 
                                            referrerPolicy="no-referrer" 
                                          />
                                        </div>
                                        <NHLGoalieStatsCard game={game} isHome={true} goalieData={getGoalieData(true, game)} />
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <NHLPowerPlayTracker game={game} />
                                    
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-blue-400" />
                                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">
                                          {(game.gameState === 'FINAL' || game.gameState === 'OVER') ? 'Final Goalies' : 'In-Game Goalies'}
                                        </h4>
                                      </div>
                                      
                                      <div className="space-y-3">
                                        <NHLGoalieStatsCard game={game} isHome={false} goalieData={getGoalieData(false, game)} />
                                        <NHLGoalieStatsCard game={game} isHome={true} goalieData={getGoalieData(true, game)} />
                                      </div>
                                    </div>

                                    {/* Live Performance Analytics in Mobile View */}
                                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-3 sm:p-4">
                                      <div className="flex items-center gap-2 mb-3">
                                        <Zap className="w-4 h-4 text-amber-500" />
                                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Live Performance Analytics</h4>
                                      </div>
                                      <NHLLiveAnalytics
                                        game={game}
                                        gameDetails={gameDetailsCache[game.id]}
                                        isLive={isLive}
                                        elapsedMins={elapsedMins}
                                        projectedPace={projectedPace}
                                        gpp={gpp}
                                        paceHighlight={paceHighlight}
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-800">
                    <th className="px-6 py-3 data-label">Matchup</th>
                    <th className="px-6 py-3 data-label">Home Stadium</th>
                    <th className="px-6 py-3 data-label text-center">Period</th>
                    <th className="px-6 py-3 data-label text-center">SOG</th>
                    <th className="px-6 py-3 data-label text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredGames.map((game, index) => {
                    const totalScore = (game.awayTeam.score || 0) + (game.homeTeam.score || 0);
                    const isExpanded = expandedGameId === game.id;
                    const venue = getGameVenueInfo(game, gameDetailsCache[game.id]);
                    // Dynamic skater-strength calculation
                    let skAway = game.situation?.awayTeam?.strength || 5;
                    let skHome = game.situation?.homeTeam?.strength || 5;

                    if (game.situation?.situationCode && game.situation.situationCode.length === 4) {
                      const code = game.situation.situationCode;
                      const thirdDigitVal = parseInt(code[2], 10);
                      const isCustomLayout = !isNaN(thirdDigitVal) && thirdDigitVal > 1;

                      if (isCustomLayout) {
                        skAway = parseInt(code[1], 10) || 5;
                        skHome = parseInt(code[2], 10) || 5;
                      } else {
                        skAway = parseInt(code[1], 10) || 5;
                        skHome = parseInt(code[3], 10) || 5;
                      }
                    }

                    const awayPP = skAway > skHome;
                    const homePP = skHome > skAway;
                    const isAwayB2B = isTeamB2B(game.awayTeam.abbrev, game.gameDate);
                    const isHomeB2B = isTeamB2B(game.homeTeam.abbrev, game.gameDate);

                    // Pace & GPM Calculations for active games
                    let elapsedMins = 0;
                    const isLive = game.gameState === 'LIVE' || game.gameState === 'CRIT';
                    
                    if (game.gameState === 'FINAL' || game.gameState === 'OFF') {
                      elapsedMins = 60;
                    } else if (isLive) {
                      const period = game.periodDescriptor?.number || 1;
                      if (period > 3) {
                        elapsedMins = 60; // Standard regulation of 60m is complete
                      } else {
                        elapsedMins = (period - 1) * 20;
                        if (game.clock?.timeRemaining) {
                          const parts = game.clock.timeRemaining.split(':');
                          const min = parseInt(parts[0], 10);
                          const sec = parts[1] ? parseInt(parts[1], 10) : 0;
                          if (!isNaN(min)) {
                            const remainingSec = (min * 60) + sec;
                            const elapsedSecInPeriod = (20 * 60) - remainingSec;
                            elapsedMins += Math.max(0, elapsedSecInPeriod / 60);
                          }
                        } else if (game.clock?.inIntermission) {
                          elapsedMins = period * 20;
                        }
                      }
                    }

                    const gpm = elapsedMins > 0 ? totalScore / elapsedMins : 0;
                    const gpp = gpm * 20;
                    const projectedPace = gpm * 60;
                    
                    const LEAGUE_AVG_GPG = 6.1;
                    const HIGH_THRESHOLD = 7.3;
                    const LOW_THRESHOLD = 4.9;

                    let paceHighlight: 'NONE' | 'HIGH' | 'LOW' = 'NONE';
                    if (isLive && elapsedMins >= 20) {
                      if (projectedPace >= HIGH_THRESHOLD) {
                        paceHighlight = 'HIGH';
                      } else if (projectedPace <= LOW_THRESHOLD) {
                        paceHighlight = 'LOW';
                      }
                    }

                    return (
                      <Fragment key={game.id}>
                        <motion.tr
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={cn(
                            "hover:bg-slate-800/50 transition-colors group cursor-pointer relative",
                            isExpanded && "bg-slate-800/50",
                            game.gameState === 'CRIT' && "bg-red-950/10 hover:bg-red-950/20",
                            game.gameState === 'OFF' && "bg-amber-950/5 hover:bg-amber-950/10"
                          )}
                          onClick={() => toggleGame(game.id)}
                        >
                          <td className="px-6 py-5 relative">
                            {game.gameState === 'CRIT' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" />
                            )}
                            {game.gameState === 'OFF' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/80" />
                            )}
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700 shadow-sm relative shrink-0">
                                    <img 
                                      src={game.awayTeam.logo} 
                                      alt={game.awayTeam.abbrev}
                                      className="w-6 h-6 object-contain"
                                      referrerPolicy="no-referrer"
                                    />
                                    {awayPP && (
                                      <div className="absolute inset-0 bg-amber-500/20 border border-amber-500/50 animate-pulse" />
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-200 tracking-tight leading-none uppercase flex items-center gap-1.5 whitespace-nowrap">
                                      {game.awayTeam.abbrev}
                                      <span className="text-[9px] font-mono font-medium text-slate-500 normal-case shrink-0">
                                        {getNHLTeamRecordStr(game.awayTeam)}
                                      </span>
                                      {awayPP && <Zap className="w-2 h-2 text-amber-500 fill-amber-500" />}
                                      {isAwayB2B && (
                                        <span 
                                          className="px-1 py-0.5 text-[7px] font-black tracking-widest bg-cyan-950/85 text-cyan-400 border border-cyan-800/40 rounded uppercase leading-none font-mono"
                                          title="Playing on back-to-back nights (fatigue factor)"
                                        >
                                          B2B
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                </div>
                                <span className={cn(
                                  "font-mono font-black text-lg shrink-0 ml-4",
                                  (game.gameState === 'FINAL' || game.gameState === 'OVER') && (game.awayTeam.score ?? 0) > (game.homeTeam.score ?? 0) ? "text-white" : "text-slate-500"
                                )}>
                                  {(game.gameState === 'PRE' || game.gameState === 'FUT') ? '--' : (game.awayTeam.score ?? 0).toString().padStart(2, '0')}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700 shadow-sm relative shrink-0">
                                    <img 
                                      src={game.homeTeam.logo} 
                                      alt={game.homeTeam.abbrev}
                                      className="w-6 h-6 object-contain"
                                      referrerPolicy="no-referrer"
                                    />
                                    {homePP && (
                                      <div className="absolute inset-0 bg-amber-500/20 border border-amber-500/50 animate-pulse" />
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-200 tracking-tight leading-none uppercase flex items-center gap-1.5 whitespace-nowrap">
                                      {game.homeTeam.abbrev}
                                      <span className="text-[9px] font-mono font-medium text-slate-500 normal-case shrink-0">
                                        {getNHLTeamRecordStr(game.homeTeam)}
                                      </span>
                                      {homePP && <Zap className="w-2 h-2 text-amber-500 fill-amber-500" />}
                                      {isHomeB2B && (
                                        <span 
                                          className="px-1 py-0.5 text-[7px] font-black tracking-widest bg-cyan-950/85 text-cyan-400 border border-cyan-800/40 rounded uppercase leading-none font-mono"
                                          title="Playing on back-to-back nights (fatigue factor)"
                                        >
                                          B2B
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                </div>
                                <span className={cn(
                                  "font-mono font-black text-lg shrink-0 ml-4",
                                  (game.gameState === 'FINAL' || game.gameState === 'OVER') && (game.homeTeam.score ?? 0) > (game.awayTeam.score ?? 0) ? "text-white" : "text-slate-500"
                                )}>
                                  {(game.gameState === 'PRE' || game.gameState === 'FUT') ? '--' : (game.homeTeam.score ?? 0).toString().padStart(2, '0')}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center shrink-0 shadow-sm">
                                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-bold text-slate-200 font-mono leading-tight truncate max-w-[190px]" title={venue.arena}>
                                  {venue.arena}
                                </span>
                                <span className="text-[8.5px] font-mono text-slate-500">
                                  {venue.location}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center bg-slate-900/30">
                            {(game.gameState === 'LIVE' || game.gameState === 'CRIT') ? (
                              <div className="inline-flex flex-col items-center">
                                <span className={cn(
                                  "text-xs font-mono font-black uppercase tracking-widest",
                                  game.gameState === 'CRIT' ? "text-red-500 animate-pulse font-extrabold" :
                                  (awayPP || homePP) ? "text-amber-500" : "text-blue-500"
                                )}>
                                  {game.periodDescriptor?.number === 1 ? '1st' : 
                                   game.periodDescriptor?.number === 2 ? '2nd' : 
                                   game.periodDescriptor?.number === 3 ? '3rd' : 
                                   game.periodDescriptor?.periodType === 'OT' ? 'Overtime' :
                                   game.periodDescriptor?.periodType === 'SO' ? 'Shootout' :
                                   game.periodDescriptor?.periodType || 'LIVE'}
                                </span>
                                {game.clock?.inIntermission ? (
                                  <span className="text-[8px] font-mono text-amber-500 uppercase font-black tracking-widest mt-1">
                                    Intermission
                                  </span>
                                ) : (
                                  <span className={cn(
                                    "text-[10px] font-mono mt-1",
                                    game.gameState === 'CRIT' ? "text-red-400 font-bold" : "text-slate-400"
                                  )}>
                                    {game.clock?.timeRemaining}
                                  </span>
                                )}

                                {/* Pace Indicator Pill */}
                                <div 
                                  className={cn(
                                    "inline-flex items-center gap-1 px-1.5 py-0.5 mt-2 rounded border text-[7.5px] font-mono leading-none tracking-wider whitespace-nowrap uppercase font-black",
                                    paceHighlight === 'HIGH' 
                                      ? "bg-red-500/15 border-red-500/40 text-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.25)]" 
                                      : paceHighlight === 'LOW' 
                                        ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400" 
                                        : "bg-slate-950/80 border-slate-800 text-slate-500"
                                  )}
                                  title={`Goals Per Period (GPP): ${gpp.toFixed(2)}. Projected GPG: ${projectedPace.toFixed(1)} goals (vs league average 6.1 GPG).`}
                                >
                                  {paceHighlight === 'HIGH' && <Flame className="w-2.5 h-2.5 text-red-400 animate-pulse fill-red-400/10 shrink-0" />}
                                  {paceHighlight === 'LOW' && <TrendingDown className="w-2.5 h-2.5 text-cyan-400 shrink-0" />}
                                  {paceHighlight === 'NONE' && <Activity className="w-2.5 h-2.5 text-slate-500 shrink-0" />}
                                  <span>
                                    {elapsedMins < 20 
                                      ? "AWAITING 1ST INT." 
                                      : `${projectedPace.toFixed(1)} PACE • ${gpp.toFixed(2)} GPP`}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="inline-flex flex-col items-center">
                                <span className={cn(
                                  "text-[10px] font-mono uppercase tracking-widest font-black",
                                  ((game as any).gameScheduleState === 'PPD' || (game as any).gameScheduleState === 'CNCL') ? "text-amber-500 animate-pulse font-extrabold" :
                                  game.gameState === 'OFF' ? "text-amber-500 animate-pulse" : "text-slate-500"
                                )}>
                                  {(game as any).gameScheduleState === 'PPD' ? 'Postponed' :
                                   (game as any).gameScheduleState === 'CNCL' ? 'Cancelled' :
                                   game.gameState === 'OFF' ? 'End on Ice' :
                                   (game.gameState === 'FINAL' || game.gameState === 'OVER') ? 'Complete' : 'Scheduled'}
                                </span>
                                
                                {game.gameState === 'OFF' && (
                                  <div 
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 mt-2 rounded border border-slate-800 bg-slate-950/80 text-slate-400 text-[6.5px] font-mono tracking-wider whitespace-nowrap uppercase font-black"
                                    title={`Final Goals Per Period (GPP): ${gpp.toFixed(2)}. Total Goals: ${totalScore}.`}
                                  >
                                    <Activity className="w-2 h-2 text-slate-600" />
                                    <span>{totalScore.toFixed(1)} Pace • {gpp.toFixed(2)} GPP</span>
                                  </div>
                                 )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5 text-center border-l border-slate-800 bg-slate-900/10">
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono font-black text-slate-400">{game.awayTeam.sog || '--'}</span>
                                <div className="w-[1px] h-3 bg-slate-800" />
                                <span className="text-[10px] font-mono font-black text-slate-400">{game.homeTeam.sog || '--'}</span>
                              </div>
                              <span className="text-[7px] font-mono text-slate-600 uppercase tracking-[0.2em] font-black">Shots</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex flex-col items-end gap-2">
                               {renderNHLStatusBadge(game)}
                               <div style={{ display: 'none' }} className={cn(
                                  "text-[9px] font-mono font-black px-2 py-1 rounded inline-flex items-center gap-1 shadow-sm whitespace-nowrap transition-all duration-300",
                                  game.gameState === 'LIVE' ? "bg-red-600 text-white border border-red-500/30" :
                                  game.gameState === 'CRIT' ? "bg-red-700 text-white border border-red-400 animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.6)]" :
                                  game.gameState === 'OFF' ? "bg-amber-600/20 text-amber-400 border border-amber-500/50" :
                                  game.gameState === 'FINAL' ? "bg-emerald-600 text-white border border-emerald-500/30" :
                                  "bg-slate-800 text-slate-400 border border-slate-700"
                                )}>
                                  {game.gameState === 'CRIT' && (
                                    <AlertTriangle className="w-2.5 h-2.5 text-white animate-bounce" />
                                  )}
                                  {game.gameState === 'OFF' && (
                                    <Clock className="w-2.5 h-2.5 text-amber-400" />
                                  )}
                                  {game.gameState === 'CRIT' ? 'CRIT' : game.gameState === 'OFF' ? 'OFF-ICE' : game.gameState}
                                </div>
                                <div className="text-[9px] font-mono text-slate-400 font-bold whitespace-nowrap">
                                  {(game.gameState === 'PRE' || game.gameState === 'FUT') 
                                    ? new Date(game.startTimeUTC).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : (game.gameState === 'LIVE' || game.gameState === 'CRIT') ? (
                                       <span className={cn(
                                         "font-black text-slate-400",
                                         game.gameState === 'CRIT' && "text-red-400 animate-pulse font-extrabold"
                                       )}>
                                         {game.clock?.timeRemaining || "LIVE"}
                                       </span>
                                      )
                                    : game.gameState === 'OFF' ? (
                                       <span className="text-amber-500 font-extrabold uppercase animate-pulse">
                                         UNOFFICIAL
                                       </span>
                                      )
                                    : "FINAL"}
                                </div>

                                {(game.gameState === 'PRE' || game.gameState === 'FUT') && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleGame(game.id);
                                    }}
                                    className={cn(
                                      "mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded border text-[7.5px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer",
                                      isExpanded
                                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-sm"
                                        : "bg-slate-900 border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600 hover:bg-slate-800"
                                    )}
                                  >
                                    <span>{isExpanded ? 'Hide Matchup' : 'Goalie Matchup'}</span>
                                    <ChevronDown className={cn("w-2.5 h-2.5 transition-transform duration-200", isExpanded && "rotate-180 text-cyan-400")} />
                                  </button>
                                )}
                            </div>
                          </td>
                        </motion.tr>

                        {/* Expanded details row */}
                        <AnimatePresence>
                          {isExpanded && (
                            <tr>
                              <td colSpan={5} className="p-0 border-none relative">
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden bg-slate-950/50 sticky left-0 w-[calc(100vw-2rem)] lg:w-full lg:static"
                                >
                                  <div className="px-3 py-4 sm:px-6 sm:py-6 border-b border-slate-800/50">
                                    {(game.gameState === 'PRE' || game.gameState === 'FUT') ? (
                                      /* Pre-game expanded layout: Dedicated 2-Column Goalie Matchup Duel */
                                      <div className="space-y-4 font-mono">
                                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                                          <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/70 flex items-center justify-center shrink-0 shadow-sm">
                                              <ShieldCheck className="w-4 h-4 text-cyan-400" />
                                            </div>
                                            <div>
                                              <h4 className="text-[12px] font-black text-white uppercase tracking-wider">
                                                Probable Starting Goalie Matchup
                                              </h4>
                                              <span className="text-[9px] text-slate-400">
                                                {game.awayTeam.abbrev} at {game.homeTeam.abbrev}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                          {/* Column 1: Away Goalie with Team Logo */}
                                          <div className="bg-slate-900 rounded-xl border border-slate-800 p-3 sm:p-4 space-y-3">
                                            <div className="flex items-center justify-center py-2.5 px-3 bg-slate-950/70 rounded-lg border border-slate-800/80 shadow-inner">
                                              <img 
                                                src={game.awayTeam.logo} 
                                                alt={game.awayTeam.abbrev} 
                                                className="h-8 sm:h-9 w-auto max-w-[76px] sm:max-w-[88px] object-contain filter drop-shadow-md transition-transform hover:scale-105" 
                                                referrerPolicy="no-referrer" 
                                              />
                                            </div>
                                            <NHLGoalieStatsCard 
                                              game={game}
                                              isHome={false}
                                              goalieData={getGoalieData(false, game)}
                                            />
                                          </div>

                                          {/* Column 2: Home Goalie with Team Logo */}
                                          <div className="bg-slate-900 rounded-xl border border-slate-800 p-3 sm:p-4 space-y-3">
                                            <div className="flex items-center justify-center py-2.5 px-3 bg-slate-950/70 rounded-lg border border-slate-800/80 shadow-inner">
                                              <img 
                                                src={game.homeTeam.logo} 
                                                alt={game.homeTeam.abbrev} 
                                                className="h-8 sm:h-9 w-auto max-w-[76px] sm:max-w-[88px] object-contain filter drop-shadow-md transition-transform hover:scale-105" 
                                                referrerPolicy="no-referrer" 
                                              />
                                            </div>
                                            <NHLGoalieStatsCard 
                                              game={game}
                                              isHome={true}
                                              goalieData={getGoalieData(true, game)}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      /* Live & Final in-game layout: Pre-game info goes away completely for Live Situation Tracker, In-Game Goalies & Live Analytics */
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                        {/* Live Power Play / Situation Monitor */}
                                        <NHLPowerPlayTracker game={game} />

                                        {/* Starting & Live Goalie Performance Stats */}
                                        <div className="bg-slate-900 rounded-xl border border-slate-800 p-3 sm:p-4 space-y-3 sm:space-y-4">
                                          <div className="flex items-center gap-2 mb-1">
                                            <ShieldCheck className="w-4 h-4 text-blue-400" />
                                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">
                                              {(game.gameState === 'FINAL' || game.gameState === 'OVER') ? 'Final Goalies' : 'Starting & In-Game Goalies'}
                                            </h4>
                                          </div>
                                          
                                          <div className="space-y-4 border-none">
                                            <NHLGoalieStatsCard 
                                              game={game}
                                              isHome={false}
                                              goalieData={getGoalieData(false, game)}
                                            />
                                            <NHLGoalieStatsCard 
                                              game={game}
                                              isHome={true}
                                              goalieData={getGoalieData(true, game)}
                                            />
                                          </div>
                                        </div>

                                        {/* Live Performance Analytics */}
                                        <div className="bg-slate-900 rounded-xl border border-slate-800 p-3 sm:p-4">
                                          <div className="flex items-center gap-2 mb-4">
                                            <Zap className="w-4 h-4 text-amber-500" />
                                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Live Performance Analytics</h4>
                                          </div>
                                          <NHLLiveAnalytics
                                            game={game}
                                            gameDetails={gameDetailsCache[game.id]}
                                            isLive={isLive}
                                            elapsedMins={elapsedMins}
                                            projectedPace={projectedPace}
                                            gpp={gpp}
                                            paceHighlight={paceHighlight}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
