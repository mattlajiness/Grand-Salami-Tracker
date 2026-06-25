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
    game: "NYY @ BOS",
    venue: "Fenway Park",
    time: "7:10",
    runs: 1.14,
    hr: 1.01,
    doubleTriple: 1.30,
    single: 1.04,
    receptive: "High",
    windHours: [{ speed: 6, dir: "↗" }, { speed: 6, dir: "↗" }, { speed: 5, dir: "↗" }],
    tempHours: [75, 72, 68],
    humidity: 52,
    pressure: 1017,
    icons: ["↗", "↗", "↗", "~"],
    isClosed: false
  },
  {
    game: "PHI @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.09,
    hr: 1.06,
    doubleTriple: 1.13,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 8, dir: "↗" }, { speed: 6, dir: "↗" }, { speed: 5, dir: "↖" }],
    tempHours: [88, 84, 81],
    humidity: 31,
    pressure: 1014,
    icons: ["↗", "↗", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "HOU @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 1.04,
    hr: 1.05,
    doubleTriple: 1.03,
    single: 1.03,
    receptive: "High",
    windHours: [{ speed: 11, dir: "↖" }, { speed: 10, dir: "↖" }, { speed: 8, dir: "↖" }],
    tempHours: [79, 77, 73],
    humidity: 43,
    pressure: 1012,
    icons: ["↖", "↖", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "SEA @ PIT",
    venue: "PNC Park",
    time: "12:35",
    runs: 1.03,
    hr: 0.93,
    doubleTriple: 1.10,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↖" }, { speed: 9, dir: "↖" }, { speed: 9, dir: "↖" }],
    tempHours: [84, 84, 84],
    humidity: 46,
    pressure: 1016,
    icons: ["↖", "↖", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "CHC @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.97,
    hr: 1.08,
    doubleTriple: 0.87,
    single: 0.93,
    receptive: "Low",
    windHours: [{ speed: 14, dir: "↗" }, { speed: 14, dir: "↗" }, { speed: 14, dir: "↗" }],
    tempHours: [77, 75, 73],
    humidity: 54,
    pressure: 1017,
    icons: ["↗", "↗", "↗", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "ATH @ SF",
    venue: "Oracle Park",
    time: "3:45",
    runs: 0.96,
    hr: 0.80,
    doubleTriple: 1.03,
    single: 1.08,
    receptive: "Consistent",
    windHours: [{ speed: 11, dir: "↗" }, { speed: 13, dir: "↗" }, { speed: 14, dir: "↗" }],
    tempHours: [63, 63, 63],
    humidity: 84,
    pressure: 1012,
    icons: ["↗", "↗", "↗", "≈", "H"],
    isClosed: false
  },
  {
    game: "TEX @ TOR",
    venue: "Rogers Centre",
    time: "7:07",
    runs: 0.94,
    hr: 1.01,
    doubleTriple: 0.96,
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
    game: "KC @ TB",
    venue: "Tropicana Field",
    time: "12:10",
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
    game: "ARI @ STL",
    venue: "Busch Stadium",
    time: "7:45",
    runs: 0.91,
    hr: 0.85,
    doubleTriple: 0.92,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 8, dir: "↙" }, { speed: 4, dir: "↘" }, { speed: 9, dir: "↙" }],
    tempHours: [79, 75, 73],
    humidity: 69,
    pressure: 1011,
    icons: ["↙", "↘", "↙", "~", "☀️"],
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
