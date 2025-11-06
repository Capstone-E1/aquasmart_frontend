import { useState, useEffect } from 'react';
import { GaugeChart } from '../components/GaugeChart';
import { MetricCard } from '../components/MetricCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { NotificationPopup } from '../components/NotificationPopup';
import { useWaterParameterMonitoring } from '../hooks/useWaterParameterMonitoring';
import { usePrePostParameterData } from '../hooks/useSensorData';

export function TDS() {
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState<any>(null);
  
  const { checkParameterSafety, goToNotifications } = useWaterParameterMonitoring();
  const { pre, post, isLoading, error, refetch } = usePrePostParameterData('tds');

  // Monitor TDS levels and show notifications for dangerous values (post-filtration)
  useEffect(() => {
    if (!isLoading && post.value !== null) {
      const notification = checkParameterSafety({
        type: 'TDS',
        value: post.value,
        unit: 'ppm'
      });

      if (notification) {
        setPopupData(notification);
        setShowPopup(true);
      }
    }
  }, [post.value, isLoading, checkParameterSafety]);

  if (isLoading) {
    return <LoadingSkeleton variant="page" />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Total Dissolved Solids (TDS)</h1>
          <p className="text-slate-400">Monitor dissolved solids in your water system</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">Error loading TDS data: {error}</p>
        </div>
      </div>
    );
  }

  if (pre.value === null && post.value === null) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Total Dissolved Solids (TDS)</h1>
          <p className="text-slate-400">Monitor dissolved solids in your water system</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-yellow-400">No TDS data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Total Dissolved Solids (TDS)</h1>
          <p className="text-slate-400">Monitor dissolved solids in your water system</p>
        </div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Pre-Filtration Section */}
      {pre.value !== null && (
        <>
          <div className="border-b border-slate-600 pb-2">
            <h2 className="text-lg font-semibold text-cyan-400">Pre-Filtration (Before Treatment)</h2>
            <p className="text-xs text-slate-500">Device: {pre.deviceId}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Pre-Filtration TDS"
              value={pre.value.toString()}
              unit="ppm"
              color={pre.status === 'normal' ? "green" : pre.status === 'warning' ? "blue" : "red"}
              status={pre.status}
            />
            <MetricCard
              title="Status"
              value={pre.status.toUpperCase()}
              color={pre.status === 'normal' ? "green" : pre.status === 'warning' ? "blue" : "red"}
              status={pre.status}
            />
            <MetricCard
              title="Last Updated"
              value={pre.timestamp ? new Date(pre.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
              color="purple"
              status="normal"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GaugeChart
              title="Pre-Filtration TDS"
              value={pre.value}
              maxValue={1000}
              color={pre.status === 'normal' ? "green" : pre.status === 'warning' ? "blue" : "red"}
              status={
                pre.status === 'normal'
                  ? "TDS value is within safe range." 
                  : pre.status === 'warning'
                  ? "WARNING: TDS level is outside recommended range."
                  : "DANGER: TDS level is unsafe!"
              }
            />
            <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6">
              <h3 className="text-white font-medium text-lg mb-4">Pre-Filtration Info</h3>
              <div className="space-y-3">
                <p className="text-slate-300 text-sm">This shows water quality <span className="text-cyan-400 font-semibold">before</span> the filtration process.</p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <span className="text-slate-300 text-sm">Raw water input</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Post-Filtration Section */}
      {post.value !== null && (
        <>
          <div className="border-b border-slate-600 pb-2 mt-8">
            <h2 className="text-lg font-semibold text-green-400">Post-Filtration (After Treatment)</h2>
            <p className="text-xs text-slate-500">Device: {post.deviceId}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Post-Filtration TDS"
              value={post.value.toString()}
              unit="ppm"
              color={post.status === 'normal' ? "green" : post.status === 'warning' ? "blue" : "red"}
              status={post.status}
            />
            <MetricCard
              title="Status"
              value={post.status.toUpperCase()}
              color={post.status === 'normal' ? "green" : post.status === 'warning' ? "blue" : "red"}
              status={post.status}
            />
            <MetricCard
              title="Last Updated"
              value={post.timestamp ? new Date(post.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
              color="purple"
              status="normal"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GaugeChart
              title="Post-Filtration TDS"
              value={post.value}
              maxValue={1000}
              color={post.status === 'normal' ? "green" : post.status === 'warning' ? "blue" : "red"}
              status={
                post.status === 'normal'
                  ? "TDS value is within safe drinking water range." 
                  : post.status === 'warning'
                  ? "WARNING: TDS level is outside recommended range."
                  : "DANGER: TDS level is unsafe for consumption!"
              }
            />
            
            <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6">
              <h3 className="text-white font-medium text-lg mb-4">TDS Standards</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-slate-300">0 - 150 ppm: Too Low</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-slate-300">150 - 300 ppm: Warning</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-slate-300">300 - 600 ppm: Safe Range</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-slate-300">600 - 1000 ppm: Warning</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-slate-300">&gt; 1000 ppm: Dangerous</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Notification Popup */}
      {showPopup && popupData && (
        <NotificationPopup
          show={showPopup}
          type={popupData.type}
          title={popupData.title}
          message={popupData.message}
          parameter={popupData.parameter}
          value={popupData.value}
          onClose={() => setShowPopup(false)}
          onGoToNotifications={goToNotifications}
        />
      )}
    </div>
  );
}