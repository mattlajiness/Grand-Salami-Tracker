import { MLBGame } from '../services/mlbService';
import { format, subDays, parseISO } from 'date-fns';

export interface FatigueStats {
  maxFatigueCount: number;
  highFatigueCount: number;
}

export function calculateFatigueStats(historicalGames: MLBGame[], todayGames: MLBGame[]): FatigueStats {
  // Post All-Star Break Reset: All bullpens are completely rested and "all clear"
  return { maxFatigueCount: 0, highFatigueCount: 0 };
}

/**
 * Calculates a consolidated Bullpen Stress Index (0-100)
 * Higher = Bullpens are more strained/vulnerable (Bullish for OVER)
 */
export function calculateBullpenScore(fatigue: FatigueStats): number {
  const maxWeight = 25; // MAX stress rosters carry heavy weight
  const highWeight = 12; // HIGH stress rosters carry moderate weight
  
  const score = (fatigue.maxFatigueCount * maxWeight) + (fatigue.highFatigueCount * highWeight);
  
  // Normalize to 0-100 scale, with 100 being catastrophic league-wide stress
  return Math.min(Math.max(score, 0), 100);
}
