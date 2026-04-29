import { useState, Fragment, useEffect } from 'react';
import { MLBGame } from '../services/mlbService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Activity, RefreshCw, ChevronDown, ChevronUp, User, Info, Wind, Thermometer, Cloud, Sun, CloudRain, CloudLightning, MapPin, AlertTriangle, Droplets, Zap, ShieldCheck, Target, Edit2, Save, Scale } from 'lucide-react';
import { calculateLiveThreat } from '../lib/projectionEngine';
import { getUmpireTendency, getGenericTendency } from '../lib/umpireEngine';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
  const wind = parseWind(game.weather?.wind);
  const homeId = game.teams.home.team.id;
  const awayEra = parseFloat(game.teams.away.probablePitcher?.era || '4.00');
  const homeEra = parseFloat(game.teams.home.probablePitcher?.era || '4.00');
  const combinedEra = awayEra + homeEra;
  
  if (homeId === 115) return { label: 'COORS SHOOTOUT', color: 'text-orange-400', icon: Zap };
  if (homeId === 133) return { label: 'OAK SHOOTOUT', color: 'text-orange-400', icon: Zap };
  
  if (homeId === 112) {
    if (wind.direction === 'OUT' && wind.speed > 5) return { label: 'WRIGLEY SHOOTOUT', color: 'text-red-400', icon: Zap };
    if (wind.direction === 'CROSS' && wind.speed > 12) return { label: 'WRIGLEY WIND RISK', color: 'text-orange-400', icon: Wind };
    if (wind.direction === 'IN' && wind.speed > 10) return { label: 'PITCHER PARK', color: 'text-blue-400', icon: ShieldCheck };
  }

  if (wind.direction === 'OUT' && wind.speed >= 12) return { label: 'WIND SHOOTOUT', color: 'text-red-400', icon: Zap };
  if (wind.direction === 'CROSS' && wind.speed >= 18) return { label: 'HIGH WIND RISK', color: 'text-orange-400', icon: Wind };
  
  if (combinedEra > 10) return { label: 'SHOOTOUT', color: 'text-red-400', icon: Zap };
  if (combinedEra < 7) return { label: 'PITCHER DUEL', color: 'text-blue-400', icon: ShieldCheck };
  return { label: 'BALANCED', color: 'text-slate-400', icon: Target };
};

interface GameLogProps {
  games: MLBGame[];
  gameLines: Record<number, number>;
  manualLines?: Record<number, number>;
}

const getClimateIntelligence = (game: MLBGame) => {
  if (!game.weather) return null;

  const temp = parseInt(game.weather.temp) || 72;
  const windStr = game.weather.wind || "";
  const windParts = windStr.split(' ');
  const windSpeed = parseInt(windParts[0]) || 0;
  const windDirRaw = windStr.toLowerCase();
  const condition = (game.weather.condition || '').toLowerCase();
  const venue = (game.venue?.name || '').toLowerCase();
  
  let impulse: 'positive' | 'negative' | 'neutral' = 'neutral';
  
  // Directional Detection
  const isOut = windDirRaw.includes('out') || windDirRaw.includes('to cf') || windDirRaw.includes('to rf') || windDirRaw.includes('to lf');
  const isIn = windDirRaw.includes('in') || windDirRaw.includes('from cf') || windDirRaw.includes('from rf') || windDirRaw.includes('from lf');
  const isToRight = windDirRaw.includes('to rf') || windDirRaw.includes('from lf') || (windDirRaw.includes('r to l') && isIn) || (windDirRaw.includes('l to r') && isOut);
  const isToLeft = windDirRaw.includes('to lf') || windDirRaw.includes('from rf') || (windDirRaw.includes('l to r') && isIn) || (windDirRaw.includes('r to l') && isOut);

  const rainKeywords = ['rain', 'shower', 'storm', 'drizzle', 'precip', 'thunder', 'lightning', 'mist'];
  const isRainy = rainKeywords.some(k => condition.includes(k));
  const isHighAltitude = venue.includes('coors') || venue.includes('chase');
  const isDome = venue.includes('tropicana') || venue.includes('loanDepot') || venue.includes('globe life') || venue.includes('minute maid') || venue.includes('american family') || venue.includes('rogers centre') || venue.includes('t-mobile') || (venue.includes('chase field') && (condition.includes('dome') || condition.includes('roof closed')));

  if (isDome) {
    const domeName = venue.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return { 
      impulse: 'neutral', 
      message: `Controlled Environment at ${domeName}. Outside weather is negated; play will strictly follow baseline park factors and player mechanics.`,
      temp, windStr, windSpeed, condition 
    };
  }

  let techReport = "";
  
  // 1. Temperature Analysis (Physics of Air Density)
  if (temp >= 94) {
    impulse = 'positive';
    techReport += `Sizzling ${temp}°F heat will keep the air extremely thin, maximizing ball flight. `;
  } else if (temp >= 85) {
    impulse = 'positive';
    techReport += `Warm ${temp}°F conditions are typical for high-offense summer ball, favoring the carry of fly balls. `;
  } else if (temp >= 75) {
    techReport += `Comfortable ${temp}°F air provides standard lift with no major thermal resistance. `;
  } else if (temp >= 65) {
    techReport += `Mild ${temp}°F air is beginning to thicken, providing a very slight edge to standard pitching mechanics. `;
  } else if (temp >= 55) {
    impulse = 'negative';
    techReport += `Cool ${temp}°F temperatures will start to "deaden" the ball's travel through the heavier atmosphere. `;
  } else {
    impulse = 'negative';
    techReport += `Chilly ${temp}°F conditions create dense air "walls" that will likely stifle deep fly balls. `;
  }

  // 2. Wind Vector Analysis
  if (windSpeed >= 18) {
    impulse = isOut ? 'positive' : (isIn ? 'negative' : impulse);
    techReport += `A punishing ${windSpeed}mph wind is dominating the field. `;
    if (isOut) techReport += "Routine fly balls have a massive probability of clearing the fence. ";
    else if (isIn) techReport += "The ball will be fighting a severe headwind; focus on the Under. ";
    else techReport += "Violent cross-currents will make defensive tracking a major challenge. ";
  } else if (windSpeed >= 10) {
    if (isOut) {
      impulse = impulse === 'negative' ? 'neutral' : 'positive';
      techReport += `The ${windSpeed}mph tailwind is a significant asset for sluggers today. `;
    } else if (isIn) {
      impulse = impulse === 'positive' ? 'neutral' : 'negative';
      techReport += `Steady ${windSpeed}mph headwind will favor control pitchers who keep the ball in the park. `;
    } else if (isToRight) {
      techReport += `Consistent ${windSpeed}mph push toward Right Field may favor left-handed power alleys. `;
    } else if (isToLeft) {
      techReport += `Consistent ${windSpeed}mph push toward Left Field may favor right-handed power alleys. `;
    } else {
      techReport += `Brisk ${windSpeed}mph cross-breeze detected. `;
    }
  } else if (windSpeed > 4) {
    techReport += `A light ${windSpeed}mph breeze is present but unlikely to shift the balance of play significantly. `;
  } else {
    techReport += "Extremely calm wind conditions suggest a pure performance matchup. ";
  }

  // 3. Moisture & Environmental Factors
  if (isRainy) {
    impulse = 'negative';
    techReport += "Risk of precipitation will lead to " + (temp < 60 ? "raw, difficult" : "slick, humid") + " conditions for both hands.";
  } else if (isHighAltitude) {
    impulse = 'positive';
    techReport += "Altitude boost: The thinner air at this venue will turn gap-hits into home runs.";
  } else if (condition.includes('humid')) {
    techReport += "High humidity might make the ball feel 'heavier' for some, but typically aids carry in heat.";
  } else if (condition.includes('clear')) {
    techReport += "Pristine clear skies will provide hitters with excellent visibility and contrast.";
  } else if (condition.includes('overcast')) {
    techReport += "Overcast layers might help hide the ball's spin from the batter slightly.";
  }

  return { impulse, message: techReport.trim(), temp, windStr, windSpeed, condition };
};

