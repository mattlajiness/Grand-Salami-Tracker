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
    time: "1:10",
    runs: 1.13,
    hr: 1.26,
    doubleTriple: 1.02,
    single: 0.98,
    receptive: "Low",
    windHours: [{ speed: 11, dir: "↖" }, { speed: 11, dir: "↖" }, { speed: 11, dir: "↖" }],
    tempHours: [70, 72, 72],
    humidity: 87,
    pressure: 1015,
    icons: ["↖", "↖", "↖", "≈", "H"],
    isClosed: false
  },
  {
    game: "STL @ CIN",
    venue: "Great American BP",
    time: "7:15",
    runs: 1.10,
    hr: 1.21,
    doubleTriple: 1.00,
    single: 0.97,
    receptive: "Low",
    windHours: [{ speed: 8, dir: "↖" }, { speed: 6, dir: "↖" }, { speed: 4, dir: "↖" }],
    tempHours: [70, 68, 66],
    humidity: 79,
    pressure: 1016,
    icons: ["↖", "↖", "↖", "≈", "H"],
    isClosed: false
  },
  {
    game: "COL @ ARI",
    venue: "Chase Field",
    time: "10:10",
    runs: 1.05,
    hr: 0.92,
    doubleTriple: 1.15,
    single: 1.04,
    receptive: "Medium",
    windHours: [{ speed: 8, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 11, dir: "↗" }],
    tempHours: [93, 91, 88],
    humidity: 12,
    pressure: 1008,
    icons: ["↘", "↘", "↗", "≈", "💥", "H", "P"],
    isClosed: false
  },
  {
    game: "SEA @ KC",
    venue: "Kauffman Stadium",
    time: "4:10",
    runs: 1.01,
    hr: 1.13,
    doubleTriple: 1.01,
    single: 0.96,
    receptive: "High",
    windHours: [{ speed: 5, dir: "↗" }, { speed: 3, dir: "↗" }, { speed: 2, dir: "↘" }],
    tempHours: [82, 75, 72],
    humidity: 36,
    pressure: 1015,
    icons: ["↗", "↗", "↘", "🌞"],
    isClosed: false
  },
  {
    game: "TEX @ LAA",
    venue: "Angel Stadium",
    time: "10:05",
    runs: 1.00,
    hr: 1.04,
    doubleTriple: 0.93,
    single: 1.02,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 7, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [68, 66, 64],
    humidity: 56,
    pressure: 1014,
    icons: ["↑", "↑", "↑", "~"],
    isClosed: false
  },
  {
    game: "MIN @ BOS",
    venue: "Fenway Park",
    time: "4:10",
    runs: 0.97,
    hr: 0.71,
    doubleTriple: 1.17,
    single: 1.05,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↙" }, { speed: 7, dir: "↙" }, { speed: 6, dir: "↙" }],
    tempHours: [63, 61, 57],
    humidity: 57,
    pressure: 1033,
    icons: ["↙", "↙", "↙", "~", "P"],
    isClosed: false
  },
  {
    game: "NYM @ MIA",
    venue: "LoanDepot Park",
    time: "4:10",
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
    game: "CHW @ SF",
    venue: "Oracle Park",
    time: "4:05",
    runs: 0.95,
    hr: 0.73,
    doubleTriple: 1.07,
    single: 1.07,
    receptive: "Consistent",
    windHours: [{ speed: 12, dir: "↑" }, { speed: 14, dir: "↑" }, { speed: 14, dir: "↑" }],
    tempHours: [59, 61, 61],
    humidity: 89,
    pressure: 1014,
    icons: ["↑", "↑", "↑", "≈", "H"],
    isClosed: false
  },
  {
    game: "WAS @ ATL",
    venue: "Truist Park",
    time: "4:10",
    runs: 0.95,
    hr: 1.00,
    doubleTriple: 0.92,
    single: 0.99,
    receptive: "Medium",
    windHours: [{ speed: 5, dir: "↙" }, { speed: 3, dir: "↙" }, { speed: 1, dir: "⬇" }],
    tempHours: [77, 77, 75],
    humidity: 79,
    pressure: 1018,
    icons: ["↙", "↙", "⬇", "🌞", "H"],
    isClosed: false
  },
  {
    game: "PIT @ TOR",
    venue: "Rogers Centre",
    time: "3:07",
    runs: 0.94,
    hr: 1.02,
    doubleTriple: 0.95,
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
    game: "LAD @ MIL",
    venue: "American Family Fld",
    time: "7:15",
    runs: 0.94,
    hr: 1.05,
    doubleTriple: 0.86,
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
    game: "ATH @ SD",
    venue: "Petco Park",
    time: "9:40",
    runs: 0.92,
    hr: 0.93,
    doubleTriple: 0.94,
    single: 0.93,
    receptive: "Low",
    windHours: [{ speed: 8, dir: "↘" }, { speed: 8, dir: "↘" }, { speed: 7, dir: "↘" }],
    tempHours: [68, 66, 66],
    humidity: 61,
    pressure: 1014,
    icons: ["↘", "↘", "↘", "~"],
    isClosed: false
  },
  {
    game: "CLE @ PHI",
    venue: "Citizens Bank Park",
    time: "4:05",
    runs: 0.91,
    hr: 0.71,
    doubleTriple: 1.02,
    single: 1.01,
    receptive: "Very High",
    windHours: [{ speed: 11, dir: "↙" }, { speed: 13, dir: "↙" }, { speed: 14, dir: "↙" }],
    tempHours: [54, 52, 52],
    humidity: 74,
    pressure: 1029,
    icons: ["↙", "↙", "↙", "≈", "❄️", "P"],
    isClosed: false
  },
  {
    game: "DET @ BAL",
    venue: "Oriole Park",
    time: "4:05",
    runs: 0.90,
    hr: 0.65,
    doubleTriple: 1.05,
    single: 1.06,
    receptive: "Med-High",
    windHours: [{ speed: 12, dir: "↙" }, { speed: 12, dir: "↙" }, { speed: 13, dir: "↙" }],
    tempHours: [55, 55, 54],
    humidity: 92,
    pressure: 1027,
    icons: ["↙", "↙", "↙", "≈", "❄️", "H", "P"],
    isClosed: false
  },
  {
    game: "TB @ NYY",
    venue: "Yankee Stadium",
    time: "1:35",
    runs: 0.82,
    hr: 0.72,
    doubleTriple: 0.91,
    single: 0.93,
    receptive: "High",
    windHours: [{ speed: 11, dir: "↙" }, { speed: 12, dir: "↙" }, { speed: 12, dir: "↙" }],
    tempHours: [61, 61, 61],
    humidity: 54,
    pressure: 1032,
    icons: ["↙", "↙", "↙", "≈", "P"],
    isClosed: false
  },
  {
    game: "HOU @ CHC",
    venue: "Wrigley Field",
    time: "2:20",
    runs: 0.73,
    hr: 0.69,
    doubleTriple: 0.83,
    single: 0.91,
    receptive: "Extreme",
    windHours: [{ speed: 7, dir: "⬇" }, { speed: 8, dir: "⬇" }, { speed: 8, dir: "⬇" }],
    tempHours: [59, 59, 59],
    humidity: 89,
    pressure: 1017,
    icons: ["⬇", "⬇", "⬇", "~", "H"],
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
