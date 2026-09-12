/**
 * Autocollant dont un coin se decolle.
 *
 * ## Deux traces qui se completent
 *
 * Le coin n'est pas dessine par-dessus le contenu : il en est **retire**. Le
 * contenu est decoupe par un polygone auquel il manque un triangle d'angle, et
 * ce meme triangle est repeint a cote, dans la couleur du dos et sous une
 * ombre. Les deux traces bougent ensemble, si bien que la matiere semble
 * passer de l'un a l'autre au lieu de se dedoubler.
 *
 * L'approche naive — faire tourner le coin en perspective — demanderait de
 * couper l'element en deux dans le document, donc de dupliquer le contenu. Ici
 * il n'y en a qu'un, et il reste selectionnable.
 *
 * ## Pourquoi une transition et pas une animation
 *
 * Le decollage n'a pas de duree propre : il suit une intention — la main qui
 * arrive, la main qui repart — et doit pouvoir s'inverser au milieu. C'est la
 * definition d'une transition. Une animation, elle, se rejouerait depuis le
 * debut a chaque changement d'avis.
 *
 * Le clavier declenche par `focus-within` : une carte qui contient un lien doit
 * se decoller aussi pour qui n'a pas de souris.
 *
 * ## Sous mouvement reduit
 *
 * L'etat demande est applique sans transition : ce qui disparait est le
 * glissement du coin, pas le coin lui-meme.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Coin qui se souleve. */
export type PeelCorner = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

/** Proprietes propres au composant. */
export interface StickerPeelOwnProps {
  /** Contenu de l'autocollant. */
  children: ReactNode
  /** Coin qui se souleve. @defaultValue 'top-right' */
  corner?: PeelCorner
  /** Longueur du coin souleve, en pixels. @defaultValue 72 */
  size?: number
  /** Duree du decollage, en millisecondes. @defaultValue 420 */
  duration?: number
  /** Garde le coin souleve, sans attendre le survol. @defaultValue false */
  peeled?: boolean
  /** Couleur du dos de l'autocollant. */
  back?: string
}

/** Toutes les proprietes. */
export type StickerPeelProps = Customisable<StickerPeelOwnProps>

/** Geometrie d'un coin : ce qu'on retire, et ce qu'on repose a cote. */
interface CornerShape {
  /** Trace du contenu, une fois le triangle d'angle retire. */
  readonly content: (cut: string) => string
  /** Position du rabat dans la zone. */
  readonly box: CSSProperties
  /** Trace du rabat, dans sa propre boite carree. */
  readonly flap: string
  /** Sens du degrade qui donne le relief au dos. */
  readonly angle: string
  /** Decalage de l'ombre portee. */
  readonly shadow: string
}

/** Les quatre coins, ecrits une fois. */
const CORNERS: Readonly<Record<PeelCorner, CornerShape>> = {
  'top-right': {
    content: (cut) => `polygon(0 0, calc(100% - ${cut}) 0, 100% ${cut}, 100% 100%, 0 100%)`,
    box: { top: 0, right: 0 },
    flap: 'polygon(0 0, 100% 0, 100% 100%)',
    angle: '225deg',
    shadow: '-3px 3px',
  },
  'top-left': {
    content: (cut) => `polygon(${cut} 0, 100% 0, 100% 100%, 0 100%, 0 ${cut})`,
    box: { top: 0, left: 0 },
    flap: 'polygon(0 0, 100% 0, 0 100%)',
    angle: '135deg',
    shadow: '3px 3px',
  },
  'bottom-right': {
    content: (cut) =>
      `polygon(0 0, 100% 0, 100% calc(100% - ${cut}), calc(100% - ${cut}) 100%, 0 100%)`,
    box: { bottom: 0, right: 0 },
    flap: 'polygon(100% 0, 100% 100%, 0 100%)',
    angle: '315deg',
    shadow: '-3px -3px',
  },
  'bottom-left': {
    content: (cut) =>
      `polygon(0 0, 100% 0, 100% 100%, ${cut} 100%, 0 calc(100% - ${cut}))`,
    box: { bottom: 0, left: 0 },
    flap: 'polygon(0 0, 100% 100%, 0 100%)',
    angle: '45deg',
    shadow: '3px -3px',
  },
}

/**
 * Decolle un coin de son contenu.
 *
 * @example
 * <StickerPeel className="o-rounded-xl o-bg-brand-500 o-p-6">
 *   <p>Offre de lancement</p>
 * </StickerPeel>
 *
 * @example
 * // Un grand coin, decolle en permanence, en bas a gauche.
 * <StickerPeel peeled corner="bottom-left" size={140}>
 *   <img src="/vignette.jpg" alt="" />
 * </StickerPeel>
 */
export function StickerPeel({
  children,
  corner = 'top-right',
  size = 72,
  duration = 420,
  peeled = false,
  back = 'color-mix(in oklab, var(--o-theme-fg) 14%, var(--o-theme-surface))',
  ...rest
}: StickerPeelProps): ReactElement {
  const { reduced } = useMotionState()
  const [active, setActive] = useState(false)

  const shape = CORNERS[corner]
  const open = peeled || active
  const cut = `${String(open ? Math.max(0, size) : 0)}px`
  const ease = `${String(reduced ? 0 : duration)}ms var(--o-ease-emphasized, ease-out)`

  const { className, style } = mergePresentation({ className: 'o-relative' }, rest)

  return (
    <div
      {...rest}
      className={className}
      style={style}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      <div
        style={{
          clipPath: shape.content(cut),
          transition: `clip-path ${ease}`,
        }}
      >
        {children}
      </div>

      {/* Le triangle retire au contenu, repose a la meme place : c'est le dos
          de l'autocollant, pas une decoration ajoutee. */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          ...shape.box,
          width: cut,
          height: cut,
          clipPath: shape.flap,
          background: `linear-gradient(${shape.angle}, ${back}, color-mix(in oklab, ${back} 55%, transparent))`,
          filter: `drop-shadow(${shape.shadow} 8px color-mix(in oklab, var(--o-theme-fg) 26%, transparent))`,
          transition: `width ${ease}, height ${ease}`,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
