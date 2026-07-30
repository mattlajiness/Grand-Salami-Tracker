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
    game: "BOS @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.24,
    hr: 1.31,
    doubleTriple: 1.19,
    single: 1.05,
    receptive: "Very High",
    windHours: [{ speed: 12, dir: "↑" }, { speed: 12, dir: "↑" }, { speed: 11, dir: "↑" }],
    tempHours: [95, 90, 81],
    humidity: 15,
    pressure: 1009,
    icons: ["↑", "↑", "↑", "≈", "💥", "H", "P"],
    isClosed: false
  },
  {
    game: "PIT @ CIN",
    venue: "Great American BP",
    time: "7:10",
    runs: 1.11,
    hr: 1.20,
    doubleTriple: 1.02,
    single: 0.98,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "→" }, { speed: 5, dir: "↗" }, { speed: 4, dir: "↗" }],
    tempHours: [81, 75, 70],
    humidity: 53,
    pressure: 1016,
    icons: ["→", "↗", "↗", "~", "☀️"],
    isClosed: false
  },
  {
    game: "WAS @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 1.04,
    hr: 1.08,
    doubleTriple: 0.92,
    single: 1.07,
    receptive: "Medium",
    windHours: [{ speed: 11, dir: "↑" }, { speed: 8, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [88, 86, 82],
    humidity: 32,
    pressure: 1012,
    icons: ["↑", "↗", "↗", "~", "☀️"],
    isClosed: false
  },
  {
    game: "SEA @ LAD",
    venue: "Dodger Stadium",
    time: "10:10",
    runs: 1.02,
    hr: 1.18,
    doubleTriple: 1.01,
    single: 0.94,
    receptive: "Consistent",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }, { speed: 5, dir: "↑" }],
    tempHours: [82, 79, 79],
    humidity: 45,
    pressure: 1011,
    icons: ["↗", "↗", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "NYY @ CHW",
    venue: "Rate Field",
    time: "2:10",
    runs: 0.99,
    hr: 0.87,
    doubleTriple: 0.94,
    single: 1.08,
    receptive: "Med-High",
    windHours: [{ speed: 3, dir: "↓" }, { speed: 3, dir: "↙" }, { speed: 4, dir: "↙" }],
    tempHours: [82, 82, 82],
    humidity: 41,
    pressure: 1017,
    icons: ["↓", "↙", "↙", "☀️"],
    isClosed: false
  },
  {
    game: "KC @ MIN",
    venue: "Target Field",
    time: "1:40",
    runs: 0.95,
    hr: 0.92,
    doubleTriple: 1.01,
    single: 0.96,
    receptive: "Medium",
    windHours: [{ speed: 8, dir: "↖" }, { speed: 8, dir: "←" }, { speed: 8, dir: "↙" }],
    tempHours: [90, 90, 93],
    humidity: 32,
    pressure: 1014,
    icons: ["↖", "←", "↙", "~", "💥"],
    isClosed: false
  },
  {
    game: "SF @ SD",
    venue: "Petco Park",
    time: "9:40",
    runs: 0.94,
    hr: 0.99,
    doubleTriple: 0.90,
    single: 0.95,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [77, 75, 73],
    humidity: 61,
    pressure: 1012,
    icons: ["↗", "↗", "↗", "~", "☀️"],
    isClosed: false
  },
  {
    game: "TEX @ TB",
    venue: "Tropicana Field",
    time: "12:10",
    runs: 0.94,
    hr: 0.97,
    doubleTriple: 0.94,
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
    game: "CHC @ STL",
    venue: "Busch Stadium",
    time: "2:15",
    runs: 0.93,
    hr: 0.85,
    doubleTriple: 0.97,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "↙" }, { speed: 8, dir: "↙" }, { speed: 8, dir: "↙" }],
    tempHours: [84, 84, 84],
    humidity: 52,
    pressure: 1016,
    icons: ["↙", "↙", "↙", "~", "☀️"],
    isClosed: false
  },
  {
    game: "MIA @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.90,
    hr: 0.97,
    doubleTriple: 0.81,
    single: 0.94,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↙" }, { speed: 7, dir: "↙" }, { speed: 6, dir: "↙" }],
    tempHours: [75, 73, 72],
    humidity: 62,
    pressure: 1011,
    icons: ["↙", "↙", "↙", "~"],
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
