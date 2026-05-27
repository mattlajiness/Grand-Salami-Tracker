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
    time: "3:05",
    runs: 1.16,
    hr: 1.24,
    doubleTriple: 1.07,
    single: 1.04,
    receptive: "Very High",
    windHours: [{ speed: 3, dir: "↑" }, { speed: 3, dir: "↗" }, { speed: 3, dir: "↗" }],
    tempHours: [70, 72, 73],
    humidity: 40,
    pressure: 1008,
    icons: ["↑", "↑", "↗", "P"],
    isClosed: false
  },
  {
    game: "ATL @ BOS",
    venue: "Fenway Park",
    time: "6:45",
    runs: 1.11,
    hr: 0.92,
    doubleTriple: 1.28,
    single: 1.06,
    receptive: "High",
    windHours: [{ speed: 4, dir: "↘" }, { speed: 4, dir: "↓" }, { speed: 5, dir: "↓" }],
    tempHours: [79, 73, 72],
    humidity: 50,
    pressure: 1006,
    icons: ["↘", "↘", "↓", "☀️", "P"],
    isClosed: false
  },
  {
    game: "LAA @ DET",
    venue: "Comerica Park",
    time: "6:40",
    runs: 1.05,
    hr: 0.93,
    doubleTriple: 1.09,
    single: 1.07,
    receptive: "High",
    windHours: [{ speed: 4, dir: "↘" }, { speed: 6, dir: "→" }, { speed: 7, dir: "↗" }],
    tempHours: [75, 72, 68],
    humidity: 70,
    pressure: 1013,
    icons: ["↘", "→", "↗", "~"],
    isClosed: false
  },
  {
    game: "ARI @ SF",
    venue: "Oracle Park",
    time: "3:45",
    runs: 1.03,
    hr: 0.90,
    doubleTriple: 1.15,
    single: 1.06,
    receptive: "Consistent",
    windHours: [{ speed: 6, dir: "↑" }, { speed: 7, dir: "↑" }, { speed: 11, dir: "↑" }],
    tempHours: [68, 70, 64],
    humidity: 55,
    pressure: 1009,
    icons: ["↑", "↑", "↑", "~", "P"],
    isClosed: false
  },
  {
    game: "NYY @ KC",
    venue: "Kauffman Stadium",
    time: "7:40",
    runs: 1.01,
    hr: 1.14,
    doubleTriple: 1.00,
    single: 0.96,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↙" }, { speed: 6, dir: "↙" }, { speed: 6, dir: "↙" }],
    tempHours: [81, 77, 73],
    humidity: 59,
    pressure: 1013,
    icons: ["↙", "↙", "↙", "~", "☀️"],
    isClosed: false
  },
  {
    game: "MIA @ TOR",
    venue: "Rogers Centre",
    time: "1:07",
    runs: 1.00,
    hr: 1.08,
    doubleTriple: 1.06,
    single: 0.95,
    receptive: "Minimal",
    windHours: [{ speed: 4, dir: "↖" }, { speed: 3, dir: "↖" }, { speed: 2, dir: "↙" }],
    tempHours: [75, 75, 77],
    humidity: 61,
    pressure: 1014,
    icons: ["↖", "↖", "↙"],
    isClosed: false
  },
  {
    game: "WAS @ CLE",
    venue: "Progressive Field",
    time: "1:10",
    runs: 0.99,
    hr: 1.04,
    doubleTriple: 0.96,
    single: 0.96,
    receptive: "High",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 5, dir: "↘" }, { speed: 6, dir: "↘" }],
    tempHours: [75, 75, 77],
    humidity: 75,
    pressure: 1014,
    icons: ["↘", "↘", "↘", "~", "H"],
    isClosed: false
  },
  {
    game: "STL @ MIL",
    venue: "American Family Fld",
    time: "1:40",
    runs: 0.97,
    hr: 1.08,
    doubleTriple: 0.94,
    single: 0.90,
    receptive: "Low",
    windHours: [{ speed: 5, dir: "↘" }, { speed: 5, dir: "↘" }, { speed: 6, dir: "↘" }],
    tempHours: [84, 86, 86],
    humidity: 45,
    pressure: 1016,
    icons: ["↘", "↘", "↘", "~", "☀️"],
    isClosed: false
  },
  {
    game: "CIN @ NYM",
    venue: "Citi Field",
    time: "7:10",
    runs: 0.97,
    hr: 1.09,
    doubleTriple: 0.81,
    single: 0.97,
    receptive: "Low",
    windHours: [{ speed: 10, dir: "↗" }, { speed: 9, dir: "↗" }, { speed: 7, dir: "↗" }],
    tempHours: [79, 75, 73],
    humidity: 59,
    pressure: 1008,
    icons: ["↗", "↗", "↗", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "MIN @ CHW",
    venue: "Rate Field",
    time: "7:40",
    runs: 0.97,
    hr: 0.96,
    doubleTriple: 0.93,
    single: 1.01,
    receptive: "Med-High",
    windHours: [{ speed: 6, dir: "→" }, { speed: 6, dir: "→" }, { speed: 6, dir: "→" }],
    tempHours: [66, 64, 63],
    humidity: 70,
    pressure: 1015,
    icons: ["→", "→", "→", "~"],
    isClosed: false
  },
  {
    game: "COL @ LAD",
    venue: "Dodger Stadium",
    time: "10:10",
    runs: 0.96,
    hr: 1.10,
    doubleTriple: 0.90,
    single: 0.97,
    receptive: "Consistent",
    windHours: [{ speed: 10, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }],
    tempHours: [63, 61, 61],
    humidity: 57,
    pressure: 1010,
    icons: ["↑", "↑", "↑", "~", "P"],
    isClosed: false
  },
  {
    game: "CHC @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 0.96,
    hr: 0.85,
    doubleTriple: 1.10,
    single: 0.96,
    receptive: "Med-High",
    windHours: [{ speed: 3, dir: "↑" }, { speed: 3, dir: "↑" }, { speed: 1, dir: "↑" }],
    tempHours: [66, 63, 61],
    humidity: 98,
    pressure: 1013,
    icons: ["↑", "↑", "↑", "H"],
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
    game: "TB @ BAL",
    venue: "Oriole Park",
    time: "6:35",
    runs: 0.92,
    hr: 0.81,
    doubleTriple: 1.05,
    single: 1.00,
    receptive: "Med-High",
    windHours: [{ speed: 1, dir: "↘" }, { speed: 9, dir: "↘" }, { speed: 6, dir: "↘" }],
    tempHours: [72, 68, 66],
    humidity: 92,
    pressure: 1011,
    icons: ["↘", "↘", "↘", "~", "H"],
    isClosed: false
  },
  {
    game: "PHI @ SD",
    venue: "Petco Park",
    time: "4:10",
    runs: 0.92,
    hr: 0.92,
    doubleTriple: 0.87,
    single: 0.98,
    receptive: "Low",
    windHours: [{ speed: 12, dir: "↗" }, { speed: 13, dir: "↗" }, { speed: 11, dir: "↗" }],
    tempHours: [66, 66, 64],
    humidity: 46,
    pressure: 1012,
    icons: ["↗", "↗", "↗", "≈"],
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
