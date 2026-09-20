import { describe, expect, it } from "vitest";
import { MockVisionProvider } from "@/lib/ai/vision/mock-vision-provider";

describe("MockVisionProvider", () => {
  const provider = new MockVisionProvider();

  it("identifie une plante avec une confiance strictement inférieure à 1", async () => {
    const result = await provider.identifyPlant({ imageUrl: "photo-test.jpg" });
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThan(1);
    expect(result.commonName).toBeTruthy();
  });

  it("est déterministe pour une même clé d'image", async () => {
    const a = await provider.identifyPlant({ imageUrl: "meme-photo.jpg" });
    const b = await provider.identifyPlant({ imageUrl: "meme-photo.jpg" });
    expect(a.scientificName).toBe(b.scientificName);
  });

  it("retourne des observations de santé structurées", async () => {
    const health = await provider.analyzePlantHealth({ imageUrl: "photo-sante.jpg" });
    expect(health.score).toBeGreaterThanOrEqual(0);
    expect(health.score).toBeLessThanOrEqual(100);
    expect(health.flags).toHaveProperty("yellowLeaves");
  });
});
