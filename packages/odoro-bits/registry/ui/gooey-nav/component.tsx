/**
 * Gooey navigation: the pill breaks off into droplets when it changes link,
 * and an SVG filter welds pill and droplets into a single matter.
 *
 * ## The gooeyness is a threshold on a blur
 *
 * Two blurred shapes that come close see their edges melt together; a
 * threshold set on the alpha gives that mixture a sharp outline back. That is
 * the whole filter: `feGaussianBlur` then `feColorMatrix`, which multiplies
 * the alpha and offsets it, so that everything below a certain blur disappears
 * and everything above it becomes solid. Two droplets that separate stretch a
 * bridge between them before breaking — it is that bridge which makes the
 * matter.
 *
 * ## The filter only touches the layer of the pill
 *
 * Putting the text through the same filter would thicken it and make it
 * illegible. The pill and its droplets therefore live on a separate layer,
 * under the links; the layer is filtered, the links are not.
 *
 * ## The droplets are placed in the DOM and removed at their end
 *
 * They do not go through React state: a dozen elements that are born and die
 * within a second have no business making the bar render. Each one receives a
 * keyframe animation, and removes itself when that animation ends.
 *
 * ## Under reduced motion
 *
 * The pill jumps into place, without droplets. The final state is the same:
 * one link marked, the others not.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

/** One navigation element. */
export interface NavItem {
  /** Displayed label. */
  readonly label: string
  /** Target of the link. Without a target, the element is a button. */
  readonly href?: string
  /** Icon placed before the label. */
  readonly icon?: ReactNode
}

/** Properties owned by the component. */
export interface GooeyNavOwnProps {
  /** The links, in display order. */
  items: readonly NavItem[]
  /** Index of the current page, in controlled mode. */
  active?: number
  /** Current page on mount, in uncontrolled mode. @defaultValue 0 */
  defaultActive?: number
  /** Called when the user chooses a link. */
  onActiveChange?: (index: number) => void
  /**
   * Color tokens. The first one fills the pill, all of them color the
   * droplets.
   *
   * @defaultValue brand, fuchsia, sky
   */
  colors?: readonly string[]
  /** Number of droplets thrown at each change. @defaultValue 10 */
  drops?: number
  /** Reach of the droplets, in pixels. @defaultValue 48 */
  distance?: number
  /** Name of the block for screen readers. @defaultValue 'Navigation' */
  label?: string
}

/** All the properties. */
export type GooeyNavProps = Customisable<GooeyNavOwnProps, 'nav'>

/** Default colors: the brand for the pill, two more hues for the droplets. */
const DEFAULT_COLORS: readonly string[] = [
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
  '--o-palette-sky-500',
]

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-gooey-nav'

