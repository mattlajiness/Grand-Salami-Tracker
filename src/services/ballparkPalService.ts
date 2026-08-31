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
    game: "MIL @ CHC",
    venue: "Wrigley Field",
    time: "7:40",
    runs: 1.28,
    hr: 1.47,
    doubleTriple: 1.03,
    single: 1.06,
    receptive: "Extreme",
    windHours: [{ speed: 13, dir: "↑" }, { speed: 11, dir: "↑" }, { speed: 9, dir: "↑" }],
    tempHours: [86, 84, 82],
    humidity: 51,
    pressure: 1012,
    icons: ["↑", "↑", "↑", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "BAL @ COL",
    venue: "Coors Field",
    time: "8:40",
    runs: 1.26,
    hr: 1.07,
    doubleTriple: 1.29,
    single: 1.15,
    receptive: "Low",
    windHours: [{ speed: 12, dir: "↓" }, { speed: 11, dir: "↙" }, { speed: 9, dir: "↙" }],
    tempHours: [72, 70, 68],
    humidity: 54,
    pressure: 1013,
    icons: ["↓", "↙", "↙", "≈"],
    isClosed: false
  },
  {
    game: "SEA @ BOS",
    venue: "Fenway Park",
    time: "6:45",
    runs: 1.09,
    hr: 1.01,
    doubleTriple: 1.20,
    single: 1.03,
    receptive: "High",
    windHours: [{ speed: 11, dir: "←" }, { speed: 9, dir: "↖" }, { speed: 8, dir: "↖" }],
    tempHours: [73, 72, 73],
    humidity: 65,
    pressure: 1017,
    icons: ["←", "↖", "↖", "〜"],
    isClosed: false
  },
  {
    game: "SD @ CIN",
    venue: "Great American BP",
    time: "6:40",
    runs: 1.08,
    hr: 1.17,
    doubleTriple: 0.99,
    single: 0.97,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "↖" }, { speed: 4, dir: "←" }, { speed: 4, dir: "←" }],
    tempHours: [93, 91, 86],
    humidity: 34,
    pressure: 1015,
    icons: ["↖", "←", "←", "💥"],
    isClosed: false
  },
  {
    game: "MIA @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.07,
    hr: 1.09,
    doubleTriple: 1.05,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 5, dir: "↙" }, { speed: 6, dir: "↖" }, { speed: 4, dir: "←" }],
    tempHours: [84, 82, 79],
    humidity: 54,
    pressure: 1017,
    icons: ["↙", "↖", "←", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "SF @ ATL",
    venue: "Truist Park",
    time: "6:05",
    runs: 1.01,
    hr: 1.12,
    doubleTriple: 0.85,
    single: 1.04,
    receptive: "Medium",
    windHours: [{ speed: 4, dir: "↗" }, { speed: 3, dir: "↗" }, { speed: 3, dir: "↗" }],
    tempHours: [86, 86, 86],
    humidity: 43,
    pressure: 1017,
    icons: ["↗", "↗", "↗", "☀️"],
    isClosed: false
  },
  {
    game: "PHI @ ARI",
    venue: "Chase Field",
    time: "9:40",
    runs: 1.00,
    hr: 0.91,
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
    game: "NYY @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 0.99,
    hr: 0.95,
    doubleTriple: 0.94,
    single: 1.05,
    receptive: "Consistent",
    windHours: [{ speed: 11, dir: "↑" }, { speed: 10, dir: "↗" }, { speed: 8, dir: "↗" }],
    tempHours: [75, 75, 73],
    humidity: 54,
    pressure: 1012,
    icons: ["↑", "↗", "↗", "〜"],
    isClosed: false
  },
  {
    game: "DET @ MIN",
    venue: "Target Field",
    time: "7:40",
    runs: 0.99,
    hr: 0.92,
    doubleTriple: 1.04,
    single: 1.00,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "→" }, { speed: 6, dir: "↘" }, { speed: 7, dir: "↘" }],
    tempHours: [95, 91, 88],
    humidity: 26,
    pressure: 1005,
    icons: ["→", "↘", "↘", "〜", "💥", "P"],
    isClosed: false
  },
  {
    game: "CHW @ HOU",
    venue: "Daikin Park",
    time: "8:10",
    runs: 0.96,
    hr: 1.07,
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
    game: "NYM @ TB",
    venue: "Tropicana Field",
    time: "6:40",
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
    game: "ATH @ TEX",
    venue: "Globe Life Field",
    time: "8:05",
    runs: 0.92,
    hr: 0.88,
    doubleTriple: 0.93,
    single: 0.98,
    receptive: "Roof Closed",
    windHours: [],
    tempHours: [],
    humidity: 0,
    pressure: 0,
    icons: ["🏟️"],
    isClosed: true
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
