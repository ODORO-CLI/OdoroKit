---
'@odoro-cli/commerce': patch
---

`addProduct(productId)` on the client and `cart.addProduct` in `useCart`: adds a product's only variant, or its only one still for sale, and refuses to choose among several. The README example passed a product id to `cart.add`, which takes a variant id.
