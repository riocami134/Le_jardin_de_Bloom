import { describe, expect, it } from "vitest";
import { LocationCompatibilityService } from "@/server/services/location-compatibility-service";

describe("LocationCompatibilityService", () => {
  const service = new LocationCompatibilityService();

  it("donne toujours au moins une raison ou un avertissement", () => {
    const result = service.evaluate(
      { name: "Salon", indoorOutdoor: "interieur", windowOrientation: "sud" },
      { indoorOutdoor: "interieur" },
    );
    expect(result.reasons.length + result.warnings.length).toBeGreaterThan(0);
    expect(result.compatibilityScore).toBeGreaterThanOrEqual(0);
    expect(result.compatibilityScore).toBeLessThanOrEqual(100);
  });

  it("classe une orientation sud au-dessus d'une orientation nord", () => {
    const south = service.evaluate({ name: "A", indoorOutdoor: "interieur", windowOrientation: "sud" }, { indoorOutdoor: "interieur" });
    const north = service.evaluate({ name: "B", indoorOutdoor: "interieur", windowOrientation: "nord" }, { indoorOutdoor: "interieur" });
    expect(south.compatibilityScore).toBeGreaterThan(north.compatibilityScore);
  });

  it("classe rank() du meilleur au moins bon score", () => {
    const ranked = service.rank(
      [
        { name: "Nord", indoorOutdoor: "interieur", windowOrientation: "nord" },
        { name: "Sud", indoorOutdoor: "interieur", windowOrientation: "sud" },
      ],
      { indoorOutdoor: "interieur" },
    );
    expect(ranked[0]!.locationName).toBe("Sud");
  });
});
