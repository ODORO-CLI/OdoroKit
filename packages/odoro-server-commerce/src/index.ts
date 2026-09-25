/**
 * The Odoro storefront contract, served by an `@odoro-cli/server` app from its
 * own `shop` database (DECISIONS §43 of the Odoro repository).
 *
 * @module
 */

export { SHOP_MAJOR, shopInstalled, type Base, type Query } from './base.js'
export { CART_COOKIE } from './cart.js'
export {
  signCallback,
  verifyCallback,
  type CheckoutInput,
  type PaymentPort,
} from './checkout.js'
export { createCommerceModule, type CommerceOptions } from './module.js'
