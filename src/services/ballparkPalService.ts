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
    time: "3:10",
    runs: 1.39,
    hr: 1.27,
    doubleTriple: 1.21,
    single: 1.24,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "←" }, { speed: 7, dir: "←" }, { speed: 7, dir: "←" }],
    tempHours: [90, 91, 91],
    humidity: 22,
    pressure: 1009,
    icons: ["←", "←", "←", "〜", "💥", "H", "P"],
    isClosed: false
  },
  {
    game: "MIL @ CIN",
    venue: "Great American BP",
    time: "12:10",
    runs: 1.09,
    hr: 1.14,
    doubleTriple: 1.00,
    single: 1.00,
    receptive: "Low",
    windHours: [{ speed: 10, dir: "↘" }, { speed: 10, dir: "→" }, { speed: 10, dir: "→" }],
    tempHours: [82, 79, 79],
    humidity: 48,
    pressure: 1016,
    icons: ["↘", "→", "→", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "ATL @ PHI",
    venue: "Citizens Bank Park",
    time: "1:10",
    runs: 1.05,
    hr: 1.03,
    doubleTriple: 1.03,
    single: 1.01,
    receptive: "Very High",
    windHours: [{ speed: 6, dir: "↓" }, { speed: 6, dir: "↘" }, { speed: 7, dir: "↘" }],
    tempHours: [77, 79, 81],
    humidity: 62,
    pressure: 1014,
    icons: ["↓", "↓", "↘", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "TOR @ KC",
    venue: "Kauffman Stadium",
    time: "2:10",
    runs: 1.04,
    hr: 1.09,
    doubleTriple: 1.01,
    single: 1.01,
    receptive: "High",
    windHours: [{ speed: 6, dir: "↙" }, { speed: 5, dir: "↙" }, { speed: 7, dir: "↓" }],
    tempHours: [99, 100, 102],
    humidity: 25,
    pressure: 1012,
    icons: ["↙", "↙", "↓", "〜", "💥", "H"],
    isClosed: false
  },
  {
    game: "WAS @ LAD",
    venue: "Dodger Stadium",
    time: "10:10",
    runs: 1.02,
    hr: 1.21,
    doubleTriple: 0.95,
    single: 0.95,
    receptive: "Consistent",
    windHours: [{ speed: 2, dir: "↑" }, { speed: 6, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [79, 77, 75],
    humidity: 61,
    pressure: 1011,
    icons: ["↑", "↗", "↗", "☀️"],
    isClosed: false
  },
  {
    game: "BOS @ BAL",
    venue: "Oriole Park",
    time: "1:35",
    runs: 0.99,
    hr: 0.81,
    doubleTriple: 1.10,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↓" }, { speed: 9, dir: "↓" }, { speed: 8, dir: "↓" }],
    tempHours: [79, 81, 81],
    humidity: 50,
    pressure: 1015,
    icons: ["↓", "↓", "↓", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "LAA @ PIT",
    venue: "PNC Park",
    time: "1:35",
    runs: 0.98,
    hr: 0.80,
    doubleTriple: 1.11,
    single: 1.02,
    receptive: "Med-High",
    windHours: [{ speed: 8, dir: "↘" }, { speed: 8, dir: "↘" }, { speed: 7, dir: "↘" }],
    tempHours: [73, 75, 75],
    humidity: 46,
    pressure: 1016,
    icons: ["↘", "↘", "↘", "〜"],
    isClosed: false
  },
  {
    game: "ATH @ SEA",
    venue: "T-Mobile Park",
    time: "4:10",
    runs: 0.96,
    hr: 1.02,
    doubleTriple: 0.92,
    single: 0.94,
    receptive: "Medium",
    windHours: [{ speed: 5, dir: "↘" }, { speed: 6, dir: "↘" }, { speed: 6, dir: "↘" }],
    tempHours: [72, 73, 73],
    humidity: 41,
    pressure: 1015,
    icons: ["↘", "↘", "↘", "〜"],
    isClosed: false
  },
  {
    game: "CHC @ MIA",
    venue: "LoanDepot Park",
    time: "1:40",
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
    game: "ARI @ HOU",
    venue: "Daikin Park",
    time: "2:10",
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
    game: "MIN @ CHW",
    venue: "Rate Field",
    time: "6:20",
    runs: 0.95,
    hr: 0.88,
    doubleTriple: 0.91,
    single: 1.03,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "→" }, { speed: 6, dir: "→" }, { speed: 6, dir: "→" }],
    tempHours: [72, 72, 70],
    humidity: 60,
    pressure: 1018,
    icons: ["→", "→", "→", "〜"],
    isClosed: false
  },
  {
    game: "DET @ CLE",
    venue: "Progressive Field",
    time: "1:40",
    runs: 0.94,
    hr: 0.87,
    doubleTriple: 1.01,
    single: 0.95,
    receptive: "High",
    windHours: [{ speed: 13, dir: "↙" }, { speed: 16, dir: "↙" }, { speed: 17, dir: "↙" }],
    tempHours: [72, 70, 70],
    humidity: 59,
    pressure: 1017,
    icons: ["↙", "↙", "↙", "≈"],
    isClosed: false
  },
  {
    game: "TB @ TEX",
    venue: "Globe Life Field",
    time: "2:35",
    runs: 0.93,
    hr: 0.88,
    doubleTriple: 0.94,
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
    game: "NYY @ SD",
    venue: "Petco Park",
    time: "4:10",
    runs: 0.92,
    hr: 0.94,
    doubleTriple: 0.86,
    single: 0.97,
    receptive: "Low",
    windHours: [{ speed: 19, dir: "↘" }, { speed: 16, dir: "↘" }, { speed: 14, dir: "↘" }],
    tempHours: [75, 77, 77],
    humidity: 76,
    pressure: 1013,
    icons: ["↓", "↘", "↘", "≈", "H"],
    isClosed: false
  },
  {
    game: "SF @ NYM",
    venue: "Citi Field",
    time: "1:40",
    runs: 0.92,
    hr: 1.00,
    doubleTriple: 0.80,
    single: 0.95,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "↓" }, { speed: 7, dir: "↓" }, { speed: 7, dir: "↙" }],
    tempHours: [75, 77, 77],
    humidity: 55,
    pressure: 1014,
    icons: ["↓", "↓", "↙", "〜"],
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
