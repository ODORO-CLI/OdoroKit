import { useEffect, useState } from 'react'

import { Reveal, Stagger } from 'odoro-libs/motion'
import { Link } from 'odoro-libs/router'
import { Button } from 'odoro-libs/ui'

/** Reponse de la route de sante du serveur. */
interface Health {
  status: string
  environment: string
  uptime: number
  timestamp: string
}

/** Etat de l'appel a l'API. */
type Fetching =
  | { state: 'inactif' }
  | { state: 'en-cours' }
  | { state: 'ok'; health: Health }
  | { state: 'echec'; message: string }

/**
 * Interroge la route de sante du serveur.
 *
 * L'URL est relative : en developpement le moteur transmet l'appel au serveur,
 * en production c'est le meme serveur qui repond. Il n'y a donc jamais d'URL
 * d'API a configurer cote client.
 */
async function fetchHealth(signal: AbortSignal): Promise<Health> {
  const response = await fetch('/api/health', { signal })
  if (!response.ok) throw new Error(`Le serveur a repondu ${response.status}.`)
  return (await response.json()) as Health
}

/** Panneau montrant l'etat de la liaison avec l'API. */
function ApiStatus() {
  const [result, setResult] = useState<Fetching>({ state: 'inactif' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setResult({ state: 'en-cours' })

    fetchHealth(controller.signal).then(
      (health) => setResult({ state: 'ok', health }),
      (cause: unknown) => {
        if (controller.signal.aborted) return
        setResult({
          state: 'echec',
          message: cause instanceof Error ? cause.message : String(cause),
        })
      },
    )

    return () => controller.abort()
  }, [attempt])

  return (
    <section className="o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-p-5">
      <div className="o-flex o-items-center o-justify-between o-gap-4">
        <h2 className="o-font-semibold">Liaison avec l&rsquo;API</h2>
        <Button
          size="sm"
          tone="secondary"
          loading={result.state === 'en-cours'}
          onClick={() => setAttempt((value) => value + 1)}
        >
          Reinterroger
        </Button>
      </div>

      <div className="o-mt-3 o-text-sm" role="status">
        {result.state === 'inactif' || result.state === 'en-cours' ? (
          <p className="o-text-zinc-500 dark:o-text-zinc-400">
            Interrogation de /api/health...
          </p>
        ) : result.state === 'echec' ? (
          <p className="o-text-red-600 dark:o-text-red-400">
            Serveur injoignable : {result.message}. Verifiez qu&rsquo;il tourne bien sur
            le port 3001.
          </p>
        ) : (
          <dl className="o-grid o-grid-cols-2 o-gap-2 o-tabular-nums">
            <dt className="o-text-zinc-500 dark:o-text-zinc-400">Etat</dt>
            <dd className="o-text-emerald-600 dark:o-text-emerald-400">
              {result.health.status}
            </dd>
            <dt className="o-text-zinc-500 dark:o-text-zinc-400">Environnement</dt>
            <dd>{result.health.environment}</dd>
            <dt className="o-text-zinc-500 dark:o-text-zinc-400">En ligne depuis</dt>
            <dd>{result.health.uptime} s</dd>
          </dl>
        )}
      </div>
    </section>
  )
}

/** Trois arguments mis en avant sur la page d'accueil. */
const FEATURES = [
  {
    title: 'Une seule origine',
    body: 'Les appels /api sont transmis au serveur : aucune question de CORS, aucune URL a configurer.',
  },
  {
    title: 'Un seul deploiement',
    body: 'En production, le serveur sert l API et le client compile. Une image, un processus.',
  },
  {
    title: 'Un environnement verifie',
    body: 'Les variables sont validees au demarrage. Une configuration incomplete arrete le serveur tout de suite.',
  },
]

/** Page d'accueil. */
export function Home() {
  return (
    <div className="o-flex o-flex-col o-gap-12">
      <Reveal>
        <h1 className="o-text-4xl o-font-bold o-tracking-tight">Client et serveur.</h1>
        <p className="o-mt-4 o-text-lg o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Ce projet reunit une application React et une API Express dans un seul depot. Le
          panneau ci-dessous interroge le serveur pour de vrai.
        </p>
      </Reveal>

      <ApiStatus />

      <Stagger step={80} className="o-grid o-grid-cols-1 md:o-grid-cols-3 o-gap-4">
        {FEATURES.map((feature) => (
          <article
            key={feature.title}
            className="o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-p-5"
          >
            <h2 className="o-font-semibold">{feature.title}</h2>
            <p className="o-mt-2 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
              {feature.body}
            </p>
          </article>
        ))}
      </Stagger>

      <p>
        <Link to="/a-propos">En savoir plus</Link>
      </p>
    </div>
  )
}
