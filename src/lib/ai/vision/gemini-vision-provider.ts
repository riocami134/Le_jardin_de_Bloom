import type { HealthObservation, PlantIdentification } from "@/types";
import type { PlantVisionInput, PlantVisionProvider } from "./types";
import { healthSchema, identificationSchema, IDENTIFY_PROMPT, healthPrompt, toBase64Data, extractJson } from "./shared-llm-vision";

const REQUEST_TIMEOUT_MS = 15_000;
// gemini-2.5-flash répond 404 "no longer available to new users" pour un
// compte Gemini récent (confirmé en production) : pour ces comptes, seul
// gemini-3.8-flash — tout juste sorti — est accessible. C'est aussi, de ce
// fait, le modèle le plus demandé du moment sur l'API publique gratuite
// (503 "high demand" fréquents, alors que le même compte fonctionne sans
// souci dans Google AI Studio, qui a sa propre capacité réservée). Pas
// d'alternative tant que Google n'ouvre pas d'autres modèles à ces comptes
// ou ne stabilise pas la capacité de celui-ci — on compense par des
// nouvelles tentatives (voir maxDuration=60 sur les routes /api/scanner/*).
const DEFAULT_MODEL = "gemini-3.8-flash";
// Le palier gratuit de Gemini est partagé entre tous les utilisateurs et
// répond parfois 503 "high demand" / 429 "rate limited" sous forte charge —
// transitoire, pas une vraie panne. Sous très forte charge, Gemini peut
// aussi simplement mettre plus de REQUEST_TIMEOUT_MS à répondre : notre
// propre minuteur annule alors la requête (AbortError), un signe de
// congestion tout aussi transitoire — on retente dans les deux cas.
//
// Budget total dans le pire cas : 3 × REQUEST_TIMEOUT_MS (45s) + somme des
// délais (4.5s) ≈ 49.5s — volontairement bien en dessous de maxDuration=60
// sur les routes appelantes. Un budget trop proche de la limite ferait tuer
// la fonction par Vercel en pleine tentative, ce qui ressort comme une
// AbortError opaque au lieu d'un message d'erreur clair.
const RETRYABLE_STATUS = new Set([429, 503]);
const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [1_500, 3_000];

interface GeminiPart {
  text?: string;
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
  error?: { message?: string };
}

type RetryableError = Error & { retryable?: boolean };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGeminiVisionOnce(params: { apiKey: string; model: string; prompt: string; input: PlantVisionInput }): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${params.apiKey}`;
    let response: Response;
    try {
      response = await fetch(url, {
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
    } catch (cause) {
      // L'abandon de notre propre minuteur déclenche une AbortError native
      // (DOMException) plutôt qu'une réponse HTTP — un signe de congestion
      // tout aussi transitoire qu'un 503, donc tout aussi digne d'être
      // retenté, mais qu'il faut détecter différemment (pas de `response`).
      const timedOut = cause instanceof Error && cause.name === "AbortError";
      const error: RetryableError = new Error(
        timedOut ? "Gemini n'a pas répondu à temps (surcharge probable)." : "Gemini est injoignable pour le moment.",
      );
      error.retryable = timedOut;
      throw error;
    }

    const data = (await response.json()) as GeminiResponse;
    if (!response.ok) {
      const error: RetryableError = new Error(`Gemini a répondu ${response.status} : ${data.error?.message ?? "erreur inconnue"}`);
      error.retryable = RETRYABLE_STATUS.has(response.status);
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
      const retryable = (error as RetryableError).retryable;
      const isLastAttempt = attempt === MAX_ATTEMPTS - 1;
      if (!retryable || isLastAttempt) {
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
