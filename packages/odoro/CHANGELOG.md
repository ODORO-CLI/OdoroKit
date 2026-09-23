# odoro

## 2.1.0

### Minor Changes

- `odoro create` approvisionne la base Odoro au lieu de l'annoncer.

  Le premier choix du selecteur de base — « fournisseur Odoro » — etait affiche « a
  venir » et ne faisait rien. Il provisionne desormais, en posant les quatre
  questions dont il a besoin : le jeton, l'environnement, la region, le nom.

  Ce qui bloquait n'etait pas le plan de controle, qui repondait deja, mais le
  client. `@odoro-cli/cloud-sdk` entre donc dans les dependances du CLI. Il en
  etait tenu dehors pour son poids : le client et ses contrats pesent 428 Ko, a
  cote du compilateur et du transformeur deja transportes — moins de trois pour
  cent. Et surtout, pendant `npm create odoro` il n'existe aucun projet, donc
  aucun endroit d'ou resoudre un paquet installe a part : tenu dehors, le chemin
  de la plateforme ne pouvait pas s'executer au moment ou on le veut le plus.

  Le chargement reste dynamique : une installation partielle ne doit pas emporter
  `odoro dev`, et un projet qui apporte sa propre base PostgreSQL n'a jamais
  besoin de ce module.

  `odoro db:create` profite des memes questions :

  - il refusait sans `--env`, il demande — et propose les environnements par leur
    nom, `projet / environnement`, plutot que d'exiger un identifiant qu'il
    faudrait d'abord avoir lu ailleurs ;
  - il codait `eu-central-1` en dur, il propose les regions que la plateforme
    declare. Laquelle est choisie dit dans quelle juridiction vivent les donnees.

  `--env` et `--region` sautent les questions, pour les scripts.

  La frontiere ne bouge pas : le projet recoit une chaine de connexion a portee
  limitee, ecrite dans `.env` et jamais affichee ; les identifiants du fournisseur
  restent dans le plan de controle.

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

### Minor Changes

- 42f06f0: Le moteur couvre ce qui lui manquait pour tenir un site de bout en bout.

  **Fichiers `.env`.** Lus par mode — `.env`, `.env.local`, `.env.<mode>`,
  `.env.<mode>.local` —, avec expansion des references et valeurs sur plusieurs
  lignes. Une variable deja posee dans l'environnement n'est jamais ecrasee par un
  fichier. Seul le prefixe `ODORO_` part dans le navigateur ; le reste ne quitte
  pas la machine. `--mode` choisit les fichiers et remplit `import.meta.env.MODE`.

  **Pre-rendu.** `build.prerender` rend chaque route en HTML a la compilation, et
  le client hydrate au lieu de reconstruire. La sortie reste un ensemble de
  fichiers statiques. Les deux gabarits l'activent, avec un `src/entry-server.tsx`
  a remplir.

  **Manifeste et prechargement.** `dist/manifest.json` donne, pour chaque entree,
  son fichier empreinte, ses feuilles et ses fragments. Les fragments partages sont
  declares en `modulepreload`, ce qui supprime un aller-retour par niveau de
  profondeur d'import.

  **`import.meta.glob`**, resolu a la compilation en imports statiques ordinaires.

  **Imports a suffixe** : `?raw` pour le texte d'un fichier, `?url` pour son
  adresse publique, `?worker` pour un fil d'execution compile a part.

  **Greffons** : `transform`, `transformIndexHtml`, `configureServer`, et une
  echappatoire vers le compilateur.

  **Feuilles de style en developpement** : les `@import` sont integres et les
  `url()` reecrites contre le dossier du fichier. Une image relative ecrite dans
  une feuille imbriquee etait jusqu'ici cherchee a la racine du site, et ne
  peignait rien.

  Aussi : tailles comprimees au recapitulatif — et cartes de source exclues du
  total, qui annoncait 1,7 Mo pour un site en livrant 90 Ko ; `server.https`,
  `server.open`, `server.strictPort`.

  **Deux defauts du gabarit `react-ts-server`, corriges au passage.** Son
  `client/src/App.tsx` importait `../package.json`, qui n'existe pas a cet endroit
  dans ce gabarit : le projet genere ne compilait pas. Et son montage du client
  compile etait pose **apres** les gestionnaires de 404 et d'erreurs du noyau,
  donc jamais atteint : en production, chaque page repondait 404. Le client est
  desormais servi par une enveloppe montee devant le noyau.

