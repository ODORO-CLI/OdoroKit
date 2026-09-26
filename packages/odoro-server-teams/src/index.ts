/**
 * @odoro-cli/server-teams — teams for an `@odoro-cli/server` app.
 *
 * Teams, their members and three roles, invitations by e-mail, in the site's
 * `teams` database. Who is signed in comes from `@odoro-cli/server-accounts`.
 *
 * @module
 */

export {
  INVITATIONS_PER_HOUR,
  INVITATION_DAYS,
  ROLES,
  TeamError,
  addMember,
  consumeInvitation,
  createTeam,
  currentTeam,
  deleteTeam,
  invite,
  membersOf,
  removeMember,
  roleIn,
  setRole,
  teamsInstalled,
  teamsOf,
  type Role,
  type Team,
  type TeamMail,
} from './teams.js'
export { TEAM_COOKIE, createTeamsModule, whichTeam, type TeamsOptions } from './module.js'
