/**
 * One card of the triptych: corner brackets, an index tag top-left, the
 * photograph filling the box, and a title-over-caption footer in a scrim —
 * with the price and the reserve link opposite.
 *
 * Pointing at a card raises the photograph by four percent on a spring: a
 * real transform over a real distance, so `<Hover>` rather than a CSS
 * transition (ADR-0014). The brackets and the link brighten on the same
 * gesture, which is colour and stays CSS.
 *
 * 📖 Docs: obsidian/frontend/sections.md
 */

import { useRef } from "react";
import { Hover } from "@/components/animation/springs/hover";
import { Inview } from "@/components/animation/springs/in-view";
import { focusRing, hoverTiming } from "@/components/ui/action-link";
import { RISE } from "@/lib/motion/reveals";

import type { CollectionItem } from "./collection.types";

/** The four corner brackets, as the two edges each one is drawn from. */
const BRACKETS = [
  "jo-top-md jo-left-md o-border-t o-border-l",
  "jo-top-md jo-right-md o-border-t o-border-r",
  "jo-bottom-md jo-left-md o-border-b o-border-l",
  "jo-bottom-md jo-right-md o-border-b o-border-r",
] as const;

export interface CollectionCardProps {
  item: CollectionItem;
  cta: string;
  /** Stagger across the row, in ms. */
  delay: number;
}

export const CollectionCard = ({ item, cta, delay }: CollectionCardProps) => {
  const cardRef = useRef<HTMLElement>(null);

  return (
    <Inview tag="li" mode="once" delayIn={delay} className="o-relative" {...RISE}>
      <article ref={cardRef} className="group jo-rounded-media o-relative">
        <a
          href={item.href}
          aria-label={`${item.name} — ${item.price} — ${cta}`}
          className={`jo-rounded-media jo-bg-surface-card o-relative o-block jo-aspect-4-5 o-overflow-hidden ${focusRing}`}
        >
          <Hover
            tag="span"
            trigger={cardRef}
            from={{ transform: "scale(1)" }}
            to={{ transform: "scale(1.04)" }}
            config={{ tension: 120, friction: 30 }}
            className="o-absolute o-inset-0 o-block"
          >
            <img
              src={item.image.src}
              alt={item.image.alt}
              className="o-absolute o-inset-0 o-h-full o-w-full o-object-cover"
            />
          </Hover>

          {/* The footer scrim, so cream type holds on a champagne photograph. */}
          <span
            aria-hidden
            className="jo-from-scrim-panel o-pointer-events-none o-absolute o-inset-x-0 o-bottom-0 o-h-1/2 jo-bg-linear-to-t o-to-transparent"
          />

          {BRACKETS.map((edges) => (
            <span
              key={edges}
              aria-hidden
              className={`jo-border-foreground-accent-muted jo-group-hover-border-foreground-accent o-absolute jo-size-1rem o-transition-colors ${hoverTiming} ${edges}`}
            />
          ))}

          <span className="jo-font-ui jo-text-caption jo-leading-caption jo-text-foreground-accent-strong text-trim o-absolute jo-top-xl jo-left-xl">
            [{item.index}]
          </span>

          <span className="o-absolute o-inset-x-0 o-bottom-0 o-flex o-items-end o-justify-between jo-gap-lg jo-p-xl">
            <span className="o-min-w-0">
              <span className="jo-font-display jo-text-title jo-leading-heading jo-text-foreground-accent o-block">
                {item.name}
              </span>
              <span className="jo-font-ui jo-text-body jo-leading-copy jo-text-foreground-accent-soft jo-mt-xs o-block">
                {item.description}
              </span>
            </span>
            <span className="o-shrink-0 o-text-right">
              <span className="jo-font-ui jo-text-body jo-leading-body jo-text-foreground-accent text-trim o-block">
                {item.price}
              </span>
              <span
                className={`jo-font-ui jo-text-caption jo-leading-caption jo-text-foreground-accent-muted jo-group-hover-text-foreground-accent text-trim jo-mt-md o-block o-uppercase jo-tracking-0-12em o-transition-colors ${hoverTiming}`}
              >
                {cta} →
              </span>
            </span>
          </span>
        </a>
      </article>
    </Inview>
  );
};
