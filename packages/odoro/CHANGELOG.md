# odoro

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
