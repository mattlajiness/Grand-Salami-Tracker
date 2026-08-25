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
    game: "MIN @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.29,
    hr: 1.32,
    doubleTriple: 1.23,
    single: 1.09,
    receptive: "Very High",
    windHours: [{ speed: 12, dir: "↑" }, { speed: 11, dir: "↑" }, { speed: 10, dir: "↑" }],
    tempHours: [93, 88, 79],
    humidity: 17,
    pressure: 1012,
    icons: ["↑", "↑", "↑", "≈", "💥", "H"],
    isClosed: false
  },
  {
    game: "COL @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.09,
    hr: 1.11,
    doubleTriple: 1.09,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "↗" }, { speed: 5, dir: "↗" }, { speed: 4, dir: "↗" }],
    tempHours: [82, 77, 75],
    humidity: 42,
    pressure: 1016,
    icons: ["↗", "↗", "↗", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "LAD @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 1.05,
    hr: 1.07,
    doubleTriple: 0.94,
    single: 1.07,
    receptive: "Medium",
    windHours: [{ speed: 10, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 5, dir: "↑" }],
    tempHours: [88, 84, 82],
    humidity: 31,
    pressure: 1014,
    icons: ["↑", "↑", "↑", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "CHC @ ARI",
    venue: "Chase Field",
    time: "9:40",
    runs: 1.00,
    hr: 0.91,
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
    game: "CLE @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 0.98,
    hr: 0.98,
    doubleTriple: 0.95,
    single: 1.01,
    receptive: "Consistent",
    windHours: [{ speed: 8, dir: "↗" }, { speed: 8, dir: "↗" }, { speed: 8, dir: "↗" }],
    tempHours: [88, 84, 81],
    humidity: 39,
    pressure: 1009,
    icons: ["↗", "↗", "↗", "〜", "☀️", "P"],
    isClosed: false
  },
  {
    game: "KC @ TOR",
    venue: "Rogers Centre",
    time: "7:07",
    runs: 0.98,
    hr: 1.00,
    doubleTriple: 1.01,
    single: 0.98,
    receptive: "Minimal",
    windHours: [{ speed: 4, dir: "↙" }, { speed: 4, dir: "↙" }, { speed: 4, dir: "↓" }],
    tempHours: [72, 68, 66],
    humidity: 53,
    pressure: 1017,
    icons: ["↙", "↙", "↓"],
    isClosed: false
  },
  {
    game: "TEX @ CHW",
    venue: "Rate Field",
    time: "7:40",
    runs: 0.97,
    hr: 0.92,
    doubleTriple: 0.99,
    single: 1.00,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↙" }, { speed: 9, dir: "←" }, { speed: 7, dir: "↙" }],
    tempHours: [75, 73, 72],
    humidity: 50,
    pressure: 1016,
    icons: ["↙", "←", "↙", "〜"],
    isClosed: false
  },
  {
    game: "PHI @ SEA",
    venue: "T-Mobile Park",
    time: "9:40",
    runs: 0.97,
    hr: 1.08,
    doubleTriple: 0.86,
    single: 0.96,
    receptive: "Medium",
    windHours: [{ speed: 11, dir: "↗" }, { speed: 9, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [82, 79, 73],
    humidity: 35,
    pressure: 1013,
    icons: ["↗", "↑", "↑", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "CIN @ SF",
    venue: "Oracle Park",
    time: "9:45",
    runs: 0.96,
    hr: 0.77,
    doubleTriple: 1.09,
    single: 1.06,
    receptive: "Consistent",
    windHours: [{ speed: 11, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 9, dir: "↑" }],
    tempHours: [63, 63, 61],
    humidity: 74,
    pressure: 1015,
    icons: ["↑", "↑", "↑", "〜"],
    isClosed: false
  },
  {
    game: "BOS @ MIA",
    venue: "LoanDepot Park",
    time: "6:40",
    runs: 0.94,
    hr: 0.86,
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
    game: "HOU @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 0.94,
    hr: 1.09,
    doubleTriple: 0.80,
    single: 0.94,
    receptive: "High",
    windHours: [{ speed: 12, dir: "↗" }, { speed: 10, dir: "↗" }, { speed: 10, dir: "↗" }],
    tempHours: [77, 75, 73],
    humidity: 48,
    pressure: 1015,
    icons: ["↗", "↗", "↗", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "TB @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 0.93,
    hr: 0.83,
    doubleTriple: 0.99,
    single: 1.03,
    receptive: "High",
    windHours: [{ speed: 11, dir: "↙" }, { speed: 9, dir: "↙" }, { speed: 7, dir: "↙" }],
    tempHours: [75, 73, 70],
    humidity: 50,
    pressure: 1017,
    icons: ["↙", "↙", "↙", "〜"],
    isClosed: false
  },
  {
    game: "PIT @ SD",
    venue: "Petco Park",
    time: "9:40",
    runs: 0.93,
    hr: 1.00,
    doubleTriple: 0.88,
    single: 0.94,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 6, dir: "↘" }, { speed: 6, dir: "↘" }],
    tempHours: [77, 79, 77],
    humidity: 62,
    pressure: 1010,
    icons: ["↘", "↘", "↘", "〜", "☀️", "P"],
    isClosed: false
  },
  {
    game: "MIL @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.93,
    hr: 1.03,
    doubleTriple: 0.74,
    single: 0.98,
    receptive: "Low",
    windHours: [{ speed: 11, dir: "↘" }, { speed: 10, dir: "↘" }, { speed: 9, dir: "↘" }],
    tempHours: [77, 75, 73],
    humidity: 48,
    pressure: 1015,
    icons: ["↘", "↘", "↘", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "BAL @ STL",
    venue: "Busch Stadium",
    time: "7:45",
    runs: 0.92,
    hr: 0.86,
    doubleTriple: 0.94,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 8, dir: "↙" }, { speed: 6, dir: "↙" }, { speed: 5, dir: "↙" }],
    tempHours: [81, 81, 79],
    humidity: 49,
    pressure: 1015,
    icons: ["↙", "↙", "↙", "〜", "☀️"],
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
