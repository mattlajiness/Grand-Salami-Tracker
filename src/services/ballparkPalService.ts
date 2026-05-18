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
  { game: "MIL @ CHC", runs: 1.16, hr: 1.40, hits: 1.10, temp: 73, wind: "14mph OUT", condition: "Hum: 71% | Pres: 1010 | Extreme Receptivity" },
  { game: "BOS @ KC", runs: 1.15, hr: 1.35, hits: 1.05, temp: 77, wind: "20mph OUT", condition: "Hum: 77% | Pres: 1004 | High Carry" },
  { game: "CIN @ PHI", runs: 1.11, hr: 1.31, hits: 1.05, temp: 84, wind: "9mph OUT", condition: "Hum: 47% | Pres: 1020 | Very High" },
  { game: "NYM @ WAS", runs: 1.09, hr: 1.10, hits: 1.08, temp: 88, wind: "7mph OUT", condition: "Hum: 32% | Pres: 1018 | Med-High" },
  { game: "SF @ ARI", runs: 1.08, hr: 0.95, hits: 1.21, temp: 84, wind: "11mph OUT", condition: "Hum: 16% | Pres: 1005 | Medium" },
  { game: "TEX @ COL", runs: 1.06, hr: 0.92, hits: 1.09, temp: 36, wind: "3mph IN", condition: "Hum: 100% | Pres: 1018 | Low Density" },
  { game: "ATH @ LAA", runs: 1.03, hr: 1.03, hits: 1.04, temp: 68, wind: "9mph OUT", condition: "Hum: 56% | Pres: 1011 | Consistent" },
  { game: "HOU @ MIN", runs: 1.00, hr: 0.95, hits: 1.02, temp: 59, wind: "5mph OUT", condition: "Hum: 86% | Pres: 1007 | Medium" },
  { game: "CLE @ DET", runs: 0.99, hr: 0.96, hits: 1.07, temp: 82, wind: "14mph IN", condition: "Hum: 54% | Pres: 1013 | High Marine Edge" },
  { game: "ATL @ MIA", runs: 0.95, hr: 0.87, hits: 1.02, temp: 72, wind: "NONE", condition: "ROOF CLOSED" },
  { game: "BAL @ TB", runs: 0.94, hr: 0.97, hits: 0.92, temp: 72, wind: "NONE", condition: "ROOF CLOSED" },
  { game: "LAD @ SD", runs: 0.93, hr: 0.97, hits: 0.82, temp: 64, wind: "8mph OUT", condition: "Hum: 62% | Pres: 1011 | Low Carry" },
  { game: "TOR @ NYY", runs: 0.93, hr: 1.01, hits: 0.89, temp: 72, wind: "7mph IN", condition: "Hum: 62% | Pres: 1021 | High Density" },
  { game: "CHW @ SEA", runs: 0.79, hr: 0.85, hits: 0.90, temp: 59, wind: "7mph IN", condition: "Hum: 46% | Pres: 1020 | Medium Marine Layer" }
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
