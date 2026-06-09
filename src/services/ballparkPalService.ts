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
    game: "CHC @ COL",
    venue: "Coors Field",
    time: "8:40",
    runs: 1.41,
    hr: 1.22,
    doubleTriple: 1.47,
    single: 1.17,
    receptive: "Low",
    windHours: [{ speed: 16, dir: "↗" }, { speed: 11, dir: "↗" }, { speed: 3, dir: "→" }],
    tempHours: [88, 86, 82],
    humidity: 10,
    pressure: 997,
    icons: ["↗", "↗", "→", "≈", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "MIL @ ATH",
    venue: "Las Vegas Ballpark",
    time: "10:05",
    runs: 1.41,
    hr: 1.62,
    doubleTriple: 1.20,
    single: 1.11,
    receptive: "High",
    windHours: [{ speed: 12, dir: "↑" }, { speed: 10, dir: "↑" }, { speed: 9, dir: "↗" }],
    tempHours: [94, 92, 90],
    humidity: 15,
    pressure: 1003,
    icons: ["↑", "↗", "↗", "≈", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "TEX @ KC",
    venue: "Kauffman Stadium",
    time: "7:40",
    runs: 1.17,
    hr: 1.44,
    doubleTriple: 1.00,
    single: 1.01,
    receptive: "High",
    windHours: [{ speed: 16, dir: "↑" }, { speed: 15, dir: "↑" }, { speed: 14, dir: "↑" }],
    tempHours: [88, 84, 82],
    humidity: 75,
    pressure: 1007,
    icons: ["↑", "↑", "↑", "≈", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "NYY @ CLE",
    venue: "Progressive Field",
    time: "6:40",
    runs: 1.08,
    hr: 1.18,
    doubleTriple: 1.06,
    single: 0.95,
    receptive: "High",
    windHours: [{ speed: 11, dir: "↗" }, { speed: 11, dir: "↗" }, { speed: 9, dir: "↗" }],
    tempHours: [77, 73, 72],
    humidity: 93,
    pressure: 1012,
    icons: ["↗", "↗", "↗", "≈", "☀️", "H"],
    isClosed: false
  },
  {
    game: "SEA @ BAL",
    venue: "Oriole Park",
    time: "6:35",
    runs: 1.04,
    hr: 0.94,
    doubleTriple: 1.08,
    single: 1.07,
    receptive: "Med-High",
    windHours: [{ speed: 10, dir: "↖" }, { speed: 11, dir: "↖" }, { speed: 10, dir: "↖" }],
    tempHours: [79, 75, 73],
    humidity: 47,
    pressure: 1019,
    icons: ["↖", "↖", "↖", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "ATL @ CHW",
    venue: "Rate Field",
    time: "7:40",
    runs: 1.04,
    hr: 1.07,
    doubleTriple: 0.91,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↘" }, { speed: 3, dir: "↘" }, { speed: 3, dir: "↘" }],
    tempHours: [77, 75, 73],
    humidity: 69,
    pressure: 1009,
    icons: ["↘", "↘", "↘", "☀️", "P"],
    isClosed: false
  },
  {
    game: "HOU @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 1.00,
    hr: 1.07,
    doubleTriple: 0.91,
    single: 1.01,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [75, 73, 72],
    humidity: 49,
    pressure: 1009,
    icons: ["↑", "↑", "↑", "~", "P"],
    isClosed: false
  },
  {
    game: "MIN @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 0.99,
    hr: 0.97,
    doubleTriple: 1.00,
    single: 1.03,
    receptive: "High",
    windHours: [{ speed: 8, dir: "↙" }, { speed: 7, dir: "↙" }, { speed: 5, dir: "↙" }],
    tempHours: [77, 77, 75],
    humidity: 85,
    pressure: 1010,
    icons: ["↙", "↙", "↙", "~", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "LAD @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 0.99,
    hr: 0.90,
    doubleTriple: 1.16,
    single: 0.94,
    receptive: "Med-High",
    windHours: [{ speed: 8, dir: "↙" }, { speed: 7, dir: "↙" }, { speed: 7, dir: "↙" }],
    tempHours: [75, 73, 72],
    humidity: 87,
    pressure: 1015,
    icons: ["↙", "↙", "↙", "~", "H"],
    isClosed: false
  },
  {
    game: "WAS @ SF",
    venue: "Oracle Park",
    time: "9:45",
    runs: 0.96,
    hr: 0.78,
    doubleTriple: 1.08,
    single: 1.06,
    receptive: "Consistent",
    windHours: [{ speed: 13, dir: "↑" }, { speed: 11, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [61, 59, 57],
    humidity: 67,
    pressure: 1014,
    icons: ["↑", "↑", "↑", "~"],
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
    game: "PHI @ TOR",
    venue: "Rogers Centre",
    time: "7:07",
    runs: 0.95,
    hr: 1.03,
    doubleTriple: 0.94,
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
    game: "BOS @ TB",
    venue: "Tropicana Field",
    time: "6:40",
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
  },
  {
    game: "STL @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.92,
    hr: 0.99,
    doubleTriple: 0.82,
    single: 0.95,
    receptive: "Low",
    windHours: [{ speed: 8, dir: "↑" }, { speed: 7, dir: "↑" }, { speed: 8, dir: "↑" }],
    tempHours: [75, 75, 73],
    humidity: 43,
    pressure: 1018,
    icons: ["↑", "↑", "↑", "~"],
    isClosed: false
  },
  {
    game: "CIN @ SD",
    venue: "Petco Park",
    time: "9:40",
    runs: 0.90,
    hr: 0.95,
    doubleTriple: 0.86,
    single: 0.94,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "→" }, { speed: 6, dir: "→" }, { speed: 4, dir: "→" }],
    tempHours: [72, 70, 70],
    humidity: 58,
    pressure: 1010,
    icons: ["→", "→", "→", "~", "P"],
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
