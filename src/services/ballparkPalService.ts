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
    game: "SD @ COL",
    venue: "Coors Field",
    time: "8:40",
    runs: 1.31,
    hr: 1.22,
    doubleTriple: 1.31,
    single: 1.13,
    receptive: "Low",
    windHours: [{ speed: 12, dir: "↗" }, { speed: 17, dir: "↗" }, { speed: 14, dir: "↗" }],
    tempHours: [75, 70, 72],
    humidity: 39,
    pressure: 1016,
    icons: ["↗", "↗", "↗", "≈"],
    isClosed: false
  },
  {
    game: "LAD @ CIN",
    venue: "Great American BP",
    time: "6:40",
    runs: 1.09,
    hr: 1.15,
    doubleTriple: 0.95,
    single: 1.02,
    receptive: "Low",
    windHours: [{ speed: 5, dir: "↑" }, { speed: 3, dir: "↖" }, { speed: 4, dir: "↖" }],
    tempHours: [90, 88, 84],
    humidity: 48,
    pressure: 1023,
    icons: ["↑", "↖", "↖", "💥", "P"],
    isClosed: false
  },
  {
    game: "DET @ TOR",
    venue: "Rogers Centre",
    time: "3:07",
    runs: 1.07,
    hr: 1.06,
    doubleTriple: 1.08,
    single: 1.03,
    receptive: "Minimal",
    windHours: [{ speed: 8, dir: "↓" }, { speed: 8, dir: "↓" }, { speed: 8, dir: "↙" }],
    tempHours: [77, 75, 73],
    humidity: 42,
    pressure: 1026,
    icons: ["↓", "↓", "↙", "〜", "☀️", "P"],
    isClosed: false
  },
  {
    game: "PHI @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.02,
    hr: 1.04,
    doubleTriple: 1.03,
    single: 1.02,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "↖" }, { speed: 6, dir: "↖" }, { speed: 6, dir: "↖" }],
    tempHours: [82, 77, 73],
    humidity: 47,
    pressure: 1024,
    icons: ["↖", "↖", "↖", "〜", "☀️", "P"],
    isClosed: false
  },
  {
    game: "MIA @ ARI",
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
    game: "MIL @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 0.99,
    hr: 0.85,
    doubleTriple: 1.11,
    single: 1.00,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↗" }, { speed: 2, dir: "↗" }, { speed: 1, dir: "↗" }],
    tempHours: [79, 77, 75],
    humidity: 74,
    pressure: 1024,
    icons: ["↗", "↗", "↗", "☀️", "P"],
    isClosed: false
  },
  {
    game: "SEA @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 0.98,
    hr: 0.96,
    doubleTriple: 0.92,
    single: 1.04,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }],
    tempHours: [72, 72, 70],
    humidity: 66,
    pressure: 1014,
    icons: ["↑", "↑", "↑", "〜"],
    isClosed: false
  },
  {
    game: "SF @ STL",
    venue: "Busch Stadium",
    time: "1:15",
    runs: 0.98,
    hr: 0.96,
    doubleTriple: 0.98,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 5, dir: "↑" }, { speed: 6, dir: "↑" }, { speed: 5, dir: "↑" }],
    tempHours: [88, 90, 93],
    humidity: 56,
    pressure: 1023,
    icons: ["↑", "↑", "↑", "〜", "☀️", "P"],
    isClosed: false
  },
  {
    game: "BAL @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.95,
    hr: 0.97,
    doubleTriple: 0.89,
    single: 0.97,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↑" }, { speed: 7, dir: "↖" }, { speed: 6, dir: "↖" }],
    tempHours: [73, 73, 73],
    humidity: 63,
    pressure: 1025,
    icons: ["↑", "↖", "↖", "〜", "P"],
    isClosed: false
  },
  {
    game: "KC @ HOU",
    venue: "Daikin Park",
    time: "8:10",
    runs: 0.95,
    hr: 1.05,
    doubleTriple: 0.88,
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
    game: "CHW @ CLE",
    venue: "Progressive Field",
    time: "1:10",
    runs: 0.95,
    hr: 0.88,
    doubleTriple: 0.94,
    single: 1.00,
    receptive: "High",
    windHours: [{ speed: 4, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 9, dir: "↓" }],
    tempHours: [72, 73, 72],
    humidity: 90,
    pressure: 1026,
    icons: ["↘", "↘", "↓", "〜", "H", "P"],
    isClosed: false
  },
  {
    game: "ATH @ TB",
    venue: "Tropicana Field",
    time: "6:40",
    runs: 0.94,
    hr: 0.97,
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
    game: "NYY @ MIN",
    venue: "Target Field",
    time: "1:40",
    runs: 0.93,
    hr: 0.72,
    doubleTriple: 1.03,
    single: 1.03,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "↙" }, { speed: 6, dir: "↙" }, { speed: 7, dir: "↙" }],
    tempHours: [68, 72, 73],
    humidity: 39,
    pressure: 1027,
    icons: ["↙", "↙", "↙", "〜", "P"],
    isClosed: false
  },
  {
    game: "BOS @ TEX",
    venue: "Globe Life Field",
    time: "8:05",
    runs: 0.93,
    hr: 0.88,
    doubleTriple: 0.93,
    single: 0.99,
    receptive: "Roof Closed",
    windHours: [],
    tempHours: [],
    humidity: 0,
    pressure: 0,
    icons: ["🏟️"],
    isClosed: true
  },
  {
    game: "ATL @ CHC",
    venue: "Wrigley Field",
    time: "7:40",
    runs: 0.67,
    hr: 0.64,
    doubleTriple: 0.76,
    single: 0.89,
    receptive: "Extreme",
    windHours: [{ speed: 8, dir: "↓" }, { speed: 7, dir: "↓" }, { speed: 6, dir: "↓" }],
    tempHours: [66, 66, 66],
    humidity: 87,
    pressure: 1025,
    icons: ["↓", "↓", "↓", "〜", "H", "P"],
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
  'NYM': ['NYM'],
  'LAA': ['ANA', 'LAA'],
  'ANA': ['LAA', 'ANA'],
  'MIA': ['MIA', 'FLA'],
  'FLA': ['MIA', 'FLA'],
  'CHC': ['CHC', 'CHN'],
  'CHN': ['CHC', 'CHN'],
  'STL': ['STL', 'SLN'],
  'SLN': ['STL', 'SLN']
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
