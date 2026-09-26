/**
 * Teams, in the site's own database (the `teams` capability, which needs
 * `accounts`).
 *
 * Three roles and what each may do:
 *
 * | role          | invite | remove a member | change a role | delete the team |
 * |---------------|--------|-----------------|---------------|-----------------|
 * | `proprietaire`| yes    | anyone          | yes           | yes             |
 * | `admin`       | yes    | a `membre`      | no            | no              |
 * | `membre`      | no     | no              | no            | no              |
 *
 * Anyone may leave, except the last owner: a team always keeps one. That
 * rule is checked in the same statement as the change that would break it.
 *
 * An invitation is for ONE address, and lives in the database as a
 * FINGERPRINT only. Opening its link proves the address: it signs the
 * person in (`signInWithProvenAddress`) and makes them a member.
 *
 * @module
 */

import { createHash, randomBytes } from 'node:crypto'

import { address, type Query } from '@odoro-cli/server-accounts'

export type Role = 'proprietaire' | 'admin' | 'membre'
export const ROLES: readonly Role[] = ['proprietaire', 'admin', 'membre']

export interface Team {
  readonly id: string
  readonly name: string
  readonly role: Role
}

/** Where invitations leave: the site holds no mail key, Odoro sends them. */
export interface TeamMail {
  send(input: {
    readonly email: string
    readonly kind: 'invitation'
    readonly token: string
    readonly team: string
  }): Promise<void>
}

/** How long an invitation stays valid, in days. */
export const INVITATION_DAYS = 7
/** Invitations per team per hour: a team is not a mailing list. */
export const INVITATIONS_PER_HOUR = 20

const TOKEN = /^[A-Za-z0-9_-]{20,80}$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export class TeamError extends Error {
  constructor(
    readonly status: 401 | 403 | 404 | 409 | 422 | 429,
    message: string,
  ) {
    super(message)
    this.name = 'TeamError'
  }
}

const notFound = () => new TeamError(404, 'Cette équipe est introuvable.')
const forbidden = () =>
  new TeamError(403, 'Votre rôle dans cette équipe ne permet pas ce geste.')
const lastOwner = () =>
  new TeamError(
    409,
    'Une équipe garde toujours un propriétaire : nommez-en un autre avant.',
  )

