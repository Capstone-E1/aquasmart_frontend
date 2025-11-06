import { MoreHorizontal, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status: 'normal' | 'warning' | 'danger';
  color: 'purple' | 'red' | 'green' | 'blue';
  isBest?: boolean;
}

const colorClasses = {
  purple: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    dot: 'bg-purple-500'
  },
  red: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/30',
    dot: 'bg-red-500'
  },
  green: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500/30',
    dot: 'bg-green-500'
  },
  blue: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    dot: 'bg-blue-500'
  }
};

export function MetricCard({ title, value, unit, status, color, isBest }: MetricCardProps) {
  const colorClass = colorClasses[color];
  
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 hover:border-white/30 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", colorClass.dot)} />
          <span className={cn("text-sm font-medium", colorClass.text)}>
            {isBest && "Best "}{title}
          </span>
        </div>
        <button className="p-1 text-slate-400 hover:text-white transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        {unit && <span className="text-slate-400 text-sm">{unit}</span>}
      </div>

      {/* Status Badge */}
      <div className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
        colorClass.bg,
        colorClass.text,
        colorClass.border
      )}>
        <TrendingUp className="w-3 h-3" />
        {status === 'normal' && 'Normal'}
        {status === 'warning' && 'Warning'}
        {status === 'danger' && 'High Risk'}
      </div>
    </div>
  );
}
