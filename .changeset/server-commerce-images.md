---
'@odoro-cli/server-commerce': minor
---

Product images from the site's `storage` capability: inline in `visuel` and `visuels` (base64), and as bytes through `productImage(db, id)` for `geste=image`. A database without `storage` keeps `visuel: null`.
