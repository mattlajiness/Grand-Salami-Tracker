import { format, parseISO } from 'date-fns';

interface StadiumLocation {
  name: string;
  lat: number;
  lng: number;
  isDome?: boolean;
}

const STADIUM_DATA: Record<number, StadiumLocation> = {
  112: { name: 'Wrigley Field', lat: 41.9484, lng: -87.6553 },
  115: { name: 'Coors Field', lat: 39.7559, lng: -104.9942 },
  136: { name: 'T-Mobile Park', lat: 47.5914, lng: -122.3325 },
  135: { name: 'Petco Park', lat: 32.7073, lng: -117.1566 },
  137: { name: 'Oracle Park', lat: 37.7786, lng: -122.3893 },
  149: { name: 'Angel Stadium', lat: 33.8003, lng: -117.8827 },
  119: { name: 'Dodger Stadium', lat: 34.0739, lng: -118.2400 },
  141: { name: 'Citizens Bank Park', lat: 39.9061, lng: -75.1665 },
  144: { name: 'Truist Park', lat: 33.8907, lng: -84.4678 },
  121: { name: 'Citi Field', lat: 40.7571, lng: -73.8458 },
  147: { name: 'Yankee Stadium', lat: 40.8296, lng: -73.9262 },
  109: { name: 'Chase Field', lat: 33.4455, lng: -112.0667 }, // Diamondbacks
  138: { name: 'Busch Stadium', lat: 38.6226, lng: -90.1928 },
  118: { name: 'Kauffman Stadium', lat: 39.0517, lng: -94.4803 },
  142: { name: 'Target Field', lat: 44.9817, lng: -93.2778 },
  158: { name: 'American Family Field', lat: 43.0284, lng: -87.9712 },
  113: { name: 'Great American Ball Park', lat: 39.0974, lng: -84.5071 },
  145: { name: 'Comerica Park', lat: 42.3390, lng: -83.0485 }, // Tigers
  114: { name: 'Progressive Field', lat: 41.4962, lng: -81.6852 }, // Guardians
  131: { name: 'PNC Park', lat: 40.4473, lng: -80.0057 }, // Pirates (App ID)
  134: { name: 'PNC Park', lat: 40.4473, lng: -80.0057 }, // Pirates (Standard ID)
  143: { name: 'Guaranteed Rate Field', lat: 41.8299, lng: -87.6339 },
  111: { name: 'Fenway Park', lat: 42.3467, lng: -71.0972 },
  133: { name: 'Oakland Coliseum', lat: 37.7516, lng: -122.2005 },
  120: { name: 'Nationals Park', lat: 38.8730, lng: -77.0074 },
  110: { name: 'Oriole Park', lat: 39.2840, lng: -76.6215 },
  116: { name: 'Comerica Park', lat: 42.3390, lng: -83.0485 }, // Tigers (Standard ID)
  140: { name: 'Rogers Centre', lat: 43.6414, lng: -79.3894, isDome: true },
  117: { name: 'Minute Maid Park', lat: 29.7573, lng: -95.3555, isDome: true },
  139: { name: 'Tropicana Field', lat: 27.7682, lng: -82.6534, isDome: true },
  146: { name: 'loanDepot park', lat: 25.7783, lng: -80.2198, isDome: true },
  159: { name: 'Globe Life Field', lat: 32.7473, lng: -97.0841, isDome: true },
};

export interface WeatherForecast {
  temp: number;
  windSpeed: number;
  windDir: string;
  condition: string;
}

const WIND_DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
function getWindDir(degree: number): string {
  const index = Math.round(degree / 45) % 8;
  return WIND_DIRS[index];
}

export async function fetchWeatherForecast(homeTeamId: number, gameDate: string, venueName: string = ''): Promise<WeatherForecast | null> {
  const stadium = STADIUM_DATA[homeTeamId] || Object.values(STADIUM_DATA).find(s => venueName && s.name.toLowerCase().includes(venueName.toLowerCase()));
  if (!stadium) return null;

  if (stadium.isDome) {
    return { temp: 72, windSpeed: 0, windDir: 'None', condition: 'Dome' };
  }

  try {
    const date = parseISO(gameDate);
    const dateStr = format(date, 'yyyy-MM-dd');
    const hour = date.getHours();

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${stadium.lat}&longitude=${stadium.lng}&hourly=temperature_2m,weathercode,windspeed_10m,winddirection_10m&temperature_unit=fahrenheit&windspeed_unit=mph&start_date=${dateStr}&end_date=${dateStr}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.hourly) return null;

    // Find the closest hour
    const idx = hour;
    const temp = Math.round(data.hourly.temperature_2m[idx]);
    const windSpeed = Math.round(data.hourly.windspeed_10m[idx]);
    const windDir = getWindDir(data.hourly.winddirection_10m[idx]);
    
    // Weather code mapping (simplified)
    const code = data.hourly.weathercode[idx];
    let condition = 'Clear';
    if (code >= 1 && code <= 3) condition = 'Partly Cloudy';
    if (code >= 45 && code <= 48) condition = 'Foggy';
    if (code >= 51 && code <= 67) condition = 'Rainy';
    if (code >= 71 && code <= 77) condition = 'Snowy';
    if (code >= 80 && code <= 82) condition = 'Showers';
    if (code >= 95) condition = 'Thunderstorm';

    return { temp, windSpeed, windDir, condition };
  } catch (e) {
    console.error('Forecast fetch failed:', e);
    return null;
  }
}
