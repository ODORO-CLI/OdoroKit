---
'odoro-engine': minor
'odoro-libs': minor
---

Quatre shaders de fond nouveaux — ondes, points, faisceaux, nappe — et
`useTokenShader`, qui mutualise ce que tout fond anime refait : lire des
tokens, les convertir en flottants, et les relire quand le theme bascule.
Ecrite dans chaque composant, cette sequence aurait derive a son rythme dans
chaque copie.

Cote styles, le variant `disabled:` rejoint les couleurs, l'opacite et le
curseur. Un controle desactive doit pouvoir se distinguer sans qu'on lui pose
une classe conditionnelle : c'est un etat du DOM, pas du composant.
