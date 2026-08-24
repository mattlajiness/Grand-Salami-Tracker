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
    game: "MIN @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.29,
    hr: 1.39,
    doubleTriple: 1.17,
    single: 1.08,
    receptive: "Very High",
    windHours: [{ speed: 14, dir: "↑" }, { speed: 12, dir: "↑" }, { speed: 11, dir: "↑" }],
    tempHours: [93, 88, 79],
    humidity: 14,
    pressure: 1011,
    icons: ["↑", "↑", "↑", "≈", "💥", "H"],
    isClosed: false
  },
  {
    game: "CHC @ ARI",
    venue: "Chase Field",
    time: "9:40",
    runs: 1.00,
    hr: 0.91,
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
    game: "COL @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.00,
    hr: 0.92,
    doubleTriple: 1.04,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 8, dir: "↘" }, { speed: 6, dir: "↘" }],
    tempHours: [84, 79, 73],
    humidity: 31,
    pressure: 1013,
    icons: ["↘", "↘", "↘", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "CLE @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 0.98,
    hr: 0.96,
    doubleTriple: 0.95,
    single: 1.01,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 8, dir: "↗" }, { speed: 7, dir: "↗" }],
    tempHours: [84, 82, 81],
    humidity: 44,
    pressure: 1011,
    icons: ["↗", "↗", "↗", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "CIN @ SF",
    venue: "Oracle Park",
    time: "9:45",
    runs: 0.97,
    hr: 0.83,
    doubleTriple: 1.00,
    single: 1.08,
    receptive: "Consistent",
    windHours: [{ speed: 11, dir: "↑" }, { speed: 11, dir: "↑" }, { speed: 9, dir: "↑" }],
    tempHours: [63, 63, 61],
    humidity: 80,
    pressure: 1015,
    icons: ["↑", "↑", "↑", "≈", "H"],
    isClosed: false
  },
  {
    game: "TB @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 0.97,
    hr: 0.89,
    doubleTriple: 1.01,
    single: 1.04,
    receptive: "High",
    windHours: [{ speed: 6, dir: "↗" }, { speed: 6, dir: "→" }, { speed: 4, dir: "→" }],
    tempHours: [73, 70, 70],
    humidity: 38,
    pressure: 1014,
    icons: ["↗", "→", "→", "〜"],
    isClosed: false
  },
  {
    game: "PIT @ SD",
    venue: "Petco Park",
    time: "9:40",
    runs: 0.95,
    hr: 1.07,
    doubleTriple: 0.80,
    single: 0.97,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "↗" }, { speed: 4, dir: "↗" }, { speed: 4, dir: "↗" }],
    tempHours: [77, 75, 75],
    humidity: 68,
    pressure: 1012,
    icons: ["↗", "↗", "↗", "☀️"],
    isClosed: false
  },
  {
    game: "BOS @ MIA",
    venue: "LoanDepot Park",
    time: "6:40",
    runs: 0.94,
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
    game: "TEX @ CHW",
    venue: "Rate Field",
    time: "7:40",
    runs: 0.92,
    hr: 0.89,
    doubleTriple: 0.87,
    single: 1.02,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 4, dir: "↘" }, { speed: 4, dir: "↘" }],
    tempHours: [70, 68, 66],
    humidity: 57,
    pressure: 1018,
    icons: ["↘", "↘", "↘"],
    isClosed: false
  },
  {
    game: "PHI @ SEA",
    venue: "T-Mobile Park",
    time: "9:40",
    runs: 0.88,
    hr: 0.98,
    doubleTriple: 0.81,
    single: 0.92,
    receptive: "Medium",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 9, dir: "↘" }, { speed: 7, dir: "↘" }],
    tempHours: [77, 73, 70],
    humidity: 39,
    pressure: 1014,
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
