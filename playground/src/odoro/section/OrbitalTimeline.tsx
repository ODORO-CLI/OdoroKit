/**
 * Frise orbitale : des étapes disposées en cercle, qui tourne.
 *
 * ## La rotation passe par la boucle du moteur
 *
 * L'implémentation d'origine ouvrait un `setInterval` de cinquante
 * millisecondes et posait l'angle dans un état React. Trois conséquences, dont
 * deux invisibles en développement :
 *
 * 1. un rendu React complet vingt fois par seconde, pour déplacer des éléments
 *    que le compositeur sait déplacer seul ;
 * 2. une cadence qui ne suit pas celle de l'écran — donc un mouvement qui
 *    saccade sur un écran à cent vingt images, et dérive sur un onglet en
 *    arrière-plan, où les minuteurs sont ralentis mais pas arrêtés ;
 * 3. aucun arrêt hors du champ.
 *
 * L'angle vit donc dans une ref, la boucle unique l'avance en fonction du temps
 * écoulé, et les positions sont écrites directement en style. Aucun rendu React
 * pendant la rotation.
 *
 * ## Ce qui reste un état, et pourquoi
 *
 * L'étape ouverte. Elle change la structure du document — une fiche apparaît —
 * et cela, seul React peut le faire. Elle change une fois par clic, pas vingt
 * fois par seconde.
 *
 * ## Ce n'est pas une frise chronologique au sens du balisage
 *
 * C'est une liste d'étapes, et elle est balisée comme telle : `<ul>`, `<li>`,
 * un bouton par étape. La disposition circulaire est de la présentation. Au
 * clavier, on tabule d'une étape à la suivante dans l'ordre de la liste, et non
 * dans l'ordre où le cercle les a placées — ce qui est le seul ordre stable.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Etat d'avancement d'une etape. */
export type OrbitalStatus = 'done' | 'current' | 'todo'

/** Une etape de la frise. */
export interface OrbitalStep {
  /** Identifiant, unique dans la frise. */
  readonly id: string
  /** Titre affiche sous le noeud. */
  readonly title: string
  /** Date ou reperage temporel, affiche dans la fiche. */
  readonly date?: string
  /** Corps de la fiche. */
  readonly content?: ReactNode
  /** Pictogramme du noeud. Emplacement : le registre n'en fournit aucun. */
  readonly icon?: ReactNode
  /** Identifiants des etapes liees, mises en avant a l'ouverture. */
  readonly relatedIds?: readonly string[]
  /** Avancement. @defaultValue 'todo' */
  readonly status?: OrbitalStatus
  /** Intensite, de 0 a 100. Elle dessine le halo et la jauge. */
  readonly energy?: number
}

/** Proprietes propres au composant. */
export interface OrbitalTimelineOwnProps {
  /** Les etapes, dans l'ordre ou elles se suivent. */
  steps: readonly OrbitalStep[]
  /** Rayon du cercle, en pixels. @defaultValue 200 */
  radius?: number
  /** Tours par minute. Zero immobilise la frise. @defaultValue 1 */
  rpm?: number
  /** Libelle de la liste, pour les technologies d'assistance. */
  label?: string
}

/** Toutes les proprietes. */
export type OrbitalTimelineProps = Customisable<OrbitalTimelineOwnProps, 'section'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-orbital-timeline'

/** Pose les regles de la frise, une fois par document. */
function ensureOrbitalRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Le coeur respire, et ses deux anneaux se propagent vers l'exterieur.
    '[data-o-orbital-core]{animation:o-orbital-beat 2s var(--o-ease-standard) infinite}',
    '[data-o-orbital-ring]{animation:o-orbital-ping 2s var(--o-ease-out) infinite}',
    '[data-o-orbital-ring="2"]{animation-delay:0.5s}',
    '@keyframes o-orbital-beat{0%,100%{opacity:1}50%{opacity:0.55}}',
    '@keyframes o-orbital-ping{75%,100%{transform:scale(2);opacity:0}}',

    // Le halo d'une etape liee, le temps qu'on la remarque.
    '[data-o-orbital-halo="on"]{animation:o-orbital-beat 1s var(--o-ease-standard) infinite}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-orbital-core],[data-o-orbital-ring],[data-o-orbital-halo="on"]{',
    'animation:none}}',
  ].join('')
  document.head.append(style)
}

