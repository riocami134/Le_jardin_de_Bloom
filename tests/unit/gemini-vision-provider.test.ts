import { afterEach, describe, expect, it, vi } from "vitest";
import { GeminiVisionProvider } from "@/lib/ai/vision/gemini-vision-provider";

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

describe("GeminiVisionProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("identifie une plante à partir d'une réponse JSON valide de Gemini", async () => {
    mockFetchOnce(200, {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  scientificName: "Monstera deliciosa",
                  commonName: "Monstera",
                  confidence: 0.88,
                  alternativeMatches: [],
                }),
              },
            ],
          },
        },
      ],
    });

    const provider = new GeminiVisionProvider("fake-key");
    const result = await provider.identifyPlant({ imageBase64: "aGVsbG8=", mimeType: "image/jpeg" });

    expect(result.scientificName).toBe("Monstera deliciosa");
    expect(result.commonName).toBe("Monstera");
    expect(result.confidence).toBe(0.88);
  });

  it("accepte du texte explicatif autour du JSON (extrait uniquement l'objet)", async () => {
    mockFetchOnce(200, {
      candidates: [
        {
          content: {
            parts: [
              { text: `Voici mon analyse :\n${JSON.stringify({ scientificName: "Ocimum basilicum", commonName: "Basilic", confidence: 0.8 })}\nJ'espère que ça aide !` },
            ],
          },
        },
      ],
    });

    const provider = new GeminiVisionProvider("fake-key");
    const result = await provider.identifyPlant({ imageBase64: "aGVsbG8=", mimeType: "image/jpeg" });
    expect(result.commonName).toBe("Basilic");
  });

  it("rejette une réponse qui ne respecte pas le schéma attendu", async () => {
    mockFetchOnce(200, {
      candidates: [{ content: { parts: [{ text: JSON.stringify({ commonName: "Sans nom scientifique" }) }] } }],
    });

    const provider = new GeminiVisionProvider("fake-key");
    await expect(provider.identifyPlant({ imageBase64: "aGVsbG8=", mimeType: "image/jpeg" })).rejects.toThrow(/invalide/);
  });

  it("propage une erreur claire si Gemini répond en erreur", async () => {
    mockFetchOnce(400, { error: { message: "clé API invalide" } });

    const provider = new GeminiVisionProvider("fake-key");
    await expect(provider.identifyPlant({ imageBase64: "aGVsbG8=", mimeType: "image/jpeg" })).rejects.toThrow(/400/);
  });

  it("retourne des observations de santé structurées et valides", async () => {
    mockFetchOnce(200, {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  score: 82,
                  confidence: 0.65,
                  flags: { yellowLeaves: false, brownLeaves: true, wilting: false, spots: false, pestsVisible: false },
                }),
              },
            ],
          },
        },
      ],
    });

    const provider = new GeminiVisionProvider("fake-key");
    const health = await provider.analyzePlantHealth({ imageBase64: "aGVsbG8=", mimeType: "image/jpeg" });
    expect(health.score).toBe(82);
    expect(health.flags.brownLeaves).toBe(true);
  });
});
