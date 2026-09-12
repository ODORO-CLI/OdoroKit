/**
 * Bouton a maree : le fond monte derriere le libelle au survol.
 *
 * ## Le calque deborde volontairement
 *
 * Le calque colore mesure cent dix pour cent de la hauteur du bouton, et la
 * courbe d'arrivee depasse legerement sa cible avant de s'y poser. Sans ce
 * surplus de matiere, le rebond decouvrirait une bande de fond nu au sommet
 * du bouton — un artefact d'une frame, mais visible a chaque survol.
 *
 * ## Le libelle change de couleur au croisement
 *
 * Le texte passe de la couleur courante a celle prevue pour le calque, avec
 * une transition plus courte que la montee et un leger retard : il bascule
 * au moment ou la vague le traverse, pas avant. Deux couches de texte en
 * `mix-blend-mode` feraient plus spectaculaire, mais le rendu depend alors
 * du fond de la page — une transition de couleur est previsible partout.
 *
 * ## Sous mouvement reduit, la maree devient un fondu
 *
 * L'information — le bouton repond au survol — reste ; seul le deplacement
 * disparait. Le calque ne bouge plus, il apparait.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Proprietes propres au composant. */
export interface LiquidButtonOwnProps {
  /** Libelle du bouton. */
  children: ReactNode
  /** Duree de la montee du calque, en millisecondes. @defaultValue 450 */
  duration?: number
  /** Sens d'arrivee du calque colore. @defaultValue 'up' */
  direction?: 'up' | 'left'
}

/** Toutes les proprietes. */
export type LiquidButtonProps = Customisable<LiquidButtonOwnProps, 'button'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-liquid-button'

/** Pose les regles du bouton, une fois par document. */
function ensureLiquidRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-liquid]{',
    'position:relative;overflow:hidden;isolation:isolate;cursor:pointer;',
    'border:1px solid color-mix(in oklch,currentColor 25%,transparent);',
    'background:transparent;color:inherit;font:inherit;',
    '}',

    // Le calque : plus grand que le bouton, gare hors champ.
    '[data-o-liquid]::before{',
    'content:"";position:absolute;inset:-5%;z-index:-1;',
    'background:var(--o-liquid-fill);',
    'transform:var(--o-liquid-rest);',
    // La courbe depasse sa cible puis s y pose : c est le rebond elastique.
    'transition:transform var(--o-liquid-duration) cubic-bezier(0.32,1.35,0.4,1);',
    '}',
    '[data-o-liquid][data-o-liquid-dir="up"]{--o-liquid-rest:translateY(103%)}',
    '[data-o-liquid][data-o-liquid-dir="left"]{--o-liquid-rest:translateX(103%)}',
    '[data-o-liquid]:is(:hover,:focus-visible)::before{transform:translate(0,0)}',

    // Le libelle bascule de couleur quand la vague le traverse.
    '[data-o-liquid]>span{',
    'position:relative;z-index:1;display:inline-block;',
    'transition:color calc(var(--o-liquid-duration) / 2) linear;',
    'transition-delay:calc(var(--o-liquid-duration) / 4);',
    '}',
    '[data-o-liquid]:is(:hover,:focus-visible)>span{color:var(--o-liquid-ink)}',

    // Mouvement reduit : le calque ne monte plus, il apparait.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-liquid]::before{transform:translate(0,0);opacity:0;',
    'transition:opacity 200ms linear}',
    '[data-o-liquid]:is(:hover,:focus-visible)::before{opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Bouton dont le fond monte au survol, comme une maree.
 *
 * @example
 * <LiquidButton onClick={envoyer}>Envoyer</LiquidButton>
 *
 * @example
 * // Le calque arrive par la droite, plus lentement.
 * <LiquidButton direction="left" duration={700}>Nous suivre</LiquidButton>
 */
export function LiquidButton({
  children,
  duration = 450,
  direction = 'up',
  ...rest
}: LiquidButtonProps): ReactElement {
  const { reduced } = useMotionState()
  ensureLiquidRules()

  const { className, style } = mergePresentation(
    { className: 'o-rounded-full o-px-6 o-py-3 o-font-medium' },
    rest,
  )

  return (
    <button
      type="button"
      {...rest}
      data-o-liquid=""
      data-o-liquid-dir={direction}
      className={className}
      style={
        {
          ...style,
          '--o-liquid-duration': `${String(reduced ? 0 : duration)}ms`,
          '--o-liquid-fill': 'var(--o-palette-brand-500)',
          '--o-liquid-ink': 'var(--o-palette-zinc-50)',
        } as CSSProperties
      }
    >
      <span>{children}</span>
    </button>
  )
}
