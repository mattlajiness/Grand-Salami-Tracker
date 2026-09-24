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
    time: "3:10",
    runs: 1.26,
    hr: 1.19,
    doubleTriple: 1.22,
    single: 1.13,
    receptive: "Low",
    windHours: [{ speed: 11, dir: "↗" }, { speed: 11, dir: "↑" }, { speed: 9, dir: "↑" }],
    tempHours: [72, 70, 68],
    humidity: 60,
    pressure: 1015,
    icons: ["↗", "↑", "↑", "≈"],
    isClosed: false
  },
  {
    game: "HOU @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.20,
    hr: 1.31,
    doubleTriple: 1.15,
    single: 1.03,
    receptive: "Very High",
    windHours: [{ speed: 12, dir: "↗" }, { speed: 12, dir: "↑" }, { speed: 10, dir: "↑" }],
    tempHours: [86, 82, 78],
    humidity: 24,
    pressure: 1010,
    icons: ["↗", "↑", "↑", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "LAA @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.20,
    hr: 1.31,
    doubleTriple: 1.15,
    single: 1.03,
    receptive: "Very High",
    windHours: [{ speed: 12, dir: "↗" }, { speed: 12, dir: "↑" }, { speed: 10, dir: "↑" }],
    tempHours: [86, 82, 78],
    humidity: 24,
    pressure: 1010,
    icons: ["↗", "↑", "↑", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "TOR @ BAL",
    venue: "Oriole Park",
    time: "1:35",
    runs: 1.01,
    hr: 0.77,
    doubleTriple: 1.15,
    single: 1.08,
    receptive: "Med-High",
    windHours: [{ speed: 17, dir: "↙" }, { speed: 17, dir: "↙" }, { speed: 16, dir: "↙" }],
    tempHours: [66, 66, 68],
    humidity: 61,
    pressure: 1028,
    icons: ["↙", "↙", "↙", "≈", "P"],
    isClosed: false
  },
  {
    game: "TOR @ BAL",
    venue: "Oriole Park",
    time: "6:35",
    runs: 1.01,
    hr: 0.77,
    doubleTriple: 1.17,
    single: 1.06,
    receptive: "Med-High",
    windHours: [{ speed: 18, dir: "↙" }, { speed: 18, dir: "↙" }, { speed: 17, dir: "↙" }],
    tempHours: [68, 64, 64],
    humidity: 56,
    pressure: 1027,
    icons: ["↙", "↙", "↙", "≈", "P"],
    isClosed: false
  },
  {
    game: "SD @ LAD",
    venue: "Dodger Stadium",
    time: "10:10",
    runs: 1.00,
    hr: 1.24,
    doubleTriple: 0.95,
    single: 0.92,
    receptive: "Consistent",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [75, 75, 75],
    humidity: 60,
    pressure: 1010,
    icons: ["↗", "↗", "↗", "〜", "P"],
    isClosed: false
  },
  {
    game: "WAS @ DET",
    venue: "Comerica Park",
    time: "1:10",
    runs: 0.99,
    hr: 0.90,
    doubleTriple: 0.99,
    single: 1.02,
    receptive: "High",
    windHours: [{ speed: 14, dir: "↘" }, { speed: 16, dir: "↘" }, { speed: 14, dir: "↘" }],
    tempHours: [64, 68, 68],
    humidity: 52,
    pressure: 1028,
    icons: ["↘", "↘", "↘", "≈", "P"],
    isClosed: false
  },
  {
    game: "CHW @ KC",
    venue: "Kauffman Stadium",
    time: "2:10",
    runs: 0.99,
    hr: 0.93,
    doubleTriple: 1.02,
    single: 1.03,
    receptive: "High",
    windHours: [{ speed: 9, dir: "↙" }, { speed: 7, dir: "↙" }, { speed: 7, dir: "↙" }],
    tempHours: [72, 72, 68],
    humidity: 51,
    pressure: 1022,
    icons: ["↙", "↙", "↙", "〜", "P"],
    isClosed: false
  },
  {
    game: "MIN @ SF",
    venue: "Oracle Park",
    time: "3:45",
    runs: 0.97,
    hr: 0.84,
    doubleTriple: 1.09,
    single: 1.03,
    receptive: "Consistent",
    windHours: [{ speed: 5, dir: "→" }, { speed: 6, dir: "↗" }, { speed: 7, dir: "↗" }],
    tempHours: [64, 66, 66],
    humidity: 65,
    pressure: 1014,
    icons: ["→", "↗", "↗", "〜"],
    isClosed: false
  },
  {
    game: "MIL @ PHI",
    venue: "Citizens Bank Park",
    time: "6:05",
    runs: 0.96,
    hr: 0.80,
    doubleTriple: 1.01,
    single: 1.03,
    receptive: "Very High",
    windHours: [{ speed: 13, dir: "↙" }, { speed: 12, dir: "↙" }, { speed: 12, dir: "↙" }],
    tempHours: [64, 63, 61],
    humidity: 54,
    pressure: 1029,
    icons: ["↙", "↙", "↙", "≈", "P"],
    isClosed: false
  },
  {
    game: "NYM @ TEX",
    venue: "Globe Life Field",
    time: "2:35",
    runs: 0.92,
    hr: 0.89,
    doubleTriple: 0.92,
    single: 0.99,
    receptive: "Roof Closed",
    windHours: [],
    tempHours: [72, 72, 72],
    humidity: 45,
    pressure: 1015,
    icons: ["🏟️"],
    isClosed: true
  },
  {
    game: "CIN @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 0.86,
    hr: 0.82,
    doubleTriple: 0.89,
    single: 0.99,
    receptive: "Medium",
    windHours: [{ speed: 10, dir: "↘" }, { speed: 9, dir: "↘" }, { speed: 9, dir: "↘" }],
    tempHours: [68, 66, 66],
    humidity: 71,
    pressure: 1020,
    icons: ["↘", "↘", "↘", "〜", "P"],
    isClosed: false
  },
  {
    game: "CLE @ BOS",
    venue: "Fenway Park",
    time: "6:45",
    runs: 0.85,
    hr: 0.58,
    doubleTriple: 1.15,
    single: 0.98,
    receptive: "High",
    windHours: [{ speed: 18, dir: "↙" }, { speed: 16, dir: "↙" }, { speed: 14, dir: "↙" }],
    tempHours: [55, 57, 57],
    humidity: 70,
    pressure: 1033,
    icons: ["↙", "↙", "↙", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "STL @ PIT",
    venue: "PNC Park",
    time: "12:35",
    runs: 0.83,
    hr: 0.66,
    doubleTriple: 1.00,
    single: 0.96,
    receptive: "Med-High",
    windHours: [{ speed: 11, dir: "↘" }, { speed: 11, dir: "↘" }, { speed: 11, dir: "↘" }],
    tempHours: [63, 61, 59],
    humidity: 52,
    pressure: 1026,
    icons: ["↘", "↘", "↘", "≈", "P"],
    isClosed: false
  },
  {
    game: "LAA @ SEA",
    venue: "T-Mobile Park",
    time: "9:40",
    runs: 0.82,
    hr: 0.91,
    doubleTriple: 0.76,
    single: 0.91,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 6, dir: "↘" }],
    tempHours: [54, 53, 52],
    humidity: 65,
    pressure: 1018,
    icons: ["↘", "↘", "↘", "〜"],
    isClosed: false
  },
  {
    game: "HOU @ SEA",
    venue: "T-Mobile Park",
    time: "10:10",
    runs: 0.82,
    hr: 0.91,
    doubleTriple: 0.76,
    single: 0.91,
    receptive: "Medium",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 6, dir: "↘" }],
    tempHours: [54, 53, 52],
    humidity: 65,
    pressure: 1018,
    icons: ["↘", "↘", "↘", "〜"],
    isClosed: false
  },
  {
    game: "TB @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 0.82,
    hr: 0.72,
    doubleTriple: 0.98,
    single: 0.89,
    receptive: "High",
    windHours: [{ speed: 15, dir: "↓" }, { speed: 15, dir: "↓" }, { speed: 15, dir: "↓" }],
    tempHours: [64, 63, 63],
    humidity: 44,
    pressure: 1030,
    icons: ["↓", "↓", "↓", "≈", "P"],
    isClosed: false
  },
  {
    game: "MIA @ CHC",
    venue: "Wrigley Field",
    time: "2:20",
    runs: 0.74,
    hr: 0.68,
    doubleTriple: 0.85,
    single: 0.92,
    receptive: "Extreme",
    windHours: [{ speed: 9, dir: "↙" }, { speed: 9, dir: "↙" }, { speed: 12, dir: "↙" }],
    tempHours: [63, 63, 61],
    humidity: 74,
    pressure: 1026,
    icons: ["↙", "↙", "↙", "≈", "P"],
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
