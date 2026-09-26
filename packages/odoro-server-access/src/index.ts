/**
 * @odoro-cli/server-access — gated content for an `@odoro-cli/server` app.
 *
 * Entitlements are written by Odoro in the site's `access` database (a
 * purchase, a renewal, a refund); this package reads them: the check every
 * reserved route calls (`entitled`), the buyer area, and content delivery.
 *
 * @module
 */

export {
  accessInstalled,
  area,
  contentFile,
  entitled,
  markSeen,
  readContent,
  type AreaProduct,
  type ContentReading,
  type Query,
} from './access.js'
export { createAccessModule, type AccessOptions } from './module.js'
