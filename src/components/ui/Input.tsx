import { cn } from "@/lib/utils";
import { forwardRef, useId, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? props.name ?? generatedId;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-small font-semibold text-cocoa">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={cn(
          "rounded-button border border-cocoa/20 bg-ivory px-4 py-3 text-body text-cocoa",
          "placeholder:text-cocoa/40 focus:border-sage",
          error && "border-coral",
          className,
        )}
        {...props}
      />
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-caption text-cocoa/60">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-caption text-coral">
          {error}
        </p>
      )}
    </div>
  );
});
