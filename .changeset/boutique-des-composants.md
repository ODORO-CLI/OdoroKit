---
'@odoro-cli/libs': minor
---

Shop components: `ProductCard`, `ProductGrid`, `CartDrawer` and `formatPrice`. Presentational, fed by props; they keep the attribute contract Odoro's storefront reads (`data-produit`, `data-acheter`, the name in the `h3`, the price in `[data-prix]`). The data layer is the new `@odoro-cli/commerce`.
