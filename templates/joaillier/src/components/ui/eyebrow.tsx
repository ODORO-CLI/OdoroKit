// 📖 Docs: obsidian/frontend/components/common.md

import type { ReactNode } from "react";

export interface EyebrowProps {
  children: ReactNode;
  /** `ink` for the one band where the type is darker than its ground. */
  tone?: "cream" | "ink";
  /** A short lead rule before the label. Off for the "/ LABEL" variant. */
  rule?: boolean;
  className?: string;
}

/**
 * The small-caps label that opens a section — wide-tracked, trimmed, with a
 * short lead rule. One component rather than a class, per ADR-0012.
 */
export const Eyebrow = ({
  children,
  tone = "cream",
  rule = true,
  className = "",
}: EyebrowProps) => (
  <p
    className={`jo-font-ui jo-text-caption jo-leading-caption text-trim o-flex o-items-center jo-gap-md o-uppercase jo-tracking-0-14em ${
      tone === "ink" ? "jo-text-foreground-ink-muted" : "jo-text-foreground-accent-muted"
    } ${className}`}
  >
    {rule ? (
      <span
        aria-hidden
        className={`o-block o-h-px jo-w-2rem ${tone === "ink" ? "jo-bg-line-ink" : "jo-bg-line-strong"}`}
      />
    ) : null}
    <span>{children}</span>
  </p>
);
