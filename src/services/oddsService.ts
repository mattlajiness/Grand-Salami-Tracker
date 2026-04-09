
export interface OddsResponse {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: {
    key: string;
    title: string;
    last_update: string;
    markets: {
      key: string;
      last_update: string;
      outcomes: {
        name: 'Over' | 'Under';
        price: number;
        point: number;
      }[];
    }[];
  }[];
}

export async function fetchMLBOdds(): Promise<OddsResponse[]> {
  const apiKey = (import.meta as any).env.VITE_ODDS_API_KEY;
  if (!apiKey) {
    console.warn('VITE_ODDS_API_KEY is not set. Betting lines will not be available.');
    return [];
  }

  const url = `https://api.the-odds-api.com/v4/sports/baseball_mlb/odds/?apiKey=${apiKey}&regions=us&markets=totals&oddsFormat=decimal`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('INVALID_API_KEY');
      }
      throw new Error(`Odds API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching MLB odds:', error);
    return [];
  }
}
