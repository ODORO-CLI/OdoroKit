/**
 * Nuee : une poignee de points en orbite autour du pointeur.
 *
 * ## Deux mouvements superposes, et c'est tout
 *
 * Chaque point additionne une **poursuite** — sa propre position amortie vers
 * le pointeur — et une **orbite** — un tour lent autour de cette position, a
 * son rayon et a sa vitesse. Rien d'autre : ni collision, ni cohesion, ni
 * regles de nuee. Une simulation de boids ferait le meme dessin pour dix fois
 * le prix, et son resultat serait moins previsible d'une machine a l'autre.
 *
 * Ce qui donne l'impression d'un essaim vivant, c'est que chaque point a une
 * prise differente sur le pointeur. Au repos, les orbites se rejoignent en un
 * anneau qui tourne ; des que la main file, les points les moins accroches
 * restent en arriere et la nuee s'etire en comete. La dispersion est donc une
 * consequence de la vitesse, jamais une valeur qu'on anime.
 *
 * ## Pourquoi l'orbite est en tours par seconde
 *
 * Un increment d'angle par image tournerait deux fois plus vite a cent vingt
 * images par seconde. L'angle avance donc en fonction du temps ecoule, comme
 * l'amortissement de la poursuite.
 *
 * ## Ou elle ne se montre pas
 *
 * Sans pointeur fin, aucun point n'est cree. Sous mouvement reduit non plus :
 * une nuee est un mouvement perpetuel, et il n'en reste pas d'etat final a
 * poser. Le curseur du systeme n'est jamais masque.
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
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface SwarmCursorOwnProps {
  /**
   * Zone ou la nuee vit.
   *
   * Fournie, elle n'ecoute que cette zone et y est coupee. Absente, elle prend
   * la page entiere, en couche fixe qui n'intercepte rien.
   */
  children?: ReactNode
  /** Nombre de points. @defaultValue 12 */
  count?: number
  /** Rayon de l orbite, en pixels. @defaultValue 40 */
  radius?: number
  /** Vitesse d orbite, en tours par seconde. @defaultValue 0.4 */
  speed?: number
  /** Dispersion : de combien les prises different d un point a l autre. @defaultValue 0.65 */
  spread?: number
  /** Diametre d un point, en pixels. @defaultValue 6 */
  dotSize?: number
  /** Couleur des points. Une valeur, pas un role. @defaultValue la couleur du texte */
  color?: string
}

/** Toutes les proprietes. */
export type SwarmCursorProps = Customisable<SwarmCursorOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-swarm-cursor'

/** Au-dela, la nuee devient une tache et chaque image coute pour rien. */
const MAX_DOTS = 32

/** Pose les regles de la nuee, une fois par document. */
function ensureSwarmCursorRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // La position de la zone vit dans une regle sans specificite : une
    // classe de l appelant — `o-absolute` pour la poser dans un cadre —
    // doit pouvoir la remplacer, ce qu'un style en ligne interdirait.
    ':where([data-o-swarm-host="zone"]){position:relative;overflow:hidden}',
    ':where([data-o-swarm-host="page"]){position:fixed;inset:0;z-index:9998;pointer-events:none}',
    '[data-o-swarm-layer]{',
    'position:absolute;inset:0;overflow:hidden;pointer-events:none;',
    'opacity:0;transition:opacity 200ms linear;',
    '}',
    '[data-o-swarm-dot]{position:absolute;left:0;top:0;border-radius:50%;will-change:transform}',
  ].join('')
  document.head.append(style)
}

/**
 * Fait tourner une nuee de points autour du pointeur.
 *
 * @example
 * // Sur la page entiere.
 * <SwarmCursor />
 *
 * @example
 * // Nuee large, lente et tres dispersee, limitee a un heros.
 * <SwarmCursor count={20} radius={70} speed={0.25} spread={0.9}>
 *   <section className="o-p-16">…</section>
 * </SwarmCursor>
 */
