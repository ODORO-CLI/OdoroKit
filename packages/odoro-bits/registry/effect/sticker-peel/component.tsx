/**
 * Sticker with one corner peeling off.
 *
 * ## Two paths that complete each other
 *
 * The corner is not drawn over the content: it is **taken out** of it. The
 * content is clipped by a polygon missing a corner triangle, and that same
 * triangle is repainted next to it, in the colour of the back and under a
 * shadow. Both paths move together, so that the material seems to pass from
 * one to the other instead of doubling up.
 *
 * The naive approach — turning the corner in perspective — would require
 * cutting the element in two in the document, hence duplicating the content.
 * Here there is only one, and it stays selectable.
 *
 * ## Why a transition and not an animation
 *
 * The peel has no duration of its own: it follows an intention — the hand
 * arriving, the hand leaving — and must be able to reverse midway. That is the
 * definition of a transition. An animation, on the other hand, would replay
 * from the start on every change of mind.
 *
 * The keyboard triggers through `focus-within`: a card that contains a link
 * must also peel for anyone without a mouse.
 *
 * ## Under reduced motion
 *
 * The requested state is applied without a transition: what disappears is the
 * slide of the corner, not the corner itself.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Corner that lifts. */
export type PeelCorner = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

/** Properties specific to the component. */
export interface StickerPeelOwnProps {
  /** Content of the sticker. */
  children: ReactNode
  /** Corner that lifts. @defaultValue 'top-right' */
  corner?: PeelCorner
  /** Length of the lifted corner, in pixels. @defaultValue 72 */
  size?: number
  /** Duration of the peel, in milliseconds. @defaultValue 420 */
  duration?: number
  /** Keeps the corner lifted, without waiting for a hover. @defaultValue false */
  peeled?: boolean
  /** Colour of the back of the sticker. */
  back?: string
}

/** All properties. */
export type StickerPeelProps = Customisable<StickerPeelOwnProps>

/** Geometry of a corner: what is taken out, and what is laid back next to it. */
interface CornerShape {
  /** Path of the content, once the corner triangle is taken out. */
  readonly content: (cut: string) => string
  /** Position of the flap in the area. */
  readonly box: CSSProperties
  /** Path of the flap, inside its own square box. */
  readonly flap: string
  /** Direction of the gradient that gives the back its relief. */
  readonly angle: string
  /** Offset of the drop shadow. */
  readonly shadow: string
}

/** The four corners, written once. */
const CORNERS: Readonly<Record<PeelCorner, CornerShape>> = {
  'top-right': {
    content: (cut) =>
      `polygon(0 0, calc(100% - ${cut}) 0, 100% ${cut}, 100% 100%, 0 100%)`,
    box: { top: 0, right: 0 },
    flap: 'polygon(0 0, 100% 0, 100% 100%)',
    angle: '225deg',
    shadow: '-3px 3px',
  },
  'top-left': {
    content: (cut) => `polygon(${cut} 0, 100% 0, 100% 100%, 0 100%, 0 ${cut})`,
    box: { top: 0, left: 0 },
    flap: 'polygon(0 0, 100% 0, 0 100%)',
    angle: '135deg',
    shadow: '3px 3px',
  },
  'bottom-right': {
    content: (cut) =>
      `polygon(0 0, 100% 0, 100% calc(100% - ${cut}), calc(100% - ${cut}) 100%, 0 100%)`,
    box: { bottom: 0, right: 0 },
    flap: 'polygon(100% 0, 100% 100%, 0 100%)',
    angle: '315deg',
    shadow: '-3px -3px',
  },
  'bottom-left': {
    content: (cut) =>
      `polygon(0 0, 100% 0, 100% 100%, ${cut} 100%, 0 calc(100% - ${cut}))`,
    box: { bottom: 0, left: 0 },
    flap: 'polygon(0 0, 100% 100%, 0 100%)',
    angle: '45deg',
    shadow: '3px -3px',
  },
}

/**
 * Peels a corner off its content.
 *
 * @example
 * <StickerPeel className="o-rounded-xl o-bg-brand-500 o-p-6">
 *   <p>Launch offer</p>
 * </StickerPeel>
 *
 * @example
 * // A large corner, permanently peeled, at the bottom left.
 * <StickerPeel peeled corner="bottom-left" size={140}>
 *   <img src="/thumbnail.jpg" alt="" />
 * </StickerPeel>
 */
export function StickerPeel({
  children,
  corner = 'top-right',
  size = 72,
  duration = 420,
  peeled = false,
  back = 'color-mix(in oklab, var(--o-theme-fg) 14%, var(--o-theme-surface))',
  ...rest
}: StickerPeelProps): ReactElement {
  const { reduced } = useMotionState()
  const [active, setActive] = useState(false)

  const shape = CORNERS[corner]
  const open = peeled || active
  const cut = `${String(open ? Math.max(0, size) : 0)}px`
  const ease = `${String(reduced ? 0 : duration)}ms var(--o-ease-emphasized, ease-out)`

  const { className, style } = mergePresentation({ className: 'o-relative' }, rest)

  return (
    <div
      {...rest}
      className={className}
      style={style}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      <div
        style={{
          clipPath: shape.content(cut),
          transition: `clip-path ${ease}`,
        }}
      >
        {children}
      </div>

      {/* The triangle taken out of the content, laid back in the same place:
          it is the back of the sticker, not an added decoration. */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          ...shape.box,
          width: cut,
          height: cut,
          clipPath: shape.flap,
          background: `linear-gradient(${shape.angle}, ${back}, color-mix(in oklab, ${back} 55%, transparent))`,
          filter: `drop-shadow(${shape.shadow} 8px color-mix(in oklab, var(--o-theme-fg) 26%, transparent))`,
          transition: `width ${ease}, height ${ease}`,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
