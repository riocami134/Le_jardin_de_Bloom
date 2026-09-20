# Le Jardin de Bloom — Product Synthesis

> « Petite plante, grande aventure ! »
> « Le Jardin de Bloom, c'est votre jardin… version jeu vidéo ! »

## ✅ Source de vérité : `Jardin.pdf`

Le fichier `Jardin.pdf` (« Charte graphique - Mica », 12 pages) a été fourni et
analysé intégralement, page par page. Il confirme et enrichit les spécifications
textuelles du prompt de cadrage :

1. Couverture — logo, slogan, mascotte.
2. Concept — pitch produit.
3. Nos valeurs — Bienveillance, Curiosité, Plaisir, Complicité.
4. Bloom — personnalité, rôle, traits (joyeux/curieux/concentré/inquiet/fier).
5. Couleurs — palette 11 couleurs (confirmée, voir `design-system.md`).
6. Typographie — More Sugar (titres) / Quicksand (texte).
7. Les émotions de Bloom — planche des 10 expressions.
8. Les plantes — 18 catégories illustrées (succulentes, palmiers, fleuries,
   aromatiques, potager, fruits, arbres, arbustes, grimpantes, retombantes,
   tropicales, méditerranéennes, jardin, bulbes, fougères, carnivores,
   aquatiques, bonsaïs).
9. Les badges — système de 58 badges répartis en 9 familles (voir `database.md`).
10. Météo — maquette de carte météo (jour courant + prévisions 5 jours).
11. La boussole — maquette d'orientation cardinale.
12. Le jardin virtuel — illustration cottagecore (maison, serre, potager,
    fontaine, bassin, coin salon, animaux).

**Assets Bloom réels extraits du PDF** (et non recréés) : les 10 illustrations
d'émotion ont été extraites en PNG avec transparence directement depuis les
objets image embarqués du PDF (page 7) et placées dans
`public/bloom/emotions/bloom-{emotion}.png`. Le portrait « hero » (page 1) est
dans `public/bloom/bloom-hero.png`. Les illustrations de fond (jardin, météo,
boussole) sont dans `public/illustrations/`. `BloomCharacter` affiche ces
fichiers réels via `next/image` — aucun nouveau personnage n'a été généré,
conformément à la règle absolue de la section 3.

Les 18 icônes de catégories de plantes et les 58 icônes de badges sont fusionnées
en une seule image par planche dans le PDF (pas d'objets individuels
extractibles proprement) : elles sont donc représentées dans l'UI par des
emoji/pictogrammes simples repris des libellés de la charte, en attendant que
des fichiers sources individuels (SVG/PNG détourés) soient fournis pour un
remplacement 1:1.

## Concept

Un assistant intelligent + un gestionnaire de plantes + un outil de suivi +
un outil de découverte botanique + une expérience cozy + un jardin virtuel.

Boucle produit :

```
IDENTIFIER → ANALYSER → ENREGISTRER → SUIVRE → CONSEILLER → AMÉLIORER → JARDIN VIRTUEL
```

Promesse : « Prenez soin de vos plantes dans la vraie vie, et faites grandir
votre jardin dans le jeu. »

## Valeurs

- **Bienveillance** — prendre soin sans culpabiliser.
- **Curiosité** — donner envie d'observer et comprendre.
- **Plaisir** — transformer le jardinage en expérience amusante.
- **Complicité** — Bloom est une présence chaleureuse, pas un robot.

Ton UX : chaleureux, amical, ludique, rassurant, positif, simple. Jamais
culpabilisant, froid ou excessivement technique.

## Bloom

Bloom est le petit jardinier du jeu : il observe, conseille, accompagne,
réagit. Il n'est pas une simple mascotte décorative.

États émotionnels (`BloomEmotion`) :
`happy | worried | focused | neutral | excited | advising | surprised |
sleeping | celebrating | cute`

Règle d'usage : Bloom apparaît avec parcimonie — onboarding, conseil,
analyse, succès, découverte, erreur, chargement, jardin. Jamais en
décoration permanente.

## Règle jeu vidéo cozy

Sensation de progression sans pression : pas de compétition, pas de
classement, pas de streak punitif. Une plante malade ne doit jamais donner
un sentiment d'échec à l'utilisateur.

## Règle fiabilité IA

Ne jamais présenter une analyse comme certaine. Toujours nuancer
(« pourrait correspondre à… », « Bloom remarque des signes qui méritent
d'être vérifiés… »). Poser une question plutôt que d'inventer une certitude.

## Phases (voir `docs/roadmap.md` pour le détail)

0. Fondations — 1. MVP — 2. Intelligence — 3. Environnement — 4. Explorer —
5. Jardin — 6. IA avancée.
