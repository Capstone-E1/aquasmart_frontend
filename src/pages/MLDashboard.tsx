import { Brain, RefreshCw } from 'lucide-react';
import { FilterHealthCard } from '../components/FilterHealthCard';
import { FilterPredictionCard } from '../components/FilterPredictionCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useMLPredictions } from '../hooks/useMLPredictions';
import { useFilterPrediction } from '../hooks/useFilterPrediction';
import { cn } from '../lib/utils';
import { useEffect } from 'react';

export function MLDashboard() {
  const {
    filterHealth,
    isLoading,
    error,
    refetch
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
          <Brain className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-white font-semibold text-lg mb-2">Error Loading AI Predictions</h3>
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
            <p className="text-slate-400 text-sm">Smart filter health predictions</p>
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

      {/* Filter Health Card */}
      <FilterHealthCard filterHealth={filterHealth} isLoading={isLoading} />

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
              Our AI system uses machine learning to predict filter health and estimate remaining filter lifespan.
              It analyzes pre and post filtration readings including pH levels, turbidity, TDS values,
              efficiency degradation, flow rate, and usage patterns to provide accurate predictions.
              This helps you maintain optimal water filtration performance and plan timely filter replacement,
              ensuring your water quality remains consistently high.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
