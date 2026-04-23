import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ModelInputs {
  weather: {
    avgTemp: number;
    highWindGames: number;
  } | null;
  fatigue: {
    maxFatigueCount: number;
    highFatigueCount: number;
  };
  stats: {
    currentTotal: number;
    projectedTotal: number;
    betLine: number | '';
    betType: 'over' | 'under';
    gamesLive: number;
    gamesFinished: number;
    totalGames: number;
    sumOfLines?: number;
  };
  mode: 'forecast' | 'live';
}

export async function analyzeSalamiEdge(inputs: ModelInputs) {
  if (!process.env.GEMINI_API_KEY) {
    return "AI Analysis unavailable: No API Key provided.";
  }

  const isForecast = inputs.mode === 'forecast';
  
  const prompt = isForecast ? `
    Provide a professional MLB Grand Salami predictive analysis for today's ${inputs.stats.totalGames}-game slate.
    
    DATA:
    - Weather: ${inputs.weather ? `${inputs.weather.avgTemp}° AVG, ${inputs.weather.highWindGames} windy` : 'Unknown'}
    - Fatigue: ${inputs.fatigue.maxFatigueCount} MAX, ${inputs.fatigue.highFatigueCount} HIGH
    - Market Total: ${inputs.stats.sumOfLines || 'Unknown'}

    TASK:
    Analyze why the market may be mispricing this slate. 
    State your "Model Line" clearly.
  ` : `
    Analyze the live state of this ${inputs.stats.totalGames}-game MLB Grand Salami.
    
    LIVE STATUS:
    - Progress: ${inputs.stats.gamesFinished} Finished, ${inputs.stats.gamesLive} Live
    - Score: ${inputs.stats.currentTotal} runs, Projecting ${inputs.stats.projectedTotal}
    - User Wager: ${inputs.stats.betType.toUpperCase()} ${inputs.stats.betLine}
    - Fatigue: ${inputs.fatigue.maxFatigueCount} MAX, ${inputs.fatigue.highFatigueCount} HIGH

    TASK:
    Evaluate the current pace vs the incoming late-inning bullpen volatility.
    State your "Live Model Line".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional MLB Betting Quant. Provide sharp, data-driven analysis in 3-5 sentences. Start DIRECTLY with the analysis. No introductory fluff or meta-commentary.",
        temperature: 0.7,
        maxOutputTokens: 400,
      }
    });

    return response.text || "Model is currently calibrating slate data.";
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Model Analyst encountered an error processing the slate data.";
  }
}

export async function generateFullReport(inputs: ModelInputs) {
  if (!process.env.GEMINI_API_KEY) return "No API Key found in environment.";

  const prompt = `
    Generate an exhaustive, highly technical "Salami Edge Report" for the current MLB slate.
    
    SYSTEM STATUS:
    - Slate Size: ${inputs.stats.totalGames} Games
    - Progress: ${inputs.stats.gamesFinished} Finished, ${inputs.stats.gamesLive} Live
    - Weather Alpha: ${inputs.weather?.avgTemp}°F Avg, ${inputs.weather?.highWindGames} windy venues
    - Bullpen Risk: ${inputs.fatigue.maxFatigueCount} MAX stress rosters, ${inputs.fatigue.highFatigueCount} HIGH stress rosters
    - Heuristic Projection: ${inputs.stats.projectedTotal} total runs
    - Market Total: ${inputs.stats.sumOfLines || 'N/A'}
    - User Sentiment: ${inputs.stats.betType.toUpperCase()} ${inputs.stats.betLine}

    ANALYSIS REQUIREMENTS:
    - You must provide a specific "Official Model Line" total runs estimate. (e.g. Model Line: 122.4)
    - Analyze the atmospheric carry (temp/wind) impact on total output.
    - Analyze the relief volatility (fatigue vs late-inning projections).
    - Determine if the current pace is a regression candidate or a sustained trend.

    STRUCTURE:
    1. EXECUTIVE SUMMARY (Official Model Line & Overall Edge %)
    2. ATMOSPHERIC & VENUE IMPACT
    3. RELIEF SYSTEM VOLATILITY
    4. PROJECTION STABILITY ANALYSIS
    5. STRATEGIC RECOMMENDATION

    STRICT CONSTRAINT: Start immediately with "1. EXECUTIVE SUMMARY". Do not acknowledge this prompt. Do not provide meta-commentary.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are the Head of MLB Quantitative Analysis for a high-frequency trading firm. Your reports are technical, cold, and data-driven. Use terms like 'CLV', 'Expected Runs', 'Poisson Distribution', and 'Sigma'. Never use conversational language or introductory fluff.",
        temperature: 0.3,
        maxOutputTokens: 1200,
      }
    });

    let text = response.text || "";
    
    // Clean up common AI meta-chatter or weird prefixes
    text = text.replace(/^[^1a-zA-Z]*/, '').trim(); 
    
    if (text.length < 50) return "Simulation report generated insufficient data. Please re-run analysis.";

    return text;
  } catch (error) {
    console.error("Full Report Error:", error);
    return "Secondary AI simulation failed. This usually occurs during high-volatility data updates. Please try again in 30 seconds.";
  }
}
