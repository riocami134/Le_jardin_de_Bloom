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
  const cleaned = name
    // codes cultivar/fournisseur isolés repérés dans le catalogue
    .replace(/\bAU\b\s*/g, "")
    // numéros isolés (codes de variété, ex. "4010 Forage Pea")
    .replace(/\b\d+\b\s*/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([),.])/g, "$1")
    .replace(/\(\s*\)/g, "")
    .replace(/\(\s*,/g, "(")
    .replace(/,\s*\)/g, ")")
    .replace(/^[\s,.-]+|[\s,.-]+$/g, "")
    .trim();

  return cleaned || name;
}
