# odoro

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
