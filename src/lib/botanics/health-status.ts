import type { PlantStatus } from "@prisma/client";

/** Dérive un statut non-alarmiste à partir d'un score indicatif (section 17). */
export function statusFromScore(score: number): PlantStatus {
  if (score >= 75) return "healthy";
  if (score >= 50) return "watch";
  return "attention";
}
