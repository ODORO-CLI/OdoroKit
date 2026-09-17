import { Inview } from "@/components/animation/springs/in-view";
import { Eyebrow } from "@/components/ui/eyebrow";
import { AudienceMark } from "@/views/home/audience-mark";
import {
  fadeUpBlur,
  fadeUpShort,
  revealConfigSnappy,
  revealConfigSoft,
} from "@/lib/springs/reveal";
import type { AudienceItem, HomeContent } from "@/data/mocks/home";

/**
 * Figma 4379 → 6073 of frame "Concept 3" (1469:1302).
 *
 * A 3 × 3 grid of 448 × 450 cells. Six carry a card; the centre and the two on
 * the counter-diagonal (top-right, bottom-left) stay empty — that gap is the
 * layout, and the centre is where the travelling 3D mark reads clearest.
 *
 * The mark is not a grid cell: its canvas fills the whole section behind the
 * grid, and the section clips it. See `audience-mark.tsx` and
 * obsidian/meta/decisions-log.md ADR-0023.
 */
export interface AudienceSectionProps {
  content: HomeContent["audience"];
}

const CELL_COUNT = 9;
/** Gap between each cell's reveal, in ms. */
const STAGE_MS = 110;


/**
 * Glass rather than solid, so the 3D mark travelling behind the grid stays
 * visible as it passes under each card.
 *
 * The reveal is applied to the card's **contents**, never to the card or an
 * ancestor of it. A `filter` — or an `opacity` below 1 — on any ancestor
 * establishes a *backdrop root*, which cuts the glass off from everything
 * painted behind it: `backdrop-filter` then samples an empty backdrop, costing
 * full GPU work and rendering nothing at all. Springs also settle
 * asymptotically, so a blur reveal leaves `filter: blur(0.02px)` on the element
 * permanently — the effect never comes back on its own.
 */
const Card = ({ item, delayIn }: { item: AudienceItem; delayIn: number }) => (
  <article className="sn-min-h-15rem sn-rounded-card sn-bg-surface-glass o-p-6 sn-backdrop-blur-glass sn-lg-h-full sn-lg-min-h-0 sn-lg-p-7-5">
    <Inview
      mode="once"
      from={fadeUpBlur.from}
      to={fadeUpBlur.to}
      config={revealConfigSoft}
      delayIn={delayIn}
      className="o-flex o-h-full o-w-full o-flex-col o-items-start o-justify-between"
    >
      <div className="o-flex o-w-full o-flex-col o-gap-6">
        <p className="o-w-full sn-text-lead sn-leading-body sn-text-foreground-muted">{item.index}</p>
        <h3 className="text-trim-body o-w-full sn-text-title o-font-light sn-leading-body sn-text-foreground">
          {item.title}
        </h3>
      </div>
      <p className="o-w-full sn-text-lead sn-leading-body sn-text-foreground">{item.description}</p>
    </Inview>
  </article>
);

export const AudienceSection = ({ content }: AudienceSectionProps) => {
  const byCell = new Map(content.items.map((item) => [item.cell, item]));
  // Stage the reveal in reading order across the cells that carry a card, so
  // the empty ones don't leave a hole in the rhythm.
  const order = content.items.map((item) => item.cell).sort((a, b) => a - b);
  const revealDelay = (cell: number) => Math.max(0, order.indexOf(cell)) * STAGE_MS;

  return (
    // `overflow-hidden` is what makes the travelling mark appear from beneath
    // the location block and disappear under the contact block: its canvas
    // fills this section, so both edges clip it.
    <section
      id="audience"
      aria-labelledby="audience-heading"
      className="o-relative o-w-full o-overflow-hidden o-px-5 o-py-20 sn-lg-h-423-5 sn-lg-px-0 sn-lg-py-0"
    >
      <AudienceMark src={content.mark.src} label={content.mark.label} />

      <Inview
        mode="once"
        from={fadeUpShort.from}
        to={fadeUpShort.to}
        config={revealConfigSnappy}
        className="sn-lg-absolute sn-lg-left-10 sn-lg-top-25 sn-lg-w-36-25"
      >
        <Eyebrow
          tag="h2"
          id="audience-heading"
          label={content.eyebrow}
          className="sn-text-lead sn-text-foreground"
        />
      </Inview>

      <Inview
        tag="p"
        mode="once"
        from={fadeUpShort.from}
        to={fadeUpShort.to}
        config={revealConfigSnappy}
        delayIn={100}
        className="text-trim-body o-mt-5 sn-text-body o-font-light sn-leading-body sn-text-foreground sn-lg-absolute sn-lg-left-238 sn-lg-top-25 sn-lg-mt-0 sn-lg-w-111-75"
      >
        {content.intro}
      </Inview>

      {/* 3 × 448 + 2 × 8 gap = 1360 wide; 3 × 450 + 2 × 8 gap = 1366 tall.
          `z-10` keeps the grid above the mark's canvas. */}
      {/* Two columns on a tablet: one 780 px-wide card per row is a phone
          layout stretched, not a layout. */}
      <div className="o-z-10 o-mt-10 o-grid o-auto-rows-auto o-grid-cols-1 o-gap-2 sn-tablet-grid-cols-2 sn-lg-absolute sn-lg-left-10 sn-lg-top-57 sn-lg-mt-0 sn-lg-h-341-5 sn-lg-w-340 sn-lg-grid-cols-3 sn-lg-grid-rows-3">
        {Array.from({ length: CELL_COUNT }, (_, cell) => {
          const item = byCell.get(cell);

          // The centre cell is left open: the mark now travels the whole
          // section behind the grid rather than sitting in one cell.
          if (!item) {
            // The diagonal gaps are the desktop layout; in a single mobile
            // column they would just be dead space.
            return <div key={cell} aria-hidden="true" className="o-hidden sn-lg-block" />;
          }

          // No animated wrapper here — see the note on `Card`. The stagger
          // moves inside it instead.
          return <Card key={cell} item={item} delayIn={revealDelay(cell)} />;
        })}
      </div>
    </section>
  );
};
