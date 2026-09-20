import type { ReminderType } from "@prisma/client";

/**
 * Messages de rappel chaleureux (section 38). Jamais d'impératif sec type
 * « ARROSE TA PLANTE ! » — toujours une invitation douce, avec le nom de
 * la plante en contexte.
 */
export function buildReminderMessage(type: ReminderType, plantName: string): string {
  switch (type) {
    case "check_substrate":
      return `🌿 ${plantName} pourrait avoir besoin d'eau. Peux-tu vérifier le substrat ?`;
    case "observe":
      return `📸 Un petit coup d'œil sur ${plantName} ferait plaisir à Bloom.`;
    case "fertilize":
      return `🌸 C'est peut-être le moment d'apporter un peu d'engrais à ${plantName}.`;
    case "repot":
      return `🪴 ${plantName} semble à l'étroit — envie de vérifier si un rempotage l'aiderait ?`;
    case "protect_from_cold":
      return `❄️ Le froid arrive : pense à mettre ${plantName} à l'abri si besoin.`;
    case "check_location":
      return `📍 Vérifie que l'emplacement de ${plantName} lui convient toujours.`;
    default:
      return `🌱 Bloom pense à ${plantName} aujourd'hui.`;
  }
}
