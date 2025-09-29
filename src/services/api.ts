// API service for AquaSmart backend
const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface SensorData {
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
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/sensors/latest`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        // Return the latest sensor data (first item in the array)
        return data.data[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching latest sensor data:', error);
      throw error;
    }
  }

  async getAllSensorData(): Promise<SensorData[]> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/sensors/recent?limit=20`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching sensor data:', error);
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
  getParameterStatus(type: 'ph' | 'turbidity' | 'tds', value: number): 'normal' | 'warning' | 'danger' | 'too low' {
    switch (type) {
      case 'ph':
        if (value >= 7 && value <= 8.5) return 'normal';
        if ((value >= 6.0 && value < 7.0) || (value > 8.5 && value <= 9.0)) return 'warning';
        return 'danger';
      
      case 'turbidity':
        if (value <= 1.0) return 'normal';
        if (value <= 4.0) return 'warning';
        return 'danger';
      
      case 'tds':
        if (value >= 300 && value <= 500) return 'normal';
        if(value < 50 && value <= 250) return 'too low';
        if ((value >= 150 && value < 300) || (value > 600 && value <= 1000)) return 'warning';
        return 'danger';
      
      default:
        return 'normal';
    }
  }
}

export const apiService = new ApiService();