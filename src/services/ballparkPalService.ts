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
  { game: "ARI @ COL", runs: 1.29, hr: 1.19, hits: 1.16 },
  { game: "SF @ ATH", runs: 1.24, hr: 1.29, hits: 1.04 },
  { game: "LAD @ LAA", runs: 1.03, hr: 1.03, hits: 1.02 },
  { game: "PHI @ PIT", runs: 0.99, hr: 0.84, hits: 1.01 },
  { game: "MIL @ MIN", runs: 0.99, hr: 1.01, hits: 1.01 },
  { game: "KC @ STL", runs: 0.99, hr: 1.04, hits: 1.03 },
  { game: "CHC @ CHW", runs: 0.99, hr: 1.02, hits: 0.98 },
  { game: "BOS @ ATL", runs: 0.97, hr: 0.89, hits: 1.02 },
  { game: "CIN @ CLE", runs: 0.96, hr: 0.97, hits: 0.98 },
  { game: "TEX @ HOU", runs: 0.95, hr: 1.05, hits: 0.96 },
  { game: "BAL @ WAS", runs: 0.95, hr: 0.93, hits: 0.99 },
  { game: "MIA @ TB", runs: 0.94, hr: 0.97, hits: 0.92 },
  { game: "TOR @ DET", runs: 0.89, hr: 0.72, hits: 1.07 },
  { game: "SD @ SEA", runs: 0.87, hr: 1.00, hits: 0.98 },
  { game: "NYY @ NYM", runs: 0.85, hr: 0.88, hits: 0.94 }
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
