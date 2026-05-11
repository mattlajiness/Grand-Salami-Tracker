/**
 * MLB League Constants for Model Projections
 * Based on 2026 Scoring Environments
 */

// 1.00 is league average (neutral)
export const VenueParkFactors: Record<string, number> = {
  "Coors Field": 1.31,
  "Sutter Health Park": 1.16,
  "Fenway Park": 1.12,
  "Great American Ball Park": 1.01,
  "Kauffman Stadium": 0.91,
  "Wrigley Field": 0.93, 
  "Globe Life Field": 0.92,
  "Target Field": 0.97,
  "American Family Field": 0.95,
  "Progressive Field": 0.93,
  "Truist Park": 1.02,
  "Citizens Bank Park": 0.99,
  "Yankee Stadium": 0.94,
  "Oriole Park at Camden Yards": 0.94,
  "Rogers Centre": 0.94,
  "Guaranteed Rate Field": 0.95,
  "Comerica Park": 0.91,
  "PNC Park": 0.93,
  "Busch Stadium": 0.84,
  "Minute Maid Park": 0.96,
  "Dodger Stadium": 0.96,
  "Angel Stadium": 1.01,
  "Petco Park": 0.90,
  "Oracle Park": 0.92,
  "T-Mobile Park": 0.92,
  "Chase Field": 1.01,
  "LoanDepot Park": 0.94,
  "Tropicana Field": 0.95,
  "Oakland Coliseum": 0.88,
  "Citi Field": 0.95,
  "Nationals Park": 1.00,
};

// Team Offense Metrics (Relative to League Average 100)
// Simplified wRC+ style values
export const TeamOffensePower: Record<string, number> = {
  "Atlanta Braves": 115,
  "Los Angeles Dodgers": 118,
  "Texas Rangers": 108,
  "Houston Astros": 110,
  "Tampa Bay Rays": 106,
  "Philadelphia Phillies": 105,
  "Baltimore Orioles": 104,
  "Minnesota Twins": 101,
  "Seattle Mariners": 99,
  "Toronto Blue Jays": 102,
  "Chicago Cubs": 100,
  "Cincinnati Reds": 97,
  "Boston Red Sox": 103,
  "New York Yankees": 98, // Historic context
  "Arizona Diamondbacks": 99,
  "San Diego Padres": 104,
  "Milwaukee Brewers": 92,
  "San Francisco Giants": 94,
  "Miami Marlins": 89,
  "New York Mets": 101,
  "St. Louis Cardinals": 96,
  "Cleveland Guardians": 91,
  "Los Angeles Angels": 95,
  "Washington Nationals": 90,
  "Detroit Tigers": 88,
  "Chicago White Sox": 82,
  "Pittsburgh Pirates": 91,
  "Colorado Rockies": 84, // Excluding Coors effect
  "Kansas City Royals": 93,
  "Oakland Athletics": 81,
};

export interface DetailedParkFactor {
  hr: number;
  extraBase: number; // 2B/3B
  single: number;
  runs: number;
}

