/**
 * Chroma grid: tinted cards, rendered in grey, whose colours the pointer
 * reveals inside a damped circle.
 *
 * ## The grey is a veil, not a state of the cards
 *
 * Each card has its hue, set once, and never changes. It is a veil above the
 * grid that desaturates what it covers — a backdrop filter — and a radial mask
 * punches a hole in it around the pointer. Moving the hole touches no card:
 * two variables on the veil, and the whole grid answers. Removing the veil
 * renders the grid in colour, which is exactly the state wanted wherever there
 * is no pointer.
 *
 * ## The hole opens and closes, it does not pop in
 *
 * A mask does not transition cleanly. The radius of the hole is therefore
 * damped like the position, in the same loop: on entry it grows from zero, on
 * exit it closes on the spot. The veil never flickers.
 *
 * ## The hues are handed out
 *
 * The colours are a list of tokens, given to the cards in order and in a loop.
 * Four hues are enough for a grid of twelve; giving one per card stays
 * possible.
 *
 * ## What is left for touch and under reduced motion
 *
 * The grid in colour, with no veil. The final state, not the grey.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import {
  Children,
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

/** Default hues, handed out in a loop. */
const DEFAULT_TOKENS: readonly string[] = [
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
  '--o-palette-sky-500',
  '--o-palette-emerald-500',
]

/** Properties specific to the component. */
export interface ChromaGridOwnProps {
  /** The cards. */
  children: ReactNode
  /** Number of columns. @defaultValue 3 */
  columns?: number
  /** Hue tokens, given to the cards in order and in a loop. */
  colors?: readonly string[]
  /** Radius of the revealed circle, in pixels. @defaultValue 220 */
  radius?: number
  /** Speed at which the circle follows the pointer. @defaultValue 6 */
  speed?: number
}

/** All properties. */
export type ChromaGridProps = Customisable<ChromaGridOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-chroma-grid'

/** Applies the grid, the cards and the veil, once per document. */
function ensureChromaRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-chroma]{',
    'position:relative;display:grid;',
    'grid-template-columns:repeat(var(--o-chroma-columns),minmax(0,1fr));',
    'gap:var(--o-chroma-gap);',
    '}',
    '[data-o-chroma-item]{',
    'position:relative;overflow:hidden;border-radius:var(--o-chroma-radius);',
    'background:var(--o-theme-surface);',
    'border:1px solid color-mix(in oklab,var(--o-chroma-tint) 40%,var(--o-theme-line));',
    '}',
    // The hue: a gradient from the top corner, under the content.
    '[data-o-chroma-item]::before{',
    'content:"";position:absolute;inset:0;pointer-events:none;',
    'background:linear-gradient(160deg,',
    'color-mix(in oklab,var(--o-chroma-tint) 55%,transparent),',
    'color-mix(in oklab,var(--o-chroma-tint) 12%,transparent) 45%,',
    'transparent 75%);',
    '}',
    '[data-o-chroma-item]>*{position:relative}',
    // The veil: desaturates what it covers, punched around the pointer.
    '[data-o-chroma-veil]{',
    'position:absolute;inset:0;pointer-events:none;',
    '-webkit-backdrop-filter:grayscale(1);backdrop-filter:grayscale(1);',
    '-webkit-mask:radial-gradient(var(--o-chroma-r) circle at var(--o-chroma-x) var(--o-chroma-y),',
    'transparent 35%,currentColor 100%);',
    'mask:radial-gradient(var(--o-chroma-r) circle at var(--o-chroma-x) var(--o-chroma-y),',
    'transparent 35%,currentColor 100%);',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * A grid of tinted cards, revealed by the pointer.
 *
 * @example
 * <ChromaGrid columns={3} className="o-gap-4">
 *   <article className="o-p-5">One</article>
 *   <article className="o-p-5">Two</article>
 *   <article className="o-p-5">Three</article>
 * </ChromaGrid>
 *
 * @example
 * // Two hues only, wider circle.
 * <ChromaGrid colors={['--o-palette-amber-500', '--o-palette-rose-500']} radius={320}>
 *   {cards}
 * </ChromaGrid>
 */
export function ChromaGrid({
  children,
  columns = 3,
  colors = DEFAULT_TOKENS,
  radius = 220,
  speed = 6,
  ...rest
}: ChromaGridProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [veiled, setVeiled] = useState(false)
  const pointer = usePointerDamped({ host, speed, name: 'chroma: pointer' })
  ensureChromaRules()

  useEffect(() => {
    if (host === null || reduced) return
    if (!window.matchMedia('(hover) and (pointer: fine)').matches) return

    // The veil is only put up once a fine pointer is certain: before that, the
    // grid is in colour, and it stays so everywhere else.
    setVeiled(true)

    let on = false
    let hole = 0
    let lastX = -1
    let lastY = -1
    let lastHole = -1

    const onEnter = (): void => {
      on = true
    }
    const onLeave = (): void => {
      on = false
    }

    const subscription = clock.subscribe(
      ({ delta }) => {
        const x = ((pointer.current.x + 1) / 2) * 100
        const y = ((pointer.current.y + 1) / 2) * 100
        // The radius follows the same law as the position: see the header.
        hole += ((on ? radius : 0) - hole) * (1 - Math.exp(-speed * delta))

        if (
          Math.abs(x - lastX) < 0.02 &&
          Math.abs(y - lastY) < 0.02 &&
          Math.abs(hole - lastHole) < 0.1
        ) {
          return
        }
        lastX = x
        lastY = y
        lastHole = hole
        host.style.setProperty('--o-chroma-x', `${x.toFixed(2)}%`)
        host.style.setProperty('--o-chroma-y', `${y.toFixed(2)}%`)
        host.style.setProperty('--o-chroma-r', `${hole.toFixed(1)}px`)
      },
      { priority: CLOCK_PRIORITY.render, name: 'chroma' },
    )

    host.addEventListener('pointerenter', onEnter, { passive: true })
    host.addEventListener('pointerleave', onLeave, { passive: true })

    return () => {
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointerleave', onLeave)
      subscription.unsubscribe()
      setVeiled(false)
    }
  }, [host, reduced, radius, speed, pointer])

  const { className, style } = mergePresentation({}, rest)
  const cards = Children.toArray(children)
  const tints = colors.length === 0 ? DEFAULT_TOKENS : colors

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={
        {
          '--o-chroma-columns': String(Math.max(1, Math.round(columns))),
          '--o-chroma-gap': '1rem',
          '--o-chroma-radius': '0.75rem',
          '--o-chroma-x': '50%',
          '--o-chroma-y': '50%',
          '--o-chroma-r': '0px',
          ...style,
        } as CSSProperties
      }
      data-o-chroma=""
    >
      {cards.map((card, index) => (
        <div
          key={index}
          data-o-chroma-item=""
          style={
            {
              '--o-chroma-tint': `var(${tints[index % tints.length] ?? DEFAULT_TOKENS[0] ?? ''})`,
            } as CSSProperties
          }
        >
          {card}
        </div>
      ))}
      {veiled ? <div data-o-chroma-veil="" aria-hidden="true" /> : null}
    </div>
  )
}
