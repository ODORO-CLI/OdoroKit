// 📖 Docs: obsidian/frontend/components/ui.md

import { CornerArrowIcon } from "@/components/ui/icons";

export interface ArrowLinkProps {
  href: string;
  label: string;
  /** `plain` floats on the scene; `glass` is the frosted button in the footer. */
  variant?: "plain" | "glass";
  className?: string;
}

const VARIANT = {
  plain: "hover:o-opacity-80 hover:o-translate-y-0.5",
  glass:
    "o-rounded-sm o-border-w-1 cb-border-foreground-8 cb-bg-surface-glass-75 o-px-7 o-py-3.5 o-backdrop-blur-xl cb-hover-translate-y-0-5 cb-hover-border-foreground-22 cb-hover-bg-surface-glass-raised-95",
} as const;

const isExternal = (href: string) => /^https?:\/\//.test(href);

/**
 * The tracked-caps link with the corner arrow ("Get a quote", "Contact"). A few
 * px of nudge and a colour change on hover — the narrow CSS-transition case
 * (ADR-0014), token-timed.
 */
export const ArrowLink = ({
  href,
  label,
  variant = "plain",
  className = "",
}: ArrowLinkProps) => (
  <a
    href={href}
    {...(isExternal(href) ? { target: "_blank", rel: "noopener" } : {})}
    className={`group o-inline-flex o-w-fit o-items-center o-gap-3 cb-text-foreground cb-transition-opacity-translate-background-color-border-color cb-duration-var-duration-normal cb-ease-glide cb-focus-visible-outline-1 cb-focus-visible-outline-offset-4 cb-focus-visible-outline-foreground ${VARIANT[variant]} ${className}`}
  >
    <CornerArrowIcon className="cb-size-4-5 o-transition-transform cb-duration-var-duration-normal cb-ease-glide cb-group-hover-translate-x-0-5 cb-group-hover-translate-y-0-5" />
    <span className="cb-text-caption cb-leading-display cb-tracking-caps o-uppercase">
      {label}
    </span>
  </a>
);
