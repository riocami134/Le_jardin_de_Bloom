import { getEnv } from "@/config/env";
import { MockWeatherProvider } from "./mock-weather-provider";
import type { WeatherProvider } from "./types";

let provider: WeatherProvider | null = null;

export function getWeatherProvider(): WeatherProvider {
  if (provider) return provider;
  const env = getEnv();
  if (env.WEATHER_PROVIDER === "real") {
    throw new Error(
      "WEATHER_PROVIDER=real mais aucun RealWeatherProvider n'est encore implémenté. Voir docs/ai-architecture.md.",
    );
  }
  provider = new MockWeatherProvider();
  return provider;
}

export type { WeatherProvider } from "./types";
