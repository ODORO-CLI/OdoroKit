/**
 * La boucle unique : abonnement, priorites, delta lisse contre delta mesure.
 *
 * Les demos de cette page s'abonnent reellement a la boucle du moteur. Le
 * compteur affiche donc l'etat vrai de la page ou vous etes, pas une valeur
 * simulee.
 *
 * @module
 */

import { CLOCK_PRIORITY, clock, type FrameInfo } from 'odoro-engine'
import { type ReactElement, useEffect, useRef, useState } from 'react'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, PropsTable, Section } from '../components/DocBlocks.jsx'

/** Cadre d'apercu commun aux demos. */
function Preview({ children }: { children: ReactElement }): ReactElement {
  return (
    <div className="o-rounded-lg o-border-w-1 o-border-border o-bg-bg-subtle o-p-6">
      {children}
    </div>
  )
}

/**
 * Compteur branche sur la vraie boucle.
 *
 * Les valeurs sont ecrites dans le DOM par la boucle elle-meme plutot que
 * rendues par React : un `setState` par image provoquerait soixante rendus par
 * seconde pour afficher un nombre, ce qui est exactement ce que le moteur
 * existe pour eviter.
 */
function BoucleDemo(): ReactElement {
  const fps = useRef<HTMLSpanElement>(null)
  const frame = useRef<HTMLSpanElement>(null)
  const delta = useRef<HTMLSpanElement>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const subscription = clock.subscribe(
      (info: FrameInfo) => {
        if (fps.current !== null) fps.current.textContent = String(clock.fps)
        if (frame.current !== null) frame.current.textContent = String(info.frame)
        if (delta.current !== null) {
          delta.current.textContent = (info.delta * 1000).toFixed(1)
        }
      },
      { name: 'documentation : compteur', priority: CLOCK_PRIORITY.default },
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <Preview>
      <div className="o-flex o-flex-col o-gap-5">
        <div className="o-grid o-grid-cols-3 o-gap-4">
          <div className="o-flex o-flex-col o-gap-1">
            <span className="o-text-xs o-uppercase o-tracking-wide o-text-fg-subtle">
              images / s
            </span>
            <span className="o-font-mono o-text-2xl o-tabular-nums" ref={fps}>
              —
            </span>
          </div>
          <div className="o-flex o-flex-col o-gap-1">
            <span className="o-text-xs o-uppercase o-tracking-wide o-text-fg-subtle">
              image
            </span>
            <span className="o-font-mono o-text-2xl o-tabular-nums" ref={frame}>
              —
            </span>
          </div>
          <div className="o-flex o-flex-col o-gap-1">
            <span className="o-text-xs o-uppercase o-tracking-wide o-text-fg-subtle">
              delta
            </span>
            <span className="o-font-mono o-text-2xl o-tabular-nums">
              <span ref={delta}>—</span>
              <span className="o-text-sm o-text-fg-muted"> ms</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (paused) clock.resume()
            else clock.pause()
            setPaused(!paused)
          }}
          className="o-self-start o-h-8 o-px-3 o-text-sm o-rounded-md o-border-w-1 o-border-border o-bg-surface o-text-fg hover:o-border-border-strong o-transition-colors o-cursor-pointer"
        >
          {paused ? 'Reprendre' : 'Suspendre'}
        </button>

        {paused ? (
          <p className="o-text-sm o-text-warning">
            La boucle est suspendue : la distribution s arrete, mais le temps continue de
            courir. A la reprise, le premier delta est celui d une image ordinaire, pas de
            toute la pause.
          </p>
        ) : null}
      </div>
    </Preview>
  )
}

