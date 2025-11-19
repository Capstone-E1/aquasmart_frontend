import { Activity, TrendingDown, TrendingUp, Calendar, Brain, AlertTriangle, CheckCircle, Droplets } from 'lucide-react';
import { cn } from '../lib/utils';
import type { FilterHealth } from '../services/api';

interface FilterPredictionCardProps {
  filterHealth: FilterHealth | null;
  isLoading: boolean;
  error: string | null;
  onAnalyze?: () => void;
  onRefresh?: () => void;
}

export function FilterPredictionCard({
  filterHealth,
  isLoading,
  error,
  onAnalyze,
  onRefresh
}: FilterPredictionCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-500/20 p-2 rounded-lg border border-blue-500/30">
            <Brain className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <h3 className="text-white font-semibold text-lg">AI Filter Health Prediction</h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-white/10 rounded animate-pulse" />
          <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-white/10 rounded animate-pulse w-1/2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-500/20 p-2 rounded-lg border border-red-500/30">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-white font-semibold text-lg">AI Filter Health Prediction</h3>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
          {onRefresh && (
            <button
              onClick={() => onRefresh()}
              className="mt-3 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors text-sm"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!filterHealth) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-500/20 p-2 rounded-lg border border-blue-500/30">
            <Brain className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-white font-semibold text-lg">AI Filter Health Prediction</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm mb-4">
            No filter health data available yet. Analysis requires pre and post filtration readings.
          </p>
          {onAnalyze && (
            <button
              onClick={() => onAnalyze()}
              className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors text-sm"
            >
              Analyze Filter Health
            </button>
          )}
        </div>
      </div>
    );
  }

  // Determine status color based on health score
  const getStatusColor = () => {
    if (filterHealth.health_score >= 90) return 'green';
    if (filterHealth.health_score >= 75) return 'blue';
    if (filterHealth.health_score >= 50) return 'yellow';
    if (filterHealth.health_score >= 25) return 'orange';
    return 'red';
  };

  const getHealthCategory = () => {
    if (filterHealth.health_score >= 90) return 'Excellent';
    if (filterHealth.health_score >= 75) return 'Good';
    if (filterHealth.health_score >= 50) return 'Fair';
    if (filterHealth.health_score >= 25) return 'Poor';
    return 'Critical';
  };

  const statusColor = getStatusColor();
  const healthCategory = getHealthCategory();

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg border",
            statusColor === 'green' && "bg-green-500/20 border-green-500/30",
            statusColor === 'blue' && "bg-blue-500/20 border-blue-500/30",
            statusColor === 'yellow' && "bg-yellow-500/20 border-yellow-500/30",
            statusColor === 'orange' && "bg-orange-500/20 border-orange-500/30",
            statusColor === 'red' && "bg-red-500/20 border-red-500/30"
          )}>
            <Brain className={cn(
              "w-5 h-5",
              statusColor === 'green' && "text-green-400",
              statusColor === 'blue' && "text-blue-400",
              statusColor === 'yellow' && "text-yellow-400",
              statusColor === 'orange' && "text-orange-400",
              statusColor === 'red' && "text-red-400"
            )} />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">AI Filter Health Prediction</h3>
            <p className="text-slate-400 text-xs">Advanced ML-based Analysis</p>
          </div>
        </div>
        <div className="flex gap-2">
          {onRefresh && (
            <button
              onClick={() => onRefresh()}
              className="p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
              title="Refresh prediction"
            >
              <Activity className="w-4 h-4 text-white" />
            </button>
          )}
          {onAnalyze && (
            <button
              onClick={() => onAnalyze()}
              className="px-3 py-2 text-xs rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-colors"
              title="Trigger new analysis"
            >
              Analyze
            </button>
          )}
        </div>
      </div>

      {/* Main Health Score */}
      <div className={cn(
        "rounded-lg p-6 mb-6 border",
        statusColor === 'green' && "bg-green-500/10 border-green-500/30",
        statusColor === 'blue' && "bg-blue-500/10 border-blue-500/30",
        statusColor === 'yellow' && "bg-yellow-500/10 border-yellow-500/30",
        statusColor === 'orange' && "bg-orange-500/10 border-orange-500/30",
        statusColor === 'red' && "bg-red-500/10 border-red-500/30"
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className={cn(
              "w-5 h-5",
              statusColor === 'green' && "text-green-400",
              statusColor === 'blue' && "text-blue-400",
              statusColor === 'yellow' && "text-yellow-400",
              statusColor === 'orange' && "text-orange-400",
              statusColor === 'red' && "text-red-400"
            )} />
            <span className="text-slate-300 text-sm font-medium">Overall Health Score</span>
          </div>
          <span className={cn(
            "px-2 py-1 rounded text-xs font-medium",
            statusColor === 'green' && "bg-green-500/20 text-green-400 border border-green-500/30",
            statusColor === 'blue' && "bg-blue-500/20 text-blue-400 border border-blue-500/30",
            statusColor === 'yellow' && "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
            statusColor === 'orange' && "bg-orange-500/20 text-orange-400 border border-orange-500/30",
            statusColor === 'red' && "bg-red-500/20 text-red-400 border border-red-500/30"
          )}>
            {healthCategory}
          </span>
        </div>
        <p className={cn(
          "text-5xl font-bold mb-2",
          statusColor === 'green' && "text-green-400",
          statusColor === 'blue' && "text-blue-400",
          statusColor === 'yellow' && "text-yellow-400",
          statusColor === 'orange' && "text-orange-400",
          statusColor === 'red' && "text-red-400"
        )}>
          {Math.round(filterHealth.health_score)}
          <span className="text-2xl">/100</span>
        </p>
      </div>

      {/* Predicted Days Remaining */}
      <div className={cn(
        "rounded-lg p-4 mb-4 border",
        filterHealth.predicted_days_remaining <= 7 && "bg-red-500/10 border-red-500/30",
        filterHealth.predicted_days_remaining > 7 && filterHealth.predicted_days_remaining <= 30 && "bg-orange-500/10 border-orange-500/30",
        filterHealth.predicted_days_remaining > 30 && "bg-blue-500/10 border-blue-500/30"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className={cn(
              "w-4 h-4",
              filterHealth.predicted_days_remaining <= 7 && "text-red-400",
              filterHealth.predicted_days_remaining > 7 && filterHealth.predicted_days_remaining <= 30 && "text-orange-400",
              filterHealth.predicted_days_remaining > 30 && "text-blue-400"
            )} />
            <span className="text-slate-300 text-sm">Days Until Replacement</span>
          </div>
          <div className="flex items-center gap-2">
            {filterHealth.predicted_days_remaining <= 30 ? (
              <TrendingDown className="w-4 h-4 text-orange-400" />
            ) : (
              <TrendingUp className="w-4 h-4 text-blue-400" />
            )}
            <span className={cn(
              "text-2xl font-bold",
              filterHealth.predicted_days_remaining <= 7 && "text-red-400",
              filterHealth.predicted_days_remaining > 7 && filterHealth.predicted_days_remaining <= 30 && "text-orange-400",
              filterHealth.predicted_days_remaining > 30 && "text-blue-400"
            )}>
              {filterHealth.predicted_days_remaining}
            </span>
            <span className="text-slate-400 text-sm">days</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-2 mb-4">
        <h4 className="text-white text-sm font-medium mb-3">Performance Metrics</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-slate-400 text-xs mb-1">Current Efficiency</div>
            <div className="text-white font-semibold">{filterHealth.current_efficiency?.toFixed(1)}%</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-slate-400 text-xs mb-1">Average Efficiency</div>
            <div className="text-white font-semibold">{filterHealth.average_efficiency?.toFixed(1)}%</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-slate-400 text-xs mb-1">Turbidity Reduction</div>
            <div className="text-white font-semibold">{filterHealth.turbidity_reduction?.toFixed(1)}%</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-slate-400 text-xs mb-1">TDS Reduction</div>
            <div className="text-white font-semibold">{filterHealth.tds_reduction?.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Efficiency Trend */}
      {filterHealth.efficiency_trend && (
        <div className="mb-4">
          <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
            <span className="text-slate-400 text-xs">Efficiency Trend</span>
            <span className={cn(
              "px-2 py-1 rounded text-xs font-medium capitalize",
              filterHealth.efficiency_trend === 'improving' && "bg-green-500/20 text-green-400 border border-green-500/30",
              filterHealth.efficiency_trend === 'stable' && "bg-blue-500/20 text-blue-400 border border-blue-500/30",
              filterHealth.efficiency_trend === 'degrading' && "bg-orange-500/20 text-orange-400 border border-orange-500/30"
            )}>
              {filterHealth.efficiency_trend}
            </span>
          </div>
        </div>
      )}

      {/* Additional Info */}
      {(filterHealth.total_flow_processed !== undefined || filterHealth.filter_age_days !== undefined) && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {filterHealth.total_flow_processed !== undefined && (
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="w-3 h-3 text-slate-400" />
                <div className="text-slate-400 text-xs">Flow Processed</div>
              </div>
              <div className="text-white font-semibold text-sm">
                {(filterHealth.total_flow_processed / 1000).toFixed(1)}k L
              </div>
            </div>
          )}
          {filterHealth.filter_age_days !== undefined && (
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-1">Filter Age</div>
              <div className="text-white font-semibold text-sm">{filterHealth.filter_age_days} days</div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {filterHealth.recommendations && filterHealth.recommendations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-white text-sm font-medium">Recommendations</h4>
          <div className="space-y-1">
            {filterHealth.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={cn(
                  "text-xs p-2 rounded",
                  rec.includes('URGENT') || rec.includes('immediately') ? "bg-red-500/10 text-red-300" : "bg-white/5 text-slate-300"
                )}
              >
                {rec}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle className="w-3 h-3" />
            <span>AI-Powered Prediction</span>
          </div>
          <span className="text-slate-500">
            {new Date(filterHealth.last_calculated).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
