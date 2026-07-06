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
    game: "HOU @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.05,
    hr: 1.03,
    doubleTriple: 1.08,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 2, dir: "↓" }, { speed: 6, dir: "↓" }, { speed: 3, dir: "↓" }],
    tempHours: [91, 84, 77],
    humidity: 50,
    pressure: 1010,
    icons: ["↓", "↓", "↓", "☀️", "P"],
    isClosed: false
  },
  {
    game: "PHI @ KC",
    venue: "Kauffman Stadium",
    time: "2:10",
    runs: 1.03,
    hr: 1.12,
    doubleTriple: 0.98,
    single: 1.00,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↙" }, { speed: 7, dir: "↙" }, { speed: 7, dir: "↙" }],
    tempHours: [91, 95, 97],
    humidity: 44,
    pressure: 1016,
    icons: ["↙", "↙", "↙", "~", "☀️"],
    isClosed: false
  },
  {
    game: "COL @ LAD",
    venue: "Dodger Stadium",
    time: "10:10",
    runs: 1.00,
    hr: 1.16,
    doubleTriple: 0.98,
    single: 0.95,
    receptive: "Consistent",
    windHours: [{ speed: 8, dir: "↗" }, { speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [79, 75, 73],
    humidity: 49,
    pressure: 1011,
    icons: ["↗", "↗", "↗", "~", "☀️"],
    isClosed: false
  },
  {
    game: "NYM @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 1.00,
    hr: 1.08,
    doubleTriple: 0.93,
    single: 1.00,
    receptive: "Medium",
    windHours: [{ speed: 7, dir: "↖" }, { speed: 6, dir: "←" }, { speed: 6, dir: "↖" }],
    tempHours: [88, 86, 82],
    humidity: 50,
    pressure: 1012,
    icons: ["↖", "←", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "MIL @ STL",
    venue: "Busch Stadium",
    time: "7:45",
    runs: 0.97,
    hr: 0.91,
    doubleTriple: 1.00,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 9, dir: "↘" }, { speed: 7, dir: "↘" }],
    tempHours: [82, 81, 77],
    humidity: 57,
    pressure: 1015,
    icons: ["↘", "↘", "↘", "~", "☀️"],
    isClosed: false
  },
  {
    game: "ARI @ SD",
    venue: "Petco Park",
    time: "9:40",
    runs: 0.95,
    hr: 0.98,
    doubleTriple: 0.91,
    single: 0.96,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 9, dir: "↘" }, { speed: 8, dir: "↘" }],
    tempHours: [73, 72, 70],
    humidity: 65,
    pressure: 1012,
    icons: ["↘", "↘", "↘", "~"],
    isClosed: false
  },
  {
    game: "NYY @ TB",
    venue: "Tropicana Field",
    time: "6:40",
    runs: 0.94,
    hr: 0.97,
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
    game: "TOR @ SF",
    venue: "Oracle Park",
    time: "9:45",
    runs: 0.93,
    hr: 0.78,
    doubleTriple: 1.03,
    single: 1.05,
    receptive: "Consistent",
    windHours: [{ speed: 15, dir: "↑" }, { speed: 14, dir: "↑" }, { speed: 14, dir: "↑" }],
    tempHours: [61, 59, 59],
    humidity: 75,
    pressure: 1015,
    icons: ["↑", "↑", "↗", "≈", "H"],
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
