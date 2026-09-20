import type { WeatherData, WeatherForecastDay, WeatherContext } from "@/types";

export interface WeatherProvider {
  getCurrentWeather(input: { city: string }): Promise<WeatherData>;
  getForecast(input: { city: string; days?: number }): Promise<WeatherForecastDay[]>;
  getWeatherContext(input: { city: string }): Promise<WeatherContext>;
}
