import { HelpCircle, Info, Calculator, Target, Zap, Bell, History, UserPlus, CloudRain, ArrowRight, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';
import { trackEvent } from '../lib/analytics';
import { cn } from '../lib/utils';

export function InfoSection({ sport = 'MLB' }: { sport?: 'MLB' | 'NHL' }) {
  const { user, signIn } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  const isMLB = sport === 'MLB';
  const themeColor = isMLB ? 'salami-red' : 'blue-500';
  const accentColor = isMLB ? 'text-salami-red' : 'text-blue-400';
  const bgAccent = isMLB ? 'bg-red-900/20' : 'bg-blue-900/20';
  const borderAccent = isMLB ? 'border-red-900/30' : 'border-blue-900/30';
  const unit = isMLB ? 'runs' : 'goals';

  const handleSignUp = async () => {
    if (user || isSigningIn) return;
    setIsSigningIn(true);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    let isIframe = false;
    try {
      isIframe = window.self !== window.parent;
    } catch (e) {
      isIframe = true;
    }

    const toastId = toast.loading('Opening Google Secure Login...');
    trackEvent('signup_cta_click', { isMobile, isIframe });
    
    try {
      await signIn();
      trackEvent('signup_success');
      toast.success('Welcome to Salami Tracker!', { id: toastId });
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
                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Salami Streak History</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Join the official Grand Salami Streak. Registered users get their history tracked automatically to build long-term winning streaks and unlock live streak sharing on Twitter / X!
                </p>
              </div>
            </div>
          </div>

          {!user && (
            <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-lg font-black text-white uppercase tracking-tighter">Ready to start your streak?</h4>
                <p className="text-xs text-slate-500 font-mono mt-1 uppercase">Join 1,000+ bettors building their Grand Salami history today.</p>
              </div>
              <button
                onClick={handleSignUp}
                disabled={isSigningIn}
                className="group flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-50"
              >
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none opacity-70">Get Started</span>
                  <span className="text-sm font-black uppercase tracking-tighter">Join Salami Tracker Free</span>
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
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", bgAccent, borderAccent)}>
              <Info className={cn("w-5 h-5", accentColor)} />
            </div>
            <div>
              <h2 className="font-black text-white uppercase tracking-tighter text-lg mb-2">{sport} Grand Salami Tracker</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                The <span className={cn(accentColor, "font-bold")}>Grand Salami</span> is a unique wager on the <span className="font-bold text-slate-200">combined {unit} scored across every game on today's slate</span>. Track the total in real-time.
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
              <h2 className="font-black text-white uppercase tracking-tighter text-lg mb-2">Smart Projection Engine</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Our tracker uses a <span className="font-bold text-slate-200">Smart Projection Engine</span> that goes beyond simple math. 
                It monitors <span className="text-blue-400 font-bold">{isMLB ? 'Live Threats' : 'High-Danger Chances'}</span> in real-time to anticipate {unit} before they happen.
              </p>
            </div>
          </div>
        </div>

        {/* Winible / Storefront */}
        <div className="dashboard-card p-6 bg-slate-900/50 border-slate-700/50 shadow-lg relative group overflow-hidden">
          <div className={cn("absolute inset-0 group-hover:opacity-10 transition-opacity", isMLB ? 'bg-red-600/5' : 'bg-blue-600/5')} />
          <div className="flex items-start gap-4 relative z-10">
            <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border transition-colors", isMLB ? 'group-hover:border-salami-red/50' : 'group-hover:border-blue-500/50')}>
              <Zap className={cn("w-5 h-5", accentColor)} />
            </div>
            <div className="flex-1">
              <h2 className="font-black text-white uppercase tracking-tighter text-lg mb-2">Grand Salami Strategy</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Get <span className="text-white font-bold">Free Picks</span> and <span className={cn(accentColor, "font-bold")}>Salami Slate Daily Updates</span> via our official Winible storefront.
              </p>
              <a 
                href="https://www.winible.com/grandsalamibet" 
                target="_blank" 
                rel="noreferrer"
                className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg", isMLB ? 'bg-salami-red hover:bg-red-600 shadow-red-900/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20')}
              >
                <span>Daily {sport} Salami Picks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Tips / Strategy */}
      <div className="dashboard-card p-8 bg-slate-900 border-none shadow-2xl relative overflow-hidden transition-colors duration-300">
        <div className="stitching-top opacity-30" />
        <div className={cn("absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32 blur-3xl opacity-10", isMLB ? 'bg-salami-red' : 'bg-blue-500')} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Target className={cn("w-6 h-6", accentColor)} />
            <h3 className="font-black uppercase tracking-tighter text-2xl text-white">Bettor's Strategy Guide</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className={cn("flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-widest", accentColor)}>
                <Zap className="w-3 h-3" /> {isMLB ? 'Early Volatility' : 'Period Variance'}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isMLB 
                  ? "Projections are highly volatile in the first 20% of the slate. A single high-scoring 1st inning can skew the math. Wait for 30%+ completion for a stable trend."
                  : "Early goals in the 1st period can inflate projections significantly. Watch for teams with strong 2nd period scoring rates before jumping on a mid-game total."
                }
              </p>
            </div>

            <div className="space-y-2">
              <div className={cn("flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-widest", accentColor)}>
                <Zap className="w-3 h-3" /> {isMLB ? 'Weather & Parks' : 'Goalie Matchups'}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isMLB
                  ? "The Grand Salami is heavily influenced by 'Coors Field' games or high-wind days. We use live daily weather and park factor data right from Ballpark Pal to track these outliers in real-time."
                  : "NHL totals swing wildly based on backup goalies or high-octane offenses like Edmonton or Florida. Verify starting goalies before locking in your slate total."
                }
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-mono text-[10px] font-black uppercase tracking-widest">
                <CloudRain className="w-3 h-3" /> {isMLB ? 'Rain & Voids' : 'Overtime & Rules'}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isMLB
                  ? "Rain doesn't just lower scoring; it can void your entire bet. If a game is canceled or doesn't reach the required innings, most books void the Grand Salami."
                  : "Most sportsbooks include OT and Shootout goals in the Grand Salami total (Shootout counts as 1 goal). Verify your book's rules on 'voided' games if a game is abandoned."
                }
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

