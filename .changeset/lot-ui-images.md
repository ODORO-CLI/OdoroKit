---
'@odoro/libs': minor
'odoro': minor
---

`SelectMenu` : liste deroulante riche — icones, descriptions, recherche — pour
ce que le `select` natif ne permet pas. Sa documentation dit de prendre
`Select` par defaut : le natif herite du menu du systeme, de la saisie au
clavier et du comportement sur mobile, que ce composant doit reconstruire.

Le motif combobox de l'ARIA y est entier : `aria-activedescendant` plutot que
le focus, pour que la frappe continue d'arriver dans le champ ; les fleches qui
sautent les options desactivees ; la liste qui defile pour garder l'option
active visible ; et une valeur portee par un champ cache, qu'un formulaire
ordinaire soumet sans savoir que ce n'est pas un `select`.

Cote styles, le variant `focus:` s'applique desormais a l'anneau, et les
curseurs de redimensionnement rejoignent la feuille.

Cote registre, la categorie `image` rejoint le schema : un cadre et une
comparaison ont des contraintes propres — rapport, chargement, repli — qui ne
se rangent pas sous `effect`.
