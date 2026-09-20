export type BloomEmotion =
  | "happy"
  | "worried"
  | "focused"
  | "neutral"
  | "excited"
  | "advising"
  | "surprised"
  | "sleeping"
  | "celebrating"
  | "cute";

export type BloomPriority = "low" | "normal" | "high";

export interface BloomMessage {
  emotion: BloomEmotion;
  message: string;
  priority: BloomPriority;
}

export interface BloomQuestion {
  id: string;
  question: string;
}

export interface DiagnosisContext {
  plantName: string;
  speciesCommonName?: string;
  observations?: Record<string, boolean>;
  userAnswers?: Record<string, string>;
  weatherCondition?: string;
}
