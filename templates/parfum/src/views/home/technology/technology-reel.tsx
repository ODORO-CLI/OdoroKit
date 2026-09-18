import { useEffect, useRef } from "react";

import { subscribeToTicker } from "@/lib/animation/ticker";

import type { TechnologyReel as TechnologyReelContent } from "./technology.types";

export interface TechnologyReelProps {
  content: TechnologyReelContent;
  className?: string;
}

/**
 * How fast the playhead chases the scroll, per frame.
 *
 * The same shape as the product's own follower, and for the same reason: the
 * scroll is a coarse signal, and a playhead placed straight onto it stutters —
 * a wheel flick asks for half the clip in one frame and the picture snaps.
 * Chasing bounds the step and smooths the arrival.
 *
 * **The value survives the rewrite; its justification does not.** 0.45 was
 * settled in [[decisions-log]] ADR-0044 as a truce with the decoder: below it
 * an exponential chase spends its last frames asymptoting, and while it
 * asymptotes the requested *frame index* stops changing, so the picture froze
 * for up to ten display frames. There is no index to quantise any more —
 * ADR-0046 blends continuously, so any coefficient at all keeps the picture
 * moving — and 0.45 is kept purely because it is the feel the section shipped
 * with. It is now free to be lowered for more smoothing.
 *
 * Quoted per 60Hz step and rebased against the real frame delta each tick, so
 * the reel tracks the scroll the same way on a 120Hz panel as on a 60Hz one.
 */
const SEEK_FOLLOW = 0.45;

/** The step `SEEK_FOLLOW` is quoted against, in ms. */
const FOLLOW_STEP_MS = 1000 / 60;

/** Where the frames live, one directory per tier — see `.claude/scripts/video/frames.mjs`. */
const FRAMES_BASE = "/assets/technology/stack-frames";

/**
 * The two tiers, and the width at which the reel switches between them.
 *
 * **The binding constraint is resident memory, not download.** A decoded
 * `ImageBitmap` costs `side² × 4` bytes however cheap it was on the wire, so
 * the 61-frame set is 137MB the moment it finishes decoding. A desktop tab
 * carries that; a phone is killed by it, and below `lg` the section drops its
 * pinned stage for a plain stack where the box is a third of the size anyway.
 *
 * The breakpoint is the layout's own `lg`, not a device-pixel measurement: a
 * modern phone at DPR 3 asks for more backing store than the desktop box does
 * and has far less room to hold it, so pixel density is exactly the wrong
 * signal here.
 */
const TIERS = {
  // ONE frame per tier since the perfume conversion (ADR-0050): the artwork is a
  // single still of the olfactory pyramid, not a 61-frame explosion, so the scrub
  // resolves to frame 0 at every playhead and the card alone carries the motion.
  hi: { dir: "hi", side: 768, count: 1 },
  lo: { dir: "lo", side: 512, count: 1 },
} as const;

const TIER_BREAKPOINT = 1024;

/** Frames fetched at once. Enough to saturate a connection, few enough to stay ordered. */
const FETCH_CONCURRENCY = 6;

/**
 * How far the reel lags the page once the stage stops being pinned, in
 * viewport heights.
 *
 * The same ramp, and the same reasoning, as the product's exit in
 * `hero-scene.tsx`: a pinned element's apparent velocity goes from zero to the
 * page's own in a single frame when it releases, and that step is what is felt
 * as the picture slamming into place. Holding back by `λ(1 − e^(−x/λ))` of the
 * distance travelled past the release has a derivative of exactly 1 at the
 * seam, so the reel starts leaving perfectly still and eases up to the page's
 * speed over the following λ.
 *
 * **λ is also the largest distance it can fall behind**, and this box has less
 * room for that than the product does: the artwork ends 45 units above its
 * stage's bottom edge and nothing clips it, so whatever it lags by hangs into
 * the screen below. At a third of a viewport that was a sheet of the stack
 * sitting over the next section. 0.15 bounds it at 114px on a 760-tall window —
 * and the seam is unaffected, since the derivative at x = 0 is 1 whatever λ is.
 */
