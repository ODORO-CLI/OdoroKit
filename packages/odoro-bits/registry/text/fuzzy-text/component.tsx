/**
 * Vibrating blur: the text stays out of focus and shivers.
 *
 * ## A state, not a transition
 *
 * `blur-reveal` starts blurred and arrives crisp: it is a reveal, it has a
 * beginning and an end. Here the blur is the very appearance of the text — it
 * never resolves on its own. What moves is a shiver of low amplitude and high
 * frequency, which stops the eye from settling.
 *
 * ## The shiver is discrete, not continuous
 *
 * A smooth interpolation between two positions gives a slide, not a vibration.
 * The curve is therefore `steps(1)`: each stage holds its position then jumps
 * to the next. It is that jump that makes the nervous grain, and it costs
 * nothing more than an ordinary composited animation.
 *
 * ## The understudy makes the blur, not the filter alone
 *
 * A single blurred layer stays a smooth shape. A copy offset by a different
 * phase, laid over it, produces edges that fight each other: it is that
 * disagreement between the two layers that gives the impression of grain, far
 * more than the blur radius itself.
 *
 * ## Hovering brings it back into focus
 *
 * The text becomes crisp again and comes to a stop while the pointer is over
 * it: reading stays possible for whoever asks for it. It is also what sets
 * this effect apart from a merely decorative text — it lets itself be read.
 *
 * ## Reduced motion
 *
 * The shiver stops, the blur stays. The blur is the arrival state, not a
 * starting one: removing it would change the component, not its animation.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ElementType, type ReactElement } from 'react'

/** Properties specific to the component. */
export interface FuzzyTextOwnProps {
  /** Text to blur. A string: the understudy is a copy of it. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Blur radius, in pixels. @defaultValue 1.4 */
  blur?: number
  /** Amplitude of the shiver, in pixels. @defaultValue 1.6 */
  amplitude?: number
  /** Duration of one shiver cycle, in milliseconds. @defaultValue 160 */
  period?: number
  /** Lay down the phase-shifted copy that makes the grain. @defaultValue true */
  ghost?: boolean
  /** Bring back into focus while the pointer is over it. @defaultValue true */
  sharpOnHover?: boolean
}

/** All properties. */
export type FuzzyTextProps = Customisable<FuzzyTextOwnProps, 'span'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-fuzzy-text'

/** Duration of the refocusing on hover, in milliseconds. */
const FOCUS_MS = 220

/** Sets the vibrating blur rules, once per document. */
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
    'transition:filter var(--o-fuzzy-sharp-ms) ease-out;',
    // `translate` rather than `transform`: the independent property leaves the
    // transform free for anyone who wants to set their own on top.
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
    // The hover refocuses and freezes: reading stays possible.
    '[data-o-fuzzy-sharp]:hover [data-o-fuzzy-layer]{',
    'filter:blur(0px);animation-play-state:paused;',
    '}',
    '[data-o-fuzzy-sharp]:hover [data-o-fuzzy-ghost]{opacity:0}',
    // With no motion, the blur stays: it is the appearance of the text, not
    // its animation.
    '@media (prefers-reduced-motion:reduce){[data-o-fuzzy-layer]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Renders a text blurred and vibrating, crisp on hover.
 *
 * @example
 * <FuzzyText as="h1" className="o-text-6xl o-font-black">
 *   Out of focus
 * </FuzzyText>
 *
 * @example
 * // Very blurred, very slow, with no understudy: a mist rather than a grain.
 * <FuzzyText blur={4} period={520} ghost={false}>Fog</FuzzyText>
 */
export function FuzzyText({
  children,
  as: Tag = 'span',
  blur = 1.4,
  amplitude = 1.6,
  period = 160,
  ghost = true,
  sharpOnHover = true,
  ...rest
}: FuzzyTextProps): ReactElement {
  ensureFuzzyRule()

  const { className, style } = mergePresentation({}, rest)

  const rootStyle = {
    ...style,
    '--o-fuzzy-blur': `${String(blur)}px`,
    '--o-fuzzy-amp': `${String(amplitude)}px`,
    '--o-fuzzy-period': `${String(period)}ms`,
    '--o-fuzzy-sharp-ms': `${String(FOCUS_MS)}ms`,
  } as CSSProperties

  return (
    <Tag
      {...rest}
      className={className}
      style={rootStyle}
      data-o-fuzzy=""
      {...(sharpOnHover ? { 'data-o-fuzzy-sharp': '' } : {})}
    >
      {/* The real text: a single node, neither split nor duplicated for the
          accessibility tree. */}
      <span data-o-fuzzy-layer="">{children}</span>

      {ghost ? (
        <span
          aria-hidden
          data-o-fuzzy-layer=""
          data-o-fuzzy-ghost=""
          // Half a period of delay: the two layers are never in the same
          // place, and it is their disagreement that makes the grain.
          style={{ '--o-fuzzy-phase': `${String(-period / 2)}ms` } as CSSProperties}
        >
          {children}
        </span>
      ) : null}
    </Tag>
  )
}
