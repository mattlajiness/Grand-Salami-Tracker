import { format } from 'date-fns';

/**
 * Ballpark Pal Service - Manual Mode
 * Manual updates for daily park factors
 */

export interface BallparkPalFactor {
  game: string; // e.g. "TB @ CLE"
  runs: number;
  hr: number;
  hits: number;
  temp?: number;
  wind?: string;
  condition?: string;
  edge?: number;
}

// MANUALLY UPDATE THESE VALUES DAILY FROM BALLPARKPAL.COM
const MANUAL_FACTORS: BallparkPalFactor[] = [
  { game: "TEX @ COL", runs: 1.14, hr: 0.92, hits: 1.11, temp: 46, wind: "6mph IN", condition: "Hum: 69% | Pres: 1020 | Low Carry" },
  { game: "CIN @ PHI", runs: 1.12, hr: 1.37, hits: 0.97, temp: 88, wind: "8mph OUT", condition: "Hum: 39% | Pres: 1017 | Very High Carry" },
  { game: "NYM @ WAS", runs: 1.07, hr: 1.05, hits: 1.07, temp: 88, wind: "5mph OUT", condition: "Hum: 26% | Pres: 1017 | Med-High" },
  { game: "TOR @ NYY", runs: 1.04, hr: 1.18, hits: 0.97, temp: 86, wind: "12mph OUT", condition: "Hum: 42% | Pres: 1015 | High Carry" },
  { game: "SF @ ARI", runs: 1.03, hr: 0.93, hits: 0.98, temp: 86, wind: "9mph OUT", condition: "Hum: 8% | Pres: 1009 | Medium Carry" },
  { game: "ATH @ LAA", runs: 1.01, hr: 1.05, hits: 1.02, temp: 73, wind: "8mph OUT", condition: "Hum: 38% | Pres: 1012 | Consistent" },
  { game: "CLE @ DET", runs: 0.99, hr: 0.98, hits: 1.05, temp: 80, wind: "12mph IN", condition: "Hum: 72% | Pres: 1012 | High Density" },
  { game: "ATL @ MIA", runs: 0.94, hr: 0.85, hits: 0.98, temp: 72, wind: "NONE", condition: "ROOF CLOSED" },
  { game: "BAL @ TB", runs: 0.94, hr: 0.97, hits: 0.92, temp: 72, wind: "NONE", condition: "ROOF CLOSED" },
  { game: "LAD @ SD", runs: 0.90, hr: 0.94, hits: 0.91, temp: 68, wind: "7mph OUT", condition: "Hum: 59% | Pres: 1013 | Low Carry" },
  { game: "HOU @ MIN", runs: 0.89, hr: 0.75, hits: 0.97, temp: 48, wind: "11mph OUT", condition: "Hum: 57% | Pres: 1021 | Medium Carry" },
  { game: "MIL @ CHC", runs: 0.89, hr: 0.94, hits: 0.98, temp: 61, wind: "8mph OUT", condition: "Hum: 76% | Pres: 1016 | Extreme Air Edge" },
  { game: "PIT @ STL", runs: 0.87, hr: 0.80, hits: 1.07, temp: 67, wind: "9mph OUT", condition: "Hum: 89% | Pres: 1017 | Med-High Density" },
  { game: "CHW @ SEA", runs: 0.85, hr: 0.90, hits: 0.92, temp: 56, wind: "2mph IN", condition: "Hum: 69% | Pres: 1021 | Medium Carry" },
  { game: "BOS @ KC", runs: 0.84, hr: 0.79, hits: 0.90, temp: 59, wind: "9mph IN", condition: "Hum: 66% | Pres: 1020 | High Density" }
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
