import { describe, expect, it } from "vitest";
import { cleanSpeciesName } from "@/lib/botanics/clean-species-name";

describe("cleanSpeciesName", () => {
  it("retire le code cultivar 'AU' en tête de nom", () => {
    expect(cleanSpeciesName("AU Early Cover Hairy Vetch (Early-Flowering Southern Hairy Perilla)")).toBe(
      "Early Cover Hairy Vetch (Early-Flowering Southern Hairy Perilla)",
    );
  });

  it("retire les numéros isolés de code de variété", () => {
    expect(cleanSpeciesName("4010 Forage Pea (Spring Field Pea Cover Crop)")).toBe(
      "Forage Pea (Spring Field Pea Cover Crop)",
    );
    expect(cleanSpeciesName("609 Buffalograss")).toBe("Buffalograss");
  });

  it("laisse intact un nom sans code parasite", () => {
    expect(cleanSpeciesName("Monstera Deliciosa")).toBe("Monstera Deliciosa");
  });

  it("ne renvoie jamais une chaîne vide", () => {
    expect(cleanSpeciesName("AU 123")).not.toBe("");
  });
});
