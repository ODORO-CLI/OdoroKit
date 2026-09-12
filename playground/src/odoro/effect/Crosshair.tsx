/**
 * Reticule : deux traits qui traversent la zone et se croisent au pointeur.
 *
 * ## Un instrument, pas un ornement
 *
 * Les autres curseurs de la famille suivent avec du retard, et c'est le retard
 * qui fait l'effet. Celui-ci vise l'inverse : il doit donner le sentiment d'un
 * viseur, donc il colle. La vitesse de rattrapage par defaut est haute, et le
 * reglage descend assez bas pour ceux qui veulent quand meme du flottement.
 *
 * ## Pourquoi quatre segments et pas deux traits
 *
 * Un vrai reticule laisse un vide au croisement : sans lui, l'intersection
 * masque exactement ce qu'on vise. Chaque axe est donc coupe en deux segments,
 * de part et d'autre de l'ecart.
 *
 * Les segments font toute la largeur — ou toute la hauteur — de la zone une
 * fois pour toutes, et ne changent que d'echelle. Redimensionner en pixels a
 * chaque image demanderait une mise en page par image ; une echelle se compose,
 * elle ne mesure rien.
 *
 * ## Les coordonnees ne re-rendent pas non plus
 *
 * Le releve chiffre est ecrit dans le noeud de texte directement, et seulement
 * quand l'arrondi au pixel a change : deplacer le pointeur d'un dixieme de
 * pixel ne doit rien reecrire du tout.
 *
 * ## Ou il ne se montre pas
 *
 * Sans pointeur fin, aucun element n'est cree. Sous mouvement reduit non plus :
 * deux traits qui suivent la souris sont un mouvement continu, et il n'en reste
 * pas d'etat final a poser. Le curseur du systeme reste toujours visible.
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
export interface CrosshairOwnProps {
  /**
   * Zone visee.
   *
   * Fournie, le reticule n'ecoute qu'elle et s'y arrete. Absente, il prend la
   * page entiere, en couche fixe qui n'intercepte rien.
   */
  children?: ReactNode
  /** Epaisseur des traits, en pixels. @defaultValue 1 */
  thickness?: number
  /** Vitesse de rattrapage. Plus haut, plus colle. @defaultValue 20 */
  speed?: number
  /** Vide laisse au croisement, en pixels. @defaultValue 16 */
  gap?: number
  /** Affiche les coordonnees du croisement. @defaultValue true */
  coords?: boolean
  /** Couleur des traits. Une valeur, pas un role. @defaultValue la couleur du texte */
  color?: string
}

/** Toutes les proprietes. */
export type CrosshairProps = Customisable<CrosshairOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-crosshair'

/** Pose les regles du reticule, une fois par document. */
function ensureCrosshairRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // La position de la zone vit dans une regle sans specificite : une
    // classe de l appelant — `o-absolute` pour la poser dans un cadre —
    // doit pouvoir la remplacer, ce qu'un style en ligne interdirait.
    ':where([data-o-cross-host="zone"]){position:relative;overflow:hidden}',
    ':where([data-o-cross-host="page"]){position:fixed;inset:0;z-index:9998;pointer-events:none}',
    '[data-o-cross-layer]{',
    'position:absolute;inset:0;overflow:hidden;pointer-events:none;',
    'opacity:0;transition:opacity 120ms linear;',
    '}',
    '[data-o-cross-seg]{position:absolute;left:0;top:0;will-change:transform}',
    '[data-o-cross-seg="h"]{width:100%}',
    '[data-o-cross-seg="v"]{height:100%}',
    '[data-o-cross-label]{',
    'position:absolute;left:0;top:0;will-change:transform;',
    'font-size:10px;line-height:1;letter-spacing:0.08em;',
    'font-variant-numeric:tabular-nums;white-space:nowrap;',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Pose un reticule sur sa zone.
 *
 * @example
 * // Sur la page entiere, tres fin.
 * <Crosshair thickness={1} gap={24} />
 *
 * @example
 * // Sur une carte, avec du flottement et sans releve chiffre.
 * <Crosshair speed={6} coords={false} className="o-rounded-xl o-p-10">
 *   <img src="/plan.png" alt="Plan du site" />
 * </Crosshair>
 */
