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
    game: "BOS @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.24,
    hr: 1.34,
    doubleTriple: 1.19,
    single: 1.02,
    receptive: "Very High",
    windHours: [{ speed: 12, dir: "↑" }, { speed: 12, dir: "↑" }, { speed: 11, dir: "↑" }],
    tempHours: [93, 88, 79],
    humidity: 18,
    pressure: 1010,
    icons: ["↑", "↑", "↑", "≈", "💥", "H", "P"],
    isClosed: false
  },
  {
    game: "NYY @ CHW",
    venue: "Rate Field",
    time: "7:40",
    runs: 1.10,
    hr: 1.28,
    doubleTriple: 0.95,
    single: 1.00,
    receptive: "Med-High",
    windHours: [{ speed: 14, dir: "↖" }, { speed: 11, dir: "↖" }, { speed: 9, dir: "↖" }],
    tempHours: [86, 84, 81],
    humidity: 69,
    pressure: 1004,
    icons: ["↖", "↖", "↖", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "CLE @ CIN",
    venue: "Great American BP",
    time: "7:10",
    runs: 1.09,
    hr: 1.16,
    doubleTriple: 0.99,
    single: 0.99,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "↙" }, { speed: 5, dir: "↙" }, { speed: 4, dir: "↙" }],
    tempHours: [86, 81, 77],
    humidity: 55,
    pressure: 1007,
    icons: ["↙", "↙", "↙", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "TOR @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.07,
    hr: 1.14,
    doubleTriple: 1.09,
    single: 1.00,
    receptive: "Med-High",
    windHours: [{ speed: 3, dir: "↖" }, { speed: 5, dir: "↖" }, { speed: 2, dir: "↗" }],
    tempHours: [84, 81, 78],
    humidity: 36,
    pressure: 1009,
    icons: ["↖", "↖", "↗", "☀️", "P"],
    isClosed: false
  },
  {
    game: "BAL @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 1.07,
    hr: 1.02,
    doubleTriple: 1.02,
    single: 1.09,
    receptive: "High",
    windHours: [{ speed: 9, dir: "←" }, { speed: 6, dir: "↘" }, { speed: 8, dir: "↘" }],
    tempHours: [79, 79, 75],
    humidity: 82,
    pressure: 1002,
    icons: ["←", "↘", "↘", "~", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "ARI @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 1.03,
    hr: 0.92,
    doubleTriple: 1.09,
    single: 1.03,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "↖" }, { speed: 7, dir: "←" }, { speed: 4, dir: "←" }],
    tempHours: [88, 84, 77],
    humidity: 43,
    pressure: 1008,
    icons: ["↖", "←", "←", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "HOU @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 1.02,
    hr: 1.14,
    doubleTriple: 0.93,
    single: 0.99,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [82, 81, 79],
    humidity: 50,
    pressure: 1010,
    icons: ["↑", "↑", "↑", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "MIL @ SF",
    venue: "Oracle Park",
    time: "9:45",
    runs: 0.98,
    hr: 0.80,
    doubleTriple: 1.10,
    single: 1.07,
    receptive: "Consistent",
    windHours: [{ speed: 14, dir: "↑" }, { speed: 14, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [63, 63, 61],
    humidity: 70,
    pressure: 1014,
    icons: ["↑", "↑", "↑", "≈"],
    isClosed: false
  },
  {
    game: "CHC @ STL",
    venue: "Busch Stadium",
    time: "7:45",
    runs: 0.98,
    hr: 0.94,
    doubleTriple: 1.03,
    single: 1.03,
    receptive: "Med-High",
    windHours: [{ speed: 8, dir: "↙" }, { speed: 7, dir: "↙" }, { speed: 7, dir: "↙" }],
    tempHours: [98, 95, 91],
    humidity: 55,
    pressure: 1005,
    icons: ["↙", "↙", "↙", "~", "💥", "P"],
    isClosed: false
  },
  {
    game: "ATL @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.97,
    hr: 1.09,
    doubleTriple: 0.85,
    single: 0.94,
    receptive: "Low",
    windHours: [{ speed: 13, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 3, dir: "↗" }],
    tempHours: [75, 75, 73],
    humidity: 68,
    pressure: 1008,
    icons: ["↑", "↑", "↗", "~", "P"],
    isClosed: false
  },
  {
    game: "PHI @ MIA",
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
