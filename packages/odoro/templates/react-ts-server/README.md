# Odoro application — client and server

A React single-page application and an API built on `@odoro-cli/server`, in the
same repository.

```
client/            interface, served by Odoro in development
server/
  src/main.ts      assembles the modules, nothing else
  src/modules/     one directory per module — start with `health/`
```

## Getting started

```sh
cp .env.example .env
npm install
npm run dev
```

The client listens on <http://localhost:5180> and forwards every call starting
with `/api` to the server. The browser therefore only ever sees one origin, and
no CORS question arises in development.

## Authentication, as a demonstration

The template ships a working account system: register, sign in, sign out,
profile. Four routes under `/api/auth/`, three pages at `/sign-in`, `/register`
and `/profile`.

What it does, and how:

- the password is hashed with **scrypt**, from the Node standard library — no
  native module to compile. The cost parameters travel with the hash, so the
  passwords already stored still verify the day the cost is raised;
- the session lives in an **`httpOnly`** cookie: the browser sends it, no
  script reads it. The table keeps only its fingerprint, never the identifier;
- an unknown address and a wrong password give **the same answer**, after the
  same delay. Telling them apart would turn the sign-in form into a way to ask
  whether an address has an account here.

What it does not do, and what you will have to add: email confirmation,
password reset, a rate limit on sign-in attempts, a second factor. Naming them
beats implying they are handled.

It all lives in `server/src/modules/auth/` and `client/src/account.tsx`. If the
project needs no accounts, delete those two and the `auth.module` line of
`server/src/main.ts`.

**A database is required.** Without `DATABASE_URL`, the four routes answer
`503` saying what is missing — the interface still starts.

## The database

**PostgreSQL, hosted, and nothing else.** There is no local database: the URL
points at one reachable over the network.

```sh
odoro db:create            # provisions a database and writes .env
# or paste your own URL into .env:
DATABASE_URL=postgres://user:password@host:5432/database?sslmode=require
```

While it is missing, **the client starts anyway** and the server answers `503`
on `/api/ready` saying precisely what is absent. So you see the interface in
the first minute, and you know what is left to do.

## Writing a module

`server/src/modules/health/` is the example. A module declares its name, what
it needs, the services it registers and the routes it exposes — and `main.ts`
does nothing but say which ones are active.

```ts
export const billingModule = defineModule({
  name: 'billing',
  requires: ['auth'],
  register: (c) => c.register('billingService', createBillingService),
  routes: billingRoutes,
})
```

The kernel resolves the load order from `requires`, detects cycles, and refuses
to start if a dependency is missing. Enabling or disabling a module therefore
takes one line in `main.ts`.

## Two health endpoints, which do not say the same thing

| Route         | Question                      | Who asks it                             |
| ------------- | ----------------------------- | --------------------------------------- |
| `/api/health` | Is the process alive?         | The orchestrator, to decide on a restart |
| `/api/ready`  | Can the service do its work?  | The load balancer, to decide on traffic  |

Confusing them gives one of two faults: a service restarting in a loop during a
database incident, or a load balancer sending traffic to a service that cannot
answer.

## Building and deploying

```sh
npm run build      # client into dist/client, server into dist/server
npm start          # serves both from a single process
```

The `Dockerfile` is multi-stage: the build dependencies do not end up in the
final image, which runs as an unprivileged user.

## Prerendering

`build.prerender` is on: every route of `client/src/entry-server.tsx` is
rendered as a complete HTML document at build time, and the client hydrates it
on load rather than rebuilding everything. That is what lets a search engine or
a link preview find text in the very first response.

The server serves those documents before falling back to the single-page
document: a request for `/about` receives `dist/client/about/index.html`, with
its own title and its own description.

Adding a route: one line in `routes`, and the matching entry in
`client/src/router.tsx`. Doing without: remove `prerender` from
`odoro.config.ts`, then delete `client/src/entry-server.tsx`.

## Environment variables

See `.env.example`, commented line by line. In production, whatever is missing
stops the startup with a message that **lists everything at once** — rather
than a string of restarts, one variable at a time.

The files are read from the least specific to the most specific — `.env`,
`.env.local`, `.env.<mode>`, `.env.<mode>.local` — and a variable already set
in the environment is never overwritten by a file: on a host, whatever it
injects wins.

**Only variables prefixed with `ODORO_` reach the browser.** The rest —
`DATABASE_URL`, the session secrets, the API keys — never leaves the server.
That is the only boundary that matters here, and it is held by the prefix, not
by the file.

`.env` is never committed.
