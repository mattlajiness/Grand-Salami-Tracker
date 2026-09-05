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
    game: "STL @ COL",
    venue: "Coors Field",
    time: "8:10",
    runs: 1.35,
    hr: 1.27,
    doubleTriple: 1.27,
    single: 1.17,
    receptive: "Low",
    windHours: [{ speed: 4, dir: "←" }, { speed: 6, dir: "↖" }, { speed: 11, dir: "↑" }],
    tempHours: [90, 86, 84],
    humidity: 20,
    pressure: 1007,
    icons: ["↖", "↖", "↑", "〜", "💥", "H", "P"],
    isClosed: false
  },
  {
    game: "MIL @ CIN",
    venue: "Great American BP",
    time: "6:40",
    runs: 1.14,
    hr: 1.28,
    doubleTriple: 0.95,
    single: 1.02,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 9, dir: "↗" }, { speed: 7, dir: "↗" }],
    tempHours: [90, 86, 82],
    humidity: 47,
    pressure: 1009,
    icons: ["↑", "↗", "↗", "〜", "💥", "P"],
    isClosed: false
  },
  {
    game: "TOR @ KC",
    venue: "Kauffman Stadium",
    time: "7:10",
    runs: 1.11,
    hr: 1.19,
    doubleTriple: 1.04,
    single: 1.03,
    receptive: "High",
    windHours: [{ speed: 10, dir: "↖" }, { speed: 8, dir: "↖" }, { speed: 5, dir: "↗" }],
    tempHours: [97, 97, 91],
    humidity: 27,
    pressure: 1009,
    icons: ["↖", "↖", "↗", "〜", "💥", "P"],
    isClosed: false
  },
  {
    game: "LAA @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 1.05,
    hr: 0.98,
    doubleTriple: 1.12,
    single: 1.00,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 8, dir: "↗" }, { speed: 8, dir: "↗" }],
    tempHours: [77, 73, 70],
    humidity: 58,
    pressure: 1011,
    icons: ["↗", "↗", "↗", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "WAS @ LAD",
    venue: "Dodger Stadium",
    time: "9:10",
    runs: 1.04,
    hr: 1.20,
    doubleTriple: 1.01,
    single: 0.96,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 9, dir: "↗" }, { speed: 8, dir: "↗" }],
    tempHours: [79, 77, 75],
    humidity: 37,
    pressure: 1012,
    icons: ["↗", "↗", "↗", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "MIN @ CHW",
    venue: "Rate Field",
    time: "7:10",
    runs: 1.03,
    hr: 1.06,
    doubleTriple: 0.96,
    single: 1.02,
    receptive: "Med-High",
    windHours: [{ speed: 13, dir: "↗" }, { speed: 12, dir: "↗" }, { speed: 13, dir: "→" }],
    tempHours: [73, 73, 73],
    humidity: 81,
    pressure: 1014,
    icons: ["↗", "↗", "→", "≈", "H"],
    isClosed: false
  },
  {
    game: "DET @ CLE",
    venue: "Progressive Field",
    time: "6:10",
    runs: 1.03,
    hr: 0.91,
    doubleTriple: 1.16,
    single: 0.97,
    receptive: "High",
    windHours: [{ speed: 11, dir: "↙" }, { speed: 10, dir: "↙" }, { speed: 9, dir: "↙" }],
    tempHours: [72, 70, 70],
    humidity: 62,
    pressure: 1014,
    icons: ["↙", "↙", "↙", "≈"],
    isClosed: false
  },
  {
    game: "ATL @ PHI",
    venue: "Citizens Bank Park",
    time: "6:05",
    runs: 1.01,
    hr: 0.99,
    doubleTriple: 0.99,
    single: 1.00,
    receptive: "Very High",
    windHours: [{ speed: 8, dir: "↘" }, { speed: 6, dir: "↘" }, { speed: 10, dir: "↘" }],
    tempHours: [82, 79, 77],
    humidity: 39,
    pressure: 1010,
    icons: ["↘", "↘", "↘", "〜", "☀️", "P"],
    isClosed: false
  },
  {
    game: "BOS @ BAL",
    venue: "Oriole Park",
    time: "7:05",
    runs: 1.01,
    hr: 0.92,
    doubleTriple: 1.10,
    single: 1.03,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "↓" }, { speed: 5, dir: "↓" }, { speed: 4, dir: "↓" }],
    tempHours: [81, 79, 77],
    humidity: 58,
    pressure: 1010,
    icons: ["↓", "↓", "↓", "〜", "☀️", "P"],
    isClosed: false
  },
  {
    game: "NYY @ SD",
    venue: "Petco Park",
    time: "7:15",
    runs: 0.95,
    hr: 0.99,
    doubleTriple: 0.94,
    single: 0.94,
    receptive: "Low",
    windHours: [{ speed: 8, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 7, dir: "↘" }],
    tempHours: [75, 75, 75],
    humidity: 56,
    pressure: 1013,
    icons: ["↘", "↘", "↘", "〜"],
    isClosed: false
  },
  {
    game: "ARI @ HOU",
    venue: "Daikin Park",
    time: "7:15",
    runs: 0.95,
    hr: 1.05,
    doubleTriple: 0.88,
    single: 0.96,
    receptive: "Roof Closed",
    windHours: [],
    tempHours: [],
    humidity: 0,
    pressure: 0,
    icons: ["🏟️"],
    isClosed: true
  },
  {
    game: "CHC @ MIA",
    venue: "LoanDepot Park",
    time: "4:10",
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
    game: "TB @ TEX",
    venue: "Globe Life Field",
    time: "7:05",
    runs: 0.92,
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
  },
  {
    game: "SF @ NYM",
    venue: "Citi Field",
    time: "4:10",
    runs: 0.90,
    hr: 0.96,
    doubleTriple: 0.77,
    single: 0.96,
    receptive: "Low",
    windHours: [{ speed: 12, dir: "↓" }, { speed: 12, dir: "↓" }, { speed: 12, dir: "↓" }],
    tempHours: [84, 81, 81],
    humidity: 33,
    pressure: 1009,
    icons: ["↓", "↓", "↓", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "ATH @ SEA",
    venue: "T-Mobile Park",
    time: "9:40",
    runs: 0.89,
    hr: 0.97,
    doubleTriple: 0.83,
    single: 0.92,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 5, dir: "↘" }, { speed: 4, dir: "↓" }],
    tempHours: [68, 64, 61],
    humidity: 43,
    pressure: 1016,
    icons: ["↘", "↘", "↓", "〜"],
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
