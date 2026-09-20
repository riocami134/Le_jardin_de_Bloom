import type { ReactNode } from "react";
import type { BloomEmotion } from "@/types";
import { BloomCharacter } from "@/components/bloom/BloomCharacter";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  bloomEmotion?: BloomEmotion;
}

/** État vide systématique (section 39) — Bloom apparaît quand il apporte de la valeur. */
export function EmptyState({ title, description, action, bloomEmotion = "cute" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-card bg-ivory px-6 py-10 text-center shadow-soft">
      <BloomCharacter emotion={bloomEmotion} size="md" animated />
      <div className="space-y-1">
        <h3 className="font-heading text-h3 text-cocoa">{title}</h3>
        {description && <p className="mx-auto max-w-sm text-body text-cocoa/70">{description}</p>}
      </div>
      {action}
    </div>
  );
}
