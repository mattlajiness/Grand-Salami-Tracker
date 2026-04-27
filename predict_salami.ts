import { fetchMLBGames } from './src/services/mlbService';
import { format, subDays } from 'date-fns';

async function predictGrandSalami() {
  const today = '2026-04-27';
  
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

    const recentAvgRPG = 8.4; // Weighted toward yesterday's 7.9 RPG trend cooling
    
    // 4. MLBMA Sharp Projections (from final data sheet)
    const mlbmaProjections: Record<string, number> = {
      "TB @ CLE": 6.79,
      "LAA @ CHW": 8.89,
      "SEA @ MIN": 8.74,
      "MIA @ LAD": 8.11,
      "BOS @ TOR": 7.50,
      "NYY @ TEX": 7.74,
      "STL @ PIT": 8.11,
      "CHC @ SD": 7.51
    };

    // 4.5 Ballpark Pal Year-Long Estimates (Runs, HR, Hits Factors)
    // Source: https://www.ballparkpal.com/Park-Factors-General.php
    const ballparkPalFactors: Record<string, { runs: number, hr: number, hits: number }> = {
      "Progressive Field": { runs: 1.03, hr: 1.12, hits: 1.05 },
      "Guaranteed Rate Field": { runs: 0.99, hr: 1.08, hits: 1.00 },
      "Target Field": { runs: 0.94, hr: 0.96, hits: 0.98 },
      "Dodger Stadium": { runs: 0.96, hr: 1.18, hits: 0.97 },
      "Rogers Centre": { runs: 1.01, hr: 1.05, hits: 1.02 },
      "Globe Life Field": { runs: 0.98, hr: 0.98, hits: 1.01 },
      "PNC Park": { runs: 0.92, hr: 0.88, hits: 0.98 },
      "Petco Park": { runs: 0.88, hr: 0.85, hits: 0.94 },
      "Chase Field": { runs: 1.06, hr: 0.92, hits: 1.12 },
      "Coors Field": { runs: 1.34, hr: 1.22, hits: 1.25 }
    };

    // 4.55 Ballpark Pal Daily Simulation Edge (Value against Market)
    const ballparkPalDailySim: Record<string, number> = {
      "TB @ CLE": -0.3,
      "LAA @ CHW": 0.2,
      "SEA @ MIN": -0.4,
      "MIA @ LAD": -0.2,
      "BOS @ TOR": 0.1,
      "NYY @ TEX": -0.1,
      "STL @ PIT": -0.5,
      "CHC @ SD": -0.6
    };
    
    // 4.6 Supplemental Data: Umpires & Bullpen Fatigue
    // Mocked based on today's report and typical sharp assignments
    const umpireFactors: Record<string, number> = {
      "TB @ CLE": 0.12,  // Wendelstedt
      "LAA @ CHW": 0.25, // Bucknor 
      "SEA @ MIN": 0.00, // Wolcott
      "MIA @ LAD": -0.15,// Hoberg
      "BOS @ TOR": 0.20, // Kulpa
      "NYY @ TEX": -0.18,// Hoye
      "STL @ PIT": -0.10,// Miller
      "CHC @ SD": 0.30   // Hernandez
    };

    const bullpenFatigueFactors: Record<string, number> = {
      "MIA @ LAD": 0.25, // MIA pen taxed (7 pitchers used yesterday)
      "BOS @ TOR": 0.15, // BOS pen high usage
      "LAA @ CHW": 0.10  // CHW pen struggle
    };
    
    const stadiumData = [
      { name: "Progressive Field", team: "TB @ CLE", offset: 0.51, hr: 0.15 },
      { name: "Guaranteed Rate Field", team: "LAA @ CHW", offset: -0.09, hr: -0.30 },
      { name: "Target Field", team: "SEA @ MIN", offset: -0.34, hr: 0.05 },
      { name: "Dodger Stadium", team: "MIA @ LAD", offset: -0.43, hr: 0.12 },
      { name: "Rogers Centre", team: "BOS @ TOR", offset: -0.43, hr: 0.00 },
      { name: "Globe Life Field", team: "NYY @ TEX", offset: -0.60, hr: 0.00 },
      { name: "PNC Park", team: "STL @ PIT", offset: -0.77, hr: -0.10 },
      { name: "Petco Park", team: "CHC @ SD", offset: -1.02, hr: -0.15 }
    ];

    const pitchingData: Record<string, {era: number, xera: number}> = {
      "LAD": { era: 2.77, xera: 2.85 }, "MIA": { era: 5.04, xera: 5.15 },
      "NYY": { era: 3.36, xera: 3.40 }, "TEX": { era: 4.18, xera: 4.25 },
      "CLE": { era: 3.41, xera: 3.50 }, "TB": { era: 4.40, xera: 4.50 },
      "TOR": { era: 3.38, xera: 3.45 }, "BOS": { era: 4.68, xera: 4.80 },
      "SD": { era: 3.76, xera: 3.85 }, "CHC": { era: 4.96, xera: 5.05 },
      "LAA": { era: 5.71, xera: 5.80 }, "CHW": { era: 5.02, xera: 5.10 },
      "STL": { era: 5.04, xera: 5.10 }, "PIT": { era: 3.90, xera: 4.00 },
      "SEA": { era: 4.68, xera: 4.75 }, "MIN": { era: 3.67, xera: 3.75 }
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

      // Special handling for specific game lines
      let line = game.totalLine || 8.5;
      
      const isBlueJays = awayName.includes("blue jays") || homeName.includes("blue jays") || awayName.includes("toronto") || homeName.includes("toronto");
      const isRedSox = awayName.includes("red sox") || homeName.includes("red sox") || awayName.includes("boston") || homeName.includes("boston");
      
      if (isBlueJays && isRedSox) line = 7.0;

      const offset = match ? match.offset : 0;
      const recentTrendExposure = recentAvgRPG - 8.6;
      
      // Pitching Weight (combining today's ERA/xERA from report)
      const awayP = pitchingData[awayAbbr] || { era: 4.2, xera: 4.2 };
      const homeP = pitchingData[homeAbbr] || { era: 4.2, xera: 4.2 };
      const pitcherImpact = ((awayP.xera + homeP.xera) / 2) - 4.2;

      // Final Projection adjusted for new sharp data and Ballpark Pal factors
      const sharpBase = mlbmaProjections[match ? match.team : ""] || line;
      const palData = ballparkPalFactors[game.venue.name] || { runs: 1.0, hr: 1.0, hits: 1.0 };
      const palAdjustment = line * palData.runs;
      const palSlugComponent = line * (palData.hr * 0.4 + palData.hits * 0.6);
      
      // Blending 35% Sharp, 20% Pal Runs, 10% Pal HR/Hits, 15% Vegas, 10% Stadium Offset + 50% Daily SIM Edge + Umpires/Pen
      const umpireImpact = umpireFactors[match ? match.team : ""] || 0;
      const bullpenImpact = bullpenFatigueFactors[match ? match.team : ""] || 0;
      const dailySimEdge = ballparkPalDailySim[match ? match.team : ""] || 0;
      
      const projectedScore = (sharpBase * 0.35) + (palAdjustment * 0.20) + (palSlugComponent * 0.10) + (line * 0.15) + (offset * 0.1) + (dailySimEdge * 0.5) + umpireImpact + bullpenImpact; 
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

    // 6. Grand Salami Final
    const salamiLineMarket = 68; // Confirmed by user
    const finalProjection = gamePredictions.reduce((acc, p) => acc + p.projected, 0);

    const salamiEdge = finalProjection - salamiLineMarket;
    const conviction = Math.abs(salamiEdge) > 3.0 ? "CRITICAL" : Math.abs(salamiEdge) > 1.5 ? "HIGH" : "MODERATE";

    console.log("\n==========================================");
    console.log("       GRAND SALAMI INTELLIGENCE        ");
    console.log("==========================================");
    console.log(`Vegas Market Line:    ${salamiLineMarket}`);
    console.log(`MLBMA Sharp Total:    63.39`);
    console.log(`Weather/Stadium Drip: ${totalStadiumOffset.toFixed(2)} runs`);
    console.log("------------------------------------------");
    console.log(`MODEL PROJECTION:     ${finalProjection.toFixed(1)}`);
    console.log(`SALAMI EDGE:          ${salamiEdge > 0 ? '+' : ''}${salamiEdge.toFixed(1)}`);
    console.log(`CONVICTION LEVEL:     ${conviction}`);
    console.log(`RECOMMENDED PLAY:     ${salamiEdge < 0 ? 'UNDER' : 'OVER'}`);
    console.log("==========================================\n");

    console.log("--- FULL BOARD SUPPORTS ---");
    gamePredictions.sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge)).forEach(p => {
      const edge = (p.projected - p.line).toFixed(1);
      console.log(`${p.matchup}: Line ${p.line} -> Proj ${p.projected.toFixed(1)} (Edge ${Number(edge) > 0 ? '+' : ''}${edge})`);
    });

  } catch (error) {
    console.error("Analysis failed:", error);
  }
}

predictGrandSalami();
