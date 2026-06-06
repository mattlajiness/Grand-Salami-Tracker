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
    time: "9:10",
    runs: 1.29,
    hr: 1.21,
    doubleTriple: 1.22,
    single: 1.15,
    receptive: "Low",
    windHours: [{ speed: 16, dir: "↗" }, { speed: 12, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [75, 73, 72],
    humidity: 34,
    pressure: 1002,
    icons: ["↗", "↗", "↗", "≈", "P"],
    isClosed: false
  },
  {
    game: "SF @ CHC",
    venue: "Wrigley Field",
    time: "2:20",
    runs: 0.85,
    hr: 0.89,
    doubleTriple: 0.84,
    single: 0.95,
    receptive: "Extreme",
    windHours: [{ speed: 7, dir: "↓" }, { speed: 8, dir: "↙" }, { speed: 9, dir: "↙" }],
    tempHours: [74, 75, 75],
    humidity: 91,
    pressure: 1010,
    icons: ["↓", "↙", "↙", "~", "H", "P"],
    isClosed: false
  },
  {
    game: "CHW @ PHI",
    venue: "Citizens Bank Park",
    time: "4:05",
    runs: 1.12,
    hr: 1.29,
    doubleTriple: 0.95,
    single: 1.01,
    receptive: "Very High",
    windHours: [{ speed: 15, dir: "↗" }, { speed: 13, dir: "↗" }, { speed: 12, dir: "↗" }],
    tempHours: [90, 88, 88],
    humidity: 34,
    pressure: 1010,
    icons: ["↗", "↗", "↗", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "KC @ MIN",
    venue: "Target Field",
    time: "2:10",
    runs: 0.98,
    hr: 0.92,
    doubleTriple: 1.01,
    single: 1.01,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "→" }, { speed: 6, dir: "→" }, { speed: 6, dir: "→" }],
    tempHours: [82, 84, 84],
    humidity: 37,
    pressure: 1011,
    icons: ["→", "→", "→", "~", "☀️"],
    isClosed: false
  },
  {
    game: "BAL @ TOR",
    venue: "Rogers Centre",
    time: "3:07",
    runs: 0.95,
    hr: 1.03,
    doubleTriple: 0.94,
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
    game: "BOS @ NYY",
    venue: "Yankee Stadium",
    time: "7:35",
    runs: 1.02,
    hr: 1.22,
    doubleTriple: 0.92,
    single: 0.92,
    receptive: "High",
    windHours: [{ speed: 14, dir: "↗" }, { speed: 13, dir: "↗" }, { speed: 15, dir: "↗" }],
    tempHours: [84, 81, 73],
    humidity: 45,
    pressure: 1007,
    icons: ["↗", "↗", "↗", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "WAS @ ARI",
    venue: "Chase Field",
    time: "4:10",
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
    time: "2:15",
    runs: 1.00,
    hr: 1.10,
    doubleTriple: 0.95,
    single: 1.02,
    receptive: "Med-High",
    windHours: [{ speed: 10, dir: "↖" }, { speed: 9, dir: "↖" }, { speed: 9, dir: "↖" }],
    tempHours: [84, 84, 82],
    humidity: 54,
    pressure: 1013,
    icons: ["↖", "↖", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "LAA @ LAD",
    venue: "Dodger Stadium",
    time: "10:10",
    runs: 0.96,
    hr: 1.12,
    doubleTriple: 0.97,
    single: 0.92,
    receptive: "Consistent",
    windHours: [{ speed: 7, dir: "↑" }, { speed: 6, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [72, 68, 68],
    humidity: 54,
    pressure: 1009,
    icons: ["↑", "↑", "↑", "~", "P"],
    isClosed: false
  },
  {
    game: "SEA @ DET",
    venue: "Comerica Park",
    time: "1:10",
    runs: 1.07,
    hr: 1.10,
    doubleTriple: 1.01,
    single: 1.07,
    receptive: "High",
    windHours: [{ speed: 12, dir: "↖" }, { speed: 13, dir: "↖" }, { speed: 16, dir: "↖" }],
    tempHours: [81, 82, 84],
    humidity: 62,
    pressure: 1009,
    icons: ["↖", "↖", "↖", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "PIT @ ATL",
    venue: "Truist Park",
    time: "4:10",
    runs: 1.05,
    hr: 1.03,
    doubleTriple: 1.03,
    single: 1.04,
    receptive: "Medium",
    windHours: [{ speed: 7, dir: "←" }, { speed: 7, dir: "←" }, { speed: 7, dir: "←" }],
    tempHours: [93, 91, 90],
    humidity: 31,
    pressure: 1015,
    icons: ["←", "←", "←", "~", "☀️"],
    isClosed: false
  },
  {
    game: "TB @ MIA",
    venue: "LoanDepot Park",
    time: "4:10",
    runs: 0.95,
    hr: 0.88,
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
    time: "4:10",
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
    game: "CLE @ TEX",
    venue: "Globe Life Field",
    time: "7:35",
    runs: 0.92,
    hr: 0.89,
    doubleTriple: 0.91,
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
    time: "10:10",
    runs: 0.91,
    hr: 0.96,
    doubleTriple: 0.82,
    single: 0.97,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [66, 64, 64],
    humidity: 69,
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
