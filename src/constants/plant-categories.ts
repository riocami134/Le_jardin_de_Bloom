import { PlantCategory } from "@prisma/client";

/**
 * 18 catégories de plantes de la charte (page 8 du Jardin.pdf).
 * Représentées par un pictogramme simple faute d'assets détourés
 * individuels fournis — voir docs/design-system.md.
 */
export const PLANT_CATEGORIES: Record<PlantCategory, { label: string; icon: string }> = {
  succulentes: { label: "Succulentes", icon: "🌵" },
  palmiers: { label: "Palmiers", icon: "🌴" },
  fleuries: { label: "Fleuries", icon: "🌸" },
  aromatiques: { label: "Aromatiques", icon: "🌿" },
  potager: { label: "Potager", icon: "🍅" },
  fruits: { label: "Fruits", icon: "🍓" },
  arbres: { label: "Arbres", icon: "🌳" },
  arbustes: { label: "Arbustes", icon: "🌳" },
  grimpantes: { label: "Grimpantes", icon: "🌺" },
  retombantes: { label: "Retombantes", icon: "🪴" },
  tropicales: { label: "Tropicales", icon: "🌴" },
  mediterraneennes: { label: "Méditerranéennes", icon: "🫒" },
  jardin: { label: "Jardin", icon: "🌼" },
  bulbes: { label: "Bulbes", icon: "🌷" },
  fougeres: { label: "Fougères", icon: "🌿" },
  carnivores: { label: "Carnivores", icon: "🪰" },
  aquatiques: { label: "Aquatiques", icon: "🪷" },
  bonsais: { label: "Bonsaïs", icon: "🌲" },
};

export const PLANT_CATEGORY_LIST = Object.entries(PLANT_CATEGORIES).map(([value, meta]) => ({
  value: value as PlantCategory,
  ...meta,
}));
