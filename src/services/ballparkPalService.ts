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
    game: "SF @ COL",
    venue: "Coors Field",
    time: "8:40",
    runs: 1.27,
    hr: 1.03,
    doubleTriple: 1.22,
    single: 1.22,
    receptive: "Low",
    windHours: [{ speed: 17, dir: "↓" }, { speed: 19, dir: "↓" }, { speed: 14, dir: "↓" }],
    tempHours: [73, 68, 66],
    humidity: 29,
    pressure: 1000,
    icons: ["↓", "↓", "↓", "≈", "P"],
    isClosed: false
  },
  {
    game: "ATL @ CIN",
    venue: "Great American BP",
    time: "6:40",
    runs: 1.11,
    hr: 1.12,
    doubleTriple: 1.07,
    single: 0.99,
    receptive: "Low",
    windHours: [{ speed: 4, dir: "→" }, { speed: 4, dir: "→" }, { speed: 3, dir: "↗" }],
    tempHours: [77, 72, 66],
    humidity: 49,
    pressure: 1013,
    icons: ["→", "→", "↗", "☀️"],
    isClosed: false
  },
  {
    game: "NYY @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.09,
    hr: 1.09,
    doubleTriple: 1.08,
    single: 1.02,
    receptive: "Very High",
    windHours: [{ speed: 3, dir: "↓" }, { speed: 2, dir: "↓" }, { speed: 2, dir: "↓" }],
    tempHours: [72, 70, 68],
    humidity: 44,
    pressure: 1015,
    icons: ["↓", "↓", "↓"],
    isClosed: false
  },
  {
    game: "TOR @ BAL",
    venue: "Oriole Park",
    time: "7:05",
    runs: 1.03,
    hr: 1.03,
    doubleTriple: 1.00,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 7, dir: "↗" }, { speed: 9, dir: "↗" }],
    tempHours: [72, 70, 68],
    humidity: 49,
    pressure: 1009,
    icons: ["↗", "↗", "↗", "~", "P"],
    isClosed: false
  },
  {
    game: "SD @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.03,
    hr: 1.08,
    doubleTriple: 1.01,
    single: 1.02,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↗" }, { speed: 3, dir: "↑" }, { speed: 3, dir: "↗" }],
    tempHours: [77, 72, 68],
    humidity: 36,
    pressure: 1010,
    icons: ["↗", "↑", "↗", "☀️", "P"],
    isClosed: false
  },
  {
    game: "MIN @ PIT",
    venue: "PNC Park",
    time: "6:45",
    runs: 1.01,
    hr: 0.95,
    doubleTriple: 1.09,
    single: 0.99,
    receptive: "Med-High",
    windHours: [{ speed: 8, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [72, 68, 63],
    humidity: 50,
    pressure: 1012,
    icons: ["↑", "↑", "↑", "~"],
    isClosed: false
  },
  {
    game: "CHC @ STL",
    venue: "Busch Stadium",
    time: "7:15",
    runs: 0.97,
    hr: 0.90,
    doubleTriple: 0.96,
    single: 1.09,
    receptive: "Med-High",
    windHours: [{ speed: 3, dir: "←" }, { speed: 4, dir: "↖" }, { speed: 4, dir: "←" }],
    tempHours: [73, 70, 68],
    humidity: 74,
    pressure: 1013,
    icons: ["←", "↖", "←"],
    isClosed: false
  },
  {
    game: "BOS @ CLE",
    venue: "Progressive Field",
    time: "7:10",
    runs: 0.97,
    hr: 1.03,
    doubleTriple: 0.94,
    single: 0.96,
    receptive: "High",
    windHours: [{ speed: 7, dir: "→" }, { speed: 7, dir: "→" }, { speed: 7, dir: "↗" }],
    tempHours: [66, 64, 63],
    humidity: 57,
    pressure: 1013,
    icons: ["→", "→", "↗", "~"],
    isClosed: false
  },
  {
    game: "MIL @ HOU",
    venue: "Daikin Park",
    time: "8:10",
    runs: 0.96,
    hr: 1.06,
    doubleTriple: 0.90,
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
    game: "PHI @ LAD",
    venue: "Dodger Stadium",
    time: "10:15",
    runs: 0.95,
    hr: 1.06,
    doubleTriple: 0.93,
    single: 0.97,
    receptive: "Consistent",
    windHours: [{ speed: 10, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [66, 64, 63],
    humidity: 54,
    pressure: 1014,
    icons: ["↑", "↑", "↑", "~"],
    isClosed: false
  },
  {
    game: "DET @ CHW",
    venue: "Rate Field",
    time: "7:40",
    runs: 0.95,
    hr: 0.95,
    doubleTriple: 0.86,
    single: 1.03,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "↘" }, { speed: 6, dir: "↘" }, { speed: 5, dir: "↘" }],
    tempHours: [68, 66, 64],
    humidity: 52,
    pressure: 1015,
    icons: ["↘", "↘", "↘", "~"],
    isClosed: false
  },
  {
    game: "LAA @ TB",
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
    game: "KC @ TEX",
    venue: "Globe Life Field",
    time: "8:05",
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
    game: "MIA @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.92,
    hr: 1.01,
    doubleTriple: 0.70,
    single: 1.02,
    receptive: "Low",
    windHours: [{ speed: 10, dir: "↗" }, { speed: 10, dir: "↗" }, { speed: 11, dir: "→" }],
    tempHours: [75, 73, 72],
    humidity: 36,
    pressure: 1005,
    icons: ["↗", "↗", "→", "≈", "P"],
    isClosed: false
  },
  {
    game: "ARI @ SEA",
    venue: "T-Mobile Park",
    time: "10:10",
    runs: 0.85,
    hr: 0.87,
    doubleTriple: 0.80,
    single: 0.94,
    receptive: "Medium",
    windHours: [{ speed: 5, dir: "↘" }, { speed: 3, dir: "↘" }, { speed: 3, dir: "↓" }],
    tempHours: [52, 52, 52],
    humidity: 65,
    pressure: 1019,
    icons: ["↘", "↘", "↓", "❄️", "P"],
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
