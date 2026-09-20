import { z } from "zod";

export const windowOrientationSchema = z.enum([
  "nord",
  "nord-est",
  "est",
  "sud-est",
  "sud",
  "sud-ouest",
  "ouest",
  "nord-ouest",
]);

export const plantLocationSchema = z.object({
  name: z.string().trim().min(1).max(80),
  room: z.string().trim().max(80).optional(),
  indoorOutdoor: z.enum(["interieur", "exterieur"]).default("interieur"),
  windowOrientation: windowOrientationSchema.optional(),
  distanceToWindowM: z.number().min(0).max(50).optional(),
});
export type PlantLocationInput = z.infer<typeof plantLocationSchema>;

export const environmentSchema = z.object({
  name: z.string().trim().max(80).optional(),
  temperatureC: z.number().min(-30).max(60).optional(),
  humidityPct: z.number().min(0).max(100).optional(),
  lightDescription: z.string().trim().max(300).optional(),
  notes: z.string().trim().max(500).optional(),
});
export type EnvironmentInput = z.infer<typeof environmentSchema>;
