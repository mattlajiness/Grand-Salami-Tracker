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
    game: "KC @ COL",
    venue: "Coors Field",
    time: "3:10",
    runs: 1.28,
    hr: 1.33,
    doubleTriple: 1.23,
    single: 1.09,
    receptive: "Low",
    windHours: [{ speed: 2, dir: "←" }, { speed: 4, dir: "↖" }, { speed: 4, dir: "↖" }],
    tempHours: [100, 100, 102],
    humidity: 6,
    pressure: 1005,
    icons: ["←", "↖", "↖", "≈", "💥", "H", "P"],
    isClosed: false
  },
  {
    game: "DET @ ATH",
    venue: "Sutter Health Park",
    time: "4:05",
    runs: 1.28,
    hr: 1.37,
    doubleTriple: 1.18,
    single: 1.06,
    receptive: "Very High",
    windHours: [{ speed: 1, dir: "↑" }, { speed: 2, dir: "↑" }, { speed: 4, dir: "↑" }],
    tempHours: [106, 109, 106],
    humidity: 21,
    pressure: 1008,
    icons: ["↑", "↑", "↑", "≈", "💥", "H", "P"],
    isClosed: false
  },
  {
    game: "PIT @ CIN",
    venue: "Great American BP",
    time: "1:40",
    runs: 1.10,
    hr: 1.19,
    doubleTriple: 1.04,
    single: 0.97,
    receptive: "Low",
    windHours: [{ speed: 3, dir: "↙" }, { speed: 2, dir: "↙" }, { speed: 4, dir: "↙" }],
    tempHours: [77, 75, 72],
    humidity: 75,
    pressure: 1007,
    icons: ["↙", "↙", "↙", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "PHI @ BAL",
    venue: "Oriole Park",
    time: "1:35",
    runs: 1.08,
    hr: 0.99,
    doubleTriple: 1.10,
    single: 1.08,
    receptive: "Med-High",
    windHours: [{ speed: 11, dir: "↖" }, { speed: 9, dir: "↖" }, { speed: 7, dir: "↖" }],
    tempHours: [88, 91, 91],
    humidity: 50,
    pressure: 1012,
    icons: ["↖", "↖", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "ARI @ CLE",
    venue: "Progressive Field",
    time: "1:40",
    runs: 1.06,
    hr: 1.09,
    doubleTriple: 1.03,
    single: 0.99,
    receptive: "High",
    windHours: [{ speed: 1, dir: "↑" }, { speed: 2, dir: "↓" }, { speed: 8, dir: "↙" }],
    tempHours: [79, 77, 73],
    humidity: 83,
    pressure: 1008,
    icons: ["↑", "↓", "↙", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "WAS @ ATL",
    venue: "Truist Park",
    time: "1:35",
    runs: 1.02,
    hr: 1.06,
    doubleTriple: 1.01,
    single: 1.00,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "↙" }, { speed: 6, dir: "↙" }, { speed: 7, dir: "↙" }],
    tempHours: [86, 90, 90],
    humidity: 68,
    pressure: 1008,
    icons: ["↙", "↙", "↙", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "STL @ TOR",
    venue: "Rogers Centre",
    time: "1:37",
    runs: 1.01,
    hr: 1.11,
    doubleTriple: 0.90,
    single: 1.03,
    receptive: "Minimal",
    windHours: [{ speed: 6, dir: "↙" }, { speed: 6, dir: "↙" }, { speed: 6, dir: "↙" }],
    tempHours: [72, 72, 72],
    humidity: 95,
    pressure: 1011,
    icons: ["↙", "↙", "↙", "~", "H"],
    isClosed: false
  },
  {
    game: "BOS @ LAD",
    venue: "Dodger Stadium",
    time: "7:20",
    runs: 0.98,
    hr: 1.19,
    doubleTriple: 0.94,
    single: 0.93,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 9, dir: "↗" }, { speed: 8, dir: "↗" }],
    tempHours: [87, 86, 84],
    humidity: 27,
    pressure: 1008,
    icons: ["↗", "↗", "↗", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "MIL @ LAA",
    venue: "Angel Stadium",
    time: "3:15",
    runs: 0.98,
    hr: 1.00,
    doubleTriple: 0.92,
    single: 1.01,
    receptive: "Consistent",
    windHours: [{ speed: 7, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 10, dir: "↑" }],
    tempHours: [73, 84, 90],
    humidity: 78,
    pressure: 1010,
    icons: ["↑", "↑", "↑", "~", "H", "P"],
    isClosed: false
  },
  {
    game: "MIA @ NYM",
    venue: "Citi Field",
    time: "1:40",
    runs: 0.97,
    hr: 1.14,
    doubleTriple: 0.86,
    single: 0.90,
    receptive: "Low",
    windHours: [{ speed: 13, dir: "↖" }, { speed: 14, dir: "↖" }, { speed: 14, dir: "↖" }],
    tempHours: [90, 90, 88],
    humidity: 64,
    pressure: 1015,
    icons: ["↖", "↖", "↖", "≈", "💥"],
    isClosed: false
  },
  {
    game: "SF @ SD",
    venue: "Petco Park",
    time: "4:10",
    runs: 0.96,
    hr: 1.06,
    doubleTriple: 0.83,
    single: 0.98,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 8, dir: "↗" }, { speed: 8, dir: "↗" }],
    tempHours: [84, 84, 81],
    humidity: 62,
    pressure: 1010,
    icons: ["↗", "↗", "↗", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "TEX @ HOU",
    venue: "Daikin Park",
    time: "2:10",
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
    game: "CHW @ TB",
    venue: "Tropicana Field",
    time: "1:40",
    runs: 0.94,
    hr: 0.97,
    doubleTriple: 0.94,
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
    game: "MIN @ SEA",
    venue: "T-Mobile Park",
    time: "4:10",
    runs: 0.91,
    hr: 0.98,
    doubleTriple: 0.88,
    single: 0.92,
    receptive: "Medium",
    windHours: [{ speed: 1, dir: "↖" }, { speed: 2, dir: "→" }, { speed: 6, dir: "↘" }],
    tempHours: [70, 66, 70],
    humidity: 63,
    pressure: 1021,
    icons: ["↖", "→", "↘", "P"],
    isClosed: false
  },
  {
    game: "NYY @ CHC",
    venue: "Wrigley Field",
    time: "2:20",
    runs: 0.78,
    hr: 0.81,
    doubleTriple: 0.84,
    single: 0.90,
    receptive: "Extreme",
    windHours: [{ speed: 14, dir: "↓" }, { speed: 14, dir: "↓" }, { speed: 14, dir: "↓" }],
    tempHours: [73, 72, 73],
    humidity: 89,
    pressure: 1011,
    icons: ["↓", "↓", "↓", "≈", "H"],
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
