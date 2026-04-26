import { fetchMLBGames } from './src/services/mlbService';
import { readFileSync, writeFileSync } from 'fs';

async function verifyResults(date: string) {
  try {
    const games = await fetchMLBGames(date);
    let totalRuns = 0;
    const gameResults = games.map(g => {
      const runs = (g.teams.away.score || 0) + (g.teams.home.score || 0);
      totalRuns += runs;
      return {
        match: `${g.teams.away.team.abbreviation} @ ${g.teams.home.team.abbreviation}`,
        runs
      };
    });

    console.log(`--- RESULTS FOR ${date} ---`);
    console.log(`Total Salami Runs: ${totalRuns}`);
    
    // Update tracking log
    const history = JSON.parse(readFileSync('./model_tracking.json', 'utf8'));
    const dayEntry = history.find((h: any) => h.date === date);
    
    if (dayEntry) {
      dayEntry.actual = {
        salamiTotal: totalRuns,
        games: gameResults
      };
      dayEntry.accuracy = totalRuns > dayEntry.predictions.grandSalami.line ? "HIT (OVER)" : "MISS (UNDER)";
      writeFileSync('./model_tracking.json', JSON.stringify(history, null, 2));
      console.log(`Database updated. Performance: ${dayEntry.accuracy}`);
    }

  } catch (e) {
    console.error("Verification failed. Games might not be finished yet.");
  }
}

const targetDate = process.argv[2] || '2026-04-26';
verifyResults(targetDate);
