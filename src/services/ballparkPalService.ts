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
    game: "PIT @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.26,
    hr: 1.35,
    doubleTriple: 1.14,
    single: 1.07,
    receptive: "Very High",
    windHours: [{ speed: 14, dir: "↑" }, { speed: 14, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [91, 84, 79],
    humidity: 24,
    pressure: 1007,
    icons: ["↑", "↑", "↑", "≈", "🔴", "H", "P"],
    isClosed: false
  },
  {
    game: "NYM @ CIN",
    venue: "Great American BP",
    time: "7:10",
    runs: 1.12,
    hr: 1.09,
    doubleTriple: 1.09,
    single: 1.02,
    receptive: "Low",
    windHours: [{ speed: 12, dir: "↑" }, { speed: 2, dir: "↑" }, { speed: 2, dir: "↙" }],
    tempHours: [66, 63, 61],
    humidity: 91,
    pressure: 1007,
    icons: ["↑", "↑", "↙", "~", "H", "P"],
    isClosed: false
  },
  {
    game: "TOR @ BOS",
    venue: "Fenway Park",
    time: "6:45",
    runs: 1.09,
    hr: 0.94,
    doubleTriple: 1.23,
    single: 1.05,
    receptive: "High",
    windHours: [{ speed: 4, dir: "←" }, { speed: 3, dir: "←" }, { speed: 4, dir: "↖" }],
    tempHours: [75, 72, 66],
    humidity: 33,
    pressure: 1008,
    icons: ["←", "←", "↖", "P"],
    isClosed: false
  },
  {
    game: "MIA @ PHI",
    venue: "Citizens Bank Park",
    time: "6:40",
    runs: 1.03,
    hr: 1.15,
    doubleTriple: 0.95,
    single: 0.97,
    receptive: "Very High",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 4, dir: "↗" }, { speed: 4, dir: "↑" }],
    tempHours: [77, 73, 70],
    humidity: 32,
    pressure: 1010,
    icons: ["↗", "↗", "↑", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "CLE @ MIL",
    venue: "American Family Fld",
    time: "7:40",
    runs: 1.01,
    hr: 1.15,
    doubleTriple: 0.81,
    single: 0.99,
    receptive: "Low",
    windHours: [{ speed: 17, dir: "↑" }, { speed: 16, dir: "↑" }, { speed: 13, dir: "↑" }],
    tempHours: [63, 61, 57],
    humidity: 64,
    pressure: 1002,
    icons: ["↑", "↑", "↑", "≈", "P"],
    isClosed: false
  },
  {
    game: "LAA @ ARI",
    venue: "Chase Field",
    time: "9:40",
    runs: 1.01,
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
    game: "KC @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.00,
    hr: 1.07,
    doubleTriple: 0.99,
    single: 0.99,
    receptive: "Med-High",
    windHours: [{ speed: 8, dir: "↖" }, { speed: 9, dir: "↖" }, { speed: 9, dir: "↖" }],
    tempHours: [77, 73, 70],
    humidity: 46,
    pressure: 1009,
    icons: ["↖", "↖", "↖", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "COL @ CHC",
    venue: "Wrigley Field",
    time: "8:05",
    runs: 0.99,
    hr: 1.14,
    doubleTriple: 0.87,
    single: 0.97,
    receptive: "Extreme",
    windHours: [{ speed: 12, dir: "↗" }, { speed: 11, dir: "↗" }, { speed: 9, dir: "↗" }],
    tempHours: [68, 66, 64],
    humidity: 50,
    pressure: 1003,
    icons: ["↗", "↗", "↗", "≈", "P"],
    isClosed: false
  },
  {
    game: "TB @ LAD",
    venue: "Dodger Stadium",
    time: "10:10",
    runs: 0.99,
    hr: 1.13,
    doubleTriple: 0.98,
    single: 0.94,
    receptive: "Consistent",
    windHours: [{ speed: 8, dir: "↑" }, { speed: 7, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [77, 73, 72],
    humidity: 45,
    pressure: 1011,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "SF @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 0.95,
    hr: 0.98,
    doubleTriple: 0.84,
    single: 1.04,
    receptive: "Medium",
    windHours: [{ speed: 5, dir: "↖" }, { speed: 5, dir: "↖" }, { speed: 6, dir: "↖" }],
    tempHours: [70, 70, 70],
    humidity: 93,
    pressure: 1011,
    icons: ["↖", "↖", "↖", "~", "H"],
    isClosed: false
  },
  {
    game: "DET @ HOU",
    venue: "Daikin Park",
    time: "8:10",
    runs: 0.94,
    hr: 1.03,
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
    game: "SD @ STL",
    venue: "Busch Stadium",
    time: "7:45",
    runs: 0.93,
    hr: 0.96,
    doubleTriple: 0.86,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }, { speed: 4, dir: "↗" }],
    tempHours: [75, 73, 70],
    humidity: 68,
    pressure: 1006,
    icons: ["↗", "↗", "↗", "~", "P"],
    isClosed: false
  },
  {
    game: "MIN @ TEX",
    venue: "Globe Life Field",
    time: "8:05",
    runs: 0.93,
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
    game: "CHW @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 0.92,
    hr: 1.11,
    doubleTriple: 0.77,
    single: 0.92,
    receptive: "High",
    windHours: [{ speed: 13, dir: "↖" }, { speed: 12, dir: "↖" }, { speed: 11, dir: "↖" }],
    tempHours: [75, 73, 72],
    humidity: 38,
    pressure: 1009,
    icons: ["↖", "↖", "↖", "≈", "P"],
    isClosed: false
  },
  {
    game: "BAL @ SEA",
    venue: "T-Mobile Park",
    time: "9:40",
    runs: 0.85,
    hr: 0.92,
    doubleTriple: 0.81,
    single: 0.92,
    receptive: "Medium",
    windHours: [{ speed: 11, dir: "↘" }, { speed: 10, dir: "↘" }, { speed: 9, dir: "↓" }],
    tempHours: [68, 64, 61],
    humidity: 47,
    pressure: 1015,
    icons: ["↘", "↘", "↓", "≈"],
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
