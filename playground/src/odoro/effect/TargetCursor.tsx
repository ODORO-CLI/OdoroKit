/**
 * Viseur : quatre crochets qui se calent sur ce que le pointeur survole.
 *
 * ## Le curseur devient une mesure
 *
 * Au repos, les quatre crochets forment un petit carre autour du pointeur et
 * tournent lentement : un viseur qui cherche. Des que le pointeur entre sur une
 * cible, ils s'ecartent jusqu'aux coins de sa boite, la rotation s'annule, et
 * l'element se trouve encadre. Le curseur ne dit plus « je suis ici » mais
 * « c'est ceci » — et c'est ce qui le distingue des curseurs qui grossissent au
 * survol sans jamais designer.
 *
 * ## Un seul groupe, quatre coins derives
 *
 * Le centre, la largeur et la hauteur sont amortis ; les crochets ne font
 * qu'appliquer la demi-largeur et la demi-hauteur du moment. Animer quatre
 * positions independantes aurait laisse le cadre se deformer pendant la
 * transition — un coin arrive avant l'autre — au lieu de rester un rectangle.
 *
 * La rotation est portee par le groupe, jamais par les crochets : sinon
 * chacun tournerait sur lui-meme et le cadre se disloquerait.
 *
 * ## La boite de la cible est mesuree quand elle change, pas par image
 *
 * `getBoundingClientRect` force une mise en page. Elle est appelee a l'entree
 * sur une cible, puis seulement si la page defile ou se redimensionne. Entre
 * ces moments, la boite ne bouge pas.
 *
 * ## Ou il ne se montre pas
 *
 * Sans pointeur fin, aucun crochet n'est cree. Sous mouvement reduit non
 * plus : le viseur est un mouvement continu, et il n'en reste pas d'etat
 * final a poser. Le curseur du systeme reste visible — c'est lui qui porte
 * encore le signe du lien.
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
export interface TargetCursorOwnProps {
  /**
   * Zone visee.
   *
   * Fournie, le viseur n'ecoute qu'elle et y est coupe. Absente, il prend la
   * page entiere, en couche fixe qui n'intercepte rien.
   */
  children?: ReactNode
  /** Cote du carre au repos, en pixels. @defaultValue 32 */
  size?: number
  /** Longueur d un crochet, en pixels. @defaultValue 12 */
  corner?: number
  /** Marge laissee autour de la cible encadree, en pixels. @defaultValue 8 */
  padding?: number
  /** Vitesse de rattrapage. Plus haut, plus sec. @defaultValue 14 */
  speed?: number
  /** Rotation au repos, en tours par seconde. @defaultValue 0.12 */
  spin?: number
  /**
   * Ce que le viseur encadre.
   *
   * @defaultValue 'a, button, [role="button"], [data-o-target]'
   */
  targets?: string
  /** Couleur des crochets. Une valeur, pas un role. @defaultValue la couleur du texte */
  color?: string
}

/** Toutes les proprietes. */
export type TargetCursorProps = Customisable<TargetCursorOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-target-cursor'

/** Pose les regles du viseur, une fois par document. */
function ensureTargetCursorRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // La position de la zone vit dans une regle sans specificite : une
    // classe de l appelant — `o-absolute` pour la poser dans un cadre —
    // doit pouvoir la remplacer, ce qu'un style en ligne interdirait.
    ':where([data-o-target-host="zone"]){position:relative;overflow:hidden}',
    ':where([data-o-target-host="page"]){position:fixed;inset:0;z-index:9998;pointer-events:none}',
    '[data-o-target-layer]{',
    'position:absolute;inset:0;overflow:hidden;pointer-events:none;',
    'opacity:0;transition:opacity 160ms linear;',
    '}',
    '[data-o-target-group]{position:absolute;left:0;top:0;will-change:transform}',
    '[data-o-target-corner]{position:absolute;left:0;top:0;will-change:transform}',
  ].join('')
  document.head.append(style)
}

/**
 * Pose un viseur qui se cale sur les elements survoles.
 *
 * @example
 * // Sur la page entiere.
 * <TargetCursor />
 *
 * @example
 * // Sur une galerie, ou seules les vignettes sont des cibles.
 * <TargetCursor targets="[data-o-target]" padding={14} spin={0}>
 *   <ul className="o-grid o-grid-cols-3 o-gap-4">…</ul>
 * </TargetCursor>
 */
