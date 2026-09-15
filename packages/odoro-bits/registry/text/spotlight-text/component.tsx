/**
 * Spotlight: the text only appears in full colour under a halo that follows
 * the pointer.
 *
 * ## CSS variables, not React renders
 *
 * The halo moves on every movement of the pointer — passing its position
 * through React state would trigger one render per event, to move a gradient
 * that React does not even draw. The position is therefore written directly
 * into two CSS variables, and the `radial-gradient` mask reads it on its own.
 *
 * The black and the transparent of the mask are not colours: a mask reads only
 * the alpha. The text itself stays in `currentColor`.
 *
 * ## The text stays readable, always
 *
 * Outside a hover, the base text keeps a faded but present fill — a heading
 * that disappears completely outside the halo is a game, not a heading. On
 * screens without a fine pointer, the faded rule never applies: the text is
 * simply full, and the effect does not exist. Same thing under reduced motion.
 *
 * The full layer is an `aria-hidden` copy: for a screen reader, there is only
 * one text.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from 'react'

/** Properties specific to the component. */
export interface SpotlightTextOwnProps {
  /** Text to light. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Radius of the halo, in pixels. @defaultValue 120 */
  radius?: number
  /** Opacity of the text outside the halo, from 0 to 1. @defaultValue 0.25 */
  rest?: number
}

/** All properties. */
export type SpotlightTextProps = Customisable<SpotlightTextOwnProps, 'span'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-spotlight-text'

/**
 * Sets the spotlight rules, once per document.
 *
 * Everything that fades or masks lives under the media query: a touch screen
 * will never see a half-erased text that no pointer can reveal.
 */
function ensureSpotlightRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-spot]{position:relative;display:inline-block}',
    '[data-o-spot-full]{',
    'position:absolute;inset:0;opacity:0;pointer-events:none;user-select:none;',
    '}',
    '@media (hover:hover) and (pointer:fine){',
    '[data-o-spot] [data-o-spot-dim]{opacity:var(--o-spot-rest);transition:opacity 200ms ease}',
    '[data-o-spot-full]{',
    'transition:opacity 200ms ease;',
    '-webkit-mask-image:radial-gradient(circle var(--o-spot-r) at var(--o-spot-x) var(--o-spot-y),black 40%,transparent 100%);',
    'mask-image:radial-gradient(circle var(--o-spot-r) at var(--o-spot-x) var(--o-spot-y),black 40%,transparent 100%);',
    '}',
    '[data-o-spot-on] [data-o-spot-full]{opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Reveals a massive text under a halo that follows the pointer.
 *
 * @example
 * <SpotlightText as="h1" className="o-text-5xl o-font-extrabold">
 *   Look closely
 * </SpotlightText>
 *
 * @example
 * // Wide halo, text almost erased at rest.
 * <SpotlightText radius={220} rest={0.1}>In the dark</SpotlightText>
 */
export function SpotlightText({
  children,
  as: Tag = 'span',
  radius = 120,
  rest = 0.25,
  ...restProps
}: SpotlightTextProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLElement | null>(null)
  ensureSpotlightRule()

  useEffect(() => {
    const element = host.current
    if (element === null || reduced) return

    const onMove = (event: PointerEvent): void => {
      const bounds = element.getBoundingClientRect()
      element.style.setProperty('--o-spot-x', `${String(event.clientX - bounds.left)}px`)
      element.style.setProperty('--o-spot-y', `${String(event.clientY - bounds.top)}px`)
    }
    const onEnter = (): void => {
      element.setAttribute('data-o-spot-on', '')
    }
    const onLeave = (): void => {
      element.removeAttribute('data-o-spot-on')
    }

    element.addEventListener('pointermove', onMove, { passive: true })
    element.addEventListener('pointerenter', onEnter)
    element.addEventListener('pointerleave', onLeave)
    return () => {
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerenter', onEnter)
      element.removeEventListener('pointerleave', onLeave)
      element.removeAttribute('data-o-spot-on')
    }
  }, [reduced])

  const { className, style } = mergePresentation({}, restProps)

  // Reduced motion: the text is full, with neither layer nor pointer
  // listening.
  if (reduced) {
    return (
      <Tag {...restProps} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const spotStyle = {
    ...style,
    '--o-spot-r': `${String(radius)}px`,
    '--o-spot-rest': String(rest),
    '--o-spot-x': '50%',
    '--o-spot-y': '50%',
  } as CSSProperties

  return (
    <Tag {...restProps} ref={host} className={className} style={spotStyle} data-o-spot="">
      <span data-o-spot-dim="">{children}</span>
      {/* The full copy, under the mask. Hidden from screen readers. */}
      <span aria-hidden data-o-spot-full="">
        {children}
      </span>
    </Tag>
  )
}
