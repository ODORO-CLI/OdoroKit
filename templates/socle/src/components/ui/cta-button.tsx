// 📖 Docs: obsidian/frontend/components/common.md


import { ArrowRightIcon } from "@/components/ui/icons/arrow-right-icon";

/**
 * The single call-to-action shape in the design — a black pill with a white
 * arrow tile. Figma 1469:1374 (hero), 1484:1623 (about), 1484:1654 (location)
 * and 1484:1675 (contact submit). They differ only in width, which the caller
 * sets; the pill is 48 px tall everywhere.
 */
export interface CtaButtonProps {
  label: string;
  /** Renders an anchor. Omit to render a submit button instead. */
  href?: string;
  className?: string;
}

/**
 * The hover is CSS `transition-*`, not a spring: it is a discrete state change
 * on colour, opacity and a small nudge, which ADR-0014 puts squarely in the CSS
 * exception. Timing and easing come from tokens, never raw values.
 */
const shell =
  "group o-relative o-flex o-h-12 o-items-center o-justify-between o-gap-6 o-overflow-hidden sn-rounded-button " +
  "sn-bg-action-primary o-py-1 o-pl-6 o-pr-1 o-transition-transform sn-duration-var-duration-normal " +
  "sn-ease-entrance sn-hover--translate-y-0-25 " +
  "sn-focus-visible-outline-2 sn-focus-visible-outline-offset-2 sn-focus-visible-outline-action-primary";

const label =
  "text-trim-body o-relative o-whitespace-nowrap sn-text-body o-font-medium sn-leading-body sn-text-action-primary-foreground";

/**
 * A sheen that sweeps across the pill on hover. `-translate-x-full` → `+full`
 * on a skewed gradient reads as light moving over the surface; the shell clips
 * it, so nothing escapes the rounded corners.
 */
const Sheen = () => (
  <span
    aria-hidden="true"
    className="o-pointer-events-none o-absolute o-inset-y-0 sn-left-1-3 o-w-1/3 sn-skew-x-12 sn-bg-action-secondary-20 o-blur-sm o-transition-transform sn-duration-var-duration-slow sn-ease-entrance sn-group-hover-translate-x-400"
  />
);

const Tile = () => (
  <span className="o-relative o-flex o-size-10 o-shrink-0 o-items-center o-justify-center o-overflow-hidden sn-rounded-control sn-bg-action-secondary">
    {/* Two arrows: the first leaves to the right as the second arrives from the
        left, so the icon reads as advancing rather than sliding back. */}
    <ArrowRightIcon className="sn-w-4-5 sn-text-action-primary o-transition-transform sn-duration-var-duration-normal sn-ease-entrance sn-group-hover-translate-x-220" />
    <ArrowRightIcon className="o-absolute sn-w-4-5 sn-translate-x-220 sn-text-action-primary o-transition-transform sn-duration-var-duration-normal sn-ease-entrance sn-group-hover-translate-x-0" />
  </span>
);

export const CtaButton = ({ label: text, href, className }: CtaButtonProps) => {
  if (href) {
    return (
      <a href={href} className={`${shell} ${className ?? ""}`}>
        <Sheen />
        <span className={label}>{text}</span>
        <Tile />
      </a>
    );
  }

  return (
    <button type="submit" className={`${shell} ${className ?? ""}`}>
      <Sheen />
      <span className={label}>{text}</span>
      <Tile />
    </button>
  );
};
