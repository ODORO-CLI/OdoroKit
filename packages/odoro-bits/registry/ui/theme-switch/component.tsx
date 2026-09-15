/**
 * Day night switch: a sun that turns into a moon.
 *
 * ## Decorative, and honest about it
 *
 * This component does not touch the theme of the site: it exposes a state
 * and reports it, that is all. Wiring the toggle to a real theme change is
 * the work of the page — a registry component writing on
 * `document.documentElement` would take a decision that is not its own to
 * take.
 *
 * ## A `role="switch"`, not a checkbox
 *
 * The element is a button with `role="switch"` and `aria-checked`: screen
 * readers announce "on / off", the exact vocabulary of a switch. A checkbox
 * would announce "checked", which describes a form, not a toggle of
 * ambience.
 *
 * ## The sun and the moon are two stacked drawings
 *
 * Each one rotates and fades out as it crosses the other: the morphing is a
 * rotation plus a crossfade, two composited properties. The stars are only
 * dots whose opacity follows the night state, with a slight delay so that
 * they light up after the moon has arrived.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useState, type CSSProperties, type ReactElement } from 'react'

/** Props specific to this component. */
export interface ThemeSwitchOwnProps {
  /** Night state, in controlled mode. */
  checked?: boolean
  /** State at mount, in uncontrolled mode. @defaultValue false */
  defaultChecked?: boolean
  /** Called when the user toggles. */
  onCheckedChange?: (checked: boolean) => void
  /** Height of the switch, in pixels. @defaultValue 32 */
  size?: number
  /** Name of the toggle for screen readers. @defaultValue 'Night mode' */
  label?: string
}

/** All props. */
export type ThemeSwitchProps = Customisable<ThemeSwitchOwnProps, 'button'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-theme-switch'

/** Sets the track, the thumb and the stars, once per document. */
function ensureSwitchRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-daynight]{',
    'position:relative;display:inline-flex;align-items:center;cursor:pointer;',
    'width:calc(var(--o-daynight-size) * 1.875);height:var(--o-daynight-size);',
    'border-radius:999px;border:0;padding:0;',
    'background:var(--o-daynight-day);',
    'transition:background-color var(--o-duration-slow) var(--o-ease-standard);',
    '}',
    '[data-o-daynight][aria-checked="true"]{background:var(--o-daynight-night)}',

    // The thumb carries both drawings and slides from one edge to the other.
    '[data-o-daynight-thumb]{',
    'position:absolute;top:10%;left:5%;height:80%;aspect-ratio:1;',
    'transform:translateX(0);',
    'transition:transform var(--o-duration-slow) var(--o-ease-standard);',
    '}',
    '[data-o-daynight][aria-checked="true"] [data-o-daynight-thumb]{',
    'transform:translateX(calc(var(--o-daynight-size) * 0.875));',
    '}',
    '[data-o-daynight-thumb] svg{',
    'position:absolute;inset:0;width:100%;height:100%;',
    'transition:transform var(--o-duration-slow) var(--o-ease-standard),',
    'opacity var(--o-duration-slow) linear;',
    '}',
    // Crossed rotation: each body arrives turning, and leaves turning.
    '[data-o-daynight-sun]{color:var(--o-daynight-sunlight);opacity:1;transform:rotate(0deg)}',
    '[data-o-daynight-moon]{color:var(--o-daynight-moonlight);opacity:0;transform:rotate(-90deg)}',
    '[data-o-daynight][aria-checked="true"] [data-o-daynight-sun]{opacity:0;transform:rotate(90deg)}',
    '[data-o-daynight][aria-checked="true"] [data-o-daynight-moon]{opacity:1;transform:rotate(0deg)}',

    // The stars light up after the moon has arrived.
    '[data-o-daynight-star]{',
    'position:absolute;border-radius:999px;background:var(--o-daynight-moonlight);',
    'width:calc(var(--o-daynight-size) * 0.08);height:calc(var(--o-daynight-size) * 0.08);',
    'opacity:0;transform:scale(0.4);',
    'transition:opacity var(--o-duration-slow) linear,',
    'transform var(--o-duration-slow) var(--o-ease-standard);',
    '}',
    '[data-o-daynight][aria-checked="true"] [data-o-daynight-star]{',
    'opacity:0.9;transform:scale(1);transition-delay:calc(var(--o-duration-slow) / 2);',
    '}',

    // Reduced motion: the toggle is instant, the state stays readable.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-daynight],[data-o-daynight-thumb],[data-o-daynight-thumb] svg,',
    '[data-o-daynight-star]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Positions of the three stars, as a percentage of the track. */
const STARS = [
  { left: '18%', top: '25%' },
  { left: '30%', top: '58%' },
  { left: '42%', top: '32%' },
] as const

/**
 * Decorative switch between day and night.
 *
 * @example
 * <ThemeSwitch defaultChecked={false} />
 *
 * @example
 * // Controlled mode: the page listens, and applies its theme itself.
 * <ThemeSwitch checked={night} onCheckedChange={setNight} size={40} />
 */
export function ThemeSwitch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  size = 32,
  label = 'Night mode',
  ...rest
}: ThemeSwitchProps): ReactElement {
  const { reduced } = useMotionState()
  const [internal, setInternal] = useState(defaultChecked)
  ensureSwitchRules()

  const isNight = checked ?? internal

  const toggle = (): void => {
    const next = !isNight
    if (checked === undefined) setInternal(next)
    onCheckedChange?.(next)
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <button
      type="button"
      {...rest}
      role="switch"
      aria-checked={isNight}
      aria-label={label}
      onClick={toggle}
      data-o-daynight=""
      className={className}
      style={
        {
          ...style,
          '--o-daynight-size': `${String(size)}px`,
          '--o-daynight-day': 'var(--o-palette-sky-400)',
          '--o-daynight-night': 'var(--o-palette-indigo-950)',
          '--o-daynight-sunlight': 'var(--o-palette-amber-400)',
          '--o-daynight-moonlight': 'var(--o-palette-zinc-50)',
          ...(reduced ? { '--o-duration-slow': '0ms' } : {}),
        } as CSSProperties
      }
    >
      <span data-o-daynight-thumb="" aria-hidden="true">
        <svg data-o-daynight-sun="" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="5" />
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="2" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="22" />
            <line x1="2" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="22" y2="12" />
            <line x1="4.9" y1="4.9" x2="6.3" y2="6.3" />
            <line x1="17.7" y1="17.7" x2="19.1" y2="19.1" />
            <line x1="4.9" y1="19.1" x2="6.3" y2="17.7" />
            <line x1="17.7" y1="6.3" x2="19.1" y2="4.9" />
          </g>
        </svg>
        <svg data-o-daynight-moon="" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      </span>
      {STARS.map((star) => (
        <span
          key={star.left}
          data-o-daynight-star=""
          aria-hidden="true"
          style={{ left: star.left, top: star.top }}
        />
      ))}
    </button>
  )
}
