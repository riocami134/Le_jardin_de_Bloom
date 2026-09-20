# Architecture — Le Jardin de Bloom

## Stack

Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind CSS 3 ·
PostgreSQL · Prisma · Auth.js (NextAuth v5, credentials) · Zod ·
stockage objet abstrait (mock local par défaut, S3/Supabase branchable).

## Principes

- **Server Components par défaut.** Client Components uniquement pour
  l'interactivité navigateur (formulaires, scanner/caméra, boussole,
  animations Bloom, tabs, modals).
- **Server Actions** pour les mutations simples depuis des formulaires
  (care actions, onboarding, paramètres).
- **Route Handlers** (`app/api/**`) pour les endpoints consommés en client
  fetch (scanner, recherche, IA) et pour une surface HTTP documentée
  (section 46 du cahier des charges).
- **Toute la logique métier vit dans `src/server/services` et
  `src/lib/**`**, jamais directement dans les composants React
  (`src/server/queries` pour la lecture, `src/server/actions` pour l'écriture).
- **Providers interchangeables** (règle anti-mock cassé) : chaque
  intégration externe (vision IA, raisonnement Bloom, météo, stockage) est
  définie par une interface TypeScript ; l'implémentation Mock et
  l'implémentation réelle respectent strictement la même interface.
- **Autorisation systématique côté serveur** : chaque query/action reçoit
  `session.user.id` depuis `auth()`, jamais depuis un paramètre client.

## Arborescence

```
src/
  app/
    (marketing)/                # pages publiques (accueil non connecté)
    (auth)/login, register
    (app)/                      # zone connectée, layout avec navigation
      layout.tsx, page.tsx (accueil)
      onboarding/
      plants/, plants/[id]/
      scanner/
      explore/, explore/[speciesId]/, explore/compare/
      garden/
      profile/
      settings/, settings/privacy/
    api/
      plants/, plants/[id]/photos, plants/[id]/analysis, plants/[id]/history,
      plants/[id]/care, species/, species/[id]/, species/search,
      scanner/identify, scanner/analyze, bloom/conversation, bloom/message,
      weather/, garden/, garden/items, auth/[...nextauth]
  components/
    ui/          # Button, Card, Badge, Chip, Input, Modal, Tabs, ...
    bloom/       # BloomCharacter, BloomMessage, BloomAdvice
    plants/      # PlantCard, PlantHealthCard, PlantTimeline, PlantPhoto...
    scanner/     # Scanner, ScannerResult, HealthAnalysis, HealthScore
    garden/      # Garden, GardenItem, GardenSeason, Achievement...
    weather/     # WeatherCard
    explore/     # SpeciesCard, SpeciesComparison
    navigation/  # BottomNavigation, Sidebar
  lib/
    auth/ db/ ai/ weather/ storage/ botanics/ recommendations/
    notifications/ validation/
  server/
    actions/ queries/ services/
  hooks/ types/ constants/ config/ styles/
prisma/
  schema.prisma seed.ts
public/
  bloom/ plants/ icons/ illustrations/
tests/
  unit/ integration/ e2e/
docs/
```

## Flux de données

```
UI (Client/Server Component)
   → server/queries/*.ts (lecture, filtrée par session.user.id)
   → server/actions/*.ts (écriture, Zod validation puis Prisma)
   → server/services/*.ts (logique métier pure : BloomService,
     RecommendationEngine, LocationCompatibilityService)
   → lib/{ai,weather,storage}/*Provider (interfaces + Mock/Real)
   → prisma (accès DB)
```

Les Route Handlers `app/api/**` appellent les mêmes `server/queries` et
`server/actions` que les Server Actions — pas de logique dupliquée.

## State management

Pas de state manager global. Server Components + Server Actions + URL state
(`searchParams` pour les filtres Explorer) + `useState`/`useReducer` local
pour l'UI (scanner steps, tabs, modals). Zustand n'est pas installé : aucun
besoin identifié à ce stade (le scanner et l'onboarding utilisent un state
local de formulaire suffisant).

## Authentification

Auth.js v5, provider Credentials (email + mot de passe hashé bcrypt),
session JWT (pas d'adapter DB : un seul provider credentials, pas besoin de
lier des comptes OAuth). Middleware Next.js protège toutes les routes
sous `(app)`. Chaque query serveur revalide `session.user.id` — jamais de
confiance dans un `userId` transmis par le client (règle section 72).

## Déploiement

Vercel. Build Next.js standard (`next build`). Variables d'environnement
documentées dans `.env.example` et `README.md`. Base PostgreSQL externe
(Vercel Postgres / Supabase / Neon) — non fournie dans ce dépôt.

## Décisions techniques prises sans blocage

| Sujet | Décision | Raison |
|---|---|---|
| Police "More Sugar" | Fallback Baloo 2 (Google Fonts) tant que le fichier licencié n'est pas fourni | Police non distribuée publiquement, voir `design-system.md` |
| Stockage images | `MockStorageProvider` (filesystem local `public/uploads` en dev) | Pas de credentials S3/Supabase fournis ; interface `StorageProvider` prête pour bascule |
| IA vision / raisonnement | `MockVisionProvider` / `MockBloomProvider` déterministes | Pas de clé IA fournie ; interfaces prêtes pour bascule |
| Météo | `MockWeatherProvider` | Pas de clé météo fournie |
| Base de données au build | Prisma Client généré au build (`prisma generate`), pas de connexion DB requise pour `next build` | Permet un build Vercel reproductible même sans DB provisionnée en amont des migrations |
| Groupe `(marketing)` | Non créé comme route distincte : `/` est directement la page protégée (accueil connecté), le contenu marketing (slogan, pitch, Bloom) vit sur `/login` et `/register` | Deux route groups ne peuvent pas posséder la même URL `/` en App Router ; éviter un chemin public séparé (ex. `/welcome`) non listé dans le cahier des charges |
