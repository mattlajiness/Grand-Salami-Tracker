import { useState, useEffect } from 'react';
import { Edit2, Save, X, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface OULineBadgeProps {
  line: number | undefined;
  currentTotal?: number;
  projectedTotal?: number;
  status?: string; // 'Live' | 'Final' | 'Preview' or abstractGameState / gameState
  isAdmin?: boolean;
  onSaveLine?: (newLine: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showLiveStatus?: boolean;
  sport?: 'MLB' | 'NHL';
  className?: string;
  badgeOnly?: boolean;
}

export function OULineBadge({
  line,
  isAdmin,
  onSaveLine,
  size = 'md',
  className
}: OULineBadgeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [valStr, setValStr] = useState(line !== undefined ? line.toString() : '');

  useEffect(() => {
    if (line !== undefined) {
      setValStr(line.toString());
    } else {
      setValStr('');
    }
  }, [line]);

  const handleSave = () => {
    const num = parseFloat(valStr);
    if (!isNaN(num) && onSaveLine) {
      onSaveLine(num);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={cn("flex flex-col items-center gap-1 max-w-full", className)}>
        <div className="flex items-center gap-1 bg-slate-950 border border-salami-red rounded-lg px-2 py-1 shadow-lg" onClick={(e) => e.stopPropagation()}>
          <input
            type="number"
            step="0.5"
            placeholder="O/U Line"
            value={valStr}
            onChange={(e) => setValStr(e.target.value)}
            className="w-16 bg-transparent font-mono font-black text-xs text-white text-center focus:outline-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') setIsEditing(false);
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            className="p-1 hover:bg-slate-800 rounded text-emerald-400 cursor-pointer transition-colors"
            title="Save Line"
          >
            <Save className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(false);
            }}
            className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white cursor-pointer transition-colors"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (line === undefined) {
    return (
      <div className={cn("flex flex-col items-center gap-1 max-w-full", className)}>
        {true ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed border-slate-700 hover:border-salami-red bg-slate-900/80 hover:bg-slate-900 text-[11px] font-mono font-bold text-slate-400 hover:text-salami-red transition-all cursor-pointer group shadow-sm"
            title="Click to set Over/Under line"
          >
            <Plus className="w-3 h-3 text-slate-500 group-hover:text-salami-red transition-colors" />
            <span>Set O/U Line</span>
          </button>
        ) : (
          <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900/60 border border-slate-800">
            No Line
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-1 max-w-full", className)}>
      <div className="flex items-center gap-1.5 group">
        {/* Polished O/U Badge */}
        <div 
          className={cn(
            "inline-flex items-center gap-1.5 sm:gap-2 rounded-lg border font-mono shadow-md backdrop-blur-md transition-all duration-200 select-none",
            size === 'sm' && "px-1.5 sm:px-2 py-0.5 text-[10px]",
            size === 'md' && "px-2.5 py-1 text-xs",
            size === 'lg' && "px-3 py-1.5 text-sm",
            "bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-slate-750/90 hover:border-slate-600 shadow-black/40",
            true && "cursor-pointer hover:border-salami-red/60 hover:shadow-salami-red/10"
          )}
          onClick={(e) => {
            if (true) {
              e.stopPropagation();
              setIsEditing(true);
            }
          }}
          title={"Click to edit Over/Under line"}
        >
          {/* O/U Tag */}
          <span className="flex items-center bg-slate-950/90 px-1 sm:px-1.5 py-0.5 rounded border border-slate-800/80 shadow-inner">
            <span className="text-sky-400 font-black tracking-tighter">O</span>
            <span className="text-slate-600 font-medium mx-0.5 text-[8px]">/</span>
            <span className="text-emerald-400 font-black tracking-tighter">U</span>
          </span>

          {/* Line Number */}
          <span className="text-white font-black tracking-tight drop-shadow-sm">
            {line.toFixed(1)}
          </span>

          {true && (
            <Edit2 className="w-2.5 h-2.5 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity ml-0.5" />
          )}
        </div>
      </div>
    </div>
  );
}
