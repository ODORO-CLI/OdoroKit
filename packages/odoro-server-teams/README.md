# @odoro-cli/server-teams

Teams for an `@odoro-cli/server` app, stored in the site's own database (the
`teams` capability of odoro-cloud, which needs `accounts`). Who is signed in
comes from `@odoro-cli/server-accounts`.

- **Teams** created by a signed-in person, who becomes their owner.
- **Three roles**: `proprietaire` (everything, including deleting the team),
  `admin` (invite, remove a `membre`), `membre`.
- **Invitations** by e-mail, for one address, seven days, twenty per team per
  hour. Opening the link proves the address: it signs the person in and
  makes them a member. An invitation never demotes an existing member.
- A team **always keeps an owner**: the last one can neither be demoted nor
  leave.

The team a request works in is a cookie, checked against the memberships at
every request — a cookie never grants a team. `whichTeam(db)` gives other
modules the same answer.

```ts
import { createTeamsModule, whichTeam } from '@odoro-cli/server-teams'

const teams = createTeamsModule({ db: pool, mail })
const team = await whichTeam(pool)(cookies) // { id, name, role } | null
```

## A team with room, or without

A site may bound its teams — the seats a team has paid for, for instance.
`canAddMember(teamId)` is asked before an invitation leaves and again before
one is accepted: `true` lets the person in, `false` refuses with `TEAM_FULL`,
a string refuses with that sentence. A refused acceptance keeps its
invitation, which serves once a place frees up. A person already in the team
is never asked about.

```ts
import { seatsAllowMember } from '@odoro-cli/server-billing'

createTeamsModule({ db: pool, mail, canAddMember: seatsAllowMember(pool) })
```

A site that serves the invitation link itself calls
`acceptInvitation(db, token, { canAddMember })`: it asks, consumes the
invitation, signs the person in and makes them a member.
