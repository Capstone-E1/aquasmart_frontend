import { Download } from 'lucide-react';

interface GaugeChartProps {
  title: string;
  value: number;
  maxValue: number;
  unit?: string;
  color: 'purple' | 'red' | 'green' | 'blue';
  status: string;
  showExport?: boolean;
}

const colorClasses = {
  purple: {
    stroke: 'stroke-purple-500',
    bg: 'stroke-purple-500/20'
  },
  red: {
    stroke: 'stroke-red-500',
    bg: 'stroke-red-500/20'
  },
  green: {
    stroke: 'stroke-green-500',
    bg: 'stroke-green-500/20'
  },
  blue: {
    stroke: 'stroke-blue-500',
    bg: 'stroke-blue-500/20'
  }
};

export function GaugeChart({ 
  title, 
  value, 
  maxValue, 
  unit, 
  color, 
  status, 
  showExport = true 
}: GaugeChartProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const circumference = 2 * Math.PI * 90; // radius = 90
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const colorClass = colorClasses[color];

  return (
    <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-medium text-lg">{title}</h3>
        {showExport && (
          <button className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
            Export
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Gauge Chart */}
      <div className="relative flex items-center justify-center">
        <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
          {/* Background Circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            className={colorClass.bg}
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Progress Circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            className={colorClass.stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {value}{unit}
            </div>
            <div className="text-slate-400 text-sm">
              {status}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
