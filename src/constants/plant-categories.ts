import { PlantCategory } from "@prisma/client";

/**
 * 18 catégories de plantes de la charte (page 8 du Jardin.pdf).
 * `avatarUrl` pointe vers l'illustration détourée de chaque catégorie,
 * extraite de cette page du PDF (public/plants/categories/) — utilisée
 * comme avatar par défaut dans Explorer tant qu'une espèce n'a pas de
 * vraie photo. `icon` reste utilisé pour les badges/chips (petit format).
 */
export const PLANT_CATEGORIES: Record<PlantCategory, { label: string; icon: string; avatarUrl: string }> = {
  succulentes: { label: "Succulentes", icon: "🌵", avatarUrl: "/plants/categories/succulentes.webp" },
  palmiers: { label: "Palmiers", icon: "🌴", avatarUrl: "/plants/categories/palmiers.webp" },
  fleuries: { label: "Fleuries", icon: "🌸", avatarUrl: "/plants/categories/fleuries.webp" },
  aromatiques: { label: "Aromatiques", icon: "🌿", avatarUrl: "/plants/categories/aromatiques.webp" },
  potager: { label: "Potager", icon: "🍅", avatarUrl: "/plants/categories/potager.webp" },
  fruits: { label: "Fruits", icon: "🍓", avatarUrl: "/plants/categories/fruits.webp" },
  arbres: { label: "Arbres", icon: "🌳", avatarUrl: "/plants/categories/arbres.webp" },
  arbustes: { label: "Arbustes", icon: "🌳", avatarUrl: "/plants/categories/arbustes.webp" },
  grimpantes: { label: "Grimpantes", icon: "🌺", avatarUrl: "/plants/categories/grimpantes.webp" },
  retombantes: { label: "Retombantes", icon: "🪴", avatarUrl: "/plants/categories/retombantes.webp" },
  tropicales: { label: "Tropicales", icon: "🌴", avatarUrl: "/plants/categories/tropicales.webp" },
  mediterraneennes: { label: "Méditerranéennes", icon: "🫒", avatarUrl: "/plants/categories/mediterraneennes.webp" },
  jardin: { label: "Jardin", icon: "🌼", avatarUrl: "/plants/categories/jardin.webp" },
  bulbes: { label: "Bulbes", icon: "🌷", avatarUrl: "/plants/categories/bulbes.webp" },
  fougeres: { label: "Fougères", icon: "🌿", avatarUrl: "/plants/categories/fougeres.webp" },
  carnivores: { label: "Carnivores", icon: "🪰", avatarUrl: "/plants/categories/carnivores.webp" },
  aquatiques: { label: "Aquatiques", icon: "🪷", avatarUrl: "/plants/categories/aquatiques.webp" },
  bonsais: { label: "Bonsaïs", icon: "🌲", avatarUrl: "/plants/categories/bonsais.webp" },
};

export const PLANT_CATEGORY_LIST = Object.entries(PLANT_CATEGORIES).map(([value, meta]) => ({
  value: value as PlantCategory,
  ...meta,
}));
