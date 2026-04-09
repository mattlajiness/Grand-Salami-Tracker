
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

export async function fetchMLBOdds(manualKey?: string): Promise<OddsResponse[]> {
  try {
    const headers: Record<string, string> = {};
    if (manualKey) {
      headers['x-api-key'] = manualKey;
    }

    const response = await fetch('/api/odds', { headers });
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