const RELEASE_LAG = 0.15;

/**
 * How far ahead of the pinned stage the reel starts running, in viewports.
 *
 * At 0 the first frame is what the reader sees for the whole of the screen's
 * arrival, and it only starts moving once the stage has finished pinning — the
 * picture is dead exactly while the eye is on it. A lead of one viewport starts
 * it the moment the section's top edge crosses the fold, so it is already alive
 * as the screen comes in and is about a third of the way through by the time
 * the stage locks.
 */
const ENTRY_LEAD = 1;

/**
 * Smallest change in blended frame position worth repainting.
 *
 * The blend weight lands in an 8-bit channel, so a move of less than 1/255 of
 * the gap between two frames cannot change a pixel. Below it the draw is
 * skipped and the canvas keeps what it has — which is most of the frames while
 * the reader is holding still at the end of the follower's chase.
 */
const REPAINT_EPSILON = 1 / 255;

/**
 * Alpha from brightness — the key that took the artwork's black ground out.
 *
 * **A record of what is already baked, not a filter this component runs.**
 * Every asset the reel touches carries a real alpha channel written at export
 * time ([[decisions-log]] ADR-0046) — the frame set *and* the poster. Measured
 * on `public/assets/technology/technology-stack.webp` as it sits on disk: all
 * four corners are `(0, 0, 0, 0)`, 38.9% of its pixels are alpha 0 and only
 * 2.1% partial. Nothing here is applied at paint time any more; see the note on
 * the poster in `TechnologyReel` for what removing it fixed.
 *
 * `feColorMatrix` wrote the alpha channel as a weighted sum of the colour
 * channels; above one, everything from roughly an eighth brightness up came
 * out solid.
 *
 * **Equal weights, not luminance.** True luminance weights blue at 0.07, and
 * this artwork is blue and violet: the outer shell's own deep blue would key
 * out along with the ground. Weighting the channels alike keeps it.
 *
 * **The floor is what lets the weight be this steep.** Measured on a frame, the
 * ground is 0 of 765 at the median and 3 at the 95th percentile, so subtracting
 * 0.04 costs the artwork nothing and takes the ground's own noise to zero.
 * Without it, a weight steep enough to hold the dark layers solid lifts the
 * ground with them and draws a faint rectangle back onto the page.
 *
 * **7, not the 2.6 first shipped.** The bottom two layers of this stack are
 * genuinely dark — the lining sheet's median pixel is 0.14 of full brightness —
 * so a gentle weight left them at a third of opacity and the page's grid read
 * straight through them. The export key at 7/−0.04 left a soft band of
 * near-black pixels between 15% and 85% alpha — 6.7% of every frame on
 * average, measured across all 61 `hi/` frames and the poster. On the old
 * near-black lattice that band composited to black and was invisible; on
 * cream it was a grey smear round the whole stack. So the frames on disk are
 * **re-baked** (2026-09-08, ADR-0049) through a steepening alpha curve that
 * takes the band to 2.7% while leaving true edges alone, and re-encoded lossy
 * at the original weight (4.1 MB for all 103 files). The poster took the same
 * curve, so the two sides of the hand-off carry the same edge for real.
 * Re-exporting from the mp4 must re-apply that curve; frames.mjs does not yet.
 *
 * A luma key cannot do better than that here: where the artwork is as dark as
 * the ground it *is* the ground as far as the key can tell — which is exactly
 * why running it a second time over an already-keyed image is destructive.
 *
 * **These two numbers are duplicated in `.claude/scripts/video/frames.mjs`**
 * (lines 47–48, and its README cross-refers back to this file), which is the
 * only copy that still does anything: it is what bakes the alpha. They must
 * move together — and because the key is baked into *two* assets, re-tuning it
 * means re-exporting the frame set **and** the poster in the same pass. The
 * moment those two disagree the poster-to-canvas hand-off flashes again.
 */
// The export key was 7 / -0.04 (weight / floor). Those numbers live in
// .claude/scripts/video/frames.mjs, which is the only place they are still run;
// nothing in this component evaluates them any more.

