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
    game: "SEA @ BAL",
    venue: "Oriole Park",
    time: "6:35",
    runs: 1.05,
    hr: 0.95,
    doubleTriple: 1.01,
    single: 1.11,
    receptive: "Med-High",
    windHours: [{ speed: 10, dir: "←" }, { speed: 11, dir: "↖" }, { speed: 11, dir: "↖" }],
    tempHours: [77, 75, 72],
    humidity: 46,
    pressure: 1022,
    icons: ["←", "↖", "↖", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "NYY @ CLE",
    venue: "Progressive Field",
    time: "6:40",
    runs: 1.03,
    hr: 1.02,
    doubleTriple: 1.05,
    single: 0.98,
    receptive: "High",
    windHours: [{ speed: 3, dir: "↙" }, { speed: 4, dir: "↙" }, { speed: 3, dir: "←" }],
    tempHours: [75, 75, 73],
    humidity: 66,
    pressure: 1017,
    icons: ["↙", "↙", "←"],
    isClosed: false
  },
  {
    game: "PHI @ TOR",
    venue: "Rogers Centre",
    time: "7:07",
    runs: 0.98,
    hr: 1.01,
    doubleTriple: 0.97,
    single: 1.01,
    receptive: "Minimal",
    windHours: [{ speed: 8, dir: "↖" }, { speed: 7, dir: "↖" }, { speed: 6, dir: "←" }],
    tempHours: [66, 64, 63],
    humidity: 59,
    pressure: 1020,
    icons: ["↖", "↖", "←", "~", "P"],
    isClosed: false
  },
  {
    game: "HOU @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 0.97,
    hr: 1.03,
    doubleTriple: 0.92,
    single: 0.99,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 7, dir: "↖" }],
    tempHours: [72, 70, 68],
    humidity: 52,
    pressure: 1010,
    icons: ["↑", "↑", "↖", "~", "P"],
    isClosed: false
  },
  {
    game: "BOS @ TB",
    venue: "Tropicana Field",
    time: "6:40",
    runs: 0.95,
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
    game: "WAS @ SF",
    venue: "Oracle Park",
    time: "9:45",
    runs: 0.93,
    hr: 0.77,
    doubleTriple: 0.99,
    single: 1.08,
    receptive: "Consistent",
    windHours: [{ speed: 13, dir: "↑" }, { speed: 11, dir: "↑" }, { speed: 9, dir: "↑" }],
    tempHours: [57, 57, 57],
    humidity: 87,
    pressure: 1014,
    icons: ["↑", "↑", "↑", "≈", "H"],
    isClosed: false
  },
  {
    game: "CIN @ SD",
    venue: "Petco Park",
    time: "9:40",
    runs: 0.91,
    hr: 0.97,
    doubleTriple: 0.81,
    single: 0.96,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }, { speed: 6, dir: "↗" }],
    tempHours: [68, 66, 66],
    humidity: 63,
    pressure: 1011,
    icons: ["↗", "↗", "↗", "~"],
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
