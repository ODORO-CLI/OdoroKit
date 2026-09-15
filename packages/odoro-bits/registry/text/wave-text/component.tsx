/**
 * Wave: each letter rises and falls, offset from the previous one.
 *
 * ## The offset makes the wave, not the movement
 *
 * Every letter plays the same animation; only their phase differs. The offset
 * is carried by `animation-delay`, negative so that the wave is already formed
 * on the first render — a positive delay would start the letters one by one,
 * which is another effect.
 *
 * Once the delays are set, nothing runs any more: the compositor animates on
 * its own as many transforms as there are letters, which stays within its
 * remit as long as the text is a heading and not a paragraph.
 *
 * ## The split is a display device
 *
 * The text is broken into as many elements as there are characters, which
 * would make it unreadable to a screen reader — it would spell it out. The
 * container therefore carries the complete text as an `aria-label`, and the
 * letters are hidden from the accessibility tree.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ElementType, type ReactElement } from 'react'

/** Properties specific to the component. */
export interface WaveTextOwnProps {
  /** Text to undulate. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Height of the wave, in pixels. @defaultValue 6 */
  amplitude?: number
  /** Duration of one full oscillation, in milliseconds. @defaultValue 1400 */
  speed?: number
}

/** All properties. */
export type WaveTextProps = Customisable<WaveTextOwnProps, 'span'>

/** No-break space: an ordinary space collapses inside an inline block. */
const NBSP = '\u00A0'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-wave-text'

/** Sets the oscillation, once per document. */
function ensureWaveRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // `ease-in-out` on both halves gives the back and forth of a sine wave,
    // without computing a single one of its values.
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
 * Undulates a text, letter by letter.
 *
 * @example
 * <WaveText as="h1" className="o-text-4xl o-font-bold">
 *   Hello
 * </WaveText>
 *
 * @example
 * // A slow and discreet swell.
 * <WaveText amplitude={3} speed={2400}>loading</WaveText>
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

  // Reduced motion: the text is rendered as it is, with no split. There is no
  // reason to impose one element per letter on whoever will not get the wave.
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
              // Negative delay: the wave is already in place on the first
              // render. A tenth of a period per letter gives a readable
              // undulation whatever the length of the word.
              '--o-wave-delay': `${String(-(index * speed) / 10)}ms`,
            } as CSSProperties
          }
        >
          {/* An ordinary space collapses inside an inline block: the no-break
              one keeps its width. */}
          {letter === ' ' ? NBSP : letter}
        </span>
      ))}
    </Tag>
  )
}
