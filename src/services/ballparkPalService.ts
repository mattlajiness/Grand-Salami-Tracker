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
    game: "MIL @ COL",
    venue: "Coors Field",
    time: "8:40",
    runs: 1.31,
    hr: 1.27,
    doubleTriple: 1.19,
    single: 1.17,
    receptive: "Low",
    windHours: [{ speed: 16, dir: "↗" }, { speed: 12, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [82, 81, 79],
    humidity: 24,
    pressure: 1005,
    icons: ["↗", "↗", "↗", "≈", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "SF @ CHC",
    venue: "Wrigley Field",
    time: "2:20",
    runs: 1.13,
    hr: 1.31,
    doubleTriple: 0.99,
    single: 0.98,
    receptive: "Extreme",
    windHours: [{ speed: 12, dir: "↗" }, { speed: 11, dir: "↗" }, { speed: 11, dir: "↗" }],
    tempHours: [72, 72, 73],
    humidity: 71,
    pressure: 1012,
    icons: ["↗", "↗", "↗", "≈"],
    isClosed: false
  },
  {
    game: "CHW @ PHI",
    venue: "Citizens Bank Park",
    time: "6:40",
    runs: 1.10,
    hr: 1.23,
    doubleTriple: 0.98,
    single: 1.00,
    receptive: "Very High",
    windHours: [{ speed: 9, dir: "→" }, { speed: 7, dir: "→" }, { speed: 6, dir: "→" }],
    tempHours: [88, 84, 81],
    humidity: 35,
    pressure: 1014,
    icons: ["→", "→", "→", "~", "☀️"],
    isClosed: false
  },
  {
    game: "KC @ MIN",
    venue: "Target Field",
    time: "8:15",
    runs: 1.07,
    hr: 1.00,
    doubleTriple: 1.08,
    single: 1.04,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "↗" }, { speed: 5, dir: "→" }, { speed: 6, dir: "↘" }],
    tempHours: [79, 77, 75],
    humidity: 52,
    pressure: 1005,
    icons: ["↗", "→", "↘", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "BAL @ TOR",
    venue: "Rogers Centre",
    time: "7:07",
    runs: 1.05,
    hr: 1.23,
    doubleTriple: 0.91,
    single: 1.01,
    receptive: "Minimal",
    windHours: [{ speed: 12, dir: "↗" }, { speed: 11, dir: "→" }, { speed: 10, dir: "→" }],
    tempHours: [73, 72, 68],
    humidity: 59,
    pressure: 1011,
    icons: ["↗", "→", "→", "≈"],
    isClosed: false
  },
  {
    game: "BOS @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 1.02,
    hr: 1.12,
    doubleTriple: 0.88,
    single: 0.99,
    receptive: "High",
    windHours: [{ speed: 9, dir: "↖" }, { speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }],
    tempHours: [84, 82, 81],
    humidity: 37,
    pressure: 1013,
    icons: ["↖", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "WAS @ ARI",
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
    game: "CIN @ STL",
    venue: "Busch Stadium",
    time: "8:15",
    runs: 0.99,
    hr: 1.06,
    doubleTriple: 1.02,
    single: 0.99,
    receptive: "Med-High",
    windHours: [{ speed: 12, dir: "↖" }, { speed: 12, dir: "↖" }, { speed: 12, dir: "↖" }],
    tempHours: [79, 77, 77],
    humidity: 68,
    pressure: 1012,
    icons: ["↖", "↖", "↖", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "LAA @ LAD",
    venue: "Dodger Stadium",
    time: "10:10",
    runs: 0.98,
    hr: 1.21,
    doubleTriple: 0.92,
    single: 0.93,
    receptive: "Consistent",
    windHours: [{ speed: 8, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 6, dir: "↖" }],
    tempHours: [73, 72, 70],
    humidity: 53,
    pressure: 1009,
    icons: ["↑", "↑", "↖", "~", "P"],
    isClosed: false
  },
  {
    game: "SEA @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 0.97,
    hr: 0.91,
    doubleTriple: 0.93,
    single: 1.08,
    receptive: "High",
    windHours: [{ speed: 16, dir: "↖" }, { speed: 14, dir: "↖" }, { speed: 14, dir: "↖" }],
    tempHours: [82, 81, 77],
    humidity: 42,
    pressure: 1011,
    icons: ["↖", "↖", "↖", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "PIT @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 0.97,
    hr: 0.96,
    doubleTriple: 0.99,
    single: 1.00,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "↙" }, { speed: 4, dir: "↙" }, { speed: 3, dir: "↙" }],
    tempHours: [84, 81, 79],
    humidity: 31,
    pressure: 1017,
    icons: ["↙", "↙", "↙", "☀️"],
    isClosed: false
  },
  {
    game: "TB @ MIA",
    venue: "LoanDepot Park",
    time: "7:10",
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
    game: "ATH @ HOU",
    venue: "Daikin Park",
    time: "8:10",
    runs: 0.95,
    hr: 1.04,
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
    game: "CLE @ TEX",
    venue: "Globe Life Field",
    time: "8:15",
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
    game: "NYM @ SD",
    venue: "Petco Park",
    time: "9:40",
    runs: 0.91,
    hr: 0.99,
    doubleTriple: 0.84,
    single: 0.94,
    receptive: "Low",
    windHours: [{ speed: 8, dir: "↗" }, { speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [68, 68, 66],
    humidity: 70,
    pressure: 1010,
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
