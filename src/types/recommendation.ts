import type { BloomPriority } from "./bloom";

export interface Recommendation {
  action: string;
  reason: string;
  explanation: string;
  confidence: number; // 0-1
  priority: BloomPriority;
}

export interface LocationCompatibility {
  locationName: string;
  compatibilityScore: number; // 0-100
  reasons: string[];
  warnings: string[];
}
