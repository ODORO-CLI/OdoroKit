/**
 * The session, client side.
 *
 * ## Why there is no token here
 *
 * The session lives in an `httpOnly` cookie that the browser sends on its own.
 * This file never sees it, and that is the point: a value a script can read is
 * a value the first injected script can steal.
 *
 * So the only question the interface can ask is "who am I", and the only way
 * to ask it is `GET /api/auth/me`. That is one request at startup, and the
 * answer is kept for the life of the page.
 *
 * ## Why the state has three values and not two
 *
 * `undefined` is "not asked yet", `null` is "asked, nobody". Collapsing them
 * would flash the signed-out interface at every reload, before the answer
 * arrives — including to someone who is signed in.
 *
 * @module
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'

/** A profile, as the API returns it. */
export interface Profile {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly createdAt: string
}

/** What the interface can do with the session. */
export interface Session {
  /** `undefined` while unknown, `null` when signed out. */
  readonly profile: Profile | null | undefined
  register(email: string, name: string, password: string): Promise<void>
  signIn(email: string, password: string): Promise<void>
  signOut(): Promise<void>
}

const SessionContext = createContext<Session | undefined>(undefined)

/**
 * A failed call, with the message the server gave.
 *
 * The foundation answers in `application/problem+json`: `title` says what
 * happened, `detail` says why. Showing the HTTP status instead would put "409"
 * in front of someone who typed an address that already has an account.
 */
async function call<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: body === undefined ? 'GET' : 'POST',
    // The cookie is only sent if it is asked for. Without this, every call is
    // anonymous and the session looks broken for no visible reason.
    credentials: 'same-origin',
    ...(body === undefined
      ? {}
      : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  })

  if (response.status === 204) return undefined as T

  const payload: unknown = await response.json().catch(() => undefined)

  if (!response.ok) {
    const problem = payload as { detail?: string; title?: string } | undefined
    throw new Error(problem?.detail ?? problem?.title ?? 'The request failed.')
  }

  return payload as T
}

/** Provides the session to the whole tree. */
export function SessionProvider({ children }: { children: ReactNode }): ReactElement {
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined)

  useEffect(() => {
    let alive = true
    call<Profile>('/api/auth/me')
      .then((me) => {
        if (alive) setProfile(me)
      })
      .catch(() => {
        // Not signed in, or the server has nothing to answer with. Either way
        // the interface shows the signed-out state; it is not an incident.
        if (alive) setProfile(null)
      })
    return () => {
      alive = false
    }
  }, [])

  const register = useCallback(async (email: string, name: string, password: string) => {
    setProfile(await call<Profile>('/api/auth/register', { email, name, password }))
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setProfile(await call<Profile>('/api/auth/login', { email, password }))
  }, [])

  const signOut = useCallback(async () => {
    await call<void>('/api/auth/logout', {})
    setProfile(null)
  }, [])

  const value = useMemo<Session>(
    () => ({ profile, register, signIn, signOut }),
    [profile, register, signIn, signOut],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

/**
 * Reads the session.
 *
 * @throws {Error} Outside `SessionProvider` — which is a wiring mistake, and
 *   is better said than silently returning "signed out".
 *
 * @example
 * const { profile, signOut } = useSession()
 */
export function useSession(): Session {
  const session = useContext(SessionContext)
  if (session === undefined) {
    throw new Error('useSession used outside SessionProvider.')
  }
  return session
}
