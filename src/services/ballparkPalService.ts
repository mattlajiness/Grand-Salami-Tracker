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
    time: "8:10",
    runs: 1.35,
    hr: 1.26,
    doubleTriple: 1.21,
    single: 1.20,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "↙" }, { speed: 6, dir: "↙" }, { speed: 19, dir: "↓" }],
    tempHours: [93, 91, 86],
    humidity: 6,
    pressure: 1004,
    icons: ["↙", "↙", "↓", "≈", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "MIA @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.30,
    hr: 1.35,
    doubleTriple: 1.25,
    single: 1.06,
    receptive: "Very High",
    windHours: [{ speed: 13, dir: "↑" }, { speed: 13, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [91, 86, 77],
    humidity: 16,
    pressure: 1010,
    icons: ["↑", "↑", "↑", "≈", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "BAL @ CIN",
    venue: "Great American BP",
    time: "7:10",
    runs: 1.17,
    hr: 1.24,
    doubleTriple: 1.03,
    single: 1.03,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "↑" }, { speed: 5, dir: "↑" }, { speed: 4, dir: "↗" }],
    tempHours: [91, 86, 82],
    humidity: 60,
    pressure: 1015,
    icons: ["↑", "↑", "↗", "☀️"],
    isClosed: false
  },
  {
    game: "STL @ CHC",
    venue: "Wrigley Field",
    time: "4:05",
    runs: 1.09,
    hr: 1.22,
    doubleTriple: 0.96,
    single: 0.99,
    receptive: "Extreme",
    windHours: [{ speed: 8, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 9, dir: "↑" }],
    tempHours: [84, 83, 82],
    humidity: 83,
    pressure: 1015,
    icons: ["↑", "↑", "↑", "~", "☀️", "H"],
    isClosed: false
  },
  {
    game: "MIN @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 1.09,
    hr: 1.26,
    doubleTriple: 0.90,
    single: 0.99,
    receptive: "High",
    windHours: [{ speed: 6, dir: "↑" }, { speed: 13, dir: "↑" }, { speed: 11, dir: "↗" }],
    tempHours: [99, 91, 90],
    humidity: 33,
    pressure: 1011,
    icons: ["↑", "↑", "↗", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "CHW @ CLE",
    venue: "Progressive Field",
    time: "7:10",
    runs: 1.08,
    hr: 1.18,
    doubleTriple: 0.97,
    single: 1.01,
    receptive: "High",
    windHours: [{ speed: 7, dir: "→" }, { speed: 7, dir: "→" }, { speed: 7, dir: "↗" }],
    tempHours: [84, 84, 82],
    humidity: 71,
    pressure: 1015,
    icons: ["→", "→", "↗", "~", "☀️"],
    isClosed: false
  },
  {
    game: "PIT @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.06,
    hr: 1.05,
    doubleTriple: 0.98,
    single: 1.08,
    receptive: "Med-High",
    windHours: [{ speed: 5, dir: "↓" }, { speed: 5, dir: "↓" }, { speed: 4, dir: "↙" }],
    tempHours: [102, 100, 91],
    humidity: 28,
    pressure: 1013,
    icons: ["↓", "↓", "↙", "☀️"],
    isClosed: false
  },
  {
    game: "BOS @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 1.02,
    hr: 1.05,
    doubleTriple: 0.97,
    single: 1.01,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }],
    tempHours: [75, 73, 70],
    humidity: 46,
    pressure: 1014,
    icons: ["↑", "↑", "↑", "~"],
    isClosed: false
  },
  {
    game: "MIL @ ARI",
    venue: "Chase Field",
    time: "9:45",
    runs: 1.01,
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
    game: "SD @ LAD",
    venue: "Dodger Stadium",
    time: "10:10",
    runs: 0.97,
    hr: 1.09,
    doubleTriple: 0.96,
    single: 0.96,
    receptive: "Consistent",
    windHours: [{ speed: 8, dir: "↑" }, { speed: 6, dir: "↑" }, { speed: 5, dir: "↑" }],
    tempHours: [73, 72, 70],
    humidity: 44,
    pressure: 1014,
    icons: ["↑", "↑", "↑", "~"],
    isClosed: false
  },
  {
    game: "NYM @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 0.97,
    hr: 1.06,
    doubleTriple: 0.94,
    single: 0.96,
    receptive: "Medium",
    windHours: [{ speed: 4, dir: "↙" }, { speed: 2, dir: "←" }, { speed: 2, dir: "←" }],
    tempHours: [95, 91, 90],
    humidity: 32,
    pressure: 1015,
    icons: ["↙", "←", "←", "☀️"],
    isClosed: false
  },
  {
    game: "TB @ HOU",
    venue: "Daikin Park",
    time: "8:15",
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
    game: "TOR @ SEA",
    venue: "T-Mobile Park",
    time: "10:10",
    runs: 0.88,
    hr: 0.98,
    doubleTriple: 0.81,
    single: 0.92,
    receptive: "Medium",
    windHours: [{ speed: 7, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 5, dir: "↘" }],
    tempHours: [70, 64, 61],
    humidity: 54,
    pressure: 1016,
    icons: ["↘", "↘", "↘", "~"],
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
