import axios from 'axios';

export interface City {
  id: string;
  name: string;
  country: string;
}

const API_KEY = process.env.VUE_APP_API_KEY;
const API_HOST = process.env.VUE_APP_API_HOST;

export const fetchCities = async (query: string): Promise<City[]> => {
  try {
    const res = await axios.get(`https://${API_HOST}/v1/geo/cities`, {
      params: {
        namePrefix: query,
        limit: 10,
      },
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST,
      },
    });

    return res.data.data.map((item: City) => ({
      id: item.id,
      name: item.name,
      country: item.country,
    }));
  } catch (e: any) {
    console.error('Ошибка при получении городов:', e);
    return [];
  }
};
