/**
 * Vague : chaque lettre monte et descend, decalee de la precedente.
 *
 * ## Le decalage fait la vague, pas le mouvement
 *
 * Toutes les lettres jouent la meme animation ; seule leur phase differe. Le
 * decalage est porte par `animation-delay`, negatif pour que la vague soit
 * deja formee au premier rendu — un delai positif ferait partir les lettres
 * une a une, ce qui est un autre effet.
 *
 * Une fois les delais poses, plus rien ne s'execute : le compositeur anime
 * seul autant de transformations qu'il y a de lettres, ce qui reste dans son
 * registre tant que le texte est un titre et pas un paragraphe.
 *
 * ## Le decoupage est un artifice d'affichage
 *
 * Le texte est eclate en autant d'elements que de caracteres, ce qui le
 * rendrait illisible a un lecteur d'ecran — il epellerait. Le conteneur porte
 * donc le texte complet en `aria-label`, et les lettres sont cachees a
 * l'arbre d'accessibilite.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ElementType, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface WaveTextOwnProps {
  /** Texte a faire onduler. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Hauteur de la vague, en pixels. @defaultValue 6 */
  amplitude?: number
  /** Duree d'une oscillation complete, en millisecondes. @defaultValue 1400 */
  speed?: number
}

/** Toutes les proprietes. */
export type WaveTextProps = Customisable<WaveTextOwnProps, 'span'>

/** Espace insecable : une espace ordinaire s'ecrase dans un bloc en ligne. */
const NBSP = '\u00A0'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-wave-text'

/** Pose l'oscillation, une fois par document. */
function ensureWaveRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // `ease-in-out` sur les deux moities donne le va-et-vient d'une sinusoide,
    // sans en calculer une seule valeur.
    '@keyframes o-wave{',
    '0%,100%{transform:translateY(0)}',
    '50%{transform:translateY(calc(var(--o-wave-amp) * -1))}',
    '}',
    '[data-o-wave-letter]{',
    'display:inline-block;',
    'animation:o-wave var(--o-wave-speed) ease-in-out infinite;',
    'animation-delay:var(--o-wave-delay);',
    '}',
    '@media (prefers-reduced-motion:reduce){[data-o-wave-letter]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Fait onduler un texte, lettre a lettre.
 *
 * @example
 * <WaveText as="h1" className="o-text-4xl o-font-bold">
 *   Bonjour
 * </WaveText>
 *
 * @example
 * // Une houle lente et discrete.
 * <WaveText amplitude={3} speed={2400}>chargement</WaveText>
 */
export function WaveText({
  children,
  as: Tag = 'span',
  amplitude = 6,
  speed = 1400,
  ...rest
}: WaveTextProps): ReactElement {
  const { reduced } = useMotionState()
  ensureWaveRule()

  const { className, style } = mergePresentation({}, rest)

  // Mouvement reduit : le texte est rendu tel quel, sans decoupage. Il n'y a
  // aucune raison d'imposer un element par lettre a qui n'aura pas la vague.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const letters = [...children]

  const waveStyle = {
    ...style,
    '--o-wave-amp': `${String(amplitude)}px`,
    '--o-wave-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <Tag
      {...rest}
      className={className}
      style={waveStyle}
      role="text"
      aria-label={children}
    >
      {letters.map((letter, index) => (
        <span
          key={`${letter}-${String(index)}`}
          aria-hidden
          data-o-wave-letter=""
          style={
            {
              // Delai negatif : la vague est deja en place au premier rendu.
              // Un dixieme de periode par lettre donne une ondulation lisible
              // quelle que soit la longueur du mot.
              '--o-wave-delay': `${String(-(index * speed) / 10)}ms`,
            } as CSSProperties
          }
        >
          {/* Une espace ordinaire s'ecrase dans un bloc en ligne :
              l'insecable garde sa largeur. */}
          {letter === ' ' ? NBSP : letter}
        </span>
      ))}
    </Tag>
  )
}
