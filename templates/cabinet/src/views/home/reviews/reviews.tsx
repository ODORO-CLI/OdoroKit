import { useMemo, useState, type ReactNode } from "react";

import { Handle } from "@/components/animation/springs/handle";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
import type { ReviewsContent } from "@/data/mocks/home";
import { DockSentinel } from "@/views/home/dock/dock-sentinel";

import { Testimonial } from "./testimonial";

export interface ReviewsProps {
  content: ReviewsContent;
}

const pad = (value: number) => String(value).padStart(2, "0");

const NavButton = ({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
    className="o-flex o-size-11 o-items-center o-justify-center o-border-w-1 cb-border-foreground-inverse-muted-20 cb-transition-background-color-border-color cb-duration-var-duration-normal cb-ease-glide cb-hover-border-foreground-inverse cb-hover-bg-foreground-inverse-muted-5 cb-focus-visible-outline-1 cb-focus-visible-outline-offset-2 cb-focus-visible-outline-foreground-inverse disabled:o-pointer-events-none disabled:o-opacity-40"
  >
    {children}
  </button>
);

/**
 * Client stories. The pager is driven by the data: the source hard-coded
 * "01 / 05" over a single story and wired its arrows to nothing, so here the
 * count is real and the arrows stay disabled until there is a second story.
 */
export const Reviews = ({ content }: ReviewsProps) => {
  const [index, setIndex] = useState(0);
  const total = content.items.length;
  const step = (delta: number) =>
    setIndex((current) => (current + delta + total) % total);
  const story = useMemo(
    () => <Testimonial key={index} item={content.items[index]} />,
    [content.items, index],
  );

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      className="o-relative o-z-50 o-flex o-flex-col cb-bg-surface-inverse o-p-10 cb-text-foreground-inverse cb-md-h-dvh max-md:o-px-6 max-md:o-py-20"
    >
      <div className="o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t cb-border-foreground-inverse-18 o-pt-4">
        <h2
          id="reviews-title"
          className="o-flex o-items-center o-gap-2 o-whitespace-nowrap cb-text-caption o-font-medium o-uppercase cb-tracking-caps"
        >
          <span aria-hidden className="cb-text-foreground-inverse-muted">
            ✦
          </span>
          {content.title}
        </h2>
        <p
          aria-live="polite"
          className="o-whitespace-nowrap cb-text-caption o-font-medium o-uppercase cb-tracking-caps cb-text-foreground-inverse-muted"
        >
          {pad(index + 1)} / {pad(total)}
        </p>
        <div className="o-flex o-gap-3">
          <NavButton label={content.previousLabel} disabled={total < 2} onClick={() => step(-1)}>
            <ArrowLeftIcon className="o-size-4" />
          </NavButton>
          <NavButton label={content.nextLabel} disabled={total < 2} onClick={() => step(1)}>
            <ArrowRightIcon className="o-size-4" />
          </NavButton>
        </div>
      </div>

      <Handle className="o-mt-10 o-grow">{story}</Handle>
      <DockSentinel />
    </section>
  );
};
