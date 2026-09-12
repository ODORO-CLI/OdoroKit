/**
 * Barres de signal : les barres s'allument l'une apres l'autre, de la plus
 * courte a la plus haute, puis s'eteignent dans le meme ordre.
 *
 * ## Une seule animation, decalee dans le temps
 *
 * Les barres font toutes la meme chose : monter et s'eclaircir, tenir,
 * retomber. Ce qui les distingue n'est pas leur animation mais l'instant ou
 * elle commence. Une seule regle, donc, et un retard par barre — la vague
 * nait du decalage, pas d'images cles recopiees quatre fois. Changer le
 * nombre de barres ne demande alors aucune modification de la feuille.
 *
 * Le retard est une fraction de la duree du cycle, jamais une valeur en
 * millisecondes : la sequence garde ses proportions a toutes les vitesses.
 *
 * Chaque barre monte depuis sa base — son origine de transformation est en
 * bas — parce qu'une barre de signal est plantee sur une ligne, comme une
 * antenne. Une croissance depuis le centre donnerait un histogramme
 * flottant.
 *
 * L'etat eteint n'est pas l'absence : la barre reste visible, courte et
 * attenuee. C'est ce qui fait lire une echelle qui se remplit plutot que
 * des barres qui apparaissent de nulle part.
 *
 * Une seule animation CSS par barre, tenue par le compositeur, aucun
 * JavaScript apres le premier rendu.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Les barres sont
 * retirees de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, toutes les barres sont a leur pleine hauteur : le
 * signal est au complet, l'echelle se lit encore.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-signal-bars'

/** Part du cycle qui separe deux barres. */
const STAGGER = 0.11

/** Hauteur de la plus courte, en part de la plus haute. */
const SHORTEST = 0.38

/** Pose les barres et leur sequence, une fois par document. */
function ensureSignalRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-signal-bars]{display:inline-flex;align-items:flex-end;line-height:0}',
    '[data-o-signal-bar]{',
    'display:block;background:currentColor;border-radius:2px;',
    'transform-origin:bottom;transform:scaleY(0.55);opacity:0.24;',
    'animation:o-signal-bars-lit var(--o-signal-speed) ease-in-out infinite;',
    '}',
    // Montee franche, palier, retour : le palier est ce qui donne a la
    // sequence le temps d'etre lue comme une sequence.
    '@keyframes o-signal-bars-lit{',
    '0%{transform:scaleY(0.55);opacity:0.24}',
    '16%,62%{transform:scaleY(1);opacity:1}',
    '80%,100%{transform:scaleY(0.55);opacity:0.24}',
    '}',
    // Toutes les barres pleines : le signal au complet, immobile.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-signal-bar]{animation:none;transform:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface SignalBarsOwnProps {
  /** Hauteur de la barre la plus haute, en pixels. @defaultValue 32 */
  size?: number
  /** Nombre de barres. @defaultValue 4 */
  count?: number
  /** Duree d'un cycle complet, en millisecondes. @defaultValue 1400 */
  speed?: number
  /** Couleur des barres. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type SignalBarsProps = Customisable<SignalBarsOwnProps, 'span'>

/**
 * Signale une attente par des barres de signal qui montent en sequence.
 *
 * @example
 * <SignalBars />
 *
 * @example
 * // Cinq barres, plus hautes et plus lentes, dans la teinte de marque.
 * <SignalBars count={5} size={48} speed={2000} color="var(--o-palette-brand-500)" />
 */
export function SignalBars({
  size = 32,
  count = 4,
  speed = 1400,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: SignalBarsProps): ReactElement {
  ensureSignalRule()

  const { className, style } = mergePresentation({}, rest)

  // Deux barres au moins : en dessous, il n'y a plus d'echelle, donc plus
  // rien a lire dans la sequence.
  const bars = Math.max(2, Math.round(count))
  const width = Math.max(2, size * 0.2)
  const gap = Math.max(2, size * 0.12)

  const loaderStyle = {
    ...style,
    gap: `${String(gap)}px`,
    color,
    '--o-signal-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-signal-bars=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: bars }, (_, index) => (
        <span
          key={index}
          data-o-signal-bar=""
          aria-hidden
          style={{
            width: `${String(width)}px`,
            // Les hauteurs s'echelonnent regulierement de la plus courte a
            // la plus haute : c'est cette progression qui fait l'echelle.
            height: `${String(size * (SHORTEST + ((1 - SHORTEST) * index) / (bars - 1)))}px`,
            animationDelay: `${String(Math.round(speed * STAGGER * index))}ms`,
          }}
        />
      ))}
    </span>
  )
}
