import { Fragment } from "react";

import { Inview } from "@/components/animation/springs/in-view";
import { ScrambleText } from "@/components/ui/scramble-text";

import { FooterNewsletterForm } from "./footer-newsletter";
import type { FooterContent } from "./footer.types";

export interface FooterProps {
  content: FooterContent;
}

const FOCUS_RING =
  "pf-focus-visible-outline-2 pf-focus-visible-outline-offset-2 pf-focus-visible-outline-hero-content";

/**
 * Footer — Figma file WINXFW2nTM7zYwd5dGgm1T, node 1748:1161, the concept's
 * last block.
 *
 * A Server Component; the sign-up form and the reveals are client leaves.
 *
 * **350 units tall, not 800.** Every other frame in this file is a full
 * 1440×800 artboard, but this one's content stops at 326 and Figma renders the
 * node itself at 350 — so the footer is given its own height rather than a
 * screen's worth of empty lattice below it.
 *
 * **A `footer` landmark, and the columns are a `nav`.** This is the one block
 * where the frame's own header is absent, so nothing is skipped here; the
 * banner at the top of the page and this landmark are the page's two.
 *
 * The logo is the same asset the header uses, drawn larger — 99×40 against the
 * header's 75×30.
 */
export const Footer = ({ content }: FooterProps) => (
  <footer className="o-relative o-w-full pf-font-mono pf-text-hero-content pf-lg-h-87-5">
    {/* **Shorter below the frame, and the notice sits on the edge.** The
          column's own rhythm was 40 between every part and 64 of padding at
          both ends, which on a phone left the closing line floating in the
          middle of an empty half-screen. 32 between parts, 48 above, and below
          it the same 20 the block already holds at its sides — so the notice
          closes the page against the block's own margin rather than hovering
          above it. */}
    <div className="o-flex o-flex-col o-gap-10 o-px-5 o-py-16 max-lg:o-gap-8 max-lg:o-pt-12 max-lg:o-pb-5 pf-lg-block pf-lg-gap-0 pf-lg-px-0 pf-lg-py-0">
      <a
        href="/"
        className={`o-block pf-h-6-25 pf-w-32-5 pf-lg-absolute pf-lg-top-6 pf-lg-left-10 pf-lg-h-4-75 pf-lg-w-24-75 ${FOCUS_RING}`}
      >
        <img
          src={content.logo.src}
          alt={content.logo.alt}
          width={content.logo.width}
          height={content.logo.height}
          className="o-h-full o-w-full o-object-contain"
        />
      </a>

      <nav
        aria-label="Footer"
        className="pf-lg-absolute pf-lg-top-6 pf-lg-left-74-25 pf-lg-z-10"
      >
        <ul className="o-grid o-grid-cols-2 o-gap-8 md:o-grid-cols-4 pf-lg-flex pf-lg-gap-12">
          {content.columns.map((column) => (
            <li key={column.heading.label} className="pf-lg-w-30 pf-lg-last-w-auto">
              <Inview
                tag="div"
                mode="once"
                from={{ opacity: 0, y: 12 }}
                to={{ opacity: 1, y: 0 }}
                className="o-flex o-flex-col o-gap-5"
              >
                <a
                  href={column.heading.href}
                  className={`o-block pf-text-hero-body pf-leading-hero-display pf-text-hero-content pf-max-lg-tap-area pf-max-lg-tap-y-0-5rem ${FOCUS_RING}`}
                >
                  <ScrambleText revealInView tieProse>
                    {column.heading.label}
                  </ScrambleText>
                </a>

                {column.links ? (
                  <ul className="o-flex o-flex-col o-gap-3 max-lg:o-gap-4">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className={`o-block pf-text-hero-body pf-leading-hero-display pf-text-hero-content-muted o-uppercase o-transition-colors pf-duration-var-duration-fast pf-ease-entrance pf-hover-text-hero-content pf-max-lg-tap-area pf-max-lg-tap-y-0-5rem pf-lg-whitespace-nowrap ${FOCUS_RING}`}
                        >
                          <ScrambleText tieProse revealInView revealDelay={80}>
                            {link.label}
                          </ScrambleText>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Inview>
            </li>
          ))}
        </ul>
      </nav>

      {/* **Anchored to the right margin, not to a left coordinate.** Its width
          has a floor now — the type inside stopped shrinking below 1024, so the
          box could not either — and a floored width hung off a fixed left edge
          runs past the screen: measured at 1024 it ended 42px beyond. The frame
          puts its right edge on the same 40-unit margin the rule above uses, so
          anchoring there is both faithful and safe. Same fix, same reason, as
          the social row below. */}
      <Inview
        tag="div"
        mode="once"
        from={{ opacity: 0, y: 12 }}
        to={{ opacity: 1, y: 0 }}
        delayIn={120}
        className="o-w-full max-lg:o-mt-6 pf-lg-absolute pf-lg-top-6 pf-lg-right-10 pf-lg-z-10 pf-lg-w-max-15-3125rem-245px"
      >
        <FooterNewsletterForm content={content.newsletter} />
      </Inview>

      {/* The frame's rule, drawn rather than exported — a 1px line at 25%. */}
      <div
        aria-hidden
        className="o-h-px o-w-full pf-bg-hero-rule pf-lg-absolute pf-lg-top-71-5 pf-lg-inset-x-10 pf-lg-w-auto"
      />

      {/* **On a phone the order is inverted, and the legal line is quieter.**
          Stacked, it read copyright-then-links: the page ended on the two
          things a reader might actually press, announced by the one they never
          will, and the notice itself took two lines of body type to say
          nothing. The links come first now and the notice sits last at the chip
          size, where it fits on one line and reads as the footnote it is. From
          `sm` both go back to being ends of the same row.

          **The closing line is a row, not a stack.** Below the frame the
          copyright and the social links each took a full turn of the column,
          which left the footer trailing off in two half-empty lines — and put
          the social links in the bottom-left corner, underneath the cookie
          control that lives there. The frame already draws them as one line
          ending against opposite margins; this is that line, allowed to wrap
          onto two only where there is genuinely no room. `pf-lg-contents` hands
          both back to their frame coordinates. */}
      <div className="o-flex o-flex-col-reverse o-gap-5 pf-max-lg-mt-3 sm:o-flex-row sm:o-items-center sm:o-justify-between sm:o-gap-4 pf-lg-contents">
        <Inview
          tag="p"
          mode="once"
          from={{ opacity: 0 }}
          to={{ opacity: 1 }}
          delayIn={200}
          className="pf-text-hero-chip pf-leading-hero-display pf-text-hero-content-faint pf-sm-text-hero-body pf-lg-absolute pf-lg-top-77-5 pf-lg-left-10 pf-lg-whitespace-nowrap"
        >
          <ScrambleText tieProse revealInView revealDelay={200}>
            {content.copyright}
          </ScrambleText>
        </Inview>

        {/* Anchored to the **right** margin, not to a left coordinate. The frame
          ends this row flush with the rule above it, and the frame's own left
          value only lands there for one exact set of glyph widths — a space
          more or less in a separator and it drifts off the line. Pinning it to
          the same 40-unit margin the rule uses makes that impossible. */}
        <Inview
          tag="ul"
          mode="once"
          from={{ opacity: 0 }}
          to={{ opacity: 1 }}
          delayIn={240}
          className="o-flex o-flex-wrap o-items-center o-gap-3 pf-text-hero-body pf-leading-hero-display pf-text-hero-content-faint pf-lg-absolute pf-lg-top-77-5 pf-lg-right-10 pf-lg-flex-nowrap pf-lg-whitespace-nowrap"
        >
          {content.social.map((link, index) => (
            <Fragment key={link.label}>
              {/* The frame's separator is the text " / " — spaces included. On a
                monospaced face those two spaces are 19 units of the row's
                width, and dropping them pulled the whole row 16 left. */}
              {index > 0 ? (
                <li aria-hidden className="o-whitespace-pre">
                  {" / "}
                </li>
              ) : null}
              <li>
                <a
                  href={link.href}
                  className={`o-block o-transition-colors pf-duration-var-duration-fast pf-ease-entrance pf-max-lg-tap-area pf-hover-text-hero-content ${FOCUS_RING}`}
                >
                  {link.label}
                </a>
              </li>
            </Fragment>
          ))}
        </Inview>
      </div>
    </div>
  </footer>
);
