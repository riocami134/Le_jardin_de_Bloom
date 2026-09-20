import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-leaf text-ivory hover:brightness-105 active:brightness-95",
  secondary: "bg-peach-light text-cocoa hover:brightness-105 active:brightness-95",
  tertiary: "bg-transparent text-cocoa border border-cocoa/20 hover:bg-cocoa/5",
  ghost: "bg-transparent text-cocoa hover:bg-cocoa/5",
  danger: "bg-coral text-ivory hover:brightness-105 active:brightness-95",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "text-small px-4 py-2 min-h-[36px]",
  md: "text-body px-5 py-3 min-h-[44px]",
  lg: "text-h4 px-6 py-4 min-h-[52px]",
};

/** Bouton principal du design system — hiérarchie primary/secondary/tertiary (section 68). */
export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-button font-body font-semibold",
        "transition-[filter,background-color] duration-150 disabled:opacity-50 disabled:pointer-events-none",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    />
  );
}
