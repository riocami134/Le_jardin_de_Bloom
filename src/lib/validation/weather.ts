import { z } from "zod";

export const weatherConditionSchema = z.enum([
  "sunny",
  "partly_cloudy",
  "cloudy",
  "rainy",
  "stormy",
  "snowy",
]);

export const weatherDataSchema = z.object({
  city: z.string().min(1),
  temperatureC: z.number(),
  humidityPct: z.number().min(0).max(100),
  rainProbability: z.number().min(0).max(1),
  rainAmountMm: z.number().min(0),
  windSpeedKmh: z.number().min(0),
  condition: weatherConditionSchema,
  timestamp: z.string(),
});

export const weatherForecastDaySchema = z.object({
  date: z.string(),
  condition: weatherConditionSchema,
  temperatureMaxC: z.number(),
  temperatureMinC: z.number(),
});

export const weatherContextSchema = z.object({
  current: weatherDataSchema,
  forecast: z.array(weatherForecastDaySchema),
});