## 1.0.9

### Patch Changes

- c181a38: Le fond decoratif du gabarit ne peignait rien.

  Le systeme de style n emet pas de classe a valeur arbitraire : `o-h-[42rem]` ne
  produit aucune regle, et une classe absente ne peint rien. Le conteneur du fond
  mesurait zero pixel de haut, ses deux nappes aussi — sans que rien ne le
  signale, ni a la compilation ni a l execution.

  Les tailles hors echelle sont ecrites en style, ou elles sont sures. Un test
  refuse desormais toute classe a valeur arbitraire dans les gabarits.

## 1.0.8

### Patch Changes

- 3d0244c: Quand le port est pris, le serveur glisse vers le suivant au lieu de s arreter.

  `EADDRINUSE` arretait la commande. C est le bon comportement pour un serveur de
  production, dont le port fait partie du contrat ; c en est un mauvais pour un
  serveur de developpement, ou le coupable est presque toujours une fenetre de
  terminal oubliee. Il fallait chercher le processus, le tuer, relancer — pour un
  resultat que la machine trouve seule.

  Le port obtenu est annonce des qu il differe de celui demande : un serveur
  ouvert ailleurs ferait recharger une page qui ne bougerait pas.

  Seul un conflit de port fait glisser. Un port refuse pour une autre raison —
  droits insuffisants, adresse inexistante — reste une erreur de configuration.

  Deux serveurs lances sur le meme projet ne se disputent plus le cache des
  dependances : l un effacait le dossier pendant que l autre y ecrivait. Le cas
  est devenu courant, justement parce que le second demarre maintenant.

## 1.0.7

### Patch Changes

- 367a08a: Un `import` de JSON arrive desormais sous forme de module en developpement.

  `import { dependencies } from './package.json'` est resolu par la compilation —
  esbuild integre le JSON et en tire des exports nommes — mais le serveur de
  developpement servait le fichier tel quel. Le navigateur refusait :

      Failed to load module script: Expected a JavaScript-or-Wasm module script
      but the server responded with a MIME type of "application/json".

  La page restait blanche, et le message ne disait pas quel import etait en
  cause. C etait le cas de tout projet cree depuis la version precedente, dont la
  page « A propos » lit le manifeste.

  Une requete ordinaire — un `fetch`, une adresse tapee — continue de recevoir le
  fichier.

## 1.0.6

### Patch Changes

- 4bf93cf: Un module ne recoit plus le document de l application.

  Le repli d application monopage rend `index.html` pour toute route inconnue :
  c est ce qui permet au routeur client de decider de la suite. Il le faisait des
  que le chemin n avait pas d extension — ce qui est le cas d une route, mais
  aussi d un module importe par un chemin qui n en porte pas.

  Le navigateur echoue alors sur « Failed to load module script », un message qui
  ne nomme ni le fichier ni la cause.

  Les deux serveurs lisent desormais `Sec-Fetch-Dest` : `document` recoit le
  repli, `script`, `style`, `image` et les autres ressources recoivent un 404 qui
  les nomme. Sans l en-tete — un `curl`, une adresse tapee a la main — le repli
  reste, puisque c est le comportement attendu.

## 1.0.5

### Patch Changes

