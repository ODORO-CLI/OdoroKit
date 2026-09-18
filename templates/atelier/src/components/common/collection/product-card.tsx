// 📖 Docs: obsidian/frontend/components/common.md
/**
 * One piece of the collection: a tall 4:5 plate with the index in its corner,
 * the name and price on a ruled footer beneath it.
 *
 * The plate rises into view once; the photograph inside it leans toward the
 * pointer on hover (a spring, because it is a transform), and the "add" pill
 * simply appears (CSS, because it is only opacity — ADR-0014). The link is
 * the whole plate, so the pill is a label on it, not a second control.
 */

import { useRef } from "react";

import { Hover } from "@/components/animation/springs/hover";
import { Inview } from "@/components/animation/springs/in-view";

export interface ProductItem {
  id: string;
  index: string;
  name: string;
  detail: string;
  price: string;
  image: string;
  alt: string;
}

export interface ProductCardProps {
  item: ProductItem;
  action: string;
  /** Position in the grid, for the row's stagger. */
  position: number;
  columns: number;
}

export const ProductCard = ({
  item,
  action,
  position,
  columns,
}: ProductCardProps) => {
  const plateRef = useRef<HTMLAnchorElement>(null);

  return (
    <Inview
      tag="li"
      mode="once"
      from={{ opacity: 0, y: 48 }}
      to={{ opacity: 1, y: 0 }}
      delayIn={(position % columns) * 110}
      config={{ tension: 60, friction: 20, clamp: true }}
      className="group"
    >
      <a
        ref={plateRef}
        href={`#${item.id}`}
        aria-label={`${item.name} — ${item.price}`}
        className="o-relative o-block at-aspect-4-5 o-overflow-hidden at-rounded-card at-bg-surface-raised"
      >
        <Hover
          tag="div"
          trigger={plateRef}
          from={{ scale: 1 }}
          to={{ scale: 1.04 }}
          config={{ tension: 120, friction: 22 }}
          className="o-absolute o-inset-0 o-will-change-transform"
        >
          <img
            src={item.image}
            alt={item.alt}
            className="o-absolute o-inset-0 o-h-full o-w-full o-object-cover"
          />
        </Hover>
        <span className="o-absolute o-left-4 o-top-4 at-font-sans at-text-frame-caption at-tracking-0-12em at-text-background-90">
          {item.index}
        </span>
        <span className="o-absolute o-bottom-4 o-left-4 o-inline-flex at-h-max-40px-2-6vw o-items-center o-rounded-full at-bg-background o-px-5 at-font-serif at-text-frame-nav at-leading-none at-text-foreground o-opacity-0 o-transition-opacity at-duration-var-duration-fast at-ease-entrance at-group-hover-opacity-100">
          {action}
        </span>
      </a>
      <div className="o-mt-4 o-flex o-items-baseline o-justify-between o-gap-4 o-border-t at-border-line-10 o-pt-4">
        <div>
          <h3 className="at-font-serif at-text-frame-lead at-leading-none at-text-foreground">
            {item.name}
          </h3>
          <p className="o-mt-2 at-font-sans at-text-frame-caption o-uppercase at-tracking-0-16em at-text-foreground-muted-70">
            {item.detail}
          </p>
        </div>
        <p className="at-font-serif at-text-frame-lead at-leading-none o-tabular-nums at-text-foreground">
          {item.price}
        </p>
      </div>
    </Inview>
  );
};
