# create-odoro

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
