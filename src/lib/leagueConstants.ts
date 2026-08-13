/**
 * MLB League Constants for Model Projections
 * Based on 2026 Scoring Environments
 */

// 1.00 is league average (neutral)
export const VenueParkFactors: Record<string, number> = {
  "Coors Field": 1.31,
  "Nationals Park": 1.08,
  "Rogers Centre": 1.07,
  "Comerica Park": 1.04,
  "Yankee Stadium": 1.01,
  "Sutter Health Park": 1.00,
  "Truist Park": 1.00,
  "Target Field": 1.00,
  "Busch Stadium": 1.00,
  "Chase Field": 1.00,
  "Dodger Stadium": 0.98,
  "Rate Field": 0.97,
  "Guaranteed Rate Field": 0.97,
  "Field of Dreams": 0.97,
  "Angel Stadium": 0.97,
  "Oracle Park": 0.97,
  "Petco Park": 0.97,
  "LoanDepot Park": 0.95,
  "Fenway Park": 1.00,
  "Great American Ball Park": 1.05,
  "Kauffman Stadium": 0.91,
  "Wrigley Field": 0.93, 
  "Globe Life Field": 0.93,
  "American Family Field": 0.95,
  "Progressive Field": 0.99,
  "Citizens Bank Park": 0.99,
  "Oriole Park at Camden Yards": 0.95,
  "PNC Park": 0.95,
  "Minute Maid Park": 0.96,
  "T-Mobile Park": 0.90,
  "Tropicana Field": 0.95,
  "Oakland Coliseum": 0.88,
  "Citi Field": 0.85,
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
  "Nationals Park": { hr: 1.05, extraBase: 1.04, single: 1.08, runs: 1.08 },
  "Rogers Centre": { hr: 1.10, extraBase: 1.02, single: 1.05, runs: 1.07 },
  "Rogers Centre (Open)": { hr: 1.10, extraBase: 1.02, single: 1.05, runs: 1.07 },
  "Comerica Park": { hr: 0.97, extraBase: 1.05, single: 1.06, runs: 1.04 },
  "Yankee Stadium": { hr: 1.22, extraBase: 0.84, single: 0.95, runs: 1.01 },
  "Dodger Stadium": { hr: 1.12, extraBase: 0.96, single: 0.94, runs: 0.98 },
  "Rate Field": { hr: 0.96, extraBase: 0.89, single: 1.04, runs: 0.97 },
  "Guaranteed Rate Field": { hr: 0.96, extraBase: 0.89, single: 1.04, runs: 0.97 },
  "Field of Dreams": { hr: 0.90, extraBase: 0.87, single: 1.09, runs: 0.97 },
  "Angel Stadium": { hr: 0.93, extraBase: 0.93, single: 1.02, runs: 0.97 },
  "LoanDepot Park": { hr: 0.87, extraBase: 1.01, single: 0.98, runs: 0.95 },
  "LoanDepot Park (Closed)": { hr: 0.87, extraBase: 1.01, single: 0.98, runs: 0.95 },
  "Sutter Health Park": { hr: 1.25, extraBase: 1.13, single: 1.04, runs: 1.19 },
  "Truist Park": { hr: 1.07, extraBase: 1.00, single: 0.98, runs: 1.00 },
  "Target Field": { hr: 0.93, extraBase: 1.04, single: 1.01, runs: 1.00 },
  "Busch Stadium": { hr: 1.03, extraBase: 0.95, single: 1.06, runs: 1.00 },
  "Chase Field": { hr: 0.92, extraBase: 1.11, single: 1.00, runs: 1.00 }, // Roof Closed
  "Chase Field (Open)": { hr: 1.08, extraBase: 1.11, single: 1.11, runs: 1.07 },
  "Chase Field (Closed)": { hr: 0.92, extraBase: 1.11, single: 1.00, runs: 1.00 },
  "Oracle Park": { hr: 0.90, extraBase: 1.11, single: 1.00, runs: 0.97 },
  "Petco Park": { hr: 1.05, extraBase: 0.87, single: 0.98, runs: 0.97 },
  "Progressive Field": { hr: 0.93, extraBase: 1.04, single: 0.97, runs: 0.99 },
};

export function isRetractableRoofOpen(venueName: string, weatherCondition?: string, temp?: number | string): boolean {
  const normalized = venueName.toLowerCase();
  const condition = (weatherCondition || '').toLowerCase();
  const tempF = temp !== undefined ? (typeof temp === 'string' ? parseInt(temp, 10) : temp) : 72;

  const isRainy = ['rain', 'shower', 'storm', 'drizzle', 'precip', 'thunder', 'lightning', 'mist'].some(k => condition.includes(k));
  if (isRainy) return false;

  // Explicit overrides
  if (condition.includes('open') || condition.includes('outdoor')) return true;
  if (condition.includes('closed') || condition.includes('indoor') || condition.includes('dome')) return false;

  // Smart inferred defaults for retractable roofs when no explicit instruction is provided
  if (normalized.includes('chase field')) {
    // Chase Field: Open if temperature is pleasant (50°F to 86°F) and not rainy
    return tempF >= 50 && tempF <= 86;
  }
  if (normalized.includes('minute maid') || normalized.includes('daikin')) {
    return tempF >= 50 && tempF <= 80;
  }
  if (normalized.includes('loandepot')) {
    return tempF >= 50 && tempF <= 78;
  }
  if (normalized.includes('globe life')) {
    return tempF >= 50 && tempF <= 82;
  }
  if (normalized.includes('rogers centre') || normalized.includes('skydome')) {
    return tempF >= 55;
  }
  if (normalized.includes('american family')) {
    return tempF >= 60;
  }
  if (normalized.includes('t-mobile') || normalized.includes('safeco')) {
    return tempF >= 48;
  }

  // If not a retractable stadium, it doesn't have an openable roof
  return false;
}

export function getDetailedParkFactor(venueName: string, weatherCondition?: string, temp?: number | string, roofOpenOverride?: boolean): DetailedParkFactor | null {
  const normalized = venueName.toLowerCase();
  
  const isRetractable = normalized.includes('loandepot') || normalized.includes('globe life') || normalized.includes('minute maid') || normalized.includes('daikin') || normalized.includes('american family') || normalized.includes('rogers centre') || normalized.includes('skydome') || normalized.includes('chase field') || normalized.includes('t-mobile') || normalized.includes('safeco');

  if (isRetractable) {
    const isOpen = roofOpenOverride !== undefined ? roofOpenOverride : isRetractableRoofOpen(venueName, weatherCondition, temp);
    let baseKey = "";
    if (normalized.includes('chase field')) baseKey = "Chase Field";
    else if (normalized.includes('american family')) baseKey = "American Family Field";
    else if (normalized.includes('rogers centre') || normalized.includes('skydome')) baseKey = "Rogers Centre";
    else if (normalized.includes('globe life')) baseKey = "Globe Life Field";
    else if (normalized.includes('minute maid') || normalized.includes('daikin')) baseKey = "Minute Maid Park";
    else if (normalized.includes('loandepot')) baseKey = "LoanDepot Park";
    else if (normalized.includes('t-mobile') || normalized.includes('safeco')) baseKey = "T-Mobile Park";

    if (baseKey) {
      const stateKey = isOpen ? `${baseKey} (Open)` : `${baseKey} (Closed)`;
      return DetailedVenueFactors[stateKey] || DetailedVenueFactors[baseKey];
    }
  }

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
