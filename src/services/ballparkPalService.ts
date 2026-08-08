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
    game: "ATH @ BOS",
    venue: "Fenway Park",
    time: "4:10",
    runs: 1.17,
    hr: 1.05,
    doubleTriple: 1.23,
    single: 1.10,
    receptive: "High",
    windHours: [{ speed: 2, dir: "↙" }, { speed: 4, dir: "↙" }, { speed: 6, dir: "↙" }],
    tempHours: [91, 90, 75],
    humidity: 47,
    pressure: 1012,
    icons: ["↙", "↙", "↙", "☀️"],
    isClosed: false
  },
  {
    game: "CHC @ KC",
    venue: "Kauffman Stadium",
    time: "7:10",
    runs: 1.12,
    hr: 1.26,
    doubleTriple: 1.10,
    single: 0.99,
    receptive: "High",
    windHours: [{ speed: 9, dir: "↖" }, { speed: 8, dir: "↖" }, { speed: 7, dir: "↖" }],
    tempHours: [90, 88, 82],
    humidity: 54,
    pressure: 1013,
    icons: ["↖", "↖", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "TOR @ PHI",
    venue: "Citizens Bank Park",
    time: "6:05",
    runs: 1.12,
    hr: 1.42,
    doubleTriple: 0.93,
    single: 0.95,
    receptive: "Very High",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 6, dir: "↗" }, { speed: 11, dir: "↗" }],
    tempHours: [93, 90, 82],
    humidity: 43,
    pressure: 1014,
    icons: ["↗", "↗", "↗", "~", "☀️"],
    isClosed: false
  },
  {
    game: "ATL @ NYY",
    venue: "Yankee Stadium",
    time: "3:05",
    runs: 1.07,
    hr: 1.21,
    doubleTriple: 0.94,
    single: 0.99,
    receptive: "High",
    windHours: [{ speed: 11, dir: "↑" }, { speed: 11, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [91, 91, 93],
    humidity: 52,
    pressure: 1014,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "CIN @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.07,
    hr: 1.12,
    doubleTriple: 1.06,
    single: 1.02,
    receptive: "Med-High",
    windHours: [{ speed: 14, dir: "↗" }, { speed: 5, dir: "↖" }, { speed: 2, dir: "↘" }],
    tempHours: [84, 73, 75],
    humidity: 64,
    pressure: 1013,
    icons: ["↗", "↖", "↘", "~", "☀️"],
    isClosed: false
  },
  {
    game: "NYM @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 1.06,
    hr: 0.99,
    doubleTriple: 1.13,
    single: 1.00,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↖" }, { speed: 7, dir: "↖" }, { speed: 6, dir: "↖" }],
    tempHours: [86, 84, 79],
    humidity: 52,
    pressure: 1014,
    icons: ["↖", "↖", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "DET @ SF",
    venue: "Oracle Park",
    time: "7:15",
    runs: 1.01,
    hr: 0.79,
    doubleTriple: 1.21,
    single: 1.05,
    receptive: "Consistent",
    windHours: [{ speed: 11, dir: "↑" }, { speed: 11, dir: "↑" }, { speed: 9, dir: "↑" }],
    tempHours: [68, 68, 66],
    humidity: 61,
    pressure: 1012,
    icons: ["↑", "↑", "↑", "~"],
    isClosed: false
  },
  {
    game: "CLE @ CHW",
    venue: "Rate Field",
    time: "7:15",
    runs: 1.01,
    hr: 0.95,
    doubleTriple: 0.91,
    single: 1.08,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 5, dir: "↘" }, { speed: 4, dir: "↘" }],
    tempHours: [77, 75, 73],
    humidity: 61,
    pressure: 1015,
    icons: ["↘", "↘", "↘", "~", "☀️"],
    isClosed: false
  },
  {
    game: "LAD @ ARI",
    venue: "Chase Field",
    time: "8:10",
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
    game: "MIN @ MIL",
    venue: "American Family Fld",
    time: "7:10",
    runs: 0.98,
    hr: 1.11,
    doubleTriple: 0.94,
    single: 0.90,
    receptive: "Low",
    windHours: [{ speed: 1, dir: "↘" }, { speed: 2, dir: "↙" }, { speed: 4, dir: "←" }],
    tempHours: [77, 73, 70],
    humidity: 57,
    pressure: 1015,
    icons: ["↘", "↙", "←", "☀️"],
    isClosed: false
  },
  {
    game: "COL @ STL",
    venue: "Busch Stadium",
    time: "7:15",
    runs: 0.96,
    hr: 0.89,
    doubleTriple: 1.05,
    single: 1.02,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↙" }, { speed: 6, dir: "↙" }, { speed: 6, dir: "↙" }],
    tempHours: [90, 86, 82],
    humidity: 57,
    pressure: 1014,
    icons: ["↙", "↙", "↙", "~", "☀️"],
    isClosed: false
  },
  {
    game: "LAA @ MIA",
    venue: "LoanDepot Park",
    time: "4:10",
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
    time: "7:15",
    runs: 0.93,
    hr: 0.99,
    doubleTriple: 0.92,
    single: 0.93,
    receptive: "Low",
    windHours: [{ speed: 11, dir: "↘" }, { speed: 10, dir: "↘" }, { speed: 9, dir: "↘" }],
    tempHours: [82, 82, 82],
    humidity: 49,
    pressure: 1011,
    icons: ["↘", "↘", "↘", "~", "☀️"],
    isClosed: false
  },
  {
    game: "BAL @ TEX",
    venue: "Globe Life Field",
    time: "7:15",
    runs: 0.93,
    hr: 0.90,
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
    game: "TB @ SEA",
    venue: "T-Mobile Park",
    time: "9:50",
    runs: 0.85,
    hr: 0.97,
    doubleTriple: 0.79,
    single: 0.90,
    receptive: "Medium",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 9, dir: "↘" }, { speed: 7, dir: "↘" }],
    tempHours: [81, 77, 70],
    humidity: 34,
    pressure: 1016,
    icons: ["↘", "↘", "↘", "~", "☀️"],
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
