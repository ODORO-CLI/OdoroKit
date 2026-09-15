---
'odoro': minor
---

Le moteur couvre ce qui lui manquait pour tenir un site de bout en bout.

**Fichiers `.env`.** Lus par mode — `.env`, `.env.local`, `.env.<mode>`,
`.env.<mode>.local` —, avec expansion des references et valeurs sur plusieurs
lignes. Une variable deja posee dans l'environnement n'est jamais ecrasee par un
fichier. Seul le prefixe `ODORO_` part dans le navigateur ; le reste ne quitte
pas la machine. `--mode` choisit les fichiers et remplit `import.meta.env.MODE`.

**Pre-rendu.** `build.prerender` rend chaque route en HTML a la compilation, et
le client hydrate au lieu de reconstruire. La sortie reste un ensemble de
fichiers statiques. Les deux gabarits l'activent, avec un `src/entry-server.tsx`
a remplir.

**Manifeste et prechargement.** `dist/manifest.json` donne, pour chaque entree,
son fichier empreinte, ses feuilles et ses fragments. Les fragments partages sont
declares en `modulepreload`, ce qui supprime un aller-retour par niveau de
profondeur d'import.

**`import.meta.glob`**, resolu a la compilation en imports statiques ordinaires.

**Imports a suffixe** : `?raw` pour le texte d'un fichier, `?url` pour son
adresse publique, `?worker` pour un fil d'execution compile a part.

**Greffons** : `transform`, `transformIndexHtml`, `configureServer`, et une
echappatoire vers le compilateur.

**Feuilles de style en developpement** : les `@import` sont integres et les
`url()` reecrites contre le dossier du fichier. Une image relative ecrite dans
une feuille imbriquee etait jusqu'ici cherchee a la racine du site, et ne
peignait rien.

Aussi : tailles comprimees au recapitulatif — et cartes de source exclues du
total, qui annoncait 1,7 Mo pour un site en livrant 90 Ko ; `server.https`,
`server.open`, `server.strictPort`.

**Deux defauts du gabarit `react-ts-server`, corriges au passage.** Son
`client/src/App.tsx` importait `../package.json`, qui n'existe pas a cet endroit
dans ce gabarit : le projet genere ne compilait pas. Et son montage du client
compile etait pose **apres** les gestionnaires de 404 et d'erreurs du noyau,
donc jamais atteint : en production, chaque page repondait 404. Le client est
desormais servi par une enveloppe montee devant le noyau.
