# Manoir

Maison d'architecte. Une visite cinématique : la vidéo 1080p se scrube au
défilement, quatre chapitres épinglés, une pièce par chapitre.

Pas de cadre applicatif — du HTML, une feuille de style, un fichier de script.
C'est la plus dépouillée des templates, et c'est délibéré.

## Démarrer

```sh
npm install
npm run dev
```

## Ce que ce portage a changé

Le design n'a pas bougé d'un pixel — c'est mesuré : huit positions de
défilement, deux largeurs, chaque capture sous le plancher de bruit de la page
d'origine comparée à elle-même.

Trois choses seulement :

| Avant | Après |
| --- | --- |
| `serve.js`, un serveur statique maison | `odoro dev` et `odoro preview` |
| `<link>` vers `src/styles.css` | La feuille est importée par l'entrée, donc hachée et minifiée |
| Adresses en `public/img/…` | `/img/…` — le moteur copie `public/` à la racine du site |

Le `serve.js` d'origine existait pour une seule raison, écrite en tête de son
propre fichier : sans requêtes de plage, un navigateur ne peut pas parcourir
une vidéo, et le scrub se fige. Le moteur les sert désormais lui-même — c'est
ce portage qui a fait apparaître le manque.

## Les polices

Cormorant (Google Fonts, SIL OFL) et General Sans (Fontshare, ITF Free Font
License) sont chargées depuis leurs CDN, comme dans l'original. Pour s'en
affranchir, les télécharger dans `public/fonts/` et remplacer les deux `<link>`
de `index.html` par des `@font-face`.

## Licence

Unlicense — domaine public, comme le dépôt d'origine.
