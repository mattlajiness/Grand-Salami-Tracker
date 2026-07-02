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
    game: "MIA @ COL",
    venue: "Coors Field",
    time: "3:10",
    runs: 1.29,
    hr: 1.30,
    doubleTriple: 1.18,
    single: 1.13,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "←" }, { speed: 6, dir: "←" }, { speed: 4, dir: "↙" }],
    tempHours: [91, 93, 95],
    humidity: 5,
    pressure: 1005,
    icons: ["←", "←", "↙", "~", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "TB @ KC",
    venue: "Kauffman Stadium",
    time: "7:40",
    runs: 1.14,
    hr: 1.38,
    doubleTriple: 0.97,
    single: 1.01,
    receptive: "High",
    windHours: [{ speed: 14, dir: "↗" }, { speed: 11, dir: "↗" }, { speed: 9, dir: "↗" }],
    tempHours: [88, 86, 82],
    humidity: 69,
    pressure: 1013,
    icons: ["↗", "↗", "↗", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "PIT @ PHI",
    venue: "Citizens Bank Park",
    time: "12:35",
    runs: 1.13,
    hr: 1.34,
    doubleTriple: 0.97,
    single: 0.98,
    receptive: "Very High",
    windHours: [{ speed: 7, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 8, dir: "→" }],
    tempHours: [104, 106, 108],
    humidity: 39,
    pressure: 1016,
    icons: ["↘", "↘", "→", "~", "☀️"],
    isClosed: false
  },
  {
    game: "CHW @ CLE",
    venue: "Progressive Field",
    time: "6:40",
    runs: 1.12,
    hr: 1.19,
    doubleTriple: 0.99,
    single: 1.03,
    receptive: "High",
    windHours: [{ speed: 11, dir: "↗" }, { speed: 9, dir: "↗" }, { speed: 9, dir: "↗" }],
    tempHours: [90, 88, 86],
    humidity: 59,
    pressure: 1016,
    icons: ["↗", "↗", "↗", "~", "☀️"],
    isClosed: false
  },
  {
    game: "CIN @ MIL",
    venue: "American Family Fld",
    time: "2:10",
    runs: 1.04,
    hr: 1.24,
    doubleTriple: 0.93,
    single: 0.91,
    receptive: "Low",
    windHours: [{ speed: 14, dir: "↖" }, { speed: 14, dir: "↖" }, { speed: 14, dir: "↖" }],
    tempHours: [97, 99, 99],
    humidity: 53,
    pressure: 1014,
    icons: ["↖", "↖", "↖", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "STL @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 0.99,
    hr: 1.08,
    doubleTriple: 0.91,
    single: 1.00,
    receptive: "Medium",
    windHours: [{ speed: 5, dir: "↘" }, { speed: 4, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [95, 90, 84],
    humidity: 31,
    pressure: 1016,
    icons: ["↘", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "SD @ LAD",
    venue: "Dodger Stadium",
    time: "10:10",
    runs: 0.98,
    hr: 1.10,
    doubleTriple: 0.97,
    single: 0.95,
    receptive: "Consistent",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }, { speed: 5, dir: "↗" }],
    tempHours: [73, 72, 68],
    humidity: 43,
    pressure: 1012,
    icons: ["↗", "↗", "↗", "~"],
    isClosed: false
  },
  {
    game: "DET @ TEX",
    venue: "Globe Life Field",
    time: "8:05",
    runs: 0.92,
    hr: 0.89,
    doubleTriple: 0.92,
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
    game: "LAA @ SEA",
    venue: "T-Mobile Park",
    time: "9:40",
    runs: 0.89,
    hr: 0.98,
    doubleTriple: 0.82,
    single: 0.93,
    receptive: "Medium",
    windHours: [{ speed: 3, dir: "↘" }, { speed: 5, dir: "↘" }, { speed: 6, dir: "↘" }],
    tempHours: [72, 68, 64],
    humidity: 43,
    pressure: 1014,
    icons: ["↘", "↘", "↘"],
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
