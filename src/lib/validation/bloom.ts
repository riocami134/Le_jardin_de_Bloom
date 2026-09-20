import { z } from "zod";

export const bloomEmotionSchema = z.enum([
  "happy",
  "worried",
  "focused",
  "neutral",
  "excited",
  "advising",
  "surprised",
  "sleeping",
  "celebrating",
  "cute",
]);

export const bloomMessageSchema = z.object({
  emotion: bloomEmotionSchema,
  message: z.string().min(1).max(280),
  priority: z.enum(["low", "normal", "high"]),
});

export const bloomQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
});

export const sendBloomMessageSchema = z.object({
  conversationId: z.string().cuid().optional(),
  plantId: z.string().cuid().optional(),
  content: z.string().trim().min(1).max(1000),
});
export type SendBloomMessageInput = z.infer<typeof sendBloomMessageSchema>;
