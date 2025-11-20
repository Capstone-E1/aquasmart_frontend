// API service for AquaSmart backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export interface SensorData {
  device_id: string;
  timestamp: string;
  filter_mode: string;
  flow: number;
  ph: number;
  turbidity: number;
  tds: number;
}

export interface NormalizedSensorData extends SensorData {
  normalized: {
    ph: number;        // 0 = good, 1 = bad
    turbidity: number; // 0 = good, 1 = bad
    tds: number;       // 0 = good, 1 = bad
  };
}

export interface ApiResponse {
  success: boolean;
  data: SensorData[];
}

export interface DailyAnalytics {
  date: string;
  filter_mode: string;
  best_ph: number;
  best_tds: number;
  best_turbidity: number;
  best_flow: number;
  total_readings: number;
  overall_quality: string;
  summary: string;
}

export interface WorstDailyValues {
  date: string;
  worst_ph: number;
  worst_tds: number;
  worst_turbidity: number;
  total_readings: number;
}

export interface DailyAnalyticsResponse {
  success: boolean;
  data: DailyAnalytics;
}

export interface Schedule {
  id: number;
  name: string;
  filter_mode: 'household_water' | 'drinking_water';
  start_time: string;
  duration_minutes: number;
  days_of_week: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduleResponse {
  schedule: Schedule;
  next_execution: string | null;
}

export interface CreateScheduleData {
  name: string;
  filter_mode: string;
  start_time: string;
  duration_minutes: number;
  days_of_week: string[];
  is_active: boolean;
}

// ML Feature Interfaces
export interface Anomaly {
  id: number;
  device_id: string;
  timestamp: string;
  parameter_type: string;
  value: number;
  anomaly_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  z_score: number;
  is_resolved: boolean;
  is_false_positive: boolean;
  resolved_at?: string;
  created_at: string;
}

export interface AnomalyStats {
  total_anomalies: number;
  last_24_hours: number;
  last_7_days: number;
  by_severity: Record<string, number>;
  by_type: Record<string, number>;
  by_metric: Record<string, number>;
  false_positive_rate: number;
  most_affected_device: string;
}

export interface FilterHealth {
  id?: number;
  device_id: string;
  filter_mode: string;
  health_score: number;
  predicted_days_remaining: number;
  estimated_replacement: string;
  current_efficiency: number;
  average_efficiency: number;
  efficiency_trend: string;
  turbidity_reduction: number;
  tds_reduction: number;
  ph_stabilization: number;
  total_flow_processed?: number;
  filter_age_days?: number;
  maintenance_required: boolean;
  replacement_urgent: boolean;
  recommendations: string[];
  last_calculated: string;
  created_at?: string;
  updated_at?: string;
}

export interface SensorBaseline {
  device_id: string;
  parameter_type: string;
  mean: number;
  std_dev: number;
  min: number;
  max: number;
  sample_count: number;
  last_updated: string;
}

export interface MLDashboard {
  anomalies: {
    recent: Anomaly[] | null;
    stats: AnomalyStats;
    unresolved: Anomaly[] | null;
    unresolved_count: number;
  };
  filter_health: FilterHealth;
  system_status: {
    last_updated: string;
    ml_features_enabled: boolean;
  };
}

class ApiService {
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  async getLatestSensorData(): Promise<SensorData | null> {
    try {
      console.log('API: Fetching latest sensor data from:', `${API_BASE_URL}/sensors/latest`);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/sensors/latest`);
      
      if (!response.ok) {
        console.error('API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      console.log('API: Received latest data response:', data);
      
      if (data.success && data.data && data.data.length > 0) {
        // Sort by timestamp to get the most recent data (descending order)
        const sortedData = [...data.data].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        const latestSensorData = sortedData[0];
        console.log('API: Returning latest sensor data (most recent):', latestSensorData);
        return latestSensorData;
      }
      
      console.log('API: No latest data available');
      return null;
    } catch (error) {
      console.error('Error fetching latest sensor data:', error);
      throw error;
    }
  }

  async getAllSensorData(): Promise<SensorData[]> {
    try {
      console.log('API: Fetching all sensor data from:', `${API_BASE_URL}/sensors/latest`);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/sensors/latest`);
      
      if (!response.ok) {
        console.error('API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      console.log('API: Received all data response:', data);
      
      if (data.success && data.data) {
        // Sort by timestamp (newest first) for historical display
        const sortedData = [...data.data].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        console.log('API: Returning all sensor data array with', sortedData.length, 'items (sorted by timestamp)');
        return sortedData;
      }
      
      console.log('API: No sensor data array available');
      return [];
    } catch (error) {
      console.error('Error fetching all sensor data:', error);
      throw error;
    }
  }

  // Helper method to format timestamp
  formatTimestamp(timestamp: string): { date: string; time: string } {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('id-ID'),
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
  }

  // Normalize raw sensor values to 0-1 scale where 0 = good, 1 = bad/dangerous
  normalizeParameter(type: 'ph' | 'turbidity' | 'tds', rawValue: number): number {
    switch (type) {
      case 'ph': {
        // Optimal pH is 7.0, range 6.5-8.5 is normal
        // Map: 7.0 -> 0, values outside 6.5-8.5 approach 1
        const optimalPH = 7.0;
        const normalMin = 6.5;
        const normalMax = 8.5;
        const dangerMin = 5.0;
        const dangerMax = 10.0;

        if (rawValue >= normalMin && rawValue <= normalMax) {
          // Within normal range, calculate distance from optimal
          const distanceFromOptimal = Math.abs(rawValue - optimalPH);
          const maxNormalDistance = Math.max(optimalPH - normalMin, normalMax - optimalPH);
          return (distanceFromOptimal / maxNormalDistance) * 0.3; // 0 to 0.3 for normal range
        } else if (rawValue < normalMin) {
          // Below normal range
          const distance = normalMin - rawValue;
          const maxDistance = normalMin - dangerMin;
          return 0.3 + (distance / maxDistance) * 0.7; // 0.3 to 1.0
        } else {
          // Above normal range
          const distance = rawValue - normalMax;
          const maxDistance = dangerMax - normalMax;
          return 0.3 + (distance / maxDistance) * 0.7; // 0.3 to 1.0
        }
      }

      case 'turbidity': {
        // Turbidity: 0 NTU is best, 1000 NTU is maximum
        // Optimal: 0-1 NTU (0-0.1 normalized)
        // Normal: 0-5 NTU (0-0.3 normalized)
        // Warning: 5-50 NTU (0.3-0.7 normalized)
        // Danger: 50+ NTU (0.7-1.0 normalized)
        const maxTurbidity = 1000;
        const normalThreshold = 5;
        const warningThreshold = 50;

        if (rawValue <= normalThreshold) {
          return (rawValue / normalThreshold) * 0.3;
        } else if (rawValue <= warningThreshold) {
          const progress = (rawValue - normalThreshold) / (warningThreshold - normalThreshold);
          return 0.3 + progress * 0.4;
        } else {
          const progress = Math.min((rawValue - warningThreshold) / (maxTurbidity - warningThreshold), 1.0);
          return 0.7 + progress * 0.3;
        }
      }

      case 'tds': {
        // TDS: Optimal 300-600 PPM
        // Too low (<150) or too high (>1000) is bad
        const optimalMin = 300;
        const optimalMax = 600;
        const normalMin = 150;
        const normalMax = 1000;
        const dangerMin = 0;
        const dangerMax = 2000;

        if (rawValue >= optimalMin && rawValue <= optimalMax) {
          // Within optimal range
          return 0; // Perfect
        } else if (rawValue >= normalMin && rawValue < optimalMin) {
          // Below optimal but within normal
          const distance = optimalMin - rawValue;
          const maxDistance = optimalMin - normalMin;
          return (distance / maxDistance) * 0.3;
        } else if (rawValue > optimalMax && rawValue <= normalMax) {
          // Above optimal but within normal
          const distance = rawValue - optimalMax;
          const maxDistance = normalMax - optimalMax;
          return (distance / maxDistance) * 0.3;
        } else if (rawValue < normalMin) {
          // Below normal range
          const distance = normalMin - rawValue;
          const maxDistance = normalMin - dangerMin;
          return 0.3 + (distance / maxDistance) * 0.7;
        } else {
          // Above normal range
          const distance = rawValue - normalMax;
          const maxDistance = dangerMax - normalMax;
          return 0.3 + Math.min(distance / maxDistance, 1.0) * 0.7;
        }
      }

      default:
        return 0;
    }
  }

  // Helper method to determine status based on normalized values (0 = good, 1 = bad)
  getParameterStatus(type: 'ph' | 'turbidity' | 'tds', value: number): 'normal' | 'warning' | 'danger' {
    const normalized = this.normalizeParameter(type, value);

    if (normalized <= 0.3) return 'normal';
    if (normalized <= 0.7) return 'warning';
    return 'danger';
  }

  // Get normalized value (0-1 scale where 0 is good, 1 is bad)
  getNormalizedValue(type: 'ph' | 'turbidity' | 'tds', value: number): number {
    return this.normalizeParameter(type, value);
  }

  // Convert raw sensor data to normalized sensor data
  addNormalizedValues(data: SensorData): NormalizedSensorData {
    return {
      ...data,
      normalized: {
        ph: this.normalizeParameter('ph', data.ph),
        turbidity: this.normalizeParameter('turbidity', data.turbidity),
        tds: this.normalizeParameter('tds', data.tds),
      }
    };
  }

  async getDailyAnalytics(): Promise<DailyAnalytics> {
    try {
      console.log('API: Fetching daily analytics from:', `${API_BASE_URL}/sensors/best-daily`);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/sensors/best-daily`);
      
      if (!response.ok) {
        console.error('API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: DailyAnalyticsResponse = await response.json();
      console.log('API: Received daily analytics response:', data);
      
      if (data.success && data.data) {
        console.log('API: Returning daily analytics:', data.data);
        return data.data;
      }
      
      // Return default values if no data
      return {
        date: new Date().toISOString().split('T')[0],
        filter_mode: 'drinking_water',
        best_ph: 7.0,
        best_tds: 400,
        best_turbidity: 0.5,
        best_flow: 2.5,
        total_readings: 0,
        overall_quality: 'No Data',
        summary: 'No data available for today.'
      };
    } catch (error) {
      console.error('Error fetching daily analytics:', error);
      // Return default values on error
      return {
        date: new Date().toISOString().split('T')[0],
        filter_mode: 'drinking_water',
        best_ph: 7.0,
        best_tds: 400,
        best_turbidity: 0.5,
        best_flow: 2.5,
        total_readings: 0,
        overall_quality: 'Error',
        summary: 'Error fetching daily analytics.'
      };
    }
  }

  async getRecentSensorData(limit: number = 20): Promise<SensorData[]> {
    try {
      console.log(`API: Fetching recent ${limit} sensor readings from:`, `${API_BASE_URL}/sensors/recent?limit=${limit}`);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/sensors/recent?limit=${limit}`);
      
      if (!response.ok) {
        console.error('API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      console.log('API: Received recent data response:', data);
      
      if (data.success && data.data) {
        // Data already sorted by timestamp desc from backend
        console.log(`API: Returning recent sensor data array with ${data.data.length} items (pre-sorted by backend)`);
        return data.data;
      }
      
      console.log('API: No recent sensor data available');
      return [];
    } catch (error) {
      console.error('Error fetching recent sensor data:', error);
      throw error;
    }
  }

  async getWorstDailyValues(): Promise<WorstDailyValues> {
    try {
      console.log('API: Fetching worst daily values from:', `${API_BASE_URL}/sensors/worst-daily`);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/sensors/worst-daily`);
      
      if (!response.ok) {
        console.error('API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: { success: boolean; data: WorstDailyValues } = await response.json();
      console.log('API: Received worst daily values response:', data);
      
      if (data.success && data.data) {
        console.log('API: Returning worst daily values');
        return data.data;
      }
      
      // Return default values if no data
      return {
        date: new Date().toISOString().split('T')[0],
        worst_ph: 7.0,
        worst_tds: 400,
        worst_turbidity: 0.5,
        total_readings: 0
      };
    } catch (error) {
      console.error('Error fetching worst daily values:', error);
      // Return default values on error
      return {
        date: new Date().toISOString().split('T')[0],
        worst_ph: 7.0,
        worst_tds: 400,
        worst_turbidity: 0.5,
        total_readings: 0
      };
    }
  }

  // Filter Mode Control Methods
  async sendFilterCommand(mode: 'household_water' | 'drinking_water'): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`API: Sending filter mode command "${mode}" to:`, `${API_BASE_URL}/commands/filter`);
      console.log(`API: Request body:`, { mode });
      
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/commands/filter`, {
        method: 'POST',
        body: JSON.stringify({ mode }),
      });
      
      if (!response.ok) {
        console.error('API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API: Filter mode command response:', data);
      
      return {
        success: true,
        message: data.message || `Filter mode changed to ${mode} successfully`
      };
    } catch (error) {
      console.error(`Error sending filter mode ${mode} command:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send filter mode command'
      };
    }
  }

  // Get current filter mode status from commands/filter endpoint
  async getFilterStatus(): Promise<{ 
    success: boolean; 
    mode: 'household_water' | 'drinking_water'; 
    message?: string;
    filter_mode_duration_seconds?: number;
    filter_mode_started_at?: string;
    filtration_active?: boolean;
    total_flow_liters?: number;
    active_filters?: string[];
    statistics?: {
      today?: {
        total_liters: number;
        household_water_liters: number;
        drinking_water_liters: number;
        total_readings: number;
      };
      this_week?: {
        total_liters: number;
        household_water_liters: number;
        drinking_water_liters: number;
        total_readings: number;
      };
      this_month?: {
        total_liters: number;
        household_water_liters: number;
        drinking_water_liters: number;
        total_readings: number;
      };
    };
  }> {
    try {
      console.log('API: Fetching filter mode status from:', `${API_BASE_URL}/commands/filter`);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/commands/filter`);
      
      if (!response.ok) {
        console.error('API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API: Filter mode status response:', data);
      
      // Response format: { success: true, data: { current_mode: "drinking_water", filter_mode_tracking: {...} } }
      const filterMode = data.data?.current_mode || 'household_water';
      const tracking = data.data?.filter_mode_tracking || {};
      const activeFilters = data.data?.active_filters || [];
      
      return {
        success: true,
        mode: filterMode,
        message: `Current filter mode is ${filterMode}`,
        filter_mode_duration_seconds: tracking.duration_seconds,
        filter_mode_started_at: tracking.started_at,
        filtration_active: data.data?.filtration_active,
        total_flow_liters: tracking.total_flow_liters || 0,
        active_filters: activeFilters,
        statistics: tracking.statistics
      };
    } catch (error) {
      console.error('Error fetching filter mode status:', error);
      return {
        success: false,
        mode: 'household_water',
        message: error instanceof Error ? error.message : 'Failed to fetch filter mode status'
      };
    }
  }

  // Legacy LED methods (deprecated, keeping for backward compatibility)
  async sendLedCommand(command: 'on' | 'off'): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`API: Sending filter mode command "${command}" to:`, `${API_BASE_URL}/sensors/stm32/led`);
      console.log(`API: Request body:`, { action: command });
      
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/sensors/stm32/led`, {
        method: 'POST',
        body: JSON.stringify({ action: command }),
      });
      
      if (!response.ok) {
        console.error('API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API: Filter mode command response:', data);
      
      return {
        success: true,
        message: data.message || `Filter mode ${command} command sent successfully`
      };
    } catch (error) {
      console.error(`Error sending filter mode ${command} command:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send filter mode command'
      };
    }
  }

