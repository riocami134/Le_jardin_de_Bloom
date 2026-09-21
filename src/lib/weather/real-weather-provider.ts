import type { WeatherCondition, WeatherContext, WeatherData, WeatherForecastDay } from "@/types";
import type { WeatherProvider } from "./types";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const REQUEST_TIMEOUT_MS = 10_000;

interface GeocodingResponse {
  results?: Array<{ latitude: number; longitude: number; name: string }>;
}

interface ForecastResponse {
  current?: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    weather_code?: number;
    precipitation?: number;
  };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: number[];
    precipitation_sum?: number[];
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Open-Meteo a répondu ${response.status}`);
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

/** Codes WMO (norme utilisée par Open-Meteo) regroupés en nos conditions. */
function mapWeatherCode(code: number): WeatherCondition {
  if (code === 0) return "sunny";
  if (code === 1 || code === 2) return "partly_cloudy";
  if (code === 3 || code === 45 || code === 48) return "cloudy";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rainy";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snowy";
  if ([95, 96, 99].includes(code)) return "stormy";
  return "cloudy";
}

/**
 * Fournisseur météo réel basé sur Open-Meteo (gratuit, sans clé API).
 * Géocode la ville renseignée par l'utilisateur puis récupère la météo du
 * jour et les prochains jours. Le cache de géocodage évite de refaire la
 * même requête à chaque appel pour une ville déjà résolue.
 */
export class RealWeatherProvider implements WeatherProvider {
  private geocodeCache = new Map<string, { latitude: number; longitude: number }>();

  private async geocode(city: string): Promise<{ latitude: number; longitude: number }> {
    const key = city.trim().toLowerCase();
    const cached = this.geocodeCache.get(key);
    if (cached) return cached;

    const data = await fetchJson<GeocodingResponse>(
      `${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1&language=fr&format=json`,
    );
    const result = data.results?.[0];
    if (!result) throw new Error(`Ville introuvable pour la météo : ${city}`);

    const coords = { latitude: result.latitude, longitude: result.longitude };
    this.geocodeCache.set(key, coords);
    return coords;
  }

  async getCurrentWeather(input: { city: string }): Promise<WeatherData> {
    return (await this.getWeatherContext(input)).current;
  }

  async getForecast(input: { city: string; days?: number }): Promise<WeatherForecastDay[]> {
    return (await this.getWeatherContext(input)).forecast.slice(0, input.days ?? 5);
  }

  async getWeatherContext({ city }: { city: string }): Promise<WeatherContext> {
    const { latitude, longitude } = await this.geocode(city);
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum",
      timezone: "auto",
      forecast_days: "6",
    });
    const data = await fetchJson<ForecastResponse>(`${FORECAST_URL}?${params.toString()}`);

    const current = data.current ?? {};
    const daily = data.daily ?? {};
    // Open-Meteo n'expose pas de probabilité de pluie "actuelle" (seulement
    // en prévision horaire/journalière) — on prend celle du jour même.
    const todayRainProbability = (daily.precipitation_probability_max?.[0] ?? 0) / 100;

    const currentWeather: WeatherData = {
      city,
      temperatureC: current.temperature_2m ?? 0,
      humidityPct: current.relative_humidity_2m ?? 0,
      rainProbability: todayRainProbability,
      rainAmountMm: daily.precipitation_sum?.[0] ?? current.precipitation ?? 0,
      windSpeedKmh: current.wind_speed_10m ?? 0,
      condition: mapWeatherCode(current.weather_code ?? 0),
      timestamp: new Date().toISOString(),
    };

    // daily.time[0] est aujourd'hui : la prévision commence donc à l'indice 1.
    const forecast: WeatherForecastDay[] = (daily.time ?? []).slice(1).map((date, i) => ({
      date,
      condition: mapWeatherCode(daily.weather_code?.[i + 1] ?? 0),
      temperatureMaxC: daily.temperature_2m_max?.[i + 1] ?? 0,
      temperatureMinC: daily.temperature_2m_min?.[i + 1] ?? 0,
    }));

    return { current: currentWeather, forecast };
  }
}
