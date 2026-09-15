/**
 * Flowing gradient: a sheet of colour crosses the text, on a loop.
 *
 * ## Zero JavaScript at runtime
 *
 * The text is painted by its background — a gradient wider than itself, whose
 * position is animated. The browser's compositor does everything: no loop, no
 * subscription, no React render after the first.
 *
 * The gradient is three times the width of the text and loops on itself: the
 * starting colour is also the arriving one, so the seam of the cycle is
 * invisible.
 *
 * ## The trade-off of the clipping
 *
 * `background-clip: text` requires making the text colour transparent. A
 * browser that could not clip would therefore show invisible text. The rule is
 * shut inside a support query: without it, the text keeps its inherited colour
 * and only loses its gradient, which is the right way round for degradation.
 *
 * Under reduced motion, the gradient stays: it is the colour of the text, not
 * a gesture. Only its movement stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ElementType, type ReactElement } from 'react'

/** Properties specific to the component. */
export interface GradientFlowOwnProps {
  /** Text to paint. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Duration of one cycle, in milliseconds. @defaultValue 4000 */
  speed?: number
  /** Angle of the gradient, in degrees. @defaultValue 90 */
  angle?: number
  /** First colour. @defaultValue brand hue */
  from?: string
  /** Second colour. @defaultValue fuchsia from the palette */
  to?: string
}

/** All properties. */
export type GradientFlowProps = Customisable<GradientFlowOwnProps, 'span'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-gradient-flow'

/** Sets the gradient and its movement, once per document. */
function ensureFlowRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '@keyframes o-gradient-flow{from{background-position:0% 50%}to{background-position:-200% 50%}}',
    '@supports (background-clip:text) or (-webkit-background-clip:text){',
    '[data-o-gradient-flow]{',
    // Four stops whose first and last share the colour: the pattern repeats
    // seamlessly when the position loops.
    'background-image:linear-gradient(var(--o-flow-angle),var(--o-flow-from),var(--o-flow-to),var(--o-flow-from));',
    'background-size:200% 100%;',
    '-webkit-background-clip:text;background-clip:text;',
    'color:transparent;-webkit-text-fill-color:transparent;',
    'animation:o-gradient-flow var(--o-flow-speed) linear infinite;',
    '}}',
    '@media (prefers-reduced-motion:reduce){[data-o-gradient-flow]{animation:none;background-position:0% 50%}}',
  ].join('')
  document.head.append(style)
}

/**
 * Flows a gradient through a text.
 *
 * @example
 * <GradientFlow as="h1" className="o-text-5xl o-font-extrabold">
 *   Building in colour
 * </GradientFlow>
 *
 * @example
 * // The colours are free: they are values, not roles.
 * <GradientFlow from="var(--o-palette-sky-400)" to="var(--o-palette-emerald-300)">
 *   Odoro
 * </GradientFlow>
 */
export function GradientFlow({
  children,
  as: Tag = 'span',
  speed = 4000,
  angle = 90,
  from = 'var(--o-palette-brand-500)',
  to = 'var(--o-palette-fuchsia-500)',
  ...rest
}: GradientFlowProps): ReactElement {
  ensureFlowRule()

  const { className, style } = mergePresentation({}, rest)

  const flowStyle = {
    ...style,
    '--o-flow-from': from,
    '--o-flow-to': to,
    '--o-flow-angle': `${String(angle)}deg`,
    '--o-flow-speed': `${String(speed)}ms`,
  } as CSSProperties

  // Reduced motion is handled by the stylesheet, not by the render: the
  // gradient is the colour of the text and must stay, only its movement stops.
  // Removing the attribute would take the colour away with it.
  return (
    <Tag {...rest} className={className} style={flowStyle} data-o-gradient-flow="">
      {children}
    </Tag>
  )
}
