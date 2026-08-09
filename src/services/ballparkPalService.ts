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
    game: "CHC @ KC",
    venue: "Kauffman Stadium",
    time: "2:10",
    runs: 1.27,
    hr: 1.33,
    doubleTriple: 1.03,
    single: 1.16,
    receptive: "High",
    windHours: [{ speed: 17, dir: "↑" }, { speed: 18, dir: "↑" }, { speed: 17, dir: "↑" }],
    tempHours: [92, 94, 95],
    humidity: 35,
    pressure: 1010,
    icons: ["↑", "↑", "↑", "~", "💥", "P"],
    isClosed: false
  },
  {
    game: "ATH @ BOS",
    venue: "Fenway Park",
    time: "1:35",
    runs: 1.22,
    hr: 1.20,
    doubleTriple: 1.20,
    single: 1.08,
    receptive: "High",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 9, dir: "↗" }, { speed: 11, dir: "↗" }],
    tempHours: [91, 95, 97],
    humidity: 50,
    pressure: 1012,
    icons: ["↗", "↗", "↗", "~", "💥"],
    isClosed: false
  },
  {
    game: "TOR @ PHI",
    venue: "Citizens Bank Park",
    time: "1:35",
    runs: 1.17,
    hr: 1.39,
    doubleTriple: 0.96,
    single: 1.02,
    receptive: "Very High",
    windHours: [{ speed: 9, dir: "→" }, { speed: 9, dir: "→" }, { speed: 9, dir: "→" }],
    tempHours: [95, 93, 93],
    humidity: 46,
    pressure: 1015,
    icons: ["→", "→", "→", "~", "💥"],
    isClosed: false
  },
  {
    game: "DET @ SF",
    venue: "Oracle Park",
    time: "4:05",
    runs: 1.09,
    hr: 0.95,
    doubleTriple: 1.23,
    single: 1.07,
    receptive: "Consistent",
    windHours: [{ speed: 8, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 11, dir: "↑" }],
    tempHours: [77, 79, 68],
    humidity: 57,
    pressure: 1010,
    icons: ["↑", "↑", "↑", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "CIN @ WAS",
    venue: "Nationals Park",
    time: "12:15",
    runs: 1.06,
    hr: 1.07,
    doubleTriple: 0.96,
    single: 1.09,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "→" }, { speed: 7, dir: "→" }, { speed: 7, dir: "→" }],
    tempHours: [93, 95, 100],
    humidity: 52,
    pressure: 1017,
    icons: ["→", "→", "→", "~", "💥"],
    isClosed: false
  },
  {
    game: "ATL @ NYY",
    venue: "Yankee Stadium",
    time: "1:35",
    runs: 1.05,
    hr: 1.20,
    doubleTriple: 0.88,
    single: 0.99,
    receptive: "High",
    windHours: [{ speed: 8, dir: "↗" }, { speed: 7, dir: "↗" }, { speed: 8, dir: "↗" }],
    tempHours: [93, 95, 95],
    humidity: 48,
    pressure: 1014,
    icons: ["↗", "↗", "↗", "~", "💥"],
    isClosed: false
  },
  {
    game: "MIN @ MIL",
    venue: "American Family Fld",
    time: "2:10",
    runs: 1.05,
    hr: 1.18,
    doubleTriple: 0.99,
    single: 0.92,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "↖" }, { speed: 7, dir: "↖" }, { speed: 11, dir: "↖" }],
    tempHours: [86, 84, 70],
    humidity: 61,
    pressure: 1014,
    icons: ["↖", "↖", "↖", "~", "💥"],
    isClosed: false
  },
  {
    game: "CLE @ CHW",
    venue: "Rate Field",
    time: "2:10",
    runs: 1.02,
    hr: 1.05,
    doubleTriple: 0.96,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 10, dir: "↖" }, { speed: 5, dir: "↑" }, { speed: 6, dir: "→" }],
    tempHours: [81, 84, 86],
    humidity: 77,
    pressure: 1014,
    icons: ["↖", "↑", "→", "~", "☀️", "H"],
    isClosed: false
  },
  {
    game: "LAD @ ARI",
    venue: "Chase Field",
    time: "4:10",
    runs: 1.00,
    hr: 0.92,
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
    game: "NYM @ PIT",
    venue: "PNC Park",
    time: "1:35",
    runs: 0.99,
    hr: 0.88,
    doubleTriple: 1.07,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 5, dir: "↖" }, { speed: 6, dir: "↖" }, { speed: 6, dir: "↖" }],
    tempHours: [88, 91, 93],
    humidity: 56,
    pressure: 1018,
    icons: ["↖", "↖", "↖", "~", "💥"],
    isClosed: false
  },
  {
    game: "LAA @ MIA",
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
    game: "HOU @ SD",
    venue: "Petco Park",
    time: "8:20",
    runs: 0.95,
    hr: 1.01,
    doubleTriple: 0.87,
    single: 0.96,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 7, dir: "↗" }, { speed: 7, dir: "→" }],
    tempHours: [81, 79, 79],
    humidity: 55,
    pressure: 1009,
    icons: ["↗", "↗", "→", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "TB @ SEA",
    venue: "T-Mobile Park",
    time: "4:10",
    runs: 0.94,
    hr: 1.07,
    doubleTriple: 0.87,
    single: 0.92,
    receptive: "Medium",
    windHours: [{ speed: 2, dir: "↑" }, { speed: 2, dir: "↗" }, { speed: 3, dir: "↗" }],
    tempHours: [73, 79, 82],
    humidity: 57,
    pressure: 1016,
    icons: ["↑", "↗", "↗"],
    isClosed: false
  },
  {
    game: "COL @ STL",
    venue: "Busch Stadium",
    time: "2:15",
    runs: 0.94,
    hr: 1.02,
    doubleTriple: 0.90,
    single: 1.00,
    receptive: "Med-High",
    windHours: [{ speed: 11, dir: "↖" }, { speed: 12, dir: "↖" }, { speed: 13, dir: "↖" }],
    tempHours: [97, 99, 99],
    humidity: 52,
    pressure: 1015,
    icons: ["↖", "↖", "↖", "~", "💥"],
    isClosed: false
  },
  {
    game: "BAL @ TEX",
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
