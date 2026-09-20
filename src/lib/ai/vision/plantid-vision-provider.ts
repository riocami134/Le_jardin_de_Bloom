import type { HealthObservation, PlantIdentification } from "@/types";
import type { PlantVisionInput, PlantVisionProvider } from "./types";

const IDENTIFY_URL = "https://api.plant.id/v3/identification?details=common_names&language=fr";
const HEALTH_URL = "https://api.plant.id/v3/health_assessment?details=description,treatment&language=fr";
const REQUEST_TIMEOUT_MS = 20_000;

interface PlantIdSuggestion {
  name?: string;
  probability?: number;
  details?: { common_names?: string[] };
}

interface PlantIdIdentificationResponse {
  result?: { classification?: { suggestions?: PlantIdSuggestion[] } };
}

interface PlantIdDiseaseSuggestion {
  name?: string;
  probability?: number;
}

interface PlantIdHealthResponse {
  result?: {
    is_healthy?: { probability?: number };
    disease?: { suggestions?: PlantIdDiseaseSuggestion[] };
  };
}

async function postJson<T>(url: string, apiKey: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Api-Key": apiKey },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Plant.id a répondu ${response.status} : ${detail.slice(0, 300)}`);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function toDataUri({ imageBase64, mimeType }: PlantVisionInput): string {
  return imageBase64.startsWith("data:") ? imageBase64 : `data:${mimeType};base64,${imageBase64}`;
}

/**
 * Devine un nom commun affichable à partir d'une suggestion Plant.id.
 * L'API renvoie toujours le nom scientifique dans `name` ; les noms
 * communs (si demandés via `details=common_names`) arrivent en français
 * ou en anglais selon la couverture de l'espèce — on prend le premier.
 */
function commonNameOf(suggestion: PlantIdSuggestion): string {
  return suggestion.details?.common_names?.[0] ?? suggestion.name ?? "Plante non identifiée";
}

/**
 * Fournisseur de vision réel basé sur l'API Plant.id (Kindwise).
 * Nécessite AI_PROVIDER=real et AI_API_KEY (clé obtenue sur
 * https://web.plant.id/ — offre d'essai gratuite puis payante selon le
 * volume). Un plan Plant.id différent (ex. Pl@ntNet, Kindwise Crop.health)
 * peut être branché ultérieurement en implémentant la même interface
 * PlantVisionProvider.
 */
export class PlantIdVisionProvider implements PlantVisionProvider {
  constructor(private readonly apiKey: string) {}

  async identifyPlant(input: PlantVisionInput): Promise<PlantIdentification> {
    // Les modificateurs (health, similar_images, classification_level...) sont
    // des paramètres de requête côté Plant.id v3, pas des champs du corps JSON.
    const data = await postJson<PlantIdIdentificationResponse>(IDENTIFY_URL, this.apiKey, {
      images: [toDataUri(input)],
    });

    const suggestions = data.result?.classification?.suggestions ?? [];
    if (suggestions.length === 0) {
      throw new Error("Bloom n'a reconnu aucune plante sur cette photo.");
    }

    const [best, ...rest] = suggestions;
    return {
      scientificName: best!.name ?? "Espèce inconnue",
      commonName: commonNameOf(best!),
      confidence: Math.min(Math.max(best!.probability ?? 0, 0), 1),
      alternativeMatches: rest.slice(0, 3).map((s) => ({
        scientificName: s.name ?? "Espèce inconnue",
        commonName: commonNameOf(s),
        confidence: Math.min(Math.max(s.probability ?? 0, 0), 1),
      })),
    };
  }

  async analyzePlantHealth(input: PlantVisionInput & { speciesHint?: string }): Promise<HealthObservation> {
    const data = await postJson<PlantIdHealthResponse>(HEALTH_URL, this.apiKey, {
      images: [toDataUri(input)],
    });

    const isHealthyProbability = data.result?.is_healthy?.probability ?? 0.5;
    const diseases = data.result?.disease?.suggestions ?? [];
    const topDiseaseNames = diseases
      .filter((d) => (d.probability ?? 0) > 0.1)
      .map((d) => (d.name ?? "").toLowerCase());

    const hasKeyword = (...keywords: string[]) => topDiseaseNames.some((name) => keywords.some((k) => name.includes(k)));

    return {
      score: Math.round(isHealthyProbability * 100),
      confidence: Math.min(Math.max(data.result?.is_healthy?.probability ?? 0.5, 0), 1),
      flags: {
        yellowLeaves: hasKeyword("chlorosis", "yellow", "jaun"),
        brownLeaves: hasKeyword("necrosis", "brown", "brûl", "brun"),
        wilting: hasKeyword("wilt", "flétri"),
        spots: hasKeyword("spot", "tache", "rust", "rouille"),
        pestsVisible: hasKeyword("pest", "insect", "mite", "cochenille", "puceron", "aphid"),
      },
      // Pas de note ici : les suggestions brutes de Plant.id (souvent en
      // anglais, ex. "feeding damage by insects") ne doivent jamais être
      // affichées telles quelles — seuls les flags structurés ci-dessus
      // alimentent le discours de Bloom (voir bloom-service).
    };
  }
}
