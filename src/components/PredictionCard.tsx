import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles, AlertCircle, RefreshCw, Clock, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { PredictionChart } from './PredictionChart';
import type { SensorPrediction } from '../services/api';
import { usePredictionTrends } from '../hooks/useSensorPredictions';

interface PredictionCardProps {
  predictions: SensorPrediction[];
  deviceId: string;
  isLoading?: boolean;
  error?: string | null;
  executionTime?: number | null;
  historicalDataUsed?: number | null;
  onRefresh?: () => Promise<void>;
}

export function PredictionCard({
  predictions,
  deviceId,
  isLoading,
  error,
  executionTime,
  historicalDataUsed,
  onRefresh
}: PredictionCardProps) {
  const [selectedMetric, setSelectedMetric] = useState<'flow' | 'ph' | 'turbidity' | 'tds'>('ph');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const { getTrend, getAverageConfidence, getLowConfidencePredictions } = usePredictionTrends(predictions);

  // Show success toast when predictions are loaded
  useEffect(() => {
    if (!isLoading && predictions.length > 0 && !error) {
      setShowSuccessToast(true);
      const timer = setTimeout(() => setShowSuccessToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [predictions.length, isLoading, error]);

  const metrics = [
    { key: 'flow' as const, label: 'Flow', color: 'blue' },
    { key: 'ph' as const, label: 'pH', color: 'purple' },
    { key: 'turbidity' as const, label: 'Turbidity', color: 'cyan' },
    { key: 'tds' as const, label: 'TDS', color: 'green' }
  ];

  const getTrendIcon = (direction: string) => {
    if (direction === 'increasing') return TrendingUp;
    if (direction === 'decreasing') return TrendingDown;
    return Minus;
  };

  const getTrendColor = (direction: string) => {
    if (direction === 'increasing') return 'text-green-400';
    if (direction === 'decreasing') return 'text-red-400';
    return 'text-slate-400';
  };

  console.log('PredictionCard render:', {
    isLoading,
    predictionsCount: predictions.length,
    hasError: !!error
  });

  // ALWAYS return the same card structure - never break the layout
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 relative min-h-[400px]">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-green-500/20 backdrop-blur-lg border border-green-500/30 rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Predictions generated successfully!</span>
            </div>
          </div>
        </div>
      )}

      {/* Header - Always visible */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold text-lg">Sensor Predictions</h3>
          {isLoading && (
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30 animate-pulse">
              Processing...
            </span>
          )}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm font-medium",
              isLoading
                ? "bg-purple-500/30 border-purple-500/50 text-purple-300 cursor-wait"
                : "bg-purple-500/20 border-purple-500/30 text-purple-400 hover:bg-purple-500/30 hover:border-purple-500/50",
              "disabled:cursor-not-allowed"
            )}
            title={isLoading ? "Generating predictions..." : "Refresh predictions"}
          >
            <RefreshCw className={cn("w-4 h-4 transition-transform", isLoading && "animate-spin")} />
            {!isLoading && <span className="text-xs">Refresh</span>}
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="relative">
        {/* LOADING STATE - First time generation */}
        {isLoading && predictions.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <RefreshCw className="w-16 h-16 text-purple-400 animate-spin" />
                <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-ping"></div>
              </div>
              <h4 className="text-white font-semibold text-lg mb-2">Generating Predictions</h4>
              <p className="text-slate-400 text-sm mb-3">
                Analyzing historical sensor data...
              </p>
              <div className="flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-4">This will take a few seconds...</p>
            </div>
          </div>
        ) : error ? (
          /* ERROR STATE */
          <div className="py-12">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">Unable to Generate Predictions</h4>
                <p className="text-slate-400 text-sm">{error}</p>
                {error.includes('Insufficient') && (
                  <p className="text-slate-400 text-xs mt-2">
                    The system needs at least 50 historical sensor readings to generate accurate predictions.
                    Please wait for more data to be collected.
                  </p>
                )}
              </div>
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="w-full mt-4 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Try Again
              </button>
            )}
          </div>
        ) : predictions.length === 0 ? (
          /* EMPTY STATE - Initial */
          <div className="text-center py-12">
            <div className="relative inline-block mb-4">
              <Sparkles className="w-16 h-16 text-purple-400 mx-auto" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
            </div>
            <h3 className="text-white font-semibold text-xl mb-2">Generate AI Predictions</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
              Get AI-powered forecasts for the next 24 time periods. Our system will analyze historical sensor data to predict future water quality trends.
            </p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="group px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 rounded-lg border border-purple-500/30 hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-blue-500/30 hover:border-purple-500/50 transition-all text-sm font-medium shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                  Generate Predictions
                </span>
              </button>
            )}
          </div>
        ) : (
          /* LOADED STATE - Show predictions */
          <>
            {/* Loading overlay when refreshing */}
            {isLoading && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative w-12 h-12 mx-auto mb-3">
                    <RefreshCw className="w-12 h-12 text-purple-400 animate-spin" />
                    <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-ping"></div>
                  </div>
                  <p className="text-white font-semibold mb-1">Refreshing Predictions</p>
                  <p className="text-slate-400 text-sm">Analyzing latest sensor data...</p>
                </div>
              </div>
            )}

            {/* Info Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Device</div>
                <div className="text-sm font-medium text-white">{deviceId}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Forecast</div>
                <div className="text-sm font-medium text-white">{predictions.length} periods</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Avg Confidence</div>
                <div className={cn(
                  "text-sm font-medium",
                  getAverageConfidence() > 0.8 ? "text-green-400" :
                  getAverageConfidence() > 0.6 ? "text-yellow-400" :
                  "text-red-400"
                )}>
                  {(getAverageConfidence() * 100).toFixed(0)}%
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                  <Clock className="w-3 h-3" />
                  <span>Speed</span>
                </div>
                <div className="text-sm font-medium text-white">{executionTime || 0}ms</div>
              </div>
            </div>

            {/* Low Confidence Warning */}
            {getLowConfidencePredictions(0.7).length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-yellow-200">
                    {getLowConfidencePredictions(0.7).length} prediction{getLowConfidencePredictions(0.7).length > 1 ? 's' : ''} with
                    low confidence (&lt;70%). Long-term forecasts may be less accurate.
                  </div>
                </div>
              </div>
            )}

            {/* Metric Selector */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {metrics.map((metric) => {
                const trend = getTrend(metric.key);
                const TrendIcon = getTrendIcon(trend.direction);

                return (
                  <button
                    key={metric.key}
                    onClick={() => setSelectedMetric(metric.key)}
                    className={cn(
                      "flex-1 min-w-[100px] px-3 py-2 rounded-lg border transition-colors text-sm",
                      selectedMetric === metric.key
                        ? "bg-purple-500/20 border-purple-500/50 text-white"
                        : "bg-white/5 border-white/20 text-slate-300 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{metric.label}</span>
                      <TrendIcon className={cn("w-3 h-3", getTrendColor(trend.direction))} />
                    </div>
                    <div className="text-xs text-slate-400">
                      {trend.direction === 'stable' ? 'Stable' : `${trend.percentChange.toFixed(1)}%`}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Chart */}
            <PredictionChart
              predictions={predictions}
              metric={selectedMetric}
              height={300}
              showConfidenceZone={true}
            />

            {/* Footer Info */}
            {historicalDataUsed && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-slate-400 text-center">
                  Based on {historicalDataUsed} historical readings • Updated just now
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