export function Crosshair({
  children,
  thickness = 1,
  speed = 20,
  gap = 16,
  coords = true,
  color = 'currentColor',
  ...rest
}: CrosshairProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const wrapping = children !== undefined

  ensureCrosshairRule()

  useEffect(() => {
    if (host === null || reduced) return
    if (typeof window === 'undefined') return
    // Pointeur grossier : il n'y a rien a viser, et rien n'est cree.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const layer = document.createElement('div')
    layer.setAttribute('data-o-cross-layer', '')
    layer.setAttribute('aria-hidden', 'true')
    host.append(layer)

    /** Fabrique un des quatre segments. */
    const makeSegment = (axis: 'h' | 'v', origin: string): HTMLElement => {
      const node = document.createElement('span')
      node.setAttribute('data-o-cross-seg', axis)
      node.style.background = color
      node.style.transformOrigin = origin
      if (axis === 'h') node.style.height = `${String(thickness)}px`
      else node.style.width = `${String(thickness)}px`
      layer.append(node)
      return node
    }

    const left = makeSegment('h', '0% 50%')
    const right = makeSegment('h', '100% 50%')
    const top = makeSegment('v', '50% 0%')
    const bottom = makeSegment('v', '50% 100%')

    const label = coords ? document.createElement('span') : null
    if (label !== null) {
      label.setAttribute('data-o-cross-label', '')
      label.style.color = color
      layer.append(label)
    }

    let box = host.getBoundingClientRect()
    const onFrameChange = (): void => {
      box = host.getBoundingClientRect()
    }

    let targetX = -1000
    let targetY = -1000
    let x = -1000
    let y = -1000
    let seen = false
    let written = ''

    const onMove = (event: Event): void => {
      const pointer = event as PointerEvent
      if (pointer.pointerType === 'touch') return
      targetX = pointer.clientX - box.left
      targetY = pointer.clientY - box.top
      if (!seen) {
        x = targetX
        y = targetY
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

    const half = gap / 2

    const subscription = clock.subscribe(
      ({ delta }) => {
        if (!seen) return
        const factor = 1 - Math.exp(-speed * delta)
        x += (targetX - x) * factor
        y += (targetY - y) * factor

        const width = Math.max(box.width, 1)
        const height = Math.max(box.height, 1)
        // Les fractions sont bornees a zero : pres d'un bord, un segment
        // negatif se retournerait de l'autre cote du croisement.
        const toLeft = Math.max(0, x - half) / width
        const toRight = Math.max(0, width - x - half) / width
        const toTop = Math.max(0, y - half) / height
        const toBottom = Math.max(0, height - y - half) / height

        left.style.transform = `translate3d(0,${y.toFixed(1)}px,0) scaleX(${toLeft.toFixed(4)})`
        right.style.transform = `translate3d(0,${y.toFixed(1)}px,0) scaleX(${toRight.toFixed(4)})`
        top.style.transform = `translate3d(${x.toFixed(1)}px,0,0) scaleY(${toTop.toFixed(4)})`
        bottom.style.transform = `translate3d(${x.toFixed(1)}px,0,0) scaleY(${toBottom.toFixed(4)})`

        if (label !== null) {
          label.style.transform = `translate3d(${(x + half).toFixed(1)}px,${(y + half).toFixed(1)}px,0)`
          const reading = `${String(Math.round(x))} : ${String(Math.round(y))}`
          // Seulement quand le pixel a change : voir l'en-tete du module.
          if (reading !== written) {
            label.textContent = reading
            written = reading
          }
        }
      },
      { name: 'crosshair : reticule', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      surface.removeEventListener('pointermove', onMove)
      surface.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onFrameChange)
      window.removeEventListener('scroll', onFrameChange, { capture: true })
      subscription.unsubscribe()
      layer.remove()
    }
  }, [host, reduced, thickness, speed, gap, coords, color, wrapping])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={style as CSSProperties}
      data-o-cross-host={wrapping ? 'zone' : 'page'}
    >
      {children}
    </div>
  )
}
