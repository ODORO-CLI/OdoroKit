# @odoro-cli/bits

## 0.0.1

### Patch Changes

- f95d935: La case « Registre de composants » ecrit `odoro.json` pendant la creation —
  destination, prefixe d import deduit du `tsconfig.json`, adresse du registre —
  au lieu de se contenter de rappeler une commande. `odoro add` fonctionne donc
  des que le projet existe, sans question supplementaire.

  Les entrees du registre declarent enfin les paquets npm qu elles importent. Le
  champ `dependencies` de `meta.json` etait rempli a la main, et il l etait mal :
  455 entrees sur 461 le laissaient vide tout en important `@odoro-cli/engine`.
  Le registre annoncait des composants sans dependance, `odoro add` n avait rien
  a signaler, et le projet ne compilait pas. La liste se deduit maintenant des
  imports, ou elle ne peut pas mentir.

  Cocher le registre entraine donc le moteur, et le dit.

- e5c491f: Les deux seules entrees qui dependaient d un paquet tiers sont retirees :
  `background/ashen-press`, qui chargeait `@designcodeio/threeui`, et
  `hero/spline-scene`, qui chargeait `@splinetool/react-spline` et son runtime.

  Le registre ne reclame donc plus que `react`, `@odoro-cli/engine` et
  `@odoro-cli/icons` : 459 entrees, aucune dependance hors du moteur maison.
