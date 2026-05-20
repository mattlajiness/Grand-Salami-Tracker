import { NHLGame } from './nhlService';

export const SIMULATED_GAMES: NHLGame[] = [
  {
    id: 9991,
    gameState: 'CRIT',
    startTimeUTC: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // Started 2 hours ago
    gameDate: new Date().toISOString().split('T')[0],
    venue: { default: 'Madison Square Garden' },
    awayTeam: {
      id: 1,
      abbrev: 'BOS',
      logo: 'https://assets.nhle.com/logos/nhl/svg/BOS_dark.svg',
      score: 2,
      sog: 34
    },
    homeTeam: {
      id: 2,
      abbrev: 'NYR',
      logo: 'https://assets.nhle.com/logos/nhl/svg/NYR_dark.svg',
      score: 3,
      sog: 29
    },
    periodDescriptor: {
      number: 3,
      periodType: 'REG'
    },
    clock: {
      timeRemaining: '01:45',
      secondsRemaining: 105,
      inIntermission: false
    },
    situation: {
      homeTeam: {
        strength: 5 // Rangers on Power Play
      },
      awayTeam: {
        strength: 4 // Bruins short-handed
      },
      situationCode: '1541' // Standard 5v4 PP layout code
    }
  },
  {
    id: 9992,
    gameState: 'OFF',
    startTimeUTC: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    gameDate: new Date().toISOString().split('T')[0],
    venue: { default: 'Scotiabank Arena' },
    awayTeam: {
      id: 3,
      abbrev: 'TOR',
      logo: 'https://assets.nhle.com/logos/nhl/svg/TOR_dark.svg',
      score: 4,
      sog: 38
    },
    homeTeam: {
      id: 4,
      abbrev: 'MTL',
      logo: 'https://assets.nhle.com/logos/nhl/svg/MTL_dark.svg',
      score: 4,
      sog: 22
    },
    periodDescriptor: {
      number: 3,
      periodType: 'REG'
    },
    clock: {
      timeRemaining: '00:00',
      secondsRemaining: 0,
      inIntermission: false
    }
  },
  {
    id: 9993,
    gameState: 'LIVE',
    startTimeUTC: new Date(Date.now() - 2.2 * 3600 * 1000).toISOString(),
    gameDate: new Date().toISOString().split('T')[0],
    venue: { default: 'Rogers Place' },
    awayTeam: {
      id: 5,
      abbrev: 'EDM',
      logo: 'https://assets.nhle.com/logos/nhl/svg/EDM_dark.svg',
      score: 3,
      sog: 26
    },
    homeTeam: {
      id: 6,
      abbrev: 'CGY',
      logo: 'https://assets.nhle.com/logos/nhl/svg/CGY_dark.svg',
      score: 3,
      sog: 31
    },
    periodDescriptor: {
      number: 4,
      periodType: 'OT'
    },
    clock: {
      timeRemaining: '02:45',
      secondsRemaining: 165,
      inIntermission: false
    }
  },
  {
    id: 9994,
    gameState: 'LIVE',
    startTimeUTC: new Date(Date.now() - 1.2 * 3600 * 1000).toISOString(),
    gameDate: new Date().toISOString().split('T')[0],
    venue: { default: 'T-Mobile Arena' },
    awayTeam: {
      id: 7,
      abbrev: 'COL',
      logo: 'https://assets.nhle.com/logos/nhl/svg/COL_dark.svg',
      score: 1,
      sog: 18
    },
    homeTeam: {
      id: 8,
      abbrev: 'VGK',
      logo: 'https://assets.nhle.com/logos/nhl/svg/VGK_dark.svg',
      score: 3,
      sog: 25
    },
    periodDescriptor: {
      number: 2,
      periodType: 'REG'
    },
    clock: {
      timeRemaining: '00:00',
      secondsRemaining: 0,
      inIntermission: true
    }
  },
  {
    id: 9995,
    gameState: 'LIVE',
    startTimeUTC: new Date(Date.now() - 0.5 * 3600 * 1000).toISOString(),
    gameDate: new Date().toISOString().split('T')[0],
    venue: { default: 'United Center' },
    awayTeam: {
      id: 9,
      abbrev: 'CHI',
      logo: 'https://assets.nhle.com/logos/nhl/svg/CHI_dark.svg',
      score: 2,
      sog: 14
    },
    homeTeam: {
      id: 10,
      abbrev: 'DET',
      logo: 'https://assets.nhle.com/logos/nhl/svg/DET_dark.svg',
      score: 5,
      sog: 24
    },
    periodDescriptor: {
      number: 1,
      periodType: 'REG'
    },
    clock: {
      timeRemaining: '12:10',
      secondsRemaining: 730,
      inIntermission: false
    }
  },
  {
    id: 9996,
    gameState: 'PRE',
    startTimeUTC: new Date(Date.now() + 1.5 * 3600 * 1000).toISOString(), // Starts in 1.5 hours
    gameDate: new Date().toISOString().split('T')[0],
    venue: { default: 'Rogers Arena' },
    awayTeam: {
      id: 11,
      abbrev: 'VAN',
      logo: 'https://assets.nhle.com/logos/nhl/svg/VAN_dark.svg',
      score: 0,
      sog: 0
    },
    homeTeam: {
      id: 12,
      abbrev: 'SEA',
      logo: 'https://assets.nhle.com/logos/nhl/svg/SEA_dark.svg',
      score: 0,
      sog: 0
    }
  },
  {
    id: 9997,
    gameState: 'FINAL',
    startTimeUTC: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    gameDate: new Date().toISOString().split('T')[0],
    venue: { default: 'Amalie Arena' },
    awayTeam: {
      id: 13,
      abbrev: 'TBL',
      logo: 'https://assets.nhle.com/logos/nhl/svg/TBL_dark.svg',
      score: 4,
      sog: 32
    },
    homeTeam: {
      id: 14,
      abbrev: 'FLA',
      logo: 'https://assets.nhle.com/logos/nhl/svg/FLA_dark.svg',
      score: 2,
      sog: 28
    },
    periodDescriptor: {
      number: 3,
      periodType: 'REG'
    },
    clock: {
      timeRemaining: '00:00',
      secondsRemaining: 0,
      inIntermission: false
    }
  },
  {
    id: 9998,
    gameState: 'FINAL',
    startTimeUTC: new Date(Date.now() - 4.5 * 3600 * 1000).toISOString(),
    gameDate: new Date().toISOString().split('T')[0],
    venue: { default: 'American Airlines Center' },
    awayTeam: {
      id: 15,
      abbrev: 'DAL',
      logo: 'https://assets.nhle.com/logos/nhl/svg/DAL_dark.svg',
      score: 5,
      sog: 39
    },
    homeTeam: {
      id: 16,
      abbrev: 'WPG',
      logo: 'https://assets.nhle.com/logos/nhl/svg/WPG_dark.svg',
      score: 6,
      sog: 32
    },
    periodDescriptor: {
      number: 5,
      periodType: 'SO'
    },
    clock: {
      timeRemaining: '00:00',
      secondsRemaining: 0,
      inIntermission: false
    }
  }
];

