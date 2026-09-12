/**
 * Curseur collant : une pastille qui epouse le bouton qu'elle survole.
 *
 * ## Coller, ce n'est pas encadrer
 *
 * Le viseur pose quatre crochets autour d'une cible : il la designe, de
 * l'exterieur. Celui-ci prend sa place — il devient le fond du bouton, avec sa
 * taille et son arrondi, et le libelle se lit par-dessus. C'est le curseur des
 * barres de navigation, celui qui donne l'impression qu'un seul jeton glisse
 * d'un onglet a l'autre.
 *
 * ## L'arrondi est lu sur la cible, une fois
 *
 * Rien ne sert de deviner : au moment ou la pastille accroche, l'arrondi
 * calcule de l'element est recopie, et une transition CSS s'occupe du passage.
 * Le relire a chaque image demanderait un style calcule par image — la mesure
 * la plus chere du navigateur — pour une valeur qui ne change jamais pendant
 * le survol.
 *
 * ## Pourquoi la taille est ecrite, et non mise a l'echelle
 *
 * Une mise a l'echelle deformerait l'arrondi et l'epaisseur du filet : un
 * bouton large deviendrait une capsule ovale. La largeur et la hauteur sont
 * donc amorties puis ecrites telles quelles. C'est une mise en page par image,
 * mais sur un seul element hors flux, dans une couche qui porte `contain` —
 * le cout reste local, et c'est le prix d'une forme juste.
 *
 * ## L'etirement ne vit qu'entre deux cibles
 *
 * En vol, la pastille s'allonge dans le sens du deplacement : c'est ce qui la
 * fait lire comme une matiere plutot qu'un rectangle telepote. Une fois
 * accrochee, l'etirement retombe a zero — un bouton mis en valeur par un fond
 * penche serait un defaut, pas un effet.
 *
 * ## Ou elle ne se montre pas
 *
 * Sans pointeur fin, aucun element n'est cree. Sous mouvement reduit non plus :
 * la pastille est un agrement continu, sans etat final a poser. Le curseur du
 * systeme reste visible.
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
export interface StickyCursorOwnProps {
  /**
   * Zone ou la pastille vit.
   *
   * Fournie, elle n'ecoute que cette zone et y est coupee. Absente, elle prend
   * la page entiere, en couche fixe qui n'intercepte rien.
   */
  children?: ReactNode
  /** Diametre de la pastille au repos, en pixels. @defaultValue 20 */
  size?: number
  /**
   * De combien la pastille suit encore le pointeur une fois accrochee, de zero
   * a un. A zero elle se centre net sur la cible.
   *
   * @defaultValue 0.3
   */
  stick?: number
  /** Marge ajoutee autour de la cible, en pixels. @defaultValue 6 */
  padding?: number
  /** Vitesse de rattrapage. Plus haut, plus sec. @defaultValue 16 */
  speed?: number
  /** Etirement en vol, de zero a un. @defaultValue 0.45 */
  stretch?: number
  /**
   * Ce a quoi la pastille colle.
   *
   * @defaultValue 'a, button, [role="button"], [data-o-sticky]'
   */
  targets?: string
  /** Couleur de la pastille. Une valeur, pas un role. @defaultValue la couleur du texte */
  color?: string
}

/** Toutes les proprietes. */
export type StickyCursorProps = Customisable<StickyCursorOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-sticky-cursor'

/** Allongement maximal, en fraction de la taille. */
const MAX_STRETCH = 0.6

/** Pose les regles de la pastille, une fois par document. */
function ensureStickyCursorRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // La position de la zone vit dans une regle sans specificite : une
    // classe de l appelant — `o-absolute` pour la poser dans un cadre —
    // doit pouvoir la remplacer, ce qu'un style en ligne interdirait.
    ':where([data-o-sticky-host="zone"]){position:relative;overflow:hidden}',
    ':where([data-o-sticky-host="page"]){position:fixed;inset:0;z-index:9998;pointer-events:none}',
    '[data-o-sticky-layer]{',
    'position:absolute;inset:0;overflow:hidden;pointer-events:none;',
    // La mise en page de la pastille ne doit pas remonter dans la page : voir
    // l'en-tete du module.
    'contain:layout style;',
    'opacity:0;transition:opacity 160ms linear;',
    '}',
    '[data-o-sticky-pad]{',
    'position:absolute;left:0;top:0;will-change:transform;',
    'transition:border-radius 220ms ease;',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Fait coller une pastille aux elements survoles.
 *
 * @example
 * // Une barre de navigation ou un seul jeton glisse d un onglet a l autre.
 * <StickyCursor>
 *   <nav className="o-flex o-gap-2">…</nav>
 * </StickyCursor>
 *
 * @example
 * // Sur la page entiere, plus grosse et parfaitement centree sur ses cibles.
 * <StickyCursor size={28} stick={0} padding={10} />
 */
