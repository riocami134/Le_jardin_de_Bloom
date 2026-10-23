import type { PlantIdentification, HealthObservationFlags } from "@/types";

/**
 * Contrat du futur fournisseur IA unifié de Bloom (voir le plan en 12
 * étapes discuté avec l'utilisateur). Remplacera, une fois implémenté,
 * PlantVisionProvider + BloomReasoningProvider par un seul appel qui fait
 * l'identification ET le raisonnement en même temps, avec tout le contexte
 * disponible (environnement, historique, photos précédentes) plutôt que
 * deux appels séparés sans mémoire partagée entre eux.
 *
 * Étape 2 du plan uniquement : ce fichier ne définit que le contrat
 * (entrée/sortie). Aucune implémentation, aucun branchement dans
 * `src/lib/ai/index.ts`, aucun changement de comportement de l'app tant que
 * les étapes suivantes n'ont pas été validées une à une.
 */

/**
 * Entrée complète que Bloom IA reçoit pour analyser une plante : la photo
 * du jour, ce qu'on sait déjà d'elle (espèce, environnement, historique) et
 * ce que l'utilisateur a pu préciser. Plus le contexte est riche, plus le
 * diagnostic est pertinent — tous les champs sauf la photo restent
 * optionnels pour qu'un appel reste possible dès la toute première analyse
 * d'une plante qui n'a encore aucun historique.
 */
export interface BloomAnalysisInput {
  photo: {
    /** Contenu de l'image encodé en base64, sans le préfixe `data:...;base64,`. */
    base64: string;
    /** Type MIME de l'image, ex. "image/jpeg". */
    mimeType: string;
  };
  /** Espèce déjà connue (évite une ré-identification si la plante est déjà dans le jardin de l'utilisateur). */
  knownSpecies?: { scientificName: string; commonName: string };
  environment?: {
    locationName?: string;
    light?: string;
    temperatureC?: number;
    humidityPct?: number;
  };
  careHistory?: Array<{ type: string; performedAt: string; notes?: string }>;
  previousAnalyses?: Array<{ score: number; createdAt: string; notes?: string }>;
  /** URLs signées des photos précédentes, pour que Bloom puisse comparer l'évolution (étape 8 du plan). */
  previousPhotoUrls?: string[];
  /** Ce que l'utilisateur a pu préciser lui-même (ex. réponse à une question de Bloom). */
  userNotes?: string;
}

/**
 * Sortie structurée que Bloom IA doit toujours renvoyer, même en cas de
 * doute — confiance basse plutôt qu'un champ manquant. Reprend les types
 * déjà utilisés ailleurs dans l'app (PlantIdentification, flags de santé)
 * pour ne pas dupliquer de vocabulaire avec le reste du code.
 */
export interface BloomAnalysisOutput {
  identification: PlantIdentification;
  observations: string[];
  health: {
    score: number; // 0-100, indicatif — jamais un diagnostic certain
    confidence: number; // 0-1
    flags: HealthObservationFlags;
  };
  hypotheses: string[];
  recommendations: string[];
  /** Questions que Bloom pose à l'utilisateur quand le contexte seul ne suffit pas à trancher. */
  questions: string[];
}

export interface BloomAIProvider {
  analyze(input: BloomAnalysisInput): Promise<BloomAnalysisOutput>;
}
