---
'@odoro-cli/bits': patch
---

Les deux seules entrees qui dependaient d un paquet tiers sont retirees :
`background/ashen-press`, qui chargeait `@designcodeio/threeui`, et
`hero/spline-scene`, qui chargeait `@splinetool/react-spline` et son runtime.

Le registre ne reclame donc plus que `react`, `@odoro-cli/engine` et
`@odoro-cli/icons` : 459 entrees, aucune dependance hors du moteur maison.