export function TargetCursor({
  children,
  size = 32,
  corner = 12,
  padding = 8,
  speed = 14,
  spin = 0.12,
  targets = 'a, button, [role="button"], [data-o-target]',
  color = 'currentColor',
  ...rest
}: TargetCursorProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const wrapping = children !== undefined

  ensureTargetCursorRule()

  useEffect(() => {
    if (host === null || reduced) return
    if (typeof window === 'undefined') return
    // Pointeur grossier : il n'y a rien a viser, et rien n'est cree.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const layer = document.createElement('div')
    layer.setAttribute('data-o-target-layer', '')
    layer.setAttribute('aria-hidden', 'true')
    host.append(layer)

    const group = document.createElement('span')
    group.setAttribute('data-o-target-group', '')
    layer.append(group)

    const corners: HTMLElement[] = []
    for (let index = 0; index < 4; index += 1) {
      const node = document.createElement('span')
      node.setAttribute('data-o-target-corner', '')
      node.style.width = `${String(corner)}px`
      node.style.height = `${String(corner)}px`
      node.style.margin = `${String(-corner / 2)}px`
      // Un seul dessin — deux bords — que la rotation suffit a decliner aux
      // quatre coins.
      node.style.borderTop = `2px solid ${color}`
      node.style.borderLeft = `2px solid ${color}`
      group.append(node)
      corners.push(node)
    }

    let box = host.getBoundingClientRect()
    let locked: Element | null = null
    let seen = false

    // Cible du cadre, en coordonnees de la zone.
    let wantX = -size * 4
    let wantY = -size * 4
    let wantW = size
    let wantH = size

    let centreX = wantX
    let centreY = wantY
    let width = size
    let height = size
    let angle = 0

    let pointerX = wantX
    let pointerY = wantY

    /** Recalcule la cible : la boite verrouillee, ou le carre au pointeur. */
    const aim = (): void => {
      if (locked === null) {
        wantX = pointerX
        wantY = pointerY
        wantW = size
        wantH = size
        return
      }
      const rect = locked.getBoundingClientRect()
      wantX = rect.left - box.left + rect.width / 2
      wantY = rect.top - box.top + rect.height / 2
      wantW = rect.width + padding * 2
      wantH = rect.height + padding * 2
    }

    const onFrameChange = (): void => {
      box = host.getBoundingClientRect()
      aim()
    }

    const onMove = (event: Event): void => {
      const pointer = event as PointerEvent
      if (pointer.pointerType === 'touch') return
      pointerX = pointer.clientX - box.left
      pointerY = pointer.clientY - box.top
      if (!seen) {
        centreX = pointerX
        centreY = pointerY
        seen = true
        layer.style.opacity = '1'
      }
      if (locked === null) aim()
    }

    const onOver = (event: Event): void => {
      const node = event.target
      // `closest` plutot que l'element lui-meme : le pointeur survole souvent
      // le texte d'un bouton, pas le bouton.
      locked = node instanceof Element ? node.closest(targets) : null
      aim()
    }

    const onLeave = (): void => {
      layer.style.opacity = '0'
      locked = null
      seen = false
    }

    const surface: HTMLElement | Window = wrapping ? host : window
    surface.addEventListener('pointermove', onMove, { passive: true })
    surface.addEventListener('pointerover', onOver, { passive: true })
    surface.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', onFrameChange, { passive: true })
    window.addEventListener('scroll', onFrameChange, { passive: true, capture: true })

    const subscription = clock.subscribe(
      ({ delta }) => {
        if (!seen) return
        const factor = 1 - Math.exp(-speed * delta)
        centreX += (wantX - centreX) * factor
        centreY += (wantY - centreY) * factor
        width += (wantW - width) * factor
        height += (wantH - height) * factor

        // La rotation ne vit qu'au repos : sur une cible, un cadre penche ne
        // designerait plus rien.
        const wanted = locked === null ? angle + spin * 360 * delta : 0
        angle += (wanted - angle) * factor

        group.style.transform = `translate3d(${centreX.toFixed(1)}px,${centreY.toFixed(1)}px,0) rotate(${angle.toFixed(2)}deg)`

        const halfW = width / 2
        const halfH = height / 2
        let index = 0
        for (const node of corners) {
          const signX = index === 0 || index === 3 ? -1 : 1
          const signY = index < 2 ? -1 : 1
          node.style.transform = `translate(${(signX * halfW).toFixed(1)}px,${(signY * halfH).toFixed(1)}px) rotate(${String(index * 90)}deg)`
          index += 1
        }
      },
      { name: 'target-cursor : viseur', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      surface.removeEventListener('pointermove', onMove)
      surface.removeEventListener('pointerover', onOver)
      surface.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onFrameChange)
      window.removeEventListener('scroll', onFrameChange, { capture: true })
      subscription.unsubscribe()
      layer.remove()
    }
  }, [host, reduced, size, corner, padding, speed, spin, targets, color, wrapping])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={style as CSSProperties}
      data-o-target-host={wrapping ? 'zone' : 'page'}
    >
      {children}
    </div>
  )
}
