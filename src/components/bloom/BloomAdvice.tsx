import { Card } from "@/components/ui/Card";
import { BloomCharacter } from "./BloomCharacter";
import type { Recommendation, BloomEmotion } from "@/types";

export interface BloomAdviceProps {
  recommendation: Recommendation;
  emotion?: BloomEmotion;
}

/** Carte de conseil contextualisé (jamais un calendrier fixe, section 24). */
export function BloomAdvice({ recommendation, emotion = "advising" }: BloomAdviceProps) {
  return (
    <Card className="flex gap-4">
      <BloomCharacter emotion={emotion} size="sm" />
      <div className="flex-1 space-y-2">
        <h4 className="font-heading text-h4 text-cocoa">{recommendation.action}</h4>
        <p className="text-small text-cocoa/70">{recommendation.explanation}</p>
      </div>
    </Card>
  );
}
