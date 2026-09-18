// 📖 Docs: obsidian/frontend/components/common.md

import type { ReactNode } from "react";

/** One focus treatment for every control on the page. Cream on a photograph
 *  needs the offset to stay legible against whatever is behind it. */
export const focusRing =
  "jo-focus-visible-outline-2 jo-focus-visible-outline-offset-4 jo-focus-visible-outline-foreground-accent";

/** Token-backed timing for discrete hover states (ADR-0014). */
export const hoverTiming = "jo-duration-var-duration-fast jo-ease-entrance";

export type ActionVariant = "rule" | "pill" | "pill-ink";

export interface ActionLinkProps {
  href: string;
  children: ReactNode;
  /**
   * `rule` — a label over a hairline that wipes in on hover, the hero's own
   * link language. `pill` — the filled gold action, the page's one loud
   * control. `pill-ink` — the same pill inverted for the silver band.
   */
  variant?: ActionVariant;
  className?: string;
}

const VARIANT: Record<ActionVariant, string> = {
  rule: `group o-relative o-inline-block o-border-b jo-border-line-strong jo-pb-xs jo-font-ui jo-text-body jo-leading-body text-trim o-uppercase jo-tracking-0-08em jo-text-foreground-accent ${focusRing}`,
  pill: `o-inline-flex o-items-center jo-gap-md jo-rounded-pill jo-bg-action-primary jo-px-xl jo-py-md jo-font-ui jo-text-body jo-leading-body o-uppercase jo-tracking-0-08em jo-text-action-primary-ink o-transition-colors ${hoverTiming} jo-hover-bg-foreground-accent ${focusRing}`,
  "pill-ink": `o-inline-flex o-items-center jo-gap-md jo-rounded-pill jo-bg-action-inverse jo-px-xl jo-py-md jo-font-ui jo-text-body jo-leading-body o-uppercase jo-tracking-0-08em jo-text-action-inverse-ink o-transition-colors ${hoverTiming} jo-hover-text-foreground-accent jo-focus-visible-outline-2 jo-focus-visible-outline-offset-4 jo-focus-visible-outline-foreground-ink`,
};

/**
 * The corner arrow, inlined so it inherits `currentColor`. The nudge on hover
 * is the decorative few-px shift ADR-0014 lists as fair game for CSS.
 */
const Arrow = () => (
  <svg
    className={`o-size-3 o-shrink-0 o-transition-transform ${hoverTiming} jo-group-hover-translate-x-3px`}
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M1.5 6h9M6.6 1.5 11 6l-4.4 4.5" stroke="currentColor" />
  </svg>
);

export const ActionLink = ({
  href,
  children,
  variant = "rule",
  className = "",
}: ActionLinkProps) => {
  if (variant === "rule") {
    return (
      <a href={href} className={`${VARIANT.rule} ${className}`}>
        <span className="o-flex o-items-center jo-gap-md">
          <span>{children}</span>
          <Arrow />
        </span>
        {/* The rule wipes in from the left — the one transform ADR-0014 lists
            as fair game for a CSS transition. */}
        <span
          aria-hidden
          className={`jo-bg-foreground-accent o-absolute jo--bottom-px o-left-0 o-block o-h-px o-w-full o-origin-left jo-scale-x-0 o-transition-transform ${hoverTiming} jo-group-hover-scale-x-100 jo-group-focus-visible-scale-x-100`}
        />
      </a>
    );
  }

  return (
    <a href={href} className={`group ${VARIANT[variant]} ${className}`}>
      <span>{children}</span>
      <Arrow />
    </a>
  );
};
