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
  { game: "STL @ OAK", runs: 1.17, hr: 1.30, hits: 1.00 },
  { game: "NYY @ BAL", runs: 1.11, hr: 0.97, hits: 1.13 },
  { game: "PHI @ BOS", runs: 1.05, hr: 0.86, hits: 1.03 },
  { game: "WAS @ CIN", runs: 1.05, hr: 1.09, hits: 0.97 },
  { game: "DET @ NYM", runs: 1.00, hr: 1.07, hits: 1.00 },
  { game: "COL @ PIT", runs: 1.00, hr: 0.90, hits: 1.03 },
  { game: "LAA @ CLE", runs: 0.98, hr: 0.92, hits: 1.03 },
  { game: "CHC @ ATL", runs: 0.97, hr: 0.94, hits: 1.02 },
  { game: "SEA @ HOU", runs: 0.96, hr: 1.05, hits: 0.96 },
  { game: "SD @ MIL", runs: 0.95, hr: 1.06, hits: 0.92 },
  { game: "MIA @ MIN", runs: 0.95, hr: 0.88, hits: 1.04 },
  { game: "TB @ TOR", runs: 0.95, hr: 1.02, hits: 0.97 },
  { game: "SF @ LAD", runs: 0.93, hr: 1.04, hits: 0.96 },
  { game: "KC @ CHW", runs: 0.93, hr: 0.93, hits: 1.03 },
  { game: "ARI @ TEX", runs: 0.93, hr: 0.90, hits: 0.98 }
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
