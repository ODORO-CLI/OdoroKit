/**
 * Connecting beam: an animated stroke links two child elements.
 *
 * ## The geometry is measured, never assumed
 *
 * The two ends are children identified by `data-beam="from"` and
 * `data-beam="to"`. Their positions are read at mount, then on every size
 * change — a `ResizeObserver` on the wrapper and on the two elements — and the
 * path is retraced. The measurement does not live in the loop: a stroke
 * between two cards only moves when the layout moves.
 *
 * ## `pathLength` makes the flow independent of the length
 *
 * The dash that travels is a CSS animation on `stroke-dashoffset`. Without
 * normalisation, the same animation would be fast on a short stroke and lazy
 * on a long one; `pathLength=100` brings every path back to the same scale,
 * and a single rule serves every link on the page.
 *
 * The stroke is decorative: it is removed from the accessibility tree, and
 * under reduced motion it stays — the link is what matters — but the flow
 * stops.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface BeamConnectOwnProps {
  /** Content, two children of which carry data-beam="from" and data-beam="to". */
  children: ReactNode
  /** Bulge of the curve, in pixels. @defaultValue 40 */
  curvature?: number
  /** Duration of one flow cycle, in milliseconds. @defaultValue 3000 */
  speed?: number
  /** Thickness of the stroke, in pixels. @defaultValue 2 */
  thickness?: number
  /** Colour of the beam. @defaultValue the brand token */
  color?: string
}

/** All properties. */
export type BeamConnectProps = Customisable<BeamConnectOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-beam-connect'

/** Sets the flow, once per document. */
function ensureBeamRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Thanks to pathLength=100, these units hold for every stroke,
    // whatever its real length: see the module header.
    '[data-o-beam-dash]{stroke-dasharray:18 82;animation:o-beam-flow var(--o-beam-speed,3000ms) linear infinite}',
    '@keyframes o-beam-flow{to{stroke-dashoffset:-100}}',
    '@media (prefers-reduced-motion:reduce){[data-o-beam-dash]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/** What a measurement produces: the size of the area and the path. */
interface BeamGeometry {
  readonly width: number
  readonly height: number
  readonly d: string
}

/**
 * Measures the two ends and traces the curve that links them.
 *
 * The anchors are the midpoints of the edges that face each other — linking
 * the centres would send the stroke inside the cards. The dominant axis
 * decides: two elements side by side link through their flanks, two stacked
 * elements through their top and their bottom.
 */
function measureBeam(host: HTMLElement, curvature: number): BeamGeometry | null {
  const from = host.querySelector('[data-beam="from"]')
  const to = host.querySelector('[data-beam="to"]')
  if (from === null || to === null) return null

  const box = host.getBoundingClientRect()
  const a = from.getBoundingClientRect()
  const b = to.getBoundingClientRect()
  if (box.width === 0 || box.height === 0) return null

  const dcx = b.left + b.width / 2 - (a.left + a.width / 2)
  const dcy = b.top + b.height / 2 - (a.top + a.height / 2)

  let ax: number
  let ay: number
  let bx: number
  let by: number
  if (Math.abs(dcx) >= Math.abs(dcy)) {
    ax = (dcx >= 0 ? a.right : a.left) - box.left
    ay = a.top + a.height / 2 - box.top
    bx = (dcx >= 0 ? b.left : b.right) - box.left
    by = b.top + b.height / 2 - box.top
  } else {
    ax = a.left + a.width / 2 - box.left
    ay = (dcy >= 0 ? a.bottom : a.top) - box.top
    bx = b.left + b.width / 2 - box.left
    by = (dcy >= 0 ? b.top : b.bottom) - box.top
  }

  // The control point is pushed along the normal to the segment: the curve
  // bulges on the same side whatever the orientation of the link.
  const length = Math.max(Math.hypot(bx - ax, by - ay), 1)
  const mx = (ax + bx) / 2 - ((by - ay) / length) * curvature
  const my = (ay + by) / 2 + ((bx - ax) / length) * curvature

  return {
    width: box.width,
    height: box.height,
    d: `M ${ax.toFixed(1)} ${ay.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`,
  }
}

/**
 * Links two of its children with an animated beam.
 *
 * @example
 * <BeamConnect className="o-flex o-items-center o-justify-between o-p-8">
 *   <div data-beam="from" className="o-rounded-xl o-border-w-1 o-p-4">Source</div>
 *   <div data-beam="to" className="o-rounded-xl o-border-w-1 o-p-4">Destination</div>
 * </BeamConnect>
 */
export function BeamConnect({
  children,
  curvature = 40,
  speed = 3000,
  thickness = 2,
  color = 'var(--o-palette-brand-400, currentColor)',
  ...rest
}: BeamConnectProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [geometry, setGeometry] = useState<BeamGeometry | null>(null)
  ensureBeamRule()

  useEffect(() => {
    if (host === null) return

    const update = (): void => {
      setGeometry(measureBeam(host, curvature))
    }
    update()

    // The wrapper and the two ends: a size change on any of them moves the
    // anchors.
    const observer = new ResizeObserver(update)
    observer.observe(host)
    const from = host.querySelector('[data-beam="from"]')
    const to = host.querySelector('[data-beam="to"]')
    if (from !== null) observer.observe(from)
    if (to !== null) observer.observe(to)

    return () => {
      observer.disconnect()
    }
  }, [host, curvature])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={{ position: 'relative', ...style }}
    >
      {children}
      {geometry === null ? null : (
        <svg
          aria-hidden
          width={geometry.width}
          height={geometry.height}
          viewBox={`0 0 ${String(geometry.width)} ${String(geometry.height)}`}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          {/* The bed of the beam: the link stays readable between two passes
              of the dash, and it is all that remains under reduced
              motion. */}
          <path
            d={geometry.d}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
            opacity={reduced ? 0.8 : 0.3}
          />
          {reduced ? null : (
            <path
              data-o-beam-dash=""
              d={geometry.d}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
              strokeLinecap="round"
              pathLength={100}
              style={{ '--o-beam-speed': `${String(speed)}ms` } as CSSProperties}
            />
          )}
        </svg>
      )}
    </div>
  )
}
