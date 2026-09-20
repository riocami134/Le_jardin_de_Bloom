import Image from "next/image";
import { cn } from "@/lib/utils";
import { BLOOM_EMOTION_ASSET, BLOOM_EMOTION_LABEL } from "@/constants/bloom";
import type { BloomEmotion } from "@/types";

export interface BloomCharacterProps {
  emotion: BloomEmotion;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  className?: string;
}

const SIZE_PX: Record<NonNullable<BloomCharacterProps["size"]>, number> = {
  sm: 48,
  md: 88,
  lg: 140,
  xl: 220,
};

/**
 * Rend Bloom avec les vraies illustrations extraites de Jardin.pdf
 * (public/bloom/emotions) — aucun personnage n'a été régénéré, conformément
 * à la règle absolue de la charte (section 3).
 */
export function BloomCharacter({ emotion, size = "md", animated = false, className }: BloomCharacterProps) {
  const px = SIZE_PX[size];
  return (
    <Image
      src={BLOOM_EMOTION_ASSET[emotion]}
      alt={`Bloom, ${BLOOM_EMOTION_LABEL[emotion]}`}
      width={px}
      height={px}
      priority={size === "xl"}
      className={cn(animated && "animate-bloom-bounce", className)}
    />
  );
}
