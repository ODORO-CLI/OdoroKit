# Les polices de ce projet

Trois familles, et elles ne sont **pas** sous le même régime. Lire la troisième
avant de redistribuer ce dossier.

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

## Gilroy — ⚠️ police commerciale

`Gilroy-Regular`, `Gilroy-Medium` (`.woff`, `.woff2`)

Dessinée par Radomir Tinkov. **Ce n'est pas une police libre.** Elle se vend au
poids, par graisse et par volume de pages vues, et sa licence n'autorise ni la
redistribution des fichiers ni leur mise à disposition au téléchargement.

Ces fichiers sont arrivés avec le gabarit d'origine. Ils sont conservés ici
parce que les retirer changerait la typographie du site, ce que la migration
s'interdit — mais **leur présence dans un dépôt public, et leur inclusion dans
l'archive téléchargeable de la galerie, dépassent ce que la licence permet**, à
moins d'être couverts par une licence détenue par ailleurs.

Trois issues, à trancher par qui publie :

1. produire la licence Gilroy correspondante, et la joindre ici ;
2. remplacer Gilroy par une famille libre de dessin proche — la substitution est
   contenue dans les quatre blocs `@font-face` en tête de `src/styles.css` et
   dans la variable `--font-gilroy` ;
3. retirer les fichiers du dépôt et les servir depuis une origine sous licence,
   la variable restant inchangée.

Source : <https://www.radomirtinkov.com/>
