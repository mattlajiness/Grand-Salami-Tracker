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
    game: "COL @ ATH",
    venue: "Las Vegas Ballpark",
    time: "3:05",
    runs: 1.47,
    hr: 1.75,
    doubleTriple: 1.21,
    single: 1.12,
    receptive: "High",
    windHours: [{ speed: 12, dir: "↑" }, { speed: 17, dir: "↑" }, { speed: 19, dir: "↑" }],
    tempHours: [106, 108, 106],
    humidity: 7,
    pressure: 1009,
    icons: ["↑", "↑", "↑", "≈", "🔴", "H", "P"],
    isClosed: false
  },
  {
    game: "TEX @ BOS",
    venue: "Fenway Park",
    time: "7:20",
    runs: 1.19,
    hr: 1.07,
    doubleTriple: 1.33,
    single: 1.05,
    receptive: "High",
    windHours: [{ speed: 12, dir: "↑" }, { speed: 14, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [79, 77, 75],
    humidity: 49,
    pressure: 1006,
    icons: ["↑", "↑", "↑", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "SD @ BAL",
    venue: "Oriole Park",
    time: "1:35",
    runs: 1.16,
    hr: 1.03,
    doubleTriple: 1.12,
    single: 1.14,
    receptive: "Med-High",
    windHours: [{ speed: 11, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 4, dir: "↑" }],
    tempHours: [97, 99, 99],
    humidity: 36,
    pressure: 1008,
    icons: ["↑", "↑", "↑", "~", "🔴", "P"],
    isClosed: false
  },
  {
    game: "SEA @ WAS",
    venue: "Nationals Park",
    time: "1:35",
    runs: 1.14,
    hr: 1.19,
    doubleTriple: 0.98,
    single: 1.11,
    receptive: "Med-High",
    windHours: [{ speed: 10, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [95, 97, 97],
    humidity: 38,
    pressure: 1008,
    icons: ["↑", "↑", "↑", "~", "🔴", "P"],
    isClosed: false
  },
  {
    game: "ARI @ CIN",
    venue: "Great American BP",
    time: "1:40",
    runs: 1.11,
    hr: 1.24,
    doubleTriple: 0.99,
    single: 0.98,
    receptive: "Low",
    windHours: [{ speed: 8, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 11, dir: "↗" }],
    tempHours: [82, 84, 86],
    humidity: 68,
    pressure: 1009,
    icons: ["↑", "↑", "↑", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "TB @ LAA",
    venue: "Angel Stadium",
    time: "4:07",
    runs: 1.05,
    hr: 1.08,
    doubleTriple: 0.97,
    single: 1.05,
    receptive: "Consistent",
    windHours: [{ speed: 10, dir: "↗" }, { speed: 11, dir: "↗" }, { speed: 11, dir: "↗" }],
    tempHours: [75, 81, 84],
    humidity: 61,
    pressure: 1014,
    icons: ["↗", "↗", "↗", "≈"],
    isClosed: false
  },
  {
    game: "CHC @ SF",
    venue: "Oracle Park",
    time: "3:10",
    runs: 1.02,
    hr: 0.91,
    doubleTriple: 1.02,
    single: 1.11,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 10, dir: "↑" }, { speed: 11, dir: "↑" }],
    tempHours: [63, 64, 66],
    humidity: 85,
    pressure: 1013,
    icons: ["↑", "↑", "↑", "≈", "H"],
    isClosed: false
  },
  {
    game: "STL @ MIN",
    venue: "Target Field",
    time: "2:10",
    runs: 1.00,
    hr: 1.03,
    doubleTriple: 0.95,
    single: 1.01,
    receptive: "Medium",
    windHours: [{ speed: 14, dir: "↗" }, { speed: 15, dir: "↗" }, { speed: 14, dir: "↗" }],
    tempHours: [73, 75, 77],
    humidity: 35,
    pressure: 1015,
    icons: ["↗", "↗", "↗", "≈"],
    isClosed: false
  },
  {
    game: "MIA @ PIT",
    venue: "PNC Park",
    time: "12:15",
    runs: 1.00,
    hr: 0.91,
    doubleTriple: 1.04,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "←" }, { speed: 9, dir: "↙" }, { speed: 11, dir: "←" }],
    tempHours: [84, 86, 88],
    humidity: 45,
    pressure: 1010,
    icons: ["←", "←", "←", "~", "🔴", "P"],
    isClosed: false
  },
  {
    game: "ATL @ NYM",
    venue: "Citi Field",
    time: "1:40",
    runs: 0.98,
    hr: 1.07,
    doubleTriple: 0.79,
    single: 1.01,
    receptive: "Low",
    windHours: [{ speed: 14, dir: "↑" }, { speed: 15, dir: "↑" }, { speed: 17, dir: "↑" }],
    tempHours: [93, 93, 93],
    humidity: 30,
    pressure: 1009,
    icons: ["↑", "↑", "↑", "≈", "🔴", "P"],
    isClosed: false
  },
  {
    game: "DET @ CLE",
    venue: "Progressive Field",
    time: "1:40",
    runs: 0.98,
    hr: 1.00,
    doubleTriple: 0.95,
    single: 0.97,
    receptive: "High",
    windHours: [{ speed: 13, dir: "↘" }, { speed: 14, dir: "↘" }, { speed: 9, dir: "↘" }],
    tempHours: [86, 77, 72],
    humidity: 56,
    pressure: 1007,
    icons: ["↘", "↘", "↘", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "LAD @ CHW",
    venue: "Rate Field",
    time: "2:10",
    runs: 0.97,
    hr: 1.04,
    doubleTriple: 0.83,
    single: 1.03,
    receptive: "Med-High",
    windHours: [{ speed: 11, dir: "↗" }, { speed: 9, dir: "↗" }, { speed: 9, dir: "↗" }],
    tempHours: [61, 63, 64],
    humidity: 62,
    pressure: 1013,
    icons: ["↗", "↗", "↗", "~"],
    isClosed: false
  },
  {
    game: "NYY @ TOR",
    venue: "Rogers Centre",
    time: "1:37",
    runs: 0.94,
    hr: 1.01,
    doubleTriple: 0.95,
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
    game: "PHI @ MIL",
    venue: "American Family Fld",
    time: "2:10",
    runs: 0.93,
    hr: 1.10,
    doubleTriple: 0.82,
    single: 0.91,
    receptive: "Low",
    windHours: [{ speed: 13, dir: "↑" }, { speed: 14, dir: "↑" }, { speed: 13, dir: "↑" }],
    tempHours: [68, 70, 70],
    humidity: 48,
    pressure: 1013,
    icons: ["↑", "↑", "↑", "≈"],
    isClosed: false
  },
  {
    game: "HOU @ KC",
    venue: "Kauffman Stadium",
    time: "2:10",
    runs: 0.92,
    hr: 0.86,
    doubleTriple: 1.07,
    single: 0.95,
    receptive: "High",
    windHours: [{ speed: 11, dir: "↘" }, { speed: 11, dir: "↘" }, { speed: 11, dir: "↘" }],
    tempHours: [77, 77, 79],
    humidity: 39,
    pressure: 1020,
    icons: ["↘", "↘", "↘", "≈", "☀️", "P"],
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
