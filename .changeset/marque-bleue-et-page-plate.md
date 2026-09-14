---
'odoro': minor
'@odoro-cli/libs': minor
'@odoro-cli/engine': minor
'@odoro-cli/icons': minor
'@odoro-cli/server': minor
'create-odoro': minor
---

La teinte de marque passe au bleu du logo (`#3b82f6`). Une seule table change
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
