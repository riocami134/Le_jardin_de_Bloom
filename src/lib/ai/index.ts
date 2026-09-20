import { getEnv } from "@/config/env";
import { MockVisionProvider } from "./vision/mock-vision-provider";
import { PlantIdVisionProvider } from "./vision/plantid-vision-provider";
import { MockBloomProvider } from "./bloom/mock-bloom-provider";
import type { PlantVisionProvider } from "./vision/types";
import type { BloomReasoningProvider } from "./bloom/types";

let visionProvider: PlantVisionProvider | null = null;
let bloomProvider: BloomReasoningProvider | null = null;

export function getVisionProvider(): PlantVisionProvider {
  if (visionProvider) return visionProvider;
  const env = getEnv();
  if (env.AI_PROVIDER === "real") {
    // env.ts garantit AI_API_KEY non vide quand AI_PROVIDER=real.
    visionProvider = new PlantIdVisionProvider(env.AI_API_KEY!);
    return visionProvider;
  }
  visionProvider = new MockVisionProvider();
  return visionProvider;
}

export function getBloomProvider(): BloomReasoningProvider {
  if (bloomProvider) return bloomProvider;
  // AI_PROVIDER=real active PlantIdVisionProvider (identification/santé) ci-dessus.
  // Aucun RealBloomProvider (messages conversationnels de Bloom) n'existe encore :
  // on reste en mock ici tant qu'il n'est pas implémenté, pour ne jamais casser
  // le Scanner à cause d'une fonctionnalité non liée. Voir docs/ai-architecture.md.
  bloomProvider = new MockBloomProvider();
  return bloomProvider;
}
