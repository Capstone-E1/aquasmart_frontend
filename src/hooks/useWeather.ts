import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { OpenWeatherResponse } from '../types/weather';

interface UseWeatherOptions {
  latitude?: number;
  longitude?: number;
  city?: string;
  autoFetch?: boolean;
}

interface UseWeatherReturn {
  weatherData: OpenWeatherResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  isRaining: boolean;
}

export function useWeather(options: UseWeatherOptions = {}): UseWeatherReturn {
  const { latitude, longitude, city, autoFetch = true } = options;
  
  const [weatherData, setWeatherData] = useState<OpenWeatherResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!autoFetch) return;
    
    // Need either coordinates or city name
    if ((!latitude || !longitude) && !city) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let data: OpenWeatherResponse;
      
      if (latitude && longitude) {
        data = await apiService.getWeatherByCoordinates(latitude, longitude);
      } else if (city) {
        data = await apiService.getWeatherByCity(city);
      } else {
        throw new Error('Either coordinates or city name is required');
      }

      setWeatherData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      console.error('useWeather: Error occurred:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude, city, autoFetch]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Check if it's raining
  const isRaining = weatherData?.weather?.some(
    condition => condition.main.toLowerCase() === 'rain'
  ) || false;

  return {
    weatherData,
    isLoading,
    error,
    refetch: fetchWeather,
    isRaining,
  };
}
