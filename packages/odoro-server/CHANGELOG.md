# @odoro-cli/server

## 1.2.0

### Minor Changes

- eb412fd: `cookies.get(name)` reads a request cookie in a handler, next to `set` and `clear`. Refusals carry extension members (RFC 9457): `new ConflictError(message, { extensions: { erreur } })` adds fields to the problem document; the standard members always win.

## 1.1.0

### Minor Changes

- ab240f9: Un gestionnaire peut poser un cookie.

  Le contexte gagne `cookies`, avec `set(name, value, options)` et `clear(name)`.
  `httpOnly` et `sameSite: 'lax'` sont les valeurs par defaut, et `secure` suit le
  mode : actif en production, inactif ailleurs — ou il n'y a pas de certificat, et
  ou un cookie `secure` ne reviendrait jamais.

  ## Pourquoi le gestionnaire ne recoit pas la reponse

  Tout ce qu'un gestionnaire produit d'autre est sa valeur de retour, validee
  contre un schema. Un cookie ne peut pas l'etre : c'est un en-tete, et il s'ecrit
  avant le corps. Lui passer l'objet de reponse entier pour en poser un ouvrirait
  la porte a un gestionnaire qui ecrit son propre statut, son propre corps, et
  echappe au contrat de sortie.

  Les cookies sont donc collectes, et c'est le montage qui les ecrit. Un
  gestionnaire enonce une intention ; il ne pilote pas le transport.

  ```ts
  route({
    name: 'auth.login',
    method: 'POST',
    path: '/api/auth/login',
    auth: 'public',
    handler: ({ cookies }) => {
      cookies.set('session', id, { maxAge: 60 * 60 * 24 * 30 })
    },
  })
  ```

  C'est ce qui manquait pour qu'une authentification se tienne : sans cela, la
  seule voie restante etait un jeton range dans `localStorage`, que le premier
  script injecte dans la page sait lire.

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

## 1.0.1

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

## 0.3.4

## 0.3.3

## 0.3.2

## 0.3.1
