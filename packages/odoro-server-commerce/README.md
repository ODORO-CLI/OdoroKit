# @odoro-cli/server-commerce

The Odoro storefront contract (`/api/storefront/*`), served by an `@odoro-cli/server` app from the site's own shop database — the `shop` capability of Odoro's cloud, version 1.

The V4 storefront script and `@odoro-cli/commerce` talk to it exactly as they talk to Odoro's central storefront.

```ts
import { createApp } from '@odoro-cli/server'
import { baseFromPool, createCommerceModule, odoroPayment } from '@odoro-cli/server-commerce'
import pg from 'pg'

createApp({
  // …
  modules: [
    createCommerceModule({
      db: baseFromPool(new pg.Pool({ connectionString: process.env.DATABASE_URL })),
      payment: odoroPayment({ origin: 'https://odoro.ai', site, secret }),
      callbackSecret: secret, // the same site secret signs Odoro's callbacks
    }),
  ],
})
```

## What it serves

- catalogue, product page, collections, order tracking — only what is published;
- the cart, in an `HttpOnly` cookie set on the first add, never on a visit;
- checkout: stock checked against open reservations, prices of the day (changes reported), a 30-minute reservation, payment opened through the `PaymentPort`;
- `POST /api/storefront/payment-callback`: the order becomes paid only on a callback signed with `callbackSecret` (HMAC-SHA256 of `reference.state.timestamp`, 5-minute window). Idempotent: the stock leaves once.

## What it does not serve yet

Customer accounts (503, said by name) and discount codes (any code is refused by name). Product images are `null` until a storage adapter serves them.

## Tests

`COMMERCE_TEST_URL=postgres://user@host:port/postgres pnpm test` — each run creates a database, loads `test/fixtures/shop-1.0.0.sql`, and drops it.
