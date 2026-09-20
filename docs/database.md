# Base de données — Le Jardin de Bloom

PostgreSQL + Prisma. Identifiants `cuid()`. Timestamps `createdAt`/`updatedAt`
sur toutes les tables. Soft delete (`deletedAt`) sur `Plant` et `User` (les
photos et historiques restent en cascade uniquement quand la suppression est
définitive et explicitement demandée, cf. `/settings/privacy`).

## Modèles

- **User** — compte, profil onboarding (ville, lieu des plantes, animaux,
  nombre de plantes), consentements RGPD.
- **PlantSpecies** — fiche générale d'une espèce (nom commun, scientifique,
  famille, origine, lumière, température, humidité, arrosage, fertilisation,
  taille, rempotage, propagation, problèmes courants, nuisibles, toxicité,
  catégorie parmi les 18 du PDF, espèces similaires).
- **Plant** — instance possédée par un utilisateur (`userId`, `speciesId`,
  nom donné par l'utilisateur, notes, `status` non-alarmiste
  `healthy | watch | attention | unknown`, `healthScore`, localisation,
  environnement).
- **PlantPhoto** — photo privée liée à une plante, stockage via
  `StorageProvider` (clé objet, jamais d'URL publique permanente).
- **HealthAnalysis** — résultat d'une analyse (score indicatif, confiance,
  observations structurées en JSON, hypothèses, recommandations). Jamais
  affiché comme diagnostic médical certain.
- **Symptom** — symptôme observé/déclaré rattaché à une analyse.
- **CareAction** — action de soin générique (type, date, note) + tables
  spécialisées `WateringEvent`, `FertilizingEvent`, `RepottingEvent`,
  `PruningEvent` pour les métadonnées propres à chaque type.
- **PlantLocation** — pièce/zone où se trouve la plante (nom, intérieur ou
  extérieur, orientation de fenêtre, distance à la fenêtre).
- **Environment** — conditions ambiantes déclarées (température, humidité,
  description de la lumière, notes).
- **WeatherSnapshot** — relevé météo horodaté pour une ville/utilisateur.
- **Reminder** — rappel programmé (type, date prévue, statut, message
  chaleureux).
- **Notification** — notification envoyée/à envoyer à l'utilisateur.
- **Conversation** / **ConversationMessage** — fil de discussion avec Bloom
  (questions de diagnostic progressif, conseils).
- **Achievement** — définition d'un badge (id stable, famille, nom,
  description, icône, condition).
- **UserAchievement** — badge débloqué par un utilisateur (`unlockedAt`).
- **VirtualGarden** — jardin virtuel d'un utilisateur (saison courante,
  niveau global).
- **GardenItem** — élément débloqué dans le jardin (type, état de croissance,
  origine — quelle plante/action l'a généré).

## Relations clés

```
User 1—N Plant
User 1—1 VirtualGarden 1—N GardenItem
Plant N—1 PlantSpecies
Plant 1—N PlantPhoto
Plant 1—N HealthAnalysis 1—N Symptom
Plant 1—N CareAction (1—1 optionnel vers WateringEvent/FertilizingEvent/RepottingEvent/PruningEvent)
Plant 1—1 PlantLocation, 1—1 Environment
Plant 1—N Reminder
User 1—N Notification
User 1—N Conversation 1—N ConversationMessage
User N—N Achievement via UserAchievement
```

Cascade : suppression d'un `Plant` supprime en cascade ses `PlantPhoto`,
`HealthAnalysis`, `CareAction`, `Reminder` (données qui n'ont pas de sens
sans la plante). `User` → `Plant` n'est **pas** en cascade automatique côté
schéma pour éviter une suppression accidentelle ; la suppression de compte
(`/settings/privacy`) est un parcours explicite qui supprime tout dans une
transaction dédiée.

## Système de badges (58 — page 9 du PDF, source de vérité)

| Famille | Badges |
|---|---|
| Premiers pas (6) | Première plante · Premier scan · Première analyse · Premier soin · Première rencontre avec Bloom · Premier jardin |
| Collection (6) | 3 / 5 / 10 / 25 / 50 / 100 plantes |
| Entretien (6) | 10 / 25 / 50 / 100 / 250 / 500 soins |
| Régularité (6) | 7 / 14 / 30 / 60 / 100 / 365 jours de suivi |
| Observation (5) | 5 / 10 / 25 / 50 / 100 photos |
| Santé (6) | Première plante sauvée · Première amélioration · 5 améliorations · 10 améliorations · Expert du diagnostic · Observateur attentif |
| Environnement (5) | Première orientation · Premier boussole · Placement parfait · Maître de la lumière · Jardin bien installé |
| Exploration (5) | Première découverte · 10 / 25 / 50 / 100 espèces découvertes · Explorateur botanique |
| Jardin virtuel (7) | Premier élément débloqué · Premier arbre · Premier massif · Premier décor · Jardin fleuri · Jardin luxuriant · Jardin extraordinaire |
| Saisonniers (5) | Printemps · Été · Automne · Hiver · Une année au jardin |

Explicitement exclus (règle section 33) : classement compétitif, streak
punitif, points agressifs. La famille « Régularité » compte des jours de
suivi cumulés, elle ne réinitialise jamais un compteur en cas d'absence.

## Indexes

`Plant(userId)`, `Plant(speciesId)`, `PlantPhoto(plantId)`,
`HealthAnalysis(plantId)`, `CareAction(plantId, type)`, `Reminder(userId,
scheduledFor)`, `UserAchievement(userId, achievementId)` unique,
`PlantSpecies(scientificName)` unique.
