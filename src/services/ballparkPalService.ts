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
    game: "SF @ COL",
    venue: "Coors Field",
    time: "8:10",
    runs: 1.43,
    hr: 1.24,
    doubleTriple: 1.36,
    single: 1.23,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 16, dir: "↓" }, { speed: 18, dir: "↙" }],
    tempHours: [91, 84, 79],
    humidity: 9,
    pressure: 1008,
    icons: ["↗", "↓", "↙", "≈", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "MIA @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.31,
    hr: 1.39,
    doubleTriple: 1.22,
    single: 1.08,
    receptive: "Very High",
    windHours: [{ speed: 14, dir: "↑" }, { speed: 14, dir: "↑" }, { speed: 13, dir: "↑" }],
    tempHours: [91, 88, 79],
    humidity: 16,
    pressure: 1010,
    icons: ["↑", "↑", "↑", "≈", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "BAL @ CIN",
    venue: "Great American BP",
    time: "7:10",
    runs: 1.16,
    hr: 1.25,
    doubleTriple: 1.01,
    single: 1.02,
    receptive: "Low",
    windHours: [{ speed: 5, dir: "↑" }, { speed: 3, dir: "↑" }, { speed: 6, dir: "↗" }],
    tempHours: [88, 84, 75],
    humidity: 60,
    pressure: 1013,
    icons: ["↑", "↑", "↗", "☀️"],
    isClosed: false
  },
  {
    game: "PHI @ KC",
    venue: "Kauffman Stadium",
    time: "8:10",
    runs: 1.12,
    hr: 1.32,
    doubleTriple: 1.09,
    single: 0.95,
    receptive: "High",
    windHours: [{ speed: 8, dir: "↖" }, { speed: 5, dir: "↖" }, { speed: 7, dir: "↖" }],
    tempHours: [88, 84, 82],
    humidity: 67,
    pressure: 1011,
    icons: ["↖", "↖", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "PIT @ WAS",
    venue: "Nationals Park",
    time: "11:05",
    runs: 1.08,
    hr: 1.09,
    doubleTriple: 0.96,
    single: 1.11,
    receptive: "Med-High",
    windHours: [{ speed: 3, dir: "↗" }, { speed: 5, dir: "→" }, { speed: 6, dir: "→" }],
    tempHours: [93, 96, 101],
    humidity: 35,
    pressure: 1016,
    icons: ["↗", "→", "→", "☀️"],
    isClosed: false
  },
  {
    game: "CHW @ CLE",
    venue: "Progressive Field",
    time: "7:10",
    runs: 1.05,
    hr: 1.12,
    doubleTriple: 1.01,
    single: 0.98,
    receptive: "High",
    windHours: [{ speed: 14, dir: "↘" }, { speed: 7, dir: "↗" }, { speed: 14, dir: "↑" }],
    tempHours: [79, 73, 72],
    humidity: 87,
    pressure: 1014,
    icons: ["↘", "↗", "↑", "≈", "☀️", "H"],
    isClosed: false
  },
  {
    game: "MIN @ NYY",
    venue: "Yankee Stadium",
    time: "1:35",
    runs: 1.04,
    hr: 1.23,
    doubleTriple: 0.86,
    single: 0.98,
    receptive: "High",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 11, dir: "↗" }, { speed: 11, dir: "↗" }],
    tempHours: [99, 99, 99],
    humidity: 40,
    pressure: 1013,
    icons: ["↗", "↗", "↗", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "BOS @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 1.04,
    hr: 1.08,
    doubleTriple: 0.98,
    single: 1.02,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 7, dir: "↑" }, { speed: 8, dir: "↑" }],
    tempHours: [77, 75, 73],
    humidity: 42,
    pressure: 1013,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "MIL @ ARI",
    venue: "Chase Field",
    time: "9:40",
    runs: 1.00,
    hr: 0.90,
    doubleTriple: 1.12,
    single: 1.00,
    receptive: "Roof Closed",
    windHours: [],
    tempHours: [],
    humidity: 0,
    pressure: 0,
    icons: ["🏟️"],
    isClosed: true
  },
  {
    game: "NYM @ ATL",
    venue: "Truist Park",
    time: "8:08",
    runs: 0.99,
    hr: 1.06,
    doubleTriple: 0.95,
    single: 0.98,
    receptive: "Medium",
    windHours: [{ speed: 3, dir: "↑" }, { speed: 2, dir: "←" }, { speed: 6, dir: "←" }],
    tempHours: [91, 90, 88],
    humidity: 38,
    pressure: 1013,
    icons: ["↑", "←", "←", "☀️"],
    isClosed: false
  },
  {
    game: "SD @ LAD",
    venue: "Dodger Stadium",
    time: "10:10",
    runs: 0.98,
    hr: 1.12,
    doubleTriple: 0.96,
    single: 0.94,
    receptive: "Consistent",
    windHours: [{ speed: 6, dir: "↑" }, { speed: 7, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [79, 75, 72],
    humidity: 34,
    pressure: 1013,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "TB @ HOU",
    venue: "Daikin Park",
    time: "7:10",
    runs: 0.96,
    hr: 1.04,
    doubleTriple: 0.90,
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
    game: "TOR @ SEA",
    venue: "T-Mobile Park",
    time: "4:10",
    runs: 0.92,
    hr: 1.05,
    doubleTriple: 0.84,
    single: 0.92,
    receptive: "Medium",
    windHours: [{ speed: 5, dir: "↑" }, { speed: 4, dir: "↗" }, { speed: 5, dir: "↗" }],
    tempHours: [68, 68, 75],
    humidity: 72,
    pressure: 1019,
    icons: ["↑", "↗", "↗", "P"],
    isClosed: false
  },
  {
    game: "DET @ TEX",
    venue: "Globe Life Field",
    time: "4:05",
    runs: 0.92,
    hr: 0.89,
    doubleTriple: 0.92,
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
    game: "STL @ CHC",
    venue: "Wrigley Field",
    time: "8:08",
    runs: 0.82,
    hr: 0.88,
    doubleTriple: 0.84,
    single: 0.91,
    receptive: "Extreme",
    windHours: [{ speed: 8, dir: "↓" }, { speed: 8, dir: "↓" }, { speed: 8, dir: "↓" }],
    tempHours: [73, 72, 72],
    humidity: 60,
    pressure: 1011,
    icons: ["↓", "↓", "↓", "~"],
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
