import { getEnv } from "@/config/env";
import { MockWeatherProvider } from "./mock-weather-provider";
import { RealWeatherProvider } from "./real-weather-provider";
import type { WeatherProvider } from "./types";

let provider: WeatherProvider | null = null;

export function getWeatherProvider(): WeatherProvider {
  if (provider) return provider;
  const env = getEnv();
  if (env.WEATHER_PROVIDER === "real") {
    // Open-Meteo est gratuit et sans clé API : aucune variable
    // supplémentaire à configurer au-delà de WEATHER_PROVIDER=real.
    provider = new RealWeatherProvider();
    return provider;
  }
  provider = new MockWeatherProvider();
  return provider;
}

export type { WeatherProvider } from "./types";
