// API service for AquaSmart backend
const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface SensorData {
  device_id: string;
  timestamp: string;
  filter_mode: string;
  flow: number;
  ph: number;
  turbidity: number;
  tds: number;
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

  // Helper method to determine status based on sensor values
  getParameterStatus(type: 'ph' | 'turbidity' | 'tds', value: number): 'normal' | 'warning' | 'danger' {
    switch (type) {
      case 'ph':
        if (value >= 6.5 && value <= 8.5) return 'normal';
        if ((value >= 6.0 && value < 6.5) || (value > 8.5 && value <= 9.0)) return 'warning';
        return 'danger';
      
      case 'turbidity':
        if (value <= 1.0) return 'normal';
        if (value <= 4.0) return 'warning';
        return 'danger';
      
      case 'tds':
        if (value >= 300 && value <= 600) return 'normal';
        if ((value >= 150 && value < 300) || (value > 600 && value <= 1000)) return 'warning';
        return 'danger';
      
      default:
        return 'normal';
    }
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

  // Get current filter mode status from STM32 command endpoint
  async getFilterStatus(): Promise<{ success: boolean; mode: 'household_water' | 'drinking_water'; message?: string }> {
    try {
      console.log('API: Fetching filter mode status from:', `${API_BASE_URL}/sensors/stm32/command`);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/sensors/stm32/command`);
      
      if (!response.ok) {
        console.error('API: HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API: Filter mode status response:', data);
      
      // Response format: { success: true, data: { filter_mode: "household_water", ... } }
      const filterMode = data.data?.filter_mode || 'household_water';
      
      return {
        success: true,
        mode: filterMode,
        message: `Current filter mode is ${filterMode}`
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
}

export const apiService = new ApiService();