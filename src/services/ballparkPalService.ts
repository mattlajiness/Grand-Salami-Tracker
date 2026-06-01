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
    runs: 1.09,
    hr: 1.11,
    doubleTriple: 1.05,
    single: 0.98,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "→" }, { speed: 5, dir: "→" }, { speed: 5, dir: "→" }],
    tempHours: [70, 64, 63],
    humidity: 56,
    pressure: 1016,
    icons: ["→", "→", "→", "~"],
    isClosed: false
  },
  {
    game: "COL @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 1.04,
    hr: 1.04,
    doubleTriple: 1.05,
    single: 1.00,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [73, 72, 70],
    humidity: 48,
    pressure: 1012,
    icons: ["↑", "↑", "↑", "~"],
    isClosed: false
  },
  {
    game: "CHW @ MIN",
    venue: "Target Field",
    time: "7:40",
    runs: 1.01,
    hr: 0.81,
    doubleTriple: 1.12,
    single: 1.03,
    receptive: "Medium",
    windHours: [{ speed: 8, dir: "↓" }, { speed: 7, dir: "↓" }, { speed: 7, dir: "↓" }],
    tempHours: [77, 75, 72],
    humidity: 48,
    pressure: 1020,
    icons: ["↓", "↓", "↓", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "LAD @ ARI",
    venue: "Chase Field",
    time: "9:40",
    runs: 1.00,
    hr: 0.92,
    doubleTriple: 1.10,
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
    game: "MIA @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 0.97,
    hr: 0.83,
    doubleTriple: 1.07,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 6, dir: "↓" }, { speed: 7, dir: "↙" }],
    tempHours: [73, 70, 64],
    humidity: 47,
    pressure: 1015,
    icons: ["↘", "↓", "↙", "~"],
    isClosed: false
  },
  {
    game: "SF @ MIL",
    venue: "American Family Fld",
    time: "7:40",
    runs: 0.95,
    hr: 1.06,
    doubleTriple: 0.86,
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
    game: "DET @ TB",
    venue: "Tropicana Field",
    time: "6:40",
    runs: 0.94,
    hr: 0.97,
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
    game: "TEX @ STL",
    venue: "Busch Stadium",
    time: "7:45",
    runs: 0.90,
    hr: 0.85,
    doubleTriple: 0.97,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 7, dir: "↓" }, { speed: 7, dir: "↓" }],
    tempHours: [79, 77, 75],
    humidity: 74,
    pressure: 1014,
    icons: ["↘", "↓", "↓", "~", "☀️"],
    isClosed: false
  },
  {
    game: "NYM @ SEA",
    venue: "T-Mobile Park",
    time: "9:40",
    runs: 0.84,
    hr: 0.92,
    doubleTriple: 0.80,
    single: 0.91,
    receptive: "Medium",
    windHours: [{ speed: 7, dir: "↘" }, { speed: 6, dir: "↘" }, { speed: 5, dir: "↘" }],
    tempHours: [72, 66, 63],
    humidity: 36,
    pressure: 1018,
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
