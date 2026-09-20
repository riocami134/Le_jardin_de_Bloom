import { describe, expect, it } from "vitest";
import { MockWeatherProvider } from "@/lib/weather/mock-weather-provider";

describe("MockWeatherProvider", () => {
  const provider = new MockWeatherProvider();

  it("retourne une météo cohérente pour une ville", async () => {
    const weather = await provider.getCurrentWeather({ city: "Lyon" });
    expect(weather.city).toBe("Lyon");
    expect(weather.humidityPct).toBeGreaterThanOrEqual(0);
    expect(weather.humidityPct).toBeLessThanOrEqual(100);
  });

  it("retourne le nombre de jours de prévision demandé", async () => {
    const forecast = await provider.getForecast({ city: "Paris", days: 3 });
    expect(forecast).toHaveLength(3);
  });

  it("est stable pour une même ville le même jour", async () => {
    const a = await provider.getCurrentWeather({ city: "Marseille" });
    const b = await provider.getCurrentWeather({ city: "Marseille" });
    expect(a.temperatureC).toBe(b.temperatureC);
  });
});