- 0f46726: Deux causes de l erreur « strict MIME checking », corrigees.

  **Une feuille reliee par une balise recevait du JavaScript.** Le serveur de
  developpement rend les feuilles sous forme de module injecteur — c est ce qui
  porte le remplacement a chaud. Il le faisait pour toute requete, y compris
  celles d une balise `<link rel="stylesheet">`, qui recevait donc du
  `text/javascript` la ou elle attend du `text/css`.

  Il lit desormais `Sec-Fetch-Dest`, que le navigateur envoie : `style` pour une
  balise, `script` pour un import. Les deux usages fonctionnent.

  **Un fichier absent revenait en 200 avec du HTML.** `odoro preview` repliait
  toute requete inconnue sur le document de l application, extension comprise :
  une feuille mal nommee revenait en HTML, et le navigateur la refusait sans
  nommer la cause. Un chemin portant une extension rend maintenant un 404, comme
  le fait deja le serveur de developpement.

## 1.0.4

### Patch Changes

- c56fca2: L echafaudeur demandait une version qui n existe pas.

  Il posait le numero de la CLI sur tous les paquets de la famille. C etait juste
  tant que la configuration les tenait en groupe `fixed` : ils avancaient
  ensemble. Ce groupe retire, `odoro` en 1.0.3 demandait
  `@odoro-cli/libs@^1.0.3`, restee en 1.0.2 — et `npm install` echouait a la
  premiere commande d un projet neuf.

  Les numeros des voisins sont desormais releves a la compilation, la ou les six
  manifestes sont cote a cote. Celui de la CLI reste lu dans son propre
  manifeste : il est le seul connu a l execution.

## 1.0.3

### Patch Changes

- c5803ed: `odoro` promettait Node >= 20 tout en dependant de Babel 8, qui exige
  `^22.18.0 || >=24.11.0`. Chaque installation d un projet echafaude affichait
  quatorze avertissements `EBADENGINE`, sur des paquets que l utilisateur n a pas
  choisis.

  Babel redescend en 7.x, qui accepte Node >= 6.9 et fait exactement le meme
  travail — il ne sert qu au greffon de rechargement a chaud. Verifie : la carte
  de source inline est toujours reprise, et le rechargement preserve l etat.

- 7f66d0f: Le projet echafaude porte une bascule de theme : systeme, clair, sombre. Le
  choix est memorise et applique avant la premiere peinture par un script de
  `index.html` — sans lui, un visiteur en theme force verrait un eclair de
  l autre theme.

  La page « A propos » lit le manifeste du projet au lieu d une liste ecrite a la
  main. Ce qui s affiche est donc ce qui a reellement ete installe, et cela reste
  vrai si un paquet est ajoute ou retire plus tard.

  Le fond decoratif remonte derriere la barre. Ancre au haut du contenu, il
  commencait sous elle et laissait en haut de page une bande plus sombre.

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

### Patch Changes

- 606f8c0: La page d accueil echafaudee reprend le dessin d odoro.dev : meme typographie,
  meme teinte de marque, meme grammaire de cartes, le signe dessine en SVG. Les
  sections vivent chacune dans leur fichier, si bien qu en ajouter une se lit en
  une ligne.

  Si le moteur a ete retenu, le fond devient une surface WebGL animee au lieu
  d un degrade. Il ne remplace qu un fichier : le reste de la page ne sait pas
  d ou vient son fond, et l aspect est le meme dans les deux cas.

  Sans les bibliotheques, la meme page est rendue en CSS ordinaire — meme dessin,
  une variable `--marque` pour la teinte.

  Corrige au passage : `odoro add` ecrivait `from 'src/odoro/…'` quand le projet
  n avait pas d alias dans son `tsconfig.json`. Un tel chemin n est pas un
  specificateur valide, et le projet ne compilait pas. Les imports entre
  composants copies sont desormais relatifs des que le prefixe n est pas un
  alias — ce qui resout partout, sans configuration.

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

### Patch Changes

- f388687: Un projet echafaude ne compilait plus des lors qu il portait un `odoro.json`.

  Le `tsconfig.json` des gabarits declarait `baseUrl: "."`, qui fait resoudre les
  imports nus depuis la racine du projet. `import { defineConfig } from 'odoro'`
  y trouvait donc `odoro.json` — le fichier de configuration du registre — avant
  le paquet, et la compilation echouait sur un `defineConfig` introuvable.

  `baseUrl` est retire des deux gabarits : depuis TypeScript 4.1, les chemins de
  `paths` se resolvent contre le `tsconfig.json` lui-meme, et les alias `@/*`
  fonctionnent sans lui.

  Pour les projets deja crees, dont on ne peut pas reecrire le `tsconfig.json`,
  le chargement de la configuration nomme desormais `odoro` comme externe : il ne
  depend plus de cette resolution.

