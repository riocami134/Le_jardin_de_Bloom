import { describe, expect, it } from "vitest";
import { MockBloomProvider } from "@/lib/ai/bloom/mock-bloom-provider";

describe("MockBloomProvider", () => {
  const provider = new MockBloomProvider();

  it("ne pose jamais plus de 3 questions", async () => {
    const questions = await provider.generateQuestions({ plantName: "Monstera", observations: { yellowLeaves: true, brownLeaves: false, wilting: false, spots: false, pestsVisible: false } });
    expect(questions.length).toBeLessThanOrEqual(3);
    expect(questions.length).toBeGreaterThan(0);
  });

  it("choisit une émotion inquiète en cas de flétrissement", async () => {
    const message = await provider.generateBloomMessage({ plantName: "Calathea", observations: { yellowLeaves: false, brownLeaves: false, wilting: true, spots: false, pestsVisible: false } });
    expect(message.emotion).toBe("worried");
    expect(message.priority).toBe("high");
  });

  it("reste positif sans observation préoccupante", async () => {
    const message = await provider.generateBloomMessage({ plantName: "Basilic" });
    expect(["happy", "advising"]).toContain(message.emotion);
  });

  it("ne formule jamais de certitude — reste une recommandation nuancée", async () => {
    const recommendation = await provider.generateRecommendation({ plantName: "Citronnier", observations: { yellowLeaves: true, brownLeaves: false, wilting: false, spots: false, pestsVisible: false } });
    expect(recommendation.confidence).toBeLessThan(1);
    expect(recommendation.explanation).not.toMatch(/certainement|définitivement/i);
  });
});
