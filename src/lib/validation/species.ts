import { z } from "zod";

export const plantCategorySchema = z.enum([
  "succulentes",
  "palmiers",
  "fleuries",
  "aromatiques",
  "potager",
  "fruits",
  "arbres",
  "arbustes",
  "grimpantes",
  "retombantes",
  "tropicales",
  "mediterraneennes",
  "jardin",
  "bulbes",
  "fougeres",
  "carnivores",
  "aquatiques",
  "bonsais",
]);

export const speciesSearchSchema = z.object({
  query: z.string().trim().max(200).optional(),
  category: plantCategorySchema.optional(),
  light: z.string().trim().max(60).optional(),
  difficulty: z.enum(["facile", "modere", "exigeant"]).optional(),
  petSafe: z.coerce.boolean().optional(),
  indoorOutdoor: z.enum(["interieur", "exterieur", "les-deux"]).optional(),
});
export type SpeciesSearchInput = z.infer<typeof speciesSearchSchema>;
