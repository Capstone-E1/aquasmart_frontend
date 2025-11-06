// OpenWeatherMap API Response Types
// Full documentation: https://openweathermap.org/current

export interface WeatherCondition {
  id: number;
  main: string; // "Rain", "Snow", "Clear", etc.
  description: string; // More detailed description
  icon: string; // Icon code
}

export interface MainWeatherData {
  temp: number; // Temperature (Celsius by default)
  feels_like: number; // Temperature accounting for human perception
  temp_min: number; // Minimum temperature at the moment
  temp_max: number; // Maximum temperature at the moment
  pressure: number; // Atmospheric pressure (hPa)
  humidity: number; // Humidity percentage
  sea_level?: number; // Atmospheric pressure on sea level (hPa)
  grnd_level?: number; // Atmospheric pressure on ground level (hPa)
}

export interface Wind {
  speed: number; // Wind speed (meter/sec)
  deg: number; // Wind direction (degrees)
  gust?: number; // Wind gust (meter/sec)
}

export interface Clouds {
  all: number; // Cloudiness percentage
}

export interface Rain {
  '1h'?: number; // Rain volume for last 1 hour (mm)
  '3h'?: number; // Rain volume for last 3 hours (mm)
}

export interface Snow {
  '1h'?: number; // Snow volume for last 1 hour (mm)
  '3h'?: number; // Snow volume for last 3 hours (mm)
}

export interface Sys {
  type?: number;
  id?: number;
  country: string; // Country code (e.g., "ID", "US")
  sunrise: number; // Sunrise time (Unix timestamp)
  sunset: number; // Sunset time (Unix timestamp)
}

export interface Coord {
  lon: number; // Longitude
  lat: number; // Latitude
}

export interface OpenWeatherResponse {
  coord: Coord;
  weather: WeatherCondition[]; // Weather conditions (can be multiple)
  base: string; // Internal parameter
  main: MainWeatherData;
  visibility: number; // Visibility in meters (max 10km)
  wind: Wind;
  clouds: Clouds;
  rain?: Rain; // Only present when raining
  snow?: Snow; // Only present when snowing
  dt: number; // Time of data calculation (Unix timestamp)
  sys: Sys;
  timezone: number; // Shift in seconds from UTC
  id: number; // City ID
  name: string; // City name
  cod: number; // Response code
}

export interface GeolocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
}

// Forecast API Types (5 day / 3 hour forecast)
// Full documentation: https://openweathermap.org/forecast5

export interface ForecastItem {
  dt: number; // Time of data forecasted (Unix timestamp)
  main: MainWeatherData;
  weather: WeatherCondition[];
  clouds: Clouds;
  wind: Wind;
  visibility: number;
  pop: number; // Probability of precipitation (0-1)
  rain?: Rain;
  snow?: Snow;
  sys: {
    pod: string; // Part of day (n - night, d - day)
  };
  dt_txt: string; // Time of data forecasted (ISO format)
}

export interface ForecastCity {
  id: number;
  name: string;
  coord: Coord;
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}

export interface OpenWeatherForecastResponse {
  cod: string;
  message: number;
  cnt: number; // Number of forecast items
  list: ForecastItem[];
  city: ForecastCity;
}
