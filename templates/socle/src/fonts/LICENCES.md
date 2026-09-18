# La police de ce projet

Une seule famille, et elle demande une vérification avant toute
redistribution.

## Google Sans Flex — ⚠️ police de marque

`GoogleSansFlex-Variable-latin.woff2`,
`GoogleSansFlex_24pt-{Thin,Light,Regular,Medium}.ttf`,
`GoogleSansFlex_9pt-Thin.ttf`

C'est la police de marque de Google. **Elle n'est pas publiée sous SIL OFL**, à
la différence de la plupart des familles du catalogue Google Fonts : elle ne
figure pas dans ce catalogue, et Google la réserve à ses propres produits et à
ses partenaires sous accord.

Ces fichiers sont arrivés avec le gabarit d'origine. Ils sont conservés ici
parce que les retirer changerait la typographie du site, ce que la migration
s'interdit — mais **leur présence dans un dépôt public, et leur inclusion dans
l'archive téléchargeable de la galerie, demandent une autorisation** que rien
dans ce dossier n'atteste.

Trois issues, à trancher par qui publie :

1. produire l'autorisation correspondante, et la joindre ici ;
2. remplacer la famille par une libre de dessin proche — la substitution est
   contenue dans les blocs `@font-face` en tête de `src/styles.css` et dans la
   variable `--font-display` ;
3. retirer les fichiers du dépôt et les servir depuis une origine autorisée, la
   variable restant inchangée.

La coupe variable porte un axe optique (`opsz`) dont le gabarit se sert : le
sigle du hero repose sur `font-optical-sizing: auto` pour affiner ses traits.
Une famille de remplacement sans cet axe rendra ce titre plus gras — voir la
note dans `src/views/home/hero-section.tsx`.
