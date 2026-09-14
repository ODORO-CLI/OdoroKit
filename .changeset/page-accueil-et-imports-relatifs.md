---
'odoro': patch
---

La page d accueil echafaudee reprend le dessin d odoro.dev : meme typographie,
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
