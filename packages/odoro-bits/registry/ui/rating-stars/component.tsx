/**
 * Rating stars: cascade on arrival, preview on hover, arrow keys on the
 * keyboard.
 *
 * ## A star is a radio button, not a button
 *
 * A rating is a choice among n: that is exactly what a `radiogroup`
 * describes, and screen readers announce "3 of 5, checked" without us
 * inventing anything. A row of buttons would force us to rebuild that
 * semantics by hand — checked state, position, total — and the standard
 * radio keyboard handling (the arrows) would come as a bonus if it were
 * not already there.
 *
 * ## Hover previews, the click decides
 *
 * The preview is a local state that never leaves the component: the stars
 * light up under the pointer, but `onValueChange` is only called on
 * click. Leaving without clicking returns the displayed rating to its real
 * value — previewing is not choosing.
 *
 * ## The cascade is an arrival, not a state
 *
 * Each star scales up with a delay proportional to its rank, once only, on
 * mount. Under reduced motion, they are simply there: the cascade is a
 * pleasure, not information.
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

/** Properties specific to the component. */
export interface RatingStarsOwnProps {
  /** Number of stars. @defaultValue 5 */
  count?: number
  /** Size of one star, in pixels. @defaultValue 24 */
  size?: number
  /** Current rating, in controlled mode. Integer values. */
  value?: number
  /** Rating on mount, in uncontrolled mode. @defaultValue 0 */
  defaultValue?: number
  /** Called when the rating changes. */
  onValueChange?: (value: number) => void
  /** Group name for screen readers. @defaultValue 'Rating' */
  label?: string
}

/** All properties. */
export type RatingStarsProps = Customisable<RatingStarsOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-rating-stars'

/** Applies the cascade and the fill states, once per document. */
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
    // Reduced motion: no cascade, the stars are simply there.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-rating] [role="radio"]{animation:none}',
    '[data-o-rating] svg{transition:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Accessible star group: a star is a radio button.
 *
 * @example
 * <RatingStars defaultValue={3} />
 *
 * @example
 * // Controlled mode, out of ten, larger.
 * <RatingStars count={10} size={32} value={rating} onValueChange={setRating} />
 */
export function RatingStars({
  count = 5,
  size = 24,
  value,
  defaultValue = 0,
  onValueChange,
  label = 'Rating',
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
            aria-label={`${String(star)} of ${String(count)}`}
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
