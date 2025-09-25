import { useState, useEffect } from 'react';
import { GaugeChart } from '../components/GaugeChart';
import { MetricCard } from '../components/MetricCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { NotificationPopup } from '../components/NotificationPopup';
import { useWaterParameterMonitoring } from '../hooks/useWaterParameterMonitoring';

export function PHLevel() {
  const [isLoading, setIsLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [currentPH, setCurrentPH] = useState(7.1);
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

  // Monitor pH levels and show notifications for dangerous values
  useEffect(() => {
    if (!isLoading && !metricsLoading) {
      // Simulate different pH values for testing
      const simulatePHValues = () => {
        const testValues = [7.1, 6.4, 9.2, 8.8, 6.8, 7.3]; // Mix of safe and dangerous values
        const randomValue = testValues[Math.floor(Math.random() * testValues.length)];
        setCurrentPH(randomValue);
        
        const notification = checkParameterSafety({
          type: 'pH',
          value: randomValue
        });

        if (notification) {
          setPopupData(notification);
          setShowPopup(true);
        }
      };

      // Check pH every 10 seconds for demonstration
      const interval = setInterval(simulatePHValues, 10000);
      
      // Initial check
      simulatePHValues();

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
        <h1 className="text-2xl font-bold text-white mb-2">PH Level Monitoring</h1>
        <p className="text-slate-400">Monitor and track pH levels of your water system</p>
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
              title="Current PH"
              value={currentPH.toString()}
              color={currentPH >= 7.0 && currentPH <= 8.5 ? "green" : currentPH < 6.5 || currentPH > 9.0 ? "red" : "blue"}
              status={currentPH >= 7.0 && currentPH <= 8.5 ? "normal" : "warning"}
            />
            <MetricCard
              title="Min PH Today"
              value="6.8"
              color="green"
              status="normal"
            />
            <MetricCard
              title="Max PH Today"
              value="7.4"
              color="red"
              status="warning"
            />
          </>
        )}
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GaugeChart
          title="PH Level"
          value={currentPH}
          maxValue={14}
          color={currentPH >= 7.0 && currentPH <= 8.5 ? "green" : currentPH < 6.5 || currentPH > 9.0 ? "red" : "blue"}
          status={
            currentPH >= 7.0 && currentPH <= 8.5 
              ? "pH level is within optimal range for human consumption." 
              : currentPH < 6.5 || currentPH > 9.0
              ? "DANGER: pH level is unsafe for human consumption!"
              : "WARNING: pH level is outside recommended safe range."
          }
        />
        
        <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6">
          <h3 className="text-white font-medium text-lg mb-4">PH Guidelines</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-slate-300"> pH &lt; 3 : Extremely Acidic</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-slate-300"> pH &lt; 7 : Acidic</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-300">pH 7.0 - pH 8.5: Optimal Range for pH</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-slate-300">  pH &gt; 8.5: Alkaline</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-slate-300">  pH &gt; 11: Extremely Alkaline</span>
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