export function StickyCursor({
  children,
  size = 20,
  stick = 0.3,
  padding = 6,
  speed = 16,
  stretch = 0.45,
  targets = 'a, button, [role="button"], [data-o-sticky]',
  color = 'currentColor',
  ...rest
}: StickyCursorProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const wrapping = children !== undefined

  ensureStickyCursorRule()

  useEffect(() => {
    if (host === null || reduced) return
    if (typeof window === 'undefined') return
    // Pointeur grossier : rien a coller, rien n'est cree.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const layer = document.createElement('div')
    layer.setAttribute('data-o-sticky-layer', '')
    layer.setAttribute('aria-hidden', 'true')
    host.append(layer)

    const pad = document.createElement('span')
    pad.setAttribute('data-o-sticky-pad', '')
    // Une teinte, pas un aplat : la pastille passe sous le libelle du bouton,
    // qui doit rester lisible.
    pad.style.background = `color-mix(in oklab, ${color} 16%, transparent)`
    pad.style.border = `1px solid color-mix(in oklab, ${color} 45%, transparent)`
    pad.style.borderRadius = '9999px'
    pad.style.width = `${String(size)}px`
    pad.style.height = `${String(size)}px`
    layer.append(pad)

    let box = host.getBoundingClientRect()
    let locked: Element | null = null
    let seen = false
    let radius = '9999px'

    let wantX = -size * 6
    let wantY = -size * 6
    let wantW = size
    let wantH = size

    let centreX = wantX
    let centreY = wantY
    let width = size
    let height = size
    let grip = 0

    let pointerX = wantX
    let pointerY = wantY

    /** Recalcule la cible : la boite accrochee, ou la pastille au pointeur. */
    const aim = (): void => {
      if (locked === null) {
        wantX = pointerX
        wantY = pointerY
        wantW = size
        wantH = size
        return
      }
      const rect = locked.getBoundingClientRect()
      const cx = rect.left - box.left + rect.width / 2
      const cy = rect.top - box.top + rect.height / 2
      // `stick` est une fraction de trajet : a zero la pastille se centre, a un
      // elle reste sous le doigt tout en ayant pris la forme de la cible.
      wantX = cx + (pointerX - cx) * stick
      wantY = cy + (pointerY - cy) * stick
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
      aim()
    }

    const onOver = (event: Event): void => {
      const node = event.target
      const found = node instanceof Element ? node.closest(targets) : null
      if (found !== locked) {
        locked = found
        // L'arrondi est lu au moment de l'accroche, jamais dans la boucle.
        radius = found === null ? '9999px' : window.getComputedStyle(found).borderRadius
        pad.style.borderRadius = radius
      }
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
        const stepX = (wantX - centreX) * factor
        const stepY = (wantY - centreY) * factor
        centreX += stepX
        centreY += stepY
        width += (wantW - width) * factor
        height += (wantH - height) * factor
        grip += ((locked === null ? 0 : 1) - grip) * factor

        pad.style.width = `${width.toFixed(1)}px`
        pad.style.height = `${height.toFixed(1)}px`

        const travelled = Math.hypot(stepX, stepY)
        // L'etirement s'eteint a mesure que la pastille accroche.
        const pull =
          Math.min(MAX_STRETCH, (travelled / Math.max(size, 1)) * stretch) * (1 - grip)
        const angle = (Math.atan2(stepY, stepX) * 180) / Math.PI

        pad.style.transform = [
          `translate3d(${(centreX - width / 2).toFixed(1)}px,${(centreY - height / 2).toFixed(1)}px,0)`,
          `rotate(${angle.toFixed(1)}deg)`,
          `scale(${(1 + pull).toFixed(3)},${(1 - pull * 0.5).toFixed(3)})`,
          `rotate(${(-angle).toFixed(1)}deg)`,
        ].join(' ')
      },
      { name: 'sticky-cursor : pastille', priority: CLOCK_PRIORITY.default },
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
  }, [host, reduced, size, stick, padding, speed, stretch, targets, color, wrapping])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={style as CSSProperties}
      data-o-sticky-host={wrapping ? 'zone' : 'page'}
    >
      {children}
    </div>
  )
}
