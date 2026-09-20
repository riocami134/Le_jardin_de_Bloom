import type { PlantIdentification, HealthObservation } from "@/types";

export interface PlantVisionProvider {
  identifyPlant(input: { imageUrl: string }): Promise<PlantIdentification>;
  analyzePlantHealth(input: { imageUrl: string; speciesHint?: string }): Promise<HealthObservation>;
}
