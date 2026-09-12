/**
 * Projecteur : le texte n'apparait en pleine couleur que sous un halo qui
 * suit le pointeur.
 *
 * ## Des variables CSS, pas des rendus React
 *
 * Le halo bouge a chaque mouvement du pointeur — en passer la position par un
 * etat React declencherait un rendu par evenement, pour deplacer un degrade
 * que React ne dessine meme pas. La position est donc ecrite directement dans
 * deux variables CSS, et le masque `radial-gradient` la lit tout seul.
 *
 * Le noir et le transparent du masque ne sont pas des couleurs : un masque ne
 * lit que l'alpha. Le texte, lui, reste en `currentColor`.
 *
 * ## Le texte reste lisible, toujours
 *
 * Hors survol, le texte de base garde un remplissage attenue mais present —
 * un titre qui disparait completement hors du halo est un jeu, pas un titre.
 * Sur les ecrans sans pointeur fin, la regle attenuee ne s'applique jamais :
 * le texte est simplement plein, et l'effet n'existe pas. Meme chose sous
 * mouvement reduit.
 *
 * Le calque plein est une copie `aria-hidden` : pour un lecteur d'ecran, il
 * n'y a qu'un texte.
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
export interface SpotlightTextOwnProps {
  /** Texte a eclairer. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Rayon du halo, en pixels. @defaultValue 120 */
  radius?: number
  /** Opacite du texte hors du halo, de 0 a 1. @defaultValue 0.25 */
  rest?: number
}

/** Toutes les proprietes. */
export type SpotlightTextProps = Customisable<SpotlightTextOwnProps, 'span'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-spotlight-text'

/**
 * Pose les regles du projecteur, une fois par document.
 *
 * Tout ce qui attenue ou masque vit sous la requete de media : un ecran
 * tactile ne verra jamais un texte a moitie efface qu'aucun pointeur ne peut
 * reveler.
 */
function ensureSpotlightRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-spot]{position:relative;display:inline-block}',
    '[data-o-spot-full]{',
    'position:absolute;inset:0;opacity:0;pointer-events:none;user-select:none;',
    '}',
    '@media (hover:hover) and (pointer:fine){',
    '[data-o-spot] [data-o-spot-dim]{opacity:var(--o-spot-rest);transition:opacity 200ms ease}',
    '[data-o-spot-full]{',
    'transition:opacity 200ms ease;',
    '-webkit-mask-image:radial-gradient(circle var(--o-spot-r) at var(--o-spot-x) var(--o-spot-y),black 40%,transparent 100%);',
    'mask-image:radial-gradient(circle var(--o-spot-r) at var(--o-spot-x) var(--o-spot-y),black 40%,transparent 100%);',
    '}',
    '[data-o-spot-on] [data-o-spot-full]{opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Revele un texte massif sous un halo qui suit le pointeur.
 *
 * @example
 * <SpotlightText as="h1" className="o-text-5xl o-font-extrabold">
 *   Cherchez bien
 * </SpotlightText>
 *
 * @example
 * // Halo large, texte presque efface au repos.
 * <SpotlightText radius={220} rest={0.1}>Dans le noir</SpotlightText>
 */
export function SpotlightText({
  children,
  as: Tag = 'span',
  radius = 120,
  rest = 0.25,
  ...restProps
}: SpotlightTextProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLElement | null>(null)
  ensureSpotlightRule()

  useEffect(() => {
    const element = host.current
    if (element === null || reduced) return

    const onMove = (event: PointerEvent): void => {
      const bounds = element.getBoundingClientRect()
      element.style.setProperty('--o-spot-x', `${String(event.clientX - bounds.left)}px`)
      element.style.setProperty('--o-spot-y', `${String(event.clientY - bounds.top)}px`)
    }
    const onEnter = (): void => {
      element.setAttribute('data-o-spot-on', '')
    }
    const onLeave = (): void => {
      element.removeAttribute('data-o-spot-on')
    }

    element.addEventListener('pointermove', onMove, { passive: true })
    element.addEventListener('pointerenter', onEnter)
    element.addEventListener('pointerleave', onLeave)
    return () => {
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerenter', onEnter)
      element.removeEventListener('pointerleave', onLeave)
      element.removeAttribute('data-o-spot-on')
    }
  }, [reduced])

  const { className, style } = mergePresentation({}, restProps)

  // Mouvement reduit : le texte est plein, sans calque ni ecoute du pointeur.
  if (reduced) {
    return (
      <Tag {...restProps} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const spotStyle = {
    ...style,
    '--o-spot-r': `${String(radius)}px`,
    '--o-spot-rest': String(rest),
    '--o-spot-x': '50%',
    '--o-spot-y': '50%',
  } as CSSProperties

  return (
    <Tag {...restProps} ref={host} className={className} style={spotStyle} data-o-spot="">
      <span data-o-spot-dim="">{children}</span>
      {/* La copie pleine, sous le masque. Cachee aux lecteurs d'ecran. */}
      <span aria-hidden data-o-spot-full="">
        {children}
      </span>
    </Tag>
  )
}
