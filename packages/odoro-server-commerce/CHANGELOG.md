# @odoro-cli/server-commerce

## 0.2.0

### Minor Changes

- e305a0b: `baseFromPool(pool)` turns a node-postgres pool into the module's database (a transaction holds one connection). `odoroPayment({ origin, site, secret })` opens a site's payment at Odoro with a signed request (`x-odoro-signature`: HMAC-SHA256 of `timestamp.body`), and passes Odoro's refusal on to the buyer.
