import { cn } from "@/lib/utils";
import { forwardRef, useId, type TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, id, className, ...props },
  ref,
) {
  const generatedId = useId();
  const areaId = id ?? props.name ?? generatedId;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={areaId} className="text-small font-semibold text-cocoa">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={areaId}
        aria-invalid={!!error}
        className={cn(
          "min-h-[100px] rounded-button border border-cocoa/20 bg-ivory px-4 py-3 text-body text-cocoa",
          "placeholder:text-cocoa/40 focus:border-sage",
          error && "border-coral",
          className,
        )}
        {...props}
      />
      {error && <p className="text-caption text-coral">{error}</p>}
    </div>
  );
});
