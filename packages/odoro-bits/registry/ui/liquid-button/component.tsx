/**
 * Tide button: the background rises behind the label on hover.
 *
 * ## The layer overflows on purpose
 *
 * The coloured layer measures one hundred and ten percent of the height of
 * the button, and the arrival curve slightly overshoots its target before
 * settling on it. Without that surplus of matter, the bounce would uncover a
 * band of bare background at the top of the button — an artefact of one
 * frame, but visible on every hover.
 *
 * ## The label changes colour at the crossing
 *
 * The text goes from the current colour to the one meant for the layer, with
 * a transition shorter than the rise and a slight delay: it flips at the
 * moment the wave goes through it, not before. Two layers of text in
 * `mix-blend-mode` would look more spectacular, but the output then depends
 * on the background of the page — a colour transition is predictable
 * everywhere.
 *
 * ## Under reduced motion, the tide becomes a fade
 *
 * The information — the button answers a hover — stays; only the movement
 * goes away. The layer no longer moves, it shows up.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Props specific to the component. */
export interface LiquidButtonOwnProps {
  /** Label of the button. */
  children: ReactNode
  /** Duration of the rise of the layer, in milliseconds. @defaultValue 450 */
  duration?: number
  /** Direction the coloured layer arrives from. @defaultValue 'up' */
  direction?: 'up' | 'left'
}

/** All the props. */
export type LiquidButtonProps = Customisable<LiquidButtonOwnProps, 'button'>

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-liquid-button'

/** Sets the rules of the button, once per document. */
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

    // The layer: larger than the button, parked out of sight.
    '[data-o-liquid]::before{',
    'content:"";position:absolute;inset:-5%;z-index:-1;',
    'background:var(--o-liquid-fill);',
    'transform:var(--o-liquid-rest);',
    // The curve overshoots its target then settles on it: that is the elastic bounce.
    'transition:transform var(--o-liquid-duration) cubic-bezier(0.32,1.35,0.4,1);',
    '}',
    '[data-o-liquid][data-o-liquid-dir="up"]{--o-liquid-rest:translateY(103%)}',
    '[data-o-liquid][data-o-liquid-dir="left"]{--o-liquid-rest:translateX(103%)}',
    '[data-o-liquid]:is(:hover,:focus-visible)::before{transform:translate(0,0)}',

    // The label flips colour when the wave goes through it.
    '[data-o-liquid]>span{',
    'position:relative;z-index:1;display:inline-block;',
    'transition:color calc(var(--o-liquid-duration) / 2) linear;',
    'transition-delay:calc(var(--o-liquid-duration) / 4);',
    '}',
    '[data-o-liquid]:is(:hover,:focus-visible)>span{color:var(--o-liquid-ink)}',

    // Reduced motion: the layer no longer rises, it shows up.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-liquid]::before{transform:translate(0,0);opacity:0;',
    'transition:opacity 200ms linear}',
    '[data-o-liquid]:is(:hover,:focus-visible)::before{opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Button whose background rises on hover, like a tide.
 *
 * @example
 * <LiquidButton onClick={send}>Send</LiquidButton>
 *
 * @example
 * // The layer arrives from the right, more slowly.
 * <LiquidButton direction="left" duration={700}>Follow us</LiquidButton>
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
