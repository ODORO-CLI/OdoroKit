/**
 * Glare that crosses the content on hover.
 *
 * ## A band, not a halo
 *
 * The pointer halo lights up the place where the hand is; this glare follows
 * nothing. It crosses from edge to edge at constant speed, like the light of a
 * shop window on a laminated card: it is an acknowledgement of the hover, not
 * a lamp. The two can in fact be laid together without getting in each other's
 * way, one radial and under the content, the other linear and over it.
 *
 * ## Why hover triggers from the stylesheet
 *
 * The trigger could go through React state on `pointerenter`. That would be
 * two renders per hovered card, for an animation that `:hover` launches on its
 * own. The rule therefore lives in the stylesheet, and `:focus-within` joins
 * it: a card that contains a link must announce itself to the keyboard too.
 *
 * ## What the band crosses
 *
 * The pseudo-element is twice the size of the host and overflows by half in
 * each direction: whatever angle is asked for, the band enters and leaves
 * outside the frame, never showing its end.
 *
 * Under reduced motion, no crossing: a glare has no final state to preserve,
 * it brings nothing but its passage.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Properties specific to the component. */
export interface GlareHoverOwnProps {
  /** Content crossed by the glare. */
  children: ReactNode
  /** Duration of the crossing, in milliseconds. @defaultValue 700 */
  duration?: number
  /** Tilt of the band, in degrees. @defaultValue 115 */
  angle?: number
  /** Half-width of the band, as a percentage of the diagonal. @defaultValue 14 */
  width?: number
  /** Colour of the glare. @defaultValue a very diluted ink */
  color?: string
  /** Sweeps on a loop, without waiting for a hover. @defaultValue false */
  loop?: boolean
}

/** All properties. */
export type GlareHoverProps = Customisable<GlareHoverOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-glare-hover'

/** Sets the glare rules, once per document. */
function ensureGlareRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-glare]{position:relative;isolation:isolate;overflow:hidden}',
    // Twice the size of the host, offset by half: the band stays outside the
    // frame at both its ends, whatever the angle.
    '[data-o-glare]::after{',
    'content:"";position:absolute;top:-50%;left:-50%;width:200%;height:200%;',
    'pointer-events:none;opacity:0;transform:translate3d(-60%,0,0);',
    'background:linear-gradient(var(--o-glare-angle),',
    'transparent calc(50% - var(--o-glare-width)),',
    'var(--o-glare-color) 50%,',
    'transparent calc(50% + var(--o-glare-width)))',
    '}',
    '@keyframes o-glare{',
    'from{opacity:0;transform:translate3d(-60%,0,0)}',
    '20%{opacity:1}',
    '80%{opacity:1}',
    'to{opacity:0;transform:translate3d(60%,0,0)}',
    '}',
    '[data-o-glare]:hover::after,[data-o-glare]:focus-within::after{',
    'animation:o-glare var(--o-glare-duration) var(--o-ease-standard,ease-out) 1',
    '}',
    '[data-o-glare-loop]::after{',
    'animation:o-glare var(--o-glare-duration) var(--o-ease-standard,ease-out) infinite',
    '}',
    // The component already removes the attribute under reduced motion; the
    // rule covers the case where the preference changes after mount.
    '@media (prefers-reduced-motion:reduce){[data-o-glare]::after{animation:none;opacity:0}}',
  ].join('')
  document.head.append(style)
}

/**
 * Sends a glare across its content.
 *
 * @example
 * <GlareHover className="o-rounded-xl o-border-w-1 o-p-6">
 *   <h3>A card</h3>
 * </GlareHover>
 *
 * @example
 * // A wide and slow band, on a loop, in the brand hue.
 * <GlareHover loop duration={2400} width={26} color="var(--o-palette-brand-500)">
 *   <img src="/cover.jpg" alt="" />
 * </GlareHover>
 */
export function GlareHover({
  children,
  duration = 700,
  angle = 115,
  width = 14,
  color = 'color-mix(in oklab, var(--o-theme-fg) 24%, transparent)',
  loop = false,
  ...rest
}: GlareHoverProps): ReactElement {
  const { reduced } = useMotionState()
  ensureGlareRules()

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          '--o-glare-duration': `${String(duration)}ms`,
          '--o-glare-angle': `${String(angle)}deg`,
          '--o-glare-width': `${String(width)}%`,
          '--o-glare-color': color,
        } as CSSProperties
      }
      data-o-glare={reduced ? undefined : ''}
      data-o-glare-loop={loop && !reduced ? '' : undefined}
    >
      {children}
    </div>
  )
}
