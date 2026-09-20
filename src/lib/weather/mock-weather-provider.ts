import type { WeatherCondition, WeatherContext, WeatherData, WeatherForecastDay } from "@/types";
import type { WeatherProvider } from "./types";

const CONDITIONS: WeatherCondition[] = ["sunny", "partly_cloudy", "cloudy", "rainy"];

function seededValue(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i);
  const normalized = (Math.abs(hash) % 1000) / 1000;
  return min + normalized * (max - min);
}

/**
 * MockWeatherProvider : données stables et déterministes par ville et par
 * jour, sans appel réseau. Respecte WeatherProvider — remplaçable par un
 * vrai provider (ex: Open-Meteo) sans changer l'UI.
 */
export class MockWeatherProvider implements WeatherProvider {
  async getCurrentWeather({ city }: { city: string }): Promise<WeatherData> {
    const daySeed = `${city}-${new Date().toISOString().slice(0, 10)}`;
    const temperatureC = Math.round(seededValue(daySeed, 8, 26));
    const condition = CONDITIONS[Math.floor(seededValue(daySeed + "c", 0, CONDITIONS.length))]!;

    return {
      city,
      temperatureC,
      humidityPct: Math.round(seededValue(daySeed + "h", 35, 70)),
      rainProbability: condition === "rainy" ? 0.7 : Math.round(seededValue(daySeed + "r", 0, 30)) / 100,
      rainAmountMm: condition === "rainy" ? Math.round(seededValue(daySeed + "mm", 1, 8)) : 0,
      windSpeedKmh: Math.round(seededValue(daySeed + "w", 3, 20)),
      condition,
      timestamp: new Date().toISOString(),
    };
  }

  async getForecast({ city, days = 5 }: { city: string; days?: number }): Promise<WeatherForecastDay[]> {
    const forecast: WeatherForecastDay[] = [];
    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const seed = `${city}-${date.toISOString().slice(0, 10)}`;
      const max = Math.round(seededValue(seed + "max", 14, 26));
      forecast.push({
        date: date.toISOString().slice(0, 10),
        condition: CONDITIONS[Math.floor(seededValue(seed + "c", 0, CONDITIONS.length))]!,
        temperatureMaxC: max,
        temperatureMinC: max - Math.round(seededValue(seed + "delta", 4, 10)),
      });
    }
    return forecast;
  }

  async getWeatherContext({ city }: { city: string }): Promise<WeatherContext> {
    const [current, forecast] = await Promise.all([
      this.getCurrentWeather({ city }),
      this.getForecast({ city }),
    ]);
    return { current, forecast };
  }
}
