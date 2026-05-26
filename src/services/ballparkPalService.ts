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
    game: "SEA @ ATH",
    venue: "Sutter Health Park",
    time: "9:40",
    runs: 1.17,
    hr: 1.21,
    doubleTriple: 1.13,
    single: 1.04,
    receptive: "Very High",
    windHours: [{ speed: 0, dir: "↗" }, { speed: 4, dir: "↗" }, { speed: 6, dir: "↖" }],
    tempHours: [72, 70, 66],
    humidity: 27,
    pressure: 1006,
    icons: ["↗", "↗", "↖", "P"],
    isClosed: false
  },
  {
    game: "ATL @ BOS",
    venue: "Fenway Park",
    time: "6:45",
    runs: 1.16,
    hr: 1.02,
    doubleTriple: 1.28,
    single: 1.07,
    receptive: "High",
    windHours: [{ speed: 11, dir: "↖" }, { speed: 11, dir: "↖" }, { speed: 9, dir: "↖" }],
    tempHours: [75, 70, 68],
    humidity: 53,
    pressure: 1014,
    icons: ["↖", "↖", "↖", "≈"],
    isClosed: false
  },
  {
    game: "MIA @ TOR",
    venue: "Rogers Centre",
    time: "7:07",
    runs: 1.08,
    hr: 1.18,
    doubleTriple: 1.04,
    single: 0.99,
    receptive: "Minimal",
    windHours: [{ speed: 9, dir: "↘" }, { speed: 8, dir: "↘" }, { speed: 8, dir: "↗" }],
    tempHours: [73, 70, 68],
    humidity: 60,
    pressure: 1013,
    icons: ["↘", "↘", "↗", "~"],
    isClosed: false
  },
  {
    game: "TB @ BAL",
    venue: "Oriole Park",
    time: "6:35",
    runs: 1.06,
    hr: 1.08,
    doubleTriple: 1.02,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "↖" }, { speed: 4, dir: "↖" }, { speed: 4, dir: "↖" }],
    tempHours: [73, 70, 68],
    humidity: 85,
    pressure: 1017,
    icons: ["↖", "↖", "↖", "H"],
    isClosed: false
  },
  {
    game: "MIN @ CHW",
    venue: "Rate Field",
    time: "7:40",
    runs: 1.04,
    hr: 1.01,
    doubleTriple: 0.96,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "←" }, { speed: 6, dir: "←" }, { speed: 4, dir: "←" }],
    tempHours: [79, 77, 75],
    humidity: 42,
    pressure: 1014,
    icons: ["←", "←", "←", "~", "☀️"],
    isClosed: false
  },
  {
    game: "STL @ MIL",
    venue: "American Family Fld",
    time: "7:40",
    runs: 1.03,
    hr: 1.27,
    doubleTriple: 0.93,
    single: 0.89,
    receptive: "Low",
    windHours: [{ speed: 7, dir: "↖" }, { speed: 6, dir: "↖" }, { speed: 4, dir: "↖" }],
    tempHours: [79, 75, 72],
    humidity: 57,
    pressure: 1014,
    icons: ["↖", "↖", "↖", "~", "☀️"],
    isClosed: false
  },
  {
    game: "NYY @ KC",
    venue: "Kauffman Stadium",
    time: "7:40",
    runs: 1.02,
    hr: 1.17,
    doubleTriple: 1.00,
    single: 0.96,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↙" }, { speed: 6, dir: "↙" }, { speed: 6, dir: "↙" }],
    tempHours: [79, 75, 72],
    humidity: 66,
    pressure: 1012,
    icons: ["↙", "↙", "↙", "~", "☀️"],
    isClosed: false
  },
  {
    game: "CHC @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 1.02,
    hr: 0.90,
    doubleTriple: 1.16,
    single: 0.98,
    receptive: "Med-High",
    windHours: [{ speed: 2, dir: "↗" }, { speed: 2, dir: "↗" }, { speed: 3, dir: "↗" }],
    tempHours: [79, 75, 70],
    humidity: 61,
    pressure: 1015,
    icons: ["↗", "↗", "↗", "☀️"],
    isClosed: false
  },
  {
    game: "LAA @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 0.98,
    hr: 0.86,
    doubleTriple: 0.99,
    single: 1.08,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↙" }, { speed: 6, dir: "↙" }, { speed: 5, dir: "↙" }],
    tempHours: [79, 77, 73],
    humidity: 39,
    pressure: 1015,
    icons: ["↙", "↙", "↙", "~", "☀️"],
    isClosed: false
  },
  {
    game: "ARI @ SF",
    venue: "Oracle Park",
    time: "9:45",
    runs: 0.97,
    hr: 0.84,
    doubleTriple: 1.06,
    single: 1.05,
    receptive: "Consistent",
    windHours: [{ speed: 20, dir: "↗" }, { speed: 20, dir: "↗" }, { speed: 18, dir: "↗" }],
    tempHours: [57, 57, 55],
    humidity: 68,
    pressure: 1009,
    icons: ["↗", "↗", "↗", "≈", "P"],
    isClosed: false
  },
  {
    game: "COL @ LAD",
    venue: "Dodger Stadium",
    time: "10:10",
    runs: 0.96,
    hr: 1.12,
    doubleTriple: 0.88,
    single: 0.97,
    receptive: "Consistent",
    windHours: [{ speed: 11, dir: "↗" }, { speed: 9, dir: "↗" }, { speed: 8, dir: "↗" }],
    tempHours: [64, 63, 61],
    humidity: 53,
    pressure: 1008,
    icons: ["↗", "↗", "↗", "~", "P"],
    isClosed: false
  },
  {
    game: "CIN @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.93,
    hr: 1.00,
    doubleTriple: 0.84,
    single: 0.95,
    receptive: "Low",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 8, dir: "↗" }, { speed: 7, dir: "↗" }],
    tempHours: [72, 68, 66],
    humidity: 62,
    pressure: 1016,
    icons: ["↗", "↗", "↗", "~"],
    isClosed: false
  },
  {
    game: "HOU @ TEX",
    venue: "Globe Life Field",
    time: "8:05",
    runs: 0.93,
    hr: 0.89,
    doubleTriple: 0.93,
    single: 0.99,
    receptive: "Roof Closed",
    windHours: [],
    tempHours: [],
    humidity: 0,
    pressure: 0,
    icons: ["🏟️"],
    isClosed: true
  },
  {
    game: "WAS @ CLE",
    venue: "Progressive Field",
    time: "6:10",
    runs: 0.92,
    hr: 0.92,
    doubleTriple: 0.93,
    single: 0.96,
    receptive: "High",
    windHours: [{ speed: 2, dir: "↘" }, { speed: 2, dir: "↘" }, { speed: 1, dir: "↗" }],
    tempHours: [66, 64, 64],
    humidity: 60,
    pressure: 1016,
    icons: ["↘", "↘", "↗"],
    isClosed: false
  },
  {
    game: "PHI @ SD",
    venue: "Petco Park",
    time: "9:40",
    runs: 0.91,
    hr: 0.91,
    doubleTriple: 0.86,
    single: 0.98,
    receptive: "Low",
    windHours: [{ speed: 12, dir: "→" }, { speed: 11, dir: "↘" }, { speed: 12, dir: "↘" }],
    tempHours: [64, 64, 63],
    humidity: 63,
    pressure: 1010,
    icons: ["→", "↘", "↘", "≈", "P"],
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