export const DetailedVenueFactors: Record<string, DetailedParkFactor> = {
  "Chase Field": { hr: 1.08, extraBase: 1.11, single: 1.11, runs: 1.07 },
  "Chase Field (Closed)": { hr: 0.92, extraBase: 1.05, single: 1.00, runs: 1.01 },
  "Great American Ball Park": { hr: 1.12, extraBase: 0.95, single: 0.97, runs: 1.04 },
  "Kauffman Stadium": { hr: 1.18, extraBase: 1.07, single: 0.97, runs: 1.06 },
  "Citizens Bank Park": { hr: 1.10, extraBase: 0.94, single: 0.98, runs: 1.02 },
  "Oriole Park at Camden Yards": { hr: 0.76, extraBase: 0.89, single: 1.08, runs: 0.90 },
  "Dodger Stadium": { hr: 1.14, extraBase: 0.97, single: 0.96, runs: 1.00 },
  "Guaranteed Rate Field": { hr: 0.97, extraBase: 0.87, single: 1.05, runs: 0.98 },
  "Oracle Park": { hr: 0.81, extraBase: 1.05, single: 1.06, runs: 0.96 },
  "American Family Field": { hr: 1.06, extraBase: 0.86, single: 0.92, runs: 0.95 },
  "Rogers Centre": { hr: 1.02, extraBase: 0.94, single: 0.97, runs: 0.95 },
  "LoanDepot Park": { hr: 0.85, extraBase: 1.01, single: 0.98, runs: 0.94 },
  "Globe Life Field": { hr: 0.90, extraBase: 0.93, single: 0.98, runs: 0.93 },
  "Petco Park": { hr: 0.99, extraBase: 0.81, single: 0.95, runs: 0.91 },
  "Fenway Park": { hr: 0.86, extraBase: 1.24, single: 1.09, runs: 1.09 },
  "Coors Field": { hr: 1.18, extraBase: 1.35, single: 1.13, runs: 1.31 },
  "Sutter Health Park": { hr: 1.22, extraBase: 1.11, single: 1.03, runs: 1.16 },
  "Angel Stadium": { hr: 1.05, extraBase: 0.93, single: 1.03, runs: 1.01 },
  "PNC Park": { hr: 0.69, extraBase: 1.10, single: 1.02, runs: 0.93 },
  "Tropicana Field": { hr: 0.97, extraBase: 0.94, single: 0.92, runs: 0.95 },
  "Target Field": { hr: 0.93, extraBase: 0.95, single: 1.01, runs: 0.97 },
  "Comerica Park": { hr: 0.79, extraBase: 0.95, single: 1.06, runs: 0.91 },
  "Yankee Stadium": { hr: 1.00, extraBase: 0.81, single: 0.99, runs: 0.94 },
  "Nationals Park": { hr: 0.95, extraBase: 1.01, single: 1.04, runs: 1.00 },
  "T-Mobile Park": { hr: 1.01, extraBase: 0.86, single: 0.94, runs: 0.92 },
  "Busch Stadium": { hr: 0.69, extraBase: 0.93, single: 1.03, runs: 0.84 },
  "Minute Maid Park": { hr: 1.05, extraBase: 0.89, single: 0.96, runs: 0.96 },
  "Wrigley Field": { hr: 0.99, extraBase: 0.90, single: 0.95, runs: 0.93 },
  "Citi Field": { hr: 0.95, extraBase: 0.90, single: 0.95, runs: 0.95 },
  "Oakland Coliseum": { hr: 0.85, extraBase: 0.90, single: 0.90, runs: 0.88 },
  "Truist Park": { hr: 1.05, extraBase: 0.95, single: 1.00, runs: 1.02 },
  "Progressive Field": { hr: 0.59, extraBase: 1.01, single: 0.97, runs: 0.83 },
};

export function getDetailedParkFactor(venueName: string, weatherCondition?: string): DetailedParkFactor | null {
  const normalized = venueName.toLowerCase();
  const lowerCondition = (weatherCondition || '').toLowerCase();
  const isOpen = lowerCondition.includes('open') || lowerCondition.includes('outdoor') || ['clear', 'sunny', 'fair', 'partly', 'night'].some(k => lowerCondition.includes(k));
  const isClosed = (lowerCondition.includes('closed') || lowerCondition.includes('indoor') || lowerCondition.includes('dome')) && !isOpen;

  // Specialized retractable logic
  if (normalized.includes('chase field')) {
    const isStrictlyClosed = (lowerCondition.includes('closed') || lowerCondition.includes('indoor')) && !lowerCondition.includes('open');
    return isStrictlyClosed ? DetailedVenueFactors["Chase Field (Closed)"] : DetailedVenueFactors["Chase Field"];
  }

  // Try exact match first
  if (DetailedVenueFactors[venueName]) return DetailedVenueFactors[venueName];

  // Robust matching for common variants
  if (normalized.includes('guaranteed rate') || (normalized.includes('rate') && normalized.includes('field'))) return DetailedVenueFactors["Guaranteed Rate Field"];
  if (normalized.includes('dodger')) return DetailedVenueFactors["Dodger Stadium"];
  if (normalized.includes('camden') || normalized.includes('oriole')) return DetailedVenueFactors["Oriole Park at Camden Yards"];
  if (normalized.includes('loandepot')) return DetailedVenueFactors["LoanDepot Park"];
  if (normalized.includes('oracle')) return DetailedVenueFactors["Oracle Park"];
  if (normalized.includes('american family')) return DetailedVenueFactors["American Family Field"];
  if (normalized.includes('citizens bank')) return DetailedVenueFactors["Citizens Bank Park"];
  if (normalized.includes('great american')) return DetailedVenueFactors["Great American Ball Park"];
  if (normalized.includes('progressive')) return DetailedVenueFactors["Progressive Field"];
  if (normalized.includes('kauffman')) return DetailedVenueFactors["Kauffman Stadium"];
  if (normalized.includes('chase')) return DetailedVenueFactors["Chase Field"];
  if (normalized.includes('rogers')) return DetailedVenueFactors["Rogers Centre"];
  if (normalized.includes('globe life')) return DetailedVenueFactors["Globe Life Field"];
  if (normalized.includes('petco')) return DetailedVenueFactors["Petco Park"];
  if (normalized.includes('fenway')) return DetailedVenueFactors["Fenway Park"];
  if (normalized.includes('minute maid') || normalized.includes('daikin')) return DetailedVenueFactors["Minute Maid Park"];
  
  return null;
}

export function getParkFactor(venueName: string): number {
  return VenueParkFactors[venueName] || 1.00;
}

export function getTeamOffensePower(teamName: string): number {
  return TeamOffensePower[teamName] || 100;
}
