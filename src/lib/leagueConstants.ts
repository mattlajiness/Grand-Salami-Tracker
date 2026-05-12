/**
 * MLB League Constants for Model Projections
 * Based on 2026 Scoring Environments
 */

// 1.00 is league average (neutral)
export const VenueParkFactors: Record<string, number> = {
  "Coors Field": 1.31,
  "Sutter Health Park": 1.21,
  "Fenway Park": 1.00,
  "Great American Ball Park": 1.05,
  "Kauffman Stadium": 0.91,
  "Wrigley Field": 0.93, 
  "Globe Life Field": 0.93,
  "Target Field": 1.05,
  "American Family Field": 0.95,
  "Progressive Field": 0.99,
  "Truist Park": 0.89,
  "Citizens Bank Park": 0.99,
  "Yankee Stadium": 0.94,
  "Oriole Park at Camden Yards": 0.95,
  "Rogers Centre": 0.94,
  "Guaranteed Rate Field": 1.12,
  "Comerica Park": 0.91,
  "PNC Park": 0.95,
  "Busch Stadium": 0.84,
  "Minute Maid Park": 0.96,
  "Dodger Stadium": 0.94,
  "Angel Stadium": 1.01,
  "Petco Park": 0.90,
  "Oracle Park": 0.92,
  "T-Mobile Park": 0.92,
  "Chase Field": 1.01,
  "LoanDepot Park": 0.94,
  "Tropicana Field": 0.95,
  "Oakland Coliseum": 0.88,
  "Citi Field": 0.85,
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
  "Chase Field": { hr: 0.92, extraBase: 1.05, single: 1.00, runs: 1.01 }, // Default to Closed
  "Chase Field (Open)": { hr: 1.08, extraBase: 1.11, single: 1.11, runs: 1.07 },
  "Chase Field (Closed)": { hr: 0.92, extraBase: 1.05, single: 1.00, runs: 1.01 },
  "Great American Ball Park": { hr: 1.12, extraBase: 1.01, single: 0.96, runs: 1.05 },
  "Kauffman Stadium": { hr: 1.18, extraBase: 1.07, single: 0.97, runs: 1.06 },
  "Citizens Bank Park": { hr: 1.10, extraBase: 0.94, single: 0.98, runs: 1.02 },
  "Oriole Park at Camden Yards": { hr: 0.83, extraBase: 0.90, single: 1.10, runs: 0.95 },
  "Dodger Stadium": { hr: 1.08, extraBase: 0.94, single: 0.93, runs: 0.94 },
  "Guaranteed Rate Field": { hr: 1.21, extraBase: 0.98, single: 1.04, runs: 1.12 },
  "Oracle Park": { hr: 0.81, extraBase: 1.05, single: 1.06, runs: 0.96 },
  "American Family Field": { hr: 1.06, extraBase: 0.87, single: 0.92, runs: 0.95 },
  "American Family Field (Open)": { hr: 1.08, extraBase: 0.88, single: 0.94, runs: 0.98 },
  "Rogers Centre": { hr: 1.00, extraBase: 0.96, single: 0.97, runs: 0.94 },
  "Rogers Centre (Open)": { hr: 1.05, extraBase: 0.96, single: 0.98, runs: 0.98 },
  "LoanDepot Park": { hr: 0.85, extraBase: 1.01, single: 0.98, runs: 0.94 },
  "LoanDepot Park (Open)": { hr: 0.98, extraBase: 1.05, single: 1.02, runs: 1.02 },
  "Globe Life Field": { hr: 0.90, extraBase: 0.93, single: 0.98, runs: 0.93 },
  "Globe Life Field (Open)": { hr: 1.02, extraBase: 0.98, single: 1.01, runs: 1.01 },
  "Petco Park": { hr: 0.99, extraBase: 0.81, single: 0.95, runs: 0.91 },
  "Fenway Park": { hr: 0.75, extraBase: 1.18, single: 1.06, runs: 1.00 },
  "Coors Field": { hr: 1.18, extraBase: 1.35, single: 1.13, runs: 1.31 },
  "Sutter Health Park": { hr: 1.31, extraBase: 1.14, single: 1.03, runs: 1.21 },
  "Angel Stadium": { hr: 1.05, extraBase: 0.93, single: 1.03, runs: 1.01 },
  "PNC Park": { hr: 0.78, extraBase: 1.04, single: 1.02, runs: 0.95 },
  "Tropicana Field": { hr: 0.97, extraBase: 0.94, single: 0.92, runs: 0.95 },
  "Target Field": { hr: 1.00, extraBase: 0.99, single: 1.06, runs: 1.05 },
  "Comerica Park": { hr: 0.79, extraBase: 0.95, single: 1.06, runs: 0.91 },
  "Yankee Stadium": { hr: 1.00, extraBase: 0.81, single: 0.99, runs: 0.94 },
  "Nationals Park": { hr: 0.95, extraBase: 1.01, single: 1.04, runs: 1.00 },
  "T-Mobile Park": { hr: 0.98, extraBase: 0.84, single: 0.93, runs: 0.90 },
  "T-Mobile Park (Open)": { hr: 1.04, extraBase: 0.88, single: 0.96, runs: 0.95 },
  "Busch Stadium": { hr: 0.69, extraBase: 0.93, single: 1.03, runs: 0.84 },
  "Minute Maid Park": { hr: 1.05, extraBase: 0.89, single: 0.96, runs: 0.96 },
  "Minute Maid Park (Open)": { hr: 1.12, extraBase: 0.94, single: 0.99, runs: 1.03 },
  "Wrigley Field": { hr: 0.99, extraBase: 0.90, single: 0.95, runs: 0.93 },
  "Citi Field": { hr: 0.86, extraBase: 0.71, single: 0.99, runs: 0.85 },
  "Oakland Coliseum": { hr: 0.85, extraBase: 0.90, single: 0.90, runs: 0.88 },
  "Truist Park": { hr: 0.84, extraBase: 0.92, single: 1.00, runs: 0.89 },
  "Progressive Field": { hr: 0.93, extraBase: 1.04, single: 0.97, runs: 0.99 },
};

