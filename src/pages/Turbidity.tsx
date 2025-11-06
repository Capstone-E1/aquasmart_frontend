import { useState, useEffect } from 'react';
import { GaugeChart } from '../components/GaugeChart';
import { MetricCard } from '../components/MetricCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { NotificationPopup } from '../components/NotificationPopup';
import { useWaterParameterMonitoring } from '../hooks/useWaterParameterMonitoring';
import { usePrePostParameterData } from '../hooks/useSensorData';

export function Turbidity() {
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState<any>(null);
  
  const { checkParameterSafety, goToNotifications } = useWaterParameterMonitoring();
  const { pre, post, isLoading, error, refetch } = usePrePostParameterData('turbidity');

  // Monitor Turbidity levels and show notifications for dangerous values (post-filtration)
  useEffect(() => {
    if (!isLoading && post.value !== null) {
      const notification = checkParameterSafety({
        type: 'Turbidity',
        value: post.value,
        unit: 'NTU'
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
          <h1 className="text-2xl font-bold text-white mb-2">Turbidity Monitoring</h1>
          <p className="text-slate-400">Track water clarity and turbidity levels</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">Error loading turbidity data: {error}</p>
        </div>
      </div>
    );
  }

  if (pre.value === null && post.value === null) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Turbidity Monitoring</h1>
          <p className="text-slate-400">Track water clarity and turbidity levels</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-yellow-400">No turbidity data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Turbidity Monitoring</h1>
          <p className="text-slate-400">Track water clarity and turbidity levels</p>
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
              title="Pre-Filtration Turbidity"
              value={pre.value.toFixed(2)}
              unit="NTU"
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
              title="Pre-Filtration Turbidity"
              value={pre.value}
              maxValue={5}
              color={pre.status === 'normal' ? "green" : pre.status === 'warning' ? "blue" : "red"}
              status={
                pre.status === 'normal'
                  ? "Turbidity level meets WHO standards." 
                  : pre.status === 'warning'
                  ? "WARNING: Turbidity level exceeds recommended standards."
                  : "DANGER: Turbidity level is extremely high!"
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
              title="Post-Filtration Turbidity"
              value={post.value.toFixed(2)}
              unit="NTU"
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
              title="Post-Filtration Turbidity"
              value={post.value}
              maxValue={5}
              color={post.status === 'normal' ? "green" : post.status === 'warning' ? "blue" : "red"}
              status={
                post.status === 'normal'
                  ? "Turbidity level meets WHO drinking water standards." 
                  : post.status === 'warning'
                  ? "WARNING: Turbidity level exceeds recommended standards."
                  : "DANGER: Turbidity level is extremely high and unsafe!"
              }
            />
            
            <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6">
              <h3 className="text-white font-medium text-lg mb-4">Turbidity Standards</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-slate-300">0 - 1 NTU: Safe (WHO Standard)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-slate-300">1 - 4 NTU: Warning Level</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-slate-300">&gt; 4 NTU: Dangerous</span>
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