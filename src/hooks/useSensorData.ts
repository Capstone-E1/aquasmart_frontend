import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { SensorData } from '../services/api';

interface UseSensorDataReturn {
  latestData: SensorData | null;
  allData: SensorData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSensorData(refreshInterval = 30000): UseSensorDataReturn {
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [allData, setAllData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [latest, all] = await Promise.all([
        apiService.getLatestSensorData(),
        apiService.getAllSensorData()
      ]);
      
      setLatestData(latest);
      setAllData(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching sensor data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    // Set up periodic refresh
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return {
    latestData,
    allData,
    isLoading,
    error,
    refetch
  };
}

// Hook specifically for getting individual parameter data
export function useParameterData(parameter: 'ph' | 'turbidity' | 'tds') {
  const { latestData, isLoading, error, refetch } = useSensorData();

  const value = latestData ? latestData[parameter] : null;
  const status = value !== null ? apiService.getParameterStatus(parameter, value) : 'normal';

  return {
    value,
    status,
    timestamp: latestData?.timestamp,
    isLoading,
    error,
    refetch
  };
}