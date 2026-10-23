import { z } from "zod";
import type { PlantVisionInput } from "./types";

/**
 * Schémas, prompts et utilitaires partagés entre les fournisseurs de vision
 * basés sur un LLM multimodal (Claude, Gemini...). Chaque provider ne gère
 * que l'appel réseau propre à son API ; le contrat de sortie et la
 * validation restent identiques pour que les résultats soient comparables
 * (étape 9 du plan de refonte IA : comparer les fournisseurs entre eux).
 */

export const identificationSchema = z.object({
  scientificName: z.string().min(1),
  commonName: z.string().min(1),
  confidence: z.number().min(0).max(1),
  alternativeMatches: z
    .array(z.object({ scientificName: z.string().min(1), commonName: z.string().min(1), confidence: z.number().min(0).max(1) }))
    .optional(),
});

export const healthSchema = z.object({
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

export const IDENTIFY_PROMPT = `Tu es un botaniste expert qui identifie des plantes à partir d'une photo pour une application de jardinage grand public en français.

Réponds UNIQUEMENT avec un objet JSON (aucun texte avant ou après), exactement sous cette forme :
{
  "scientificName": "nom scientifique latin",
  "commonName": "nom commun en français",
  "confidence": 0.0 à 1.0,
  "alternativeMatches": [{ "scientificName": "...", "commonName": "...", "confidence": 0.0 à 1.0 }]
}

Si tu n'es pas certain, donne quand même ta meilleure hypothèse avec une confidence basse plutôt que de refuser de répondre. "alternativeMatches" contient au plus 3 espèces (peut être vide).`;

export const HEALTH_PROMPT = `Tu es un expert en santé des plantes qui observe une photo pour une application de jardinage grand public en français.

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

export function healthPrompt(speciesHint?: string): string {
  return speciesHint ? `${HEALTH_PROMPT}\n\nEspèce déjà identifiée : ${speciesHint}.` : HEALTH_PROMPT;
}

/** Retire le préfixe `data:...;base64,` si présent — les deux APIs attendent le base64 brut. */
export function toBase64Data({ imageBase64 }: PlantVisionInput): string {
  const commaIndex = imageBase64.indexOf(",");
  return imageBase64.startsWith("data:") && commaIndex !== -1 ? imageBase64.slice(commaIndex + 1) : imageBase64;
}

/** Extrait le premier bloc JSON `{...}` d'une réponse texte — un LLM respecte en général le format demandé, mais on ne risque jamais un JSON.parse sur du texte explicatif autour. */
export function extractJson(text: string, providerLabel: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`${providerLabel} n'a pas renvoyé de JSON exploitable.`);
  }
  return JSON.parse(text.slice(start, end + 1));
}
