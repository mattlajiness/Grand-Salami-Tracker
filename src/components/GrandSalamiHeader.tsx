import { motion } from 'motion/react';
import { Activity, Trophy, Sun, Moon, RefreshCw, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface GrandSalamiHeaderProps {
  currentTotal: number;
  gameCount: number;
  finalCount: number;
  liveCount: number;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date;
}

export function GrandSalamiHeader({ 
  currentTotal, 
  gameCount, 
  finalCount, 
  liveCount,
  isDarkMode,
  setIsDarkMode,
  onRefresh,
  isRefreshing,
  lastUpdated
}: GrandSalamiHeaderProps) {
  return (
    <div className="dashboard-card p-6 mb-6 bg-slate-900 text-white border-none shadow-2xl">
      <div className="stitching-top opacity-50" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-salami-red to-transparent" />
      
      {/* Top Controls Row */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-white rounded-full border border-slate-200" />
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-1">
              <path d="M 30 10 Q 50 50 30 90" fill="none" stroke="#e11d48" strokeWidth="3" strokeDasharray="4 4" />
              <path d="M 70 10 Q 50 50 70 90" fill="none" stroke="#e11d48" strokeWidth="3" strokeDasharray="4 4" />
            </svg>
            <div className="relative z-10 w-6 h-6 rotate-12">
              <img src="https://cdn-icons-png.flaticon.com/512/3143/3143643.png" alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black tracking-tighter text-white text-lg leading-none">GRAND SALAMI</span>
            </div>
            <span className="text-[8px] font-mono text-salami-red font-black tracking-[0.4em] mt-0.5 uppercase">Live Tracker</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[9px] font-mono text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            <Calendar className="w-3 h-3 text-salami-red" />
            {format(new Date(), 'MMM dd').toUpperCase()}
          </div>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all active:scale-95"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-yellow-400" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
          </button>

          <button 
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all disabled:opacity-50 active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-slate-700 flex items-center justify-center bg-slate-800 shadow-lg">
              <Trophy className="w-5 h-5 text-salami-red" />
            </div>
            <div>
              <span className="data-label text-slate-500 block">Grand Salami Tracker</span>
              <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-[0.2em]">Major League Baseball</h2>
            </div>
          </div>
          
          <div className="flex items-end gap-4">
            <div className="baseball-scoreboard text-6xl md:text-8xl min-w-[160px] text-center">
              {currentTotal.toString().padStart(3, '0')}
            </div>
            <div className="pb-2">
              <span className="text-salami-red font-mono font-black text-2xl block leading-none tracking-tighter">RUNS</span>
              <span className="text-slate-500 font-mono text-[10px] block mt-1 uppercase">Total Scored</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 md:gap-12 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <span className="data-label text-slate-500 mb-1">Slate</span>
            <span className="text-3xl font-mono font-black text-white">{gameCount}</span>
            <span className="text-[8px] font-mono text-slate-600 uppercase mt-1">Games</span>
          </div>
          <div className="flex flex-col items-center border-x border-slate-700 px-6 md:px-12">
            <span className="data-label text-slate-500 mb-1">Final</span>
            <span className="text-3xl font-mono font-black text-green-400">{finalCount}</span>
            <span className="text-[8px] font-mono text-slate-600 uppercase mt-1">Complete</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="data-label text-slate-500 mb-1">Live</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-mono font-black text-salami-red">{liveCount}</span>
              {liveCount > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-3 h-3 rounded-full bg-salami-red shadow-[0_0_10px_rgba(225,29,72,0.8)]"
                />
              )}
            </div>
            <span className="text-[8px] font-mono text-slate-600 uppercase mt-1">In Play</span>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-6">
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 font-bold">
          <Activity className="w-3 h-3 text-salami-red" />
          <span className="tracking-widest">REAL-TIME FEED</span>
          <span className="text-[8px] text-slate-600 ml-2">UPDATED: {format(lastUpdated, 'HH:mm:ss')}</span>
        </div>
        <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
          <motion.div 
            className="h-full bg-gradient-to-r from-salami-red to-red-400 shadow-[0_0_10px_rgba(225,29,72,0.4)]"
            initial={{ width: 0 }}
            animate={{ width: `${(finalCount / (gameCount || 1)) * 100}%` }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-black text-slate-400">
            {Math.round((finalCount / (gameCount || 1)) * 100)}%
          </span>
          <span className="text-[8px] font-mono text-slate-600 uppercase">CLOSED</span>
        </div>
      </div>
    </div>
  );
}
