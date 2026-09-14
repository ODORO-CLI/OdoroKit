# @odoro-cli/server

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
