import { useState, Fragment, useEffect, useMemo } from 'react';
import { MLBGame } from '../services/mlbService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Activity, RefreshCw, ChevronDown, ChevronUp, User, Info, Wind, Thermometer, Cloud, Sun, CloudRain, CloudLightning, MapPin, AlertTriangle, Droplets, Zap, ShieldCheck, Target, Edit2, Save, Scale, Flame, ExternalLink, ThermometerSun } from 'lucide-react';
import { calculateLiveThreat } from '../lib/projectionEngine';
import { getUmpireTendency, getGenericTendency } from '../lib/umpireEngine';
import { BallparkPalLogo } from './BallparkPalLogo';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Timestamp, collection, doc, setDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { VenueParkFactors, getDetailedParkFactor, DetailedParkFactor } from '../lib/leagueConstants';
import { BallparkPalFactor, findGameFactor } from '../services/ballparkPalService';

const parseWind = (windStr: string = '', homeId?: number, venue: string = '') => {
  const normalized = windStr.toLowerCase();
  const speedMatch = normalized.match(/\d+/);
  const speed = speedMatch ? parseInt(speedMatch[0]) : 0;
  
  const isOut = normalized.includes('out') || normalized.includes('to lf') || normalized.includes('to rf') || normalized.includes('to cf');
  const isIn = normalized.includes('in') || normalized.includes('from lf') || normalized.includes('from rf') || normalized.includes('from cf');

  // Cardinal Direction Mapping for known high-impact parks
  if (homeId === 112 || venue.includes('wrigley')) { // Wrigley
     const cardinal = normalized.match(/\b(n|s|e|w|nw|ne|sw|se|north|south|east|west|dir n|dir s)\b/);
     if (cardinal) {
        const dir = cardinal[0].replace('dir ', '');
        if (dir === 'n' || dir === 'north' || dir === 'ne' || dir === 'nw') return { direction: 'IN', speed };
        if (dir === 's' || dir === 'south' || dir === 'se' || dir === 'sw') return { direction: 'OUT', speed };
     }
  }

  if (isOut) return { direction: 'OUT', speed };
  if (isIn) return { direction: 'IN', speed };

  return { direction: 'CROSS', speed };
};

const getWeatherIcon = (condition: string = '') => {
  const c = condition.toLowerCase();
  if (c.includes('thunder') || c.includes('lightning') || c.includes('storm')) {
    return { icon: CloudLightning, color: 'text-yellow-400' };
  }
  if (c.includes('rain') || c.includes('shower') || c.includes('drizzle') || c.includes('mist')) {
    return { icon: CloudRain, color: 'text-blue-400' };
  }
  if (c.includes('overcast') || c.includes('cloud') || c.includes('gloomy') || c.includes('fog')) {
    return { icon: Cloud, color: 'text-slate-400' };
  }
  return { icon: Sun, color: 'text-amber-400' };
};



