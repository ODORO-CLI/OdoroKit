/**
 * Glass icons: frosted tiles, each one set on a colored glow that the glass
 * spreads out.
 *
 * ## The glow is behind the glass, not inside it
 *
 * `backdrop-filter` only blurs what is already painted **behind** the element.
 * The glow is therefore a sibling of the tile, placed before it in the same
 * button: the glass finds it in its backdrop and spreads it. Put inside the
 * tile, it would stay sharp — a disc of color stuck onto glass, which is
 * exactly the effect we do not want.
 *
 * It is also what makes the blur useful here, whereas a glass surface set on a
 * flat fill shows nothing: the tile always has something to diffuse, even on a
 * plain page.
 *
 * ## The pivot is fixed, it does not follow the pointer
 *
 * A card that tilts toward the pointer requires a loop, a measurement and a
 * damping — for a target of seventy-six pixels, where the pointer has no room
 * to shade anything. The pivot is therefore a state, not a tracking: a
 * transition between two transforms, held by the compositor alone. The
 * keyboard gets exactly the same state, which a pointer tracking would not
 * know how to do.
 *
 * ## This is not the magnifying dock
 *
 * The magnifying dock is a row of elements whose size depends on the distance
 * to the pointer: the effect lives in the neighborhood. Here each tile is
 * alone — it lights up for itself, and is arranged as a board rather than as a
 * row.
 *
 * ## The label is text, under the tile
 *
 * An icon alone is only understood by whoever already knows it. The label is
 * therefore always displayed, in the document, and the icon is marked as
 * decorative: the screen reader announces the button once, with its name.
 *
 * ## What is left when the glass or the motion is taken away
 *
 * Without backdrop blur, the tile becomes opaque and takes its hue: the board
 * stays legible and colored. Under reduced motion, it lights up without
 * pivoting — the end state, without the trip.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** One tile of the board. */
export interface GlassIconItem {
  /** Identifier, unique within the board. */
  readonly id: string
  /** Label displayed under the tile. */
  readonly label: string
  /** Sign set on the glass. It is decorative: the name is the label. */
  readonly icon: ReactNode
}

/** Properties owned by the component. */
export interface GlassIconsOwnProps {
  /** The tiles, in order. */
  items: readonly GlassIconItem[]
  /** Name of the board for screen readers. */
  label: string
  /**
   * Called on click or on Enter on a tile.
   *
   * Required: a board of tiles exists to lead somewhere, and a button that
   * does nothing promises a follow-up that does not exist.
   */
  onSelect: (id: string) => void
  /** Tokens of the glows, assigned in order and cycling. */
  colors?: readonly string[]
  /** Side of a tile, in pixels. @defaultValue 76 */
  size?: number
  /** Blur of the glass, in pixels. @defaultValue 10 */
  blur?: number
  /** Three-quarter angle taken on hover, in degrees. @defaultValue 16 */
  tilt?: number
}

/** All the properties. */
export type GlassIconsProps = Customisable<GlassIconsOwnProps, 'ul'>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
  '--o-palette-sky-500',
  '--o-palette-emerald-500',
] as const

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-glass-icons'

