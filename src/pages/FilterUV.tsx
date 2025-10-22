import { useState, useEffect } from 'react';
import { User, Droplets, Eye, Sprout, Filter, Shield, Layers, Lightbulb, Power, Zap } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { apiService } from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';

export function FilterUV() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'household' | 'drinking'>('household');
  const [ledStatus, setLedStatus] = useState<'off' | 'on' | 'blinking'>('off');
  const [isLedLoading, setIsLedLoading] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Fetch LED status on mount and periodically
  useEffect(() => {
    const fetchLedStatus = async () => {
      try {
        const result = await apiService.getLedStatus();
        if (result.success) {
          setLedStatus(result.status);
        }
      } catch (error) {
        console.error('Error fetching LED status:', error);
      }
    };

    // Fetch immediately
    fetchLedStatus();

    // Fetch every 2 seconds
    const interval = setInterval(fetchLedStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleLedCommand = async (command: 'on' | 'off' | 'blink') => {
    setIsLedLoading(true);
    try {
      const result = await apiService.sendLedCommand(command);
      
      if (result.success) {
        // Fetch updated LED status from backend
        const statusResult = await apiService.getLedStatus();
        if (statusResult.success) {
          setLedStatus(statusResult.status);
        } else {
          // Fallback to local state update if status fetch fails
          if (command === 'on') setLedStatus('on');
          else if (command === 'off') setLedStatus('off');
          else if (command === 'blink') {
            setLedStatus('blinking');
            // Reset to off after 3 blinks (approximately 3 seconds)
            setTimeout(async () => {
              const updatedStatus = await apiService.getLedStatus();
              if (updatedStatus.success) {
                setLedStatus(updatedStatus.status);
              } else {
                setLedStatus('off');
              }
            }, 3000);
          }
        }
        
        addNotification({
          type: 'info',
          title: 'LED Control',
          message: `LED ${command.toUpperCase()} command sent successfully`,
          parameter: 'pH',
          value: 0,
        });
      } else {
        addNotification({
          type: 'danger',
          title: 'LED Control Error',
          message: `Failed to send LED command: ${result.message}`,
          parameter: 'pH',
          value: 0,
        });
      }
    } catch (error) {
      addNotification({
        type: 'danger',
        title: 'LED Control Error',
        message: 'Error sending LED command to backend',
        parameter: 'pH',
        value: 0,
      });
    } finally {
      setIsLedLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton variant="page" />;
  }

  const filtrationSteps = [
    {
      name: "Palm Fiber Layer",
      description: "Primarily for removing larger debris.",
      active: true
    },
    {
      name: "Silica Sand",
      description: "Acts as a finer filter",
      active: true
    },
    {
      name: "Biochar / Charcoal",
      description: "Its main role here is to remove heavy metals.",
      active: true
    },
    {
      name: "Fine Gravel",
      description: "Maintains the physical stability of the filter system",
      active: true
    },
    {
      name: "Coarse Stone/Gravel",
      description: "This bottom layer of coarse stone or gravel acts as the foundation, prevents clogging at the base of the system.",
      active: true
    }
  ];

  const purificationSteps = [
    {
      name: "Zeolite",
      description: "Absorb chemical pollutants and dangerous heavy metals through an ion exchange process.",
      active: activeFilter === 'drinking'
    },
    {
      name: "UV Purification",
      description: "Inactivate pathogenic microorganisms (like bacteria, viruses, and protozoa) without the addition of chemicals.",
      active: activeFilter === 'drinking'
    },
    {
      name: "Ultrafiltration",
      description: "This membrane has very fine pores that block suspended solids, bacteria, viruses, endotoxins, and other pathogens, allowing purified water to pass through while concentrating waste materials.",
      active: activeFilter === 'drinking'
    }
  ];

  const householdUses = [
    {
      icon: User,
      title: "Personal Hygiene",
      description: "This includes activities like bathing, showering, washing hands, brushing teeth, and using toilets."
    },
    {
      icon: Droplets,
      title: "Cleaning",
      description: "Cleaning various surfaces includes washing dishes, laundry, mopping floors, and cleaning windows."
    },
    {
      icon: Sprout,
      title: "Gardening and Outdoor Use",
      description: "This involves watering plants, gardens, yard gardening, washing cars, or cleaning outdoor areas."
    }
  ];

  const drinkingUses = [
    {
      icon: Droplets,
      title: "pH (Potential of Hydrogen)",
      description: "Drinking water should ideally maintain (WHO) and the US Environmental Protection Agency), is generally in the range of 6.5 to 8.5 for drinking water."
    },
    {
      icon: Eye,
      title: "TDS (Total Dissolved Solids)",
      description: "The WHO suggests that the best drinking water with does not generally cause any health concerns, but water consumption at TDS levels > 1000 mg/L."
    },
    {
      icon: Eye,
      title: "Gardening and Outdoor Use",
      description: "The WHO's general limits that quality of drinking water should be consistently less than 1 NTU."
    }
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">AquaSmart</h1>
        <p className="text-slate-400 text-sm lg:text-base">Advanced Water Filtration & Purification System</p>
      </div>

      {/* Filter Type Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-4 lg:mb-6">
        <button
          onClick={() => setActiveFilter('household')}
          className={`flex-1 p-3 lg:p-4 rounded-xl border transition-all ${
            activeFilter === 'household'
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-primary-light/50 border-slate-600 text-slate-400 hover:text-white hover:border-slate-500'
          }`}
        >
          <div className="text-center">
            <h3 className="text-base lg:text-lg font-semibold mb-1">Household Water</h3>
            <p className="text-xs lg:text-sm opacity-75">Basic filtration for daily use</p>
          </div>
        </button>
        
        <button
          onClick={() => setActiveFilter('drinking')}
          className={`flex-1 p-3 lg:p-4 rounded-xl border transition-all ${
            activeFilter === 'drinking'
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-primary-light/50 border-slate-600 text-slate-400 hover:text-white hover:border-slate-500'
          }`}
        >
          <div className="text-center">
            <h3 className="text-base lg:text-lg font-semibold mb-1">Drinking Water</h3>
            <p className="text-xs lg:text-sm opacity-75">Advanced purification for consumption</p>
          </div>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Left Side - Water Uses */}
        <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            {activeFilter === 'household' ? 'Household Water' : 'Drinking Water'}
          </h2>
          
          <div className="space-y-4">
            {(activeFilter === 'household' ? householdUses : drinkingUses).map((use, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <use.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{use.title}</h3>
                  <p className="text-sm text-slate-400">{use.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Water Quality Indicator */}
          {activeFilter === 'drinking' && (
            <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center justify-center">
                <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Droplets className="w-8 h-8 text-slate-900" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Filtration Process */}
        <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            {activeFilter === 'household' ? '7 - Segment Filtration :' : '7 - Segment Filtration + UV Purification :'}
          </h2>

          <div className="space-y-4">
            {/* Basic Filtration Steps */}
            {filtrationSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium text-white">
                    {step.name}
                  </span>
                </div>
                <span className="text-sm text-slate-400">: {step.description}</span>
              </div>
            ))}

            {/* Advanced Purification Steps (only for drinking water) */}
            {activeFilter === 'drinking' && (
              <div className="mt-6 pt-4 border-t border-slate-600">
                {purificationSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        step.active ? 'bg-blue-400' : 'bg-slate-600'
                      }`}></div>
                      <span className={`text-sm font-medium ${
                        step.active ? 'text-white' : 'text-slate-500'
                      }`}>
                        {step.name}
                      </span>
                    </div>
                    <span className={`text-sm ${
                      step.active ? 'text-slate-400' : 'text-slate-600'
                    }`}>: {step.description}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6">
        <h2 className="text-xl font-bold text-white mb-4">System Status</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Filter className="w-6 h-6 text-green-400" />
              <div>
                <h3 className="font-semibold text-white">Filtration</h3>
                <p className="text-sm text-green-400">Active</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className={`w-6 h-6 ${activeFilter === 'drinking' ? 'text-blue-400' : 'text-slate-600'}`} />
              <div>
                <h3 className="font-semibold text-white">UV Purification</h3>
                <p className={`text-sm ${activeFilter === 'drinking' ? 'text-blue-400' : 'text-slate-600'}`}>
                  {activeFilter === 'drinking' ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Layers className={`w-6 h-6 ${activeFilter === 'drinking' ? 'text-purple-400' : 'text-slate-600'}`} />
              <div>
                <h3 className="font-semibold text-white">Ultrafiltration</h3>
                <p className={`text-sm ${activeFilter === 'drinking' ? 'text-purple-400' : 'text-slate-600'}`}>
                  {activeFilter === 'drinking' ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LED Test Control Panel */}
      <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Lightbulb className={`w-6 h-6 ${
              ledStatus === 'on' ? 'text-yellow-400' : 
              ledStatus === 'blinking' ? 'text-yellow-300 animate-pulse' : 
              'text-slate-600'
            }`} />
            <div>
              <h2 className="text-xl font-bold text-white">LED Test Control</h2>
              <p className="text-sm text-slate-400">
                Status: <span className={`font-semibold ${
                  ledStatus === 'on' ? 'text-yellow-400' : 
                  ledStatus === 'blinking' ? 'text-yellow-300' : 
                  'text-slate-500'
                }`}>
                  {ledStatus === 'on' ? 'ON' : ledStatus === 'blinking' ? 'BLINKING' : 'OFF'}
                </span>
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            <p>Auto-refresh: 2s</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
          <button
            onClick={() => handleLedCommand('on')}
            disabled={isLedLoading}
            className="flex items-center justify-center gap-2 p-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-all font-semibold"
          >
            <Power className="w-5 h-5" />
            LED ON
          </button>

          <button
            onClick={() => handleLedCommand('off')}
            disabled={isLedLoading}
            className="flex items-center justify-center gap-2 p-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-all font-semibold"
          >
            <Power className="w-5 h-5" />
            LED OFF
          </button>

          <button
            onClick={() => handleLedCommand('blink')}
            disabled={isLedLoading}
            className="flex items-center justify-center gap-2 p-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-all font-semibold"
          >
            <Zap className="w-5 h-5" />
            BLINK 3x
          </button>
        </div>

        {isLedLoading && (
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-400">Sending command to backend...</p>
          </div>
        )}

        <div className="mt-4 p-4 bg-slate-700/30 rounded-lg">
          <h3 className="text-sm font-semibold text-white mb-2">Test Instructions:</h3>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• <strong>LED ON:</strong> Turn on the LED continuously</li>
            <li>• <strong>LED OFF:</strong> Turn off the LED</li>
            <li>• <strong>BLINK 3x:</strong> Make the LED blink 3 times (testing purposes)</li>
            <li>• <strong>Auto Status:</strong> LED status updates automatically every 2 seconds from STM32</li>
          </ul>
        </div>
      </div>
    </div>
  );
}