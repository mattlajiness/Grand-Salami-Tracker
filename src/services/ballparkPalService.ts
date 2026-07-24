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
    game: "TOR @ BOS",
    venue: "Fenway Park",
    time: "7:15",
    runs: 1.09,
    hr: 0.95,
    doubleTriple: 1.17,
    single: 1.08,
    receptive: "High",
    windHours: [{ speed: 9, dir: "↖" }, { speed: 8, dir: "↖" }, { speed: 6, dir: "↖" }],
    tempHours: [73, 70, 68],
    humidity: 50,
    pressure: 1021,
    icons: ["↖", "↖", "↖", "~", "P"],
    isClosed: false
  },
  {
    game: "ATL @ BAL",
    venue: "Oriole Park",
    time: "7:05",
    runs: 1.04,
    hr: 0.91,
    doubleTriple: 1.01,
    single: 1.11,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "←" }, { speed: 7, dir: "↖" }, { speed: 6, dir: "←" }],
    tempHours: [77, 75, 73],
    humidity: 46,
    pressure: 1020,
    icons: ["←", "↖", "←", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "ARI @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.03,
    hr: 1.01,
    doubleTriple: 1.09,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "↙" }, { speed: 5, dir: "↙" }, { speed: 5, dir: "↙" }],
    tempHours: [86, 77, 72],
    humidity: 36,
    pressure: 1020,
    icons: ["↙", "↙", "↙", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "HOU @ CHW",
    venue: "Rate Field",
    time: "7:40",
    runs: 1.02,
    hr: 1.01,
    doubleTriple: 1.00,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 10, dir: "↙" }, { speed: 11, dir: "↙" }, { speed: 10, dir: "←" }],
    tempHours: [77, 75, 73],
    humidity: 52,
    pressure: 1018,
    icons: ["↙", "↙", "←", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "NYY @ PHI",
    venue: "Citizens Bank Park",
    time: "6:45",
    runs: 1.02,
    hr: 1.09,
    doubleTriple: 1.00,
    single: 0.96,
    receptive: "Very High",
    windHours: [{ speed: 9, dir: "←" }, { speed: 9, dir: "↖" }, { speed: 7, dir: "↖" }],
    tempHours: [84, 77, 75],
    humidity: 39,
    pressure: 1020,
    icons: ["←", "↖", "↖", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "LAA @ SF",
    venue: "Oracle Park",
    time: "10:15",
    runs: 1.00,
    hr: 0.84,
    doubleTriple: 1.08,
    single: 1.07,
    receptive: "Consistent",
    windHours: [{ speed: 14, dir: "↗" }, { speed: 12, dir: "↗" }, { speed: 11, dir: "↑" }],
    tempHours: [63, 63, 61],
    humidity: 77,
    pressure: 1013,
    icons: ["↗", "↗", "↑", "≈", "H"],
    isClosed: false
  },
  {
    game: "COL @ MIL",
    venue: "American Family Fld",
    time: "4:10",
    runs: 0.99,
    hr: 1.10,
    doubleTriple: 0.96,
    single: 0.91,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↙" }, { speed: 7, dir: "↙" }, { speed: 7, dir: "↙" }],
    tempHours: [81, 82, 81],
    humidity: 36,
    pressure: 1018,
    icons: ["↙", "↙", "↙", "~", "☀️"],
    isClosed: false
  },
  {
    game: "ATH @ MIN",
    venue: "Target Field",
    time: "8:10",
    runs: 0.99,
    hr: 0.98,
    doubleTriple: 1.00,
    single: 0.99,
    receptive: "Medium",
    windHours: [{ speed: 13, dir: "←" }, { speed: 13, dir: "←" }, { speed: 13, dir: "←" }],
    tempHours: [79, 77, 73],
    humidity: 57,
    pressure: 1012,
    icons: ["←", "←", "←", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "SD @ MIA",
    venue: "LoanDepot Park",
    time: "7:10",
    runs: 0.96,
    hr: 0.87,
    doubleTriple: 1.03,
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
    game: "CLE @ TB",
    venue: "Tropicana Field",
    time: "7:10",
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
    game: "KC @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 0.94,
    hr: 0.80,
    doubleTriple: 1.01,
    single: 1.05,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↓" }, { speed: 9, dir: "↓" }, { speed: 7, dir: "↙" }],
    tempHours: [81, 77, 73],
    humidity: 40,
    pressure: 1018,
    icons: ["↓", "↓", "↙", "~", "☀️"],
    isClosed: false
  },
  {
    game: "SEA @ TEX",
    venue: "Globe Life Field",
    time: "8:05",
    runs: 0.93,
    hr: 0.90,
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
    game: "CHC @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 0.93,
    hr: 0.75,
    doubleTriple: 1.08,
    single: 0.99,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "↓" }, { speed: 6, dir: "↓" }, { speed: 6, dir: "↙" }],
    tempHours: [82, 75, 72],
    humidity: 41,
    pressure: 1018,
    icons: ["↓", "↓", "↙", "~", "☀️"],
    isClosed: false
  },
  {
    game: "LAD @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.92,
    hr: 0.95,
    doubleTriple: 0.86,
    single: 0.95,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↖" }, { speed: 9, dir: "↖" }, { speed: 7, dir: "↖" }],
    tempHours: [77, 75, 73],
    humidity: 42,
    pressure: 1021,
    icons: ["↖", "↖", "↖", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "CIN @ STL",
    venue: "Busch Stadium",
    time: "8:15",
    runs: 0.85,
    hr: 0.75,
    doubleTriple: 0.84,
    single: 1.06,
    receptive: "Med-High",
    windHours: [{ speed: 5, dir: "↙" }, { speed: 6, dir: "↙" }, { speed: 5, dir: "↙" }],
    tempHours: [66, 66, 64],
    humidity: 93,
    pressure: 1019,
    icons: ["↙", "↙", "↙", "~", "H", "P"],
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
