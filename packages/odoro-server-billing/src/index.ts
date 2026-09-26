/**
 * @odoro-cli/server-billing — billing for the teams of an `@odoro-cli/server` app.
 *
 * Plans, seats, trials and usage, READ from the site's `billing` database;
 * usage APPENDED; payments, trials and seat changes asked of Odoro with a
 * request signed by the site's secret. The site never writes a subscription.
 *
 * @module
 */

export {
  addedSeatsCents,
  extraSeatsCents,
  meterAmountCents,
  type MeterPrice,
} from './amounts.js'
export {
  BillingError,
  GRACE_HOURS,
  USAGE_EVENTS_PER_MINUTE,
  USAGE_MAX_QUANTITY,
  billingFor,
  billingInstalled,
  currentUsage,
  entitled,
  invoicesOf,
  isLive,
  limitOf,
  listPlans,
  planById,
  recordUsage,
  seatsAllowMember,
  seatsOf,
  standingOf,
  subscriptionOf,
  usageOf,
  type Interval,
  type Invoice,
  type Meter,
  type MeterUsage,
  type Plan,
  type Standing,
  type Status,
  type Subscription,
} from './billing.js'
export { createBillingModule, type BillingOptions } from './module.js'
export {
  ODORO_BILLING_PATH,
  odoroBilling,
  signRequest,
  type OdoroBillingOptions,
  type OdoroBillingPort,
} from './odoro-billing.js'