const getUmpireIntelligence = (umpireName: string) => {
  const tendency = getUmpireTendency(umpireName) || getGenericTendency(umpireName);
  const runsPerGame = tendency.runsPerGame;
  const strikeZone = tendency.strikeZone;
  const Krate = tendency.Krate;
  
  let impulse: 'positive' | 'negative' | 'neutral' = 'neutral';
  let techReport = "";

  // 1. Strike Zone Analysis
  if (strikeZone === 'Small') {
    impulse = 'positive';
    techReport += `${umpireName} is known for a "tight" or "micro" strike zone, forcing pitchers to come over the heart of the plate. `;
  } else if (strikeZone === 'Large') {
    impulse = 'negative';
    techReport += `${umpireName} typically maintains an "expansive" zone, often rewarding pitchers who can paint the corners and "chase" hitters. `;
  } else {
    techReport += `${umpireName} generally enforces a standard, predictable strike zone with few unexpected deviations. `;
  }

  // 2. Performance Metric Analysis (Runs & K-Rate)
  if (runsPerGame >= 10.0) {
    impulse = 'positive';
    techReport += `Statistically, games managed by this official average a high ${runsPerGame} runs, suggesting a severe offensive advantage. `;
  } else if (runsPerGame <= 8.5) {
    impulse = 'negative';
    techReport += `With a career average of just ${runsPerGame} runs per game, this official is a notable "Pitcher's Umpire". `;
  }

  if (Krate >= 0.20) {
    techReport += `A high strikeout frequency (${(Krate * 100).toFixed(1)}%) indicates a low tolerance for "taking" close two-strike pitches. `;
  } else if (Krate <= 0.15) {
    techReport += `A lower-than-average strikeout rate suggests hitters are often given the benefit of the doubt on borderline 50/50 calls. `;
  }

  // 3. Narrative Synthesis
  if (impulse === 'positive' && runsPerGame > 9.5) {
    techReport += "Expect high-stress innings for pitchers and frequent deep counts.";
  } else if (impulse === 'negative' && strikeZone === 'Large') {
    techReport += "High-velocity arms and breaking-ball specialists will likely leverage the wider margins today.";
  } else if (impulse === 'neutral') {
    techReport += "Performance today will likely boil down to pure player execution rather than variable officiating.";
  }

  return { impulse, message: techReport.trim(), tendency };
};

