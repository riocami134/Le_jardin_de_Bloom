const DEFAULT_SITE_URL = "http://localhost:3000";

/**
 * AUTH_URL peut être absente, vide (laissée vierge dans un dashboard
 * d'hébergement) ou mal formée — on retombe toujours sur une URL valide
 * plutôt que de laisser `new URL()` planter le build (section "collecte de
 * la configuration" de Next.js, appelée même pour /_not-found).
 */
function resolveSiteUrl(): string {
  const raw = process.env.AUTH_URL?.trim();
  if (!raw) return DEFAULT_SITE_URL;
  try {
    return new URL(raw).toString();
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const SITE_CONFIG = {
  name: "Le Jardin de Bloom",
  tagline: "Petite plante, grande aventure !",
  pitch: "Le Jardin de Bloom, c'est votre jardin… version jeu vidéo !",
  description:
    "Grâce à l'IA, Bloom vous aide à identifier vos plantes, comprendre leurs besoins et suivre leur évolution. Prenez soin de vos plantes dans la vraie vie, et faites grandir votre jardin dans le jeu.",
  url: resolveSiteUrl(),
};
