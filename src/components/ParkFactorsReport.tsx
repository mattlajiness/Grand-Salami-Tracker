import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  EyeOff,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Info,
  Activity
} from 'lucide-react';
import { BallparkPalFactor } from '../services/ballparkPalService';
import { cn } from '../lib/utils';

interface ParkFactorsReportProps {
  factors: BallparkPalFactor[];
  onHide?: () => void;
}

export function ParkFactorsReport({ factors, onHide }: ParkFactorsReportProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  if (!factors || factors.length === 0) return null;

  // Helper to translate runs multiplier or percentage offsets uniformly
  const getRunsOffset = (val: number) => {
    if (Math.abs(val) > 2) {
      return Math.round(val);
    }
    return Math.round((val - 1) * 100);
  };

  // Divide factors into High Receptivity (>= 0) and Low Receptivity (< 0) - Slice to top 3 for vertical space efficiency
  const highReceptivity = factors
    .filter(f => getRunsOffset(f.runs) >= 0)
    .sort((a, b) => b.runs - a.runs) // Highest runs bump first
    .slice(0, 3);

  const lowReceptivity = factors
    .filter(f => getRunsOffset(f.runs) < 0)
    .sort((a, b) => a.runs - b.runs) // Heaviest air/most negative first
    .slice(0, 3);

  // Helper to assemble carry label text dynamically based on percentage offset
  const getCarryLabel = (f: BallparkPalFactor) => {
    if (f.receptive) {
      if (f.receptive.toLowerCase().includes('close') || f.isClosed) {
        return 'ROOF CLOSED';
      }
      return f.receptive.toUpperCase();
    }
    const runsOffset = getRunsOffset(f.runs);
    if (runsOffset >= 12) return 'VERY HIGH CARRY';
    if (runsOffset >= 7) return 'MED-HIGH CARRY';
    if (runsOffset >= 2) return 'LOW CARRY';
    if (runsOffset >= 0) return 'NEUTRAL CARRY';
    if (runsOffset > -5) return 'NEUTRAL CARRY';
    if (runsOffset > -10) return 'MED-HIGH DENSITY';
    if (runsOffset > -15) return 'HIGH DENSITY';
    return 'EXTREME AIR EDGE';
  };

  // Helper to construct weather/air metadata subline
  const assembleSubline = (f: BallparkPalFactor) => {
    if (f.isClosed || f.receptive?.toLowerCase().includes('close')) {
      return 'ROOF CLOSED';
    }
    const parts = [];
    if (f.humidity) {
      parts.push(`HUM: ${f.humidity}%`);
    }
    if (f.pressure) {
      parts.push(`PRES: ${f.pressure}`);
    }

    // Add fallback micro-climate values if humidity or pressure are absent
    if (!f.humidity && !f.pressure) {
      if (f.tempHours && f.tempHours.length > 0) {
        const avgTemp = Math.round(f.tempHours.reduce((acc, t) => acc + t, 0) / f.tempHours.length);
        parts.push(`TEMP: ${avgTemp}°F`);
      }
      if (f.windHours && f.windHours.length > 0) {
        const firstWind = f.windHours[0];
        parts.push(`WIND: ${firstWind.speed}mph ${firstWind.dir}`);
      }
    }

    const carryLabel = getCarryLabel(f);
    if (carryLabel) {
      parts.push(carryLabel);
    }

    return parts.join(' | ') || 'OUTDOOR ATMOSPHERE';
  };

  // Formatting percentages (+14%, -16%)
  const formatPercentage = (val: number) => {
    const rawVal = getRunsOffset(val);
    return `${rawVal >= 0 ? '+' : ''}${rawVal}%`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl relative"
    >
      {/* Decorative neon gradient header bar */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-salami-red opacity-80" />

      {/* Header Element */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-4 border-b border-slate-900 bg-slate-950/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-550/15 rounded-xl text-amber-500 shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-white font-black text-xs sm:text-xs uppercase tracking-[0.18em]">
              Atmospheric Intelligence
            </h3>
            <p className="text-slate-500 font-mono text-[9px] uppercase tracking-wider mt-0.5">
              Park Factors & Environmental Carry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 select-none">
          <div className="hidden sm:flex items-center gap-1.5 text-[8.5px] font-mono text-slate-500 uppercase tracking-widest">
            <Info className="w-3.5 h-3.5" />
            <span>Source: Ballpark Pal</span>
          </div>

          {onHide && (
            <button
              onClick={onHide}
              title="Hide report"
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl border border-slate-850 hover:border-slate-700 transition-all cursor-pointer flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider h-fit"
            >
              <EyeOff className="w-3.5 h-3.5 text-blue-400" />
              <span>Hide</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Space & Stack Lists */}
      <div className="p-4 sm:p-6 space-y-6">
        
        {/* GROUP 1: HIGH RECEPTIVITY (CARRY+) */}
        {highReceptivity.length > 0 && (
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-emerald-450 text-emerald-400 leading-none">
              <TrendingUp className="w-4 h-4" />
              <span>High Receptivity (Carry+)</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2.5">
              <AnimatePresence mode="popLayout">
                {highReceptivity.map((f, idx) => {
                  const labelLine = assembleSubline(f);
                  const hoveredItemKey = `${f.game}-${f.time}`;
                  const hovered = hoveredItem === hoveredItemKey;

                  return (
                    <motion.div
                      key={hoveredItemKey}
                      onMouseEnter={() => setHoveredItem(hoveredItemKey)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all duration-200",
                        hovered 
                          ? "bg-slate-900/50 border-slate-800" 
                          : "bg-slate-900/15 border-slate-900/60"
                      )}
                    >
                      {/* Left: Index with game and metadata */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-slate-600 font-mono text-xs font-semibold leading-none w-4 text-left select-none">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="text-white font-extrabold text-xs sm:text-[13px] tracking-tight block">
                            {f.game}
                          </span>
                          <span className="text-slate-500 font-mono text-[8.5px] sm:text-[9.5px] uppercase tracking-wider block mt-1 truncate">
                            {labelLine}
                          </span>
                        </div>
                      </div>

                      {/* Right: Percentage bump & Lightning Zap logo container */}
                      <div className="flex items-center gap-3 sm:gap-4 shrink-0 font-mono">
                        <div className="text-right">
                          <span className="text-emerald-400 font-extrabold text-sm sm:text-base tracking-tight leading-none">
                            {formatPercentage(f.runs)}
                          </span>
                          <span className="text-slate-500 text-[8px] uppercase tracking-wider block mt-0.5 font-bold">
                            RUNS
                          </span>
                        </div>
                        <div className="p-1.5 sm:p-2 bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 rounded-lg shrink-0">
                          <Zap className="w-4 h-4 fill-emerald-500/10" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* GROUP 2: LOW RECEPTIVITY (HEAVY AIR) */}
        {lowReceptivity.length > 0 && (
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-blue-450 text-blue-400 leading-none">
              <TrendingDown className="w-4 h-4" />
              <span>Low Receptivity (Heavy Air)</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <AnimatePresence mode="popLayout">
                {lowReceptivity.map((f, idx) => {
                  const labelLine = assembleSubline(f);
                  const hoveredItemKey = `${f.game}-${f.time}`;
                  const hovered = hoveredItem === hoveredItemKey;

                  return (
                    <motion.div
                      key={hoveredItemKey}
                      onMouseEnter={() => setHoveredItem(hoveredItemKey)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all duration-200",
                        hovered 
                          ? "bg-slate-900/50 border-slate-800" 
                          : "bg-slate-900/15 border-slate-900/60"
                      )}
                    >
                      {/* Left: Index with game and metadata */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-slate-600 font-mono text-xs font-semibold leading-none w-4 text-left select-none">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="text-white font-extrabold text-xs sm:text-[13px] tracking-tight block">
                            {f.game}
                          </span>
                          <span className="text-slate-500 font-mono text-[8.5px] sm:text-[9.5px] uppercase tracking-wider block mt-1 truncate">
                            {labelLine}
                          </span>
                        </div>
                      </div>

                      {/* Right: Percentage suppression & Shield logo container */}
                      <div className="flex items-center gap-3 sm:gap-4 shrink-0 font-mono">
                        <div className="text-right">
                          <span className="text-blue-400 font-extrabold text-sm sm:text-base tracking-tight leading-none">
                            {formatPercentage(f.runs)}
                          </span>
                          <span className="text-slate-500 text-[8px] uppercase tracking-wider block mt-0.5 font-bold">
                            RUNS
                          </span>
                        </div>
                        <div className="p-1.5 sm:p-2 bg-blue-500/10 border border-blue-500/15 text-blue-400 rounded-lg shrink-0">
                          <Shield className="w-4 h-4 fill-blue-500/5" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

      </div>

      {/* Footer Disclaimer Bar */}
      <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-950/80 border-t border-slate-900 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse-slow shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
        <span className="font-mono text-[8.5px] sm:text-[9px] uppercase tracking-[0.12em] text-slate-500 font-bold select-none text-left">
          Live environmental variances detected. Salami lines often lag behind these micro-climate shifts.
        </span>
      </div>
    </motion.div>
  );
}
