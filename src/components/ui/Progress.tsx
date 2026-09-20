import { cn } from "@/lib/utils";

export interface ProgressProps {
  value: number; // 0-100
  label?: string;
  tone?: "success" | "watch" | "attention" | "info";
  className?: string;
}

const TONE_CLASSES: Record<NonNullable<ProgressProps["tone"]>, string> = {
  success: "bg-leaf",
  watch: "bg-honey",
  attention: "bg-coral",
  info: "bg-sky",
};

export function Progress({ value, label, tone = "info", className }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="mb-1 flex items-center justify-between text-small text-cocoa/70">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2.5 w-full overflow-hidden rounded-pill bg-cocoa/10"
      >
        <div
          className={cn("h-full rounded-pill transition-[width] duration-500", TONE_CLASSES[tone])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
