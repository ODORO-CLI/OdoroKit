/**
 * Grille au pointeur, en elements du document.
 *
 * ## Pourquoi une version DOM d'un fond deja ecrit en shader
 *
 * `background/magnet-grid` fait le meme geste sur le processeur graphique, et
 * le fait mieux : des milliers de points, aucun element. Mais il demande WebGL,
 * il occupe une surface entiere, et ses points ne sont pas des objets — on ne
 * peut ni les mesurer, ni s'y accrocher, ni les laisser heriter d'une couleur
 * de texte. Cette entree-ci est faite pour les cas ou l'on veut le motif dans
 * une carte, une barre laterale ou un en-tete, sans reveiller une surface
 * graphique pour une centaine de points.
 *
 * C'est un choix de cout, pas de rendu : au-dela de quelques centaines de
 * points, le shader reprend l'avantage, et c'est lui qu'il faut poser.
 *
 * ## Le pas commande le nombre, pas l'inverse
 *
 * On regle un ecartement en pixels, et le nombre de points en decoule. Une
 * grille a nombre fixe se distend quand le cadre grandit : le motif change de
 * densite selon la place, ce qui n'est jamais ce qu'on veut d'une trame. Un
 * observateur de taille reconstruit donc les points quand le cadre change, et
 * seulement alors.
 *
 * ## Ce que chaque point fait
 *
 * Il s'ecarte du pointeur — ou s'en rapproche — d'une force qui decroit avec
 * la distance, et il s'allume dans le meme mouvement. Les deux viennent de la
 * meme mesure : un point deplace qui resterait pale se lirait comme un defaut
 * d'alignement.
 *
 * ## Sous mouvement reduit
 *
 * La trame est rendue, au repos, sans souscription a la boucle. Une grille de
 * points est un motif qui vaut par lui-meme : c'est bien l'etat final, pas
 * l'etat initial.
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
import { useEffect, useState, type CSSProperties, type ReactElement } from 'react'

import { usePointerDamped } from '@/odoro/hooks/usePointerDamped'

/** Proprietes propres au composant. */
export interface CursorGridDomOwnProps {
  /** Ecartement des points, en pixels. @defaultValue 28 */
  spacing?: number
  /** Portee de l aimant, en pixels. @defaultValue 140 */
  radius?: number
  /** Ecart maximal d un point, en pixels. @defaultValue 12 */
  force?: number
  /** Attire les points au lieu de les repousser. @defaultValue false */
  attract?: boolean
  /** Diametre d un point, en pixels. @defaultValue 3 */
  dotSize?: number
  /** Couleur des points. Une valeur, pas un role. @defaultValue la couleur du texte */
  color?: string
}

/** Toutes les proprietes. */
export type CursorGridDomProps = Customisable<CursorGridDomOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-cursor-grid-dom'

/**
 * Plafond de points.
 *
 * Au-dela, c'est le fond en shader qu'il faut poser : voir l'en-tete du
 * module. Le plafond n'est pas une precaution, c'est la frontiere entre les
 * deux entrees.
 */
const MAX_DOTS = 900

/** Opacite d un point au repos. */
const IDLE_OPACITY = 0.25

/** Pose les regles de la trame, une fois par document. */
function ensureCursorGridDomRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-grid-layer]{position:absolute;inset:0;overflow:hidden;pointer-events:none}',
    '[data-o-grid-dot]{position:absolute;left:0;top:0;border-radius:50%;will-change:transform}',
  ].join('')
  document.head.append(style)
}

/**
 * Pose une trame de points qui reagit au pointeur.
 *
 * Le composant occupe la boite qu on lui donne : c'est a l appelant de la
 * dimensionner.
 *
 * @example
 * <div className="o-relative o-h-64 o-rounded-xl">
 *   <CursorGridDom className="o-absolute o-inset-0" />
 * </div>
 *
 * @example
 * // Trame serree qui aspire les points au lieu de les chasser.
 * <CursorGridDom spacing={18} radius={200} force={18} attract />
 */
