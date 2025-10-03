import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { SensorData } from '../services/api';

interface UseHistoryDataReturn {
  historyData: SensorData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useHistoryData = (limit: number = 20): UseHistoryDataReturn => {
  const [historyData, setHistoryData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistoryData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`🔄 Fetching recent ${limit} sensor readings for history...`);
      
      const data = await apiService.getRecentSensorData(limit);
      setHistoryData(data);
      console.log(`✅ History data loaded: ${data.length} readings`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch history data';
      console.error('❌ History data fetch error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  const refetch = useCallback(async () => {
    await fetchHistoryData();
  }, [fetchHistoryData]);

  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  return {
    historyData,
    isLoading,
    error,
    refetch
  };
};