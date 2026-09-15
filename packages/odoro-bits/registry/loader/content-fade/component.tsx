/**
 * Content fade: the real content, revealed section by section, each one
 * slightly after the previous.
 *
 * ## The other half of the skeleton
 *
 * A skeleton says the waiting; it says nothing of the arrival. Yet it is the
 * arrival that shows: ten blocks turning into ten real paragraphs within the
 * same frame is a jolt, and the eye loses track of where it was. This
 * component is the missing half — it wraps the **real** content and lets it
 * appear in reading order.
 *
 * Nothing is simulated here: the children are in the document from the first
 * render, with their text, their links and their layout. Only their appearance
 * is delayed. A component that replaced the content with blocks for the length
 * of the fade would take the text out of the accessibility tree and put it back
 * for nothing.
 *
 * ## A fade that does not replay
 *
 * The animation is declared `forwards` and does not loop: it brings things to
 * the final state and holds there. Looping it would turn a passage into a
 * blink, and blinking content reads as a fault, not as an arrival.
 *
 * The vertical offset is short — fourteen pixels by default. Beyond that, the
 * movement becomes a stage entrance, and a stage entrance on a paragraph of
 * text is more noticeable than the paragraph.
 *
 * ## A status beside, not around
 *
 * The label lives in a `role="status"` area of its own, beside the content and
 * not around it: a live region containing the whole page would have every
 * section announced as it appears.
 *
 * Under reduced motion, everything is visible immediately, in its final place:
 * that is the final state, the one the fade was heading for.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { Children, type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-content-fade'

/** Sets up the fade of the sections, once per document. */
function ensureContentFadeRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-cfade]{display:block;width:100%}',
    '[data-o-cfade-part]{',
    'display:block;opacity:0;transform:translateY(var(--o-cfade-shift));',
    // `forwards`: the final state is held, the fade never replays.
    'animation:o-cfade-in var(--o-cfade-speed) var(--o-ease-standard) var(--o-cfade-delay) forwards;',
    '}',
    '@keyframes o-cfade-in{to{opacity:1;transform:none}}',
    // The final state, straight away: that is indeed where the fade was going.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-cfade-part]{animation:none;opacity:1;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface ContentFadeOwnProps {
  /** The sections to reveal, in the order they should appear. */
  children?: ReactNode
  /** Duration of the fade of one section, in milliseconds. @defaultValue 650 */
  speed?: number
  /** Gap between two sections, in milliseconds. @defaultValue 140 */
  stagger?: number
  /** Wait before the first section, in milliseconds. @defaultValue 0 */
  delay?: number
  /** Distance travelled by a section as it appears, in pixels. @defaultValue 14 */
  shift?: number
  /** Label announced to screen readers. @defaultValue 'Contenu en cours d affichage' */
  label?: string
}

/** All the props. */
export type ContentFadeProps = Customisable<ContentFadeOwnProps, 'div'>

/**
 * Reveals real content, section by section.
 *
 * @example
 * <ContentFade>
 *   <h2>Titre</h2>
 *   <p>Premier paragraphe.</p>
 *   <p>Second paragraphe.</p>
 * </ContentFade>
 *
 * @example
 * // A slower arrival, after half a second of waiting.
 * <ContentFade speed={900} stagger={220} delay={500}>{sections}</ContentFade>
 */
export function ContentFade({
  children,
  speed = 650,
  stagger = 140,
  delay = 0,
  shift = 14,
  label = 'Contenu en cours d affichage',
  ...rest
}: ContentFadeProps): ReactElement {
  ensureContentFadeRule()

  // `toArray` rather than `map`: it drops the empty slots and sets stable keys,
  // without which a conditional section would shift the whole rhythm.
  const parts = Children.toArray(children)

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-cfade-speed': `${String(speed)}ms`,
    '--o-cfade-shift': `${String(shift)}px`,
  } as CSSProperties

  return (
    <div {...rest} className={className} style={hostStyle} data-o-cfade="">
      <span className="o-sr-only" role="status">
        {label}
      </span>
      {parts.map((part, index) => (
        <span
          // The key is the index: the order of the sections is precisely what
          // carries the rhythm, and it does not get reordered.
          key={index}
          data-o-cfade-part=""
          style={
            {
              '--o-cfade-delay': `${String(delay + stagger * index)}ms`,
            } as CSSProperties
          }
        >
          {part}
        </span>
      ))}
    </div>
  )
}
