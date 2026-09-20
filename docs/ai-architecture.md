# Architecture IA — Le Jardin de Bloom

## Principe

Aucun couplage direct de l'UI à un fournisseur IA. Deux interfaces, chacune
avec une implémentation Mock déterministe utilisée par défaut, et un point
d'extension pour un vrai provider (Phase 6).

```ts
interface PlantVisionProvider {
  identifyPlant(input: { imageUrl: string }): Promise<PlantIdentification>
  analyzePlantHealth(input: { imageUrl: string; speciesHint?: string }): Promise<HealthObservation>
}

interface BloomReasoningProvider {
  generateQuestions(context: DiagnosisContext): Promise<BloomQuestion[]>
  generateRecommendation(context: DiagnosisContext): Promise<Recommendation>
  generateBloomMessage(context: BloomContext): Promise<BloomMessage>
}
```

Emplacement : `src/lib/ai/vision/{types.ts,mock-vision-provider.ts}`,
`src/lib/ai/bloom/{types.ts,mock-bloom-provider.ts}`,
`src/lib/ai/index.ts` (factory qui choisit Mock ou Real selon `AI_API_KEY`).

Toutes les réponses (mock ou réelles) sont validées avec Zod avant d'entrer
dans le reste de l'application — un provider réel qui répond n'importe quoi
ne peut pas corrompre l'état de l'app.

## Diagnostic progressif

```
PHOTO → OBSERVATION → HYPOTHÈSES → QUESTIONS (2–3 max) → CONTEXTE → RECOMMANDATION
```

`BloomService.buildDiagnosis()` orchestre : observation (vision provider) →
hypothèses → si confiance insuffisante, `generateQuestions()` (2–3 questions
parmi la liste de la charte) → une fois les réponses utilisateur connues,
`generateRecommendation()`.

## Fiabilité (règle section 71)

- Jamais de certitude affichée si `confidence < 0.75` : formulation
  systématique en « pourrait correspondre à… », « les signes observés
  méritent d'être vérifiés… ».
- Le score de santé est toujours affiché avec le label « Indice visuel
  indicatif », jamais présenté comme un diagnostic médical/scientifique.
- Si l'information manque pour conclure, le pipeline pose une question au
  lieu d'inventer une réponse.

## Bloom Engine

`BloomService` (`src/server/services/bloom-service.ts`) transforme un
contexte (plante, historique, météo, dernière analyse) en :

```json
{ "emotion": "advising", "message": "Vérifie le substrat avant d'arroser 🌱", "priority": "normal" }
```

`emotion` ∈ `BloomEmotion` (10 valeurs de la charte). `priority` ∈
`low | normal | high` — jamais formulée de façon anxiogène même en `high`.

## Recommendation Engine

`RecommendationEngine` (`src/server/services/recommendation-engine.ts`) est
indépendant de l'UI et de l'IA générative : c'est un moteur de règles
contextuelles (pas de calendrier fixe type « arroser tous les 7 jours »).

Entrées : `Plant`, `PlantSpecies`, `Environment`, `PlantLocation`,
`WeatherSnapshot`, historique de soins, historique de santé, réponses
utilisateur. Sortie : `Recommendation { action, reason, explanation,
confidence, priority }`.

## Location Compatibility Engine

`LocationCompatibilityService` calcule un `compatibilityScore` (0–100) par
pièce/emplacement à partir des besoins de l'espèce et de l'environnement
déclaré, avec `reasons` et `warnings` explicites (jamais un score nu).

## Mock providers — déterminisme

Les mocks n'appellent aucune API externe : ils dérivent un résultat stable à
partir de l'input (hash simple du nom de fichier / de l'espèce déjà connue
sur la plante) pour que l'expérience de démo reste cohérente d'un rafraîchissement
à l'autre, sans jamais prétendre à une vraie vision par ordinateur.

## Bascule vers un vrai provider (Phase 6)

1. Implémenter `RealVisionProvider` / `RealBloomProvider` respectant les
   mêmes interfaces dans `src/lib/ai/{vision,bloom}/real-*-provider.ts`.
2. Renseigner `AI_API_KEY` (et éventuellement `AI_PROVIDER`) dans les
   variables d'environnement serveur (jamais exposées au client).
3. Aucune modification de l'UI n'est nécessaire : elle ne connaît que les
   types `PlantIdentification`, `HealthObservation`, `Recommendation`,
   `BloomMessage`.
