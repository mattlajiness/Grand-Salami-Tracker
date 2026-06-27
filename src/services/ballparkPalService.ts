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
    game: "WAS @ BAL",
    venue: "Oriole Park",
    time: "7:05",
    runs: 1.08,
    hr: 1.06,
    doubleTriple: 1.10,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 1, dir: "↑" }, { speed: 2, dir: "↖" }, { speed: 2, dir: "↖" }],
    tempHours: [75, 73, 72],
    humidity: 76,
    pressure: 1016,
    icons: ["↑", "↖", "↖", "H"],
    isClosed: false
  },
  {
    game: "CIN @ PIT",
    venue: "PNC Park",
    time: "4:05",
    runs: 1.07,
    hr: 0.86,
    doubleTriple: 1.20,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 1, dir: "↘" }, { speed: 2, dir: "→" }, { speed: 2, dir: "→" }],
    tempHours: [77, 73, 70],
    humidity: 76,
    pressure: 1017,
    icons: ["↘", "→", "→", "☀️", "H"],
    isClosed: false
  },
  {
    game: "NYY @ BOS",
    venue: "Fenway Park",
    time: "1:10",
    runs: 1.04,
    hr: 0.92,
    doubleTriple: 1.12,
    single: 1.06,
    receptive: "High",
    windHours: [{ speed: 9, dir: "↓" }, { speed: 10, dir: "↙" }, { speed: 9, dir: "↙" }],
    tempHours: [70, 70, 68],
    humidity: 79,
    pressure: 1015,
    icons: ["↓", "↙", "↙", "~", "H"],
    isClosed: false
  },
  {
    game: "COL @ MIN",
    venue: "Target Field",
    time: "7:10",
    runs: 1.01,
    hr: 0.93,
    doubleTriple: 1.03,
    single: 1.02,
    receptive: "Medium",
    windHours: [{ speed: 14, dir: "↙" }, { speed: 12, dir: "↙" }, { speed: 11, dir: "↙" }],
    tempHours: [79, 77, 75],
    humidity: 47,
    pressure: 1012,
    icons: ["↙", "↙", "↙", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "HOU @ DET",
    venue: "Comerica Park",
    time: "1:10",
    runs: 1.00,
    hr: 0.90,
    doubleTriple: 1.08,
    single: 1.04,
    receptive: "High",
    windHours: [{ speed: 7, dir: "→" }, { speed: 6, dir: "→" }, { speed: 6, dir: "↘" }],
    tempHours: [81, 82, 82],
    humidity: 48,
    pressure: 1018,
    icons: ["→", "→", "↘", "~", "☀️"],
    isClosed: false
  },
  {
    game: "ATL @ SF",
    venue: "Oracle Park",
    time: "9:05",
    runs: 1.00,
    hr: 0.79,
    doubleTriple: 1.14,
    single: 1.08,
    receptive: "Consistent",
    windHours: [{ speed: 22, dir: "↑" }, { speed: 22, dir: "↑" }, { speed: 21, dir: "↑" }],
    tempHours: [61, 59, 57],
    humidity: 63,
    pressure: 1013,
    icons: ["↑", "↑", "↑", "≈"],
    isClosed: false
  },
  {
    game: "KC @ CHW",
    venue: "Rate Field",
    time: "4:10",
    runs: 1.00,
    hr: 1.03,
    doubleTriple: 0.91,
    single: 1.03,
    receptive: "Med-High",
    windHours: [{ speed: 8, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 7, dir: "↘" }],
    tempHours: [72, 72, 72],
    humidity: 73,
    pressure: 1016,
    icons: ["↘", "↘", "↘", "~"],
    isClosed: false
  },
  {
    game: "ATH @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 1.00,
    hr: 1.03,
    doubleTriple: 0.89,
    single: 1.04,
    receptive: "Consistent",
    windHours: [{ speed: 12, dir: "↑" }, { speed: 12, dir: "↑" }, { speed: 11, dir: "↑" }],
    tempHours: [72, 70, 68],
    humidity: 61,
    pressure: 1011,
    icons: ["↑", "↑", "↑", "≈"],
    isClosed: false
  },
  {
    game: "TEX @ TOR",
    venue: "Rogers Centre",
    time: "3:07",
    runs: 0.98,
    hr: 1.03,
    doubleTriple: 1.03,
    single: 0.96,
    receptive: "Minimal",
    windHours: [{ speed: 5, dir: "↑" }, { speed: 4, dir: "↑" }, { speed: 4, dir: "↑" }],
    tempHours: [81, 82, 77],
    humidity: 54,
    pressure: 1017,
    icons: ["↑", "↑", "↑", "☀️"],
    isClosed: false
  },
  {
    game: "PHI @ NYM",
    venue: "Citi Field",
    time: "4:10",
    runs: 0.98,
    hr: 1.07,
    doubleTriple: 0.85,
    single: 0.96,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 9, dir: "↑" }],
    tempHours: [82, 81, 79],
    humidity: 58,
    pressure: 1015,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "MIA @ STL",
    venue: "Busch Stadium",
    time: "7:15",
    runs: 0.97,
    hr: 0.94,
    doubleTriple: 1.05,
    single: 1.02,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↙" }, { speed: 3, dir: "↙" }, { speed: 7, dir: "↙" }],
    tempHours: [84, 82, 81],
    humidity: 70,
    pressure: 1012,
    icons: ["↙", "↙", "↙", "☀️"],
    isClosed: false
  },
  {
    game: "SEA @ CLE",
    venue: "Progressive Field",
    time: "7:10",
    runs: 0.94,
    hr: 0.96,
    doubleTriple: 0.97,
    single: 0.94,
    receptive: "High",
    windHours: [{ speed: 5, dir: "↙" }, { speed: 4, dir: "↙" }, { speed: 4, dir: "↙" }],
    tempHours: [70, 68, 66],
    humidity: 73,
    pressure: 1017,
    icons: ["↙", "↙", "↙"],
    isClosed: false
  },
  {
    game: "ARI @ TB",
    venue: "Tropicana Field",
    time: "6:10",
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
    game: "LAD @ SD",
    venue: "Petco Park",
    time: "8:40",
    runs: 0.92,
    hr: 0.95,
    doubleTriple: 0.86,
    single: 0.97,
    receptive: "Low",
    windHours: [{ speed: 12, dir: "→" }, { speed: 12, dir: "→" }, { speed: 11, dir: "↘" }],
    tempHours: [70, 68, 68],
    humidity: 70,
    pressure: 1013,
    icons: ["→", "→", "↘", "≈"],
    isClosed: false
  },
  {
    game: "CHC @ MIL",
    venue: "American Family Fld",
    time: "7:10",
    runs: 0.89,
    hr: 1.00,
    doubleTriple: 0.88,
    single: 0.86,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 5, dir: "↘" }, { speed: 5, dir: "↘" }],
    tempHours: [68, 64, 63],
    humidity: 66,
    pressure: 1017,
    icons: ["↘", "↘", "↘", "~"],
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
