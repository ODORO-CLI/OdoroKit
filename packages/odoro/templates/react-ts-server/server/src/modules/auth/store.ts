/**
 * Where the accounts and the sessions live.
 *
 * ## PostgreSQL, and nothing else
 *
 * There is no local database in this stack: `DATABASE_URL` points at a hosted
 * one. So this module refuses clearly when it is missing, rather than falling
 * back to memory — a demo that works without a database teaches a shape that
 * stops working the day it is deployed, and does so silently.
 *
 * ## The schema creates itself, once
 *
 * Two tables, created on first use. That is enough for a demo and for a first
 * deployment; it is not a migration tool. The day the schema changes shape,
 * the project needs a real one — and that day, this file is the one to delete.
 *
 * ## What is stored of a session
 *
 * Its **fingerprint**, not the session itself. Whoever reads the table — a
 * backup, a support query, a leak — holds hashes, and a hash does not open a
 * session. The identifier itself only ever exists in the cookie.
 *
 * @module
 */

import { createHash, randomBytes } from 'node:crypto'

import { ServiceUnavailableError } from '@odoro-cli/server'
import pg from 'pg'

/** An account, as the rest of the module reads it. */
export interface Account {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly createdAt: Date
}

/** An account and the hash that guards it. */
interface AccountRow extends Account {
  readonly password: string
}

/** How long a session lives, in seconds. */
export const SESSION_TTL = 60 * 60 * 24 * 30

/** The schema, created on first use. */
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS app_user (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email       text NOT NULL UNIQUE,
    name        text NOT NULL,
    password    text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS app_session (
    id          text PRIMARY KEY,
    user_id     uuid NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    expires_at  timestamptz NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS app_session_user ON app_session(user_id);
`

/** The fingerprint under which a session identifier is stored. */
function fingerprint(id: string): string {
  return createHash('sha256').update(id).digest('hex')
}

/** What the rest of the module calls. */
export interface AuthStore {
  create(email: string, name: string, password: string): Promise<Account>
  byEmail(email: string): Promise<AccountRow | undefined>
  byId(id: string): Promise<Account | undefined>
  openSession(userId: string): Promise<string>
  readSession(sessionId: string): Promise<{ userId: string } | undefined>
  closeSession(sessionId: string): Promise<void>
  dispose(): Promise<void>
}

/**
 * Opens the store.
 *
 * @param url The `DATABASE_URL`. Empty, every call refuses with a 503 that
 *   names what is missing — the interface still starts, and says so.
 *
 * @example
 * const store = createAuthStore(config.DATABASE_URL)
 * await store.create('a@b.c', 'Ada', 'correct horse battery staple')
 */
export function createAuthStore(url: string): AuthStore {
  const configured = url.trim().length > 0

  const absent = (): never => {
    throw new ServiceUnavailableError(
      'DATABASE_URL missing: the accounts have nowhere to live. ' +
        'See .env.example, or run `odoro db:create`.',
    )
  }

  const pool = configured
    ? new pg.Pool({
        connectionString: url,
        // A demo does not need twenty connections, and a hosted database
        // counts them.
        max: 5,
      })
    : undefined

  let ready: Promise<void> | undefined

  /** Creates the schema, once per process. */
  const ensure = async (): Promise<pg.Pool> => {
    if (pool === undefined) return absent()
    ready ??= pool.query(SCHEMA).then(() => undefined)
    await ready
    return pool
  }

  return {
    async create(email, name, password) {
      const db = await ensure()
      const { rows } = await db.query<Account>(
        `INSERT INTO app_user (email, name, password)
         VALUES ($1, $2, $3)
         RETURNING id, email, name, created_at AS "createdAt"`,
        [email, name, password],
      )
      // The row is there: `INSERT ... RETURNING` either returns it or throws.
      return rows[0] as Account
    },

    async byEmail(email) {
      const db = await ensure()
      const { rows } = await db.query<AccountRow>(
        `SELECT id, email, name, password, created_at AS "createdAt"
         FROM app_user WHERE email = $1`,
        [email],
      )
      return rows[0]
    },

    async byId(id) {
      const db = await ensure()
      const { rows } = await db.query<Account>(
        `SELECT id, email, name, created_at AS "createdAt"
         FROM app_user WHERE id = $1`,
        [id],
      )
      return rows[0]
    },

    async openSession(userId) {
      const db = await ensure()

      // Expired sessions go now, on a query that has nothing else to do. A
      // scheduled job would be better; this is enough not to keep them
      // forever, and it costs one index scan per login.
      await db.query(`DELETE FROM app_session WHERE expires_at <= now()`)

      // 256 bits drawn from the system source. This value never lands in the
      // table: only its fingerprint does.
      const id = randomBytes(32).toString('base64url')
      await db.query(
        `INSERT INTO app_session (id, user_id, expires_at)
         VALUES ($1, $2, now() + make_interval(secs => $3))`,
        [fingerprint(id), userId, SESSION_TTL],
      )
      return id
    },

    async readSession(sessionId) {
      const db = await ensure()
      const { rows } = await db.query<{ userId: string }>(
        `SELECT user_id AS "userId" FROM app_session
         WHERE id = $1 AND expires_at > now()`,
        [fingerprint(sessionId)],
      )
      return rows[0]
    },

    async closeSession(sessionId) {
      const db = await ensure()
      await db.query(`DELETE FROM app_session WHERE id = $1`, [fingerprint(sessionId)])
    },

    async dispose() {
      await pool?.end()
    },
  }
}
