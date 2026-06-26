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
    game: "NYY @ BOS",
    venue: "Fenway Park",
    time: "7:10",
    runs: 1.17,
    hr: 1.07,
    doubleTriple: 1.20,
    single: 1.09,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 6, dir: "↑" }, { speed: 7, dir: "↗" }],
    tempHours: [72, 70, 68],
    humidity: 83,
    pressure: 1015,
    icons: ["↗", "↗", "↗", "~", "H"],
    isClosed: false
  },
  {
    game: "ATH @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 1.06,
    hr: 1.06,
    doubleTriple: 1.06,
    single: 1.02,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 9, dir: "↑" }],
    tempHours: [72, 70, 68],
    humidity: 55,
    pressure: 1012,
    icons: ["↑", "↑", "↑", "~"],
    isClosed: false
  },
  {
    game: "HOU @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 1.02,
    hr: 0.90,
    doubleTriple: 1.02,
    single: 1.09,
    receptive: "High",
    windHours: [{ speed: 4, dir: "↓" }, { speed: 4, dir: "↓" }, { speed: 3, dir: "↘" }],
    tempHours: [75, 73, 72],
    humidity: 56,
    pressure: 1015,
    icons: ["↓", "↓", "↘"],
    isClosed: false
  },
  {
    game: "KC @ CHW",
    venue: "Rate Field",
    time: "7:40",
    runs: 1.01,
    hr: 1.05,
    doubleTriple: 0.87,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 11, dir: "↗" }, { speed: 10, dir: "↗" }, { speed: 9, dir: "↗" }],
    tempHours: [66, 64, 64],
    humidity: 70,
    pressure: 1016,
    icons: ["↗", "↗", "↗", "≈"],
    isClosed: false
  },
  {
    game: "SEA @ CLE",
    venue: "Progressive Field",
    time: "7:10",
    runs: 1.01,
    hr: 1.04,
    doubleTriple: 1.02,
    single: 0.95,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }, { speed: 2, dir: "↗" }],
    tempHours: [70, 70, 68],
    humidity: 87,
    pressure: 1017,
    icons: ["↗", "↗", "↗", "~", "H"],
    isClosed: false
  },
  {
    game: "TEX @ TOR",
    venue: "Rogers Centre",
    time: "7:07",
    runs: 0.98,
    hr: 1.03,
    doubleTriple: 1.02,
    single: 0.97,
    receptive: "Minimal",
    windHours: [{ speed: 3, dir: "↘" }, { speed: 5, dir: "↓" }, { speed: 5, dir: "↓" }],
    tempHours: [72, 70, 68],
    humidity: 67,
    pressure: 1016,
    icons: ["↘", "↓", "↘"],
    isClosed: false
  },
  {
    game: "ATL @ SF",
    venue: "Oracle Park",
    time: "10:15",
    runs: 0.98,
    hr: 0.78,
    doubleTriple: 1.07,
    single: 1.09,
    receptive: "Consistent",
    windHours: [{ speed: 14, dir: "↑" }, { speed: 13, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [61, 61, 59],
    humidity: 89,
    pressure: 1013,
    icons: ["↑", "↑", "↑", "≈", "H"],
    isClosed: false
  },
  {
    game: "COL @ MIN",
    venue: "Target Field",
    time: "8:10",
    runs: 0.97,
    hr: 0.89,
    doubleTriple: 0.99,
    single: 1.01,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "↙" }, { speed: 6, dir: "↙" }, { speed: 6, dir: "↙" }],
    tempHours: [73, 72, 68],
    humidity: 54,
    pressure: 1015,
    icons: ["↙", "↙", "↙", "~"],
    isClosed: false
  },
  {
    game: "PHI @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.95,
    hr: 1.05,
    doubleTriple: 0.81,
    single: 0.96,
    receptive: "Low",
    windHours: [{ speed: 8, dir: "↑" }, { speed: 6, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [73, 72, 72],
    humidity: 85,
    pressure: 1017,
    icons: ["↑", "↑", "↑", "~", "H"],
    isClosed: false
  },
  {
    game: "CIN @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 0.95,
    hr: 0.84,
    doubleTriple: 1.06,
    single: 0.98,
    receptive: "Med-High",
    windHours: [{ speed: 2, dir: "↑" }, { speed: 2, dir: "→" }, { speed: 1, dir: "←" }],
    tempHours: [72, 68, 66],
    humidity: 98,
    pressure: 1018,
    icons: ["↑", "→", "←", "H"],
    isClosed: false
  },
  {
    game: "WAS @ BAL",
    venue: "Oriole Park",
    time: "7:05",
    runs: 0.94,
    hr: 0.80,
    doubleTriple: 1.03,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 8, dir: "↓" }, { speed: 6, dir: "↘" }, { speed: 5, dir: "↓" }],
    tempHours: [73, 72, 70],
    humidity: 92,
    pressure: 1017,
    icons: ["↓", "↘", "↓", "~", "H"],
    isClosed: false
  },
  {
    game: "ARI @ TB",
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
    game: "MIA @ STL",
    venue: "Busch Stadium",
    time: "8:15",
    runs: 0.93,
    hr: 0.90,
    doubleTriple: 0.90,
    single: 1.06,
    receptive: "Med-High",
    windHours: [{ speed: 2, dir: "↗" }, { speed: 2, dir: "↓" }, { speed: 4, dir: "↘" }],
    tempHours: [77, 75, 73],
    humidity: 84,
    pressure: 1012,
    icons: ["↗", "↓", "↘", "☀️", "H"],
    isClosed: false
  },
  {
    game: "LAD @ SD",
    venue: "Petco Park",
    time: "9:45",
    runs: 0.93,
    hr: 0.96,
    doubleTriple: 0.89,
    single: 0.95,
    receptive: "Low",
    windHours: [{ speed: 8, dir: "↗" }, { speed: 7, dir: "↗" }, { speed: 7, dir: "↗" }],
    tempHours: [70, 68, 68],
    humidity: 65,
    pressure: 1013,
    icons: ["↗", "↗", "↗", "~"],
    isClosed: false
  },
  {
    game: "CHC @ MIL",
    venue: "American Family Fld",
    time: "7:45",
    runs: 0.92,
    hr: 1.00,
    doubleTriple: 0.90,
    single: 0.90,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 8, dir: "↘" }, { speed: 6, dir: "↘" }],
    tempHours: [66, 63, 59],
    humidity: 65,
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
