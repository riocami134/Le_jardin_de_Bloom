export type WeatherCondition =
  | "sunny"
  | "partly_cloudy"
  | "cloudy"
  | "rainy"
  | "stormy"
  | "snowy";

export interface WeatherData {
  city: string;
  temperatureC: number;
  humidityPct: number;
  rainProbability: number; // 0-1
  rainAmountMm: number;
  windSpeedKmh: number;
  condition: WeatherCondition;
  timestamp: string;
}

export interface WeatherForecastDay {
  date: string;
  condition: WeatherCondition;
  temperatureMaxC: number;
  temperatureMinC: number;
}

export interface WeatherContext {
  current: WeatherData;
  forecast: WeatherForecastDay[];
}
