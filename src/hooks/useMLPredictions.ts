import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type { MLDashboard, FilterHealth, Anomaly, AnomalyStats } from '../services/api';

interface UseMLPredictionsReturn {
  dashboard: MLDashboard | null;
  filterHealth: FilterHealth | null;
  unresolvedAnomalies: Anomaly[];
  anomalyStats: AnomalyStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  resolveAnomaly: (anomalyId: number) => Promise<void>;
  markAnomalyFalsePositive: (anomalyId: number) => Promise<void>;
}

export function useMLPredictions(refreshInterval: number = 30000): UseMLPredictionsReturn {
  const [dashboard, setDashboard] = useState<MLDashboard | null>(null);
  const [filterHealth, setFilterHealth] = useState<FilterHealth | null>(null);
  const [unresolvedAnomalies, setUnresolvedAnomalies] = useState<Anomaly[]>([]);
  const [anomalyStats, setAnomalyStats] = useState<AnomalyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const dashboardData = await apiService.getMLDashboard();

      setDashboard(dashboardData);
      setFilterHealth(dashboardData.filter_health);
      setUnresolvedAnomalies(dashboardData.anomalies.unresolved || []);
      setAnomalyStats(dashboardData.anomalies.stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch ML predictions';
      console.error('useMLPredictions: Error occurred:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  const resolveAnomaly = useCallback(async (anomalyId: number) => {
    try {
      await apiService.resolveAnomaly(anomalyId);
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve anomaly';
      console.error('useMLPredictions: Error resolving anomaly:', errorMessage);
      throw err;
    }
  }, [fetchData]);

  const markAnomalyFalsePositive = useCallback(async (anomalyId: number) => {
    try {
      await apiService.markAnomalyFalsePositive(anomalyId);
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark anomaly as false positive';
      console.error('useMLPredictions: Error marking false positive:', errorMessage);
      throw err;
    }
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
    dashboard,
    filterHealth,
    unresolvedAnomalies,
    anomalyStats,
    isLoading,
    error,
    refetch,
    resolveAnomaly,
    markAnomalyFalsePositive
  };
}

// Hook specifically for filter health monitoring
export function useFilterHealth(refreshInterval: number = 60000) {
  const [filterHealth, setFilterHealth] = useState<FilterHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const healthData = await apiService.getFilterHealth();
      setFilterHealth(healthData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch filter health';
      console.error('useFilterHealth: Error occurred:', errorMessage);
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
    filterHealth,
    isLoading,
    error,
    refetch
  };
}

// Hook specifically for anomaly monitoring
export function useAnomalies(refreshInterval: number = 30000) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [unresolvedAnomalies, setUnresolvedAnomalies] = useState<Anomaly[]>([]);
  const [stats, setStats] = useState<AnomalyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [allAnomalies, unresolved, anomalyStats] = await Promise.all([
        apiService.getAnomalies({ limit: 50 }),
        apiService.getUnresolvedAnomalies(),
        apiService.getAnomalyStats()
      ]);

      setAnomalies(allAnomalies);
      setUnresolvedAnomalies(unresolved);
      setStats(anomalyStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch anomalies';
      console.error('useAnomalies: Error occurred:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  const resolveAnomaly = useCallback(async (anomalyId: number) => {
    try {
      await apiService.resolveAnomaly(anomalyId);
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve anomaly';
      console.error('useAnomalies: Error resolving anomaly:', errorMessage);
      throw err;
    }
  }, [fetchData]);

  const markAnomalyFalsePositive = useCallback(async (anomalyId: number) => {
    try {
      await apiService.markAnomalyFalsePositive(anomalyId);
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark false positive';
      console.error('useAnomalies: Error marking false positive:', errorMessage);
      throw err;
    }
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
    anomalies,
    unresolvedAnomalies,
    stats,
    isLoading,
    error,
    refetch,
    resolveAnomaly,
    markAnomalyFalsePositive
  };
}
