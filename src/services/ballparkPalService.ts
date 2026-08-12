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
    game: "TB @ ATH",
    venue: "Sutter Health Park",
    time: "3:05",
    runs: 1.19,
    hr: 1.25,
    doubleTriple: 1.13,
    single: 1.04,
    receptive: "Very High",
    windHours: [{ speed: 6, dir: "↑" }, { speed: 7, dir: "↑" }, { speed: 8, dir: "↑" }],
    tempHours: [88, 90, 90],
    humidity: 37,
    pressure: 1010,
    icons: ["↑", "↑", "↑", "〜", "☀️", "P"],
    isClosed: false
  },
  {
    game: "CLE @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 1.08,
    hr: 1.00,
    doubleTriple: 1.02,
    single: 1.12,
    receptive: "High",
    windHours: [{ speed: 4, dir: "←" }, { speed: 4, dir: "←" }, { speed: 5, dir: "↙" }],
    tempHours: [82, 84, 81],
    humidity: 51,
    pressure: 1008,
    icons: ["←", "←", "↙", "☀️", "P"],
    isClosed: false
  },
  {
    game: "CIN @ CHW",
    venue: "Rate Field",
    time: "7:40",
    runs: 1.03,
    hr: 1.05,
    doubleTriple: 0.92,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↗" }, { speed: 2, dir: "↗" }, { speed: 1, dir: "↗" }],
    tempHours: [79, 77, 75],
    humidity: 70,
    pressure: 1008,
    icons: ["↗", "↗", "↗", "☀️", "P"],
    isClosed: false
  },
  {
    game: "CHC @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.02,
    hr: 1.09,
    doubleTriple: 0.99,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↘" }, { speed: 4, dir: "↙" }, { speed: 6, dir: "↖" }],
    tempHours: [88, 84, 79],
    humidity: 43,
    pressure: 1010,
    icons: ["↘", "↙", "↖", "☀️", "P"],
    isClosed: false
  },
  {
    game: "NYM @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 1.00,
    hr: 1.07,
    doubleTriple: 1.00,
    single: 0.98,
    receptive: "Medium",
    windHours: [{ speed: 7, dir: "↑" }, { speed: 6, dir: "↖" }, { speed: 7, dir: "↖" }],
    tempHours: [90, 88, 84],
    humidity: 50,
    pressure: 1012,
    icons: ["↑", "↖", "↖", "〜", "💥"],
    isClosed: false
  },
  {
    game: "BAL @ MIN",
    venue: "Target Field",
    time: "1:40",
    runs: 1.00,
    hr: 0.93,
    doubleTriple: 1.04,
    single: 1.01,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "↓" }, { speed: 5, dir: "↓" }, { speed: 3, dir: "↘" }],
    tempHours: [91, 93, 95],
    humidity: 39,
    pressure: 1009,
    icons: ["↓", "↓", "↘", "💥", "P"],
    isClosed: false
  },
  {
    game: "COL @ ARI",
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
    game: "PHI @ STL",
    venue: "Busch Stadium",
    time: "2:15",
    runs: 1.00,
    hr: 1.03,
    doubleTriple: 0.95,
    single: 1.06,
    receptive: "Med-High",
    windHours: [{ speed: 3, dir: "↗" }, { speed: 4, dir: "↑" }, { speed: 3, dir: "↖" }],
    tempHours: [99, 93, 93],
    humidity: 38,
    pressure: 1009,
    icons: ["↗", "↑", "↖", "💥", "P"],
    isClosed: false
  },
  {
    game: "KC @ LAD",
    venue: "Dodger Stadium",
    time: "10:10",
    runs: 0.99,
    hr: 1.14,
    doubleTriple: 0.98,
    single: 0.95,
    receptive: "Consistent",
    windHours: [{ speed: 8, dir: "↗" }, { speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [75, 73, 72],
    humidity: 57,
    pressure: 1011,
    icons: ["↗", "↗", "↗", "〜"],
    isClosed: false
  },
  {
    game: "BOS @ TOR",
    venue: "Rogers Centre",
    time: "7:07",
    runs: 0.99,
    hr: 1.13,
    doubleTriple: 0.95,
    single: 0.97,
    receptive: "Minimal",
    windHours: [{ speed: 6, dir: "↙" }, { speed: 6, dir: "↙" }, { speed: 3, dir: "←" }],
    tempHours: [72, 70, 70],
    humidity: 80,
    pressure: 1009,
    icons: ["↙", "↙", "←", "〜", "H", "P"],
    isClosed: false
  },
  {
    game: "SEA @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 0.98,
    hr: 1.14,
    doubleTriple: 0.77,
    single: 0.98,
    receptive: "High",
    windHours: [{ speed: 12, dir: "↗" }, { speed: 10, dir: "↗" }, { speed: 8, dir: "→" }],
    tempHours: [86, 84, 82],
    humidity: 32,
    pressure: 1009,
    icons: ["↗", "↗", "→", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "HOU @ SF",
    venue: "Oracle Park",
    time: "3:45",
    runs: 0.97,
    hr: 0.90,
    doubleTriple: 1.11,
    single: 1.00,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↖" }, { speed: 11, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [66, 68, 68],
    humidity: 86,
    pressure: 1012,
    icons: ["↖", "↑", "↑", "≈", "H"],
    isClosed: false
  },
  {
    game: "MIL @ SD",
    venue: "Petco Park",
    time: "4:10",
    runs: 0.97,
    hr: 1.05,
    doubleTriple: 0.87,
    single: 0.98,
    receptive: "Low",
    windHours: [{ speed: 8, dir: "→" }, { speed: 10, dir: "→" }, { speed: 9, dir: "↗" }],
    tempHours: [82, 81, 77],
    humidity: 67,
    pressure: 1013,
    icons: ["→", "→", "↗", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "TEX @ LAA",
    venue: "Angel Stadium",
    time: "10:10",
    runs: 0.96,
    hr: 0.97,
    doubleTriple: 0.93,
    single: 0.99,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [75, 73, 73],
    humidity: 61,
    pressure: 1011,
    icons: ["↑", "↑", "↑", "〜"],
    isClosed: false
  },
  {
    game: "PIT @ MIA",
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
