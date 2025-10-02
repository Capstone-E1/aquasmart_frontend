import { useState, useEffect } from 'react';
import { GaugeChart } from '../components/GaugeChart';
import { MetricCard } from '../components/MetricCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { NotificationPopup } from '../components/NotificationPopup';
import { useWaterParameterMonitoring } from '../hooks/useWaterParameterMonitoring';
import { useParameterData } from '../hooks/useSensorData';

export function PHLevel() {
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState<any>(null);
  
  const { checkParameterSafety, goToNotifications } = useWaterParameterMonitoring();
  const { value: currentPH, status, timestamp, isLoading, error } = useParameterData('ph');

  // Monitor pH levels and show notifications for dangerous values
  useEffect(() => {
    if (!isLoading && currentPH !== null) {
      const notification = checkParameterSafety({
        type: 'pH',
        value: currentPH
      });

      if (notification) {
        setPopupData(notification);
        setShowPopup(true);
      }
    }
  }, [currentPH, isLoading, checkParameterSafety]);

  if (isLoading) {
    return <LoadingSkeleton variant="page" />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">PH Level Monitoring</h1>
          <p className="text-slate-400">Monitor and track pH levels of your water system</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">Error loading pH data: {error}</p>
        </div>
      </div>
    );
  }

  if (currentPH === null) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">PH Level Monitoring</h1>
          <p className="text-slate-400">Monitor and track pH levels of your water system</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-yellow-400">No pH data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">PH Level Monitoring</h1>
        <p className="text-slate-400">Monitor and track pH levels of your water system</p>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Current PH"
          value={currentPH.toFixed(1)}
          color={status === 'normal' ? "green" : status === 'warning' ? "blue" : "red"}
          status={status}
        />
        <MetricCard
          title="Status"
          value={status.toUpperCase()}
          color={status === 'normal' ? "green" : status === 'warning' ? "blue" : "red"}
          status={status}
        />
        <MetricCard
          title="Last Updated"
          value={timestamp ? new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
          color="purple"
          status="normal"
        />
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GaugeChart
          title="PH Level"
          value={currentPH}
          maxValue={14}
          color={status === 'normal' ? "green" : status === 'warning' ? "blue" : "red"}
          status={
            status === 'normal'
              ? "pH level is within optimal range for human consumption." 
              : status === 'warning'
              ? "WARNING: pH level is outside recommended safe range."
              : "DANGER: pH level is unsafe for human consumption!"
          }
        />
        
        <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6">
          <h3 className="text-white font-medium text-lg mb-4">PH Guidelines</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-slate-300"> pH &lt; 6.0 : Dangerous - Too Acidic</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-slate-300"> pH 6.0-6.5 : Warning - Acidic</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-300">pH 6.5-8.5: Safe Range</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-slate-300">pH 8.5-9.0: Warning - Alkaline</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-slate-300">pH &gt; 9.0: Dangerous - Too Alkaline</span>
            </div>
          </div>
        </div>
      </div>

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
