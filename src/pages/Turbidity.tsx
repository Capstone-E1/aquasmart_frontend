import { useState, useEffect } from 'react';
import { GaugeChart } from '../components/GaugeChart';
import { MetricCard } from '../components/MetricCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export function Turbidity() {
  const [isLoading, setIsLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    const metricsTimer = setTimeout(() => {
      setMetricsLoading(false);
    }, 1200);

    return () => {
      clearTimeout(timer);
      clearTimeout(metricsTimer);
    };
  }, []);

  if (isLoading) {
    return <LoadingSkeleton variant="page" />;
  }
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Turbidity Monitoring</h1>
        <p className="text-slate-400">Track water clarity and turbidity levels</p>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metricsLoading ? (
          <>
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="card" />
          </>
        ) : (
          <>
            <MetricCard
              title="Current Turbidity"
              value="0.78"
              unit="NTU"
              color="red"
              status="normal"
            />
            <MetricCard
              title="Average Today"
              value="0.82"
              unit="NTU"
              color="red"
              status="normal"
            />
            <MetricCard
              title="Peak Reading"
              value="1.2"
              unit="NTU"
              color="red"
              status="warning"
            />
          </>
        )}
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GaugeChart
          title="Turbidity Level"
          value={0.78}
          maxValue={5}
          color="red"
          status="Turbidity level is acceptable."
        />
        
        <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6">
          <h3 className="text-white font-medium text-lg mb-4">Turbidity Standards</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-300">0 - 1 NTU: Excellent</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-slate-300">1 - 4 NTU: Good</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-slate-300">&gt; 4 NTU: Poor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
