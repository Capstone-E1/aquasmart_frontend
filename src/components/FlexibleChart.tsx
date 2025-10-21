import { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useSettings } from '../contexts/SettingsContext';

interface DataPoint {
  timestamp?: string;
  value: number;
  time?: string;
  [key: string]: any;
}

interface FlexibleChartProps {
  data: DataPoint[];
  dataKey?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  xAxisKey?: string;
}

export function FlexibleChart({
  data,
  dataKey = 'value',
  color = '#3b82f6',
  height = 200,
  showGrid = true,
  xAxisKey = 'time',
}: FlexibleChartProps) {
  const { settings } = useSettings();
  const chartStyle = settings.appearance.chartStyle;

  // Format data for charts
  const formattedData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      [xAxisKey]: item[xAxisKey] || item.timestamp || `Point ${index + 1}`,
    }));
  }, [data, xAxisKey]);

  const commonProps = {
    data: formattedData,
    margin: { top: 5, right: 5, left: -20, bottom: 5 },
  };

  const axisProps = {
    stroke: '#94a3b8',
    style: { fontSize: '12px' },
  };

  const tooltipStyle = {
    backgroundColor: '#1e293b',
    border: '1px solid #475569',
    borderRadius: '8px',
    color: '#fff',
  };

  // Render based on chart style
  if (chartStyle === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart {...commonProps}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#334155" />}
          <XAxis dataKey={xAxisKey} {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (chartStyle === 'area') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart {...commonProps}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#334155" />}
          <XAxis dataKey={xAxisKey} {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={color}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // Default: line chart
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart {...commonProps}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#334155" />}
        <XAxis dataKey={xAxisKey} {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
