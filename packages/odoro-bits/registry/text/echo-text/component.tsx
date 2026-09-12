/**
 * Echos : des copies attenuees du texte suivent le pointeur, chacune avec un
 * temps de retard de plus en plus long. L'original ne bouge pas.
 *
 * ## Le retard est une duree de transition, pas une boucle
 *
 * Toutes les copies visent la meme cible — deux variables CSS que le
 * pointeur ecrit. Ce qui les distingue, c'est le temps qu'elles mettent a la
 * rejoindre : la premiere est vive, la derniere traine. Pendant un mouvement,
 * chacune est donc a un point different du trajet, et le texte laisse une
 * trainee — sans une seule image calculee en JavaScript, sans un seul rendu
 * React par evenement.
 *
 * ## L'original reste net, et reste le seul texte
 *
 * Les echos sont des ornements : opacite decroissante, flou croissant, et
 * `aria-hidden` — pour un lecteur d'ecran il n'y a qu'un texte. Sous
 * mouvement reduit, les copies ne sont pas rendues du tout.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from 'react'

/** Proprietes propres au composant. */
export interface EchoTextOwnProps {
  /** Texte a repeter. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Nombre de copies. @defaultValue 3 */
  copies?: number
  /** Retard de la premiere copie, en millisecondes ; chaque copie suivante double la mise. @defaultValue 220 */
  lag?: number
  /** Flou ajoute a chaque copie, en pixels. @defaultValue 1 */
  spread?: number
}

/** Toutes les proprietes. */
export type EchoTextProps = Customisable<EchoTextOwnProps, 'span'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-echo-text'

/** Part du chemin vers le pointeur que les echos parcourent. */
const FOLLOW = 0.3

/** Pose les regles des echos, une fois par document. */
function ensureEchoRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-echo]{position:relative;display:inline-block}',
    '[data-o-echo-copy]{',
    'position:absolute;inset:0;pointer-events:none;user-select:none;',
    'transform:translate(var(--o-echo-x),var(--o-echo-y));',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Fait suivre le pointeur par des echos du texte, l'original restant net.
 *
 * @example
 * <EchoText as="h1" className="o-text-5xl o-font-extrabold">
 *   Remanence
 * </EchoText>
 *
 * @example
 * // Deux echos seulement, tres traineurs.
 * <EchoText copies={2} lag={400}>Lent</EchoText>
 */
export function EchoText({
  children,
  as: Tag = 'span',
  copies = 3,
  lag = 220,
  spread = 1,
  ...rest
}: EchoTextProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLElement | null>(null)
  ensureEchoRule()

  useEffect(() => {
    const element = host.current
    if (element === null || reduced) return

    const onMove = (event: PointerEvent): void => {
      const bounds = element.getBoundingClientRect()
      const x = (event.clientX - bounds.left - bounds.width / 2) * FOLLOW
      const y = (event.clientY - bounds.top - bounds.height / 2) * FOLLOW
      element.style.setProperty('--o-echo-x', `${String(x)}px`)
      element.style.setProperty('--o-echo-y', `${String(y)}px`)
    }
    const onLeave = (): void => {
      // Retour au repos : les echos se rangent sous l'original, chacun a son
      // rythme — c'est la meme transition qui les ramene.
      element.style.setProperty('--o-echo-x', '0px')
      element.style.setProperty('--o-echo-y', '0px')
    }

    element.addEventListener('pointermove', onMove, { passive: true })
    element.addEventListener('pointerleave', onLeave)
    return () => {
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerleave', onLeave)
    }
  }, [reduced])

  const { className, style } = mergePresentation({}, rest)

  // Mouvement reduit : l'original, seul.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const echoStyle = {
    ...style,
    '--o-echo-x': '0px',
    '--o-echo-y': '0px',
  } as CSSProperties

  const count = Math.max(2, Math.min(4, Math.round(copies)))

  return (
    <Tag {...rest} ref={host} className={className} style={echoStyle} data-o-echo="">
      {children}
      {Array.from({ length: count }, (_, index) => {
        const rank = index + 1
        return (
          <span
            key={rank}
            aria-hidden
            data-o-echo-copy=""
            style={{
              // Plus l'echo est lointain, plus il est lent, pale et flou.
              transition: `transform ${String(lag * rank)}ms ease-out`,
              opacity: 0.3 * Math.pow(0.65, index),
              filter: `blur(${String(rank * spread)}px)`,
            }}
          >
            {children}
          </span>
        )
      })}
    </Tag>
  )
}
