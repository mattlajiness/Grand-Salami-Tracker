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
    game: "BOS @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.30,
    hr: 1.39,
    doubleTriple: 1.18,
    single: 1.09,
    receptive: "Very High",
    windHours: [{ speed: 12, dir: "↑" }, { speed: 13, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [95, 90, 81],
    humidity: 18,
    pressure: 1007,
    icons: ["↑", "↑", "↑", "≈", "💥", "H", "P"],
    isClosed: false
  },
  {
    game: "CLE @ CIN",
    venue: "Great American BP",
    time: "1:40",
    runs: 1.16,
    hr: 1.28,
    doubleTriple: 1.02,
    single: 1.01,
    receptive: "Low",
    windHours: [{ speed: 10, dir: "↗" }, { speed: 11, dir: "↗" }, { speed: 10, dir: "↗" }],
    tempHours: [84, 84, 86],
    humidity: 79,
    pressure: 1006,
    icons: ["↗", "↗", "↗", "≈", "💥", "H", "P"],
    isClosed: false
  },
  {
    game: "CLE @ CIN",
    venue: "Great American BP",
    time: "7:10",
    runs: 1.13,
    hr: 1.25,
    doubleTriple: 1.01,
    single: 0.99,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 8, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [84, 81, 75],
    humidity: 63,
    pressure: 1007,
    icons: ["↗", "↗", "↗", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "ARI @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 1.09,
    hr: 1.00,
    doubleTriple: 1.08,
    single: 1.07,
    receptive: "Med-High",
    windHours: [{ speed: 8, dir: "↗" }, { speed: 10, dir: "↗" }, { speed: 10, dir: "↗" }],
    tempHours: [79, 77, 75],
    humidity: 61,
    pressure: 1003,
    icons: ["↗", "↗", "↗", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "BAL @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 1.09,
    hr: 1.08,
    doubleTriple: 1.03,
    single: 1.08,
    receptive: "High",
    windHours: [{ speed: 14, dir: "↗" }, { speed: 13, dir: "↗" }, { speed: 11, dir: "↗" }],
    tempHours: [79, 77, 75],
    humidity: 49,
    pressure: 1006,
    icons: ["↗", "↗", "↗", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "NYY @ CHW",
    venue: "Rate Field",
    time: "7:40",
    runs: 1.03,
    hr: 1.18,
    doubleTriple: 0.95,
    single: 0.96,
    receptive: "Med-High",
    windHours: [{ speed: 16, dir: "↗" }, { speed: 15, dir: "↗" }, { speed: 14, dir: "↗" }],
    tempHours: [75, 73, 73],
    humidity: 48,
    pressure: 1011,
    icons: ["↗", "↗", "↗", "≈"],
    isClosed: false
  },
  {
    game: "TOR @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.02,
    hr: 1.12,
    doubleTriple: 0.96,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 1, dir: "↖" }, { speed: 6, dir: "↖" }, { speed: 2, dir: "↖" }],
    tempHours: [77, 73, 70],
    humidity: 82,
    pressure: 1001,
    icons: ["↖", "↖", "↖", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "ATL @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 1.01,
    hr: 1.14,
    doubleTriple: 0.92,
    single: 0.93,
    receptive: "Low",
    windHours: [{ speed: 15, dir: "↖" }, { speed: 15, dir: "↖" }, { speed: 14, dir: "↖" }],
    tempHours: [72, 72, 72],
    humidity: 88,
    pressure: 1001,
    icons: ["↖", "↖", "↖", "≈", "H", "P"],
    isClosed: false
  },
  {
    game: "HOU @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 1.01,
    hr: 1.09,
    doubleTriple: 0.94,
    single: 1.00,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 7, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [82, 81, 77],
    humidity: 45,
    pressure: 1008,
    icons: ["↑", "↑", "↑", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "MIL @ SF",
    venue: "Oracle Park",
    time: "9:45",
    runs: 0.98,
    hr: 0.80,
    doubleTriple: 1.12,
    single: 1.05,
    receptive: "Consistent",
    windHours: [{ speed: 14, dir: "↑" }, { speed: 13, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [64, 63, 61],
    humidity: 75,
    pressure: 1012,
    icons: ["↑", "↑", "↑", "≈", "H"],
    isClosed: false
  },
  {
    game: "SEA @ LAD",
    venue: "Dodger Stadium",
    time: "10:10",
    runs: 0.98,
    hr: 1.14,
    doubleTriple: 1.03,
    single: 0.89,
    receptive: "Consistent",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 6, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [84, 81, 81],
    humidity: 38,
    pressure: 1008,
    icons: ["↗", "↗", "↗", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "KC @ MIN",
    venue: "Target Field",
    time: "7:40",
    runs: 0.97,
    hr: 0.92,
    doubleTriple: 0.99,
    single: 1.00,
    receptive: "Medium",
    windHours: [{ speed: 12, dir: "↙" }, { speed: 10, dir: "←" }, { speed: 6, dir: "↙" }],
    tempHours: [95, 91, 88],
    humidity: 28,
    pressure: 1008,
    icons: ["↙", "←", "↙", "~", "💥", "P"],
    isClosed: false
  },
  {
    game: "PHI @ MIA",
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
    game: "CHC @ STL",
    venue: "Busch Stadium",
    time: "7:45",
    runs: 0.95,
    hr: 0.88,
    doubleTriple: 1.00,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 11, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 8, dir: "↘" }],
    tempHours: [84, 82, 81],
    humidity: 70,
    pressure: 1009,
    icons: ["↘", "↘", "↘", "~", "💥", "P"],
    isClosed: false
  },
  {
    game: "TEX @ TB",
    venue: "Tropicana Field",
    time: "6:40",
    runs: 0.94,
    hr: 0.96,
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
    game: "COL @ SD",
    venue: "Petco Park",
    time: "9:40",
    runs: 0.92,
    hr: 1.01,
    doubleTriple: 0.83,
    single: 0.95,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }, { speed: 4, dir: "↗" }],
    tempHours: [75, 75, 73],
    humidity: 63,
    pressure: 1009,
    icons: ["↗", "↗", "↗", "~", "P"],
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
