import type { Recommendation } from "@/types";

export interface RecommendationEngineInput {
  plantStatus: "healthy" | "watch" | "attention" | "unknown";
  lastWateredDaysAgo?: number;
  speciesWateringNote?: string;
  rainProbability?: number;
  indoorOutdoor?: "interieur" | "exterieur";
  recentHealthTrend?: "improving" | "declining" | "stable";
}

/**
 * Moteur de recommandation indépendant de l'UI et de tout provider IA
 * génératif : des règles contextuelles, jamais un calendrier fixe type
 * « arroser tous les 7 jours » (section 24).
 */
export class RecommendationEngine {
  build(input: RecommendationEngineInput): Recommendation {
    if (input.indoorOutdoor === "exterieur" && (input.rainProbability ?? 0) > 0.6) {
      return {
        action: "Pas besoin d'arroser aujourd'hui",
        reason: "De la pluie est annoncée.",
        explanation: "La météo devrait suffire à hydrater cette plante extérieure.",
        confidence: 0.75,
        priority: "low",
      };
    }

    if (input.plantStatus === "attention") {
      return {
        action: "Observer de près dans les prochains jours",
        reason: "Cette plante a été marquée à vérifier récemment.",
        explanation: "Un œil régulier suffit souvent à repérer ce qui a changé.",
        confidence: 0.6,
        priority: "high",
      };
    }

    if (input.recentHealthTrend === "declining") {
      return {
        action: "Revoir l'emplacement et l'arrosage",
        reason: "Le score de santé a légèrement baissé récemment.",
        explanation: "Rien d'alarmant : un ajustement doux suffit souvent.",
        confidence: 0.55,
        priority: "normal",
      };
    }

    if (typeof input.lastWateredDaysAgo === "number" && input.lastWateredDaysAgo >= 10) {
      return {
        action: "Vérifier le substrat",
        reason: "Cela fait un moment depuis le dernier arrosage enregistré.",
        explanation: input.speciesWateringNote ?? "Touche le substrat avant d'arroser à nouveau.",
        confidence: 0.5,
        priority: "normal",
      };
    }

    return {
      action: "Continuer le suivi habituel",
      reason: "Aucun signal particulier ne ressort du contexte actuel.",
      explanation: "Bloom garde un œil bienveillant sur cette plante.",
      confidence: 0.5,
      priority: "low",
    };
  }
}

export const recommendationEngine = new RecommendationEngine();
