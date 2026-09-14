---
'odoro': patch
---

Deux causes de l erreur « strict MIME checking », corrigees.

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
