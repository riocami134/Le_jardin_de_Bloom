import { z } from "zod";
import type { HealthObservation, PlantIdentification } from "@/types";
import type { PlantVisionInput, PlantVisionProvider } from "./types";

const MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const REQUEST_TIMEOUT_MS = 30_000;
const DEFAULT_MODEL = "claude-sonnet-5";

const identificationSchema = z.object({
  scientificName: z.string().min(1),
  commonName: z.string().min(1),
  confidence: z.number().min(0).max(1),
  alternativeMatches: z
    .array(z.object({ scientificName: z.string().min(1), commonName: z.string().min(1), confidence: z.number().min(0).max(1) }))
    .optional(),
});

const healthSchema = z.object({
  score: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  flags: z.object({
    yellowLeaves: z.boolean(),
    brownLeaves: z.boolean(),
    wilting: z.boolean(),
    spots: z.boolean(),
    pestsVisible: z.boolean(),
  }),
  notes: z.string().optional(),
});

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicMessagesResponse {
  content?: AnthropicContentBlock[];
  error?: { message?: string };
}

function toBase64Data({ imageBase64 }: PlantVisionInput): string {
  const commaIndex = imageBase64.indexOf(",");
  return imageBase64.startsWith("data:") && commaIndex !== -1 ? imageBase64.slice(commaIndex + 1) : imageBase64;
}

/** Extrait le premier bloc JSON `{...}` d'une réponse texte — Claude respecte en général le format demandé, mais ne risque jamais un JSON.parse sur du texte explicatif autour. */
function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Bloom IA n'a pas renvoyé de JSON exploitable.");
  }
  return JSON.parse(text.slice(start, end + 1));
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
      throw new Error("Bloom IA n'a renvoyé aucun texte exploitable.");
    }
    return extractJson(text);
  } finally {
    clearTimeout(timeout);
  }
}

const IDENTIFY_PROMPT = `Tu es un botaniste expert qui identifie des plantes à partir d'une photo pour une application de jardinage grand public en français.

Réponds UNIQUEMENT avec un objet JSON (aucun texte avant ou après), exactement sous cette forme :
{
  "scientificName": "nom scientifique latin",
  "commonName": "nom commun en français",
  "confidence": 0.0 à 1.0,
  "alternativeMatches": [{ "scientificName": "...", "commonName": "...", "confidence": 0.0 à 1.0 }]
}

Si tu n'es pas certain, donne quand même ta meilleure hypothèse avec une confidence basse plutôt que de refuser de répondre. "alternativeMatches" contient au plus 3 espèces (peut être vide).`;

const HEALTH_PROMPT = `Tu es un expert en santé des plantes qui observe une photo pour une application de jardinage grand public en français.

Réponds UNIQUEMENT avec un objet JSON (aucun texte avant ou après), exactement sous cette forme :
{
  "score": 0 à 100 (indice visuel de bonne santé, 100 = aucun signe de problème visible),
  "confidence": 0.0 à 1.0,
  "flags": {
    "yellowLeaves": true/false,
    "brownLeaves": true/false,
    "wilting": true/false,
    "spots": true/false,
    "pestsVisible": true/false
  }
}

Base-toi uniquement sur ce qui est visible sur la photo — jamais d'affirmation qui ne soit pas un indice visuel observable. Un score élevé avec une confidence basse est préférable à une fausse certitude.`;

/**
 * Fournisseur de vision basé sur Claude (Anthropic). Implémente la même
 * interface que PlantIdVisionProvider — interchangeable sans toucher au
 * Scanner ni au reste de l'app (voir docs/ai-architecture.md).
 *
 * Nécessite AI_PROVIDER=bloom et ANTHROPIC_API_KEY. Étape 3 du plan de
 * refonte IA : identification + observations de santé à partir d'une seule
 * photo, sans mémoire ni contexte enrichi — ça viendra aux étapes
 * suivantes (voir bloom-contract.ts pour le contrat cible plus riche).
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
      throw new Error(`Réponse de Bloom IA invalide pour l'identification : ${parsed.error.message}`);
    }
    return parsed.data;
  }

  async analyzePlantHealth(input: PlantVisionInput & { speciesHint?: string }): Promise<HealthObservation> {
    const prompt = input.speciesHint ? `${HEALTH_PROMPT}\n\nEspèce déjà identifiée : ${input.speciesHint}.` : HEALTH_PROMPT;
    const raw = await callClaudeVision({ apiKey: this.apiKey, model: this.model, prompt, input });
    const parsed = healthSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`Réponse de Bloom IA invalide pour l'analyse de santé : ${parsed.error.message}`);
    }
    return parsed.data;
  }
}
