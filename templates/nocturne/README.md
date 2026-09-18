# Nocturne — ODORO, location de voitures

Landing page nocturne pour une agence de location d'exception. Deux films
Seedance 2.5 scrubés au scroll, six voitures en fiches techniques, et une
voiture détourée en WebGL derrière laquelle le nom de la marque passe.

## Ce qui a changé au passage sur notre moteur

Le design n'a pas bougé. C'est mesuré : à cinq largeurs — 390, 768, 1280, 1440
et 1920 — les 511 nœuds du `main` ont exactement la même boîte que l'original,
et les deux socles concordent sur quinze balises et vingt propriétés.

| | |
|---|---|
| Le cadre | Il n'y en a plus. `index.html` + `src/main.tsx` + `src/App.tsx` remplacent `layout.tsx` et `page.tsx`. Les métadonnées et le verrou de défilement sont dans le `<head>`. |
| Les classes utilitaires | Réécrites vers les nôtres (`o-*`) ou, quand notre générateur ne les produit pas, vers des règles `nc-*` dérivées du bloc de jetons de `src/styles.css`. Aucune valeur n'a changé. |
| La préséance | Les sept classes que le gabarit se donne — `.display`, `.label`, `.glass`, `.hairline`, `.sr-only`, `.reveal-word` — répètent leur nom trois fois. Chez l'autre moteur le CSS de l'auteur n'est pas en couche et bat les utilitaires ; ici c'est la spécificité qui doit le dire. Sans cela `.display { line-height: 0.9 }` perdait contre `leading-none`, et le sigle du garage gagnait vingt pixels. |
| La police | Liée dans la feuille au lieu du `layout`. Voir ci-dessous. |
| Les images | Le composant image de l’autre cadre cède la place à `<img>`. |

### La police : une déclaration qui ne s'appliquait pas

L'original écrit `body { font-family: var(--font-sans) }` et lie
`--font-sans: var(--font-geist)` dans un bloc `@theme inline`. Avec `inline`,
l'autre moteur substitue la valeur dans ses utilitaires **et n'émet pas la
variable** : `var(--font-sans)` ne résout rien, et le `body` retombe sur la pile
système de la remise à zéro. Mesuré sur l'original construit : `--font-sans` est
vide, et **aucune police ne se télécharge**. La page n'a jamais été en Geist.

Conformément à la règle retenue pour ces migrations — fidèle à l'intention
plutôt qu'à la lettre — le port fait fonctionner la liaison : Geist est
réellement servie, sous SIL OFL, depuis le fournisseur.

Pour revenir à la lettre de l'original, remplacer la valeur de `--font-geist`
en tête de `src/styles.css` par la pile système :

```css
--font-geist: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
  'Helvetica Neue', 'Noto Sans', Arial, sans-serif;
```

C'est d'ailleurs sous cette forme que la comparaison ci-dessus a été faite :
avec la même police des deux côtés, pour que la mesure porte sur la mise en
page et non sur les métriques de la fonte.

## Démarrer

```sh
npm install
npm run dev      # http://localhost:3700
npm run build
npm run preview
```

## Ce qui tient le tout

**Style GetLayers : `stride-nine-style`.** Sa prémisse : *il n'y a pas de
surface de page*. Le fond est le film ; `#171717` n'est que ce qui s'affiche
avant qu'il ne peigne. La lisibilité vient d'un dégradé, jamais d'une carte —
et la seule carte de la page est la fiche de statut givrée du hero, qui est
prévue par le Style.

**L'accent est une discipline, pas une couleur.** `#ff9500` est nommé par le
système et volontairement éteint : les seuls pixels saturés de l'écran sont les
phares, la ville et la peinture. Donner une teinte à l'interface casserait tout.

**Un seul axe : −18°.** Le cover de chargement part en diagonale sur cette
ligne, les streaks la traversent, et la voiture détourée dérive dessus. Un
parallaxe qui ignore cet axe a l'air emprunté à une autre page.

**Les films.** Deux prises uniques, jamais jouées, seulement *seekées* par une
horloge de scroll unique. Le premier est un travelling latéral : les voitures
traversent le cadre pendant que la skyline dérive bien plus lentement — c'est là
que se trouve le vrai parallaxe, pas dans un effet ajouté après coup.

**La profondeur.** Section `garage` : la voiture est un détourage alpha porté
par un canvas WebGL transparent, et le mot ODORO est du **vrai texte DOM placé
dessous**, qui traverse l'écran et passe derrière la carrosserie.

## L'inspection des voitures

Chaque voiture a été contrôlée au recadrage ×2 : emblèmes, signatures
lumineuses, jantes, étriers, jeux de tôle. **Une première série de hero a été
rejetée** — double emblème et signature lumineuse erronée sur la Ferrari.
Défaut résiduel connu et assumé : un faux lettrage illisible à l'intérieur du
bloc optique de la Lamborghini, visible seulement au-delà de 150 % de zoom.

## Le copywriting

Un verbe, son objet, puis un chiffre vérifiable : le prix par jour, la caution,
les kilomètres inclus, le délai de livraison, le délai d'annulation. Tout est
dans [`src/data/content.ts`](src/data/content.ts).

## Démarrer

```bash
npm install
npm run dev
```

## Refabriquer les films

```bash
scripts/build-films.sh flotte.mp4 details.mp4
scripts/contact-sheet.sh .sheet public/video/odoro-flotte.mp4
```

L'encode dense en keyframes (`-g 5`) décide si le scrub colle à la molette. Le
CRF est serré (19) parce qu'une image de nuit, faite de grands aplats sombres
et de petits éclats spéculaires, est exactement là où le banding apparaît en
premier.

## La pile

Le moteur Odoro · React 19 · TypeScript · Three.js · Lenis. Les films et les
détourages viennent de Higgsfield (Seedance 2.5, gpt-image-2.5) ; le Style et la
chorégraphie de révélation, de GetLayers. Les crédits des références sont dans
le `CREDITS.md` de la racine du dépôt.

## D'où il vient

Repris d'une landing bâtie sur un autre moteur, et porté sur le nôtre sans
toucher au design — voir « Ce qui a changé au passage » en haut de ce fichier.
