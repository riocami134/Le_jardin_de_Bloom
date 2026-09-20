export interface PlantIdentification {
  scientificName: string;
  commonName: string;
  confidence: number; // 0-1
  alternativeMatches?: Array<{ scientificName: string; commonName: string; confidence: number }>;
}

export type HealthObservationFlags = {
  yellowLeaves: boolean;
  brownLeaves: boolean;
  wilting: boolean;
  spots: boolean;
  pestsVisible: boolean;
};

export interface HealthObservation {
  score: number; // 0-100, indicatif
  confidence: number; // 0-1
  flags: HealthObservationFlags;
  notes?: string;
}
