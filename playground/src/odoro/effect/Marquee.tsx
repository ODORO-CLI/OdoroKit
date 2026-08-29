/**
 * Bandeau defilant, sans fin.
 *
 * ## Le contenu est rendu deux fois
 *
 * Un defilement sans fin demande que la fin du contenu soit suivie de son
 * debut. La seule facon d'y parvenir sans calcul est de rendre le contenu deux
 * fois et de translater l'ensemble d'exactement la moitie : au moment ou la
 * premiere copie disparait, la seconde occupe sa place au pixel pres, et le
 * cycle recommence sans saut.
 *
 * La copie est retiree de l'arbre d'accessibilite : un lecteur d'ecran
 * annoncerait sinon deux fois la meme chose.
 *
 * ## La duree suit la largeur
 *
 * Une duree fixe ferait defiler un bandeau court aussi lentement qu'un long.
 * Le reglage est donc une vitesse, et la duree se deduit de la largeur reelle
 * du contenu — relue quand elle change.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface MarqueeOwnProps {
  /** Contenu defilant. */
  children: ReactNode
  /** Duree d'un cycle pour cent pour cent de largeur, en secondes. @defaultValue 40 */
  speed?: number
  /** Inverse le sens du defilement. @defaultValue false */
  reverse?: boolean
  /** Suspend le defilement au survol. @defaultValue true */
  pauseOnHover?: boolean
  /** Largeur des fondus lateraux, en pourcentage. @defaultValue 12 */
  fade?: number
}

/** Toutes les proprietes. */
export type MarqueeProps = Customisable<MarqueeOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-marquee'

/** Pose l'animation, une fois par document. */
function ensureMarqueeRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '@keyframes o-marquee{to{transform:translateX(-50%)}}',
    '@keyframes o-marquee-reverse{from{transform:translateX(-50%)}to{transform:none}}',
    '[data-o-marquee]{overflow:hidden;',
    '-webkit-mask:linear-gradient(90deg,transparent,black var(--o-marquee-fade),black calc(100% - var(--o-marquee-fade)),transparent);',
    'mask:linear-gradient(90deg,transparent,black var(--o-marquee-fade),black calc(100% - var(--o-marquee-fade)),transparent)}',
    '[data-o-marquee] > div{display:flex;width:max-content;',
    'animation:o-marquee var(--o-marquee-duration) linear infinite}',
    '[data-o-marquee-reverse] > div{animation-name:o-marquee-reverse}',
    '[data-o-marquee-pause]:hover > div{animation-play-state:paused}',
    '@media (prefers-reduced-motion:reduce){[data-o-marquee] > div{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Fait defiler un contenu sans fin.
 *
 * @example
 * <Marquee speed={30} className="o-py-4">
 *   {logos.map((logo) => (
 *     <span key={logo} className="o-px-8">
 *       {logo}
 *     </span>
 *   ))}
 * </Marquee>
 */
export function Marquee({
  children,
  speed = 40,
  reverse = false,
  pauseOnHover = true,
  fade = 12,
  ...rest
}: MarqueeProps): ReactElement {
  const { reduced } = useMotionState()
  const [track, setTrack] = useState<HTMLElement | null>(null)
  const [duration, setDuration] = useState(speed)
  ensureMarqueeRule()

  useEffect(() => {
    if (track === null) return

    // La duree se deduit de la largeur : un reglage de vitesse doit donner le
    // meme defilement apparent quel que soit le contenu.
    const measure = (): void => {
      const width = track.scrollWidth / 2
      const viewport = track.parentElement?.clientWidth ?? 1
      setDuration(Math.max(2, (width / Math.max(viewport, 1)) * speed))
    }

    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    return () => observer.disconnect()
  }, [track, speed, children])

  const { className, style } = mergePresentation({ className: 'o-relative' }, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          '--o-marquee-duration': `${duration.toFixed(2)}s`,
          '--o-marquee-fade': `${String(fade)}%`,
        } as CSSProperties
      }
      data-o-marquee={reduced ? undefined : ''}
      data-o-marquee-reverse={reverse ? '' : undefined}
      data-o-marquee-pause={pauseOnHover ? '' : undefined}
    >
      <div ref={setTrack}>
        <div className="o-flex">{children}</div>
        {/* La copie n'est la que pour l'oeil : elle ne doit pas etre annoncee. */}
        <div aria-hidden className="o-flex">
          {children}
        </div>
      </div>
    </div>
  )
}
