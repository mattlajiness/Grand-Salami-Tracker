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
    game: "TEX @ COL",
    venue: "Coors Field",
    time: "3:10",
    runs: 1.25,
    hr: 1.04,
    doubleTriple: 1.27,
    single: 1.16,
    receptive: "Low",
    windHours: [{ speed: 8, dir: "↓" }, { speed: 6, dir: "↙" }, { speed: 2, dir: "↓" }],
    tempHours: [59, 63, 63],
    humidity: 45,
    pressure: 1013,
    icons: ["↓", "↓", "↓", "~"]
  },
  {
    game: "CIN @ PHI",
    venue: "Citizens Bank Park",
    time: "1:05",
    runs: 1.11,
    hr: 1.32,
    doubleTriple: 0.89,
    single: 1.02,
    receptive: "Very High",
    windHours: [{ speed: 13, dir: "→" }, { speed: 13, dir: "→" }, { speed: 13, dir: "→" }],
    tempHours: [90, 90, 90],
    humidity: 43,
    pressure: 1016,
    icons: ["→", "→", "→", "≈", "☀️"]
  },
  {
    game: "ATH @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 1.04,
    hr: 1.07,
    doubleTriple: 0.96,
    single: 1.03,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }],
    tempHours: [73, 70, 70],
    humidity: 43,
    pressure: 1011,
    icons: ["↑", "↑", "↑", "~"]
  },
  {
    game: "NYM @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.01,
    hr: 0.93,
    doubleTriple: 0.98,
    single: 1.09,
    receptive: "Med-High",
    windHours: [{ speed: 11, dir: "↘" }, { speed: 4, dir: "↙" }, { speed: 4, dir: "↙" }],
    tempHours: [73, 72, 70],
    humidity: 88,
    pressure: 1015,
    icons: ["↘", "↓", "↓", "~", "H"]
  },
  {
    game: "SF @ ARI",
    venue: "Chase Field",
    time: "3:40",
    runs: 1.00,
    hr: 0.92,
    doubleTriple: 1.11,
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
    game: "TOR @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 0.96,
    hr: 1.09,
    doubleTriple: 0.86,
    single: 0.93,
    receptive: "High",
    windHours: [{ speed: 15, dir: "↗" }, { speed: 14, dir: "↗" }, { speed: 13, dir: "↗" }],
    tempHours: [75, 72, 70],
    humidity: 61,
    pressure: 1015,
    icons: ["↗", "↗", "↗", "≈"]
  },
  {
    game: "ATL @ MIA",
    venue: "LoanDepot Park",
    time: "6:40",
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
    game: "BAL @ TB",
    venue: "Tropicana Field",
    time: "1:10",
    runs: 0.94,
    hr: 0.98,
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
    game: "BOS @ KC",
    venue: "Kauffman Stadium",
    time: "7:40",
    runs: 0.90,
    hr: 0.78,
    doubleTriple: 1.05,
    single: 0.97,
    receptive: "High",
    windHours: [{ speed: 9, dir: "↓" }, { speed: 9, dir: "↓" }, { speed: 7, dir: "↙" }],
    tempHours: [63, 61, 57],
    humidity: 63,
    pressure: 1021,
    icons: ["↓", "↓", "↙", "~", "P"]
  },
  {
    game: "LAD @ SD",
    venue: "Petco Park",
    time: "8:40",
    runs: 0.89,
    hr: 0.97,
    doubleTriple: 0.81,
    single: 0.95,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [70, 68, 68],
    humidity: 57,
    pressure: 1012,
    icons: ["↗", "↗", "↗", "~"]
  },
  {
    game: "HOU @ MIN",
    venue: "Target Field",
    time: "1:40",
    runs: 0.88,
    hr: 0.65,
    doubleTriple: 0.90,
    single: 1.07,
    receptive: "Medium",
    windHours: [{ speed: 4, dir: "↘" }, { speed: 4, dir: "↘" }, { speed: 5, dir: "↘" }],
    tempHours: [55, 59, 61],
    humidity: 33,
    pressure: 1028,
    icons: ["↘", "↓", "↓", "❄️", "P"]
  },
  {
    game: "CHW @ SEA",
    venue: "T-Mobile Park",
    time: "4:10",
    runs: 0.87,
    hr: 0.93,
    doubleTriple: 0.79,
    single: 0.96,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 7, dir: "↘" }],
    tempHours: [64, 64, 64],
    humidity: 49,
    pressure: 1021,
    icons: ["↘", "↘", "↘", "~", "P"]
  },
  {
    game: "PIT @ STL",
    venue: "Busch Stadium",
    time: "7:45",
    runs: 0.85,
    hr: 0.74,
    doubleTriple: 0.92,
    single: 1.02,
    receptive: "Med-High",
    windHours: [{ speed: 5, dir: "↘" }, { speed: 3, dir: "↘" }, { speed: 3, dir: "↘" }],
    tempHours: [61, 61, 61],
    humidity: 73,
    pressure: 1021,
    icons: ["↘", "↘", "↘", "P"]
  },
  {
    game: "CLE @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 0.85,
    hr: 0.68,
    doubleTriple: 0.96,
    single: 1.04,
    receptive: "High",
    windHours: [{ speed: 12, dir: "→" }, { speed: 11, dir: "→" }, { speed: 11, dir: "→" }],
    tempHours: [57, 55, 52],
    humidity: 54,
    pressure: 1024,
    icons: ["→", "→", "→", "≈", "P"]
  },
  {
    game: "MIL @ CHC",
    venue: "Wrigley Field",
    time: "7:40",
    runs: 0.76,
    hr: 0.59,
    doubleTriple: 0.80,
    single: 1.02,
    receptive: "Extreme",
    windHours: [{ speed: 14, dir: "↓" }, { speed: 12, dir: "↓" }, { speed: 12, dir: "↓" }],
    tempHours: [50, 50, 48],
    humidity: 55,
    pressure: 1026,
    icons: ["↓", "↓", "↙", "≈", "❄️", "P"]
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
