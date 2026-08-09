import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Edit2, Save, X, Scale } from 'lucide-react';
import { cn } from '../lib/utils';

interface OULineBadgeProps {
  line: number | undefined;
  currentTotal?: number;
  projectedTotal?: number;
  status?: string; // 'Live' | 'Final' | 'Preview' or abstractGameState / gameState
  isAdmin?: boolean;
  onSaveLine?: (newLine: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showPacePill?: boolean;
  showProgressBar?: boolean;
  sport?: 'MLB' | 'NHL';
  className?: string;
  badgeOnly?: boolean;
}

export function OULineBadge({
  line,
  currentTotal,
  projectedTotal,
  status,
  isAdmin,
  onSaveLine,
  size = 'md',
  showPacePill = true,
  showProgressBar = true,
  sport = 'MLB',
  className,
  badgeOnly = false
}: OULineBadgeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [valStr, setValStr] = useState(line !== undefined ? line.toString() : '');

  useEffect(() => {
    if (line !== undefined) {
      setValStr(line.toString());
    }
  }, [line]);

  if (line === undefined) {
    return (
      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900/60 border border-slate-800">
        No Line
      </span>
    );
  }

  const handleSave = () => {
    const num = parseFloat(valStr);
    if (!isNaN(num) && onSaveLine) {
      onSaveLine(num);
    }
    setIsEditing(false);
  };

  const isLive = status === 'Live' || status === 'LIVE' || status === 'CRIT' || status === 'In Progress';
  const isFinal = status === 'Final' || status === 'FINAL' || status === 'OFF';
  
  const displayScore = isLive ? (projectedTotal ?? currentTotal) : currentTotal;
  const hasScore = currentTotal !== undefined && (isLive || isFinal);
  const diff = hasScore ? (currentTotal! - line) : 0;
  const projDiff = (isLive && projectedTotal !== undefined) ? (projectedTotal - line) : diff;

  let outcomeLabel = '';
  let outcomeType: 'over' | 'under' | 'push' = 'push';

  if (isFinal && currentTotal !== undefined) {
    if (currentTotal > line) {
      outcomeLabel = 'OVER';
      outcomeType = 'over';
    } else if (currentTotal < line) {
      outcomeLabel = 'UNDER';
      outcomeType = 'under';
    } else {
      outcomeLabel = 'PUSH';
      outcomeType = 'push';
    }
  } else if (isLive && currentTotal !== undefined) {
    if (currentTotal > line) {
      outcomeLabel = 'OVER (COVERED)';
      outcomeType = 'over';
    } else if (projDiff > 0.5) {
      outcomeLabel = 'TRENDING OVER';
      outcomeType = 'over';
    } else if (projDiff < -0.5) {
      outcomeLabel = 'TRENDING UNDER';
      outcomeType = 'under';
    } else {
      outcomeLabel = 'ON PACE';
      outcomeType = 'push';
    }
  }

  // Progress Bar percentage (capped at 100%)
  const progressPct = currentTotal !== undefined && line > 0 ? Math.min(100, Math.max(0, (currentTotal / line) * 100)) : 0;
  const isOverLine = currentTotal !== undefined && currentTotal > line;

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      {isEditing ? (
        <div className="flex items-center gap-1 bg-slate-950 border border-salami-red rounded-lg px-2 py-1 shadow-lg" onClick={(e) => e.stopPropagation()}>
          <input
            type="number"
            step="0.5"
            value={valStr}
            onChange={(e) => setValStr(e.target.value)}
            className="w-14 bg-transparent font-mono font-black text-xs text-white text-center focus:outline-none"
            autoFocus
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            className="p-1 hover:bg-slate-800 rounded text-emerald-400 cursor-pointer transition-colors"
            title="Save Line"
          >
            <Save className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(false);
            }}
            className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white cursor-pointer transition-colors"
            title="Cancel"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 group">
          {/* Polished O/U Badge */}
          <div className={cn(
            "inline-flex items-center gap-2 rounded-lg border font-mono shadow-md backdrop-blur-md transition-all duration-200 select-none",
            size === 'sm' && "px-2 py-0.5 text-[10px]",
            size === 'md' && "px-2.5 py-1 text-xs",
            size === 'lg' && "px-3 py-1.5 text-sm",
            "bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-slate-750/90 hover:border-slate-600 shadow-black/40",
            isAdmin && "cursor-pointer hover:border-salami-red/60 hover:shadow-salami-red/10"
          )}
          onClick={(e) => {
            if (isAdmin) {
              e.stopPropagation();
              setIsEditing(true);
            }
          }}
          >
            {/* O/U Tag */}
            <span className="flex items-center bg-slate-950/90 px-1.5 py-0.5 rounded border border-slate-800/80 shadow-inner">
              <span className="text-sky-400 font-black tracking-tighter">O</span>
              <span className="text-slate-600 font-medium mx-0.5 text-[8px]">/</span>
              <span className="text-emerald-400 font-black tracking-tighter">U</span>
            </span>

            {/* Line Number */}
            <span className="text-white font-black tracking-tight drop-shadow-sm">
              {line.toFixed(1)}
            </span>

            {isAdmin && (
              <Edit2 className="w-2.5 h-2.5 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity ml-0.5" />
            )}
          </div>
        </div>
      )}

      {!badgeOnly && (
        <>
          {/* Progress Bar for Live/Final games */}
          {showProgressBar && hasScore && (
            <div className="w-20 sm:w-24 bg-slate-950/80 p-0.5 rounded-full border border-slate-800/80 shadow-inner relative overflow-hidden">
              <div 
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  isOverLine 
                    ? "bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_8px_#f43f5e]" 
                    : "bg-gradient-to-r from-sky-500 to-emerald-400"
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}

          {/* Outcome / Pace Pill */}
          {showPacePill && hasScore && (
            <div className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-mono text-[8px] font-black uppercase tracking-wider shadow-sm transition-all whitespace-nowrap",
              outcomeType === 'over' && "bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-rose-950/30",
              outcomeType === 'under' && "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-emerald-950/30",
              outcomeType === 'push' && "bg-sky-500/15 border-sky-500/30 text-sky-400 shadow-sky-950/30"
            )}>
              {outcomeType === 'over' ? (
                <TrendingUp className="w-2.5 h-2.5 shrink-0" />
              ) : outcomeType === 'under' ? (
                <TrendingDown className="w-2.5 h-2.5 shrink-0" />
              ) : (
                <Scale className="w-2.5 h-2.5 shrink-0" />
              )}
              <span>{outcomeLabel}</span>
              <span className="opacity-75 ml-0.5">
                ({diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)})
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
