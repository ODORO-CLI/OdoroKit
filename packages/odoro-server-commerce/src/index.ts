/**
 * The Odoro storefront contract, served by an `@odoro-cli/server` app from its
 * own `shop` database (DECISIONS §43 of the Odoro repository).
 *
 * @module
 */

export { SHOP_MAJOR, shopInstalled, type Base, type Query } from './base.js'
export { CART_COOKIE } from './cart.js'
export {
  codesInstalled,
  discountFor,
  signCallback,
  verifyCallback,
  type CheckoutInput,
  type PaymentPort,
} from './checkout.js'
export { createCommerceModule, type CommerceOptions } from './module.js'
export {
  CUSTOMER_COOKIE,
  LINKS_PER_HOUR,
  SESSION_MAX_AGE,
  accountsInstalled,
  openSession,
  type MailPort,
} from './account.js'
export { ODORO_MAIL_PATH, odoroMail, type OdoroMailOptions } from './odoro-mail.js'
export {
  ODORO_PAYMENT_PATH,
  odoroPayment,
  signRequest,
  type OdoroPaymentOptions,
} from './odoro-payment.js'
export { baseFromPool, type PgClientLike, type PgPoolLike } from './pg.js'
export { productImage, storageInstalled, type StoredImage } from './images.js'
