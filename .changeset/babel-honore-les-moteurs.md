---
'odoro': patch
---

`odoro` promettait Node >= 20 tout en dependant de Babel 8, qui exige
`^22.18.0 || >=24.11.0`. Chaque installation d un projet echafaude affichait
quatorze avertissements `EBADENGINE`, sur des paquets que l utilisateur n a pas
choisis.

Babel redescend en 7.x, qui accepte Node >= 6.9 et fait exactement le meme
travail — il ne sert qu au greffon de rechargement a chaud. Verifie : la carte
de source inline est toujours reprise, et le rechargement preserve l etat.
