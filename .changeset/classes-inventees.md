---
'odoro': patch
---

Le fond decoratif du gabarit ne peignait rien.

Le systeme de style n emet pas de classe a valeur arbitraire : `o-h-[42rem]` ne
produit aucune regle, et une classe absente ne peint rien. Le conteneur du fond
mesurait zero pixel de haut, ses deux nappes aussi — sans que rien ne le
signale, ni a la compilation ni a l execution.

Les tailles hors echelle sont ecrites en style, ou elles sont sures. Un test
refuse desormais toute classe a valeur arbitraire dans les gabarits.
