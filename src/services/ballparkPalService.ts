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
    game: "KC @ COL",
    venue: "Coors Field",
    time: "8:10",
    runs: 1.35,
    hr: 1.24,
    doubleTriple: 1.24,
    single: 1.20,
    receptive: "Low",
    windHours: [{ speed: 11, dir: "←" }, { speed: 11, dir: "←" }, { speed: 10, dir: "←" }],
    tempHours: [93, 91, 90],
    humidity: 14,
    pressure: 1010,
    icons: ["←", "↖", "↖", "≈", "💥", "H", "P"],
    isClosed: false
  },
  {
    game: "DET @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.28,
    hr: 1.34,
    doubleTriple: 1.20,
    single: 1.08,
    receptive: "Very High",
    windHours: [{ speed: 11, dir: "↑" }, { speed: 11, dir: "↑" }, { speed: 9, dir: "↑" }],
    tempHours: [102, 95, 86],
    humidity: 12,
    pressure: 1008,
    icons: ["↑", "↑", "↑", "≈", "💥", "H", "P"],
    isClosed: false
  },
  {
    game: "PIT @ CIN",
    venue: "Great American BP",
    time: "6:40",
    runs: 1.11,
    hr: 1.14,
    doubleTriple: 1.04,
    single: 1.01,
    receptive: "Low",
    windHours: [{ speed: 8, dir: "↙" }, { speed: 8, dir: "↙" }, { speed: 9, dir: "↙" }],
    tempHours: [72, 72, 72],
    humidity: 95,
    pressure: 1005,
    icons: ["↙", "↙", "↓", "~", "H", "P"],
    isClosed: false
  },
  {
    game: "PHI @ BAL",
    venue: "Oriole Park",
    time: "7:05",
    runs: 1.07,
    hr: 1.05,
    doubleTriple: 1.11,
    single: 1.03,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↖" }, { speed: 9, dir: "↖" }, { speed: 10, dir: "↖" }],
    tempHours: [82, 79, 79],
    humidity: 58,
    pressure: 1012,
    icons: ["↖", "↖", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "ARI @ CLE",
    venue: "Progressive Field",
    time: "7:15",
    runs: 1.07,
    hr: 1.02,
    doubleTriple: 1.11,
    single: 1.00,
    receptive: "High",
    windHours: [{ speed: 6, dir: "←" }, { speed: 4, dir: "←" }, { speed: 4, dir: "←" }],
    tempHours: [75, 75, 73],
    humidity: 65,
    pressure: 1008,
    icons: ["←", "←", "←", "P"],
    isClosed: false
  },
  {
    game: "STL @ TOR",
    venue: "Rogers Centre",
    time: "3:07",
    runs: 1.02,
    hr: 1.18,
    doubleTriple: 0.95,
    single: 0.98,
    receptive: "Minimal",
    windHours: [{ speed: 6, dir: "↖" }, { speed: 6, dir: "↖" }, { speed: 6, dir: "↖" }],
    tempHours: [90, 90, 90],
    humidity: 51,
    pressure: 1010,
    icons: ["↖", "↖", "↖", "~", "💥", "P"],
    isClosed: false
  },
  {
    game: "WAS @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 1.00,
    hr: 1.02,
    doubleTriple: 0.97,
    single: 1.01,
    receptive: "Medium",
    windHours: [{ speed: 9, dir: "↙" }, { speed: 9, dir: "↙" }, { speed: 9, dir: "↙" }],
    tempHours: [81, 79, 77],
    humidity: 74,
    pressure: 1008,
    icons: ["↓", "↓", "↙", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "BOS @ LAD",
    venue: "Dodger Stadium",
    time: "9:10",
    runs: 0.98,
    hr: 1.20,
    doubleTriple: 0.97,
    single: 0.90,
    receptive: "Consistent",
    windHours: [{ speed: 8, dir: "↑" }, { speed: 6, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [91, 88, 86],
    humidity: 28,
    pressure: 1010,
    icons: ["↑", "↑", "↑", "~", "💥", "P"],
    isClosed: false
  },
  {
    game: "MIL @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 0.97,
    hr: 0.96,
    doubleTriple: 0.95,
    single: 1.01,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 7, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [86, 84, 81],
    humidity: 39,
    pressure: 1010,
    icons: ["↑", "↑", "↑", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "MIA @ NYM",
    venue: "Citi Field",
    time: "4:10",
    runs: 0.97,
    hr: 1.12,
    doubleTriple: 0.81,
    single: 0.95,
    receptive: "Low",
    windHours: [{ speed: 14, dir: "↖" }, { speed: 14, dir: "↑" }, { speed: 14, dir: "↑" }],
    tempHours: [91, 88, 82],
    humidity: 48,
    pressure: 1013,
    icons: ["↖", "↑", "↑", "≈", "💥"],
    isClosed: false
  },
  {
    game: "TEX @ HOU",
    venue: "Daikin Park",
    time: "7:10",
    runs: 0.95,
    hr: 1.05,
    doubleTriple: 0.89,
    single: 0.96,
    receptive: "Roof Closed",
    windHours: [],
    tempHours: [],
    humidity: 0,
    pressure: 0,
    icons: ["🏟️"],
    isClosed: true
  },
  {
    game: "SF @ SD",
    venue: "Petco Park",
    time: "8:40",
    runs: 0.94,
    hr: 0.99,
    doubleTriple: 0.91,
    single: 0.95,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "→" }, { speed: 7, dir: "→" }, { speed: 7, dir: "→" }],
    tempHours: [82, 81, 79],
    humidity: 53,
    pressure: 1011,
    icons: ["→", "→", "→", "~", "☀️"],
    isClosed: false
  },
  {
    game: "MIN @ SEA",
    venue: "T-Mobile Park",
    time: "4:10",
    runs: 0.94,
    hr: 1.02,
    doubleTriple: 0.86,
    single: 0.95,
    receptive: "Medium",
    windHours: [{ speed: 11, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 9, dir: "↑" }],
    tempHours: [68, 73, 70],
    humidity: 68,
    pressure: 1019,
    icons: ["↑", "↑", "↑", "~", "P"],
    isClosed: false
  },
  {
    game: "CHW @ TB",
    venue: "Tropicana Field",
    time: "4:10",
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
    game: "NYY @ CHC",
    venue: "Wrigley Field",
    time: "7:15",
    runs: 0.84,
    hr: 0.80,
    doubleTriple: 0.92,
    single: 0.94,
    receptive: "Extreme",
    windHours: [{ speed: 16, dir: "↙" }, { speed: 17, dir: "↙" }, { speed: 18, dir: "↙" }],
    tempHours: [68, 68, 68],
    humidity: 94,
    pressure: 1007,
    icons: ["↓", "↓", "↓", "≈", "H", "P"],
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
