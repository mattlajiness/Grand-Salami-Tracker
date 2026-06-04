import React from 'react';

export function SalamiLogo({ className = "w-8 h-8", sport = 'MLB' }: { className?: string; sport?: 'MLB' | 'NHL' }) {
  const isMLB = sport === 'MLB';
  const themeColor = isMLB ? "#22c55e" : "#3b82f6"; // Green for MLB, Blue for NHL
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="logoTitle logoDesc"
    >
      <title id="logoTitle">{sport} Grand Salami Logo</title>
      <desc id="logoDesc">A high-tech neon {sport} Grand Salami tracker logo with a salami-shaped progress bar and predictive chart.</desc>
      
      <defs>
        <filter id="neon-glow-icon" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Main Neon Circle */}
      <circle 
        cx="50" 
        cy="50" 
        r="44" 
        stroke={themeColor} 
        strokeWidth="2" 
        opacity="0.8"
        style={{ filter: `drop-shadow(0 0 4px ${themeColor})` }}
      />

      {/* Salami Shape Group - Adjusted translation to center perfectly at (50, 50) */}
      <g transform="translate(15, 29) scale(0.14)">
        {/* Salami Outline */}
        <path d="M100,50 L400,50 C450,50 480,100 480,150 C480,200 450,250 400,250 L100,250 C50,250 20,200 20,150 C20,100 50,50 100,50 Z" fill="none" stroke="white" strokeWidth="15" strokeLinecap="round" />
        {/* End Detail */}
        <path d="M20,150 L-10,130 L-10,170 Z" fill="none" stroke="white" strokeWidth="15" />
        
        {/* Bar Chart inside Salami - Centered */}
        <rect x="115" y="180" width="30" height="50" fill={themeColor} rx="4" />
        <rect x="175" y="140" width="30" height="90" fill={themeColor} rx="4" />
        <rect x="235" y="120" width="30" height="110" fill={themeColor} rx="4" />
        <rect x="295" y="80" width="30" height="150" fill={themeColor} rx="4" />
        <rect x="355" y="60" width="30" height="170" fill={themeColor} rx="4" />

        {/* Trend Line / Arrow - Shifted to match bars */}
        <path 
          d="M105,220 L205,160 L285,190 L415,80" 
          fill="none" 
          stroke={themeColor} 
          strokeWidth="18" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          filter="url(#neon-glow-icon)" 
        />
        <path d="M395,80 L420,75 L415,110" fill={themeColor} filter="url(#neon-glow-icon)" />

        {/* Slices detail on the right */}
        <circle cx="430" cy="120" r="10" fill="white" opacity="0.6" />
        <circle cx="450" cy="150" r="8" fill="white" opacity="0.6" />
        <circle cx="430" cy="180" r="12" fill="white" opacity="0.6" />
      </g>
    </svg>
  );
}
