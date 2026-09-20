import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  lift?: boolean;
}

/** Carte de contenu — fond ivoire, coins très arrondis, ombre douce. */
export function Card({ padded = true, lift = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card bg-ivory text-cocoa",
        lift ? "shadow-lift" : "shadow-soft",
        padded && "p-5 sm:p-6",
        className,
      )}
      {...props}
    />
  );
}
