import { Chip } from "@/components/ui/Chip";
import type { HealthObservationFlags } from "@/types";

const FLAG_LABEL: Record<keyof HealthObservationFlags, string> = {
  yellowLeaves: "Feuilles jaunes",
  brownLeaves: "Feuilles brunes",
  wilting: "Flétrissement",
  spots: "Taches",
  pestsVisible: "Nuisibles visibles",
};

export function HealthAnalysisView({ flags, notes }: { flags: HealthObservationFlags; notes?: string }) {
  const active = (Object.keys(flags) as Array<keyof HealthObservationFlags>).filter((key) => flags[key]);

  return (
    <div className="space-y-2">
      <p className="text-small font-semibold text-cocoa">Ce que Bloom a observé</p>
      {active.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {active.map((key) => (
            <Chip key={key} selected disabled className="cursor-default">
              {FLAG_LABEL[key]}
            </Chip>
          ))}
        </div>
      ) : (
        <p className="text-small text-cocoa/60">Rien de particulier à signaler dans cette photo.</p>
      )}
      {notes && <p className="text-caption italic text-cocoa/50">{notes}</p>}
    </div>
  );
}
