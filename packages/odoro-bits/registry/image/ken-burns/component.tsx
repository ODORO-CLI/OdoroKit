/**
 * Diaporama derive : deux ou trois images en fondu croise, chacune animee
 * d'un zoom et d'une derive lents pendant son affichage.
 *
 * ## Une minuterie, pas une boucle
 *
 * Le seul JavaScript qui tourne est un `setInterval` au rythme du diaporama —
 * un rendu React toutes les quelques secondes, pour changer l'image active.
 * Le reste est au compositeur : le fondu est une transition d'opacite, la
 * derive une animation CSS declaree une fois, deux fois plus longue que
 * l'intervalle pour qu'elle n'atteigne jamais sa fin visible.
 *
 * ## La derive redemarre avec l'image
 *
 * L'animation n'est posee que sur l'image active : quand l'attribut tombe,
 * l'animation est retiree et se remet a zero. Chaque passage repart donc du
 * debut de sa derive, dont la direction alterne d'une image a l'autre —
 * deux images qui derivent dans le meme sens donnent un seul long travelling,
 * pas un diaporama.
 *
 * ## Sous mouvement reduit
 *
 * La premiere image, fixe, sans cycle : ni minuterie, ni animation. Un
 * diaporama qui change tout seul est exactement le mouvement que la
 * preference demande d'eteindre.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useState, type CSSProperties, type ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-ken-burns'

/** Pose la derive, une fois par document. */
function ensureKenBurnsRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '@keyframes o-ken-burns-drift{',
    'from{transform:scale(1) translate3d(0,0,0)}',
    'to{transform:scale(var(--o-kb-zoom)) translate3d(var(--o-kb-dx),var(--o-kb-dy),0)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Une image du diaporama. */
export interface KenBurnsImage {
  /** Source. */
  readonly src: string
  /** Texte de remplacement. */
  readonly alt: string
}

/** Directions de derive, alternees d'une image a l'autre. */
const DRIFTS: readonly (readonly [string, string])[] = [
  ['2%', '-1.5%'],
  ['-2%', '1%'],
  ['1.5%', '2%'],
]

/** Proprietes propres au composant. */
export interface KenBurnsOwnProps {
  /** Les images du diaporama, deux ou trois. */
  images: readonly KenBurnsImage[]
  /** Rapport largeur sur hauteur. @defaultValue 1.777 */
  ratio?: number
  /** Temps d'affichage de chaque image, en millisecondes. @defaultValue 6000 */
  interval?: number
  /** Echelle atteinte en fin de derive. @defaultValue 1.12 */
  zoom?: number
}

/** Toutes les proprietes. */
export type KenBurnsProps = Customisable<KenBurnsOwnProps>

/** Duree du fondu croise, en millisecondes. */
const FADE_MS = 1200

/**
 * Enchaine des images en fondu croise, chacune en lente derive.
 *
 * @example
 * <KenBurns
 *   images={[
 *     { src: '/aube.jpg', alt: 'L atelier a l aube' },
 *     { src: '/midi.jpg', alt: 'L atelier a midi' },
 *     { src: '/soir.jpg', alt: 'L atelier au soir' },
 *   ]}
 * />
 */
export function KenBurns({
  images,
  ratio = 1.777,
  interval = 6000,
  zoom = 1.12,
  ...rest
}: KenBurnsProps): ReactElement {
  const { reduced } = useMotionState()
  const [active, setActive] = useState(0)
  ensureKenBurnsRule()

  const cycling = !reduced && images.length > 1

  useEffect(() => {
    if (!cycling) return

    const timer = setInterval(() => {
      setActive((index) => (index + 1) % images.length)
    }, interval)

    return () => clearInterval(timer)
  }, [cycling, interval, images.length])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  // Sous mouvement reduit : la premiere image, fixe, et rien d'autre.
  const shown = reduced ? images.slice(0, 1) : images

  return (
    <div
      {...rest}
      className={className}
      style={{ ...style, aspectRatio: String(ratio) }}
    >
      {shown.map((image, index) => {
        const isActive = index === active || reduced
        const drift = DRIFTS[index % DRIFTS.length] ?? ['0%', '0%']

        const layer: CSSProperties = {
          opacity: isActive ? 1 : 0,
          transition: reduced ? undefined : `opacity ${String(FADE_MS)}ms ease-in-out`,
          '--o-kb-zoom': String(zoom),
          '--o-kb-dx': drift[0],
          '--o-kb-dy': drift[1],
          // La derive dure deux intervalles : l'image est partie avant que
          // son mouvement ne s'arrete, et l'arret ne se voit jamais.
          animation:
            isActive && !reduced
              ? `o-ken-burns-drift ${String(interval * 2)}ms linear forwards`
              : undefined,
        } as CSSProperties

        return (
          <img
            key={image.src}
            src={image.src}
            alt={image.alt}
            aria-hidden={isActive ? undefined : true}
            className="o-absolute o-inset-0 o-size-full o-object-cover o-will-change-transform"
            style={layer}
          />
        )
      })}
    </div>
  )
}
