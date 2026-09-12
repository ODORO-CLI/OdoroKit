/**
 * Etoiles de notation : cascade a l'arrivee, apercu au survol, fleches au
 * clavier.
 *
 * ## Une etoile est un bouton radio, pas un bouton
 *
 * Une note est un choix parmi n : c'est exactement ce que decrit un
 * `radiogroup`, et les lecteurs d'ecran annoncent « 3 sur 5, coche » sans
 * qu'on invente quoi que ce soit. Un rang de boutons obligerait a
 * reconstruire cette semantique a la main — etat coche, position, total —
 * et le clavier standard des radios (les fleches) viendrait en prime s'il
 * n'etait pas deja la.
 *
 * ## Le survol previsualise, le clic decide
 *
 * L'apercu est un etat local qui ne sort jamais du composant : les etoiles
 * s'allument sous le pointeur, mais `onValueChange` n'est appele qu'au
 * clic. Quitter sans cliquer rend la note affichee a sa valeur reelle —
 * previsualiser n'est pas choisir.
 *
 * ## La cascade est une arrivee, pas un etat
 *
 * Chaque etoile monte en echelle avec un retard proportionnel a son rang,
 * une seule fois, au montage. Sous mouvement reduit, elles sont simplement
 * la : la cascade est un plaisir, pas une information.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
} from 'react'

/** Proprietes propres au composant. */
export interface RatingStarsOwnProps {
  /** Nombre d'etoiles. @defaultValue 5 */
  count?: number
  /** Taille d'une etoile, en pixels. @defaultValue 24 */
  size?: number
  /** Note courante, en mode controle. Valeurs entieres. */
  value?: number
  /** Note au montage, en mode non controle. @defaultValue 0 */
  defaultValue?: number
  /** Appele quand la note change. */
  onValueChange?: (value: number) => void
  /** Nom du groupe pour les lecteurs d'ecran. @defaultValue 'Note' */
  label?: string
}

/** Toutes les proprietes. */
export type RatingStarsProps = Customisable<RatingStarsOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-rating-stars'

/** Pose la cascade et les etats de remplissage, une fois par document. */
function ensureRatingRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-rating]{display:inline-flex}',
    '[data-o-rating] [role="radio"]{',
    'display:inline-flex;padding:2px;cursor:pointer;',
    'background:none;border:0;color:inherit;',
    'animation:o-rating-pop var(--o-duration-base) var(--o-ease-emphasized) both;',
    'animation-delay:calc(var(--o-rating-i) * 60ms);',
    '}',
    '[data-o-rating] svg{',
    'width:var(--o-rating-size);height:var(--o-rating-size);',
    'fill:transparent;stroke:currentColor;stroke-width:1.5;opacity:0.5;',
    'transition:fill var(--o-duration-base) linear,',
    'opacity var(--o-duration-base) linear,',
    'transform var(--o-duration-base) var(--o-ease-emphasized);',
    '}',
    '[data-o-rating] [data-o-rating-lit="true"] svg{',
    'fill:var(--o-rating-tint);stroke:var(--o-rating-tint);opacity:1;',
    'transform:scale(1.08);',
    '}',
    '@keyframes o-rating-pop{',
    'from{opacity:0;transform:scale(0.4)}',
    'to{opacity:1;transform:scale(1)}',
    '}',
    // Mouvement reduit : pas de cascade, les etoiles sont simplement la.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-rating] [role="radio"]{animation:none}',
    '[data-o-rating] svg{transition:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Groupe d'etoiles accessible : une etoile est un bouton radio.
 *
 * @example
 * <RatingStars defaultValue={3} />
 *
 * @example
 * // Mode controle, sur dix, en plus grand.
 * <RatingStars count={10} size={32} value={note} onValueChange={setNote} />
 */
export function RatingStars({
  count = 5,
  size = 24,
  value,
  defaultValue = 0,
  onValueChange,
  label = 'Note',
  ...rest
}: RatingStarsProps): ReactElement {
  const { reduced } = useMotionState()
  const [internal, setInternal] = useState(defaultValue)
  const [preview, setPreview] = useState<number | null>(null)
  ensureRatingRules()

  const current = Math.round(value ?? internal)
  const shown = preview ?? current

  const select = (next: number): void => {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const moves: Readonly<Record<string, number | undefined>> = {
      ArrowRight: Math.min(count, current + 1),
      ArrowUp: Math.min(count, current + 1),
      ArrowLeft: Math.max(1, current - 1),
      ArrowDown: Math.max(1, current - 1),
      Home: 1,
      End: count,
    }

    const next = moves[event.key]
    if (next === undefined) return
    event.preventDefault()
    select(next)
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      onMouseLeave={() => {
        setPreview(null)
      }}
      data-o-rating=""
      className={className}
      style={
        {
          ...style,
          '--o-rating-size': `${String(size)}px`,
          '--o-rating-tint': 'var(--o-palette-amber-400)',
          ...(reduced ? { '--o-duration-base': '0ms' } : {}),
        } as CSSProperties
      }
    >
      {Array.from({ length: count }, (_, index) => {
        const star = index + 1
        const checked = star === current
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={`${String(star)} sur ${String(count)}`}
            tabIndex={checked || (current === 0 && star === 1) ? 0 : -1}
            data-o-rating-lit={star <= shown}
            style={{ '--o-rating-i': String(index) } as CSSProperties}
            onClick={() => {
              select(star)
            }}
            onMouseEnter={() => {
              setPreview(star)
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinejoin="round"
                d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"
              />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
