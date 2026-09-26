/**
 * @odoro-cli/server-accounts — visitor accounts for an `@odoro-cli/server` app.
 *
 * Sign-up by password or by link, e-mail verification, sessions, password
 * reset and deletion, in the site's `accounts` database. Passwords are hashed
 * with scrypt; sessions and links are stored as fingerprints only.
 *
 * @module
 */

export {
  AccountError,
  LINK_MINUTES,
  LINKS_PER_HOUR,
  SESSION_MAX_AGE,
  accountOf,
  accountsInstalled,
  address,
  deleteAccount,
  openLink,
  requestLink,
  requestReset,
  resetPassword,
  signIn,
  signOut,
  signUp,
  verifyEmail,
  type Account,
  type AccountMail,
  type Query,
} from './accounts.js'
export {
  ACCOUNT_COOKIE,
  createAccountsModule,
  whoIsSignedIn,
  type AccountsOptions,
} from './module.js'
export {
  PASSWORD_MAX,
  PASSWORD_MIN,
  acceptablePassword,
  hashPassword,
  verifyPassword,
} from './password.js'
