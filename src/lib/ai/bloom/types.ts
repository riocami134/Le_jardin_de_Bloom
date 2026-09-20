import type { BloomMessage, BloomQuestion, DiagnosisContext, Recommendation } from "@/types";

export interface BloomReasoningProvider {
  generateQuestions(context: DiagnosisContext): Promise<BloomQuestion[]>;
  generateRecommendation(context: DiagnosisContext): Promise<Recommendation>;
  generateBloomMessage(context: DiagnosisContext): Promise<BloomMessage>;
}
