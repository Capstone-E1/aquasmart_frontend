import { Brain, AlertCircle, TrendingUp, RefreshCw } from 'lucide-react';
import { FilterHealthCard } from '../components/FilterHealthCard';
import { FilterPredictionCard } from '../components/FilterPredictionCard';
import { AnomalyList } from '../components/AnomalyList';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useMLPredictions } from '../hooks/useMLPredictions';
import { useFilterPrediction } from '../hooks/useFilterPrediction';
import { cn } from '../lib/utils';
import { useEffect } from 'react';

export function MLDashboard() {
  const {
    filterHealth,
    unresolvedAnomalies,
    anomalyStats,
    isLoading,
    error,
    refetch,
    resolveAnomaly,
    markAnomalyFalsePositive
  } = useMLPredictions(30000); // Refresh every 30 seconds

  // Filter prediction hook
  const {
    filterHealth: aiFilterHealth,
    isLoading: predictionLoading,
    error: predictionError,
    fetchFilterHealth,
    analyzeFilterHealth
  } = useFilterPrediction();

  // Fetch filter prediction on mount
  useEffect(() => {
    fetchFilterHealth();
  }, [fetchFilterHealth]);

  if (isLoading && !filterHealth) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error && !filterHealth) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-white font-semibold text-lg mb-2">Error Loading ML Dashboard</h3>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500/20 p-3 rounded-lg border border-purple-500/30">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">AI Predictions</h1>
            <p className="text-slate-400 text-sm">Smart insights and anomaly detection</p>
          </div>
        </div>
        <button
          onClick={refetch}
          disabled={isLoading}
          className={cn(
            "p-2 rounded-lg border transition-colors",
            "bg-white/10 border-white/20 text-white",
            "hover:bg-white/20 hover:border-white/30",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          title="Refresh data"
        >
          <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
        </button>
      </div>

      {/* Stats Overview */}
      {anomalyStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Total Anomalies</span>
              <AlertCircle className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-white">{anomalyStats.total_anomalies}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Last 24 Hours</span>
              <AlertCircle className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-orange-400">{anomalyStats.last_24_hours}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Critical</span>
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">{anomalyStats.by_severity['critical'] || 0}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">High Priority</span>
              <TrendingUp className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-400">{anomalyStats.by_severity['high'] || 0}</p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filter Health - Takes 1 column */}
        <div className="lg:col-span-1">
          <FilterHealthCard filterHealth={filterHealth} isLoading={isLoading} />
        </div>

        {/* Anomalies List - Takes 2 columns */}
        <div className="lg:col-span-2">
          <AnomalyList
            anomalies={unresolvedAnomalies}
            isLoading={isLoading}
            onResolve={resolveAnomaly}
            onMarkFalsePositive={markAnomalyFalsePositive}
          />
        </div>
      </div>

      {/* Severity Breakdown */}
      {anomalyStats && Object.keys(anomalyStats.by_severity).length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Anomaly Severity Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
              <div className="text-blue-400 text-sm font-medium mb-1">Low</div>
              <div className="text-2xl font-bold text-white">{anomalyStats.by_severity['low'] || 0}</div>
            </div>
            <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
              <div className="text-yellow-400 text-sm font-medium mb-1">Medium</div>
              <div className="text-2xl font-bold text-white">{anomalyStats.by_severity['medium'] || 0}</div>
            </div>
            <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/30">
              <div className="text-orange-400 text-sm font-medium mb-1">High</div>
              <div className="text-2xl font-bold text-white">{anomalyStats.by_severity['high'] || 0}</div>
            </div>
            <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
              <div className="text-red-400 text-sm font-medium mb-1">Critical</div>
              <div className="text-2xl font-bold text-white">{anomalyStats.by_severity['critical'] || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* AI Filter Health Prediction */}
      <FilterPredictionCard
        filterHealth={aiFilterHealth}
        isLoading={predictionLoading}
        error={predictionError}
        onAnalyze={analyzeFilterHealth}
        onRefresh={fetchFilterHealth}
      />

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-lg rounded-xl border border-purple-500/30 shadow-lg p-6">
        <div className="flex items-start gap-4">
          <Brain className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white font-semibold mb-2">About AI Predictions</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Our AI system continuously monitors water quality parameters using advanced anomaly detection
              algorithms. It analyzes pH levels, turbidity, and TDS values to identify unusual patterns,
              spikes, and potential sensor failures. The intelligent filter health predictor uses machine learning
              to estimate remaining filter lifespan based on pre and post filtration readings, efficiency degradation,
              flow rate, and usage patterns, helping you maintain optimal water filtration performance and plan
              timely maintenance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
