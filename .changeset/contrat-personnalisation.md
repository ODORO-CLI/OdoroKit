---
'@odoro-cli/engine': minor
'odoro': patch
---

Contrat de personnalisation : `Customisable`, `mergePresentation`, `fromSlot`
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
