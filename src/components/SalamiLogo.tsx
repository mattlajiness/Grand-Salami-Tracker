import React from 'react';

export function SalamiLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="logoTitle logoDesc"
    >
      <title id="logoTitle">MLB Grand Salami Logo</title>
      <desc id="logoDesc">A baseball styled icon with crossed salamis representing the MLB Grand Salami total runs wager.</desc>
      {/* Outer Glowing Circle (Baseball Boundary) */}
      <circle 
        cx="50" 
        cy="50" 
        r="44" 
        stroke="#22c55e" 
        strokeWidth="2" 
        className="animate-pulse"
        style={{ filter: 'drop-shadow(0 0 6px #22c55e)' }}
      />

      {/* Neon Baseball Seams (Left) */}
      <path 
        d="M 30 15 Q 50 50 30 85" 
        stroke="#22c55e" 
        strokeWidth="2.5" 
        strokeDasharray="4 4" 
        strokeLinecap="round"
        opacity="0.8"
        style={{ filter: 'drop-shadow(0 0 2px #22c55e)' }}
      />
      
      {/* Neon Baseball Seams (Right) */}
      <path 
        d="M 70 15 Q 50 50 70 85" 
        stroke="#22c55e" 
        strokeWidth="2.5" 
        strokeDasharray="4 4" 
        strokeLinecap="round"
        opacity="0.8"
        style={{ filter: 'drop-shadow(0 0 2px #22c55e)' }}
      />
      
      {/* Two Crossed Salamis - Perfectly Centered */}
      <g transform="rotate(45 50 50)">
        {/* Salami 1 */}
        <rect x="25" y="44" width="50" height="12" rx="6" fill="#b91c1c" fillOpacity="0.8" stroke="white" strokeWidth="2.5" />
        {/* Salami Cross-Section */}
        <circle cx="72" cy="50" r="5" fill="#ef4444" stroke="white" strokeWidth="2" />
        
        {/* Enhanced Marbling */}
        <circle cx="32" cy="48" r="1.2" fill="white" opacity="0.6" />
        <circle cx="40" cy="52" r="1.5" fill="white" opacity="0.7" />
        <circle cx="48" cy="47" r="0.8" fill="white" opacity="0.4" />
        <circle cx="55" cy="53" r="1.1" fill="white" opacity="0.5" />
        <circle cx="62" cy="49" r="0.9" fill="white" opacity="0.6" />
        
        {/* Cap Marbling */}
        <circle cx="70" cy="48" r="1" fill="white" opacity="0.9" />
        <circle cx="73" cy="52" r="0.8" fill="white" opacity="0.7" />
        <circle cx="71" cy="51" r="0.5" fill="white" opacity="0.5" />
      </g>

      <g transform="rotate(-45 50 50)">
        {/* Salami 2 */}
        <rect x="25" y="44" width="50" height="12" rx="6" fill="#b91c1c" fillOpacity="0.8" stroke="white" strokeWidth="2.5" />
        {/* Salami Cross-Section */}
        <circle cx="72" cy="50" r="5" fill="#ef4444" stroke="white" strokeWidth="2" />
        
        {/* Enhanced Marbling */}
        <circle cx="30" cy="51" r="0.9" fill="white" opacity="0.5" />
        <circle cx="38" cy="47" r="1.3" fill="white" opacity="0.6" />
        <circle cx="46" cy="53" r="1" fill="white" opacity="0.4" />
        <circle cx="53" cy="48" r="0.7" fill="white" opacity="0.5" />
        <circle cx="60" cy="52" r="1.2" fill="white" opacity="0.7" />
        
        {/* Cap Marbling */}
        <circle cx="74" cy="48" r="1" fill="white" opacity="0.9" />
        <circle cx="71" cy="52" r="0.8" fill="white" opacity="0.7" />
        <circle cx="72" cy="49" r="0.5" fill="white" opacity="0.5" />
      </g>
    </svg>
  );
}
