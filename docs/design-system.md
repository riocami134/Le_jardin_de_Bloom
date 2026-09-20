# Design System — Le Jardin de Bloom

Source de vérité : `Jardin.pdf` (charte graphique Mica, 12 pages) + assets
extraits dans `public/bloom/` et `public/illustrations/`.

## Palette

Jamais de noir pur (`#000000`) ni de blanc pur (`#FFFFFF`). Texte foncé =
Brun Cacao. Surface claire = Ivoire Rosé.

| Token              | Hex       | Nom            |
|--------------------|-----------|----------------|
| `--color-sky`       | `#A3D6FF` | Bleu Ciel Doux |
| `--color-peach`      | `#EDAE84` | Pêche Dorée    |
| `--color-taupe`      | `#A27E6F` | Taupe Rosé     |
| `--color-peach-light`| `#F3D0B8` | Pêche Crème    |
| `--color-cocoa`      | `#654B43` | Brun Cacao     |
| `--color-ivory`      | `#FFF6F2` | Ivoire Rosé    |
| `--color-sage`       | `#91B398` | Vert Sauge     |
| `--color-leaf`       | `#6AAC96` | Vert Feuille   |
| `--color-honey`      | `#FECA7A` | Jaune Miel     |
| `--color-coral`      | `#FE7E61` | Corail Vif     |
| `--color-pink`       | `#FFBEB5` | Rose Poudré    |

Toutes déclarées dans `src/styles/tokens.css`, jamais en hex dans les
composants — utiliser les classes utilitaires Tailwind générées à partir de
ces tokens (`bg-sage`, `text-cocoa`, `border-peach`, etc.).

Usage observé dans le PDF :
- Fond de page / marketing : Taupe Rosé.
- Cartes de contenu : Ivoire Rosé, coins très arrondis, ombre douce.
- Bandeaux de titre de section : fond Ivoire Rosé sur fond Taupe.
- Pills/valeurs : fond Vert Sauge, texte Ivoire.
- Accents chaleureux (cœurs, badges, CTA) : Corail Vif, Jaune Miel, Rose Poudré.
- États "bonne santé" : Vert Feuille / Vert Sauge. États "à surveiller" :
  Jaune Miel. États "attention" : Corail Vif. Toujours doublés d'un texte
  ou d'une icône (jamais la couleur seule, cf. accessibilité).

## Typographie

- Titres (Display, H1–H4) : **More Sugar** — display arrondie, épaisse,
  dessinée à la main, tout en capitales dans la charte.
- Texte (body, small, caption, labels de formulaire) : **Quicksand** —
  arrondie, lisible, disponible sur Google Fonts (licence OFL, intégration
  légale via `next/font/google`).
- More Sugar n'est pas distribuée sur Google Fonts. Elle doit être ajoutée en
  tant que police locale (`next/font/local`) si un fichier licencié est
  fourni dans `src/assets/fonts/`. **Décision prise en son absence** : un
  fallback display arrondi et chaleureux (`Baloo 2`, Google Fonts, licence
  OFL, silhouette proche — bold/rounded) est utilisé pour `--font-heading`
  tant que le fichier More Sugar n'est pas fourni. Dès qu'il l'est, il suffit
  de le déposer dans `src/assets/fonts/` et de mettre à jour
  `src/app/fonts.ts`.

```css
--font-heading: var(--font-heading-family), system-ui, sans-serif;
--font-body: var(--font-body-family), system-ui, sans-serif;
```

Hiérarchie : Display 40/48, H1 32/40, H2 28/36, H3 22/28, H4 18/24,
Body 16/24, Small 14/20, Caption 12/16 (tailles en `rem`, voir `tokens.css`).

## Radius, ombres, espacement

- `--radius-card`: 24px (grandes cartes, bandeaux de titre).
- `--radius-button`: 16px.
- `--radius-pill`: 999px (chips, valeurs, badges de statut).
- `--shadow-soft`: ombre très douce, jamais dure ni noire pure
  (`rgba(101, 75, 67, 0.12)`).
- Espacement en échelle 4px (`--space-1` … `--space-16`).

## Bloom

Bloom est un petit lapin bélier (oreilles tombantes), fourrure bicolore
brun/roux, joues roses, grands yeux bruns expressifs. Les 10 expressions du
PDF sont extraites telles quelles (aucune régénération) :

`happy · worried · focused · neutral · excited · advising · surprised ·
sleeping · celebrating · cute`

Fichiers : `public/bloom/emotions/bloom-{emotion}.png` (502×502, fond
transparent). Composant : `src/components/bloom/BloomCharacter.tsx`.

```tsx
<BloomCharacter emotion="happy" size="md" animated />
```

Règle d'usage (section 69) : Bloom apparaît avec parcimonie — onboarding,
conseil, analyse, succès, découverte, erreur, chargement, jardin. Jamais en
décoration permanente sur toutes les pages.

## Les plantes — catégories (page 8 du PDF)

Succulentes, Palmiers, Fleuries, Aromatiques, Potager, Fruits, Arbres,
Arbustes, Grimpantes, Retombantes, Tropicales, Méditerranéennes, Jardin,
Bulbes, Fougères, Carnivores, Aquatiques, Bonsaïs.

Utilisées comme `category` de `PlantSpecies` et comme filtres dans
`/explore`. Représentées par un émoji/pictogramme simple par catégorie
(`src/constants/plant-categories.ts`) en attendant des assets détourés
individuels.

## Les badges (page 9 du PDF)

9 familles, 58 badges au total (liste complète dans `docs/database.md` et
`prisma/seed.ts`) : Premiers pas, Collection, Entretien, Régularité,
Observation, Santé, Environnement, Exploration, Jardin virtuel, Saisonniers.
Remplace/étend la courte liste d'exemples du prompt texte — le PDF fait foi.

## Composants

Design system de base (`src/components/ui`) : Button, IconButton, Card,
Badge, Chip, Input, Textarea, Select, Modal, Tabs, Progress, Avatar,
EmptyState, Skeleton, Toast, BottomNavigation, Sidebar.

Composants métier (`src/components/{plants,scanner,garden,weather,explore,
bloom,navigation}`) : voir arborescence dans `architecture.md`.

## Accessibilité & états

Un état (santé, badge, météo) n'est jamais communiqué par la couleur seule :
toujours une icône + un libellé texte. Skeletons cohérents avec les radius
du design system. Empty/loading/error states systématiques, avec Bloom
lorsqu'il apporte de la valeur (cf. règle section 69).
