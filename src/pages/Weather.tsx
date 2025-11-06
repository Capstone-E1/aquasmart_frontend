import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  Droplets,
  Gauge,
  MapPin,
  RefreshCw,
  AlertCircle,
  Calendar,
  ThermometerSun,
  Waves,
  CheckCircle,
  CalendarPlus,
} from 'lucide-react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart, Bar } from 'recharts';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useGeolocation } from '../hooks/useGeolocation';
import { useWeather } from '../hooks/useWeather';
import { apiService } from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';
import type { OpenWeatherForecastResponse } from '../types/weather';

export function Weather() {
  const navigate = useNavigate();
  const { coordinates, error: locationError, isLoading: locationLoading, refetch: refetchLocation } = useGeolocation();
  const { weatherData, isLoading: weatherLoading, error: weatherError, refetch: refetchWeather, isRaining } = useWeather({
    latitude: coordinates?.latitude,
    longitude: coordinates?.longitude,
    autoFetch: !!coordinates,
  });
  
  const { addNotification } = useNotifications();
  const [autoScheduleEnabled, setAutoScheduleEnabled] = useState(false);
  const [scheduleCreated, setScheduleCreated] = useState(false);
  const [forecastData, setForecastData] = useState<OpenWeatherForecastResponse | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [creatingSchedule, setCreatingSchedule] = useState(false);

  // Fetch forecast data when coordinates are available
  useEffect(() => {
    const fetchForecast = async () => {
      if (!coordinates?.latitude || !coordinates?.longitude) return;

      try {
        setForecastLoading(true);
        const data = await apiService.getWeatherForecast(coordinates.latitude, coordinates.longitude);
        setForecastData(data);
      } catch (error) {
        console.error('Failed to fetch forecast:', error);
      } finally {
        setForecastLoading(false);
      }
    };

    fetchForecast();
  }, [coordinates]);

  // Auto-create schedule when it's raining and auto-schedule is enabled
  useEffect(() => {
    if (isRaining && autoScheduleEnabled && !scheduleCreated && weatherData) {
      handleCreateRainSchedule();
    }
  }, [isRaining, autoScheduleEnabled, scheduleCreated, weatherData]);

  const handleCreateRainSchedule = async () => {
    if (!weatherData) return;

    try {
      // Create a schedule for drinking water filtration
      const now = new Date();
      const startTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
      
      const scheduleData = {
        name: `Rain Auto-Schedule - ${weatherData.name}`,
        filter_mode: 'drinking_water' as const,
        start_time: startTime,
        duration_minutes: 120, // 2 hours
        days_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        is_active: true,
      };

      await apiService.createSchedule(scheduleData);
      
      setScheduleCreated(true);
      
      addNotification({
        type: 'info',
        title: '🌧️ Rain Detected - Schedule Created!',
        message: `Automatic filtration schedule created due to rain in ${weatherData.name}. Running for 2 hours to ensure clean drinking water.`,
        parameter: 'pH',
        value: 0,
      });
    } catch (error) {
      console.error('Failed to create rain schedule:', error);
      addNotification({
        type: 'danger',
        title: 'Schedule Creation Failed',
        message: 'Unable to create automatic filtration schedule. Please create one manually.',
        parameter: 'pH',
        value: 0,
      });
    }
  };

  const handleCreateScheduleAndNavigate = async () => {
    if (!weatherData || creatingSchedule) return;

    try {
      setCreatingSchedule(true);
      
      // Get current day name
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const today = dayNames[new Date().getDay()];
      
      const now = new Date();
      const startTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
      
      const scheduleData = {
        name: `Rain Forecast Schedule - ${weatherData.name}`,
        filter_mode: 'drinking_water' as const,
        start_time: startTime,
        duration_minutes: 120, // 2 hours
        days_of_week: [today], // Only for today
        is_active: true,
      };

      await apiService.createSchedule(scheduleData);
      
      addNotification({
        type: 'info',
        title: '✅ Schedule Created Successfully!',
        message: `Drinking water filtration schedule created for today. Redirecting to Schedules page...`,
        parameter: 'pH',
        value: 0,
      });

      // Navigate to schedules page after a short delay
      setTimeout(() => {
        navigate('/schedules');
      }, 1000);

    } catch (error) {
      console.error('Failed to create schedule:', error);
      addNotification({
        type: 'danger',
        title: 'Schedule Creation Failed',
        message: 'Unable to create filtration schedule. Please try again.',
        parameter: 'pH',
        value: 0,
      });
      setCreatingSchedule(false);
    }
  };

  const getWeatherIcon = () => {
    if (!weatherData?.weather?.[0]) return <Cloud className="w-16 h-16" />;

    const condition = weatherData.weather[0].main.toLowerCase();
    
    switch (condition) {
      case 'clear':
        return <Sun className="w-16 h-16 text-yellow-400" />;
      case 'clouds':
        return <Cloud className="w-16 h-16 text-slate-400" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="w-16 h-16 text-blue-400" />;
      case 'snow':
        return <CloudSnow className="w-16 h-16 text-blue-200" />;
      case 'thunderstorm':
        return <CloudRain className="w-16 h-16 text-purple-400" />;
      default:
        return <Cloud className="w-16 h-16 text-slate-400" />;
    }
  };

  const handleRefresh = () => {
    refetchLocation();
    if (coordinates) {
      refetchWeather();
    }
  };

  // Process forecast data for 24-hour chart
  const get24HourForecast = () => {
    if (!forecastData?.list) return [];

    // Get next 24 hours (8 items * 3 hours = 24 hours)
    const next24Hours = forecastData.list.slice(0, 8);

    return next24Hours.map(item => {
      const date = new Date(item.dt * 1000);
      const hour = date.getHours();
      
      return {
        time: `${String(hour).padStart(2, '0')}:00`,
        hour: hour,
        temp: Math.round(item.main.temp),
        rainProbability: Math.round(item.pop * 100), // Convert to percentage
        rainVolume: item.rain?.['3h'] || 0,
        humidity: item.main.humidity,
        condition: item.weather[0].main,
        icon: item.weather[0].icon,
      };
    });
  };

  if (locationLoading || (weatherLoading && !weatherData)) {
    return <LoadingSkeleton variant="page" />;
  }

  if (locationError) {
    return (
      <div className="space-y-4 lg:space-y-6">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">Weather Condition</h1>
            <p className="text-slate-400 text-sm lg:text-base">Real-time weather monitoring for smart water filtration</p>
          </div>
          
          <div className="bg-yellow-500/20 backdrop-blur-2xl border border-yellow-400/40 rounded-xl p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="text-yellow-400 font-semibold text-lg mb-2">Location Access Required</h3>
                <p className="text-slate-300 mb-4">{locationError}</p>
                <button
                  onClick={refetchLocation}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Request Location Access
                </button>
              </div>
            </div>
          </div>
      </div>
    );
  }

  if (weatherError) {
    return (
      <div className="space-y-4 lg:space-y-6">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">Weather Condition</h1>
            <p className="text-slate-400 text-sm lg:text-base">Real-time weather monitoring for smart water filtration</p>
          </div>
          
          <div className="bg-red-500/20 backdrop-blur-2xl border border-red-400/40 rounded-xl p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
              <div>
                <h3 className="text-red-400 font-semibold text-lg mb-2">Weather Data Error</h3>
                <p className="text-slate-300 mb-4">{weatherError}</p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
              </div>
            </div>
          </div>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <div className="space-y-4 lg:space-y-6">
        {/* Page Title */}
        <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">Weather Condition</h1>
          <p className="text-slate-400 text-sm lg:text-base">
            Real-time weather monitoring for smart water filtration
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={weatherLoading}
          className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${weatherLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Rain Alert */}
      {isRaining && (
        <div className="bg-blue-500/20 backdrop-blur-lg border-2 border-blue-500/40 rounded-xl p-6 animate-pulse shadow-2xl">
          <div className="flex items-start gap-4">
            <CloudRain className="w-10 h-10 text-blue-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-blue-400 font-bold text-lg mb-2">🌧️ Rain Detected!</h3>
              <p className="text-slate-300 mb-4">
                It's currently raining in {weatherData.name}. Rainwater may affect your water quality and increase turbidity.
                Consider running the drinking water filtration mode.
              </p>
              
              {/* Auto-Schedule Toggle */}
              <div className="bg-slate-800/30 backdrop-blur-lg rounded-lg p-4 mb-4 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">Auto-Create Filtration Schedule</p>
                      <p className="text-xs text-slate-400">Automatically run filtration when rain is detected</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoScheduleEnabled}
                      onChange={(e) => setAutoScheduleEnabled(e.target.checked)}
                      className="sr-only peer"
                      disabled={scheduleCreated}
                    />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {scheduleCreated && (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Schedule created successfully!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Weather Card */}
      <div className="bg-gradient-to-br from-blue-900/25 via-cyan-900/20 to-purple-900/25 backdrop-blur-lg rounded-2xl border border-blue-400/30 p-6 lg:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Weather Icon and Temp */}
          <div className="text-center">
            {getWeatherIcon()}
            <div className="mt-4">
              <div className="text-5xl font-bold text-white">
                {Math.round(weatherData.main.temp)}°C
              </div>
              <div className="text-slate-300 capitalize mt-2">
                {weatherData.weather[0].description}
              </div>
            </div>
          </div>

          {/* Location and Details */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">
                {weatherData.name}, {weatherData.sys.country}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 text-slate-300 mb-1">
                  <ThermometerSun className="w-4 h-4" />
                  <span className="text-xs">Feels Like</span>
                </div>
                <div className="text-xl font-semibold text-white">
                  {Math.round(weatherData.main.feels_like)}°C
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 text-slate-300 mb-1">
                  <Droplets className="w-4 h-4" />
                  <span className="text-xs">Humidity</span>
                </div>
                <div className="text-xl font-semibold text-white">
                  {weatherData.main.humidity}%
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 text-slate-300 mb-1">
                  <ThermometerSun className="w-4 h-4" />
                  <span className="text-xs">Feels Like</span>
                </div>
                <div className="text-xl font-semibold text-white">
                  {weatherData.main.feels_like}°C
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Gauge className="w-4 h-4" />
                  <span className="text-xs">Pressure</span>
                </div>
                <div className="text-xl font-semibold text-white">
                  {weatherData.main.pressure} hPa
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Parameters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Temperature Details */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 shadow-2xl">
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <ThermometerSun className="w-5 h-5 text-orange-400" />
            Temperature Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Current</span>
              <span className="text-white font-semibold">{weatherData.main.temp.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Feels Like</span>
              <span className="text-white font-semibold">{weatherData.main.feels_like.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Minimum</span>
              <span className="text-white font-semibold">{weatherData.main.temp_min.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Maximum</span>
              <span className="text-white font-semibold">{weatherData.main.temp_max.toFixed(1)}°C</span>
            </div>
          </div>
        </div>

        {/* Atmospheric Conditions */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 shadow-2xl">
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <Waves className="w-5 h-5 text-blue-400" />
            Atmospheric Conditions
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Pressure</span>
              <span className="text-white font-semibold">{weatherData.main.pressure} hPa</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Humidity</span>
              <span className="text-white font-semibold">{weatherData.main.humidity}%</span>
            </div>
            {weatherData.main.sea_level && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Sea Level Pressure</span>
                <span className="text-white font-semibold">{weatherData.main.sea_level} hPa</span>
              </div>
            )}
            {weatherData.main.grnd_level && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Ground Level Pressure</span>
                <span className="text-white font-semibold">{weatherData.main.grnd_level} hPa</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 24-Hour Rain Forecast */}
      {forecastData && !forecastLoading && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <CloudRain className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-white font-semibold text-lg">24-Hour Rain Forecast</h3>
              <p className="text-slate-400 text-sm">Probability of precipitation and rain volume</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={get24HourForecast()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                yAxisId="left"
                stroke="#3B82F6"
                label={{ value: 'Rain %', angle: -90, position: 'insideLeft', fill: '#3B82F6' }}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#60A5FA"
                label={{ value: 'Volume (mm)', angle: 90, position: 'insideRight', fill: '#60A5FA' }}
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.7)', 
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '12px',
                  color: '#F1F5F9',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}
                labelStyle={{ color: '#CBD5E1' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              
              {/* Rain Probability Line */}
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="rainProbability" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Rain Probability (%)"
              />
              
              {/* Rain Volume Bars */}
              <Bar 
                yAxisId="right"
                dataKey="rainVolume" 
                fill="#60A5FA"
                opacity={0.6}
                name="Rain Volume (mm)"
                radius={[8, 8, 0, 0]}
              />
              
              {/* Temperature Area */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="temp"
                fill="#F59E0B"
                stroke="#F59E0B"
                fillOpacity={0.1}
                strokeWidth={2}
                name="Temperature (°C)"
              />
            </ComposedChart>
          </ResponsiveContainer>

          {/* Rain alerts */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {get24HourForecast().filter(item => item.rainProbability > 50).length > 0 && (
              <div className="bg-blue-500/20 backdrop-blur-xl border border-blue-400/40 rounded-lg p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-blue-300" />
                  <span className="text-sm font-medium text-blue-200">
                    High rain probability in next 24 hours
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {get24HourForecast().filter(item => item.rainProbability > 50).length} time periods with {'>'}50% rain chance
                </p>
              </div>
            )}
            
            {get24HourForecast().some(item => item.rainVolume > 0) && (
              <div className="bg-cyan-500/20 backdrop-blur-xl border border-cyan-400/40 rounded-lg p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-300" />
                  <span className="text-sm font-medium text-cyan-200">
                    Expected rainfall detected
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Total: {get24HourForecast().reduce((sum, item) => sum + item.rainVolume, 0).toFixed(1)} mm in 24h
                </p>
              </div>
            )}
          </div>

          {/* Create Schedule Button - Only show if rain is expected today */}
          {get24HourForecast().some(item => item.rainProbability > 30) && (
            <div className="mt-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-lg border border-blue-400/40 rounded-xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <CalendarPlus className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-white font-semibold text-lg mb-1">
                      Rain Expected Today
                    </h4>
                    <p className="text-slate-300 text-sm">
                      Create a drinking water filtration schedule to ensure clean water quality during rainfall.
                    </p>
                    <p className="text-slate-400 text-xs mt-2">
                      Schedule will run for 2 hours starting now
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCreateScheduleAndNavigate}
                  disabled={creatingSchedule}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap shadow-lg"
                >
                  {creatingSchedule ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5" />
                      Create Schedule
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
