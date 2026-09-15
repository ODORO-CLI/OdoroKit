/**
 * The component that renders every icon.
 *
 * ## The size follows the text
 *
 * An icon placed next to a word has to grow with it. The default size is
 * therefore `1em`: it equals the inherited font size, and an icon placed in a
 * heading is large without anything having to be set. A number forces a size
 * in pixels when the icon stands alone and follows no text.
 *
 * ## The color comes from the text, never from a property
 *
 * There is no `color` property. The drawing takes `currentColor`, so that a
 * text class — `o-text-brand-600`, `dark:o-text-zinc-100` — colors the icon
 * the way it colors the rest. A color property would create a second path,
 * which would diverge from the first at the first theme change.
 *
 * ## Accessibility has a default, and it is the right one
 *
 * The vast majority of icons are decorative: they double a word that is
 * already there. They are therefore **removed** from the accessibility tree by
 * default, which avoids a screen reader announcing "image" before every label.
 *
 * As soon as an icon carries the meaning on its own — a button without text —
 * `label` puts it back into the tree with its title. It is the right default
 * in both cases, and the wrong choice shows: a button without text and without
 * `label` is announced by nothing.
 *
 * @module
 */

import { createElement, type ReactElement, type SVGProps } from 'react'

import type { IconData } from './types.js'

/** Properties of the component. */
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** The icon to render, imported from one of the packs. */
  icon: IconData
  /**
   * Size of the side. A number means pixels, a string passes through as is.
   *
   * @defaultValue '1em'
   */
  size?: number | string
  /**
   * Title, for an icon that carries the meaning on its own.
   *
   * Absent, the icon is decorative and removed from the accessibility tree.
   */
  label?: string
  /**
   * Stroke weight, in the units of the box of the pack.
   *
   * No effect on a solid pack, whose drawing is a surface. The default is the
   * one the pack declares.
   */
  strokeWidth?: number
}

/**
 * Renders an icon.
 *
 * @example
 * // Decorative, next to a word: it grows with it.
 * <button className="o-inline-flex o-items-center o-gap-2 o-text-brand-600">
 *   <Icon icon={Download} />
 *   Download
 * </button>
 *
 * @example
 * // Alone in a button: it carries the meaning, so it has a title.
 * <button aria-label={undefined}>
 *   <Icon icon={X} label="Close" size={20} />
 * </button>
 */
export function Icon({
  icon,
  size = '1em',
  label,
  strokeWidth,
  ...rest
}: IconProps): ReactElement {
  const outline = icon.mode === 'outline'

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={icon.box}
      width={size}
      height={size}
      // The mode decides where the color goes. Both attributes are set in both
      // cases: without the explicit `fill="none"`, a stroked drawing is filled
      // by the browser default and turns into a blot.
      fill={outline ? 'none' : 'currentColor'}
      stroke={outline ? 'currentColor' : undefined}
      strokeWidth={outline ? (strokeWidth ?? icon.stroke) : undefined}
      strokeLinecap={outline ? 'round' : undefined}
      strokeLinejoin={outline ? 'round' : undefined}
      // An icon placed in a line of text aligns on the baseline, which makes
      // it float above the middle of the letters.
      focusable="false"
      aria-hidden={label === undefined ? true : undefined}
      role={label === undefined ? undefined : 'img'}
      aria-label={label}
      {...rest}
    >
      {icon.nodes.map(([tag, attributes], index) =>
        // The nodes are generated data, never markup: there is nothing to
        // escape, and no loophole left open for later.
        createElement(tag, { key: index, ...camel(attributes) }),
      )}
    </svg>
  )
}

/**
 * Translates SVG attributes into React properties.
 *
 * `fill-rule` and `clip-rule` are the only dashed attributes the packs use;
 * React expects them in camel case and silently ignores the other forms, which
 * breaks the drawings with holes — an `o` becomes a disc.
 */
function camel(attributes: Readonly<Record<string, string>>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(attributes)) {
    out[key.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())] = value
  }
  return out
}
