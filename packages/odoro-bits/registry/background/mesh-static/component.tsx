/**
 * Static mesh: four colour blots, with no shader and no motion.
 *
 * ## What the frozen version keeps of the animated mesh
 *
 * The shader mesh blends its blots continuously; this one lays them down once
 * and for all, at the thirds of the frame, where a composition expects them.
 * For a page that does not need motion — or that has already spent its graphics
 * surface elsewhere — the result at rest is indistinguishable, and the cost
 * drops to four radial gradients.
 *
 * ## Why the inner layer overflows the frame
 *
 * The blur is a filter: it makes translucent the edges of whatever it blurs.
 * Applied to a layer fitted exactly, it would reveal a hairline of the
 * background all around. The inner layer therefore overflows by the blur radius
 * on every side, and the root element crops the excess.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Props specific to this component. */
export interface MeshStaticOwnProps {
  /** Intensity of the blots, between 0 and 1. @defaultValue 0.5 */
  strength?: number
  /** Radius of the blur, in pixels. Zero for crisp blots. @defaultValue 24 */
  blur?: number
  /** Colour of the first blot. */
  color?: string
  /** Colour of the second blot. */
  accent?: string
  /** Colour of the third blot. */
  tint?: string
  /** Colour of the background. */
  background?: string
}

/** All props. */
export type MeshStaticProps = Customisable<MeshStaticOwnProps>

/**
 * Static background mesh.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <MeshStatic className="o-absolute o-inset-0" strength={0.4} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function MeshStatic({
  strength = 0.5,
  blur = 24,
  color = 'var(--o-palette-brand-500, oklch(59.8% 0.198 275))',
  accent = 'var(--o-palette-fuchsia-500, oklch(66.7% 0.295 322.15))',
  tint = 'var(--o-palette-sky-500, oklch(68.5% 0.169 237.323))',
  background = 'var(--o-theme-bg, oklch(98.5% 0 0))',
  ...rest
}: MeshStaticProps): ReactElement {
  const mix = (base: string, portion: number): string =>
    `color-mix(in oklab, ${base} ${String(Math.round(strength * portion))}%, transparent)`

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <div
      {...rest}
      className={className}
      style={{ ...style, backgroundColor: background } as CSSProperties}
      aria-hidden
    >
      <div
        style={{
          position: 'absolute',
          inset: `${String(-blur * 2)}px`,
          filter: blur > 0 ? `blur(${String(blur)}px)` : undefined,
          backgroundImage: [
            `radial-gradient(circle at 30% 32%, ${mix(color, 100)}, transparent 45%)`,
            `radial-gradient(circle at 70% 28%, ${mix(accent, 85)}, transparent 45%)`,
            `radial-gradient(circle at 30% 72%, ${mix(tint, 80)}, transparent 45%)`,
            `radial-gradient(circle at 70% 70%, ${mix(color, 55)}, transparent 42%)`,
          ].join(','),
        }}
      />
    </div>
  )
}
