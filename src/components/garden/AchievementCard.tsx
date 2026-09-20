import { cn } from "@/lib/utils";

export interface AchievementCardProps {
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

/** Badge verrouillé/débloqué (section 34) — animation douce via CSS au montage. */
export function AchievementCard({ name, description, icon, unlocked }: AchievementCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-card p-4 text-center shadow-soft transition-all",
        unlocked ? "bg-honey/25 animate-pop-in" : "bg-cocoa/5 opacity-60",
      )}
      title={description}
    >
      <span className={cn("text-h1", !unlocked && "grayscale")} aria-hidden="true">
        {unlocked ? icon : "🔒"}
      </span>
      <p className="text-caption font-semibold text-cocoa">{name}</p>
    </div>
  );
}
