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
    game: "COL @ ATH",
    venue: "Las Vegas Ballpark",
    time: "10:05",
    runs: 1.52,
    hr: 1.92,
    doubleTriple: 1.17,
    single: 1.12,
    receptive: "High",
    windHours: [{ speed: 15, dir: "↑" }, { speed: 14, dir: "↑" }, { speed: 10, dir: "↗" }],
    tempHours: [97, 91, 88],
    humidity: 11,
    pressure: 1003,
    icons: ["↑", "↑", "↗", "≈", "🔴", "H", "P"],
    isClosed: false
  },
  {
    game: "TEX @ BOS",
    venue: "Fenway Park",
    time: "4:10",
    runs: 1.18,
    hr: 0.98,
    doubleTriple: 1.36,
    single: 1.08,
    receptive: "High",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 5, dir: "↘" }, { speed: 3, dir: "↘" }],
    tempHours: [93, 88, 84],
    humidity: 24,
    pressure: 1007,
    icons: ["↘", "↘", "↘", "🔴", "H", "P"],
    isClosed: false
  },
  {
    game: "SD @ BAL",
    venue: "Oriole Park",
    time: "4:05",
    runs: 1.11,
    hr: 0.96,
    doubleTriple: 1.15,
    single: 1.10,
    receptive: "Med-High",
    windHours: [{ speed: 8, dir: "→" }, { speed: 6, dir: "↗" }, { speed: 5, dir: "↗" }],
    tempHours: [93, 90, 86],
    humidity: 25,
    pressure: 1014,
    icons: ["→", "↗", "↗", "~", "🔴", "H"],
    isClosed: false
  },
  {
    game: "DET @ CLE",
    venue: "Progressive Field",
    time: "4:10",
    runs: 1.07,
    hr: 1.08,
    doubleTriple: 1.04,
    single: 1.01,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 9, dir: "↗" }, { speed: 9, dir: "↗" }],
    tempHours: [88, 82, 81],
    humidity: 36,
    pressure: 1013,
    icons: ["↗", "↗", "↗", "~", "☀️"],
    isClosed: false
  },
  {
    game: "ARI @ CIN",
    venue: "Great American BP",
    time: "4:10",
    runs: 1.06,
    hr: 1.16,
    doubleTriple: 0.98,
    single: 0.96,
    receptive: "Low",
    windHours: [{ speed: 5, dir: "↖" }, { speed: 6, dir: "↑" }, { speed: 3, dir: "↗" }],
    tempHours: [93, 84, 79],
    humidity: 26,
    pressure: 1014,
    icons: ["↖", "↑", "↗", "🔴"],
    isClosed: false
  },
  {
    game: "NYY @ TOR",
    venue: "Rogers Centre",
    time: "3:07",
    runs: 1.06,
    hr: 1.18,
    doubleTriple: 0.94,
    single: 1.03,
    receptive: "Minimal",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 11, dir: "↗" }, { speed: 13, dir: "↗" }],
    tempHours: [90, 88, 82],
    humidity: 29,
    pressure: 1011,
    icons: ["↗", "↗", "↗", "≈", "🔴"],
    isClosed: false
  },
  {
    game: "STL @ MIN",
    venue: "Target Field",
    time: "2:10",
    runs: 1.06,
    hr: 1.08,
    doubleTriple: 1.00,
    single: 1.02,
    receptive: "Medium",
    windHours: [{ speed: 13, dir: "↑" }, { speed: 13, dir: "↑" }, { speed: 14, dir: "↑" }],
    tempHours: [79, 79, 79],
    humidity: 37,
    pressure: 1011,
    icons: ["↑", "↑", "↑", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "SEA @ WAS",
    venue: "Nationals Park",
    time: "4:05",
    runs: 1.06,
    hr: 0.95,
    doubleTriple: 1.07,
    single: 1.08,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "↘" }, { speed: 6, dir: "↘" }, { speed: 4, dir: "↘" }],
    tempHours: [95, 90, 86],
    humidity: 28,
    pressure: 1014,
    icons: ["↘", "↘", "↘", "~", "🔴"],
    isClosed: false
  },
  {
    game: "LAD @ CHW",
    venue: "Rate Field",
    time: "4:10",
    runs: 1.05,
    hr: 1.09,
    doubleTriple: 0.91,
    single: 1.06,
    receptive: "Med-High",
    windHours: [{ speed: 14, dir: "←" }, { speed: 12, dir: "←" }, { speed: 13, dir: "←" }],
    tempHours: [84, 82, 81],
    humidity: 49,
    pressure: 1010,
    icons: ["←", "←", "←", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "MIA @ PIT",
    venue: "PNC Park",
    time: "4:05",
    runs: 1.03,
    hr: 0.89,
    doubleTriple: 1.14,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "↖" }, { speed: 8, dir: "↖" }, { speed: 6, dir: "↖" }],
    tempHours: [91, 84, 81],
    humidity: 24,
    pressure: 1014,
    icons: ["↖", "↖", "↖", "~", "🔴", "H"],
    isClosed: false
  },
  {
    game: "TB @ LAA",
    venue: "Angel Stadium",
    time: "10:07",
    runs: 1.03,
    hr: 1.07,
    doubleTriple: 0.95,
    single: 1.03,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 8, dir: "↗" }, { speed: 6, dir: "↑" }],
    tempHours: [77, 75, 73],
    humidity: 49,
    pressure: 1011,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "CHC @ SF",
    venue: "Oracle Park",
    time: "10:05",
    runs: 1.00,
    hr: 0.84,
    doubleTriple: 1.09,
    single: 1.08,
    receptive: "Consistent",
    windHours: [{ speed: 12, dir: "↑" }, { speed: 11, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [63, 61, 61],
    humidity: 71,
    pressure: 1010,
    icons: ["↑", "↑", "↑", "≈", "P"],
    isClosed: false
  },
  {
    game: "HOU @ KC",
    venue: "Kauffman Stadium",
    time: "7:10",
    runs: 1.00,
    hr: 1.22,
    doubleTriple: 0.89,
    single: 0.97,
    receptive: "High",
    windHours: [{ speed: 1, dir: "↘" }, { speed: 1, dir: "↙" }, { speed: 2, dir: "↘" }],
    tempHours: [79, 75, 73],
    humidity: 82,
    pressure: 1006,
    icons: ["↘", "↙", "↘", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "PHI @ MIL",
    venue: "American Family Fld",
    time: "7:10",
    runs: 0.95,
    hr: 1.06,
    doubleTriple: 0.87,
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
    game: "ATL @ NYM",
    venue: "Citi Field",
    time: "4:10",
    runs: 0.90,
    hr: 0.94,
    doubleTriple: 0.78,
    single: 0.97,
    receptive: "Low",
    windHours: [{ speed: 11, dir: "↘" }, { speed: 11, dir: "↘" }, { speed: 9, dir: "↘" }],
    tempHours: [91, 90, 88],
    humidity: 24,
    pressure: 1010,
    icons: ["↘", "↘", "↘", "≈", "🔴", "H", "P"],
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
