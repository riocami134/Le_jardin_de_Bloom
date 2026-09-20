import { describe, expect, it } from "vitest";
import { parseNaturalSearch } from "@/lib/botanics/natural-search";

describe("parseNaturalSearch", () => {
  it("extrait la difficulté et la lumière d'une recherche naturelle", () => {
    const filters = parseNaturalSearch("plante facile avec peu de lumière");
    expect(filters.difficulty).toBe("facile");
    expect(filters.light).toBe("faible");
  });

  it("détecte une catégorie évoquée en langage naturel", () => {
    const filters = parseNaturalSearch("une plante adaptée à une salle de bain");
    expect(filters.category).toBe("tropicales");
  });

  it("retourne un objet vide si rien ne correspond", () => {
    const filters = parseNaturalSearch("bonjour");
    expect(filters).toEqual({});
  });
});
