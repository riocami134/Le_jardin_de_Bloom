import { cn } from "@/lib/utils";
import { forwardRef, useId, type SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, id, className, children, ...props },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? props.name ?? generatedId;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-small font-semibold text-cocoa">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        aria-invalid={!!error}
        className={cn(
          "rounded-button border border-cocoa/20 bg-ivory px-4 py-3 text-body text-cocoa focus:border-sage",
          error && "border-coral",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-caption text-coral">{error}</p>}
    </div>
  );
});
