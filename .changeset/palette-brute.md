---
'odoro-libs': major
---

Retrait de la couche semantique. Une couleur se designe desormais par sa place
dans la palette — `o-bg-zinc-900` — jamais par un role, et le theme s'ecrit sur
chaque classe : `o-bg-white dark:o-bg-zinc-900`.

C'est une rupture. Les variables `--o-color-*` n'existent plus, `colorLight`,
`colorDark`, `ColorToken` et `tokens.color` non plus.

Deux consequences mesurees. Les variants se composent maintenant — `dark:hover:`
— parce qu'aucune variable ne bascule plus toute seule et qu'un bouton
interactif ne pourrait sinon avoir qu'un seul theme. Et la feuille de base est
passee de 41,8 a 52,5 Ko compresses, +26 %, exactement pour cette raison.

La feuille de base porte desormais sept teintes — une echelle neutre, la
marque, et les quatre intentions qu'une interface exprime sans y penser. Les
290 nuances restent dans la feuille complete : sans ce decoupage, le retrait de
la couche semantique aurait fait basculer toute la palette dans la feuille de
base, et les deux paliers n'auraient plus eu d'objet.

`o-glass` se decline en clair et en sombre plutot que de suivre une variable,
et les voiles translucides — `o-bg-black-45`, `o-bg-white-10` — remplacent
l'ancien `overlay`.
