import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BloomCharacter } from "./BloomCharacter";
import type { Recommendation, BloomEmotion } from "@/types";

export interface BloomAdviceProps {
  recommendation: Recommendation;
  emotion?: BloomEmotion;
}

const PRIORITY_TONE = {
  low: "info",
  normal: "watch",
  high: "attention",
} as const;

const PRIORITY_LABEL = {
  low: "Pour info",
  normal: "À prévoir",
  high: "Bientôt",
} as const;

/** Carte de conseil contextualisé (jamais un calendrier fixe, section 24). */
export function BloomAdvice({ recommendation, emotion = "advising" }: BloomAdviceProps) {
  return (
    <Card className="flex gap-4">
      <BloomCharacter emotion={emotion} size="sm" />
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-heading text-h4 text-cocoa">{recommendation.action}</h4>
          <Badge tone={PRIORITY_TONE[recommendation.priority]}>{PRIORITY_LABEL[recommendation.priority]}</Badge>
        </div>
        <p className="text-small text-cocoa/70">{recommendation.explanation}</p>
        {recommendation.confidence < 0.7 && (
          <p className="text-caption italic text-cocoa/50">
            Bloom n&apos;est pas totalement certain — {recommendation.reason.toLowerCase()}
          </p>
        )}
      </div>
    </Card>
  );
}
