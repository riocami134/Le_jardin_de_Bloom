import { cn } from "@/lib/utils";

export interface AchievementProps {
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date | string | null;
}

/** Variante en ligne (liste par famille) de l'affichage d'un badge. */
export function Achievement({ name, description, icon, unlocked, unlockedAt }: AchievementProps) {
  return (
    <div className="flex items-center gap-3 border-b border-cocoa/10 py-3 last:border-none">
      <span className={cn("text-h3", !unlocked && "grayscale opacity-50")} aria-hidden="true">
        {unlocked ? icon : "🔒"}
      </span>
      <div className="flex-1">
        <p className={cn("text-small font-semibold", unlocked ? "text-cocoa" : "text-cocoa/50")}>{name}</p>
        <p className="text-caption text-cocoa/50">{description}</p>
      </div>
      {unlocked && unlockedAt && (
        <span className="text-caption text-cocoa/40">
          {new Date(unlockedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
        </span>
      )}
    </div>
  );
}
