# La police de ce projet

Une seule famille, sous licence libre. C'est une correction : ce n'était pas le
cas.

## Inter

Chargée depuis Google Fonts par un `<link>` dans `index.html`, sous **SIL Open
Font License 1.1**. Aucun fichier n'est embarqué.

Dessinée par Rasmus Andersson pour les interfaces : hauteur d'x généreuse,
formes ouvertes, et des chiffres qui s'alignent en colonne.

Texte complet : <https://openfontlicense.org/>
Source : <https://fonts.google.com/specimen/Inter>

## Ce qui a changé, et pourquoi

Le gabarit d'origine employait **Google Sans Flex**, la police de marque de
Google. Elle n'est pas publiée sous SIL OFL, à la différence de la plupart des
familles du catalogue Google Fonts : elle n'y figure pas, et Google la réserve à
ses propres produits et à ses partenaires sous accord.

Six fichiers étaient embarqués — une coupe variable et cinq statiques. Ils
étaient arrivés avec le gabarit et avaient été conservés, la migration
s'interdisant de changer la typographie. Mais leur présence dans un dépôt
public, et leur inclusion dans l'archive téléchargeable de la galerie,
demandaient une autorisation que rien ici n'établit.

**Inter les remplace.** C'est le choix évident : une police d'interface, variable,
dessinée pour le même usage, et dont la licence autorise exactement ce que
l'autre interdisait.

Un détail mesuré a suivi la substitution : `src/lib/springs/reveal.ts` calait
une espace sur la largeur de l'espace de l'ancienne police, relevée à
`0.2245em`. Le commentaire nomme désormais Inter. La valeur, elle, n'a pas été
remesurée — si un décalage apparaît sur les révélations de texte, c'est là qu'il
faut regarder.
