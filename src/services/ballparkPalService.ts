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
    time: "3:10",
    runs: 1.31,
    hr: 1.29,
    doubleTriple: 1.21,
    single: 1.15,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↙" }, { speed: 8, dir: "↙" }, { speed: 9, dir: "←" }],
    tempHours: [79, 81, 81],
    humidity: 12,
    pressure: 1008,
    icons: ["↙", "↙", "←", "~", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "NYY @ ATH",
    venue: "Sutter Health Park",
    time: "4:05",
    runs: 1.22,
    hr: 1.21,
    doubleTriple: 1.13,
    single: 1.10,
    receptive: "Very High",
    windHours: [{ speed: 7, dir: "→" }, { speed: 7, dir: "→" }, { speed: 7, dir: "→" }],
    tempHours: [90, 90, 90],
    humidity: 29,
    pressure: 1013,
    icons: ["→", "→", "→", "~", "💥"],
    isClosed: false
  },
  {
    game: "ATL @ CIN",
    venue: "Great American BP",
    time: "1:40",
    runs: 1.05,
    hr: 1.05,
    doubleTriple: 0.98,
    single: 1.01,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↘" }, { speed: 6, dir: "↘" }, { speed: 6, dir: "↘" }],
    tempHours: [81, 82, 84],
    humidity: 37,
    pressure: 1018,
    icons: ["↘", "↘", "↘", "~", "☀️"],
    isClosed: false
  },
  {
    game: "PHI @ LAD",
    venue: "Dodger Stadium",
    time: "4:10",
    runs: 1.03,
    hr: 1.21,
    doubleTriple: 0.99,
    single: 0.95,
    receptive: "Consistent",
    windHours: [{ speed: 10, dir: "↑" }, { speed: 11, dir: "↑" }, { speed: 11, dir: "↑" }],
    tempHours: [81, 79, 79],
    humidity: 31,
    pressure: 1012,
    icons: ["↑", "↑", "↑", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "SD @ WAS",
    venue: "Nationals Park",
    time: "1:35",
    runs: 1.02,
    hr: 0.95,
    doubleTriple: 1.06,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 5, dir: "↘" }, { speed: 6, dir: "→" }, { speed: 6, dir: "→" }],
    tempHours: [79, 81, 82],
    humidity: 23,
    pressure: 1019,
    icons: ["↘", "→", "→", "~", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "MIN @ PIT",
    venue: "PNC Park",
    time: "1:35",
    runs: 0.99,
    hr: 0.77,
    doubleTriple: 1.06,
    single: 1.07,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↘" }, { speed: 2, dir: "↘" }, { speed: 3, dir: "↘" }],
    tempHours: [77, 81, 82],
    humidity: 26,
    pressure: 1019,
    icons: ["↘", "↘", "↘", "☀️", "P"],
    isClosed: false
  },
  {
    game: "TOR @ BAL",
    venue: "Oriole Park",
    time: "12:15",
    runs: 0.99,
    hr: 0.84,
    doubleTriple: 1.02,
    single: 1.08,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↓" }, { speed: 2, dir: "↓" }, { speed: 2, dir: "↓" }],
    tempHours: [73, 77, 79],
    humidity: 30,
    pressure: 1019,
    icons: ["↓", "↓", "↓", "P"],
    isClosed: false
  },
  {
    game: "MIL @ HOU",
    venue: "Daikin Park",
    time: "2:10",
    runs: 0.96,
    hr: 1.06,
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
    game: "DET @ CHW",
    venue: "Rate Field",
    time: "2:10",
    runs: 0.95,
    hr: 0.97,
    doubleTriple: 0.88,
    single: 1.00,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 7, dir: "↘" }],
    tempHours: [64, 66, 66],
    humidity: 75,
    pressure: 1018,
    icons: ["↘", "↘", "↘", "~", "H"],
    isClosed: false
  },
  {
    game: "LAA @ TB",
    venue: "Tropicana Field",
    time: "1:40",
    runs: 0.94,
    hr: 0.96,
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
    game: "BOS @ CLE",
    venue: "Progressive Field",
    time: "1:40",
    runs: 0.93,
    hr: 0.81,
    doubleTriple: 1.03,
    single: 0.97,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↓" }, { speed: 8, dir: "↓" }, { speed: 8, dir: "↓" }],
    tempHours: [68, 68, 68],
    humidity: 50,
    pressure: 1020,
    icons: ["↓", "↓", "↓", "~", "P"],
    isClosed: false
  },
  {
    game: "CHC @ STL",
    venue: "Busch Stadium",
    time: "7:20",
    runs: 0.93,
    hr: 0.86,
    doubleTriple: 0.96,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "↓" }, { speed: 7, dir: "↓" }, { speed: 7, dir: "↓" }],
    tempHours: [79, 75, 72],
    humidity: 69,
    pressure: 1012,
    icons: ["↓", "↓", "↓", "~", "☀️"],
    isClosed: false
  },
  {
    game: "KC @ TEX",
    venue: "Globe Life Field",
    time: "2:35",
    runs: 0.93,
    hr: 0.90,
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
    game: "MIA @ NYM",
    venue: "Citi Field",
    time: "1:40",
    runs: 0.88,
    hr: 0.89,
    doubleTriple: 0.76,
    single: 0.99,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 6, dir: "↘" }, { speed: 7, dir: "→" }],
    tempHours: [73, 75, 75],
    humidity: 29,
    pressure: 1016,
    icons: ["↘", "↘", "→", "~"],
    isClosed: false
  },
  {
    game: "ARI @ SEA",
    venue: "T-Mobile Park",
    time: "4:10",
    runs: 0.84,
    hr: 0.87,
    doubleTriple: 0.76,
    single: 0.96,
    receptive: "Medium",
    windHours: [{ speed: 7, dir: "↘" }, { speed: 8, dir: "↘" }, { speed: 9, dir: "↘" }],
    tempHours: [63, 64, 64],
    humidity: 43,
    pressure: 1025,
    icons: ["↘", "↘", "↘", "~", "P"],
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
