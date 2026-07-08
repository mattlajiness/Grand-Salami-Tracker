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
    runs: 1.22,
    hr: 1.17,
    doubleTriple: 1.20,
    single: 1.04,
    receptive: "Low",
    windHours: [{ speed: 1, dir: "↘" }, { speed: 1, dir: "↓" }, { speed: 1, dir: "↙" }],
    tempHours: [77, 77, 73],
    humidity: 76,
    pressure: 1013,
    icons: ["↘", "↓", "↙", "☀️", "H"],
    isClosed: false
  },
  {
    game: "HOU @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.12,
    hr: 1.15,
    doubleTriple: 1.14,
    single: 1.02,
    receptive: "Med-High",
    windHours: [{ speed: 2, dir: "↖" }, { speed: 4, dir: "↖" }, { speed: 4, dir: "↖" }],
    tempHours: [84, 82, 77],
    humidity: 62,
    pressure: 1015,
    icons: ["↖", "↖", "↖", "☀️"],
    isClosed: false
  },
  {
    game: "CHC @ BAL",
    venue: "Oriole Park",
    time: "6:35",
    runs: 1.10,
    hr: 1.09,
    doubleTriple: 1.13,
    single: 1.03,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↖" }, { speed: 4, dir: "↖" }, { speed: 5, dir: "↖" }],
    tempHours: [81, 81, 79],
    humidity: 65,
    pressure: 1015,
    icons: ["↖", "↖", "↖", "☀️"],
    isClosed: false
  },
  {
    game: "ATH @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 1.07,
    hr: 1.00,
    doubleTriple: 1.01,
    single: 1.11,
    receptive: "High",
    windHours: [{ speed: 8, dir: "←" }, { speed: 6, dir: "←" }, { speed: 5, dir: "←" }],
    tempHours: [86, 86, 82],
    humidity: 43,
    pressure: 1013,
    icons: ["←", "←", "←", "~", "☀️"],
    isClosed: false
  },
  {
    game: "BOS @ CHW",
    venue: "Rate Field",
    time: "7:40",
    runs: 1.06,
    hr: 1.10,
    doubleTriple: 1.00,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 2, dir: "↖" }, { speed: 3, dir: "↖" }, { speed: 2, dir: "↖" }],
    tempHours: [84, 82, 81],
    humidity: 54,
    pressure: 1013,
    icons: ["↖", "↖", "↖", "☀️"],
    isClosed: false
  },
  {
    game: "CLE @ MIN",
    venue: "Target Field",
    time: "7:40",
    runs: 1.06,
    hr: 1.00,
    doubleTriple: 1.01,
    single: 1.06,
    receptive: "Medium",
    windHours: [{ speed: 5, dir: "↘" }, { speed: 6, dir: "↘" }, { speed: 8, dir: "↘" }],
    tempHours: [77, 75, 72],
    humidity: 85,
    pressure: 1011,
    icons: ["↘", "↘", "↘", "~", "☀️", "H"],
    isClosed: false
  },
  {
    game: "ATL @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 1.05,
    hr: 0.97,
    doubleTriple: 1.18,
    single: 0.97,
    receptive: "Med-High",
    windHours: [{ speed: 5, dir: "↖" }, { speed: 4, dir: "↖" }, { speed: 4, dir: "↗" }],
    tempHours: [86, 81, 77],
    humidity: 54,
    pressure: 1013,
    icons: ["↖", "↖", "↗", "☀️"],
    isClosed: false
  },
  {
    game: "COL @ LAD",
    venue: "Dodger Stadium",
    time: "10:10",
    runs: 1.00,
    hr: 1.16,
    doubleTriple: 1.01,
    single: 0.93,
    receptive: "Consistent",
    windHours: [{ speed: 7, dir: "↑" }, { speed: 5, dir: "↑" }, { speed: 4, dir: "↑" }],
    tempHours: [82, 79, 79],
    humidity: 40,
    pressure: 1010,
    icons: ["↑", "↑", "↑", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "KC @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.97,
    hr: 1.08,
    doubleTriple: 0.84,
    single: 0.95,
    receptive: "Low",
    windHours: [{ speed: 12, dir: "↑" }, { speed: 12, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [77, 75, 73],
    humidity: 59,
    pressure: 1015,
    icons: ["↑", "↑", "↑", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "MIL @ STL",
    venue: "Busch Stadium",
    time: "7:45",
    runs: 0.96,
    hr: 0.91,
    doubleTriple: 1.02,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↓" }, { speed: 3, dir: "↓" }, { speed: 3, dir: "↙" }],
    tempHours: [86, 84, 81],
    humidity: 59,
    pressure: 1013,
    icons: ["↓", "↓", "↙", "☀️"],
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
    game: "TOR @ SF",
    venue: "Oracle Park",
    time: "3:45",
    runs: 0.95,
    hr: 0.79,
    doubleTriple: 1.01,
    single: 1.08,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 12, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [63, 63, 63],
    humidity: 71,
    pressure: 1018,
    icons: ["↑", "↑", "↑", "≈"],
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
    hr: 0.89,
    doubleTriple: 0.93,
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
    time: "10:10",
    runs: 0.92,
    hr: 0.97,
    doubleTriple: 0.87,
    single: 0.94,
    receptive: "Low",
    windHours: [{ speed: 5, dir: "↗" }, { speed: 5, dir: "↗" }, { speed: 4, dir: "→" }],
    tempHours: [73, 73, 72],
    humidity: 62,
    pressure: 1011,
    icons: ["↗", "↗", "→"],
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
