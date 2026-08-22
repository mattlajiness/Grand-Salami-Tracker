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
    game: "CLE @ COL",
    venue: "Coors Field",
    time: "8:10",
    runs: 1.27,
    hr: 1.18,
    doubleTriple: 1.32,
    single: 1.09,
    receptive: "Low",
    windHours: [{ speed: 1, dir: "↙" }, { speed: 6, dir: "↑" }, { speed: 11, dir: "↗" }],
    tempHours: [72, 72, 72],
    humidity: 58,
    pressure: 1017,
    icons: ["↙", "↑", "↗", "〜"],
    isClosed: false
  },
  {
    game: "NYM @ CHW",
    venue: "Rate Field",
    time: "7:10",
    runs: 1.04,
    hr: 1.07,
    doubleTriple: 0.94,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 10, dir: "↑" }, { speed: 7, dir: "↑" }, { speed: 5, dir: "↑" }],
    tempHours: [79, 75, 73],
    humidity: 40,
    pressure: 1014,
    icons: ["↑", "↑", "↑", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "PIT @ LAD",
    venue: "Dodger Stadium",
    time: "7:15",
    runs: 1.04,
    hr: 1.25,
    doubleTriple: 1.00,
    single: 0.94,
    receptive: "Consistent",
    windHours: [{ speed: 12, dir: "↗" }, { speed: 11, dir: "↗" }, { speed: 9, dir: "↗" }],
    tempHours: [88, 86, 86],
    humidity: 29,
    pressure: 1012,
    icons: ["↗", "↗", "↗", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "DET @ KC",
    venue: "Kauffman Stadium",
    time: "7:15",
    runs: 1.03,
    hr: 1.11,
    doubleTriple: 1.00,
    single: 1.00,
    receptive: "High",
    windHours: [{ speed: 8, dir: "↙" }, { speed: 8, dir: "↙" }, { speed: 7, dir: "↙" }],
    tempHours: [90, 86, 84],
    humidity: 43,
    pressure: 1014,
    icons: ["↙", "↙", "↙", "〜", "💥"],
    isClosed: false
  },
  {
    game: "TB @ BAL",
    venue: "Oriole Park",
    time: "7:05",
    runs: 1.01,
    hr: 0.95,
    doubleTriple: 1.06,
    single: 1.03,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↙" }, { speed: 9, dir: "↙" }, { speed: 8, dir: "↙" }],
    tempHours: [72, 72, 70],
    humidity: 90,
    pressure: 1013,
    icons: ["↙", "↙", "↙", "〜", "H"],
    isClosed: false
  },
  {
    game: "CIN @ ARI",
    venue: "Chase Field",
    time: "8:10",
    runs: 1.00,
    hr: 0.91,
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
    game: "STL @ PHI",
    venue: "Citizens Bank Park",
    time: "6:05",
    runs: 0.99,
    hr: 1.00,
    doubleTriple: 0.93,
    single: 1.01,
    receptive: "Very High",
    windHours: [{ speed: 6, dir: "↙" }, { speed: 6, dir: "↙" }, { speed: 5, dir: "↙" }],
    tempHours: [68, 66, 66],
    humidity: 88,
    pressure: 1014,
    icons: ["↙", "↙", "↙", "〜", "H"],
    isClosed: false
  },
  {
    game: "MIN @ SD",
    venue: "Petco Park",
    time: "8:40",
    runs: 0.97,
    hr: 1.02,
    doubleTriple: 0.92,
    single: 0.96,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 7, dir: "↘" }],
    tempHours: [77, 77, 75],
    humidity: 65,
    pressure: 1012,
    icons: ["↘", "↘", "↘", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "TOR @ NYY",
    venue: "Yankee Stadium",
    time: "1:35",
    runs: 0.96,
    hr: 1.02,
    doubleTriple: 0.86,
    single: 0.98,
    receptive: "High",
    windHours: [{ speed: 9, dir: "↙" }, { speed: 7, dir: "↙" }, { speed: 6, dir: "↙" }],
    tempHours: [72, 70, 70],
    humidity: 77,
    pressure: 1016,
    icons: ["↓", "↙", "↙", "〜", "H"],
    isClosed: false
  },
  {
    game: "ATL @ MIL",
    venue: "American Family Fld",
    time: "2:10",
    runs: 0.95,
    hr: 1.05,
    doubleTriple: 0.86,
    single: 0.93,
    receptive: "Low",
    windHours: [{ speed: 13, dir: "↑" }, { speed: 12, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [75, 77, 79],
    humidity: 56,
    pressure: 1014,
    icons: ["↑", "↑", "↑", "≈"],
    isClosed: false
  },
  {
    game: "ATH @ HOU",
    venue: "Daikin Park",
    time: "7:10",
    runs: 0.95,
    hr: 1.04,
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
    game: "WAS @ MIA",
    venue: "LoanDepot Park",
    time: "4:10",
    runs: 0.94,
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
    game: "LAA @ TEX",
    venue: "Globe Life Field",
    time: "7:05",
    runs: 0.93,
    hr: 0.89,
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
    game: "CHC @ SEA",
    venue: "T-Mobile Park",
    time: "7:15",
    runs: 0.91,
    hr: 1.05,
    doubleTriple: 0.80,
    single: 0.93,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "↖" }, { speed: 6, dir: "↖" }, { speed: 7, dir: "↖" }],
    tempHours: [63, 66, 68],
    humidity: 83,
    pressure: 1017,
    icons: ["↖", "↖", "↖", "〜", "H"],
    isClosed: false
  },
  {
    game: "SF @ BOS",
    venue: "Fenway Park",
    time: "7:15",
    runs: 0.89,
    hr: 0.88,
    doubleTriple: 0.92,
    single: 0.99,
    receptive: "High",
    windHours: [{ speed: 6, dir: "↓" }, { speed: 6, dir: "↘" }, { speed: 5, dir: "↓" }],
    tempHours: [64, 64, 64],
    humidity: 97,
    pressure: 1016,
    icons: ["↓", "↘", "↓", "〜", "H"],
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
