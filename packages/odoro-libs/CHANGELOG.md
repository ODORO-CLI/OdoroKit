# @odoro-cli/libs

## 1.0.0

### Major Changes

- 4589b1d: Retrait de la couche semantique. Une couleur se designe desormais par sa place
  dans la palette — `o-bg-zinc-900` — jamais par un role, et le theme s'ecrit sur
  chaque classe : `o-bg-white dark:o-bg-zinc-900`.

  C'est une rupture. Les variables `--o-color-*` n'existent plus, `colorLight`,
  `colorDark`, `ColorToken` et `tokens.color` non plus.

  Deux consequences mesurees. Les variants se composent maintenant — `dark:hover:`
  — parce qu'aucune variable ne bascule plus toute seule et qu'un bouton
  interactif ne pourrait sinon avoir qu'un seul theme. Et la feuille de base est
  passee de 41,8 a 52,5 Ko compresses, +26 %, exactement pour cette raison.

  La feuille de base porte desormais sept teintes — une echelle neutre, la
  marque, et les quatre intentions qu'une interface exprime sans y penser. Les
  290 nuances restent dans la feuille complete : sans ce decoupage, le retrait de
  la couche semantique aurait fait basculer toute la palette dans la feuille de
  base, et les deux paliers n'auraient plus eu d'objet.

  `o-glass` se decline en clair et en sombre plutot que de suivre une variable,
  et les voiles translucides — `o-bg-black-45`, `o-bg-white-10` — remplacent
  l'ancien `overlay`.

### Minor Changes

- d6f5a68: Quatre shaders de fond nouveaux — ondes, points, faisceaux, nappe — et
  `useTokenShader`, qui mutualise ce que tout fond anime refait : lire des
  tokens, les convertir en flottants, et les relire quand le theme bascule.
  Ecrite dans chaque composant, cette sequence aurait derive a son rythme dans
  chaque copie.

  Cote styles, le variant `disabled:` rejoint les couleurs, l'opacite et le
  curseur. Un controle desactive doit pouvoir se distinguer sans qu'on lui pose
  une classe conditionnelle : c'est un etat du DOM, pas du composant.

- 5a092e9: Barres de defilement personnalisables : `o-scrollbar`, `o-scrollbar-dark`,
  `o-scrollbar-stable`. Deux ecritures pour un seul resultat — la propriete
  standard, et le pseudo-element pour ce qu'elle ne permet pas encore.

  Trois manques comble par l'usage : `row-start-*`, qui existait pour les
  colonnes mais pas pour les lignes ; `min-h-*` et `min-w-*` sur l'echelle
  d'espacement ; les variantes de theme sur les jalons de degrade et les
  variantes de palier sur les bordures. Sans elles, un degrade fige en clair
  traversait une page passee en sombre.

  La garde anti-doublons compare desormais les selecteurs et non les noms de
  classe : une meme classe habille legitimement plusieurs pseudo-elements.

  Cote moteur de developpement, l'empreinte du cache de pre-compilation resolvait
  les dependances avec la condition `require`. Un paquet ESM pur n'en declare
  pas : la resolution echouait, l'empreinte devenait constante, et le cache ne
  s'invalidait plus jamais — exactement pour les paquets du depot, ceux qu'on
  recompile dix fois par jour. Elle passe maintenant par le manifeste, toujours
  atteignable, et empreinte tous les fichiers que la carte d'exports designe.

- 0b18970: `SelectMenu` : liste deroulante riche — icones, descriptions, recherche — pour
  ce que le `select` natif ne permet pas. Sa documentation dit de prendre
  `Select` par defaut : le natif herite du menu du systeme, de la saisie au
  clavier et du comportement sur mobile, que ce composant doit reconstruire.

  Le motif combobox de l'ARIA y est entier : `aria-activedescendant` plutot que
  le focus, pour que la frappe continue d'arriver dans le champ ; les fleches qui
  sautent les options desactivees ; la liste qui defile pour garder l'option
  active visible ; et une valeur portee par un champ cache, qu'un formulaire
  ordinaire soumet sans savoir que ce n'est pas un `select`.

  Cote styles, le variant `focus:` s'applique desormais a l'anneau, et les
  curseurs de redimensionnement rejoignent la feuille.

  Cote registre, la categorie `image` rejoint le schema : un cadre et une
  comparaison ont des contraintes propres — rapport, chargement, repli — qui ne
  se rangent pas sous `effect`.

- a6f463c: Premiere version de l'ecosysteme Odoro.

  - `@odoro-cli/libs` : routeur client, moteur d'animation, systeme de style derive
    des design tokens et composants d'interface.
  - `odoro` : moteur de developpement et de compilation, plus l'echafaudage
    `odoro create`.
  - `create-odoro` : point d'entree de `npm create odoro@latest`, qui delegue au
    moteur.

### Patch Changes

- 851e598: Rien de nouveau dans la librairie : cette version accompagne l'arrivee de la
  categorie `section` dans le registre.
