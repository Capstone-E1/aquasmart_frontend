interface GaugeChartProps {
  title: string;
  value: number;
  maxValue: number;
  unit?: string;
  color: 'purple' | 'red' | 'green' | 'blue';
  status: string;
  statusColor?: string;
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
  statusColor = 'text-slate-400'
}: GaugeChartProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const circumference = 2 * Math.PI * 90;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const colorClass = colorClasses[color];

  return (
    <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-4 lg:p-6 flex flex-col">
      <div className="mb-4">
        <h3 className="text-white font-medium text-base lg:text-lg">{title}</h3>
      </div>

      {/* Gauge Chart Container */}
      <div className="relative flex items-center justify-center mb-4">
        <svg className="w-40 h-40 lg:w-48 lg:h-48 transform -rotate-90" viewBox="0 0 200 200">
          {/* Background Circle */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            className={colorClass.bg}
            strokeWidth="16"
            strokeLinecap="round"
          />
          
          {/* Progress Circle */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            className={colorClass.stroke}
            strokeWidth="16"
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
            <div className="text-3xl lg:text-2xl font-bold text-white leading-none">
              {value.toFixed(2)}
            </div>
            {unit && (
              <div className="text-sm text-slate-300 mt-1">
                {unit}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status at Bottom */}
      <div className="mt-auto pt-3 border-t border-slate-600/50">
        <p className={`text-xs lg:text-sm text-center ${statusColor}`}>
          {status}
        </p>
      </div>
    </div>
  );
}
