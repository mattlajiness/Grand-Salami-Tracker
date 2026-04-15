/**
 * Smart Projection Engine Utilities
 * Provides more nuanced MLB run projections than simple linear extrapolation
 */

interface BaseOutState {
  first: boolean;
  second: boolean;
  third: boolean;
  outs: number;
}

/**
 * Expected runs for a given base-out state (approximate MLB averages)
 */
const EXPECTED_RUNS_MAP: Record<string, number> = {
  '000-0': 0.48, '000-1': 0.26, '000-2': 0.10,
  '100-0': 0.86, '100-1': 0.51, '100-2': 0.22,
  '010-0': 1.10, '010-1': 0.66, '010-2': 0.32,
  '001-0': 1.35, '001-1': 0.95, '001-2': 0.35,
  '110-0': 1.44, '110-1': 0.91, '110-2': 0.43,
  '101-0': 1.78, '101-1': 1.14, '101-2': 0.48,
  '011-0': 1.96, '011-1': 1.37, '011-2': 0.58,
  '111-0': 2.29, '111-1': 1.54, '111-2': 0.74,
};

/**
 * Historical scoring weights by inning (MLB average)
 * 1st inning is high, middle is lower, 9th is high (if played)
 */
const INNING_WEIGHTS: Record<number, number> = {
  1: 1.15, // 1st inning is ~15% higher than average
  2: 0.95,
  3: 1.00,
  4: 1.00,
  5: 1.05,
  6: 1.05,
  7: 1.00,
  8: 0.95,
  9: 0.85, // 9th is lower because home team often doesn't bat
};

export function calculateLiveThreat(state: BaseOutState): number {
  const key = `${state.first ? 1 : 0}${state.second ? 1 : 0}${state.third ? 1 : 0}-${state.outs}`;
  return EXPECTED_RUNS_MAP[key] || 0;
}

export function getInningWeight(inning: number): number {
  return INNING_WEIGHTS[inning] || 1.0;
}

export function calculateSmartProjection(
  currentTotal: number,
  playedInnings: number,
  totalExpectedInnings: number,
  liveThreats: number = 0
): number {
  if (playedInnings <= 0) return 0;
  
  // 1. Linear Base
  const linearProjection = (currentTotal / playedInnings) * totalExpectedInnings;
  
  // 2. Add Live Threats (runners on base right now)
  const totalWithThreats = currentTotal + liveThreats;
  
  // 3. Weighting the remaining innings
  const remainingInnings = totalExpectedInnings - playedInnings;
  if (remainingInnings <= 0) return Math.round(currentTotal);

  // Simple version: Linear is actually quite robust for a large slate, 
  // but we'll add the live threat for "immediacy"
  return Math.round(linearProjection + (liveThreats * 0.5)); // Dampen live threat slightly as it's already "in" the pace
}

export function getConfidenceScore(completionPercentage: number): {
  score: number;
  label: 'LOW' | 'MODERATE' | 'HIGH' | 'FINAL';
  color: string;
} {
  if (completionPercentage >= 100) return { score: 100, label: 'FINAL', color: 'text-green-500' };
  if (completionPercentage >= 75) return { score: completionPercentage, label: 'HIGH', color: 'text-green-400' };
  if (completionPercentage >= 30) return { score: completionPercentage, label: 'MODERATE', color: 'text-blue-400' };
  return { score: completionPercentage, label: 'LOW', color: 'text-amber-500' };
}
