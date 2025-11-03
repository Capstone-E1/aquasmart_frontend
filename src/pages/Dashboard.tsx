import { MetricCard } from '../components/MetricCard';
import { GaugeChart } from '../components/GaugeChart';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useSensorData } from '../hooks/useSensorData';
import { apiService } from '../services/api';
import { Card } from '../components';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { latestData, dailyAnalytics, worstValues, isLoading, error, refetch } = useSensorData();
  const navigate = useNavigate();

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
    return {
      message: messages[status as keyof typeof messages] || messages.normal,
  };
  };

  if (error) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white mb-2">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm lg:text-base">Monitor your filtration water quality</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">Error loading sensor data: {error}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Please check if the backend server is running on localhost:8080</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white mb-2">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm lg:text-base">Monitor your filtration water quality</p>
          {latestData && (
            <p className="text-xs text-slate-500 mt-1">
              Last data sensor updated: {new Date(latestData.timestamp).toLocaleString('id-ID')}
            </p>
          )}
        </div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="space-y-4 lg:space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              {!latestData ? (
                <>
                  <LoadingSkeleton variant="card" />
                  <LoadingSkeleton variant="card" />
                  <LoadingSkeleton variant="card" />
                </>
              ) : (
                <>
                  <MetricCard
                    title="pH Level"
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
                  status={getStatusMessage('pH', phStatus).message}
                />

                {/* Turbidity Chart */}
                <GaugeChart
                  title="Turbidity Level"
                  value={latestData.turbidity}
                  maxValue={10}
                  color="red"
                  status={getStatusMessage('turbidity', turbidityStatus).message}
                />

                {/* TDS Chart */}
                <GaugeChart
                  title="TDS Value"
                  value={latestData.tds}
                  maxValue={1000}
                  color="green"
                  status={getStatusMessage('TDS', tdsStatus).message}
                />
              </>
            )}
          </div>
        </div>

        <div>
          <Card
            title="Start Your Water Filtration"
            description="Keep your water clean and safe with UV filtration. Monitor and control your filtration system in real-time for optimal water quality."
            className="h-full min-h-[500px] flex flex-col justify-between p-8 bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-400 text-white shadow-2xl"
          >
            <div className="flex-1 flex flex-col justify-center items-center space-y-8">
              <div className="w-24 h-24 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center ring-4 ring-white/40 shadow-lg">
                <svg className="w-12 h-12 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              {/* Features */}
              <div className="grid grid-cols-2 gap-4 w-full mt-6">
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 text-center border border-white/30 shadow-xl">
                  <p className="text-2xl font-bold text-white drop-shadow-md">UV</p>
                  <p className="text-xs text-white/90">Sterilization</p>
                </div>
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 text-center border border-white/30 shadow-xl">
                  <p className="text-2xl font-bold text-white drop-shadow-md">Safe</p>
                  <p className="text-xs text-white/90">Water Quality</p>
                </div>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="flex flex-col items-center space-y-3 mt-8">
              <button 
                onClick={() => navigate('/filter-uv')}
                className="w-full px-8 py-4 bg-white/30 backdrop-blur-md text-white font-bold text-lg rounded-xl border-2 border-white/50 hover:bg-white/40 hover:scale-105 transform transition-all duration-200 shadow-xl"
              >
                Start UV Filtration
              </button>
              <p className="text-sm text-white/90 drop-shadow">Begin filtering your water now</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Daily Best & Worst Values */}
      <div className="space-y-4">
        <h2 className="text-lg lg:text-xl font-semibold text-white">Today's Performance</h2>
        
        {!dailyAnalytics ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="card" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Section */}
            <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-4 lg:p-6">
              <h3 className="text-white font-medium text-base mb-4 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                Daily Summary
              </h3>
              <div className="space-y-3">
                <p className="text-slate-300 text-sm">{dailyAnalytics.summary}</p>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Overall Quality:</span>
                  <span className={`font-medium px-2 py-1 rounded-md text-xs ${
                    dailyAnalytics.overall_quality === 'Excellent' ? 'bg-green-900 text-green-400' :
                    dailyAnalytics.overall_quality === 'Good' ? 'bg-blue-900 text-blue-400' :
                    dailyAnalytics.overall_quality === 'Fair' ? 'bg-yellow-900 text-yellow-400' :
                    'bg-red-900 text-red-400'
                  }`}>
                    {dailyAnalytics.overall_quality}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">Total Readings:</span>
                  <span className="font-medium text-cyan-400">{dailyAnalytics.total_readings}</span>
                </div>
              </div>
            </div>

            {/* Best/Worst Values Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Best Values */}
              <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-4 lg:p-6">
                <h3 className="text-white font-medium text-base mb-4 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Best Values Today
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">pH:</span>
                    <span className="font-medium text-green-400">
                      {dailyAnalytics.best_ph?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Turbidity:</span>
                    <span className="font-medium text-green-400">
                      {dailyAnalytics.best_turbidity?.toFixed(2) || 'N/A'} NTU
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">TDS:</span>
                    <span className="font-medium text-green-400">
                      {dailyAnalytics.best_tds || 'N/A'} ppm
                    </span>
                  </div>
                </div>
              </div>

              {/* Worst Values */}
              <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-4 lg:p-6">
                <h3 className="text-white font-medium text-base mb-4 flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Worst Values Today
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">pH:</span>
                    <span className="font-medium text-red-400">
                      {worstValues.worst_ph?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Turbidity:</span>
                    <span className="font-medium text-red-400">
                      {worstValues.worst_turbidity?.toFixed(2) || 'N/A'} NTU
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">TDS:</span>
                    <span className="font-medium text-red-400">
                      {worstValues.worst_tds || 'N/A'} ppm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
