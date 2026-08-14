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
    game: "TEX @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.21,
    hr: 1.32,
    doubleTriple: 1.16,
    single: 1.00,
    receptive: "Very High",
    windHours: [{ speed: 13, dir: "↑" }, { speed: 13, dir: "↑" }, { speed: 13, dir: "↑" }],
    tempHours: [81, 75, 68],
    humidity: 32,
    pressure: 1013,
    icons: ["↑", "↑", "↑", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "MIA @ CIN",
    venue: "Great American BP",
    time: "6:10",
    runs: 1.20,
    hr: 1.20,
    doubleTriple: 1.11,
    single: 1.04,
    receptive: "Low",
    windHours: [{ speed: 1, dir: "↘" }, { speed: 2, dir: "↘" }, { speed: 5, dir: "↗" }],
    tempHours: [84, 84, 79],
    humidity: 76,
    pressure: 1017,
    icons: ["↘", "↘", "↗", "☀️", "H"],
    isClosed: false
  },
  {
    game: "ARI @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 1.03,
    hr: 1.07,
    doubleTriple: 0.98,
    single: 1.01,
    receptive: "Medium",
    windHours: [{ speed: 11, dir: "↖" }, { speed: 6, dir: "↑" }, { speed: 5, dir: "↑" }],
    tempHours: [91, 90, 88],
    humidity: 44,
    pressure: 1017,
    icons: ["↖", "↑", "↑", "〜", "💥"],
    isClosed: false
  },
  {
    game: "BOS @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 1.01,
    hr: 0.85,
    doubleTriple: 1.14,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 2, dir: "→" }, { speed: 1, dir: "→" }, { speed: 2, dir: "↗" }],
    tempHours: [82, 79, 73],
    humidity: 50,
    pressure: 1018,
    icons: ["→", "→", "↗", "☀️"],
    isClosed: false
  },
  {
    game: "SD @ CLE",
    venue: "Progressive Field",
    time: "7:10",
    runs: 1.01,
    hr: 0.93,
    doubleTriple: 1.07,
    single: 0.98,
    receptive: "High",
    windHours: [{ speed: 5, dir: "↙" }, { speed: 6, dir: "↙" }, { speed: 8, dir: "↙" }],
    tempHours: [77, 75, 73],
    humidity: 62,
    pressure: 1019,
    icons: ["↙", "↙", "↙", "〜", "☀️", "P"],
    isClosed: false
  },
  {
    game: "CHW @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 1.00,
    hr: 0.95,
    doubleTriple: 1.02,
    single: 1.05,
    receptive: "High",
    windHours: [{ speed: 7, dir: "→" }, { speed: 12, dir: "↗" }, { speed: 11, dir: "↗" }],
    tempHours: [84, 79, 75],
    humidity: 40,
    pressure: 1018,
    icons: ["→", "↗", "↗", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "MIL @ LAD",
    venue: "Dodger Stadium",
    time: "10:10",
    runs: 0.99,
    hr: 1.12,
    doubleTriple: 0.97,
    single: 0.96,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [75, 72, 72],
    humidity: 58,
    pressure: 1015,
    icons: ["↗", "↗", "↗", "〜"],
    isClosed: false
  },
  {
    game: "KC @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 0.97,
    hr: 0.91,
    doubleTriple: 0.98,
    single: 1.02,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }],
    tempHours: [77, 75, 73],
    humidity: 53,
    pressure: 1014,
    icons: ["↑", "↑", "↑", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "NYY @ TOR",
    venue: "Rogers Centre",
    time: "7:15",
    runs: 0.97,
    hr: 1.01,
    doubleTriple: 0.98,
    single: 0.98,
    receptive: "Minimal",
    windHours: [{ speed: 5, dir: "↙" }, { speed: 5, dir: "↙" }, { speed: 7, dir: "←" }],
    tempHours: [75, 73, 70],
    humidity: 53,
    pressure: 1020,
    icons: ["↙", "↙", "←", "〜", "P"],
    isClosed: false
  },
  {
    game: "SEA @ HOU",
    venue: "Daikin Park",
    time: "8:10",
    runs: 0.96,
    hr: 1.06,
    doubleTriple: 0.89,
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
    game: "COL @ SF",
    venue: "Oracle Park",
    time: "10:15",
    runs: 0.95,
    hr: 0.81,
    doubleTriple: 1.03,
    single: 1.06,
    receptive: "Consistent",
    windHours: [{ speed: 12, dir: "↗" }, { speed: 11, dir: "↗" }, { speed: 9, dir: "↗" }],
    tempHours: [61, 59, 59],
    humidity: 81,
    pressure: 1016,
    icons: ["↗", "↗", "↗", "≈", "H"],
    isClosed: false
  },
  {
    game: "BAL @ TB",
    venue: "Tropicana Field",
    time: "7:10",
    runs: 0.94,
    hr: 0.96,
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
    game: "STL @ CHC",
    venue: "Wrigley Field",
    time: "2:20",
    runs: 0.94,
    hr: 0.98,
    doubleTriple: 0.81,
    single: 1.03,
    receptive: "Extreme",
    windHours: [{ speed: 8, dir: "↙" }, { speed: 6, dir: "↙" }, { speed: 7, dir: "↙" }],
    tempHours: [79, 77, 79],
    humidity: 90,
    pressure: 1018,
    icons: ["↙", "↙", "↙", "〜", "☀️", "H"],
    isClosed: false
  },
  {
    game: "WAS @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.92,
    hr: 0.97,
    doubleTriple: 0.77,
    single: 0.99,
    receptive: "Low",
    windHours: [{ speed: 3, dir: "↘" }, { speed: 4, dir: "↓" }, { speed: 12, dir: "↙" }],
    tempHours: [88, 86, 82],
    humidity: 32,
    pressure: 1016,
    icons: ["↘", "↓", "↙", "〜", "☀️"],
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
