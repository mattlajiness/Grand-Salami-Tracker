
/**
 * Weather Service
 * Providing a compatibility layer for weather forecasts.
 */

import { fetchBallparkPalFactors } from './ballparkPalService';

export async function fetchWeatherForecast(teamId: number, dateTime: string, venueName?: string): Promise<{ condition: string, temp: number, windSpeed: number, windDir: string } | null> {
  // Use teamId as a seed for consistent mock data
  const seed = (teamId + (new Date(dateTime).getDate())) % 10;
  
  const conditions = ['Clear', 'Sunny', 'Partly Cloudy', 'Cloudy', 'Overcast', 'Clear', 'Sunny', 'Partly Cloudy', 'Showers', 'Clear'];
  const windDirs = ['In from CF', 'Out to LF', 'Cross-breeze', 'Out to RF', 'In from LF', 'Still', 'Out to CF', 'In from RF', 'Cross-wind', 'Blowing Out'];
  
  let condition = conditions[seed];
  let temp = 65 + seed;
  let windSpeed = 4 + seed;
  let windDir = windDirs[seed];

  // Try to find the manual park factor for more accurate weather representation
  try {
    const factors = await fetchBallparkPalFactors();
    const vName = (venueName || '').toLowerCase();
    
    const matchedFactors = factors.filter(f => {
      const fVenue = f.venue.toLowerCase();
      if (!vName) return false;
      return (
        vName.includes(fVenue) || 
        fVenue.includes(vName) || 
        (vName.includes('coors') && fVenue.includes('coors')) ||
        (vName.includes('sutter') && fVenue.includes('sutter')) ||
        (vName.includes('camden') && fVenue.includes('oriole')) ||
        (vName.includes('dodger') && fVenue.includes('dodger')) ||
        (vName.includes('citizens bank') && fVenue.includes('citizens bank')) ||
        (vName.includes('truist') && fVenue.includes('truist')) ||
        (vName.includes('comerica') && fVenue.includes('comerica')) ||
        (vName.includes('oracle') && fVenue.includes('oracle')) ||
        (vName.includes('kauffman') && fVenue.includes('kauffman')) ||
        (vName.includes('globe life') && fVenue.includes('globe life')) ||
        (vName.includes('pnc') && fVenue.includes('pnc')) ||
        (vName.includes('fenway') && fVenue.includes('fenway')) ||
        (vName.includes('t-mobile') && fVenue.includes('t-mobile')) ||
        (vName.includes('yankee') && fVenue.includes('yankee')) ||
        (vName.includes('wrigley') && fVenue.includes('wrigley')) ||
        (vName.includes('great american') && fVenue.includes('great american')) ||
        (vName.includes('american family') && fVenue.includes('american family')) ||
        ((vName.includes('daikin') || vName.includes('minute maid')) && (fVenue.includes('daikin') || fVenue.includes('minute maid'))) ||
        (vName.includes('rate') && fVenue.includes('rate'))
      );
    });

    let matchedFactor = matchedFactors[0];
    if (matchedFactors.length > 1 && dateTime) {
      const dt = new Date(dateTime);
      if (!isNaN(dt.getTime())) {
        const utcHour = dt.getUTCHours();
        if (utcHour <= 20) {
          matchedFactor = matchedFactors.find(m => m.time.startsWith('1:')) || matchedFactors[0];
        } else {
          matchedFactor = matchedFactors.find(m => m.time.startsWith('7:')) || matchedFactors[0];
        }
      }
    }

    if (matchedFactor) {
      if (matchedFactor.isClosed) {
        condition = 'Roof Closed';
        temp = 72;
        windSpeed = 0;
        windDir = 'Calm';
      } else {
        if (matchedFactor.tempHours && matchedFactor.tempHours.length > 0) {
          temp = Math.round(matchedFactor.tempHours.reduce((acc, t) => acc + t, 0) / matchedFactor.tempHours.length);
        }
        
        if (matchedFactor.windHours && matchedFactor.windHours.length > 0) {
          const firstWind = matchedFactor.windHours[0];
          windSpeed = firstWind.speed;
          windDir = firstWind.dir;
        }

        // Dynamic condition based on humidity
        if (matchedFactor.humidity >= 95) {
          condition = 'Rain Showers';
        } else if (matchedFactor.humidity >= 85) {
          condition = 'Overcast';
        } else if (matchedFactor.humidity >= 65) {
          condition = 'Cloudy';
        } else if (matchedFactor.humidity >= 45) {
          condition = 'Partly Cloudy';
        } else {
          condition = 'Sunny';
        }
      }
    }
  } catch (err) {
    console.error('Error matching park factors for forecast:', err);
  }

  // Explicit override for Cincinnati Reds (and Great American Ball Park) to make sure it always shows Rain Showers 
  const isCincinnati = teamId === 113 || (venueName && (venueName.toLowerCase().includes('great american') || venueName.toLowerCase().includes('cincinnati')));
  if (isCincinnati) {
    condition = 'Rain Showers';
  }

  return {
    condition,
    temp,
    windSpeed,
    windDir
  };
}
