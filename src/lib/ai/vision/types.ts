import type { PlantIdentification, HealthObservation } from "@/types";

export interface PlantVisionInput {
  /** Contenu de l'image encodé en base64, sans le préfixe `data:...;base64,`. */
  imageBase64: string;
  /** Type MIME de l'image, ex. "image/jpeg". */
  mimeType: string;
}

export interface PlantVisionProvider {
  identifyPlant(input: PlantVisionInput): Promise<PlantIdentification>;
  analyzePlantHealth(input: PlantVisionInput & { speciesHint?: string }): Promise<HealthObservation>;
}
