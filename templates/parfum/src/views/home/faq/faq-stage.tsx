"use client";

import dynamic from "next/dynamic";

import { NearViewport } from "@/components/common/near-viewport";

import type { FaqModel } from "./faq.types";

export interface FaqStageProps {
  subject: FaqModel;
}

/**
 * three.js and the model are the heaviest thing on the page and nothing on this
 * screen depends on them, so the renderer stays split out and never reaches the
 * server bundle.
 *
 * This exists as a client leaf only because `dynamic(..., { ssr: false })` is
 * not allowed inside a Server Component — the same reason `ProductStage` owns
 * the hero's mount rather than the section itself.
 */
const HeroScene = dynamic(
  () => import("../hero/hero-scene").then((m) => m.HeroScene),
  { ssr: false },
);

/**
 * Where the product sits on this screen, in frame units.
 *
 * **Re-composed for the flacon** (ADR-0050). The jacket's pose was read off the
 * photograph it replaced — 765 units tall, its centre 313 left of the frame's
 * and 200 below, cropped by the left and bottom edges, which was the
 * composition: a garment running off two edges reads as close and large. A
 * flacon cropped by the bottom reads as tipped over, so it is held whole and
 * smaller (560), sat near the vertical centre (-40), and pushed left (-300)
 * until its far shoulder just clears the frame's edge — cropped by ONE edge,
 * which still says "ground of the screen" without saying "fallen".
 *
 * `turn` is left off on purpose: the scene defaults it to `SCROLL_TURN`, the
 * angle the travelling instance rests at on the details screen, so both pinned
 * screens show the flacon from the same quarter turn and cannot drift apart if
 * that angle is ever retuned.
 *
 * **The approach.** The flacon enters from further off the left edge and gives
 * up a little turn as the screen arrives, both driven by scroll position alone
 * — so it runs backwards when the reader scrolls back, which a timed reveal
 * would not. The jacket carried its approach in the rotation (28° over 110
 * units) because its sleeves trailed the angular velocity; the flacon has no
 * chains to trail, so the two are rebalanced — 18° of turn, 90 units of shift —
 * enough that the label swings into legibility as the screen settles, without
 * the object reading as spun.
 */
const STILL = {
  height: 560,
  offsetX: -300,
  offsetY: -40,
  entrance: { shiftX: -90, turn: (-18 * Math.PI) / 180 },
};

/**
 * **Frame only.** In the frame the product runs off the bottom-left corner
 * *behind* the questions — it is the screen's ground. Below it there is no
 * corner to run off: the stage became a full-width picture of the same flacon
 * the page has already shown twice, stacked above the list, and read as a
 * repeat rather than as a backdrop. `hidden` also means the box never lays
 * out, so the reveal never fires and the second WebGL context is never built.
 */
export const FaqStage = ({ subject }: FaqStageProps) => (
  // `data-pointer-frame` marks the box coordinates are measured against; the
  // section carries `data-product-region`, which is what `acquireHeroPointer`
  // resolves from, so this screen gets its own pointer rather than reaching for
  // the hero's — they are different canvases on different parts of the page.
  <div
    data-pointer-frame
    // **The bottom fade is back, and the reasoning that removed it was wrong.**
    // It was dropped on the arithmetic that the model comes to rest at 756
    // against a section `min-h-200` holds at 800 — true at 1440×800 and only
    // there. The section takes the *larger* of `h-lvh` and 800 units, and those
    // two scale differently: the units track the root font-size, the viewport
    // height does not. Change the aspect ratio and the clearance goes. Measured
    // on 1920×900 the model was cut dead flat by the section's bottom edge.
    // The curve is `hero-stage-mask`'s, which holds full density through the
    // first third of its travel, so the ghosting that removing it was meant to
    // cure stays out of the body of the flacon.
    className="pointer-events-none relative isolate hidden aspect-4/5 w-full overflow-hidden sm:aspect-4/3 lg:absolute lg:block lg:inset-0 lg:z-0 lg:aspect-auto lg:hero-stage-mask"
  >
    {/* Built only once this screen is near. The scene's cost is not its frame
        loop — that is already gated — it is *construction*: a second WebGL
        context, seven shader programs and nine texture uploads, which used to be
        charged to the first paint for a product seven screens further down. */}
    <NearViewport className="absolute inset-0">
      <HeroScene src={subject.src} label={subject.label} still={STILL} />
    </NearViewport>
  </div>
);