const getSpecialIntelligence = (game: MLBGame, parkFactors: BallparkPalFactor[] = []) => {
  const homeId = game.teams.home.team.id;
  const venue = (game.venue?.name || '').toLowerCase();
  const wind = parseWind(game.weather?.wind, homeId, venue);
  const condition = (game.weather?.condition || '').toLowerCase();
  
  const climate = getParkIntelligence(game);
  const temp = climate?.temp || 72;

  const badges: any[] = [];

  // Live Ballpark Pal Data Integration
  const awayAbbr = game.teams.away.team.abbreviation || '';
  const homeAbbr = game.teams.home.team.abbreviation || '';
  const awayName = game.teams.away.team.name || '';
  const homeName = game.teams.home.team.name || '';
  const livePalFactor = findGameFactor(parkFactors, awayAbbr, homeAbbr, awayName, homeName);

  if (parkFactors.length > 0 && !livePalFactor) {
    console.debug(`No Ballpark Pal factor found for ${awayAbbr}@${homeAbbr} / ${awayName}@${homeName}`);
  } else if (livePalFactor) {
    console.debug(`Found Ballpark Pal factor for ${livePalFactor.game}: ${livePalFactor.runs}`);
  }

  const isRetractable = venue.includes('loandepot') || venue.includes('globe life') || venue.includes('minute maid') || venue.includes('daikin') || venue.includes('american family') || venue.includes('rogers centre') || venue.includes('skydome') || venue.includes('chase field') || venue.includes('t-mobile') || venue.includes('safeco');
  const isExplicitlyOpen = condition.includes('open') || condition.includes('outdoor');
  const isExplicitlyClosed = (condition.includes('closed') || condition.includes('indoor') || condition.includes('dome'));
  
  const venueIsFlexibleRetractable = venue.includes('chase field') || venue.includes('minute maid') || venue.includes('daikin');
  const isStrictDome = venue.includes('tropicana') || (isRetractable && isExplicitlyClosed) || (isRetractable && !isExplicitlyOpen && !venueIsFlexibleRetractable);

  const detailedFactor = getDetailedParkFactor(game.venue?.name || '', game.weather?.condition);

  // 0. Live Ballpark Pal Intelligence (Priority Factor)
  if (livePalFactor) {
    const runChange = Math.round((livePalFactor.runs - 1) * 100);
    const hrChange = Math.round((livePalFactor.hr - 1) * 100);
    const hitsChange = Math.round((livePalFactor.hits - 1) * 100);
    
    const venueName = game.venue?.name || '';
    const venueShort = venueName.includes('Great American') 
      ? 'GREAT AMERICAN' 
      : venueName.toLowerCase().includes('chase field')
        ? 'CHASE FIELD'
        : venueName.split(' ')[0].toUpperCase();

    let palTitle = `${venueName}: Live Ballpark Pal Factor (Updated ${format(new Date(), 'MMM d')})
Runs: ${runChange > 0 ? '+' : ''}${runChange}%
HR: ${hrChange > 0 ? '+' : ''}${hrChange}%
Hits: ${hitsChange > 0 ? '+' : ''}${hitsChange}%`;

    if (livePalFactor.temp || livePalFactor.wind || livePalFactor.condition) {
      palTitle += `\n\nATMOSPHERIC ANALYSIS:`;
      if (livePalFactor.temp) palTitle += `\nTemp: ${livePalFactor.temp}°F`;
      if (livePalFactor.wind) palTitle += `\nWind: ${livePalFactor.wind}`;
      if (livePalFactor.condition) palTitle += `\nCondition: ${livePalFactor.condition}`;
    }

    palTitle += `\n\nLive environmental analysis sourced via daily updates`;

    badges.push({
      label: `${venueShort} (${runChange > 0 ? '+' : ''}${runChange}%)`,
      color: livePalFactor.runs >= 1.10 ? 'bg-red-500/20 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 
             livePalFactor.runs <= 0.90 ? 'bg-blue-600/20 text-blue-400 border-blue-600/30' :
             livePalFactor.runs > 1 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' : 
             'bg-slate-500/10 text-slate-400 border-white/5',
      icon: livePalFactor.runs >= 1.10 ? Zap : (livePalFactor.runs <= 0.90 ? ShieldCheck : Activity), 
      title: palTitle
    });
  }

  // 0. Static Intelligence Fallback (Primary Park identity)
  const intelligenceParks: Record<number, any> = {
    133: { label: 'SUTTER POWER', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10', icon: Zap, title: 'Sutter Health Park: +21% scoring environment with +31% Home Run appeal. Sourced via BallparkPal.com' },
    145: { label: 'RATE BOOST', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10', icon: Zap, title: 'Guaranteed Rate Field: +12% Run environment with +21% Home Run boost. Sourced via BallparkPal.com' },
    113: { label: 'LAUNCH PAD', color: 'bg-teal-500/10 text-teal-400 border-teal-500/10', icon: Activity, title: 'Great American BP: +5% scoring environment with +12% HR boost. Sourced via BallparkPal.com' },
    142: { label: 'TARGET CARRY', color: 'bg-teal-500/10 text-teal-400 border-teal-500/10', icon: Activity, title: 'Target Field: +5% scoring environment driven by +6% single-base carry. Sourced via BallparkPal.com' },
    111: { label: 'MONSTER SHIELD', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: ShieldCheck, title: 'Fenway Park: Neutral runs (0%) but heavy -25% Home Run suppression. Sourced via BallparkPal.com' },
    114: { label: 'CLE SHIELD', color: 'bg-slate-700/30 text-slate-400 border-slate-700/50', icon: ShieldCheck, title: 'Progressive Field: Stable -1% scoring environment with -7% HR suppression. Sourced via BallparkPal.com' },
    117: { label: 'DAIKIN SHIELD', color: 'bg-blue-900/20 text-blue-300 border-blue-800/30', icon: ShieldCheck, title: 'Daikin Park: -4% runs with heavy -11% extra-base suppression. Sourced via BallparkPal.com' },
    158: { label: 'DAIRY SHIELD', color: 'bg-blue-900/20 text-blue-300 border-blue-800/30', icon: ShieldCheck, title: 'American Family Field: -5% runs with -13% extra-base appeal. Sourced via BallparkPal.com' },
    110: { label: 'BIRD LAND', color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20', icon: ShieldCheck, title: 'Oriole Park: -5% runs with -17% Home Run suppression. Sourced via BallparkPal.com' },
    134: { label: 'PNC SHIELD', color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20', icon: ShieldCheck, title: 'PNC Park: -5% runs with drastic -22% Home Run reduction. Sourced via BallparkPal.com' },
    119: { label: 'LA COOL', color: 'bg-indigo-900/20 text-indigo-400 border-indigo-900/20', icon: ShieldCheck, title: 'Dodger Stadium: -6% Run environment despite +8% HR carry. Sourced via BallparkPal.com' },
    141: { label: 'NORTHERN LID', color: 'bg-slate-800/50 text-slate-500 border-slate-700/50', icon: ShieldCheck, title: 'Rogers Centre: -6% run environment with stable HR conditions. Sourced via BallparkPal.com' },
    140: { label: 'TEXAS TURF', color: 'bg-slate-800/50 text-slate-500 border-slate-700/50', icon: ShieldCheck, title: 'Globe Life Field: -7% overall scoring production projected today. Sourced via BallparkPal.com' },
    144: { label: 'TRUIST TRAP', color: 'bg-red-900/20 text-red-400 border-red-900/20', icon: ShieldCheck, title: 'Truist Park: Significant -11% scoring environment with -16% HR boost. Sourced via BallparkPal.com' },
    121: { label: 'CITI COLD', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: ShieldCheck, title: 'Citi Field: Massive -15% scoring environment with -29% extra-base suppression. Sourced via BallparkPal.com' },
    109: { label: 'SNAKE PIT', color: 'bg-slate-700/30 text-slate-400 border-slate-700/50', icon: Activity, title: 'Chase Field: Climate controlled state active. Sourced via BallparkPal.com' }
  };

  const isChase = (game.venue?.name || '').toLowerCase().includes('chase field');
  const isAstros = (game.venue?.name || '').toLowerCase().includes('minute maid') || (game.venue?.name || '').toLowerCase().includes('daikin');
  const isChaseClosed = isChase && isExplicitlyClosed && !isExplicitlyOpen;
  const isAstrosClosed = isAstros && isExplicitlyClosed && !isExplicitlyOpen;

  if (isChaseClosed) {
    badges.push({ label: 'HUMIDOR CONTROL', color: 'bg-teal-500/10 text-teal-300 border-teal-500/20', icon: Droplets, title: 'Chase Field (Closed): Climate controlled and humidor storage negate high desert volatility. Sourced via BallparkPal.com' });
  }

  if (isAstros && !isAstrosClosed && wind.direction === 'OUT' && wind.speed >= 5) {
    badges.push({ 
      label: 'ASTROS VENT', 
      color: 'bg-red-500/20 text-red-500 border-red-500/30', 
      icon: Wind, 
      title: `Minute Maid Wind Boost: ${isExplicitlyOpen ? 'Confirmed' : 'Potential'} tailwind boost to Left Field power alley (${wind.speed}mph OUT). Sourced via Ballpark Pal Daily Update` 
    });
  }

  if (badges.length === 0) {
    const tid = Number(homeId);
    if (intelligenceParks[tid]) {
      badges.push(intelligenceParks[tid]);
    } else if (isStrictDome && (venue.includes('tropicana') || isRetractable)) {
      badges.push({ 
        label: 'DOME CONTROL', 
        color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', 
        icon: ShieldCheck, 
        title: `${game.venue?.name}: Atmospheric conditions are precisely regulated; outside weather is negated.` 
      });
    } else if (isRetractable && isExplicitlyOpen) {
       const venueShort = (game.venue?.name || '').split(' ')[0].toUpperCase();
       badges.push({ 
         label: `${venueShort} ROOF OPEN`, 
         color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', 
         icon: Sun, 
         title: `${game.venue?.name}: Roof is reported OPEN. Outdoor atmospheric conditions and wind are active.` 
       });
    } else if (detailedFactor) {
      const runVal = detailedFactor.runs;
      const runChange = Math.round((runVal - 1) * 100);
      const venueName = game.venue?.name || '';
      const venueShort = venueName.includes('Great American') 
        ? 'GREAT AMERICAN' 
        : venueName.toLowerCase().includes('chase field')
          ? 'CHASE FIELD'
          : venueName.split(' ')[0].toUpperCase();
          
      badges.push({ 
        label: `${venueShort} (${runChange > 0 ? '+' : ''}${runChange}%)`, 
        color: runVal >= 1.10 ? 'bg-red-500/20 text-red-500 border-red-500/20' : 
               runVal <= 0.90 ? 'bg-blue-600/20 text-blue-400 border-blue-600/30' :
               runVal > 1 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' : 
               'bg-slate-500/10 text-slate-400 border-white/5', 
        icon: runVal >= 1.10 ? Zap : (runVal <= 0.90 ? ShieldCheck : Activity), 
        title: `${game.venue?.name}: Daily environment factor. Sourced via daily updates.`
      });
    }
  }

  // Final fallbacks if still empty
  if (badges.length === 0) {
    const isWrigley = homeId === 112 || venue.includes('wrigley');
    const isCoors = homeId === 115 || venue.includes('coors');

    if (isWrigley) {
      if (wind.direction === 'OUT' && wind.speed >= 3) {
        badges.push({ label: 'WRIGLEY BOOST', color: 'bg-red-600/20 text-red-500 border-red-500/30', icon: Wind, title: 'Wrigley Field Potential: Significant wind blowing out favors offensive clusters (+2.27 Runs).' });
      } else if (wind.direction === 'IN' || temp < 55) {
        badges.push({ label: 'WRIGLEY SHIELD', color: 'bg-blue-700/30 text-blue-300 border-blue-500/40', icon: ShieldCheck, title: `Extreme Suppression (-10% Runs): ${wind.direction === 'IN' ? 'Headwind' : 'Cold air'} deadening fly balls tonight.` });
      }
    } else if (isCoors) {
      badges.push({ label: 'ALTITUDE FACTOR', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: Activity, title: 'Coors Field (+2.94 Runs): 5,280ft elevation consistently boosts fly ball carry.' });
    } else {
      badges.push({ 
        label: 'STABLE ATMOSPHERE', 
        color: 'bg-slate-500/10 text-slate-400 border-white/5', 
        icon: Activity, 
        title: 'Current readings show a stable atmospheric baseline. Sourced via Ballpark Pal daily weather data.' 
      });
    }
  }

  return badges;
};

const getEnvironmentalWarning = (game: MLBGame) => {
  const homeId = game.teams.home.team.id;
  const venue = (game.venue?.name || '').toLowerCase();
  const condition = (game.weather?.condition || '').toLowerCase();
  const wind = parseWind(game.weather?.wind, homeId, venue);

  // Domes negate environmental warnings
  const isExplicitlyOpen = condition.includes('open') || condition.includes('outdoor') || ['clear', 'sunny', 'fair', 'partly'].some(k => condition.includes(k));
  const isExplicitlyClosed = condition.includes('closed') || condition.includes('indoor') || condition.includes('dome');
  const isRetractable = venue.includes('loandepot') || venue.includes('globe life') || venue.includes('minute maid') || venue.includes('american family') || venue.includes('rogers centre') || venue.includes('skydome') || venue.includes('chase field') || venue.includes('t-mobile') || venue.includes('safeco');
  const venueIsFlexibleRetractable = venue.includes('chase field') || venue.includes('minute maid') || venue.includes('daikin');
  const isStrictDome = venue.includes('tropicana') || (isRetractable && isExplicitlyClosed) || (isRetractable && !isExplicitlyOpen && !venueIsFlexibleRetractable);
  
  if (isStrictDome) return null;
  
  // Specific Wrigley/Coors Warnings
  if (homeId === 115) return { label: 'THIN AIR BLOWOUT', color: 'text-orange-400', icon: Zap };
  
  if (homeId === 112) {
    if (wind.direction === 'OUT' && wind.speed > 5) return { label: 'WRIGLEY WIND BOOST', color: 'text-red-400', icon: Zap };
    if (wind.direction === 'CROSS' && wind.speed > 12) return { label: 'WRIGLEY CROSSWIND', color: 'text-orange-400', icon: Wind };
    if (wind.direction === 'IN' && wind.speed > 10) return { label: 'WRIGLEY HEADWIND', color: 'text-blue-400', icon: ShieldCheck };
  }

  // General extreme wind warnings
  if (wind.direction === 'OUT' && wind.speed >= 12) return { label: 'WIND BOOST', color: 'text-red-400', icon: Zap };
  if (wind.direction === 'CROSS' && wind.speed >= 18) return { label: 'HIGH WIND RISK', color: 'text-orange-400', icon: Wind };
  
  return null;
};

interface GameLogProps {
  games: MLBGame[];
  gameLines: Record<number, number>;
  manualLines?: Record<number, number>;
  parkFactors?: BallparkPalFactor[];
}

const getParkIntelligence = (game: MLBGame) => {
  const tempStr = game.weather?.temp?.toString() || "";
  const temp = parseInt(tempStr.match(/\d+/)?.[0] || "72");
  const windStr = game.weather?.wind || "";
  const windDirRaw = windStr.toLowerCase();
  const homeId = game.teams.home.team.id;
  const venue = (game.venue?.name || '').toLowerCase();
  
  const wind = parseWind(windStr, homeId, venue);
  const windSpeed = wind.speed;
  const condition = (game.weather?.condition || '').toLowerCase();
  
  let impulse: 'positive' | 'negative' | 'neutral' = 'neutral';
  
  // Directional Detection
  const isOut = wind.direction === 'OUT';
  const isIn = wind.direction === 'IN';
  const isToRight = windDirRaw.includes('to rf') || windDirRaw.includes('from lf') || (windDirRaw.includes('r to l') && isIn) || (windDirRaw.includes('l to r') && isOut);
  const isToLeft = windDirRaw.includes('to lf') || windDirRaw.includes('from rf') || (windDirRaw.includes('l to r') && isIn) || (windDirRaw.includes('r to l') && isOut);

  const rainKeywords = ['rain', 'shower', 'storm', 'drizzle', 'precip', 'thunder', 'lightning', 'mist'];
  const isRainy = rainKeywords.some(k => condition.includes(k));
  const isExplicitlyOpen = condition.includes('open') || condition.includes('outdoor') || ['clear', 'sunny', 'fair', 'partly', 'night'].some(k => condition.includes(k));
  const isExplicitlyClosed = (condition.includes('closed') || condition.includes('indoor') || condition.includes('dome')) && !isExplicitlyOpen;
  const isRetractable = venue.includes('loandepot') || venue.includes('globe life') || venue.includes('minute maid') || venue.includes('american family') || venue.includes('rogers centre') || venue.includes('skydome') || venue.includes('chase field') || venue.includes('t-mobile') || venue.includes('safeco');
  const venueIsFlexibleRetractable = venue.includes('chase field') || venue.includes('minute maid') || venue.includes('daikin');
  const isStrictDome = venue.includes('tropicana') || (isRetractable && isExplicitlyClosed) || (isRetractable && !isExplicitlyOpen && !venueIsFlexibleRetractable);
  const isRetractableSeattle = venue.includes('t-mobile');

  if (isStrictDome) {
    const domeName = venue.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    // Tropicana is the primary focus but this covers others too
    const isTropicana = venue.includes('tropicana');
    const isChase = venue.includes('chase field');
    
    return { 
      impulse: 'neutral', 
      isDome: true,
      isHumidor: isChase && (condition.includes('closed') || condition.includes('indoor')),
      message: isTropicana 
        ? `Tropicana Field: DOME CONTROL. Atmospheric conditions are precisely regulated; outside weather is irrelevant to play dynamics.`
        : (isChase && (condition.includes('closed') || condition.includes('indoor')))
        ? `Chase Field (Closed): HUMIDOR REGULATED. Climate control and humidor storage negate desert atmospheric thinning.`
        : isChase 
        ? `Chase Field (Open): DESERT ENVIRONMENT. Atmospheric thinning and dry heat are active today.`
        : `Controlled Environment at ${domeName}. Outside weather is negated; play will strictly follow baseline park factors and player mechanics.`,
      temp, windStr, windSpeed, condition 
    };
  }

  let techReport = "";
  let hasSpecificClimateIntel = false;

  // 0. Park Specific Intelligence (Daily Report Overrides)
  const intelligenceReports: Record<number, { impulse: 'positive' | 'negative' | 'neutral', tech: string }> = {
    111: { impulse: 'positive', tech: "Fenway Park (Green Monster): Today's top-rated venue with a +11% scoring boost. Expect +25% extra-base appeal. " },
    118: { impulse: 'negative', tech: "Kauffman Stadium (Royal Depth): A significant -19% Home Run reduction and -9% overall runs projected. " },
    113: { impulse: 'neutral', tech: "Great American BP (Launch Pad): Stable environment today with only marginal +1% runs and +3% HR activity. " },
    143: { impulse: 'positive', tech: "Citizens Bank Park (Philly Power): Significant power environment with +13% HR boost and +8% overall runs. " },
    119: { impulse: 'positive', tech: "Dodger Stadium (LA HR Factory): Elite +22% Home Run boost projected for today's atmospheric profile. " },
    117: { impulse: 'neutral', tech: "Minute Maid Park: Retractable roof state actively monitored. Primary offensive driver is the 'Crawford Boxes' pull-side geometry (+5% HR). " },
    137: { impulse: 'negative', tech: "Oracle Park (Pitchers Haven): A massive -22% Home Run reduction makes this a premier defensive venue today (-1% runs). " },
    135: { impulse: 'negative', tech: "Petco Park (Padre Shield): Drastic -9% scoring environment with -22% extra-base hit suppression. " },
    114: { impulse: 'negative', tech: "Progressive Field (CLE Shield): Extreme -25% Home Run reduction active today (-8% overall runs). " },
    110: { impulse: 'positive', tech: "Oriole Park (Bird Land): +5% scoringEnvironment with +9% extra-base carry and +7% singles. " },
    145: { impulse: 'negative', tech: "Guaranteed Rate Field (Chicago Cold): -9% scoring environment with heavy -16% extra-base hit suppression and -13% HR. " },
    158: { impulse: 'negative', tech: "American Family Field (Dairy Crush): -14% extra-base appeal suppresses overall run production by -6%, despite +5% HR. " },
    141: { impulse: 'negative', tech: "Rogers Centre (Northern Lid): -6% scoring environment expected with -5% extra-base hit suppression. " },
    146: { impulse: 'negative', tech: "LoanDepot Park (Miami Depot): Heavy -15% Home Run suppression and -6% overall run environment is active. " },
    140: { impulse: 'negative', tech: "Globe Life Field (Texas Turf): -11% HR and -8% overall run production favors pitchers today. " },
    109: { impulse: 'neutral', tech: "Chase Field (Snake Pit): +12% extra-base carry is the primary driver in a strictly neutral scoring environment (+1%). " }
  };

  const currentIntel = intelligenceReports[Number(homeId)];
  if (currentIntel && !isStrictDome) {
    hasSpecificClimateIntel = true;
    impulse = currentIntel.impulse;
    techReport += currentIntel.tech;
  }

  const isWrigley = homeId === 112 || venue.includes('wrigley');
  const isCoors = homeId === 115 || venue.includes('coors');
  const isTmobile = isRetractableSeattle || homeId === 136 || venue.includes('t-mobile');
  const isPetco = homeId === 135 || venue.includes('petco');

  if (hasSpecificClimateIntel) {
    // Already handled by Daily Report intelligenceReports
  } else if (isWrigley) {
    hasSpecificClimateIntel = true;
    const wrigleyReport = `Wrigley Graveyard (-35% HR, -10% Runs): ${windSpeed}mph ${isIn ? 'headwind' : 'air'} and ${temp}°F temp are suppressing elite carry. `;
    if ((isIn || wind.direction === 'CROSS') && (windSpeed >= 5 || temp < 55)) {
       impulse = 'negative';
       techReport += wrigleyReport;
    } else if (isOut && windSpeed >= 5) {
       impulse = 'positive';
       techReport += `Wrigley Wind Boost (+2.27 Potential): Significant tailwind favors offensive carry today. `;
    } else {
       techReport += `Wrigley Field Neutral: Atmospheric conditions are within the 5% baseline. `;
    }
  } else if (isCoors) {
    hasSpecificClimateIntel = true;
    impulse = 'positive';
    if (temp < 65 && !isRainy) {
       techReport += `Coors Thin Air Factor (+2.94 Runs): Low humidity and 5,280ft elevation are compensating for the ${temp}°F temperature, keeping air resistance at a minimum. `;
    } else {
       techReport += `Coors Altitude Factor (+2.94 Runs): 5,280ft elevation lowers air density, boosting fly ball carry and reducing breaking movement. `;
    }
  } else if (homeId === 133 || venue.includes('sutter health')) { // Sacramento
    hasSpecificClimateIntel = true;
    if (temp >= 70 && windSpeed >= 7) {
      impulse = 'positive';
      techReport += `Sacramento Offense (+1.39 Runs): The ${temp}°F heat and "Very High" wind receptivity provide an elite scoring pulse. `;
    } else {
      techReport += `Sacramento Scoring Pulse (+1.39 Potential): Minor league dimensions favor offensive clusters today. `;
    }
  } else if (isTmobile) {
    hasSpecificClimateIntel = true;
    impulse = 'negative';
    techReport += `T-Mobile Park dynamics (-1.45 Runs): Cold sea-level air and marine layer presence significantly suppress power output. `;
  } else if (homeId === 138 || venue.includes('busch')) { // Cardinals
    hasSpecificClimateIntel = true;
    impulse = 'negative';
    techReport += `Busch Stadium Suppression (-1.26 Runs): Historically a premier "Under" venue in these atmospheric conditions. `;
  } else if (homeId === 137 || venue.includes('oracle')) { // Oracle Park
    if (temp < 62 || condition.includes('damp') || condition.includes('gloomy')) {
      hasSpecificClimateIntel = true;
      impulse = 'negative';
      techReport += "Oracle Marine Layer (-0.45 Typical): Cold, damp air from the bay is creating a heavy atmospheric lid. ";
    }
  } else if (isPetco) {
    if (temp < 68 && condition.includes('humid')) {
       hasSpecificClimateIntel = true;
       impulse = 'negative';
       techReport += `Petco Marine Layer (-0.85 Runs): Evening humidity is thickening the air over the field; traditional power suppression is active. `;
    }
  } else if (homeId === 147) { // Yankees
    if (condition.includes('humid')) {
      hasSpecificClimateIntel = true;
      impulse = 'positive';
      techReport += "Bronx Humidity (-0.65 Base but +Offset): Moist air at sea level often aids the 'Short Porch' carry in the evening. ";
    }
  } else if (homeId === 143 && isOut) { // Citizens Bank
    hasSpecificClimateIntel = true;
    impulse = 'positive';
    techReport += "Philly Wind Tunnel (+0.44 Potential): The outbound wind vector is notoriously active at this venue. ";
  } else if ((homeId === 117 || venue.includes('minute maid') || venue.includes('daikin')) && isOut && !isStrictDome) {
    hasSpecificClimateIntel = true;
    impulse = 'positive';
    techReport += `Astros Wind Boost: With the ${isExplicitlyOpen ? 'roof OPEN' : 'potential for the roof to open'}, the ${windSpeed}mph tailwind provides a significant power boost to the short porch in Left Field. `;
  }
  
  // 1. Temperature Analysis (Physics of Air Density)
  if (!hasSpecificClimateIntel) {
    if (temp >= 94) {
      impulse = 'positive';
      techReport += `${condition.includes('clear') ? 'Desert-like' : 'Extreme'} ${temp}°F heat will keep the air extremely thin (expanded molecules), maximizing ball flight with minimal drag. `;
    } else if (temp >= 82) {
      impulse = 'positive';
      techReport += `Warm ${temp}°F conditions are classic for higher offense, favoring the carry of fly balls as air molecules provide less resistance due to thermal expansion. `;
    } else if (temp >= 72) {
      techReport += `Standard ${temp}°F air provides consistent travel with a predictable atmospheric baseline for air density and pressure. `;
    } else if (temp >= 62) {
      techReport += `Mild ${temp}°F air is beginning to stabilize, offering traditional defensive travel conditions with standard atmospheric friction. `;
    } else if (temp >= 50) {
      techReport += `Cool ${temp}°F air is beginning to thicken; the increased density will likely increase drag and peel a few feet off fly ball distance. `;
    } else if (temp > 0) {
      if (windSpeed >= 10) {
        impulse = 'negative';
        techReport += `Chilly ${temp}°F conditions combined with ${windSpeed}mph winds create dense air that will likely stifle deep fly balls. `;
      } else {
        techReport += `Chilly ${temp}°F conditions increase air density and atmospheric resistance. `;
      }
    } else {
      techReport += "Atmospheric data normalizing... ";
    }
  }

  // 2. Wind Vector Analysis
  if (windSpeed >= 15) {
    if (!hasSpecificClimateIntel) {
      impulse = isOut ? 'positive' : (isIn ? 'negative' : impulse);
    }
    techReport += `A punishing ${windSpeed}mph ${isOut ? 'tailwind' : isIn ? 'headwind' : 'cross-current'} is dominating the field. `;
    if (isOut) techReport += "Routine fly balls have a massive probability of being carried over the fence by the sheer force of the gust. ";
    else if (isIn) techReport += "Hitters will be fighting a severe atmospheric wall; deep fly balls are likely to die at the warning track. ";
    else techReport += "Erratic cross-currents will make defensive tracking and outfield communication a major challenge today. ";
  } else if (windSpeed >= 10) {
    if (isOut) {
      if (!hasSpecificClimateIntel) impulse = impulse === 'negative' ? 'neutral' : 'positive';
      techReport += `The steady ${windSpeed}mph tailwind provides a meaningful boost to exit velocity carry. `;
    } else if (isIn) {
      if (!hasSpecificClimateIntel) impulse = impulse === 'positive' ? 'neutral' : 'negative';
      techReport += `Persistent ${windSpeed}mph resistance is present, favoring ground-ball pitchers who can avoid the air. `;
    } else if (isToRight) {
      techReport += `Significant ${windSpeed}mph push toward Right Field favors left-handed pull hitters today. `;
    } else if (isToLeft) {
      techReport += `Significant ${windSpeed}mph push toward Left Field favors right-handed pull hitters today. `;
    } else {
      techReport += `Brisk ${windSpeed}mph cross-breeze may impart late movement on fly balls. `;
    }
  } else if (windSpeed > 4) {
    techReport += `A marginal ${windSpeed}mph breeze is present, though its impact will likely be secondary to humidity and temperature. `;
  } else {
    techReport += "Calm wind conditions suggest the game will play true to its baseline park dimensions. ";
  }

  // 3. Moisture & Environmental Factors
  if (isRainy) {
    impulse = 'negative';
    techReport += `Precipitation Risk (${condition}): High-friction environment and damp ball surfaces favor pitchers and "Under" outcomes. `;
  } else if (condition.includes('humid') && temp > 72) {
    techReport += `Thermal Humidity: At ${temp}°F, the moist air reduced molecular weight (water vapor is lighter than dry air), aiding ball carry. `;
  } else if (condition.includes('clear')) {
    techReport += "Visibility Factor: Optimal contrast and lighting should benefit hitters' reaction times. ";
  }

  const isChase = venue.includes('chase field');
  
  return { 
    impulse, 
    message: techReport.trim(), 
    temp, 
    windStr, 
    windSpeed, 
    condition, 
    isDome: false, 
    isHumidor: isChase && (condition.includes('closed') || condition.includes('indoor')) && !(condition.includes('open') || condition.includes('outdoor'))
  };
};

const getUmpireIntelligence = (umpireName: string) => {
  const tendency = getUmpireTendency(umpireName) || getGenericTendency(umpireName);
  const runsPerGame = tendency.runsPerGame;
  const strikeZone = tendency.strikeZone;
  const Krate = tendency.Krate;
  
  let impulse: 'positive' | 'negative' | 'neutral' = 
    tendency.tendency === 'Hitter Friendly' ? 'positive' : 
    tendency.tendency === 'Pitcher Friendly' ? 'negative' : 'neutral';

  let techReport = "";

  // 1. Strike Zone Analysis
  if (strikeZone === 'Small') {
    impulse = 'positive';
    techReport += `${umpireName} is known for a "tight" or "micro" strike zone, forcing pitchers to come over the heart of the plate. `;
  } else if (strikeZone === 'Large') {
    impulse = 'negative';
    techReport += `${umpireName} typically maintains an "expansive" zone, often rewarding pitchers who can paint the corners and "chase" hitters. `;
  } else {
    techReport += `${umpireName} generally enforces a standard, predictable strike zone with few unexpected deviations. `;
  }

  // 2. Performance Metric Analysis (Runs & K-Rate)
  if (runsPerGame >= 10.0) {
    impulse = 'positive';
    techReport += `Statistically, games managed by this official average a high ${runsPerGame} runs, suggesting a severe offensive advantage. `;
  } else if (runsPerGame <= 8.5) {
    impulse = 'negative';
    techReport += `With a career average of just ${runsPerGame} runs per game, this official is a notable "Pitcher's Umpire". `;
  }

  if (Krate >= 0.20) {
    techReport += `A high strikeout frequency (${(Krate * 100).toFixed(1)}%) indicates a low tolerance for "taking" close two-strike pitches. `;
  } else if (Krate <= 0.15) {
    techReport += `A lower-than-average strikeout rate suggests hitters are often given the benefit of the doubt on borderline 50/50 calls. `;
  }

  // 3. Narrative Synthesis
  if (impulse === 'positive' && runsPerGame > 9.5) {
    techReport += "Expect high-stress innings for pitchers and frequent deep counts.";
  } else if (impulse === 'negative' && strikeZone === 'Large') {
    techReport += "High-velocity arms and breaking-ball specialists will likely leverage the wider margins today.";
  } else if (impulse === 'neutral') {
    techReport += "Performance today will likely boil down to pure player execution rather than variable officiating.";
  }

  return { impulse, message: techReport.trim(), tendency };
};

export function GameLog({ games, gameLines, manualLines = {}, parkFactors = [] }: GameLogProps) {
  const { user } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === 'mattlajiness@gmail.com';
  
  const [expandedGameId, setExpandedGameId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'All' | 'Live' | 'Final' | 'Preview'>('All');

  const apexGamePk = useMemo(() => {
    if (!games.length) return null;
    const sorted = [...games].sort((a, b) => {
      const scoreA = (a.teams.away.score || 0) + (a.teams.home.score || 0);
      const scoreB = (b.teams.away.score || 0) + (b.teams.home.score || 0);
      return scoreB - scoreA;
    });
    const topScore = (sorted[0].teams.away.score || 0) + (sorted[0].teams.home.score || 0);
    if (topScore === 0) return null;
    return sorted[0].gamePk;
  }, [games]);

  const [editingLineId, setEditingLineId] = useState<number | null>(null);
  const [tempLine, setTempLine] = useState<string>('');

  const handleSaveLine = async (gamePk: number) => {
    if (!isAdmin) return;
    const total = parseFloat(tempLine);
    if (isNaN(total)) {
      toast.error("Invalid line total");
      return;
    }

    try {
      await setDoc(doc(db, 'gameLines', gamePk.toString()), {
        gamePk,
        total,
        updatedAt: Timestamp.now(),
        updatedBy: user?.uid
      });
      setEditingLineId(null);
      toast.success("Game line updated");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `gameLines/${gamePk}`);
    }
  };

  const toggleGame = (gameId: number) => {
    setExpandedGameId(expandedGameId === gameId ? null : gameId);
  };

  const filteredGames = games.filter(game => {
    if (filter === 'All') return true;
    return game.status.abstractGameState === filter;
  });

  const getThreatLevel = (game: MLBGame) => {
    if (!game.linescore || game.status.abstractGameState !== 'Live') return 0;
    const { offense, outs } = game.linescore;
    if (!offense) return 0;

    // Trigger ONLY with Runners in Scoring Position (2nd or 3rd base)
    if (!offense.second && !offense.third) return 0;

    return calculateLiveThreat({
      first: !!offense.first,
      second: !!offense.second,
      third: !!offense.third,
      outs: (outs || 0) >= 3 ? 0 : (outs || 0)
    });
  };

  const getRainRisk = (game: MLBGame) => {
    const condition = game.weather?.condition?.toLowerCase() || '';
    const status = (game.status?.detailedState || '').toLowerCase();
    const statusCode = (game.status?.statusCode || '').toUpperCase();
    const rainKeywords = ['rain', 'shower', 'storm', 'drizzle', 'precip', 'thunder', 'lightning', 'mist'];
    
    // If it's a delay, check if it's likely rain-related
    const isDelay = status.includes('delay') || statusCode === 'D' || statusCode === 'DR' || statusCode === 'DI';
    
    if (isDelay) {
      const isRainy = rainKeywords.some(keyword => condition.includes(keyword)) || status.includes('rain') || status.includes('weather') || status.includes('t-storm');
      
      if (isRainy) {
        return `Raining (${game.status.detailedState})`;
      }
    }
    
    // User requested to only show rain badges if rain is causing a delay
    return null;
  };

  return (
    <div className="dashboard-card border-slate-800 shadow-xl transition-all duration-300">
      <div className="stitching-top" />
      <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-salami-red rounded-full" />
          <div className="flex flex-col">
            <h2 className="font-mono font-black text-white uppercase tracking-tighter text-xl">
              Daily Scorecard
            </h2>
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-[0.2em] mt-0.5 flex items-center flex-wrap gap-x-2 gap-y-1">
              Live updates • Umpire Intelligence • 
              <a href="https://ballparkpal.com" target="_blank" rel="noreferrer" className="text-emerald-500 hover:text-emerald-400 inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/5 rounded-full border border-emerald-500/10 group">
                <BallparkPalLogo className="w-3.5 h-3.5 transition-transform group-hover:rotate-12" />
                Live daily weather/park factor data
                <ExternalLink className="w-2 h-2 opacity-50 group-hover:opacity-100" />
              </a> 
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['All', 'Live', 'Final', 'Preview'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                filter === f 
                  ? "bg-slate-800 text-salami-red shadow-sm" 
                  : "text-slate-500 hover:text-slate-400"
              )}
            >
              {f === 'Preview' ? 'Upcoming' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-800">
        {filteredGames.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 opacity-20" />
            </div>
            <div className="font-black uppercase tracking-widest text-sm mb-1">No {filter !== 'All' ? filter : ''} Games</div>
            <div className="text-[10px] font-mono uppercase">
              {filter === 'Live' ? 'Waiting for games to start' : 
               filter === 'Final' ? 'No games have finished yet' :
               filter === 'Preview' ? 'All games have started' : 'Waiting for next scheduled pitch'}
            </div>
          </div>
        ) : (
          <div>
            {/* Mobile View: Card List */}
            <div className="block md:hidden divide-y divide-slate-800">
              {filteredGames.map((game, index) => {
                if (!game || !game.teams) return null;
                const total = (game.teams.away?.score || 0) + (game.teams.home?.score || 0);
                const isExpanded = expandedGameId === game.gamePk;

                const riskMessage = getRainRisk(game);

                return (
                  <motion.div
                    key={game.gamePk}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex flex-col"
                  >
                    <div 
                      className="p-4 space-y-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
                      onClick={() => toggleGame(game.gamePk)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {game.status?.detailedState !== 'Delayed Start' ? (
                            <div className={cn(
                              "text-[8px] font-mono font-black px-2 py-0.5 rounded shadow-sm",
                              game.status.abstractGameState === 'Live' ? "bg-red-600 text-white" :
                              game.status.abstractGameState === 'Final' ? "bg-green-600 text-white" :
                              "bg-slate-800 text-slate-400"
                            )}>
                              {game.status.abstractGameState === 'Live' && game.linescore?.currentInningOrdinal 
                                ? `${game.linescore.isTopInning ? 'TOP' : 'BOT'} ${game.linescore.currentInningOrdinal}`.toUpperCase()
                                : (game.status?.detailedState || '').toUpperCase()}
                            </div>
                          ) : <div />}
                          
                          {game.gamePk === apexGamePk && (
                            <div className="bg-orange-500/20 border border-orange-500/30 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                              <Flame className="w-2.5 h-2.5 text-orange-400" />
                              <span className="text-[7px] font-mono font-black text-orange-400 uppercase tracking-tighter">Daily Apex</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {game.status.abstractGameState === 'Live' && getThreatLevel(game) > 0.25 && (
                             <button
                               type="button" 
                               className={cn(
                                 "flex items-center gap-1 px-1.5 py-0.5 rounded shadow-sm cursor-help select-none touch-manipulation appearance-none outline-none",
                                 getThreatLevel(game) > 0.7 ? "bg-red-600 text-white" : "bg-salami-red/20 text-salami-red"
                               )}
                               onClick={(e) => {
                                 e.preventDefault();
                                 e.stopPropagation();
                                 toast.info(`Live scoring threat: ${getThreatLevel(game).toFixed(2)} expected runs`, { duration: 3000, position: 'bottom-center' });
                               }}
                             >
                               <AlertTriangle className={cn("w-3 h-3", getThreatLevel(game) > 0.7 ? "text-white" : "text-salami-red")} />
                               <span className="text-[7px] font-mono font-black uppercase tracking-widest">
                                 {getThreatLevel(game) > 0.7 ? 'High Threat' : 'Threat'}
                               </span>
                             </button>
                          )}
                          {(() => {
                             const badges = [];
                             
                             // 1. Weather/Risk
                             const risk = getRainRisk(game);
                             if (risk) {
                               const isRain = risk.startsWith('Raining') || risk.includes('Risk');
                               badges.push(
                                 <button 
                                   key="risk"
                                   type="button" 
                                   className="flex items-center gap-1 bg-blue-500/20 px-1.5 py-0.5 rounded cursor-help select-none touch-manipulation appearance-none outline-none"
                                   onClick={(e) => {
                                     e.preventDefault();
                                     e.stopPropagation();
                                     toast.info(`${risk}. Game at risk of delay or cancellation.`, { duration: 3000, position: 'bottom-center' });
                                   }}
                                 >
                                   {isRain ? <CloudRain className="w-2.5 h-2.5 text-blue-400" /> : <Droplets className="w-2.5 h-2.5 text-blue-400" />}
                                   <span className="text-[7px] font-mono font-black text-blue-400 uppercase tracking-widest">{risk}</span>
                                 </button>
                               );
                              }
                              // 2. Park Intelligence 
                              const climate = getParkIntelligence(game);
                              
                              // 2. Intelligence Badges
                              const intelBadges = getSpecialIntelligence(game, parkFactors);
                              intelBadges.forEach(intel => {
                                badges.push(
                                  <button 
                                    key={intel.label}
                                    type="button"
                                    className={cn(
                                      "flex items-center gap-1 px-1.5 py-0.5 rounded border shadow-sm cursor-help select-none touch-manipulation appearance-none outline-none",
                                      intel.color
                                    )}
                                    title={intel.title}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (intel.title) toast.info(intel.title, { duration: 3000, position: 'bottom-center' });
                                    }}
                                  >
                                    <intel.icon className="w-2.5 h-2.5" />
                                    <span className="text-[8px] font-mono font-black uppercase tracking-widest">
                                      {intel.label}
                                    </span>
                                  </button>
                                );
                              });

                             return badges;
                          })()}
                          <span className="text-[9px] font-mono text-slate-400 font-bold whitespace-nowrap ml-1">
                            {game.status.abstractGameState === 'Preview' 
                              ? new Date(game.gameDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : game.status.abstractGameState === 'Live' ? "LIVE" : "FINAL"}
                          </span>
                          {isExpanded ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-8 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img 
                                src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`} 
                                alt=""
                                className="w-5 h-5 object-contain"
                                referrerPolicy="no-referrer"
                              />
                              <span className="text-[11px] font-bold text-slate-300 truncate max-w-[100px]">
                                {game.teams.away.team.name.split(' ').pop()}
                              </span>
                              {game.teams.away.probablePitcher && (
                                <span className="text-[8px] font-mono text-slate-500 truncate max-w-[80px]">
                                  {game.teams.away.probablePitcher.fullName.split(' ').pop()}
                                  {game.teams.away.probablePitcher.era && ` (${game.teams.away.probablePitcher.era})`}
                                </span>
                              )}
                            </div>
                            <span className="font-mono font-black text-sm text-white">
                              {game.teams.away.score ?? '-'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img 
                                src={`https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`} 
                                alt=""
                                className="w-5 h-5 object-contain"
                                referrerPolicy="no-referrer"
                              />
                              <span className="text-[11px] font-bold text-slate-300 truncate max-w-[100px]">
                                {game.teams.home.team.name.split(' ').pop()}
                              </span>
                              {game.teams.home.probablePitcher && (
                                <span className="text-[8px] font-mono text-slate-500 truncate max-w-[80px]">
                                  {game.teams.home.probablePitcher.fullName.split(' ').pop()}
                                  {game.teams.home.probablePitcher.era && ` (${game.teams.home.probablePitcher.era})`}
                                </span>
                              )}
                            </div>
                            <span className="font-mono font-black text-sm text-white">
                              {game.teams.home.score ?? '-'}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-4 flex flex-col items-center border-l border-slate-800 justify-center gap-2">
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-mono font-black text-salami-red leading-none">{total}</span>
                            <span className="text-[7px] font-mono text-slate-500 font-black mt-1 uppercase tracking-tighter">Total</span>
                          </div>
                          
                          {/* O/U Line UI */}
                          <div className="pt-2 border-t border-slate-800 w-full flex flex-col items-center">
                            <div className="flex items-center gap-2 mb-1">
                              {editingLineId === game.gamePk ? (
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={tempLine}
                                    onChange={(e) => setTempLine(e.target.value)}
                                    className="w-12 bg-slate-950 border border-salami-red rounded px-1 py-0.5 text-xs font-mono text-white text-center focus:outline-none"
                                    autoFocus
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSaveLine(game.gamePk);
                                    }}
                                    className="p-1 hover:bg-slate-800 rounded text-green-500 cursor-pointer"
                                  >
                                    <Save className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span 
                                    className={cn(
                                      "text-[10px] font-mono font-black text-slate-300",
                                      isAdmin && "hover:text-salami-red cursor-pointer underline decoration-dotted decoration-slate-700 underline-offset-4"
                                    )}
                                    onClick={(e) => {
                                      if (isAdmin) {
                                        e.stopPropagation();
                                        setEditingLineId(game.gamePk);
                                        const currentVal = manualLines[game.gamePk] ?? gameLines[game.gamePk] ?? game.totalLine ?? 9.5;
                                        setTempLine(currentVal.toString());
                                      }
                                    }}
                                  >
                                    {(manualLines[game.gamePk] ?? gameLines[game.gamePk] ?? game.totalLine) !== undefined ? `L: ${manualLines[game.gamePk] ?? gameLines[game.gamePk] ?? game.totalLine}` : 'NO LINE'}
                                  </span>
                                  {isAdmin && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingLineId(game.gamePk);
                                        const currentVal = manualLines[game.gamePk] ?? gameLines[game.gamePk] ?? game.totalLine ?? 9.5;
                                        setTempLine(currentVal.toString());
                                      }}
                                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors cursor-pointer"
                                    >
                                      <Edit2 className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                            
                            {(manualLines[game.gamePk] ?? gameLines[game.gamePk] ?? game.totalLine) !== undefined && (
                              <div className={cn(
                                "text-[7px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex items-center gap-1",
                                total > (manualLines[game.gamePk] ?? gameLines[game.gamePk] ?? game.totalLine) ? "bg-red-500/10 text-red-500" : 
                                total < (manualLines[game.gamePk] ?? gameLines[game.gamePk] ?? game.totalLine) ? "bg-green-500/10 text-green-500" : 
                                "bg-blue-500/10 text-blue-500"
                              )}>
                                {(() => {
                                  const line = manualLines[game.gamePk] ?? gameLines[game.gamePk] ?? game.totalLine;
                                  const diff = total - (line || 0);
                                  const label = diff > 0 ? 'OVER' : diff < 0 ? 'UNDER' : 'PUSH';
                                  const sign = diff > 0 ? '+' : '';
                                  return (
                                    <>
                                      <span>{label} {line}</span>
                                      <span className="opacity-60">({sign}{diff.toFixed(1)})</span>
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </div>

                          {game.weather && (
                            <div className="flex flex-col items-center pt-1 border-t border-slate-800 w-full justify-center">
                              <div className="flex items-center gap-3 mb-1">
                                <div className="flex items-center gap-1">
                                  {(() => {
                                    const weather = getWeatherIcon(game.weather?.condition);
                                    return <weather.icon className={cn("w-2.5 h-2.5", weather.color)} />;
                                  })()}
                                  <span className={cn(
                                    "text-[10px] font-mono font-black ml-0.5",
                                    game.weather.isForecast ? "text-blue-400" : "text-slate-300"
                                  )}>
                                    {game.weather.temp}°
                                    {game.weather.isForecast && <span className="text-[5px] ml-0.5 opacity-60">f</span>}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                                  <Wind className={cn("w-2.5 h-2.5", game.weather.isForecast ? "text-blue-500/50" : "text-blue-400")} />
                                  <span className={cn(
                                    "text-[10px] font-mono font-bold",
                                    game.weather.isForecast ? "text-slate-600" : "text-slate-500"
                                  )}>
                                    {(game.weather.wind || '').split(' ')[0]}
                                  </span>
                                </div>
                              </div>
                              {game.status.abstractGameState === 'Preview' && (
                                <div className="flex items-center gap-1">
                                  {(() => {
                                    const warning = getEnvironmentalWarning(game);
                                    if (!warning) return null;
                                    return (
                                      <>
                                        <warning.icon className={cn("w-2 h-2", warning.color)} />
                                        <span className={cn("text-[6px] font-mono font-black uppercase tracking-widest", warning.color)}>
                                          {warning.label}
                                        </span>
                                      </>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-slate-900/50"
                        >
                          <div className="p-4 pt-0 border-t border-slate-800">
                            <GameDetailView game={game} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-800">
                    <th className="px-6 py-3 data-label">Matchup</th>
                    <th className="px-6 py-3 data-label text-center">Weather</th>
                    <th className="px-6 py-3 data-label text-center">Line (O/U)</th>
                    <th className="px-6 py-3 data-label text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredGames.map((game, index) => {
                    if (!game || !game.teams) return null;
                    
                    const homeScore = game.teams.home?.score ?? game.linescore?.teams?.home?.runs ?? 0;
                    const awayScore = game.teams.away?.score ?? game.linescore?.teams?.away?.runs ?? 0;
                    const totalScore = homeScore + awayScore;
                    
                    // Simple Pace Calculation
                    let projectedTotal = totalScore;
                    if (game.status.abstractGameState === 'Live') {
                      const inning = game.linescore?.currentInning || 1;
                      const isTop = game.linescore?.isTopInning ?? true;
                      const played = (inning - 1) + (isTop ? 0 : 0.5);
                      
                      if (played > 0) {
                        projectedTotal = (totalScore / played) * 9;
                      }
                    }

                    const isExpanded = expandedGameId === game.gamePk;
                    const riskMessage = getRainRisk(game);

                    return (
                      <Fragment key={game.gamePk}>
                        <motion.tr
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={cn(
                            "hover:bg-slate-800/50 transition-colors group cursor-pointer",
                            isExpanded && "bg-slate-800/50"
                          )}
                          onClick={() => toggleGame(game.gamePk)}
                        >
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700 shadow-sm">
                                    <img 
                                      src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`} 
                                      alt={game.teams.away.team.name}
                                      className="w-6 h-6 object-contain"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-200 tracking-tight leading-none">{game.teams.away.team.name}</span>
                                    {game.teams.away.probablePitcher && (
                                      <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-widest">
                                        P: {game.teams.away.probablePitcher.fullName}
                                        {game.teams.away.probablePitcher.era && ` (${game.teams.away.probablePitcher.era} ERA)`}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className={cn(
                                  "font-mono font-black text-lg",
                                  game.status.abstractGameState === 'Final' && (game.teams.away.score ?? 0) > (game.teams.home.score ?? 0) ? "text-white" : "text-slate-500"
                                )}>
                                  {(game.teams.away.score ?? 0).toString().padStart(2, '0')}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700 shadow-sm">
                                    <img 
                                      src={`https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`} 
                                      alt={game.teams.home.team.name}
                                      className="w-6 h-6 object-contain"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-200 tracking-tight leading-none">{game.teams.home.team.name}</span>
                                    {game.teams.home.probablePitcher && (
                                      <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-widest">
                                        P: {game.teams.home.probablePitcher.fullName}
                                        {game.teams.home.probablePitcher.era && ` (${game.teams.home.probablePitcher.era} ERA)`}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className={cn(
                                  "font-mono font-black text-lg",
                                  game.status.abstractGameState === 'Final' && (game.teams.home.score ?? 0) > (game.teams.away.score ?? 0) ? "text-white" : "text-slate-500"
                                )}>
                                  {(game.teams.home.score ?? 0).toString().padStart(2, '0')}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center bg-slate-900/30">
                            {game.weather ? (
                              <div className="inline-flex flex-col items-center gap-1">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1.5">
                                    {(() => {
                                      const weather = getWeatherIcon(game.weather.condition);
                                      return <weather.icon className={cn("w-3.5 h-3.5", weather.color)} />;
                                    })()}
                                    <span className="text-xs font-mono font-black text-white">{game.weather.temp}°</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Wind className="w-3 h-3 text-blue-400" />
                                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-tighter">
                                    {(game.weather.wind || '').split(',')[0]}
                                  </span>
                                </div>
                                  <div className="flex flex-col items-center gap-1 mt-1">
                                  {game.status.abstractGameState === 'Preview' && (
                                    (() => {
                                      const warning = getEnvironmentalWarning(game);
                                      if (!warning) return null;
                                      return (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950/50 border border-slate-800">
                                          <warning.icon className={cn("w-2.5 h-2.5", warning.color)} />
                                          <span className={cn("text-[7px] font-mono font-black uppercase tracking-[0.1em]", warning.color)}>
                                            {warning.label}
                                          </span>
                                        </div>
                                      );
                                    })()
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1 opacity-40">
                                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">
                                  {[139, 158, 141, 136, 117, 109, 146, 140].includes(game.teams.home.team.id) ? 'Indoor' : 'Outdoor'}
                                </span>
                                <span className="text-[7px] font-mono text-slate-600 uppercase tracking-tighter mt-1">No Weather Data</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5 text-center border-l border-slate-800">
                            <div className="flex flex-col items-center justify-center">
                              <div className="flex items-center gap-2 group/line">
                                {editingLineId === game.gamePk ? (
                                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="number"
                                      step="0.5"
                                      value={tempLine}
                                      onChange={(e) => setTempLine(e.target.value)}
                                      className="w-14 bg-slate-950 border border-salami-red rounded px-1 py-0.5 text-xs font-mono text-white text-center focus:outline-none"
                                      autoFocus
                                    />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSaveLine(game.gamePk);
                                      }}
                                      className="p-2 md:p-1 hover:bg-slate-800 rounded text-green-500 cursor-pointer"
                                    >
                                      <Save className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-2">
                                      <span 
                                        className={cn(
                                          "text-sm font-mono font-black text-white",
                                          isAdmin && "hover:text-salami-red cursor-pointer underline decoration-dotted decoration-slate-700 underline-offset-4"
                                        )}
                                        onClick={(e) => {
                                          if (isAdmin) {
                                            e.stopPropagation();
                                            setEditingLineId(game.gamePk);
                                            const currentVal = manualLines[game.gamePk] ?? gameLines[game.gamePk] ?? game.totalLine ?? 9.5;
                                            setTempLine(currentVal.toString());
                                          }
                                        }}
                                      >
                                        {(manualLines[game.gamePk] ?? gameLines[game.gamePk] ?? game.totalLine) !== undefined ? (manualLines[game.gamePk] ?? gameLines[game.gamePk] ?? game.totalLine).toFixed(1) : '---'}
                                      </span>
                                      {isAdmin && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingLineId(game.gamePk);
                                            const currentVal = manualLines[game.gamePk] ?? gameLines[game.gamePk] ?? game.totalLine ?? 9.5;
                                            setTempLine(currentVal.toString());
                                          }}
                                          className="p-2 md:p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                    <span className="text-[7px] font-mono text-slate-500 font-bold uppercase tracking-widest mt-0.5">Betting Line</span>
                                  </div>
                                )}
                              </div>
                              
                              {((manualLines && manualLines[game.gamePk] !== undefined) || gameLines[game.gamePk] !== undefined || game.totalLine !== undefined) && (
                                <div className={cn(
                                  "mt-1 px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-widest",
                                  (game.status.abstractGameState === 'Live' ? projectedTotal : totalScore) > (manualLines[game.gamePk] ?? gameLines[game.gamePk] ?? game.totalLine) ? "bg-red-500/10 text-red-500" : 
                                  (game.status.abstractGameState === 'Live' ? projectedTotal : totalScore) < (manualLines[game.gamePk] ?? gameLines[game.gamePk] ?? game.totalLine) ? "bg-green-500/10 text-green-500" : 
                                  "bg-blue-500/10 text-blue-500"
                                )}>
                                {(() => {
                                  const line = manualLines[game.gamePk] ?? gameLines[game.gamePk] ?? game.totalLine;
                                  const isLive = game.status.abstractGameState === 'Live';
                                  const displayScore = isLive ? projectedTotal : totalScore;
                                  const diff = displayScore - line;
                                  
                                  let label = '';
                                  if (game.status.abstractGameState === 'Final') {
                                    label = diff > 0 ? 'OVER' : diff < 0 ? 'UNDER' : 'PUSH';
                                  } else if (isLive) {
                                    label = diff > 0.5 ? 'TRENDING OVER' : diff < -0.5 ? 'TRENDING UNDER' : 'ON PACE';
                                  } else {
                                    label = 'PREVIEW';
                                  }
                                  
                                  const sign = diff > 0 ? '+' : '';
                                  return (
                                    <div className="flex items-center gap-1">
                                      <span>{label} {line}</span>
                                      <span className="opacity-60">({sign}{diff.toFixed(1)})</span>
                                    </div>
                                  );
                                })()}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center justify-end flex-wrap gap-2 mb-1">
                                {game.gamePk === apexGamePk && (
                                  <div className="bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded flex items-center gap-1.5 shadow-sm">
                                    <Flame className="w-3 h-3 text-orange-400" />
                                    <span className="text-[8px] font-mono font-black text-orange-400 uppercase tracking-tighter">Daily Apex</span>
                                  </div>
                                )}
                                {game.status.abstractGameState === 'Live' && getThreatLevel(game) > 0.25 && (
                                  <motion.button 
                                    type="button"
                                    animate={{ opacity: [1, 0.5, 1], scale: getThreatLevel(game) > 0.7 ? [1, 1.05, 1] : 1 }} 
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className={cn(
                                      "flex items-center gap-1.5 border px-2 py-0.5 rounded cursor-help shadow-sm select-none touch-manipulation appearance-none outline-none",
                                      getThreatLevel(game) > 0.7 ? "bg-red-600 border-red-500 text-white" : "bg-salami-red/10 border-salami-red/20 text-salami-red"
                                    )}
                                    title={`Live scoring threat: ${getThreatLevel(game).toFixed(2)} expected runs`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toast.info(`Live scoring threat: ${getThreatLevel(game).toFixed(2)} expected runs`, { duration: 3000, position: 'bottom-center' });
                                    }}
                                  >
                                    <AlertTriangle className={cn("w-3 h-3", getThreatLevel(game) > 0.7 ? "text-white" : "text-salami-red")} />
                                    <span className="text-[8px] font-mono font-black uppercase tracking-tighter">
                                      {getThreatLevel(game) > 0.7 ? 'HIGH THREAT' : 'LIVE THREAT'}
                                    </span>
                                  </motion.button>
                                )}
                                
                                {(() => {
                                   const badges = [];
                                   
                                   // 1. Rain Risk
                                   if (riskMessage) {
                                     const isRain = riskMessage.startsWith('Raining') || riskMessage.includes('Risk');
                                     badges.push(
                                       <button 
                                         key="risk"
                                         type="button"
                                         className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded cursor-help select-none touch-manipulation appearance-none outline-none"
                                         title={`${riskMessage}. Game at risk of delay or cancellation.`}
                                         onClick={(e) => {
                                           e.preventDefault();
                                           e.stopPropagation();
                                           toast.info(`${riskMessage}. Game at risk of delay or cancellation.`, { duration: 3000, position: 'bottom-center' });
                                         }}
                                       >
                                         {isRain ? <CloudRain className="w-2.5 h-2.5 text-blue-400" /> : <Droplets className="w-2.5 h-2.5 text-blue-400" />}
                                         <span className="text-[7px] font-mono font-black text-blue-400 uppercase tracking-widest">{riskMessage}</span>
                                       </button>
                                     );
                                   }
 
                                   // 2. Park Intelligence 
                                   const climate = getParkIntelligence(game);
 
                                   // 2. Intelligence Badges
                                   const intelBadges = getSpecialIntelligence(game, parkFactors);
                                   intelBadges.forEach(intel => {
                                     badges.push(
                                       <button 
                                         key={intel.label}
                                         type="button"
                                         className={cn(
                                           "flex items-center gap-1 px-2 py-0.5 rounded border shadow-sm cursor-help select-none touch-manipulation appearance-none outline-none text-left",
                                           intel.color
                                         )}
                                         title={intel.title}
                                         onClick={(e) => {
                                           e.preventDefault();
                                           e.stopPropagation();
                                           if (intel.title) toast.info(intel.title, { duration: 3000, position: 'bottom-center' });
                                         }}
                                       >
                                         <intel.icon className="w-2.5 h-2.5" />
                                         <span className="text-[8px] font-mono font-black uppercase tracking-widest whitespace-nowrap">
                                           {intel.label}
                                         </span>
                                       </button>
                                     );
                                   });

                                   return badges;
                                })()}
                                
                                <span className="text-[10px] font-mono font-black text-salami-red ml-1">
                                  TOTAL: {totalScore}
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-end gap-3">
                                {game.status?.detailedState !== 'Delayed Start' ? (
                                  <div className={cn(
                                    "text-[9px] font-mono font-black px-2 py-1 rounded inline-block shadow-sm",
                                    game.status.abstractGameState === 'Live' ? "bg-red-600 text-white" :
                                    game.status.abstractGameState === 'Final' ? "bg-green-600 text-white" :
                                    "bg-slate-800 text-slate-400"
                                  )}>
                                    {game.status.abstractGameState === 'Live' && game.linescore?.currentInningOrdinal 
                                      ? `${game.linescore.isTopInning ? 'TOP' : 'BOT'} ${game.linescore.currentInningOrdinal}`.toUpperCase()
                                      : (game.status?.detailedState || '').toUpperCase()}
                                  </div>
                                ) : <div />}

                                <div className="flex items-center gap-3">
                                  <div className="text-[9px] font-mono text-slate-400 font-bold whitespace-nowrap">
                                    {game.status.abstractGameState === 'Preview' 
                                      ? new Date(game.gameDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                      : game.status.abstractGameState === 'Live' ? "LIVE" : "FINAL"}
                                  </div>
                                  <div className="flex items-center gap-1 group-hover:text-salami-red transition-colors whitespace-nowrap">
                                    <span className="text-[8px] font-mono text-slate-500 font-black uppercase tracking-widest">Details</span>
                                    {isExpanded ? <ChevronUp className="w-3 h-3 text-slate-400 group-hover:text-salami-red" /> : <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-salami-red" />}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.tr
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="bg-slate-900/50"
                            >
                              <td colSpan={4} className="px-6 py-6 border-t border-slate-800">
                                <GameDetailView game={game} parkFactors={parkFactors} />
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Scorecard Legend Info */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-20 rounded-b-xl">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
              <Info className="w-3.5 h-3.5 text-salami-red" />
            </div>
            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.1em] leading-relaxed max-w-sm">
               Scorecard tracks live run differential against manual Over/Under totals.
            </p>
          </div>
          <div className="flex items-center gap-6 text-[8px] font-mono font-black text-slate-600 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
              <span>Trending Over</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
              <span>Trending Under</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GameDetailView({ game, parkFactors = [] }: { game: MLBGame, parkFactors?: BallparkPalFactor[] }) {
  const linescore = game.linescore;
  if (!linescore) return (
    <div className="flex items-center justify-center p-8 text-slate-500 font-mono text-[10px] uppercase tracking-widest">
      No detailed data available yet
    </div>
  );

  const isLive = game.status.abstractGameState === 'Live';
  const isFinal = game.status.abstractGameState === 'Final';
  const isActive = isLive || isFinal;

  const UmpireIntelligenceModule = (() => {
    const homePlateUmpire = game.officials?.find(o => o.officialType === 'Home Plate')?.official;
    
    if (!homePlateUmpire) return (
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/80 p-4 shadow-xl shadow-black/20 flex items-center justify-center gap-3">
        <Scale className="w-4 h-4 text-slate-700 animate-pulse" />
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-black">Umpire Assignment Pending</span>
      </div>
    );

    const intelligence = getUmpireIntelligence(homePlateUmpire.fullName);
    const { tendency, message, impulse } = intelligence;
    
    return (
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/80 p-3 sm:p-4 shadow-xl shadow-black/20 overflow-hidden relative group h-full flex flex-col">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent -mr-16 -mt-16 rounded-full blur-3xl group-hover:from-blue-500/10 transition-all duration-700" />
        
        <div className="flex flex-col gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner shrink-0">
              <Scale className={cn(
                "w-4 h-4",
                impulse === 'negative' ? "text-blue-400" :
                impulse === 'positive' ? "text-salami-red" :
                "text-slate-500"
              )} />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                 <span className="text-[7px] font-mono text-slate-500 uppercase tracking-[0.2em] font-black">Umpire Intelligence</span>
                 <div className="h-px w-8 bg-slate-800" />
              </div>
              <span className="text-xs font-black text-white uppercase tracking-tight truncate">{homePlateUmpire.fullName}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex flex-col items-start">
              <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest mb-1">Crew Bias</span>
              <div className={cn(
                "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-sm border",
                impulse === 'positive' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                impulse === 'negative' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                "bg-slate-800 text-slate-400 border-slate-700/50"
              )}>
                {impulse === 'positive' ? 'Hitters' : impulse === 'negative' ? 'Pitchers' : 'Balanced'}
              </div>
            </div>
            
            <div className="flex flex-col items-start">
              <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest mb-1">Zone</span>
              <div className={cn(
                "text-[9px] font-black uppercase tracking-widest",
                tendency.strikeZone === 'Large' ? "text-blue-400" :
                tendency.strikeZone === 'Small' ? "text-red-500" :
                "text-slate-200"
              )}>
                {tendency.strikeZone}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800/50">
          <div className="space-y-0.5">
            <span className="text-[6px] font-mono text-slate-600 uppercase tracking-widest">K Pulse</span>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "text-[10px] font-bold uppercase",
                tendency.Krate > 0.18 ? "text-blue-400" :
                tendency.Krate < 0.15 ? "text-red-500" :
                "text-slate-300"
              )}>{(tendency.Krate * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className="space-y-0.5 text-center">
            <span className="text-[6px] font-mono text-slate-600 uppercase tracking-widest">Runs/G</span>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[10px] font-bold text-white tracking-widest">{tendency.runsPerGame.toFixed(1)}</span>
            </div>
          </div>
          <div className="space-y-0.5 text-right">
            <span className="text-[6px] font-mono text-slate-600 uppercase tracking-widest">Accuracy</span>
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-[10px] font-bold text-white tracking-widest">{tendency.strikePercent}%</span>
            </div>
          </div>
        </div>
        
        <div className="mt-auto pt-3">
          <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/30">
            <p className="text-[9px] font-mono text-slate-400 italic leading-relaxed">
              "{message}"
            </p>
          </div>
        </div>
      </div>
    );
  })();

  const ParkFactorsModule = (() => {
    const awayAbbr = game.teams.away.team.abbreviation || '';
    const homeAbbr = game.teams.home.team.abbreviation || '';
    const livePalFactor = findGameFactor(parkFactors, awayAbbr, homeAbbr);

    const staticFactors = getDetailedParkFactor(game.venue?.name || '', game.weather?.condition);
    
    // Prioritize Live Ballpark Pal Factors
    const factors = livePalFactor ? {
      runs: livePalFactor.runs,
      hr: livePalFactor.hr,
      extraBase: livePalFactor.hits, // Hits used as proxy for XB if not detailed
      single: livePalFactor.hits
    } : staticFactors;

    if (!factors) return null;

    const formatVal = (val: number) => {
      const p = Math.round((val - 1) * 100);
      return { text: `${p >= 0 ? '+' : ''}${p}%`, color: p > 0 ? 'text-emerald-400' : p < 0 ? 'text-rose-400' : 'text-slate-500' };
    };

    const hr = formatVal(factors.hr);
    const xb = formatVal(factors.extraBase);
    const s = formatVal(factors.single);
    const r = formatVal(factors.runs);

    return (
      <div className="bg-slate-900/40 rounded-xl border border-slate-800/80 p-3 sm:p-4 shadow-xl shadow-black/20 overflow-hidden relative group h-full flex flex-col min-h-[140px]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-transparent -mr-16 -mt-16 rounded-full blur-3xl" />
        
        <div className="flex items-center gap-3 mb-4 relative z-10">
           <div className="w-9 h-9 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner shrink-0">
             <Activity className="w-4 h-4 text-emerald-400" />
           </div>
           <div className="flex flex-col min-w-0">
             <div className="flex items-center gap-2">
                <span className="text-[8px] font-mono text-emerald-500 uppercase tracking-[0.2em] font-black whitespace-nowrap">Ballpark Intelligence</span>
                <div className="h-px w-8 bg-emerald-500/20" />
             </div>
             <span className="text-xs font-black text-white uppercase tracking-tight truncate">{game.venue?.name || 'Venue'}</span>
           </div>
        </div>

        <div className="grid grid-cols-4 gap-2 py-3 border-t border-b border-slate-800/50 relative z-10">
          <div className="flex flex-col items-center">
            <span className="text-[6px] font-mono text-slate-600 uppercase tracking-widest mb-1">HR</span>
            <span className={cn("text-[10px] font-black font-mono shadow-sm", hr.color)}>{hr.text}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[6px] font-mono text-slate-600 uppercase tracking-widest mb-1">2B/3B</span>
            <span className={cn("text-[10px] font-black font-mono shadow-sm", xb.color)}>{xb.text}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[6px] font-mono text-slate-600 uppercase tracking-widest mb-1">1B</span>
            <span className={cn("text-[10px] font-black font-mono shadow-sm", s.color)}>{s.text}</span>
          </div>
          <div className="flex flex-col items-center bg-slate-950/40 rounded py-1 border border-slate-800/50">
            <span className="text-[6px] font-mono text-slate-400 uppercase tracking-widest mb-1 font-bold">Runs</span>
            <span className={cn("text-[10px] font-black font-mono", r.color)}>{r.text}</span>
          </div>
        </div>

        <div className="mt-auto pt-3 relative z-10 flex items-center justify-between border-t border-slate-800/40">
          <p className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter leading-relaxed">
            Data calibrated for 2026 environments.
          </p>
          <a 
            href="https://ballparkpal.com" 
            target="_blank" 
            rel="noreferrer"
            className="text-[8px] font-mono text-emerald-400 hover:text-emerald-300 font-black uppercase tracking-widest flex items-center gap-2 transition-colors group px-3 py-1 bg-emerald-500/5 rounded-full border border-emerald-500/10"
          >
            <BallparkPalLogo className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span>Live Ballpark Data</span>
            <ExternalLink className="w-2 h-2 opacity-50 group-hover:opacity-100" />
          </a>
        </div>
      </div>
    );
  })();

  const PitcherComparisonModule = (() => {
    const awayPitcher = game.teams.away.probablePitcher;
    const homePitcher = game.teams.home.probablePitcher;

    if (!awayPitcher && !homePitcher) return null;

    const PitcherStatsCol = ({ pitcher, teamAbbr, isHome }: { pitcher?: any, teamAbbr: string, isHome: boolean }) => {
      if (!pitcher) return (
        <div className="flex flex-col items-center justify-center p-4 bg-slate-950/30 rounded-xl border border-slate-800/50 h-full text-slate-600 italic text-[10px] uppercase">
          TBD
        </div>
      );

      return (
        <div className={cn(
          "flex flex-col p-4 rounded-xl border transition-all h-full bg-slate-900/40 hover:bg-slate-900/60",
          isHome ? "border-blue-500/10" : "border-salami-red/10"
        )}>
           <div className="flex items-center gap-3 mb-4">
             <div className={cn(
               "w-10 h-10 rounded-full flex items-center justify-center border font-mono font-black text-xs shadow-inner shrink-0",
               isHome ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-salami-red/10 border-salami-red/20 text-salami-red"
             )}>
               <User className="w-5 h-5" />
             </div>
             <div className="flex flex-col min-w-0">
               <span className="text-[7px] font-mono text-slate-500 uppercase tracking-[0.2em] font-black">{teamAbbr} Starter</span>
               <span className="text-xs font-black text-white uppercase tracking-tight truncate">{pitcher.fullName}</span>
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <span className="text-[6px] font-mono text-slate-500 uppercase tracking-widest block">Season ERA</span>
               <span className="text-sm font-black text-white font-mono tracking-tighter">{pitcher.era || '---'}</span>
             </div>
             <div className="space-y-1">
               <span className="text-[6px] font-mono text-slate-500 uppercase tracking-widest block">Season WHIP</span>
               <span className="text-sm font-black text-white font-mono tracking-tighter">{pitcher.whip || '---'}</span>
             </div>
             <div className="space-y-1">
               <span className="text-[6px] font-mono text-slate-500 uppercase tracking-widest block">Last 3 ERA</span>
               <div className="flex items-center gap-1.5">
                 <Flame className={cn("w-3 h-3", parseFloat(pitcher.recent || '0') < parseFloat(pitcher.era || '10') ? "text-emerald-400" : "text-rose-400")} />
                 <span className="text-[11px] font-black text-white font-mono">{pitcher.recent || '---'}</span>
               </div>
             </div>
             <div className="space-y-1">
               <span className="text-[6px] font-mono text-slate-500 uppercase tracking-widest block">Record</span>
               <span className="text-[11px] font-black text-slate-400 font-mono tracking-tighter">
                {pitcher.wins ?? 0}W - {pitcher.losses ?? 0}L
               </span>
             </div>
           </div>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800 shadow-lg shadow-black/20">
            <Target className="w-4 h-4 text-salami-red" />
          </div>
          <h4 className="text-[10px] font-mono font-black text-white uppercase tracking-[0.2em]">Starter Analytics</h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <PitcherStatsCol pitcher={awayPitcher} teamAbbr={game.teams.away.team.abbreviation || ''} isHome={false} />
          <PitcherStatsCol pitcher={homePitcher} teamAbbr={game.teams.home.team.abbreviation || ''} isHome={true} />
        </div>
      </div>
    );
  })();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {(() => {
            const TableModule = (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      {game.venue?.name || 'Unknown Venue'}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] font-mono border-collapse">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-800">
                        <th className="text-left py-2 font-black uppercase tracking-widest">Team</th>
                        {linescore.innings?.map(inn => (
                          <th key={inn.num} className="text-center px-2 py-2">{inn.num}</th>
                        ))}
                        <th className="text-center px-3 py-2 border-l border-slate-800 font-black text-white">R</th>
                        <th className="text-center px-3 py-2 text-slate-500">H</th>
                        <th className="text-center px-3 py-2 text-slate-500">E</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      <tr>
                        <td className="py-3 font-bold text-slate-300 uppercase tracking-tighter">
                          {game.teams.away.team.name.split(' ').pop()}
                        </td>
                        {linescore.innings?.map(inn => (
                          <td key={inn.num} className="text-center px-2 py-3 text-slate-500">{inn.away.runs ?? '-'}</td>
                        ))}
                        <td className="text-center px-3 py-3 border-l border-slate-800 font-black text-salami-red bg-slate-950/50">
                          {linescore.teams.away.runs ?? 0}
                        </td>
                        <td className="text-center px-3 py-3 text-slate-500">{linescore.teams.away.hits ?? 0}</td>
                        <td className="text-center px-3 py-3 text-slate-500">{linescore.teams.away.errors ?? 0}</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-bold text-slate-300 uppercase tracking-tighter">
                          {game.teams.home.team.name.split(' ').pop()}
                        </td>
                        {linescore.innings?.map(inn => (
                          <td key={inn.num} className="text-center px-2 py-3 text-slate-500">{inn.home.runs ?? '-'}</td>
                        ))}
                        <td className="text-center px-3 py-3 border-l border-slate-800 font-black text-salami-red bg-slate-950/50">
                          {linescore.teams.home.runs ?? 0}
                        </td>
                        <td className="text-center px-3 py-3 text-slate-500">{linescore.teams.home.hits ?? 0}</td>
                        <td className="text-center px-3 py-3 text-slate-500">{linescore.teams.home.errors ?? 0}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {isLive && (
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                      <User className="w-3 h-3 text-salami-red" />
                      <div className="flex flex-col">
                        <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest">At Bat</span>
                        <span className="text-[10px] font-bold text-white">{linescore.offense?.batter?.fullName || '---'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                      <Activity className="w-3 h-3 text-slate-500" />
                      <div className="flex flex-col">
                        <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest">Pitching</span>
                        <span className="text-[10px] font-bold text-white">{linescore.defense?.pitcher?.fullName || '---'}</span>
                      </div>
                    </div>
                    {(() => {
                      const offense = linescore.offense;
                      const hasRISP = !!offense?.second || !!offense?.third;
                      if (!hasRISP) return null;

                      const threat = calculateLiveThreat({
                        first: !!offense?.first,
                        second: !!offense?.second,
                        third: !!offense?.third,
                        outs: linescore.outs || 0
                      });
                      
                      if (threat <= 0.1) return null;
                      
                      return (
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg border",
                          threat > 0.8 ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-orange-500/10 border-orange-500/20 text-orange-500"
                        )}>
                          <AlertTriangle className="w-3 h-3" />
                          <div className="flex flex-col">
                            <span className="text-[7px] font-mono uppercase tracking-widest opacity-70">Live Threat Level</span>
                            <span className="text-[10px] font-bold uppercase">{threat > 0.8 ? 'Extremely High' : 'Elevated'} ({threat.toFixed(2)})</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
            return TableModule;
          })()}
          {PitcherComparisonModule}
        </div>
        <div>
          {(() => {
            const DiamondModule = (
              <div className="flex flex-col items-center justify-center space-y-8 md:border-l md:border-slate-800 md:pl-8 h-full">
                {isLive ? (
                  <>
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      {/* The Diamond Border */}
                      <div className="absolute w-24 h-24 rotate-45 border-2 border-slate-800 bg-slate-950/20 shadow-inner" />
                      
                      {/* Bases */}
                      <div className="relative w-24 h-24 rotate-45">
                        <div className={cn(
                          "absolute -top-2 -left-2 w-4 h-4 border border-slate-700 transition-all duration-300", 
                          linescore.offense?.second ? "bg-salami-red shadow-[0_0_15px_rgba(225,29,72,0.7)] z-10 scale-110" : "bg-slate-900"
                        )} title="2nd Base" />
                        <div className={cn(
                          "absolute -bottom-2 -left-2 w-4 h-4 border border-slate-700 transition-all duration-300", 
                          linescore.offense?.third ? "bg-salami-red shadow-[0_0_15px_rgba(225,29,72,0.7)] z-10 scale-110" : "bg-slate-900"
                        )} title="3rd Base" />
                        <div className={cn(
                          "absolute -top-2 -right-2 w-4 h-4 border border-slate-700 transition-all duration-300", 
                          linescore.offense?.first ? "bg-salami-red shadow-[0_0_15px_rgba(225,29,72,0.7)] z-10 scale-110" : "bg-slate-900"
                        )} title="1st Base" />
                        <div className="absolute -bottom-2 -right-2 w-4 h-4 border border-slate-700 bg-slate-800" title="Home Plate" />
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-3 w-full">
                      <div className="flex gap-6">
                        <div className="flex flex-col items-center">
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black">Balls</span>
                          <div className="flex gap-1.5 mt-1">
                            {[1, 2, 3].map(i => (
                              <div key={i} className={cn("w-2 h-2 rounded-full", (linescore.balls || 0) >= i ? "bg-green-500" : "bg-slate-800")} />
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black">Strikes</span>
                          <div className="flex gap-1.5 mt-1">
                            {[1, 2].map(i => (
                              <div key={i} className={cn("w-2 h-2 rounded-full", (linescore.strikes || 0) >= i ? "bg-salami-red" : "bg-slate-800")} />
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black">Outs</span>
                          <div className="flex gap-1.5 mt-1">
                            {[1, 2].map(i => (
                              <div key={i} className={cn("w-2 h-2 rounded-full", (linescore.outs || 0) >= i ? "bg-white" : "bg-slate-800")} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Info className="w-8 h-8 text-slate-700" />
                    <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest leading-relaxed">
                      {isFinal ? 'Game Complete' : 'Game Scheduled'}
                    </p>
                  </div>
                )}
              </div>
            );
            return DiamondModule;
          })()}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4">
        <div className="flex flex-col h-full">
           {UmpireIntelligenceModule}
        </div>
        {ParkFactorsModule && (
          <div className="flex flex-col h-full">
             {ParkFactorsModule}
          </div>
        )}
      </div>
    </div>
  );
}



