import { useState, useEffect } from 'react';
import { GaugeChart } from '../components/GaugeChart';
import { MetricCard } from '../components/MetricCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { NotificationPopup } from '../components/NotificationPopup';
import { useWaterParameterMonitoring } from '../hooks/useWaterParameterMonitoring';

export function TDS() {
  const [isLoading, setIsLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [currentTDS, setCurrentTDS] = useState(434);
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState<any>(null);
  
  const { checkParameterSafety, goToNotifications } = useWaterParameterMonitoring();

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

  // Monitor TDS levels and show notifications for dangerous values
  useEffect(() => {
    if (!isLoading && !metricsLoading) {
      const simulateTDSValues = () => {
        const testValues = [434, 25, 750, 1200, 300, 480]; // Mix of safe and dangerous values
        const randomValue = testValues[Math.floor(Math.random() * testValues.length)];
        setCurrentTDS(randomValue);
        
        const notification = checkParameterSafety({
          type: 'TDS',
          value: randomValue,
          unit: 'ppm'
        });

        if (notification) {
          setPopupData(notification);
          setShowPopup(true);
        }
      };

      // Check TDS every 12 seconds for demonstration
      const interval = setInterval(simulateTDSValues, 12000);
      
      // Initial check
      simulateTDSValues();

      return () => clearInterval(interval);
    }
  }, [isLoading, metricsLoading, checkParameterSafety]);

  if (isLoading) {
    return <LoadingSkeleton variant="page" />;
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
        {metricsLoading ? (
          <>
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="card" />
          </>
        ) : (
          <>
            <MetricCard
              title="Current TDS"
              value={currentTDS.toString()}
              unit="ppm"
              color={currentTDS >= 50 && currentTDS <= 500 ? "green" : currentTDS > 1000 || currentTDS < 30 ? "red" : "blue"}
              status={currentTDS >= 50 && currentTDS <= 500 ? "normal" : "warning"}
            />
            <MetricCard
              title="Average Today"
              value="428"
              unit="ppm"
              color="green"
              status="normal"
            />
            <MetricCard
              title="Peak Reading"
              value="456"
              unit="ppm"
              color="green"
              status="normal"
            />
          </>
        )}
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GaugeChart
          title="TDS Value"
          value={currentTDS}
          maxValue={1000}
          color={currentTDS >= 50 && currentTDS <= 500 ? "green" : currentTDS > 1000 || currentTDS < 30 ? "red" : "blue"}
          status={
            currentTDS >= 50 && currentTDS <= 500 
              ? "TDS value is within safe drinking water range." 
              : currentTDS > 1000 || currentTDS < 30
              ? "DANGER: TDS level is unsafe for consumption!"
              : "WARNING: TDS level is outside recommended range."
          }
        />
        
        <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6">
          <h3 className="text-white font-medium text-lg mb-4">TDS Classification</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-slate-300">0 - 300 ppm: Excellent</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-300">300 - 600 ppm: Good</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-slate-300">600 - 900 ppm: Fair</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-slate-300">&gt; 900 ppm: Poor</span>
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
