import { z } from "zod";

export const plantStatusSchema = z.enum(["healthy", "watch", "attention", "unknown"]);

export const createPlantSchema = z.object({
  name: z.string().trim().min(1, "Donne un nom à ta plante").max(80),
  speciesId: z.string().cuid().optional(),
  nickname: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(2000).optional(),
  locationId: z.string().cuid().optional(),
  environmentId: z.string().cuid().optional(),
  // Fourni par le Scanner quand l'espèce identifiée n'a pas de speciesId
  // connu : permet de créer automatiquement une fiche dans Explorer.
  identification: z
    .object({
      scientificName: z.string().trim().min(1),
      commonName: z.string().trim().min(1),
    })
    .optional(),
});
export type CreatePlantInput = z.infer<typeof createPlantSchema>;

export const updatePlantSchema = createPlantSchema.partial().extend({
  status: plantStatusSchema.optional(),
});
export type UpdatePlantInput = z.infer<typeof updatePlantSchema>;

export const careActionTypeSchema = z.enum([
  "watering",
  "fertilizing",
  "repotting",
  "pruning",
  "cleaning",
  "location_change",
  "analysis",
]);

export const createCareActionSchema = z.object({
  type: careActionTypeSchema,
  note: z.string().trim().max(500).optional(),
  performedAt: z.coerce.date().optional(),
  amountMl: z.number().int().positive().optional(),
  product: z.string().trim().max(120).optional(),
  potSizeCm: z.number().int().positive().optional(),
  partsRemoved: z.string().trim().max(200).optional(),
});
export type CreateCareActionInput = z.infer<typeof createCareActionSchema>;
