import type { BloomEmotion } from "@/types";

/**
 * Assets Bloom réels, extraits du Jardin.pdf (page 7 — "Les émotions de
 * Bloom"). Aucun nouveau personnage n'a été généré.
 */
export const BLOOM_EMOTION_ASSET: Record<BloomEmotion, string> = {
  happy: "/bloom/emotions/bloom-happy.png",
  worried: "/bloom/emotions/bloom-worried.png",
  focused: "/bloom/emotions/bloom-focused.png",
  neutral: "/bloom/emotions/bloom-neutral.png",
  excited: "/bloom/emotions/bloom-excited.png",
  advising: "/bloom/emotions/bloom-advising.png",
  surprised: "/bloom/emotions/bloom-surprised.png",
  sleeping: "/bloom/emotions/bloom-sleeping.png",
  celebrating: "/bloom/emotions/bloom-celebrating.png",
  cute: "/bloom/emotions/bloom-cute.png",
};

export const BLOOM_EMOTION_LABEL: Record<BloomEmotion, string> = {
  happy: "heureux",
  worried: "inquiet",
  focused: "concentré",
  neutral: "neutre",
  excited: "enthousiaste",
  advising: "qui conseille",
  surprised: "surpris",
  sleeping: "qui dort",
  celebrating: "qui célèbre",
  cute: "mignon",
};
