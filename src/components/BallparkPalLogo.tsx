import React from 'react';

export function BallparkPalLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 120" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ballpark Pal Logo"
    >
      {/* Legs & Shoes */}
      <g>
        {/* Left Leg */}
        <path d="M 42 90 L 38 110" stroke="#1e3a8a" strokeWidth="6" strokeLinecap="round" />
        <path d="M 38 110 L 32 115 L 42 118 L 45 112 Z" fill="#1e40af" stroke="#1e3a8a" strokeWidth="1" />
        {/* Right Leg */}
        <path d="M 58 90 L 62 110" stroke="#1e3a8a" strokeWidth="6" strokeLinecap="round" />
        <path d="M 62 110 L 68 115 L 58 118 L 55 112 Z" fill="#1e40af" stroke="#1e3a8a" strokeWidth="1" />
      </g>

      {/* Baseball Bat (behind diamond) */}
      <path 
        d="M 12 55 L 40 38" 
        stroke="#b45309" 
        strokeWidth="7" 
        strokeLinecap="round" 
      />

      {/* Body: Baseball Diamond Field */}
      <g>
        {/* Main Field (Green) */}
        <path 
          d="M 50 40 L 90 65 L 50 105 L 10 65 Z" 
          fill="#10b981" 
          stroke="#064e3b" 
          strokeWidth="1.5" 
        />
        {/* Infield (Brown) */}
        <path 
          d="M 50 55 L 75 72 L 50 90 L 25 72 Z" 
          fill="#d97706" 
          stroke="#78350f" 
          strokeWidth="1" 
        />
        {/* Bases (White) */}
        <rect x="48.5" y="53.5" width="3" height="3" fill="white" transform="rotate(45 50 55)" />
        <rect x="73.5" y="70.5" width="3" height="3" fill="white" transform="rotate(45 75 72)" />
        <rect x="23.5" y="70.5" width="3" height="3" fill="white" transform="rotate(45 25 72)" />
        <path d="M 48 100 L 52 100 L 50 103 Z" fill="white" />
      </g>

      {/* Arms */}
      <g>
        {/* Left Arm (Holding Bat) */}
        <path d="M 15 50 L 22 55" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
        <circle cx="22" cy="55" r="4" fill="#f8fafc" stroke="#94a3b8" />
        {/* Right Arm (Glove) */}
        <path d="M 85 60 L 75 65" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
        <path 
          d="M 60 65 Q 65 85 80 80 L 85 70 Q 75 60 65 65" 
          fill="#78350f" 
          stroke="#451a03" 
          strokeWidth="1" 
        />
        {/* Ball in Glove */}
        <circle cx="72" cy="72" r="4" fill="white" stroke="#cbd5e1" strokeWidth="0.5" />
      </g>

      {/* Head: Baseball */}
      <g>
        <circle cx="50" cy="30" r="22" fill="white" stroke="#1e293b" strokeWidth="2" />
        {/* Stitching */}
        <path d="M 38 15 Q 50 30 38 45" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 2" />
        <path d="M 62 15 Q 50 30 62 45" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 2" />
        
        {/* Face */}
        <g>
          {/* Eyes (Blue/Cyan as in image) */}
          <circle cx="43" cy="28" r="4" fill="#22d3ee" stroke="#1e293b" strokeWidth="1" />
          <circle cx="57" cy="28" r="4" fill="#22d3ee" stroke="#1e293b" strokeWidth="1" />
          <circle cx="42" cy="27" r="1.5" fill="white" />
          <circle cx="56" cy="27" r="1.5" fill="white" />
          
          {/* Mouth & Tongue */}
          <path d="M 44 38 Q 50 45 56 38" fill="#1e293b" />
          <path d="M 47 40 Q 50 46 53 40" fill="#fb7185" />
        </g>
      </g>

      {/* Cap */}
      <g>
        <path d="M 35 18 Q 50 -2 65 18" fill="#2563eb" stroke="#1e3a8a" strokeWidth="1" />
        <path d="M 30 20 L 50 15 L 60 25 L 30 28 Z" fill="#1e293b" stroke="#000" strokeWidth="1" />
      </g>
    </svg>
  );
}
