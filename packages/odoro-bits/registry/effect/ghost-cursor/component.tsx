/**
 * Trainee fantome : le chemin parcouru, garde quelques images de plus.
 *
 * ## Une memoire, pas une chaine de ressorts
 *
 * Le curseur gluant accroche chaque boule a la precedente : la trainee coupe
 * les virages, parce qu'un ressort tire toujours en ligne droite. Ici rien ne
 * tire : la position brute du pointeur est **enregistree** a chaque image dans
 * un anneau, et chaque fantome relit une case plus ancienne. La trainee epouse
 * donc le trace exact, boucles comprises.
 *
 * L'anneau a une longueur fixe — `count x gap + 1` cases — et l'ecriture
 * ecrase la plus vieille. Aucune allocation par image, aucun tableau qui
 * grandit : la memoire du composant est connue des sa creation.
 *
 * ## L'ecart se regle en images, pas en secondes
 *
 * `gap` est un nombre d'images entre deux fantomes. C'est volontaire : la
 * trainee est un echantillonnage du geste, et ce qu'on veut regler c'est la
 * densite des echantillons. Une duree donnerait une trainee plus courte sur un
 * ecran rapide, pour le meme reglage.
 *
 * ## Seule la transformation change
 *
 * L'opacite et la taille de chaque fantome sont posees une fois, a la
 * creation : elles ne dependent que de son rang. La boucle n'ecrit qu'un
 * `translate3d` par fantome — rien qui declenche une mise en page.
 *
 * ## Ou il ne se montre pas
 *
 * Sans pointeur fin, aucun fantome n'existe. Sous mouvement reduit non plus :
 * une trainee est un mouvement pur, sans etat final a poser. Le curseur du
 * systeme reste en place.
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

/** Forme d'un fantome. */
export type GhostShape = 'point' | 'anneau' | 'carre'

/** Proprietes propres au composant. */
export interface GhostCursorOwnProps {
  /**
   * Zone ou la trainee vit.
   *
   * Fournie, elle n'ecoute que cette zone et y est coupee. Absente, elle prend
   * la page entiere, en couche fixe qui n'intercepte rien.
   */
  children?: ReactNode
  /** Nombre de fantomes. @defaultValue 10 */
  count?: number
  /** Taille du premier fantome, en pixels. @defaultValue 14 */
  size?: number
  /** Images d'ecart entre deux fantomes. @defaultValue 3 */
  gap?: number
  /** Forme des fantomes. @defaultValue 'point' */
  shape?: GhostShape
  /** Couleur des fantomes. Une valeur, pas un role. @defaultValue la couleur du texte */
  color?: string
}

/** Toutes les proprietes. */
export type GhostCursorProps = Customisable<GhostCursorOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-ghost-cursor'

/** Au-dela, la trainee devient une flaque et l'anneau pese pour rien. */
const MAX_GHOSTS = 24

/** Pose les regles de la trainee, une fois par document. */
function ensureGhostCursorRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // La position de la zone vit dans une regle sans specificite : une
    // classe de l appelant — `o-absolute` pour la poser dans un cadre —
    // doit pouvoir la remplacer, ce qu'un style en ligne interdirait.
    ':where([data-o-ghost-host="zone"]){position:relative;overflow:hidden}',
    ':where([data-o-ghost-host="page"]){position:fixed;inset:0;z-index:9998;pointer-events:none}',
    '[data-o-ghost-layer]{',
    'position:absolute;inset:0;overflow:hidden;pointer-events:none;',
    'opacity:0;transition:opacity 180ms linear;',
    '}',
    '[data-o-ghost]{position:absolute;left:0;top:0;will-change:transform}',
  ].join('')
  document.head.append(style)
}

/**
 * Laisse une trainee de fantomes derriere le pointeur.
 *
 * @example
 * // Sur la page entiere.
 * <GhostCursor />
 *
 * @example
 * // Trainee longue et clairsemee, en anneaux.
 * <GhostCursor count={16} gap={4} shape="anneau">
 *   <section className="o-p-16">…</section>
 * </GhostCursor>
 */
export function GhostCursor({
  children,
  count = 10,
  size = 14,
  gap = 3,
  shape = 'point',
  color = 'currentColor',
  ...rest
}: GhostCursorProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const wrapping = children !== undefined

  ensureGhostCursorRule()

  useEffect(() => {
    if (host === null || reduced) return
    if (typeof window === 'undefined') return
    // Pointeur grossier : pas de trace a garder, rien n'est cree.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const total = Math.max(2, Math.min(MAX_GHOSTS, Math.round(count)))
    const stride = Math.max(1, Math.round(gap))
    const away = -size * 4

    const layer = document.createElement('div')
    layer.setAttribute('data-o-ghost-layer', '')
    layer.setAttribute('aria-hidden', 'true')
    host.append(layer)

    const ghosts: { node: HTMLElement; back: number }[] = []
    for (let index = 0; index < total; index += 1) {
      const rank = index / total
      const node = document.createElement('span')
      const side = size * (1 - rank * 0.7)
      node.setAttribute('data-o-ghost', '')
      node.style.width = `${side.toFixed(1)}px`
      node.style.height = `${side.toFixed(1)}px`
      node.style.margin = `${(-side / 2).toFixed(1)}px`
      node.style.opacity = (0.85 * (1 - rank)).toFixed(3)
      if (shape === 'carre') node.style.borderRadius = '2px'
      else node.style.borderRadius = '50%'
      if (shape === 'anneau') {
        node.style.border = `1.5px solid ${color}`
      } else {
        node.style.background = color
      }
      layer.append(node)
      ghosts.push({ node, back: index * stride })
    }

    // L'anneau : une case par image gardee, la plus vieille ecrasee.
    const length = total * stride + 1
    const trail: { x: number; y: number }[] = []
    for (let index = 0; index < length; index += 1) trail.push({ x: away, y: away })
    let head = 0

    let box = host.getBoundingClientRect()
    const onFrameChange = (): void => {
      box = host.getBoundingClientRect()
    }

    let x = away
    let y = away
    let seen = false

    const onMove = (event: Event): void => {
      const pointer = event as PointerEvent
      if (pointer.pointerType === 'touch') return
      x = pointer.clientX - box.left
      y = pointer.clientY - box.top
      if (!seen) {
        // Sans ce remplissage, la trainee se deroule depuis le coin au premier
        // mouvement, comme si le pointeur en venait.
        for (const slot of trail) {
          slot.x = x
          slot.y = y
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
      () => {
        if (!seen) return
        head = (head + 1) % length
        const slot = trail[head]
        if (slot === undefined) return
        slot.x = x
        slot.y = y

        for (const ghost of ghosts) {
          const past = trail[(head - ghost.back + length) % length]
          if (past === undefined) continue
          ghost.node.style.transform = `translate3d(${past.x.toFixed(1)}px,${past.y.toFixed(1)}px,0)`
        }
      },
      { name: 'ghost-cursor : trainee', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      surface.removeEventListener('pointermove', onMove)
      surface.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onFrameChange)
      window.removeEventListener('scroll', onFrameChange, { capture: true })
      subscription.unsubscribe()
      layer.remove()
    }
  }, [host, reduced, count, size, gap, shape, color, wrapping])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={style as CSSProperties}
      data-o-ghost-host={wrapping ? 'zone' : 'page'}
    >
      {children}
    </div>
  )
}
