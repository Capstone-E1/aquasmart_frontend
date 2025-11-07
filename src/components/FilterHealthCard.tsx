import { AlertTriangle, CheckCircle, Droplet, Calendar, TrendingDown } from 'lucide-react';
import { cn } from '../lib/utils';
import type { FilterHealth } from '../services/api';

interface FilterHealthCardProps {
  filterHealth: FilterHealth | null;
  isLoading?: boolean;
}

const healthCategoryColors = {
  excellent: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500/30',
    stroke: 'stroke-green-500',
    strokeBg: 'stroke-green-500/20',
    icon: CheckCircle
  },
  good: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    stroke: 'stroke-blue-500',
    strokeBg: 'stroke-blue-500/20',
    icon: CheckCircle
  },
  fair: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    stroke: 'stroke-yellow-500',
    strokeBg: 'stroke-yellow-500/20',
    icon: AlertTriangle
  },
  poor: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    stroke: 'stroke-orange-500',
    strokeBg: 'stroke-orange-500/20',
    icon: AlertTriangle
  },
  critical: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/30',
    stroke: 'stroke-red-500',
    strokeBg: 'stroke-red-500/20',
    icon: AlertTriangle
  }
};

export function FilterHealthCard({ filterHealth, isLoading }: FilterHealthCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-white/20 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-white/20 rounded mb-4"></div>
        <div className="h-4 bg-white/20 rounded w-2/3"></div>
      </div>
    );
  }

  if (!filterHealth) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6">
        <p className="text-slate-400 text-center">No filter health data available</p>
      </div>
    );
  }

  // Determine health category based on health_score
  const getHealthCategory = (score: number): keyof typeof healthCategoryColors => {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 50) return 'fair';
    if (score >= 25) return 'poor';
    return 'critical';
  };

  const healthCategory = getHealthCategory(filterHealth.health_score);
  const category = healthCategoryColors[healthCategory];
  const Icon = category.icon;
  const percentage = filterHealth.health_score;
  const circumference = 2 * Math.PI * 70;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 hover:border-white/30 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Droplet className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-semibold text-lg">Filter Health</h3>
        </div>
        {filterHealth.replacement_urgent && (
          <div className="flex items-center gap-1 text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Replace Soon</span>
          </div>
        )}
      </div>

      {/* Gauge Chart */}
      <div className="relative flex items-center justify-center mb-6">
        <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
          {/* Background Circle */}
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            className={category.strokeBg}
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Progress Circle */}
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            className={category.stroke}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
            }}
          />
        </svg>

        {/* Value in Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-white leading-none">
              {filterHealth.health_score.toFixed(0)}
            </div>
            <div className="text-sm text-slate-300 mt-1">Score</div>
          </div>
        </div>
      </div>

      {/* Health Category Badge */}
      <div className="flex justify-center mb-6">
        <div className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border",
          category.bg,
          category.text,
          category.border
        )}>
          <Icon className="w-4 h-4" />
          {healthCategory.charAt(0).toUpperCase() + healthCategory.slice(1)} Health
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">Current Efficiency</span>
          </div>
          <p className="text-lg font-semibold text-white">
            {filterHealth.current_efficiency.toFixed(1)}%
          </p>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">Days Until Replace</span>
          </div>
          <p className={cn(
            "text-lg font-semibold",
            filterHealth.predicted_days_remaining <= 7 ? "text-red-400" :
            filterHealth.predicted_days_remaining <= 30 ? "text-yellow-400" :
            "text-green-400"
          )}>
            {filterHealth.predicted_days_remaining > 365 ? '365+' : filterHealth.predicted_days_remaining}
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Turbidity Reduction:</span>
          <span className="text-white font-medium">{filterHealth.turbidity_reduction.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">TDS Reduction:</span>
          <span className="text-white font-medium">{filterHealth.tds_reduction.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">pH Stabilization:</span>
          <span className="text-white font-medium">{filterHealth.ph_stabilization.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Efficiency Trend:</span>
          <span className={cn(
            "font-medium",
            filterHealth.efficiency_trend === 'degrading' ? "text-red-400" :
            filterHealth.efficiency_trend === 'stable' ? "text-yellow-400" :
            "text-green-400"
          )}>
            {filterHealth.efficiency_trend.charAt(0).toUpperCase() + filterHealth.efficiency_trend.slice(1)}
          </span>
        </div>
        {(filterHealth.total_flow_processed !== undefined || filterHealth.filter_age_days !== undefined) && (
          <>
            <div className="border-t border-white/10 pt-2 mt-2" />
            {filterHealth.total_flow_processed !== undefined && (
              <div className="flex justify-between">
                <span className="text-slate-400">Water Processed:</span>
                <span className="text-white font-medium">
                  {filterHealth.total_flow_processed.toLocaleString(undefined, { maximumFractionDigits: 0 })} L
                </span>
              </div>
            )}
            {filterHealth.filter_age_days !== undefined && (
              <div className="flex justify-between">
                <span className="text-slate-400">Filter Age:</span>
                <span className="text-white font-medium">{filterHealth.filter_age_days} days</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
