import { cn } from "@/lib/utils";

export interface AchievementCardProps {
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

/** Badge verrouillé/débloqué (section 34) — icône toujours visible, grisée tant que verrouillé. */
export function AchievementCard({ name, description, icon, unlocked }: AchievementCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-1.5 rounded-card p-4 text-center shadow-soft transition-all",
        unlocked ? "bg-honey/25 animate-pop-in" : "bg-cocoa/5",
      )}
      title={description}
    >
      <span className={cn("text-h1", !unlocked && "opacity-40 grayscale")} aria-hidden="true">
        {icon}
      </span>
      <p className={cn("text-caption font-semibold", unlocked ? "text-cocoa" : "text-cocoa/50")}>{name}</p>
      {!unlocked && (
        <span className="absolute right-1.5 top-1.5 text-caption" aria-hidden="true">
          🔒
        </span>
      )}
    </div>
  );
}
