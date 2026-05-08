import { DetailedVenueFactors, DetailedParkFactor } from '../lib/leagueConstants';

let cachedFactors: Record<string, DetailedParkFactor> | null = null;
let lastFetchStatus: { time: number; success: boolean; error?: string } | null = null;

export async function fetchParkFactors() {
  const apiKey = process.env.BALLPARKPAL_API_KEY;
  if (!apiKey) {
    console.warn("BALLPARKPAL_API_KEY not set, using baseline park factors.");
    return null;
  }

  try {
    const response = await fetch(`https://ballparkpal.com/api/parkfactors?key=${apiKey}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (data && typeof data === 'object') {
      cachedFactors = data;
      lastFetchStatus = { time: Date.now(), success: true };
      return data;
    }
  } catch (error) {
    console.error("Error fetching park factors from Ballpark Pal:", error);
    lastFetchStatus = { 
      time: Date.now(), 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
  return null;
}

export function getCachedFactors() {
  return cachedFactors;
}

export function getFetchStatus() {
  return lastFetchStatus;
}
