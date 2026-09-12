/**
 * Blob gluant : quelques boules qui n'en font qu'une.
 *
 * ## Ce qui distingue ce curseur d'un rond qui suit
 *
 * Une seule boule amortie donne un rond en retard — c'est deja le curseur a
 * halo. Ici il y en a plusieurs, chacune accrochee a la precedente, et un
 * filtre SVG les recolle : la trainee se pince, s'etire, puis se fond dans la
 * tete des que le pointeur s'arrete. La matiere ne vient pas des boules, elle
 * vient du filtre.
 *
 * Le filtre est un flou suivi d'un contraste violent sur la couche alpha :
 * tout ce qui est a demi transparent bascule d'un cote ou de l'autre, et deux
 * bords flous voisins se soudent. C'est l'astuce dite « gluante », et elle ne
 * coute qu'un filtre, jamais un calcul par image.
 *
 * ## Une chaine, pas un ressort unique
 *
 * Chaque boule vise la position de celle qui la precede, et la premiere vise
 * le pointeur. La vitesse de rattrapage decroit le long de la chaine : la
 * queue traine plus que la tete, ce qui suffit a produire l'etirement sans
 * simuler quoi que ce soit.
 *
 * L'amortissement est exponentiel en fonction du temps ecoule — la meme
 * matiere a soixante et a cent vingt images par seconde.
 *
 * ## Ou il ne se montre pas
 *
 * Sans pointeur fin, il n'y a rien a suivre : le composant ne cree aucun
 * element et ne s'abonne a rien. Sous mouvement reduit non plus — une trainee
 * est un mouvement decoratif entier, il n'en reste pas d'etat final a poser.
 * Le curseur du systeme n'est jamais masque : il porte des signaux — texte,
 * lien, redimensionnement — que ce blob ne reprend pas.
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
  useId,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface BlobCursorOwnProps {
  /**
   * Zone ou le blob vit.
   *
   * Fournie, le blob n'ecoute que cette zone et y est coupe. Absente, il se
   * pose sur la page entiere, en couche fixe qui n'intercepte rien.
   */
  children?: ReactNode
  /** Nombre de boules de la chaine. @defaultValue 4 */
  count?: number
  /** Diametre de la tete, en pixels. @defaultValue 48 */
  size?: number
  /** Vitesse de rattrapage de la tete. Plus haut, plus sec. @defaultValue 14 */
  speed?: number
  /** Couleur de la matiere. Une valeur, pas un role. @defaultValue la couleur du texte */
  color?: string
}

/** Toutes les proprietes. */
export type BlobCursorProps = Customisable<BlobCursorOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-blob-cursor'

/** Au-dela, la chaine ne se lit plus et le filtre coute pour rien. */
const MAX_BLOBS = 8

/** Pose les regles du blob, une fois par document. */
function ensureBlobCursorRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // La position de la zone vit dans une regle sans specificite : une
    // classe de l appelant — `o-absolute` pour la poser dans un cadre —
    // doit pouvoir la remplacer, ce qu'un style en ligne interdirait.
    ':where([data-o-blob-host="zone"]){position:relative;overflow:hidden}',
    ':where([data-o-blob-host="page"]){position:fixed;inset:0;z-index:9998;pointer-events:none}',
    '[data-o-blob-layer]{',
    'position:absolute;inset:0;overflow:hidden;pointer-events:none;',
    'opacity:0;transition:opacity 200ms linear;',
    '}',
    '[data-o-blob]{',
    'position:absolute;left:0;top:0;border-radius:50%;',
    // Les boules bougent a chaque image : sans cette annonce, le navigateur
    // les repromeut a chaque fois au lieu de les garder sur leur couche.
    'will-change:transform;',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Suit le pointeur d'une matiere gluante.
 *
 * @example
 * // Sur la page entiere.
 * <BlobCursor />
 *
 * @example
 * // Limite a un heros, plus longue et plus lente.
 * <BlobCursor count={6} speed={9}>
 *   <section className="o-p-16">…</section>
 * </BlobCursor>
 */
