import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Zap, ShieldCheck, Activity, Info } from 'lucide-react';
import { BallparkPalFactor } from '../services/ballparkPalService';
import { cn } from '../lib/utils';

interface ParkFactorsReportProps {
  factors: BallparkPalFactor[];
}

export function ParkFactorsReport({ factors }: ParkFactorsReportProps) {
  if (!factors || factors.length === 0) return null;

  const burningParks = factors
    .filter(f => f.runs >= 1.05)
    .sort((a, b) => b.runs - a.runs);
    
  const freezingParks = factors
    .filter(f => f.runs <= 0.95)
    .sort((a, b) => a.runs - b.runs);

  if (burningParks.length === 0 && freezingParks.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
    >
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h3 className="text-white font-black text-[10px] uppercase tracking-[0.2em]">Atmospheric Intelligence</h3>
            <p className="text-slate-500 font-mono text-[8px] uppercase tracking-widest mt-0.5">Park factors & Environmental carry</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-mono text-slate-600 uppercase tracking-widest">
          <Info className="w-3 h-3" />
          <span>Source: Ballpark Pal</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
        {/* Burning Parks */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">High Receptivity (Carry+)</span>
          </div>
          
          <div className="space-y-3">
            {burningParks.map((p, idx) => {
              const diff = Math.round((p.runs - 1) * 100);
              return (
                <div key={p.game} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-500 font-black">{idx + 1}</span>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-white uppercase tracking-tight">{p.game}</span>
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter">{p.condition || 'Favorable Atmosphere'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-black text-emerald-400">+{diff}%</span>
                      <span className="text-[7px] font-mono text-slate-600 uppercase tracking-tighter">Runs</span>
                    </div>
                    <div className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
                      <Zap className="w-3 h-3 text-emerald-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Freezing Parks */}
        <div className="p-6 space-y-4 bg-slate-900/50">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">Low Receptivity (Heavy Air)</span>
          </div>
          
          <div className="space-y-3">
            {freezingParks.map((p, idx) => {
              const diff = Math.round((1 - p.runs) * 100);
              return (
                <div key={p.game} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-500 font-black">{idx + 1}</span>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-white uppercase tracking-tight">{p.game}</span>
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter">{p.condition || 'Dense Atmosphere'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-black text-blue-400">-{diff}%</span>
                      <span className="text-[7px] font-mono text-slate-600 uppercase tracking-tighter">Runs</span>
                    </div>
                    <div className="p-1.5 bg-blue-500/10 rounded border border-blue-500/20">
                      <ShieldCheck className="w-3 h-3 text-blue-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none">
          Live environmental variances detected. Salami lines often lag behind these micro-climate shifts.
        </span>
      </div>
    </motion.div>
  );
}
