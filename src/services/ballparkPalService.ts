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
    game: "CHC @ BAL",
    venue: "Oriole Park",
    time: "1:35",
    runs: 1.14,
    hr: 1.16,
    doubleTriple: 1.13,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "↖" }, { speed: 6, dir: "↖" }, { speed: 4, dir: "↖" }],
    tempHours: [90, 84, 82],
    humidity: 75,
    pressure: 1012,
    icons: ["↖", "↖", "↖", "~", "☀️", "H"],
    isClosed: false
  },
  {
    game: "PHI @ CIN",
    venue: "Great American BP",
    time: "7:10",
    runs: 1.12,
    hr: 1.28,
    doubleTriple: 1.01,
    single: 0.96,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "↖" }, { speed: 4, dir: "↖" }, { speed: 4, dir: "↖" }],
    tempHours: [86, 81, 73],
    humidity: 58,
    pressure: 1011,
    icons: ["↖", "↖", "↖", "☀️"],
    isClosed: false
  },
  {
    game: "ATH @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 1.08,
    hr: 1.02,
    doubleTriple: 1.01,
    single: 1.11,
    receptive: "High",
    windHours: [{ speed: 6, dir: "←" }, { speed: 5, dir: "←" }, { speed: 6, dir: "←" }],
    tempHours: [88, 84, 82],
    humidity: 45,
    pressure: 1009,
    icons: ["←", "←", "←", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "CLE @ MIN",
    venue: "Target Field",
    time: "1:40",
    runs: 1.06,
    hr: 1.02,
    doubleTriple: 0.97,
    single: 1.08,
    receptive: "Medium",
    windHours: [{ speed: 7, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 8, dir: "↘" }],
    tempHours: [84, 88, 90],
    humidity: 50,
    pressure: 1011,
    icons: ["↘", "↘", "↘", "~", "☀️"],
    isClosed: false
  },
  {
    game: "BOS @ CHW",
    venue: "Rate Field",
    time: "2:10",
    runs: 1.06,
    hr: 1.14,
    doubleTriple: 0.96,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↖" }, { speed: 2, dir: "↖" }, { speed: 3, dir: "↙" }],
    tempHours: [84, 81, 84],
    humidity: 61,
    pressure: 1010,
    icons: ["↖", "↖", "↙", "☀️", "P"],
    isClosed: false
  },
  {
    game: "ATL @ PIT",
    venue: "PNC Park",
    time: "12:35",
    runs: 1.06,
    hr: 0.95,
    doubleTriple: 1.18,
    single: 0.99,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↖" }, { speed: 3, dir: "↖" }, { speed: 4, dir: "↖" }],
    tempHours: [90, 86, 90],
    humidity: 57,
    pressure: 1014,
    icons: ["↖", "↖", "↖", "☀️"],
    isClosed: false
  },
  {
    game: "KC @ NYM",
    venue: "Citi Field",
    time: "1:10",
    runs: 0.98,
    hr: 1.16,
    doubleTriple: 0.89,
    single: 0.89,
    receptive: "Low",
    windHours: [{ speed: 10, dir: "↑" }, { speed: 11, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [86, 84, 86],
    humidity: 69,
    pressure: 1012,
    icons: ["↑", "↑", "↑", "≈", "☀️"],
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
    game: "COL @ SF",
    venue: "Oracle Park",
    time: "9:45",
    runs: 0.95,
    hr: 0.79,
    doubleTriple: 1.05,
    single: 1.05,
    receptive: "Consistent",
    windHours: [{ speed: 14, dir: "↑" }, { speed: 14, dir: "↑" }, { speed: 13, dir: "↑" }],
    tempHours: [61, 59, 57],
    humidity: 77,
    pressure: 1012,
    icons: ["↑", "↑", "↑", "≈", "H"],
    isClosed: false
  },
  {
    game: "MIL @ STL",
    venue: "Busch Stadium",
    time: "7:45",
    runs: 0.95,
    hr: 0.91,
    doubleTriple: 0.97,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↓" }, { speed: 3, dir: "↘" }, { speed: 12, dir: "↘" }],
    tempHours: [90, 81, 77],
    humidity: 63,
    pressure: 1008,
    icons: ["↓", "↘", "↘", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "NYY @ TB",
    venue: "Tropicana Field",
    time: "1:10",
    runs: 0.94,
    hr: 0.98,
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
    game: "ARI @ SD",
    venue: "Petco Park",
    time: "9:40",
    runs: 0.93,
    hr: 1.01,
    doubleTriple: 0.87,
    single: 0.94,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [73, 72, 72],
    humidity: 64,
    pressure: 1010,
    icons: ["↗", "↗", "↗", "~", "P"],
    isClosed: false
  },
  {
    game: "LAA @ TEX",
    venue: "Globe Life Field",
    time: "8:05",
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
