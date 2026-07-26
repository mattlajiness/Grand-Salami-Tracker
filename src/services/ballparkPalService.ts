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
    time: "1:35",
    runs: 1.12,
    hr: 0.93,
    doubleTriple: 1.25,
    single: 1.08,
    receptive: "High",
    windHours: [{ speed: 8, dir: "↙" }, { speed: 9, dir: "↙" }, { speed: 9, dir: "↙" }],
    tempHours: [75, 75, 73],
    humidity: 42,
    pressure: 1014,
    icons: ["↙", "↙", "↙", "~"],
    isClosed: false
  },
  {
    game: "KC @ DET",
    venue: "Comerica Park",
    time: "1:40",
    runs: 1.10,
    hr: 1.08,
    doubleTriple: 1.04,
    single: 1.09,
    receptive: "High",
    windHours: [{ speed: 7, dir: "←" }, { speed: 6, dir: "←" }, { speed: 6, dir: "←" }],
    tempHours: [84, 86, 86],
    humidity: 64,
    pressure: 1011,
    icons: ["←", "←", "←", "~", "☀️"],
    isClosed: false
  },
  {
    game: "NYY @ PHI",
    venue: "Citizens Bank Park",
    time: "7:20",
    runs: 1.07,
    hr: 1.15,
    doubleTriple: 1.03,
    single: 0.97,
    receptive: "Very High",
    windHours: [{ speed: 2, dir: "↗" }, { speed: 4, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [81, 77, 75],
    humidity: 41,
    pressure: 1011,
    icons: ["↗", "↑", "↑", "☀️"],
    isClosed: false
  },
  {
    game: "ATL @ BAL",
    venue: "Oriole Park",
    time: "1:35",
    runs: 1.07,
    hr: 0.97,
    doubleTriple: 1.02,
    single: 1.11,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "←" }, { speed: 4, dir: "←" }, { speed: 6, dir: "←" }],
    tempHours: [84, 86, 86],
    humidity: 47,
    pressure: 1013,
    icons: ["←", "←", "←", "☀️"],
    isClosed: false
  },
  {
    game: "ARI @ WAS",
    venue: "Nationals Park",
    time: "1:35",
    runs: 1.06,
    hr: 1.10,
    doubleTriple: 1.08,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 3, dir: "↖" }, { speed: 2, dir: "↗" }, { speed: 3, dir: "↖" }],
    tempHours: [86, 86, 88],
    humidity: 46,
    pressure: 1013,
    icons: ["↖", "↗", "↖", "☀️"],
    isClosed: false
  },
  {
    game: "HOU @ CHW",
    venue: "Rate Field",
    time: "2:10",
    runs: 1.06,
    hr: 1.13,
    doubleTriple: 0.92,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 8, dir: "↙" }, { speed: 8, dir: "↙" }, { speed: 7, dir: "↙" }],
    tempHours: [75, 75, 79],
    humidity: 89,
    pressure: 1011,
    icons: ["↙", "↙", "↙", "~", "H"],
    isClosed: false
  },
  {
    game: "COL @ MIL",
    venue: "American Family Fld",
    time: "2:10",
    runs: 1.05,
    hr: 1.20,
    doubleTriple: 0.90,
    single: 0.96,
    receptive: "Low",
    windHours: [{ speed: 8, dir: "↙" }, { speed: 10, dir: "↙" }, { speed: 13, dir: "←" }],
    tempHours: [97, 99, 99],
    humidity: 52,
    pressure: 1010,
    icons: ["↙", "↙", "←", "≈", "💥", "P"],
    isClosed: false
  },
  {
    game: "LAA @ SF",
    venue: "Oracle Park",
    time: "4:05",
    runs: 1.05,
    hr: 0.93,
    doubleTriple: 1.10,
    single: 1.08,
    receptive: "Consistent",
    windHours: [{ speed: 12, dir: "↑" }, { speed: 14, dir: "↑" }, { speed: 14, dir: "↑" }],
    tempHours: [70, 70, 72],
    humidity: 75,
    pressure: 1017,
    icons: ["↑", "↑", "↑", "≈", "H"],
    isClosed: false
  },
  {
    game: "ATH @ MIN",
    venue: "Target Field",
    time: "2:10",
    runs: 1.04,
    hr: 1.07,
    doubleTriple: 1.01,
    single: 1.00,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "↑" }, { speed: 6, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [93, 95, 96],
    humidity: 35,
    pressure: 1005,
    icons: ["↑", "↑", "↑", "~", "💥", "P"],
    isClosed: false
  },
  {
    game: "CHC @ PIT",
    venue: "PNC Park",
    time: "1:35",
    runs: 1.02,
    hr: 0.91,
    doubleTriple: 1.17,
    single: 0.97,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↖" }, { speed: 4, dir: "↖" }, { speed: 6, dir: "↖" }],
    tempHours: [84, 86, 86],
    humidity: 50,
    pressure: 1013,
    icons: ["↖", "↖", "↖", "☀️"],
    isClosed: false
  },
  {
    game: "CIN @ STL",
    venue: "Busch Stadium",
    time: "2:15",
    runs: 0.98,
    hr: 1.03,
    doubleTriple: 1.02,
    single: 0.99,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↑" }, { speed: 2, dir: "↑" }, { speed: 5, dir: "↖" }],
    tempHours: [99, 100, 104],
    humidity: 55,
    pressure: 1012,
    icons: ["↑", "↑", "↖", "☀️"],
    isClosed: false
  },
  {
    game: "SD @ MIA",
    venue: "LoanDepot Park",
    time: "1:40",
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
    time: "12:15",
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
    game: "LAD @ NYM",
    venue: "Citi Field",
    time: "1:40",
    runs: 0.94,
    hr: 1.01,
    doubleTriple: 0.83,
    single: 0.95,
    receptive: "Low",
    windHours: [{ speed: 4, dir: "↑" }, { speed: 5, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [88, 90, 91],
    humidity: 41,
    pressure: 1013,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "SEA @ TEX",
    venue: "Globe Life Field",
    time: "2:35",
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