export function CursorGridDom({
  spacing = 28,
  radius = 140,
  force = 12,
  attract = false,
  dotSize = 3,
  color = 'currentColor',
  ...rest
}: CursorGridDomProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  ensureCursorGridDomRule()

  const pointer = usePointerDamped({ host, speed: 8, name: 'cursor-grid-dom : pointeur' })

  useEffect(() => {
    if (host === null) return
    if (typeof window === 'undefined') return

    const layer = document.createElement('div')
    layer.setAttribute('data-o-grid-layer', '')
    layer.setAttribute('aria-hidden', 'true')
    host.append(layer)

    let dots: { node: HTMLElement; x: number; y: number }[] = []
    // La taille est relevee a la construction, jamais dans la boucle : lire
    // `clientWidth` par image forcerait une mise en page par image.
    let width = 0
    let height = 0

    /** Refait la trame pour la taille courante du cadre. */
    const build = (): void => {
      layer.replaceChildren()
      dots = []
      width = host.clientWidth
      height = host.clientHeight
      const step = Math.max(6, spacing)
      const cols = Math.max(1, Math.floor(width / step))
      const lines = Math.max(1, Math.floor(height / step))
      if (cols * lines > MAX_DOTS) return

      // Les restes sont partages a gauche et a droite : la trame reste centree
      // dans son cadre au lieu de coller a un bord.
      const offsetX = (width - (cols - 1) * step) / 2
      const offsetY = (height - (lines - 1) * step) / 2

      const fragment = document.createDocumentFragment()
      for (let row = 0; row < lines; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const node = document.createElement('span')
          node.setAttribute('data-o-grid-dot', '')
          node.style.width = `${String(dotSize)}px`
          node.style.height = `${String(dotSize)}px`
          node.style.margin = `${String(-dotSize / 2)}px`
          node.style.background = color
          node.style.opacity = String(IDLE_OPACITY)
          const x = offsetX + col * step
          const y = offsetY + row * step
          node.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`
          fragment.append(node)
          dots.push({ node, x, y })
        }
      }
      layer.append(fragment)
    }

    build()

    // Le cadre peut changer de taille sans que la fenetre bouge : c'est
    // l element qu'on observe, pas `window`.
    const observer = new ResizeObserver(build)
    observer.observe(host)

    // Sous mouvement reduit, la trame reste telle quelle : rien ne s'abonne.
    if (reduced) {
      return () => {
        observer.disconnect()
        layer.remove()
      }
    }

    const pull = attract ? -1 : 1

    const subscription = clock.subscribe(
      () => {
        // Du repere du crochet (centre, [-1, 1]) vers les pixels du cadre.
        const pointerX = ((pointer.current.x + 1) / 2) * Math.max(width, 1)
        const pointerY = ((pointer.current.y + 1) / 2) * Math.max(height, 1)

        for (const dot of dots) {
          const dx = dot.x - pointerX
          const dy = dot.y - pointerY
          const distance = Math.hypot(dx, dy)
          if (distance > radius) {
            dot.node.style.transform = `translate3d(${dot.x.toFixed(1)}px,${dot.y.toFixed(1)}px,0)`
            dot.node.style.opacity = String(IDLE_OPACITY)
            continue
          }
          // Decroissance douce vers le bord de la portee : une decroissance
          // lineaire laisserait un cercle net autour de la main.
          const weight = 1 - distance / Math.max(radius, 1)
          const eased = weight * weight
          const reach = (force * eased * pull) / Math.max(distance, 1)
          const x = dot.x + dx * reach
          const y = dot.y + dy * reach
          dot.node.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${(1 + eased).toFixed(2)})`
          dot.node.style.opacity = (IDLE_OPACITY + (1 - IDLE_OPACITY) * eased).toFixed(3)
        }
      },
      { name: 'cursor-grid-dom : trame', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      observer.disconnect()
      subscription.unsubscribe()
      layer.remove()
    }
  }, [host, reduced, spacing, radius, force, attract, dotSize, color, pointer])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <div {...rest} ref={setHost} className={className} style={style as CSSProperties} aria-hidden />
  )
}
