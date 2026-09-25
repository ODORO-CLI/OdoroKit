---
'@odoro-cli/server': minor
---

`cookies.get(name)` reads a request cookie in a handler, next to `set` and `clear`. Refusals carry extension members (RFC 9457): `new ConflictError(message, { extensions: { erreur } })` adds fields to the problem document; the standard members always win.
