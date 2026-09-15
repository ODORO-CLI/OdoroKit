/**
 * Split flap: each character scrolls past on hinged half-cards.
 *
 * ## Two halves, two leaves
 *
 * A cell is made of four superimposed layers: the fixed top half, the fixed
 * bottom half, and two leaves that pivot. A flip plays in two beats. The top
 * leaf carries the character in place and falls forward, uncovering behind it
 * the top half which already shows the next character; midway, the bottom leaf
 * starts back from the horizontal with that same next character and comes to
 * lie flat on the bottom half, which only takes the new character at the very
 * end.
 *
 * It is that offset that makes the card: at no moment does one see a character
 * substituted for another, one sees a panel fall back.
 *
 * ## One due time per cell, not one timer per cell
 *
 * Each cell knows the time of its next flip. The engine loop compares, and
 * triggers the ones that are due. A couple of dozen comparisons per frame cost
 * less than twenty timers waking up each on their own, and the offset between
 * cells stays correct whatever the refresh rate of the screen.
 *
 * The flip itself is handed to the compositor: two rotations per turned card,
 * nothing animated in JavaScript.
 *
 * ## The right text is the starting state
 *
 * The faces are rendered with the final character. It is the flipping code
 * that resets them to the blank card before scrolling: if that code never
 * runs, the board already shows what it must show.
 *
 * ## The split is a display device
 *
 * The complete text appears once, in one piece; the cells are removed from the
 * accessibility tree. Spaces are not cards: a station board separates its
 * words with emptiness, not with a flap that turns.
 *
 * ## Reduced motion
 *
 * No cell, no flip: the text is rendered as it is. That is the arrival state.
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
import { useEffect, type CSSProperties, type ElementType, type ReactElement } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** What triggers the flipping. */
export type SplitFlapTrigger = 'mount' | 'view' | 'hover'

/** Properties specific to the component. */
export interface SplitFlapOwnProps {
  /** Text to display. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /**
   * Characters of the reel, in the order the cards scroll past.
   *
   * The first one is the blank card: it is where each cell starts from. Any
   * character of the text absent from this list is added to it, otherwise it
   * would be unreachable.
   */
  alphabet?: string
  /** Duration of one flip, in milliseconds. @defaultValue 90 */
  interval?: number
  /** Starting delay between two cells, in milliseconds. @defaultValue 60 */
  step?: number
  /** Minimum width of a card, in ems. @defaultValue 0.72 */
  width?: number
  /**
   * When to flip.
   *
   * `view` waits for the entry into the viewport, `mount` starts right away,
   * `hover` replays on every entry of the pointer.
   *
   * @defaultValue 'view'
   */
  trigger?: SplitFlapTrigger
}

/** All properties. */
export type SplitFlapProps = Customisable<SplitFlapOwnProps, 'span'>

/** No-break space: an ordinary space collapses inside an inline block. */
const NBSP = '\u00A0'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-split-flap'

/**
 * Default reel: the blank card, then the capitals, the digits and the
 * punctuation of a departure board.
 */
const ALPHABET = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:;!?-'

/** Vanishing distance: short enough for the leaf to have a thickness. */
const PERSPECTIVE = '380px'

/** Sets the card mechanism, once per document. */
function ensureFlapRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-flap]{display:inline-block}',
    '[data-o-flap-cell]{',
    'position:relative;display:inline-block;text-align:center;',
    'min-width:var(--o-flap-width);perspective:var(--o-flap-vanish);',
    '}',
    // The parting line sits above everything: it is where the card splits,
    // including when a leaf is falling in front of it.
    '[data-o-flap-cell]::after{',
    'content:"";position:absolute;left:0;right:0;top:50%;height:1px;z-index:3;',
    'background-color:color-mix(in oklab, currentColor 30%, transparent);',
    '}',
    // The sizer gives the cell its width and its height: the four layers are
    // absolute and measure nothing.
    '[data-o-flap-sizer]{visibility:hidden}',
    '[data-o-flap-half],[data-o-flap-leaf]{',
    'position:absolute;left:0;right:0;height:50%;overflow:hidden;',
    'backface-visibility:hidden;',
    'background-color:color-mix(in oklab, currentColor 7%, transparent);',
    '}',
    '[data-o-flap-half]{z-index:1}',
    '[data-o-flap-leaf]{z-index:2;opacity:0}',
    '[data-o-flap-half="top"],[data-o-flap-leaf="top"]{top:0;transform-origin:50% 100%}',
    '[data-o-flap-half="bottom"],[data-o-flap-leaf="bottom"]{top:50%;transform-origin:50% 0%}',
    // The glyph occupies the whole height of the cell inside each half: it is
    // the window that shows its top or its bottom, never two different
    // drawings that would have to be made to coincide.
    '[data-o-flap-glyph]{',
    'position:absolute;left:0;right:0;top:0;height:200%;',
    'display:flex;align-items:center;justify-content:center;',
    '}',
    '[data-o-flap-half="bottom"] [data-o-flap-glyph],',
    '[data-o-flap-leaf="bottom"] [data-o-flap-glyph]{top:-100%}',
  ].join('')
  document.head.append(style)
}