## 0.3.3

### Patch Changes

- f95d935: La case « Registre de composants » ecrit `odoro.json` pendant la creation —
  destination, prefixe d import deduit du `tsconfig.json`, adresse du registre —
  au lieu de se contenter de rappeler une commande. `odoro add` fonctionne donc
  des que le projet existe, sans question supplementaire.

  Les entrees du registre declarent enfin les paquets npm qu elles importent. Le
  champ `dependencies` de `meta.json` etait rempli a la main, et il l etait mal :
  455 entrees sur 461 le laissaient vide tout en important `@odoro-cli/engine`.
  Le registre annoncait des composants sans dependance, `odoro add` n avait rien
  a signaler, et le projet ne compilait pas. La liste se deduit maintenant des
  imports, ou elle ne peut pas mentir.

  Cocher le registre entraine donc le moteur, et le dit.

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

## 0.3.1

### Patch Changes

- Le serveur de developpement produit et sert la feuille d utilitaires. Elle
  n etait produite qu a la compilation : en developpement l application s ouvrait
  avec ses seules variables, sans mise en page ni couleurs.

  Rien n y est elague, pour qu une classe ajoutee pendant la session peigne sans
  redemarrage. Le fournisseur de style expose pour cela un `classesConnues`
  facultatif ; un paquet plus ancien ne l a pas, et le developpement retombe alors
  sur la feuille telle qu elle est livree.

  Les fichiers `.md` recoivent au passage leur type, au lieu d etre servis en
  binaire.

## 0.2.0

### Minor Changes

- La feuille de style ne voyage plus entiere. Le paquet livre un socle —
  variables, preflight, animations — et les utilitaires sont **produits a la
  compilation**, pour les seules classes que le projet emploie. Ce qui pesait
  1,65 Mo a l'installation n'en pese plus qu'une fraction, et toute la palette
  reste disponible sans que rien ne pese.

- Le moteur elague la feuille meme quand il ne trouve pas de generateur : il se
  rabat sur la purge au lieu de se taire. Auparavant, une resolution qui
  echouait laissait passer la feuille complete sans le dire — le chemin de
  generation n'etait jamais pris, et rien ne le signalait.

- Le modele `react-ts` decrit ce que la compilation fait reellement. Il
  promettait encore une feuille de 1,7 Mo elaguee a l'usage.

Publiee a la main : les versions 0.1.2 et 0.1.5 l'avaient ete aussi, sans
laisser de trace ici. Celle-ci en laisse une.

## 0.1.0

### Minor Changes

- d6b1a81: Commandes de registre : `odoro init`, `add`, `list`, `diff`, `doctor`.

  L'ecriture est transactionnelle — les fichiers sont ecrits a cote de leur
  destination puis mis en place, si bien qu'un echec laisse le projet intact.
  L'empreinte de ce qui a ete livre est notee dans `odoro.json` : elle seule
  permet a `diff` de distinguer une retouche locale d'une evolution amont.

  Le prefixe d'import est deduit du `tsconfig.json`, commentaires et virgules
  finales compris. Le poids d'un backend graphique est annonce avant l'ecriture,
  mesure plutot qu'estime. Hors terminal, une commande qui aurait besoin d'une
  confirmation refuse au lieu d'attendre indefiniment.

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

- b9e6bfa: Format de registre : schema d'une entree, resolution du graphe de dependances,
  et messages d'erreur qui citent le champ ou le chemin du cycle plutot que de
  dire « invalide ».

  Le schema refuse les destinations d'ecriture absolues ou remontantes, les
  destinations en double, et trois incoherences de cout : un composant couteux
  sans repli, un backend declare de deux facons differentes, une scene 3D classee
  autrement que couteuse.

### Patch Changes

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
