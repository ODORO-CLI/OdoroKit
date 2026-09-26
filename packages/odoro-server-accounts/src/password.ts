/**
 * Passwords: scrypt, a salt per account, and nothing else.
 *
 * The stored form carries its own parameters —
 * `scrypt$N$r$p$<salt>$<hash>` — so they can be raised later without
 * invalidating the passwords already stored: a verification reads the
 * parameters of the hash it checks.
 *
 * @module
 */

import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  type ScryptOptions,
} from 'node:crypto'

const N = 16_384
const R = 8
const P = 1
const KEY_LENGTH = 32

/** The shortest and longest password accepted. */
export const PASSWORD_MIN = 10
export const PASSWORD_MAX = 200

function scrypt(password: string, salt: Buffer, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(
      password.normalize('NFC'),
      salt,
      KEY_LENGTH,
      { ...options, maxmem: 64 * 1024 * 1024 },
      (err, key) => {
        if (err) reject(err)
        else resolve(key)
      },
    )
  })
}

/** Is this password long enough, and not absurdly long? */
export function acceptablePassword(password: unknown): password is string {
  return (
    typeof password === 'string' &&
    [...password].length >= PASSWORD_MIN &&
    [...password].length <= PASSWORD_MAX
  )
}

/** The stored form of a password. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await scrypt(password, salt, { N, r: R, p: P })
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64url')}$${key.toString('base64url')}`
}

const STORED = /^scrypt\$(\d+)\$(\d+)\$(\d+)\$([A-Za-z0-9_-]{22,})\$([A-Za-z0-9_-]{43,})$/

/**
 * Does this password match this stored form? Constant time on the key; a
 * malformed stored form never matches.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const m = STORED.exec(stored)
  if (m === null) return false
  const [, n, r, p, salt, hash] = m
  const expected = Buffer.from(hash as string, 'base64url')
  const key = await scrypt(password, Buffer.from(salt as string, 'base64url'), {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  })
  return key.length === expected.length && timingSafeEqual(key, expected)
}

/**
 * A hash nobody's password matches, checked when the address is unknown: a
 * sign-in then takes as long as for a real account, and its timing teaches
 * nothing about who has one.
 */
export const DECOY_HASH = `scrypt$${N}$${R}$${P}$${'A'.repeat(22)}$${'A'.repeat(43)}`
