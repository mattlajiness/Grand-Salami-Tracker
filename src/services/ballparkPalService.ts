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
    game: "COL @ WAS",
    venue: "Nationals Park",
    time: "1:05",
    runs: 1.14,
    hr: 1.18,
    doubleTriple: 1.10,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "↑" }, { speed: 8, dir: "↗" }, { speed: 9, dir: "↖" }],
    tempHours: [88, 90, 81],
    humidity: 48,
    pressure: 1014,
    icons: ["↑", "↗", "↖", "〜", "☀️"],
    isClosed: false
  },
  {
    game: "KC @ TOR",
    venue: "Rogers Centre",
    time: "7:07",
    runs: 1.05,
    hr: 1.14,
    doubleTriple: 1.05,
    single: 0.98,
    receptive: "Minimal",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 8, dir: "↘" }, { speed: 7, dir: "↘" }],
    tempHours: [72, 68, 66],
    humidity: 59,
    pressure: 1012,
    icons: ["↘", "↘", "↘", "〜"],
    isClosed: false
  },
  {
    game: "HOU @ NYY",
    venue: "Yankee Stadium",
    time: "7:05",
    runs: 1.03,
    hr: 1.19,
    doubleTriple: 0.99,
    single: 0.91,
    receptive: "High",
    windHours: [{ speed: 9, dir: "←" }, { speed: 10, dir: "←" }, { speed: 11, dir: "↖" }],
    tempHours: [77, 75, 75],
    humidity: 75,
    pressure: 1015,
    icons: ["←", "←", "↖", "≈", "☀️", "H"],
    isClosed: false
  },
  {
    game: "LAD @ ATL",
    venue: "Truist Park",
    time: "7:15",
    runs: 1.01,
    hr: 1.02,
    doubleTriple: 0.97,
    single: 1.03,
    receptive: "Medium",
    windHours: [{ speed: 1, dir: "→" }, { speed: 1, dir: "↙" }, { speed: 1, dir: "↙" }],
    tempHours: [86, 84, 82],
    humidity: 44,
    pressure: 1013,
    icons: ["→", "↙", "↙", "☀️"],
    isClosed: false
  },
  {
    game: "ARI @ SF",
    venue: "Oracle Park",
    time: "9:45",
    runs: 1.01,
    hr: 0.83,
    doubleTriple: 1.15,
    single: 1.06,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 14, dir: "↗" }, { speed: 8, dir: "↗" }],
    tempHours: [66, 64, 64],
    humidity: 66,
    pressure: 1013,
    icons: ["↑", "↗", "↗", "≈"],
    isClosed: false
  },
  {
    game: "MIL @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.98,
    hr: 1.13,
    doubleTriple: 0.90,
    single: 0.90,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 10, dir: "↑" }, { speed: 11, dir: "↑" }],
    tempHours: [77, 75, 75],
    humidity: 75,
    pressure: 1015,
    icons: ["↑", "↑", "↑", "≈", "☀️", "H"],
    isClosed: false
  },
  {
    game: "BAL @ STL",
    venue: "Busch Stadium",
    time: "2:15",
    runs: 0.91,
    hr: 0.83,
    doubleTriple: 0.94,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 7, dir: "↘" }],
    tempHours: [86, 88, 88],
    humidity: 34,
    pressure: 1016,
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
