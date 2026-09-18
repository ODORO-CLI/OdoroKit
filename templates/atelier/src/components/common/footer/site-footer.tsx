// 📖 Docs: obsidian/frontend/components/common.md

/**
 * The footer — the `artist-footer` skeleton on the closing plane.
 *
 * The Style spends its one accent on whole planes, and this is the last of
 * them: an inverted block in three registers — a 5|2|2|3 column row where the
 * brand and its italic tagline face three small-caps link columns, then the
 * name set edge to edge at viewport scale in near-transparent ink, then a
 * hairline-topped bar splitting the copyright from the legal links.
 *
 * The biggest type on the page sits here at almost no contrast — scale
 * carries it, ink does not. The block rises into place once as it enters.
 */

import { Inview } from "@/components/animation/springs/in-view";

export interface FooterContent {
  wordmark: string;
  tagline: string;
  email: string;
  columns: readonly { title: string; links: readonly string[] }[];
  legal: { copyright: string; links: readonly string[] };
}

const COLUMN_SPANS = ["o-col-span-2", "o-col-span-2", "o-col-span-3"] as const;

export const SiteFooter = ({ content }: { content: FooterContent }) => (
  <footer
    id="site-footer"
    className="o-relative o-overflow-hidden at-bg-accent at-text-accent-foreground"
  >
    <Inview
      tag="div"
      mode="once"
      from={{ opacity: 0, y: 48 }}
      to={{ opacity: 1, y: 0 }}
      config={{ tension: 60, friction: 22, clamp: true }}
      className="at-px-frame-gutter at-pt-8vw at-stacked-pt-16"
    >
      <div className="o-grid o-grid-cols-12 at-gap-x-2vw o-gap-y-10 at-stacked-grid-cols-2 at-stacked-gap-x-6">
        <div className="o-col-span-5 o-flex o-flex-col o-gap-5 at-stacked-col-span-2">
          <p className="at-font-display at-text-2-2rem at-leading-none at-tracking-0-03em">
            {content.wordmark}
          </p>
          <p className="at-max-w-28ch at-font-serif at-text-frame-lead o-italic at-leading-1-15">
            {content.tagline}
          </p>
          <a
            href={`mailto:${content.email}`}
            className="o-mt-2 o-w-fit at-font-sans at-text-frame-caption o-uppercase at-tracking-0-2em o-transition-opacity at-duration-var-duration-fast at-ease-entrance hover:o-opacity-70"
          >
            {content.email}
          </a>
        </div>
        {content.columns.map((column, index) => (
          <div
            key={column.title}
            className={`${COLUMN_SPANS[index] ?? "o-col-span-2"} at-stacked-col-span-1`}
          >
            <h2 className="at-font-sans at-text-frame-caption o-uppercase at-tracking-0-24em at-text-accent-foreground-70">
              {column.title}
            </h2>
            <ul className="o-mt-4 o-flex o-flex-col o-gap-2 at-font-sans at-text-frame-body">
              {column.links.map((label) => (
                <li key={label}>
                  <a
                    href="#hero"
                    className="o-transition-opacity at-duration-var-duration-fast at-ease-entrance hover:o-opacity-70"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Decorative and clipped by the block — a texture, not a heading. */}
      <p
        aria-hidden="true"
        className="at--mb-0-18em at-mt-6vw o-select-none o-whitespace-nowrap o-text-center at-font-display at-text-18-5vw at-leading-0-8 at-tracking-0-03em at-text-accent-foreground-10 at-stacked-mt-14 at-stacked-text-26vw"
      >
        {content.wordmark}
      </p>
    </Inview>

    <div className="o-relative o-flex o-items-center o-justify-between o-gap-4 o-border-t at-border-accent-foreground-20 at-px-frame-gutter o-py-5 at-font-sans at-text-frame-caption o-uppercase at-tracking-0-16em at-text-accent-foreground-80 at-stacked-flex-col at-stacked-items-start">
      <p>{content.legal.copyright}</p>
      <ul className="o-flex o-gap-6">
        {content.legal.links.map((label) => (
          <li key={label}>
            <a
              href="#hero"
              className="o-transition-opacity at-duration-var-duration-fast at-ease-entrance hover:o-opacity-70"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </footer>
);
