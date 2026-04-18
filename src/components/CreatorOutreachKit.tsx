import { useState } from 'react';
import { Share2, Copy, Check, MessageSquare, Send, Mail, Twitter } from 'lucide-react';
import { MLBGame } from '../services/mlbService';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface CreatorOutreachKitProps {
  games: MLBGame[];
}

export function CreatorOutreachKit({ games }: CreatorOutreachKitProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const upcomingGames = games.filter(g => g.status.abstractGameState === 'Preview');
  
  // Logic to find "Hot Angles" for outreach
  const getDailyAngles = () => {
    const angles: string[] = [];
    
    // Check for high wind games
    upcomingGames.forEach(game => {
      const windStr = game.weather?.wind || '';
      const speed = parseInt(windStr.match(/\d+/)?.[0] || '0');
      const isWrigley = game.teams.home.team.name.includes('Cubs');
      const isCoors = game.teams.home.team.id === 115;
      
      if (speed > 12 && (windStr.toLowerCase().includes('out') || isWrigley)) {
        angles.push(`💨 HEAVY WIND: ${game.teams.away.team.name} @ ${game.teams.home.team.name} blowing ${windStr}. Total alert!`);
      }
      if (isCoors) {
        angles.push(`🏔️ COORS ALERT: Standard high-altitude shootout risk in Denver today.`);
      }

      // Check for bullpen fatigue if data is hydrated
      const awayRelievers = game.boxscore?.teams.away.pitchers?.length || 0;
      const homeRelievers = game.boxscore?.teams.home.pitchers?.length || 0;
      if (awayRelievers >= 6 || homeRelievers >= 6) {
        angles.push(`🔋 EXHAUSTED UNIT: ${awayRelievers >= 6 ? game.teams.away.team.name : game.teams.home.team.name} bullpen is running on fumes after heavy usage.`);
      }
    });

    if (angles.length === 0) return "Slate looks balanced today—good day for a standard Salami sweat.";
    return angles.join('\n');
  };

  const templates = [
    {
      title: "Twitter/X Influencer Pitch",
      icon: Twitter,
      content: `Hey! Love your MLB content. I built a live Grand Salami & Bullpen Fatigue tracker that’s flagging some crazy wind/usage patterns for today’s slate (e.g., ${upcomingGames[0]?.teams.away.team.name || 'Cubs'} @ ${upcomingGames[0]?.teams.home.team.name || 'Brewers'}). \n\nMind if I send you a link to use for your daily preview? Free tool, just looking for feedback from sharps.`,
    },
    {
      title: "Quick IG/Twitter DM",
      icon: Send,
      content: `Yo! 👋 Just saw your preview for tonight. My Salami tracker tool is flagging a massive wind boost in the ${upcomingGames[0]?.teams.home.team.name || 'Cubs'} game that might flip the Total. \n\nCheck it out here if you want to use the chart for your show: ${window.location.origin}`,
    },
    {
      title: "Beat Writer Email",
      icon: Mail,
      content: `Subject: Data Insight for your ${new Date().toLocaleDateString()} MLB Preview\n\nHi,\n\nI’m a developer and avid MLB bettor. I’ve been using a custom tracking engine to monitor league-wide scoring velocity and bullpen exhaustion. \n\nToday's data is flagging ${upcomingGames.length} games with high-stress bullpen situations and specific environmental boosts. \n\nI thought your readers might find these "Total" angles interesting. You can see the live tracker here: ${window.location.origin}\n\nCheers!`,
    },
    {
      title: "Reddit / Forum Post",
      icon: MessageSquare,
      content: `[Daily MLB Totals Thread] Detailed look at today's Grand Salami. \n\nMain Angles found by the tracker:\n${getDailyAngles()}\n\nLive tracking the Pace vs. Required Runs here: ${window.location.origin}`,
    }
  ];

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Template copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="dashboard-card border-purple-500/20 bg-slate-900/40 overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-purple-400" />
          <h2 className="text-[10px] font-mono font-black text-white uppercase tracking-[0.2em]">Creator Outreach Kit</h2>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Today's Auto-Insights</span>
          <p className="text-[10px] font-mono text-slate-300 leading-relaxed italic">
            "{getDailyAngles()}"
          </p>
        </div>

        <div className="space-y-3">
          {templates.map((template, idx) => (
            <div key={idx} className="group relative">
              <div className="flex items-center justify-between mb-1 px-1">
                <div className="flex items-center gap-1.5">
                  <template.icon className="w-3 h-3 text-slate-500" />
                  <span className="text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest">{template.title}</span>
                </div>
                <button 
                  onClick={() => copyToClipboard(template.content, idx)}
                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {copiedIndex === idx ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                  <span className="text-[8px] font-mono font-black uppercase">Copy</span>
                </button>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-[9px] font-mono text-slate-500 leading-relaxed max-h-24 overflow-y-auto custom-scrollbar">
                {template.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 bg-purple-500/5 border-t border-purple-500/10 flex items-start gap-2">
        <Send className="w-3 h-3 text-purple-500 shrink-0 mt-0.5" />
        <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-normal">
          Use these templates to reach out to beat writers or influencers. Providing them with "Today's Angles" makes it easy for them to credit your data.
        </p>
      </div>
    </div>
  );
}
