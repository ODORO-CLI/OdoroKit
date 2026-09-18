import { useRef } from "react";
import { Hover } from "@/components/animation/springs/hover";

/**
 * A single chapter row in the Sitemap "o-ring around the core" layout.
 *
 * The button itself is the hover trigger; its children read that hover through
 * `trigger={ref}`. On hover the content slides slightly, the arrow slides and
 * brightens, and the index + title spring to full opacity.
 *
 * react-spring cannot interpolate a token-derived colour (`var(--accent-500)`),
 * so instead of tweening colour the index and title rest at a reduced opacity
 * over the solid token and spring up to 1 — this composites to the same
 * crossfade while every colour stays in the design system.
 *
 * `align="right"` mirrors the row so it frames the scene from the right half of
 * the layout: the affordance moves to the far left (a `←` travelling
 * `0 → -4`), the copy right-aligns, and the index lands on the far right — the
 * row now reads right-to-left. Mirroring is CSS-only (`o-flex-row-reverse` +
 * `o-items-end`/`o-text-right` + a glyph swap), so a `max-pad-sm:` reset collapses it
 * back to the left layout once the ledger becomes a single column (991px, matching
 * `Sitemap`) without ever branching on a JS width; the parent re-orders the DOM.
 * Hover is disabled under `mobileWidth` regardless, so the mirrored slide
 * directions never fire there.
 */

/** Horizontal slide of the row content / arrow on hover. */
const SLIDE = { duration: 350 } as const;
/** Opacity crossfade on the index and title. */
const TINT = { duration: 300 } as const;

export interface SitemapButtonProps {
  number: string;
  title: string;
  subtitle?: string;
  align?: "left" | "right";
  className?: string;
  onClick?: () => void;
}

export const SitemapButton = ({
  number,
  title,
  subtitle,
  align = "left",
  className = "",
  onClick,
}: SitemapButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const isRight = align === "right";

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={`o-flex o-w-full o-cursor-pointer o-items-center o-gap-5 o-py-5 o-text-left hl-max-h-828-py-4 hl-max-h-717-py-3 hl-max-pad-sm-min-h-11 hl-max-pad-sm-gap-4 hl-max-pad-sm-py-4 ${
        isRight ? "o-flex-row-reverse hl-max-pad-sm-flex-row" : ""
      } ${className}`}
    >
      {/* Index + title/subtitle — springs as a unit on hover. Reversed and
          right-aligned when mirrored; reset to the left layout under `md`. */}
      <Hover
        tag="span"
        trigger={ref}
        from={{ x: 0 }}
        to={{ x: isRight ? -6 : 6 }}
        config={SLIDE}
        className={`o-flex o-min-w-0 o-flex-1 o-items-baseline o-gap-5 hl-max-pad-sm-gap-4 ${
          isRight ? "o-flex-row-reverse hl-max-pad-sm-flex-row" : ""
        }`}
      >
        <Hover
          tag="span"
          trigger={ref}
          from={{ opacity: 0.7 }}
          to={{ opacity: 1 }}
          config={TINT}
          className="o-shrink-0 o-font-sans hl-text-0-6875rem-none o-font-semibold hl-tracking-0-28em hl-text-accent-500"
        >
          {number}
        </Hover>

        <span
          className={`o-flex o-min-w-0 o-flex-col o-gap-1.5 ${
            isRight ? "o-items-end o-text-right hl-max-pad-sm-items-start hl-max-pad-sm-text-left" : ""
          }`}
        >
          <Hover
            tag="span"
            trigger={ref}
            from={{ opacity: 0.9 }}
            to={{ opacity: 1 }}
            config={TINT}
            className="hl-font-lato hl-text-1-375rem-1-15 hl-tracking-0-03em hl-text-foreground o-uppercase hl-max-pad-sm-text-lg hl-max-hero-xs-text-1-0625rem"
          >
            {title}
          </Hover>
          {subtitle && (
            <span className="o-font-sans hl-text-xs-1-4 hl-text-foreground-45 hl-max-hero-xs-text-0-71875rem">
              {subtitle}
            </span>
          )}
        </span>
      </Hover>

      {/* Affordance. On the far right when left-aligned (`→`, travels `0 → 4`);
          on the far left when mirrored (`←`, travels `0 → -4`). The mirrored row
          collapses to the left layout under `md`, so a `→` is shown there via a
          CSS-only glyph swap. */}
      <Hover
        tag="span"
        trigger={ref}
        from={{ x: 0, opacity: 0.6 }}
        to={{ x: isRight ? -4 : 4, opacity: 1 }}
        config={SLIDE}
        aria-hidden="true"
        className="o-shrink-0 o-font-sans o-text-base hl-text-accent-300"
      >
        {isRight ? (
          <>
            <span className="hl-max-pad-sm-hidden">←</span>
            <span className="o-hidden hl-max-pad-sm-inline">→</span>
          </>
        ) : (
          "→"
        )}
      </Hover>
    </button>
  );
};
