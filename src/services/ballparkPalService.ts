import { DetailedParkFactor } from "../lib/leagueConstants";

interface BallparkPalFactor {
  venue_name: string;
  hr_factor: number;
  run_factor: number;
  single_factor: number;
  double_factor: number;
  triple_factor: number;
  [key: string]: any;
}

// Global cache for park factors
let cachedFactors: Record<string, DetailedParkFactor> | null = null;
let lastFetchTime: number = 0;
let lastFetchStatus: { status: number; text: string; time: number; error?: string } | null = null;
const CACHE_DURATION = 1000 * 60 * 60 * 6; // 6 hours

export async function fetchParkFactors(): Promise<Record<string, DetailedParkFactor> | null> {
  const apiKey = process.env.BALLPARKPAL_API_KEY;
  
  // If no API key, we skip fetching and return null to use fallbacks
  if (!apiKey) {
    console.log("No BALLPARKPAL_API_KEY found, using local fallbacks.");
    return null;
  }

  // Check cache
  if (cachedFactors && (Date.now() - lastFetchTime < CACHE_DURATION)) {
    return cachedFactors;
  }

  try {
    console.log("Fetching latest park factors from Ballpark Pal...");
    const response = await fetch("https://www.ballparkpal.com/api/v1/parkfactors", {
      headers: {
        "X-API-Key": apiKey,
        "Accept": "application/json"
      }
    });

    lastFetchStatus = {
      status: response.status,
      text: response.statusText,
      time: Date.now()
    };

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Ballpark Pal API: 401 Unauthorized. Check your API key.");
      } else {
        console.error(`Ballpark Pal API error: ${response.status} ${response.statusText}`);
      }
      return null;
    }

    const json = await response.json();
    
    // Process the data
    // Assuming Ballpark Pal returns an array of factors
    // We need to map them to our DetailedParkFactor structure
    const factors: Record<string, DetailedParkFactor> = {};
    
    const data = Array.isArray(json) ? json : (json.data || []);
    
    data.forEach((item: any) => {
      // Map Ballpark Pal names to our system names if necessary, 
      // or just use venue_name if it matches.
      const name = item.venue_name || item.park_name || item.name;
      if (name) {
        factors[name] = {
          hr: item.hr_factor || item.hr || 1.0,
          extraBase: item.double_factor || item.xbh || 1.0, // Simplified triple/double mix
          single: item.single_factor || item.single || 1.0,
          runs: item.run_factor || item.runs || 1.0
        };
      }
    });

    if (Object.keys(factors).length > 0) {
      cachedFactors = factors;
      lastFetchTime = Date.now();
      console.log(`Successfully updated ${Object.keys(factors).length} park factors.`);
      return factors;
    }

    return null;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    lastFetchStatus = {
      status: 0,
      text: "Error",
      time: Date.now(),
      error: errorMsg
    };
    console.error("Failed to fetch park factors:", error);
    return null;
  }
}

export function getCachedFactors() {
  return cachedFactors;
}

export function getFetchStatus() {
  return lastFetchStatus;
}
