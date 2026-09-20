import { z } from "zod";

/**
 * Lecture typée et validée des variables d'environnement serveur.
 * N'importer ce module que depuis du code serveur (lib/, server/, route
 * handlers) — jamais depuis un Client Component.
 */
/** Convertit une variable laissée vide dans un dashboard d'hébergement en absente. */
const emptyToUndefined = (value: unknown) => (typeof value === "string" && value.trim() === "" ? undefined : value);

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  AUTH_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  STORAGE_PROVIDER: z.enum(["mock", "s3", "supabase"]).default("mock"),
  STORAGE_ENDPOINT: z.string().optional(),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  STORAGE_BUCKET: z.string().optional(),
  AI_PROVIDER: z.enum(["mock", "real"]).default("mock"),
  AI_API_KEY: z.string().optional(),
  WEATHER_PROVIDER: z.enum(["mock", "real"]).default("mock"),
  WEATHER_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Variables d'environnement invalides : ${parsed.error.message}`);
  }
  cached = parsed.data;
  return cached;
}
