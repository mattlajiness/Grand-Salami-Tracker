import { HelpCircle, Info, Calculator, Target, Zap, Bell, History, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';

export function InfoSection() {
  return (
    <div id="how-it-works" className="mt-12 space-y-8">
      {/* Why Sign Up Section */}
      <div className="dashboard-card p-8 bg-gradient-to-br from-slate-900 to-slate-950 border-blue-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="w-6 h-6 text-blue-400" />
            <h3 className="font-black uppercase tracking-tighter text-2xl text-white">Why Create an Account?</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Bell className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Live Notifications</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Get alerted when the Grand Salami pace shifts significantly or when the slate hits critical milestones.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Personal Tracker</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Save your specific wagers and track your personal ROI against the live Grand Salami projections.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <History className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Historical Data</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Access deep historical trends for different slate sizes to help you spot value in the daily lines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-2">
        <div className="h-px flex-1 bg-slate-800" />
        <div className="flex items-center gap-2 px-4 py-1 bg-slate-900 rounded-full border border-slate-800">
          <HelpCircle className="w-3 h-3 text-salami-red" />
          <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.2em]">Knowledge Base</span>
        </div>
        <div className="h-px flex-1 bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What is a Grand Salami? */}
        <div className="dashboard-card p-6 bg-slate-900/50 border-slate-800 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-900/20 flex items-center justify-center shrink-0 border border-red-900/30">
              <Info className="w-5 h-5 text-salami-red" />
            </div>
            <div>
              <h3 className="font-black text-white uppercase tracking-tighter text-lg mb-2">What is a Grand Salami?</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                In MLB betting, the <span className="text-salami-red font-bold">Grand Salami</span> is a unique wager on the <span className="font-bold text-slate-200">Total Runs scored across every single game</span> on a specific day's slate. 
                It's an "Over/Under" for the entire league. If the line is 120.5, you're betting whether the total runs from all 15 games will be 121 or more (Over) or 120 or less (Under).
              </p>
            </div>
          </div>
        </div>

        {/* How the Tracker Works */}
        <div className="dashboard-card p-6 bg-slate-900/50 border-slate-800 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-900/20 flex items-center justify-center shrink-0 border border-blue-900/30">
              <Calculator className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-black text-white uppercase tracking-tighter text-lg mb-2">Real-Time Projections</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Our tracker doesn't just count finished games. We use a <span className="font-bold text-slate-200">Granular Extrapolation Engine</span> that monitors every half-inning. 
                By calculating the current "Runs Per Inning" pace across the entire slate, we provide a live projection of where the total is likely to land before the final pitch is even thrown.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Tips / Strategy */}
      <div className="dashboard-card p-8 bg-slate-900 border-none shadow-2xl relative overflow-hidden transition-colors duration-300">
        <div className="stitching-top opacity-30" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-salami-red/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-salami-red" />
            <h3 className="font-black uppercase tracking-tighter text-2xl text-white">Bettor's Strategy Guide</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-salami-red font-mono text-[10px] font-black uppercase tracking-widest">
                <Zap className="w-3 h-3" /> Early Volatility
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Projections are highly volatile in the first 20% of the slate. A single high-scoring 1st inning can skew the math. Wait for 30%+ completion for a stable trend.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-salami-red font-mono text-[10px] font-black uppercase tracking-widest">
                <Zap className="w-3 h-3" /> Weather & Parks
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The Grand Salami is heavily influenced by "Coors Field" games or high-wind days. One outlier game can carry the entire Over or sink the Under.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-salami-red font-mono text-[10px] font-black uppercase tracking-widest">
                <Zap className="w-3 h-3" /> The Bullpen Factor
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scoring often increases in the 7th-9th innings as tired bullpens take over. If the projection is close to your line in the 6th, the "Over" often has the edge.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
