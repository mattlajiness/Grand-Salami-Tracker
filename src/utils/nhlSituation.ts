import { NHLGame } from '../services/nhlService';

export interface ParsedNHLSituation {
  hasPowerPlay: boolean;
  powerPlayTeam: 'home' | 'away' | null;
  ppTeamAbbrev: string;
  pkTeamAbbrev: string;
  skatersAway: number;
  skatersHome: number;
  goalieAway: boolean;
  goalieHome: boolean;
  strengthLabel: string;
  isEmptyNet: boolean;
  emptyNetTeam: 'home' | 'away' | null;
  emptyNetTeamAbbrev: string;
}

export function parseNHLSituation(game?: NHLGame | null): ParsedNHLSituation {
  const defaultSit: ParsedNHLSituation = {
    hasPowerPlay: false,
    powerPlayTeam: null,
    ppTeamAbbrev: '',
    pkTeamAbbrev: '',
    skatersAway: 5,
    skatersHome: 5,
    goalieAway: true,
    goalieHome: true,
    strengthLabel: 'Even Strength 5v5',
    isEmptyNet: false,
    emptyNetTeam: null,
    emptyNetTeamAbbrev: ''
  };

  if (!game || !game.situation) {
    return defaultSit;
  }

  const { situationCode } = game.situation;

  // Default parser if situationCode is present (4-digit format: e.g. '1541' or '1551' or standard '1515')
  if (situationCode && situationCode.length === 4) {
    const thirdDigitVal = parseInt(situationCode[2], 10);
    const isCustomLayout = !isNaN(thirdDigitVal) && thirdDigitVal > 1;

    let gAway = false;
    let skAway = 5;
    let gHome = false;
    let skHome = 5;

    if (isCustomLayout) {
      // [gAway, skAway, skHome, gHome]
      gAway = situationCode[0] === '1';
      skAway = parseInt(situationCode[1], 10) || 5;
      skHome = parseInt(situationCode[2], 10) || 5;
      gHome = situationCode[3] === '1';
    } else {
      // [gAway, skAway, gHome, skHome]
      gAway = situationCode[0] === '1';
      skAway = parseInt(situationCode[1], 10) || 5;
      gHome = situationCode[2] === '1';
      skHome = parseInt(situationCode[3], 10) || 5;
    }

    const emptyNet = !gAway || !gHome;
    const emptyNetTeam: 'home' | 'away' | null = !gAway ? 'away' : (!gHome ? 'home' : null);
    const emptyNetTeamAbbrev = emptyNetTeam === 'away' 
      ? (game.awayTeam?.abbrev || 'AWAY') 
      : (emptyNetTeam === 'home' ? (game.homeTeam?.abbrev || 'HOME') : '');

    let ppTeam: 'home' | 'away' | null = null;
    let ppAbbrev = '';
    let pkAbbrev = '';
    let isPP = false;

    // Filter out empty net scenarios from standard power play unless team strength differs
    if (skAway > skHome) {
      ppTeam = 'away';
      ppAbbrev = game.awayTeam?.abbrev || '';
      pkAbbrev = game.homeTeam?.abbrev || '';
      isPP = true;
    } else if (skHome > skAway) {
      ppTeam = 'home';
      ppAbbrev = game.homeTeam?.abbrev || '';
      pkAbbrev = game.awayTeam?.abbrev || '';
      isPP = true;
    }

    let label = `${skAway}v${skHome}`;
    if (skAway === skHome) {
      label = `Even Strength ${skAway}v${skHome}`;
    } else {
      label = ppTeam === 'away' 
        ? `${game.awayTeam?.abbrev} Power Play ${skAway}v${skHome}` 
        : `${game.homeTeam?.abbrev} Power Play ${skHome}v${skAway}`;
    }

    if (emptyNet) {
      label += ` • ${emptyNetTeamAbbrev} Empty Net`;
    }

    return {
      hasPowerPlay: isPP,
      powerPlayTeam: ppTeam,
      ppTeamAbbrev: ppAbbrev,
      pkTeamAbbrev: pkAbbrev,
      skatersAway: skAway,
      skatersHome: skHome,
      goalieAway: gAway,
      goalieHome: gHome,
      strengthLabel: label,
      isEmptyNet: emptyNet,
      emptyNetTeam,
      emptyNetTeamAbbrev
    };
  }

  // Direct object properties fallback
  const sAway = game.situation?.awayTeam?.strength || 5;
  const sHome = game.situation?.homeTeam?.strength || 5;
  const isAwayPP = sAway > sHome;
  const isHomePP = sHome > sAway;

  return {
    hasPowerPlay: isAwayPP || isHomePP,
    powerPlayTeam: isAwayPP ? 'away' : (isHomePP ? 'home' : null),
    ppTeamAbbrev: isAwayPP ? game.awayTeam?.abbrev || '' : (isHomePP ? game.homeTeam?.abbrev || '' : ''),
    pkTeamAbbrev: isAwayPP ? game.homeTeam?.abbrev || '' : (isHomePP ? game.awayTeam?.abbrev || '' : ''),
    skatersAway: sAway,
    skatersHome: sHome,
    goalieAway: true,
    goalieHome: true,
    strengthLabel: isAwayPP 
      ? `${game.awayTeam?.abbrev} Power Play ${sAway}v${sHome}` 
      : (isHomePP ? `${game.homeTeam?.abbrev} Power Play ${sHome}v${sAway}` : 'Even Strength 5v5'),
    isEmptyNet: false,
    emptyNetTeam: null,
    emptyNetTeamAbbrev: ''
  };
}
