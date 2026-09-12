/**
 * Anneaux concentriques emis a chaque clic.
 *
 * ## Ce qui le distingue de l'onde au clic
 *
 * L'onde au clic est **un** cercle plein qui atteint les bords : elle marque
 * la surface touchee, comme le fait un bouton. Ici, c'est une salve de traits
 * fins qui s'ecartent en ralentissant, decales les uns des autres. La premiere
 * repond a un appui ; celle-ci celebre un evenement — une reussite, un envoi,
 * une piece qui vient d'apparaitre.
 *
 * ## Un canevas, pas des elements
 *
 * Six salves de trois anneaux font dix-huit cercles a redessiner par image.
 * En elements du document, ce serait dix-huit transitions concurrentes a
 * creer et a detruire sans arret ; en canevas, c'est dix-huit appels a `arc`
 * dans une seule passe.
 *
 * ## Le temps des clics vient de l'horloge du moteur
 *
 * Un clic est date pour que l'age de son anneau se calcule par soustraction.
 * Employer `performance.now()` prendrait une autre origine que celle du temps
 * de dessin : les anneaux naitraient vieux de plusieurs secondes, donc
 * invisibles. Une souscription en priorite d'entree memorise donc le temps
 * courant, et elle reste active meme quand la boucle de dessin dort — c'est
 * elle qui garantit qu'un clic apres dix secondes d'inactivite est date juste.
 *
 * ## Ce qui reste sous mouvement reduit
 *
 * Rien : une salve n'a pas d'etat final, elle n'est faite que de son
 * expansion. Le canevas n'est alors pas monte du tout.
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
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface MagicRingsOwnProps {
  /** Contenu de la zone sensible. */
  children: ReactNode
  /** Nombre d'anneaux par salve. @defaultValue 3 */
  rings?: number
  /** Duree de vie d'un anneau, en millisecondes. @defaultValue 1200 */
  duration?: number
  /** Rayon atteint en fin de course, en pixels. @defaultValue 260 */
  size?: number
  /** Epaisseur du trait, en pixels. @defaultValue 2 */
  thickness?: number
  /** Retard entre deux anneaux d'une meme salve, en millisecondes. @defaultValue 130 */
  gap?: number
  /** Couleur des anneaux. @defaultValue la teinte de marque */
  color?: string
}

/** Toutes les proprietes. */
export type MagicRingsProps = Customisable<MagicRingsOwnProps>

/** Salves gardees en memoire. Au-dela, la plus ancienne est ecrasee. */
const SLOTS = 6

/** Une salve : le point touche et l'instant de l'appui, en secondes. */
interface Burst {
  x: number
  y: number
  birth: number
}

/**
 * Emet des anneaux au clic sur sa zone.
 *
 * @example
 * <MagicRings className="o-rounded-xl o-p-8">
 *   <p>Cliquez n importe ou</p>
 * </MagicRings>
 *
 * @example
 * // Une seule onde large et lente, dans une autre teinte.
 * <MagicRings rings={1} size={520} duration={2200} color="var(--o-palette-sky-400)">
 *   <button type="button">Envoyer</button>
 * </MagicRings>
 */
export function MagicRings({
  children,
  rings = 3,
  duration = 1200,
  size = 260,
  thickness = 2,
  gap = 130,
  color = 'var(--o-palette-brand-500)',
  ...rest
}: MagicRingsProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const canvas = useRef<HTMLCanvasElement | null>(null)

  // Tampon circulaire, mute en place : une naissance a moins mille rend la
  // salve inerte d'office, sans cas particulier au premier tour.
  const bursts = useRef<Burst[]>(
    Array.from({ length: SLOTS }, () => ({ x: 0, y: 0, birth: -1000 })),
  ).current

  useEffect(() => {
    const surface = canvas.current
    if (host === null || surface === null || reduced) return

    const context = surface.getContext('2d')
    if (context === null) return

    const life = Math.max(duration, 1) / 1000
    const stagger = Math.max(gap, 0) / 1000
    const count = Math.max(1, Math.round(rings))

    let width = 0
    let height = 0
    let stroke = ''
    let cursor = 0
    let now = 0

    const measure = (): void => {
      const box = host.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1
      width = Math.max(1, Math.round(box.width))
      height = Math.max(1, Math.round(box.height))
      surface.width = Math.round(width * ratio)
      surface.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      // La couleur est relue a chaque mesure : le theme a pu basculer.
      stroke = window.getComputedStyle(surface).color
    }

    const draw = (time: number): void => {
      context.clearRect(0, 0, width, height)
      context.lineWidth = thickness
      context.strokeStyle = stroke

      let alive = false
      for (const burst of bursts) {
        for (let index = 0; index < count; index += 1) {
          const age = time - burst.birth - index * stagger
          if (age < 0 || age > life) continue
          alive = true

          const progress = age / life
          // Une sortie cubique : l'anneau part vite et s'etale en ralentissant,
          // ce qui donne la detente d'une onde plutot qu'un cercle qui grandit.
          const radius = size * (1 - (1 - progress) ** 3)
          context.globalAlpha = (1 - progress) ** 2
          context.beginPath()
          context.arc(burst.x, burst.y, Math.max(radius, 0.5), 0, Math.PI * 2)
          context.stroke()
        }
      }
      context.globalAlpha = 1

      // Plus une salve vivante : la boucle se suspend, et le prochain appui
      // la reveille. Elle garde sa place dans l'ordre de la frame.
      if (!alive) render.setActive(false)
    }

    // Toujours active, meme quand le dessin dort : c'est elle qui date les
    // appuis dans le meme temps que celui du dessin.
    const ticker = clock.subscribe(
      ({ time }) => {
        now = time
      },
      { priority: CLOCK_PRIORITY.input, name: 'anneaux : horloge' },
    )

    const render = clock.subscribe(({ time }) => draw(time), {
      priority: CLOCK_PRIORITY.render,
      name: 'anneaux',
    })
    render.setActive(false)

    const onDown = (event: PointerEvent): void => {
      const box = host.getBoundingClientRect()
      const slot = bursts[cursor % SLOTS]
      if (slot === undefined) return
      slot.x = event.clientX - box.left
      slot.y = event.clientY - box.top
      slot.birth = now
      cursor += 1
      render.setActive(true)
    }

    const observer = new ResizeObserver(measure)
    observer.observe(host)
    measure()

    host.addEventListener('pointerdown', onDown, { passive: true })

    return () => {
      host.removeEventListener('pointerdown', onDown)
      observer.disconnect()
      render.unsubscribe()
      ticker.unsubscribe()
      context.clearRect(0, 0, width, height)
    }
  }, [host, reduced, bursts, rings, duration, size, thickness, gap])

  const { className, style } = mergePresentation({ className: 'o-relative' }, rest)

  return (
    <div {...rest} ref={setHost} className={className} style={style}>
      {children}
      {reduced ? null : (
        <canvas
          ref={canvas}
          aria-hidden="true"
          className="o-absolute o-inset-0 o-size-full o-pointer-events-none"
          style={{ color } as CSSProperties}
        />
      )}
    </div>
  )
}
