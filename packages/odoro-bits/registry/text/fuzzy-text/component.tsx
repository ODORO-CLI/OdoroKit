/**
 * Flou vibrant : le texte reste hors de mise au point et tremble.
 *
 * ## Un etat, pas une transition
 *
 * `blur-reveal` part du flou et arrive au net : c'est une revelation, elle a
 * un debut et une fin. Ici le flou est l'apparence meme du texte — il ne se
 * resout jamais de lui-meme. Ce qui bouge est un tremblement de faible
 * amplitude et de haute frequence, qui empeche l'oeil de se poser.
 *
 * ## Le tremblement est discret, pas continu
 *
 * Une interpolation douce entre deux positions donne un glissement, pas une
 * vibration. La courbe est donc `steps(1)` : chaque etape tient sa position
 * puis saute a la suivante. C'est ce saut qui fait le grain nerveux, et il ne
 * coute rien de plus qu'une animation composee ordinaire.
 *
 * ## La doublure fabrique le flou, pas le filtre seul
 *
 * Un seul calque floute reste une forme lisse. Une copie decalee d'une phase
 * differente, posee par-dessus, produit des bords qui se battent : c'est ce
 * desaccord entre les deux calques qui donne l'impression de grain, bien plus
 * que le rayon de flou lui-meme.
 *
 * ## Le survol remet au point
 *
 * Le texte redevient net et s'immobilise tant que le pointeur est dessus : la
 * lecture reste possible a qui la demande. C'est aussi ce qui distingue cet
 * effet d'un texte simplement decoratif — il se laisse lire.
 *
 * ## Mouvement reduit
 *
 * Le tremblement s'arrete, le flou reste. Le flou est l'etat d'arrivee, pas
 * un etat de depart : le retirer changerait le composant, pas son animation.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ElementType, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface FuzzyTextOwnProps {
  /** Texte a rendre flou. Une chaine : la doublure en est une copie. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Rayon du flou, en pixels. @defaultValue 1.4 */
  blur?: number
  /** Amplitude du tremblement, en pixels. @defaultValue 1.6 */
  amplitude?: number
  /** Duree d'un cycle de tremblement, en millisecondes. @defaultValue 160 */
  period?: number
  /** Poser la copie dephasee qui fabrique le grain. @defaultValue true */
  doublure?: boolean
  /** Remettre au point tant que le pointeur est dessus. @defaultValue true */
  netAuSurvol?: boolean
}

/** Toutes les proprietes. */
export type FuzzyTextProps = Customisable<FuzzyTextOwnProps, 'span'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-fuzzy-text'

/** Duree de la remise au point au survol, en millisecondes. */
const MISE_AU_POINT_MS = 220

/** Pose les regles du flou vibrant, une fois par document. */
function ensureFuzzyRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-fuzzy]{position:relative;display:inline-block}',
    '[data-o-fuzzy-layer]{',
    'display:block;',
    'filter:blur(var(--o-fuzzy-blur));',
    'transition:filter var(--o-fuzzy-net-ms) ease-out;',
    // `translate` plutot que `transform` : la propriete independante laisse le
    // transform libre pour qui veut poser le sien par-dessus.
    'animation:o-fuzzy-shake var(--o-fuzzy-period) steps(1,end) infinite;',
    'animation-delay:var(--o-fuzzy-phase,0ms);',
    '}',
    '[data-o-fuzzy-ghost]{',
    'position:absolute;left:0;top:0;width:100%;',
    'pointer-events:none;opacity:0.62;',
    '}',
    '@keyframes o-fuzzy-shake{',
    '0%{translate:0 0}',
    '20%{translate:var(--o-fuzzy-amp) calc(var(--o-fuzzy-amp) * -0.7)}',
    '40%{translate:calc(var(--o-fuzzy-amp) * -0.8) calc(var(--o-fuzzy-amp) * 0.5)}',
    '60%{translate:calc(var(--o-fuzzy-amp) * 0.4) var(--o-fuzzy-amp)}',
    '80%{translate:calc(var(--o-fuzzy-amp) * -0.5) calc(var(--o-fuzzy-amp) * -0.4)}',
    '100%{translate:0 0}',
    '}',
    // Le survol remet au point et fige : la lecture reste possible.
    '[data-o-fuzzy-net]:hover [data-o-fuzzy-layer]{',
    'filter:blur(0px);animation-play-state:paused;',
    '}',
    '[data-o-fuzzy-net]:hover [data-o-fuzzy-ghost]{opacity:0}',
    // Sans mouvement, le flou reste : c'est l'apparence du texte, pas son
    // animation.
    '@media (prefers-reduced-motion:reduce){[data-o-fuzzy-layer]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Rend un texte flou et vibrant, net au survol.
 *
 * @example
 * <FuzzyText as="h1" className="o-text-6xl o-font-black">
 *   Hors champ
 * </FuzzyText>
 *
 * @example
 * // Tres flou, tres lent, sans doublure : une brume plutot qu'un grain.
 * <FuzzyText blur={4} period={520} doublure={false}>Brouillard</FuzzyText>
 */
export function FuzzyText({
  children,
  as: Tag = 'span',
  blur = 1.4,
  amplitude = 1.6,
  period = 160,
  doublure = true,
  netAuSurvol = true,
  ...rest
}: FuzzyTextProps): ReactElement {
  ensureFuzzyRule()

  const { className, style } = mergePresentation({}, rest)

  const styleRacine = {
    ...style,
    '--o-fuzzy-blur': `${String(blur)}px`,
    '--o-fuzzy-amp': `${String(amplitude)}px`,
    '--o-fuzzy-period': `${String(period)}ms`,
    '--o-fuzzy-net-ms': `${String(MISE_AU_POINT_MS)}ms`,
  } as CSSProperties

  return (
    <Tag
      {...rest}
      className={className}
      style={styleRacine}
      data-o-fuzzy=""
      {...(netAuSurvol ? { 'data-o-fuzzy-net': '' } : {})}
    >
      {/* Le texte veritable : un seul noeud, ni decoupe ni duplique pour
          l'arbre d'accessibilite. */}
      <span data-o-fuzzy-layer="">{children}</span>

      {doublure ? (
        <span
          aria-hidden
          data-o-fuzzy-layer=""
          data-o-fuzzy-ghost=""
          // Une demi-periode de retard : les deux calques ne sont jamais au
          // meme endroit, et c'est leur desaccord qui fait le grain.
          style={{ '--o-fuzzy-phase': `${String(-period / 2)}ms` } as CSSProperties}
        >
          {children}
        </span>
      ) : null}
    </Tag>
  )
}
