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
    game: "MIA @ COL",
    venue: "Coors Field",
    time: "8:40",
    runs: 1.36,
    hr: 1.25,
    doubleTriple: 1.23,
    single: 1.22,
    receptive: "Low",
    windHours: [{ speed: 14, dir: "↙" }, { speed: 10, dir: "↙" }, { speed: 5, dir: "↙" }],
    tempHours: [86, 84, 82],
    humidity: 15,
    pressure: 1000,
    icons: ["↙", "↙", "↙", "~", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "LAD @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.30,
    hr: 1.38,
    doubleTriple: 1.17,
    single: 1.09,
    receptive: "Very High",
    windHours: [{ speed: 14, dir: "↑" }, { speed: 14, dir: "↑" }, { speed: 13, dir: "↑" }],
    tempHours: [88, 82, 73],
    humidity: 15,
    pressure: 1006,
    icons: ["↑", "↑", "↑", "~", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "SD @ CHC",
    venue: "Wrigley Field",
    time: "8:05",
    runs: 1.29,
    hr: 1.55,
    doubleTriple: 1.03,
    single: 1.03,
    receptive: "Extreme",
    windHours: [{ speed: 14, dir: "↑" }, { speed: 14, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [88, 84, 82],
    humidity: 64,
    pressure: 1012,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "WAS @ BOS",
    venue: "Fenway Park",
    time: "7:10",
    runs: 1.17,
    hr: 1.05,
    doubleTriple: 1.27,
    single: 1.07,
    receptive: "High",
    windHours: [{ speed: 13, dir: "↑" }, { speed: 12, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [79, 75, 73],
    humidity: 57,
    pressure: 1015,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "TB @ KC",
    venue: "Kauffman Stadium",
    time: "7:40",
    runs: 1.15,
    hr: 1.38,
    doubleTriple: 0.99,
    single: 1.01,
    receptive: "High",
    windHours: [{ speed: 15, dir: "↑" }, { speed: 14, dir: "↖" }, { speed: 12, dir: "↖" }],
    tempHours: [86, 84, 81],
    humidity: 65,
    pressure: 1012,
    icons: ["↑", "↖", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "TEX @ CLE",
    venue: "Progressive Field",
    time: "6:40",
    runs: 1.11,
    hr: 1.21,
    doubleTriple: 1.04,
    single: 1.00,
    receptive: "High",
    windHours: [{ speed: 12, dir: "↗" }, { speed: 11, dir: "↗" }, { speed: 11, dir: "↗" }],
    tempHours: [88, 88, 84],
    humidity: 63,
    pressure: 1014,
    icons: ["↗", "↗", "↗", "~", "☀️"],
    isClosed: false
  },
  {
    game: "CHW @ BAL",
    venue: "Oriole Park",
    time: "6:35",
    runs: 1.09,
    hr: 1.03,
    doubleTriple: 1.09,
    single: 1.07,
    receptive: "Med-High",
    windHours: [{ speed: 11, dir: "↖" }, { speed: 12, dir: "↖" }, { speed: 11, dir: "↖" }],
    tempHours: [88, 84, 81],
    humidity: 44,
    pressure: 1017,
    icons: ["↖", "↖", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "PIT @ PHI",
    venue: "Citizens Bank Park",
    time: "6:40",
    runs: 1.08,
    hr: 1.28,
    doubleTriple: 0.95,
    single: 0.96,
    receptive: "Very High",
    windHours: [{ speed: 11, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 9, dir: "↑" }],
    tempHours: [88, 86, 81],
    humidity: 39,
    pressure: 1018,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "CIN @ MIL",
    venue: "American Family Fld",
    time: "7:40",
    runs: 1.06,
    hr: 1.26,
    doubleTriple: 0.96,
    single: 0.92,
    receptive: "Low",
    windHours: [{ speed: 16, dir: "↖" }, { speed: 16, dir: "↖" }, { speed: 15, dir: "↖" }],
    tempHours: [86, 84, 84],
    humidity: 70,
    pressure: 1010,
    icons: ["↖", "↖", "↖", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "DET @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 1.02,
    hr: 1.22,
    doubleTriple: 0.88,
    single: 0.94,
    receptive: "High",
    windHours: [{ speed: 8, dir: "↖" }, { speed: 8, dir: "↖" }, { speed: 9, dir: "↖" }],
    tempHours: [84, 82, 81],
    humidity: 52,
    pressure: 1016,
    icons: ["↖", "↖", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "STL @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 1.01,
    hr: 1.08,
    doubleTriple: 0.90,
    single: 1.03,
    receptive: "Medium",
    windHours: [{ speed: 1, dir: "↗" }, { speed: 1, dir: "↗" }, { speed: 2, dir: "↗" }],
    tempHours: [90, 90, 88],
    humidity: 50,
    pressure: 1017,
    icons: ["↗", "↗", "↗", "☀️"],
    isClosed: false
  },
  {
    game: "SF @ ARI",
    venue: "Chase Field",
    time: "9:40",
    runs: 1.00,
    hr: 0.91,
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
    game: "MIN @ HOU",
    venue: "Daikin Park",
    time: "8:10",
    runs: 0.96,
    hr: 1.05,
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
    game: "NYM @ TOR",
    venue: "Rogers Centre",
    time: "7:07",
    runs: 0.95,
    hr: 1.02,
    doubleTriple: 0.95,
    single: 0.97,
    receptive: "Roof Closed",
    windHours: [],
    tempHours: [],
    humidity: 0,
    pressure: 0,
    icons: ["🏟️"],
    isClosed: true
  },
  {
    game: "LAA @ SEA",
    venue: "T-Mobile Park",
    time: "9:40",
    runs: 0.90,
    hr: 1.01,
    doubleTriple: 0.87,
    single: 0.90,
    receptive: "Medium",
    windHours: [{ speed: 3, dir: "↖" }, { speed: 2, dir: "↖" }, { speed: 1, dir: "↖" }],
    tempHours: [68, 68, 64],
    humidity: 46,
    pressure: 1014,
    icons: ["↖", "↖", "↖"],
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
