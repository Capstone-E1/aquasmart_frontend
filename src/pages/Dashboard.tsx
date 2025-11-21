import { useState, useEffect } from 'react';
import { MetricCard } from '../components/MetricCard';
import { GaugeChart } from '../components/GaugeChart';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useSensorData } from '../hooks/useSensorData';
import { apiService } from '../services/api';
import { Card } from '../components';
import { useNavigate } from 'react-router-dom';


// Water facts data with categories
const waterFacts = {
  healthFacts: {
    category: 'Health Facts',
    facts: [
      'Do you know? The "2 liters per day" rule is a myth — your hydration needs depend on your diet, activity, and environment. But in most cases, more water is better than less!',
      'On a hot day above 30 °C, you should drink at least 500 mL more water than usual to make up for sweat loss.',
      'Nearly 70% of the human body is made of water — even a 2% loss in body water can affect concentration and physical performance.',
      'Clean household water matters too — metals and residues in tap water can stay on dishes, laundry, and even your skin.',
      'Boiling water removes bacteria but not heavy metals or chemicals — filtration bridges that gap.',
      'Long-term exposure to heavy metals in water can cause neurological and developmental problems — zeolite filtration helps remove them safely.',
      'Filtered water extends the lifespan of home appliances like kettles, washing machines, and irons by reducing scale.',
      'Your skin absorbs chlorine and metals during showers — filtering household water benefits skin and hair health.',
      'Filtered water in cooking preserves flavor and nutritional value, especially in soups and rice.',
      'Pure water is not only for drinking — it\'s for better cooking, cleaner homes, healthier lives, and a sustainable planet.',
    ]
  },
  sensorInsights: {
    category: 'Sensor Insights',
    facts: [
      'Turbidity, or "cloudiness," indicates the presence of suspended particles. Clear-looking water isn\'t always clean — microbes can still lurk invisibly.',
      'A TDS (Total Dissolved Solids) value above 500 ppm means the water may taste salty or metallic — filtration helps restore its freshness.',
      'Ideal drinking water has a pH of 6.5–8.5 — too acidic or too alkaline water can corrode pipes and affect taste.',
      'Even if water looks clear, it may still contain invisible chemical contaminants — sensors like TDS and pH can reveal hidden risks.',
      'High TDS can come from natural minerals — but when values rise too high, it can mean industrial or sewage contamination.',
      'Smart water systems can track pH and TDS to predict when filters need replacement — reducing guesswork and maintenance costs.',
      'Household water with a pH below 6 can corrode pipes, releasing lead — sensors and filtration safeguard plumbing.',
      'Using smart sensors allows you to detect abnormalities before they affect your family — real-time pH and TDS data keeps you informed.',
      'The turbidity sensor in AquaSmart mimics industrial water treatment monitoring, bringing lab-level precision to your home.',
      'Safe pH and low turbidity help ensure effective UV sterilization — a synergy that AquaSmart manages automatically.',
    ]
  },
  filtrationFacts: {
    category: 'Water Filtration 101',
    facts: [
      'Zeolite, a natural mineral, traps heavy metals like lead and copper, protecting you from long-term exposure risks.',
      'Activated charcoal removes chlorine, organic residues, and pesticides — giving water a neutral taste and natural purity.',
      'Silica sand acts as the first defense, catching mud and sediment — it\'s like a "rough filter" that keeps the rest of your system clean.',
      'UV filtration destroys microorganisms such as E. coli and viruses without adding chemicals — a clean and green disinfection method.',
      'Water hardness (high calcium and magnesium) can cause scale buildup on faucets and reduce soap efficiency.',
      'Turbid or cloudy water can reduce UV disinfection efficiency — pre-filtration using sand or carbon is essential.',
      'The World Health Organization recommends keeping turbidity below 5 NTU for safe drinking water.',
      'Each time you wash dishes, trace metals and soap residues can cling to your plates — filtration minimizes these residues for safer reuse.',
      'Using filtered water for laundry preserves fabric color and texture — minerals in hard water wear down fibers faster.',
      'Chlorine in tap water kills bacteria but can leave harmful by-products called trihalomethanes (THMs); activated carbon removes them effectively.',
      'Even small leaks in pipes can let contaminants in — smart monitoring of water quality ensures early detection.',
      'Rainwater is naturally soft but can pick up pollutants as it falls — filtering rain-harvested water makes it safe for use.',
      'A UV filter can kill 99.99% of bacteria — but always pair it with a prefilter for maximum safety.',
      'Filter changes are crucial — a dirty filter can harbor bacteria and reduce flow efficiency.',
      'Using multi-layer natural filters like charcoal, zeolite, and sand mimics the Earth\'s own purification process underground.',
      'Some bottled waters contain more microplastics than tap water — home filtration helps you cut both cost and waste.',
      'Heavy rain or floods can spike turbidity and bacterial content in local wells — filtration keeps your supply stable.',
      'Water left standing for long periods can develop biofilms — regular flow and smart monitoring prevent bacterial buildup.',
      'Zeolite not only filters heavy metals but also balances ammonium and hardness ions, improving taste and clarity.',
      'Using a centralized filtration system in villages cuts maintenance cost per household while improving public hygiene.',
      'IoT monitoring empowers communities in remote areas to track water quality even from their phones — a leap for equal access.',
    ]
  },
};

