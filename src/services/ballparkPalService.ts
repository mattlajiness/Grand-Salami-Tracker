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
    game: "SF @ COL",
    venue: "Coors Field",
    time: "4:00",
    runs: 1.40,
    hr: 1.30,
    doubleTriple: 1.24,
    single: 1.23,
    receptive: "Low",
    windHours: [{ speed: 5, dir: "↘" }, { speed: 14, dir: "↑" }, { speed: 17, dir: "↑" }],
    tempHours: [95, 91, 86],
    humidity: 9,
    pressure: 1009,
    icons: ["↘", "↑", "↑", "≈", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "MIA @ ATH",
    venue: "Sutter Health Park",
    time: "4:30",
    runs: 1.25,
    hr: 1.32,
    doubleTriple: 1.17,
    single: 1.05,
    receptive: "Very High",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 7, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [90, 91, 93],
    humidity: 31,
    pressure: 1013,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "PIT @ WAS",
    venue: "Nationals Park",
    time: "1:00",
    runs: 1.15,
    hr: 1.18,
    doubleTriple: 1.01,
    single: 1.11,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↑" }, { speed: 5, dir: "↖" }, { speed: 6, dir: "↖" }],
    tempHours: [99, 100, 100],
    humidity: 45,
    pressure: 1013,
    icons: ["↑", "↖", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "BAL @ CIN",
    venue: "Great American BP",
    time: "1:05",
    runs: 1.12,
    hr: 1.24,
    doubleTriple: 0.97,
    single: 1.00,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↖" }, { speed: 8, dir: "↖" }, { speed: 8, dir: "↑" }],
    tempHours: [90, 90, 90],
    humidity: 65,
    pressure: 1012,
    icons: ["↖", "↖", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "CHW @ CLE",
    venue: "Progressive Field",
    time: "2:00",
    runs: 1.08,
    hr: 1.08,
    doubleTriple: 1.08,
    single: 0.99,
    receptive: "High",
    windHours: [{ speed: 11, dir: "↙" }, { speed: 10, dir: "↙" }, { speed: 9, dir: "↙" }],
    tempHours: [79, 79, 82],
    humidity: 85,
    pressure: 1014,
    icons: ["↙", "↙", "↙", "≈", "☀️", "H"],
    isClosed: false
  },
  {
    game: "SD @ LAD",
    venue: "Dodger Stadium",
    time: "7:20",
    runs: 1.05,
    hr: 1.21,
    doubleTriple: 1.00,
    single: 0.97,
    receptive: "Consistent",
    windHours: [{ speed: 10, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 9, dir: "↑" }],
    tempHours: [81, 81, 79],
    humidity: 37,
    pressure: 1013,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "BOS @ LAA",
    venue: "Angel Stadium",
    time: "9:30",
    runs: 1.03,
    hr: 1.06,
    doubleTriple: 0.96,
    single: 1.04,
    receptive: "Consistent",
    windHours: [{ speed: 10, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [77, 75, 73],
    humidity: 46,
    pressure: 1012,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "NYM @ ATL",
    venue: "Truist Park",
    time: "12:30",
    runs: 1.03,
    hr: 1.11,
    doubleTriple: 0.95,
    single: 1.01,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "↖" }, { speed: 7, dir: "↖" }, { speed: 8, dir: "↖" }],
    tempHours: [93, 95, 95],
    humidity: 44,
    pressure: 1014,
    icons: ["↖", "↖", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "PHI @ KC",
    venue: "Kauffman Stadium",
    time: "3:00",
    runs: 1.02,
    hr: 1.17,
    doubleTriple: 0.92,
    single: 1.00,
    receptive: "High",
    windHours: [{ speed: 3, dir: "↓" }, { speed: 3, dir: "↓" }, { speed: 4, dir: "↓" }],
    tempHours: [95, 95, 93],
    humidity: 51,
    pressure: 1014,
    icons: ["↓", "↓", "↓", "☀️"],
    isClosed: false
  },
  {
    game: "MIL @ ARI",
    venue: "Chase Field",
    time: "4:00",
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
    game: "MIN @ NYY",
    venue: "Yankee Stadium",
    time: "1:35",
    runs: 0.97,
    hr: 1.00,
    doubleTriple: 0.96,
    single: 0.94,
    receptive: "High",
    windHours: [{ speed: 4, dir: "↓" }, { speed: 5, dir: "↓" }, { speed: 5, dir: "↓" }],
    tempHours: [86, 88, 88],
    humidity: 69,
    pressure: 1015,
    icons: ["↓", "↓", "↓", "☀️"],
    isClosed: false
  },
  {
    game: "TB @ HOU",
    venue: "Daikin Park",
    time: "3:30",
    runs: 0.96,
    hr: 1.04,
    doubleTriple: 0.90,
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
    game: "DET @ TEX",
    venue: "Globe Life Field",
    time: "3:30",
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
    game: "TOR @ SEA",
    venue: "T-Mobile Park",
    time: "5:00",
    runs: 0.92,
    hr: 1.01,
    doubleTriple: 0.83,
    single: 0.95,
    receptive: "Medium",
    windHours: [{ speed: 7, dir: "↘" }, { speed: 8, dir: "↘" }, { speed: 9, dir: "↘" }],
    tempHours: [73, 75, 75],
    humidity: 53,
    pressure: 1017,
    icons: ["↘", "↘", "↘", "~"],
    isClosed: false
  },
  {
    game: "STL @ CHC",
    venue: "Wrigley Field",
    time: "2:30",
    runs: 0.73,
    hr: 0.72,
    doubleTriple: 0.74,
    single: 0.94,
    receptive: "Extreme",
    windHours: [{ speed: 13, dir: "↓" }, { speed: 14, dir: "↓" }, { speed: 12, dir: "↓" }],
    tempHours: [70, 72, 72],
    humidity: 100,
    pressure: 1015,
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
