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
    game: "MIL @ ATH",
    venue: "Las Vegas Ballpark",
    time: "9:05",
    runs: 1.47,
    hr: 1.80,
    doubleTriple: 1.22,
    single: 1.08,
    receptive: "High",
    windHours: [{ speed: 19, dir: "↑" }, { speed: 14, dir: "↑" }, { speed: 11, dir: "↑" }],
    tempHours: [99, 93, 88],
    humidity: 9,
    pressure: 1000,
    icons: ["↑", "↑", "↑", "≈", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "CHC @ COL",
    venue: "Coors Field",
    time: "8:40",
    runs: 1.36,
    hr: 1.22,
    doubleTriple: 1.43,
    single: 1.13,
    receptive: "Low",
    windHours: [{ speed: 11, dir: "↗" }, { speed: 7, dir: "→" }, { speed: 8, dir: "↘" }],
    tempHours: [90, 86, 82],
    humidity: 8,
    pressure: 996,
    icons: ["↗", "→", "↘", "~", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "TEX @ KC",
    venue: "Kauffman Stadium",
    time: "7:40",
    runs: 1.21,
    hr: 1.40,
    doubleTriple: 1.12,
    single: 1.02,
    receptive: "High",
    windHours: [{ speed: 18, dir: "↑" }, { speed: 14, dir: "↖" }, { speed: 20, dir: "↑" }],
    tempHours: [84, 81, 75],
    humidity: 77,
    pressure: 1003,
    icons: ["↑", "↖", "↑", "≈", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "MIN @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 1.13,
    hr: 1.10,
    doubleTriple: 1.03,
    single: 1.13,
    receptive: "High",
    windHours: [{ speed: 11, dir: "←" }, { speed: 11, dir: "←" }, { speed: 12, dir: "←" }],
    tempHours: [90, 90, 86],
    humidity: 55,
    pressure: 1006,
    icons: ["←", "←", "←", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "WAS @ SF",
    venue: "Oracle Park",
    time: "3:45",
    runs: 1.12,
    hr: 0.98,
    doubleTriple: 1.23,
    single: 1.08,
    receptive: "Consistent",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 9, dir: "↑" }, { speed: 10, dir: "↗" }],
    tempHours: [81, 82, 75],
    humidity: 31,
    pressure: 1012,
    icons: ["↗", "↑", "↗", "~", "☀️"],
    isClosed: false
  },
  {
    game: "SEA @ BAL",
    venue: "Oriole Park",
    time: "6:35",
    runs: 1.12,
    hr: 1.14,
    doubleTriple: 1.11,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↖" }, { speed: 4, dir: "↑" }, { speed: 3, dir: "↑" }],
    tempHours: [81, 77, 75],
    humidity: 73,
    pressure: 1010,
    icons: ["↖", "↑", "↑", "☀️", "P"],
    isClosed: false
  },
  {
    game: "PHI @ TOR",
    venue: "Rogers Centre",
    time: "7:07",
    runs: 1.09,
    hr: 1.18,
    doubleTriple: 1.11,
    single: 0.98,
    receptive: "Minimal",
    windHours: [{ speed: 7, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 5, dir: "↘" }],
    tempHours: [77, 75, 73],
    humidity: 68,
    pressure: 1006,
    icons: ["↘", "↘", "↘", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "ATL @ CHW",
    venue: "Rate Field",
    time: "7:40",
    runs: 1.08,
    hr: 1.16,
    doubleTriple: 0.89,
    single: 1.07,
    receptive: "Med-High",
    windHours: [{ speed: 12, dir: "←" }, { speed: 11, dir: "←" }, { speed: 11, dir: "←" }],
    tempHours: [81, 81, 81],
    humidity: 61,
    pressure: 1005,
    icons: ["←", "←", "←", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "NYY @ CLE",
    venue: "Progressive Field",
    time: "1:10",
    runs: 1.05,
    hr: 1.18,
    doubleTriple: 0.96,
    single: 0.98,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↘" }, { speed: 5, dir: "→" }, { speed: 6, dir: "↗" }],
    tempHours: [81, 82, 84],
    humidity: 85,
    pressure: 1010,
    icons: ["↘", "→", "↗", "~", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "LAD @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 1.05,
    hr: 1.03,
    doubleTriple: 1.03,
    single: 1.03,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "↖" }, { speed: 6, dir: "↖" }, { speed: 7, dir: "↖" }],
    tempHours: [81, 77, 75],
    humidity: 91,
    pressure: 1010,
    icons: ["↖", "↖", "↖", "~", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "STL @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 1.01,
    hr: 1.21,
    doubleTriple: 0.84,
    single: 0.95,
    receptive: "Low",
    windHours: [{ speed: 12, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 9, dir: "↑" }],
    tempHours: [79, 77, 75],
    humidity: 70,
    pressure: 1009,
    icons: ["↑", "↑", "↑", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "HOU @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 1.01,
    hr: 1.07,
    doubleTriple: 0.99,
    single: 0.98,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [77, 75, 73],
    humidity: 53,
    pressure: 1008,
    icons: ["↑", "↑", "↑", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "CIN @ SD",
    venue: "Petco Park",
    time: "4:10",
    runs: 0.98,
    hr: 1.04,
    doubleTriple: 0.88,
    single: 0.98,
    receptive: "Low",
    windHours: [{ speed: 11, dir: "↗" }, { speed: 11, dir: "↗" }, { speed: 11, dir: "↗" }],
    tempHours: [72, 72, 72],
    humidity: 75,
    pressure: 1009,
    icons: ["↗", "↗", "↗", "≈", "H", "P"],
    isClosed: false
  },
  {
    game: "ARI @ MIA",
    venue: "LoanDepot Park",
    time: "6:40",
    runs: 0.95,
    hr: 0.86,
    doubleTriple: 1.03,
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
    game: "BOS @ TB",
    venue: "Tropicana Field",
    time: "1:10",
    runs: 0.94,
    hr: 0.97,
    doubleTriple: 0.93,
    single: 0.93,
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
