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
    time: "3:10",
    runs: 1.31,
    hr: 1.21,
    doubleTriple: 1.35,
    single: 1.11,
    receptive: "Low",
    windHours: [{ speed: 8, dir: "←" }, { speed: 7, dir: "↙" }, { speed: 11, dir: "↘" }],
    tempHours: [90, 90, 90],
    humidity: 9,
    pressure: 998,
    icons: ["←", "↙", "↘", "~", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "SF @ CHC",
    venue: "Wrigley Field",
    time: "8:30",
    runs: 0.91,
    hr: 0.96,
    doubleTriple: 0.87,
    single: 0.97,
    receptive: "Extreme",
    windHours: [{ speed: 8, dir: "↙" }, { speed: 7, dir: "↙" }, { speed: 9, dir: "↙" }],
    tempHours: [70, 70, 70],
    humidity: 79,
    pressure: 1013,
    icons: ["↙", "↙", "↙", "~", "H"],
    isClosed: false
  },
  {
    game: "CHW @ PHI",
    venue: "Citizens Bank Park",
    time: "1:35",
    runs: 1.11,
    hr: 1.24,
    doubleTriple: 0.94,
    single: 1.03,
    receptive: "Very High",
    windHours: [{ speed: 12, dir: "↘" }, { speed: 14, dir: "↘" }, { speed: 11, dir: "↘" }],
    tempHours: [90, 90, 88],
    humidity: 41,
    pressure: 1010,
    icons: ["↘", "↘", "↘", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "KC @ MIN",
    venue: "Target Field",
    time: "2:10",
    runs: 1.02,
    hr: 0.95,
    doubleTriple: 0.96,
    single: 1.07,
    receptive: "Medium",
    windHours: [{ speed: 13, dir: "↙" }, { speed: 14, dir: "↙" }, { speed: 13, dir: "↙" }],
    tempHours: [82, 84, 82],
    humidity: 53,
    pressure: 1010,
    icons: ["↙", "↙", "↙", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "BAL @ TOR",
    venue: "Rogers Centre",
    time: "1:37",
    runs: 0.99,
    hr: 1.04,
    doubleTriple: 1.04,
    single: 0.96,
    receptive: "Minimal",
    windHours: [{ speed: 6, dir: "↓" }, { speed: 4, dir: "↓" }, { speed: 3, dir: "↙" }],
    tempHours: [73, 73, 73],
    humidity: 59,
    pressure: 1015,
    icons: ["↓", "↓", "↙", "~"],
    isClosed: false
  },
  {
    game: "BOS @ NYY",
    venue: "Yankee Stadium",
    time: "1:35",
    runs: 1.01,
    hr: 1.16,
    doubleTriple: 0.85,
    single: 0.97,
    receptive: "High",
    windHours: [{ speed: 17, dir: "↗" }, { speed: 18, dir: "↗" }, { speed: 17, dir: "↗" }],
    tempHours: [82, 84, 84],
    humidity: 45,
    pressure: 1008,
    icons: ["↗", "↗", "↗", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "WAS @ ARI",
    venue: "Chase Field",
    time: "3:15",
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
    runs: 0.98,
    hr: 0.99,
    doubleTriple: 0.91,
    single: 1.08,
    receptive: "Med-High",
    windHours: [{ speed: 12, dir: "←" }, { speed: 12, dir: "←" }, { speed: 12, dir: "↖" }],
    tempHours: [84, 84, 84],
    humidity: 51,
    pressure: 1011,
    icons: ["←", "←", "↖", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "LAA @ LAD",
    venue: "Dodger Stadium",
    time: "4:10",
    runs: 0.99,
    hr: 1.19,
    doubleTriple: 0.95,
    single: 0.93,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 10, dir: "↑" }, { speed: 11, dir: "↑" }],
    tempHours: [75, 77, 77],
    humidity: 40,
    pressure: 1009,
    icons: ["↑", "↑", "↑", "≈", "P"],
    isClosed: false
  },
  {
    game: "SEA @ DET",
    venue: "Comerica Park",
    time: "1:40",
    runs: 0.97,
    hr: 0.97,
    doubleTriple: 0.96,
    single: 1.03,
    receptive: "High",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 9, dir: "↗" }, { speed: 11, dir: "→" }],
    tempHours: [84, 82, 82],
    humidity: 41,
    pressure: 1016,
    icons: ["↗", "↗", "→", "~", "☀️"],
    isClosed: false
  },
  {
    game: "PIT @ ATL",
    venue: "Truist Park",
    time: "1:35",
    runs: 0.99,
    hr: 1.05,
    doubleTriple: 0.92,
    single: 1.01,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "←" }, { speed: 8, dir: "←" }, { speed: 7, dir: "←" }],
    tempHours: [86, 88, 88],
    humidity: 54,
    pressure: 1017,
    icons: ["←", "←", "←", "~", "☀️"],
    isClosed: false
  },
  {
    game: "TB @ MIA",
    venue: "LoanDepot Park",
    time: "1:40",
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
    time: "2:10",
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
    time: "2:35",
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
    time: "4:10",
    runs: 0.89,
    hr: 0.98,
    doubleTriple: 0.78,
    single: 0.95,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 9, dir: "↗" }, { speed: 9, dir: "↗" }],
    tempHours: [68, 68, 68],
    humidity: 60,
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
