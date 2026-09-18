// 📖 Docs: obsidian/frontend/components/common.md
/**
 * The collection — the `vexon-showcase` skeleton.
 *
 * A heading row split 4|8: a small label on the left, one large statement and
 * its supporting paragraph on the right, over an even grid of tall plates.
 * The imbalance up top resolves into a perfectly regular base — order after
 * emphasis.
 */

import { easings } from "@react-spring/web";
import TextEngine from "spring-text-engine";

import { Inview } from "@/components/animation/springs/in-view";

import { ProductCard, type ProductItem } from "./product-card";

const COLUMNS = 3;

export interface CollectionContent {
  label: string;
  statement: string;
  body: string;
  action: string;
  items: readonly ProductItem[];
}

export const Collection = ({ content }: { content: CollectionContent }) => (
  <section
    id="collection"
    aria-labelledby="collection-title"
    className="o-relative at-bg-background at-px-frame-gutter at-py-12lvh"
  >
    <div className="o-grid o-grid-cols-12 o-items-end at-gap-x-2vw at-stacked-flex at-stacked-flex-col at-stacked-items-start at-stacked-gap-4">
      <p className="o-col-span-4 at-font-sans at-text-frame-caption o-uppercase at-tracking-0-24em at-text-foreground-muted-80">
        {content.label}
      </p>
      <div className="o-col-span-8">
        <TextEngine
          tag="h2"
          id="collection-title"
          mode="once"
          overflow
          className="at-font-display at-text-4-6vw at-leading-display at-tracking-0-02em at-text-foreground at-stacked-text-10vw"
          wrapWordClassName="at-py-0-15em at--my-0-15em"
          lineIn={{ y: "0%", opacity: 1 }}
          lineOut={{ y: "100%", opacity: 0 }}
          lineStagger={110}
          lineConfig={{ duration: 1000, easing: easings.easeOutCubic }}
        >
          {content.statement}
        </TextEngine>
        <Inview
          tag="p"
          mode="once"
          from={{ opacity: 0, y: 14 }}
          to={{ opacity: 1, y: 0 }}
          delayIn={300}
          config={{ tension: 60, friction: 22, clamp: true }}
          className="at-mt-1-4vw at-max-w-38rem at-font-sans at-text-frame-body at-leading-1-5 at-text-foreground-muted at-stacked-mt-4"
        >
          {content.body}
        </Inview>
      </div>
    </div>

    <ul className="at-mt-5vw o-grid o-grid-cols-3 at-gap-x-2vw at-gap-y-4vw at-stacked-mt-12 at-stacked-grid-cols-2 at-stacked-gap-y-10 max-sm:o-grid-cols-1">
      {content.items.map((item, position) => (
        <ProductCard
          key={item.id}
          item={item}
          action={content.action}
          position={position}
          columns={COLUMNS}
        />
      ))}
    </ul>
  </section>
);