  // Get current filter mode status
  async getLedStatus(): Promise<{ success: boolean; status: 'on' | 'off'; message?: string }> {
    try {
      console.log('API: Fetching filter mode status from:', `${API_BASE_URL}/sensors/stm32/led`);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/sensors/stm32/led`);
      
      if (!response.ok) {
        console.error('API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Backend returns plain text "on" or "off", not JSON
      const text = await response.text();
      const status = text.trim().toLowerCase() as 'on' | 'off';
      console.log('API: Filter mode status response (plain text):', status);
      
      return {
        success: true,
        status: status === 'on' ? 'on' : 'off',
        message: `Filter mode is ${status}`
      };
    } catch (error) {
      console.error('Error fetching filter mode status:', error);
      return {
        success: false,
        status: 'off',
        message: error instanceof Error ? error.message : 'Failed to fetch filter mode status'
      };
    }
  }

  // Schedule Management Methods
  async getSchedules(activeOnly: boolean = false): Promise<ScheduleResponse[]> {
    try {
      const url = activeOnly ? `${API_BASE_URL}/schedules?active_only=true` : `${API_BASE_URL}/schedules`;
      console.log('API: Fetching schedules from:', url);
      const response = await this.fetchWithTimeout(url);
      
      if (!response.ok) {
        console.error('API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: { success: boolean; data: ScheduleResponse[] } = await response.json();
      console.log('API: Received schedules response:', data);
      
      if (data.success && data.data) {
        return data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  }

  async createSchedule(scheduleData: CreateScheduleData): Promise<Schedule> {
    try {
      console.log('API: Creating schedule with data:', scheduleData);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/schedules`, {
        method: 'POST',
        body: JSON.stringify(scheduleData),
      });
      
      if (!response.ok) {
        console.error('API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: { success: boolean; data: Schedule } = await response.json();
      console.log('API: Schedule created:', data);
      
      return data.data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  }

  async updateSchedule(id: number, scheduleData: Partial<CreateScheduleData>): Promise<Schedule> {
    try {
      console.log('API: Updating schedule', id, 'with data:', scheduleData);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/schedules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(scheduleData),
      });
      
      if (!response.ok) {
        console.error('API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: { success: boolean; data: Schedule } = await response.json();
      console.log('API: Schedule updated:', data);
      
      return data.data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  }

  async deleteSchedule(id: number): Promise<void> {
    try {
      console.log('API: Deleting schedule', id);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/schedules/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        console.error('API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('API: Schedule deleted successfully');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }

  async toggleScheduleStatus(id: number, isActive: boolean): Promise<Schedule> {
    try {
      console.log('API: Toggling schedule', id, 'to', isActive);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/schedules/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: isActive }),
      });
      
      if (!response.ok) {
        console.error('API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: { success: boolean; data: Schedule } = await response.json();
      console.log('API: Schedule status toggled:', data);
      
      return data.data;
    } catch (error) {
      console.error('Error toggling schedule status:', error);
      throw error;
    }
  }

  // Weather API Methods
  async getWeatherByCoordinates(lat: number, lon: number): Promise<any> {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenWeatherMap API key is not configured. Please add VITE_OPENWEATHER_API_KEY to your .env file.');
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      console.log('Weather API: Fetching weather data for coordinates:', { lat, lon });
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Weather API: Received weather data:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  async getWeatherByCity(city: string): Promise<any> {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenWeatherMap API key is not configured. Please add VITE_OPENWEATHER_API_KEY to your .env file.');
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
      console.log('Weather API: Fetching weather data for city:', city);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Weather API: Received weather data:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  // Get 5 day / 3 hour forecast
  async getWeatherForecast(lat: number, lon: number): Promise<any> {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

    if (!apiKey) {
      throw new Error('OpenWeatherMap API key is not configured. Please add VITE_OPENWEATHER_API_KEY to your .env file.');
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      console.log('Weather API: Fetching forecast data for coordinates:', { lat, lon });

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather forecast API error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Weather API: Received forecast data:', data);

      return data;
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      throw error;
    }
  }

  // ML Feature Methods
  async getMLDashboard(): Promise<MLDashboard> {
    try {
      console.log('ML API: Fetching ML dashboard from:', `${API_BASE_URL}/ml/dashboard`);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/ml/dashboard`);

      if (!response.ok) {
        console.error('ML API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MLDashboard = await response.json();
      console.log('ML API: Received ML dashboard response:', data);

      return data;
    } catch (error) {
      console.error('Error fetching ML dashboard:', error);
      throw error;
    }
  }

  async getFilterHealth(deviceId: string = 'filter_system'): Promise<FilterHealth | null> {
    try {
      console.log('ML API: Fetching filter health for device:', deviceId);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/ml/filter/health?device_id=${deviceId}`);

      if (!response.ok) {
        console.error('ML API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('ML API: Received filter health response:', data);

      // Backend returns FilterHealth directly if data exists, or { message: string } if no data
      if (data.message && !data.health_score) {
        console.log('ML API: No filter health data available yet');
        return null;
      }

      return data as FilterHealth;
    } catch (error) {
      console.error('Error fetching filter health:', error);
      throw error;
    }
  }

  async analyzeFilterHealth(deviceId: string = 'filter_system'): Promise<FilterHealth> {
    try {
      console.log('ML API: Triggering filter health analysis for device:', deviceId);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/ml/filter/analyze`, {
        method: 'POST',
        body: JSON.stringify({ device_id: deviceId }),
      });

      if (!response.ok) {
        console.error('ML API: HTTP Error:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: { message: string; health: FilterHealth } = await response.json();
      console.log('ML API: Filter health analysis complete:', data);

      if (data.health) {
        return data.health;
      }

      // If health is not available, throw error with message
      throw new Error(data.message || 'Insufficient data for filter health analysis');
    } catch (error) {
      console.error('Error analyzing filter health:', error);
      throw error;
    }
  }

  async getAnomalies(params?: {
    limit?: number;
    deviceId?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<Anomaly[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.set('limit', params.limit.toString());
      if (params?.deviceId) queryParams.set('device_id', params.deviceId);
      if (params?.severity) queryParams.set('severity', params.severity);

      const url = `${API_BASE_URL}/ml/anomalies${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      console.log('ML API: Fetching anomalies from:', url);

      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        console.error('ML API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: { success: boolean; data: Anomaly[] } = await response.json();
      console.log('ML API: Received anomalies response:', data);

      if (data.success && data.data) {
        return data.data;
      }

      return [];
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      throw error;
    }
  }

  async getUnresolvedAnomalies(): Promise<Anomaly[]> {
    try {
      console.log('ML API: Fetching unresolved anomalies from:', `${API_BASE_URL}/ml/anomalies/unresolved`);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/ml/anomalies/unresolved`);

      if (!response.ok) {
        console.error('ML API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: { success: boolean; data: Anomaly[] } = await response.json();
      console.log('ML API: Received unresolved anomalies response:', data);

      if (data.success && data.data) {
        return data.data;
      }

      return [];
    } catch (error) {
      console.error('Error fetching unresolved anomalies:', error);
      throw error;
    }
  }

  async getAnomalyStats(): Promise<AnomalyStats> {
    try {
      console.log('ML API: Fetching anomaly stats from:', `${API_BASE_URL}/ml/anomalies/stats`);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/ml/anomalies/stats`);

      if (!response.ok) {
        console.error('ML API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: { success: boolean; data: AnomalyStats } = await response.json();
      console.log('ML API: Received anomaly stats response:', data);

      if (data.success && data.data) {
        return data.data;
      }

      throw new Error('Invalid anomaly stats response');
    } catch (error) {
      console.error('Error fetching anomaly stats:', error);
      throw error;
    }
  }

  async resolveAnomaly(anomalyId: number): Promise<void> {
    try {
      console.log('ML API: Resolving anomaly:', anomalyId);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/ml/anomalies/${anomalyId}/resolve`, {
        method: 'POST',
      });

      if (!response.ok) {
        console.error('ML API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('ML API: Anomaly resolved successfully');
    } catch (error) {
      console.error('Error resolving anomaly:', error);
      throw error;
    }
  }

  async markAnomalyFalsePositive(anomalyId: number): Promise<void> {
    try {
      console.log('ML API: Marking anomaly as false positive:', anomalyId);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/ml/anomalies/${anomalyId}/false-positive`, {
        method: 'POST',
      });

      if (!response.ok) {
        console.error('ML API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('ML API: Anomaly marked as false positive successfully');
    } catch (error) {
      console.error('Error marking anomaly as false positive:', error);
      throw error;
    }
  }

  async detectAnomalies(deviceId?: string): Promise<void> {
    try {
      console.log('ML API: Triggering anomaly detection for device:', deviceId || 'all');
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/ml/anomalies/detect`, {
        method: 'POST',
        body: deviceId ? JSON.stringify({ device_id: deviceId }) : undefined,
      });

      if (!response.ok) {
        console.error('ML API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('ML API: Anomaly detection triggered successfully');
    } catch (error) {
      console.error('Error triggering anomaly detection:', error);
      throw error;
    }
  }

  async getBaselines(): Promise<SensorBaseline[]> {
    try {
      console.log('ML API: Fetching baselines from:', `${API_BASE_URL}/ml/baselines`);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/ml/baselines`);

      if (!response.ok) {
        console.error('ML API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: { success: boolean; data: SensorBaseline[] } = await response.json();
      console.log('ML API: Received baselines response:', data);

      if (data.success && data.data) {
        return data.data;
      }

      return [];
    } catch (error) {
      console.error('Error fetching baselines:', error);
      throw error;
    }
  }

  async calculateBaselines(deviceId?: string): Promise<void> {
    try {
      console.log('ML API: Calculating baselines for device:', deviceId || 'all');
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/ml/baselines/calculate`, {
        method: 'POST',
        body: deviceId ? JSON.stringify({ device_id: deviceId }) : undefined,
      });

      if (!response.ok) {
        console.error('ML API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('ML API: Baseline calculation triggered successfully');
    } catch (error) {
      console.error('Error calculating baselines:', error);
      throw error;
    }
  }

  // Delete all sensor data
  async deleteAllSensorData(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('API: Deleting all sensor data from:', `${API_BASE_URL}/sensors/all`);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/sensors/all`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        console.error('API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: { success: boolean; data: { message: string } } = await response.json();
      console.log('API: Delete all sensor data response:', data);

      return {
        success: data.success,
        message: data.data.message || 'All sensor data deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting all sensor data:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete sensor data',
      };
    }
  }
}

export const apiService = new ApiService();