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
    game: "CIN @ COL",
    venue: "Coors Field",
    time: "8:40",
    runs: 1.35,
    hr: 1.23,
    doubleTriple: 1.12,
    single: 1.27,
    receptive: "Low",
    windHours: [{ speed: 15, dir: "↙" }, { speed: 15, dir: "↙" }, { speed: 13, dir: "↙" }],
    tempHours: [95, 93, 91],
    humidity: 13,
    pressure: 1005,
    icons: ["↙", "↙", "↙", "≈", "💥", "H", "P"],
    isClosed: false
  },
  {
    game: "WAS @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.28,
    hr: 1.32,
    doubleTriple: 1.19,
    single: 1.08,
    receptive: "Very High",
    windHours: [{ speed: 14, dir: "↑" }, { speed: 14, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [90, 84, 75],
    humidity: 16,
    pressure: 1009,
    icons: ["↑", "↑", "↑", "≈", "💥", "H", "P"],
    isClosed: false
  },
  {
    game: "TB @ BOS",
    venue: "Fenway Park",
    time: "1:35",
    runs: 1.21,
    hr: 1.03,
    doubleTriple: 1.34,
    single: 1.09,
    receptive: "High",
    windHours: [{ speed: 7, dir: "→" }, { speed: 6, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [82, 84, 84],
    humidity: 22,
    pressure: 1016,
    icons: ["→", "↗", "↗", "~", "☀️", "H"],
    isClosed: false
  },
  {
    game: "SD @ KC",
    venue: "Kauffman Stadium",
    time: "8:10",
    runs: 1.11,
    hr: 1.29,
    doubleTriple: 1.04,
    single: 0.99,
    receptive: "High",
    windHours: [{ speed: 9, dir: "↖" }, { speed: 8, dir: "↖" }, { speed: 8, dir: "↖" }],
    tempHours: [84, 81, 79],
    humidity: 63,
    pressure: 1014,
    icons: ["↖", "↖", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "TEX @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 1.07,
    hr: 1.06,
    doubleTriple: 1.04,
    single: 1.04,
    receptive: "Medium",
    windHours: [{ speed: 8, dir: "↖" }, { speed: 9, dir: "↖" }, { speed: 8, dir: "↑" }],
    tempHours: [88, 84, 81],
    humidity: 55,
    pressure: 1015,
    icons: ["↖", "↖", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "MIN @ CHC",
    venue: "Wrigley Field",
    time: "8:05",
    runs: 1.07,
    hr: 1.24,
    doubleTriple: 0.96,
    single: 0.95,
    receptive: "Extreme",
    windHours: [{ speed: 4, dir: "↑" }, { speed: 5, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [84, 82, 79],
    humidity: 68,
    pressure: 1013,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "DET @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 1.06,
    hr: 1.16,
    doubleTriple: 1.04,
    single: 0.97,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 8, dir: "↑" }],
    tempHours: [79, 77, 75],
    humidity: 56,
    pressure: 1012,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "TB @ BOS",
    venue: "Fenway Park",
    time: "7:10",
    runs: 1.06,
    hr: 0.92,
    doubleTriple: 1.20,
    single: 1.04,
    receptive: "High",
    windHours: [{ speed: 2, dir: "↘" }, { speed: 2, dir: "↙" }, { speed: 2, dir: "←" }],
    tempHours: [79, 72, 70],
    humidity: 32,
    pressure: 1015,
    icons: ["↘", "↙", "←", "☀️"],
    isClosed: false
  },
  {
    game: "MIA @ MIL",
    venue: "American Family Fld",
    time: "7:40",
    runs: 1.03,
    hr: 1.21,
    doubleTriple: 0.93,
    single: 0.91,
    receptive: "Low",
    windHours: [{ speed: 3, dir: "↓" }, { speed: 3, dir: "↓" }, { speed: 2, dir: "↙" }],
    tempHours: [81, 79, 77],
    humidity: 79,
    pressure: 1013,
    icons: ["↓", "↓", "↙", "☀️", "H"],
    isClosed: false
  },
  {
    game: "PIT @ CLE",
    venue: "Progressive Field",
    time: "7:10",
    runs: 1.02,
    hr: 0.97,
    doubleTriple: 1.05,
    single: 0.98,
    receptive: "High",
    windHours: [{ speed: 5, dir: "↓" }, { speed: 4, dir: "↙" }, { speed: 4, dir: "↙" }],
    tempHours: [81, 79, 77],
    humidity: 50,
    pressure: 1016,
    icons: ["↓", "↙", "↙", "☀️"],
    isClosed: false
  },
  {
    game: "STL @ ARI",
    venue: "Chase Field",
    time: "9:40",
    runs: 1.01,
    hr: 0.92,
    doubleTriple: 1.12,
    single: 1.01,
    receptive: "Roof Closed",
    windHours: [],
    tempHours: [],
    humidity: 0,
    pressure: 0,
    icons: ["🏟️"],
    isClosed: true
  },
  {
    game: "CHW @ TOR",
    venue: "Rogers Centre",
    time: "7:15",
    runs: 0.96,
    hr: 0.99,
    doubleTriple: 1.02,
    single: 0.96,
    receptive: "Minimal",
    windHours: [{ speed: 1, dir: "↗" }, { speed: 1, dir: "←" }, { speed: 1, dir: "↖" }],
    tempHours: [81, 79, 77],
    humidity: 43,
    pressure: 1015,
    icons: ["↗", "←", "↖", "☀️"],
    isClosed: false
  },
  {
    game: "BAL @ HOU",
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
    game: "LAD @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 0.93,
    hr: 1.04,
    doubleTriple: 0.81,
    single: 0.95,
    receptive: "High",
    windHours: [{ speed: 5, dir: "↖" }, { speed: 7, dir: "←" }, { speed: 7, dir: "←" }],
    tempHours: [84, 81, 79],
    humidity: 31,
    pressure: 1016,
    icons: ["↖", "←", "←", "~", "☀️"],
    isClosed: false
  },
  {
    game: "SF @ SEA",
    venue: "T-Mobile Park",
    time: "10:10",
    runs: 0.87,
    hr: 0.99,
    doubleTriple: 0.77,
    single: 0.93,
    receptive: "Medium",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 5, dir: "↘" }],
    tempHours: [72, 66, 61],
    humidity: 46,
    pressure: 1014,
    icons: ["↘", "↘", "↘", "~"],
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
