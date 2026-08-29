---
'odoro-engine': patch
---

Correction du verre depoli apres le retrait de la couche semantique :
`o-glass` suivait une variable de surface qui n'existe plus. Il se decline
desormais en clair et en sombre — `o-glass dark:o-glass-dark` — parce
qu'aucune variable ne bascule plus toute seule.
