import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { SensorData, DailyAnalytics } from '../services/api';

interface UseSensorDataReturn {
  latestData: SensorData | null;
  allData: SensorData[];
  dailyAnalytics: DailyAnalytics;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSensorData(refreshInterval = 10000): UseSensorDataReturn {
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [allData, setAllData] = useState<SensorData[]>([]);
  const [dailyAnalytics, setDailyAnalytics] = useState<DailyAnalytics>({
    date: new Date().toISOString().split('T')[0],
    filter_mode: 'drinking_water',
    best_ph: 7.0,
    best_tds: 400,
    best_turbidity: 0.5,
    best_flow: 2.5,
    worst_ph: 7.0,
    worst_tds: 400,
    worst_turbidity: 0.5,
    total_readings: 0,
    overall_quality: 'Loading...',
    summary: 'Loading daily analytics...'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      console.log('useSensorData: Starting to fetch data...');
      setError(null);
      const [latest, all, analytics] = await Promise.all([
        apiService.getLatestSensorData(),
        apiService.getAllSensorData(),
        apiService.getDailyAnalytics()
      ]);
      
      console.log('useSensorData: Received latest data:', latest);
      console.log('useSensorData: Received all data:', all);
      console.log('useSensorData: Received daily analytics:', analytics);
      
      setLatestData(latest);
      setAllData(all);
      setDailyAnalytics(analytics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      console.error('useSensorData: Error occurred:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('useSensorData: Fetch completed, loading set to false');
    }
  }, []);

  const refetch = useCallback(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    console.log('useSensorData: useEffect triggered, starting initial fetch...');
    fetchData();

    // Set up periodic refresh
    if (refreshInterval > 0) {
      console.log('useSensorData: Setting up refresh interval:', refreshInterval, 'ms');
      const interval = setInterval(() => {
        console.log('useSensorData: Refresh interval triggered, fetching data...');
        fetchData();
      }, refreshInterval);
      return () => {
        console.log('useSensorData: Cleaning up refresh interval');
        clearInterval(interval);
      };
    }
  }, [fetchData, refreshInterval]);

  return {
    latestData,
    allData,
    dailyAnalytics,
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

  console.log(`useParameterData(${parameter}):`, {
    latestData,
    value,
    status,
    isLoading,
    error
  });

  return {
    value,
    status,
    timestamp: latestData?.timestamp,
    isLoading,
    error,
    refetch
  };
}