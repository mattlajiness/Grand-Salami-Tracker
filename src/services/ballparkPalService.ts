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
    game: "BOS @ COL",
    venue: "Coors Field",
    time: "8:40",
    runs: 1.34,
    hr: 1.32,
    doubleTriple: 1.27,
    single: 1.14,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↖" }, { speed: 6, dir: "↖" }, { speed: 6, dir: "←" }],
    tempHours: [90, 88, 84],
    humidity: 13,
    pressure: 1005,
    icons: ["↖", "↖", "←", "~", "🔴", "H", "P"],
    isClosed: false
  },
  {
    game: "PHI @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.08,
    hr: 1.15,
    doubleTriple: 1.07,
    single: 1.02,
    receptive: "Med-High",
    windHours: [{ speed: 10, dir: "↑" }, { speed: 9, dir: "↖" }, { speed: 11, dir: "↖" }],
    tempHours: [86, 82, 81],
    humidity: 44,
    pressure: 1010,
    icons: ["↑", "↖", "↖", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "MIL @ CIN",
    venue: "Great American BP",
    time: "7:10",
    runs: 1.08,
    hr: 1.18,
    doubleTriple: 1.04,
    single: 0.95,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 11, dir: "↗" }, { speed: 11, dir: "↗" }],
    tempHours: [68, 66, 66],
    humidity: 88,
    pressure: 1011,
    icons: ["↗", "↗", "↗", "≈", "H"],
    isClosed: false
  },
  {
    game: "BAL @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 1.03,
    hr: 1.08,
    doubleTriple: 0.96,
    single: 1.02,
    receptive: "Consistent",
    windHours: [{ speed: 10, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 8, dir: "↑" }],
    tempHours: [73, 72, 70],
    humidity: 54,
    pressure: 1013,
    icons: ["↑", "↑", "↑", "~"],
    isClosed: false
  },
  {
    game: "NYY @ DET",
    venue: "Comerica Park",
    time: "6:10",
    runs: 1.01,
    hr: 0.95,
    doubleTriple: 1.02,
    single: 1.05,
    receptive: "High",
    windHours: [{ speed: 12, dir: "↗" }, { speed: 11, dir: "↗" }, { speed: 11, dir: "↗" }],
    tempHours: [70, 68, 66],
    humidity: 56,
    pressure: 1014,
    icons: ["↗", "↗", "↗", "≈"],
    isClosed: false
  },
  {
    game: "LAD @ MIN",
    venue: "Target Field",
    time: "7:40",
    runs: 0.99,
    hr: 0.85,
    doubleTriple: 1.04,
    single: 1.03,
    receptive: "Medium",
    windHours: [{ speed: 5, dir: "↓" }, { speed: 5, dir: "↓" }, { speed: 5, dir: "↓" }],
    tempHours: [73, 72, 70],
    humidity: 47,
    pressure: 1018,
    icons: ["↓", "↓", "↓", "~"],
    isClosed: false
  },
  {
    game: "CLE @ CHW",
    venue: "Rate Field",
    time: "7:40",
    runs: 0.98,
    hr: 1.07,
    doubleTriple: 0.88,
    single: 1.00,
    receptive: "Med-High",
    windHours: [{ speed: 15, dir: "↗" }, { speed: 14, dir: "↗" }, { speed: 12, dir: "↗" }],
    tempHours: [64, 63, 63],
    humidity: 62,
    pressure: 1018,
    icons: ["↗", "↗", "↗", "≈"],
    isClosed: false
  },
  {
    game: "TEX @ MIA",
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
    game: "HOU @ TOR",
    venue: "Rogers Centre",
    time: "7:07",
    runs: 0.94,
    hr: 1.01,
    doubleTriple: 0.95,
    single: 0.97,
    receptive: "Roof Closed",
    windHours: [],
    tempHours: [],
    humidity: 0,
    pressure: 0,
    icons: ["🏟️"],
    isClosed: true
  },
  {
    game: "KC @ TB",
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
    game: "CHC @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.94,
    hr: 1.03,
    doubleTriple: 0.80,
    single: 0.96,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↖" }, { speed: 9, dir: "↖" }, { speed: 9, dir: "↖" }],
    tempHours: [70, 70, 70],
    humidity: 96,
    pressure: 1013,
    icons: ["↖", "↖", "↖", "~", "H"],
    isClosed: false
  },
  {
    game: "ATL @ SD",
    venue: "Petco Park",
    time: "10:10",
    runs: 0.91,
    hr: 0.92,
    doubleTriple: 0.94,
    single: 0.92,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 6, dir: "↘" }],
    tempHours: [70, 68, 68],
    humidity: 67,
    pressure: 1014,
    icons: ["↘", "↘", "↘", "~"],
    isClosed: false
  },
  {
    game: "ARI @ STL",
    venue: "Busch Stadium",
    time: "7:45",
    runs: 0.88,
    hr: 0.79,
    doubleTriple: 0.93,
    single: 1.03,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "↘" }, { speed: 6, dir: "↘" }, { speed: 3, dir: "↘" }],
    tempHours: [70, 68, 66],
    humidity: 73,
    pressure: 1018,
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
