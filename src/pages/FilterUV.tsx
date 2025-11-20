import { useState, useEffect } from 'react';
import { User, Droplets, Eye, Sprout, Filter, Shield, Layers, Clock } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { apiService, type ScheduleExecution } from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';

export function FilterUV() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'household' | 'drinking' | null>(null);
  const [isSwitchingFilter, setIsSwitchingFilter] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [filterDuration, setFilterDuration] = useState<number>(0);
  const [filterStartedAt, setFilterStartedAt] = useState<string | null>(null);
  const [filtrationActive, setFiltrationActive] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [totalFlowLiters, setTotalFlowLiters] = useState<{
    today: { household: number; drinking: number; };
    week: { household: number; drinking: number; };
    month: { household: number; drinking: number; };
  }>({
    today: { household: 0, drinking: 0 },
    week: { household: 0, drinking: 0 },
    month: { household: 0, drinking: 0 },
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFilterType, setPendingFilterType] = useState<'household' | 'drinking' | null>(null);
  const [targetLiters, setTargetLiters] = useState<string>('');
  const [currentTotalFlow, setCurrentTotalFlow] = useState<number>(0);
  const [activeSchedule, setActiveSchedule] = useState<ScheduleExecution | null>(null); // NEW state for active schedule
  const { addNotification } = useNotifications();

  // Initialize cooldown from localStorage on mount
  useEffect(() => {
    const savedCooldownEnd = localStorage.getItem('filterCooldownEnd');
    if (savedCooldownEnd) {
      const endTime = parseInt(savedCooldownEnd);
      const now = Date.now();
      const remainingSeconds = Math.ceil((endTime - now) / 1000);
      
      if (remainingSeconds > 0) {
        setCooldownSeconds(remainingSeconds);
      } else {
        // Cooldown expired, remove from storage
        localStorage.removeItem('filterCooldownEnd');
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Fetch filter status on mount and periodically
  useEffect(() => {
    const fetchFilterStatus = async () => {
      try {
        const result = await apiService.getFilterStatus();
        if (result.success) {
          const newFilter = result.mode === 'drinking_water' ? 'drinking' : 'household';
          setActiveFilter(newFilter);
          
          // Update active filters list
          if (result.active_filters) {
            setActiveFilters(result.active_filters);
          }
          
          // Update additional filter stats
          if (result.filter_mode_duration_seconds !== undefined) {
            setFilterDuration(result.filter_mode_duration_seconds);
          }
          if (result.filter_mode_started_at) {
            setFilterStartedAt(result.filter_mode_started_at);
          }
          if (result.filtration_active !== undefined) {
            setFiltrationActive(result.filtration_active);
          }
          
          // Update current total flow from total_flow_liters field
          if (result.total_flow_liters !== undefined) {
            setCurrentTotalFlow(result.total_flow_liters);
          }
          
          if (result.statistics) {
            setTotalFlowLiters({
              today: {
                household: result.statistics.today?.household_water_liters || 0,
                drinking: result.statistics.today?.drinking_water_liters || 0,
              },
              week: {
                household: result.statistics.this_week?.household_water_liters || 0,
                drinking: result.statistics.this_week?.drinking_water_liters || 0,
              },
              month: {
                household: result.statistics.this_month?.household_water_liters || 0,
                drinking: result.statistics.this_month?.drinking_water_liters || 0,
              },
            });
          }

          // NEW: Set active schedule state
          setActiveSchedule(result.active_schedule || null);
        }
      } catch (error) {
        console.error('Error fetching filter status:', error);
        // Fallback to household if fetch fails
        if (activeFilter === null) {
          setActiveFilter('household');
        }
      }
    };
    
    // Fetch immediately on mount
    fetchFilterStatus();
    
    // Then poll every 5 seconds
    const interval = setInterval(fetchFilterStatus, 5000);

    return () => clearInterval(interval);
  }, [activeFilter]);


  // Cooldown timer effect
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setInterval(() => {
        setCooldownSeconds((prev) => {
          const newValue = prev - 1;
          
          // Remove from localStorage when cooldown reaches 0
          if (newValue <= 0) {
            localStorage.removeItem('filterCooldownEnd');
          }
          
          return newValue;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [cooldownSeconds]);

  // Monitor target liters
  useEffect(() => {
    const savedTarget = localStorage.getItem('filterTargetLiters');
    const savedMode = localStorage.getItem('filterTargetMode');
    
    if (savedTarget && savedMode && activeFilter) {
      const targetValue = parseFloat(savedTarget);
      
      // Check if we've reached the target
      if (currentTotalFlow >= targetValue && savedMode === activeFilter) {
        addNotification({
          type: 'info',
          title: 'Target Reached! 🎯',
          message: `Successfully filtered ${currentTotalFlow.toFixed(2)}L in ${activeFilter === 'drinking' ? 'Drinking Water' : 'Household Water'} mode. Target was ${targetValue}L.`,
          parameter: 'pH',
          value: currentTotalFlow,
        });
        
        // Clear target from localStorage
        localStorage.removeItem('filterTargetLiters');
        localStorage.removeItem('filterTargetMode');
      }
    }
  }, [currentTotalFlow, activeFilter, addNotification]);

  const handleFilterChange = (filterType: 'household' | 'drinking') => {
    // Check if cooldown is active
    if (cooldownSeconds > 0) {
      addNotification({
        type: 'warning',
        title: 'Mode Change Cooldown',
        message: `Please wait ${cooldownSeconds} seconds before switching mode again`,
        parameter: 'pH',
        value: 0,
      });
      return;
    }

    // Show confirmation modal
    setPendingFilterType(filterType);
    setShowConfirmModal(true);
  };

  const confirmFilterChange = async () => {
    if (!pendingFilterType) return;

    setShowConfirmModal(false);
    setIsSwitchingFilter(true);
    
    const mode = pendingFilterType === 'drinking' ? 'drinking_water' : 'household_water';
    
    // Save target liters if provided
    if (targetLiters && parseFloat(targetLiters) > 0) {
      localStorage.setItem('filterTargetLiters', targetLiters);
      localStorage.setItem('filterTargetMode', pendingFilterType);
    }
    
    // Reset modal state
    setTargetLiters('');
    setPendingFilterType(null);
    
    try {
      const result = await apiService.sendFilterCommand(mode);
      
      if (result.success) {
        setActiveFilter(pendingFilterType);
        
        // Set 20 second cooldown and save end time to localStorage
        const cooldownDuration = 20;
        const cooldownEndTime = Date.now() + (cooldownDuration * 1000);
        localStorage.setItem('filterCooldownEnd', cooldownEndTime.toString());
        setCooldownSeconds(cooldownDuration);
        
        addNotification({
          type: 'info',
          title: 'Filter Mode Changed',
          message: `Successfully switched to ${pendingFilterType === 'drinking' ? 'Drinking Water' : 'Household Water'} mode. Please wait ${cooldownDuration} seconds before switching again.`,
          parameter: 'pH',
          value: 0,
        });
      } else {
        addNotification({
          type: 'danger',
          title: 'Filter Mode Error',
          message: `Failed to switch filter mode: ${result.message}`,
          parameter: 'pH',
          value: 0,
        });
      }
    } catch (error) {
      addNotification({
        type: 'danger',
        title: 'Filter Mode Error',
        message: 'Error changing filter mode',
        parameter: 'pH',
        value: 0,
      });
    } finally {
      setIsSwitchingFilter(false);
    }
  };

  // Format duration from seconds to readable format
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  if (isLoading) {
    return <LoadingSkeleton variant="page" />;
  }

  const filtrationSteps = [
    {
      name: "Palm Fiber Layer (Lapisan Ijuk)",
      description: "Primary and secondary filter, trapping coarse debris and slowing the water flow for optimal filtration.",
      active: true
    },
    {
      name: "Silica Sand (Pasir Silika)",
      description: "Remove turbidity and clarify the water.",
      active: true
    },
    {
      name: "Biochar (Activated Carbon Layer)",
      description: "Uses its vast porous structure for adsorption to remove heavy metals, harmful organic compounds, and pathogens.",
      active: true
    },
    {
      name: "Fine Gravel (Kerikil Halus)",
      description: "Ensures even water distribution to the layer above and prevents the different media layers from mixing.",
      active: true
    },
    {
      name: "Coarse Stone/Gravel (Batu)",
      description: "Filters remaining large particles and facilitates smooth water flow to the outlet, preventing clogs.",
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
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/20 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              Confirm Filter Mode Change
            </h3>
            
            <div className={`p-4 rounded-lg mb-4 ${
              pendingFilterType === 'drinking'
                ? 'bg-cyan-500/10 border border-cyan-500/30'
                : 'bg-green-500/10 border border-green-500/30'
            }`}>
              <p className="text-white font-semibold mb-1">
                Switch to {pendingFilterType === 'drinking' ? 'Drinking Water' : 'Household Water'} Mode?
              </p>
              <p className="text-sm text-slate-400">
                {pendingFilterType === 'drinking' 
                  ? 'Advanced purification with UV sterilization'
                  : 'Basic filtration for general household use'
                }
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target Volume (Optional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={targetLiters}
                  onChange={(e) => setTargetLiters(e.target.value)}
                  placeholder="e.g., 50"
                  className="w-full px-4 py-2 bg-slate-700 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.1"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  Liters
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Get notified when this volume is reached
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingFilterType(null);
                  setTargetLiters('');
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmFilterChange}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  pendingFilterType === 'drinking'
                    ? 'bg-cyan-600 hover:bg-cyan-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Title */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">AquaSmart</h1>
        <p className="text-slate-400 text-sm lg:text-base">Advanced Water Filtration & Purification System</p>
      </div>

      {/* Real-Time Filter Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Duration Card */}
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl border-2 border-blue-500/30 p-4 shadow-lg shadow-blue-500/10">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              filtrationActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/20 text-slate-400'
            }`}>
              {filtrationActive ? '● Active' : '○ Inactive'}
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Filter Mode Duration</p>
          <p className="text-3xl font-bold text-white mb-1">
            {formatDuration(filterDuration)}
          </p>
          {filterStartedAt && (
            <p className="text-xs text-slate-400">
              Started: {new Date(filterStartedAt).toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Total Flow Card */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl border-2 border-purple-500/30 p-4 shadow-lg shadow-purple-500/10">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Droplets className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-xs text-purple-300">Real-time</div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Total Water Flow (Today)</p>
          <p className="text-3xl font-bold text-white mb-1">
            {currentTotalFlow.toFixed(2)}
            <span className="text-xl text-slate-400 ml-2">L</span>
          </p>
          <p className="text-xs text-slate-400">
            {activeFilter === 'drinking' ? 'Drinking Water' : 'Household Water'} Mode
          </p>
        </div>

        {/* Current Mode Card */}
        <div className={`backdrop-blur-sm rounded-xl border-2 p-4 shadow-lg ${
          activeFilter === 'drinking' 
            ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 shadow-cyan-500/10'
            : 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 shadow-green-500/10'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${
              activeFilter === 'drinking' ? 'bg-cyan-500/20' : 'bg-green-500/20'
            }`}>
              <Filter className={`w-5 h-5 ${
                activeFilter === 'drinking' ? 'text-cyan-400' : 'text-green-400'
              }`} />
            </div>
            <div className={`w-3 h-3 rounded-full ${
              activeFilter === null ? 'bg-gray-500 animate-pulse' :
              activeFilter === 'drinking' ? 'bg-cyan-500 animate-pulse' : 'bg-green-500 animate-pulse'
            }`}></div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Current Filter Mode</p>
          <p className="text-2xl font-bold text-white mb-1">
            {activeFilter === null ? 'Loading...' :
             activeFilter === 'drinking' ? 'Drinking Water' : 'Household Water'}
          </p>
          <p className={`text-xs ${
            activeFilter === 'drinking' ? 'text-cyan-300' : 'text-green-300'
          }`}>
            {activeFilter === null ? 'Fetching...' :
             activeFilter === 'drinking' ? 'Advanced Purification' : 'Basic Filtration'}
          </p>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilters && activeFilters.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Layers className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Active Filters</h2>
              <p className="text-sm text-slate-300">Currently running filtration layers</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeFilters.map((filter, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-lg border border-blue-500/30 p-4 hover:border-blue-400/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{filter}</p>
                    <p className="text-xs text-slate-400">Active</p>
                  </div>
                  <div className="p-1.5 bg-green-500/20 rounded">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cooldown Warning (if active) */}
      {cooldownSeconds > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <span className="text-xl">⏱️</span>
            </div>
            <div className="flex-1">
              <p className="text-yellow-400 font-medium">Mode Change Cooldown Active</p>
              <p className="text-slate-300 text-sm">Please wait {cooldownSeconds} seconds before switching filter mode</p>
            </div>
          </div>
        </div>
      )}

      {/* Active Schedule Warning */}
      {activeSchedule && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <span className="text-xl">⏰</span>
            </div>
            <div className="flex-1">
              <p className="text-blue-400 font-medium">Schedule "{activeSchedule.schedule_id}" is Active</p>
              <p className="text-slate-300 text-sm">Manual filter mode changes are temporarily disabled.</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Type Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-4 lg:mb-6">
        <button
          onClick={() => handleFilterChange('household')}
          disabled={activeFilter === null || isSwitchingFilter || cooldownSeconds > 0 || activeSchedule !== null}
          className={`flex-1 p-3 lg:p-4 rounded-xl border transition-all ${
            activeFilter === 'household'
              ? 'bg-accent border-accent text-white'
              : 'bg-white/10 backdrop-blur-lg/50 border-white/20 text-slate-400 hover:text-white hover:border-slate-500'
          } ${(activeFilter === null || isSwitchingFilter || cooldownSeconds > 0 || activeSchedule !== null) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="text-center">
            <h3 className="text-base lg:text-lg font-semibold mb-1">Household Water</h3>
            <p className="text-xs lg:text-sm opacity-75">
              {activeFilter === null ? 'Loading...' :
               activeSchedule !== null ? 'Schedule Active' :
               cooldownSeconds > 0 && activeFilter !== 'household' 
                ? `Wait ${cooldownSeconds}s` 
                : 'Basic filtration for daily use'}
            </p>
          </div>
        </button>
        
        <button
          onClick={() => handleFilterChange('drinking')}
          disabled={activeFilter === null || isSwitchingFilter || cooldownSeconds > 0 || activeSchedule !== null}
          className={`flex-1 p-3 lg:p-4 rounded-xl border transition-all ${
            activeFilter === 'drinking'
              ? 'bg-accent border-accent text-white'
              : 'bg-white/10 backdrop-blur-lg/50 border-white/20 text-slate-400 hover:text-white hover:border-slate-500'
          } ${(activeFilter === null || isSwitchingFilter || cooldownSeconds > 0 || activeSchedule !== null) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="text-center">
            <h3 className="text-base lg:text-lg font-semibold mb-1">Drinking Water</h3>
            <p className="text-xs lg:text-sm opacity-75">
              {activeFilter === null ? 'Loading...' :
               activeSchedule !== null ? 'Schedule Active' :
               cooldownSeconds > 0 && activeFilter !== 'drinking' 
                ? `Wait ${cooldownSeconds}s` 
                : 'Advanced purification for consumption'}
            </p>
          </div>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Left Side - Water Uses */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            {activeFilter === null ? 'Loading...' : 
             activeFilter === 'household' ? 'Household Water' : 'Drinking Water'}
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
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
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
              <div className="mt-6 pt-4 border-t border-white/20">
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

      {/* Current Mode Statistics */}
      <div className={`backdrop-blur-sm rounded-xl border-2 p-6 ${
        activeFilter === 'drinking'
          ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30'
          : 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-lg ${
            activeFilter === 'drinking' ? 'bg-cyan-500/20' : 'bg-green-500/20'
          }`}>
            {activeFilter === 'drinking' ? (
              <Droplets className="w-6 h-6 text-cyan-400" />
            ) : (
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {activeFilter === 'drinking' ? 'Drinking Water' : 'Household Water'} Statistics
            </h2>
            <p className={`text-sm ${activeFilter === 'drinking' ? 'text-cyan-300' : 'text-green-300'}`}>
              {activeFilter === 'drinking' ? 'Advanced Purification Mode' : 'Basic Filtration Mode'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Today */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-slate-400">Today</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {(activeFilter === 'drinking' ? totalFlowLiters.today.drinking : totalFlowLiters.today.household).toFixed(2)}
              <span className="text-sm text-slate-400 ml-1">L</span>
            </p>
          </div>

          {/* This Week */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-slate-400">This Week</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {(activeFilter === 'drinking' ? totalFlowLiters.week.drinking : totalFlowLiters.week.household).toFixed(2)}
              <span className="text-sm text-slate-400 ml-1">L</span>
            </p>
          </div>

          {/* This Month */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs text-slate-400">This Month</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {(activeFilter === 'drinking' ? totalFlowLiters.month.drinking : totalFlowLiters.month.household).toFixed(2)}
              <span className="text-sm text-slate-400 ml-1">L</span>
            </p>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
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
    </div>
  );
}