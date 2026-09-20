import { Progress } from "@/components/ui/Progress";
import { statusFromScore } from "@/lib/botanics/health-status";
import { PLANT_STATUS } from "@/constants/plant-status";

const TONE_BY_STATUS = { healthy: "success", watch: "watch", attention: "attention", unknown: "info" } as const;

export function HealthScore({ score, confidence }: { score: number; confidence: number }) {
  const status = statusFromScore(score);
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span aria-hidden="true">{PLANT_STATUS[status].icon}</span>
        <span className="text-small font-semibold text-cocoa">{PLANT_STATUS[status].label}</span>
      </div>
      <Progress value={score} label="Indice visuel indicatif" tone={TONE_BY_STATUS[status]} />
      <p className="text-caption text-cocoa/50">Confiance de Bloom : {Math.round(confidence * 100)}%</p>
    </div>
  );
}
