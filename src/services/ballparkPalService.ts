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
    game: "BAL @ BOS",
    venue: "Fenway Park",
    time: "1:35",
    runs: 1.19,
    hr: 1.05,
    doubleTriple: 1.32,
    single: 1.07,
    receptive: "High",
    windHours: [{ speed: 6, dir: "↗" }, { speed: 6, dir: "↗" }, { speed: 7, dir: "↗" }],
    tempHours: [86, 86, 86],
    humidity: 32,
    pressure: 1018,
    icons: ["↗", "↗", "↗", "~", "☀️"],
    isClosed: false
  },
  {
    game: "ATH @ CHC",
    venue: "Wrigley Field",
    time: "8:05",
    runs: 1.15,
    hr: 1.34,
    doubleTriple: 0.99,
    single: 0.99,
    receptive: "Extreme",
    windHours: [{ speed: 12, dir: "↑" }, { speed: 11, dir: "↑" }, { speed: 11, dir: "↑" }],
    tempHours: [77, 75, 73],
    humidity: 46,
    pressure: 1015,
    icons: ["↑", "↑", "↑", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "SD @ PHI",
    venue: "Citizens Bank Park",
    time: "1:05",
    runs: 1.05,
    hr: 1.09,
    doubleTriple: 0.96,
    single: 1.02,
    receptive: "Very High",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 7, dir: "↘" }],
    tempHours: [86, 86, 86],
    humidity: 28,
    pressure: 1021,
    icons: ["↘", "↘", "↘", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "KC @ MIN",
    venue: "Target Field",
    time: "7:40",
    runs: 1.03,
    hr: 1.01,
    doubleTriple: 1.03,
    single: 1.01,
    receptive: "Medium",
    windHours: [{ speed: 10, dir: "↖" }, { speed: 8, dir: "↖" }, { speed: 6, dir: "↖" }],
    tempHours: [73, 73, 72],
    humidity: 56,
    pressure: 1009,
    icons: ["↖", "↖", "↖", "~", "P"],
    isClosed: false
  },
  {
    game: "LAD @ ARI",
    venue: "Chase Field",
    time: "9:40",
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
    game: "PIT @ HOU",
    venue: "Daikin Park",
    time: "8:10",
    runs: 0.96,
    hr: 1.06,
    doubleTriple: 0.90,
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
    game: "SF @ MIL",
    venue: "American Family Fld",
    time: "2:10",
    runs: 0.95,
    hr: 1.11,
    doubleTriple: 0.83,
    single: 0.92,
    receptive: "Low",
    windHours: [{ speed: 13, dir: "←" }, { speed: 14, dir: "←" }, { speed: 13, dir: "←" }],
    tempHours: [79, 79, 79],
    humidity: 49,
    pressure: 1017,
    icons: ["←", "←", "←", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "TOR @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 0.92,
    hr: 0.83,
    doubleTriple: 0.96,
    single: 1.02,
    receptive: "Medium",
    windHours: [{ speed: 7, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 6, dir: "↘" }],
    tempHours: [82, 79, 77],
    humidity: 28,
    pressure: 1019,
    icons: ["↘", "↘", "↘", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "CLE @ NYY",
    venue: "Yankee Stadium",
    time: "1:35",
    runs: 0.92,
    hr: 1.03,
    doubleTriple: 0.84,
    single: 0.92,
    receptive: "High",
    windHours: [{ speed: 5, dir: "↖" }, { speed: 6, dir: "↖" }, { speed: 8, dir: "↖" }],
    tempHours: [84, 84, 82],
    humidity: 27,
    pressure: 1020,
    icons: ["↖", "↖", "↖", "~", "☀️", "P"],
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
