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
    game: "COL @ ARI",
    venue: "Chase Field",
    time: "9:40",
    runs: 1.05,
    hr: 0.92,
    doubleTriple: 1.18,
    single: 1.02,
    receptive: "Medium",
    windHours: [{ speed: 8, dir: "↘" }, { speed: 9, dir: "↘" }, { speed: 10, dir: "→" }],
    tempHours: [91, 90, 88],
    humidity: 10,
    pressure: 1005,
    icons: ["↘", "↘", "→", "~", "💥", "H", "P"],
    isClosed: false
  },
  {
    game: "ATH @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 1.01,
    hr: 1.05,
    doubleTriple: 0.90,
    single: 1.04,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 8, dir: "↑" }],
    tempHours: [75, 73, 70],
    humidity: 38,
    pressure: 1009,
    icons: ["↑", "↑", "↑", "~", "P"]
  },
  {
    game: "ATL @ MIA",
    venue: "LoanDepot Park",
    time: "6:40",
    runs: 0.96,
    hr: 0.88,
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
    game: "NYM @ WAS",
    venue: "Nationals Park",
    time: "4:05",
    runs: 0.94,
    hr: 0.76,
    doubleTriple: 1.02,
    single: 1.06,
    receptive: "Med-High",
    windHours: [{ speed: 8, dir: "↓" }, { speed: 7, dir: "↙" }, { speed: 6, dir: "↓" }],
    tempHours: [64, 61, 59],
    humidity: 65,
    pressure: 1024,
    icons: ["↓", "↙", "↓", "~", "P"]
  },
  {
    game: "CLE @ DET",
    venue: "Comerica Park",
    time: "1:10",
    runs: 0.86,
    hr: 0.66,
    doubleTriple: 1.01,
    single: 1.03,
    receptive: "High",
    windHours: [{ speed: 11, dir: "↘" }, { speed: 11, dir: "↘" }, { speed: 11, dir: "→" }],
    tempHours: [61, 63, 64],
    humidity: 45,
    pressure: 1027,
    icons: ["↘", "↘", "→", "≈", "P"]
  },
  {
    game: "TOR @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 0.84,
    hr: 0.85,
    doubleTriple: 0.82,
    single: 0.93,
    receptive: "High",
    windHours: [{ speed: 6, dir: "↖" }, { speed: 6, dir: "↖" }, { speed: 7, dir: "↖" }],
    tempHours: [63, 63, 61],
    humidity: 44,
    pressure: 1024,
    icons: ["↖", "↖", "↖", "~", "P"]
  },
  {
    game: "PIT @ STL",
    venue: "Busch Stadium",
    time: "1:15",
    runs: 0.83,
    hr: 0.74,
    doubleTriple: 0.90,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↙" }, { speed: 10, dir: "↙" }, { speed: 10, dir: "↙" }],
    tempHours: [66, 68, 70],
    humidity: 77,
    pressure: 1022,
    icons: ["↙", "↙", "↙", "~", "H", "P"]
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
