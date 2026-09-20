import type { BloomMessage, BloomQuestion, DiagnosisContext, Recommendation } from "@/types";
import type { BloomReasoningProvider } from "./types";

const ALL_QUESTIONS: BloomQuestion[] = [
  { id: "last_watered", question: "Quand as-tu arrosé pour la dernière fois ?" },
  { id: "location", question: "Où se trouve la plante en ce moment ?" },
  { id: "light", question: "Quelle lumière reçoit-elle dans la journée ?" },
  { id: "since_when", question: "Depuis combien de temps observes-tu ce détail ?" },
  { id: "location_changed", question: "As-tu changé son emplacement récemment ?" },
  { id: "repotted", question: "As-tu récemment rempoté cette plante ?" },
];

/**
 * Fournisseur de raisonnement Bloom simulé : formulations chaleureuses,
 * jamais de certitude artificielle, questions limitées à 2-3 (section 21).
 */
export class MockBloomProvider implements BloomReasoningProvider {
  async generateQuestions(context: DiagnosisContext): Promise<BloomQuestion[]> {
    const flags = context.observations ?? {};
    const selected: BloomQuestion[] = [];

    if (flags.yellowLeaves || flags.wilting) {
      selected.push(ALL_QUESTIONS[0]!, ALL_QUESTIONS[1]!);
    } else if (flags.spots || flags.brownLeaves) {
      selected.push(ALL_QUESTIONS[2]!, ALL_QUESTIONS[3]!);
    } else {
      selected.push(ALL_QUESTIONS[1]!, ALL_QUESTIONS[4]!);
    }
    if (selected.length < 3) selected.push(ALL_QUESTIONS[5]!);

    return selected.slice(0, 3);
  }

  async generateRecommendation(context: DiagnosisContext): Promise<Recommendation> {
    const flags = context.observations ?? {};
    const plant = context.plantName;

    if (flags.yellowLeaves) {
      return {
        action: "Espacer les prochains arrosages",
        reason: "Des feuilles jaunes accompagnent souvent un substrat resté trop humide.",
        explanation: `Pour ${plant}, laisse le dessus du substrat sécher davantage avant le prochain arrosage, et vérifie que le pot draine bien.`,
        confidence: 0.68,
        priority: "normal",
      };
    }
    if (flags.spots || flags.brownLeaves) {
      return {
        action: "Observer l'évolution sur quelques jours",
        reason: "Les taches ou bords bruns peuvent venir de l'air ambiant autant que d'un souci d'arrosage.",
        explanation: `Prends une photo de ${plant} dans quelques jours pour comparer — pas besoin d'agir dans l'urgence.`,
        confidence: 0.55,
        priority: "low",
      };
    }
    if (flags.wilting) {
      return {
        action: "Vérifier le substrat maintenant",
        reason: "Un flétrissement mérite une petite vérification rapide.",
        explanation: `Touche le substrat de ${plant} : s'il est sec en profondeur, un arrosage peut aider ; s'il est détrempé, laisse-le respirer.`,
        confidence: 0.72,
        priority: "high",
      };
    }

    return {
      action: "Continuer le suivi habituel",
      reason: "Rien de particulier ne ressort des observations disponibles.",
      explanation: `${plant} semble suivre son rythme normal — Bloom garde un œil bienveillant.`,
      confidence: 0.6,
      priority: "low",
    };
  }

  async generateBloomMessage(context: DiagnosisContext): Promise<BloomMessage> {
    const flags = context.observations ?? {};
    const plant = context.plantName;

    if (flags.wilting) {
      return { emotion: "worried", message: `Psst… ${plant} mérite peut-être une petite vérification.`, priority: "high" };
    }
    if (flags.yellowLeaves || flags.spots || flags.brownLeaves) {
      return { emotion: "focused", message: `Bloom observe ${plant} de près, tout va bien se passer 🌱`, priority: "normal" };
    }
    if (context.weatherCondition === "rainy") {
      return { emotion: "advising", message: "Pluie prévue demain — pas besoin d'arroser les plantes extérieures !", priority: "normal" };
    }

    return { emotion: "happy", message: `${plant} se porte bien aujourd'hui !`, priority: "low" };
  }
}
