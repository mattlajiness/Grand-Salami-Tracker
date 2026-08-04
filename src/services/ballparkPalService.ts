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
    time: "8:40",
    runs: 1.29,
    hr: 1.20,
    doubleTriple: 1.18,
    single: 1.18,
    receptive: "Low",
    windHours: [{ speed: 11, dir: "←" }, { speed: 14, dir: "↖" }, { speed: 11, dir: "↑" }],
    tempHours: [88, 86, 84],
    humidity: 23,
    pressure: 1007,
    icons: ["←", "↖", "↑", "≈", "💥", "H", "P"],
    isClosed: false
  },
  {
    game: "CHW @ BOS",
    venue: "Fenway Park",
    time: "7:10",
    runs: 1.15,
    hr: 1.01,
    doubleTriple: 1.27,
    single: 1.08,
    receptive: "High",
    windHours: [{ speed: 8, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [77, 73, 72],
    humidity: 55,
    pressure: 1018,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "ATH @ CIN",
    venue: "Great American BP",
    time: "6:40",
    runs: 1.13,
    hr: 1.23,
    doubleTriple: 1.03,
    single: 0.99,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "→" }, { speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [84, 82, 77],
    humidity: 50,
    pressure: 1015,
    icons: ["→", "↗", "↗", "~", "☀️"],
    isClosed: false
  },
  {
    game: "MIN @ KC",
    venue: "Kauffman Stadium",
    time: "7:40",
    runs: 1.08,
    hr: 1.22,
    doubleTriple: 1.06,
    single: 0.97,
    receptive: "High",
    windHours: [{ speed: 8, dir: "↖" }, { speed: 7, dir: "←" }, { speed: 7, dir: "←" }],
    tempHours: [90, 86, 82],
    humidity: 48,
    pressure: 1011,
    icons: ["↖", "←", "←", "~", "💥"],
    isClosed: false
  },
  {
    game: "LAA @ BAL",
    venue: "Oriole Park",
    time: "6:35",
    runs: 1.08,
    hr: 0.93,
    doubleTriple: 1.15,
    single: 1.08,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "↙" }, { speed: 5, dir: "←" }, { speed: 6, dir: "↖" }],
    tempHours: [86, 84, 81],
    humidity: 46,
    pressure: 1017,
    icons: ["↙", "←", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "LAD @ CHC",
    venue: "Wrigley Field",
    time: "8:05",
    runs: 1.07,
    hr: 1.25,
    doubleTriple: 0.95,
    single: 0.96,
    receptive: "Extreme",
    windHours: [{ speed: 7, dir: "↑" }, { speed: 6, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [81, 79, 77],
    humidity: 57,
    pressure: 1014,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "PIT @ MIL",
    venue: "American Family Fld",
    time: "7:40",
    runs: 1.03,
    hr: 1.20,
    doubleTriple: 0.95,
    single: 0.91,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "←" }, { speed: 6, dir: "←" }, { speed: 6, dir: "↙" }],
    tempHours: [79, 79, 75],
    humidity: 71,
    pressure: 1014,
    icons: ["←", "←", "↙", "~", "☀️"],
    isClosed: false
  },
  {
    game: "WAS @ PHI",
    venue: "Citizens Bank Park",
    time: "6:40",
    runs: 1.01,
    hr: 1.12,
    doubleTriple: 0.96,
    single: 0.95,
    receptive: "Very High",
    windHours: [{ speed: 7, dir: "↙" }, { speed: 7, dir: "←" }, { speed: 6, dir: "↖" }],
    tempHours: [88, 84, 79],
    humidity: 31,
    pressure: 1017,
    icons: ["↙", "←", "↖", "~", "☀️"],
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
    game: "MIA @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 0.97,
    hr: 1.03,
    doubleTriple: 0.95,
    single: 0.98,
    receptive: "Medium",
    windHours: [{ speed: 3, dir: "↙" }, { speed: 2, dir: "↓" }, { speed: 2, dir: "↓" }],
    tempHours: [84, 82, 81],
    humidity: 53,
    pressure: 1013,
    icons: ["↙", "↓", "↓", "☀️"],
    isClosed: false
  },
  {
    game: "TOR @ HOU",
    venue: "Daikin Park",
    time: "8:10",
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
    game: "STL @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 0.96,
    hr: 1.00,
    doubleTriple: 0.83,
    single: 1.00,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↙" }, { speed: 6, dir: "↙" }, { speed: 5, dir: "↙" }],
    tempHours: [82, 79, 79],
    humidity: 39,
    pressure: 1018,
    icons: ["↙", "↙", "↙", "~", "☀️"],
    isClosed: false
  },
  {
    game: "NYM @ CLE",
    venue: "Progressive Field",
    time: "6:40",
    runs: 0.95,
    hr: 0.86,
    doubleTriple: 1.04,
    single: 0.97,
    receptive: "High",
    windHours: [{ speed: 6, dir: "↓" }, { speed: 6, dir: "↓" }, { speed: 6, dir: "↓" }],
    tempHours: [77, 75, 73],
    humidity: 48,
    pressure: 1016,
    icons: ["↓", "↓", "↓", "~", "☀️"],
    isClosed: false
  },
  {
    game: "SF @ TEX",
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
  },
  {
    game: "DET @ SEA",
    venue: "T-Mobile Park",
    time: "9:40",
    runs: 0.87,
    hr: 0.95,
    doubleTriple: 0.81,
    single: 0.92,
    receptive: "Medium",
    windHours: [{ speed: 8, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 6, dir: "↘" }],
    tempHours: [81, 77, 72],
    humidity: 31,
    pressure: 1013,
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
