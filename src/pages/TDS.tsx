import { useState, useEffect } from 'react';
import { GaugeChart } from '../components/GaugeChart';
import { MetricCard } from '../components/MetricCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { NotificationPopup } from '../components/NotificationPopup';
import { useWaterParameterMonitoring } from '../hooks/useWaterParameterMonitoring';
import { useParameterData } from '../hooks/useSensorData';

export function TDS() {
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState<any>(null);
  
  const { checkParameterSafety, goToNotifications } = useWaterParameterMonitoring();
  const { value: currentTDS, status, timestamp, isLoading, error } = useParameterData('tds');

  // Monitor TDS levels and show notifications for dangerous values
  useEffect(() => {
    if (!isLoading && currentTDS !== null) {
      console.log('TDS Component: Checking TDS value:', currentTDS, 'Status:', status);
      
      const notification = checkParameterSafety({
        type: 'TDS',
        value: currentTDS,
        unit: 'ppm'
      });

      console.log('TDS Component: Notification result:', notification);

      if (notification) {
        setPopupData(notification);
        setShowPopup(true);
      }
    }
  }, [currentTDS, isLoading, checkParameterSafety, status]);

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

  if (currentTDS === null) {
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
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Total Dissolved Solids (TDS)</h1>
        <p className="text-slate-400">Monitor dissolved solids in your water system</p>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Current TDS"
          value={currentTDS.toString()}
          unit="ppm"
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
          title="TDS Value"
          value={currentTDS}
          maxValue={1000}
          color={status === 'normal' ? "green" : status === 'warning' ? "blue" : "red"}
          status={
            status === 'normal'
              ? "TDS value is within safe drinking water range." 
              : status === 'warning'
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