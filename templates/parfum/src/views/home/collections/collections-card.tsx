import { useState } from "react";
import { animated } from "@react-spring/web";

import { Inview } from "@/components/animation/springs/in-view";
import { ScrambleText } from "@/components/ui/scramble-text";
import { usePointerTilt } from "@/hooks/use-pointer-tilt";

import { COLLECTIONS_REVEAL } from "./collections.motion";
import type { CollectionsProduct } from "./collections.types";

export interface CollectionsCardProps extends CollectionsProduct {
  /** Position in the row, used to stagger the reveal. */
  order: number;
}

/** Frame units → rem against the 1440 base, where the root font-size is 16. */
const units = (value: number) => `${value / 16}rem`;

const TRANSITION = "o-transition pf-duration-var-duration-normal pf-ease-entrance";

/**
 * One product card (Figma 1923:2053 and siblings).
 *
 * The card is a fixed 446 units tall with its contents pushed apart, so the tag
 * chips sit on the bottom padding edge whether the title runs to one line or
 * two. The photographs are placed absolutely *behind* that column rather than
 * being flow items between the two: they overlap neither, and taking them out
 * of flow is what lets the title and the chips keep their own anchors.
 *
 * The title is held to 217 units — not a decoration, it is what forces the
 * frame's line break before "JACKET" on all four names. Left to the card's full
 * 297-unit column, "SHADOW PUFFER JACKET" fits on one line and the break is
 * lost. 217 is the widest of the four the frame sets; the other three do not
 * reach it, so one value reproduces every break.
 *
 * **Unfilled, back to the exported frame.** These carried the same opaque
 * lattice the details, technology and FAQ panels do — added because a
 * transparent card let the page's own grid run through the garment and the four
 * read as cut-outs. The client has reversed that: the cards are their border
 * and their contents now, and the page runs behind them. The garments are
 * lit-on-black renders, so what the grid actually shows through is their ground,
 * not the jackets.
 *
 * It also means the card no longer carries its own copy of the pointer
 * highlight — it gets the page's, through the hole where its fill used to be,
 * which is the same light from one source rather than two in phase.
 *
 * **The swatch column is a view switcher**, not decoration: it turns the
 * garment. Every view is rendered and cross-faded rather than swapped, so the
 * card never flashes an empty box while a photograph decodes and the switch
 * costs only an opacity change. One photograph per product exists so far, so
 * the other swatches currently land on it — the control is real, the pictures
 * are missing.
 *
 * **The hover state is an addition to the frame**, on the client's call: the tag
 * chips give way to a SHOP NOW link and the price lifts from 40% to full. It
 * keys off `focus-within` as well as hover, so the link is reachable by
 * keyboard instead of being a mouse-only control, and the chips and the link
 * are both absolutely positioned in one band, so the swap cannot change the
 * card's height.
 *
 * **So is the tilt**, on the same call: the card turns towards the corner the
 * cursor is in, and the garment stands off its face rather than being printed
 * on it. Three elements make that work and each has one job — the `li` owns
 * the lens (`perspective`), the panel inside it owns the rotation and
 * `preserve-3d`, and the photographs sit in a layer of their own with a
 * `translateZ`. The layer's parallax is then the perspective's own doing, not
 * a second animation kept in step with the first. See `use-pointer-tilt`.
 *
 * **The panel moved off the `li` to make room for that.** The reveal writes a
 * transform, and an element can only have one — the tilt and the entrance
 * would have overwritten each other on the same node. The `li` keeps the
 * reveal and the row's own sizing; everything the reader sees as the card is
 * one level in.
 */
