import { PlantPhoto } from "./PlantPhoto";

export interface PlantPhotoComparisonProps {
  before: { url: string; date: string; score?: number | null };
  after: { url: string; date: string; score?: number | null };
}

/** Comparaison avant/après pour visualiser l'évolution (section 14). */
export function PlantPhotoComparison({ before, after }: PlantPhotoComparisonProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <PlantPhoto url={before.url} alt={`Photo du ${before.date}`} />
        <p className="mt-1 text-center text-caption text-cocoa/60">
          {before.date}
          {typeof before.score === "number" && ` · ${before.score}/100`}
        </p>
      </div>
      <div>
        <PlantPhoto url={after.url} alt={`Photo du ${after.date}`} />
        <p className="mt-1 text-center text-caption text-cocoa/60">
          {after.date}
          {typeof after.score === "number" && ` · ${after.score}/100`}
        </p>
      </div>
    </div>
  );
}
