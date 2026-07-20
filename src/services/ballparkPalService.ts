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
    game: "WAS @ COL",
    venue: "Coors Field",
    time: "8:40",
    runs: 1.32,
    hr: 1.26,
    doubleTriple: 1.19,
    single: 1.18,
    receptive: "Low",
    windHours: [{ speed: 8, dir: "↙" }, { speed: 8, dir: "↙" }, { speed: 8, dir: "↙" }],
    tempHours: [100, 99, 97],
    humidity: 12,
    pressure: 1004,
    icons: ["↙", "↙", "↙", "~", "💥", "H", "P"],
    isClosed: false
  },
  {
    game: "DET @ CHC",
    venue: "Wrigley Field",
    time: "8:05",
    runs: 1.24,
    hr: 1.47,
    doubleTriple: 1.00,
    single: 1.02,
    receptive: "Extreme",
    windHours: [{ speed: 12, dir: "↑" }, { speed: 13, dir: "↑" }, { speed: 14, dir: "↑" }],
    tempHours: [81, 79, 79],
    humidity: 54,
    pressure: 1008,
    icons: ["↑", "↑", "↑", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "BAL @ BOS",
    venue: "Fenway Park",
    time: "7:10",
    runs: 1.18,
    hr: 1.01,
    doubleTriple: 1.30,
    single: 1.09,
    receptive: "High",
    windHours: [{ speed: 8, dir: "↖" }, { speed: 11, dir: "↖" }, { speed: 10, dir: "↖" }],
    tempHours: [84, 79, 75],
    humidity: 28,
    pressure: 1014,
    icons: ["↖", "↖", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "SF @ KC",
    venue: "Kauffman Stadium",
    time: "7:40",
    runs: 1.10,
    hr: 1.24,
    doubleTriple: 0.98,
    single: 1.03,
    receptive: "High",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 5, dir: "↑" }],
    tempHours: [106, 104, 100],
    humidity: 27,
    pressure: 1007,
    icons: ["↑", "↑", "↑", "~", "💥", "P"],
    isClosed: false
  },
  {
    game: "LAD @ PHI",
    venue: "Citizens Bank Park",
    time: "7:10",
    runs: 1.10,
    hr: 1.23,
    doubleTriple: 1.05,
    single: 0.95,
    receptive: "Very High",
    windHours: [{ speed: 6, dir: "↑" }, { speed: 6, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [82, 77, 75],
    humidity: 51,
    pressure: 1013,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "NYM @ MIL",
    venue: "American Family Fld",
    time: "7:40",
    runs: 1.06,
    hr: 1.18,
    doubleTriple: 0.89,
    single: 0.99,
    receptive: "Low",
    windHours: [{ speed: 14, dir: "↖" }, { speed: 11, dir: "←" }, { speed: 11, dir: "←" }],
    tempHours: [90, 90, 84],
    humidity: 49,
    pressure: 1007,
    icons: ["↖", "↖", "↖", "≈", "💥", "P"],
    isClosed: false
  },
  {
    game: "STL @ LAA",
    venue: "Angel Stadium",
    time: "10:10",
    runs: 1.05,
    hr: 1.11,
    doubleTriple: 0.97,
    single: 1.03,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [86, 84, 81],
    humidity: 42,
    pressure: 1011,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "ATH @ ARI",
    venue: "Chase Field",
    time: "9:40",
    runs: 1.01,
    hr: 0.92,
    doubleTriple: 1.11,
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
    game: "TB @ TOR",
    venue: "Rogers Centre",
    time: "7:07",
    runs: 0.99,
    hr: 1.08,
    doubleTriple: 1.01,
    single: 0.96,
    receptive: "Minimal",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 7, dir: "↗" }, { speed: 7, dir: "↗" }],
    tempHours: [79, 75, 73],
    humidity: 50,
    pressure: 1010,
    icons: ["↑", "↑", "↗", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "MIN @ CLE",
    venue: "Progressive Field",
    time: "6:40",
    runs: 0.98,
    hr: 0.97,
    doubleTriple: 1.01,
    single: 0.96,
    receptive: "High",
    windHours: [{ speed: 3, dir: "↓" }, { speed: 3, dir: "↓" }, { speed: 4, dir: "←" }],
    tempHours: [82, 81, 81],
    humidity: 48,
    pressure: 1011,
    icons: ["↓", "↓", "←", "☀️"],
    isClosed: false
  },
  {
    game: "MIA @ HOU",
    venue: "Daikin Park",
    time: "8:10",
    runs: 0.96,
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
    game: "SD @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 0.95,
    hr: 1.02,
    doubleTriple: 0.92,
    single: 0.98,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "↖" }, { speed: 4, dir: "↖" }, { speed: 3, dir: "←" }],
    tempHours: [84, 77, 79],
    humidity: 68,
    pressure: 1011,
    icons: ["↖", "↖", "←", "☀️"],
    isClosed: false
  },
  {
    game: "CIN @ SEA",
    venue: "T-Mobile Park",
    time: "9:40",
    runs: 0.93,
    hr: 1.05,
    doubleTriple: 0.88,
    single: 0.92,
    receptive: "Medium",
    windHours: [{ speed: 3, dir: "↘" }, { speed: 3, dir: "↘" }, { speed: 4, dir: "↘" }],
    tempHours: [84, 82, 77],
    humidity: 39,
    pressure: 1012,
    icons: ["↘", "↘", "↘", "☀️"],
    isClosed: false
  },
  {
    game: "PIT @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 0.92,
    hr: 1.02,
    doubleTriple: 0.86,
    single: 0.93,
    receptive: "High",
    windHours: [{ speed: 11, dir: "←" }, { speed: 11, dir: "←" }, { speed: 10, dir: "←" }],
    tempHours: [81, 75, 72],
    humidity: 38,
    pressure: 1014,
    icons: ["←", "←", "←", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "CHW @ TEX",
    venue: "Globe Life Field",
    time: "8:05",
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
