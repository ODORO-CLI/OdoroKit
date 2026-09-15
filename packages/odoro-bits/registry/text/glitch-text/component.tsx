/**
 * Glitch: a text crossed by bursts of clipping and aberration.
 *
 * ## Bursts, not a continuous shiver
 *
 * A permanent glitch tires the eye and loses its meaning: what breaks all the
 * time is no longer a break, it is a texture. The effect therefore lives in
 * short bursts, spaced by a slightly irregular interval — a timer, not the
 * loop: between two bursts nothing happens, and a loop running to do nothing
 * would be exactly what the engine forbids.
 *
 * ## Two copies, an intact original
 *
 * The original stays in place, crisp. Two copies laid over it each carry an
 * offset and a coloured shadow — red on one side, cyan on the other, like the
 * channels of a badly synchronised signal — and an animated `clip-path` that
 * shows only changing slices of them. The copies are `aria-hidden`: for a
 * screen reader, there is only one text, never three.
 *
 * Under reduced motion, the copies are not rendered at all: the text is simply
 * there.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from 'react'

/** Properties specific to the component. */
export interface GlitchTextOwnProps {
  /** Text to break. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Amplitude of the offset of the copies, in pixels. @defaultValue 3 */
  intensity?: number
  /**
   * Average time between two bursts, in milliseconds. The real interval varies
   * around this value, so that the breaking does not become a metronome.
   *
   * @defaultValue 2600
   */
  interval?: number
  /** Colour of the first channel. @defaultValue red from the palette */
  channelA?: string
  /** Colour of the second channel. @defaultValue cyan from the palette */
  channelB?: string
}

/** All properties. */
export type GlitchTextProps = Customisable<GlitchTextOwnProps, 'span'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-glitch-text'

/** Duration of one burst, in milliseconds. */
const BURST_MS = 380

/**
 * Sets the glitch rules, once per document.
 *
 * The copies only exist visually during a burst: at rest they are at zero
 * opacity, and the compositor has nothing to paint.
 */
function ensureGlitchRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-glitch]{position:relative;display:inline-block}',
    '[data-o-glitch-copy]{',
    'position:absolute;inset:0;opacity:0;pointer-events:none;user-select:none;',
    '}',
    // The slices shown by the clip-path change in steps: a glitch that slides
    // smoothly is not a glitch, it is a curtain.
    '@keyframes o-glitch-a{',
    '0%{clip-path:inset(12% 0 61% 0)}25%{clip-path:inset(48% 0 20% 0)}',
    '50%{clip-path:inset(80% 0 4% 0)}75%{clip-path:inset(4% 0 78% 0)}',
    '100%{clip-path:inset(38% 0 42% 0)}',
    '}',
    '@keyframes o-glitch-b{',
    '0%{clip-path:inset(68% 0 8% 0)}25%{clip-path:inset(8% 0 72% 0)}',
    '50%{clip-path:inset(32% 0 48% 0)}75%{clip-path:inset(58% 0 16% 0)}',
    '100%{clip-path:inset(16% 0 60% 0)}',
    '}',
    '[data-o-glitch-on] [data-o-glitch-copy="a"]{',
    'opacity:1;',
    'transform:translate(calc(var(--o-glitch-shift) * -1),0);',
    'text-shadow:calc(var(--o-glitch-shift) * -0.6) 0 var(--o-glitch-a);',
    `animation:o-glitch-a ${String(BURST_MS)}ms steps(5,jump-none) both;`,
    '}',
    '[data-o-glitch-on] [data-o-glitch-copy="b"]{',
    'opacity:1;',
    'transform:translate(var(--o-glitch-shift),0);',
    'text-shadow:calc(var(--o-glitch-shift) * 0.6) 0 var(--o-glitch-b);',
    `animation:o-glitch-b ${String(BURST_MS)}ms steps(5,jump-none) both;`,
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Breaks a text in bursts, between which it stays perfectly crisp.
 *
 * @example
 * <GlitchText as="h1" className="o-text-5xl o-font-extrabold">
 *   SIGNAL LOST
 * </GlitchText>
 *
 * @example
 * // Rarer and more discreet bursts.
 * <GlitchText intensity={2} interval={5000}>Odoro</GlitchText>
 */
export function GlitchText({
  children,
  as: Tag = 'span',
  intensity = 3,
  interval = 2600,
  channelA = 'var(--o-palette-red-500)',
  channelB = 'var(--o-palette-cyan-400)',
  ...rest
}: GlitchTextProps): ReactElement {
  const { reduced } = useMotionState()
  const [burst, setBurst] = useState(false)
  ensureGlitchRule()

  useEffect(() => {
    if (reduced) return

    let timer: ReturnType<typeof setTimeout>

    const schedule = (): void => {
      // The interval varies by half around the setting: enough for the inner
      // ear to find no rhythm in it, not enough for two bursts to stick
      // together.
      const wait = interval * (0.75 + Math.random() * 0.5)
      timer = setTimeout(() => {
        setBurst(true)
        timer = setTimeout(() => {
          setBurst(false)
          schedule()
        }, BURST_MS)
      }, wait)
    }

    schedule()
    return () => clearTimeout(timer)
  }, [reduced, interval])

  const { className, style } = mergePresentation({}, rest)

  // Reduced motion: the text, nothing else. The copies brought nothing but the
  // gesture, and the gesture is what we are asked to leave out.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const glitchStyle = {
    ...style,
    '--o-glitch-shift': `${String(intensity)}px`,
    '--o-glitch-a': channelA,
    '--o-glitch-b': channelB,
  } as CSSProperties

  return (
    <Tag
      {...rest}
      className={className}
      style={glitchStyle}
      data-o-glitch=""
      {...(burst ? { 'data-o-glitch-on': '' } : {})}
    >
      {children}
      <span aria-hidden data-o-glitch-copy="a">
        {children}
      </span>
      <span aria-hidden data-o-glitch-copy="b">
        {children}
      </span>
    </Tag>
  )
}