export function BlobCursor({
  children,
  count = 4,
  size = 48,
  speed = 14,
  color = 'currentColor',
  ...rest
}: BlobCursorProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  // Le filtre porte la taille du blob : deux instances de tailles differentes
  // ne peuvent pas partager le meme, d'ou un identifiant par instance. Les
  // deux-points de `useId` ne passent pas dans une reference `url(#…)`.
  const gooId = `o-blob-goo-${useId().replaceAll(':', '')}`
  const wrapping = children !== undefined

  ensureBlobCursorRule()

  useEffect(() => {
    if (host === null || reduced) return
    if (typeof window === 'undefined') return
    // Pointeur grossier : rien a suivre, et rien ne sera cree. Voir l'en-tete.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const total = Math.max(2, Math.min(MAX_BLOBS, Math.round(count)))
    const away = -size * 3

    const layer = document.createElement('div')
    layer.setAttribute('data-o-blob-layer', '')
    layer.setAttribute('aria-hidden', 'true')
    layer.style.filter = `url(#${gooId})`
    host.append(layer)

    const chain: { node: HTMLElement; x: number; y: number; grip: number }[] = []
    for (let index = 0; index < total; index += 1) {
      const node = document.createElement('span')
      const diameter = size * (1 - (index / total) * 0.5)
      node.setAttribute('data-o-blob', '')
      node.style.width = `${diameter.toFixed(1)}px`
      node.style.height = `${diameter.toFixed(1)}px`
      node.style.margin = `${(-diameter / 2).toFixed(1)}px`
      node.style.background = color
      layer.append(node)
      // La prise se relache le long de la chaine : la queue traine, la tete
      // colle. C'est tout l'etirement.
      chain.push({ node, x: away, y: away, grip: speed * (1 - (index / total) * 0.6) })
    }

    // Le cadre est releve a l'installation, puis aux seuls evenements qui le
    // deplacent. Le relire a chaque mouvement forcerait une mise en page des
    // dizaines de fois par seconde pour une valeur qui n'a pas bouge.
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
        // Sans ce recalage, la chaine traverserait la zone en diagonale depuis
        // sa position de depart au premier mouvement.
        for (const link of chain) {
          link.x = targetX
          link.y = targetY
        }
        seen = true
        layer.style.opacity = '1'
      }
    }

    const onLeave = (): void => {
      layer.style.opacity = '0'
      seen = false
      targetX = away
      targetY = away
    }

    const surface: HTMLElement | Window = wrapping ? host : window
    surface.addEventListener('pointermove', onMove, { passive: true })
    surface.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', onFrameChange, { passive: true })
    window.addEventListener('scroll', onFrameChange, { passive: true, capture: true })

    const subscription = clock.subscribe(
      ({ delta }) => {
        let aheadX = targetX
        let aheadY = targetY
        for (const link of chain) {
          const factor = 1 - Math.exp(-link.grip * delta)
          link.x += (aheadX - link.x) * factor
          link.y += (aheadY - link.y) * factor
          link.node.style.transform = `translate3d(${link.x.toFixed(1)}px,${link.y.toFixed(1)}px,0)`
          aheadX = link.x
          aheadY = link.y
        }
      },
      { name: 'blob-cursor : chaine', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      surface.removeEventListener('pointermove', onMove)
      surface.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onFrameChange)
      window.removeEventListener('scroll', onFrameChange, { capture: true })
      subscription.unsubscribe()
      layer.remove()
    }
  }, [host, reduced, count, size, speed, color, gooId, wrapping])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={style as CSSProperties}
      data-o-blob-host={wrapping ? 'zone' : 'page'}
    >
      {children}
      {/* Le filtre gluant. Surface nulle : il n'est la que pour etre reference
          par la couche, jamais pour etre vu. */}
      <svg aria-hidden width="0" height="0" focusable="false" style={{ position: 'absolute' }}>
        <defs>
          <filter id={gooId}>
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={Math.max(4, size * 0.16)}
              result="flou"
            />
            <feColorMatrix
              in="flou"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11"
            />
          </filter>
        </defs>
      </svg>
    </div>
  )
}
