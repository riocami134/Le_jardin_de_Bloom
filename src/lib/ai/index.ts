import { getEnv } from "@/config/env";
import { MockVisionProvider } from "./vision/mock-vision-provider";
import { MockBloomProvider } from "./bloom/mock-bloom-provider";
import type { PlantVisionProvider } from "./vision/types";
import type { BloomReasoningProvider } from "./bloom/types";

let visionProvider: PlantVisionProvider | null = null;
let bloomProvider: BloomReasoningProvider | null = null;

export function getVisionProvider(): PlantVisionProvider {
  if (visionProvider) return visionProvider;
  const env = getEnv();
  if (env.AI_PROVIDER === "real") {
    throw new Error(
      "AI_PROVIDER=real mais aucun RealVisionProvider n'est encore implémenté. Voir docs/ai-architecture.md.",
    );
  }
  visionProvider = new MockVisionProvider();
  return visionProvider;
}

export function getBloomProvider(): BloomReasoningProvider {
  if (bloomProvider) return bloomProvider;
  const env = getEnv();
  if (env.AI_PROVIDER === "real") {
    throw new Error(
      "AI_PROVIDER=real mais aucun RealBloomProvider n'est encore implémenté. Voir docs/ai-architecture.md.",
    );
  }
  bloomProvider = new MockBloomProvider();
  return bloomProvider;
}
