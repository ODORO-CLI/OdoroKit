---
'odoro': patch
---

Un projet echafaude ne compilait plus des lors qu il portait un `odoro.json`.

Le `tsconfig.json` des gabarits declarait `baseUrl: "."`, qui fait resoudre les
imports nus depuis la racine du projet. `import { defineConfig } from 'odoro'`
y trouvait donc `odoro.json` — le fichier de configuration du registre — avant
le paquet, et la compilation echouait sur un `defineConfig` introuvable.

`baseUrl` est retire des deux gabarits : depuis TypeScript 4.1, les chemins de
`paths` se resolvent contre le `tsconfig.json` lui-meme, et les alias `@/*`
fonctionnent sans lui.

Pour les projets deja crees, dont on ne peut pas reecrire le `tsconfig.json`,
le chargement de la configuration nomme desormais `odoro` comme externe : il ne
depend plus de cette resolution.
