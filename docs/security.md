# Sécurité — Le Jardin de Bloom

## Autorisation

- Toute query/action serveur récupère `session.user.id` via `auth()`
  (`src/lib/auth/session.ts`) — jamais un `userId` transmis par le client.
- Chaque requête Prisma sur une ressource utilisateur (`Plant`, `Photo`,
  `Reminder`, …) filtre systématiquement par `userId`, y compris pour un
  accès par `id` (`where: { id, userId }`, jamais `where: { id }` seul).
- Middleware (`src/middleware.ts`) protège toutes les routes sous `(app)` et
  `app/api/**` sauf auth/marketing.

## Validation

Toute entrée externe (body de Route Handler, formData de Server Action,
réponse de provider IA) passe par un schéma Zod avant d'atteindre la couche
métier (`src/lib/validation/*.ts`). Aucune donnée client n'est utilisée sans
validation, y compris les `searchParams`.

## Fichiers

- Formats acceptés : JPEG, PNG, WEBP. Vérification MIME **et** extension.
- Taille limite appliquée côté serveur (`MAX_UPLOAD_SIZE_BYTES`).
- Stockage privé par défaut (`StorageProvider.getSignedUrl`), jamais d'URL
  publique permanente pour une photo utilisateur.

## Secrets

`DATABASE_URL`, `AUTH_SECRET`, clés de stockage, `AI_API_KEY`,
`WEATHER_API_KEY` : uniquement lues côté serveur (`process.env` dans
`src/lib/**`/`src/server/**`), jamais exposées via `NEXT_PUBLIC_*` ni
sérialisées vers un Client Component.

## Erreurs

Les erreurs internes (stack trace, message Prisma, clé API) ne sont jamais
renvoyées au client. `src/lib/errors.ts` normalise toute erreur serveur en
message chaleureux générique + code de log interne (`logger.error` côté
serveur uniquement).

## En-têtes / cookies

Cookies de session `httpOnly`, `secure` en production, `sameSite: lax`
(défaut Auth.js). En-têtes de sécurité de base ajoutés dans
`next.config.ts` (`X-Content-Type-Options`, `Referrer-Policy`,
`X-Frame-Options`).

## RGPD / vie privée

`/settings/privacy` permet : consultation des données, export JSON,
suppression des photos, suppression de l'historique, suppression du compte
(transaction qui efface toutes les données liées), gestion des consentements
(localisation, notifications). Localisation GPS jamais stockée en continu —
seule la ville déclarée à l'onboarding est conservée pour la météo.

## Ce qui reste à durcir en production réelle (hors mock)

- Rate limiting sur les Route Handlers publics (`scanner/*`, `auth/*`) —
  interface prévue dans `src/lib/rate-limit.ts`, backend (Upstash/Redis) à
  brancher.
- Scan antivirus / re-encodage des images uploadées avant stockage définitif.
- Rotation des URLs signées et audit log des accès aux photos.