/** What a cell keeps between two flips. */
interface Cell {
  /** Glyph of the fixed top half. It also carries the targeted card. */
  readonly top: HTMLElement
  /** Glyph of the fixed bottom half. */
  readonly bottom: HTMLElement
  /** Upper leaf. */
  readonly topLeaf: HTMLElement
  /** Glyph of the upper leaf. */
  readonly topGlyph: HTMLElement
  /** Lower leaf. */
  readonly bottomLeaf: HTMLElement
  /** Glyph of the lower leaf. */
  readonly bottomGlyph: HTMLElement
  /** Current position on the reel. */
  rank: number
  /** Flips left to play. */
  remaining: number
  /** Time of the next flip. */
  due: number
  /** Animations in flight, so that they can be cancelled. */
  animations: Animation[]
}

/** Reads one layer of a cell. */
function part(cell: Element, selector: string): HTMLElement | null {
  return cell.querySelector<HTMLElement>(selector)
}

/**
 * Displays a text like a split-flap departure board.
 *
 * @example
 * <SplitFlap as="h1" className="o-text-5xl o-font-bold">
 *   Odoro
 * </SplitFlap>
 *
 * @example
 * // Reel of digits only, fast flip, replayed on hover.
 * <SplitFlap alphabet=" 0123456789" interval={60} trigger="hover">
 *   1842
 * </SplitFlap>
 */
