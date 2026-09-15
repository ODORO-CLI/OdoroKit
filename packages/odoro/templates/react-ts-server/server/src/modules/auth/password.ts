/**
 * Hashing and verifying a password.
 *
 * ## Why there is no dependency here
 *
 * `scrypt` is in the Node standard library, and it is a password hash designed
 * for the job: slow on purpose, and costly in memory, which is what makes a
 * rented GPU farm a bad deal for whoever steals the table.
 *
 * Argon2 and bcrypt are fine choices too. They are native modules: a compiler
 * on every machine, a rebuild on every Node upgrade, and a binary in the image.
 * For the same guarantee, that is a price worth not paying.
 *
 * ## What is stored
 *
 * `scrypt$N$r$p$salt$hash`, everything in hexadecimal. The parameters travel
 * with the hash: the day they are raised, the passwords already stored keep
 * verifying with their own, and each one migrates at its owner's next login.
 * A hash that does not carry its parameters cannot be migrated without asking
 * everyone to reset.
 *
 * @module
 */

import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto'
import { promisify } from 'node:util'

/**
 * `scrypt`, promised.
 *
 * The signature is written out: `promisify` keeps only the first overload of
 * `scrypt`, the one without options — and the options are exactly what carries
 * the cost here.
 */
const derive = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keyLength: number,
  options: ScryptOptions,
) => Promise<Buffer>

/**
 * Cost of the derivation.
 *
 * `N = 2^16` takes about a hundred milliseconds on an ordinary server, and
 * asks for 64 MB of memory. That is the knob to turn as machines get faster —
 * the stored hashes will follow on their own.
 */
const COST = { N: 65_536, r: 8, p: 1, keyLength: 32 } as const

/** Length of the salt, in bytes. */
const SALT = 16

/**
 * Hashes a password.
 *
 * @example
 * const stored = await hashPassword('correct horse battery staple')
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT)
  const key = await derive(password, salt, COST.keyLength, {
    N: COST.N,
    r: COST.r,
    p: COST.p,
    // `scrypt` refuses beyond a default ceiling well below what N = 2^16 asks
    // for. Raising it is not a weakening: it is the memory the cost demands.
    maxmem: 256 * COST.N * COST.r,
  })

  return ['scrypt', COST.N, COST.r, COST.p, salt.toString('hex'), key.toString('hex')].join(
    '$',
  )
}

/**
 * Verifies a password against a stored hash.
 *
 * ## Why it never throws
 *
 * A malformed hash — a truncated row, a migration half done — is a failed
 * verification, not a crash. Throwing here would turn a corrupt row into a
 * 500 on a login page, which tells an attacker that this account is special.
 *
 * @returns `true` if the password matches.
 *
 * @example
 * await verifyPassword('correct horse battery staple', stored) // true
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false

  const [, rawN, rawR, rawP, rawSalt, rawKey] = parts
  const N = Number(rawN)
  const r = Number(rawR)
  const p = Number(rawP)
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) return false

  let expected: Buffer
  try {
    expected = Buffer.from(rawKey ?? '', 'hex')
    if (expected.length === 0) return false
  } catch {
    return false
  }

  try {
    const key = await derive(password, Buffer.from(rawSalt ?? '', 'hex'), expected.length, {
      N,
      r,
      p,
      maxmem: 256 * N * r,
    })

    // Constant time: a comparison that stops at the first differing byte tells,
    // by how long it took, how many bytes were right.
    return timingSafeEqual(key, expected)
  } catch {
    return false
  }
}
