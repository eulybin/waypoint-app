import { API_ENDPOINTS } from '../utils/apiConfig';

export const fetchWeather = async (city) => {
  if (!city) return null;
  try {
    const res = await fetch(API_ENDPOINTS.WEATHER(encodeURIComponent(city)));
    if (!res.ok) throw new Error('Failed to fetch weather');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('fetchWeather error:', err);
    return null;
  }
};