/** Classes de la pastille d'avancement. */
const STATUS_CLASS: Readonly<Record<OrbitalStatus, string>> = {
  done: 'o-bg-emerald-500 o-text-zinc-950',
  current: 'o-bg-zinc-50 o-text-zinc-950',
  todo: 'o-bg-zinc-800 o-text-zinc-300',
}

/** Libelle de l'avancement. */
const STATUS_LABEL: Readonly<Record<OrbitalStatus, string>> = {
  done: 'Termine',
  current: 'En cours',
  todo: 'A venir',
}

/**
 * Frise orbitale.
 *
 * @example
 * <OrbitalTimeline
 *   steps={[
 *     { id: 'plan', title: 'Cadrage', date: 'Janvier', status: 'done', energy: 100 },
 *     { id: 'build', title: 'Fabrication', date: 'Mars', status: 'current', energy: 60,
 *       relatedIds: ['plan'] },
 *   ]}
 * />
 *
 * @example
 * // Immobile : la disposition circulaire sans la rotation.
 * <OrbitalTimeline steps={etapes} rpm={0} />
 */
export function OrbitalTimeline({
  steps,
  radius = 200,
  rpm = 1,
  label = 'Etapes',
  ...rest
}: OrbitalTimelineProps): ReactElement {
  const { reduced } = useMotionState()
  const [open, setOpen] = useState<string | null>(null)

  /** Angle courant, en tours. Une ref : la rotation ne doit rien rendre. */
  const turns = useRef(0)
  const nodes = useRef<Map<string, HTMLElement>>(new Map())
  const host = useRef<HTMLDivElement | null>(null)

  ensureOrbitalRules()

  const related = useCallback(
    (id: string): readonly string[] =>
      steps.find((step) => step.id === id)?.relatedIds ?? [],
    [steps],
  )

  // Le placement. Il s'execute a chaque image pendant la rotation, et une seule
  // fois quand elle est arretee — l'ecriture est la meme, seule la source de
  // l'angle change.
  useEffect(() => {
    const place = (): void => {
      const count = steps.length
      if (count === 0) return

      steps.forEach((step, index) => {
        const element = nodes.current.get(step.id)
        if (element === undefined) return

        const angle = ((index / count + turns.current) % 1) * Math.PI * 2
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius

        element.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`
        // Les noeuds du fond passent derriere et s'estompent : c'est ce qui
        // donne la profondeur, sans perspective ni transformation 3D.
        element.style.zIndex = String(Math.round(100 + 50 * Math.cos(angle)))
        element.style.opacity =
          step.id === open ? '1' : (0.4 + 0.6 * ((1 + Math.sin(angle)) / 2)).toFixed(3)
      })
    }

    place()

    // Arretee sur demande, sous mouvement reduit, ou pendant qu'une fiche est
    // ouverte : elle emporterait sa fiche hors du cadre.
    if (reduced || rpm === 0 || open !== null) return

    const subscription = clock.subscribe(
      ({ delta }) => {
        turns.current = (turns.current + (delta * rpm) / 60) % 1
        place()
      },
      { name: 'frise-orbitale', priority: CLOCK_PRIORITY.layout },
    )

    return () => subscription.unsubscribe()
  }, [steps, radius, rpm, reduced, open])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-flex o-min-h-screen o-items-center o-justify-center' },
    rest,
  )

  return (
    <section {...rest} className={className} style={style}>
      <div
        ref={host}
        className="o-relative o-flex o-h-full o-w-full o-items-center o-justify-center"
      >
        {/* Le coeur, et ses deux anneaux. */}
        <div
          aria-hidden
          data-o-orbital-core
          className="o-absolute o-flex o-h-16 o-w-16 o-items-center o-justify-center o-rounded-full o-bg-gradient-to-br o-from-brand-500 o-to-fuchsia-500"
        >
          <span
            data-o-orbital-ring="1"
            className="o-absolute o-h-20 o-w-20 o-rounded-full o-border-w-1 o-border-zinc-400"
          />
          <span
            data-o-orbital-ring="2"
            className="o-absolute o-h-24 o-w-24 o-rounded-full o-border-w-1 o-border-zinc-500"
          />
          <span className="o-h-8 o-w-8 o-rounded-full o-bg-zinc-50" />
        </div>

        {/* Le cercle sur lequel les etapes sont posees. */}
        <div
          aria-hidden
          className="o-absolute o-rounded-full o-border-w-1 o-border-zinc-800"
          style={{ width: radius * 2, height: radius * 2 }}
        />

        {/* Les etapes : une liste, malgre le cercle. C'est l'ordre qui compte
            au clavier, et il est celui de la frise, pas celui de l'ecran. */}
        <ul aria-label={label} className="o-absolute o-list-none o-p-0">
          {steps.map((step) => {
            const status = step.status ?? 'todo'
            const energy = step.energy ?? 0
            const isOpen = step.id === open
            const isRelated = open !== null && related(open).includes(step.id)

            return (
              <li
                key={step.id}
                ref={(element) => {
                  if (element === null) nodes.current.delete(step.id)
                  else nodes.current.set(step.id, element)
                }}
                className="o-absolute"
                style={{ willChange: 'transform' }}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : step.id)}
                  className="o-relative o-flex o-flex-col o-items-center o-gap-2 o-bg-transparent"
                >
                  {/* Le halo : sa taille dit l'intensite de l'etape. */}
                  <span
                    aria-hidden
                    data-o-orbital-halo={isRelated ? 'on' : 'off'}
                    className="o-absolute o-rounded-full o-bg-zinc-50 o-opacity-10"
                    style={{
                      width: energy * 0.5 + 40,
                      height: energy * 0.5 + 40,
                      top: -(energy * 0.5) / 2,
                    }}
                  />
                  <span
                    className={`o-relative o-flex o-h-10 o-w-10 o-items-center o-justify-center o-rounded-full o-border-w-1 ${
                      isOpen
                        ? 'o-bg-zinc-50 o-text-zinc-950 o-border-zinc-50'
                        : isRelated
                          ? 'o-bg-zinc-300 o-text-zinc-950 o-border-zinc-50'
                          : 'o-bg-zinc-950 o-text-zinc-50 o-border-zinc-700'
                    }`}
                  >
                    {step.icon}
                  </span>
                  <span
                    className={`o-whitespace-nowrap o-text-xs o-font-semibold o-tracking-wide ${
                      isOpen ? 'o-text-zinc-50' : 'o-text-zinc-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </button>

                {isOpen ? (
                  <div
                    style={{ transform: 'translateX(-50%)' }}
                    className="o-absolute o-left-1/2 o-top-24 o-w-64 o-rounded-lg o-border-w-1 o-border-zinc-700 o-bg-zinc-950 o-p-4 o-text-left o-backdrop-blur-md"
                  >
                    <div className="o-flex o-items-center o-justify-between o-gap-2">
                      <span
                        className={`o-rounded-full o-px-2 o-py-0.5 o-text-xs o-font-semibold ${STATUS_CLASS[status]}`}
                      >
                        {STATUS_LABEL[status]}
                      </span>
                      {step.date === undefined ? null : (
                        <span className="o-font-mono o-text-xs o-text-zinc-500">
                          {step.date}
                        </span>
                      )}
                    </div>

                    <h3 className="o-mt-2 o-text-sm o-font-semibold o-text-zinc-50">
                      {step.title}
                    </h3>

                    {step.content === undefined ? null : (
                      <div className="o-mt-2 o-text-xs o-text-zinc-300">
                        {step.content}
                      </div>
                    )}

                    <div className="o-mt-4 o-border-t o-border-zinc-800 o-pt-3">
                      <div className="o-flex o-items-center o-justify-between o-text-xs o-text-zinc-400">
                        <span>Intensite</span>
                        <span className="o-font-mono">{energy}%</span>
                      </div>
                      {/* Une jauge natale : lue par les technologies
                          d'assistance sans qu'on ait a decrire la barre. */}
                      <progress
                        value={energy}
                        max={100}
                        className="o-mt-1 o-h-1 o-w-full"
                      >
                        {energy}%
                      </progress>
                    </div>

                    {(step.relatedIds ?? []).length === 0 ? null : (
                      <div className="o-mt-4 o-border-t o-border-zinc-800 o-pt-3">
                        <p className="o-mb-2 o-text-xs o-uppercase o-tracking-wide o-text-zinc-400">
                          Etapes liees
                        </p>
                        <div className="o-flex o-flex-wrap o-gap-1">
                          {(step.relatedIds ?? []).map((id) => (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setOpen(id)}
                              className="o-rounded-sm o-border-w-1 o-border-zinc-700 o-bg-transparent o-px-2 o-py-0.5 o-text-xs o-text-zinc-300 hover:o-text-zinc-50"
                            >
                              {steps.find((other) => other.id === id)?.title ?? id}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
