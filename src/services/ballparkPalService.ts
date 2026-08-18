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
    hr: 1.25,
    doubleTriple: 1.23,
    single: 1.20,
    receptive: "Low",
    windHours: [{ speed: 11, dir: "↙" }, { speed: 10, dir: "←" }, { speed: 11, dir: "↑" }],
    tempHours: [90, 88, 82],
    humidity: 19,
    pressure: 1011,
    icons: ["↙", "←", "↑", "〜", "💥", "H"],
    isClosed: false
  },
  {
    game: "STL @ CIN",
    venue: "Great American BP",
    time: "6:40",
    runs: 1.12,
    hr: 1.18,
    doubleTriple: 1.04,
    single: 1.00,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 5, dir: "↗" }, { speed: 3, dir: "↗" }],
    tempHours: [81, 77, 75],
    humidity: 46,
    pressure: 1015,
    icons: ["↗", "↗", "↗", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "ATH @ KC",
    venue: "Kauffman Stadium",
    time: "7:40",
    runs: 1.09,
    hr: 1.17,
    doubleTriple: 1.01,
    single: 1.03,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↙" }, { speed: 8, dir: "↙" }, { speed: 9, dir: "↙" }],
    tempHours: [91, 90, 86],
    humidity: 45,
    pressure: 1009,
    icons: ["↙", "↓", "↓", "〜", "💥", "P"],
    isClosed: false
  },
  {
    game: "MIA @ PHI",
    venue: "Citizens Bank Park",
    time: "6:40",
    runs: 1.07,
    hr: 1.13,
    doubleTriple: 1.00,
    single: 1.01,
    receptive: "Very High",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 4, dir: "↘" }, { speed: 4, dir: "→" }],
    tempHours: [88, 84, 81],
    humidity: 35,
    pressure: 1011,
    icons: ["↘", "↘", "→", "☀️"],
    isClosed: false
  },
  {
    game: "CHW @ CHC",
    venue: "Wrigley Field",
    time: "8:05",
    runs: 1.05,
    hr: 1.26,
    doubleTriple: 0.90,
    single: 0.96,
    receptive: "Extreme",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }],
    tempHours: [70, 70, 70],
    humidity: 80,
    pressure: 1014,
    icons: ["↑", "↑", "↑", "〜", "H"],
    isClosed: false
  },
  {
    game: "NYY @ BAL",
    venue: "Oriole Park",
    time: "6:35",
    runs: 1.04,
    hr: 1.01,
    doubleTriple: 1.13,
    single: 1.00,
    receptive: "Med-High",
    windHours: [{ speed: 2, dir: "↓" }, { speed: 2, dir: "↙" }, { speed: 4, dir: "↙" }],
    tempHours: [86, 84, 82],
    humidity: 55,
    pressure: 1011,
    icons: ["↓", "↙", "↙", "☀️"],
    isClosed: false
  },
  {
    game: "SF @ CLE",
    venue: "Progressive Field",
    time: "6:40",
    runs: 1.03,
    hr: 1.07,
    doubleTriple: 1.00,
    single: 0.97,
    receptive: "High",
    windHours: [{ speed: 9, dir: "→" }, { speed: 6, dir: "↗" }, { speed: 7, dir: "↗" }],
    tempHours: [75, 73, 73],
    humidity: 58,
    pressure: 1015,
    icons: ["→", "↗", "↗", "〜"],
    isClosed: false
  },
  {
    game: "DET @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 1.02,
    hr: 0.88,
    doubleTriple: 1.15,
    single: 1.00,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↗" }, { speed: 2, dir: "↘" }, { speed: 1, dir: "↗" }],
    tempHours: [79, 77, 75],
    humidity: 49,
    pressure: 1014,
    icons: ["↗", "↘", "↗", "☀️"],
    isClosed: false
  },
  {
    game: "SEA @ MIL",
    venue: "American Family Fld",
    time: "7:40",
    runs: 1.02,
    hr: 1.13,
    doubleTriple: 1.00,
    single: 0.91,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↖" }, { speed: 7, dir: "↖" }, { speed: 9, dir: "↖" }],
    tempHours: [75, 73, 72],
    humidity: 71,
    pressure: 1012,
    icons: ["↖", "↖", "↖", "〜"],
    isClosed: false
  },
  {
    game: "ATL @ MIN",
    venue: "Target Field",
    time: "7:40",
    runs: 1.00,
    hr: 0.95,
    doubleTriple: 1.01,
    single: 1.01,
    receptive: "Medium",
    windHours: [{ speed: 1, dir: "↖" }, { speed: 2, dir: "→" }, { speed: 9, dir: "↘" }],
    tempHours: [81, 79, 75],
    humidity: 39,
    pressure: 1011,
    icons: ["↖", "→", "↘", "☀️"],
    isClosed: false
  },
  {
    game: "ARI @ BOS",
    venue: "Fenway Park",
    time: "7:10",
    runs: 0.96,
    hr: 0.91,
    doubleTriple: 1.01,
    single: 1.02,
    receptive: "High",
    windHours: [{ speed: 8, dir: "↙" }, { speed: 6, dir: "↙" }, { speed: 6, dir: "↙" }],
    tempHours: [70, 68, 66],
    humidity: 88,
    pressure: 1011,
    icons: ["↓", "↓", "↓", "〜", "H"],
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
    doubleTriple: 0.93,
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
    time: "7:10",
    runs: 0.88,
    hr: 0.91,
    doubleTriple: 0.77,
    single: 0.96,
    receptive: "Low",
    windHours: [{ speed: 8, dir: "↘" }, { speed: 6, dir: "↘" }, { speed: 6, dir: "↘" }],
    tempHours: [88, 86, 84],
    humidity: 30,
    pressure: 1011,
    icons: ["↘", "↘", "↘", "〜", "☀️"],
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
