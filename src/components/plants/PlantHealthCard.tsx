import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { PLANT_STATUS } from "@/constants/plant-status";
import type { PlantStatus } from "@prisma/client";

export interface PlantHealthCardProps {
  status: PlantStatus;
  score: number | null;
  scoreHistory?: number[];
}

const TONE_BY_STATUS: Record<PlantStatus, "success" | "watch" | "attention" | "info"> = {
  healthy: "success",
  watch: "watch",
  attention: "attention",
  unknown: "info",
};

export function PlantHealthCard({ status, score, scoreHistory = [] }: PlantHealthCardProps) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-h4 text-cocoa">Santé</h3>
        <Badge tone={TONE_BY_STATUS[status]} icon={PLANT_STATUS[status].icon}>
          {PLANT_STATUS[status].label}
        </Badge>
      </div>
      {typeof score === "number" ? (
        <Progress value={score} label="Indice visuel indicatif" tone={TONE_BY_STATUS[status]} />
      ) : (
        <p className="text-small text-cocoa/60">Pas encore d&apos;analyse — scanne cette plante pour un premier indice.</p>
      )}
      {scoreHistory.length > 1 && (
        <div className="flex items-end gap-1.5 pt-1" aria-hidden="true">
          {scoreHistory.map((value, i) => (
            <div
              key={i}
              className="w-4 rounded-t-md bg-sage/60"
              style={{ height: `${Math.max(8, value * 0.5)}px` }}
              title={`${value}/100`}
            />
          ))}
        </div>
      )}
      <p className="text-caption text-cocoa/50">
        Indice visuel indicatif — pas un diagnostic scientifique.
      </p>
    </Card>
  );
}