function fingerprint(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function id(raw: unknown): string {
  const value = String(raw ?? '')
  if (!UUID.test(value)) throw notFound()
  return value
}

function teamName(raw: unknown): string {
  const name = String(raw ?? '').trim()
  if (name.length < 1 || name.length > 120) {
    throw new TeamError(422, "Le nom d'une équipe compte entre 1 et 120 caractères.")
  }
  return name
}

/** Is the `teams` capability installed in this database? */
export async function teamsInstalled(db: Query): Promise<boolean> {
  try {
    const { rows } = await db.query<{ present: boolean }>(
      `SELECT to_regclass('teams.members') IS NOT NULL AS present`,
    )
    return rows[0]?.present === true
  } catch {
    return false
  }
}

/** The teams of an account, the oldest membership first. */
export async function teamsOf(db: Query, userId: string): Promise<Team[]> {
  const { rows } = await db.query<{ id: string; name: string; role: Role }>(
    `SELECT t.id, t.name, m.role FROM teams.members m JOIN teams.teams t ON t.id = m.team_id
      WHERE m.user_id = $1 ORDER BY m.joined_at, t.id`,
    [userId],
  )
  return rows.map((r) => ({ id: r.id, name: r.name, role: r.role }))
}

/** The role of an account in a team, or null when it is not a member. */
export async function roleIn(
  db: Query,
  teamId: string,
  userId: string,
): Promise<Role | null> {
  const { rows } = await db.query<{ role: Role }>(
    'SELECT role FROM teams.members WHERE team_id = $1 AND user_id = $2',
    [teamId, userId],
  )
  return rows[0]?.role ?? null
}

/**
 * The team a request works in: the one it asked for when the account is a
 * member of it, else its first team, else null.
 */
export async function currentTeam(
  db: Query,
  userId: string,
  preferred: string | undefined,
): Promise<Team | null> {
  const teams = await teamsOf(db, userId)
  return teams.find((t) => t.id === preferred) ?? teams[0] ?? null
}

/** A new team; its creator is its owner. */
export async function createTeam(
  db: Query,
  userId: string,
  rawName: unknown,
): Promise<Team> {
  const name = teamName(rawName)
  const { rows } = await db.query<{ id: string }>(
    `WITH t AS (INSERT INTO teams.teams (name) VALUES ($1) RETURNING id)
     INSERT INTO teams.members (team_id, user_id, role)
     SELECT t.id, $2, 'proprietaire' FROM t RETURNING team_id AS id`,
    [name, userId],
  )
  return { id: rows[0]!.id, name, role: 'proprietaire' }
}

async function requireRole(
  db: Query,
  teamId: string,
  userId: string,
  allowed: readonly Role[],
): Promise<Role> {
  const role = await roleIn(db, teamId, userId)
  if (role === null) throw notFound()
  if (!allowed.includes(role)) throw forbidden()
  return role
}

/** The members of a team, and — for its owners and admins — the pending invitations. */
export async function membersOf(
  db: Query,
  teamId: unknown,
  userId: string,
): Promise<{
  members: { id: string; email: string; role: Role }[]
  invitations: { email: string; role: Role; expiresAt: string }[]
}> {
  const team = id(teamId)
  const role = await requireRole(db, team, userId, ROLES)
  const { rows } = await db.query<{ id: string; email: string; role: Role }>(
    `SELECT u.id, u.email, m.role FROM teams.members m JOIN accounts.users u ON u.id = m.user_id
      WHERE m.team_id = $1 ORDER BY m.joined_at, u.id`,
    [team],
  )
  if (role === 'membre') return { members: rows, invitations: [] }
  const { rows: pending } = await db.query<{
    email: string
    role: Role
    expires_at: Date
  }>(
    `SELECT email, role, expires_at FROM teams.invitations
      WHERE team_id = $1 AND accepted_at IS NULL AND expires_at > now()
      ORDER BY created_at DESC LIMIT 200`,
    [team],
  )
  return {
    members: rows,
    invitations: pending.map((p) => ({
      email: p.email,
      role: p.role,
      expiresAt: new Date(p.expires_at).toISOString(),
    })),
  }
}

/** Invites an address into a team (owners and admins). */
export async function invite(
  db: Query,
  mail: TeamMail,
  input: { teamId: unknown; byUserId: string; email: unknown; role?: unknown },
): Promise<void> {
  const team = id(input.teamId)
  await requireRole(db, team, input.byUserId, ['proprietaire', 'admin'])
  const email = address(input.email)
  const role: Role = input.role === 'admin' ? 'admin' : 'membre'
  const { rows } = await db.query<{ n: number; name: string }>(
    `SELECT (SELECT count(*)::integer FROM teams.invitations
              WHERE team_id = $1 AND created_at > now() - interval '1 hour') AS n,
            (SELECT name FROM teams.teams WHERE id = $1) AS name`,
    [team],
  )
  if (Number(rows[0]?.n ?? 0) >= INVITATIONS_PER_HOUR) {
    throw new TeamError(429, "Trop d'invitations en une heure : réessayez plus tard.")
  }
  const token = randomBytes(32).toString('base64url')
  await db.query(
    `INSERT INTO teams.invitations (fingerprint, team_id, email, role, invited_by, expires_at)
     VALUES ($1, $2, $3, $4, $5, now() + make_interval(days => $6))`,
    [fingerprint(token), team, email, role, input.byUserId, INVITATION_DAYS],
  )
  try {
    await mail.send({ email, kind: 'invitation', token, team: rows[0]?.name ?? '' })
  } catch {
    // The invitation stays: its owner can invite again.
  }
}

/**
 * Consumes an invitation: it serves ONCE. Returns what it opens — the
 * address it was sent to, the team and the role — or null.
 */
export async function consumeInvitation(
  db: Query,
  token: unknown,
): Promise<{ email: string; teamId: string; role: Role } | null> {
  if (typeof token !== 'string' || !TOKEN.test(token)) return null
  const { rows } = await db.query<{ email: string; team_id: string; role: Role }>(
    `UPDATE teams.invitations SET accepted_at = now()
      WHERE fingerprint = $1 AND accepted_at IS NULL AND expires_at > now()
      RETURNING email, team_id, role`,
    [fingerprint(token)],
  )
  const row = rows[0]
  return row === undefined
    ? null
    : { email: row.email, teamId: row.team_id, role: row.role }
}

/** Makes an account a member. An existing member keeps its role: an invitation never demotes. */
export async function addMember(
  db: Query,
  teamId: string,
  userId: string,
  role: Role,
): Promise<void> {
  await db.query(
    `INSERT INTO teams.members (team_id, user_id, role) VALUES ($1, $2, $3)
     ON CONFLICT (team_id, user_id) DO NOTHING`,
    [teamId, userId, role],
  )
}

/** Changes a member's role (owners only). The last owner is never demoted. */
export async function setRole(
  db: Query,
  input: { teamId: unknown; byUserId: string; userId: unknown; role: unknown },
): Promise<void> {
  const team = id(input.teamId)
  const user = id(input.userId)
  if (!ROLES.includes(input.role as Role))
    throw new TeamError(422, "Ce rôle n'existe pas.")
  await requireRole(db, team, input.byUserId, ['proprietaire'])
  const { rowCount } = await db.query(
    `UPDATE teams.members SET role = $3
      WHERE team_id = $1 AND user_id = $2
        AND (role <> 'proprietaire' OR $3 = 'proprietaire'
             OR (SELECT count(*) FROM teams.members WHERE team_id = $1 AND role = 'proprietaire') > 1)`,
    [team, user, input.role],
  )
  if ((rowCount ?? 0) > 0) return
  if ((await roleIn(db, team, user)) === null) throw notFound()
  throw lastOwner()
}

/**
 * Removes a member — or leaves, when `userId` is oneself. Owners remove
 * anyone, admins remove a `membre`; nobody removes the last owner.
 */
export async function removeMember(
  db: Query,
  input: { teamId: unknown; byUserId: string; userId: unknown },
): Promise<void> {
  const team = id(input.teamId)
  const user = id(input.userId)
  const by = await requireRole(db, team, input.byUserId, ROLES)
  const target = await roleIn(db, team, user)
  if (target === null) throw notFound()
  const leaving = user === input.byUserId
  if (!leaving) {
    if (by === 'membre') throw forbidden()
    if (by === 'admin' && target !== 'membre') throw forbidden()
  }
  const { rowCount } = await db.query(
    `DELETE FROM teams.members
      WHERE team_id = $1 AND user_id = $2
        AND (role <> 'proprietaire'
             OR (SELECT count(*) FROM teams.members WHERE team_id = $1 AND role = 'proprietaire') > 1)`,
    [team, user],
  )
  if ((rowCount ?? 0) === 0) throw lastOwner()
}

/** Deletes a team, its memberships and invitations with it (owners only). */
export async function deleteTeam(
  db: Query,
  input: { teamId: unknown; byUserId: string },
): Promise<void> {
  const team = id(input.teamId)
  await requireRole(db, team, input.byUserId, ['proprietaire'])
  await db.query('DELETE FROM teams.teams WHERE id = $1', [team])
}
