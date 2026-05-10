import { HelpCircle, Info, Calculator, Target, Zap, Bell, History, UserPlus, CloudRain, ArrowRight, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';
import { trackEvent } from '../lib/analytics';

export function InfoSection() {
  const { user, signIn } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignUp = async () => {
    if (user || isSigningIn) return;
    setIsSigningIn(true);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIframe = window.self !== window.top;

    const toastId = toast.loading('Opening Google Secure Login...');
    trackEvent('signup_cta_click', { isMobile, isIframe });
    
    try {
      await signIn();
      trackEvent('signup_success');
      toast.success('Welcome to Salami Pace!', { id: toastId });
    } catch (error: any) {
      console.error('Sign up error:', error);
      trackEvent('signup_error', { error: String(error), code: error?.code });
      
      if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/popup-closed-by-user' || (isMobile && isIframe)) {
        toast.error('Login window blocked.', {
          id: toastId,
          description: 'Mobile browsers often block login inside an iframe. Click "Open Site" to fix.',
          action: {
            label: 'Open Site',
            onClick: () => {
              window.open(window.location.href, '_blank');
              trackEvent('signup_tab_fallback_click');
            }
          },
          duration: 10000
        });
      } else {
        toast.error('Could not connect. Please try again.', { id: toastId });
      }
    } finally {
      setIsSigningIn(false);
    }
  };

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
                  Get alerted when the pace shifts or milestones are hit. 
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

          {!user && (
            <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-lg font-black text-white uppercase tracking-tighter">Ready to track your edge?</h4>
                <p className="text-xs text-slate-500 font-mono mt-1 uppercase">Join 1,000+ bettors monitoring the pace today.</p>
              </div>
              <button
                onClick={handleSignUp}
                disabled={isSigningIn}
                className="group flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-50"
              >
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none opacity-70">Get Started</span>
                  <span className="text-sm font-black uppercase tracking-tighter">Join Salami Pace Free</span>
                </div>
                {isSigningIn ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-2">
        <div className="h-px flex-1 bg-slate-800" />
        <div className="flex items-center gap-2 px-4 py-1 bg-slate-900 rounded-full border border-slate-800">
          <HelpCircle className="w-3 h-3 text-blue-400" />
          <h2 className="text-[10px] font-mono font-black text-white uppercase tracking-[0.2em]">Daily Tracker & Model Insights</h2>
        </div>
        <div className="h-px flex-1 bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* What is a Grand Salami? */}
        <div className="dashboard-card p-6 bg-slate-900/50 border-slate-800 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-900/20 flex items-center justify-center shrink-0 border border-red-900/30">
              <Info className="w-5 h-5 text-salami-red" />
            </div>
            <div>
              <h3 className="font-black text-white uppercase tracking-tighter text-lg mb-2">MLB Grand Salami Tracker</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                The <span className="text-salami-red font-bold">Grand Salami</span> is a unique wager on the <span className="font-bold text-slate-200">combined runs scored across every game on today's slate</span>. Track the total in real-time.
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
              <h3 className="font-black text-white uppercase tracking-tighter text-lg mb-2">Smart Projection Engine</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Our tracker uses a <span className="font-bold text-slate-200">Smart Projection Engine</span> that goes beyond simple math. 
                It monitors <span className="text-blue-400 font-bold">Live Threats</span> in real-time to anticipate runs before they happen.
              </p>
            </div>
          </div>
        </div>

        {/* Winible / Storefront */}
        <div className="dashboard-card p-6 bg-slate-900/50 border-slate-700/50 shadow-lg relative group overflow-hidden">
          <div className="absolute inset-0 bg-red-600/5 group-hover:bg-red-600/10 transition-colors" />
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-salami-red/50 transition-colors">
              <Zap className="w-5 h-5 text-salami-red" />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-white uppercase tracking-tighter text-lg mb-2">Daily Strategy and Picks</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Get <span className="text-white font-bold">Free Picks</span> and <span className="text-salami-red font-bold">Salami Slate Daily Updates</span> via our official Winible storefront.
              </p>
              <a 
                href="https://www.winible.com/grandsalamibet" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-salami-red hover:bg-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-red-900/20"
              >
                <span>Daily Grand Salami Picks and Insights</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
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
              <div className="flex items-center gap-2 text-blue-400 font-mono text-[10px] font-black uppercase tracking-widest">
                <CloudRain className="w-3 h-3" /> Rain & Voids
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rain doesn't just lower scoring; it can void your entire bet. If a game is canceled or doesn't reach the required innings, most books void the Grand Salami. Watch the <span className="text-blue-400">Rain Risk</span> badges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

