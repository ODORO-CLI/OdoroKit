/**
 * Lettres qui sautent : chaque lettre s'ecrase, saute et retombe a son tour,
 * de gauche a droite, puis le mot entier se pose avant le saut suivant.
 *
 * ## Un saut, pas une vague
 *
 * Une vague fait monter et descendre les lettres sur une sinusoide, sans
 * arret : c'est un titre qui ondule. Un saut a une preparation, un apogee et
 * un atterrissage. Ici chaque lettre s'ecrase d'abord sur sa ligne de base,
 * part, s'etire au sommet, puis retombe en s'aplatissant. C'est la sequence
 * qui rend le mouvement lisible comme un rebond, et non comme un flottement.
 *
 * Le saut n'occupe qu'un tiers du cycle de chaque lettre ; le reste est une
 * pose. Les lettres sont decalees d'un petit pas, en delais negatifs, et
 * l'ensemble tient dans les deux premiers tiers du cycle : le mot entier est
 * donc immobile un moment avant que la premiere lettre ne reparte. Sans
 * cette respiration, une suite de sauts en continu se lirait de nouveau
 * comme une vague.
 *
 * Le pas s'adapte a la longueur du texte : un mot long ne deborde pas de
 * sa fenetre, il resserre les sauts.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran.
 * Les lettres, decoupees dans des elements separes, sont retirees de l'arbre
 * d'accessibilite : un lecteur d'ecran les epellerait.
 *
 * Sous mouvement reduit, le mot reste pose sur sa ligne : il se lit encore
 * comme une attente, seul le saut s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-letters-bounce'

/** Part du cycle occupee par la sequence des sauts, la pause etant le reste. */
const SEQUENCE_SHARE = 0.62

/** Pas maximal entre deux lettres, en part du cycle. */
const MAX_STEP_SHARE = 0.07

/** Pose les lettres et leur saut, une fois par document. */
function ensureLettersBounceRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-lb]{',
    'display:inline-block;white-space:nowrap;font-weight:600;',
    'font-size:var(--o-lb-size);color:var(--o-lb-color);',
    '}',
    '[data-o-lb-letter]{',
    'display:inline-block;transform-origin:50% 100%;',
    'animation:o-lb-jump var(--o-lb-speed) ease-in-out infinite;',
    'animation-delay:var(--o-lb-delay);',
    '}',
    // Ecrasement, envol, etirement au sommet, atterrissage : le saut tient
    // dans le premier tiers, la lettre se pose pour le reste.
    '@keyframes o-lb-jump{',
    '0%,34%,100%{transform:translateY(0) scale(1,1)}',
    '6%{transform:translateY(0) scale(1.15,0.8)}',
    '18%{transform:translateY(-0.5em) scale(0.94,1.08)}',
    '28%{transform:translateY(0) scale(1.08,0.9)}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-lb-letter]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface LettersBounceOwnProps {
  /** Le texte affiche, lettre par lettre. @defaultValue 'Chargement' */
  text?: string
  /** Corps du texte, en pixels. @defaultValue 18 */
  size?: number
  /** Duree d'un cycle, la pause comprise, en millisecondes. @defaultValue 2000 */
  speed?: number
  /** Couleur du texte. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type LettersBounceProps = Customisable<LettersBounceOwnProps, 'span'>

/**
 * Signale une attente par un mot dont les lettres sautent a tour de role.
 *
 * @example
 * <LettersBounce />
 *
 * @example
 * // Un autre mot, plus vif, dans la teinte de marque.
 * <LettersBounce text="Envoi" speed={1400} color="var(--o-palette-brand-500)" />
 */
export function LettersBounce({
  text = 'Chargement',
  size = 18,
  speed = 2000,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: LettersBounceProps): ReactElement {
  ensureLettersBounceRule()

  const { className, style } = mergePresentation({}, rest)
  const letters = Array.from(text)

  // Le pas se resserre quand le mot s'allonge, pour que la sequence entiere
  // tienne dans sa part du cycle et laisse la pause intacte.
  const stepShare = Math.min(MAX_STEP_SHARE, SEQUENCE_SHARE / Math.max(1, letters.length))

  const loaderStyle = {
    ...style,
    '--o-lb-size': `${String(size)}px`,
    '--o-lb-speed': `${String(speed)}ms`,
    '--o-lb-color': color,
  } as CSSProperties

  return (
    <span {...rest} className={className} style={loaderStyle} data-o-lb="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden>
        {letters.map((letter, index) => (
          <span
            key={index}
            data-o-lb-letter=""
            style={
              {
                // Negatif, pour que le canon soit en place des la premiere
                // image : une lettre est d'autant plus en retard sur la
                // premiere qu'elle en est loin.
                '--o-lb-delay': `${String(Math.round(index * stepShare * speed - speed))}ms`,
              } as CSSProperties
            }
          >
            {/* Une espace insecable : une espace ordinaire dans un bloc en ligne s'effondrerait. */}
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        ))}
      </span>
    </span>
  )
}
