import { cn } from "@/lib/utils";

const TYPE_EMOJI: Record<string, string[]> = {
  sprout: ["🌱", "🌿", "🌳"],
  tree: ["🌱", "🌳", "🌳"],
  flower: ["🌱", "🌸", "💐"],
  shrub: ["🌱", "🌳", "🌳"],
  decoration: ["🏮", "🏮", "⛲"],
};

export interface GardenItemProps {
  type: string;
  growthStage: number;
  label?: string;
}

export function GardenItem({ type, growthStage, label }: GardenItemProps) {
  const stages = TYPE_EMOJI[type] ?? TYPE_EMOJI.sprout!;
  const emoji = stages[Math.min(growthStage - 1, stages.length - 1)] ?? stages[0];

  return (
    <div
      className={cn("flex flex-col items-center gap-1 rounded-button bg-ivory/80 p-3 text-center shadow-soft")}
      title={label}
    >
      <span className="text-h2" aria-hidden="true">
        {emoji}
      </span>
      {label && <span className="text-caption text-cocoa/70">{label}</span>}
    </div>
  );
}
