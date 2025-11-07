import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import type { SensorPrediction, PredictionSystemStatus, PredictionGenerateResponse } from '../services/api';

interface UseSensorPredictionsReturn {
  predictions: SensorPrediction[];
  predictionStatus: PredictionSystemStatus | null;
  isLoading: boolean;
  error: string | null;
  executionTime: number | null;
  historicalDataUsed: number | null;
  generatePredictions: (deviceId?: string, filterMode?: 'drinking_water' | 'household_water') => Promise<void>;
  updatePredictions: () => Promise<void>;
  fetchStatus: () => Promise<void>;
}

export function useSensorPredictions(): UseSensorPredictionsReturn {
  const [predictions, setPredictions] = useState<SensorPrediction[]>([]);
  const [predictionStatus, setPredictionStatus] = useState<PredictionSystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [historicalDataUsed, setHistoricalDataUsed] = useState<number | null>(null);

  const generatePredictions = useCallback(async (
    deviceId: string = 'stm32_pre',
    filterMode: 'drinking_water' | 'household_water' = 'drinking_water'
  ) => {
    console.log('🚀 Starting prediction generation...', { deviceId, filterMode });
    setIsLoading(true);
    setError(null);
    try {
      console.log('📡 Calling API...');
      const data: PredictionGenerateResponse = await apiService.generatePredictions({
        deviceId,
        filterMode
      });

      console.log('✅ Predictions received:', {
        count: data.predictions_count,
        executionTime: data.execution_time_ms,
        historicalData: data.historical_data_used
      });

      setPredictions(data.predictions);
      setExecutionTime(data.execution_time_ms);
      setHistoricalDataUsed(data.historical_data_used);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate predictions';
      console.error('❌ useSensorPredictions: Error generating predictions:', errorMessage, err);
      setError(errorMessage);
      setPredictions([]);
    } finally {
      console.log('🏁 Prediction generation finished');
      setIsLoading(false);
    }
  }, []);

  const updatePredictions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await apiService.updatePredictions();
      // Note: Update runs in background, doesn't return predictions immediately
      console.log('Prediction update triggered successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update predictions';
      console.error('useSensorPredictions: Error updating predictions:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const status = await apiService.getPredictionStatus();
      setPredictionStatus(status);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prediction status';
      console.error('useSensorPredictions: Error fetching status:', errorMessage);
      // Don't set error state for status fetch failures
    }
  }, []);

  return {
    predictions,
    predictionStatus,
    isLoading,
    error,
    executionTime,
    historicalDataUsed,
    generatePredictions,
    updatePredictions,
    fetchStatus
  };
}

// Hook for analyzing prediction trends
export function usePredictionTrends(predictions: SensorPrediction[]) {
  const getTrend = useCallback((metric: 'flow' | 'ph' | 'turbidity' | 'tds') => {
    if (predictions.length < 2) return { direction: 'stable', percentChange: 0 };

    const metricKeyMap = {
      flow: 'PredictedFlow',
      ph: 'PredictedPh',
      turbidity: 'PredictedTurbidity',
      tds: 'PredictedTDS'
    };

    const metricKey = metricKeyMap[metric] as keyof SensorPrediction;
    const firstValue = predictions[0][metricKey] as number;
    const lastValue = predictions[predictions.length - 1][metricKey] as number;

    const change = ((lastValue - firstValue) / firstValue) * 100;

    return {
      direction: Math.abs(change) < 2 ? 'stable' : change > 0 ? 'increasing' : 'decreasing',
      percentChange: Math.abs(change)
    };
  }, [predictions]);

  const getAverageConfidence = useCallback(() => {
    if (predictions.length === 0) return 0;
    const sum = predictions.reduce((acc, p) => acc + p.ConfidenceScore, 0);
    return sum / predictions.length;
  }, [predictions]);

  const getLowConfidencePredictions = useCallback((threshold: number = 0.7) => {
    return predictions.filter(p => p.ConfidenceScore < threshold);
  }, [predictions]);

  return {
    getTrend,
    getAverageConfidence,
    getLowConfidencePredictions
  };
}