/**
 * The reel, warmed onto the palette — the one thing the frames cannot carry.
 *
 * The artwork is baked magenta-violet-cyan: sampled across the clip, the
 * visible pixels sit in a 200–280° hue band with a median of 236° and a mean
 * saturation of 0.52. That was right beside an azure key on near-black. On
 * cream paper ruled in olive, with terracotta as the only hot hue, it reads as
 * a second, foreign chromatic system on the page. The pixels are baked, so the
 * only lever left is a colour transform on the element.
 *
 * **145°, because it maps the artwork's own hue spread onto the palette's warm
 * arc rather than onto a single hue.** The spread between the sheets is what
 * makes an exploded stack legible, so the rotation is chosen by where it puts
 * the *distribution*, not the median: the 5th percentile lands near 6° (the
 * oxblood of `--hero-display`), the median near 26° (just warm of
 * `--hero-accent` terracotta at 16.5°, so the artwork sits beside the accent
 * instead of competing with it), the 95th near 44° (amber), and the violet tail
 * past it comes out around 25–50° — bronze and khaki, which sits between the terracotta (16.5°) and the olive of `--hero-rule` (100.6°) rather than on either. Measured at 145°
 * and stable across the whole set: hi/000 through hi/060 and the `lo` tier all
 * land within 4° of each other, and the poster within 6° of the frames, so the
 * hand-off does not shift colour.
 *
 * **`saturate(0.82)` is a correction, not a taste.** CSS `hue-rotate` is a
 * linear matrix, not a rotation in a hue-preserving space: on this artwork it
 * *raises* mean saturation from 0.52 to 0.66 and pushes 5.3% of channel samples
 * out of gamut, where they clip — and clipping is what actually flattens the
 * sheets into each other. Pulling saturation back to 0.82 returns the mean to
 * 0.53, i.e. the artwork gains no chroma at all, only a new hue, and drops the
 * clipped fraction to 1.4–1.8%.
 *
 * **`sepia(0.18)` last, as the warmth.** Applied after the rotation it pulls
 * the two tails toward a common warm axis, which is what stops the coolest
 * sheets reading as a hot red and keeps the whole stack on one temperature.
 *
 * **Verified not to crush the separation.** Clustering the frame into its ten
 * dominant sheet colours and measuring the coverage-weighted mean pairwise
 * CIE76 ΔE between them: 24.7 before, 23.0 after — 93% retained — and the
 * closest pair of sheets stays 6.3 ΔE apart, far above the ~2.3 of a just
 * noticeable difference.
 *
 * Applied to the poster and the canvas from this one constant, and never
 * anywhere else: they are the same artwork one on top of the other, and a tint
 * that differed between them would put a colour step into the fade.
 */
/**
 * The tint lives in the token system (`--hero-reel-tint`, globals.css) so a
 * future re-tone of the palette moves the reel with it; this file only names
 * the token. The chain order matters — CSS filters apply left to right — and
 * the token holds exactly the order this component was tuned with.
 */
const REEL_TINT = "var(--hero-reel-tint)";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const framePath = (dir: string, index: number) =>
  `${FRAMES_BASE}/${dir}/${String(index).padStart(3, "0")}.webp`;