// Flatten all facts into one array with category info
const allFacts = [
  ...waterFacts.healthFacts.facts.map(fact => ({ text: fact, category: waterFacts.healthFacts.category })),
  ...waterFacts.sensorInsights.facts.map(fact => ({ text: fact, category: waterFacts.sensorInsights.category })),
  ...waterFacts.filtrationFacts.facts.map(fact => ({ text: fact, category: waterFacts.filtrationFacts.category })),
];

export function Dashboard() {
  const { latestData, dailyAnalytics, worstValues, isLoading, error, refetch } = useSensorData();
  const navigate = useNavigate();
  const [totalFlowLiters, setTotalFlowLiters] = useState<{
    today: number;
    week: number;
    month: number;
    readings: number;
  }>({
    today: 0,
    week: 0,
    month: 0,
    readings: 0,
  });
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-rotate facts every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentFactIndex((prev) => (prev + 1) % allFacts.length);
        setIsAnimating(false);
      }, 300);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Function to manually refresh fact
  const refreshFact = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentFactIndex((prev) => (prev + 1) % allFacts.length);
      setIsAnimating(false);
    }, 300);
  };

  // Fetch flow statistics
  useEffect(() => {
    const fetchFlowStats = async () => {
      try {
        const status = await apiService.getFilterStatus();
        
        if (status.statistics) {
          setTotalFlowLiters({
            today: status.statistics.today?.total_liters || 0,
            week: status.statistics.this_week?.total_liters || 0,
            month: status.statistics.this_month?.total_liters || 0,
            readings: status.statistics.today?.total_readings || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching flow statistics:', error);
      }
    };

    fetchFlowStats();
    // Poll every 5 seconds
    const interval = setInterval(fetchFlowStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton variant="page" />;
  }

  // Get status for each parameter
  const phStatus = latestData ? apiService.getParameterStatus('ph', latestData.ph) : 'normal';
  const turbidityStatus = latestData ? apiService.getParameterStatus('turbidity', latestData.turbidity) : 'normal';
  const tdsStatus = latestData ? apiService.getParameterStatus('tds', latestData.tds) : 'normal';

  // Status messages for charts
  const getStatusMessage = (type: string, status: string) => {
    const messages = {
      normal: `The ${type} level is within normal limits.`,
      warning: `The ${type} level requires attention.`,
      danger: `The ${type} level is critical!`
    };
    return {
      message: messages[status as keyof typeof messages] || messages.normal,
  };
  };

  if (error) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-800 dark:text-slate-300 text-sm lg:text-base">Monitor your filtration water quality</p>
        </div>
        <div className="bg-red-500/20 backdrop-blur-lg border border-red-400/40 rounded-lg shadow-lg p-4">
          <p className="text-red-300">Error loading sensor data: {error}</p>
          <p className="text-sm text-slate-800 dark:text-slate-300 mt-2">Please check if the backend server is running and properly configured in .env file</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-slate-900 dark:text-white text-sm lg:text-base">Monitor your filtration water quality</p>
          {latestData && (
            <p className="text-xs text-slate-900 dark:text-white mt-1">
              Last data sensor updated: {new Date(latestData.timestamp).toLocaleString('id-ID')}
            </p>
          )}
        </div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="space-y-4 lg:space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              {!latestData ? (
                <>
                  <LoadingSkeleton variant="card" />
                  <LoadingSkeleton variant="card" />
                  <LoadingSkeleton variant="card" />
                </>
              ) : (
                <>
                  <MetricCard
                    title="pH Level"
                    value={latestData.ph.toFixed(1)}
                    color="purple"
                    status={phStatus}
                    isBest={phStatus === 'normal'}
                  />
                  <MetricCard
                    title="Turbidity Level"
                    value={latestData.turbidity.toFixed(2)}
                    color="red"
                    status={turbidityStatus}
                    isBest={turbidityStatus === 'normal'}
                  />
                  <MetricCard
                    title="TDS Value"
                    value={latestData.tds.toString()}
                    color="green"
                    status={tdsStatus}
                    isBest={tdsStatus === 'normal'}
                  />
                </>
              )}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {!latestData ? (
              <>
                <LoadingSkeleton variant="chart" />
                <LoadingSkeleton variant="chart" />
                <LoadingSkeleton variant="chart" />
              </>
            ) : (
              <>
                {/* PH Level Chart */}
                <GaugeChart
                  title="PH Level"
                  value={latestData.ph}
                  maxValue={14}
                  color="purple"
                  status={getStatusMessage('pH', phStatus).message}
                />

                {/* Turbidity Chart */}
                <GaugeChart
                  title="Turbidity Level"
                  value={latestData.turbidity}
                  maxValue={10}
                  color="red"
                  status={getStatusMessage('turbidity', turbidityStatus).message}
                />

                {/* TDS Chart */}
                <GaugeChart
                  title="TDS Value"
                  value={latestData.tds}
                  maxValue={1000}
                  color="green"
                  status={getStatusMessage('TDS', tdsStatus).message}
                />
              </>
            )}
          </div>
        </div>

        <div>
          <Card
            title="Start Your Water Filtration"
            description="Keep your water clean and safe with UV filtration. Monitor and control your filtration system in real-time for optimal water quality."
            className="h-full min-h-[500px] flex flex-col justify-between p-8 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 text-white shadow-2xl border border-blue-500/20"
          >
            <div className="flex-1 flex flex-col justify-center items-center space-y-8">
              <div className="w-24 h-24 bg-blue-500/30 backdrop-blur-md rounded-full flex items-center justify-center ring-4 ring-blue-400/40 shadow-lg">
                <svg className="w-12 h-12 text-blue-300 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              {/* Features */}
              <div className="grid grid-cols-2 gap-4 w-full mt-6">
                <div className="bg-blue-500/20 backdrop-blur-lg rounded-xl p-4 text-center border border-blue-400/30 shadow-xl">
                  <p className="text-2xl font-bold text-blue-200 drop-shadow-md">UV</p>
                  <p className="text-xs text-blue-300/90">Sterilization</p>
                </div>
                <div className="bg-indigo-500/20 backdrop-blur-lg rounded-xl p-4 text-center border border-indigo-400/30 shadow-xl">
                  <p className="text-2xl font-bold text-indigo-200 drop-shadow-md">Safe</p>
                  <p className="text-xs text-indigo-300/90">Water Quality</p>
                </div>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="flex flex-col items-center space-y-3 mt-8">
              <button 
                onClick={() => navigate('/filter-uv')}
                className="w-full px-8 py-4 bg-blue-500/30 backdrop-blur-md text-white font-bold text-lg rounded-xl border-2 border-blue-400/50 hover:bg-blue-500/40 hover:scale-105 transform transition-all duration-200 shadow-xl"
              >
                Start UV Filtration
              </button>
              <p className="text-sm text-blue-200/90 drop-shadow">Begin filtering your water now</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Water Facts Card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-slate-800 dark:text-white font-semibold text-lg">Did You Know?</h3>
                <p className="text-xs text-blue-300">{allFacts[currentFactIndex].category}</p>
              </div>
            </div>
            
            <button
              onClick={refreshFact}
              className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all duration-300 hover:scale-105 group"
              title="Next fact"
            >
              <span className="text-xs text-gray-300 group-hover:text-blue-200 font-medium whitespace-nowrap">
                Get to know more
              </span>
            </button>
          </div>

          <div 
            className={`bg-white/5 backdrop-blur-sm rounded-lg p-5 border border-white/20 transition-all duration-300 ${
              isAnimating ? 'opacity-0 scale-95 rotate-y-90' : 'opacity-100 scale-100 rotate-y-0'
            }`}
            style={{
              transformStyle: 'preserve-3d',
              transition: 'all 0.3s ease-in-out'
            }}
          >
            <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
              {allFacts[currentFactIndex].text}
            </p>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === Math.floor((currentFactIndex / allFacts.length) * 5)
                      ? 'w-8 bg-blue-400'
                      : 'w-2 bg-slate-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400">
              {currentFactIndex + 1} / {allFacts.length}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Best & Worst Values */}
      <div className="space-y-4">
        <h2 className="text-lg lg:text-xl font-semibold text-black dark:text-white">Today's Performance</h2>
        
        {!dailyAnalytics ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="card" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-4 lg:p-6">
              <h3 className="text-black dark:text-white font-medium text-base mb-4 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                Daily Summary
              </h3>
              <div className="space-y-3">
                <p className="text-slate-800 dark:text-slate-300 text-sm">{dailyAnalytics.summary}</p>
                <div className="flex justify-between items-center">
                  <span className="text-slate-800 dark:text-slate-300 text-sm">Overall Quality:</span>
                  <span className={`font-medium px-2 py-1 rounded-md text-xs ${
                    dailyAnalytics.overall_quality === 'Excellent' ? 'bg-green-900 text-green-400' :
                    dailyAnalytics.overall_quality === 'Good' ? 'bg-blue-900 text-blue-400' :
                    dailyAnalytics.overall_quality === 'Fair' ? 'bg-yellow-900 text-yellow-400' :
                    'bg-red-900 text-red-400'
                  }`}>
                    {dailyAnalytics.overall_quality}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-800 dark:text-slate-300 text-sm">Total Readings:</span>
                  <span className="font-medium text-cyan-400">{dailyAnalytics.total_readings}</span>
                </div>
              </div>
            </div>

            {/* Water Flow Statistics */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-4 lg:p-6">
              <h3 className="text-black dark:text-white font-medium text-base mb-4 flex items-center">
                <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                Water Flow Statistics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* Today */}
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-slate-900 dark:text-white">Today</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {totalFlowLiters.today.toFixed(2)}
                    <span className="text-sm text-slate-900 dark:text-white ml-1">L</span>
                  </p>
                  <p className="text-xs text-blue-400 mt-1">Total Water</p>
                </div>

                {/* This Week */}
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-slate-900 dark:text-white">This Week</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {totalFlowLiters.week.toFixed(2)}
                    <span className="text-sm text-slate-900 dark:text-white ml-1">L</span>
                  </p>
                  <p className="text-xs text-green-400 mt-1">Total Water</p>
                </div>

                {/* This Month */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-xs text-slate-900 dark:text-white">This Month</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {totalFlowLiters.month.toFixed(2)}
                    <span className="text-sm text-slate-900 dark:text-white ml-1">L</span>
                  </p>
                  <p className="text-xs text-purple-400 mt-1">Total Water</p>
                </div>

                {/* Total Readings */}
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs text-slate-900 dark:text-white">Readings</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {totalFlowLiters.readings}
                  </p>
                  <p className="text-xs text-cyan-400 mt-1">Data Points</p>
                </div>
              </div>
            </div>

            {/* Best/Worst Values Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Best Values */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-4 lg:p-6">
                <h3 className="text-black dark:text-white font-medium text-base mb-4 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Best Values Today
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-800 dark:text-slate-300 text-sm">pH:</span>
                    <span className="font-medium text-green-400">
                      {dailyAnalytics.best_ph?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-800 dark:text-slate-300 text-sm">Turbidity:</span>
                    <span className="font-medium text-green-400">
                      {dailyAnalytics.best_turbidity?.toFixed(2) || 'N/A'} NTU
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-800 dark:text-slate-300 text-sm">TDS:</span>
                    <span className="font-medium text-green-400">
                      {dailyAnalytics.best_tds || 'N/A'} ppm
                    </span>
                  </div>
                </div>
              </div>

              {/* Worst Values */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-4 lg:p-6">
                <h3 className="text-black dark:text-white font-medium text-base mb-4 flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Worst Values Today
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-800 dark:text-slate-300 text-sm">pH:</span>
                    <span className="font-medium text-red-400">
                      {worstValues.worst_ph?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-800 dark:text-slate-300 text-sm">Turbidity:</span>
                    <span className="font-medium text-red-400">
                      {worstValues.worst_turbidity?.toFixed(2) || 'N/A'} NTU
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-800 dark:text-slate-300 text-sm">TDS:</span>
                    <span className="font-medium text-red-400">
                      {worstValues.worst_tds || 'N/A'} ppm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
