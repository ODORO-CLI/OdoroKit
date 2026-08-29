---
'odoro': minor
---

Commandes de registre : `odoro init`, `add`, `list`, `diff`, `doctor`.

L'ecriture est transactionnelle — les fichiers sont ecrits a cote de leur
destination puis mis en place, si bien qu'un echec laisse le projet intact.
L'empreinte de ce qui a ete livre est notee dans `odoro.json` : elle seule
permet a `diff` de distinguer une retouche locale d'une evolution amont.

Le prefixe d'import est deduit du `tsconfig.json`, commentaires et virgules
finales compris. Le poids d'un backend graphique est annonce avant l'ecriture,
mesure plutot qu'estime. Hors terminal, une commande qui aurait besoin d'une
confirmation refuse au lieu d'attendre indefiniment.
