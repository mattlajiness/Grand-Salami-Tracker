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
    game: "MIN @ CHW",
    venue: "Rate Field",
    time: "2:10",
    runs: 0.99,
    hr: 0.97,
    doubleTriple: 0.86,
    single: 1.07,
    receptive: "Med-High",
    windHours: [{ speed: 12, dir: "↗" }, { speed: 12, dir: "↗" }, { speed: 12, dir: "↗" }],
    tempHours: [64, 64, 64],
    humidity: 57,
    pressure: 1022,
    icons: ["↗", "↗", "↗", "≈", "P"],
    isClosed: false
  },
  {
    game: "CHC @ PIT",
    venue: "PNC Park",
    time: "6:40",
    runs: 0.97,
    hr: 0.82,
    doubleTriple: 1.07,
    single: 1.02,
    receptive: "Med-High",
    windHours: [{ speed: 9, dir: "↗" }, { speed: 9, dir: "↗" }, { speed: 7, dir: "↗" }],
    tempHours: [66, 63, 59],
    humidity: 52,
    pressure: 1018,
    icons: ["↗", "↗", "↗", "~"],
    isClosed: false
  },
  {
    game: "ATL @ BOS",
    venue: "Fenway Park",
    time: "4:10",
    runs: 0.96,
    hr: 0.82,
    doubleTriple: 1.11,
    single: 1.02,
    receptive: "High",
    windHours: [{ speed: 6, dir: "↘" }, { speed: 8, dir: "↘" }, { speed: 7, dir: "↓" }],
    tempHours: [61, 61, 59],
    humidity: 74,
    pressure: 1009,
    icons: ["↘", "↘", "↓", "~", "P"],
    isClosed: false
  },
  {
    game: "LAA @ DET",
    venue: "Comerica Park",
    time: "1:10",
    runs: 0.95,
    hr: 0.87,
    doubleTriple: 0.97,
    single: 1.06,
    receptive: "High",
    windHours: [{ speed: 12, dir: "↗" }, { speed: 12, dir: "↗" }, { speed: 12, dir: "↗" }],
    tempHours: [64, 66, 66],
    humidity: 46,
    pressure: 1022,
    icons: ["↗", "↗", "↗", "≈", "P"],
    isClosed: false
  },
  {
    game: "TOR @ BAL",
    venue: "Oriole Park",
    time: "6:35",
    runs: 0.94,
    hr: 0.78,
    doubleTriple: 1.06,
    single: 1.03,
    receptive: "Med-High",
    windHours: [{ speed: 14, dir: "↘" }, { speed: 14, dir: "↘" }, { speed: 12, dir: "↘" }],
    tempHours: [70, 66, 64],
    humidity: 52,
    pressure: 1014,
    icons: ["↘", "↘", "↘", "≈"],
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
