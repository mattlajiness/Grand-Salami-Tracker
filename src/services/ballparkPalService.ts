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
    game: "SEA @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.21,
    hr: 1.31,
    doubleTriple: 1.15,
    single: 1.02,
    receptive: "Very High",
    windHours: [{ speed: 14, dir: "↑" }, { speed: 12, dir: "↑" }, { speed: 11, dir: "↑" }],
    tempHours: [82, 77, 72],
    humidity: 33,
    pressure: 1008,
    icons: ["↑", "↑", "↑", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "KC @ BOS",
    venue: "Fenway Park",
    time: "7:10",
    runs: 1.05,
    hr: 0.87,
    doubleTriple: 1.21,
    single: 1.05,
    receptive: "High",
    windHours: [{ speed: 4, dir: "↘" }, { speed: 2, dir: "↘" }, { speed: 2, dir: "↘" }],
    tempHours: [70, 66, 66],
    humidity: 40,
    pressure: 1015,
    icons: ["↘", "↘", "↘"],
    isClosed: false
  },
  {
    game: "CLE @ MIN",
    venue: "Target Field",
    time: "8:10",
    runs: 1.05,
    hr: 0.99,
    doubleTriple: 1.08,
    single: 1.02,
    receptive: "Medium",
    windHours: [{ speed: 14, dir: "←" }, { speed: 16, dir: "←" }, { speed: 15, dir: "↙" }],
    tempHours: [82, 81, 79],
    humidity: 39,
    pressure: 1004,
    icons: ["←", "←", "↙", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "LAA @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.04,
    hr: 1.12,
    doubleTriple: 1.02,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 2, dir: "↙" }, { speed: 3, dir: "↖" }, { speed: 4, dir: "↙" }],
    tempHours: [81, 77, 73],
    humidity: 59,
    pressure: 1015,
    icons: ["↙", "↖", "↙", "☀️"],
    isClosed: false
  },
  {
    game: "CHW @ STL",
    venue: "Busch Stadium",
    time: "8:15",
    runs: 1.02,
    hr: 1.01,
    doubleTriple: 0.98,
    single: 1.07,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "←" }, { speed: 4, dir: "↖" }, { speed: 4, dir: "↖" }],
    tempHours: [75, 73, 73],
    humidity: 75,
    pressure: 1012,
    icons: ["←", "↖", "↖", "H"],
    isClosed: false
  },
  {
    game: "TEX @ ARI",
    venue: "Chase Field",
    time: "9:40",
    runs: 1.00,
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
    game: "SD @ SF",
    venue: "Oracle Park",
    time: "10:15",
    runs: 0.98,
    hr: 0.77,
    doubleTriple: 1.09,
    single: 1.08,
    receptive: "Consistent",
    windHours: [{ speed: 14, dir: "↑" }, { speed: 14, dir: "↑" }, { speed: 14, dir: "↑" }],
    tempHours: [63, 63, 61],
    humidity: 72,
    pressure: 1012,
    icons: ["↑", "↑", "↖", "≈"],
    isClosed: false
  },
  {
    game: "PHI @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 0.97,
    hr: 1.03,
    doubleTriple: 0.96,
    single: 0.98,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "↙" }, { speed: 5, dir: "↙" }, { speed: 3, dir: "↙" }],
    tempHours: [86, 84, 84],
    humidity: 46,
    pressure: 1013,
    icons: ["↙", "↙", "↙", "☀️"],
    isClosed: false
  },
  {
    game: "LAD @ MIA",
    venue: "LoanDepot Park",
    time: "7:10",
    runs: 0.95,
    hr: 0.87,
    doubleTriple: 1.03,
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
    game: "COL @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 0.95,
    hr: 0.84,
    doubleTriple: 1.01,
    single: 1.04,
    receptive: "High",
    windHours: [{ speed: 8, dir: "↓" }, { speed: 7, dir: "↓" }, { speed: 6, dir: "↓" }],
    tempHours: [73, 70, 68],
    humidity: 54,
    pressure: 1016,
    icons: ["↓", "↓", "↘", "〜"],
    isClosed: false
  },
  {
    game: "NYM @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 0.94,
    hr: 1.00,
    doubleTriple: 0.86,
    single: 0.97,
    receptive: "High",
    windHours: [{ speed: 9, dir: "→" }, { speed: 9, dir: "↘" }, { speed: 7, dir: "↘" }],
    tempHours: [79, 77, 77],
    humidity: 30,
    pressure: 1016,
    icons: ["→", "↘", "↘", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "HOU @ TB",
    venue: "Tropicana Field",
    time: "7:10",
    runs: 0.94,
    hr: 0.97,
    doubleTriple: 0.93,
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
    game: "CIN @ MIL",
    venue: "American Family Fld",
    time: "7:45",
    runs: 0.94,
    hr: 1.00,
    doubleTriple: 0.96,
    single: 0.89,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↙" }, { speed: 7, dir: "↙" }, { speed: 7, dir: "↙" }],
    tempHours: [70, 68, 66],
    humidity: 63,
    pressure: 1013,
    icons: ["↓", "↙", "↙", "〜"],
    isClosed: false
  },
  {
    game: "BAL @ TOR",
    venue: "Rogers Centre",
    time: "7:07",
    runs: 0.92,
    hr: 1.00,
    doubleTriple: 0.95,
    single: 0.95,
    receptive: "Minimal",
    windHours: [{ speed: 3, dir: "↖" }, { speed: 3, dir: "↖" }, { speed: 2, dir: "↖" }],
    tempHours: [70, 68, 66],
    humidity: 43,
    pressure: 1016,
    icons: ["↖", "↖", "↖"],
    isClosed: false
  },
  {
    game: "PIT @ CHC",
    venue: "Wrigley Field",
    time: "2:20",
    runs: 0.90,
    hr: 0.93,
    doubleTriple: 0.88,
    single: 0.97,
    receptive: "Extreme",
    windHours: [{ speed: 9, dir: "↙" }, { speed: 9, dir: "↙" }, { speed: 10, dir: "↙" }],
    tempHours: [72, 73, 73],
    humidity: 46,
    pressure: 1016,
    icons: ["↙", "↙", "↙", "〜"],
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