/** Sets the board, the glow, the glass and their fallback, once per document. */
function ensureIconsRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-gicons]{',
    'display:flex;flex-wrap:wrap;justify-content:center;gap:1.25rem;',
    'margin:0;padding:0;list-style:none;',
    '}',
    '[data-o-gicons-target]{',
    'display:flex;flex-direction:column;align-items:center;gap:0.55rem;',
    'position:relative;padding:0;border:0;background:none;font:inherit;color:inherit;',
    'cursor:pointer;perspective:520px;',
    '}',
    'button[data-o-gicons-target]:focus-visible{outline:none}',
    // The glow: painted before the glass, hence in its backdrop.
    '[data-o-gicons-lueur]{',
    'position:absolute;top:0;left:50%;pointer-events:none;',
    'width:var(--o-gicons-cote);height:var(--o-gicons-cote);',
    'translate:-50% 0;border-radius:38%;',
    'background:radial-gradient(closest-side,var(--o-gicons-tint),transparent);',
    'transition:scale var(--o-duration-slow) var(--o-ease-emphasized),',
    'opacity var(--o-duration-slow) linear;',
    'opacity:0.75;',
    '}',
    '[data-o-gicons-verre]{',
    'display:flex;align-items:center;justify-content:center;',
    'width:var(--o-gicons-cote);height:var(--o-gicons-cote);',
    'border-radius:30%;position:relative;',
    'border:1px solid color-mix(in oklab,var(--o-palette-white) 34%,var(--o-theme-line));',
    'background:color-mix(in oklab,var(--o-gicons-tint) 10%,transparent);',
    '-webkit-backdrop-filter:blur(var(--o-gicons-blur)) saturate(180%);',
    'backdrop-filter:blur(var(--o-gicons-blur)) saturate(180%);',
    'box-shadow:inset 0 1px 0 color-mix(in oklab,var(--o-palette-white) 55%,transparent),',
    'inset 0 -1px 0 color-mix(in oklab,var(--o-gicons-tint) 45%,transparent),',
    '0 12px 26px -16px var(--o-gicons-tint);',
    'transform-style:preserve-3d;',
    'transition:transform var(--o-duration-slow) var(--o-ease-emphasized);',
    '}',
    '[data-o-gicons-signe]{display:flex;line-height:0;font-size:calc(var(--o-gicons-cote) * 0.4)}',
    '[data-o-gicons-nom]{font-size:0.8125em;color:var(--o-theme-muted);text-align:center}',
    // The hover state and the focus state are the same state: what the mouse
    // gets, the keyboard gets as well.
    '[data-o-gicons-target]:is(:hover,:focus-visible) [data-o-gicons-verre]{',
    'transform:translateY(-6px) rotateX(calc(var(--o-gicons-pivot) * -0.7)) rotateY(var(--o-gicons-pivot));',
    '}',
    '[data-o-gicons-target]:is(:hover,:focus-visible) [data-o-gicons-lueur]{scale:1.25;opacity:1}',
    '[data-o-gicons-target]:focus-visible [data-o-gicons-verre]{',
    'outline:2px solid var(--o-gicons-tint);outline-offset:4px;',
    '}',
    '[data-o-gicons-target]:active [data-o-gicons-verre]{transform:translateY(-2px) scale(0.96)}',
    // Without backdrop blur, the glow would no longer be spread out but set as
    // a sharp disc under a translucent plate: the tile closes and takes the hue.
    '@supports not ((backdrop-filter:blur(2px)) or (-webkit-backdrop-filter:blur(2px))){',
    '[data-o-gicons-verre]{background:color-mix(in oklab,var(--o-gicons-tint) 20%,var(--o-theme-surface))}',
    '[data-o-gicons-lueur]{display:none}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-gicons-verre],[data-o-gicons-lueur]{transition:none}',
    '[data-o-gicons-target]:is(:hover,:focus-visible) [data-o-gicons-verre]{transform:none}',
    '[data-o-gicons-target]:active [data-o-gicons-verre]{transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Board of glass tiles.
 *
 * @example
 * <GlassIcons
 *   label="Shortcuts"
 *   items={[
 *     { id: 'calendar', label: 'Calendar', icon: <Icon name="calendar" /> },
 *     { id: 'messages', label: 'Messages', icon: <Icon name="mail" /> },
 *   ]}
 *   onSelect={open}
 * />
 *
 * @example
 * // Wide tiles, thick glass, two hues alternating.
 * <GlassIcons
 *   label="Departments"
 *   items={aisles}
 *   colors={['--o-palette-violet-500', '--o-palette-amber-500']}
 *   size={110}
 *   blur={18}
 * />
 */
export function GlassIcons({
  items,
  label,
  onSelect,
  colors = DEFAULT_TOKENS,
  size = 76,
  blur = 10,
  tilt = 16,
  ...rest
}: GlassIconsProps): ReactElement {
  ensureIconsRules()

  const { className, style } = mergePresentation({}, rest)
  const hues = colors.length === 0 ? DEFAULT_TOKENS : colors

  return (
    <ul
      {...rest}
      aria-label={label}
      data-o-gicons=""
      className={className}
      style={
        {
          '--o-gicons-cote': `${String(size)}px`,
          '--o-gicons-blur': `${String(blur)}px`,
          '--o-gicons-pivot': `${String(tilt)}deg`,
          ...style,
        } as CSSProperties
      }
    >
      {items.map((item, index) => (
        <li
          key={item.id}
          style={
            {
              '--o-gicons-tint': `var(${hues[index % hues.length] ?? DEFAULT_TOKENS[0]})`,
            } as CSSProperties
          }
        >
          <button
            type="button"
            data-o-gicons-target=""
            onClick={() => {
              onSelect(item.id)
            }}
          >
            <span data-o-gicons-lueur="" aria-hidden="true" />
            <span data-o-gicons-verre="">
              <span data-o-gicons-signe="" aria-hidden="true">
                {item.icon}
              </span>
            </span>
            <span data-o-gicons-nom="">{item.label}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
