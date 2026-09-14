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
    runs: 1.36,
    hr: 1.27,
    doubleTriple: 1.29,
    single: 1.18,
    receptive: "Low",
    windHours: [{ speed: 3, dir: "↙" }, { speed: 6, dir: "↘" }, { speed: 9, dir: "↘" }],
    tempHours: [88, 86, 82],
    humidity: 17,
    pressure: 1002,
    icons: ["↙", "↘", "↘", "〜", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "LAD @ CIN",
    venue: "Great American BP",
    time: "6:40",
    runs: 1.08,
    hr: 1.02,
    doubleTriple: 1.08,
    single: 1.01,
    receptive: "Low",
    windHours: [{ speed: 4, dir: "↘" }, { speed: 4, dir: "↘" }, { speed: 5, dir: "↘" }],
    tempHours: [75, 73, 68],
    humidity: 39,
    pressure: 1021,
    icons: ["↘", "↘", "↘", "P"],
    isClosed: false
  },
  {
    game: "NYY @ MIN",
    venue: "Target Field",
    time: "7:40",
    runs: 1.05,
    hr: 0.90,
    doubleTriple: 1.20,
    single: 0.99,
    receptive: "Medium",
    windHours: [{ speed: 15, dir: "↙" }, { speed: 14, dir: "↙" }, { speed: 12, dir: "↙" }],
    tempHours: [57, 59, 59],
    humidity: 93,
    pressure: 1009,
    icons: ["↙", "↙", "↙", "≈", "H", "P"],
    isClosed: false
  },
  {
    game: "ATL @ CHC",
    venue: "Wrigley Field",
    time: "7:40",
    runs: 1.01,
    hr: 1.11,
    doubleTriple: 0.91,
    single: 0.98,
    receptive: "Extreme",
    windHours: [{ speed: 11, dir: "↖" }, { speed: 10, dir: "↖" }, { speed: 11, dir: "↖" }],
    tempHours: [73, 72, 70],
    humidity: 32,
    pressure: 1018,
    icons: ["↖", "↖", "↖", "≈"],
    isClosed: false
  },
  {
    game: "MIA @ ARI",
    venue: "Chase Field",
    time: "9:40",
    runs: 1.00,
    hr: 0.90,
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
    game: "SF @ STL",
    venue: "Busch Stadium",
    time: "7:45",
    runs: 0.96,
    hr: 0.89,
    doubleTriple: 0.99,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 10, dir: "↙" }, { speed: 8, dir: "←" }, { speed: 8, dir: "↙" }],
    tempHours: [88, 86, 84],
    humidity: 31,
    pressure: 1015,
    icons: ["↙", "←", "↙", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "SEA @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 0.94,
    hr: 0.96,
    doubleTriple: 0.93,
    single: 0.97,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 8, dir: "↗" }, { speed: 7, dir: "↗" }],
    tempHours: [73, 73, 72],
    humidity: 65,
    pressure: 1009,
    icons: ["↗", "↗", "↗", "〜", "P"],
    isClosed: false
  },
  {
    game: "DET @ TOR",
    venue: "Rogers Centre",
    time: "7:07",
    runs: 0.90,
    hr: 0.82,
    doubleTriple: 0.90,
    single: 1.06,
    receptive: "Minimal",
    windHours: [{ speed: 6, dir: "↙" }, { speed: 5, dir: "↙" }, { speed: 2, dir: "↙" }],
    tempHours: [63, 61, 59],
    humidity: 44,
    pressure: 1023,
    icons: ["↙", "↙", "↙", "P"],
    isClosed: false
  },
  {
    game: "BAL @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.89,
    hr: 0.90,
    doubleTriple: 0.81,
    single: 0.97,
    receptive: "Low",
    windHours: [{ speed: 11, dir: "↓" }, { speed: 9, dir: "↓" }, { speed: 8, dir: "↘" }],
    tempHours: [72, 72, 70],
    humidity: 29,
    pressure: 1020,
    icons: ["↓", "↓", "↘", "〜", "P"],
    isClosed: false
  },
  {
    game: "CHW @ CLE",
    venue: "Progressive Field",
    time: "6:40",
    runs: 0.87,
    hr: 0.73,
    doubleTriple: 1.02,
    single: 0.93,
    receptive: "High",
    windHours: [{ speed: 3, dir: "↙" }, { speed: 3, dir: "↙" }, { speed: 3, dir: "←" }],
    tempHours: [64, 63, 64],
    humidity: 47,
    pressure: 1024,
    icons: ["↙", "↙", "←", "P"],
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
