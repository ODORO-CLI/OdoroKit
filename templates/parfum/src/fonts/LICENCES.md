# La police de ce projet

Une seule famille embarquée, et elle porte le site entier : le texte, les
libellés, et jusqu'aux textures du rendu WebGL, qui lisent `--font-3270` pour
peindre leurs étiquettes.

## 3270

`3270-Regular.otf`

Dessinée par Ricardo Bánffy, d'après la fonte du terminal IBM 3270. Distribuée
sous licence **BSD 3-Clause**, qui autorise l'usage, la modification et la
redistribution, y compris commerciale, à condition que la mention de copyright
et la liste des conditions voyagent avec les fichiers.

Source : <https://github.com/rbanffy/3270font>

## Onest

Chargée depuis Google Fonts par un `@import` dans `src/styles.css`, sous **SIL
Open Font License 1.1**. Aucun fichier n'est embarqué : c'est le service qui
sert la police.

## Ce que cela implique pour qui reprend ce gabarit

Rien à faire pour un site. Si vous redistribuez le gabarit lui-même, gardez ce
fichier à côté de la police — c'est la condition de la licence BSD.
