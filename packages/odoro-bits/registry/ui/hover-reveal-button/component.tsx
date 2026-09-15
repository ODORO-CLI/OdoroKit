/**
 * Button whose background unfolds from a point on hover.
 *
 * ## The label is written twice, and that is on purpose
 *
 * One copy leaves by the right, the other enters by the left. Both occupy the
 * same place, so that the width of the button does not change during the
 * switch — which a single text changed in place would not allow without
 * measuring, nor without making the layout of the neighbors jump.
 *
 * The incoming copy is removed from the accessibility tree: a screen reader
 * would otherwise announce the same label twice for a single button.
 *
 * ## The blob is not decorative
 *
 * It is what becomes the background. At rest, a dot of eight pixels; on hover,
 * it extends to the whole button and grows a little more, which gives the
 * impression that the color overflows. A plain change of `background-color`
 * would give the same final color without the origin of the movement.
 *
 * ## What changed compared to the original implementation
 *
 * Its width was frozen at `w-32`, which cut off any label longer than ten
 * characters. It is now derived from the content, with a minimum.
 *
 * And the icon was imported from a third-party library. Here it is a slot: the
 * project passes its own, or nothing.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type ReactElement, type ReactNode } from 'react'

/** Properties owned by the component. */
export interface HoverRevealButtonOwnProps {
  /** Label of the button. */
  children: ReactNode
  /**
   * What accompanies the label once the background is unfolded.
   *
   * A slot rather than an imposed icon: the registry depends on no glyph pack,
   * and the project has its own.
   */
  adornment?: ReactNode
  /** Tokens of the unfolded background and of the text on that background. */
  colors?: readonly [string, string]
}

/** All the properties. */
export type HoverRevealButtonProps = Customisable<HoverRevealButtonOwnProps, 'button'>

/** Tokens used by default. */
const DEFAULT_TOKENS = ['--o-palette-brand-600', '--o-palette-zinc-50'] as const

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-hover-reveal-button'

/** Sets the rules of the button, once per document. */
function ensureRevealRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-reveal]{position:relative;overflow:hidden;cursor:pointer;',
    'border-radius:360px;isolation:isolate}',

    // The blob, which becomes the background.
    '[data-o-reveal] [data-o-reveal-blob]{position:absolute;left:20%;top:40%;',
    'width:0.5rem;height:0.5rem;border-radius:0.5rem;z-index:-1;',
    'background-color:var(--o-reveal-bg);',
    'transition:all var(--o-duration-slow) var(--o-ease-standard)}',
    '[data-o-reveal]:is(:hover,:focus-visible) [data-o-reveal-blob]{',
    'left:0;top:0;width:100%;height:100%;scale:1.8}',

    // The two copies of the label, which cross without changing the width.
    '[data-o-reveal] [data-o-reveal-out]{display:inline-block;translate:0.25rem 0;',
    'transition:translate var(--o-duration-slow) var(--o-ease-standard),',
    'opacity var(--o-duration-slow) var(--o-ease-standard)}',
    '[data-o-reveal]:is(:hover,:focus-visible) [data-o-reveal-out]{',
    'translate:3rem 0;opacity:0}',

    '[data-o-reveal] [data-o-reveal-in]{position:absolute;inset:0;display:flex;',
    'align-items:center;justify-content:center;gap:0.5rem;',
    'color:var(--o-reveal-fg);translate:3rem 0;opacity:0;',
    'transition:translate var(--o-duration-slow) var(--o-ease-standard),',
    'opacity var(--o-duration-slow) var(--o-ease-standard)}',
    '[data-o-reveal]:is(:hover,:focus-visible) [data-o-reveal-in]{',
    'translate:-0.25rem 0;opacity:1}',

    // Under reduced motion, the final state is applied without the run: the
    // background is unfolded and the label legible as soon as hover starts,
    // without any sliding.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-reveal] [data-o-reveal-blob],[data-o-reveal] [data-o-reveal-out],',
    '[data-o-reveal] [data-o-reveal-in]{transition:none}',
    '[data-o-reveal]:is(:hover,:focus-visible) [data-o-reveal-out]{translate:0.25rem 0}}',
  ].join('')
  document.head.append(style)
}

/**
 * Button whose background unfolds on hover.
 *
 * @example
 * <HoverRevealButton>Contact us</HoverRevealButton>
 *
 * @example
 * // The adornment is a slot: the project passes its own icon.
 * <HoverRevealButton adornment={<Icon icon={ArrowRight} size={16} />}>
 *   Continue
 * </HoverRevealButton>
 */
export function HoverRevealButton({
  children,
  adornment,
  colors = DEFAULT_TOKENS,
  ...rest
}: HoverRevealButtonProps): ReactElement {
  ensureRevealRules()

  const { className, style } = mergePresentation(
    {
      className:
        'o-min-w-32 o-border-w-1 o-border-zinc-200 o-bg-transparent o-p-2 o-text-center o-font-semibold dark:o-border-zinc-800',
    },
    rest,
  )

  return (
    <button
      type="button"
      {...rest}
      data-o-reveal
      className={className}
      style={{
        ['--o-reveal-bg' as string]: `var(${colors[0]})`,
        ['--o-reveal-fg' as string]: `var(${colors[1]})`,
        ...style,
      }}
    >
      <span data-o-reveal-out>{children}</span>
      {/* The incoming copy carries the same text: it must not be announced a
          second time. */}
      <span aria-hidden data-o-reveal-in>
        <span>{children}</span>
        {adornment}
      </span>
      <span aria-hidden data-o-reveal-blob />
    </button>
  )
}
