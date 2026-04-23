import { MLBGame } from '../services/mlbService';
import { format, subDays, parseISO } from 'date-fns';

export interface FatigueStats {
  maxFatigueCount: number;
  highFatigueCount: number;
}

export function calculateFatigueStats(historicalGames: MLBGame[], todayGames: MLBGame[]): FatigueStats {
  if (!historicalGames.length || !todayGames.length) {
    return { maxFatigueCount: 0, highFatigueCount: 0 };
  }

  const teamStats: Record<number, { 
    pitcherCounts: number[];
    pitcherHistory: Record<number, string[]>;
  }> = {};

  const sortedGames = [...historicalGames].sort((a, b) => 
    parseISO(a.officialDate || '').getTime() - parseISO(b.officialDate || '').getTime()
  );

  sortedGames.forEach(game => {
    const homeId = game.teams.home.team.id;
    const awayId = game.teams.away.team.id;
    if (!teamStats[homeId]) teamStats[homeId] = { pitcherCounts: [], pitcherHistory: {} };
    if (!teamStats[awayId]) teamStats[awayId] = { pitcherCounts: [], pitcherHistory: {} };

    const homePitchers = game.boxscore?.teams.home.pitchers || [];
    const awayPitchers = game.boxscore?.teams.away.pitchers || [];

    teamStats[homeId].pitcherCounts.push(homePitchers.length);
    teamStats[awayId].pitcherCounts.push(awayPitchers.length);

    homePitchers.forEach(pId => {
      if (!teamStats[homeId].pitcherHistory[pId]) teamStats[homeId].pitcherHistory[pId] = [];
      teamStats[homeId].pitcherHistory[pId].push(game.officialDate || '');
    });
    awayPitchers.forEach(pId => {
      if (!teamStats[awayId].pitcherHistory[pId]) teamStats[awayId].pitcherHistory[pId] = [];
      teamStats[awayId].pitcherHistory[pId].push(game.officialDate || '');
    });
  });

  const playingTeamIds = new Set<number>();
  todayGames.forEach(g => {
    playingTeamIds.add(g.teams.away.team.id);
    playingTeamIds.add(g.teams.home.team.id);
  });

  let maxFatigue = 0;
  let highFatigue = 0;

  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  playingTeamIds.forEach(id => {
    const stats = teamStats[id];
    if (!stats) return;

    const lastUsage = stats.pitcherCounts[stats.pitcherCounts.length - 1] || 0;
    const avgUsage = stats.pitcherCounts.reduce((a, b) => a + b, 0) / (stats.pitcherCounts.length || 1);
    
    let consecutiveCount = 0;
    Object.values(stats.pitcherHistory).forEach(dates => {
      if (dates.includes(yesterday)) consecutiveCount++;
    });

    if (lastUsage >= 6 || consecutiveCount >= 4) {
      maxFatigue++;
    } else if (lastUsage >= 5 || consecutiveCount >= 2 || avgUsage > 4.5) {
      highFatigue++;
    }
  });

  return { 
    maxFatigueCount: maxFatigue, 
    highFatigueCount: highFatigue 
  };
}
