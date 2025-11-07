import { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { SensorPrediction } from '../services/api';

interface PredictionChartProps {
  predictions: SensorPrediction[];
  metric: 'flow' | 'ph' | 'turbidity' | 'tds';
  height?: number;
  showConfidenceZone?: boolean;
}

const metricConfig = {
  flow: {
    label: 'Flow Rate',
    unit: 'L/min',
    color: '#3b82f6',
    confidenceColor: '#3b82f6'
  },
  ph: {
    label: 'pH Level',
    unit: 'pH',
    color: '#8b5cf6',
    confidenceColor: '#8b5cf6'
  },
  turbidity: {
    label: 'Turbidity',
    unit: 'NTU',
    color: '#06b6d4',
    confidenceColor: '#06b6d4'
  },
  tds: {
    label: 'TDS',
    unit: 'ppm',
    color: '#10b981',
    confidenceColor: '#10b981'
  }
};

export function PredictionChart({
  predictions,
  metric,
  height = 300,
  showConfidenceZone = true
}: PredictionChartProps) {
  const config = metricConfig[metric];

  const chartData = useMemo(() => {
    const metricKeyMap = {
      flow: 'PredictedFlow',
      ph: 'PredictedPh',
      turbidity: 'PredictedTurbidity',
      tds: 'PredictedTDS'
    };

    const metricKey = metricKeyMap[metric] as keyof SensorPrediction;

    return predictions.map((pred, index) => {
      const rawValue = pred[metricKey];

      // Safely get the value with fallback
      const value = typeof rawValue === 'number' ? rawValue : 0;
      const confidence = pred.ConfidenceScore || 0;

      // Calculate confidence interval (wider = less confident)
      const margin = value * (1 - confidence) * 0.5;

      return {
        index: index + 1,
        time: new Date(pred.Timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        value: parseFloat(value.toFixed(2)),
        confidence: (confidence * 100).toFixed(1),
        upperBound: parseFloat((value + margin).toFixed(2)),
        lowerBound: parseFloat((value - margin).toFixed(2))
      };
    });
  }, [predictions, metric]);

  if (predictions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        No prediction data available
      </div>
    );
  }

  const axisProps = {
    stroke: '#94a3b8',
    style: { fontSize: '12px' }
  };

  const tooltipStyle = {
    backgroundColor: '#1e293b',
    border: '1px solid #475569',
    borderRadius: '8px',
    color: '#fff'
  };

  return (
    <div>
      <div className="mb-4">
        <h4 className="text-white font-medium text-sm mb-1">{config.label} Forecast</h4>
        <p className="text-slate-400 text-xs">
          Next {predictions.length} predictions • Values in {config.unit}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        {showConfidenceZone ? (
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={config.color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="time"
              {...axisProps}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis {...axisProps} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: any, name: string) => {
                if (name === 'value') return [`${value} ${config.unit}`, 'Predicted'];
                if (name === 'confidence') return [`${value}%`, 'Confidence'];
                if (name === 'upperBound') return [`${value} ${config.unit}`, 'Upper Bound'];
                if (name === 'lowerBound') return [`${value} ${config.unit}`, 'Lower Bound'];
                return [value, name];
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
              iconType="line"
            />

            {/* Confidence zone */}
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="none"
              fill={`url(#gradient-${metric})`}
              fillOpacity={0.3}
              name="Upper Bound"
            />
            <Area
              type="monotone"
              dataKey="lowerBound"
              stroke="none"
              fill={`url(#gradient-${metric})`}
              fillOpacity={0.3}
              name="Lower Bound"
            />

            {/* Main prediction line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke={config.color}
              strokeWidth={2}
              dot={{ fill: config.color, r: 3 }}
              activeDot={{ r: 5 }}
              name="Predicted Value"
            />
          </AreaChart>
        ) : (
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="time"
              {...axisProps}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis {...axisProps} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: any, name: string) => {
                if (name === 'value') return [`${value} ${config.unit}`, 'Predicted'];
                if (name === 'confidence') return [`${value}%`, 'Confidence'];
                return [value, name];
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={config.color}
              strokeWidth={2}
              dot={{ fill: config.color, r: 3 }}
              activeDot={{ r: 5 }}
              name="Predicted Value"
            />
          </LineChart>
        )}
      </ResponsiveContainer>

      {/* Confidence indicator */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }}></div>
          <span className="text-slate-400">Predicted values</span>
        </div>
        {showConfidenceZone && (
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: config.color, opacity: 0.3 }}
            ></div>
            <span className="text-slate-400">Confidence zone</span>
          </div>
        )}
      </div>
    </div>
  );
}