export const CollectionsCard = ({
  index,
  name,
  price,
  views,
  swatches,
  defaultView,
  tags,
  href,
  order,
}: CollectionsCardProps) => {
  const [view, setView] = useState(defaultView);
  const delay = COLLECTIONS_REVEAL.card + order * COLLECTIONS_REVEAL.cardStep;
  /** Falls back to the first view for any swatch with no photograph yet. */
  const shown = Math.min(view, views.length - 1);
  const tilt = usePointerTilt();

  return (
    <Inview
      tag="li"
      mode="once"
      from={{ opacity: 0, y: 20 }}
      to={{ opacity: 1, y: 0 }}
      delayIn={delay}
      style={tilt.stage}
      className="group o-relative pf-h-111-5 pf-lg-flex-1"
    >
      <animated.div
        {...tilt.bind}
        style={tilt.surface}
        className="o-relative o-flex o-h-full o-w-full o-flex-col o-justify-between o-border-w-1 pf-border-hero-rule o-p-4"
      >
        <animated.div
          aria-hidden
          style={tilt.layer}
          className="o-pointer-events-none o-absolute o-inset-0"
        >
          {views.map((image, position) => (
            <img
              key={image.src}
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 1024px) 24vw, (min-width: 768px) 46vw, 90vw"
              // **Contained in a square box, not cropped into a tall one.**
              // The photographs supplied on 2026-08-27 are 1080-square, lit on
              // transparency, with the garment sleeves-out and nearly as wide as
              // it is tall. `o-object-cover` in the old 237x327 portrait box threw
              // away a quarter of the width at each side — both cuffs. The box
              // is the card's own content width now and the picture is fitted
              // inside it, so the whole garment reads and its own framing, which
              // is identical across the four, is what lines them up.
              className={`o-absolute o-top-1/2 o-left-1/2 pf-size-74-25 pf--translate-x-1-2 pf--translate-y-1-2 o-object-contain ${TRANSITION} ${
                position === shown ? "o-opacity-100" : "o-opacity-0"
              }`}
              // Margins, not a second transform — the two `-translate-*-1/2`
              // above own the transform, and a nudge written there would
              // replace the centring.
              style={{
                marginLeft: units(image.nudgeX ?? 0),
                marginTop: units(image.nudgeY ?? 0),
              }}
            />
          ))}
        </animated.div>

        <div className="o-relative o-flex o-w-full o-flex-col o-gap-4">
          <div className="o-flex o-w-full o-items-start o-justify-between">
            <span
              aria-hidden
              className="pf-text-hero-body pf-leading-hero-display pf-text-hero-content-faint"
            >
              {index}
            </span>
            <img
              src="/assets/collections/collections-corner.svg"
              alt=""
              width={13}
              height={13}
              aria-hidden
              className="pf-size-3-25 o-shrink-0"
            />
          </div>

          <div className="o-flex o-w-full o-items-baseline o-justify-between o-gap-4">
            <h3 className="pf-w-54-25 pf-text-hero-title pf-leading-hero-display pf-text-hero-content">
              <ScrambleText revealInView revealDelay={delay}>
                {name}
              </ScrambleText>
            </h3>
            <span
              className={`o-shrink-0 pf-text-hero-body pf-leading-hero-display pf-text-hero-content-muted pf-group-focus-within-text-hero-content pf-group-hover-text-hero-content ${TRANSITION}`}
            >
              <ScrambleText revealInView revealDelay={delay + 40}>
                {price}
              </ScrambleText>
            </span>
          </div>
        </div>

        <div
          role="group"
          aria-label={`${name} — view`}
          // `o-right-4`, not the frame's x of 301: the card is `o-flex-1` and grows
        // with the canvas (ADR-0037), and 301 is only its right margin at the
        // frame's own 331-unit width.
        className="o-absolute o-top-1/2 o-right-4 o-flex o-w-3 pf--translate-y-1-2 o-flex-col o-gap-1 max-lg:o-w-4 max-lg:o-gap-2"
        >
          {Array.from({ length: swatches }, (_, swatch) => (
            <button
              key={swatch}
              type="button"
              aria-label={`View ${swatch + 1} of ${swatches}`}
              aria-pressed={swatch === view}
              onClick={() => setView(swatch)}
              // 12 units square is a cursor's target. Below the frame it is drawn
              // at 16 and hit-tested at 28×32, which the 8-unit gap has room for.
              className={`o-size-3 o-cursor-pointer max-lg:o-size-4 pf-max-lg-tap-area pf-max-lg-tap-y-0-3125rem pf-max-lg-tap-x-0-75rem pf-focus-visible-outline-2 pf-focus-visible-outline-offset-2 pf-focus-visible-outline-hero-content ${TRANSITION} ${
                swatch === view
                  ? "pf-bg-hero-content"
                  : "o-border-w-1 pf-border-hero-content-muted pf-hover-border-hero-content"
              }`}
            />
          ))}
        </div>

        {/* The chips and the link share this band, so neither can move the card. */}
        <div className="o-relative pf-h-9-25">
          {/* Not `aria-hidden`: the attributes are content. They are only
           *visually* traded for the link, and a reader should still get both. */}
          {/* Traded for the link on hover — and *permanently* traded where there
              is no hover to give, which is what `(hover: none)` asks. Otherwise a
              phone shows the chips for ever and the card's actual action never
              appears at all. */}
          <ul
            className={`o-absolute o-inset-0 o-flex o-items-center o-gap-2 pf-group-focus-within-opacity-0 pf-group-hover-opacity-0 pf--media-hover-none-opacity-0 ${TRANSITION}`}
          >
            {tags.map((tag) => (
              <li
                key={tag}
                className="o-flex o-h-full o-items-center o-border-w-1 pf-border-hero-content-muted o-px-3.5 pf-text-hero-body pf-leading-hero-display o-whitespace-nowrap pf-text-hero-content-muted pf-lg-text-hero-chip"
              >
                <ScrambleText revealInView revealDelay={delay + 80}>
                  {tag}
                </ScrambleText>
              </li>
            ))}
          </ul>

          <a
            href={href}
            // **`pointer-events` follows the opacity, and that is a bug fix.**
            // At rest this link is invisible but was still hit-testable, so on a
            // phone — where the hover that reveals it never comes — the whole
            // chip band was an unmarked tap that navigated away. It is now inert
            // whenever it cannot be seen, and shown outright where there is no
            // hover.
            className={`o-absolute o-inset-0 o-flex o-items-center o-justify-between o-border-w-1 pf-border-hero-content o-px-3.5 pf-text-hero-body pf-leading-hero-display pf-lg-text-hero-chip o-whitespace-nowrap pf-text-hero-content o-pointer-events-none o-opacity-0 pf-group-focus-within-pointer-events-auto pf-group-focus-within-opacity-100 pf-group-hover-pointer-events-auto pf-group-hover-opacity-100 pf--media-hover-none-pointer-events-auto pf--media-hover-none-opacity-100 pf-focus-visible-outline-2 pf-focus-visible-outline-offset-2 pf-focus-visible-outline-hero-content ${TRANSITION}`}
          >
            SHOP NOW
            <span className="o-sr-only">{` — ${name}, ${price}`}</span>
            <img
              src="/assets/ui/arrow-right.svg"
              alt=""
              width={10}
              height={6}
              aria-hidden
              className="o-h-1.5 o-w-2.5 o-shrink-0"
            />
          </a>
        </div>
      </animated.div>
    </Inview>
  );
};
