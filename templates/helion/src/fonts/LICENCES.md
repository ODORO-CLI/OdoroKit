# Les polices de ce projet

Trois familles, toutes sous licence libre. C'est une correction : la troisième
ne l'était pas.

## Lato

`Lato-Regular`, `Lato-Bold`, `Lato-ExtraBold` (`.woff`, `.woff2`)

Dessinée par Łukasz Dziedzic. Distribuée sous la **SIL Open Font License 1.1**,
qui autorise l'usage, la modification et la redistribution, y compris
commerciale, à condition que cette mention voyage avec les fichiers et que la
police ne soit pas vendue seule.

Texte complet : <https://openfontlicense.org/>
Source : <https://fonts.google.com/specimen/Lato>

## Mulish

Chargée depuis Google Fonts par un `@import` dans `src/styles.css`, sous **SIL
Open Font License 1.1**. Aucun fichier n'est embarqué.

## Jost

Chargée depuis Google Fonts par un `<link>` dans `index.html`, sous **SIL Open
Font License 1.1**. Aucun fichier n'est embarqué.

Dessinée par Owen Earl, d'après les proportions géométriques de la Futura.

## Ce qui a changé, et pourquoi

Le gabarit d'origine employait **Gilroy** pour les titres et le texte. C'est une
police commerciale : elle se vend au poids, par graisse et par volume de pages
vues, et sa licence n'autorise ni la redistribution des fichiers ni leur mise à
disposition au téléchargement.

Les fichiers étaient arrivés avec le gabarit et avaient été conservés, la
migration s'interdisant de changer la typographie. Mais leur présence dans un
dépôt public, et leur inclusion dans l'archive téléchargeable de la galerie,
dépassaient ce que la licence permet — quelle que soit la fidélité visuelle
qu'on y gagnait.

Trois issues étaient possibles : produire la licence, substituer une famille
libre, ou servir les fichiers depuis une origine sous licence. **La deuxième a
été retenue**, et Jost est le dessin libre le plus proche : même squelette
géométrique, même hauteur d'x à un cheveu près.

La substitution tient en trois points, si quelqu'un veut la refaire autrement :

1. les deux blocs `@font-face` de Gilroy ont été retirés de `src/styles.css` ;
2. la variable `--font-gilroy` est devenue `--font-titre`, nommée par son rôle
   plutôt que par un dessin — ce qui évite d'avoir à renommer à chaque
   changement de police ;
3. le `<link>` de `index.html` charge la famille depuis Google Fonts.

Le rendu bouge légèrement. C'était le prix, et il est plus bas que celui d'une
redistribution non autorisée.
