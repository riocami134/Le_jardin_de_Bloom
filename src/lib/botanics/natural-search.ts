import type { SpeciesSearchInput } from "@/lib/validation/species";

const LIGHT_KEYWORDS: Array<{ match: RegExp; light: string }> = [
  { match: /peu de lumière|ombre|sombre/i, light: "faible" },
  { match: /lumière indirecte|mi-ombre/i, light: "indirecte" },
  { match: /plein soleil|soleil direct|très lumineux/i, light: "vive" },
];

const DIFFICULTY_KEYWORDS: Array<{ match: RegExp; difficulty: SpeciesSearchInput["difficulty"] }> = [
  { match: /facile|débutant|simple/i, difficulty: "facile" },
  { match: /exigeant|difficile|expert/i, difficulty: "exigeant" },
];

const CATEGORY_KEYWORDS: Array<{ match: RegExp; category: SpeciesSearchInput["category"] }> = [
  { match: /succulente|cactus/i, category: "succulentes" },
  { match: /aromatique|cuisine/i, category: "aromatiques" },
  { match: /potager|légume/i, category: "potager" },
  { match: /fruit/i, category: "fruits" },
  { match: /tropicale/i, category: "tropicales" },
  { match: /salle de bain|humidité|humide/i, category: "tropicales" },
  { match: /fleur/i, category: "fleuries" },
];

const PET_SAFE_KEYWORDS = /sans danger|pet.?safe|chat|chien|animaux/i;

/**
 * Traduit une recherche en langage naturel (« plante facile avec peu de
 * lumière ») en filtres structurés pour /explore. Heuristique simple par
 * mots-clés — pas un vrai NLU, assumé et documenté comme tel.
 */
export function parseNaturalSearch(query: string): Partial<SpeciesSearchInput> {
  const filters: Partial<SpeciesSearchInput> = {};

  const lightMatch = LIGHT_KEYWORDS.find((k) => k.match.test(query));
  if (lightMatch) filters.light = lightMatch.light;

  const difficultyMatch = DIFFICULTY_KEYWORDS.find((k) => k.match.test(query));
  if (difficultyMatch) filters.difficulty = difficultyMatch.difficulty;

  const categoryMatch = CATEGORY_KEYWORDS.find((k) => k.match.test(query));
  if (categoryMatch) filters.category = categoryMatch.category;

  if (PET_SAFE_KEYWORDS.test(query)) filters.petSafe = true;

  return filters;
}
