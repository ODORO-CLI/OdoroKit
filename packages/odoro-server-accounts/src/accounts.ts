/**
 * Visitor accounts, in the site's own database (the `accounts` capability).
 *
 * Two ways in, one account:
 *
 * - a PASSWORD (hashed with scrypt, `password.ts`), with an e-mail to verify
 *   the address;
 * - a LINK by e-mail, which also verifies the address, since only its owner
 *   could open it.
 *
 * Sessions and links live in the database as FINGERPRINTS (SHA-256) only: a
 * database that is read signs nobody in.
 *
 * Nothing here says whether an address has an account. Sign-up, the link and
 * the reset request answer the same whatever the address, and a failed
 * sign-in takes as long for an unknown address as for a wrong password.
 *
 * @module
 */

import { createHash, randomBytes } from 'node:crypto'

import {
  DECOY_HASH,
  acceptablePassword,
  hashPassword,
  verifyPassword,
} from './password.js'

/** What this module needs of the database: one query at a time, with parameters. */
export interface Query {
  query<R = Record<string, unknown>>(
    sql: string,
    params?: readonly unknown[],
  ): Promise<{ rows: R[]; rowCount?: number | null }>
}

/** Where the e-mails leave: the site holds no mail key, Odoro sends them. */
export interface AccountMail {
  send(input: {
    readonly email: string
    readonly kind: 'verification' | 'reinitialisation' | 'lien'
    readonly token: string
  }): Promise<void>
}

export interface Account {
  readonly id: string
  readonly email: string
  readonly verified: boolean
}

/** How long a session lasts, in seconds: ninety days. */
export const SESSION_MAX_AGE = 90 * 24 * 3600
/** How long each kind of link stays valid, in minutes. */
export const LINK_MINUTES = {
  verification: 24 * 60,
  reinitialisation: 30,
  lien: 15,
} as const
/** Links of one kind per account per hour: without a bound, a form fills a mailbox. */
export const LINKS_PER_HOUR = 3

const TOKEN = /^[A-Za-z0-9_-]{20,80}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export class AccountError extends Error {
  constructor(
    readonly status: 400 | 401,
    message: string,
  ) {
    super(message)
    this.name = 'AccountError'
  }
}

