/**
 * Curtain footer: the page slides over it, it is uncovered underneath.
 *
 * ## How the curtain holds
 *
 * The footer is `fixed`, and its wrapper carries a `clip-path`. That is the
 * only piece of the assembly: a clipped element becomes a containing block for
 * its fixed descendants, so that the footer does not stick to the window but
 * stays bounded to the wrapper. It therefore appears as the wrapper enters the
 * view, without any JavaScript moving it.
 *
 * Removing the `clip-path` breaks the effect silently: the footer then sticks
 * to the window and stays visible over the whole page.
 *
 * ## What is entrusted to the scroll, and what is not
 *
 * The background word and the center block are driven by the progress of the
 * scroll. Nothing else. The curtain is layout: entrusting it to an animation
 * would make it depend on a measurement, when it follows from the geometry.
 *
 * Under reduced motion, `useScrollScrub` applies the **final** state once: the
 * content is in place, without travel. The curtain keeps working, since it
 * animates nothing — it is the page that scrolls.
 *
 * ## Why the colors go through two variables
 *
 * The system has no semantic layer: there is neither `--foreground` nor
 * `--background` to query. The gradients, the grid mask and the glass need one
 * nonetheless, and writing them hard-coded would freeze them in one theme.
 *
 * The wrapper therefore declares two private variables, defined in both themes
 * from the palette. They are the only ones of the component, and they do not
 * leave it.
 *
 * @module
 */

import {
  mergePresentation,
  useMotionState,
  useScrollScrub,
  type Customisable,
} from '@odoro-cli/engine'
import { useRef, type ReactElement, type ReactNode } from 'react'

import { Magnetic } from '@registre/effect/Magnetic'
import { Marquee } from '@registre/effect/Marquee'

/** Props specific to the component. */
export interface CinematicFooterOwnProps {
  /** Title of the center block. */
  heading?: ReactNode
  /** Word set in the background, behind everything else. */
  word?: string
  /** Content of the scrolling banner. Nothing is displayed if it is absent. */
  banner?: ReactNode
  /** Main actions, rendered as magnetic pills. */
  actions?: ReactNode
  /** Secondary links, rendered as smaller pills. */
  links?: ReactNode
  /** Footer notice, on the left. */
  copyright?: ReactNode
  /** Signature, in the center of the bottom bar. */
  signature?: ReactNode
  /** Label of the back-to-top button. @defaultValue 'Back to top' */
  topLabel?: string
}

/** All the props. */
export type CinematicFooterProps = Customisable<CinematicFooterOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-cinematic-footer'

/**
 * Sets the footer rules, once per document.
 *
 * Everything here is out of reach of the utilities: a text stroke, a gradient
 * mask, a grid background, a mixed hue. The rest of the dressing stays in
 * classes.
 */
function ensureFooterRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const palette = [
    '[data-o-footer]{',
    '--o-footer-ink:var(--o-palette-zinc-950);',
    '--o-footer-ground:var(--o-palette-zinc-50);',
    '--o-footer-glow-a:var(--o-palette-brand-500);',
    '--o-footer-glow-b:var(--o-palette-fuchsia-500)}',
  ].join('')

  const dark = [
    '[data-o-footer]{',
    '--o-footer-ink:var(--o-palette-zinc-50);',
    '--o-footer-ground:var(--o-palette-zinc-950)}',
  ].join('')

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    palette,
    `:root[data-theme="dark"] ${dark}`,
    `@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) ${dark}}`,

    // Halo: a radial glow that breathes slowly.
    '[data-o-footer-glow]{background:radial-gradient(circle at 50% 50%,',
    'color-mix(in oklch,var(--o-footer-glow-a) 18%,transparent) 0%,',
    'color-mix(in oklch,var(--o-footer-glow-b) 18%,transparent) 40%,transparent 70%);',
    'animation:o-footer-breathe 8s var(--o-ease-standard) infinite alternate}',
    '@keyframes o-footer-breathe{to{transform:translate(-50%,-50%) scale(1.1)}}',

    // Background grid, faded out at both ends.
    '[data-o-footer-grid]{background-size:60px 60px;background-image:',
    'linear-gradient(to right,color-mix(in oklch,var(--o-footer-ink) 6%,transparent) 1px,transparent 1px),',
    'linear-gradient(to bottom,color-mix(in oklch,var(--o-footer-ink) 6%,transparent) 1px,transparent 1px);',
    '-webkit-mask:linear-gradient(to bottom,transparent,black 30%,black 70%,transparent);',
    'mask:linear-gradient(to bottom,transparent,black 30%,black 70%,transparent)}',

    // Background word: a stroke, and a gradient that fades out downwards.
    '[data-o-footer-word]{font-size:26vw;line-height:0.75;letter-spacing:-0.05em;',
    'color:transparent;-webkit-text-stroke:1px color-mix(in oklch,var(--o-footer-ink) 10%,transparent);',
    'background:linear-gradient(180deg,color-mix(in oklch,var(--o-footer-ink) 14%,transparent) 0%,transparent 60%);',
    '-webkit-background-clip:text;background-clip:text}',

    // Glass: a mixed background, a hairline, and a backdrop blur.
    '[data-o-footer-pill]{background:linear-gradient(145deg,',
    'color-mix(in oklch,var(--o-footer-ink) 5%,transparent) 0%,',
    'color-mix(in oklch,var(--o-footer-ink) 2%,transparent) 100%);',
    'border:1px solid color-mix(in oklch,var(--o-footer-ink) 10%,transparent);',
    'box-shadow:0 10px 30px -10px color-mix(in oklch,var(--o-footer-ground) 50%,transparent);',
    '-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);',
    'transition:background var(--o-duration-slow) var(--o-ease-standard),',
    'border-color var(--o-duration-slow) var(--o-ease-standard)}',
    '[data-o-footer-pill]:hover{',
    'background:linear-gradient(145deg,',
    'color-mix(in oklch,var(--o-footer-ink) 10%,transparent) 0%,',
    'color-mix(in oklch,var(--o-footer-ink) 4%,transparent) 100%);',
    'border-color:color-mix(in oklch,var(--o-footer-ink) 22%,transparent)}',

    // Beat: the color comes from the text, so from a class, so from a token.
    '[data-o-footer-beat]{animation:o-footer-beat 2s var(--o-ease-standard) infinite}',
    '@keyframes o-footer-beat{0%,100%{transform:scale(1)}15%,45%{transform:scale(1.18)}30%{transform:scale(1)}}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-footer-glow],[data-o-footer-beat]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Footer uncovered by the scroll.
 *
 * @example
 * <CinematicFooter
 *   heading="Shall we start?"
 *   word="ODORO"
 *   actions={<a href="/contact">Write to us</a>}
 *   copyright="© 2026 Odoro"
 * />
 *
 * @example
 * // The banner is a slot: it receives what the page has to say.
 * <CinematicFooter banner={<span className="o-px-8">Available in March</span>} />
 */
