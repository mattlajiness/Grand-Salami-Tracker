import { fetchMLBGames } from './src/services/mlbService';
import { format, subDays } from 'date-fns';

async function predictGrandSalami() {
  const today = '2026-04-26';
  
  try {
    console.log(`Deep Analysis: Grand Salami for ${today}...`);
    
    // 1. Fetch Today's Games
    const todayGames = await fetchMLBGames(today);
    const gameCount = todayGames.length;
    
    if (gameCount === 0) {
      console.log("No games scheduled for today.");
      return;
    }

    // 2. Fetch Vegas Totals
    let vegasSalami = 0;
    let gamesWithOdds = 0;
    
    console.log(`Fetching odds for ${gameCount} games...`);
    
    const gamesWithOddsData = await Promise.all(todayGames.map(async (game) => {
      try {
        const url = `https://statsapi.mlb.com/api/v1/game/${game.gamePk}/contextMetrics?hydrate=odds`;
        const res = await fetch(url);
        const data = await res.json();
        
        // Path: odds[0].total
        const total = data.odds?.[0]?.total || 0;
        return { ...game, totalLine: total };
      } catch (e) {
        return { ...game, totalLine: 0 };
      }
    }));

    gamesWithOddsData.forEach(g => {
      if (g.totalLine > 0) {
        vegasSalami += g.totalLine;
        gamesWithOdds++;
      }
    });

    // If some games are missing odds, estimate based on average of those that have them
    const avgVegasLine = gamesWithOdds > 0 ? vegasSalami / gamesWithOdds : 8.5;
    const estimatedTotalVegasSalami = vegasSalami + (gameCount - gamesWithOdds) * avgVegasLine;

    // 3. Fetch Last 7 Days for Trend Analysis
    const startDate = format(subDays(new Date(today), 7), 'yyyy-MM-dd');
    const endDate = format(subDays(new Date(today), 1), 'yyyy-MM-dd');
    const historicalGames = await fetchMLBGames(undefined, startDate, endDate);

    const dailyTotals: Record<string, number> = {};
    const gameCounts: Record<string, number> = {};
    
    historicalGames.forEach(game => {
      const date = game.officialDate || game.gameDate.split('T')[0];
      const runs = (game.teams.away.score || 0) + (game.teams.home.score || 0);
      dailyTotals[date] = (dailyTotals[date] || 0) + runs;
      gameCounts[date] = (gameCounts[date] || 0) + 1;
    });

    const historicalData = Object.keys(dailyTotals).map(date => ({
      date,
      total: dailyTotals[date],
      count: gameCounts[date],
      rpg: dailyTotals[date] / gameCounts[date]
    }));

    const recentAvgRPG = historicalData.reduce((acc, d) => acc + d.rpg, 0) / historicalData.length;
    
    // 4. Stadium, Weather & Pitching Intelligence Sync
    const stadiumData = [
      { name: "Estadio Alfredo H.H.", team: "SD @ ARI", offset: 5.12, hr: 0.55 },
      { name: "Kauffman Stadium", team: "LAA @ KC", offset: 0.29, hr: 0.16 },
      { name: "Dodger Stadium", team: "CHC @ LAD", offset: 0.22, hr: 0.14 },
      { name: "Great American BP", team: "DET @ CIN", offset: 0.13, hr: 0.02 },
      { name: "Truist Park", team: "PHI @ ATL", offset: -0.34, hr: -0.01 },
      { name: "Rogers Centre", team: "CLE @ TOR", offset: -0.42, hr: 0.03 },
      { name: "American Family Fld", team: "PIT @ MIL", offset: -0.44, hr: 0.06 },
      { name: "Daikin Park", team: "NYY @ HOU", offset: -0.44, hr: 0.03 },
      { name: "Oracle Park", team: "MIA @ SF", offset: -0.49, hr: -0.25 },
      { name: "Tropicana Field", team: "MIN @ TB", offset: -0.53, hr: -0.04 },
      { name: "Busch Stadium", team: "SEA @ STL", offset: -0.64, hr: -0.14 },
      { name: "Globe Life Field", team: "ATH @ TEX", offset: -0.69, hr: -0.11 },
      { name: "Oriole Park", team: "BOS @ BAL", offset: -0.90, hr: -0.28 },
      { name: "Rate Field", team: "WAS @ CHW", offset: -1.06, hr: -0.14 },
      { name: "Citi Field", team: "COL @ NYM", offset: -1.55, hr: -0.20 }
    ];

    const pitchingData: Record<string, {era: number, xera: number}> = {
      "PHI": { era: 5.80, xera: 4.25 }, "ATL": { era: 2.62, xera: 2.91 },
      "CLE": { era: 4.60, xera: 5.22 }, "TOR": { era: 4.34, xera: 4.84 },
      "DET": { era: 4.23, xera: 4.05 }, "CIN": { era: 3.10, xera: 4.00 },
      "COL": { era: 5.78, xera: 4.59 }, "NYM": { era: 2.30, xera: 2.87 },
      "MIN": { era: 4.40, xera: 3.95 }, "TB": { era: 3.80, xera: 3.85 },
      "WSH": { era: 3.38, xera: 4.63 }, "CHW": { era: 3.38, xera: 4.38 },
      "PIT": { era: 3.49, xera: 3.98 }, "MIL": { era: 3.71, xera: 4.24 },
      "NYY": { era: 3.48, xera: 5.00 }, "HOU": { era: 4.66, xera: 5.34 },
      "SEA": { era: 4.40, xera: 5.13 }, "STL": { era: 4.17, xera: 5.03 },
      "ATH": { era: 4.82, xera: 3.61 }, "TEX": { era: 5.19, xera: 5.21 },
      "MIA": { era: 4.52, xera: 4.68 }, "SF": { era: 3.48, xera: 3.92 },
      "SD": { era: 3.12, xera: 4.25 }, "ARI": { era: 3.81, xera: 4.08 },
      "CHC": { era: 3.47, xera: 3.76 }, "LAD": { era: 3.67, xera: 3.52 },
      "LAA": { era: 4.00, xera: 3.32 }, "KC": { era: 3.62, xera: 4.96 }
    };

    const totalStadiumOffset = stadiumData.reduce((acc, s) => acc + s.offset, 0);

    // 5. Game Level Predictions
    const gamePredictions = todayGames.map(game => {
      const awayName = game.teams.away.team.name.toLowerCase();
      const homeName = game.teams.home.team.name.toLowerCase();
      const awayAbbr = game.teams.away.team.abbreviation;
      const homeAbbr = game.teams.home.team.abbreviation;

      const match = stadiumData.find(s => {
        const teams = s.team.split(' @ ');
        const stadiumAway = teams[0].toLowerCase();
        const stadiumHome = teams[1].toLowerCase();
        return (awayName.includes(stadiumAway) || homeName.includes(stadiumAway)) &&
               (awayName.includes(stadiumHome) || homeName.includes(stadiumHome));
      });

      // Special handling for SD @ ARI line from user
      let line = game.totalLine || 8.5;
      const isPadres = awayName.includes("padres") || homeName.includes("padres") || awayName.includes("san diego") || homeName.includes("san diego");
      const isDbacks = awayName.includes("diamondbacks") || homeName.includes("diamondbacks") || awayName.includes("arizona") || homeName.includes("arizona");
      if (isPadres && isDbacks) line = 15.5;

      const offset = match ? match.offset : 0;
      const recentTrendExposure = recentAvgRPG - 8.6;
      
      // Pitching Weight (combining today's ERA/xERA from report)
      const awayP = pitchingData[awayAbbr] || { era: 4.2, xera: 4.2 };
      const homeP = pitchingData[homeAbbr] || { era: 4.2, xera: 4.2 };
      const pitcherImpact = ((awayP.xera + homeP.xera) / 2) - 4.2;

      // Final Projection adjusted for new data
      const projectedScore = line + offset + (recentTrendExposure * 0.4) + (pitcherImpact * 0.6);
      const edge = projectedScore - line;

      // Handle Doubleheaders labeling
      const isDoubleHeader = todayGames.filter(g => 
        g.teams.away.team.name === game.teams.away.team.name && 
        g.teams.home.team.name === game.teams.home.team.name
      ).length > 1;
      
      let gameLabel = "";
      if (isDoubleHeader) {
        const index = todayGames.filter(g => 
          g.teams.away.team.name === game.teams.away.team.name && 
          g.teams.home.team.name === game.teams.home.team.name
        ).findIndex(g => g.gamePk === game.gamePk);
        gameLabel = ` (Game ${index + 1})`;
      }

      return {
        matchup: `${game.teams.away.team.name} @ ${game.teams.home.team.name}${gameLabel}`,
        line: line,
        projected: projectedScore,
        edge: edge,
        venue: game.venue.name,
        isMetsG2: game.teams.home.team.name.includes("Mets") && gameLabel.includes("Game 2")
      };
    });

    const topOvers = [...gamePredictions]
      .filter(p => p.edge > 0 && !p.isMetsG2)
      .sort((a, b) => b.edge - a.edge)
      .slice(0, 3);
      
    const topUnders = [...gamePredictions]
      .filter(p => p.edge < 0)
      .sort((a, b) => a.edge - b.edge)
      .slice(0, 3);

    // 6. Grand Salami Final
    const salamiLineMarket = 146; // Fixed per user update
    const finalProjection = salamiLineMarket + ( (recentAvgRPG - 8.6) * (gameCount * 0.4) ) + totalStadiumOffset;

    console.log("\n--- TOP PREDICTIONS ---");
    console.log(`\n🔥 TOP ${topOvers.length} OVERS (Alternative to Mets G2 included):`);
    topOvers.forEach(p => console.log(`${p.matchup}: Line ${p.line} -> Proj ${p.projected.toFixed(1)} (Edge +${p.edge.toFixed(1)})`));
    
    console.log(`\n❄️ TOP ${topUnders.length} UNDERS:`);
    topUnders.forEach(p => console.log(`${p.matchup}: Line ${p.line} -> Proj ${p.projected.toFixed(1)} (Edge ${p.edge.toFixed(1)})`));

    if (topUnders.length === 0) {
      console.log("No strong Under plays identified in this high-scoring environment.");
    }

    console.log("\n--- GRAND SALAMI ---");
    console.log(`Vegas Grand Salami Line: ${salamiLineMarket}`);
    console.log(`Recent League Velocity: ${recentAvgRPG.toFixed(2)} RPG`);
    console.log(`Calculated Weather/Stadium Drain: ${totalStadiumOffset.toFixed(2)} runs`);
    console.log(`\nPREDICTED GRAND SALAMI TOTAL: ${finalProjection.toFixed(1)}`);
    
    const edgeAmount = finalProjection - salamiLineMarket;
    console.log(`Salami Edge: ${edgeAmount > 0 ? '+' : ''}${edgeAmount.toFixed(1)} runs`);

  } catch (error) {
    console.error("Analysis failed:", error);
  }
}

predictGrandSalami();
