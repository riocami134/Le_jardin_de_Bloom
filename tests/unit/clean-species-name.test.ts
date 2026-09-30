import { describe, expect, it } from "vitest";
import { cleanSpeciesName, speciesCardTitle } from "@/lib/botanics/clean-species-name";

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

  it("retire aussi le code 'Au' rendu en casse titre, confirmé par Auburn University", () => {
    expect(cleanSpeciesName("Au Producer Plum (Auburn University High-Yielding Hybrid Plum)")).toBe(
      "Producer Plum (Auburn University High-Yielding Hybrid Plum)",
    );
  });

  it("ne touche jamais un vrai 'au' français (Café au Lait)", () => {
    expect(cleanSpeciesName("Cafe au Lait Rose Dahlia (Blush-Pink Sport of Cafe au Lait)")).toBe(
      "Cafe au Lait Rose Dahlia (Blush-Pink Sport of Cafe au Lait)",
    );
  });

  it("nettoie le tiret parasite d'un code accolé (AU-Rubrum)", () => {
    expect(cleanSpeciesName("AU-Rubrum Plum (Auburn University Plum)")).toBe(
      "Rubrum Plum (Auburn University Plum)",
    );
  });

  it("ne renvoie jamais une chaîne vide", () => {
    expect(cleanSpeciesName("AU 123")).not.toBe("");
  });
});

describe("speciesCardTitle", () => {
  it("coupe avant la parenthèse pour garder un titre court sur les cartes", () => {
    expect(
      speciesCardTitle("Ballet Slippers Hibiscus (White with Pink-Edged Petals and Red Eye Hardy Hibiscus)"),
    ).toBe("Ballet Slippers Hibiscus");
  });

  it("garde le nom complet quand il n'y a pas de parenthèse", () => {
    expect(speciesCardTitle("Mustang Grape")).toBe("Mustang Grape");
  });
});
