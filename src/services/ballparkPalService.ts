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
    game: "CHC @ COL",
    venue: "Coors Field",
    time: "3:10",
    runs: 1.30,
    hr: 1.26,
    doubleTriple: 1.11,
    single: 1.20,
    receptive: "Low",
    windHours: [{ speed: 16, dir: "↙" }, { speed: 14, dir: "↙" }, { speed: 13, dir: "↙" }],
    tempHours: [79, 79, 81],
    humidity: 7,
    pressure: 1009,
    icons: ["↙", "↙", "↙", "≈", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "TEX @ KC",
    venue: "Kauffman Stadium",
    time: "2:10",
    runs: 1.28,
    hr: 1.41,
    doubleTriple: 1.01,
    single: 1.15,
    receptive: "High",
    windHours: [{ speed: 19, dir: "↑" }, { speed: 18, dir: "↑" }, { speed: 14, dir: "↗" }],
    tempHours: [95, 91, 88],
    humidity: 51,
    pressure: 1004,
    icons: ["↑", "↑", "↗", "≈", "🔴", "P"],
    isClosed: false
  },
  {
    game: "MIN @ DET",
    venue: "Comerica Park",
    time: "1:10",
    runs: 1.10,
    hr: 1.10,
    doubleTriple: 1.07,
    single: 1.05,
    receptive: "High",
    windHours: [{ speed: 9, dir: "↖" }, { speed: 11, dir: "↖" }, { speed: 9, dir: "↖" }],
    tempHours: [84, 86, 88],
    humidity: 61,
    pressure: 1007,
    icons: ["↖", "↖", "↖", "~", "🔴", "P"],
    isClosed: false
  },
  {
    game: "SEA @ BAL",
    venue: "Oriole Park",
    time: "7:05",
    runs: 1.10,
    hr: 1.06,
    doubleTriple: 1.08,
    single: 1.07,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 6, dir: "↖" }, { speed: 5, dir: "↑" }],
    tempHours: [77, 75, 73],
    humidity: 91,
    pressure: 1011,
    icons: ["↑", "↖", "↑", "~", "☀️", "H"],
    isClosed: false
  },
  {
    game: "ATL @ CHW",
    venue: "Rate Field",
    time: "7:40",
    runs: 1.10,
    hr: 1.20,
    doubleTriple: 1.00,
    single: 1.00,
    receptive: "Med-High",
    windHours: [{ speed: 21, dir: "↙" }, { speed: 22, dir: "←" }, { speed: 21, dir: "↙" }],
    tempHours: [82, 81, 75],
    humidity: 61,
    pressure: 1000,
    icons: ["↙", "←", "↙", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "LAD @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 1.05,
    hr: 1.06,
    doubleTriple: 1.07,
    single: 0.98,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 6, dir: "↘" }, { speed: 5, dir: "↘" }],
    tempHours: [81, 79, 75],
    humidity: 84,
    pressure: 1009,
    icons: ["↘", "↘", "↘", "~", "☀️", "H", "P"],
    isClosed: false
  },
  {
    game: "STL @ NYM",
    venue: "Citi Field",
    time: "1:10",
    runs: 0.98,
    hr: 1.05,
    doubleTriple: 0.78,
    single: 1.03,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 7, dir: "↗" }, { speed: 10, dir: "↗" }],
    tempHours: [95, 95, 97],
    humidity: 44,
    pressure: 1006,
    icons: ["↗", "↗", "↗", "~", "🔴", "P"],
    isClosed: false
  },
  {
    game: "ARI @ MIA",
    venue: "LoanDepot Park",
    time: "1:10",
    runs: 0.95,
    hr: 0.86,
    doubleTriple: 1.03,
    single: 0.98,
    receptive: "Roof Closed",
    windHours: [],
    tempHours: [],
    humidity: 0,
    pressure: 0,
    icons: ["🏟️"],
    isClosed: true
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
