---
'odoro': minor
'create-odoro': minor
---

`npm create odoro` demande ce que le projet embarque, dans une liste a cocher :
bibliotheques, routeur et icones coches, moteur et registre a la demande. Un
drapeau `--modules` fait le meme choix sans rien demander, et `aucun` rend une
base React nue.

Le choix change vraiment le projet ecrit : les dependances non retenues sont
retirees du manifeste, le dossier `routes/` disparait sans routeur, et sans les
bibliotheques l application est posee en CSS ordinaire, sans classes `o-*`.

Deux entrees de la liste ne sont pas des paquets, et le createur ne fait pas
semblant : le routeur vient de `@odoro-cli/libs/router`, donc le cocher cable
les pages au lieu d installer quoi que ce soit, et le decocher ne desinstalle
rien ; les entrees du registre sont copiees une a une par `odoro add`, et la
commande est rappelee a la fin plutot qu ajoutee aux dependances.
