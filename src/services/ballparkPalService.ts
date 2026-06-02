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
    game: "KC @ CIN",
    venue: "Great American BP",
    time: "7:10",
    runs: 1.07,
    hr: 1.09,
    doubleTriple: 1.02,
    single: 0.99,
    receptive: "Low",
    windHours: [{ speed: 11, dir: "↘" }, { speed: 9, dir: "↘" }, { speed: 8, dir: "↘" }],
    tempHours: [72, 66, 64],
    humidity: 55,
    pressure: 1022,
    icons: ["↘", "↘", "↘", "~", "P"],
    isClosed: false
  },
  {
    game: "BAL @ BOS",
    venue: "Fenway Park",
    time: "6:45",
    runs: 1.02,
    hr: 0.88,
    doubleTriple: 1.14,
    single: 1.04,
    receptive: "High",
    windHours: [{ speed: 4, dir: "↘" }, { speed: 0, dir: "↘" }, { speed: 2, dir: "↗" }],
    tempHours: [68, 64, 63],
    humidity: 41,
    pressure: 1018,
    icons: ["↘", "↘", "↗"],
    isClosed: false
  },
  {
    game: "COL @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 1.01,
    hr: 1.07,
    doubleTriple: 0.97,
    single: 1.00,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [73, 72, 70],
    humidity: 47,
    pressure: 1014,
    icons: ["↑", "↑", "↑", "~"],
    isClosed: false
  },
  {
    game: "LAD @ ARI",
    venue: "Chase Field",
    time: "9:40",
    runs: 1.00,
    hr: 0.92,
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
    game: "CHW @ MIN",
    venue: "Target Field",
    time: "7:40",
    runs: 0.97,
    hr: 0.77,
    doubleTriple: 1.06,
    single: 1.04,
    receptive: "Medium",
    windHours: [{ speed: 10, dir: "↙" }, { speed: 10, dir: "↙" }, { speed: 9, dir: "↙" }],
    tempHours: [79, 77, 73],
    humidity: 37,
    pressure: 1025,
    icons: ["↙", "↙", "↙", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "PIT @ HOU",
    venue: "Daikin Park",
    time: "8:10",
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
    game: "SD @ PHI",
    venue: "Citizens Bank Park",
    time: "6:40",
    runs: 0.95,
    hr: 0.94,
    doubleTriple: 0.97,
    single: 0.97,
    receptive: "Very High",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 3, dir: "↘" }],
    tempHours: [75, 72, 68],
    humidity: 34,
    pressure: 1020,
    icons: ["↘", "↘", "↘", "~", "P"],
    isClosed: false
  },
  {
    game: "DET @ TB",
    venue: "Tropicana Field",
    time: "6:40",
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
    game: "NYM @ SEA",
    venue: "T-Mobile Park",
    time: "9:40",
    runs: 0.93,
    hr: 1.02,
    doubleTriple: 0.85,
    single: 0.94,
    receptive: "Medium",
    windHours: [{ speed: 5, dir: "↗" }, { speed: 5, dir: "→" }, { speed: 4, dir: "↘" }],
    tempHours: [81, 77, 72],
    humidity: 24,
    pressure: 1012,
    icons: ["↗", "→", "↘", "☀️", "H"],
    isClosed: false
  },
  {
    game: "TOR @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 0.93,
    hr: 0.89,
    doubleTriple: 0.91,
    single: 1.02,
    receptive: "Medium",
    windHours: [{ speed: 8, dir: "→" }, { speed: 12, dir: "↘" }, { speed: 12, dir: "↘" }],
    tempHours: [73, 72, 70],
    humidity: 57,
    pressure: 1017,
    icons: ["→", "↘", "↘", "~"],
    isClosed: false
  },
  {
    game: "MIA @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 0.91,
    hr: 0.77,
    doubleTriple: 1.05,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "↓" }, { speed: 6, dir: "↘" }, { speed: 5, dir: "↘" }],
    tempHours: [72, 68, 64],
    humidity: 45,
    pressure: 1021,
    icons: ["↓", "↘", "↘", "~", "P"],
    isClosed: false
  },
  {
    game: "CLE @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 0.89,
    hr: 0.93,
    doubleTriple: 0.83,
    single: 0.95,
    receptive: "High",
    windHours: [{ speed: 10, dir: "→" }, { speed: 7, dir: "→" }, { speed: 7, dir: "→" }],
    tempHours: [73, 72, 70],
    humidity: 29,
    pressure: 1020,
    icons: ["→", "→", "→", "~", "P"],
    isClosed: false
  },
  {
    game: "TEX @ STL",
    venue: "Busch Stadium",
    time: "7:45",
    runs: 0.88,
    hr: 0.74,
    doubleTriple: 0.97,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↙" }, { speed: 9, dir: "↙" }, { speed: 9, dir: "↙" }],
    tempHours: [75, 72, 70],
    humidity: 52,
    pressure: 1023,
    icons: ["↙", "↙", "↙", "~", "P"],
    isClosed: false
  },
  {
    game: "SF @ MIL",
    venue: "American Family Fld",
    time: "7:40",
    runs: 0.80,
    hr: 0.87,
    doubleTriple: 0.82,
    single: 0.86,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 4, dir: "↘" }, { speed: 4, dir: "↘" }],
    tempHours: [64, 61, 59],
    humidity: 51,
    pressure: 1028,
    icons: ["↘", "↘", "↘", "P"],
    isClosed: false
  },
  {
    game: "ATH @ CHC",
    venue: "Wrigley Field",
    time: "8:05",
    runs: 0.75,
    hr: 0.67,
    doubleTriple: 0.84,
    single: 0.94,
    receptive: "Extreme",
    windHours: [{ speed: 9, dir: "↓" }, { speed: 8, dir: "↓" }, { speed: 8, dir: "↓" }],
    tempHours: [63, 61, 59],
    humidity: 62,
    pressure: 1027,
    icons: ["↓", "↓", "↓", "~", "P"],
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
