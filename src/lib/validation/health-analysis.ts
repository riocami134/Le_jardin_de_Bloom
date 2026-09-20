import { z } from "zod";

export const healthObservationFlagsSchema = z.object({
  yellowLeaves: z.boolean(),
  brownLeaves: z.boolean(),
  wilting: z.boolean(),
  spots: z.boolean(),
  pestsVisible: z.boolean(),
});

export const healthObservationSchema = z.object({
  score: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  flags: healthObservationFlagsSchema,
  notes: z.string().max(500).optional(),
});

export const plantIdentificationSchema = z.object({
  scientificName: z.string().min(1),
  commonName: z.string().min(1),
  confidence: z.number().min(0).max(1),
  alternativeMatches: z
    .array(
      z.object({
        scientificName: z.string(),
        commonName: z.string(),
        confidence: z.number().min(0).max(1),
      }),
    )
    .optional(),
});

export const createHealthAnalysisSchema = z.object({
  plantId: z.string().cuid(),
  photoId: z.string().cuid().optional(),
  score: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  observations: healthObservationFlagsSchema,
  hypotheses: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
});
export type CreateHealthAnalysisInput = z.infer<typeof createHealthAnalysisSchema>;