export function CinematicFooter({
  heading = 'Shall we start?',
  word,
  banner,
  actions,
  links,
  copyright,
  signature,
  topLabel = 'Back to top',
  ...rest
}: CinematicFooterProps): ReactElement {
  const { reduced } = useMotionState()
  const wordRef = useRef<HTMLDivElement | null>(null)
  const centerRef = useRef<HTMLDivElement | null>(null)

  ensureFooterRules()

  // A single measurement for both movements: two triggers over the same range
  // would produce two readings of the same progress.
  const { ref } = useScrollScrub<HTMLDivElement>(
    (progress) => {
      // The name avoids the one of the prop: the closure captures it, and two
      // "word" two lines apart read back badly.
      const backdrop = wordRef.current
      if (backdrop !== null) {
        backdrop.style.transform = `translate3d(-50%,${String((1 - progress) * 10)}vh,0) scale(${String(0.86 + progress * 0.14)})`
        backdrop.style.opacity = progress.toFixed(3)
      }

      const center = centerRef.current
      if (center !== null) {
        // The center block arrives later than the word: the lower half of the
        // travel is enough for it, and it lands in place before the bottom bar.
        const own = Math.max(0, Math.min(1, (progress - 0.35) / 0.45))
        center.style.transform = `translate3d(0,${String((1 - own) * 50)}px,0)`
        center.style.opacity = own.toFixed(3)
      }
    },
    { start: 'top bottom', end: 'bottom bottom', name: 'footer' },
  )

  const { className, style } = mergePresentation(
    { className: 'o-relative o-h-screen o-w-full' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={ref}
      data-o-footer
      className={className}
      style={{
        // The clip is what bounds the fixed footer to this wrapper. Without
        // it, it would stick to the window over the whole page.
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        ...style,
      }}
    >
      <footer className="o-fixed o-bottom-0 o-left-0 o-flex o-h-screen o-w-full o-flex-col o-justify-between o-overflow-hidden o-bg-zinc-50 o-text-zinc-950 dark:o-bg-zinc-950 dark:o-text-zinc-50">
        <div
          aria-hidden
          data-o-footer-glow
          className="o-pointer-events-none o-absolute o-left-1/2 o-top-1/2 o-h-1/2 o-w-4/5 o-rounded-full o-blur-3xl"
          style={{ transform: 'translate(-50%,-50%)' }}
        />
        <div
          aria-hidden
          data-o-footer-grid
          className="o-pointer-events-none o-absolute o-inset-0"
        />

        {/* The recentering is set from the start: the scroll measurement only
            arrives after the first paint, and the word would jump by half a
            width between the two. */}
        {word === undefined ? null : (
          <div
            aria-hidden
            ref={wordRef}
            data-o-footer-word
            style={{ transform: 'translate3d(-50%,0,0)' }}
            className="o-pointer-events-none o-absolute o-bottom-0 o-left-1/2 o-select-none o-whitespace-nowrap o-font-bold"
          >
            {word}
          </div>
        )}

        {banner === undefined ? null : (
          <Marquee
            className="o-absolute o-top-12 o-w-full o-border-t o-border-b o-border-zinc-200 o-py-4 o-text-xs o-font-bold o-uppercase o-tracking-widest o-text-zinc-500 dark:o-border-zinc-800"
            style={{ transform: 'rotate(-2deg) scale(1.1)' }}
          >
            {banner}
          </Marquee>
        )}

        <div
          ref={centerRef}
          className="o-relative o-mx-auto o-flex o-flex-1 o-w-full o-max-w-5xl o-flex-col o-items-center o-justify-center o-gap-10 o-px-6"
        >
          <h2 className="o-text-center o-text-5xl o-font-bold o-tracking-tight md:o-text-7xl">
            {heading}
          </h2>

          {actions === undefined ? null : (
            <div className="o-flex o-flex-wrap o-justify-center o-gap-4">{actions}</div>
          )}

          {links === undefined ? null : (
            <div className="o-flex o-flex-wrap o-justify-center o-gap-3">{links}</div>
          )}
        </div>

        <div className="o-relative o-flex o-flex-col o-items-center o-justify-between o-gap-6 o-px-6 o-pb-8 md:o-flex-row md:o-px-12">
          {copyright === undefined ? (
            // An empty paragraph still takes its line: the bottom bar would
            // end up off-center for the sole reason that a notice was not
            // provided.
            <span />
          ) : (
            <p className="o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
              {copyright}
            </p>
          )}

          {signature === undefined ? null : (
            <p
              data-o-footer-pill
              className="o-flex o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-xs o-uppercase o-tracking-widest o-text-zinc-500"
            >
              {signature}
              <span
                aria-hidden
                data-o-footer-beat={reduced ? undefined : ''}
                className="o-text-red-500"
              >
                &#10084;
              </span>
            </p>
          )}

          <Magnetic>
            <button
              type="button"
              data-o-footer-pill
              onClick={() => {
                window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
              }}
              className="o-flex o-h-12 o-w-12 o-items-center o-justify-center o-rounded-full o-text-zinc-500 hover:o-text-zinc-950 dark:hover:o-text-zinc-50"
            >
              <span className="o-sr-only">{topLabel}</span>
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="o-h-5 o-w-5"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </Magnetic>
        </div>
      </footer>
    </div>
  )
}
