import { cn } from "@/lib/utils";

export interface SkeletonProps {
  className?: string;
  rounded?: "card" | "button" | "pill";
}

export function Skeleton({ className, rounded = "button" }: SkeletonProps) {
  const radius = rounded === "card" ? "rounded-card" : rounded === "pill" ? "rounded-pill" : "rounded-button";
  return <div className={cn("animate-pulse bg-cocoa/10", radius, className)} aria-hidden="true" />;
}
