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
    game: "TB @ COL",
    venue: "Coors Field",
    time: "3:10",
    runs: 1.42,
    hr: 1.30,
    doubleTriple: 1.29,
    single: 1.22,
    receptive: "Low",
    windHours: [{ speed: 8, dir: "↙" }, { speed: 8, dir: "↙" }, { speed: 7, dir: "↙" }],
    tempHours: [86, 90, 91],
    humidity: 19,
    pressure: 1011,
    icons: ["↙", "↙", "↙", "~", "💥", "H"],
    isClosed: false
  },
  {
    game: "CHW @ BOS",
    venue: "Fenway Park",
    time: "7:10",
    runs: 1.18,
    hr: 1.06,
    doubleTriple: 1.32,
    single: 1.06,
    receptive: "High",
    windHours: [{ speed: 6, dir: "↑" }, { speed: 7, dir: "↑" }, { speed: 8, dir: "↑" }],
    tempHours: [81, 77, 77],
    humidity: 50,
    pressure: 1018,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "ATH @ CIN",
    venue: "Great American BP",
    time: "6:40",
    runs: 1.14,
    hr: 1.22,
    doubleTriple: 1.06,
    single: 0.98,
    receptive: "Low",
    windHours: [{ speed: 5, dir: "↗" }, { speed: 4, dir: "↗" }, { speed: 4, dir: "↗" }],
    tempHours: [84, 82, 79],
    humidity: 62,
    pressure: 1015,
    icons: ["↗", "↗", "↗", "☀️"],
    isClosed: false
  },
  {
    game: "WAS @ PHI",
    venue: "Citizens Bank Park",
    time: "6:40",
    runs: 1.14,
    hr: 1.34,
    doubleTriple: 1.02,
    single: 0.96,
    receptive: "Very High",
    windHours: [{ speed: 4, dir: "↑" }, { speed: 4, dir: "↑" }, { speed: 5, dir: "↑" }],
    tempHours: [79, 79, 75],
    humidity: 86,
    pressure: 1018,
    icons: ["↑", "↑", "↑", "☀️", "H"],
    isClosed: false
  },
  {
    game: "LAA @ BAL",
    venue: "Oriole Park",
    time: "6:35",
    runs: 1.14,
    hr: 1.06,
    doubleTriple: 1.07,
    single: 1.12,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↗" }, { speed: 4, dir: "↗" }, { speed: 3, dir: "↗" }],
    tempHours: [81, 79, 77],
    humidity: 84,
    pressure: 1018,
    icons: ["↗", "↗", "↗", "☀️", "H"],
    isClosed: false
  },
  {
    game: "LAD @ CHC",
    venue: "Wrigley Field",
    time: "2:20",
    runs: 1.05,
    hr: 1.21,
    doubleTriple: 0.94,
    single: 0.97,
    receptive: "Extreme",
    windHours: [{ speed: 7, dir: "↑" }, { speed: 7, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [86, 86, 86],
    humidity: 56,
    pressure: 1016,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "MIN @ KC",
    venue: "Kauffman Stadium",
    time: "7:40",
    runs: 1.05,
    hr: 1.19,
    doubleTriple: 1.02,
    single: 0.97,
    receptive: "High",
    windHours: [{ speed: 8, dir: "↙" }, { speed: 8, dir: "↙" }, { speed: 9, dir: "↙" }],
    tempHours: [82, 82, 79],
    humidity: 64,
    pressure: 1011,
    icons: ["↙", "↙", "↙", "~", "☀️"],
    isClosed: false
  },
  {
    game: "NYM @ CLE",
    venue: "Progressive Field",
    time: "6:40",
    runs: 1.02,
    hr: 0.98,
    doubleTriple: 1.03,
    single: 0.99,
    receptive: "High",
    windHours: [{ speed: 4, dir: "↓" }, { speed: 4, dir: "↓" }, { speed: 2, dir: "↙" }],
    tempHours: [79, 77, 75],
    humidity: 62,
    pressure: 1016,
    icons: ["↓", "↓", "↙", "☀️"],
    isClosed: false
  },
  {
    game: "SD @ ARI",
    venue: "Chase Field",
    time: "9:40",
    runs: 1.01,
    hr: 0.91,
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
    game: "STL @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 0.98,
    hr: 1.13,
    doubleTriple: 0.91,
    single: 0.92,
    receptive: "High",
    windHours: [{ speed: 6, dir: "←" }, { speed: 6, dir: "←" }, { speed: 6, dir: "←" }],
    tempHours: [79, 79, 77],
    humidity: 72,
    pressure: 1019,
    icons: ["←", "←", "←", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "TOR @ HOU",
    venue: "Daikin Park",
    time: "2:10",
    runs: 0.96,
    hr: 1.06,
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
    game: "MIA @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 0.95,
    hr: 1.04,
    doubleTriple: 0.94,
    single: 0.96,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "↖" }, { speed: 4, dir: "↖" }, { speed: 3, dir: "↖" }],
    tempHours: [88, 84, 82],
    humidity: 46,
    pressure: 1017,
    icons: ["↖", "↖", "↖", "☀️"],
    isClosed: false
  },
  {
    game: "PIT @ MIL",
    venue: "American Family Fld",
    time: "7:40",
    runs: 0.95,
    hr: 1.06,
    doubleTriple: 0.86,
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
    game: "SF @ TEX",
    venue: "Globe Life Field",
    time: "2:35",
    runs: 0.92,
    hr: 0.88,
    doubleTriple: 0.93,
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
    game: "DET @ SEA",
    venue: "T-Mobile Park",
    time: "9:40",
    runs: 0.88,
    hr: 0.97,
    doubleTriple: 0.83,
    single: 0.91,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 6, dir: "↘" }, { speed: 6, dir: "↘" }],
    tempHours: [84, 81, 73],
    humidity: 24,
    pressure: 1010,
    icons: ["↘", "↘", "↘", "~", "💥", "H", "P"],
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
