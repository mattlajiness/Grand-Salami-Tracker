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
    game: "WAS @ BAL",
    venue: "Oriole Park",
    time: "1:35",
    runs: 1.04,
    hr: 1.05,
    doubleTriple: 1.05,
    single: 1.02,
    receptive: "Med-High",
    windHours: [{ speed: 3, dir: "↖" }, { speed: 2, dir: "↖" }, { speed: 3, dir: "←" }],
    tempHours: [75, 79, 81],
    humidity: 86,
    pressure: 1015,
    icons: ["↖", "↖", "←", "H"],
    isClosed: false
  },
  {
    game: "CIN @ PIT",
    venue: "PNC Park",
    time: "1:35",
    runs: 1.01,
    hr: 0.87,
    doubleTriple: 1.17,
    single: 0.98,
    receptive: "Med-High",
    windHours: [{ speed: 2, dir: "↓" }, { speed: 2, dir: "↓" }, { speed: 2, dir: "↓" }],
    tempHours: [81, 81, 82],
    humidity: 77,
    pressure: 1015,
    icons: ["↓", "↓", "↓", "☀️", "H"],
    isClosed: false
  },
  {
    game: "NYY @ BOS",
    venue: "Fenway Park",
    time: "7:20",
    runs: 1.02,
    hr: 0.94,
    doubleTriple: 1.06,
    single: 1.05,
    receptive: "High",
    windHours: [{ speed: 4, dir: "←" }, { speed: 4, dir: "←" }, { speed: 3, dir: "←" }],
    tempHours: [70, 66, 64],
    humidity: 77,
    pressure: 1015,
    icons: ["←", "←", "←", "H"],
    isClosed: false
  },
  {
    game: "COL @ MIN",
    venue: "Target Field",
    time: "2:10",
    runs: 1.09,
    hr: 1.02,
    doubleTriple: 1.06,
    single: 1.06,
    receptive: "Medium",
    windHours: [{ speed: 15, dir: "↙" }, { speed: 14, dir: "↙" }, { speed: 13, dir: "↙" }],
    tempHours: [73, 77, 81],
    humidity: 84,
    pressure: 1006,
    icons: ["↙", "↙", "↙", "≈", "H", "P"],
    isClosed: false
  },
  {
    game: "HOU @ DET",
    venue: "Comerica Park",
    time: "1:40",
    runs: 1.05,
    hr: 0.96,
    doubleTriple: 1.11,
    single: 1.05,
    receptive: "High",
    windHours: [{ speed: 8, dir: "↘" }, { speed: 7, dir: "↘" }, { speed: 7, dir: "↘" }],
    tempHours: [86, 88, 86],
    humidity: 51,
    pressure: 1016,
    icons: ["↘", "↘", "↘", "~", "☀️"],
    isClosed: false
  },
  {
    game: "ATL @ SF",
    venue: "Oracle Park",
    time: "4:05",
    runs: 1.08,
    hr: 0.91,
    doubleTriple: 1.22,
    single: 1.08,
    receptive: "Consistent",
    windHours: [{ speed: 11, dir: "↑" }, { speed: 12, dir: "↗" }, { speed: 13, dir: "↗" }],
    tempHours: [73, 79, 64],
    humidity: 43,
    pressure: 1014,
    icons: ["↑", "↗", "↗", "≈"],
    isClosed: false
  },
  {
    game: "KC @ CHW",
    venue: "Rate Field",
    time: "2:10",
    runs: 1.03,
    hr: 1.12,
    doubleTriple: 0.98,
    single: 0.98,
    receptive: "Med-High",
    windHours: [{ speed: 11, dir: "↘" }, { speed: 12, dir: "↓" }, { speed: 10, dir: "↓" }],
    tempHours: [82, 82, 82],
    humidity: 76,
    pressure: 1013,
    icons: ["↘", "↓", "↓", "~", "☀️", "H"],
    isClosed: false
  },
  {
    game: "ATH @ LAA",
    venue: "Angel Stadium",
    time: "3:15",
    runs: 1.01,
    hr: 1.04,
    doubleTriple: 0.96,
    single: 1.01,
    receptive: "Consistent",
    windHours: [{ speed: 12, dir: "↖" }, { speed: 12, dir: "↖" }, { speed: 12, dir: "↖" }],
    tempHours: [68, 68, 70],
    humidity: 69,
    pressure: 1012,
    icons: ["↖", "↖", "↖", "≈"],
    isClosed: false
  },
  {
    game: "TEX @ TOR",
    venue: "Rogers Centre",
    time: "1:37",
    runs: 1.03,
    hr: 1.14,
    doubleTriple: 0.99,
    single: 0.98,
    receptive: "Minimal",
    windHours: [{ speed: 9, dir: "↖" }, { speed: 9, dir: "↖" }, { speed: 8, dir: "↖" }],
    tempHours: [84, 84, 86],
    humidity: 56,
    pressure: 1017,
    icons: ["↖", "↖", "↖", "~", "☀️"],
    isClosed: true
  },
  {
    game: "PHI @ NYM",
    venue: "Citi Field",
    time: "1:40",
    runs: 0.96,
    hr: 1.06,
    doubleTriple: 0.87,
    single: 0.93,
    receptive: "Low",
    windHours: [{ speed: 4, dir: "↙" }, { speed: 6, dir: "↖" }, { speed: 8, dir: "↖" }],
    tempHours: [84, 82, 84],
    humidity: 55,
    pressure: 1014,
    icons: ["↙", "↖", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "MIA @ STL",
    venue: "Busch Stadium",
    time: "2:15",
    runs: 1.00,
    hr: 1.08,
    doubleTriple: 1.02,
    single: 0.99,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↖" }, { speed: 9, dir: "↖" }, { speed: 9, dir: "↖" }],
    tempHours: [95, 97, 93],
    humidity: 64,
    pressure: 1011,
    icons: ["↖", "↖", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "SEA @ CLE",
    venue: "Progressive Field",
    time: "1:40",
    runs: 1.03,
    hr: 1.00,
    doubleTriple: 1.06,
    single: 0.98,
    receptive: "High",
    windHours: [{ speed: 6, dir: "↙" }, { speed: 8, dir: "↓" }, { speed: 9, dir: "↓" }],
    tempHours: [81, 79, 79],
    humidity: 75,
    pressure: 1015,
    icons: ["↙", "↓", "↓", "~", "☀️", "H"],
    isClosed: false
  },
  {
    game: "ARI @ TB",
    venue: "Tropicana Field",
    time: "1:40",
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
    game: "LAD @ SD",
    venue: "Petco Park",
    time: "4:10",
    runs: 0.91,
    hr: 0.98,
    doubleTriple: 0.80,
    single: 0.96,
    receptive: "Low",
    windHours: [{ speed: 10, dir: "↗" }, { speed: 11, dir: "↗" }, { speed: 11, dir: "↗" }],
    tempHours: [68, 68, 68],
    humidity: 72,
    pressure: 1013,
    icons: ["↗", "↗", "↗", "≈"],
    isClosed: false
  },
  {
    game: "CHC @ MIL",
    venue: "American Family Fld",
    time: "2:10",
    runs: 0.96,
    hr: 1.10,
    doubleTriple: 0.94,
    single: 0.88,
    receptive: "Low",
    windHours: [{ speed: 13, dir: "↓" }, { speed: 13, dir: "↓" }, { speed: 13, dir: "↓" }],
    tempHours: [84, 84, 84],
    humidity: 60,
    pressure: 1014,
    icons: ["↓", "↓", "↓", "≈", "☀️"],
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
