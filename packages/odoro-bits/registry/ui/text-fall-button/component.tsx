/**
 * Falling letters button: on hover, each letter of the label falls out of the
 * button, and a second row comes down to take its place.
 *
 * ## Two rows, a single label
 *
 * The label is written three times in the DOM, and only one of them counts
 * for accessibility: a readable copy, off screen, that screen readers
 * announce. The two visible rows are split into letters and taken out of the
 * accessibility tree — twenty `span` for a six letter word makes for an
 * unbearable reading, and the whole label is already there.
 *
 * The expanding background button also crosses two copies, but horizontally
 * and as a block; here the fall is vertical, and letter by letter.
 *
 * ## The offset is one variable per letter
 *
 * Each letter carries its index in `--o-fall-i`, and the stylesheet turns it
 * into a delay: `index x gap`. Hovering only changes a selector; there is no
 * loop, no state, no JavaScript on the event. The order is the same on the
 * way out and on the way back: the letters come back up the way they fell,
 * from left to right.
 *
 * ## The width does not move
 *
 * The second row is laid on top of the first, in absolute position, with the
 * same letters: the button always measures its label, and the neighbors do
 * not jump when it animates. The spaces are non breaking spaces, so that an
 * `inline-block` does not swallow them.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ElementType, type ReactElement } from 'react'

/** Properties specific to the component. */
export interface TextFallButtonOwnProps {
  /** Label of the button, as text: it is split into letters. */
  children: string
  /** Target of the link. With it, the button is rendered as a link. */
  href?: string
  /** Duration of the fall of one letter, in milliseconds. @defaultValue 380 */
  duration?: number
  /** Gap between two neighboring letters, in milliseconds. @defaultValue 22 */
  stagger?: number
  /** The row that comes down takes the brand hue. @defaultValue true */
  accent?: boolean
}

/** All properties. */
export type TextFallButtonProps = Customisable<TextFallButtonOwnProps, 'button'>

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-text-fall-button'

/** Sets up the two rows and their fall, once per document. */
function ensureFallRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-fall]{',
    'position:relative;overflow:hidden;cursor:pointer;',
    'display:inline-flex;align-items:center;justify-content:center;',
    'border:1px solid color-mix(in oklab,currentColor 25%,transparent);',
    'background:transparent;font:inherit;color:inherit;text-decoration:none;',
    'transition:border-color var(--o-fall-duration) linear;',
    '}',
    '[data-o-fall]:is(:hover,:focus-visible){border-color:var(--o-fall-accent)}',
    '[data-o-fall]:focus-visible{outline:2px solid currentColor;outline-offset:3px}',
    '[data-o-fall]:disabled,[data-o-fall][aria-disabled="true"]{',
    'opacity:0.5;cursor:not-allowed;pointer-events:none}',

    // The readable copy: off screen, never hidden from screen readers.
    '[data-o-fall-label]{position:absolute;width:1px;height:1px;overflow:hidden;',
    'clip-path:inset(50%);white-space:nowrap}',

    '[data-o-fall-row]{display:inline-block;white-space:nowrap}',
    '[data-o-fall-row="next"]{position:absolute;inset:0;',
    'display:inline-flex;align-items:center;justify-content:center;',
    'padding:inherit;color:var(--o-fall-next)}',
    '[data-o-fall-letter]{',
    'display:inline-block;',
    'transition:transform var(--o-fall-duration) cubic-bezier(0.4,0,0.7,0.2),',
    'opacity var(--o-fall-duration) linear;',
    'transition-delay:calc(var(--o-fall-i) * var(--o-fall-stagger));',
    '}',
    // The upper row waits above the button; it comes down with a curve that
    // slows, while the first one falls with a curve that speeds up.
    '[data-o-fall-row="next"] [data-o-fall-letter]{',
    'transform:translateY(-130%) rotate(-6deg);opacity:0;',
    'transition-timing-function:cubic-bezier(0.2,0.8,0.3,1),linear}',
    '[data-o-fall]:is(:hover,:focus-visible) [data-o-fall-row="first"] [data-o-fall-letter]{',
    'transform:translateY(130%) rotate(8deg);opacity:0}',
    '[data-o-fall]:is(:hover,:focus-visible) [data-o-fall-row="next"] [data-o-fall-letter]{',
    'transform:translateY(0) rotate(0);opacity:1}',

    // Reduced motion: the second row is already in place on hover, and the
    // first one fades out without falling.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-fall-letter]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** One row of letters, taken out of the accessibility tree. */
function Row({ text, role }: { text: string; role: 'first' | 'next' }): ReactElement {
  return (
    <span aria-hidden="true" data-o-fall-row={role}>
      {Array.from(text).map((char, index) => (
        <span
          key={index}
          data-o-fall-letter=""
          style={{ '--o-fall-i': String(index) } as CSSProperties}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  )
}

/**
 * Button whose letters fall on hover.
 *
 * @example
 * <TextFallButton onClick={download}>Download</TextFallButton>
 *
 * @example
 * // A link, slower fall and no change of hue.
 * <TextFallButton href="/journal" duration={600} stagger={35} accent={false}>
 *   Read the journal
 * </TextFallButton>
 */
export function TextFallButton({
  children,
  href,
  duration = 380,
  stagger = 22,
  accent = true,
  ...rest
}: TextFallButtonProps): ReactElement {
  const { reduced } = useMotionState()
  ensureFallRules()

  const { className, style } = mergePresentation(
    { className: 'o-rounded-full o-px-6 o-py-3 o-font-medium' },
    rest,
  )

  const Tag = (href === undefined ? 'button' : 'a') as ElementType
  const { disabled, type, ...attributes } = rest

  return (
    <Tag
      {...(href === undefined
        ? { type: type ?? 'button', disabled }
        : { href, 'aria-disabled': disabled === true ? 'true' : undefined })}
      {...attributes}
      data-o-fall=""
      className={className}
      style={
        {
          '--o-fall-duration': `${String(reduced ? 0 : duration)}ms`,
          '--o-fall-stagger': `${String(reduced ? 0 : stagger)}ms`,
          '--o-fall-accent': 'var(--o-palette-brand-500)',
          '--o-fall-next': accent ? 'var(--o-palette-brand-500)' : 'currentColor',
          ...style,
        } as CSSProperties
      }
    >
      <span data-o-fall-label="">{children}</span>
      <Row text={children} role="first" />
      <Row text={children} role="next" />
    </Tag>
  )
}
