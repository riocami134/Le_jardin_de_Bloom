import type { LocationCompatibility } from "@/types";

export interface LocationCandidate {
  name: string;
  indoorOutdoor: "interieur" | "exterieur";
  windowOrientation?: string;
  temperatureC?: number;
}

export interface SpeciesNeeds {
  indoorOutdoor: string; // "interieur" | "exterieur" | "les-deux"
}

const ORIENTATION_LIGHT_SCORE: Record<string, number> = {
  sud: 100,
  "sud-est": 90,
  "sud-ouest": 90,
  est: 75,
  ouest: 75,
  nord: 40,
  "nord-est": 50,
  "nord-ouest": 50,
};

/**
 * Calcule un score de compatibilité par emplacement, toujours accompagné
 * de raisons/avertissements explicites — jamais un score nu (section 28).
 * N'affirme jamais mesurer précisément les lux.
 */
export class LocationCompatibilityService {
  evaluate(candidate: LocationCandidate, needs: SpeciesNeeds): LocationCompatibility {
    const reasons: string[] = [];
    const warnings: string[] = [];
    let score = 60;

    if (candidate.windowOrientation) {
      const orientationScore = ORIENTATION_LIGHT_SCORE[candidate.windowOrientation] ?? 50;
      score = Math.round((score + orientationScore) / 2);
      if (orientationScore >= 75) reasons.push(`Orientation ${candidate.windowOrientation}, plutôt lumineuse`);
      else warnings.push(`Orientation ${candidate.windowOrientation}, plus limitée en lumière`);
    }

    if (needs.indoorOutdoor !== "les-deux" && needs.indoorOutdoor !== candidate.indoorOutdoor) {
      score -= 25;
      warnings.push(
        needs.indoorOutdoor === "interieur"
          ? "Cette espèce préfère généralement l'intérieur"
          : "Cette espèce préfère généralement l'extérieur",
      );
    } else {
      reasons.push("Emplacement intérieur/extérieur adapté à l'espèce");
    }

    if (candidate.temperatureC !== undefined) {
      if (candidate.temperatureC < 12) {
        score -= 15;
        warnings.push("Température plutôt fraîche pour la plupart des plantes d'intérieur");
      } else {
        reasons.push("Température ambiante dans une fourchette confortable");
      }
    }

    return {
      locationName: candidate.name,
      compatibilityScore: Math.max(0, Math.min(100, score)),
      reasons,
      warnings,
    };
  }

  rank(candidates: LocationCandidate[], needs: SpeciesNeeds): LocationCompatibility[] {
    return candidates.map((c) => this.evaluate(c, needs)).sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }
}

export const locationCompatibilityService = new LocationCompatibilityService();
