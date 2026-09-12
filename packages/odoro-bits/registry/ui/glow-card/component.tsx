/**
 * Carte a lueur : la bordure s'illumine la ou le pointeur passe.
 *
 * ## Deux variables, pas un rendu
 *
 * Comme pour le halo de pointeur, la position de la lueur est ecrite en
 * variables CSS directement sur l'element : React ne rend qu'une fois, au
 * montage, et le degrade suit le pointeur sans qu'un seul rendu ne soit
 * declenche. La lueur est **sur** le trajet du pointeur, donc elle suit
 * l'evenement directement — un amortissement se lirait comme un retard.
 *
 * ## Seule la bordure s'allume
 *
 * Le degrade est peint sur un anneau d'un pixel obtenu par masque : deux
 * calques dont l'intersection est soustraite, il ne reste que le contour.
 * C'est ce qui distingue cette carte du halo : la lumiere ne se repand pas
 * sur le fond, elle court le long du bord.
 *
 * ## Inerte la ou il n'y a pas de pointeur fin
 *
 * Au doigt, il n'y a pas de survol : la lueur n'apparaitrait qu'au moment
 * du toucher, comme un rate. L'effet ne s'installe que si l'appareil a un
 * pointeur fin capable de survol — ailleurs, la carte est une carte.
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
export interface GlowCardOwnProps {
  /** Contenu de la carte. */
  children: ReactNode
  /** Rayon de la lueur, en pixels. @defaultValue 200 */
  radius?: number
  /** Intensite de la lueur, de zero a un. @defaultValue 0.8 */
  strength?: number
  /** Premiere couleur de la lueur. @defaultValue teinte de marque */
  from?: string
  /** Seconde couleur, vers laquelle la lueur s'eteint. @defaultValue fuchsia */
  to?: string
}

/** Toutes les proprietes. */
export type GlowCardProps = Customisable<GlowCardOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-glow-card'

/** Pose l'anneau et son masque, une fois par document. */
function ensureGlowRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-glow]{position:relative}',
    '[data-o-glow]::before{',
    'content:"";position:absolute;inset:0;pointer-events:none;',
    'border-radius:inherit;padding:1px;',
    'opacity:0;transition:opacity 240ms linear;',
    'background:radial-gradient(var(--o-glow-radius) circle at var(--o-glow-x) var(--o-glow-y),',
    'var(--o-glow-from),var(--o-glow-to) 55%,transparent 80%);',
    // Le masque soustrait l'interieur : le degrade ne peint que l'anneau.
    '-webkit-mask:linear-gradient(black 0 0) content-box,linear-gradient(black 0 0);',
    'mask:linear-gradient(black 0 0) content-box,linear-gradient(black 0 0);',
    '-webkit-mask-composite:xor;mask-composite:exclude;',
    '}',
    '[data-o-glow][data-o-glow-on]::before{opacity:var(--o-glow-strength)}',
  ].join('')
  document.head.append(style)
}

/**
 * Fait courir une lueur le long de la bordure, sous le pointeur.
 *
 * @example
 * <GlowCard className="o-rounded-xl o-border-w-1 o-p-6">
 *   <h3>Une carte</h3>
 * </GlowCard>
 *
 * @example
 * // Une lueur large et discrete.
 * <GlowCard radius={320} strength={0.5} className="o-rounded-2xl o-p-8">
 *   Contenu
 * </GlowCard>
 */
export function GlowCard({
  children,
  radius = 200,
  strength = 0.8,
  from = 'var(--o-palette-brand-500)',
  to = 'var(--o-palette-fuchsia-500)',
  ...rest
}: GlowCardProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  ensureGlowRule()

  useEffect(() => {
    if (host === null || reduced) return

    // Pas de pointeur fin, pas de survol : l'effet ne s'installe pas.
    // Voir l'en-tete du module.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const onMove = (event: PointerEvent): void => {
      const box = host.getBoundingClientRect()
      host.style.setProperty('--o-glow-x', `${String(event.clientX - box.left)}px`)
      host.style.setProperty('--o-glow-y', `${String(event.clientY - box.top)}px`)
      host.setAttribute('data-o-glow-on', '')
    }

    const onLeave = (): void => host.removeAttribute('data-o-glow-on')

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
          '--o-glow-radius': `${String(radius)}px`,
          '--o-glow-strength': String(strength),
          '--o-glow-from': from,
          '--o-glow-to': to,
        } as CSSProperties
      }
      data-o-glow=""
    >
      {children}
    </div>
  )
}
