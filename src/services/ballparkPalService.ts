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
    time: "9:05",
    runs: 1.32,
    hr: 1.42,
    doubleTriple: 1.22,
    single: 1.07,
    receptive: "Very High",
    windHours: [{ speed: 14, dir: "↑" }, { speed: 12, dir: "↑" }, { speed: 11, dir: "↑" }],
    tempHours: [97, 90, 82],
    humidity: 10,
    pressure: 1010,
    icons: ["↑", "↑", "↑", "≈", "💥", "H", "P"],
    isClosed: false
  },
  {
    game: "COL @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.07,
    hr: 1.11,
    doubleTriple: 1.09,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "↖" }, { speed: 9, dir: "↖" }, { speed: 10, dir: "↖" }],
    tempHours: [86, 79, 77],
    humidity: 41,
    pressure: 1016,
    icons: ["↖", "↖", "↖", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "KC @ TOR",
    venue: "Rogers Centre",
    time: "7:07",
    runs: 1.05,
    hr: 1.16,
    doubleTriple: 1.06,
    single: 0.96,
    receptive: "Minimal",
    windHours: [{ speed: 8, dir: "↑" }, { speed: 7, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [73, 70, 70],
    humidity: 57,
    pressure: 1014,
    icons: ["↑", "↑", "↑", "〜"],
    isClosed: false
  },
  {
    game: "CIN @ SF",
    venue: "Oracle Park",
    time: "3:45",
    runs: 1.02,
    hr: 0.87,
    doubleTriple: 1.09,
    single: 1.08,
    receptive: "Consistent",
    windHours: [{ speed: 7, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 9, dir: "↑" }],
    tempHours: [64, 64, 64],
    humidity: 67,
    pressure: 1016,
    icons: ["↑", "↑", "↑", "〜"],
    isClosed: false
  },
  {
    game: "TEX @ CHW",
    venue: "Rate Field",
    time: "7:40",
    runs: 1.01,
    hr: 1.04,
    doubleTriple: 0.93,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↖" }, { speed: 8, dir: "↖" }, { speed: 6, dir: "↖" }],
    tempHours: [73, 72, 72],
    humidity: 72,
    pressure: 1012,
    icons: ["↖", "↖", "↖", "〜"],
    isClosed: false
  },
  {
    game: "PIT @ SD",
    venue: "Petco Park",
    time: "4:10",
    runs: 1.00,
    hr: 1.08,
    doubleTriple: 0.88,
    single: 0.99,
    receptive: "Low",
    windHours: [{ speed: 11, dir: "↗" }, { speed: 11, dir: "↗" }, { speed: 11, dir: "↗" }],
    tempHours: [75, 75, 75],
    humidity: 73,
    pressure: 1012,
    icons: ["↗", "↗", "↗", "≈"],
    isClosed: false
  },
  {
    game: "CHC @ ARI",
    venue: "Chase Field",
    time: "3:40",
    runs: 1.00,
    hr: 0.92,
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
    time: "4:07",
    runs: 0.98,
    hr: 1.02,
    doubleTriple: 0.96,
    single: 0.98,
    receptive: "Consistent",
    windHours: [{ speed: 11, dir: "↑" }, { speed: 10, dir: "↑" }, { speed: 12, dir: "↖" }],
    tempHours: [84, 84, 84],
    humidity: 49,
    pressure: 1011,
    icons: ["↗", "↗", "↖", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "BAL @ STL",
    venue: "Busch Stadium",
    time: "7:45",
    runs: 0.95,
    hr: 0.93,
    doubleTriple: 0.95,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 5, dir: "↘" }, { speed: 3, dir: "↙" }, { speed: 6, dir: "↙" }],
    tempHours: [86, 82, 81],
    humidity: 50,
    pressure: 1011,
    icons: ["↘", "↙", "↙", "☀️"],
    isClosed: false
  },
  {
    game: "BOS @ MIA",
    venue: "LoanDepot Park",
    time: "6:40",
    runs: 0.95,
    hr: 0.87,
    doubleTriple: 1.02,
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
    game: "MIL @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.95,
    hr: 1.04,
    doubleTriple: 0.85,
    single: 0.94,
    receptive: "Low",
    windHours: [{ speed: 12, dir: "↑" }, { speed: 11, dir: "↑" }, { speed: 11, dir: "↑" }],
    tempHours: [77, 77, 77],
    humidity: 50,
    pressure: 1018,
    icons: ["↑", "↑", "↑", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "PHI @ SEA",
    venue: "T-Mobile Park",
    time: "4:10",
    runs: 0.95,
    hr: 1.00,
    doubleTriple: 0.92,
    single: 0.94,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "↑" }, { speed: 6, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [79, 81, 82],
    humidity: 36,
    pressure: 1015,
    icons: ["↑", "↑", "↑", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "LAD @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 0.92,
    hr: 0.95,
    doubleTriple: 0.88,
    single: 1.00,
    receptive: "Medium",
    windHours: [{ speed: 7, dir: "↓" }, { speed: 7, dir: "↘" }, { speed: 5, dir: "↘" }],
    tempHours: [81, 77, 75],
    humidity: 56,
    pressure: 1015,
    icons: ["↓", "↘", "↘", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "HOU @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 0.92,
    hr: 1.10,
    doubleTriple: 0.88,
    single: 0.86,
    receptive: "High",
    windHours: [{ speed: 12, dir: "↖" }, { speed: 11, dir: "↖" }, { speed: 11, dir: "↖" }],
    tempHours: [77, 77, 75],
    humidity: 50,
    pressure: 1018,
    icons: ["↖", "↖", "↖", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "TB @ DET",
    venue: "Comerica Park",
    time: "1:10",
    runs: 0.91,
    hr: 0.82,
    doubleTriple: 0.95,
    single: 1.03,
    receptive: "High",
    windHours: [{ speed: 12, dir: "↙" }, { speed: 12, dir: "↙" }, { speed: 13, dir: "↙" }],
    tempHours: [77, 79, 79],
    humidity: 42,
    pressure: 1015,
    icons: ["↙", "↙", "↙", "≈", "☀️"],
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
