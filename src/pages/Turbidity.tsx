import { useState, useEffect } from 'react';
import { GaugeChart } from '../components/GaugeChart';
import { MetricCard } from '../components/MetricCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { NotificationPopup } from '../components/NotificationPopup';
import { useWaterParameterMonitoring } from '../hooks/useWaterParameterMonitoring';
import { useParameterData } from '../hooks/useSensorData';

export function Turbidity() {
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState<any>(null);
  
  const { checkParameterSafety, goToNotifications } = useWaterParameterMonitoring();
  const { value: currentTurbidity, status, timestamp, isLoading, error } = useParameterData('turbidity');

  // Monitor Turbidity levels and show notifications for dangerous values
  useEffect(() => {
    if (!isLoading && currentTurbidity !== null) {
      const notification = checkParameterSafety({
        type: 'Turbidity',
        value: currentTurbidity,
        unit: 'NTU'
      });

      if (notification) {
        setPopupData(notification);
        setShowPopup(true);
      }
    }
  }, [currentTurbidity, isLoading, checkParameterSafety]);

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

  if (currentTurbidity === null) {
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
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Turbidity Monitoring</h1>
        <p className="text-slate-400">Track water clarity and turbidity levels</p>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Current Turbidity"
          value={currentTurbidity.toFixed(2)}
          unit="NTU"
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
          title="Turbidity Level"
          value={currentTurbidity}
          maxValue={5}
          color={status === 'normal' ? "green" : status === 'warning' ? "blue" : "red"}
          status={
            status === 'normal'
              ? "Turbidity level meets WHO drinking water standards." 
              : status === 'warning'
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