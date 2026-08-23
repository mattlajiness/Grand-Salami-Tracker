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
    game: "CLE @ COL",
    venue: "Coors Field",
    time: "3:10",
    runs: 1.40,
    hr: 1.32,
    doubleTriple: 1.21,
    single: 1.24,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "↙" }, { speed: 4, dir: "↖" }, { speed: 17, dir: "↑" }],
    tempHours: [93, 95, 88],
    humidity: 16,
    pressure: 1010,
    icons: ["↙", "↖", "↑", "〜", "💥", "H", "P"],
    isClosed: false
  },
  {
    game: "SF @ BOS",
    venue: "Fenway Park",
    time: "3:15",
    runs: 1.20,
    hr: 1.12,
    doubleTriple: 1.24,
    single: 1.09,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↑" }, { speed: 7, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [72, 72, 77],
    humidity: 89,
    pressure: 1010,
    icons: ["↑", "↑", "↑", "〜", "H", "P"],
    isClosed: false
  },
  {
    game: "STL @ PHI",
    venue: "Citizens Bank Park",
    time: "1:35",
    runs: 1.09,
    hr: 1.29,
    doubleTriple: 0.95,
    single: 0.97,
    receptive: "Very High",
    windHours: [{ speed: 11, dir: "→" }, { speed: 12, dir: "→" }, { speed: 12, dir: "→" }],
    tempHours: [82, 82, 82],
    humidity: 64,
    pressure: 1010,
    icons: ["→", "→", "→", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "PIT @ LAD",
    venue: "Dodger Stadium",
    time: "4:10",
    runs: 1.08,
    hr: 1.30,
    doubleTriple: 0.99,
    single: 0.98,
    receptive: "Consistent",
    windHours: [{ speed: 8, dir: "↗" }, { speed: 11, dir: "↗" }, { speed: 11, dir: "↗" }],
    tempHours: [95, 93, 91],
    humidity: 31,
    pressure: 1011,
    icons: ["↗", "↗", "↗", "≈", "💥"],
    isClosed: false
  },
  {
    game: "TB @ BAL",
    venue: "Oriole Park",
    time: "1:35",
    runs: 1.06,
    hr: 1.01,
    doubleTriple: 1.00,
    single: 1.09,
    receptive: "Med-High",
    windHours: [{ speed: 12, dir: "→" }, { speed: 12, dir: "→" }, { speed: 9, dir: "→" }],
    tempHours: [81, 84, 84],
    humidity: 53,
    pressure: 1011,
    icons: ["→", "→", "→", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "TOR @ NYY",
    venue: "Yankee Stadium",
    time: "1:35",
    runs: 1.05,
    hr: 1.24,
    doubleTriple: 0.92,
    single: 0.94,
    receptive: "High",
    windHours: [{ speed: 9, dir: "↖" }, { speed: 9, dir: "↖" }, { speed: 9, dir: "↖" }],
    tempHours: [81, 82, 83],
    humidity: 83,
    pressure: 1009,
    icons: ["↖", "↖", "↖", "〜", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "NYM @ CHW",
    venue: "Rate Field",
    time: "2:10",
    runs: 1.03,
    hr: 1.06,
    doubleTriple: 0.91,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 8, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 10, dir: "↑" }],
    tempHours: [75, 77, 77],
    humidity: 48,
    pressure: 1016,
    icons: ["↑", "↑", "↑", "〜"],
    isClosed: false
  },
  {
    game: "DET @ KC",
    venue: "Kauffman Stadium",
    time: "2:10",
    runs: 1.02,
    hr: 1.06,
    doubleTriple: 1.03,
    single: 0.99,
    receptive: "High",
    windHours: [{ speed: 8, dir: "←" }, { speed: 8, dir: "←" }, { speed: 4, dir: "←" }],
    tempHours: [84, 86, 86],
    humidity: 43,
    pressure: 1017,
    icons: ["←", "←", "←", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "CIN @ ARI",
    venue: "Chase Field",
    time: "4:15",
    runs: 1.00,
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
    game: "ATL @ MIL",
    venue: "Bowman Field",
    time: "7:10",
    runs: 1.00,
    hr: 0.95,
    doubleTriple: 1.11,
    single: 0.97,
    receptive: "?",
    windHours: [{ speed: 4, dir: "↗" }, { speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [70, 68, 66],
    humidity: 62,
    pressure: 1011,
    icons: ["↗", "↗", "↗", "〜"],
    isClosed: false
  },
  {
    game: "ATH @ HOU",
    venue: "Daikin Park",
    time: "2:10",
    runs: 0.95,
    hr: 1.04,
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
    game: "WAS @ MIA",
    venue: "LoanDepot Park",
    time: "1:40",
    runs: 0.95,
    hr: 0.87,
    doubleTriple: 1.02,
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
    game: "MIN @ SD",
    venue: "Petco Park",
    time: "4:10",
    runs: 0.95,
    hr: 1.04,
    doubleTriple: 0.87,
    single: 0.94,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 9, dir: "↘" }, { speed: 9, dir: "↘" }],
    tempHours: [91, 79, 79],
    humidity: 54,
    pressure: 1011,
    icons: ["↘", "↘", "↘", "〜", "💥"],
    isClosed: false
  },
  {
    game: "CHC @ SEA",
    venue: "T-Mobile Park",
    time: "4:10",
    runs: 0.94,
    hr: 1.01,
    doubleTriple: 0.89,
    single: 0.94,
    receptive: "Medium",
    windHours: [{ speed: 3, dir: "↑" }, { speed: 3, dir: "↗" }, { speed: 4, dir: "→" }],
    tempHours: [72, 75, 77],
    humidity: 66,
    pressure: 1020,
    icons: ["↑", "↗", "→", "P"],
    isClosed: false
  },
  {
    game: "LAA @ TEX",
    venue: "Globe Life Field",
    time: "2:35",
    runs: 0.93,
    hr: 0.88,
    doubleTriple: 0.94,
    single: 0.99,
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
