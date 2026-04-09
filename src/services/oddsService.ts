
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
  try {
    const response = await fetch('/api/odds');
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401 || errorData.error?.includes('API_KEY')) {
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
