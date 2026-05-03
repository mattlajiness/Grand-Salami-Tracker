/**
 * MLB League Constants for Model Projections
 * Based on 2023-2024 Scoring Environments
 */

// 1.00 is league average (neutral)
export const VenueParkFactors: Record<string, number> = {
  "Coors Field": 1.28,
  "Sutter Health Park": 1.16,
  "Fenway Park": 1.09,
  "Great American Ball Park": 1.08,
  "Kauffman Stadium": 1.04,
  "Wrigley Field": 1.07, // Playing warm/receptive today per image (+7%)
  "Globe Life Field": 1.03,
  "Target Field": 0.97,
  "American Family Field": 1.01,
  "Progressive Field": 0.97,
  "Truist Park": 1.02,
  "Citizens Bank Park": 1.04,
  "Yankee Stadium": 0.93,
  "Oriole Park at Camden Yards": 0.95,
  "Rogers Centre": 1.00,
  "Guaranteed Rate Field": 1.03,
  "Comerica Park": 0.94,
  "PNC Park": 0.93,
  "Busch Stadium": 0.96,
  "Minute Maid Park": 0.99,
  "Dodger Stadium": 0.97,
  "Angel Stadium": 1.02,
  "Petco Park": 0.93,
  "Oracle Park": 0.86,
  "T-Mobile Park": 0.92,
  "Chase Field": 0.99,
  "Oakland Coliseum": 0.88,
  "LoanDepot Park": 0.95,
  "Citi Field": 0.95,
  "Nationals Park": 0.87,
  "Tropicana Field": 0.94,
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
  "Coors Field": { hr: 1.19, extraBase: 1.35, single: 1.10, runs: 1.28 },
  "Sutter Health Park": { hr: 1.22, extraBase: 1.11, single: 1.03, runs: 1.16 },
  "Fenway Park": { hr: 0.79, extraBase: 1.23, single: 1.14, runs: 1.09 },
  "Angel Stadium": { hr: 1.01, extraBase: 0.93, single: 1.06, runs: 1.02 },
  "LoanDepot Park": { hr: 0.87, extraBase: 1.02, single: 0.98, runs: 0.95 },
  "PNC Park": { hr: 0.69, extraBase: 1.10, single: 1.02, runs: 0.93 },
  "Tropicana Field": { hr: 0.97, extraBase: 0.93, single: 0.92, runs: 0.94 },
  "Target Field": { hr: 0.93, extraBase: 0.95, single: 1.01, runs: 0.97 },
  "Petco Park": { hr: 0.95, extraBase: 0.81, single: 1.00, runs: 0.93 },
  "Comerica Park": { hr: 0.71, extraBase: 0.98, single: 1.12, runs: 0.94 },
  "Yankee Stadium": { hr: 0.86, extraBase: 0.85, single: 1.04, runs: 0.93 },
  "Nationals Park": { hr: 0.75, extraBase: 0.96, single: 1.02, runs: 0.87 },
  "T-Mobile Park": { hr: 1.01, extraBase: 0.85, single: 0.93, runs: 0.92 },
  "Busch Stadium": { hr: 0.91, extraBase: 1.02, single: 1.03, runs: 0.96 },
  "Wrigley Field": { hr: 1.19, extraBase: 0.98, single: 0.97, runs: 1.07 },
};

export function getDetailedParkFactor(venueName: string): DetailedParkFactor | null {
  return DetailedVenueFactors[venueName] || null;
}

export function getParkFactor(venueName: string): number {
  return VenueParkFactors[venueName] || 1.00;
}

export function getTeamOffensePower(teamName: string): number {
  return TeamOffensePower[teamName] || 100;
}
