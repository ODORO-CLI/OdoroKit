import { HeroWordmark } from "./hero-wordmark";
import type { HeroImage } from "./hero.types";

export interface HeroStageProps {
  backdrop: HeroImage;
}

/**
 * Wordmark plate opacity.
 *
 * **A deliberate deviation from the frame**, which draws it at 8% (Figma
 * 902:306). Raised to 20% on the client's call so the wordmark actually reads.
 * Recorded in DESIGN-MAP.md.
 *
 * The number only means anything alongside the right artwork, and the artwork
 * changed with the palette. The plate is no longer a chrome export read as a
 * light ghost on near-black; it is a flat OLIVE (#607556) watermark read as ink
 * on cream (#efe0cd). At 20% its strokes land around RGB 210/203/181 against a
 * 239/224/205 ground — a soft sage tint, roughly the same perceived weight the
 * chrome ghost carried on the dark page, arrived at from the opposite side.
 * (The dark variant of the plate that once shipped beside it was wired to
 * nothing and has been removed.)
 */
const BACKDROP_OPACITY = 0.2;

/**
 * The product's box below the frame breakpoint.
 *
 * Only the aspect: the two places that need it sit in different coordinate
 * systems — this box is in the section's flow, inside its own side padding,
 * while `ProductStage` overlays it absolutely and adds its own inset. What has
 * to agree is the shape, and that is what is shared.
 */
/**
 * The product's box below the frame.
 *
 * **4:3 on a phone, not square.** A square box is 350 units tall at 390 wide —
 * two fifths of the screen — and with the markers above it and the claim, the
 * button and two badges under it the hero ran 90px past the fold. The flacon
 * is framed to the box's height, so the box is the only lever that moves that
 * number without shrinking the type around it.
 */
export const PRODUCT_BOX = "pf-aspect-4-3 pf-md-aspect-16-9";

/**
 * The backdrop plate, and the space the product occupies (Figma 902:306 /
 * 902:302).
 *
 * The **product itself is not rendered here any more** — it belongs to
 * `ProductStage`, one screen up, because it travels into the details section and
 * a canvas cannot escape the section it sits in. What is left is the wordmark
 * plate and, below `lg`, the box that reserves the product's space in the flow.
 *
 * The plate is not centred on the frame — it sits 19.5px below centre — so it is
 * pinned to the centre line by half its own height plus that nudge.
 *
 * Resized off the frame's value on the client's call to stop it crowding the
 * edge copy: **92%** (1157×617, same centre). At full size its strokes reached
 * x 204–1236 across the copy lines, against copy at x 40–196 and 1215–1400 — 8px
 * of clearance on the left and a 21px *overlap* on the right. At 92% it spans
 * 245–1195: 49px and 20px clear.
 *
 * The plate stays **behind** the product: it is `o-z-0` here and the canvas is
 * `o-z-10` on the region, so raising its opacity can never bring it over the
 * flacon. The canvas is cleared to alpha 0, so the plate shows through wherever
 * the product and the lattice do not cover.
 */
export const HeroStage = ({ backdrop }: HeroStageProps) => (
  <div
    // `data-hero-stage` is how the product canvas finds this box. Below the
    // frame the canvas is positioned against the travel region while this box
    // reserves the space inside the hero's column, so anything placed above it
    // — the markers — would slide out from under the product unless the canvas
    // is told where the box actually ended up. See `product-stage.tsx`.
    data-hero-stage
    className={`o-pointer-events-none o-relative o-z-0 o-w-full pf-lg-absolute pf-lg-inset-0 pf-lg-aspect-auto pf-lg-w-auto ${PRODUCT_BOX}`}
  >
    <HeroWordmark plate={backdrop} opacity={BACKDROP_OPACITY} />
  </div>
);