export function getDetailedParkFactor(venueName: string, weatherCondition?: string): DetailedParkFactor | null {
  const normalized = venueName.toLowerCase();
  const lowerCondition = (weatherCondition || '').toLowerCase();
  
  // Explicit Roof Detection
  const roofOpen = lowerCondition.includes('open') || lowerCondition.includes('outdoor');
  const roofClosed = lowerCondition.includes('closed') || lowerCondition.includes('indoor') || lowerCondition.includes('dome');

  // Specialized retractable logic - Return the correct state factor
  function getRetractableFactor(baseKey: string) {
    if (roofOpen) return DetailedVenueFactors[`${baseKey} (Open)`] || DetailedVenueFactors[baseKey];
    if (roofClosed) return DetailedVenueFactors[`${baseKey} (Closed)`] || DetailedVenueFactors[baseKey];
    // Default to closed for some, open for others depending on historic norms
    return DetailedVenueFactors[baseKey];
  }

  if (normalized.includes('chase field')) return getRetractableFactor("Chase Field");
  if (normalized.includes('american family')) return getRetractableFactor("American Family Field");
  if (normalized.includes('rogers centre')) return getRetractableFactor("Rogers Centre");
  if (normalized.includes('globe life')) return getRetractableFactor("Globe Life Field");
  if (normalized.includes('minute maid') || normalized.includes('daikin')) return getRetractableFactor("Minute Maid Park");
  if (normalized.includes('loandepot')) return getRetractableFactor("LoanDepot Park");
  if (normalized.includes('t-mobile')) return getRetractableFactor("T-Mobile Park");

  // Try exact match first
  if (DetailedVenueFactors[venueName]) return DetailedVenueFactors[venueName];

  // Robust matching for common variants
  if (normalized.includes('guaranteed rate') || (normalized.includes('rate') && normalized.includes('field'))) return DetailedVenueFactors["Guaranteed Rate Field"];
  if (normalized.includes('dodger')) return DetailedVenueFactors["Dodger Stadium"];
  if (normalized.includes('camden') || normalized.includes('oriole')) return DetailedVenueFactors["Oriole Park at Camden Yards"];
  if (normalized.includes('oracle')) return DetailedVenueFactors["Oracle Park"];
  if (normalized.includes('citizens bank')) return DetailedVenueFactors["Citizens Bank Park"];
  if (normalized.includes('great american')) return DetailedVenueFactors["Great American Ball Park"];
  if (normalized.includes('progressive')) return DetailedVenueFactors["Progressive Field"];
  if (normalized.includes('kauffman')) return DetailedVenueFactors["Kauffman Stadium"];
  if (normalized.includes('petco')) return DetailedVenueFactors["Petco Park"];
  if (normalized.includes('fenway')) return DetailedVenueFactors["Fenway Park"];
  if (normalized.includes('coors')) return DetailedVenueFactors["Coors Field"];
  if (normalized.includes('sutter')) return DetailedVenueFactors["Sutter Health Park"];
  if (normalized.includes('angel stadium')) return DetailedVenueFactors["Angel Stadium"];
  if (normalized.includes('pnc park')) return DetailedVenueFactors["PNC Park"];
  if (normalized.includes('tropicana')) return DetailedVenueFactors["Tropicana Field"];
  if (normalized.includes('target field')) return DetailedVenueFactors["Target Field"];
  if (normalized.includes('comerica')) return DetailedVenueFactors["Comerica Park"];
  if (normalized.includes('yankee')) return DetailedVenueFactors["Yankee Stadium"];
  if (normalized.includes('nationals')) return DetailedVenueFactors["Nationals Park"];
  if (normalized.includes('busch')) return DetailedVenueFactors["Busch Stadium"];
  if (normalized.includes('wrigley')) return DetailedVenueFactors["Wrigley Field"];
  if (normalized.includes('citi field')) return DetailedVenueFactors["Citi Field"];
  if (normalized.includes('oakland')) return DetailedVenueFactors["Oakland Coliseum"];
  if (normalized.includes('truist')) return DetailedVenueFactors["Truist Park"];
  
  return null;
}

export function getParkFactor(venueName: string): number {
  return VenueParkFactors[venueName] || 1.00;
}

export function getTeamOffensePower(teamName: string): number {
  return TeamOffensePower[teamName] || 100;
}