export function SplitFlap({
  children,
  as: Tag = 'span',
  alphabet = ALPHABET,
  interval = 90,
  step = 60,
  width = 0.72,
  trigger = 'view',
  ...rest
}: SplitFlapProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, inView } = useInView<HTMLElement>({
    immediate: trigger === 'mount',
  })

  ensureFlapRule()

  // The displayed text is in capitals: it is the convention of the board, and
  // it avoids having to double the reel. The announced text, for its part,
  // keeps its original case.
  const shown = children.toLocaleUpperCase()

  // Any character of the text absent from the reel is added to it: without
  // that the cell would turn forever without ever landing on its card.
  const reel = [...alphabet]
  for (const char of shown) {
    if (char !== ' ' && !reel.includes(char)) reel.push(char)
  }
  const reelText = reel.join('')

  useEffect(() => {
    const element = ref.current
    if (element === null || reduced) return

    const cards = [...reelText]
    const total = cards.length
    if (total < 2) return

    const blank = cards[0] ?? NBSP

    const cells: Cell[] = []
    for (const node of element.querySelectorAll('[data-o-flap-cell]')) {
      const top = part(node, '[data-o-flap-half="top"] [data-o-flap-glyph]')
      const bottom = part(node, '[data-o-flap-half="bottom"] [data-o-flap-glyph]')
      const topLeaf = part(node, '[data-o-flap-leaf="top"]')
      const bottomLeaf = part(node, '[data-o-flap-leaf="bottom"]')
      const topGlyph = part(node, '[data-o-flap-leaf="top"] [data-o-flap-glyph]')
      const bottomGlyph = part(node, '[data-o-flap-leaf="bottom"] [data-o-flap-glyph]')
      if (
        top === null ||
        bottom === null ||
        topLeaf === null ||
        bottomLeaf === null ||
        topGlyph === null ||
        bottomGlyph === null
      ) {
        continue
      }
      cells.push({
        top,
        bottom,
        topLeaf,
        topGlyph,
        bottomLeaf,
        bottomGlyph,
        rank: 0,
        remaining: 0,
        due: 0,
        animations: [],
      })
    }
    if (cells.length === 0) return

    let subscription: { unsubscribe(): void } | null = null

    const stop = (): void => {
      subscription?.unsubscribe()
      subscription = null
      for (const cell of cells) {
        for (const animation of cell.animations) animation.cancel()
        cell.animations = []
        cell.remaining = 0
      }
    }

    /** Plays one flip: the top leaf falls, the bottom one lies flat. */
    const flip = (cell: Cell): void => {
      const nextRank = (cell.rank + 1) % total
      const inPlace = cards[cell.rank] ?? blank
      const upcoming = cards[nextRank] ?? blank

      // The top half takes the upcoming character right away: it is what the
      // leaf uncovers as it falls.
      cell.top.textContent = upcoming
      cell.topGlyph.textContent = inPlace
      cell.bottomGlyph.textContent = upcoming

      const half = Math.max(1, interval / 2)

      const fall = cell.topLeaf.animate(
        [
          { transform: 'rotateX(0deg)', opacity: 1 },
          { transform: 'rotateX(-90deg)', opacity: 1 },
        ],
        { duration: half, easing: 'ease-in', fill: 'none' },
      )
      const settle = cell.bottomLeaf.animate(
        [
          { transform: 'rotateX(90deg)', opacity: 1 },
          { transform: 'rotateX(0deg)', opacity: 1 },
        ],
        { duration: half, delay: half, easing: 'ease-out', fill: 'forwards' },
      )
      // The leaf holds its pose until the bottom half has taken over: without
      // that overlap, one frame would show the old character back.
      settle.onfinish = (): void => {
        cell.bottom.textContent = upcoming
        settle.cancel()
      }

      cell.animations = [fall, settle]
      cell.rank = nextRank
    }

    const play = (): void => {
      stop()

      const started = performance.now()
      cells.forEach((cell, index) => {
        const aimed = cards.indexOf(cell.top.dataset['oFlapCible'] ?? '')
        const target = aimed < 0 ? 0 : aimed

        cell.rank = 0
        cell.top.textContent = blank
        cell.bottom.textContent = blank
        cell.topGlyph.textContent = blank
        cell.bottomGlyph.textContent = blank

        // A cell already on its card would make a full turn rather than stay
        // still while its neighbours turn.
        cell.remaining = target === 0 ? total : target
        cell.due = started + index * step
      })

      subscription = clock.subscribe(
        () => {
          const now = performance.now()
          let left = 0
          for (const cell of cells) {
            if (cell.remaining <= 0) continue
            left += 1
            if (now < cell.due) continue
            flip(cell)
            cell.remaining -= 1
            cell.due = now + interval
          }
          // The board has settled: nothing left to compare.
          if (left === 0) {
            subscription?.unsubscribe()
            subscription = null
          }
        },
        { name: 'split flap', priority: CLOCK_PRIORITY.layout },
      )
    }

    if (trigger === 'hover') {
      const onEnter = (): void => {
        play()
      }
      element.addEventListener('pointerenter', onEnter)
      return () => {
        element.removeEventListener('pointerenter', onEnter)
        stop()
      }
    }

    if (!inView) {
      // The blank cards are applied here, not in the render: see the header.
      // Without that, the board would show its text then empty itself all at
      // once on entering the viewport.
      for (const cell of cells) {
        cell.top.textContent = blank
        cell.bottom.textContent = blank
      }
      return
    }

    play()
    return stop
  }, [ref, reduced, inView, shown, reelText, interval, step, trigger])

  const { className, style } = mergePresentation({}, rest)

  // Reduced motion: the text is there, settled, with no cells.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const rootStyle = {
    ...style,
    '--o-flap-width': `${String(width)}em`,
    '--o-flap-vanish': PERSPECTIVE,
  } as CSSProperties

  const chars = [...shown]

  return (
    <Tag {...rest} ref={ref} className={className} style={rootStyle} data-o-flap="">
      {/* The complete text, in one piece, for screen readers. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {chars.map((char, index) =>
          char === ' ' ? (
            <span key={`space-${String(index)}`}>{NBSP}</span>
          ) : (
            <span key={`${char}-${String(index)}`} data-o-flap-cell="">
              <span data-o-flap-sizer="">{char}</span>
              <span data-o-flap-half="top">
                {/* The targeted card travels on the node: the flipping code
                    reads it back at the start, without coming down through the
                    React render. */}
                <span data-o-flap-glyph="" data-o-flap-target={char}>
                  {char}
                </span>
              </span>
              <span data-o-flap-half="bottom">
                <span data-o-flap-glyph="">{char}</span>
              </span>
              <span data-o-flap-leaf="top">
                <span data-o-flap-glyph="">{char}</span>
              </span>
              <span data-o-flap-leaf="bottom">
                <span data-o-flap-glyph="">{char}</span>
              </span>
            </span>
          ),
        )}
      </span>
    </Tag>
  )
}
