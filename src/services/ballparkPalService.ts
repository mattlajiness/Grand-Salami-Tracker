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
    game: "LAD @ COL",
    venue: "Coors Field",
    time: "8:40",
    runs: 1.38,
    hr: 1.28,
    doubleTriple: 1.31,
    single: 1.17,
    receptive: "Low",
    windHours: [{ speed: 8, dir: "↖" }, { speed: 8, dir: "↑" }, { speed: 8, dir: "↑" }],
    tempHours: [90, 88, 85],
    humidity: 23,
    pressure: 1011,
    icons: ["↖", "↑", "↑", "〜", "💥", "H"],
    isClosed: false
  },
  {
    game: "STL @ CIN",
    venue: "Great American BP",
    time: "1:40",
    runs: 1.15,
    hr: 1.30,
    doubleTriple: 1.03,
    single: 0.97,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↖" }, { speed: 7, dir: "↖" }, { speed: 8, dir: "↗" }],
    tempHours: [80, 81, 82],
    humidity: 85,
    pressure: 1015,
    icons: ["↖", "↖", "↗", "〜", "☀️", "H"],
    isClosed: false
  },
  {
    game: "STL @ CIN",
    venue: "Great American BP",
    time: "6:40",
    runs: 1.10,
    hr: 1.17,
    doubleTriple: 1.03,
    single: 0.98,
    receptive: "Low",
    windHours: [{ speed: 8, dir: "↗" }, { speed: 8, dir: "↗" }, { speed: 8, dir: "↗" }],
    tempHours: [81, 80, 79],
    humidity: 86,
    pressure: 1015,
    icons: ["↗", "↗", "↗", "〜", "☀️", "H"],
    isClosed: false
  },
  {
    game: "MIA @ PHI",
    venue: "Citizens Bank Park",
    time: "6:40",
    runs: 1.07,
    hr: 1.13,
    doubleTriple: 0.99,
    single: 1.01,
    receptive: "Very High",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 9, dir: "↘" }, { speed: 8, dir: "↘" }],
    tempHours: [86, 85, 83],
    humidity: 74,
    pressure: 1015,
    icons: ["↘", "↘", "↘", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "DET @ PIT",
    venue: "PNC Park",
    time: "7:05",
    runs: 1.04,
    hr: 0.94,
    doubleTriple: 1.10,
    single: 1.03,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [77, 75, 75],
    humidity: 70,
    pressure: 1016,
    icons: ["↗", "↗", "↗", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "ATL @ MIN",
    venue: "Target Field",
    time: "7:40",
    runs: 1.02,
    hr: 1.01,
    doubleTriple: 1.01,
    single: 1.00,
    receptive: "Medium",
    windHours: [{ speed: 9, dir: "↖" }, { speed: 9, dir: "↖" }, { speed: 8, dir: "↖" }],
    tempHours: [83, 80, 78],
    humidity: 52,
    pressure: 1018,
    icons: ["↖", "↖", "↖", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "ATH @ KC",
    venue: "Kauffman Stadium",
    time: "7:40",
    runs: 1.01,
    hr: 1.05,
    doubleTriple: 1.03,
    single: 0.99,
    receptive: "High",
    windHours: [{ speed: 5, dir: "↓" }, { speed: 5, dir: "↙" }, { speed: 5, dir: "↙" }],
    tempHours: [83, 83, 82],
    humidity: 55,
    pressure: 1018,
    icons: ["↓", "↙", "↙", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "ARI @ BOS",
    venue: "Fenway Park",
    time: "7:10",
    runs: 1.00,
    hr: 0.85,
    doubleTriple: 1.12,
    single: 1.05,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↘" }, { speed: 7, dir: "↓" }, { speed: 6, dir: "↙" }],
    tempHours: [70, 70, 69],
    humidity: 61,
    pressure: 1015,
    icons: ["↘", "↓", "↙", "〜"],
    isClosed: false
  },
  {
    game: "CHW @ CHC",
    venue: "Wrigley Field",
    time: "8:05",
    runs: 0.96,
    hr: 1.08,
    doubleTriple: 0.86,
    single: 0.97,
    receptive: "Extreme",
    windHours: [{ speed: 5, dir: "↘" }, { speed: 6, dir: "↗" }, { speed: 6, dir: "↑" }],
    tempHours: [74, 72, 72],
    humidity: 74,
    pressure: 1014,
    icons: ["↘", "↗", "↑", "〜"],
    isClosed: false
  },
  {
    game: "BAL @ TB",
    venue: "Tropicana Field",
    time: "6:05",
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
    game: "SD @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.88,
    hr: 0.94,
    doubleTriple: 0.76,
    single: 0.95,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 9, dir: "↘" }, { speed: 8, dir: "↘" }],
    tempHours: [80, 79, 78],
    humidity: 74,
    pressure: 1015,
    icons: ["↘", "↘", "↘", "〜", "☀️"],
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