export const SIMULATED_DETAILS: Record<number, any> = {
  9991: {
    id: 9991,
    awayTeam: {
      abbrev: 'BOS',
      probableStartingGoalie: { lastName: 'Swayman', savePctg: 0.916, saves: 31, shotsAgainst: 34 }
    },
    homeTeam: {
      abbrev: 'NYR',
      probableStartingGoalie: { lastName: 'Shesterkin', savePctg: 0.912, saves: 27, shotsAgainst: 29 }
    },
    summary: {
      scoring: [
        {
          period: 1,
          goals: [
            { teamAbbrev: 'NYR', name: 'Zibanejad', goalsToDate: 18, timeInPeriod: '08:42' },
            { teamAbbrev: 'BOS', name: 'Pastrnak', goalsToDate: 35, timeInPeriod: '14:20' }
          ]
        },
        {
          period: 2,
          goals: [
            { teamAbbrev: 'NYR', name: 'Panarin', goalsToDate: 27, timeInPeriod: '03:15' }
          ]
        },
        {
          period: 3,
          goals: [
            { teamAbbrev: 'BOS', name: 'Marchand', goalsToDate: 19, timeInPeriod: '06:11' },
            { teamAbbrev: 'NYR', name: 'Trocheck', goalsToDate: 14, timeInPeriod: '12:35' }
          ]
        }
      ],
      teamStats: [
        { category: 'sog', awayValue: '34', homeValue: '29' }
      ]
    }
  },
  9992: {
    id: 9992,
    awayTeam: {
      abbrev: 'TOR',
      probableStartingGoalie: { lastName: 'Woll', savePctg: 0.908, saves: 18, shotsAgainst: 22 }
    },
    homeTeam: {
      abbrev: 'MTL',
      probableStartingGoalie: { lastName: 'Montembeault', savePctg: 0.903, saves: 34, shotsAgainst: 38 }
    },
    summary: {
      scoring: [
        {
          period: 1,
          goals: [
            { teamAbbrev: 'TOR', name: 'Matthews', goalsToDate: 48, timeInPeriod: '01:10' },
            { teamAbbrev: 'MTL', name: 'Suzuki', goalsToDate: 22, timeInPeriod: '19:40' }
          ]
        },
        {
          period: 2,
          goals: [
            { teamAbbrev: 'TOR', name: 'Marner', goalsToDate: 18, timeInPeriod: '11:15' },
            { teamAbbrev: 'MTL', name: 'Caufield', goalsToDate: 20, timeInPeriod: '14:22' }
          ]
        },
        {
          period: 3,
          goals: [
            { teamAbbrev: 'MTL', name: 'Slafkovsky', goalsToDate: 15, timeInPeriod: '05:30' },
            { teamAbbrev: 'TOR', name: 'Nylander', goalsToDate: 29, timeInPeriod: '09:05' },
            { teamAbbrev: 'TOR', name: 'Tavares', goalsToDate: 16, timeInPeriod: '15:15' },
            { teamAbbrev: 'MTL', name: 'Newhook', goalsToDate: 12, timeInPeriod: '19:12' }
          ]
        }
      ],
      teamStats: [
        { category: 'sog', awayValue: '38', homeValue: '22' }
      ]
    }
  },
  9993: {
    id: 9993,
    awayTeam: {
      abbrev: 'EDM',
      probableStartingGoalie: { lastName: 'Skinner', savePctg: 0.905, saves: 28, shotsAgainst: 31 }
    },
    homeTeam: {
      abbrev: 'CGY',
      probableStartingGoalie: { lastName: 'Wolf', savePctg: 0.899, saves: 23, shotsAgainst: 26 }
    },
    summary: {
      scoring: [
        {
          period: 1,
          goals: [
            { teamAbbrev: 'EDM', name: 'McDavid', goalsToDate: 31, timeInPeriod: '04:15' }
          ]
        },
        {
          period: 2,
          goals: [
            { teamAbbrev: 'CGY', name: 'Coleman', goalsToDate: 24, timeInPeriod: '10:50' },
            { teamAbbrev: 'EDM', name: 'Draisaitl', goalsToDate: 28, timeInPeriod: '16:05' }
          ]
        },
        {
          period: 3,
          goals: [
            { teamAbbrev: 'CGY', name: 'Huberdeau', goalsToDate: 11, timeInPeriod: '08:12' },
            { teamAbbrev: 'CGY', name: 'Weegar', goalsToDate: 15, timeInPeriod: '18:44' },
            { teamAbbrev: 'EDM', name: 'Hyman', goalsToDate: 41, timeInPeriod: '19:15' }
          ]
        }
      ],
      teamStats: [
        { category: 'sog', awayValue: '26', homeValue: '31' }
      ]
    }
  },
  9994: {
    id: 9994,
    awayTeam: {
      abbrev: 'COL',
      probableStartingGoalie: { lastName: 'Georgiev', savePctg: 0.901, saves: 22, shotsAgainst: 25 }
    },
    homeTeam: {
      abbrev: 'VGK',
      probableStartingGoalie: { lastName: 'Hill', savePctg: 0.915, saves: 17, shotsAgainst: 18 }
    },
    summary: {
      scoring: [
        {
          period: 1,
          goals: [
            { teamAbbrev: 'VGK', name: 'Eichel', goalsToDate: 25, timeInPeriod: '12:05' },
            { teamAbbrev: 'VGK', name: 'Marchessault', goalsToDate: 33, timeInPeriod: '15:20' }
          ]
        },
        {
          period: 2,
          goals: [
            { teamAbbrev: 'COL', name: 'MacKinnon', goalsToDate: 39, timeInPeriod: '05:40' },
            { teamAbbrev: 'VGK', name: 'Barbashev', goalsToDate: 14, timeInPeriod: '18:11' }
          ]
        }
      ],
      teamStats: [
        { category: 'sog', awayValue: '18', homeValue: '25' }
      ]
    }
  },
  9995: {
    id: 9995,
    awayTeam: {
      abbrev: 'CHI',
      probableStartingGoalie: { lastName: 'Mrazek', savePctg: 0.904, saves: 19, shotsAgainst: 24 }
    },
    homeTeam: {
      abbrev: 'DET',
      probableStartingGoalie: { lastName: 'Lyon', savePctg: 0.907, saves: 12, shotsAgainst: 14 }
    },
    summary: {
      scoring: [
        {
          period: 1,
          goals: [
            { teamAbbrev: 'DET', name: 'Kane', goalsToDate: 15, timeInPeriod: '02:11' },
            { teamAbbrev: 'DET', name: 'Larkin', goalsToDate: 26, timeInPeriod: '04:50' },
            { teamAbbrev: 'CHI', name: 'Bedard', goalsToDate: 21, timeInPeriod: '08:14' },
            { teamAbbrev: 'DET', name: 'Raymond', goalsToDate: 19, timeInPeriod: '10:05' },
            { teamAbbrev: 'CHI', name: 'Foligno', goalsToDate: 14, timeInPeriod: '14:22' },
            { teamAbbrev: 'DET', name: 'DeBrincat', goalsToDate: 22, timeInPeriod: '17:40' },
            { teamAbbrev: 'DET', name: 'Seider', goalsToDate: 8, timeInPeriod: '19:10' }
          ]
        }
      ],
      teamStats: [
        { category: 'sog', awayValue: '14', homeValue: '24' }
      ]
    }
  },
  9996: {
    id: 9996,
    awayTeam: {
      abbrev: 'VAN',
      probableStartingGoalie: { lastName: 'Demko', savePctg: 0.917, record: '32-13-2', gaa: '2.45' }
    },
    homeTeam: {
      abbrev: 'SEA',
      probableStartingGoalie: { lastName: 'Daccord', savePctg: 0.914, record: '18-14-10', gaa: '2.52' }
    },
    summary: {
      scoring: [],
      teamStats: [
        { category: 'sog', awayValue: '0', homeValue: '0' }
      ]
    }
  },
  9997: {
    id: 9997,
    awayTeam: {
      abbrev: 'TBL',
      probableStartingGoalie: { lastName: 'Vasilevskiy', savePctg: 0.900, saves: 26, shotsAgainst: 28 }
    },
    homeTeam: {
      abbrev: 'FLA',
      probableStartingGoalie: { lastName: 'Bobrovsky', savePctg: 0.913, saves: 28, shotsAgainst: 32 }
    },
    summary: {
      scoring: [
        {
          period: 1,
          goals: [
            { teamAbbrev: 'TBL', name: 'Kucherov', goalsToDate: 37, timeInPeriod: '10:14' },
            { teamAbbrev: 'FLA', name: 'Reinhart', goalsToDate: 45, timeInPeriod: '16:05' }
          ]
        },
        {
          period: 2,
          goals: [
            { teamAbbrev: 'TBL', name: 'Point', goalsToDate: 31, timeInPeriod: '04:11' },
            { teamAbbrev: 'FLA', name: 'Verhaeghe', goalsToDate: 30, timeInPeriod: '12:55' },
            { teamAbbrev: 'TBL', name: 'Stamkos', goalsToDate: 24, timeInPeriod: '19:02' }
          ]
        },
        {
          period: 3,
          goals: [
            { teamAbbrev: 'TBL', name: 'Hagel', goalsToDate: 22, timeInPeriod: '19:45' }
          ]
        }
      ],
      teamStats: [
        { category: 'sog', awayValue: '32', homeValue: '28' }
      ]
    }
  },
  9998: {
    id: 9998,
    awayTeam: {
      abbrev: 'DAL',
      probableStartingGoalie: { lastName: 'Oettinger', savePctg: 0.901, saves: 26, shotsAgainst: 32 }
    },
    homeTeam: {
      abbrev: 'WPG',
      probableStartingGoalie: { lastName: 'Hellebuyck', savePctg: 0.922, saves: 34, shotsAgainst: 39 }
    },
    summary: {
      scoring: [
        {
          period: 1,
          goals: [
            { teamAbbrev: 'DAL', name: 'Hintz', goalsToDate: 25, timeInPeriod: '02:15' },
            { teamAbbrev: 'WPG', name: 'Scheifele', goalsToDate: 21, timeInPeriod: '11:40' },
            { teamAbbrev: 'WPG', name: 'Vilardi', goalsToDate: 16, timeInPeriod: '15:20' }
          ]
        },
        {
          period: 2,
          goals: [
            { teamAbbrev: 'DAL', name: 'Robertson', goalsToDate: 23, timeInPeriod: '05:12' },
            { teamAbbrev: 'DAL', name: 'Pavelski', goalsToDate: 21, timeInPeriod: '09:05' },
            { teamAbbrev: 'WPG', name: 'Connor', goalsToDate: 28, timeInPeriod: '14:15' }
          ]
        },
        {
          period: 3,
          goals: [
            { teamAbbrev: 'WPG', name: 'Morrissey', goalsToDate: 9, timeInPeriod: '04:45' },
            { teamAbbrev: 'DAL', name: 'Johnston', goalsToDate: 22, timeInPeriod: '07:33' },
            { teamAbbrev: 'WPG', name: 'Ehlers', goalsToDate: 20, timeInPeriod: '11:20' },
            { teamAbbrev: 'DAL', name: 'Heiskanen', goalsToDate: 8, timeInPeriod: '19:15' }
          ]
        }
      ],
      teamStats: [
        { category: 'sog', awayValue: '39', homeValue: '32' }
      ]
    }
  }
};

