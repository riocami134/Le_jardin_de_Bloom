import { cn } from "@/lib/utils";
import { BloomCharacter } from "./BloomCharacter";
import type { BloomMessage as BloomMessageType } from "@/types";

export interface BloomMessageProps {
  bloom: BloomMessageType;
  className?: string;
}

/** Bulle de message de Bloom — utilisée avec parcimonie (section 69). */
export function BloomMessage({ bloom, className }: BloomMessageProps) {
  return (
    <div className={cn("flex items-end gap-3", className)}>
      <BloomCharacter emotion={bloom.emotion} size="sm" animated={bloom.priority === "high"} />
      <div className="relative max-w-sm rounded-card rounded-bl-none bg-peach-light px-4 py-3 text-body text-cocoa shadow-soft">
        {bloom.message}
      </div>
    </div>
  );
}
