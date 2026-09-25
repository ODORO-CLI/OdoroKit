# @odoro-cli/commerce

## 0.1.1

### Patch Changes

- 9ca880d: `addProduct(productId)` on the client and `cart.addProduct` in `useCart`: adds a product's only variant, or its only one still for sale, and refuses to choose among several. The README example passed a product id to `cart.add`, which takes a variant id.
