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
    game: "SEA @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.23,
    hr: 1.34,
    doubleTriple: 1.14,
    single: 1.04,
    receptive: "Very High",
    windHours: [{ speed: 17, dir: "↑" }, { speed: 16, dir: "↑" }, { speed: 14, dir: "↑" }],
    tempHours: [73, 68, 64],
    humidity: 34,
    pressure: 1009,
    icons: ["↑", "↑", "↑", "≈", "P"],
    isClosed: false
  },
  {
    game: "MIN @ CHW",
    venue: "Rate Field",
    time: "2:10",
    runs: 1.05,
    hr: 1.01,
    doubleTriple: 0.99,
    single: 1.06,
    receptive: "Med-High",
    windHours: [{ speed: 8, dir: "↙" }, { speed: 8, dir: "↙" }, { speed: 8, dir: "↙" }],
    tempHours: [84, 82, 81],
    humidity: 41,
    pressure: 1019,
    icons: ["↙", "↙", "↙", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "NYY @ KC",
    venue: "Kauffman Stadium",
    time: "3:40",
    runs: 1.04,
    hr: 1.11,
    doubleTriple: 1.08,
    single: 0.97,
    receptive: "High",
    windHours: [{ speed: 11, dir: "↖" }, { speed: 11, dir: "↖" }, { speed: 9, dir: "↖" }],
    tempHours: [88, 88, 84],
    humidity: 33,
    pressure: 1016,
    icons: ["↖", "↖", "↖", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "CHC @ PIT",
    venue: "PNC Park",
    time: "1:35",
    runs: 1.02,
    hr: 0.88,
    doubleTriple: 1.20,
    single: 0.96,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↗" }, { speed: 3, dir: "↗" }, { speed: 2, dir: "↗" }],
    tempHours: [72, 73, 75],
    humidity: 79,
    pressure: 1020,
    icons: ["↗", "↗", "↗", "H", "P"],
    isClosed: false
  },
  {
    game: "TB @ BAL",
    venue: "Oriole Park",
    time: "1:35",
    runs: 0.99,
    hr: 0.90,
    doubleTriple: 1.05,
    single: 1.03,
    receptive: "Med-High",
    windHours: [{ speed: 3, dir: "↘" }, { speed: 3, dir: "↘" }, { speed: 3, dir: "↘" }],
    tempHours: [73, 73, 77],
    humidity: 85,
    pressure: 1020,
    icons: ["↘", "↘", "↘", "H", "P"],
    isClosed: false
  },
  {
    game: "COL @ LAD",
    venue: "Dodger Stadium",
    time: "9:10",
    runs: 0.98,
    hr: 1.12,
    doubleTriple: 0.93,
    single: 0.97,
    receptive: "Consistent",
    windHours: [{ speed: 11, dir: "↗" }, { speed: 9, dir: "↗" }, { speed: 9, dir: "↗" }],
    tempHours: [68, 66, 64],
    humidity: 58,
    pressure: 1011,
    icons: ["↗", "↗", "↗", "~"],
    isClosed: false
  },
  {
    game: "CIN @ NYM",
    venue: "Citi Field",
    time: "4:10",
    runs: 0.95,
    hr: 1.04,
    doubleTriple: 0.80,
    single: 0.98,
    receptive: "Low",
    windHours: [{ speed: 4, dir: "↗" }, { speed: 3, dir: "↗" }, { speed: 4, dir: "↗" }],
    tempHours: [72, 72, 70],
    humidity: 86,
    pressure: 1019,
    icons: ["↗", "↗", "↗", "H", "P"],
    isClosed: false
  },
  {
    game: "ARI @ SF",
    venue: "Oracle Park",
    time: "5:05",
    runs: 0.94,
    hr: 0.75,
    doubleTriple: 1.07,
    single: 1.06,
    receptive: "Consistent",
    windHours: [{ speed: 13, dir: "↑" }, { speed: 15, dir: "↑" }, { speed: 16, dir: "↑" }],
    tempHours: [59, 59, 57],
    humidity: 75,
    pressure: 1015,
    icons: ["↑", "↑", "↑", "≈", "H"],
    isClosed: false
  },
  {
    game: "STL @ MIL",
    venue: "American Family Fld",
    time: "2:10",
    runs: 0.94,
    hr: 1.05,
    doubleTriple: 0.92,
    single: 0.90,
    receptive: "Low",
    windHours: [{ speed: 11, dir: "↖" }, { speed: 11, dir: "↖" }, { speed: 12, dir: "↖" }],
    tempHours: [84, 88, 88],
    humidity: 31,
    pressure: 1018,
    icons: ["↖", "↖", "↖", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "HOU @ TEX",
    venue: "Globe Life Field",
    time: "7:05",
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
    game: "MIA @ TOR",
    venue: "Rogers Centre",
    time: "7:07",
    runs: 0.92,
    hr: 1.00,
    doubleTriple: 0.94,
    single: 0.96,
    receptive: "Minimal",
    windHours: [{ speed: 6, dir: "↗" }, { speed: 6, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [64, 63, 61],
    humidity: 67,
    pressure: 1019,
    icons: ["↗", "↗", "↗", "~", "P"],
    isClosed: false
  },
  {
    game: "PHI @ SD",
    venue: "Petco Park",
    time: "6:40",
    runs: 0.91,
    hr: 0.93,
    doubleTriple: 0.89,
    single: 0.95,
    receptive: "Low",
    windHours: [{ speed: 13, dir: "↘" }, { speed: 13, dir: "↘" }, { speed: 13, dir: "↘" }],
    tempHours: [68, 68, 66],
    humidity: 57,
    pressure: 1013,
    icons: ["↘", "↘", "↘", "≈"],
    isClosed: false
  },
  {
    game: "WAS @ CLE",
    venue: "Progressive Field",
    time: "6:10",
    runs: 0.87,
    hr: 0.80,
    doubleTriple: 0.92,
    single: 0.96,
    receptive: "High",
    windHours: [{ speed: 5, dir: "↙" }, { speed: 4, dir: "↙" }, { speed: 4, dir: "↙" }],
    tempHours: [63, 61, 59],
    humidity: 73,
    pressure: 1020,
    icons: ["↙", "↙", "↙", "P"],
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
