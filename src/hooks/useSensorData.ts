import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { useSettings } from '../contexts/SettingsContext';
import type { SensorData, DailyAnalytics, WorstDailyValues } from '../services/api';

interface UseSensorDataReturn {
  latestData: SensorData | null;
  allData: SensorData[];
  dailyAnalytics: DailyAnalytics;
  worstValues: WorstDailyValues;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSensorData(overrideInterval?: number): UseSensorDataReturn {
  const { settings } = useSettings();
  const refreshInterval = overrideInterval !== undefined ? overrideInterval : settings.data.refreshInterval;
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [allData, setAllData] = useState<SensorData[]>([]);
  const [dailyAnalytics, setDailyAnalytics] = useState<DailyAnalytics>({
    date: new Date().toISOString().split('T')[0],
    filter_mode: 'drinking_water',
    best_ph: 7.0,
    best_tds: 400,
    best_turbidity: 0.5,
    best_flow: 2.5,
    total_readings: 0,
    overall_quality: 'Loading...',
    summary: 'Loading daily analytics...'
  });
  const [worstValues, setWorstValues] = useState<WorstDailyValues>({
    date: new Date().toISOString().split('T')[0],
    worst_ph: 7.0,
    worst_tds: 400,
    worst_turbidity: 0.5,
    total_readings: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [latest, all, analytics, worst] = await Promise.all([
        apiService.getLatestSensorData(),
        apiService.getAllSensorData(),
        apiService.getDailyAnalytics(),
        apiService.getWorstDailyValues()
      ]);
      
      setLatestData(latest);
      setAllData(all);
      setDailyAnalytics(analytics);
      setWorstValues(worst);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      console.error('useSensorData: Error occurred:', errorMessage);
      setError(errorMessage);
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

    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchData();
      }, refreshInterval);
      return () => {
        clearInterval(interval);
      };
    }
  }, [fetchData, refreshInterval]);

  return {
    latestData,
    allData,
    dailyAnalytics,
    worstValues,
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

// Hook for getting pre and post filtration data for a specific parameter
export function usePrePostParameterData(parameter: 'ph' | 'turbidity' | 'tds') {
  const { allData, isLoading, error, refetch } = useSensorData();

  // Get the latest data for pre and post devices
  const preData = allData.find(data => data.device_id.toLowerCase().includes('stm32_pre'));
  const postData = allData.find(data => data.device_id.toLowerCase().includes('stm32_post'));

  const preValue = preData ? preData[parameter] : null;
  const postValue = postData ? postData[parameter] : null;

  const preStatus = preValue !== null ? apiService.getParameterStatus(parameter, preValue) : 'normal';
  const postStatus = postValue !== null ? apiService.getParameterStatus(parameter, postValue) : 'normal';

  return {
    pre: {
      value: preValue,
      status: preStatus,
      timestamp: preData?.timestamp,
      deviceId: preData?.device_id
    },
    post: {
      value: postValue,
      status: postStatus,
      timestamp: postData?.timestamp,
      deviceId: postData?.device_id
    },
    isLoading,
    error,
    refetch
  };
}