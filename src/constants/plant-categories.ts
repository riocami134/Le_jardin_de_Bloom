import { PlantCategory } from "@prisma/client";

/**
 * 18 catégories de plantes de la charte (page 8 du Jardin.pdf).
 * Représentées par un pictogramme simple faute d'assets détourés
 * individuels fournis — voir docs/design-system.md. `avatarBg` pioche dans
 * la palette de la charte pour donner un avatar distinct par catégorie aux
 * fiches Explorer qui n'ont pas encore de photo.
 */
export const PLANT_CATEGORIES: Record<PlantCategory, { label: string; icon: string; avatarBg: string }> = {
  succulentes: { label: "Succulentes", icon: "🌵", avatarBg: "bg-honey/30" },
  palmiers: { label: "Palmiers", icon: "🌴", avatarBg: "bg-leaf/30" },
  fleuries: { label: "Fleuries", icon: "🌸", avatarBg: "bg-pink/30" },
  aromatiques: { label: "Aromatiques", icon: "🌿", avatarBg: "bg-sage/30" },
  potager: { label: "Potager", icon: "🍅", avatarBg: "bg-coral/30" },
  fruits: { label: "Fruits", icon: "🍓", avatarBg: "bg-peach/30" },
  arbres: { label: "Arbres", icon: "🌳", avatarBg: "bg-leaf/30" },
  arbustes: { label: "Arbustes", icon: "🌳", avatarBg: "bg-sage/30" },
  grimpantes: { label: "Grimpantes", icon: "🌺", avatarBg: "bg-pink/30" },
  retombantes: { label: "Retombantes", icon: "🪴", avatarBg: "bg-peach-light/50" },
  tropicales: { label: "Tropicales", icon: "🌴", avatarBg: "bg-coral/30" },
  mediterraneennes: { label: "Méditerranéennes", icon: "🫒", avatarBg: "bg-honey/30" },
  jardin: { label: "Jardin", icon: "🌼", avatarBg: "bg-sage/30" },
  bulbes: { label: "Bulbes", icon: "🌷", avatarBg: "bg-pink/30" },
  fougeres: { label: "Fougères", icon: "🌿", avatarBg: "bg-leaf/30" },
  carnivores: { label: "Carnivores", icon: "🪰", avatarBg: "bg-taupe/30" },
  aquatiques: { label: "Aquatiques", icon: "🪷", avatarBg: "bg-sky/30" },
  bonsais: { label: "Bonsaïs", icon: "🌲", avatarBg: "bg-leaf/30" },
};

export const PLANT_CATEGORY_LIST = Object.entries(PLANT_CATEGORIES).map(([value, meta]) => ({
  value: value as PlantCategory,
  ...meta,
}));
