import { useState, useEffect } from 'react';
import { MetricCard } from '../components/MetricCard';
import { GaugeChart } from '../components/GaugeChart';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Simulate metrics data loading
    const metricsTimer = setTimeout(() => {
      setMetricsLoading(false);
    }, 1500);

    // Simulate charts data loading
    const chartsTimer = setTimeout(() => {
      setChartsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(metricsTimer);
      clearTimeout(chartsTimer);
    };
  }, []);

  if (isLoading) {
    return <LoadingSkeleton variant="page" />;
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400 text-sm lg:text-base">Monitor your filtration water quality</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {metricsLoading ? (
          <>
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="card" />
          </>
        ) : (
          <>
            <MetricCard
              title="PH Level"
              value="7.1"
              color="purple"
              status="normal"
              isBest={true}
            />
            <MetricCard
              title="Turbidity Level"
              value="0.78"
              color="red"
              status="normal"
              isBest={true}
            />
            <MetricCard
              title="TDS Value"
              value="434"
              color="green"
              status="normal"
              isBest={true}
            />
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {chartsLoading ? (
          <>
            <LoadingSkeleton variant="chart" />
            <LoadingSkeleton variant="chart" />
            <LoadingSkeleton variant="chart" />
          </>
        ) : (
          <>
            {/* PH Level Chart */}
            <GaugeChart
              title="PH Level"
              value={12.12}
              maxValue={14}
              color="purple"
              status="The pH level is too high."
            />

            {/* Turbidity Chart */}
            <GaugeChart
              title="Turbidity Level"
              value={5.6}
              maxValue={10}
              color="red"
              status="The turbidity level is too high."
            />

            {/* TDS Chart */}
            <GaugeChart
              title="TDS Value"
              value={434}
              maxValue={1000}
              color="green"
              status="The TDS value is within normal limits."
            />
          </>
        )}
      </div>
    </div>
  );
}
