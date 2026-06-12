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
    game: "COL @ ATH",
    venue: "Las Vegas Ballpark",
    time: "10:05",
    runs: 1.60,
    hr: 2.10,
    doubleTriple: 1.22,
    single: 1.09,
    receptive: "High",
    windHours: [{ speed: 15, dir: "↑" }, { speed: 13, dir: "↑" }, { speed: 12, dir: "↑" }],
    tempHours: [97, 91, 90],
    humidity: 10,
    pressure: 1003,
    icons: ["↑", "↑", "↑", "≈", "🔴", "H", "P"],
    isClosed: false
  },
  {
    game: "SD @ BAL",
    venue: "Oriole Park",
    time: "7:05",
    runs: 1.11,
    hr: 1.11,
    doubleTriple: 1.09,
    single: 1.05,
    receptive: "Med-High",
    windHours: [{ speed: 5, dir: "↘" }, { speed: 2, dir: "↑" }, { speed: 4, dir: "↗" }],
    tempHours: [84, 81, 77],
    humidity: 66,
    pressure: 1007,
    icons: ["↘", "↑", "↗", "☀️", "P"],
    isClosed: false
  },
  {
    game: "ARI @ CIN",
    venue: "Great American BP",
    time: "7:15",
    runs: 1.08,
    hr: 1.16,
    doubleTriple: 1.03,
    single: 0.96,
    receptive: "Low",
    windHours: [{ speed: 6, dir: "↑" }, { speed: 4, dir: "↑" }, { speed: 4, dir: "↑" }],
    tempHours: [75, 72, 68],
    humidity: 58,
    pressure: 1014,
    icons: ["↑", "↑", "↑"],
    isClosed: false
  },
  {
    game: "LAD @ CHW",
    venue: "Rate Field",
    time: "7:40",
    runs: 1.08,
    hr: 1.15,
    doubleTriple: 1.04,
    single: 0.99,
    receptive: "Med-High",
    windHours: [{ speed: 12, dir: "↖" }, { speed: 11, dir: "↖" }, { speed: 9, dir: "↖" }],
    tempHours: [77, 75, 73],
    humidity: 46,
    pressure: 1012,
    icons: ["↖", "↖", "↖", "≈", "☀️"],
    isClosed: false
  },
  {
    game: "TEX @ BOS",
    venue: "Fenway Park",
    time: "7:10",
    runs: 1.08,
    hr: 0.95,
    doubleTriple: 1.17,
    single: 1.06,
    receptive: "High",
    windHours: [{ speed: 5, dir: "↓" }, { speed: 3, dir: "↓" }, { speed: 2, dir: "↓" }],
    tempHours: [75, 73, 72],
    humidity: 81,
    pressure: 1003,
    icons: ["↓", "↓", "↓", "H", "P"],
    isClosed: false
  },
  {
    game: "MIA @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 1.07,
    hr: 0.97,
    doubleTriple: 1.18,
    single: 0.99,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [77, 73, 70],
    humidity: 56,
    pressure: 1012,
    icons: ["↑", "↑", "↑", "~", "☀️"],
    isClosed: false
  },
  {
    game: "STL @ MIN",
    venue: "Target Field",
    time: "8:10",
    runs: 1.04,
    hr: 1.01,
    doubleTriple: 1.01,
    single: 1.03,
    receptive: "Medium",
    windHours: [{ speed: 11, dir: "↑" }, { speed: 6, dir: "↑" }, { speed: 9, dir: "↑" }],
    tempHours: [73, 70, 66],
    humidity: 56,
    pressure: 1008,
    icons: ["↑", "↑", "↑", "~", "P"],
    isClosed: false
  },
  {
    game: "HOU @ KC",
    venue: "Kauffman Stadium",
    time: "8:10",
    runs: 1.04,
    hr: 1.15,
    doubleTriple: 1.03,
    single: 0.97,
    receptive: "High",
    windHours: [{ speed: 7, dir: "↖" }, { speed: 6, dir: "←" }, { speed: 6, dir: "←" }],
    tempHours: [75, 72, 68],
    humidity: 67,
    pressure: 1013,
    icons: ["↖", "←", "←", "~"],
    isClosed: false
  },
  {
    game: "PHI @ MIL",
    venue: "American Family Fld",
    time: "7:40",
    runs: 1.03,
    hr: 1.26,
    doubleTriple: 0.93,
    single: 0.89,
    receptive: "Low",
    windHours: [{ speed: 12, dir: "↖" }, { speed: 11, dir: "↖" }, { speed: 9, dir: "↖" }],
    tempHours: [72, 70, 68],
    humidity: 66,
    pressure: 1011,
    icons: ["↖", "↖", "↖", "≈"],
    isClosed: false
  },
  {
    game: "DET @ CLE",
    venue: "Progressive Field",
    time: "7:10",
    runs: 1.02,
    hr: 1.12,
    doubleTriple: 0.94,
    single: 0.98,
    receptive: "High",
    windHours: [{ speed: 11, dir: "→" }, { speed: 11, dir: "→" }, { speed: 11, dir: "→" }],
    tempHours: [72, 70, 70],
    humidity: 63,
    pressure: 1012,
    icons: ["→", "→", "→", "≈"],
    isClosed: false
  },
  {
    game: "SEA @ WAS",
    venue: "Nationals Park",
    time: "6:45",
    runs: 1.02,
    hr: 1.14,
    doubleTriple: 0.99,
    single: 0.99,
    receptive: "Med-High",
    windHours: [{ speed: 4, dir: "→" }, { speed: 7, dir: "↘" }, { speed: 4, dir: "↗" }],
    tempHours: [88, 82, 79],
    humidity: 65,
    pressure: 1006,
    icons: ["→", "↘", "↗", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "TB @ LAA",
    venue: "Angel Stadium",
    time: "9:38",
    runs: 1.02,
    hr: 1.11,
    doubleTriple: 0.91,
    single: 1.02,
    receptive: "Consistent",
    windHours: [{ speed: 11, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 8, dir: "↑" }],
    tempHours: [79, 77, 75],
    humidity: 49,
    pressure: 1010,
    icons: ["↑", "↑", "↑", "~", "☀️", "P"],
    isClosed: false
  },
  {
    game: "NYY @ TOR",
    venue: "Rogers Centre",
    time: "7:37",
    runs: 1.02,
    hr: 1.12,
    doubleTriple: 1.00,
    single: 0.98,
    receptive: "Minimal",
    windHours: [{ speed: 11, dir: "↘" }, { speed: 8, dir: "↘" }, { speed: 6, dir: "↘" }],
    tempHours: [72, 70, 68],
    humidity: 58,
    pressure: 1010,
    icons: ["↘", "↘", "↘", "~", "P"],
    isClosed: false
  },
  {
    game: "CHC @ SF",
    venue: "Oracle Park",
    time: "10:15",
    runs: 0.96,
    hr: 0.83,
    doubleTriple: 1.06,
    single: 1.05,
    receptive: "Consistent",
    windHours: [{ speed: 11, dir: "↑" }, { speed: 9, dir: "↑" }, { speed: 7, dir: "↑" }],
    tempHours: [61, 61, 59],
    humidity: 76,
    pressure: 1010,
    icons: ["↑", "↑", "↑", "~", "H", "P"],
    isClosed: false
  },
  {
    game: "ATL @ NYM",
    venue: "Citi Field",
    time: "7:15",
    runs: 0.95,
    hr: 1.07,
    doubleTriple: 0.76,
    single: 0.98,
    receptive: "Low",
    windHours: [{ speed: 14, dir: "→" }, { speed: 12, dir: "→" }, { speed: 11, dir: "→" }],
    tempHours: [90, 88, 86],
    humidity: 47,
    pressure: 1004,
    icons: ["→", "→", "→", "≈", "🔴", "P"],
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
