# ODORO — Gravity

Page immersive pour **ODORO**, bâtie sur un champ de gravité WebGL persistant :
96 sphères s'agglutinent dans le masthead, cèdent à une simulation physique
réelle et tombent, **se réassemblent en sigle ODORO**, puis accélèrent au-delà
de l'objectif. Quatre sections plein écran en fondu croisé sur une seule horloge
de défilement, pendant que la palette sature ambre → cuivre → orange de marque.

Reprise de la template [Gravity](https://www.getlayers.ai/?layer=gravity-webgl)
de GetLayers, traduite en français et ré-habillée à la charte ODORO.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Prévisualiser le build |
| `npm run lint` | `tsc --noEmit` |

**Node 22 LTS recommandé.** Voir « Problèmes connus » plus bas.

## Pile

Vite 6 · React 19 (SPA) · three.js 0.184 en trois.js vanille — un rig
`MeshPhysicalMaterial` avec collisions Verlet écrites à la main, pas R3F ·
Lenis · motion/react · the utility generator.

## Architecture

```
src/
  App.tsx                      composition des 4 sections + copie + chrome
  index.css                    tokens de design (couleurs, encres, loader, verre)
  types.ts                     contrats de la physique et du contrôle de scène
  components/
    FestivityCanvas.tsx        LA SCÈNE — physique, palette, silhouette du sigle
    BrandMark.tsx              le sigle ODORO en SVG
    Loader.tsx                 pré-générique gated sur la première image WebGL
    Footer.tsx                 bandeau, colonnes, CTA
    Cursor.tsx                 curseur maison
    Magnetic.tsx               enveloppe magnétique
public/assets/mark/
  odoro-mark.svg               le sigle plat
  odoro-mark.glb               le sigle extrudé en 3D (5904 sommets)
```

## Le sigle ODORO

Un coin carré en haut à gauche prolongé par un arc de 270°, en trait d'épaisseur
constante. Le tracé est **géométrique, pas vectorisé** : dans une boîte 100 × 100,
le contour extérieur est un rayon de 50 centré sur (50, 50) et l'intérieur un
rayon de 35 — d'où les 15 unités d'épaisseur du logo fourni.

```
M0 0H50A50 50 0 1 1 0 50Z M15 15H50A35 35 0 1 1 15 50Z
```

⚠️ **Cette définition vit à quatre endroits et ils ne peuvent pas diverger :**

1. `src/components/BrandMark.tsx` — le SVG (en-tête, loader, pied de page, menu)
2. `public/assets/mark/odoro-mark.svg` — le sigle plat autonome
3. `index.html` — le favicon, en data-URI
4. `src/components/FestivityCanvas.tsx` → `markPoint()` — la ligne médiane que
   les sphères viennent former

Si le tracé bouge quelque part, il bouge partout.

### Pourquoi les sphères ne sont pas tirées au hasard

La template d'origine plaçait les sphères par **échantillonnage par rejet** dans
l'aire du cœur. Transposé tel quel au sigle, l'anneau sortait troué et grumeleux
(≈ 60 % de couverture) : le tirage aléatoire remplit très bien une forme *pleine*
— un cœur reste un cœur même si les sphères s'agglutinent — mais il **déchire un
trait**, et un logo troué n'est plus un logo.

Les sphères sont donc réparties **à pas d'arc constant sur la ligne médiane du
trait** (rayon 0.85), en deux rangées décalées de ± 0.07 qui s'imbriquent en
quinconce. Mesuré : **97,7 % de couverture** du sigle, 2,4 % de débordement. La
répartition est en prime **déterministe** — au redimensionnement le sigle se
reforme à l'identique au lieu de se rebattre.

## Charte

**Orange de marque : `#f97316`.**

Une seule famille chaude, qui sature en descendant la page :

| Étape | Moment | Teinte |
|---|---|---|
| 0 | masthead / agglutination | `#FDBA74` ambre |
| 1 | la chute | `#FB923C` cuivre |
| 2 | **le sigle** + l'envol | **`#F97316` orange de marque** |

L'étape 2 tombe sur l'orange de marque exact, et c'est aussi celle où les sphères
forment le sigle : la page résout sur la couleur de la marque au moment précis où
la marque apparaît.

Les encres sont des **neutres chauds** (`--ink: #1c1310`) — les bleu-noir de la
template d'origine verdissaient sur fond orange. L'encre d'accent fonce à mesure
que la teinte sature, sinon le texte se délave.

### Re-teindre

Les couleurs des sphères **ne sont pas des littéraux de shader** :
`FestivityCanvas.tsx → getDynamicColors` dérive cinq emplacements (pastel /
light / medium / deep / glass) d'un seul hex de base. Re-teindre = déplacer ces
hex. **Jamais dans le GLSL** — un shader ne se re-teinte pas en l'éditant.

Le chrome 2D vit dans `src/index.css` (`--ink`, `--accent`, `--accent-ink`), et
`App.tsx` surcharge l'accent en inline à chaque étape de scène.

## Ce qu'il ne faut pas réécrire

La template porte un contrat : `mutable: [skin]`, `preserve: [motion, composition]`.
Concrètement, ne touchez pas à :

- la chorégraphie agglutination → chute → mise en forme → envol
- les bindings de scroll (`scrollY / hauteur de viewport` → index de section flottant)
- les constantes de collision et de restitution Verlet
- le handshake loader → révélation

La couleur, la typographie, l'espacement et la copie sont à vous.

## Problèmes connus

- **`vite build` se bloque** sur « transforming » à 0 % CPU sans produire `dist/`.
  Reproduit y compris avec le plugin the utility generator retiré, donc ce n'est pas the utility generator.
  Ce n'est pas le code non plus : `tsc --noEmit` passe à 0 erreur et le serveur de
  dev sert tous les modules. Suspect : **Node v25** (Vite 6 vise Node 18/20/22).
  À réessayer sous Node 22 LTS.
- **`prefers-reduced-motion` n'atteint pas la scène WebGL.** Les révélations de
  texte le respectent via `useReducedMotion`, mais la boucle de rendu tourne quoi
  qu'il arrive : ni une règle CSS ni le drapeau d'une bibliothèque d'animation ne
  couvre un canvas. À corriger dans `FestivityCanvas.tsx` lui-même.
- **Contenu provisoire.** Le positionnement d'ODORO n'est pas tranché, donc la
  copie est celle de Gravity traduite (studio numérique indépendant), pas une
  activité inventée. `bonjour@odoro.studio` et les liens `#` sont des
  remplaçants.

## Licence

[Unlicense](LICENSE.md) — domaine public, comme les templates GetLayers dont ce
projet est issu.

## Le portage sur le moteur Odoro

Ce gabarit tournait sur un autre moteur de construction et un autre générateur
d'utilitaires. Le design n'a pas bougé ; ce qui a changé tient en quatre points.

| Avant | Après |
| --- | --- |
| Un moteur de construction tiers | `odoro dev`, `odoro build`, `odoro preview` |
| Utilitaires d'un générateur tiers | Utilitaires `o-` du système, plus les classes du projet |
| `@theme` | Des variables CSS ordinaires |
| `@layer base` | Les mêmes règles, hors couche |

La table de correspondance est dans `scripts/lib/gravity-classes.mjs`, à la
racine du dépôt. Six cent quarante classes sont passées par elle.

### Trois choses qui ne se voient pas dans un diff

**`@layer base` a été déroulé.** Une règle en couche perd contre une règle hors
couche, quelle que soit sa spécificité. La remise à zéro d'`@odoro-cli/libs`
est hors couche : laissé dans sa couche, le socle du gabarit lui cédait le pas
et le fond crème devenait blanc.

**Un bloc de compatibilité a été ajouté.** Le gabarit s'appuyait sans le dire
sur la remise à zéro de l'autre moteur. La différence exacte entre les deux a
été relevée en comparant les styles calculés de quinze balises sur vingt
propriétés — pas devinée — et le bloc en tête de `src/index.css` la comble.
Sans lui, tous les liens redeviennent bleus et soulignés.

**Les sélecteurs des classes ajoutées répètent leur classe.** Les utilitaires du
système sont écrits après cette feuille dans le paquet final : à spécificité
égale, c'est le dernier qui gagne.

### Ce que la comparaison peut et ne peut pas dire

La scène est une simulation physique : quatre-vingt-seize sphères qui tombent,
jamais deux fois de la même façon. Comparer les captures de la page d'origine à
elle-même donne déjà jusqu'à quatre-vingts pour cent de pixels différents — le
rendu de la scène n'est pas jugeable ainsi.

Ce qui l'est : la hauteur du document, identique au pixel dans les deux
largeurs, et les captures où la scène est au repos, qui coïncident.
