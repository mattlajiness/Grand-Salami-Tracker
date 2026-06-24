import { format } from 'date-fns';

/**
 * Ballpark Pal Service - Manual Mode
 * Manual updates for daily park factors
 */

export interface BallparkPalFactor {
  game: string; // e.g. "TB @ CLE"
  venue: string; // e.g. "Coors Field"
  time: string; // e.g. "3:10"
  runs: number; // runs multiplier e.g. 1.25 (+25%)
  hr: number; // hr multiplier e.g. 1.04 (+4%)
  doubleTriple: number; // 2b/3b multiplier e.g. 1.27 (+27%)
  single: number; // 1b multiplier e.g. 1.16 (+16%)
  receptive: string; // "Low", "Very High", "Consistent", "Med-High", "Roof Closed", "High", "Medium", "Extreme"
  windHours: { speed: number; dir: string }[];
  tempHours: number[]; // Hourly temperatures
  humidity: number; // Humidity percentage
  pressure: number; // Atmospheric pressure
  icons: string[]; // Custom meteorological glyphs like ["↓", "↓", "↓", "~"]
  isClosed?: boolean;
  edge?: number;
}

// VALUED DIRECTLY FROM THE LIVE BALLPARKPAL SCREENSHOTS PROVIDED BY THE USER
const MANUAL_FACTORS: BallparkPalFactor[] = [
  {
    game: "BOS @ COL",
    venue: "Coors Field",
    time: "3:10",
    runs: 1.38,
    hr: 1.35,
    doubleTriple: 1.28,
    single: 1.16,
    receptive: "Low",
    windHours: [{ speed: 4, dir: "↙" }, { speed: 5, dir: "↑" }, { speed: 8, dir: "↑" }],
    tempHours: [86, 88, 90],
    humidity: 20,
    pressure: 1008,
    icons: ["↙", "↑", "↑", "~", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "MIL @ CIN",
    venue: "Great American BP",
    time: "7:10",
    runs: 1.10,
    hr: 1.15,
    doubleTriple: 1.06,
    single: 0.97,
    receptive: "Low",
    windHours: [{ speed: 5, dir: "↖" }, { speed: 3, dir: "↖" }, { speed: 2, dir: "↖" }],
    tempHours: [75, 72, 68],
    humidity: 55,
    pressure: 1016,
    icons: ["↖", "↖", "↖"],
    isClosed: false
  },
  {
    game: "BAL @ LAA",
    venue: "Angel Stadium",
    time: "4:07",
    runs: 1.06,
    hr: 1.12,
    doubleTriple: 0.96,
    single: 1.04,
    receptive: "Consistent",
    windHours: [{ speed: 10, dir: "↑" }, { speed: 11, dir: "↑" }, { speed: 11, dir: "↑" }],
    tempHours: [77, 81, 81],
    humidity: 68,
    pressure: 1014,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "CLE @ CHW",
    venue: "Rate Field",
    time: "2:10",
    runs: 1.03,
    hr: 1.02,
    doubleTriple: 0.96,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "←" }, { speed: 8, dir: "←" }, { speed: 7, dir: "←" }],
    tempHours: [79, 81, 72],
    humidity: 45,
    pressure: 1016,
    icons: ["←", "←", "←", "~", "☀️"],
    isClosed: false
  },
  {
    game: "LAD @ MIN",
    venue: "Target Field",
    time: "7:40",
    runs: 1.02,
    hr: 1.02,
    doubleTriple: 0.98,
    single: 1.02,
    receptive: "Medium",
    windHours: [{ speed: 11, dir: "↗" }, { speed: 11, dir: "↗" }, { speed: 9, dir: "↗" }],
    tempHours: [72, 70, 68],
    humidity: 55,
    pressure: 1012,
    icons: ["↗", "↗", "↗", "≈"],
    isClosed: false
  },
  {
    game: "PHI @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.02,
    hr: 0.98,
    doubleTriple: 1.04,
    single: 1.03,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↘" }, { speed: 2, dir: "↓" }, { speed: 3, dir: "↓" }],
    tempHours: [81, 77, 73],
    humidity: 35,
    pressure: 1016,
    icons: ["↘", "↓", "↓", "☀️"],
    isClosed: false
  },
  {
    game: "SEA @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 1.00,
    hr: 0.86,
    doubleTriple: 1.11,
    single: 1.00,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "↖" }, { speed: 5, dir: "↖" }, { speed: 2, dir: "↑" }],
    tempHours: [77, 72, 66],
    humidity: 39,
    pressure: 1017,
    icons: ["↖", "↖", "↑", "☀️"],
    isClosed: false
  },
  {
    game: "ARI @ STL",
    venue: "Busch Stadium",
    time: "7:45",
    runs: 1.00,
    hr: 1.00,
    doubleTriple: 1.02,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 3, dir: "↖" }, { speed: 2, dir: "↖" }, { speed: 1, dir: "←" }],
    tempHours: [81, 79, 75],
    humidity: 66,
    pressure: 1013,
    icons: ["↖", "↖", "←", "☀️"],
    isClosed: false
  },
  {
    game: "NYY @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 0.96,
    hr: 0.87,
    doubleTriple: 0.98,
    single: 1.06,
    receptive: "High",
    windHours: [{ speed: 1, dir: "→" }, { speed: 3, dir: "↘" }, { speed: 2, dir: "↓" }],
    tempHours: [68, 66, 64],
    humidity: 89,
    pressure: 1017,
    icons: ["→", "↘", "↓", "H"],
    isClosed: false
  },
  {
    game: "ATL @ SD",
    venue: "Petco Park",
    time: "8:40",
    runs: 0.96,
    hr: 0.98,
    doubleTriple: 0.94,
    single: 0.95,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 9, dir: "↘" }, { speed: 9, dir: "↘" }],
    tempHours: [73, 72, 70],
    humidity: 63,
    pressure: 1013,
    icons: ["↘", "↘", "↘", "~"],
    isClosed: false
  },
  {
    game: "TEX @ MIA",
    venue: "LoanDepot Park",
    time: "12:10",
    runs: 0.95,
    hr: 0.88,
    doubleTriple: 1.02,
    single: 0.98,
    receptive: "Roof Closed",
    windHours: [],
    tempHours: [],
    humidity: 0,
    pressure: 0,
    icons: ["🏟️"],
    isClosed: true
  },
  {
    game: "HOU @ TOR",
    venue: "Rogers Centre",
    time: "7:07",
    runs: 0.95,
    hr: 1.00,
    doubleTriple: 0.98,
    single: 0.96,
    receptive: "Minimal",
    windHours: [{ speed: 3, dir: "↘" }, { speed: 3, dir: "↓" }, { speed: 2, dir: "↓" }],
    tempHours: [70, 68, 66],
    humidity: 57,
    pressure: 1016,
    icons: ["↘", "↓", "↓"],
    isClosed: false
  },
  {
    game: "KC @ TB",
    venue: "Tropicana Field",
    time: "6:40",
    runs: 0.94,
    hr: 0.98,
    doubleTriple: 0.93,
    single: 0.92,
    receptive: "Roof Closed",
    windHours: [],
    tempHours: [],
    humidity: 0,
    pressure: 0,
    icons: ["🏟️"],
    isClosed: true
  },
  {
    game: "ATH @ SF",
    venue: "Oracle Park",
    time: "9:45",
    runs: 0.92,
    hr: 0.72,
    doubleTriple: 1.10,
    single: 1.03,
    receptive: "Consistent",
    windHours: [{ speed: 14, dir: "↑" }, { speed: 13, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [63, 61, 59],
    humidity: 73,
    pressure: 1013,
    icons: ["↑", "↑", "↑", "~"],
    isClosed: false
  },
  {
    game: "CHC @ NYM",
    venue: "Citi Field",
    time: "1:10",
    runs: 0.91,
    hr: 0.96,
    doubleTriple: 0.73,
    single: 1.01,
    receptive: "Low",
    windHours: [{ speed: 11, dir: "↘" }, { speed: 11, dir: "↘" }, { speed: 11, dir: "↘" }],
    tempHours: [84, 84, 84],
    humidity: 35,
    pressure: 1014,
    icons: ["↘", "↘", "↘", "~", "☀️"],
    isClosed: false
  },
  {
    game: "CHC @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.90,
    hr: 0.95,
    doubleTriple: 0.79,
    single: 0.96,
    receptive: "Low",
    windHours: [{ speed: 10, dir: "↘" }, { speed: 9, dir: "↘" }, { speed: 9, dir: "↘" }],
    tempHours: [81, 79, 77],
    humidity: 31,
    pressure: 1014,
    icons: ["↘", "↘", "↘", "~", "☀️"],
    isClosed: false
  }
];

export async function fetchBallparkPalFactors(date?: string): Promise<BallparkPalFactor[]> {
  console.log('[BallparkPal] Using manual static factors');
  return MANUAL_FACTORS;
}

const TEAM_MAPPINGS: Record<string, string[]> = {
  'ARI': ['AZ', 'ARI'],
  'AZ': ['ARI', 'AZ'],
  'CHW': ['CWS', 'CHW'],
  'CWS': ['CHW', 'CWS'],
  'KC': ['KCA', 'KC'],
  'KCA': ['KC', 'KCA'],
  'SD': ['SDN', 'SD'],
  'SDN': ['SD', 'SDN'],
  'SF': ['SFN', 'SF'],
  'SFN': ['SF', 'SFN'],
  'TB': ['TBA', 'TB'],
  'TBA': ['TB', 'TBA'],
  'WAS': ['WSH', 'WAS'],
  'WSH': ['WAS', 'WSH'],
  'LAD': ['LA', 'LAD'],
  'LA': ['LAD', 'LA'],
  'OAK': ['ATH', 'OAK'],
  'ATH': ['OAK', 'ATH'],
  'NYY': ['NYY'],
  'NYM': ['NYM']
};

function normalizeAbbr(abbr: string): string[] {
  const upper = abbr.toUpperCase();
  return TEAM_MAPPINGS[upper] || [upper];
}

export function findGameFactor(factors: BallparkPalFactor[], awayAbbr: string, homeAbbr: string, awayName: string = '', homeName: string = ''): BallparkPalFactor | null {
  if (!factors || factors.length === 0) return null;
  
  const aAbbrs = normalizeAbbr(awayAbbr);
  const hAbbrs = normalizeAbbr(homeAbbr);
  const aName = (awayName || '').toUpperCase();
  const hName = (homeName || '').toUpperCase();

  // Try matching by abbreviation variants
  for (const a of aAbbrs) {
    for (const h of hAbbrs) {
      const matched = factors.find(f => {
        const gameStr = f.game.toUpperCase();
        const parts = gameStr.split(/[@vs]/).map(p => p.trim());
        if (parts.length >= 2) {
          const palAway = parts[0];
          const palHome = parts[parts.length - 1];
          return (palAway.includes(a) || a.includes(palAway)) && (palHome.includes(h) || h.includes(palHome));
        }
        return gameStr.includes(a) && gameStr.includes(h);
      });
      if (matched) return matched;
    }
  }

  // Fallback to name-based matching
  return factors.find(f => {
    const gameStr = f.game.toUpperCase();
    const parts = gameStr.split(/[@vs]/).map(p => p.trim());
    if (parts.length < 2) return false;
    
    const palAway = parts[0];
    const palHome = parts[parts.length - 1];

    const matchAway = aName.includes(palAway) || palAway.includes(aName.split(' ').pop() || '!!!');
    const matchHome = hName.includes(palHome) || palHome.includes(hName.split(' ').pop() || '!!!');

    return matchAway && matchHome;
  }) || null;
}
