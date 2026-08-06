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
    game: "CHW @ BOS",
    venue: "Fenway Park",
    time: "7:10",
    runs: 1.16,
    hr: 1.09,
    doubleTriple: 1.21,
    single: 1.06,
    receptive: "High",
    windHours: [{ speed: 6, dir: "↑" }, { speed: 5, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [84, 81, 77],
    humidity: 65,
    pressure: 1018,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "LAA @ BAL",
    venue: "Oriole Park",
    time: "12:35",
    runs: 1.15,
    hr: 1.08,
    doubleTriple: 1.17,
    single: 1.07,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 9, dir: "↑" }],
    tempHours: [91, 91, 93],
    humidity: 75,
    pressure: 1020,
    icons: ["↑", "↑", "↑", "~", "💥", "H", "P"],
    isClosed: false
  },
  {
    game: "WAS @ PHI",
    venue: "Citizens Bank Park",
    time: "6:05",
    runs: 1.14,
    hr: 1.40,
    doubleTriple: 0.98,
    single: 0.95,
    receptive: "Very High",
    windHours: [{ speed: 7, dir: "↑" }, { speed: 6, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [91, 90, 84],
    humidity: 50,
    pressure: 1018,
    icons: ["↑", "↑", "↑", "~", "💥"],
    isClosed: false
  },
  {
    game: "ATH @ CIN",
    venue: "Great American BP",
    time: "12:40",
    runs: 1.08,
    hr: 1.17,
    doubleTriple: 0.96,
    single: 0.99,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "↖" }, { speed: 7, dir: "↑" }, { speed: 5, dir: "↖" }],
    tempHours: [90, 88, 95],
    humidity: 68,
    pressure: 1020,
    icons: ["↖", "↑", "↖", "~", "💥", "P"],
    isClosed: false
  },
  {
    game: "MIN @ KC",
    venue: "Kauffman Stadium",
    time: "7:40",
    runs: 1.05,
    hr: 1.18,
    doubleTriple: 1.01,
    single: 0.98,
    receptive: "High",
    windHours: [{ speed: 3, dir: "↘" }, { speed: 4, dir: "↘" }, { speed: 5, dir: "↓" }],
    tempHours: [90, 88, 81],
    humidity: 50,
    pressure: 1012,
    icons: ["↘", "↘", "↓", "💥"],
    isClosed: false
  },
  {
    game: "SD @ ARI",
    venue: "Chase Field",
    time: "9:40",
    runs: 1.01,
    hr: 0.92,
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
    game: "DET @ SEA",
    venue: "T-Mobile Park",
    time: "4:10",
    runs: 0.98,
    hr: 1.12,
    doubleTriple: 0.88,
    single: 0.94,
    receptive: "Medium",
    windHours: [{ speed: 2, dir: "↗" }, { speed: 2, dir: "↗" }, { speed: 2, dir: "↗" }],
    tempHours: [81, 84, 91],
    humidity: 59,
    pressure: 1013,
    icons: ["↗", "↗", "↗", "☀️"],
    isClosed: false
  },
  {
    game: "PIT @ MIL",
    venue: "American Family Fld",
    time: "2:10",
    runs: 0.98,
    hr: 1.16,
    doubleTriple: 0.87,
    single: 0.90,
    receptive: "Low",
    windHours: [{ speed: 4, dir: "↘" }, { speed: 4, dir: "↘" }, { speed: 4, dir: "↘" }],
    tempHours: [81, 79, 77],
    humidity: 61,
    pressure: 1018,
    icons: ["↘", "↘", "↘", "☀️"],
    isClosed: false
  },
  {
    game: "MIA @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 0.96,
    hr: 1.01,
    doubleTriple: 0.92,
    single: 0.99,
    receptive: "Medium",
    windHours: [{ speed: 3, dir: "↖" }, { speed: 5, dir: "↑" }, { speed: 6, dir: "↗" }],
    tempHours: [82, 81, 79],
    humidity: 59,
    pressure: 1020,
    icons: ["↖", "↑", "↗", "☀️", "P"],
    isClosed: false
  },
  {
    game: "NYM @ CLE",
    venue: "Progressive Field",
    time: "1:10",
    runs: 0.94,
    hr: 0.99,
    doubleTriple: 0.87,
    single: 0.98,
    receptive: "High",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 10, dir: "↘" }, { speed: 9, dir: "↘" }],
    tempHours: [86, 86, 86],
    humidity: 65,
    pressure: 1019,
    icons: ["↘", "↘", "↘", "~", "💥", "P"],
    isClosed: false
  },
  {
    game: "TOR @ CHC",
    venue: "Wrigley Field",
    time: "2:20",
    runs: 0.88,
    hr: 1.10,
    doubleTriple: 0.78,
    single: 0.91,
    receptive: "Extreme",
    windHours: [{ speed: 8, dir: "↑" }, { speed: 7, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [72, 72, 72],
    humidity: 91,
    pressure: 1018,
    icons: ["↑", "↑", "↑", "~", "H"],
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