export function SwarmCursor({
  children,
  count = 12,
  radius = 40,
  speed = 0.4,
  spread = 0.65,
  dotSize = 6,
  color = 'currentColor',
  ...rest
}: SwarmCursorProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const wrapping = children !== undefined

  ensureSwarmCursorRule()

  useEffect(() => {
    if (host === null || reduced) return
    if (typeof window === 'undefined') return
    // Pointeur grossier : rien a entourer, rien n'est cree.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const total = Math.max(3, Math.min(MAX_DOTS, Math.round(count)))
    const away = -radius * 4

    const layer = document.createElement('div')
    layer.setAttribute('data-o-swarm-layer', '')
    layer.setAttribute('aria-hidden', 'true')
    host.append(layer)

    const flock: {
      node: HTMLElement
      x: number
      y: number
      grip: number
      angle: number
      turn: number
      reach: number
    }[] = []

    for (let index = 0; index < total; index += 1) {
      const rank = index / total
      const node = document.createElement('span')
      const side = dotSize * (0.6 + Math.random() * 0.8)
      node.setAttribute('data-o-swarm-dot', '')
      node.style.width = `${side.toFixed(1)}px`
      node.style.height = `${side.toFixed(1)}px`
      node.style.margin = `${(-side / 2).toFixed(1)}px`
      node.style.background = color
      node.style.opacity = (0.35 + Math.random() * 0.55).toFixed(2)
      layer.append(node)

      flock.push({
        node,
        x: away,
        y: away,
        // La prise descend le long du rang : c'est elle qui etire la nuee
        // quand la main file. Voir l'en-tete du module.
        grip: 16 * (1 - rank * spread),
        angle: rank * Math.PI * 2,
        // Un sens et une cadence propres : sinon les points restent en
        // formation et l'anneau se lit comme une roue dentee.
        turn: (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.8),
        reach: radius * (0.4 + Math.random() * 0.8),
      })
    }

    let box = host.getBoundingClientRect()
    const onFrameChange = (): void => {
      box = host.getBoundingClientRect()
    }

    let targetX = away
    let targetY = away
    let seen = false

    const onMove = (event: Event): void => {
      const pointer = event as PointerEvent
      if (pointer.pointerType === 'touch') return
      targetX = pointer.clientX - box.left
      targetY = pointer.clientY - box.top
      if (!seen) {
        for (const dot of flock) {
          dot.x = targetX
          dot.y = targetY
        }
        seen = true
        layer.style.opacity = '1'
      }
    }

    const onLeave = (): void => {
      layer.style.opacity = '0'
      seen = false
    }

    const surface: HTMLElement | Window = wrapping ? host : window
    surface.addEventListener('pointermove', onMove, { passive: true })
    surface.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', onFrameChange, { passive: true })
    window.addEventListener('scroll', onFrameChange, { passive: true, capture: true })

    const subscription = clock.subscribe(
      ({ delta }) => {
        if (!seen) return
        for (const dot of flock) {
          const factor = 1 - Math.exp(-dot.grip * delta)
          dot.x += (targetX - dot.x) * factor
          dot.y += (targetY - dot.y) * factor
          dot.angle += dot.turn * speed * Math.PI * 2 * delta
          const orbitX = dot.x + Math.cos(dot.angle) * dot.reach
          const orbitY = dot.y + Math.sin(dot.angle) * dot.reach
          dot.node.style.transform = `translate3d(${orbitX.toFixed(1)}px,${orbitY.toFixed(1)}px,0)`
        }
      },
      { name: 'swarm-cursor : nuee', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      surface.removeEventListener('pointermove', onMove)
      surface.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onFrameChange)
      window.removeEventListener('scroll', onFrameChange, { capture: true })
      subscription.unsubscribe()
      layer.remove()
    }
  }, [host, reduced, count, radius, speed, spread, dotSize, color, wrapping])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={style as CSSProperties}
      data-o-swarm-host={wrapping ? 'zone' : 'page'}
    >
      {children}
    </div>
  )
}
