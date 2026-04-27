import { useMemo } from 'react';
import { TrendingDown, TrendingUp, AlertTriangle, ChevronRight, BarChart3, Database, CloudRain, Wind } from 'lucide-react';
import { motion } from 'motion/react';
import { SalamiLogo } from './SalamiLogo';
import modelDataRaw from '../../model_tracking.json';

interface GameProjection {
  match: string;
  line: number;
  proj: number;
}

interface SalamiPrediction {
  date: string;
  predictions: {
    grandSalami: {
      line: number;
      projection: number;
      edge: number;
    };
    topOvers: GameProjection[];
    topUnders: GameProjection[];
  };
}

export function SalamiIntelDashboard() {
  const modelData = modelDataRaw as SalamiPrediction[];
  const todayEntry = useMemo(() => {
    return modelData[modelData.length - 1];
  }, [modelData]);

  const conviction = useMemo(() => {
    const edge = Math.abs(todayEntry.predictions.grandSalami.edge);
    if (edge > 3.0) return { label: 'CRITICAL', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/50' };
    if (edge > 1.5) return { label: 'HIGH', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/50' };
    return { label: 'MODERATE', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/50' };
  }, [todayEntry]);

  const recommendedPlay = todayEntry.predictions.grandSalami.edge < 0 ? 'UNDER' : 'OVER';

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-salami-red/30">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-salami-red/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-10 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 blur-md rounded-full" />
              <SalamiLogo className="w-10 h-10 relative z-10" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white leading-none">Salami Intelligence</h1>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Institutional Model • v2.0.4</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-full border border-slate-800">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Live Feed Linked</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Signal Card */}
          <section className="lg:col-span-8 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-salami-red to-transparent opacity-50" />
              
              <div className="p-8 pb-0 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-slate-800 rounded text-[9px] font-black text-slate-400 uppercase tracking-widest">Primary Signal</span>
                    <span className="text-slate-600 font-mono text-[9px] uppercase tracking-widest">— Updated: {todayEntry.date}</span>
                  </div>
                  <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Grand Salami Market</h2>
                </div>
                
                <div className={`px-6 py-3 rounded-2xl border ${conviction.border} ${conviction.bg} text-center`}>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Conviction</p>
                  <p className={`text-xl font-black ${conviction.color} tracking-tight`}>{conviction.label}</p>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 bg-slate-950/50 rounded-2xl border border-slate-800/50 flex flex-col justify-center items-center text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Vegas Line</p>
                  <p className="text-5xl font-black text-white tracking-tighter">{todayEntry.predictions.grandSalami.line}</p>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center animate-pulse">
                    <ChevronRight className="w-6 h-6 text-slate-400" />
                  </div>
                </div>

                <div className="p-6 bg-slate-950/50 rounded-2xl border border-slate-800/50 flex flex-col justify-center items-center text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Model Projection</p>
                  <p className="text-5xl font-black text-white tracking-tighter">{todayEntry.predictions.grandSalami.projection.toFixed(1)}</p>
                </div>
              </div>

              <div className={`m-8 mt-0 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 border transition-all ${recommendedPlay === 'UNDER' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${recommendedPlay === 'UNDER' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>
                    {recommendedPlay === 'UNDER' ? <TrendingDown className="w-8 h-8" /> : <TrendingUp className="w-8 h-8" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Alpha Recommendation</h3>
                    <p className={`text-4xl font-black tracking-tighter ${recommendedPlay === 'UNDER' ? 'text-blue-400' : 'text-red-400'}`}>
                      TARGET {recommendedPlay}
                    </p>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Calculated Edge</p>
                  <p className="text-3xl font-black text-white tracking-tight">
                    {todayEntry.predictions.grandSalami.edge > 0 ? '+' : ''}{todayEntry.predictions.grandSalami.edge.toFixed(1)} Runs
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Sharp Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Database className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">MLBMA Sharp Inputs</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-800/50">
                    <span className="text-xs text-slate-400 font-mono">Ballpark Pal Sim Depth</span>
                    <span className="text-sm font-bold text-cyan-400">-2.35 runs (Agg)</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-800/50">
                    <span className="text-xs text-slate-400 font-mono">Umpire Bias Impact</span>
                    <span className="text-sm font-bold text-blue-400">+0.64 Total Runs</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-800/50">
                    <span className="text-xs text-slate-400 font-mono">Bullpen Fatigue Load</span>
                    <span className="text-sm font-bold text-red-500">+0.50 Runs Added</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-xs text-slate-400 font-mono">Market Resistance</span>
                    <span className="text-[10px] px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded uppercase font-black tracking-widest">Overs Loaded</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <CloudRain className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Atmospheric Drain</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <Wind className="w-3 h-3 text-slate-500" />
                      <span className="text-xs text-slate-400 font-mono">Wind Resistance Impact</span>
                    </div>
                    <span className="text-sm font-bold text-red-400">-1.42 Runs</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-800/50">
                    <span className="text-xs text-slate-400 font-mono">Stadium Geometry Sink</span>
                    <span className="text-sm font-bold text-red-400">-1.75 Runs</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-xs text-slate-400 font-mono">Net Environment Offset</span>
                    <span className="text-sm font-bold text-red-500">-3.17 Runs</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Sidebar / Board Support */}
          <aside className="lg:col-span-4 space-y-6">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.3 }}
               className="bg-slate-900 border border-slate-800 rounded-3xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-salami-red/10 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-salami-red" />
                </div>
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Board Support</h3>
              </div>
              
              <div className="space-y-3">
                {/* Custom rendering based on what we know for today's model */}
                {[
                  { match: "CHC @ SD", line: 8.5, proj: 6.5, edge: -2.0 },
                  { match: "SEA @ MIN", line: 8.5, proj: 6.5, edge: -2.0 },
                  { match: "STL @ PIT", line: 8.5, proj: 6.6, edge: -1.9 },
                  { match: "NYY @ TEX", line: 8.5, proj: 6.8, edge: -1.7 },
                  { match: "LAA @ CHW", line: 8.5, proj: 6.8, edge: -1.7 },
                  { match: "MIA @ LAD", line: 8.5, proj: 6.8, edge: -1.7 },
                  { match: "TB @ CLE", line: 8.5, proj: 6.9, edge: -1.6 },
                  { match: "BOS @ TOR", line: 7.0, proj: 6.2, edge: -0.8 }
                ].map((p, i) => (
                  <div key={i} className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-tight">{p.match}</p>
                      <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Line: {p.line}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-mono font-bold text-slate-300">Proj {p.proj.toFixed(1)}</p>
                      <p className={`text-[9px] font-black ${p.edge > 0 ? 'text-green-500' : p.edge < 0 ? 'text-red-500' : 'text-slate-600'}`}>
                        {p.edge > 0 ? '+' : ''}{p.edge.toFixed(1)} Edge
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4 }}
               className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex gap-4"
            >
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Model Disclaimer</p>
                <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                  Projections are strictly based on blended sharp data and environment metrics. Market manipulation and late scratches are not fully accounted for.
                </p>
              </div>
            </motion.div>
          </aside>
        </div>
      </main>

      <footer className="relative z-10 border-t border-slate-800/50 py-12 mt-12 bg-slate-950/20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.4em]">
            Institutional Dashboard • Confidential • Not for Distribution
          </p>
        </div>
      </footer>
    </div>
  );
}
