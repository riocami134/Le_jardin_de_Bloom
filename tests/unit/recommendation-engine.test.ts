import { describe, expect, it } from "vitest";
import { RecommendationEngine } from "@/server/services/recommendation-engine";

describe("RecommendationEngine", () => {
  const engine = new RecommendationEngine();

  it("ne recommande pas d'arroser une plante extérieure si de la pluie est prévue", () => {
    const rec = engine.build({ plantStatus: "healthy", indoorOutdoor: "exterieur", rainProbability: 0.8 });
    expect(rec.action).toMatch(/pas besoin d'arroser/i);
    expect(rec.priority).toBe("low");
  });

  it("priorise une plante en état 'attention'", () => {
    const rec = engine.build({ plantStatus: "attention" });
    expect(rec.priority).toBe("high");
  });

  it("ne code jamais une règle de calendrier fixe dans l'action retournée", () => {
    const rec = engine.build({ plantStatus: "healthy", lastWateredDaysAgo: 12 });
    expect(rec.action).not.toMatch(/tous les 7 jours/i);
  });
});
