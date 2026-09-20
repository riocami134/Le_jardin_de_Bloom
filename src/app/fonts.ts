import { Quicksand, Baloo_2 } from "next/font/google";

/**
 * Texte fonctionnel : Quicksand (charte officielle, licence OFL, Google Fonts).
 */
export const bodyFont = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-family",
  display: "swap",
});

/**
 * Titres : la charte demande "More Sugar", une police display non distribuée
 * publiquement. En l'absence d'un fichier licencié fourni dans le dépôt,
 * Baloo 2 (Google Fonts, OFL) sert de secours arrondi/épais proche de
 * l'esprit de la charte. Voir docs/design-system.md pour la procédure de
 * remplacement dès que le fichier More Sugar est disponible.
 */
export const headingFont = Baloo_2({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-heading-family",
  display: "swap",
});
