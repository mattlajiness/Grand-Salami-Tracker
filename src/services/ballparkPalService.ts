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
    time: "8:40",
    runs: 1.27,
    hr: 1.16,
    doubleTriple: 1.29,
    single: 1.13,
    receptive: "Low",
    windHours: [{ speed: 16, dir: "↙" }, { speed: 14, dir: "↙" }, { speed: 7, dir: "←" }],
    tempHours: [82, 79, 75],
    humidity: 33,
    pressure: 1012,
    icons: ["↙", "↙", "←", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "MIL @ CIN",
    venue: "Great American BP",
    time: "7:10",
    runs: 1.06,
    hr: 1.09,
    doubleTriple: 1.00,
    single: 0.98,
    receptive: "Low",
    windHours: [{ speed: 8, dir: "↗" }, { speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [77, 75, 72],
    humidity: 46,
    pressure: 1019,
    icons: ["↗", "↗", "↗", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "BAL @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 1.05,
    hr: 1.18,
    doubleTriple: 0.97,
    single: 1.00,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [81, 79, 77],
    humidity: 56,
    pressure: 1014,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "PHI @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.04,
    hr: 0.96,
    doubleTriple: 1.10,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "↓" }, { speed: 6, dir: "↓" }, { speed: 3, dir: "↓" }],
    tempHours: [77, 75, 73],
    humidity: 80,
    pressure: 1013,
    icons: ["↓", "↓", "↓", "~", "☀️", "H"],
    isClosed: false
  },
  {
    game: "HOU @ TOR",
    venue: "Rogers Centre",
    time: "4:07",
    runs: 1.02,
    hr: 1.07,
    doubleTriple: 1.03,
    single: 1.00,
    receptive: "Minimal",
    windHours: [{ speed: 9, dir: "↓" }, { speed: 10, dir: "↓" }, { speed: 11, dir: "↓" }],
    tempHours: [77, 73, 72],
    humidity: 41,
    pressure: 1017,
    icons: ["↓", "↓", "↓", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "SEA @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 1.01,
    hr: 0.88,
    doubleTriple: 1.10,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 10, dir: "↗" }, { speed: 9, dir: "↗" }, { speed: 9, dir: "↗" }],
    tempHours: [75, 72, 68],
    humidity: 36,
    pressure: 1016,
    icons: ["↗", "↗", "↗", "~"],
    isClosed: false
  },
  {
    game: "CLE @ CHW",
    venue: "Rate Field",
    time: "7:40",
    runs: 0.96,
    hr: 0.91,
    doubleTriple: 0.85,
    single: 1.07,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 5, dir: "↘" }, { speed: 4, dir: "↘" }],
    tempHours: [64, 64, 63],
    humidity: 71,
    pressure: 1021,
    icons: ["↘", "↘", "↘", "~", "P"],
    isClosed: false
  },
  {
    game: "NYY @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 0.95,
    hr: 0.89,
    doubleTriple: 0.97,
    single: 1.04,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [75, 73, 72],
    humidity: 45,
    pressure: 1019,
    icons: ["↗", "↗", "↗", "~", "P"],
    isClosed: false
  },
  {
    game: "TEX @ MIA",
    venue: "LoanDepot Park",
    time: "6:40",
    runs: 0.95,
    hr: 0.87,
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
    game: "LAD @ MIN",
    venue: "Target Field",
    time: "7:40",
    runs: 0.95,
    hr: 0.90,
    doubleTriple: 0.96,
    single: 1.00,
    receptive: "Medium",
    windHours: [{ speed: 4, dir: "↓" }, { speed: 6, dir: "↓" }, { speed: 6, dir: "↓" }],
    tempHours: [70, 68, 68],
    humidity: 88,
    pressure: 1018,
    icons: ["↓", "↓", "↓", "~", "H"],
    isClosed: false
  },
  {
    game: "KC @ TB",
    venue: "Tropicana Field",
    time: "6:40",
    runs: 0.94,
    hr: 0.97,
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
    runs: 0.93,
    hr: 0.80,
    doubleTriple: 0.92,
    single: 1.08,
    receptive: "Consistent",
    windHours: [{ speed: 13, dir: "↑" }, { speed: 12, dir: "↑" }, { speed: 11, dir: "↑" }],
    tempHours: [59, 57, 57],
    humidity: 90,
    pressure: 1016,
    icons: ["↑", "↑", "↑", "≈", "H"],
    isClosed: false
  },
  {
    game: "ARI @ STL",
    venue: "Busch Stadium",
    time: "7:45",
    runs: 0.92,
    hr: 0.80,
    doubleTriple: 0.99,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↙" }, { speed: 4, dir: "↙" }, { speed: 6, dir: "↙" }],
    tempHours: [84, 81, 77],
    humidity: 36,
    pressure: 1020,
    icons: ["↙", "↙", "↙", "☀️", "P"],
    isClosed: false
  },
  {
    game: "CHC @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.91,
    hr: 0.98,
    doubleTriple: 0.80,
    single: 0.95,
    receptive: "Low",
    windHours: [{ speed: 5, dir: "↓" }, { speed: 2, dir: "↓" }, { speed: 4, dir: "↓" }],
    tempHours: [72, 70, 68],
    humidity: 86,
    pressure: 1012,
    icons: ["↓", "↓", "↘", "H"],
    isClosed: false
  },
  {
    game: "ATL @ SD",
    venue: "Petco Park",
    time: "9:40",
    runs: 0.88,
    hr: 0.90,
    doubleTriple: 0.89,
    single: 0.92,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 8, dir: "↘" }, { speed: 7, dir: "↘" }],
    tempHours: [70, 68, 66],
    humidity: 76,
    pressure: 1015,
    icons: ["↘", "↘", "↘", "~", "H"],
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
