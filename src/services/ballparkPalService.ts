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
    runs: 1.40,
    hr: 1.20,
    doubleTriple: 1.29,
    single: 1.25,
    receptive: "Low",
    windHours: [{ speed: 17, dir: "↗" }, { speed: 16, dir: "→" }, { speed: 12, dir: "→" }],
    tempHours: [90, 90, 86],
    humidity: 5,
    pressure: 999,
    icons: ["↗", "→", "→", "≈", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "LAD @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.29,
    hr: 1.39,
    doubleTriple: 1.17,
    single: 1.08,
    receptive: "Very High",
    windHours: [{ speed: 14, dir: "↑" }, { speed: 14, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [90, 86, 79],
    humidity: 17,
    pressure: 1006,
    icons: ["↑", "↑", "↑", "≈", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "SD @ CHC",
    venue: "Wrigley Field",
    time: "8:05",
    runs: 1.26,
    hr: 1.47,
    doubleTriple: 1.04,
    single: 1.03,
    receptive: "Extreme",
    windHours: [{ speed: 13, dir: "↑" }, { speed: 12, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [86, 82, 81],
    humidity: 68,
    pressure: 1012,
    icons: ["↑", "↑", "↑", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "PIT @ PHI",
    venue: "Citizens Bank Park",
    time: "6:40",
    runs: 1.10,
    hr: 1.27,
    doubleTriple: 1.00,
    single: 0.96,
    receptive: "Very High",
    windHours: [{ speed: 8, dir: "↑" }, { speed: 7, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [81, 79, 79],
    humidity: 57,
    pressure: 1018,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "TEX @ CLE",
    venue: "Progressive Field",
    time: "7:10",
    runs: 1.07,
    hr: 1.09,
    doubleTriple: 1.10,
    single: 0.97,
    receptive: "High",
    windHours: [{ speed: 1, dir: "↗" }, { speed: 2, dir: "↗" }, { speed: 5, dir: "↗" }],
    tempHours: [82, 81, 79],
    humidity: 71,
    pressure: 1016,
    icons: ["↗", "↗", "↗", "☀️"],
    isClosed: false
  },
  {
    game: "CHW @ BAL",
    venue: "Oriole Park",
    time: "6:35",
    runs: 1.05,
    hr: 1.02,
    doubleTriple: 1.06,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 2, dir: "←" }, { speed: 2, dir: "←" }, { speed: 2, dir: "←" }],
    tempHours: [84, 82, 81],
    humidity: 55,
    pressure: 1018,
    icons: ["←", "←", "←", "☀️"],
    isClosed: false
  },
  {
    game: "WAS @ BOS",
    venue: "Fenway Park",
    time: "7:10",
    runs: 1.05,
    hr: 0.91,
    doubleTriple: 1.16,
    single: 1.06,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↙" }, { speed: 5, dir: "←" }, { speed: 5, dir: "←" }],
    tempHours: [72, 68, 66],
    humidity: 59,
    pressure: 1018,
    icons: ["↙", "←", "←", "~"],
    isClosed: false
  },
  {
    game: "SF @ ARI",
    venue: "Chase Field",
    time: "9:40",
    runs: 1.00,
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
    game: "CIN @ MIL",
    venue: "American Family Fld",
    time: "7:40",
    runs: 1.00,
    hr: 1.16,
    doubleTriple: 0.93,
    single: 0.90,
    receptive: "Low",
    windHours: [{ speed: 15, dir: "←" }, { speed: 14, dir: "←" }, { speed: 14, dir: "←" }],
    tempHours: [88, 86, 84],
    humidity: 73,
    pressure: 1010,
    icons: ["←", "←", "←", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "NYM @ TOR",
    venue: "Rogers Centre",
    time: "7:07",
    runs: 0.97,
    hr: 1.07,
    doubleTriple: 1.01,
    single: 0.94,
    receptive: "Minimal",
    windHours: [{ speed: 6, dir: "↖" }, { speed: 4, dir: "↖" }, { speed: 4, dir: "↖" }],
    tempHours: [73, 72, 70],
    humidity: 59,
    pressure: 1017,
    icons: ["↖", "↖", "↖"],
    isClosed: false
  },
  {
    game: "DET @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 0.96,
    hr: 1.12,
    doubleTriple: 0.90,
    single: 0.90,
    receptive: "High",
    windHours: [{ speed: 9, dir: "←" }, { speed: 9, dir: "←" }, { speed: 9, dir: "←" }],
    tempHours: [81, 79, 77],
    humidity: 55,
    pressure: 1018,
    icons: ["←", "←", "←", "~", "☀️"],
    isClosed: false
  },
  {
    game: "MIN @ HOU",
    venue: "Daikin Park",
    time: "8:10",
    runs: 0.95,
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
    game: "LAA @ SEA",
    venue: "T-Mobile Park",
    time: "9:40",
    runs: 0.93,
    hr: 1.04,
    doubleTriple: 0.84,
    single: 0.94,
    receptive: "Medium",
    windHours: [{ speed: 5, dir: "↖" }, { speed: 5, dir: "↖" }, { speed: 5, dir: "↖" }],
    tempHours: [66, 66, 64],
    humidity: 54,
    pressure: 1014,
    icons: ["↖", "↖", "↖", "~"],
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