/** Liste des abonnes courants, relue a la demande. */
function AbonnesDemo(): ReactElement {
  const [subscribers, setSubscribers] = useState(() => clock.inspect())

  return (
    <Preview>
      <div className="o-flex o-flex-col o-gap-4">
        <button
          type="button"
          onClick={() => setSubscribers(clock.inspect())}
          className="o-self-start o-h-8 o-px-3 o-text-sm o-rounded-md o-border-w-1 o-border-border o-bg-surface o-text-fg hover:o-border-border-strong o-transition-colors o-cursor-pointer"
        >
          Relever les abonnes
        </button>

        {subscribers.length === 0 ? (
          <p className="o-text-sm o-text-fg-muted">Personne n est abonne a la boucle.</p>
        ) : (
          <ul className="o-flex o-flex-col o-gap-1 o-font-mono o-text-xs">
            {subscribers.map((entry) => (
              <li
                key={`${entry.name}-${String(entry.priority)}`}
                className="o-flex o-items-center o-gap-3"
              >
                <span className="o-w-12 o-text-right o-text-fg-subtle o-tabular-nums">
                  {entry.priority}
                </span>
                <span className={entry.active ? 'o-text-fg' : 'o-text-fg-subtle'}>
                  {entry.name}
                </span>
                {entry.active ? null : (
                  <span className="o-text-fg-subtle">(suspendu)</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Preview>
  )
}

/** Page de la boucle. */
export function MoteurBoucle(): ReactElement {
  return (
    <>
      <PageHeader
        module="odoro-engine"
        title="La boucle"
        lead="Une seule boucle pour toute la page, ordonnee par priorites, avec deux deltas qui ne disent pas la meme chose."
      />

      <Section
        title="S abonner"
        lead="Un abonnement rend une souscription qu'il faut liberer. Le nom n'est pas decoratif : c'est lui qui apparait au diagnostic quand quelque chose ne se libere pas."
      >
        <CodeBlock
          code={`import { CLOCK_PRIORITY, clock } from 'odoro-engine'

useEffect(() => {
  const subscription = clock.subscribe(
    ({ delta }) => {
      position.current += vitesse * delta
    },
    { name: 'defilement horizontal', priority: CLOCK_PRIORITY.default },
  )

  return () => subscription.unsubscribe()
}, [])`}
        />
        <BoucleDemo />
      </Section>

      <Section
        title="Les priorites"
        lead="Une valeur lue par le rendu doit avoir ete calculee avant lui. L'ordre n'est donc pas celui des abonnements — qui depend du hasard du montage — mais celui des priorites, la plus haute d'abord."
      >
        <PropsTable
          rows={[
            {
              name: 'CLOCK_PRIORITY.input',
              type: '200',
              description:
                'Lecture des entrees : pointeur, defilement. Ce que le reste de l image va lire.',
            },
            {
              name: 'CLOCK_PRIORITY.layout',
              type: '100',
              description:
                'Mesures de mise en page, avant que quoi que ce soit ne s en serve.',
            },
            {
              name: 'CLOCK_PRIORITY.default',
              type: '0',
              defaultValue: 'oui',
              description: 'Tout le reste.',
            },
            {
              name: 'CLOCK_PRIORITY.render',
              type: '-100',
              description: 'Rendu graphique, en dernier : il consomme ce qui precede.',
            },
          ]}
        />
        <AbonnesDemo />
      </Section>

      <Section
        title="delta et deltaRaw"
        lead="Apres un a-coup — un onglet en arriere-plan, une compilation qui monopolise le processeur — le temps ecoule depuis la derniere image peut atteindre plusieurs secondes."
      >
        <p className="o-text-fg-muted o-max-w-prose">
          Une animation qui integrerait ce delta brut ferait bondir son objet a l autre
          bout de l ecran. Le lissage existe pour cela : au-dela d un seuil, la valeur
          transmise est celle d une image ordinaire, comme si l a-coup n avait pas eu
          lieu.
        </p>

        <Callout tone="warning">
          Le lissage rend <code className="o-font-mono o-text-xs">delta</code> confortable
          et faux. Ce qui mesure le temps reel — un compteur, une synchronisation, une
          video — doit lire <code className="o-font-mono o-text-xs">deltaRaw</code>. Les
          deux sont exposes parce qu aucun des deux ne convient partout.
        </Callout>

        <CodeBlock
          code={`clock.subscribe(({ delta, deltaRaw }) => {
  // Mouvement : le lissage evite le bond apres un a-coup.
  objet.x += vitesse * delta

  // Mesure : le temps reellement ecoule, a-coup compris.
  ecoule += deltaRaw
})`}
        />
      </Section>

      <Section
        title="Suspendre"
        lead="pause() arrete la distribution, pas le temps. Un abonne peut aussi se suspendre seul — c'est ce que fait une surface WebGL sortie de l'ecran, plutot que de se desabonner et de tout reconstruire au retour."
      >
        <CodeBlock
          code={`const subscription = clock.subscribe(dessiner, { name: 'aurore' })

observer = new IntersectionObserver(([entry]) => {
  subscription.setActive(entry?.isIntersecting ?? false)
})`}
        />
      </Section>
    </>
  )
}
