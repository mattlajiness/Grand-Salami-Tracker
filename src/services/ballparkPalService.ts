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
    game: "PHI @ CIN",
    venue: "Great American BP",
    time: "7:10",
    runs: 1.21,
    hr: 1.21,
    doubleTriple: 1.17,
    single: 1.02,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 4, dir: "↘" }, { speed: 4, dir: "↘" }],
    tempHours: [81, 79, 73],
    humidity: 68,
    pressure: 1014,
    icons: ["↘", "↘", "↘", "☀️"],
    isClosed: false
  },
  {
    game: "CLE @ MIN",
    venue: "Target Field",
    time: "7:40",
    runs: 1.08,
    hr: 1.05,
    doubleTriple: 1.10,
    single: 1.01,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "↖" }, { speed: 6, dir: "↖" }, { speed: 6, dir: "↖" }],
    tempHours: [82, 82, 82],
    humidity: 66,
    pressure: 1014,
    icons: ["↖", "↖", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "HOU @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.07,
    hr: 1.13,
    doubleTriple: 1.02,
    single: 1.03,
    receptive: "Med-High",
    windHours: [{ speed: 3, dir: "↓" }, { speed: 4, dir: "↓" }, { speed: 4, dir: "↙" }],
    tempHours: [81, 79, 77],
    humidity: 79,
    pressure: 1014,
    icons: ["↓", "↓", "↙", "☀️", "H"],
    isClosed: false
  },
  {
    game: "ATH @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 1.05,
    hr: 0.94,
    doubleTriple: 1.10,
    single: 1.06,
    receptive: "High",
    windHours: [{ speed: 7, dir: "→" }, { speed: 6, dir: "→" }, { speed: 4, dir: "→" }],
    tempHours: [90, 84, 81],
    humidity: 44,
    pressure: 1015,
    icons: ["→", "→", "→", "~", "☀️"],
    isClosed: false
  },
  {
    game: "ATL @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 1.03,
    hr: 0.87,
    doubleTriple: 1.15,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 3, dir: "→" }, { speed: 3, dir: "→" }, { speed: 3, dir: "↘" }],
    tempHours: [84, 77, 75],
    humidity: 69,
    pressure: 1013,
    icons: ["→", "→", "→", "☀️"],
    isClosed: false
  },
  {
    game: "CHC @ BAL",
    venue: "Oriole Park",
    time: "6:35",
    runs: 1.02,
    hr: 0.93,
    doubleTriple: 1.14,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 3, dir: "↓" }, { speed: 4, dir: "↓" }, { speed: 6, dir: "↓" }],
    tempHours: [79, 79, 77],
    humidity: 80,
    pressure: 1014,
    icons: ["↓", "↓", "↓", "☀️", "H"],
    isClosed: false
  },
  {
    game: "BOS @ CHW",
    venue: "Rate Field",
    time: "7:40",
    runs: 1.01,
    hr: 1.04,
    doubleTriple: 0.87,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 5, dir: "↘" }, { speed: 4, dir: "↘" }],
    tempHours: [79, 77, 75],
    humidity: 55,
    pressure: 1017,
    icons: ["↘", "↘", "↘", "~", "☀️"],
    isClosed: false
  },
  {
    game: "COL @ LAD",
    venue: "Dodger Stadium",
    time: "10:10",
    runs: 1.01,
    hr: 1.16,
    doubleTriple: 1.00,
    single: 0.94,
    receptive: "Consistent",
    windHours: [{ speed: 8, dir: "↗" }, { speed: 6, dir: "↗" }, { speed: 6, dir: "↑" }],
    tempHours: [81, 77, 77],
    humidity: 42,
    pressure: 1011,
    icons: ["↗", "↗", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "TOR @ SF",
    venue: "Oracle Park",
    time: "9:45",
    runs: 0.98,
    hr: 0.82,
    doubleTriple: 1.05,
    single: 1.08,
    receptive: "Consistent",
    windHours: [{ speed: 15, dir: "↗" }, { speed: 15, dir: "↗" }, { speed: 15, dir: "↗" }],
    tempHours: [61, 59, 57],
    humidity: 77,
    pressure: 1016,
    icons: ["↗", "↗", "↗", "≈", "H"],
    isClosed: false
  },
  {
    game: "MIL @ STL",
    venue: "Busch Stadium",
    time: "2:15",
    runs: 0.97,
    hr: 0.90,
    doubleTriple: 1.03,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "↘" }, { speed: 8, dir: "↘" }, { speed: 9, dir: "↘" }],
    tempHours: [82, 82, 81],
    humidity: 65,
    pressure: 1017,
    icons: ["↘", "↘", "↘", "~", "☀️"],
    isClosed: false
  },
  {
    game: "SEA @ MIA",
    venue: "LoanDepot Park",
    time: "6:40",
    runs: 0.96,
    hr: 0.88,
    doubleTriple: 1.02,
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
    game: "ARI @ SD",
    venue: "Petco Park",
    time: "9:40",
    runs: 0.96,
    hr: 0.99,
    doubleTriple: 0.92,
    single: 0.96,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 9, dir: "↘" }, { speed: 7, dir: "↘" }],
    tempHours: [75, 73, 72],
    humidity: 61,
    pressure: 1012,
    icons: ["↘", "↘", "↘", "~"],
    isClosed: false
  },
  {
    game: "NYY @ TB",
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
    game: "LAA @ TEX",
    venue: "Globe Life Field",
    time: "8:05",
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
    game: "MIL @ STL",
    venue: "Busch Stadium",
    time: "7:45",
    runs: 0.93,
    hr: 0.83,
    doubleTriple: 1.05,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "↓" }, { speed: 6, dir: "↓" }, { speed: 5, dir: "↓" }],
    tempHours: [84, 82, 79],
    humidity: 64,
    pressure: 1016,
    icons: ["↓", "↓", "↓", "~", "☀️"],
    isClosed: false
  },
  {
    game: "KC @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.88,
    hr: 0.96,
    doubleTriple: 0.80,
    single: 0.92,
    receptive: "Low",
    windHours: [{ speed: 10, dir: "↓" }, { speed: 11, dir: "↓" }, { speed: 11, dir: "↓" }],
    tempHours: [68, 68, 68],
    humidity: 84,
    pressure: 1016,
    icons: ["↓", "↓", "↓", "≈", "H"],
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