export function GameLog({ games, gameLines, manualLines = {} }: GameLogProps) {
  const { user } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === 'mattlajiness@gmail.com';
  
  const [expandedGameId, setExpandedGameId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'All' | 'Live' | 'Final' | 'Preview'>('All');
  const [editingLineId, setEditingLineId] = useState<number | null>(null);
  const [tempLine, setTempLine] = useState<string>('');

  const handleSaveLine = async (gamePk: number) => {
    if (!isAdmin) return;
    const total = parseFloat(tempLine);
    if (isNaN(total)) {
      toast.error("Invalid line total");
      return;
    }

    try {
      await setDoc(doc(db, 'gameLines', gamePk.toString()), {
        gamePk,
        total,
        updatedAt: Timestamp.now(),
        updatedBy: user?.uid
      });
      setEditingLineId(null);
      toast.success("Game line updated");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `gameLines/${gamePk}`);
    }
  };

  const toggleGame = (gameId: number) => {
    setExpandedGameId(expandedGameId === gameId ? null : gameId);
  };

  const filteredGames = games.filter(game => {
    if (filter === 'All') return true;
    return game.status.abstractGameState === filter;
  });

  const getThreatLevel = (game: MLBGame) => {
    if (!game.linescore || game.status.abstractGameState !== 'Live') return 0;
    const { offense, outs } = game.linescore;
    if (!offense) return 0;

    // Trigger ONLY with Runners in Scoring Position (2nd or 3rd base)
    if (!offense.second && !offense.third) return 0;

    return calculateLiveThreat({
      first: !!offense.first,
      second: !!offense.second,
      third: !!offense.third,
      outs: (outs || 0) >= 3 ? 0 : (outs || 0)
    });
  };

  const getRainRisk = (game: MLBGame) => {
    const condition = game.weather?.condition?.toLowerCase() || '';
    const status = (game.status?.detailedState || '').toLowerCase();
    const statusCode = (game.status?.statusCode || '').toUpperCase();
    const rainKeywords = ['rain', 'shower', 'storm', 'drizzle', 'precip', 'thunder', 'lightning', 'mist'];
    
    // If it's a delay, check if it's likely rain-related
    const isDelay = status.includes('delay') || statusCode === 'D' || statusCode === 'DR' || statusCode === 'DI';
    
    if (isDelay) {
      const isOvercast = condition.includes('overcast') || condition.includes('cloud');
      const isRainy = rainKeywords.some(keyword => condition.includes(keyword));
      
      if (isRainy || isOvercast) {
        return `Raining (${game.status.detailedState})`;
      }
      return `Delayed (${game.status.detailedState})`;
    }
    
    // Check for rain risk in active games
    if (rainKeywords.some(keyword => condition.includes(keyword))) {
      return `Risk (${game.weather?.condition})`;
    }
    
    if (condition.includes('overcast')) {
      return `Overcast`;
    }
    
    return null;
  };

  return (
    <div className="dashboard-card border-slate-800 shadow-xl transition-all duration-300">
      <div className="stitching-top" />
      <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-salami-red rounded-full" />
          <div className="flex flex-col">
            <h2 className="font-mono font-black text-white uppercase tracking-tighter text-xl">
              Daily Scorecard
            </h2>
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-[0.2em] mt-0.5">
              Live updates • Umpire & Climate Intelligence available in game details
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['All', 'Live', 'Final', 'Preview'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                filter === f 
                  ? "bg-slate-800 text-salami-red shadow-sm" 
                  : "text-slate-500 hover:text-slate-400"
              )}
            >
              {f === 'Preview' ? 'Upcoming' : f}
            </button>
          ))}
        </div>
      </div>
      
      <div className="divide-y divide-slate-800">
        {filteredGames.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 opacity-20" />
            </div>
            <div className="font-black uppercase tracking-widest text-sm mb-1">No {filter !== 'All' ? filter : ''} Games</div>
            <div className="text-[10px] font-mono uppercase">
              {filter === 'Live' ? 'Waiting for games to start' : 
               filter === 'Final' ? 'No games have finished yet' :
               filter === 'Preview' ? 'All games have started' : 'Waiting for next scheduled pitch'}
            </div>
          </div>
        ) : (
          <div>
            {/* Mobile View: Card List */}
            <div className="block md:hidden divide-y divide-slate-800">
              {filteredGames.map((game, index) => {
                if (!game || !game.teams) return null;
                const total = (game.teams.away?.score || 0) + (game.teams.home?.score || 0);
                const isExpanded = expandedGameId === game.gamePk;

                const riskMessage = getRainRisk(game);

                return (
                  <motion.div
                    key={game.gamePk}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex flex-col"
                  >
                    <div 
                      className="p-4 space-y-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
                      onClick={() => toggleGame(game.gamePk)}
                    >
                      <div className="flex items-center justify-between">
                        <div className={cn(
                          "text-[8px] font-mono font-black px-2 py-0.5 rounded shadow-sm",
                          game.status.abstractGameState === 'Live' ? "bg-red-600 text-white" :
                          game.status.abstractGameState === 'Final' ? "bg-green-600 text-white" :
                          "bg-slate-800 text-slate-400"
                        )}>
                          {game.status.abstractGameState === 'Live' && game.linescore?.currentInningOrdinal 
                            ? `${game.linescore.isTopInning ? 'TOP' : 'BOT'} ${game.linescore.currentInningOrdinal}`.toUpperCase()
                            : (game.status?.detailedState || '').toUpperCase()}
                        </div>
                        <div className="flex items-center gap-2">
                          {game.status.abstractGameState === 'Live' && getThreatLevel(game) > 0.25 && (
                             <div className={cn(
                               "flex items-center gap-1 px-1.5 py-0.5 rounded shadow-sm",
                               getThreatLevel(game) > 0.7 ? "bg-red-600 text-white" : "bg-salami-red/20 text-salami-red"
                             )}>
                               <AlertTriangle className={cn("w-3 h-3", getThreatLevel(game) > 0.7 ? "text-white" : "text-salami-red")} />
                               <span className="text-[7px] font-mono font-black uppercase tracking-widest">
                                 {getThreatLevel(game) > 0.7 ? 'High Threat' : 'Threat'}
                               </span>
                             </div>
                          )}
                          {riskMessage && (
                            <div className="flex items-center gap-1 bg-blue-500/20 px-1.5 py-0.5 rounded">
                              {riskMessage.startsWith('Raining') || riskMessage.includes('Risk') ? (
                                <CloudRain className="w-2.5 h-2.5 text-blue-400" />
                              ) : (
                                <Droplets className="w-2.5 h-2.5 text-blue-400" />
                              )}
                              <span className="text-[7px] font-mono font-black text-blue-400 uppercase tracking-widest">{riskMessage}</span>
                            </div>
                          )}
                          {(() => {
                             const intelligence = getClimateIntelligence(game);
                             if (!intelligence || intelligence.impulse === 'neutral') return null;
                             return (
                               <div className={cn(
                                 "flex items-center gap-1 px-1.5 py-0.5 rounded-full border shadow-sm",
                                 intelligence.impulse === 'positive' 
                                   ? "bg-red-500/10 border-red-500/20 text-red-500" 
                                   : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                               )}>
                                 <Zap className="w-2.5 h-2.5" />
                                 <span className="text-[7px] font-mono font-black uppercase tracking-widest">
                                   {intelligence.impulse === 'positive' ? 'Boost' : 'Edge'}
                                 </span>
                               </div>
                             );
                          })()}
                          <span className="text-[8px] font-mono text-slate-500 font-black uppercase tracking-widest mr-1">Details</span>
                          {(() => {
                             const homePlateUmpire = game.officials?.find(o => o.officialType === 'Home Plate')?.official;
                             if (!homePlateUmpire) return null;
                             const intelligence = getUmpireIntelligence(homePlateUmpire.fullName);
                             if (!intelligence || intelligence.impulse === 'neutral') return null;
                             
                             return (
                               <div className={cn(
                                 "flex items-center gap-1 px-1.5 py-0.5 rounded shadow-sm border",
                                 intelligence.impulse === 'negative' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-red-500/10 border-red-500/20 text-red-500"
                               )}>
                                 <Scale className="w-2.5 h-2.5" />
                                 <span className="text-[7px] font-mono font-black uppercase tracking-widest">
                                   {intelligence.impulse === 'negative' ? 'Ump: Pitching' : 'Ump: Hitting'}
                                 </span>
                               </div>
                             );
                           })()}
                           <span className="text-[9px] font-mono text-slate-400 font-bold">
                            {game.status.abstractGameState === 'Preview' 
                              ? new Date(game.gameDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : game.status.abstractGameState === 'Live' ? "IN PROGRESS" : "FINAL"}
                          </span>
                          {isExpanded ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-8 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img 
                                src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`} 
                                alt=""
                                className="w-5 h-5 object-contain"
                                referrerPolicy="no-referrer"
                              />
                              <span className="text-[11px] font-bold text-slate-300 truncate max-w-[100px]">
                                {game.teams.away.team.name.split(' ').pop()}
                              </span>
                              {game.teams.away.probablePitcher && (
                                <span className="text-[8px] font-mono text-slate-500 truncate max-w-[80px]">
                                  {game.teams.away.probablePitcher.fullName.split(' ').pop()}
                                  {game.teams.away.probablePitcher.era && ` (${game.teams.away.probablePitcher.era})`}
                                </span>
                              )}
                            </div>
                            <span className="font-mono font-black text-sm text-white">
                              {game.teams.away.score ?? '-'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img 
                                src={`https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`} 
                                alt=""
                                className="w-5 h-5 object-contain"
                                referrerPolicy="no-referrer"
                              />
                              <span className="text-[11px] font-bold text-slate-300 truncate max-w-[100px]">
                                {game.teams.home.team.name.split(' ').pop()}
                              </span>
                              {game.teams.home.probablePitcher && (
                                <span className="text-[8px] font-mono text-slate-500 truncate max-w-[80px]">
                                  {game.teams.home.probablePitcher.fullName.split(' ').pop()}
                                  {game.teams.home.probablePitcher.era && ` (${game.teams.home.probablePitcher.era})`}
                                </span>
                              )}
                            </div>
                            <span className="font-mono font-black text-sm text-white">
                              {game.teams.home.score ?? '-'}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-4 flex flex-col items-center border-l border-slate-800 justify-center gap-2">
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-mono font-black text-salami-red leading-none">{total}</span>
                            <span className="text-[7px] font-mono text-slate-500 font-black mt-1 uppercase tracking-tighter">Total</span>
                          </div>
                          
                          {/* Climate Intelligence Pulse */}
                          {game.weather && (() => {
                             const intelligence = getClimateIntelligence(game);
                             if (!intelligence || intelligence.impulse === 'neutral') return null;
                             return (
                               <div className={cn(
                                 "flex items-center gap-1.5 px-2 py-0.5 rounded-full border mb-1",
                                 intelligence.impulse === 'positive' 
                                   ? "bg-red-500/10 border-red-500/20 text-red-500" 
                                   : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                               )}>
                                 <Zap className="w-2.5 h-2.5" />
                                 <span className="text-[7px] font-mono font-black uppercase tracking-widest leading-none">
                                   {intelligence.impulse === 'positive' ? 'Offense Boost' : 'Pitching Edge'}
                                 </span>
                               </div>
                             );
                          })()}

                          {/* Umpire Intelligence Pulse */}
                          {(() => {
                             const homePlateUmpire = game.officials?.find(o => o.officialType === 'Home Plate')?.official;
                             if (!homePlateUmpire) return null;
                             const intelligence = getUmpireIntelligence(homePlateUmpire.fullName);
                             if (!intelligence || intelligence.impulse === 'neutral') return null;
                             return (
                               <div className={cn(
                                 "flex items-center gap-1.5 px-2 py-0.5 rounded-full border mb-2",
                                 intelligence.impulse === 'positive' 
                                   ? "bg-red-500/10 border-red-500/20 text-red-500" 
                                   : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                               )}>
                                 <Scale className="w-2.5 h-2.5" />
                                 <span className="text-[7px] font-mono font-black uppercase tracking-widest leading-none">
                                   {intelligence.impulse === 'positive' ? 'Ump: Hitting' : 'Ump: Pitching'}
                                 </span>
                               </div>
                             );
                          })()}

                          {/* O/U Line UI */}
                          <div className="pt-2 border-t border-slate-800 w-full flex flex-col items-center">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-[10px] font-mono font-black text-slate-300">
                                {gameLines[game.gamePk] !== undefined ? `L: ${gameLines[game.gamePk]}` : 'NO LINE'}
                              </span>
                            </div>
                            
                            {gameLines[game.gamePk] !== undefined && (
                              <div className={cn(
                                "text-[7px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex items-center gap-1",
                                total > gameLines[game.gamePk] ? "bg-red-500/10 text-red-500" : 
                                total < gameLines[game.gamePk] ? "bg-green-500/10 text-green-500" : 
                                "bg-blue-500/10 text-blue-500"
                              )}>
                                {(() => {
                                  const line = gameLines[game.gamePk];
                                  const diff = total - line;
                                  const label = diff > 0 ? 'OVER' : diff < 0 ? 'UNDER' : 'PUSH';
                                  const sign = diff > 0 ? '+' : '';
                                  return (
                                    <>
                                      <span>{label} {line}</span>
                                      <span className="opacity-60">({sign}{diff.toFixed(1)})</span>
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </div>

                          {game.weather && (
                            <div className="flex flex-col items-center pt-1 border-t border-slate-800 w-full justify-center">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex items-center gap-1">
                                  <Thermometer className="w-2.5 h-2.5 text-salami-red" />
                                  <span className="text-[10px] font-mono font-black text-slate-300">{game.weather.temp}°</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Wind className="w-2.5 h-2.5 text-blue-400" />
                                  <span className="text-[10px] font-mono font-bold text-slate-500">{(game.weather.wind || '').split(' ')[0]}</span>
                                </div>
                              </div>
                              {game.status.abstractGameState === 'Preview' && (
                                <div className="flex items-center gap-1">
                                  {(() => {
                                    const strength = getMatchupStrength(game);
                                    return (
                                      <>
                                        <strength.icon className={cn("w-2 h-2", strength.color)} />
                                        <span className={cn("text-[6px] font-mono font-black uppercase tracking-widest", strength.color)}>
                                          {strength.label}
                                        </span>
                                      </>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-slate-900/50"
                        >
                          <div className="p-4 pt-0 border-t border-slate-800">
                            <GameDetailView game={game} />
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
                    <th className="px-6 py-3 data-label text-center">Weather</th>
                    <th className="px-6 py-3 data-label text-center">Line (O/U)</th>
                    <th className="px-6 py-3 data-label text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredGames.map((game, index) => {
                    if (!game || !game.teams) return null;
                    
                    const homeScore = game.teams.home?.score ?? game.linescore?.teams?.home?.runs ?? 0;
                    const awayScore = game.teams.away?.score ?? game.linescore?.teams?.away?.runs ?? 0;
                    const totalScore = homeScore + awayScore;
                    
                    // Simple Pace Calculation
                    let projectedTotal = totalScore;
                    if (game.status.abstractGameState === 'Live') {
                      const inning = game.linescore?.currentInning || 1;
                      const isTop = game.linescore?.isTopInning ?? true;
                      const played = (inning - 1) + (isTop ? 0 : 0.5);
                      
                      if (played > 0) {
                        projectedTotal = (totalScore / played) * 9;
                      }
                    }

                    const isExpanded = expandedGameId === game.gamePk;
                    const riskMessage = getRainRisk(game);

                    return (
                      <Fragment key={game.gamePk}>
                        <motion.tr
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={cn(
                            "hover:bg-slate-800/50 transition-colors group cursor-pointer",
                            isExpanded && "bg-slate-800/50"
                          )}
                          onClick={() => toggleGame(game.gamePk)}
                        >
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700 shadow-sm">
                                    <img 
                                      src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`} 
                                      alt={game.teams.away.team.name}
                                      className="w-6 h-6 object-contain"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-200 tracking-tight leading-none">{game.teams.away.team.name}</span>
                                    {game.teams.away.probablePitcher && (
                                      <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-widest">
                                        P: {game.teams.away.probablePitcher.fullName}
                                        {game.teams.away.probablePitcher.era && ` (${game.teams.away.probablePitcher.era} ERA)`}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className={cn(
                                  "font-mono font-black text-lg",
                                  game.status.abstractGameState === 'Final' && (game.teams.away.score ?? 0) > (game.teams.home.score ?? 0) ? "text-white" : "text-slate-500"
                                )}>
                                  {(game.teams.away.score ?? 0).toString().padStart(2, '0')}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700 shadow-sm">
                                    <img 
                                      src={`https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`} 
                                      alt={game.teams.home.team.name}
                                      className="w-6 h-6 object-contain"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-200 tracking-tight leading-none">{game.teams.home.team.name}</span>
                                    {game.teams.home.probablePitcher && (
                                      <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-widest">
                                        P: {game.teams.home.probablePitcher.fullName}
                                        {game.teams.home.probablePitcher.era && ` (${game.teams.home.probablePitcher.era} ERA)`}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className={cn(
                                  "font-mono font-black text-lg",
                                  game.status.abstractGameState === 'Final' && (game.teams.home.score ?? 0) > (game.teams.away.score ?? 0) ? "text-white" : "text-slate-500"
                                )}>
                                  {(game.teams.home.score ?? 0).toString().padStart(2, '0')}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center bg-slate-900/30">
                            {game.weather ? (
                              <div className="inline-flex flex-col items-center gap-1">
                                <div className="flex items-center gap-2">
                                  <Thermometer className="w-3 h-3 text-salami-red" />
                                  <span className="text-xs font-mono font-black text-white">{game.weather.temp}°</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Wind className="w-3 h-3 text-blue-400" />
                                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-tighter">
                                    {(game.weather.wind || '').split(',')[0]}
                                  </span>
                                </div>
                                {game.status.abstractGameState === 'Preview' && (
                                  <div className="mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950/50 border border-slate-800">
                                    {(() => {
                                      const strength = getMatchupStrength(game);
                                      return (
                                        <>
                                          <strength.icon className={cn("w-2.5 h-2.5", strength.color)} />
                                          <span className={cn("text-[7px] font-mono font-black uppercase tracking-[0.1em]", strength.color)}>
                                            {strength.label}
                                          </span>
                                        </>
                                      );
                                    })()}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center opacity-40">
                                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">
                                  {[139, 158, 141, 136, 117, 109, 146, 140].includes(game.teams.home.team.id) ? 'Indoor' : 'Outdoor'}
                                </span>
                                <span className="text-[7px] font-mono text-slate-600 uppercase tracking-tighter mt-1">No Data</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5 text-center border-l border-slate-800">
                            <div className="flex flex-col items-center justify-center">
                              <div className="flex items-center gap-2 group/line">
                                {editingLineId === game.gamePk ? (
                                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="number"
                                      step="0.5"
                                      value={tempLine}
                                      onChange={(e) => setTempLine(e.target.value)}
                                      className="w-14 bg-slate-950 border border-salami-red rounded px-1 py-0.5 text-xs font-mono text-white text-center focus:outline-none"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleSaveLine(game.gamePk)}
                                      className="p-1 hover:bg-slate-800 rounded text-green-500"
                                    >
                                      <Save className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-mono font-black text-white">
                                        {(manualLines[game.gamePk] ?? gameLines[game.gamePk]) !== undefined ? (manualLines[game.gamePk] ?? gameLines[game.gamePk]).toFixed(1) : '---'}
                                      </span>
                                      {isAdmin && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingLineId(game.gamePk);
                                            setTempLine((manualLines[game.gamePk] ?? gameLines[game.gamePk])?.toString() || '');
                                          }}
                                          className="p-1 hover:bg-slate-800 rounded text-slate-500 opacity-0 group-hover/line:opacity-100 transition-opacity"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                    <span className="text-[7px] font-mono text-slate-500 font-bold uppercase tracking-widest mt-0.5">Betting Line</span>
                                  </div>
                                )}
                              </div>
                              
                              {((manualLines && manualLines[game.gamePk] !== undefined) || gameLines[game.gamePk] !== undefined) && (
                                <div className={cn(
                                  "mt-1 px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-widest",
                                  (game.status.abstractGameState === 'Live' ? projectedTotal : totalScore) > (manualLines[game.gamePk] ?? gameLines[game.gamePk]) ? "bg-red-500/10 text-red-500" : 
                                  (game.status.abstractGameState === 'Live' ? projectedTotal : totalScore) < (manualLines[game.gamePk] ?? gameLines[game.gamePk]) ? "bg-green-500/10 text-green-500" : 
                                  "bg-blue-500/10 text-blue-500"
                                )}>
                                {(() => {
                                  const line = manualLines[game.gamePk] ?? gameLines[game.gamePk];
                                  const isLive = game.status.abstractGameState === 'Live';
                                  const displayScore = isLive ? projectedTotal : totalScore;
                                  const diff = displayScore - line;
                                  
                                  let label = '';
                                  if (game.status.abstractGameState === 'Final') {
                                    label = diff > 0 ? 'OVER' : diff < 0 ? 'UNDER' : 'PUSH';
                                  } else if (isLive) {
                                    label = diff > 0.5 ? 'TRENDING OVER' : diff < -0.5 ? 'TRENDING UNDER' : 'ON PACE';
                                  } else {
                                    label = 'PREVIEW';
                                  }
                                  
                                  const sign = diff > 0 ? '+' : '';
                                  return (
                                    <div className="flex items-center gap-1">
                                      <span>{label} {line}</span>
                                      <span className="opacity-60">({sign}{diff.toFixed(1)})</span>
                                    </div>
                                  );
                                })()}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-2 mb-1">
                                {game.status.abstractGameState === 'Live' && getThreatLevel(game) > 0.25 && (
                                  <motion.div 
                                    animate={{ opacity: [1, 0.5, 1], scale: getThreatLevel(game) > 0.7 ? [1, 1.05, 1] : 1 }} 
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className={cn(
                                      "flex items-center gap-1.5 border px-2 py-0.5 rounded cursor-help shadow-sm",
                                      getThreatLevel(game) > 0.7 ? "bg-red-600 border-red-500 text-white" : "bg-salami-red/10 border-salami-red/20 text-salami-red"
                                    )}
                                    title={`Live scoring threat: ${getThreatLevel(game).toFixed(2)} expected runs`}
                                  >
                                    <AlertTriangle className={cn("w-3 h-3", getThreatLevel(game) > 0.7 ? "text-white" : "text-salami-red")} />
                                    <span className="text-[8px] font-mono font-black uppercase">
                                      {getThreatLevel(game) > 0.7 ? 'HIGH THREAT' : 'LIVE THREAT'}
                                    </span>
                                  </motion.div>
                                )}
                                {riskMessage && (
                                  <div 
                                    className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded cursor-help"
                                    title={`${riskMessage}. Game at risk of delay or cancellation.`}
                                  >
                                    {riskMessage.startsWith('Raining') || riskMessage.includes('Risk') ? (
                                      <CloudRain className="w-2 h-2 text-blue-400" />
                                    ) : (
                                      <Droplets className="w-2 h-2 text-blue-400" />
                                    )}
                                    <span className="text-[7px] font-mono font-black text-blue-400 uppercase">{riskMessage}</span>
                                  </div>
                                )}
                                {(() => {
                                  const homePlateUmpire = game.officials?.find(o => o.officialType === 'Home Plate')?.official;
                                  if (!homePlateUmpire) return null;
                                  const tendency = getUmpireTendency(homePlateUmpire.fullName);
                                  if (!tendency || tendency.tendency === 'Neutral') return null;
                                  
                                  return (
                                    <div 
                                      className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded cursor-help"
                                      title={`Umpire ${homePlateUmpire.fullName}: ${tendency.tendency} (${tendency.strikeZone} zone)`}
                                    >
                                      <Scale className={cn("w-2 h-2", tendency.tendency === 'Pitcher Friendly' ? "text-blue-400" : "text-red-500")} />
                                      <span className={cn("text-[7px] font-mono font-black uppercase", tendency.tendency === 'Pitcher Friendly' ? "text-blue-400" : "text-red-500")}>
                                        {tendency.tendency === 'Pitcher Friendly' ? 'UMP: P' : 'UMP: H'}
                                      </span>
                                    </div>
                                  );
                                })()}
                                <span className="text-[10px] font-mono font-black text-salami-red">
                                  TOTAL: {totalScore}
                                </span>
                              </div>
                              <div className={cn(
                                "text-[9px] font-mono font-black px-2 py-1 rounded inline-block shadow-sm",
                                game.status.abstractGameState === 'Live' ? "bg-red-600 text-white" :
                                game.status.abstractGameState === 'Final' ? "bg-green-600 text-white" :
                                "bg-slate-800 text-slate-400"
                              )}>
                                {game.status.abstractGameState === 'Live' && game.linescore?.currentInningOrdinal 
                                  ? `${game.linescore.isTopInning ? 'TOP' : 'BOT'} ${game.linescore.currentInningOrdinal}`.toUpperCase()
                                : (game.status?.detailedState || '').toUpperCase()}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="text-[9px] font-mono text-slate-400 font-bold">
                                  {game.status.abstractGameState === 'Preview' 
                                    ? new Date(game.gameDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : game.status.abstractGameState === 'Live' ? "IN PROGRESS" : "FINAL"}
                                </div>
                                <div className="flex items-center gap-1 group-hover:text-salami-red transition-colors">
                                  <span className="text-[8px] font-mono text-slate-500 font-black uppercase tracking-widest">Details</span>
                                  {isExpanded ? <ChevronUp className="w-3 h-3 text-slate-400 group-hover:text-salami-red" /> : <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-salami-red" />}
                                </div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.tr
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="bg-slate-900/50"
                            >
                              <td colSpan={3} className="px-6 py-6 border-t border-slate-800">
                                <GameDetailView game={game} />
                              </td>
                            </motion.tr>
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

        {/* Scorecard Legend Info */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-20 rounded-b-xl">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
              <Info className="w-3.5 h-3.5 text-salami-red" />
            </div>
            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.1em] leading-relaxed max-w-sm">
               Scorecard tracks live run differential against manual Over/Under totals.
            </p>
          </div>
          <div className="flex items-center gap-6 text-[8px] font-mono font-black text-slate-600 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
              <span>Trending Over</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
              <span>Trending Under</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GameDetailView({ game }: { game: MLBGame }) {
  const linescore = game.linescore;
  if (!linescore) return (
    <div className="flex items-center justify-center p-8 text-slate-500 font-mono text-[10px] uppercase tracking-widest">
      No detailed data available yet
    </div>
  );

  const isLive = game.status.abstractGameState === 'Live';
  const isFinal = game.status.abstractGameState === 'Final';
  const isActive = isLive || isFinal;

  const UmpireIntelligenceModule = (() => {
    const homePlateUmpire = game.officials?.find(o => o.officialType === 'Home Plate')?.official;
    
    if (!homePlateUmpire) return (
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/80 p-4 shadow-xl shadow-black/20 flex items-center justify-center gap-3">
        <Scale className="w-4 h-4 text-slate-700 animate-pulse" />
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-black">Umpire Assignment Pending</span>
      </div>
    );

    const intelligence = getUmpireIntelligence(homePlateUmpire.fullName);
    const { tendency, message, impulse } = intelligence;
    
    return (
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/80 p-3 sm:p-4 shadow-xl shadow-black/20 overflow-hidden relative group h-full flex flex-col">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent -mr-16 -mt-16 rounded-full blur-3xl group-hover:from-blue-500/10 transition-all duration-700" />
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner shrink-0">
              <Scale className={cn(
                "w-4 h-4",
                impulse === 'negative' ? "text-blue-400" :
                impulse === 'positive' ? "text-salami-red" :
                "text-slate-500"
              )} />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                 <span className="text-[7px] font-mono text-slate-500 uppercase tracking-[0.2em] font-black whitespace-nowrap">Umpire Intelligence</span>
                 <div className="h-px w-8 bg-slate-800" />
              </div>
              <span className="text-xs font-black text-white uppercase tracking-tight truncate">{homePlateUmpire.fullName}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto">
            <div className="flex flex-col items-end">
              <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest mb-1">Crew Bias</span>
              <div className={cn(
                "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-sm border whitespace-nowrap",
                impulse === 'positive' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                impulse === 'negative' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                "bg-slate-800 text-slate-400 border-slate-700/50"
              )}>
                {impulse === 'positive' ? 'Hitters' : impulse === 'negative' ? 'Pitchers' : 'Balanced'}
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest mb-1">Zone</span>
              <div className={cn(
                "text-[9px] font-black uppercase tracking-widest",
                tendency.strikeZone === 'Large' ? "text-blue-400" :
                tendency.strikeZone === 'Small' ? "text-red-500" :
                "text-slate-200"
              )}>
                {tendency.strikeZone}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800/50">
          <div className="space-y-0.5">
            <span className="text-[6px] font-mono text-slate-600 uppercase tracking-widest">K Pulse</span>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "text-[10px] font-bold uppercase",
                tendency.Krate > 0.18 ? "text-blue-400" :
                tendency.Krate < 0.15 ? "text-red-500" :
                "text-slate-300"
              )}>{(tendency.Krate * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className="space-y-0.5 text-center">
            <span className="text-[6px] font-mono text-slate-600 uppercase tracking-widest">Runs/G</span>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[10px] font-bold text-white tracking-widest">{tendency.runsPerGame.toFixed(1)}</span>
            </div>
          </div>
          <div className="space-y-0.5 text-right">
            <span className="text-[6px] font-mono text-slate-600 uppercase tracking-widest">Accuracy</span>
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-[10px] font-bold text-white tracking-widest">{tendency.strikePercent}%</span>
            </div>
          </div>
        </div>
        
        <div className="mt-auto pt-3">
          <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/30">
            <p className="text-[9px] font-mono text-slate-400 italic leading-relaxed">
              "{message}"
            </p>
          </div>
        </div>
      </div>
    );
  })();

  const ClimateIntelligenceModule = (() => {
    const intelligence = getClimateIntelligence(game);
    if (!intelligence) return null;

    return (
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/80 p-3 sm:p-4 shadow-xl shadow-black/20 overflow-hidden relative group h-full flex flex-col">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/5 to-transparent -mr-16 -mt-16 rounded-full blur-3xl" />
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner shrink-0">
              {intelligence.temp >= 85 ? <Zap className="w-4 h-4 text-amber-400" /> : intelligence.condition.includes('rain') ? <CloudRain className="w-4 h-4 text-blue-400" /> : <Wind className="w-4 h-4 text-blue-400" />}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                 <span className="text-[7px] font-mono text-slate-500 uppercase tracking-[0.2em] font-black whitespace-nowrap">Climate Intelligence</span>
                 <div className="h-px w-8 bg-slate-800" />
              </div>
              <span className="text-xs font-black text-white uppercase tracking-tight truncate">Atmospheric Analysis</span>
            </div>
          </div>

          <div className="flex items-center self-end sm:self-auto">
            <div className="flex flex-col items-end">
              <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest mb-1">Scoring Bias</span>
              <div className={cn(
                "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-sm border whitespace-nowrap",
                intelligence.impulse === 'positive' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                intelligence.impulse === 'negative' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                "bg-slate-800 text-slate-400 border-slate-700/50"
              )}>
                {intelligence.impulse === 'positive' ? 'Offense Boost' : intelligence.impulse === 'negative' ? 'Pitching Edge' : 'Neutral'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800/50">
          <div className="space-y-0.5">
            <span className="text-[6px] font-mono text-slate-600 uppercase tracking-widest">Temp</span>
            <div className="flex items-center gap-1.5">
              <Thermometer className={cn("w-3 h-3", intelligence.temp >= 85 ? "text-red-500" : intelligence.temp <= 50 ? "text-blue-400" : "text-amber-500")} />
              <span className="text-[10px] font-bold text-white tracking-widest">{intelligence.temp}°F</span>
            </div>
          </div>
          <div className="space-y-0.5 text-center">
            <span className="text-[6px] font-mono text-slate-600 uppercase tracking-widest">Wind</span>
            <div className="flex items-center justify-center gap-1.5 min-w-0">
              <Wind className={cn("w-3 h-3 shrink-0", intelligence.windSpeed >= 12 ? "text-red-400" : intelligence.windSpeed >= 8 ? "text-blue-400" : "text-slate-500")} />
              <span className="text-[10px] font-bold text-white tracking-widest uppercase truncate">{intelligence.windStr.split(' ')[0] || 'Calm'}</span>
            </div>
          </div>
          <div className="space-y-0.5 text-right">
            <span className="text-[6px] font-mono text-slate-600 uppercase tracking-widest">Condition</span>
            <div className="flex items-center justify-end gap-1.5 min-w-0">
              {intelligence.condition.includes('rain') ? <CloudRain className="w-3 h-3 text-blue-400 shrink-0" /> : <Sun className="w-3 h-3 text-amber-400 shrink-0" />}
              <span className="text-[10px] font-bold text-white tracking-widest uppercase truncate">{game.weather?.condition?.split(' ')[0] || 'Clear'}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-auto pt-3">
          <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/30">
            <p className="text-[9px] font-mono text-slate-400 italic leading-relaxed">
              "{intelligence.message}"
            </p>
          </div>
        </div>
      </div>
    );
  })();

  const TableModule = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3 text-slate-500" />
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            {game.venue?.name || 'Unknown Venue'}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[10px] font-mono border-collapse">
          <thead>
            <tr className="text-slate-500 border-b border-slate-800">
              <th className="text-left py-2 font-black uppercase tracking-widest">Team</th>
              {linescore.innings?.map(inn => (
                <th key={inn.num} className="text-center px-2 py-2">{inn.num}</th>
              ))}
              <th className="text-center px-3 py-2 border-l border-slate-800 font-black text-white">R</th>
              <th className="text-center px-3 py-2 text-slate-500">H</th>
              <th className="text-center px-3 py-2 text-slate-500">E</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            <tr>
              <td className="py-3 font-bold text-slate-300 uppercase tracking-tighter">
                {game.teams.away.team.name.split(' ').pop()}
              </td>
              {linescore.innings?.map(inn => (
                <td key={inn.num} className="text-center px-2 py-3 text-slate-500">{inn.away.runs ?? '-'}</td>
              ))}
              <td className="text-center px-3 py-3 border-l border-slate-800 font-black text-salami-red bg-slate-950/50">
                {linescore.teams.away.runs ?? 0}
              </td>
              <td className="text-center px-3 py-3 text-slate-500">{linescore.teams.away.hits ?? 0}</td>
              <td className="text-center px-3 py-3 text-slate-500">{linescore.teams.away.errors ?? 0}</td>
            </tr>
            <tr>
              <td className="py-3 font-bold text-slate-300 uppercase tracking-tighter">
                {game.teams.home.team.name.split(' ').pop()}
              </td>
              {linescore.innings?.map(inn => (
                <td key={inn.num} className="text-center px-2 py-3 text-slate-500">{inn.home.runs ?? '-'}</td>
              ))}
              <td className="text-center px-3 py-3 border-l border-slate-800 font-black text-salami-red bg-slate-950/50">
                {linescore.teams.home.runs ?? 0}
              </td>
              <td className="text-center px-3 py-3 text-slate-500">{linescore.teams.home.hits ?? 0}</td>
              <td className="text-center px-3 py-3 text-slate-500">{linescore.teams.home.errors ?? 0}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {isLive && (
        <div className="flex flex-wrap gap-4 pt-2">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
            <User className="w-3 h-3 text-salami-red" />
            <div className="flex flex-col">
              <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest">At Bat</span>
              <span className="text-[10px] font-bold text-white">{linescore.offense?.batter?.fullName || '---'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
            <Activity className="w-3 h-3 text-slate-500" />
            <div className="flex flex-col">
              <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest">Pitching</span>
              <span className="text-[10px] font-bold text-white">{linescore.defense?.pitcher?.fullName || '---'}</span>
            </div>
          </div>
          {(() => {
            const offense = linescore.offense;
            const hasRISP = !!offense?.second || !!offense?.third;
            if (!hasRISP) return null;

            const threat = calculateLiveThreat({
              first: !!offense?.first,
              second: !!offense?.second,
              third: !!offense?.third,
              outs: linescore.outs || 0
            });
            
            if (threat <= 0.1) return null;
            
            return (
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border",
                threat > 0.8 ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-orange-500/10 border-orange-500/20 text-orange-500"
              )}>
                <AlertTriangle className="w-3 h-3" />
                <div className="flex flex-col">
                  <span className="text-[7px] font-mono uppercase tracking-widest opacity-70">Live Threat Level</span>
                  <span className="text-[10px] font-bold uppercase">{threat > 0.8 ? 'Extremely High' : 'Elevated'} ({threat.toFixed(2)})</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );

  const DiamondModule = (
    <div className="flex flex-col items-center justify-center space-y-6 md:border-l md:border-slate-800 md:pl-8">
      {isLive ? (
        <>
          <div className="relative w-24 h-24 rotate-45 border-2 border-slate-800">
            <div className={cn("absolute -top-2 -left-2 w-4 h-4 border border-slate-700", linescore.offense?.second ? "bg-salami-red shadow-[0_0_10px_rgba(225,29,72,0.5)]" : "bg-slate-900")} title="2nd Base" />
            <div className={cn("absolute -bottom-2 -left-2 w-4 h-4 border border-slate-700", linescore.offense?.third ? "bg-salami-red shadow-[0_0_10px_rgba(225,29,72,0.5)]" : "bg-slate-900")} title="3rd Base" />
            <div className={cn("absolute -top-2 -right-2 w-4 h-4 border border-slate-700", linescore.offense?.first ? "bg-salami-red shadow-[0_0_10px_rgba(225,29,72,0.5)]" : "bg-slate-900")} title="1st Base" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 border border-slate-700 bg-slate-800" title="Home Plate" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Balls</span>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={cn("w-2 h-2 rounded-full", (linescore.balls || 0) >= i ? "bg-green-500" : "bg-slate-800")} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Strikes</span>
                <div className="flex gap-1 mt-1">
                  {[1, 2].map(i => (
                    <div key={i} className={cn("w-2 h-2 rounded-full", (linescore.strikes || 0) >= i ? "bg-salami-red" : "bg-slate-800")} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Outs</span>
                <div className="flex gap-1 mt-1">
                  {[1, 2].map(i => (
                    <div key={i} className={cn("w-2 h-2 rounded-full", (linescore.outs || 0) >= i ? "bg-white" : "bg-slate-800")} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center text-center space-y-2">
          <Info className="w-8 h-8 text-slate-700" />
          <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest leading-relaxed">
            {isFinal ? 'Game Complete' : 'Game Scheduled'}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {TableModule}
        </div>
        <div>
          {DiamondModule}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-6 border-t border-slate-800/50">
        <div className="flex flex-col h-full">
           {UmpireIntelligenceModule}
        </div>
        <div className="flex flex-col h-full">
           {ClimateIntelligenceModule}
        </div>
      </div>
    </div>
  );
}

