import type { HealthObservation, PlantIdentification } from "@/types";
import type { PlantVisionInput, PlantVisionProvider } from "./types";
import { healthSchema, identificationSchema, IDENTIFY_PROMPT, healthPrompt, toBase64Data, extractJson } from "./shared-llm-vision";

const MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const REQUEST_TIMEOUT_MS = 30_000;
const DEFAULT_MODEL = "claude-sonnet-5";

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicMessagesResponse {
  content?: AnthropicContentBlock[];
  error?: { message?: string };
}

async function callClaudeVision(params: { apiKey: string; model: string; prompt: string; input: PlantVisionInput }): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(MESSAGES_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": params.apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: params.model,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: params.input.mimeType, data: toBase64Data(params.input) } },
              { type: "text", text: params.prompt },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });

    const data = (await response.json()) as AnthropicMessagesResponse;
    if (!response.ok) {
      throw new Error(`Claude a répondu ${response.status} : ${data.error?.message ?? "erreur inconnue"}`);
    }

    const text = data.content?.find((block) => block.type === "text")?.text;
    if (!text) {
      throw new Error("Claude n'a renvoyé aucun texte exploitable.");
    }
    return extractJson(text, "Claude");
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fournisseur de vision basé sur Claude (Anthropic). Implémente la même
 * interface que PlantIdVisionProvider — interchangeable sans toucher au
 * Scanner ni au reste de l'app (voir docs/ai-architecture.md).
 *
 * Nécessite AI_PROVIDER=bloom et ANTHROPIC_API_KEY. Payant à l'usage (pas
 * de palier gratuit permanent) — voir GeminiVisionProvider pour l'option
 * sans coût, choisie par défaut par l'utilisateur.
 */
export class BloomVisionProvider implements PlantVisionProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string = DEFAULT_MODEL,
  ) {}

  async identifyPlant(input: PlantVisionInput): Promise<PlantIdentification> {
    const raw = await callClaudeVision({ apiKey: this.apiKey, model: this.model, prompt: IDENTIFY_PROMPT, input });
    const parsed = identificationSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`Réponse de Claude invalide pour l'identification : ${parsed.error.message}`);
    }
    return parsed.data;
  }

  async analyzePlantHealth(input: PlantVisionInput & { speciesHint?: string }): Promise<HealthObservation> {
    const raw = await callClaudeVision({ apiKey: this.apiKey, model: this.model, prompt: healthPrompt(input.speciesHint), input });
    const parsed = healthSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`Réponse de Claude invalide pour l'analyse de santé : ${parsed.error.message}`);
    }
    return parsed.data;
  }
}