/**
 * The exploded stack, as a frame sequence the reader scrubs by scrolling.
 *
 * **Scrubbed, not played.** The section is already a pinned stage whose scroll
 * walks a card down the layers (`technology-stack.tsx`), and the reel runs on
 * the same clock — so the picture and the specification move together and the
 * reader can hold either still. Something that simply played would be running
 * to its own beat behind a composition tied to the reader's.
 *
 * **A canvas over keyed stills, not a `<video>` whose `currentTime` is written**
 * ([[decisions-log]] ADR-0046). Three rounds of tuning got the video scrub to
 * provably optimal seeking and it still juddered, because the thing being
 * optimised was the wrong thing: a decoder serves whole pictures at whatever
 * rate it can, and the reader's scroll does not land on picture boundaries.
 * `drawImage` of two already-decoded frames is synchronous, has no in-flight
 * state to guard against, and — crucially — can show the picture *between* two
 * frames rather than the nearer of them.
 *
 * **The blend is additive on a cleared canvas, and that is not a stylistic
 * choice.** Drawing frame A then frame B at `globalAlpha = t` under the default
 * `source-over` is not a cross-dissolve: where B is transparent, A survives at
 * full strength, so the stack's old position never leaves and the motion
 * smears. Clearing first and adding `(1−t)·A + t·B` with
 * `globalCompositeOperation = "lighter"` interpolates colour *and* alpha in
 * premultiplied space, which is the correct dissolve. The weights sum to one,
 * so nothing clips.
 *
 * **The black ground is keyed, not blended — and the difference between those
 * two is a stacking context.** `mix-blend-mode: difference` is the obvious
 * answer for a lit object on black and it does nothing here: a blend
 * composites against the backdrop *within the nearest ancestor stacking
 * context*, and this section pins its stage with `position: sticky`, which
 * creates one. Everything the artwork could blend with — the page's lattice —
 * is outside it. Verified rather than assumed: with the stage forced to
 * `position: relative` the blend works and the grid reads through the artwork;
 * back on `o-sticky`, the black rectangle returns. The pin is not negotiable.
 *
 * So the frames carry a real alpha channel, written at export time by the same
 * matrix the SVG filter used to run every paint. A real key survives any
 * stacking context, any ancestor, and the mobile layout where there is no
 * sticky element at all — and it costs nothing at runtime.
 *
 * The `poster` is the still the frame shipped — the same artwork — so the box
 * is never a hole while the frames arrive, and it is the element that carries
 * the alt text.
 *
 * **The poster is keyed too, and used to be filtered as though it were not.**
 * The note here read "it is still flat, so it keeps the SVG filter"; the asset
 * on disk says otherwise — corners at `(0, 0, 0, 0)`, 38.9% of it alpha 0 (see
 * `KEY_WEIGHT`). Re-running an already-keyed image through the key was not a
 * no-op, because `feColorMatrix` **overwrites** alpha rather than multiplying
 * into it: the alpha row's `A` coefficient is 0, so the source alpha was thrown
 * away and `7·(R+G+B) − 0.04` put in its place. Sampled over the poster's own
 * opaque pixels, that drove 21.5% of them below full opacity and 9.2% below
 * half — concentrated in the bottom third of the image (median row 722 of 954,
 * mean colour barely off black), which is precisely the dark charcoal and black
 * backing sheets. They are opaque in the asset and near-black in colour, and a
 * *luma* key cannot tell that from ground, so they rendered semi-transparent
 * with the page's lattice reading straight through them. The canvas frames that
 * replace them carry no filter at all, so the poster-to-canvas hand-off flashed
 * those bottom layers from ghosted to solid.
 *
 * Fixed by removing the filter, not by re-tuning the key: the key is correct,
 * it had simply already been applied. The `<filter>` definition went with it —
 * nothing referenced it any more, and a key left sitting in the markup is an
 * invitation to re-attach it.
 *
 * What both elements *do* carry is `REEL_TINT`, which is colour only and never
 * touches alpha.
 */
