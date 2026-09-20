import type { CareActionType } from "@prisma/client";

export const CARE_ACTION_LABEL: Record<CareActionType, { label: string; icon: string }> = {
  watering: { label: "Arrosage", icon: "💧" },
  fertilizing: { label: "Engrais", icon: "🌸" },
  repotting: { label: "Rempotage", icon: "🪴" },
  pruning: { label: "Taille", icon: "✂️" },
  cleaning: { label: "Nettoyage", icon: "🧽" },
  location_change: { label: "Changement d'emplacement", icon: "📍" },
  analysis: { label: "Analyse", icon: "🔍" },
};

export interface CareActionItemProps {
  type: CareActionType;
  performedAt: Date | string;
  note?: string | null;
}

export function CareActionItem({ type, performedAt, note }: CareActionItemProps) {
  const meta = CARE_ACTION_LABEL[type];
  const date = new Date(performedAt);

  return (
    <div className="flex items-start gap-3 border-b border-cocoa/10 py-3 last:border-none">
      <span className="text-h4" aria-hidden="true">
        {meta.icon}
      </span>
      <div className="flex-1">
        <p className="text-small font-semibold text-cocoa">{meta.label}</p>
        <p className="text-caption text-cocoa/60">
          {date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
        </p>
        {note && <p className="mt-1 text-caption text-cocoa/70">{note}</p>}
      </div>
    </div>
  );
}
