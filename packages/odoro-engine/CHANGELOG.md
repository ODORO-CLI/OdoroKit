# @odoro-cli/engine

## 1.0.1

### Patch Changes

- @odoro-cli/libs@1.0.1

## 1.0.0

### Major Changes

- Version 1.0.0.

  Ce que le numero engage : les entrees publiques des six paquets ne changeront
  plus sans un nouveau majeur. Le moteur de developpement et de compilation, le
  routeur et les composants des bibliotheques, les icones, le socle serveur, le
  contrat du registre et les drapeaux de la ligne de commande sont stables.

  Ce qu il n engage pas : les entrees du registre ne sont pas une API de paquet.
  Elles sont copiees dans le projet par `odoro add`, et le code copie appartient
  alors au projet — une entree peut changer au registre sans que rien ne bouge
  chez ceux qui l ont deja prise.

  Aucune rupture n accompagne ce passage : 1.0.0 est identique a 0.3.4, au
  numero pres.

### Patch Changes

- Updated dependencies
  - @odoro-cli/libs@1.0.0

## 0.3.4

### Patch Changes

- @odoro-cli/libs@0.3.4

## 0.3.3

### Patch Changes

- @odoro-cli/libs@0.3.3

## 0.3.2

### Patch Changes

- @odoro-cli/libs@0.3.2

## 0.3.1

### Patch Changes

- La lecture d une couleur accepte la notation hexadecimale — `#abc`, `#aabbcc`,
  `#aabbccdd` — et traite `none` comme zero, ainsi que la syntaxe moderne le
  prevoit. Elle ne rendait jusqu ici que `null` sur un `#` et retombait sur une
  couleur par defaut.

  Les nuanceurs suivent desormais le theme : leur effet depend de `theme`, donc
  une bascule clair / sombre les repeint au lieu de garder les couleurs lues au
  montage.

  Le fond `mesh` ne rabat plus sa couleur de base a un quart de sa valeur. Ce
  facteur assombrissait le fond quelle que soit la palette, et un theme clair
  rendait un voile sombre la ou on demandait sa propre teinte.

- Updated dependencies
  - @odoro-cli/libs@0.3.1

## 1.0.0

### Minor Changes

- 6c9cb73: Contrat de personnalisation : `Customisable`, `mergePresentation`, `fromSlot`
  et `useOnReady`.

  `useOnReady` garde le rappel dans une reference. L'appelant ecrit presque
  toujours une fonction en ligne — donc une valeur neuve a chaque rendu du
  parent — et un effet qui en dependrait rejouerait l'echappatoire pour un
  survol ailleurs dans la page, posant un abonnement de plus a chaque fois.

  `mergePresentation` concatene les classes sans les remplacer, et laisse les
  styles en ligne de l'appelant l'emporter. La documentation dit ce que la
  concatenation ne fait pas : l'ordre des classes dans l'attribut n'a aucun effet
  sur la cascade.

  Cote CLI, `requiredPackages` ne reclame plus `gsap`, `ogl` ni `three` : ce sont
  des dependances d'`@odoro-cli/engine`, et les demander une seconde fois au projet
  d'accueil produisait un avertissement que rien ne resolvait.

  La cle du cache de pre-compilation tient desormais compte de la date et de la
  taille du fichier d'entree de chaque dependance. Un paquet lie depuis le meme
  depot garde la meme version pendant que son `dist/` est recompile dix fois par
  jour : sans cela, le serveur continuait de servir la pre-compilation
  precedente, et le navigateur reclamait un export qui n'existait pas encore.

  Les alias generiques du `tsconfig.json` sont repris d'office dans la
  configuration du moteur : `odoro init` deduit son prefixe du tsconfig, et il
  aurait fallu le redeclarer pour que le serveur sache le resoudre.

- d5cf5c3: Couche d'orchestration temporelle : enregistrement idempotent des plugins,
  timelines et animations liees au cycle de vie du composant, declencheurs de
  defilement, decoupage de texte accessible, et rafraichissement differe au
  changement de page.
- fda8354: Couche graphique : arbitrage des contextes, backend leger pour les effets plein
  ecran, backend de scene 3D en entree separee, liberation complete des
  ressources.
- d6f5a68: Quatre shaders de fond nouveaux — ondes, points, faisceaux, nappe — et
  `useTokenShader`, qui mutualise ce que tout fond anime refait : lire des
  tokens, les convertir en flottants, et les relire quand le theme bascule.
  Ecrite dans chaque composant, cette sequence aurait derive a son rythme dans
  chaque copie.

  Cote styles, le variant `disabled:` rejoint les couleurs, l'opacite et le
  curseur. Un controle desactive doit pouvoir se distinguer sans qu'on lui pose
  une classe conditionnelle : c'est un etat du DOM, pas du composant.

- 580b5b0: Premiere version du moteur d'animation : boucle de rendu unique, politique de
  mouvement, inventaire des ressources et panneau de diagnostic.
- 8cdde68: `readTokenColour` et `NOISE_FUNCTIONS_3D`.

  Le premier convertit une couleur de token en trois flottants pour un shader.
  C'est le chainon qui manquait entre les tokens et WebGL : la palette est en
  OKLCH, aucune API du navigateur ne rend trois flottants, et le detour par un
  canevas donne un resultat qui depend de la version du navigateur. Sans lui,
  tout fond anime finit avec ses couleurs ecrites en dur — ce que la validation
  du registre refuse, a juste titre.

  Le second fournit un bruit de valeur tridimensionnel. Le bruit plan existant
  suffit a un effet plein ecran ; deformer une sphere avec lui demanderait une
  projection, dont la couture et l'ecrasement aux poles se voient des que l'objet
  tourne.

### Patch Changes

- 16aaeea: Correction du verre depoli apres le retrait de la couche semantique :
  `o-glass` suivait une variable de surface qui n'existe plus. Il se decline
  desormais en clair et en sombre — `o-glass dark:o-glass-dark` — parce
  qu'aucune variable ne bascule plus toute seule.
- Updated dependencies [d6f5a68]
- Updated dependencies [5a092e9]
- Updated dependencies [851e598]
- Updated dependencies [0b18970]
- Updated dependencies [4589b1d]
- Updated dependencies [a6f463c]
  - @odoro-cli/libs@1.0.0
