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
    game: "STL @ CIN",
    venue: "Great American BP",
    time: "1:40",
    runs: 1.10,
    hr: 1.17,
    doubleTriple: 1.02,
    single: 0.97,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "↖" }, { speed: 6, dir: "↖" }, { speed: 7, dir: "↖" }],
    tempHours: [72, 72, 73],
    humidity: 87,
    pressure: 1017,
    icons: ["↖", "↖", "↖", "~", "H"],
    isClosed: false
  },
  {
    game: "SEA @ KC",
    venue: "Kauffman Stadium",
    time: "2:10",
    runs: 1.02,
    hr: 1.07,
    doubleTriple: 1.07,
    single: 0.98,
    receptive: "High",
    windHours: [{ speed: 5, dir: "↖" }, { speed: 6, dir: "↖" }, { speed: 7, dir: "↖" }],
    tempHours: [82, 86, 86],
    humidity: 38,
    pressure: 1017,
    icons: ["↖", "↖", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "TEX @ LAA",
    venue: "Angel Stadium",
    time: "7:20",
    runs: 1.02,
    hr: 1.03,
    doubleTriple: 0.93,
    single: 1.05,
    receptive: "Consistent",
    windHours: [{ speed: 12, dir: "↗" }, { speed: 12, dir: "↗" }, { speed: 11, dir: "↗" }],
    tempHours: [72, 72, 70],
    humidity: 57,
    pressure: 1014,
    icons: ["↗", "↗", "↗", "≈"],
    isClosed: false
  },
  {
    game: "COL @ ARI",
    venue: "Chase Field",
    time: "4:10",
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
    game: "CHW @ SF",
    venue: "Oracle Park",
    time: "4:05",
    runs: 0.99,
    hr: 0.83,
    doubleTriple: 1.03,
    single: 1.10,
    receptive: "Consistent",
    windHours: [{ speed: 12, dir: "↑" }, { speed: 13, dir: "↑" }, { speed: 14, dir: "↑" }],
    tempHours: [63, 61, 61],
    humidity: 70,
    pressure: 1016,
    icons: ["↑", "↑", "↑", "≈"],
    isClosed: false
  },
  {
    game: "DET @ BAL",
    venue: "Oriole Park",
    time: "6:05",
    runs: 0.97,
    hr: 0.88,
    doubleTriple: 1.05,
    single: 1.02,
    receptive: "Med-High",
    windHours: [{ speed: 1, dir: "←" }, { speed: 3, dir: "↙" }, { speed: 6, dir: "↙" }],
    tempHours: [68, 66, 66],
    humidity: 78,
    pressure: 1021,
    icons: ["←", "↙", "↙", "~", "H", "P"],
    isClosed: false
  },
  {
    game: "NYM @ MIA",
    venue: "LoanDepot Park",
    time: "1:40",
    runs: 0.95,
    hr: 0.86,
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
    game: "LAD @ MIL",
    venue: "American Family Fld",
    time: "2:10",
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
    game: "PIT @ TOR",
    venue: "Rogers Centre",
    time: "12:15",
    runs: 0.95,
    hr: 1.02,
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
    game: "DET @ BAL",
    venue: "Oriole Park",
    time: "12:35",
    runs: 0.92,
    hr: 0.76,
    doubleTriple: 0.97,
    single: 1.07,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↓" }, { speed: 4, dir: "↓" }, { speed: 4, dir: "↓" }],
    tempHours: [63, 64, 66],
    humidity: 91,
    pressure: 1024,
    icons: ["↓", "↓", "↓", "~", "H", "P"],
    isClosed: false
  },
  {
    game: "WAS @ ATL",
    venue: "Truist Park",
    time: "4:10",
    runs: 0.92,
    hr: 0.94,
    doubleTriple: 0.90,
    single: 0.99,
    receptive: "Medium",
    windHours: [{ speed: 5, dir: "↘" }, { speed: 4, dir: "↘" }, { speed: 4, dir: "↘" }],
    tempHours: [79, 77, 77],
    humidity: 69,
    pressure: 1018,
    icons: ["↘", "↘", "↘", "☀️"],
    isClosed: false
  },
  {
    game: "ATH @ SD",
    venue: "Petco Park",
    time: "4:10",
    runs: 0.90,
    hr: 0.91,
    doubleTriple: 0.90,
    single: 0.94,
    receptive: "Low",
    windHours: [{ speed: 11, dir: "↘" }, { speed: 11, dir: "↘" }, { speed: 12, dir: "↘" }],
    tempHours: [64, 68, 68],
    humidity: 82,
    pressure: 1016,
    icons: ["↘", "↘", "↘", "≈", "H"],
    isClosed: false
  },
  {
    game: "MIN @ BOS",
    venue: "Fenway Park",
    time: "1:35",
    runs: 0.90,
    hr: 0.61,
    doubleTriple: 1.16,
    single: 1.03,
    receptive: "High",
    windHours: [{ speed: 11, dir: "↙" }, { speed: 11, dir: "↙" }, { speed: 12, dir: "↙" }],
    tempHours: [50, 50, 50],
    humidity: 85,
    pressure: 1032,
    icons: ["↙", "↙", "↙", "≈", "❄️", "H", "P"],
    isClosed: false
  },
  {
    game: "CLE @ PHI",
    venue: "Citizens Bank Park",
    time: "1:35",
    runs: 0.89,
    hr: 0.83,
    doubleTriple: 0.87,
    single: 1.01,
    receptive: "Very High",
    windHours: [{ speed: 7, dir: "↓" }, { speed: 7, dir: "↓" }, { speed: 7, dir: "↓" }],
    tempHours: [59, 59, 61],
    humidity: 98,
    pressure: 1024,
    icons: ["↓", "↓", "↓", "~", "H", "P"],
    isClosed: false
  },
  {
    game: "TB @ NYY",
    venue: "Yankee Stadium",
    time: "1:35",
    runs: 0.84,
    hr: 0.68,
    doubleTriple: 0.89,
    single: 1.00,
    receptive: "High",
    windHours: [{ speed: 12, dir: "↓" }, { speed: 13, dir: "↓" }, { speed: 14, dir: "↓" }],
    tempHours: [54, 54, 55],
    humidity: 94,
    pressure: 1026,
    icons: ["↓", "↓", "↓", "≈", "❄️", "H", "P"],
    isClosed: false
  },
  {
    game: "HOU @ CHC",
    venue: "Wrigley Field",
    time: "2:20",
    runs: 0.77,
    hr: 0.80,
    doubleTriple: 0.79,
    single: 0.92,
    receptive: "Extreme",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 6, dir: "↓" }, { speed: 6, dir: "↙" }],
    tempHours: [72, 72, 73],
    humidity: 79,
    pressure: 1017,
    icons: ["↘", "↓", "↙", "~", "H"],
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