export const TechnologyReel = ({ content, className }: TechnologyReelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const poster = posterRef.current;
    if (!canvas) return;
    const section = canvas.closest("section");
    if (!(section instanceof HTMLElement)) return;

    const tier =
      window.innerWidth >= TIER_BREAKPOINT ? TIERS.hi : TIERS.lo;
    const { side, count } = tier;
    canvas.width = side;
    canvas.height = side;

    // `alpha` is the whole point — the ground was keyed out so the page's
    // lattice reads through it. `desynchronized` lets the compositor take the
    // surface without a round trip through the main thread's paint, which is
    // (With a CSS filter now on the element, the surface goes through the
    // compositor's filter path first, so the low-latency scanout the flag asks
    // for is best-effort rather than guaranteed. The filter is colour-only and
    // cheap; the alternative — baking the tint into 102 frames — is recorded in
    // frames.mjs as the route to take if this ever shows up in a profile.)
    // exactly the pattern here: one draw per rAF, never read back.
    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });
    if (!ctx) return;
    // Set once, never per frame: `clearRect` is unaffected by it, and every
    // draw this component makes wants the additive blend — see the note above.
    ctx.globalCompositeOperation = "lighter";

    const frames: (ImageBitmap | null)[] = new Array(count).fill(null);
    let decoded = 0;
    let disposed = false;

    /**
     * The nearest frame that has actually arrived, searching outward.
     *
     * The set loads in order, so early in the scroll this is almost always the
     * frame itself; a reader who flicks to the end before loading finishes sees
     * the last frame that made it rather than an empty box. Once `decoded`
     * reaches `count` the search always hits on its first try.
     */
    const nearest = (index: number) => {
      for (let step = 0; step < count; step += 1) {
        const before = frames[index - step];
        if (before) return before;
        const after = frames[index + step];
        if (after) return after;
      }
      return null;
    };

    /** Last blended position painted, so a held scroll does not redraw. */
    let painted = Number.NaN;

    const draw = (position: number, force = false) => {
      if (!force && Math.abs(position - painted) < REPAINT_EPSILON) return;
      const lower = Math.floor(position);
      const upper = Math.min(count - 1, lower + 1);
      const a = nearest(lower);
      if (!a) return;
      const b = nearest(upper) ?? a;
      const t = position - lower;

      ctx.clearRect(0, 0, side, side);
      ctx.globalAlpha = 1 - t;
      ctx.drawImage(a, 0, 0, side, side);
      ctx.globalAlpha = t;
      ctx.drawImage(b, 0, 0, side, side);
      painted = position;

      // The poster has done its job the moment there is a real picture under
      // it. Opacity rather than unmount: the poster is one still and the canvas
      // is already somewhere else in the clip, so a cut would jump the stack.
      // It no longer covers a *keying* difference — both carry the same baked
      // alpha and the same `REEL_TINT`, so edge and colour match across the
      // seam; the fade is only hiding the change of position now.
      if (poster && poster.style.opacity !== "0") poster.style.opacity = "0";
    };

    /**
     * Fetch and decode the set, in order, a few at a time.
     *
     * `createImageBitmap` off a blob decodes on a worker thread, so none of
     * this lands on the frame the scroll is using — which is the reason the
     * frames are not plain `<img>` elements. An `<img>` defers its decode to
     * the first `drawImage`, and that decode is synchronous and on the main
     * thread: it would put back exactly the stall this rewrite removes.
     */
    let cursor = 0;
    const pump = async (): Promise<void> => {
      while (!disposed) {
        const index = cursor;
        cursor += 1;
        if (index >= count) return;
        try {
          const response = await fetch(framePath(tier.dir, index));
          if (!response.ok) continue;
          const bitmap = await createImageBitmap(await response.blob());
          if (disposed) {
            bitmap.close();
            return;
          }
          frames[index] = bitmap;
          decoded += 1;
          // Repaint on arrival, so the box fills in as the set lands rather
          // than waiting for the reader to move.
          draw(Number.isNaN(painted) ? 0 : painted, true);
        } catch {
          // A frame that will not load is one the neighbour search covers.
          // Failing the whole reel over it would be worse than a longer blend.
        }
      }
    };
    void Promise.all(
      Array.from({ length: FETCH_CONCURRENCY }, () => pump()),
    );

    let playhead = 0;
    /** Previous tick's timestamp, for the frame-rate-independent follow. */
    let lastTime = 0;
    /** The box's resting top while the stage is pinned — see `RELEASE_LAG`. */
    let pinnedTop: number | null = null;

    /**
     * **Two ways to measure, because the section has two shapes.**
     *
     * In the frame it is a pinned stage inside a region several viewports tall,
     * and the scroll that matters is that region's own travel — the same number
     * the card walk reads, so the two cannot drift apart. Below the frame there
     * is no pinning and the section is barely taller than its content, so
     * progress is the box's own crossing of the viewport instead.
     */
    const readProgress = () => {
      const viewport = window.innerHeight || 1;
      const travel = section.offsetHeight - viewport;
      if (travel > 0) {
        // The lead is part of the run, not an offset on it: 0 with the
        // section's top edge a lead's worth below the fold, 1 when the pinned
        // travel is done. The reel therefore still ends exactly where the card
        // walk does — it simply starts before the stage has locked.
        const lead = viewport * ENTRY_LEAD;
        return clamp(
          (lead - section.getBoundingClientRect().top) / (lead + travel),
        );
      }
      const box = canvas.getBoundingClientRect();
      return clamp((viewport - box.top) / (viewport + box.height));
    };

    /**
     * The exit ramp, applied to the reel rather than to the stage: the heading,
     * the lede and the walking card leave with the screen, and only the picture
     * hangs back — which is the parallax the rest of the page already reads as
     * depth. Runs only where the stage is actually pinned; below the frame the
     * progress is a plain crossing and there is no seam to cover.
     */
    const applyRelease = (progress: number, viewport: number) => {
      // **The box, not the canvas.** The ramp is written as a transform on the
      // canvas, and a transformed element's own rect includes it — measuring
      // there feeds the drop back into its own input and the ramp stalls at a
      // fixed point a third of the way in. The parent carries no transform, so
      // it is the one thing here still reporting where the layout actually is.
      const box = canvas.parentElement ?? canvas;
      const boxTop = box.getBoundingClientRect().top;
      if (progress < 1) pinnedTop = boxTop;
      const released = pinnedTop === null ? 0 : Math.max(0, pinnedTop - boxTop);
      const lag = viewport * RELEASE_LAG;
      const drop = lag * (1 - Math.exp(-released / lag));
      const transform =
        drop > 0.5 ? `translate3d(0, ${drop.toFixed(1)}px, 0)` : "";
      canvas.style.transform = transform;
      // The poster rides along until it has faded, or the two separate
      // visibly during the hand-off.
      if (poster && decoded === 0) poster.style.transform = transform;
    };

    const unsubscribe = subscribeToTicker(
      (time) => {
        const delta = lastTime ? Math.min(50, time - lastTime) : FOLLOW_STEP_MS;
        lastTime = time;

        const viewport = window.innerHeight || 1;
        const progress = readProgress();
        if (section.offsetHeight - viewport > 0) {
          applyRelease(progress, viewport);
        }

        // The follower is integrated every frame and the draw is unconditional
        // after it — there is no decoder to be busy, so the two can no longer
        // fall out of step the way ADR-0044 had to correct for.
        const follow = 1 - Math.pow(1 - SEEK_FOLLOW, delta / FOLLOW_STEP_MS);
        playhead += (progress - playhead) * follow;
        draw(playhead * (count - 1));
      },
      () => 0,
    );

    return () => {
      disposed = true;
      unsubscribe();
      for (const frame of frames) frame?.close();
    };
  }, []);

  return (
    <>
      {/* The still that holds the box, and the element that carries the alt
          text: it stays in the accessibility tree once faded, so the artwork is
          described exactly once and the canvas can stay decorative. A discrete
          opacity change on a token duration — the narrow CSS-transition
          exception, not scroll-driven motion. */}
      {/* The canvas is the real picture; this is a paint-immediately backstop,
          and an optimised image
          would add a wrapper that breaks the absolute stacking here. */}
      <img
        ref={posterRef}
        src={content.src}
        alt={content.alt}
        width={content.width}
        height={content.height}
        style={{ filter: REEL_TINT }}
        className={`o-absolute o-inset-0 o-transition-opacity pf-duration-var-duration-normal pf-ease-entrance pf-motion-reduce-transition-none ${className ?? ""}`}
      />

      {/* The same tint as the poster, from the same constant — the two are the
          same artwork stacked one on the other through the fade, so any
          difference between them would be a colour step in the hand-off. It is
          a colour transform only: alpha is untouched, so the baked key survives
          it, and the additive blend inside the canvas is already resolved by
          the time the element is filtered. */}
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{ filter: REEL_TINT }}
        className={`o-absolute o-inset-0 ${className ?? ""}`}
      />
    </>
  );
};
