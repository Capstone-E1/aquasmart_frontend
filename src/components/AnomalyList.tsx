import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Anomaly } from '../services/api';

interface AnomalyListProps {
  anomalies: Anomaly[];
  isLoading?: boolean;
  onResolve?: (anomalyId: number) => Promise<void>;
  onMarkFalsePositive?: (anomalyId: number) => Promise<void>;
}

const severityColors = {
  low: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    dot: 'bg-blue-500'
  },
  medium: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    dot: 'bg-yellow-500'
  },
  high: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    dot: 'bg-orange-500'
  },
  critical: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/30',
    dot: 'bg-red-500'
  }
};

export function AnomalyList({ anomalies, isLoading, onResolve, onMarkFalsePositive }: AnomalyListProps) {
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleResolve = async (anomalyId: number) => {
    if (!onResolve) return;
    setProcessingId(anomalyId);
    try {
      await onResolve(anomalyId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkFalsePositive = async (anomalyId: number) => {
    if (!onMarkFalsePositive) return;
    setProcessingId(anomalyId);
    try {
      await onMarkFalsePositive(anomalyId);
    } finally {
      setProcessingId(null);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-white/20 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-white/20 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (anomalies.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-8">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h3 className="text-white font-semibold text-lg mb-2">No Anomalies Detected</h3>
          <p className="text-slate-400 text-sm">All water parameters are within normal ranges</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold text-lg">Detected Anomalies</h3>
        </div>
        <div className="text-sm text-slate-400">
          {anomalies.length} {anomalies.length === 1 ? 'anomaly' : 'anomalies'}
        </div>
      </div>

      {/* Anomaly List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {anomalies.map((anomaly) => {
          const severity = severityColors[anomaly.severity];
          const isProcessing = processingId === anomaly.id;

          return (
            <div
              key={anomaly.id}
              className={cn(
                "bg-white/5 rounded-lg p-4 border transition-all",
                anomaly.is_resolved ? "border-green-500/30 opacity-60" :
                anomaly.is_false_positive ? "border-slate-500/30 opacity-60" :
                severity.border
              )}
            >
              {/* Anomaly Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1">
                  <div className={cn("w-2 h-2 rounded-full mt-1.5", severity.dot)} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-sm font-semibold", severity.text)}>
                        {anomaly.anomaly_type.split('_').map(word =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium",
                        severity.bg,
                        severity.text
                      )}>
                        {anomaly.severity}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">{anomaly.description}</p>

                    {/* Details */}
                    <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-slate-300">Device:</span>
                        {anomaly.device_id}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-slate-300">Parameter:</span>
                        {anomaly.parameter_type.toUpperCase()}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-slate-300">Value:</span>
                        {anomaly.value.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(anomaly.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status or Actions */}
              {anomaly.is_resolved ? (
                <div className="flex items-center gap-1 text-green-400 text-xs mt-2 pl-5">
                  <CheckCircle className="w-3 h-3" />
                  <span>Resolved {anomaly.resolved_at && `on ${new Date(anomaly.resolved_at).toLocaleDateString()}`}</span>
                </div>
              ) : anomaly.is_false_positive ? (
                <div className="flex items-center gap-1 text-slate-400 text-xs mt-2 pl-5">
                  <XCircle className="w-3 h-3" />
                  <span>Marked as False Positive</span>
                </div>
              ) : (
                <div className="flex gap-2 mt-3 pl-5">
                  <button
                    onClick={() => handleResolve(anomaly.id)}
                    disabled={isProcessing}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                      "bg-green-500/20 text-green-400 border border-green-500/30",
                      "hover:bg-green-500/30 hover:border-green-500/50",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {isProcessing ? 'Processing...' : 'Resolve'}
                  </button>
                  <button
                    onClick={() => handleMarkFalsePositive(anomaly.id)}
                    disabled={isProcessing}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                      "bg-slate-500/20 text-slate-400 border border-slate-500/30",
                      "hover:bg-slate-500/30 hover:border-slate-500/50",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {isProcessing ? 'Processing...' : 'False Positive'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
