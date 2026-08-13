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
    game: "CHC @ WAS",
    venue: "Nationals Park",
    time: "4:05",
    runs: 1.08,
    hr: 1.05,
    doubleTriple: 1.04,
    single: 1.08,
    receptive: "Med-High",
    windHours: [{ speed: 7, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 4, dir: "↘" }],
    tempHours: [93, 93, 90],
    humidity: 36,
    pressure: 1012,
    icons: ["↘", "↘", "↘", "〜", "💥"],
    isClosed: false
  },
  {
    game: "BOS @ TOR",
    venue: "Rogers Centre",
    time: "3:07",
    runs: 1.07,
    hr: 1.10,
    doubleTriple: 1.02,
    single: 1.05,
    receptive: "Minimal",
    windHours: [{ speed: 4, dir: "↘" }, { speed: 4, dir: "↓" }, { speed: 5, dir: "↓" }],
    tempHours: [86, 86, 86],
    humidity: 48,
    pressure: 1013,
    icons: ["↘", "↓", "↓", "☀️"],
    isClosed: false
  },
  {
    game: "CLE @ DET",
    venue: "Comerica Park",
    time: "1:10",
    runs: 1.04,
    hr: 0.97,
    doubleTriple: 1.05,
    single: 1.06,
    receptive: "High",
    windHours: [{ speed: 6, dir: "→" }, { speed: 4, dir: "↘" }, { speed: 4, dir: "↘" }],
    tempHours: [86, 90, 88],
    humidity: 62,
    pressure: 1015,
    icons: ["→", "→", "↘", "☀️"],
    isClosed: false
  },
  {
    game: "SEA @ NYY",
    venue: "Yankee Stadium",
    time: "1:35",
    runs: 1.01,
    hr: 1.22,
    doubleTriple: 0.84,
    single: 0.95,
    receptive: "High",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 11, dir: "↗" }, { speed: 12, dir: "↗" }],
    tempHours: [84, 86, 88],
    humidity: 56,
    pressure: 1010,
    icons: ["↗", "↗", "↗", "≈", "☀️", "P"],
    isClosed: false
  },
  {
    game: "MIL @ LAD",
    venue: "Dodger Stadium",
    time: "10:10",
    runs: 0.98,
    hr: 1.12,
    doubleTriple: 0.96,
    single: 0.94,
    receptive: "Consistent",
    windHours: [{ speed: 7, dir: "↗" }, { speed: 6, dir: "↗" }, { speed: 4, dir: "↑" }],
    tempHours: [73, 72, 70],
    humidity: 60,
    pressure: 1012,
    icons: ["↗", "↗", "↑", "〜"],
    isClosed: false
  },
  {
    game: "CIN @ CHW",
    venue: "Rate Field",
    time: "2:10",
    runs: 0.97,
    hr: 0.96,
    doubleTriple: 0.89,
    single: 1.04,
    receptive: "Med-High",
    windHours: [{ speed: 2, dir: "↘" }, { speed: 4, dir: "↘" }, { speed: 6, dir: "↘" }],
    tempHours: [75, 77, 77],
    humidity: 89,
    pressure: 1014,
    icons: ["↘", "↘", "↘", "H"],
    isClosed: false
  },
  {
    game: "PHI @ MIN",
    venue: "Field of Dreams",
    time: "7:30",
    runs: 0.97,
    hr: 0.90,
    doubleTriple: 0.87,
    single: 1.09,
    receptive: "High",
    windHours: [{ speed: 8, dir: "↙" }, { speed: 8, dir: "↙" }, { speed: 8, dir: "↓" }],
    tempHours: [72, 71, 70],
    humidity: 90,
    pressure: 1012,
    icons: ["↙", "↙", "↓", "〜", "H"],
    isClosed: false
  },
  {
    game: "TEX @ LAA",
    venue: "Angel Stadium",
    time: "10:07",
    runs: 0.97,
    hr: 0.93,
    doubleTriple: 0.93,
    single: 1.02,
    receptive: "Consistent",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 7, dir: "↑" }, { speed: 6, dir: "↑" }],
    tempHours: [72, 72, 70],
    humidity: 65,
    pressure: 1012,
    icons: ["↑", "↑", "↑", "〜"],
    isClosed: false
  },
  {
    game: "PIT @ MIA",
    venue: "LoanDepot Park",
    time: "1:10",
    runs: 0.95,
    hr: 0.87,
    doubleTriple: 1.01,
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
