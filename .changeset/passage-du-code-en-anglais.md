---
'odoro': major
'@odoro-cli/libs': major
'@odoro-cli/icons': major
'@odoro-cli/engine': major
'@odoro-cli/server': patch
'create-odoro': patch
---

Le code passe en anglais : identifiants, commentaires, messages et sorties de
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

Un projet cree par `npm create odoro` est desormais entierement en anglais,
texte affiche compris. `src/fond.tsx` devient `src/background.tsx` et la route
`/a-propos` devient `/about`.
