import { PlantStatus } from "@prisma/client";

/**
 * Un état n'est jamais communiqué par la couleur seule (accessibilité,
 * section 42) : toujours une icône + un libellé texte non alarmiste.
 */
export const PLANT_STATUS: Record<PlantStatus, { label: string; icon: string; colorVar: string }> = {
  healthy: { label: "Bonne forme", icon: "🟢", colorVar: "--color-success" },
  watch: { label: "À surveiller", icon: "🟡", colorVar: "--color-watch" },
  attention: { label: "À vérifier", icon: "🟠", colorVar: "--color-attention" },
  unknown: { label: "En observation", icon: "⚪", colorVar: "--color-text-muted" },
};
