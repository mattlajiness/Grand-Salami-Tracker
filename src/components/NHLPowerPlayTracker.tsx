import { useState, useEffect, useMemo } from 'react';
import { NHLGame } from '../services/nhlService';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ShieldAlert, Sparkles, AlertTriangle, Flame, Percent } from 'lucide-react';
import { cn } from '../lib/utils';

interface NHLPowerPlayTrackerProps {
  game: NHLGame;
}

interface ParsedSituation {
  hasPowerPlay: boolean;
  powerPlayTeam: 'home' | 'away' | null;
  ppTeamAbbrev: string;
  pkTeamAbbrev: string;
  skatersAway: number;
  skatersHome: number;
  goalieAway: boolean;
  goalieHome: boolean;
  strengthLabel: string;
  isEmptyNet: boolean;
  emptyNetTeam: 'home' | 'away' | null;
}

export function NHLPowerPlayTracker({ game }: NHLPowerPlayTrackerProps) {
  // Parse the current strength situation
  const situation: ParsedSituation = useMemo(() => {
    const defaultSit: ParsedSituation = {
      hasPowerPlay: false,
      powerPlayTeam: null,
      ppTeamAbbrev: '',
      pkTeamAbbrev: '',
      skatersAway: 5,
      skatersHome: 5,
      goalieAway: true,
      goalieHome: true,
      strengthLabel: 'Even Strength 5v5',
      isEmptyNet: false,
      emptyNetTeam: null
    };

    if (!game.situation) {
      // Fallback detection from alternate properties
      const awayStr = game.situation?.awayTeam?.strength || 5;
      const homeStr = game.situation?.homeTeam?.strength || 5;
      if (awayStr > homeStr) {
        return {
          ...defaultSit,
          hasPowerPlay: true,
          powerPlayTeam: 'away',
          ppTeamAbbrev: game.awayTeam.abbrev,
          pkTeamAbbrev: game.homeTeam.abbrev,
          skatersAway: awayStr,
          skatersHome: homeStr,
          strengthLabel: `${awayStr} on ${homeStr} Power Play`
        };
      } else if (homeStr > awayStr) {
        return {
          ...defaultSit,
          hasPowerPlay: true,
          powerPlayTeam: 'home',
          ppTeamAbbrev: game.homeTeam.abbrev,
          pkTeamAbbrev: game.awayTeam.abbrev,
          skatersAway: awayStr,
          skatersHome: homeStr,
          strengthLabel: `${homeStr} on ${awayStr} Power Play`
        };
      }
      return defaultSit;
    }

    const { situationCode } = game.situation;
    
    // Default parser if situationCode is present (4-digit format: e.g. '1541' or '1551')
    if (situationCode && situationCode.length === 4) {
      const gAway = situationCode[0] === '1';
      const skAway = parseInt(situationCode[1]) || 5;
      const gHome = situationCode[2] === '1';
      const skHome = parseInt(situationCode[3]) || 5;

      const emptyNet = !gAway || !gHome;
      const emptyNetTeam = !gAway ? 'away' : (!gHome ? 'home' : null);

      let ppTeam: 'home' | 'away' | null = null;
      let ppAbbrev = '';
      let pkAbbrev = '';
      let isPP = false;

      // Filter out empty net scenarios from standard power play unless team strength differs
      if (skAway > skHome) {
        ppTeam = 'away';
        ppAbbrev = game.awayTeam.abbrev;
        pkAbbrev = game.homeTeam.abbrev;
        isPP = true;
      } else if (skHome > skAway) {
        ppTeam = 'home';
        ppAbbrev = game.homeTeam.abbrev;
        pkAbbrev = game.awayTeam.abbrev;
        isPP = true;
      }

      let label = `${skAway}v${skHome}`;
      if (skAway === skHome) {
        label = `Even Strength ${skAway}v${skHome}`;
      } else {
        label = ppTeam === 'away' 
          ? `${game.awayTeam.abbrev} Power Play ${skAway}v${skHome}` 
          : `${game.homeTeam.abbrev} Power Play ${skHome}v${skAway}`;
      }

      if (emptyNet) {
        const pulledAbbrev = emptyNetTeam === 'away' ? game.awayTeam.abbrev : game.homeTeam.abbrev;
        label += ` • ${pulledAbbrev} Empty Net`;
      }

      return {
        hasPowerPlay: isPP,
        powerPlayTeam: ppTeam,
        ppTeamAbbrev: ppAbbrev,
        pkTeamAbbrev: pkAbbrev,
        skatersAway: skAway,
        skatersHome: skHome,
        goalieAway: gAway,
        goalieHome: gHome,
        strengthLabel: label,
        isEmptyNet: emptyNet,
        emptyNetTeam
      };
    }

    // Direct object properties fallback
    const isAwayPP = (game.situation?.awayTeam?.strength || 5) > (game.situation?.homeTeam?.strength || 5);
    const isHomePP = (game.situation?.homeTeam?.strength || 5) > (game.situation?.awayTeam?.strength || 5);
    const sAway = game.situation?.awayTeam?.strength || 5;
    const sHome = game.situation?.homeTeam?.strength || 5;

    return {
      hasPowerPlay: isAwayPP || isHomePP,
      powerPlayTeam: isAwayPP ? 'away' : (isHomePP ? 'home' : null),
      ppTeamAbbrev: isAwayPP ? game.awayTeam.abbrev : (isHomePP ? game.homeTeam.abbrev : ''),
      pkTeamAbbrev: isAwayPP ? game.homeTeam.abbrev : (isHomePP ? game.awayTeam.abbrev : ''),
      skatersAway: sAway,
      skatersHome: sHome,
      goalieAway: true,
      goalieHome: true,
      strengthLabel: isAwayPP 
        ? `${game.awayTeam.abbrev} Power Play ${sAway}v${sHome}` 
        : (isHomePP ? `${game.homeTeam.abbrev} Power Play ${sHome}v${sAway}` : 'Even Strength 5v5'),
      isEmptyNet: false,
      emptyNetTeam: null
    };
  }, [game]);

  // Handle Power Play live physical countdown simulation inside the component
  // We keep a local state keyed by period + remaining clock to mock the actual power play timer
  const [ppTimeLeft, setPpTimeLeft] = useState(115); // Default with 1:55 remains

  useEffect(() => {
    if (!situation.hasPowerPlay) return;

    // Reset countdown to a random value if game ticks or changes
    // But since games tick every 3s, let's decrement our internal countdown by 3s
    const timer = setInterval(() => {
      setPpTimeLeft(prev => {
        if (prev <= 1) {
          // Re-seed with a fresh power play time if it hits zero, simulating sequence of penalties
          return Math.floor(Math.random() * 45) + 75; 
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [situation.hasPowerPlay, game.clock?.timeRemaining]);

  // Calculate simulated score impact metrics
  // In sports-betting models, power plays increase live expected goal output (xG)
  const stats = useMemo(() => {
    if (!situation.hasPowerPlay) {
      return {
        xgImpact: 0.05, // low baseline threat
        probability: 4.5,
        threatLevel: 'STABLE',
        oddsShift: '0.00'
      };
    }

    const { skatersAway, skatersHome, powerPlayTeam } = situation;
    const is5v3 = (skatersAway === 5 && skatersHome === 3) || (skatersHome === 5 && skatersAway === 3);

    // standard conversion probability
    let xgImpact = is5v3 ? 0.44 : 0.22; // higher projection impact
    let probability = is5v3 ? 48.5 : 23.4; // % probability of scoring during PP
    let threatLevel = is5v3 ? 'CRITICAL THREAT' : 'HIGH THREAT';
    let oddsShift = is5v3 ? '-185' : '-115'; // Line change impact

    return {
      xgImpact,
      probability: (probability + (ppTimeLeft * 0.02)).toFixed(1), // decreases slowly as clock runs out
      threatLevel,
      oddsShift
    };
  }, [situation, ppTimeLeft]);

  const formattedPpTime = useMemo(() => {
    const mins = Math.floor(ppTimeLeft / 60);
    const secs = ppTimeLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [ppTimeLeft]);

  // Determine active teams names
  const ppTeamObj = situation.powerPlayTeam === 'home' ? game.homeTeam : game.awayTeam;
  const pkTeamObj = situation.powerPlayTeam === 'home' ? game.awayTeam : game.homeTeam;

  const currentProgress = (ppTimeLeft / 120) * 100; // standard 2min penalty

  if (game.gameState === 'PRE' || game.gameState === 'FINAL') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-center items-center h-full text-center">
        <ShieldAlert className="w-6 h-6 text-slate-600 mb-2" />
        <span className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-widest">
          Situation Monitor
        </span>
        <span className="text-[9px] font-mono text-slate-600 uppercase mt-0.5">
          {game.gameState === 'PRE' ? 'Available once puck drops' : 'Game finalized • Even strength'}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between h-full font-mono relative overflow-hidden">
      {/* Decorative pulse for active PP */}
      {situation.hasPowerPlay && (
        <span className="absolute top-2 right-2 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
      )}

      <div>
        {/* Header Indicator */}
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5 mb-3">
          <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
            Live Power Play Tracker
          </span>
          <span className={cn(
            "text-[8px] border px-1.5 py-0.5 rounded font-black tracking-widest uppercase",
            situation.hasPowerPlay 
              ? "bg-amber-950/40 border-amber-800/40 text-amber-400 animate-pulse"
              : "bg-slate-950 border-slate-800 text-slate-500"
          )}>
            {situation.hasPowerPlay ? 'Penalty Active' : 'Even Strength'}
          </span>
        </div>

        {/* Body content based on power play status */}
        <AnimatePresence mode="wait">
          {!situation.hasPowerPlay ? (
            <motion.div 
              key="even-strength"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4 text-center flex flex-col items-center justify-center"
            >
              <div className="flex items-center gap-1.5 mb-1 bg-slate-950/50 border border-slate-800/40 rounded-full px-3 py-1 text-[10px] text-slate-350 font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {situation.strengthLabel}
              </div>
              <p className="text-[9px] text-slate-500 uppercase tracking-tighter max-w-[240px] leading-relaxed mx-auto mt-2">
                No active penalties. Goal threat baseline currently running on full-strength averages.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="power-play"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3.5"
            >
              {/* Strength and Team summary */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-slate-950 border border-slate-805 flex items-center justify-center overflow-hidden">
                    <img 
                      src={ppTeamObj.logo} 
                      alt={ppTeamObj.abbrev}
                      className="w-4 h-4 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white uppercase tracking-tight block leading-none">
                      {ppTeamObj.abbrev} Power Play
                    </span>
                    <span className="text-[8px] font-mono text-amber-500/85 uppercase tracking-widest block mt-1">
                      Advantage: {situation.strengthLabel.split('Power Play')[1] || `${situation.skatersAway}v${situation.skatersHome}`}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-xs font-black font-mono text-white tracking-widest leading-none">
                    {formattedPpTime}
                  </span>
                  <span className="text-[7px] text-slate-500 uppercase tracking-wider block mt-1">
                    Penalty Remaining
                  </span>
                </div>
              </div>

              {/* Time progress bar */}
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <motion.div 
                  className="h-full bg-gradient-to-r from-amber-650 to-amber-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, currentProgress)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Score and Analytics Impact */}
              <div className="bg-slate-950/80 border border-slate-850 rounded-lg p-3 space-y-2.5">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black block">
                  Model Score Impact
                </span>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Goal Probability */}
                  <div className="space-y-0.5">
                    <span className="text-[7px] text-slate-500 uppercase tracking-wider block">Goal Expectancy (xG)</span>
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-white">
                      <Percent className="w-3" />
                      <span>{stats.probability}%</span>
                    </div>
                  </div>

                  {/* Threat Rating */}
                  <div className="space-y-0.5 text-right">
                    <span className="text-[7px] text-slate-500 uppercase tracking-wider block">Threat Category</span>
                    <div className="flex items-center justify-end gap-1.5 text-xs font-extrabold text-amber-400 animate-pulse">
                      <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{stats.threatLevel}</span>
                    </div>
                  </div>
                </div>

                {/* Score Projection Details */}
                <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-[8px] font-mono text-slate-400">
                  <span className="uppercase">Live Totals Shift:</span>
                  <span className="text-emerald-450 font-bold">O/U Projection +{(stats.xgImpact).toFixed(2)} Goals</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Empty Net indicator widget */}
      {situation.isEmptyNet && (
        <div className="mt-3 bg-rose-950/20 border border-rose-900/40 rounded-lg p-2 flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-500 filter drop-shadow-[0_0_4px_rgba(239,68,68,0.3)] animate-bounce" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase text-white tracking-widest leading-none">
              Extra Skater Active
            </span>
            <span className="text-[7px] font-medium font-mono text-rose-400 uppercase mt-0.5">
              {situation.emptyNetTeam === 'away' ? game.awayTeam.abbrev : game.homeTeam.abbrev} net is currently unoccupied
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
