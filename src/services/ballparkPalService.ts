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
    game: "PIT @ COL",
    venue: "Coors Field",
    time: "3:10",
    runs: 1.36,
    hr: 1.16,
    doubleTriple: 1.32,
    single: 1.20,
    receptive: "Low",
    windHours: [{ speed: 12, dir: "↘" }, { speed: 14, dir: "↘" }, { speed: 16, dir: "↘" }],
    tempHours: [90, 91, 91],
    humidity: 7,
    pressure: 1001,
    icons: ["↘", "↘", "↘", "~", "🔴", "H", "P"],
    isClosed: false
  },
  {
    game: "LAA @ ATH",
    venue: "Sutter Health Park",
    time: "4:05",
    runs: 1.19,
    hr: 1.26,
    doubleTriple: 1.13,
    single: 1.04,
    receptive: "Very High",
    windHours: [{ speed: 1, dir: "↙" }, { speed: 1, dir: "↖" }, { speed: 1, dir: "↑" }],
    tempHours: [90, 93, 95],
    humidity: 31,
    pressure: 1010,
    icons: ["↙", "↖", "↑", "🔴", "P"],
    isClosed: false
  },
  {
    game: "STL @ KC",
    venue: "Kauffman Stadium",
    time: "2:10",
    runs: 1.14,
    hr: 1.26,
    doubleTriple: 1.06,
    single: 1.02,
    receptive: "High",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 8, dir: "↗" }, { speed: 7, dir: "↗" }],
    tempHours: [77, 79, 81],
    humidity: 75,
    pressure: 1005,
    icons: ["↗", "↗", "↗", "~", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "NYM @ PHI",
    venue: "Citizens Bank Park",
    time: "7:20",
    runs: 1.03,
    hr: 1.15,
    doubleTriple: 0.94,
    single: 0.97,
    receptive: "Very High",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 8, dir: "↗" }, { speed: 5, dir: "↗" }],
    tempHours: [79, 75, 73],
    humidity: 39,
    pressure: 1013,
    icons: ["↗", "↗", "↗", "~", "☀️"],
    isClosed: false
  },
  {
    game: "BAL @ LAD",
    venue: "Dodger Stadium",
    time: "4:10",
    runs: 1.02,
    hr: 1.24,
    doubleTriple: 0.97,
    single: 0.93,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 11, dir: "↑" }, { speed: 10, dir: "↑" }],
    tempHours: [75, 77, 77],
    humidity: 56,
    pressure: 1012,
    icons: ["↑", "↑", "↑", "≈"],
    isClosed: false
  },
  {
    game: "MIN @ ARI",
    venue: "Chase Field",
    time: "3:15",
    runs: 1.00,
    hr: 0.92,
    doubleTriple: 1.12,
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
    game: "MIL @ ATL",
    venue: "Truist Park",
    time: "1:35",
    runs: 0.99,
    hr: 1.02,
    doubleTriple: 0.97,
    single: 1.00,
    receptive: "Medium",
    windHours: [{ speed: 5, dir: "←" }, { speed: 6, dir: "←" }, { speed: 7, dir: "←" }],
    tempHours: [82, 84, 86],
    humidity: 63,
    pressure: 1014,
    icons: ["←", "←", "←", "~", "☀️"],
    isClosed: false
  },
  {
    game: "TOR @ CHC",
    venue: "Wrigley Field",
    time: "2:20",
    runs: 0.99,
    hr: 1.06,
    doubleTriple: 0.96,
    single: 0.95,
    receptive: "Extreme",
    windHours: [{ speed: 7, dir: "↖" }, { speed: 6, dir: "↖" }, { speed: 7, dir: "←" }],
    tempHours: [75, 73, 72],
    humidity: 61,
    pressure: 1014,
    icons: ["↖", "↖", "←", "~"],
    isClosed: false
  },
  {
    game: "CHW @ DET",
    venue: "Comerica Park",
    time: "1:40",
    runs: 0.98,
    hr: 0.85,
    doubleTriple: 1.02,
    single: 1.08,
    receptive: "High",
    windHours: [{ speed: 2, dir: "↘" }, { speed: 4, dir: "↓" }, { speed: 5, dir: "↓" }],
    tempHours: [77, 79, 79],
    humidity: 44,
    pressure: 1015,
    icons: ["↘", "↓", "↓", "☀️"],
    isClosed: false
  },
  {
    game: "CIN @ NYY",
    venue: "Yankee Stadium",
    time: "1:35",
    runs: 0.97,
    hr: 1.11,
    doubleTriple: 0.82,
    single: 0.96,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 9, dir: "↗" }, { speed: 7, dir: "↗" }],
    tempHours: [81, 82, 84],
    humidity: 32,
    pressure: 1011,
    icons: ["↗", "↗", "↗", "~", "☀️"],
    isClosed: false
  },
  {
    game: "CLE @ HOU",
    venue: "Daikin Park",
    time: "2:10",
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
    game: "SF @ MIA",
    venue: "LoanDepot Park",
    time: "1:40",
    runs: 0.95,
    hr: 0.87,
    doubleTriple: 1.01,
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
    game: "WAS @ TB",
    venue: "Tropicana Field",
    time: "1:40",
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
    game: "BOS @ SEA",
    venue: "T-Mobile Park",
    time: "4:10",
    runs: 0.94,
    hr: 1.02,
    doubleTriple: 0.85,
    single: 0.96,
    receptive: "Medium",
    windHours: [{ speed: 4, dir: "↘" }, { speed: 6, dir: "↘" }, { speed: 8, dir: "↘" }],
    tempHours: [73, 75, 77],
    humidity: 53,
    pressure: 1017,
    icons: ["↘", "↘", "↘", "~"],
    isClosed: false
  },
  {
    game: "SD @ TEX",
    venue: "Globe Life Field",
    time: "2:35",
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