/**
 * Simulates a clock and game action tick.
 * This is used so when demo mode is active, the game clock ticks down
 * and occasionally SOGs or even Goals (scores) increment!
 */
export function tickSimulatedGames(games: NHLGame[]): NHLGame[] {
  return games.map(game => {
    // Only tick LIVE or CRIT games
    if (game.gameState !== 'LIVE' && game.gameState !== 'CRIT') {
      return game;
    }

    // Skip games in intermission
    if (game.clock?.inIntermission) {
      // Small 2% chance to end intermission and go to next period (or 1st period -> 2nd)
      if (Math.random() < 0.02) {
        const nextPeriodNum = (game.periodDescriptor?.number || 1) + 1;
        return {
          ...game,
          clock: {
            timeRemaining: '20:00',
            secondsRemaining: 1200,
            inIntermission: false
          },
          periodDescriptor: {
            number: nextPeriodNum,
            periodType: 'REG'
          }
        };
      }
      return game;
    }

    let sec = game.clock?.secondsRemaining || 0;
    if (sec <= 0) {
      // Period over! Transition to intermission
      if (game.periodDescriptor?.number && game.periodDescriptor.number < 3) {
        return {
          ...game,
          clock: {
            timeRemaining: 'Intermission',
            secondsRemaining: 0,
            inIntermission: true
          }
        };
      } else if (game.gameState === 'CRIT') {
        // Critical tight game, end regular time -> maybe OFF review or Overtime
        return {
          ...game,
          gameState: 'OFF',
          clock: {
            timeRemaining: '00:00',
            secondsRemaining: 0,
            inIntermission: false
          }
        };
      } else {
        // Standard game, end game or go OT
        return {
          ...game,
          gameState: 'FINAL',
          clock: {
            timeRemaining: '00:00',
            secondsRemaining: 0,
            inIntermission: false
          }
        };
      }
    }

    // Tick down clock by 3 seconds
    sec = Math.max(0, sec - 3);
    const minPart = Math.floor(sec / 60).toString().padStart(2, '0');
    const secPart = (sec % 60).toString().padStart(2, '0');
    const timeRemainingStr = `${minPart}:${secPart}`;

    // Deep clone the mutable properties
    const updatedGame = {
      ...game,
      clock: {
        timeRemaining: timeRemainingStr,
        secondsRemaining: sec,
        inIntermission: false
      },
      awayTeam: { ...game.awayTeam },
      homeTeam: { ...game.homeTeam },
      situation: game.situation ? { ...game.situation } : undefined
    };

    // Transition standard LIVE game into CRIT if score is close in 3rd period
    if (updatedGame.gameState === 'LIVE' && updatedGame.periodDescriptor?.number === 3 && sec < 300) {
      const diff = Math.abs((updatedGame.awayTeam.score || 0) - (updatedGame.homeTeam.score || 0));
      if (diff <= 1) {
        updatedGame.gameState = 'CRIT';
      }
    }

    // Dynamic Power Play Ticker / Manager
    const isPPActive = updatedGame.situation?.situationCode && 
                       (updatedGame.situation.situationCode === '1541' || updatedGame.situation.situationCode === '1451');

    if (isPPActive) {
      // 5% chance the penalty expires naturally on this tick
      if (Math.random() < 0.05) {
        updatedGame.situation = {
          homeTeam: { strength: 5 },
          awayTeam: { strength: 5 },
          situationCode: '1551'
        };
      }
    } else {
      // 2.5% chance to start a new Power Play for either team
      if (Math.random() < 0.025) {
        const isHomePP = Math.random() < 0.5;
        if (isHomePP) {
          updatedGame.situation = {
            homeTeam: { strength: 5 },
            awayTeam: { strength: 4 },
            situationCode: '1451' // Home PP: Away Goalie (1), Away Skaters (4), Home Goalie (1), Home Skaters (5)
          };
        } else {
          updatedGame.situation = {
            homeTeam: { strength: 4 },
            awayTeam: { strength: 5 },
            situationCode: '1541' // Away PP: Away Goalie (1), Away Skaters (5), Home Goalie (1), Home Skaters (4)
          };
        }
      }
    }

    // Random SOG addition (10% chance)
    if (Math.random() < 0.10) {
      const isHome = Math.random() < 0.5;
      if (isHome) {
        updatedGame.homeTeam.sog = (updatedGame.homeTeam.sog || 0) + 1;
      } else {
        updatedGame.awayTeam.sog = (updatedGame.awayTeam.sog || 0) + 1;
      }

      // Very small chance of a Goal! (2.5% of a shot scoring)
      // If we are on a PP, double the chance of scoring! (5% chance of goal on shot)
      const currentSits = updatedGame.situation;
      const isHomePPActive = currentSits?.situationCode === '1451';
      const isAwayPPActive = currentSits?.situationCode === '1541';
      const isShootingPP = (isHome && isHomePPActive) || (!isHome && isAwayPPActive);
      const goalChance = isShootingPP ? 0.06 : 0.025;

      if (Math.random() < goalChance) {
        if (isHome) {
          updatedGame.homeTeam.score = (updatedGame.homeTeam.score || 0) + 1;
        } else {
          updatedGame.awayTeam.score = (updatedGame.awayTeam.score || 0) + 1;
        }

        // If goal was scored, penalty ends (Even Strength starts)
        updatedGame.situation = {
          homeTeam: { strength: 5 },
          awayTeam: { strength: 5 },
          situationCode: '1551'
        };

        // Keep close game in CRIT states
        const newDiff = Math.abs((updatedGame.awayTeam.score || 0) - (updatedGame.homeTeam.score || 0));
        if (updatedGame.periodDescriptor?.number === 3 && newDiff <= 2) {
          updatedGame.gameState = 'CRIT';
        }
      }
    }

    return updatedGame;
  });
}

