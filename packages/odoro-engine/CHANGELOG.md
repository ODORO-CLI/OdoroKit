# @odoro-cli/engine

## 2.0.0

### Major Changes

- 42f06f0: Le code passe en anglais : identifiants, commentaires, messages et sorties de
  commande. Le playground reste en francais.

  C'est une rupture nette, sans alias de compatibilite. Ce qu'il faut renommer :

  ## `odoro`

  Cles de `odoro.config.ts` : `elaguer` → `prune`, `manifeste` → `manifest`,
  `precharge` → `preload`. Drapeaux : `--no-manifeste` → `--no-manifest`,
  `--no-precharge` → `--no-preload`.

  Contrat de greffon : `nom` → `name`, `transformer` → `transform`,
  `transformerIndexHtml` → `transformIndexHtml`, `configurerServeur` →
  `configureServer`, `ContexteTransformation` → `TransformContext`,
  `ContexteDocument` → `HtmlContext`, `ContexteServeur` → `ServerContext`,
  `ajouter` → `use`, `Intercepteur` → `Middleware`, `contexte.serveur` →
  `context.ssr`.

  API : `chargerEnv` → `loadEnv`, `envClient` → `clientEnv`, `Environnement` →
  `LoadedEnv`, `contientGlob` → `hasGlob`, `transformerGlob` → `transformGlob`,
  `construireManifeste` → `buildManifest`, `fragmentsDe` → `chunksFor`,
  `EntreeManifeste` → `ManifestEntry`, `Manifeste` → `Manifest`, `prerendre` →
  `prerender`, `RenduRoute` → `RouteRender`, `SortiePrerendu` →
  `PrerenderOutput`. `defineConfig` ne change pas.

  **Le point d'entree de pre-rendu n'accepte plus que `render`.** Un projet qui
  exporte `rendu` depuis `src/entry-server.tsx` echoue desormais au lieu de
  fonctionner : le message le dit.

  La sortie de la commande est en anglais, tailles comprises (`B`, `kB`, `MB`).

  ## `@odoro-cli/icons`

  Les cinq jeux changent de sous-chemin : `/filaire` → `/outline`, `/classique` →
  `/classic`, `/etendu` → `/extended`, `/marques` → `/brands`. `/compact` ne
  bouge pas.

  `IconData['mode']` et `PackInfo['mode']` passent de `'trait' | 'plein'` a
  `'outline' | 'solid'`.

  ## `@odoro-cli/libs`

  Le sous-chemin `/generateur` devient `/generator`, et ses deux exports
  `renderCssPour` / `renderUtilitairesPour` deviennent `renderCssFor` /
  `renderUtilitiesFor`. **Un projet qui ne met pas ce nom a jour ne casse pas a la
  compilation : la feuille sort sans aucun utilitaire.**

  Les libelles rendus par defaut sont en anglais — `aria-label="Close"`,
  `'Loading'`, `'Previous page'`, `'Choose…'`, `'No result'`, et le texte de la
  page 404 du routeur. Le CSS publie est inchange regle pour regle ; seuls ses
  commentaires ont change.

  ## `@odoro-cli/engine`

  `RefusalReason` change de valeurs : `plafond-global` → `max-surfaces`,
  `plafond-backend` → `max-per-backend`, `webgl-indisponible` →
  `webgl-unavailable`, `hors-navigateur` → `outside-browser`. Le membre
  supplementaire de `ShaderSurfaceHandle.refused` et `SceneHandle.refused` passe
  de `'mouvement-reduit'` a `'reduced-motion'`.

  ## Le registre de composants

  Les entrees servies par `odoro add` passent aussi en anglais. Le code copie dans
  un projet **avant** cette version garde les anciens noms et continue de marcher ;
  c'est la prochaine copie, ou un `odoro diff`, qui montrera l'ecart.

  Props renommees, sur trente entrees : `declenchement` → `trigger`, `course` →
  `travel`, `sens` → `direction`, `taille` → `size`, `couleur` → `color`,
  `largeur` → `width`, `rayon` → `radius`, `delai` → `delay`, `actif` → `active`,
  `immediat` → `immediate`, `contour` → `stroke`, `remplissage` → `fill`,
  `raideur` → `stiffness`, `inclinaison` → `tilt`, `graisseBasse`/`graisseHaute` →
  `minWeight`/`maxWeight`, `chasse` → `stretch`, `doublure` → `ghost`,
  `netAuSurvol` → `sharpOnHover`, `mots` → `words`, `flou` → `blur`, `fusion` →
  `weld`, `attenue` → `dimmed`, `courbure` → `curve`, `separateur` → `separator`,
  `labelSucces`/`labelEchec` → `successLabel`/`errorLabel`, `boucle` → `wrap` ou
  `loop` selon l'entree, `onValider` → `onSelect`, `arrondi` → `round`,
  `serveur` → `serverValue`.

  Crochets : `useInView` rend `inView` au lieu de `vu` ; `useCopy` rend `state` et
  `copy` ; `useMeasure` rend `ready` et `measure` ; `useKeyboardList` rend `active`
  et `go`.

  Valeurs d'unions : `'vue' | 'montage' | 'survol'` → `'view' | 'mount' | 'hover'`,
  `'gauche' | 'droite'` → `'left' | 'right'`, `CopyState` → `'idle' | 'copied' |
'failed'`, `ListOrientation` → `'vertical' | 'horizontal'`, `ScrollRange` →
  `'through' | 'anchored'`, `CheckmarkState` → `'loading' | 'success' | 'error'`,
  `ChangeKind` → `'added' | 'changed' | 'fixed' | 'removed'`, `ToastTone` →
  `'success' | 'warning' | 'error'`, `NewsletterStatus` → `'idle' | 'sending' |
'success' | 'error'`.

  Les types qui les portent suivent : `FoldTextDeclenchement` → `FoldTextTrigger`,
  `CurvedLoopSens` → `CurvedLoopDirection`, et leurs pareils.

  Enfin, les attributs `data-o-*` et les variables `--o-*` propres aux composants
  sont en anglais, ainsi que leurs libelles par defaut (`'Chargement'` →
  `'Loading'`). **Une feuille de style ecrite a la main qui visait l'un de ces
  attributs doit suivre.**

  ## Les gabarits

  Le gabarit `react-ts-server` arrive avec une demonstration d'authentification :
  inscription, connexion, deconnexion, profil. Mot de passe hache en `scrypt`,
  session dans un cookie `httpOnly` dont la table ne garde que l'empreinte, et la
  meme reponse pour une adresse inconnue que pour un mauvais mot de passe. Elle
  demande `DATABASE_URL` ; sans elle, les quatre routes repondent 503 en disant ce
  qui manque, et l'interface demarre quand meme. Le gabarit gagne `pg` en
  dependance.

  Un projet cree par `npm create odoro` est desormais entierement en anglais,
  texte affiche compris. `src/fond.tsx` devient `src/background.tsx` et la route
  `/a-propos` devient `/about`.

### Patch Changes

- Updated dependencies [42f06f0]
  - @odoro-cli/libs@2.0.0

## 1.0.2

### Patch Changes

- 120da68: La teinte de marque passe au bleu du logo (`#3b82f6`). Une seule table change
  dans les jetons, et tout ce qui lit `--o-palette-brand-*` suit : documentation,
  vitrines, gabarits et composants.

  Le createur parle anglais. Les questions, les libelles, les avertissements et
  les etapes finales — le code et les commentaires restent en francais.

  L installation des dependances se voit : le gestionnaire est lance en flux, sa
  derniere ligne s affiche a cote d un minuteur, et un echec montre la fin de sa
  sortie au lieu d un « a relancer a la main » sans motif.

  La page echafaudee tient dans `App.tsx`, avec `router.tsx` a cote pour le
  routage et `fond.tsx` pour le fond. La barre reprend les gelules d odoro.dev, et
  le logo est pose en favicon.

  Chaque paquet publie porte desormais un README.

- Updated dependencies [120da68]
  - @odoro-cli/libs@1.0.2

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
