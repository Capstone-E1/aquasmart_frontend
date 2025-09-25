import { useState, useEffect } from 'react';
import { GaugeChart } from '../components/GaugeChart';
import { MetricCard } from '../components/MetricCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { NotificationPopup } from '../components/NotificationPopup';
import { useWaterParameterMonitoring } from '../hooks/useWaterParameterMonitoring';

export function Turbidity() {
  const [isLoading, setIsLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [currentTurbidity, setCurrentTurbidity] = useState(0.78);
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

  // Monitor Turbidity levels and show notifications for dangerous values
  useEffect(() => {
    if (!isLoading && !metricsLoading) {
      const simulateTurbidityValues = () => {
        const testValues = [0.78, 0.4, 2.5, 5.2, 0.9, 1.8]; // Mix of safe and dangerous values
        const randomValue = testValues[Math.floor(Math.random() * testValues.length)];
        setCurrentTurbidity(randomValue);
        
        const notification = checkParameterSafety({
          type: 'Turbidity',
          value: randomValue,
          unit: 'NTU'
        });

        if (notification) {
          setPopupData(notification);
          setShowPopup(true);
        }
      };

      // Check Turbidity every 14 seconds for demonstration
      const interval = setInterval(simulateTurbidityValues, 14000);
      
      // Initial check
      simulateTurbidityValues();

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
        <h1 className="text-2xl font-bold text-white mb-2">Turbidity Monitoring</h1>
        <p className="text-slate-400">Track water clarity and turbidity levels</p>
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
              title="Current Turbidity"
              value={currentTurbidity.toString()}
              unit="NTU"
              color={currentTurbidity <= 1.0 ? "green" : currentTurbidity > 4.0 ? "red" : "blue"}
              status={currentTurbidity <= 1.0 ? "normal" : "warning"}
            />
            <MetricCard
              title="Average Today"
              value="0.82"
              unit="NTU"
              color="red"
              status="normal"
            />
            <MetricCard
              title="Peak Reading"
              value="1.2"
              unit="NTU"
              color="red"
              status="warning"
            />
          </>
        )}
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GaugeChart
          title="Turbidity Level"
          value={currentTurbidity}
          maxValue={5}
          color={currentTurbidity <= 1.0 ? "green" : currentTurbidity > 4.0 ? "red" : "blue"}
          status={
            currentTurbidity <= 1.0 
              ? "Turbidity level meets WHO drinking water standards." 
              : currentTurbidity > 4.0
              ? "DANGER: Turbidity level is extremely high and unsafe!"
              : "WARNING: Turbidity level exceeds recommended standards."
          }
        />
        
        <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6">
          <h3 className="text-white font-medium text-lg mb-4">Turbidity Standards</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-300">0 - 1 NTU: Excellent</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-slate-300">1 - 4 NTU: Good</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-slate-300">&gt; 4 NTU: Poor</span>
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
