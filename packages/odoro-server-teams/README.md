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
