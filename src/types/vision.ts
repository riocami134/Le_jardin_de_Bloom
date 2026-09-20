export interface PlantIdentification {
  scientificName: string;
  commonName: string;
  confidence: number; // 0-1
  alternativeMatches?: Array<{ scientificName: string; commonName: string; confidence: number }>;
  /**
   * Détails complémentaires issus de la base de connaissances du provider
   * (ex. Plant.id "kb"), quand disponibles. Best-effort : un provider peut
   * ne renvoyer aucun de ces champs, jamais bloquant pour l'identification.
   */
  speciesDetails?: {
    family?: string;
    light?: string;
    watering?: string;
    propagation?: string;
  };
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
