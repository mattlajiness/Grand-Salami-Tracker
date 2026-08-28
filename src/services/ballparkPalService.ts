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
    game: "BAL @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.23,
    hr: 1.28,
    doubleTriple: 1.18,
    single: 1.04,
    receptive: "Very High",
    windHours: [{ speed: 7, dir: "↑" }, { speed: 7, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [83, 81, 78],
    humidity: 23,
    pressure: 1011,
    icons: ["↑", "↑", "↑", "〜", "💥", "H"],
    isClosed: false
  },
  {
    game: "MIA @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.09,
    hr: 1.13,
    doubleTriple: 1.07,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 5, dir: "↙" }, { speed: 5, dir: "↖" }, { speed: 2, dir: "↑" }],
    tempHours: [81, 77, 73],
    humidity: 66,
    pressure: 1015,
    icons: ["↙", "↖", "↑", "☀️"],
    isClosed: false
  },
  {
    game: "TEX @ MIL",
    venue: "American Family Fld",
    time: "7:40",
    runs: 0.99,
    hr: 1.05,
    doubleTriple: 0.95,
    single: 0.94,
    receptive: "Low",
    windHours: [{ speed: 11, dir: "↖" }, { speed: 9, dir: "↖" }, { speed: 9, dir: "←" }],
    tempHours: [79, 77, 73],
    humidity: 44,
    pressure: 1017,
    icons: ["↖", "↖", "←", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "PHI @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 0.98,
    hr: 1.00,
    doubleTriple: 0.90,
    single: 1.03,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [84, 81, 79],
    humidity: 51,
    pressure: 1009,
    icons: ["↑", "↑", "↑", "〜", "☀️", "P"],
    isClosed: false
  },
  {
    game: "BOS @ NYY",
    venue: "Yankee Stadium",
    time: "7:15",
    runs: 0.98,
    hr: 1.05,
    doubleTriple: 0.94,
    single: 0.94,
    receptive: "High",
    windHours: [{ speed: 4, dir: "↘" }, { speed: 6, dir: "↘" }, { speed: 8, dir: "↘" }],
    tempHours: [81, 81, 79],
    humidity: 60,
    pressure: 1016,
    icons: ["↘", "↘", "↘", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "LAD @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 0.97,
    hr: 0.83,
    doubleTriple: 1.05,
    single: 1.05,
    receptive: "High",
    windHours: [{ speed: 3, dir: "→" }, { speed: 4, dir: "↘" }, { speed: 5, dir: "↘" }],
    tempHours: [79, 77, 73],
    humidity: 30,
    pressure: 1018,
    icons: ["→", "↘", "↘", "☀️"],
    isClosed: false
  },
  {
    game: "CIN @ CHC",
    venue: "Wrigley Field",
    time: "2:20",
    runs: 0.96,
    hr: 0.90,
    doubleTriple: 0.93,
    single: 1.03,
    receptive: "Extreme",
    windHours: [{ speed: 6, dir: "←" }, { speed: 7, dir: "←" }, { speed: 7, dir: "↙" }],
    tempHours: [79, 79, 80],
    humidity: 37,
    pressure: 1019,
    icons: ["←", "←", "↙", "〜", "☀️", "P"],
    isClosed: false
  },
  {
    game: "CHW @ MIN",
    venue: "Target Field",
    time: "8:10",
    runs: 0.96,
    hr: 0.91,
    doubleTriple: 0.98,
    single: 1.00,
    receptive: "Medium",
    windHours: [{ speed: 1, dir: "↘" }, { speed: 5, dir: "↓" }, { speed: 6, dir: "↙" }],
    tempHours: [86, 86, 81],
    humidity: 31,
    pressure: 1012,
    icons: ["↘", "↓", "↙", "☀️"],
    isClosed: false
  },
  {
    game: "SD @ TB",
    venue: "Tropicana Field",
    time: "7:10",
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
    game: "HOU @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.93,
    hr: 1.00,
    doubleTriple: 0.81,
    single: 0.97,
    receptive: "Low",
    windHours: [{ speed: 3, dir: "↓" }, { speed: 5, dir: "↓" }, { speed: 8, dir: "↓" }],
    tempHours: [84, 82, 81],
    humidity: 49,
    pressure: 1015,
    icons: ["↓", "↓", "↓", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "KC @ CLE",
    venue: "Progressive Field",
    time: "7:10",
    runs: 0.93,
    hr: 0.84,
    doubleTriple: 1.02,
    single: 0.96,
    receptive: "High",
    windHours: [{ speed: 6, dir: "↙" }, { speed: 7, dir: "↙" }, { speed: 7, dir: "↙" }],
    tempHours: [70, 68, 68],
    humidity: 60,
    pressure: 1019,
    icons: ["↙", "↙", "↙", "〜", "P"],
    isClosed: false
  },
  {
    game: "COL @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 0.93,
    hr: 0.97,
    doubleTriple: 0.88,
    single: 1.00,
    receptive: "Medium",
    windHours: [{ speed: 4, dir: "↘" }, { speed: 5, dir: "↘" }, { speed: 3, dir: "↓" }],
    tempHours: [81, 79, 79],
    humidity: 55,
    pressure: 1015,
    icons: ["↘", "↘", "↓", "☀️"],
    isClosed: false
  },
  {
    game: "ARI @ SF",
    venue: "Oracle Park",
    time: "10:15",
    runs: 0.91,
    hr: 0.75,
    doubleTriple: 1.06,
    single: 1.02,
    receptive: "Consistent",
    windHours: [{ speed: 15, dir: "↗" }, { speed: 13, dir: "↗" }, { speed: 12, dir: "↗" }],
    tempHours: [59, 59, 59],
    humidity: 81,
    pressure: 1015,
    icons: ["↗", "↗", "↗", "≈", "H"],
    isClosed: false
  },
  {
    game: "SEA @ TOR",
    venue: "Rogers Centre",
    time: "7:15",
    runs: 0.91,
    hr: 0.93,
    doubleTriple: 0.94,
    single: 0.97,
    receptive: "Minimal",
    windHours: [{ speed: 5, dir: "↗" }, { speed: 1, dir: "↗" }, { speed: 2, dir: "↘" }],
    tempHours: [70, 66, 66],
    humidity: 43,
    pressure: 1019,
    icons: ["↗", "↗", "→", "P"],
    isClosed: false
  },
  {
    game: "PIT @ STL",
    venue: "Busch Stadium",
    time: "8:15",
    runs: 0.88,
    hr: 0.80,
    doubleTriple: 0.91,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "↓" }, { speed: 5, dir: "↙" }, { speed: 5, dir: "↙" }],
    tempHours: [79, 77, 77],
    humidity: 49,
    pressure: 1018,
    icons: ["↓", "↙", "↙", "〜", "☀️"],
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
