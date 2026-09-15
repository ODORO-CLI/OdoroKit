---
'odoro': patch
---

Un `import` de JSON arrive desormais sous forme de module en developpement.

`import { dependencies } from './package.json'` est resolu par la compilation —
esbuild integre le JSON et en tire des exports nommes — mais le serveur de
developpement servait le fichier tel quel. Le navigateur refusait :

    Failed to load module script: Expected a JavaScript-or-Wasm module script
    but the server responded with a MIME type of "application/json".

La page restait blanche, et le message ne disait pas quel import etait en
cause. C etait le cas de tout projet cree depuis la version precedente, dont la
page « A propos » lit le manifeste.

Une requete ordinaire — un `fetch`, une adresse tapee — continue de recevoir le
fichier.
