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
  { game: "NYY @ TB", runs: 0.98, hr: 0.95, hits: 0.99, edge: -0.1, temp: 72, wind: "Indoors", condition: "Dome" },
  { game: "TB @ NYY", runs: 1.12, hr: 1.25, hits: 1.05, edge: 1.1, temp: 72, wind: "12mph Right", condition: "Overcast" },
  { game: "TOR @ BAL", runs: 1.02, hr: 1.05, hits: 1.01, edge: 0.2, temp: 68, wind: "5mph Out", condition: "Clear" },
  { game: "MIA @ DET", runs: 0.96, hr: 0.88, hits: 0.98, edge: -0.4, temp: 65, wind: "10mph In", condition: "Cool" },
  { game: "TEX @ OAK", runs: 1.05, hr: 1.10, hits: 1.02, edge: 0.5, temp: 70, wind: "8mph Out", condition: "Clear" },
  { game: "KC @ DET", runs: 1.05, hr: 0.98, hits: 1.02, edge: 0.4, temp: 68, wind: "8mph Out", condition: "Clear" },
  { game: "SEA @ HOU", runs: 0.95, hr: 0.92, hits: 0.98, edge: -0.5, temp: 74, wind: "Indoors", condition: "Roof Closed" },
  { game: "LAD @ SF", runs: 0.88, hr: 0.75, hits: 0.92, edge: -1.2, temp: 58, wind: "15mph In", condition: "Chilled" },
  { game: "CHC @ ATL", runs: 1.08, hr: 1.15, hits: 1.04, edge: 0.8, temp: 82, wind: "5mph Left", condition: "Humid" },
  { game: "PHI @ NYM", runs: 1.02, hr: 1.05, hits: 1.01, edge: 0.2, temp: 65, wind: "10mph In", condition: "Clear" },
  { game: "PIT @ MIL", runs: 1.04, hr: 1.12, hits: 1.02, edge: 0.3, temp: 70, wind: "Indoors", condition: "Roof Open" },
  { game: "WAS @ BAL", runs: 0.98, hr: 0.95, hits: 0.99, edge: -0.1, temp: 68, wind: "7mph Out", condition: "Clear" }
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