export const PRE_SLATE_GAMES: NHLGame[] = [
  {
    id: 9991,
    gameState: 'PRE',
    startTimeUTC: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    gameDate: new Date().toISOString().split('T')[0],
    venue: { default: 'Madison Square Garden' },
    awayTeam: {
      id: 1,
      abbrev: 'BOS',
      logo: 'https://assets.nhle.com/logos/nhl/svg/BOS_dark.svg',
      score: 0,
      sog: 0
    },
    homeTeam: {
      id: 2,
      abbrev: 'NYR',
      logo: 'https://assets.nhle.com/logos/nhl/svg/NYR_dark.svg',
      score: 0,
      sog: 0
    }
  },
  {
    id: 9992,
    gameState: 'PRE',
    startTimeUTC: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    gameDate: new Date().toISOString().split('T')[0],
    venue: { default: 'Scotiabank Arena' },
    awayTeam: {
      id: 3,
      abbrev: 'TOR',
      logo: 'https://assets.nhle.com/logos/nhl/svg/TOR_dark.svg',
      score: 0,
      sog: 0
    },
    homeTeam: {
      id: 4,
      abbrev: 'MTL',
      logo: 'https://assets.nhle.com/logos/nhl/svg/MTL_dark.svg',
      score: 0,
      sog: 0
    }
  },
  {
    id: 9993,
    gameState: 'PRE',
    startTimeUTC: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    gameDate: new Date().toISOString().split('T')[0],
    venue: { default: 'Rogers Place' },
    awayTeam: {
      id: 5,
      abbrev: 'EDM',
      logo: 'https://assets.nhle.com/logos/nhl/svg/EDM_dark.svg',
      score: 0,
      sog: 0
    },
    homeTeam: {
      id: 6,
      abbrev: 'CGY',
      logo: 'https://assets.nhle.com/logos/nhl/svg/CGY_dark.svg',
      score: 0,
      sog: 0
    }
  },
  {
    id: 9994,
    gameState: 'PRE',
    startTimeUTC: new Date(Date.now() + 6.5 * 3600 * 1000).toISOString(),
    gameDate: new Date().toISOString().split('T')[0],
    venue: { default: 'T-Mobile Arena' },
    awayTeam: {
      id: 7,
      abbrev: 'COL',
      logo: 'https://assets.nhle.com/logos/nhl/svg/COL_dark.svg',
      score: 0,
      sog: 0
    },
    homeTeam: {
      id: 8,
      abbrev: 'VGK',
      logo: 'https://assets.nhle.com/logos/nhl/svg/VGK_dark.svg',
      score: 0,
      sog: 0
    }
  },
  {
    id: 9995,
    gameState: 'PRE',
    startTimeUTC: new Date(Date.now() + 7 * 3600 * 1000).toISOString(),
    gameDate: new Date().toISOString().split('T')[0],
    venue: { default: 'United Center' },
    awayTeam: {
      id: 9,
      abbrev: 'CHI',
      logo: 'https://assets.nhle.com/logos/nhl/svg/CHI_dark.svg',
      score: 0,
      sog: 0
    },
    homeTeam: {
      id: 10,
      abbrev: 'DET',
      logo: 'https://assets.nhle.com/logos/nhl/svg/DET_dark.svg',
      score: 0,
      sog: 0
    }
  },
  {
    id: 9996,
    gameState: 'PRE',
    startTimeUTC: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    gameDate: new Date().toISOString().split('T')[0],
    venue: { default: 'Rogers Arena' },
    awayTeam: {
      id: 11,
      abbrev: 'VAN',
      logo: 'https://assets.nhle.com/logos/nhl/svg/VAN_dark.svg',
      score: 0,
      sog: 0
    },
    homeTeam: {
      id: 12,
      abbrev: 'SEA',
      logo: 'https://assets.nhle.com/logos/nhl/svg/SEA_dark.svg',
      score: 0,
      sog: 0
    }
  }
];

