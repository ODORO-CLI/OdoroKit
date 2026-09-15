/**
 * The three account pages: sign in, register, profile.
 *
 * ## Why they live apart from `App.tsx`
 *
 * `App.tsx` holds the page you see before signing in, and it is meant to be
 * read in one go. These three depend on the back end: they are the part to
 * open when wiring the API, and the part to delete when the project does not
 * need accounts.
 *
 * ## What the form does about errors
 *
 * It shows what the server said, and nothing else. The foundation answers in
 * `problem+json`, where `detail` is a sentence written for a human — "This
 * address already has an account." A status code in its place would be a
 * number in front of someone who mistyped their email.
 *
 * @module
 */

import { buttonClasses } from '@odoro-cli/libs/ui'
import { useState, type FormEvent, type ReactElement, type ReactNode } from 'react'

import { useSession } from '@/auth'
import { Link } from '@/router'

/** The frame the three pages share. */
function Panel({
  title,
  lead,
  children,
}: {
  readonly title: string
  readonly lead: string
  readonly children: ReactNode
}): ReactElement {
  return (
    <section className="o-px-6 o-py-24">
      <div className="o-mx-auto o-w-full o-max-w-md">
        <h1 className="o-text-3xl o-font-bold o-tracking-tight">{title}</h1>
        <p className="o-mt-3 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">{lead}</p>
        <div className="o-mt-8">{children}</div>
      </div>
    </section>
  )
}

/** A labelled field. */
function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  hint,
}: {
  readonly label: string
  readonly type: string
  readonly value: string
  readonly onChange: (value: string) => void
  readonly autoComplete: string
  readonly hint?: string
}): ReactElement {
  return (
    <label className="o-block o-mb-4">
      <span className="o-block o-mb-1 o-text-sm o-font-medium">{label}</span>
      <input
        type={type}
        value={value}
        required
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="o-w-full o-rounded-lg o-border o-border-zinc-200 dark:o-border-zinc-800 o-bg-transparent o-px-3 o-py-2 o-text-sm"
      />
      {hint === undefined ? null : (
        <span className="o-mt-1 o-block o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
          {hint}
        </span>
      )}
    </label>
  )
}

/** The error of a submission, when there is one. */
function Problem({ message }: { readonly message: string | null }): ReactElement | null {
  if (message === null) return null
  return (
    <p
      // `alert` so a screen reader announces it: a message that only appears
      // visually leaves whoever does not see it waiting on a form that did
      // nothing.
      role="alert"
      className="o-mb-4 o-rounded-lg o-border o-border-red-300 dark:o-border-red-900 o-px-3 o-py-2 o-text-sm o-text-red-700 dark:o-text-red-400"
    >
      {message}
    </p>
  )
}

/** Runs a submission, holding the pending state and the error. */
function useSubmission(): {
  busy: boolean
  error: string | null
  run: (action: () => Promise<void>) => (event: FormEvent) => void
} {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = (action: () => Promise<void>) => (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    action()
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : 'The request failed.')
      })
      .finally(() => setBusy(false))
  }

  return { busy, error, run }
}

/** Signing in. */
export function SignIn(): ReactElement {
  const { profile, signIn } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { busy, error, run } = useSubmission()

  if (profile != null) return <AlreadySignedIn name={profile.name} />

  return (
    <Panel title="Sign in" lead="The session is a cookie: nothing to keep in the page.">
      <form onSubmit={run(() => signIn(email, password))}>
        <Problem message={error} />
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        <button type="submit" disabled={busy} className={buttonClasses({ tone: 'primary' })}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="o-mt-6 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
        No account yet? <Link to="/register">Create one</Link>.
      </p>
    </Panel>
  )
}

/** Registering. */
export function Register(): ReactElement {
  const { profile, register } = useSession()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const { busy, error, run } = useSubmission()

  if (profile != null) return <AlreadySignedIn name={profile.name} />

  return (
    <Panel
      title="Create an account"
      lead="The password is hashed with scrypt, and never leaves the server in clear."
    >
      <form onSubmit={run(() => register(email, name, password))}>
        <Problem message={error} />
        <Field label="Name" type="text" value={name} onChange={setName} autoComplete="name" />
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hint="Twelve characters at least. Length is what holds; a mix of symbols is not."
        />
        <button type="submit" disabled={busy} className={buttonClasses({ tone: 'primary' })}>
          {busy ? 'Creating…' : 'Create the account'}
        </button>
      </form>

      <p className="o-mt-6 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
        Already have one? <Link to="/sign-in">Sign in</Link>.
      </p>
    </Panel>
  )
}

/** The profile of the signed-in account. */
export function ProfilePage(): ReactElement {
  const { profile, signOut } = useSession()

  // Not asked yet: showing the signed-out page here would flash it at every
  // reload, including to someone who is signed in.
  if (profile === undefined) {
    return <Panel title="Profile" lead="Reading the session…" children={null} />
  }

  if (profile === null) {
    return (
      <Panel title="Profile" lead="This page needs an account.">
        <Link to="/sign-in" className={`o-no-underline ${buttonClasses({ tone: 'primary' })}`}>
          Sign in
        </Link>
      </Panel>
    )
  }

  return (
    <Panel title={profile.name} lead="What the server knows about this account.">
      <dl className="o-border-t o-border-zinc-200 dark:o-border-zinc-800">
        {[
          ['Email', profile.email],
          ['Identifier', profile.id],
          ['Created', new Date(profile.createdAt).toLocaleString()],
        ].map(([label, value]) => (
          <div
            key={label}
            className="o-flex o-gap-6 o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-py-3"
          >
            <dt className="o-w-28 o-shrink-0 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
              {label}
            </dt>
            <dd className="o-break-all o-font-mono o-text-sm">{value}</dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={() => void signOut()}
        className={`o-mt-8 ${buttonClasses({ tone: 'secondary' })}`}
      >
        Sign out
      </button>
    </Panel>
  )
}

/** Shown on the two forms when the visitor already has a session. */
function AlreadySignedIn({ name }: { readonly name: string }): ReactElement {
  return (
    <Panel title={`Signed in as ${name}`} lead="Nothing to do here.">
      <Link to="/profile" className={`o-no-underline ${buttonClasses({ tone: 'primary' })}`}>
        See the profile
      </Link>
    </Panel>
  )
}
