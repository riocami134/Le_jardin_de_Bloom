# Roadmap — Le Jardin de Bloom

## Phase 0 — Fondations ✅ (ce commit)
Next.js/TS strict/Tailwind, design tokens, polices, structure, Prisma
schema + seed, auth de base, layout responsive, navigation mobile/desktop.

## Phase 1 — MVP ✅ (ce commit)
Accueil, Mes plantes (liste + ajout), fiche plante, upload photo, scanner
(mock complet), analyse (mock), Bloom (composant + messages contextuels).

## Phase 2 — Intelligence ✅ (ce commit, version mock)
Historique de soins, santé (score + évolution), questions de diagnostic
progressif, moteur de recommandation contextuel, comparaison de photos,
rappels.

## Phase 3 — Environnement ✅ (ce commit, version mock)
Ville (onboarding), météo (mock provider), pièces/environnement, orientation
de fenêtre, boussole (API navigateur + fallback manuel), meilleur
emplacement (LocationCompatibilityService).

## Phase 4 — Explorer ✅ (ce commit)
Fiches espèces (Monstera, Calathea, Basilic, Citronnier en seed), catégories
(18 de la charte), recherche, filtres, comparateur 2 espèces.

## Phase 5 — Jardin ✅ (ce commit, version initiale)
Jardin virtuel relié aux vraies plantes/actions, saisons, badges (58,
verrouillés/débloqués), progression douce sans compétition.

## Phase 6 — IA avancée (non démarré, point d'extension prêt)
Remplacer `MockVisionProvider`/`MockBloomProvider` par de vrais providers
(voir `ai-architecture.md`), personnalisation fine de Bloom, vraie
météo/localisation, vrai stockage objet signé.

## Dette technique connue / prochaines étapes

- Icônes de catégories de plantes et de badges : actuellement des
  pictogrammes simples (émoji) faute d'assets détourés individuels dans le
  PDF fourni — à remplacer si des fichiers sources par icône sont fournis.
  Police "More Sugar" : fallback Baloo 2 tant que le fichier licencié n'est
  pas fourni (voir `design-system.md`).
- Tests E2E (Playwright) : structure prête (`tests/e2e`), scénarios des 10
  parcours de la section 57 à compléter au fil des sprints suivants.
- Rate limiting et stockage S3/Supabase réels : interfaces prêtes, backends
  à brancher avec de vraies credentials.
- PWA : manifest et icônes présents ; service worker/offline non implémenté.