function fingerprint(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function newToken(): string {
  return randomBytes(32).toString('base64url')
}

/** An address, normalised; refused when it is not one. */
export function address(raw: unknown): string {
  const email = String(raw ?? '')
    .trim()
    .toLowerCase()
    .slice(0, 254)
  if (!EMAIL.test(email))
    throw new AccountError(400, "Cette adresse de courriel n'est pas valable.")
  return email
}

function password(raw: unknown): string {
  if (!acceptablePassword(raw)) {
    throw new AccountError(
      400,
      'Le mot de passe doit compter entre 10 et 200 caractères.',
    )
  }
  return raw
}

/** Is the `accounts` capability installed in this database? */
export async function accountsInstalled(db: Query): Promise<boolean> {
  try {
    const { rows } = await db.query<{ present: boolean }>(
      `SELECT to_regclass('accounts.users') IS NOT NULL AS present`,
    )
    return rows[0]?.present === true
  } catch {
    return false
  }
}

/** A link of this kind, for this account — unless three already left this hour. */
async function issueLink(
  db: Query,
  mail: AccountMail,
  user: { id: string; email: string },
  kind: 'verification' | 'reinitialisation' | 'lien',
): Promise<void> {
  const { rows } = await db.query<{ n: number }>(
    `SELECT count(*)::integer AS n FROM accounts.tokens
      WHERE user_id = $1 AND kind = $2 AND created_at > now() - interval '1 hour'`,
    [user.id, kind],
  )
  if (Number(rows[0]?.n ?? 0) >= LINKS_PER_HOUR) return
  const token = newToken()
  await db.query(
    `INSERT INTO accounts.tokens (fingerprint, user_id, kind, expires_at)
     VALUES ($1, $2, $3, now() + make_interval(mins => $4))`,
    [fingerprint(token), user.id, kind, LINK_MINUTES[kind]],
  )
  try {
    await mail.send({ email: user.email, kind, token })
  } catch {
    // The answer stays the same: it must teach nothing to whoever tries.
  }
}

/** Opens a session for this account. Returns the token to put in the cookie. */
async function openSession(db: Query, userId: string): Promise<string> {
  const token = newToken()
  await db.query(
    `INSERT INTO accounts.sessions (fingerprint, user_id, expires_at)
     VALUES ($1, $2, now() + make_interval(secs => $3))`,
    [fingerprint(token), userId, SESSION_MAX_AGE],
  )
  await db.query('UPDATE accounts.users SET last_seen_at = now() WHERE id = $1', [userId])
  return token
}

/** Consumes a link of this kind: it serves ONCE. Returns its account, or null. */
async function consume(
  db: Query,
  token: unknown,
  kind: 'verification' | 'reinitialisation' | 'lien',
): Promise<string | null> {
  if (typeof token !== 'string' || !TOKEN.test(token)) return null
  const { rows } = await db.query<{ user_id: string }>(
    `UPDATE accounts.tokens SET used_at = now()
      WHERE fingerprint = $1 AND kind = $2 AND used_at IS NULL AND expires_at > now()
      RETURNING user_id`,
    [fingerprint(token), kind],
  )
  return rows[0]?.user_id ?? null
}

/**
 * Sign-up with a password. The answer is the same whether the address is new
 * or not: a new address receives a verification link; a known one receives a
 * sign-in link instead — its owner can use it, anyone else learns nothing.
 */
export async function signUp(
  db: Query,
  mail: AccountMail,
  input: { email?: unknown; password?: unknown },
): Promise<void> {
  const email = address(input.email)
  const hash = await hashPassword(password(input.password))
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO accounts.users (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO NOTHING RETURNING id`,
    [email, hash],
  )
  const created = rows[0]
  if (created !== undefined) {
    await issueLink(db, mail, { id: created.id, email }, 'verification')
    return
  }
  const { rows: known } = await db.query<{ id: string }>(
    'SELECT id FROM accounts.users WHERE email = $1',
    [email],
  )
  if (known[0] !== undefined)
    await issueLink(db, mail, { id: known[0].id, email }, 'lien')
}

/**
 * Opens a session for an address that ANOTHER link has just proven — an
 * invitation to a team, opened from its e-mail. The account is created when
 * the address has none, and marked verified: only its owner could open the
 * link.
 *
 * Never call it with an address the visitor typed: that would sign anyone in
 * as anyone. The caller's own single-use link is the proof.
 */
export async function signInWithProvenAddress(
  db: Query,
  rawEmail: unknown,
): Promise<{ session: string; account: Account }> {
  const email = address(rawEmail)
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO accounts.users (email, verified_at) VALUES ($1, now())
     ON CONFLICT (email) DO UPDATE SET verified_at = coalesce(accounts.users.verified_at, now())
     RETURNING id`,
    [email],
  )
  const id = rows[0]!.id
  return { session: await openSession(db, id), account: { id, email, verified: true } }
}

/** The link from the verification e-mail. */
export async function verifyEmail(db: Query, token: unknown): Promise<boolean> {
  const userId = await consume(db, token, 'verification')
  if (userId === null) return false
  await db.query(
    'UPDATE accounts.users SET verified_at = coalesce(verified_at, now()) WHERE id = $1',
    [userId],
  )
  return true
}

/**
 * Sign-in with a password. Returns the session token, or throws the SAME
 * refusal for an unknown address, an account without password and a wrong
 * password — after the same amount of work.
 */
export async function signIn(
  db: Query,
  input: { email?: unknown; password?: unknown },
): Promise<string> {
  const refused = new AccountError(401, 'Adresse ou mot de passe incorrect.')
  let email: string
  try {
    email = address(input.email)
  } catch {
    await verifyPassword(String(input.password ?? ''), DECOY_HASH)
    throw refused
  }
  const { rows } = await db.query<{ id: string; password_hash: string | null }>(
    'SELECT id, password_hash FROM accounts.users WHERE email = $1',
    [email],
  )
  const user = rows[0]
  const ok = await verifyPassword(
    String(input.password ?? ''),
    user?.password_hash ?? DECOY_HASH,
  )
  if (user === undefined || user.password_hash === null || !ok) throw refused
  return await openSession(db, user.id)
}

/** A sign-in link by e-mail. Creates the account when the address is new. */
export async function requestLink(
  db: Query,
  mail: AccountMail,
  input: { email?: unknown },
): Promise<void> {
  const email = address(input.email)
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO accounts.users (email) VALUES ($1)
     ON CONFLICT (email) DO UPDATE SET email = excluded.email
     RETURNING id`,
    [email],
  )
  await issueLink(db, mail, { id: rows[0]!.id, email }, 'lien')
}

/**
 * The link from the e-mail, opened. It verifies the address (only its owner
 * could open it) and returns the session token — or null when it is unknown,
 * used or expired.
 */
export async function openLink(db: Query, token: unknown): Promise<string | null> {
  const userId = await consume(db, token, 'lien')
  if (userId === null) return null
  await db.query(
    'UPDATE accounts.users SET verified_at = coalesce(verified_at, now()) WHERE id = $1',
    [userId],
  )
  return await openSession(db, userId)
}

/** A reset link by e-mail — only to an address that has an account; the answer is the same. */
export async function requestReset(
  db: Query,
  mail: AccountMail,
  input: { email?: unknown },
): Promise<void> {
  const email = address(input.email)
  const { rows } = await db.query<{ id: string }>(
    'SELECT id FROM accounts.users WHERE email = $1',
    [email],
  )
  if (rows[0] !== undefined)
    await issueLink(db, mail, { id: rows[0].id, email }, 'reinitialisation')
}

/**
 * A new password, from the reset link. Every session of the account closes:
 * whoever knew the old password is signed out everywhere.
 */
export async function resetPassword(
  db: Query,
  input: { token?: unknown; password?: unknown },
): Promise<void> {
  const hash = await hashPassword(password(input.password))
  const userId = await consume(db, input.token, 'reinitialisation')
  if (userId === null) {
    throw new AccountError(
      400,
      'Ce lien est périmé ou a déjà servi. Demandez-en un nouveau.',
    )
  }
  await db.query(
    `UPDATE accounts.users SET password_hash = $2, verified_at = coalesce(verified_at, now())
      WHERE id = $1`,
    [userId, hash],
  )
  await db.query('DELETE FROM accounts.sessions WHERE user_id = $1', [userId])
}

/** The account behind a session token, or null. */
export async function accountOf(
  db: Query,
  session: string | undefined,
): Promise<Account | null> {
  if (session === undefined || !TOKEN.test(session)) return null
  const { rows } = await db.query<{
    id: string
    email: string
    verified_at: Date | null
  }>(
    `SELECT u.id, u.email, u.verified_at FROM accounts.sessions s
       JOIN accounts.users u ON u.id = s.user_id
      WHERE s.fingerprint = $1 AND s.expires_at > now()`,
    [fingerprint(session)],
  )
  const row = rows[0]
  if (row === undefined) return null
  return { id: row.id, email: row.email, verified: row.verified_at !== null }
}

/** Closes this session. */
export async function signOut(db: Query, session: string | undefined): Promise<void> {
  if (session === undefined || !TOKEN.test(session)) return
  await db.query('DELETE FROM accounts.sessions WHERE fingerprint = $1', [
    fingerprint(session),
  ])
}

/**
 * Deletes the account: the row leaves, and its sessions and links with it.
 * With a password, it must be given again — a session left open on a shared
 * computer must not be enough to erase someone.
 */
export async function deleteAccount(
  db: Query,
  account: Account,
  input: { password?: unknown },
): Promise<void> {
  const { rows } = await db.query<{ password_hash: string | null }>(
    'SELECT password_hash FROM accounts.users WHERE id = $1',
    [account.id],
  )
  const stored = rows[0]?.password_hash ?? null
  if (stored !== null && !(await verifyPassword(String(input.password ?? ''), stored))) {
    throw new AccountError(401, 'Le mot de passe ne correspond pas.')
  }
  await db.query('DELETE FROM accounts.users WHERE id = $1', [account.id])
}
