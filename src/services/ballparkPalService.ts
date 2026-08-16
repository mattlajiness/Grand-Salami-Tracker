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
    game: "TEX @ ATH",
    venue: "Sutter Health Park",
    time: "4:05",
    runs: 1.26,
    hr: 1.39,
    doubleTriple: 1.10,
    single: 1.07,
    receptive: "Very High",
    windHours: [{ speed: 4, dir: "↑" }, { speed: 6, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [90, 91, 95],
    humidity: 22,
    pressure: 1016,
    icons: ["↑", "↑", "↑", "〜", "💥", "H"],
    isClosed: false
  },
  {
    game: "MIA @ CIN",
    venue: "Great American BP",
    time: "1:40",
    runs: 1.13,
    hr: 1.25,
    doubleTriple: 0.90,
    single: 1.05,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↖" }, { speed: 9, dir: "↖" }, { speed: 9, dir: "↖" }],
    tempHours: [93, 95, 97],
    humidity: 45,
    pressure: 1013,
    icons: ["↖", "↖", "↖", "〜", "💥"],
    isClosed: false
  },
  {
    game: "SD @ CLE",
    venue: "Progressive Field",
    time: "1:40",
    runs: 1.07,
    hr: 1.19,
    doubleTriple: 0.97,
    single: 0.99,
    receptive: "High",
    windHours: [{ speed: 9, dir: "→" }, { speed: 7, dir: "→" }, { speed: 9, dir: "↘" }],
    tempHours: [79, 79, 81],
    humidity: 83,
    pressure: 1012,
    icons: ["→", "→", "↘", "〜", "☀️", "H"],
    isClosed: false
  },
  {
    game: "STL @ CHC",
    venue: "Wrigley Field",
    time: "3:15",
    runs: 1.06,
    hr: 1.21,
    doubleTriple: 0.91,
    single: 0.99,
    receptive: "Extreme",
    windHours: [{ speed: 8, dir: "↗" }, { speed: 9, dir: "↗" }, { speed: 9, dir: "↗" }],
    tempHours: [85, 84, 84],
    humidity: 65,
    pressure: 1013,
    icons: ["↗", "↗", "↗", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "CHW @ DET",
    venue: "Comerica Park",
    time: "1:40",
    runs: 1.05,
    hr: 1.13,
    doubleTriple: 1.02,
    single: 1.01,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↖" }, { speed: 11, dir: "↖" }, { speed: 9, dir: "↖" }],
    tempHours: [75, 79, 79],
    humidity: 86,
    pressure: 1011,
    icons: ["↖", "↖", "↖", "〜", "H"],
    isClosed: false
  },
  {
    game: "BOS @ PIT",
    venue: "PNC Park",
    time: "1:35",
    runs: 1.03,
    hr: 1.01,
    doubleTriple: 1.14,
    single: 0.95,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "↖" }, { speed: 6, dir: "↖" }, { speed: 7, dir: "↖" }],
    tempHours: [81, 81, 86],
    humidity: 78,
    pressure: 1014,
    icons: ["↖", "↖", "↖", "〜", "☀️", "H"],
    isClosed: false
  },
  {
    game: "MIL @ LAD",
    venue: "Dodger Stadium",
    time: "4:10",
    runs: 1.02,
    hr: 1.21,
    doubleTriple: 0.98,
    single: 0.95,
    receptive: "Consistent",
    windHours: [{ speed: 8, dir: "↗" }, { speed: 9, dir: "↗" }, { speed: 12, dir: "↗" }],
    tempHours: [86, 88, 86],
    humidity: 32,
    pressure: 1017,
    icons: ["↗", "↗", "↗", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "PHI @ MIN",
    venue: "Target Field",
    time: "2:10",
    runs: 1.02,
    hr: 1.01,
    doubleTriple: 0.99,
    single: 1.02,
    receptive: "Medium",
    windHours: [{ speed: 8, dir: "↗" }, { speed: 8, dir: "↗" }, { speed: 8, dir: "↗" }],
    tempHours: [81, 82, 84],
    humidity: 39,
    pressure: 1018,
    icons: ["↗", "↗", "↗", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "ARI @ ATL",
    venue: "Truist Park",
    time: "1:35",
    runs: 1.01,
    hr: 1.05,
    doubleTriple: 1.01,
    single: 0.99,
    receptive: "Medium",
    windHours: [{ speed: 8, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 8, dir: "↑" }],
    tempHours: [97, 99, 100],
    humidity: 35,
    pressure: 1018,
    icons: ["↑", "↑", "↑", "〜", "💥"],
    isClosed: false
  },
  {
    game: "KC @ LAA",
    venue: "Angel Stadium",
    time: "4:07",
    runs: 0.99,
    hr: 0.91,
    doubleTriple: 0.96,
    single: 1.05,
    receptive: "Consistent",
    windHours: [{ speed: 8, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 12, dir: "↗" }],
    tempHours: [82, 84, 84],
    humidity: 43,
    pressure: 1017,
    icons: ["↑", "↑", "↗", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "NYY @ TOR",
    venue: "Rogers Centre",
    time: "1:37",
    runs: 0.99,
    hr: 1.11,
    doubleTriple: 0.91,
    single: 0.99,
    receptive: "Minimal",
    windHours: [{ speed: 6, dir: "←" }, { speed: 6, dir: "↖" }, { speed: 4, dir: "↙" }],
    tempHours: [68, 68, 68],
    humidity: 91,
    pressure: 1012,
    icons: ["←", "↖", "↙", "〜", "H"],
    isClosed: false
  },
  {
    game: "SEA @ HOU",
    venue: "Daikin Park",
    time: "7:20",
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
    game: "COL @ SF",
    venue: "Oracle Park",
    time: "4:05",
    runs: 0.95,
    hr: 0.77,
    doubleTriple: 1.10,
    single: 1.04,
    receptive: "Consistent",
    windHours: [{ speed: 10, dir: "↑" }, { speed: 11, dir: "↑" }, { speed: 11, dir: "↑" }],
    tempHours: [66, 66, 66],
    humidity: 67,
    pressure: 1019,
    icons: ["↑", "↑", "↑", "≈", "P"],
    isClosed: false
  },
  {
    game: "BAL @ TB",
    venue: "Tropicana Field",
    time: "12:15",
    runs: 0.94,
    hr: 0.98,
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
    game: "WAS @ NYM",
    venue: "Citi Field",
    time: "1:40",
    runs: 0.93,
    hr: 1.04,
    doubleTriple: 0.82,
    single: 0.93,
    receptive: "Low",
    windHours: [{ speed: 12, dir: "↑" }, { speed: 13, dir: "↑" }, { speed: 14, dir: "↑" }],
    tempHours: [82, 79, 77],
    humidity: 45,
    pressure: 1018,
    icons: ["↑", "↑", "↑", "≈", "☀️"],
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
