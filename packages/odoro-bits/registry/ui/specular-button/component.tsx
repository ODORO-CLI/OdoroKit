/**
 * Button with a specular reflection: a point of light follows the pointer on
 * the surface, and the edge lights up on the side the light comes from.
 *
 * ## What sets it apart from a turning edge light or a pearl
 *
 * The turning edge light animates its outline on its own; the pearl is a
 * fixed volume. Here nothing moves without the pointer: the light is a point
 * that the hand moves, and the surface answers like a varnished object — the
 * reflection settles under the cursor, the opposite edge goes out, the
 * neighbouring edge lights up.
 *
 * ## The position is a number, not a length
 *
 * The reflection needs the position as a percentage, for the gradient; the
 * edge needs an offset in pixels, for the inset shadow. A single pair of
 * variables serves both: two numbers from zero to one, registered by
 * `@property`, which each rule multiplies by what it needs. The inset shadow
 * does not accept a percentage, that is the whole problem; a bare number
 * writes in both.
 *
 * Registered, these variables interpolate: the transition the compositor
 * applies on them is the lag of the reflection behind the hand, and there is
 * no loop to open to get it.
 *
 * ## Rest is a lighting, not an absence
 *
 * When the pointer leaves, the light does not go out: it returns to the top
 * left, where an interface places its source by convention. A button lit at
 * rest keeps its volume; an unlit button would look inactive.
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
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface SpecularButtonOwnProps {
  /** Label of the button. */
  children: ReactNode
  /** Target of the link. With it, the button is rendered as a link. */
  href?: string
  /**
   * Tokens of the body, the label and the light.
   *
   * Three, in that order. The light serves the reflection and the lit edge.
   */
  colors?: readonly [string, string, string]
  /** Diameter of the reflection, as a percentage of the button width. @defaultValue 120 */
  size?: number
  /** Intensity of the reflection, from zero to one. @defaultValue 0.55 */
  strength?: number
  /** Lag of the reflection behind the pointer, in milliseconds. @defaultValue 180 */
  lag?: number
}

/** All properties. */
export type SpecularButtonProps = Customisable<SpecularButtonOwnProps, 'button'>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-palette-brand-600',
  '--o-palette-zinc-50',
  '--o-palette-white',
] as const

/** Rest position of the light: at the top left. */
const REST_X = 0.3
const REST_Y = 0.2

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-specular-button'

/** Applies the surface, the reflection and the edge, once per document. */
function ensureSpecularRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Two numbers, not two lengths: see the header of the module.
    '@property --o-spec-x{syntax:"<number>";initial-value:0.3;inherits:false}',
    '@property --o-spec-y{syntax:"<number>";initial-value:0.2;inherits:false}',

    '[data-o-spec]{',
    'position:relative;isolation:isolate;overflow:hidden;cursor:pointer;',
    'display:inline-flex;align-items:center;justify-content:center;gap:0.5em;',
    'border:0;font:inherit;text-decoration:none;',
    'background:var(--o-spec-body);color:var(--o-spec-ink);',
    'transition:--o-spec-x var(--o-spec-lag) linear,--o-spec-y var(--o-spec-lag) linear,',
    'box-shadow var(--o-spec-lag) linear;',
    // The edge: an inset shadow whose offset follows the light. It is pulled
    // towards the bright point, hence light on the lit side.
    'box-shadow:inset calc((var(--o-spec-x) - 0.5) * 6px) calc((var(--o-spec-y) - 0.5) * 6px) 8px -3px ',
    'color-mix(in oklab,var(--o-spec-light) 55%,transparent),',
    'inset 0 0 0 1px color-mix(in oklab,var(--o-spec-light) 18%,transparent);',
    '}',
    '[data-o-spec]:focus-visible{outline:2px solid var(--o-spec-body);outline-offset:3px}',
    '[data-o-spec]:active{scale:0.98}',
    '[data-o-spec]:disabled,[data-o-spec][aria-disabled="true"]{',
    'opacity:0.5;cursor:not-allowed;pointer-events:none}',

    // The reflection: a disc of light centred on the position.
    '[data-o-spec]::before{',
    'content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;',
    'background:radial-gradient(var(--o-spec-size) circle at ',
    'calc(var(--o-spec-x) * 100%) calc(var(--o-spec-y) * 100%),',
    'var(--o-spec-light) 0%,transparent 60%);',
    'opacity:var(--o-spec-strength);',
    '}',
    // The varnish: a light veil at the top, which gives the curvature.
    '[data-o-spec]::after{',
    'content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;',
    'background:linear-gradient(to bottom,color-mix(in oklab,var(--o-spec-light) 22%,transparent),transparent 55%);',
    '}',
    '[data-o-spec]>span{position:relative;z-index:1}',

    '@media (prefers-reduced-motion:reduce){[data-o-spec]{transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Button whose light follows the pointer.
 *
 * @example
 * <SpecularButton onClick={order}>Order</SpecularButton>
 *
 * @example
 * // A link, dark body and a more discreet reflection, sticking to the cursor.
 * <SpecularButton
 *   href="/pricing"
 *   colors={['--o-palette-zinc-900', '--o-palette-zinc-50', '--o-palette-zinc-50']}
 *   strength={0.3}
 *   lag={0}
 * >
 *   See pricing
 * </SpecularButton>
 */
export function SpecularButton({
  children,
  href,
  colors = DEFAULT_TOKENS,
  size = 120,
  strength = 0.55,
  lag = 180,
  ...rest
}: SpecularButtonProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  ensureSpecularRules()

  useEffect(() => {
    // Under reduced motion the light stays at rest: the tracking is an
    // ornament, the lighting is the content.
    if (host === null || reduced) return
    if (!window.matchMedia('(hover) and (pointer: fine)').matches) return

    const onMove = (event: PointerEvent): void => {
      const box = host.getBoundingClientRect()
      const x = (event.clientX - box.left) / Math.max(box.width, 1)
      const y = (event.clientY - box.top) / Math.max(box.height, 1)
      host.style.setProperty('--o-spec-x', x.toFixed(3))
      host.style.setProperty('--o-spec-y', y.toFixed(3))
    }

    const onLeave = (): void => {
      host.style.setProperty('--o-spec-x', String(REST_X))
      host.style.setProperty('--o-spec-y', String(REST_Y))
    }

    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerleave', onLeave)
    return () => {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [host, reduced])

  const { className, style } = mergePresentation(
    { className: 'o-rounded-full o-px-6 o-py-3 o-font-medium' },
    rest,
  )

  // A link when there is a target, a button otherwise: the same dressing on
  // both, and the semantics that suits each.
  const Tag = (href === undefined ? 'button' : 'a') as ElementType
  const { disabled, type, ...attributes } = rest

  return (
    <Tag
      {...(href === undefined
        ? { type: type ?? 'button', disabled }
        : { href, 'aria-disabled': disabled === true ? 'true' : undefined })}
      {...attributes}
      ref={setHost}
      data-o-spec=""
      className={className}
      style={
        {
          '--o-spec-body': `var(${colors[0]})`,
          '--o-spec-ink': `var(${colors[1]})`,
          '--o-spec-light': `var(${colors[2]})`,
          '--o-spec-size': `${String(size)}%`,
          '--o-spec-strength': String(strength),
          '--o-spec-lag': `${String(reduced ? 0 : lag)}ms`,
          ...style,
        } as CSSProperties
      }
    >
      <span>{children}</span>
    </Tag>
  )
}
