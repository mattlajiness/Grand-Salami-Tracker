import { motion } from 'motion/react';

export function LogoExport() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-20">
      <div className="text-center mb-12">
        <h1 className="text-white font-black text-4xl uppercase tracking-tighter mb-2">Logo Export</h1>
        <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">High-Resolution Preview for Twitter/X</p>
      </div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-96 h-96 flex items-center justify-center"
      >
        {/* The Baseball Body */}
        <div className="absolute inset-0 rounded-full bg-white border-[8px] border-slate-200 shadow-[inset_0_-8px_16px_rgba(0,0,0,0.1),0_20px_50px_rgba(0,0,0,0.3)]" />
        
        {/* The Seams and Salami */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-6 z-10">
          {/* Left Seam */}
          <path 
            d="M 28 15 Q 48 50 28 85" 
            fill="none" 
            stroke="#e11d48" 
            strokeWidth="4" 
            strokeDasharray="3 3" 
            strokeLinecap="round"
          />
          {/* Right Seam */}
          <path 
            d="M 72 15 Q 52 50 72 85" 
            fill="none" 
            stroke="#e11d48" 
            strokeWidth="4" 
            strokeDasharray="3 3" 
            strokeLinecap="round"
          />
          
          {/* The Salami Log */}
          <g transform="rotate(-15 50 50)">
            {/* Main Log Body */}
            <rect 
              x="22" 
              y="38" 
              width="56" 
              height="24" 
              rx="12" 
              fill="#fb7185" 
            />
            {/* Salami Texture (Fat Spots) */}
            <circle cx="32" cy="46" r="2" fill="white" fillOpacity="0.7" />
            <circle cx="42" cy="54" r="1.5" fill="white" fillOpacity="0.6" />
            <circle cx="52" cy="44" r="2.2" fill="white" fillOpacity="0.8" />
            <circle cx="64" cy="52" r="1.8" fill="white" fillOpacity="0.5" />
            {/* Salami Casing Detail */}
            <rect 
              x="22" 
              y="38" 
              width="56" 
              height="24" 
              rx="12" 
              fill="none" 
              stroke="#be123c" 
              strokeWidth="1" 
              strokeOpacity="0.3"
            />
          </g>
        </svg>
      </motion.div>

      <div className="mt-20 text-slate-600 font-mono text-[10px] uppercase tracking-[0.3em] max-w-md text-center leading-relaxed">
        Tip: Use a screenshot tool (Win+Shift+S or Cmd+Shift+4) to capture the logo above. The white circle is perfectly centered for profile picture use.
      </div>
      
      <button 
        onClick={() => window.location.href = window.location.pathname}
        className="mt-12 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest text-xs rounded-xl border border-slate-700 transition-all"
      >
        Back to App
      </button>
    </div>
  );
}
