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
    game: "HOU @ PHI",
    venue: "Citizens Bank Park",
    time: "1:05",
    runs: 1.13,
    hr: 1.28,
    doubleTriple: 1.02,
    single: 0.99,
    receptive: "Very High",
    windHours: [{ speed: 8, dir: "→" }, { speed: 7, dir: "→" }, { speed: 7, dir: "↗" }],
    tempHours: [82, 79, 77],
    humidity: 62,
    pressure: 1013,
    icons: ["→", "→", "↗", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "TB @ ATL",
    venue: "Truist Park",
    time: "12:15",
    runs: 1.01,
    hr: 1.00,
    doubleTriple: 0.99,
    single: 1.03,
    receptive: "Medium",
    windHours: [{ speed: 3, dir: "↙" }, { speed: 2, dir: "↙" }, { speed: 3, dir: "←" }],
    tempHours: [90, 91, 90],
    humidity: 52,
    pressure: 1019,
    icons: ["↙", "←", "←", "💥", "P"],
    isClosed: false
  },
  {
    game: "COL @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 1.01,
    hr: 1.22,
    doubleTriple: 0.82,
    single: 0.95,
    receptive: "High",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 8, dir: "↗" }, { speed: 7, dir: "↗" }],
    tempHours: [84, 82, 82],
    humidity: 47,
    pressure: 1010,
    icons: ["↑", "↗", "↗", "〜", "☀️", "P"],
    isClosed: false
  },
  {
    game: "PIT @ CHW",
    venue: "Rate Field",
    time: "7:40",
    runs: 0.95,
    hr: 0.93,
    doubleTriple: 0.90,
    single: 1.02,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "→" }, { speed: 6, dir: "→" }, { speed: 6, dir: "→" }],
    tempHours: [70, 68, 68],
    humidity: 68,
    pressure: 1015,
    icons: ["→", "→", "→", "〜"],
    isClosed: false
  },
  {
    game: "TEX @ SEA",
    venue: "T-Mobile Park",
    time: "4:10",
    runs: 0.89,
    hr: 0.99,
    doubleTriple: 0.81,
    single: 0.93,
    receptive: "Medium",
    windHours: [{ speed: 3, dir: "↙" }, { speed: 2, dir: "↓" }, { speed: 2, dir: "↘" }],
    tempHours: [61, 61, 64],
    humidity: 77,
    pressure: 1017,
    icons: ["↙", "↓", "↘", "H"],
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
