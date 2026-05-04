
/**
 * Weather Service
 * Providing a compatibility layer for weather forecasts.
 */

export async function fetchWeatherForecast(teamId: number, dateTime: string, venueName?: string): Promise<{ condition: string, temp: number, windSpeed: number, windDir: string } | null> {
  // Use teamId as a seed for consistent mock data
  const seed = (teamId + (new Date(dateTime).getDate())) % 10;
  
  const conditions = ['Clear', 'Sunny', 'Partly Cloudy', 'Cloudy', 'Overcast', 'Clear', 'Sunny', 'Partly Cloudy', 'Showers', 'Clear'];
  const windDirs = ['In from CF', 'Out to LF', 'Cross-breeze', 'Out to RF', 'In from LF', 'Still', 'Out to CF', 'In from RF', 'Cross-wind', 'Blowing Out'];
  
  return {
    condition: conditions[seed],
    temp: 65 + seed,
    windSpeed: 4 + seed,
    windDir: windDirs[seed]
  };
}
