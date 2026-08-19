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
    game: "LAD @ COL",
    venue: "Coors Field",
    time: "8:40",
    runs: 1.35,
    hr: 1.26,
    doubleTriple: 1.34,
    single: 1.15,
    receptive: "Low",
    windHours: [{ speed: 8, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [83, 80, 77],
    humidity: 34,
    pressure: 1015,
    icons: ["↑", "↑", "↑", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "ARI @ BOS",
    venue: "Fenway Park",
    time: "4:10",
    runs: 1.18,
    hr: 1.05,
    doubleTriple: 1.25,
    single: 1.09,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↑" }, { speed: 7, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [87, 86, 85],
    humidity: 43,
    pressure: 1009,
    icons: ["↑", "↑", "↑", "〜", "☀️", "P"],
    isClosed: false
  },
  {
    game: "NYY @ BAL",
    venue: "Oriole Park",
    time: "6:35",
    runs: 1.13,
    hr: 1.05,
    doubleTriple: 1.08,
    single: 1.11,
    receptive: "Med-High",
    windHours: [{ speed: 5, dir: "↗" }, { speed: 3, dir: "↗" }, { speed: 2, dir: "↗" }],
    tempHours: [88, 85, 83],
    humidity: 47,
    pressure: 1009,
    icons: ["↗", "↗", "↗", "☀️", "P"],
    isClosed: false
  },
  {
    game: "STL @ CIN",
    venue: "Great American BP",
    time: "6:40",
    runs: 1.13,
    hr: 1.17,
    doubleTriple: 1.11,
    single: 0.96,
    receptive: "Low",
    windHours: [{ speed: 3, dir: "↖" }, { speed: 2, dir: "↖" }, { speed: 1, dir: "↖" }],
    tempHours: [79, 78, 76],
    humidity: 76,
    pressure: 1010,
    icons: ["↖", "↖", "↖", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "MIA @ PHI",
    venue: "Citizens Bank Park",
    time: "6:05",
    runs: 1.11,
    hr: 1.19,
    doubleTriple: 1.01,
    single: 1.01,
    receptive: "Very High",
    windHours: [{ speed: 5, dir: "↗" }, { speed: 5, dir: "↗" }, { speed: 5, dir: "↗" }],
    tempHours: [87, 84, 82],
    humidity: 46,
    pressure: 1009,
    icons: ["↗", "↗", "↗", "〜", "☀️", "P"],
    isClosed: false
  },
  {
    game: "DET @ PIT",
    venue: "PNC Park",
    time: "12:35",
    runs: 1.05,
    hr: 0.97,
    doubleTriple: 1.14,
    single: 1.00,
    receptive: "Med-High",
    windHours: [{ speed: 10, dir: "↖" }, { speed: 12, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [76, 78, 78],
    humidity: 73,
    pressure: 1011,
    icons: ["↖", "↑", "↑", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "ATL @ MIN",
    venue: "Target Field",
    time: "1:40",
    runs: 0.99,
    hr: 0.98,
    doubleTriple: 0.96,
    single: 1.01,
    receptive: "Medium",
    windHours: [{ speed: 5, dir: "↗" }, { speed: 5, dir: "↗" }, { speed: 5, dir: "↗" }],
    tempHours: [73, 75, 76],
    humidity: 54,
    pressure: 1015,
    icons: ["↗", "↗", "↗", "〜"],
    isClosed: false
  },
  {
    game: "ATH @ KC",
    venue: "Kauffman Stadium",
    time: "7:40",
    runs: 0.97,
    hr: 1.06,
    doubleTriple: 1.00,
    single: 0.95,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↙" }, { speed: 7, dir: "↙" }, { speed: 7, dir: "↙" }],
    tempHours: [82, 81, 79],
    humidity: 74,
    pressure: 1011,
    icons: ["↙", "↙", "↙", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "SF @ CLE",
    venue: "Progressive Field",
    time: "6:40",
    runs: 0.97,
    hr: 0.94,
    doubleTriple: 1.03,
    single: 0.94,
    receptive: "High",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 5, dir: "↓" }, { speed: 2, dir: "↓" }],
    tempHours: [74, 74, 73],
    humidity: 77,
    pressure: 1011,
    icons: ["↘", "↓", "↓", "H"],
    isClosed: false
  },
  {
    game: "LAA @ HOU",
    venue: "Daikin Park",
    time: "8:10",
    runs: 0.96,
    hr: 1.06,
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
    game: "TOR @ TB",
    venue: "Tropicana Field",
    time: "6:40",
    runs: 0.94,
    hr: 0.97,
    doubleTriple: 0.94,
    single: 0.93,
    receptive: "Roof Closed",
    windHours: [],
    tempHours: [],
    humidity: 0,
    pressure: 0,
    icons: ["🏟️"],
    isClosed: true
  },
  {
    game: "WAS @ TEX",
    venue: "Globe Life Field",
    time: "8:05",
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
    game: "SD @ NYM",
    venue: "Citi Field",
    time: "1:10",
    runs: 0.92,
    hr: 1.02,
    doubleTriple: 0.81,
    single: 0.94,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 8, dir: "↗" }, { speed: 9, dir: "↗" }],
    tempHours: [87, 87, 88],
    humidity: 46,
    pressure: 1011,
    icons: ["↗", "↗", "↗", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "SEA @ MIL",
    venue: "American Family Fld",
    time: "7:40",
    runs: 0.90,
    hr: 0.98,
    doubleTriple: 0.89,
    single: 0.88,
    receptive: "Low",
    windHours: [{ speed: 5, dir: "↘" }, { speed: 5, dir: "↘" }, { speed: 0, dir: "←" }],
    tempHours: [75, 73, 71],
    humidity: 55,
    pressure: 1011,
    icons: ["↘", "↘", "←"],
    isClosed: false
  },
  {
    game: "CHW @ CHC",
    venue: "Wrigley Field",
    time: "2:20",
    runs: 0.83,
    hr: 0.84,
    doubleTriple: 0.85,
    single: 0.94,
    receptive: "Extreme",
    windHours: [{ speed: 5, dir: "↓" }, { speed: 5, dir: "↓" }, { speed: 5, dir: "↓" }],
    tempHours: [75, 75, 74],
    humidity: 76,
    pressure: 1013,
    icons: ["↓", "↓", "↓", "〜", "H"],
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
