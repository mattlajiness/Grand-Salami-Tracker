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
    game: "CHC @ CIN",
    venue: "Great American BP",
    time: "7:10",
    runs: 1.17,
    hr: 1.21,
    doubleTriple: 1.04,
    single: 1.04,
    receptive: "Low",
    windHours: [{ speed: 4, dir: "↗" }, { speed: 4, dir: "→" }, { speed: 6, dir: "→" }],
    tempHours: [77, 73, 70],
    humidity: 90,
    pressure: 1015,
    icons: ["↗", "→", "→", "☀️", "H"],
    isClosed: false
  },
  {
    game: "MIL @ PIT",
    venue: "PNC Park",
    time: "4:05",
    runs: 1.07,
    hr: 0.92,
    doubleTriple: 1.19,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 2, dir: "↑" }, { speed: 2, dir: "↘" }, { speed: 3, dir: "↘" }],
    tempHours: [79, 79, 77],
    humidity: 72,
    pressure: 1015,
    icons: ["↑", "↘", "↘", "☀️"],
    isClosed: false
  },
  {
    game: "MIL @ PIT",
    venue: "PNC Park",
    time: "12:05",
    runs: 1.05,
    hr: 0.98,
    doubleTriple: 1.15,
    single: 0.98,
    receptive: "Med-High",
    windHours: [{ speed: 2, dir: "↗" }, { speed: 2, dir: "↗" }, { speed: 2, dir: "↗" }],
    tempHours: [79, 86, 86],
    humidity: 77,
    pressure: 1016,
    icons: ["↗", "↗", "↗", "☀️", "H"],
    isClosed: false
  },
  {
    game: "NYY @ WAS",
    venue: "Nationals Park",
    time: "4:05",
    runs: 1.05,
    hr: 1.00,
    doubleTriple: 1.08,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "↓" }, { speed: 7, dir: "↓" }, { speed: 6, dir: "↘" }],
    tempHours: [84, 82, 77],
    humidity: 63,
    pressure: 1012,
    icons: ["↓", "↓", "↘", "~", "☀️"],
    isClosed: false
  },
  {
    game: "ATH @ CHW",
    venue: "Rate Field",
    time: "2:10",
    runs: 1.01,
    hr: 1.05,
    doubleTriple: 0.91,
    single: 1.03,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 9, dir: "→" }, { speed: 10, dir: "→" }],
    tempHours: [79, 79, 79],
    humidity: 61,
    pressure: 1018,
    icons: ["↘", "→", "→", "~", "☀️"],
    isClosed: false
  },
  {
    game: "COL @ SF",
    venue: "Oracle Park",
    time: "4:05",
    runs: 1.01,
    hr: 0.82,
    doubleTriple: 1.13,
    single: 1.08,
    receptive: "Consistent",
    windHours: [{ speed: 7, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 10, dir: "↑" }],
    tempHours: [66, 66, 66],
    humidity: 61,
    pressure: 1013,
    icons: ["↑", "↑", "↑", "~"],
    isClosed: false
  },
  {
    game: "PHI @ DET",
    venue: "Comerica Park",
    time: "6:10",
    runs: 1.01,
    hr: 0.97,
    doubleTriple: 1.02,
    single: 1.05,
    receptive: "High",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 9, dir: "↗" }, { speed: 10, dir: "↗" }],
    tempHours: [86, 82, 79],
    humidity: 32,
    pressure: 1018,
    icons: ["↗", "↗", "↗", "~", "☀️"],
    isClosed: false
  },
  {
    game: "ARI @ LAD",
    venue: "Dodger Stadium",
    time: "9:10",
    runs: 1.01,
    hr: 1.15,
    doubleTriple: 1.04,
    single: 0.92,
    receptive: "Consistent",
    windHours: [{ speed: 5, dir: "↗" }, { speed: 1, dir: "↖" }, { speed: 6, dir: "↑" }],
    tempHours: [81, 82, 82],
    humidity: 40,
    pressure: 1011,
    icons: ["↗", "↖", "↑", "☀️"],
    isClosed: false
  },
  {
    game: "KC @ BAL",
    venue: "Oriole Park",
    time: "7:05",
    runs: 1.00,
    hr: 0.88,
    doubleTriple: 1.12,
    single: 1.02,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "↘" }, { speed: 6, dir: "↓" }, { speed: 6, dir: "↙" }],
    tempHours: [77, 75, 73],
    humidity: 83,
    pressure: 1013,
    icons: ["↘", "↓", "↙", "~", "☀️", "H"],
    isClosed: false
  },
  {
    game: "LAA @ MIN",
    venue: "Target Field",
    time: "2:10",
    runs: 0.98,
    hr: 0.87,
    doubleTriple: 1.07,
    single: 1.00,
    receptive: "Medium",
    windHours: [{ speed: 9, dir: "←" }, { speed: 9, dir: "←" }, { speed: 9, dir: "←" }],
    tempHours: [88, 90, 90],
    humidity: 44,
    pressure: 1017,
    icons: ["←", "←", "←", "~", "☀️"],
    isClosed: false
  },
  {
    game: "CLE @ MIA",
    venue: "LoanDepot Park",
    time: "4:10",
    runs: 0.95,
    hr: 0.88,
    doubleTriple: 1.01,
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
    game: "SEA @ TB",
    venue: "Tropicana Field",
    time: "4:10",
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
    game: "TOR @ SD",
    venue: "Petco Park",
    time: "8:40",
    runs: 0.94,
    hr: 0.99,
    doubleTriple: 0.89,
    single: 0.95,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "↗" }, { speed: 7, dir: "↗" }, { speed: 7, dir: "↗" }],
    tempHours: [73, 73, 72],
    humidity: 62,
    pressure: 1012,
    icons: ["↗", "↗", "↗", "~"],
    isClosed: false
  },
  {
    game: "ATL @ STL",
    venue: "Busch Stadium",
    time: "7:15",
    runs: 0.93,
    hr: 0.86,
    doubleTriple: 1.03,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 12, dir: "↘" }, { speed: 13, dir: "↘" }, { speed: 11, dir: "↘" }],
    tempHours: [79, 77, 75],
    humidity: 83,
    pressure: 1013,
    icons: ["↘", "↘", "↘", "≈", "☀️", "H"],
    isClosed: false
  },
  {
    game: "HOU @ TEX",
    venue: "Globe Life Field",
    time: "7:05",
    runs: 0.93,
    hr: 0.89,
    doubleTriple: 0.94,
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
    game: "BOS @ NYM",
    venue: "Citi Field",
    time: "4:10",
    runs: 0.88,
    hr: 0.94,
    doubleTriple: 0.79,
    single: 0.93,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↙" }, { speed: 9, dir: "↙" }, { speed: 9, dir: "↙" }],
    tempHours: [82, 82, 81],
    humidity: 44,
    pressure: 1014,
    icons: ["↙", "↙", "↙", "~", "☀️"],
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
