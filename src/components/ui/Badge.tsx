import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeTone = "success" | "watch" | "attention" | "info" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  icon?: string;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: "bg-leaf/15 text-leaf",
  watch: "bg-honey/25 text-cocoa",
  attention: "bg-coral/15 text-coral",
  info: "bg-sky/25 text-cocoa",
  neutral: "bg-cocoa/8 text-cocoa",
};

/**
 * Toujours icône + texte — un état n'est jamais communiqué par la couleur
 * seule (section 42).
 */
export function Badge({ tone = "neutral", icon, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-small font-semibold",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
