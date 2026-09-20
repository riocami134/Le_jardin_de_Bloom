import type { HealthObservation, PlantIdentification } from "@/types";
import type { PlantVisionInput, PlantVisionProvider } from "./types";

const IDENTIFY_URL = "https://api.plant.id/v3/identification?details=common_names&language=fr";
const HEALTH_URL = "https://api.plant.id/v3/health_assessment?details=description,treatment&language=fr";
const KB_DETAILS = "common_names,description,watering,sunlight,propagation_methods,taxonomy";
const REQUEST_TIMEOUT_MS = 20_000;
const KB_TIMEOUT_MS = 10_000;

interface PlantIdSuggestion {
  name?: string;
  probability?: number;
  details?: { common_names?: string[] };
}

interface PlantIdIdentificationResponse {
  access_token?: string;
  result?: { classification?: { suggestions?: PlantIdSuggestion[] } };
}

/**
 * Champs de la base de connaissances Plant.id (endpoint kb/plants) —
 * formes exactes non garanties par la documentation publique, d'où le
 * parsing volontairement permissif dans toText() ci-dessous.
 */
interface PlantIdKbResponse {
  common_names?: string[];
  description?: { value?: string } | string;
  watering?: unknown;
  sunlight?: unknown;
  propagation_methods?: unknown;
  taxonomy?: { family?: string };
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

async function getJson<T>(url: string, apiKey: string, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { headers: { "Api-Key": apiKey }, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Plant.id (kb) a répondu ${response.status}`);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function toDataUri({ imageBase64, mimeType }: PlantVisionInput): string {
  return imageBase64.startsWith("data:") ? imageBase64 : `data:${mimeType};base64,${imageBase64}`;
}

/** Convertit une valeur de forme inconnue (string, tableau, objet {value}) en texte lisible. */
function toText(value: unknown): string | undefined {
  if (typeof value === "string") return value.trim() || undefined;
  if (Array.isArray(value)) {
    const joined = value.filter((v) => typeof v === "string").join(", ");
    return joined || undefined;
  }
  if (value && typeof value === "object" && "value" in value) {
    return toText((value as { value?: unknown }).value);
  }
  return undefined;
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

  /**
   * Best-effort : interroge la base de connaissances Plant.id pour
   * compléter l'identification (famille, lumière, arrosage, propagation).
   * Ne doit jamais faire échouer l'identification elle-même — toute erreur
   * ou forme de réponse inattendue est avalée silencieusement.
   */
  private async fetchSpeciesDetails(accessToken: string | undefined): Promise<PlantIdentification["speciesDetails"]> {
    if (!accessToken) return undefined;
    try {
      const kb = await getJson<PlantIdKbResponse>(
        `https://api.plant.id/v3/kb/plants/${encodeURIComponent(accessToken)}?details=${KB_DETAILS}&language=fr`,
        this.apiKey,
        KB_TIMEOUT_MS,
      );
      const details = {
        family: kb.taxonomy?.family,
        light: toText(kb.sunlight),
        watering: toText(kb.watering),
        propagation: toText(kb.propagation_methods),
      };
      const hasAnyValue = Object.values(details).some(Boolean);
      return hasAnyValue ? details : undefined;
    } catch {
      return undefined;
    }
  }

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
    const speciesDetails = await this.fetchSpeciesDetails(data.access_token);

    return {
      scientificName: best!.name ?? "Espèce inconnue",
      commonName: commonNameOf(best!),
      confidence: Math.min(Math.max(best!.probability ?? 0, 0), 1),
      alternativeMatches: rest.slice(0, 3).map((s) => ({
        scientificName: s.name ?? "Espèce inconnue",
        commonName: commonNameOf(s),
        confidence: Math.min(Math.max(s.probability ?? 0, 0), 1),
      })),
      speciesDetails,
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
