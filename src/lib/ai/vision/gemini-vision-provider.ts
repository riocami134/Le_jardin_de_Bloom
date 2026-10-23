import type { HealthObservation, PlantIdentification } from "@/types";
import type { PlantVisionInput, PlantVisionProvider } from "./types";
import { healthSchema, identificationSchema, IDENTIFY_PROMPT, healthPrompt, toBase64Data, extractJson } from "./shared-llm-vision";

const REQUEST_TIMEOUT_MS = 30_000;
// Google a retiré gemini-2.0-flash (erreur 404 "no longer available") et
// recommande explicitement gemini-3.8-flash à la place (vu en production,
// 2026-10) — reste un modèle "flash", donc toujours dans le palier gratuit.
const DEFAULT_MODEL = "gemini-3.8-flash";
// Le palier gratuit de Gemini est partagé entre tous les utilisateurs et
// répond parfois 503 "high demand" / 429 "rate limited" sous forte charge —
// transitoire, pas une vraie panne. On retente avant d'abandonner.
const RETRYABLE_STATUS = new Set([429, 503]);
const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [1_000, 2_500];

interface GeminiPart {
  text?: string;
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
  error?: { message?: string };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGeminiVisionOnce(params: { apiKey: string; model: string; prompt: string; input: PlantVisionInput }): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${params.apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: params.prompt },
              { inline_data: { mime_type: params.input.mimeType, data: toBase64Data(params.input) } },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });

    const data = (await response.json()) as GeminiResponse;
    if (!response.ok) {
      const error = new Error(`Gemini a répondu ${response.status} : ${data.error?.message ?? "erreur inconnue"}`);
      (error as Error & { status?: number }).status = response.status;
      throw error;
    }

    const text = data.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text;
    if (!text) {
      throw new Error("Gemini n'a renvoyé aucun texte exploitable.");
    }
    return extractJson(text, "Gemini");
  } finally {
    clearTimeout(timeout);
  }
}

async function callGeminiVision(params: { apiKey: string; model: string; prompt: string; input: PlantVisionInput }): Promise<unknown> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await callGeminiVisionOnce(params);
    } catch (error) {
      const status = (error as Error & { status?: number }).status;
      const isLastAttempt = attempt === MAX_ATTEMPTS - 1;
      if (!status || !RETRYABLE_STATUS.has(status) || isLastAttempt) {
        throw error;
      }
      await sleep(RETRY_DELAYS_MS[attempt] ?? 2_500);
    }
  }
  // Inatteignable (la boucle retourne ou relance à chaque itération) — satisfait le typage.
  throw new Error("Gemini n'a pas pu être appelé.");
}

/**
 * Fournisseur de vision basé sur Google Gemini. Implémente la même
 * interface que PlantIdVisionProvider — interchangeable sans toucher au
 * Scanner ni au reste de l'app (voir docs/ai-architecture.md).
 *
 * Nécessite AI_PROVIDER=gemini et GEMINI_API_KEY. Choisi par défaut par
 * l'utilisateur pour son palier gratuit permanent (pas un essai limité
 * dans le temps) : clé créée sur https://aistudio.google.com/apikey, sans
 * carte bancaire. Les quotas gratuits sont largement suffisants pour un
 * usage personnel — au-delà, les appels sont simplement refusés (pas de
 * facturation surprise tant qu'aucune carte n'est renseignée).
 */
export class GeminiVisionProvider implements PlantVisionProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string = DEFAULT_MODEL,
  ) {}

  async identifyPlant(input: PlantVisionInput): Promise<PlantIdentification> {
    const raw = await callGeminiVision({ apiKey: this.apiKey, model: this.model, prompt: IDENTIFY_PROMPT, input });
    const parsed = identificationSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`Réponse de Gemini invalide pour l'identification : ${parsed.error.message}`);
    }
    return parsed.data;
  }

  async analyzePlantHealth(input: PlantVisionInput & { speciesHint?: string }): Promise<HealthObservation> {
    const raw = await callGeminiVision({ apiKey: this.apiKey, model: this.model, prompt: healthPrompt(input.speciesHint), input });
    const parsed = healthSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`Réponse de Gemini invalide pour l'analyse de santé : ${parsed.error.message}`);
    }
    return parsed.data;
  }
}
