/**
 * Halo de pointeur sur une carte.
 *
 * ## Deux variables, pas un rendu
 *
 * La position du halo change a chaque mouvement du pointeur. La porter dans
 * l'etat React ferait un rendu par evenement — plusieurs dizaines par seconde
 * pendant tout le survol — pour deplacer un degrade que le compositeur sait
 * bouger seul.
 *
 * Deux variables CSS sont donc ecrites sur l'element, et le degrade les suit.
 * React ne rend qu'une fois, au montage.
 *
 * ## Pas de boucle non plus
 *
 * Contrairement a l'attraction, ce halo n'a pas besoin d'amortissement : il
 * est **sous** le pointeur, et tout retard se verrait comme un decalage. Il
 * suit donc l'evenement directement — le seul cas ou c'est la bonne reponse.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro/engine'
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface SpotlightOwnProps {
  /** Contenu de la carte. */
  children: ReactNode
  /** Diametre du halo, en pixels. @defaultValue 320 */
  size?: number
  /** Couleur du halo. Une valeur, pas un role. */
  color?: string
  /** Eclaire aussi la bordure. @defaultValue true */
  border?: boolean
}

/** Toutes les proprietes. */
export type SpotlightProps = Customisable<SpotlightOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-spotlight'

/** Pose les regles du halo, une fois par document. */
function ensureSpotlightRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-spotlight]{position:relative;isolation:isolate}',
    '[data-o-spotlight]::before{',
    'content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;',
    'border-radius:inherit;opacity:0;transition:opacity 200ms linear;',
    'background:radial-gradient(var(--o-spot-size) circle at var(--o-spot-x) var(--o-spot-y),var(--o-spot-color),transparent 70%)',
    '}',
    '[data-o-spotlight][data-o-spotlight-on]::before{opacity:1}',
    // La bordure eclairee emploie un masque : un degrade peint le contour
    // sans qu'il faille superposer un second element.
    '[data-o-spotlight-border]::after{',
    'content:"";position:absolute;inset:0;pointer-events:none;',
    'border-radius:inherit;padding:1px;opacity:0;transition:opacity 200ms linear;',
    'background:radial-gradient(var(--o-spot-size) circle at var(--o-spot-x) var(--o-spot-y),var(--o-spot-color),transparent 60%);',
    '-webkit-mask:linear-gradient(black 0 0) content-box,linear-gradient(black 0 0);',
    'mask:linear-gradient(black 0 0) content-box,linear-gradient(black 0 0);',
    '-webkit-mask-composite:xor;mask-composite:exclude',
    '}',
    '[data-o-spotlight-border][data-o-spotlight-on]::after{opacity:1}',
  ].join('')
  document.head.append(style)
}

/**
 * Eclaire une carte sous le pointeur.
 *
 * @example
 * <Spotlight className="o-rounded-xl o-border-w-1 o-p-6">
 *   <h3>Une carte</h3>
 * </Spotlight>
 */
export function Spotlight({
  children,
  size = 320,
  color = 'oklch(100% 0 0 / 0.12)',
  border = true,
  ...rest
}: SpotlightOwnProps & SpotlightProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  ensureSpotlightRule()

  useEffect(() => {
    if (host === null || reduced) return

    const onMove = (event: PointerEvent): void => {
      const box = host.getBoundingClientRect()
      host.style.setProperty('--o-spot-x', `${String(event.clientX - box.left)}px`)
      host.style.setProperty('--o-spot-y', `${String(event.clientY - box.top)}px`)
      host.setAttribute('data-o-spotlight-on', '')
    }

    const onLeave = (): void => host.removeAttribute('data-o-spotlight-on')

    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerleave', onLeave)
    return () => {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [host, reduced])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={
        {
          ...style,
          '--o-spot-size': `${String(size)}px`,
          '--o-spot-color': color,
        } as CSSProperties
      }
      data-o-spotlight={reduced ? undefined : ''}
      data-o-spotlight-border={border && !reduced ? '' : undefined}
    >
      {children}
    </div>
  )
}
