---
'odoro': patch
---

L echafaudeur demandait une version qui n existe pas.

Il posait le numero de la CLI sur tous les paquets de la famille. C etait juste
tant que la configuration les tenait en groupe `fixed` : ils avancaient
ensemble. Ce groupe retire, `odoro` en 1.0.3 demandait
`@odoro-cli/libs@^1.0.3`, restee en 1.0.2 — et `npm install` echouait a la
premiere commande d un projet neuf.

Les numeros des voisins sont desormais releves a la compilation, la ou les six
manifestes sont cote a cote. Celui de la CLI reste lu dans son propre
manifeste : il est le seul connu a l execution.
