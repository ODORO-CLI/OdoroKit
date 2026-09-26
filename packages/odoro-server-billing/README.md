# @odoro-cli/server-billing

Billing for the teams of an `@odoro-cli/server` app: plans, seats, trials and
usage metering, stored in the site's own database (the `billing` capability of
odoro-cloud, which needs `teams`, which needs `accounts`).

**Private.** Not published until Odoro's founder says so.

- **Plans** are written by Odoro, from the site's canvas. This module reads them.
- **A team's subscription** (plan, seats, trial end, current period, status) is
  written by Odoro ONLY, when the money arrives. The site's database role
  cannot write it: the server refuses, not this code.
- **Usage** is appended by the site (`recordUsage`, insert only, bounded,
  idempotent by key). Odoro reads it at the end of each period, computes the
  amount and asks for it.
- **Payments** are asked of Odoro with a request signed by the site's secret
  (`odoroBilling`), exactly like `odoroPayment` in `@odoro-cli/server-commerce`.
  The request names a plan and a team, never a price. The site never holds a
  payment key.

```ts
import { createBillingModule, entitled, odoroBilling } from '@odoro-cli/server-billing'

const billing = createBillingModule({
  db: pool,
  odoro: odoroBilling({ origin: ODORO_URL, site: SITE_ID, secret: SITE_SECRET }),
})
if (await entitled(pool, team.id, 'export')) {
  // …
}
```

Routes: `GET /api/billing/plans`, `GET /api/billing`, `GET /api/billing/entitled`,
`POST /api/billing/checkout`, `POST /api/billing/trial`, `POST /api/billing/seats`.
Only a team's owner (`proprietaire`) commits it to paying.

Amounts are integer cents. A metered metric is billed by block: `unitPriceCents`
per `unitSize` units beyond `included`, rounded up to whole blocks. Seats added
during a period are charged for what remains of it, rounded up to the cent.
