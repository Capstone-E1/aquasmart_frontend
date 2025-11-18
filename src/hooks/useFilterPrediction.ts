import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import type { FilterHealth } from '../services/api';

interface UseFilterPredictionReturn {
  filterHealth: FilterHealth | null;
  isLoading: boolean;
  error: string | null;
  fetchFilterHealth: (deviceId?: string) => Promise<void>;
  analyzeFilterHealth: (deviceId?: string) => Promise<void>;
}

/**
 * Hook to manage filter health prediction data
 * Integrates with backend AI filter predictor
 */
export function useFilterPrediction(): UseFilterPredictionReturn {
  const [filterHealth, setFilterHealth] = useState<FilterHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFilterHealth = useCallback(async (deviceId: string = 'filter_system') => {
    try {
      setIsLoading(true);
      setError(null);

      const health = await apiService.getFilterHealth(deviceId);
      setFilterHealth(health);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch filter health';
      console.error('useFilterPrediction: Fetch failed:', errorMessage);
      setError(errorMessage);
      setFilterHealth(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeFilterHealth = useCallback(async (deviceId: string = 'filter_system') => {
    try {
      setIsLoading(true);
      setError(null);

      const health = await apiService.analyzeFilterHealth(deviceId);
      setFilterHealth(health);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze filter health';
      console.error('useFilterPrediction: Analysis failed:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    filterHealth,
    isLoading,
    error,
    fetchFilterHealth,
    analyzeFilterHealth
  };
}
