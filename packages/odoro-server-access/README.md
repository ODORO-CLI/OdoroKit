# @odoro-cli/server-access

Gated content for an `@odoro-cli/server` app.

Entitlements are written by Odoro in the site's `access` database (a purchase, a renewal, a refund, a gift from the seller's dashboard). This package only reads them:

- `entitled(db, email, productRef)` — THE check every reserved route calls. A right is active while it is not revoked, has started and has not ended.
- `createAccessModule({ db, who })` — `GET /api/access` (the buyer area), `GET /api/access/content?id=` (one content; 401/403 say which product opens it), `POST /api/access/progress` (seen, once).
- `contentFile(db, email, id)` — a reserved file as bytes, from the `storage` capability, for the app to mount on a raw route.

`who` comes from the app (the shop's customer session): this module never signs anyone in.

## Tests

`COMMERCE_TEST_URL=postgres://user@host:port/postgres pnpm test`.
