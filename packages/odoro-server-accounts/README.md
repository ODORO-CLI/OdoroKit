# @odoro-cli/server-accounts

> **Private for now.** This package is not published; it will be once Odoro gives the go.

Visitor accounts for an `@odoro-cli/server` app, stored in the site's own
database (the `accounts` capability of odoro-cloud).

- Sign-up by **password** (scrypt, a salt per account) with an e-mail to verify
  the address, or by **link** (which verifies the address by itself).
- **Sessions** in an HttpOnly cookie, ninety days.
- **Password reset** by link; every session of the account closes.
- **Deletion**: the account row leaves, its sessions and links with it. With a
  password, it must be given again.

Sessions and links are stored as SHA-256 **fingerprints** only: a database that
is read signs nobody in. Sign-up, the link and the reset request answer the
same whatever the address, and a failed sign-in takes as long for an unknown
address as for a wrong password — nothing here says who has an account.

```ts
import { createAccountsModule, whoIsSignedIn } from '@odoro-cli/server-accounts'

const accounts = createAccountsModule({ db: pool, mail })
// Another module (the buyer area) asks who is signed in:
const who = whoIsSignedIn(pool)
```

`mail.send({ email, kind, token })` receives `verification`, `reinitialisation`
or `lien`; the site builds the link to its own page from the token.
