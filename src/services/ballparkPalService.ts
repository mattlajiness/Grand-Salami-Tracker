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
  { game: "ARI @ COL", runs: 1.32, hr: 1.13, hits: 1.20, temp: 75, wind: "8mph CROSS", condition: "Receptive: Very High" },
  { game: "SF @ ATH", runs: 1.13, hr: 1.16, hits: 1.06, temp: 78, wind: "10mph OUT", condition: "Receptive: High" },
  { game: "BAL @ WAS", runs: 1.10, hr: 1.10, hits: 1.08, temp: 72, wind: "5mph OUT", condition: "Receptive: Med" },
  { game: "CHC @ CHW", runs: 1.03, hr: 1.09, hits: 1.03, temp: 64, wind: "12mph IN", condition: "Med-High" },
  { game: "PHI @ PIT", runs: 1.01, hr: 0.96, hits: 1.04, temp: 62, wind: "4mph IN", condition: "Humidity Active" },
  { game: "TOR @ DET", runs: 1.01, hr: 0.99, hits: 1.10, temp: 58, wind: "8mph CROSS", condition: "Neutral" },
  { game: "CIN @ CLE", runs: 1.01, hr: 1.10, hits: 0.94, temp: 60, wind: "9mph OUT", condition: "High HR Appeal" },
  { game: "LAD @ LAA", runs: 0.99, hr: 1.04, hits: 0.99, temp: 68, wind: "7mph OUT", condition: "Stable" },
  { game: "KC @ STL", runs: 0.99, hr: 1.02, hits: 1.09, temp: 74, wind: "6mph OUT", condition: "Med-High" },
  { game: "MIL @ MIN", runs: 0.97, hr: 0.95, hits: 1.00, temp: 80, wind: "5mph OUT", condition: "Hum: 19%" },
  { game: "TEX @ HOU", runs: 0.95, hr: 1.05, hits: 0.96, temp: 72, wind: "NONE", condition: "ROOF CLOSED" },
  { game: "MIA @ TB", runs: 0.94, hr: 0.97, hits: 0.92, temp: 72, wind: "NONE", condition: "ROOF CLOSED" },
  { game: "NYY @ NYM", runs: 0.93, hr: 1.01, hits: 0.97, temp: 62, wind: "8mph IN", condition: "Low Density" },
  { game: "BOS @ ATL", runs: 0.92, hr: 0.90, hits: 0.99, temp: 76, wind: "4mph IN", condition: "Low Appeal" },
  { game: "SD @ SEA", runs: 0.87, hr: 0.87, hits: 0.97, temp: 48, wind: "8mph IN", condition: "High Marine Layer" }
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
