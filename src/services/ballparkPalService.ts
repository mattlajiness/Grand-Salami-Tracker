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
    game: "CIN @ COL",
    venue: "Coors Field",
    time: "3:10",
    runs: 1.36,
    hr: 1.29,
    doubleTriple: 1.33,
    single: 1.14,
    receptive: "Low",
    windHours: [{ speed: 2, dir: "←" }, { speed: 1, dir: "↓" }, { speed: 1, dir: "↖" }],
    tempHours: [97, 99, 99],
    humidity: 14,
    pressure: 1009,
    icons: ["←", "↓", "↖", "💥", "H", "P"],
    isClosed: false
  },
  {
    game: "WAS @ ATH",
    venue: "Sutter Health Park",
    time: "4:05",
    runs: 1.27,
    hr: 1.37,
    doubleTriple: 1.15,
    single: 1.07,
    receptive: "Very High",
    windHours: [{ speed: 4, dir: "↗" }, { speed: 6, dir: "↑" }, { speed: 8, dir: "↑" }],
    tempHours: [86, 89, 91],
    humidity: 19,
    pressure: 1010,
    icons: ["↑", "↑", "↑", "~", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "TB @ BOS",
    venue: "Fenway Park",
    time: "1:35",
    runs: 1.14,
    hr: 0.97,
    doubleTriple: 1.26,
    single: 1.08,
    receptive: "High",
    windHours: [{ speed: 14, dir: "→" }, { speed: 13, dir: "→" }, { speed: 12, dir: "→" }],
    tempHours: [84, 86, 86],
    humidity: 38,
    pressure: 1006,
    icons: ["→", "→", "→", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "DET @ LAA",
    venue: "Angel Stadium",
    time: "4:07",
    runs: 1.06,
    hr: 1.13,
    doubleTriple: 0.96,
    single: 1.04,
    receptive: "Consistent",
    windHours: [{ speed: 10, dir: "↑" }, { speed: 10, dir: "↑" }, { speed: 10, dir: "↑" }],
    tempHours: [75, 82, 82],
    humidity: 77,
    pressure: 1012,
    icons: ["↑", "↑", "↑", "≈", "H"],
    isClosed: false
  },
  {
    game: "SD @ KC",
    venue: "Kauffman Stadium",
    time: "2:10",
    runs: 1.06,
    hr: 1.22,
    doubleTriple: 1.00,
    single: 0.99,
    receptive: "High",
    windHours: [{ speed: 6, dir: "↖" }, { speed: 6, dir: "↖" }, { speed: 7, dir: "↖" }],
    tempHours: [99, 99, 99],
    humidity: 41,
    pressure: 1014,
    icons: ["↖", "↖", "↖", "~", "💥"],
    isClosed: false
  },
  {
    game: "PIT @ CLE",
    venue: "Progressive Field",
    time: "1:40",
    runs: 1.04,
    hr: 0.96,
    doubleTriple: 1.01,
    single: 1.04,
    receptive: "High",
    windHours: [{ speed: 11, dir: "↓" }, { speed: 9, dir: "↓" }, { speed: 8, dir: "↓" }],
    tempHours: [81, 79, 82],
    humidity: 52,
    pressure: 1016,
    icons: ["↓", "↓", "↓", "~", "☀️"],
    isClosed: false
  },
  {
    game: "NYM @ PHI",
    venue: "Citizens Bank Park",
    time: "1:35",
    runs: 1.03,
    hr: 1.11,
    doubleTriple: 0.95,
    single: 0.99,
    receptive: "Very High",
    windHours: [{ speed: 11, dir: "↘" }, { speed: 11, dir: "↘" }, { speed: 11, dir: "↘" }],
    tempHours: [84, 88, 90],
    humidity: 55,
    pressure: 1011,
    icons: ["↘", "↘", "↘", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "TEX @ ATL",
    venue: "Truist Park",
    time: "1:35",
    runs: 1.02,
    hr: 1.09,
    doubleTriple: 0.99,
    single: 0.99,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "↖" }, { speed: 7, dir: "↖" }, { speed: 8, dir: "↖" }],
    tempHours: [91, 93, 93],
    humidity: 55,
    pressure: 1014,
    icons: ["↖", "↖", "↖", "~", "💥"],
    isClosed: false
  },
  {
    game: "STL @ ARI",
    venue: "Chase Field",
    time: "4:10",
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
    game: "LAD @ NYY",
    venue: "Yankee Stadium",
    time: "12:35",
    runs: 0.98,
    hr: 1.14,
    doubleTriple: 0.80,
    single: 0.97,
    receptive: "High",
    windHours: [{ speed: 12, dir: "↗" }, { speed: 12, dir: "↗" }, { speed: 12, dir: "↗" }],
    tempHours: [79, 81, 82],
    humidity: 54,
    pressure: 1009,
    icons: ["↗", "↗", "↗", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "BAL @ HOU",
    venue: "Daikin Park",
    time: "2:10",
    runs: 0.96,
    hr: 1.05,
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
    game: "MIA @ MIL",
    venue: "American Family Fld",
    time: "2:10",
    runs: 0.96,
    hr: 1.05,
    doubleTriple: 0.97,
    single: 0.89,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "↓" }, { speed: 6, dir: "↓" }, { speed: 6, dir: "↓" }],
    tempHours: [84, 84, 86],
    humidity: 52,
    pressure: 1017,
    icons: ["↓", "↓", "↓", "~", "☀️"],
    isClosed: false
  },
  {
    game: "SF @ SEA",
    venue: "T-Mobile Park",
    time: "4:10",
    runs: 0.95,
    hr: 1.07,
    doubleTriple: 0.84,
    single: 0.95,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 8, dir: "↘" }],
    tempHours: [75, 75, 77],
    humidity: 61,
    pressure: 1016,
    icons: ["↘", "↘", "↘", "~"],
    isClosed: false
  },
  {
    game: "CHW @ TOR",
    venue: "Rogers Centre",
    time: "12:15",
    runs: 0.95,
    hr: 1.03,
    doubleTriple: 0.94,
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
    game: "LAD @ NYY",
    venue: "Yankee Stadium",
    time: "7:20",
    runs: 0.94,
    hr: 1.07,
    doubleTriple: 0.80,
    single: 0.96,
    receptive: "High",
    windHours: [{ speed: 11, dir: "↗" }, { speed: 9, dir: "→" }, { speed: 9, dir: "→" }],
    tempHours: [81, 79, 75],
    humidity: 33,
    pressure: 1011,
    icons: ["↗", "→", "→", "~", "☀️"],
    isClosed: false
  },
  {
    game: "MIN @ CHC",
    venue: "Wrigley Field",
    time: "2:20",
    runs: 0.89,
    hr: 0.95,
    doubleTriple: 0.83,
    single: 0.97,
    receptive: "Extreme",
    windHours: [{ speed: 8, dir: "↓" }, { speed: 8, dir: "↓" }, { speed: 9, dir: "↓" }],
    tempHours: [79, 82, 84],
    humidity: 63,
    pressure: 1017,
    icons: ["↓", "↓", "↓", "~", "☀️"],
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
