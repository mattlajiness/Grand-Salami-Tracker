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
    game: "ARI @ COL",
    venue: "Coors Field",
    time: "8:40",
    runs: 1.35,
    hr: 1.23,
    doubleTriple: 1.26,
    single: 1.20,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "←" }, { speed: 7, dir: "←" }, { speed: 7, dir: "→" }],
    tempHours: [81, 79, 75],
    humidity: 19,
    pressure: 1008,
    icons: ["←", "←", "→", "〜", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "LAA @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.20,
    hr: 1.28,
    doubleTriple: 1.11,
    single: 1.05,
    receptive: "Very High",
    windHours: [{ speed: 8, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }],
    tempHours: [84, 75, 70],
    humidity: 27,
    pressure: 1008,
    icons: ["↑", "↑", "↑", "〜", "☀️", "P"],
    isClosed: false
  },
  {
    game: "TOR @ BAL",
    venue: "Oriole Park",
    time: "6:35",
    runs: 1.05,
    hr: 0.72,
    doubleTriple: 1.18,
    single: 1.13,
    receptive: "Med-High",
    windHours: [{ speed: 19, dir: "↙" }, { speed: 22, dir: "↙" }, { speed: 18, dir: "↙" }],
    tempHours: [61, 59, 59],
    humidity: 93,
    pressure: 1023,
    icons: ["↙", "↙", "↙", "≈", "H", "P"],
    isClosed: false
  },
  {
    game: "SD @ LAD",
    venue: "Dodger Stadium",
    time: "10:10",
    runs: 0.99,
    hr: 1.20,
    doubleTriple: 0.91,
    single: 0.94,
    receptive: "Consistent",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }, { speed: 5, dir: "↑" }],
    tempHours: [72, 72, 72],
    humidity: 65,
    pressure: 1009,
    icons: ["↗", "↗", "↑", "〜", "P"],
    isClosed: false
  },
  {
    game: "MIL @ PHI",
    venue: "Citizens Bank Park",
    time: "6:40",
    runs: 0.98,
    hr: 0.82,
    doubleTriple: 1.01,
    single: 1.06,
    receptive: "Very High",
    windHours: [{ speed: 12, dir: "↙" }, { speed: 11, dir: "↙" }, { speed: 9, dir: "↙" }],
    tempHours: [55, 55, 55],
    humidity: 93,
    pressure: 1025,
    icons: ["↙", "↙", "↙", "≈", "❄️", "H", "P"],
    isClosed: false
  },
  {
    game: "CIN @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 0.97,
    hr: 1.01,
    doubleTriple: 0.89,
    single: 1.03,
    receptive: "Medium",
    windHours: [{ speed: 4, dir: "↗" }, { speed: 8, dir: "→" }, { speed: 8, dir: "→" }],
    tempHours: [82, 79, 75],
    humidity: 55,
    pressure: 1013,
    icons: ["↗", "→", "→", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "WAS @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 0.97,
    hr: 0.80,
    doubleTriple: 1.00,
    single: 1.10,
    receptive: "High",
    windHours: [{ speed: 15, dir: "→" }, { speed: 15, dir: "→" }, { speed: 16, dir: "→" }],
    tempHours: [61, 61, 61],
    humidity: 66,
    pressure: 1023,
    icons: ["→", "→", "→", "≈", "P"],
    isClosed: false
  },
  {
    game: "MIN @ SF",
    venue: "Oracle Park",
    time: "9:45",
    runs: 0.95,
    hr: 0.79,
    doubleTriple: 1.05,
    single: 1.06,
    receptive: "Consistent",
    windHours: [{ speed: 11, dir: "↑" }, { speed: 7, dir: "↑" }, { speed: 8, dir: "↑" }],
    tempHours: [61, 59, 59],
    humidity: 82,
    pressure: 1011,
    icons: ["↑", "↑", "↑", "〜", "H"],
    isClosed: false
  },
  {
    game: "CHW @ KC",
    venue: "Kauffman Stadium",
    time: "7:40",
    runs: 0.94,
    hr: 0.83,
    doubleTriple: 1.03,
    single: 1.00,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↓" }, { speed: 7, dir: "↓" }, { speed: 9, dir: "↓" }],
    tempHours: [64, 63, 63],
    humidity: 65,
    pressure: 1021,
    icons: ["↓", "↓", "↓", "〜", "P"],
    isClosed: false
  },
  {
    game: "NYM @ TEX",
    venue: "Globe Life Field",
    time: "8:05",
    runs: 0.93,
    hr: 0.88,
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
    game: "STL @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 0.89,
    hr: 0.67,
    doubleTriple: 1.05,
    single: 1.00,
    receptive: "Med-High",
    windHours: [{ speed: 12, dir: "↘" }, { speed: 11, dir: "↘" }, { speed: 12, dir: "↘" }],
    tempHours: [54, 54, 54],
    humidity: 95,
    pressure: 1022,
    icons: ["↘", "↘", "↘", "≈", "❄️", "H", "P"],
    isClosed: false
  },
  {
    game: "CLE @ BOS",
    venue: "Fenway Park",
    time: "6:45",
    runs: 0.89,
    hr: 0.57,
    doubleTriple: 1.18,
    single: 1.02,
    receptive: "High",
    windHours: [{ speed: 12, dir: "↓" }, { speed: 11, dir: "↙" }, { speed: 12, dir: "↙" }],
    tempHours: [55, 55, 55],
    humidity: 62,
    pressure: 1030,
    icons: ["↓", "↙", "↙", "≈", "❄️", "P"],
    isClosed: false
  },
  {
    game: "HOU @ SEA",
    venue: "T-Mobile Park",
    time: "9:40",
    runs: 0.88,
    hr: 0.97,
    doubleTriple: 0.82,
    single: 0.93,
    receptive: "Medium",
    windHours: [{ speed: 4, dir: "↘" }, { speed: 3, dir: "↘" }, { speed: 2, dir: "↗" }],
    tempHours: [64, 61, 59],
    humidity: 56,
    pressure: 1016,
    icons: ["↓", "↘", "↗"],
    isClosed: false
  },
  {
    game: "TB @ NYY",
    venue: "Yankee Stadium",
    time: "1:05",
    runs: 0.84,
    hr: 0.72,
    doubleTriple: 0.98,
    single: 0.91,
    receptive: "High",
    windHours: [{ speed: 15, dir: "↘" }, { speed: 14, dir: "↘" }, { speed: 14, dir: "↘" }],
    tempHours: [61, 61, 61],
    humidity: 65,
    pressure: 1026,
    icons: ["↓", "↓", "↓", "≈", "P"],
    isClosed: false
  },
  {
    game: "TB @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 0.83,
    hr: 0.70,
    doubleTriple: 0.97,
    single: 0.92,
    receptive: "High",
    windHours: [{ speed: 12, dir: "↓" }, { speed: 14, dir: "↓" }, { speed: 15, dir: "↓" }],
    tempHours: [63, 63, 63],
    humidity: 49,
    pressure: 1026,
    icons: ["↓", "↓", "↓", "≈", "P"],
    isClosed: false
  },
  {
    game: "MIA @ CHC",
    venue: "Wrigley Field",
    time: "7:40",
    runs: 0.81,
    hr: 0.69,
    doubleTriple: 0.87,
    single: 0.98,
    receptive: "Extreme",
    windHours: [{ speed: 13, dir: "↓" }, { speed: 11, dir: "↓" }, { speed: 11, dir: "↓" }],
    tempHours: [63, 61, 63],
    humidity: 52,
    pressure: 1023,
    icons: ["↓", "↓", "↓", "≈", "P"],
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
  'NYY': ['NYY', 'NYA'],
  'NYA': ['NYY', 'NYA'],
  'NYM': ['NYM', 'NYN'],
  'NYN': ['NYM', 'NYN'],
  'LAA': ['ANA', 'LAA'],
  'ANA': ['LAA', 'ANA'],
  'MIA': ['MIA', 'FLA'],
  'FLA': ['MIA', 'FLA'],
  'CHC': ['CHC', 'CHN'],
  'CHN': ['CHC', 'CHN'],
  'STL': ['STL', 'SLN'],
  'SLN': ['STL', 'SLN']
};

function normalizeAbbr(abbr: string): string[] {
  const upper = abbr.toUpperCase();
  return TEAM_MAPPINGS[upper] || [upper];
}

export function findGameFactor(
  factors: BallparkPalFactor[], 
  awayAbbr: string, 
  homeAbbr: string, 
  awayName: string = '', 
  homeName: string = '',
  gameDateOrTime?: string
): BallparkPalFactor | null {
  if (!factors || factors.length === 0) return null;
  
  const aAbbrs = normalizeAbbr(awayAbbr);
  const hAbbrs = normalizeAbbr(homeAbbr);
  const aName = (awayName || '').toUpperCase();
  const hName = (homeName || '').toUpperCase();

  const matched: BallparkPalFactor[] = [];

  // Try matching by abbreviation variants
  for (const a of aAbbrs) {
    for (const h of hAbbrs) {
      for (const f of factors) {
        const gameStr = f.game.toUpperCase();
        const parts = gameStr.split(/[@vs]/).map(p => p.trim());
        if (parts.length >= 2) {
          const palAway = parts[0];
          const palHome = parts[parts.length - 1];
          if ((palAway.includes(a) || a.includes(palAway)) && (palHome.includes(h) || h.includes(palHome))) {
            if (!matched.includes(f)) matched.push(f);
          }
        } else if (gameStr.includes(a) && gameStr.includes(h)) {
          if (!matched.includes(f)) matched.push(f);
        }
      }
    }
  }

  // Fallback to name-based matching
  if (matched.length === 0) {
    for (const f of factors) {
      const gameStr = f.game.toUpperCase();
      const parts = gameStr.split(/[@vs]/).map(p => p.trim());
      if (parts.length >= 2) {
        const palAway = parts[0];
        const palHome = parts[parts.length - 1];

        const matchAway = aName.includes(palAway) || palAway.includes(aName.split(' ').pop() || '!!!');
        const matchHome = hName.includes(palHome) || palHome.includes(hName.split(' ').pop() || '!!!');

        if (matchAway && matchHome && !matched.includes(f)) {
          matched.push(f);
        }
      }
    }
  }

  if (matched.length === 0) return null;
  if (matched.length === 1) return matched[0];

  // If multiple candidates matched (e.g. doubleheader TB @ NYY), resolve by game time
  if (gameDateOrTime) {
    const dt = new Date(gameDateOrTime);
    if (!isNaN(dt.getTime())) {
      const utcHour = dt.getUTCHours();
      if (utcHour <= 20) {
        // Afternoon game (1:05)
        const early = matched.find(m => m.time.startsWith('1:'));
        if (early) return early;
      } else {
        // Evening game (7:05)
        const late = matched.find(m => m.time.startsWith('7:'));
        if (late) return late;
      }
    }
  }

  return matched[0];
}
