/**
 * Nettoyage d'affichage des noms d'espèces importées en masse depuis un
 * catalogue anglophone (OpenPlantDB). Purement un affichage : ne modifie
 * jamais les données en base, donc sans risque et ajustable à tout moment.
 *
 * Retire les codes fournisseur/cultivar parasites ("AU", numéros isolés)
 * que l'import a laissés en tête ou au milieu de certains noms — repérés
 * par l'utilisateur (ex. "AU Early Cover Hairy Vetch", "4010 Forage Pea").
 *
 * Une traduction mot-à-mot vers le français a été testée mais abandonnée :
 * sans réorganiser la grammaire (hors de portée à cette échelle), elle
 * produit un mélange franglais souvent moins lisible que l'anglais
 * d'origine (ex. « Lourd-Bearing Everbearing Forestier Fraise »).
 */
export function cleanSpeciesName(name: string): string {
  let cleaned = name
    // code cultivar "AU" (Auburn University) en majuscules, isolé
    .replace(/\bAU\b\s*/g, "")
    // numéros isolés (codes de variété, ex. "4010 Forage Pea")
    .replace(/\b\d+\b\s*/g, "");

  // même code, mais rendu en casse "Au " par le catalogue — seulement en
  // tête de nom et confirmé par la mention "(Auburn University" plus loin,
  // pour ne jamais toucher un vrai "au" français (ex. "Café au Lait Dahlia").
  if (/^Au\s+/.test(cleaned) && /\(Auburn University/i.test(cleaned)) {
    cleaned = cleaned.replace(/^Au\s+/, "");
  }

  cleaned = cleaned
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([),.])/g, "$1")
    .replace(/\(\s*\)/g, "")
    .replace(/\(\s*,/g, "(")
    .replace(/,\s*\)/g, ")")
    .replace(/^[\s,.-]+|[\s,.-]+$/g, "")
    .trim();

  return cleaned || name;
}

/**
 * Titre court pour les cartes (grille Explorer) : ne garde que le nom
 * principal, sans la description entre parenthèses qui peut faire plus de
 * 100 caractères sur certaines fiches importées (ex. "Ballet Slippers
 * Hibiscus (White with Pink-Edged Petals and Red Eye Hardy Hibiscus)" ->
 * "Ballet Slippers Hibiscus"). La description complète reste visible sur
 * la fiche détail via cleanSpeciesName.
 */
export function speciesCardTitle(name: string): string {
  const cleaned = cleanSpeciesName(name);
  const beforeParen = cleaned.split("(")[0]?.trim();
  return beforeParen || cleaned;
}
