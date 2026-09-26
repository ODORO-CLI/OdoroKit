# @odoro-cli/server-commerce

## 0.4.0

### Minor Changes

- 2fa5f50: Les codes de remise : la caisse chiffre le code tapé depuis `shop.discount_codes` (capacité shop 1.2.0) — pourcentage ou montant, dates, activation, panier minimum et plafond d'usages vérifiés côté serveur ; l'usage compte quand la commande est payée ; le code est figé une fois le paiement ouvert. Une boutique encore en 1.1.0 refuse un code par son nom, comme avant.

## 0.3.0

### Minor Changes

- ad65503: Product images from the site's `storage` capability: inline in `visuel` and `visuels` (base64), and as bytes through `productImage(db, id)` for `geste=image`. A database without `storage` keeps `visuel: null`.

## 0.2.0

### Minor Changes

- e305a0b: `baseFromPool(pool)` turns a node-postgres pool into the module's database (a transaction holds one connection). `odoroPayment({ origin, site, secret })` opens a site's payment at Odoro with a signed request (`x-odoro-signature`: HMAC-SHA256 of `timestamp.body`), and passes Odoro's refusal on to the buyer.
