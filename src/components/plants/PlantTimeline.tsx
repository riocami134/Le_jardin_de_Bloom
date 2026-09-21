import { Card } from "@/components/ui/Card";
import { CARE_ACTION_LABEL } from "./CareAction";
import type { CareActionType } from "@prisma/client";

export type TimelineEntry =
  | { kind: "care"; id: string; type: CareActionType; date: Date | string; note?: string | null }
  | { kind: "analysis"; id: string; date: Date | string; score: number };

export function PlantTimeline({ entries }: { entries: TimelineEntry[] }) {
  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card>
      <ol className="space-y-4">
        {sorted.map((entry) => (
          <li key={`${entry.kind}-${entry.id}`} className="flex gap-3">
            <span className="text-h4" aria-hidden="true">
              {entry.kind === "analysis" ? "🔍" : CARE_ACTION_LABEL[entry.type].icon}
            </span>
            <div>
              <p className="text-small font-semibold text-cocoa">
                {entry.kind === "analysis" ? `Analyse, score ${entry.score}/100` : CARE_ACTION_LABEL[entry.type].label}
              </p>
              <p className="text-caption text-cocoa/60">
                {new Date(entry.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              {entry.kind === "care" && entry.note && <p className="mt-0.5 text-caption text-cocoa/70">{entry.note}</p>}
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
