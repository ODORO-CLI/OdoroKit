---
'odoro': patch
---

Un module ne recoit plus le document de l application.

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
