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
    game: "LAA @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.27,
    hr: 1.40,
    doubleTriple: 1.15,
    single: 1.05,
    receptive: "Very High",
    windHours: [{ speed: 17, dir: "↑" }, { speed: 17, dir: "↑" }, { speed: 15, dir: "↑" }],
    tempHours: [81, 77, 72],
    humidity: 28,
    pressure: 1008,
    icons: ["↑", "↑", "↑", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "TOR @ BOS",
    venue: "Fenway Park",
    time: "1:35",
    runs: 1.21,
    hr: 1.05,
    doubleTriple: 1.39,
    single: 1.06,
    receptive: "High",
    windHours: [{ speed: 18, dir: "↖" }, { speed: 19, dir: "↖" }, { speed: 18, dir: "↑" }],
    tempHours: [72, 73, 77],
    humidity: 88,
    pressure: 1002,
    icons: ["↖", "↖", "↑", "≈", "H", "P"],
    isClosed: false
  },
  {
    game: "NYM @ PHI",
    venue: "Citizens Bank Park",
    time: "6:40",
    runs: 1.15,
    hr: 1.27,
    doubleTriple: 0.95,
    single: 1.06,
    receptive: "Very High",
    windHours: [{ speed: 17, dir: "↗" }, { speed: 14, dir: "↗" }, { speed: 13, dir: "→" }],
    tempHours: [90, 86, 84],
    humidity: 36,
    pressure: 1003,
    icons: ["↗", "↗", "→", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "CHW @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 1.05,
    hr: 1.26,
    doubleTriple: 0.91,
    single: 0.94,
    receptive: "High",
    windHours: [{ speed: 17, dir: "↑" }, { speed: 17, dir: "↑" }, { speed: 15, dir: "↗" }],
    tempHours: [88, 86, 82],
    humidity: 34,
    pressure: 1001,
    icons: ["↑", "↑", "↗", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "STL @ KC",
    venue: "Kauffman Stadium",
    time: "7:40",
    runs: 1.01,
    hr: 1.16,
    doubleTriple: 1.01,
    single: 0.94,
    receptive: "High",
    windHours: [{ speed: 2, dir: "↗" }, { speed: 2, dir: "↗" }, { speed: 2, dir: "↑" }],
    tempHours: [75, 72, 70],
    humidity: 58,
    pressure: 1013,
    icons: ["↗", "↗", "↑"],
    isClosed: false
  },
  {
    game: "CLE @ MIL",
    venue: "American Family Fld",
    time: "2:10",
    runs: 0.97,
    hr: 1.12,
    doubleTriple: 0.83,
    single: 0.94,
    receptive: "Low",
    windHours: [{ speed: 14, dir: "↑" }, { speed: 13, dir: "↑" }, { speed: 13, dir: "↑" }],
    tempHours: [68, 70, 70],
    humidity: 65,
    pressure: 1007,
    icons: ["↑", "↑", "↖", "≈", "P"],
    isClosed: false
  },
  {
    game: "MIN @ TEX",
    venue: "Globe Life Field",
    time: "2:35",
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
    game: "SF @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 0.92,
    hr: 0.95,
    doubleTriple: 0.79,
    single: 1.06,
    receptive: "Medium",
    windHours: [{ speed: 3, dir: "↘" }, { speed: 2, dir: "↘" }, { speed: 1, dir: "→" }],
    tempHours: [72, 72, 70],
    humidity: 97,
    pressure: 1013,
    icons: ["↘", "↘", "→", "H"],
    isClosed: false
  },
  {
    game: "BAL @ SEA",
    venue: "T-Mobile Park",
    time: "4:10",
    runs: 0.90,
    hr: 1.01,
    doubleTriple: 0.79,
    single: 0.95,
    receptive: "Medium",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 9, dir: "↘" }, { speed: 9, dir: "↘" }],
    tempHours: [73, 75, 75],
    humidity: 47,
    pressure: 1014,
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
