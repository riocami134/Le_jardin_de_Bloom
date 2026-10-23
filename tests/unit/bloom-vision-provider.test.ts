import { afterEach, describe, expect, it, vi } from "vitest";
import { BloomVisionProvider } from "@/lib/ai/vision/bloom-vision-provider";

function mockFetchOnce(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    }),
  );
}

describe("BloomVisionProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("identifie une plante à partir d'une réponse JSON valide de Claude", async () => {
    mockFetchOnce(200, {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            scientificName: "Monstera deliciosa",
            commonName: "Monstera",
            confidence: 0.92,
            alternativeMatches: [],
          }),
        },
      ],
    });

    const provider = new BloomVisionProvider("fake-key");
    const result = await provider.identifyPlant({ imageBase64: "aGVsbG8=", mimeType: "image/jpeg" });

    expect(result.scientificName).toBe("Monstera deliciosa");
    expect(result.commonName).toBe("Monstera");
    expect(result.confidence).toBe(0.92);
  });

  it("accepte du texte explicatif autour du JSON (extrait uniquement l'objet)", async () => {
    mockFetchOnce(200, {
      content: [{ type: "text", text: `Voici mon analyse :\n${JSON.stringify({ scientificName: "Ocimum basilicum", commonName: "Basilic", confidence: 0.8 })}\nJ'espère que ça aide !` }],
    });

    const provider = new BloomVisionProvider("fake-key");
    const result = await provider.identifyPlant({ imageBase64: "aGVsbG8=", mimeType: "image/jpeg" });
    expect(result.commonName).toBe("Basilic");
  });

  it("rejette une réponse qui ne respecte pas le schéma attendu", async () => {
    mockFetchOnce(200, { content: [{ type: "text", text: JSON.stringify({ commonName: "Sans nom scientifique" }) }] });

    const provider = new BloomVisionProvider("fake-key");
    await expect(provider.identifyPlant({ imageBase64: "aGVsbG8=", mimeType: "image/jpeg" })).rejects.toThrow(/invalide/);
  });

  it("propage une erreur claire si Claude répond en erreur", async () => {
    mockFetchOnce(401, { error: { message: "clé API invalide" } });

    const provider = new BloomVisionProvider("fake-key");
    await expect(provider.identifyPlant({ imageBase64: "aGVsbG8=", mimeType: "image/jpeg" })).rejects.toThrow(/401/);
  });

  it("retourne des observations de santé structurées et valides", async () => {
    mockFetchOnce(200, {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            score: 78,
            confidence: 0.7,
            flags: { yellowLeaves: true, brownLeaves: false, wilting: false, spots: false, pestsVisible: false },
          }),
        },
      ],
    });

    const provider = new BloomVisionProvider("fake-key");
    const health = await provider.analyzePlantHealth({ imageBase64: "aGVsbG8=", mimeType: "image/jpeg" });
    expect(health.score).toBe(78);
    expect(health.flags.yellowLeaves).toBe(true);
  });
});
