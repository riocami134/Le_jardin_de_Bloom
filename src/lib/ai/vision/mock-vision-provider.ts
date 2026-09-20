import type { HealthObservation, PlantIdentification } from "@/types";
import type { PlantVisionProvider } from "./types";

const MOCK_SPECIES: Array<{ scientificName: string; commonName: string }> = [
  { scientificName: "Monstera deliciosa", commonName: "Monstera" },
  { scientificName: "Calathea orbifolia", commonName: "Calathea" },
  { scientificName: "Ocimum basilicum", commonName: "Basilic" },
  { scientificName: "Citrus limon", commonName: "Citronnier" },
];

/** Hash simple et stable — permet un rendu déterministe pour la démo. */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Fournisseur de vision simulé : ne fait aucun appel réseau, ne prétend
 * jamais à une vraie identification par IA. Utilisé tant que
 * AI_PROVIDER=mock (par défaut). Respecte strictement PlantVisionProvider,
 * ce qui permet de le remplacer par un vrai provider sans changer l'UI.
 */
export class MockVisionProvider implements PlantVisionProvider {
  async identifyPlant({ imageUrl }: { imageUrl: string }): Promise<PlantIdentification> {
    const hash = hashString(imageUrl);
    const match = MOCK_SPECIES[hash % MOCK_SPECIES.length]!;
    const confidence = 0.55 + (hash % 40) / 100; // entre 0.55 et 0.94, jamais 1.0

    return {
      scientificName: match.scientificName,
      commonName: match.commonName,
      confidence: Math.min(confidence, 0.94),
      alternativeMatches: MOCK_SPECIES.filter((s) => s.scientificName !== match.scientificName)
        .slice(0, 2)
        .map((s, i) => ({ ...s, confidence: Math.max(0.1, confidence - 0.2 - i * 0.1) })),
    };
  }

  async analyzePlantHealth({ imageUrl }: { imageUrl: string; speciesHint?: string }): Promise<HealthObservation> {
    const hash = hashString(imageUrl + "health");
    const score = 55 + (hash % 40); // entre 55 et 94
    const confidence = 0.6 + (hash % 30) / 100;

    return {
      score,
      confidence: Math.min(confidence, 0.9),
      flags: {
        yellowLeaves: hash % 5 === 0,
        brownLeaves: hash % 7 === 0,
        wilting: hash % 11 === 0,
        spots: hash % 4 === 0,
        pestsVisible: hash % 13 === 0,
      },
      notes: "Analyse simulée à partir d'indices visuels génériques — indice indicatif, pas un diagnostic.",
    };
  }
}
