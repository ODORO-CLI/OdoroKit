# @odoro-cli/server-commerce

## 0.3.0

### Minor Changes

- ad65503: Product images from the site's `storage` capability: inline in `visuel` and `visuels` (base64), and as bytes through `productImage(db, id)` for `geste=image`. A database without `storage` keeps `visuel: null`.

## 0.2.0

### Minor Changes

- e305a0b: `baseFromPool(pool)` turns a node-postgres pool into the module's database (a transaction holds one connection). `odoroPayment({ origin, site, secret })` opens a site's payment at Odoro with a signed request (`x-odoro-signature`: HMAC-SHA256 of `timestamp.body`), and passes Odoro's refusal on to the buyer.
