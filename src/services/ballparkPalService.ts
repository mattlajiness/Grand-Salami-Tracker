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
    game: "PIT @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.29,
    hr: 1.39,
    doubleTriple: 1.20,
    single: 1.06,
    receptive: "Very High",
    windHours: [{ speed: 16, dir: "↑" }, { speed: 15, dir: "↑" }, { speed: 13, dir: "↑" }],
    tempHours: [90, 82, 75],
    humidity: 22,
    pressure: 1006,
    icons: ["↑", "↑", "↑", "≈", "🔴", "H", "P"],
    isClosed: false
  },
  {
    game: "TOR @ BOS",
    venue: "Fenway Park",
    time: "6:45",
    runs: 1.14,
    hr: 0.98,
    doubleTriple: 1.24,
    single: 1.08,
    receptive: "High",
    windHours: [{ speed: 13, dir: "↘" }, { speed: 10, dir: "↘" }, { speed: 8, dir: "↘" }],
    tempHours: [73, 72, 66],
    humidity: 41,
    pressure: 1009,
    icons: ["↘", "↘", "↘", "≈", "P"],
    isClosed: false
  },
  {
    game: "MIA @ PHI",
    venue: "Citizens Bank Park",
    time: "1:05",
    runs: 1.07,
    hr: 1.32,
    doubleTriple: 0.91,
    single: 0.95,
    receptive: "Very High",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 10, dir: "↗" }, { speed: 12, dir: "↗" }],
    tempHours: [86, 86, 86],
    humidity: 49,
    pressure: 1008,
    icons: ["↗", "↗", "↗", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "KC @ WAS",
    venue: "Nationals Park",
    time: "1:05",
    runs: 1.07,
    hr: 1.07,
    doubleTriple: 1.08,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "↗" }, { speed: 7, dir: "↗" }, { speed: 8, dir: "↗" }],
    tempHours: [90, 90, 90],
    humidity: 32,
    pressure: 1008,
    icons: ["↗", "↗", "↗", "~", "🔴", "P"],
    isClosed: false
  },
  {
    game: "NYM @ CIN",
    venue: "Great American BP",
    time: "12:40",
    runs: 1.04,
    hr: 1.10,
    doubleTriple: 0.91,
    single: 1.00,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "←" }, { speed: 11, dir: "←" }, { speed: 13, dir: "←" }],
    tempHours: [81, 82, 84],
    humidity: 48,
    pressure: 1006,
    icons: ["←", "←", "←", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "LAA @ ARI",
    venue: "Chase Field",
    time: "3:40",
    runs: 1.01,
    hr: 0.93,
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
    game: "SD @ STL",
    venue: "Busch Stadium",
    time: "2:15",
    runs: 1.00,
    hr: 1.03,
    doubleTriple: 1.02,
    single: 1.02,
    receptive: "Med-High",
    windHours: [{ speed: 22, dir: "↖" }, { speed: 22, dir: "↖" }, { speed: 22, dir: "↖" }],
    tempHours: [93, 95, 97],
    humidity: 46,
    pressure: 997,
    icons: ["↖", "↖", "↖", "≈", "🔴", "P"],
    isClosed: false
  },
  {
    game: "TB @ LAD",
    venue: "Dodger Stadium",
    time: "3:10",
    runs: 1.00,
    hr: 1.20,
    doubleTriple: 0.95,
    single: 0.94,
    receptive: "Consistent",
    windHours: [{ speed: 8, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 10, dir: "↑" }],
    tempHours: [72, 73, 79],
    humidity: 70,
    pressure: 1012,
    icons: ["↑", "↑", "↑", "~"],
    isClosed: false
  },
  {
    game: "SF @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 1.00,
    hr: 1.03,
    doubleTriple: 0.97,
    single: 1.01,
    receptive: "Medium",
    windHours: [{ speed: 10, dir: "↙" }, { speed: 9, dir: "↙" }, { speed: 8, dir: "↙" }],
    tempHours: [79, 75, 75],
    humidity: 77,
    pressure: 1011,
    icons: ["↙", "↙", "↙", "~", "☀️", "H"],
    isClosed: false
  },
  {
    game: "COL @ CHC",
    venue: "Wrigley Field",
    time: "8:05",
    runs: 0.98,
    hr: 1.23,
    doubleTriple: 0.88,
    single: 0.90,
    receptive: "Extreme",
    windHours: [{ speed: 13, dir: "↑" }, { speed: 12, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [67, 66, 66],
    humidity: 96,
    pressure: 992,
    icons: ["↑", "↑", "↑", "≈", "H", "P"],
    isClosed: false
  },
  {
    game: "CLE @ MIL",
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
    game: "DET @ HOU",
    venue: "Daikin Park",
    time: "2:10",
    runs: 0.94,
    hr: 1.03,
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
    game: "CHW @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 0.92,
    hr: 1.09,
    doubleTriple: 0.82,
    single: 0.90,
    receptive: "High",
    windHours: [{ speed: 11, dir: "←" }, { speed: 8, dir: "←" }, { speed: 7, dir: "↙" }],
    tempHours: [73, 72, 72],
    humidity: 66,
    pressure: 1007,
    icons: ["←", "←", "↙", "~", "P"],
    isClosed: false
  },
  {
    game: "BAL @ SEA",
    venue: "T-Mobile Park",
    time: "9:40",
    runs: 0.84,
    hr: 0.95,
    doubleTriple: 0.79,
    single: 0.90,
    receptive: "Medium",
    windHours: [{ speed: 7, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 6, dir: "↘" }],
    tempHours: [72, 70, 64],
    humidity: 39,
    pressure: 1016,
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
