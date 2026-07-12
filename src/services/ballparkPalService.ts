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
    time: "1:40",
    runs: 1.16,
    hr: 1.21,
    doubleTriple: 1.05,
    single: 1.03,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 7, dir: "↘" }],
    tempHours: [86, 88, 90],
    humidity: 69,
    pressure: 1019,
    icons: ["↘", "↘", "↘", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "ARI @ LAD",
    venue: "Dodger Stadium",
    time: "4:10",
    runs: 1.09,
    hr: 1.32,
    doubleTriple: 0.99,
    single: 0.97,
    receptive: "Consistent",
    windHours: [{ speed: 7, dir: "↑" }, { speed: 12, dir: "↑" }, { speed: 10, dir: "↑" }],
    tempHours: [91, 91, 88],
    humidity: 46,
    pressure: 1012,
    icons: ["↑", "↑", "↑", "~", "💥"],
    isClosed: false
  },
  {
    game: "KC @ BAL",
    venue: "Oriole Park",
    time: "1:35",
    runs: 1.07,
    hr: 0.94,
    doubleTriple: 1.10,
    single: 1.09,
    receptive: "Med-High",
    windHours: [{ speed: 13, dir: "↙" }, { speed: 13, dir: "↙" }, { speed: 14, dir: "↙" }],
    tempHours: [86, 88, 91],
    humidity: 53,
    pressure: 1020,
    icons: ["↙", "↙", "↙", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "COL @ SF",
    venue: "Oracle Park",
    time: "4:05",
    runs: 1.07,
    hr: 0.85,
    doubleTriple: 1.28,
    single: 1.06,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 11, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [75, 77, 73],
    humidity: 53,
    pressure: 1013,
    icons: ["↑", "↑", "↑", "≈"],
    isClosed: false
  },
  {
    game: "NYY @ WAS",
    venue: "Nationals Park",
    time: "1:35",
    runs: 1.05,
    hr: 1.04,
    doubleTriple: 1.04,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 11, dir: "↙" }, { speed: 9, dir: "↙" }, { speed: 10, dir: "↙" }],
    tempHours: [88, 88, 90],
    humidity: 49,
    pressure: 1019,
    icons: ["↙", "↙", "↙", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "LAA @ MIN",
    venue: "Target Field",
    time: "2:10",
    runs: 1.04,
    hr: 0.99,
    doubleTriple: 1.01,
    single: 1.04,
    receptive: "Medium",
    windHours: [{ speed: 9, dir: "↖" }, { speed: 9, dir: "↖" }, { speed: 9, dir: "↖" }],
    tempHours: [97, 99, 97],
    humidity: 46,
    pressure: 1020,
    icons: ["↖", "↖", "↖", "~", "💥", "P"],
    isClosed: false
  },
  {
    game: "ATH @ CHW",
    venue: "Rate Field",
    time: "2:10",
    runs: 1.00,
    hr: 1.01,
    doubleTriple: 0.91,
    single: 1.03,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 9, dir: "↘" }, { speed: 9, dir: "↘" }],
    tempHours: [81, 81, 81],
    humidity: 76,
    pressure: 1022,
    icons: ["↘", "↘", "↘", "~", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "PHI @ DET",
    venue: "Comerica Park",
    time: "1:40",
    runs: 0.98,
    hr: 0.83,
    doubleTriple: 1.15,
    single: 1.00,
    receptive: "High",
    windHours: [{ speed: 9, dir: "→" }, { speed: 9, dir: "→" }, { speed: 9, dir: "→" }],
    tempHours: [90, 88, 88],
    humidity: 34,
    pressure: 1022,
    icons: ["→", "→", "→", "~", "💥", "P"],
    isClosed: false
  },
  {
    game: "TOR @ SD",
    venue: "Petco Park",
    time: "4:10",
    runs: 0.96,
    hr: 1.02,
    doubleTriple: 0.91,
    single: 0.96,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "→" }, { speed: 10, dir: "↗" }, { speed: 9, dir: "↗" }],
    tempHours: [77, 75, 77],
    humidity: 59,
    pressure: 1013,
    icons: ["→", "↗", "↗", "~", "☀️"],
    isClosed: false
  },
  {
    game: "CLE @ MIA",
    venue: "LoanDepot Park",
    time: "1:40",
    runs: 0.94,
    hr: 0.87,
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
    time: "1:40",
    runs: 0.94,
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
    game: "MIL @ PIT",
    venue: "PNC Park",
    time: "12:15",
    runs: 0.94,
    hr: 0.80,
    doubleTriple: 1.08,
    single: 0.98,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "↓" }, { speed: 6, dir: "↓" }, { speed: 4, dir: "↓" }],
    tempHours: [86, 90, 88],
    humidity: 65,
    pressure: 1019,
    icons: ["↓", "↓", "↓", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "HOU @ TEX",
    venue: "Globe Life Field",
    time: "2:35",
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
    time: "1:40",
    runs: 0.92,
    hr: 0.97,
    doubleTriple: 0.85,
    single: 0.94,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↖" }, { speed: 9, dir: "↖" }, { speed: 11, dir: "↖" }],
    tempHours: [88, 88, 88],
    humidity: 42,
    pressure: 1021,
    icons: ["↖", "↖", "↖", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "ATL @ STL",
    venue: "Busch Stadium",
    time: "2:15",
    runs: 0.84,
    hr: 0.79,
    doubleTriple: 0.93,
    single: 0.97,
    receptive: "Med-High",
    windHours: [{ speed: 12, dir: "↓" }, { speed: 11, dir: "↓" }, { speed: 12, dir: "↓" }],
    tempHours: [90, 88, 88],
    humidity: 59,
    pressure: 1020,
    icons: ["↓", "↓", "↓", "≈", "💥", "P"],
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
