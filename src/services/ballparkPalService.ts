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
    game: "STL @ CIN",
    venue: "Great American BP",
    time: "12:40",
    runs: 1.07,
    hr: 1.02,
    doubleTriple: 1.09,
    single: 0.98,
    receptive: "Low",
    windHours: [{ speed: 3, dir: "↘" }, { speed: 3, dir: "↗" }, { speed: 5, dir: "↗" }],
    tempHours: [75, 76, 77],
    humidity: 87,
    pressure: 1029,
    icons: ["↘", "↗", "↗", "H", "P"],
    isClosed: false
  },
  {
    game: "NYY @ BAL",
    venue: "Oriole Park",
    time: "6:35",
    runs: 1.04,
    hr: 0.99,
    doubleTriple: 1.10,
    single: 1.03,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 5, dir: "↓" }, { speed: 3, dir: "↓" }],
    tempHours: [83, 81, 79],
    humidity: 61,
    pressure: 1013,
    icons: ["↘", "↓", "↓", "☀️"],
    isClosed: false
  },
  {
    game: "ATH @ KC",
    venue: "Kauffman Stadium",
    time: "2:10",
    runs: 1.01,
    hr: 1.18,
    doubleTriple: 1.01,
    single: 0.94,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↙" }, { speed: 7, dir: "↙" }, { speed: 6, dir: "↙" }],
    tempHours: [80, 81, 82],
    humidity: 74,
    pressure: 1012,
    icons: ["↙", "↙", "↙", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "ATL @ CHW",
    venue: "Rate Field",
    time: "2:10",
    runs: 0.98,
    hr: 0.91,
    doubleTriple: 0.92,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 5, dir: "↘" }, { speed: 5, dir: "↘" }, { speed: 5, dir: "↘" }],
    tempHours: [74, 74, 74],
    humidity: 64,
    pressure: 1016,
    icons: ["↘", "↘", "↘", "〜"],
    isClosed: false
  },
  {
    game: "SF @ CLE",
    venue: "Progressive Field",
    time: "1:10",
    runs: 0.97,
    hr: 0.90,
    doubleTriple: 1.03,
    single: 0.98,
    receptive: "High",
    windHours: [{ speed: 8, dir: "↙" }, { speed: 9, dir: "↓" }, { speed: 9, dir: "↓" }],
    tempHours: [76, 76, 76],
    humidity: 63,
    pressure: 1016,
    icons: ["↙", "↓", "↓", "〜", "☀️"],
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
    time: "1:10",
    runs: 0.95,
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
    game: "SEA @ MIL",
    venue: "American Family Fld",
    time: "2:10",
    runs: 0.93,
    hr: 0.98,
    doubleTriple: 0.93,
    single: 0.90,
    receptive: "Low",
    windHours: [{ speed: 5, dir: "↘" }, { speed: 5, dir: "↘" }, { speed: 5, dir: "↘" }],
    tempHours: [76, 77, 77],
    humidity: 52,
    pressure: 1015,
    icons: ["↘", "↘", "↘", "〜", "☀️"],
    isClosed: false
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
