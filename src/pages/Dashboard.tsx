import { MetricCard } from '../components/MetricCard';
import { GaugeChart } from '../components/GaugeChart';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useSensorData } from '../hooks/useSensorData';
import { apiService } from '../services/api';

export function Dashboard() {
  const { latestData, isLoading, error } = useSensorData();

  if (isLoading) {
    return <LoadingSkeleton variant="page" />;
  }

  // Get status for each parameter
  const phStatus = latestData ? apiService.getParameterStatus('ph', latestData.ph) : 'normal';
  const turbidityStatus = latestData ? apiService.getParameterStatus('turbidity', latestData.turbidity) : 'normal';
  const tdsStatus = latestData ? apiService.getParameterStatus('tds', latestData.tds) : 'normal';

  // Status messages for charts
  const getStatusMessage = (type: string, status: string) => {
    const messages = {
      normal: `The ${type} level is within normal limits.`,
      warning: `The ${type} level requires attention.`,
      danger: `The ${type} level is critical!`
    };
    return messages[status as keyof typeof messages] || messages.normal;
  };

  if (error) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400 text-sm lg:text-base">Monitor your filtration water quality</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">Error loading sensor data: {error}</p>
          <p className="text-sm text-slate-400 mt-2">Please check if the backend server is running on localhost:8080</p>
        </div>
      </div>
    );
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
        {!latestData ? (
          <>
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="card" />
          </>
        ) : (
          <>
            <MetricCard
              title="PH Level"
              value={latestData.ph.toFixed(1)}
              color="purple"
              status={phStatus}
              isBest={phStatus === 'normal'}
            />
            <MetricCard
              title="Turbidity Level"
              value={latestData.turbidity.toFixed(2)}
              color="red"
              status={turbidityStatus}
              isBest={turbidityStatus === 'normal'}
            />
            <MetricCard
              title="TDS Value"
              value={latestData.tds.toString()}
              color="green"
              status={tdsStatus}
              isBest={tdsStatus === 'normal'}
            />
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {!latestData ? (
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
              value={latestData.ph}
              maxValue={14}
              color="purple"
              status={getStatusMessage('pH', phStatus)}
            />

            {/* Turbidity Chart */}
            <GaugeChart
              title="Turbidity Level"
              value={latestData.turbidity}
              maxValue={10}
              color="red"
              status={getStatusMessage('turbidity', turbidityStatus)}
            />

            {/* TDS Chart */}
            <GaugeChart
              title="TDS Value"
              value={latestData.tds}
              maxValue={1000}
              color="green"
              status={getStatusMessage('TDS', tdsStatus)}
            />
          </>
        )}
      </div>
    </div>
  );
}