/** Sets the bar, the filtered layer and the pill, once per document. */
function ensureGooeyRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-goo]{',
    'position:relative;display:inline-flex;align-items:center;gap:2px;',
    'padding:4px;border-radius:999px;border:1px solid var(--o-theme-line);',
    '}',
    '[data-o-goo] ul{display:contents;margin:0;padding:0;list-style:none}',
    '[data-o-goo] [data-o-goo-link]{',
    'position:relative;z-index:1;display:inline-flex;align-items:center;gap:0.5em;',
    'border:0;background:none;cursor:pointer;border-radius:999px;',
    'font:inherit;color:inherit;text-decoration:none;white-space:nowrap;',
    'padding:0.5rem 1rem;opacity:0.7;',
    'transition:color var(--o-duration-slow) linear,opacity var(--o-duration-slow) linear;',
    '}',
    '[data-o-goo] [data-o-goo-link]:hover,[data-o-goo] [data-o-goo-link]:focus-visible{opacity:1}',
    '[data-o-goo] [data-o-goo-link]:focus-visible{outline:2px solid currentColor;outline-offset:-2px}',
    '[data-o-goo] [data-o-goo-link][aria-current]{opacity:1;color:var(--o-goo-ink)}',
    // The filtered layer: the pill and its droplets, nothing else.
    '[data-o-goo-layer]{',
    'position:absolute;inset:0;z-index:0;pointer-events:none;overflow:visible;',
    'filter:var(--o-goo-filter);',
    '}',
    '[data-o-goo-pill]{',
    'position:absolute;inset-block:4px;left:0;width:0;',
    'border-radius:999px;background:var(--o-goo-fill);',
    'transition:transform calc(var(--o-duration-slow) * 1.6) cubic-bezier(0.2,0,0,1),',
    'width calc(var(--o-duration-slow) * 1.6) cubic-bezier(0.2,0,0,1);',
    '}',
    '[data-o-goo-drop]{position:absolute;border-radius:999px;top:50%;left:0}',
    '@media (prefers-reduced-motion:reduce){[data-o-goo-pill]{transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Navigation bar whose pill breaks off into droplets.
 *
 * @example
 * <GooeyNav
 *   items={[
 *     { label: 'Studio', href: '/studio' },
 *     { label: 'Projects', href: '/projects' },
 *     { label: 'Journal', href: '/journal' },
 *   ]}
 * />
 *
 * @example
 * // More droplets, further out, other hues.
 * <GooeyNav items={navItems} drops={16} distance={80} colors={['--o-palette-emerald-500', '--o-palette-sky-500']} />
 */
export function GooeyNav({
  items,
  active,
  defaultActive = 0,
  onActiveChange,
  colors = DEFAULT_COLORS,
  drops = 10,
  distance = 48,
  label = 'Navigation',
  ...rest
}: GooeyNavProps): ReactElement {
  const { reduced } = useMotionState()
  const filterId = useId()
  const hostRef = useRef<HTMLElement | null>(null)
  const layerRef = useRef<HTMLSpanElement | null>(null)
  const pillRef = useRef<HTMLSpanElement | null>(null)
  const settled = useRef(false)
  const [internal, setInternal] = useState(defaultActive)
  ensureGooeyRules()

  const current = Math.min(Math.max(active ?? internal, 0), Math.max(items.length - 1, 0))
  const fill = `var(${colors[0] ?? DEFAULT_COLORS[0] ?? ''})`

  const choose = (index: number): void => {
    if (active === undefined) setInternal(index)
    onActiveChange?.(index)
  }

  const links = (): HTMLElement[] =>
    Array.from(hostRef.current?.querySelectorAll<HTMLElement>('[data-o-goo-link]') ?? [])

  /** Throws droplets from the center of a link. */
  const splash = (target: HTMLElement): void => {
    const layer = layerRef.current
    if (layer === null || drops <= 0) return

    const centerX = target.offsetLeft + target.offsetWidth / 2
    const count = Math.min(drops, 24)

    for (let index = 0; index < count; index += 1) {
      const drop = document.createElement('span')
      drop.setAttribute('data-o-goo-drop', '')
      const size = 6 + Math.random() * 10
      const angle = Math.random() * Math.PI * 2
      const reach = distance * (0.5 + Math.random() * 0.5)
      const token = colors[index % Math.max(colors.length, 1)] ?? DEFAULT_COLORS[0] ?? ''
      drop.style.width = `${size.toFixed(1)}px`
      drop.style.height = `${size.toFixed(1)}px`
      drop.style.background = `var(${token})`
      drop.style.marginTop = `${(-size / 2).toFixed(1)}px`
      drop.style.marginLeft = `${(centerX - size / 2).toFixed(1)}px`
      layer.append(drop)

      const dx = Math.cos(angle) * reach
      const dy = Math.sin(angle) * reach * 0.6
      const animation = drop.animate(
        [
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          {
            transform: `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) scale(0)`,
            opacity: 1,
          },
        ],
        {
          duration: 500 + Math.random() * 400,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
          fill: 'forwards',
        },
      )
      animation.onfinish = () => drop.remove()
    }
  }

  /** Places the pill under the current link, and throws the droplets on change. */
  const place = (burst: boolean): void => {
    const pill = pillRef.current
    const target = links()[current]
    if (pill === null || target === undefined) return
    pill.style.width = `${String(target.offsetWidth)}px`
    pill.style.transform = `translateX(${String(target.offsetLeft)}px)`
    if (burst && !reduced) splash(target)
  }

  // On mount the pill settles without a burst: there was no gesture. On the
  // following changes, it splashes. A bar that changes size remeasures without
  // splashing either.
  useLayoutEffect(() => {
    place(settled.current)
    settled.current = true
    const host = hostRef.current
    if (host === null || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => place(false))
    observer.observe(host)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, items])

  const onKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    const all = links()
    const focused = all.findIndex((link) => link === document.activeElement)
    if (focused < 0) return
    const last = all.length - 1
    const moves: Readonly<Record<string, number | undefined>> = {
      ArrowRight: focused >= last ? 0 : focused + 1,
      ArrowLeft: focused <= 0 ? last : focused - 1,
      Home: 0,
      End: last,
    }
    const target = moves[event.key]
    if (target === undefined) return
    event.preventDefault()
    all[target]?.focus()
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <nav
      {...rest}
      ref={hostRef}
      aria-label={label}
      data-o-goo=""
      className={className}
      style={
        {
          ...style,
          '--o-goo-fill': fill,
          '--o-goo-ink': 'var(--o-palette-zinc-50)',
          '--o-goo-filter': reduced ? 'none' : `url(#${filterId})`,
        } as CSSProperties
      }
      onKeyDown={onKeyDown}
    >
      <svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      <span ref={layerRef} aria-hidden="true" data-o-goo-layer="">
        <span ref={pillRef} data-o-goo-pill="" />
      </span>
      <ul>
        {items.map((item, index) => {
          const isCurrent = index === current
          const content = (
            <>
              {item.icon !== undefined && <span aria-hidden="true">{item.icon}</span>}
              {item.label}
            </>
          )
          return (
            <li key={`${item.label}-${String(index)}`}>
              {item.href !== undefined ? (
                <a
                  href={item.href}
                  data-o-goo-link=""
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => choose(index)}
                >
                  {content}
                </a>
              ) : (
                <button
                  type="button"
                  data-o-goo-link=""
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => choose(index)}
                >
                  {content}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
