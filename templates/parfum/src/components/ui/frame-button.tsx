import { ScrambleText } from "@/components/ui/scramble-text";

export interface FrameButtonProps {
  label: string;
  href: string;
  /** Passed to the label's decode — see `ScrambleText`. */
  revealDelay?: number;
  /** Decode when the button scrolls into view rather than on mount. */
  revealInView?: boolean;
}

/**
 * The four corner brackets that converge on hover.
 *
 * Drawn with two borders each rather than an SVG asset: the shape is two
 * hairlines, an asset would need flipping per corner, and a border cannot
 * disagree with the box it sits beside about what 1px means.
 *
 * `pf--top-3`/`pf--left-3` is 12px out against a 10px glyph, so each bracket clears
 * the box's own corner by 2px — they read as a separate frame closing in, not
 * as a thickening of the border. The hidden state sits 4px further out again.
 */
const CORNERS = [
  "pf--top-3 pf--left-3 o-border-t o-border-l pf--translate-x-1 pf--translate-y-1",
  "pf--top-3 pf--right-3 o-border-t o-border-r o-translate-x-1 pf--translate-y-1",
  "pf--bottom-3 pf--left-3 o-border-b o-border-l pf--translate-x-1 o-translate-y-1",
  "pf--bottom-3 pf--right-3 o-border-b o-border-r o-translate-x-1 o-translate-y-1",
];

/**
 * The bordered button both frames draw — hero "SHOP NOW" (Figma 902:320) and
 * details "EXPLORE THE JACKET" (1909:1657).
 *
 * The two are the same control at the same size: 20px label, 20px of side
 * padding, a 32px gap to the arrow and a 46px box. Only the label length and
 * where it is pinned differ, so **positioning lives with the caller** and this
 * component owns nothing but the box.
 *
 * The box is an **opaque lattice panel** — the fill both frames put behind it,
 * and what keeps the label readable where the product runs behind it on the
 * second screen. That is the frame's own background, not a wash: see
 * `hero-lattice-panel`, which also carries the pointer highlight so the button's
 * cells light up with everything else.
 *
 * Hover adds nothing to it — the hover is structural, never a fill. Two earlier attempts filled the box — a
 * solid ink inversion, then a 10% wash — and both were rejected for the same
 * reason, which is worth stating so it is not tried a third time: nothing on
 * this page is filled. Every surface is cream paper and every edge is a
 * hairline, so any wash reads as a muddy grey rectangle borrowed from a
 * different site. So the box does not change at all. Instead four corner
 * brackets converge on it — the same glyph the hero's edge statements are
 * bracketed with, and the same gesture as its reticle badge: a target being
 * acquired. The arrow nudges 4px, and the label decodes on its own, because
 * `ScrambleText` already fires on `mouseenter` and `focus`.
 *
 * The brackets are then the focus indicator, so the default outline is dropped
 * to avoid drawing two rings; it comes back under `forced-colors`, where a
 * palette we do not control is substituted and four hairlines are not something
 * to stake keyboard access on.
 *
 * These are CSS `transition-*` on token timing, the narrow exception ADR-0014
 * carves out of the springs-only rule: a two-state opacity change plus a few-px
 * decorative offset, no physics worth simulating.
 */
export const FrameButton = ({
  label,
  href,
  revealDelay,
  revealInView,
}: FrameButtonProps) => (
  <a
    href={href}
    className="hero-lattice-panel group o-relative o-flex o-h-10 o-items-center o-gap-6 o-border-w-1 pf-border-hero-content o-px-4 pf-text-hero-body pf-leading-hero-display o-whitespace-nowrap pf-text-hero-content pf-sm-h-11-5 sm:o-gap-6 sm:o-px-5 pf-sm-text-hero-lede pf-lg-gap-8 pf-focus-visible-outline-none pf-forced-colors-focus-visible-outline-2 pf-forced-colors-focus-visible-outline-offset-2"
  >
    {CORNERS.map((corner) => (
      <span
        key={corner}
        aria-hidden
        className={`o-pointer-events-none o-absolute o-size-2.5 pf-border-hero-content o-opacity-0 o-transition pf-duration-var-duration-normal pf-ease-entrance pf-group-hover-translate-x-0 pf-group-hover-translate-y-0 pf-group-hover-opacity-100 pf-group-focus-visible-translate-x-0 pf-group-focus-visible-translate-y-0 pf-group-focus-visible-opacity-100 ${corner}`}
      />
    ))}

    <ScrambleText revealDelay={revealDelay} revealInView={revealInView}>
      {label}
    </ScrambleText>
    <img
      // Both axes pinned, and `o-h-auto` is specifically wrong here. In dev,
      // L autre cadre avertissait qu une dimension avait bouge sans l autre —
      // it compares the *rounded* rendered box against these props, and under
      // the adaptive rem grid a 10×6 mark lands on 10.83×6.48 at phone widths,
      // where the width rounds to 11 and the height still reads 6. A square
      // mark can never trip it, which is why the brackets and corners do not.
      // The warning is a false positive: the ratio is right to 0.2%, and the
      // check is compiled out of production. `o-h-auto` silences nothing and
      // actively distorts — this file's SVG is intrinsically 10×5.76, so auto
      // resolves the height against *that* and squashes the arrow by 4%
      // (measured 9.98×5.75 against the correct 9.98×5.98).
      src="/assets/ui/arrow-right.svg"
      alt=""
      width={10}
      height={6}
      aria-hidden
      className="o-h-1.5 o-w-2.5 o-shrink-0 o-transition-transform pf-duration-var-duration-normal pf-ease-entrance pf-group-hover-translate-x-1 pf-group-focus-visible-translate-x-1"
    />
  </a>
);
