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
    time: "4:05",
    runs: 1.26,
    hr: 1.35,
    doubleTriple: 1.16,
    single: 1.06,
    receptive: "Very High",
    windHours: [{ speed: 3, dir: "↑" }, { speed: 4, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [84, 88, 90],
    humidity: 24,
    pressure: 1011,
    icons: ["↑", "↑", "↑", "💥", "H"],
    isClosed: false
  },
  {
    game: "CIN @ CHC",
    venue: "Wrigley Field",
    time: "7:20",
    runs: 1.16,
    hr: 1.36,
    doubleTriple: 0.99,
    single: 0.99,
    receptive: "Extreme",
    windHours: [{ speed: 12, dir: "↑" }, { speed: 11, dir: "↑" }, { speed: 10, dir: "↑" }],
    tempHours: [84, 82, 81],
    humidity: 53,
    pressure: 1013,
    icons: ["↗", "↑", "↗", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "MIA @ WAS",
    venue: "Nationals Park",
    time: "12:15",
    runs: 1.12,
    hr: 1.12,
    doubleTriple: 1.10,
    single: 1.06,
    receptive: "Med-High",
    windHours: [{ speed: 8, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [84, 90, 91],
    humidity: 66,
    pressure: 1021,
    icons: ["↑", "↗", "↗", "〜", "☀️", "P"],
    isClosed: false
  },
  {
    game: "CHW @ MIN",
    venue: "Target Field",
    time: "2:10",
    runs: 1.00,
    hr: 0.90,
    doubleTriple: 1.02,
    single: 1.03,
    receptive: "Medium",
    windHours: [{ speed: 7, dir: "↙" }, { speed: 7, dir: "↙" }, { speed: 7, dir: "↙" }],
    tempHours: [84, 86, 88],
    humidity: 46,
    pressure: 1007,
    icons: ["↙", "↙", "↙", "〜", "☀️", "P"],
    isClosed: false
  },
  {
    game: "SEA @ TOR",
    venue: "Rogers Centre",
    time: "1:37",
    runs: 0.99,
    hr: 1.05,
    doubleTriple: 0.97,
    single: 1.00,
    receptive: "Minimal",
    windHours: [{ speed: 2, dir: "↘" }, { speed: 4, dir: "↗" }, { speed: 8, dir: "→" }],
    tempHours: [68, 68, 64],
    humidity: 71,
    pressure: 1019,
    icons: ["↘", "↗", "→", "P"],
    isClosed: false
  },
  {
    game: "HOU @ NYM",
    venue: "Citi Field",
    time: "3:10",
    runs: 0.99,
    hr: 1.09,
    doubleTriple: 0.80,
    single: 1.00,
    receptive: "Low",
    windHours: [{ speed: 11, dir: "↗" }, { speed: 11, dir: "↗" }, { speed: 14, dir: "↗" }],
    tempHours: [86, 86, 86],
    humidity: 45,
    pressure: 1018,
    icons: ["↗", "↗", "↗", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "TEX @ MIL",
    venue: "American Family Fld",
    time: "2:10",
    runs: 0.98,
    hr: 1.03,
    doubleTriple: 0.91,
    single: 0.96,
    receptive: "Low",
    windHours: [{ speed: 14, dir: "←" }, { speed: 14, dir: "←" }, { speed: 11, dir: "←" }],
    tempHours: [81, 82, 82],
    humidity: 55,
    pressure: 1013,
    icons: ["←", "←", "←", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "PHI @ LAA",
    venue: "Angel Stadium",
    time: "4:07",
    runs: 0.97,
    hr: 1.00,
    doubleTriple: 0.88,
    single: 1.03,
    receptive: "Consistent",
    windHours: [{ speed: 11, dir: "↑" }, { speed: 11, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [81, 81, 79],
    humidity: 48,
    pressure: 1011,
    icons: ["↑", "↑", "↑", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "LAD @ DET",
    venue: "Comerica Park",
    time: "1:40",
    runs: 0.97,
    hr: 0.88,
    doubleTriple: 0.99,
    single: 1.06,
    receptive: "High",
    windHours: [{ speed: 3, dir: "↙" }, { speed: 2, dir: "↙" }, { speed: 6, dir: "↙" }],
    tempHours: [72, 72, 81],
    humidity: 67,
    pressure: 1018,
    icons: ["↙", "↙", "↙"],
    isClosed: false
  },
  {
    game: "KC @ CLE",
    venue: "Progressive Field",
    time: "1:40",
    runs: 0.97,
    hr: 1.01,
    doubleTriple: 0.96,
    single: 0.95,
    receptive: "High",
    windHours: [{ speed: 5, dir: "→" }, { speed: 6, dir: "↘" }, { speed: 6, dir: "↓" }],
    tempHours: [77, 77, 75],
    humidity: 58,
    pressure: 1018,
    icons: ["→", "↘", "↓", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "BOS @ NYY",
    venue: "Yankee Stadium",
    time: "1:35",
    runs: 0.96,
    hr: 1.13,
    doubleTriple: 0.85,
    single: 0.92,
    receptive: "High",
    windHours: [{ speed: 11, dir: "↖" }, { speed: 11, dir: "↖" }, { speed: 12, dir: "↖" }],
    tempHours: [81, 84, 82],
    humidity: 48,
    pressure: 1020,
    icons: ["↖", "↖", "↖", "〜", "☀️", "P"],
    isClosed: false
  },
  {
    game: "SD @ TB",
    venue: "Tropicana Field",
    time: "1:40",
    runs: 0.95,
    hr: 0.98,
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
    game: "COL @ ATL",
    venue: "Truist Park",
    time: "1:35",
    runs: 0.93,
    hr: 0.92,
    doubleTriple: 0.92,
    single: 1.00,
    receptive: "Medium",
    windHours: [{ speed: 5, dir: "↓" }, { speed: 5, dir: "↓" }, { speed: 4, dir: "↘" }],
    tempHours: [82, 84, 84],
    humidity: 52,
    pressure: 1021,
    icons: ["↓", "↘", "↘", "☀️", "P"],
    isClosed: false
  },
  {
    game: "PIT @ STL",
    venue: "Busch Stadium",
    time: "2:15",
    runs: 0.93,
    hr: 0.94,
    doubleTriple: 0.97,
    single: 1.00,
    receptive: "Med-High",
    windHours: [{ speed: 11, dir: "↖" }, { speed: 11, dir: "↖" }, { speed: 11, dir: "↖" }],
    tempHours: [95, 97, 97],
    humidity: 22,
    pressure: 1015,
    icons: ["↖", "↖", "↖", "〜", "💥", "H"],
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
