import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  icon?: string;
}

/** Pill sélectionnable — utilisé pour les filtres (Explorer) et valeurs. */
export function Chip({ selected = false, icon, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-4 py-2 text-small font-semibold transition-colors",
        selected
          ? "border-sage bg-sage text-ivory"
          : "border-cocoa/15 bg-ivory text-cocoa hover:border-sage",
        className,
      )}
      {...props}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
}
