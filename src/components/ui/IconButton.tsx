import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: "solid" | "ghost";
}

/** Bouton icône seule — `label` obligatoire pour l'accessibilité (aria-label). */
export function IconButton({ label, variant = "ghost", className, children, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-pill text-h4 transition-colors",
        variant === "solid" ? "bg-ivory text-cocoa shadow-soft hover:brightness-95" : "text-cocoa hover:bg-cocoa/5",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
