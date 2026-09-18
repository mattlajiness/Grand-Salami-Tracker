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
    game: "SEA @ COL",
    venue: "Coors Field",
    time: "8:10",
    runs: 1.28,
    hr: 1.10,
    doubleTriple: 1.34,
    single: 1.13,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↓" }, { speed: 12, dir: "↙" }, { speed: 6, dir: "↙" }],
    tempHours: [75, 68, 68],
    humidity: 39,
    pressure: 1013,
    icons: ["↓", "↙", "↙", "〜"],
    isClosed: false
  },
  {
    game: "CHC @ CIN",
    venue: "Great American BP",
    time: "6:40",
    runs: 1.18,
    hr: 1.25,
    doubleTriple: 1.06,
    single: 1.02,
    receptive: "Low",
    windHours: [{ speed: 8, dir: "↘" }, { speed: 8, dir: "→" }, { speed: 9, dir: "↘" }],
    tempHours: [77, 75, 72],
    humidity: 73,
    pressure: 1019,
    icons: ["↘", "→", "↘", "〜", "☀️", "P"],
    isClosed: false
  },
  {
    game: "KC @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 1.02,
    hr: 0.87,
    doubleTriple: 1.16,
    single: 1.00,
    receptive: "Med-High",
    windHours: [{ speed: 5, dir: "↗" }, { speed: 5, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [72, 72, 70],
    humidity: 56,
    pressure: 1020,
    icons: ["↗", "↗", "↗", "〜", "P"],
    isClosed: false
  },
  {
    game: "SF @ LAD",
    venue: "Dodger Stadium",
    time: "10:15",
    runs: 1.02,
    hr: 1.15,
    doubleTriple: 0.97,
    single: 0.98,
    receptive: "Consistent",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [73, 72, 72],
    humidity: 56,
    pressure: 1014,
    icons: ["↗", "↗", "↗", "〜"],
    isClosed: false
  },
  {
    game: "NYY @ ARI",
    venue: "Chase Field",
    time: "9:40",
    runs: 1.01,
    hr: 0.92,
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
    game: "WAS @ STL",
    venue: "Busch Stadium",
    time: "8:15",
    runs: 0.97,
    hr: 0.99,
    doubleTriple: 0.94,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↑" }, { speed: 4, dir: "↖" }, { speed: 3, dir: "↙" }],
    tempHours: [93, 91, 90],
    humidity: 39,
    pressure: 1015,
    icons: ["↑", "↖", "↙", "💥"],
    isClosed: false
  },
  {
    game: "MIN @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 0.97,
    hr: 0.95,
    doubleTriple: 0.90,
    single: 1.03,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [73, 72, 72],
    humidity: 59,
    pressure: 1014,
    icons: ["↑", "↑", "↑", "〜"],
    isClosed: false
  },
  {
    game: "MIL @ BAL",
    venue: "Oriole Park",
    time: "7:05",
    runs: 0.97,
    hr: 0.85,
    doubleTriple: 1.06,
    single: 1.03,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 9, dir: "↘" }, { speed: 11, dir: "↓" }],
    tempHours: [77, 75, 73],
    humidity: 48,
    pressure: 1019,
    icons: ["↘", "↘", "↓", "〜", "☀️", "P"],
    isClosed: false
  },
  {
    game: "ATL @ HOU",
    venue: "Daikin Park",
    time: "8:10",
    runs: 0.95,
    hr: 1.05,
    doubleTriple: 0.88,
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
    game: "MIA @ SD",
    venue: "Petco Park",
    time: "9:40",
    runs: 0.95,
    hr: 0.98,
    doubleTriple: 0.96,
    single: 0.93,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 8, dir: "↘" }, { speed: 7, dir: "↘" }],
    tempHours: [72, 70, 70],
    humidity: 68,
    pressure: 1014,
    icons: ["↘", "↘", "↘", "〜"],
    isClosed: false
  },
  {
    game: "ATH @ CLE",
    venue: "Progressive Field",
    time: "7:10",
    runs: 0.94,
    hr: 0.83,
    doubleTriple: 1.05,
    single: 0.96,
    receptive: "High",
    windHours: [{ speed: 9, dir: "↙" }, { speed: 9, dir: "↙" }, { speed: 9, dir: "↙" }],
    tempHours: [66, 66, 66],
    humidity: 60,
    pressure: 1022,
    icons: ["↙", "↙", "↙", "〜", "P"],
    isClosed: false
  },
  {
    game: "BOS @ TB",
    venue: "Tropicana Field",
    time: "7:10",
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
    game: "TOR @ TEX",
    venue: "Globe Life Field",
    time: "8:05",
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
    game: "DET @ CHW",
    venue: "Rate Field",
    time: "7:40",
    runs: 0.92,
    hr: 0.89,
    doubleTriple: 0.98,
    single: 0.95,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↓" }, { speed: 8, dir: "↘" }, { speed: 7, dir: "↓" }],
    tempHours: [68, 66, 66],
    humidity: 66,
    pressure: 1020,
    icons: ["↓", "↘", "↓", "〜", "P"],
    isClosed: false
  },
  {
    game: "PHI @ NYM",
    venue: "Citi Field",
    time: "7:15",
    runs: 0.91,
    hr: 0.97,
    doubleTriple: 0.82,
    single: 0.95,
    receptive: "Low",
    windHours: [{ speed: 12, dir: "↓" }, { speed: 11, dir: "↓" }, { speed: 11, dir: "↓" }],
    tempHours: [77, 75, 73],
    humidity: 36,
    pressure: 1019,
    icons: ["↓", "↓", "↓", "≈", "☀️", "P"],
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
