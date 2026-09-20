# 🌱 Le Jardin de Bloom

**Petite plante, grande aventure !**

Le Jardin de Bloom, c'est votre jardin… version jeu vidéo. Gérez vos vraies
plantes, suivez leur évolution, apprenez à en prendre soin — et faites
grandir votre jardin virtuel en même temps, accompagné par Bloom.

📚 Voir aussi : [`docs/product.md`](docs/product.md) ·
[`docs/architecture.md`](docs/architecture.md) ·
[`docs/design-system.md`](docs/design-system.md) ·
[`docs/database.md`](docs/database.md) ·
[`docs/ai-architecture.md`](docs/ai-architecture.md) ·
[`docs/security.md`](docs/security.md) · [`docs/roadmap.md`](docs/roadmap.md)

## Stack

Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind CSS ·
PostgreSQL + Prisma · Auth.js · Zod.

## 1. Installation

```bash
npm install
```

## 2. Variables d'environnement

Copier `.env.example` en `.env` et renseigner au minimum `DATABASE_URL` et
`AUTH_SECRET` (généré avec `openssl rand -base64 32`). Toutes les autres
variables sont optionnelles : en leur absence, l'application utilise ses
providers Mock (IA, météo, stockage) — voir `docs/ai-architecture.md`.

```bash
cp .env.example .env
```

## 3. Base de données

Nécessite une base PostgreSQL accessible (locale, Docker, Supabase, Neon,
Vercel Postgres…). Renseigner `DATABASE_URL` dans `.env`.

## 4. Migration Prisma

```bash
npm run db:migrate
```

## 5. Seed (données de démonstration)

```bash
npm run db:seed
```

Crée un compte de démonstration : `demo@jardindebloom.app` /
`JardinDeBloom2026!`, avec 4 plantes, historique, badges et jardin virtuel.

## 6. Développement local

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## 7. Déploiement Vercel

1. Connecter le dépôt sur Vercel.
2. Renseigner les variables d'environnement du `.env.example` dans les
   paramètres du projet Vercel (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL` en
   priorité).
3. Le build (`npm run build`) exécute `prisma generate` automatiquement.
4. Appliquer les migrations sur la base de production avec
   `npm run db:deploy` (depuis la CI ou en local pointé sur la prod).

## 8. Configuration du stockage (photos)

Par défaut, `STORAGE_PROVIDER=mock` écrit les photos dans `public/uploads`
(développement uniquement). Pour un stockage objet réel (S3, Supabase
Storage…), implémenter `StorageProvider` (voir `src/lib/storage/types.ts`)
et renseigner `STORAGE_PROVIDER`, `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY`,
`STORAGE_SECRET_KEY`, `STORAGE_BUCKET`.

## 9. Configuration de l'IA

Par défaut, `AI_PROVIDER=mock` utilise `MockVisionProvider` et
`MockBloomProvider` (aucun appel réseau, réponses déterministes). Pour
brancher un vrai provider, implémenter les interfaces de
`src/lib/ai/vision/types.ts` et `src/lib/ai/bloom/types.ts`, renseigner
`AI_PROVIDER=real` et `AI_API_KEY`.

## 10. Configuration météo

Par défaut, `WEATHER_PROVIDER=mock` génère une météo déterministe par ville
et par jour. Pour un vrai provider météo, implémenter `WeatherProvider`
(voir `src/lib/weather/types.ts`) et renseigner `WEATHER_PROVIDER=real` et
`WEATHER_API_KEY`.

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production (`prisma generate` + `next build`) |
| `npm run start` | Démarre le build de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript stricte |
| `npm run test` | Tests unitaires (Vitest) |
| `npm run test:e2e` | Tests E2E (Playwright, nécessite une base seedée) |
| `npm run db:migrate` | Migration Prisma (dev) |
| `npm run db:deploy` | Migration Prisma (production) |
| `npm run db:seed` | Seed de démonstration |
| `npm run db:studio` | Prisma Studio |

## Charte graphique

La charte graphique officielle (`Jardin.pdf`) a été analysée intégralement
et est la source de vérité du design (palette, typographie, Bloom,
badges…). Voir `docs/design-system.md` pour le détail et les décisions
prises en l'absence de certains fichiers sources (police "More Sugar",
icônes détourées individuelles).

## Compte de démonstration

Après `npm run db:seed` :

- Email : `demo@jardindebloom.app`
- Mot de passe : `JardinDeBloom2026!`

Ces données sont clairement séparées de toute donnée réelle (utilisateur
unique connu, préfixé "démo" dans le code).
