/**
 * MLB League Constants for Model Projections
 * Based on 2023-2024 Scoring Environments
 */

// 1.00 is league average (neutral)
export const VenueParkFactors: Record<string, number> = {
  "Coors Field": 1.34,
  "Fenway Park": 1.09,
  "Great American Ball Park": 1.08,
  "Kauffman Stadium": 1.04,
  "Wrigley Field": 1.00, // Highly wind dependent
  "Globe Life Field": 1.03,
  "Target Field": 0.98,
  "American Family Field": 1.01,
  "Progressive Field": 0.97,
  "Truist Park": 1.02,
  "Citizens Bank Park": 1.04,
  "Yankee Stadium": 1.01,
  "Oriole Park at Camden Yards": 0.95, // New wall dimensions
  "Rogers Centre": 1.00,
  "Guaranteed Rate Field": 1.03,
  "Comerica Park": 0.96,
  "PNC Park": 0.94,
  "Busch Stadium": 0.92,
  "Minute Maid Park": 0.99,
  "Dodger Stadium": 0.97,
  "Angel Stadium": 0.98,
  "Petco Park": 0.89,
  "Oracle Park": 0.86,
  "T-Mobile Park": 0.91,
  "Chase Field": 0.99,
  "Oakland Coliseum": 0.88,
  "LoanDepot Park": 0.93,
  "Citi Field": 0.95,
  "Nationals Park": 1.01,
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

export function getParkFactor(venueName: string): number {
  return VenueParkFactors[venueName] || 1.00;
}

export function getTeamOffensePower(teamName: string): number {
  return TeamOffensePower[teamName] || 100;
}
