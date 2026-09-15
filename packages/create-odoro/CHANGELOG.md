# create-odoro

## 1.0.10

### Patch Changes

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

- Updated dependencies [42f06f0]
- Updated dependencies [42f06f0]
  - odoro@2.0.0

## 1.0.9

### Patch Changes

- Updated dependencies [c181a38]
  - odoro@1.0.9

## 1.0.8

### Patch Changes

- Updated dependencies [3d0244c]
  - odoro@1.0.8

## 1.0.7

### Patch Changes

- Updated dependencies [367a08a]
  - odoro@1.0.7

## 1.0.6

### Patch Changes

- Updated dependencies [4bf93cf]
  - odoro@1.0.6

## 1.0.5

### Patch Changes

- Updated dependencies [0f46726]
  - odoro@1.0.5

## 1.0.4

### Patch Changes

- Updated dependencies [c56fca2]
  - odoro@1.0.4

## 1.0.3

### Patch Changes

- Updated dependencies [c5803ed]
- Updated dependencies [7f66d0f]
  - odoro@1.0.3

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
  - odoro@1.0.2

## 1.0.1

### Patch Changes

- Updated dependencies [606f8c0]
  - odoro@1.0.1

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
  - odoro@1.0.0

## 0.3.4

### Patch Changes

- Updated dependencies [f388687]
  - odoro@0.3.4

## 0.3.3

### Patch Changes

- Updated dependencies [f95d935]
  - odoro@0.3.3

## 0.3.2

### Patch Changes

- 0dfda66: `npm create odoro` demande ce que le projet embarque, dans une liste a cocher :
  bibliotheques, routeur et icones coches, moteur et registre a la demande. Un
  drapeau `--modules` fait le meme choix sans rien demander, et `aucun` rend une
  base React nue.

  Le choix change vraiment le projet ecrit : les dependances non retenues sont
  retirees du manifeste, le dossier `routes/` disparait sans routeur, et sans les
  bibliotheques l application est posee en CSS ordinaire, sans classes `o-*`.

  Deux entrees de la liste ne sont pas des paquets, et le createur ne fait pas
  semblant : le routeur vient de `@odoro-cli/libs/router`, donc le cocher cable
  les pages au lieu d installer quoi que ce soit, et le decocher ne desinstalle
  rien ; les entrees du registre sont copiees une a une par `odoro add`, et la
  commande est rappelee a la fin plutot qu ajoutee aux dependances.

- Updated dependencies [0dfda66]
  - odoro@0.3.2

## 0.3.1

### Patch Changes

- Updated dependencies
  - odoro@0.3.1

## 0.1.0

### Minor Changes

- a6f463c: Premiere version de l'ecosysteme Odoro.

  - `@odoro-cli/libs` : routeur client, moteur d'animation, systeme de style derive
    des design tokens et composants d'interface.
  - `odoro` : moteur de developpement et de compilation, plus l'echafaudage
    `odoro create`.
  - `create-odoro` : point d'entree de `npm create odoro@latest`, qui delegue au
    moteur.

### Patch Changes

- Updated dependencies [d6b1a81]
- Updated dependencies [6c9cb73]
- Updated dependencies [5a092e9]
- Updated dependencies [0b18970]
- Updated dependencies [a6f463c]
- Updated dependencies [b9e6bfa]
  - odoro@0.1.0
