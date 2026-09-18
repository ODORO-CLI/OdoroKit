import { useEffect, useState } from "react";

import { subscribeToTicker } from "@/lib/animation/ticker";

/**
 * How long the curtain will wait for its gates before lifting anyway.
 *
 * A preloader that can outlive what it is waiting for is worse than none: a
 * model that fails to decode, a font that never resolves, an offline image —
 * any of them would leave the page behind a wall for good. This is the promise
 * that cannot happen.
 */
const PATIENCE_MS = 8000;

/** Minimum time on screen, so a warm cache does not flash the curtain. */
const FLOOR_MS = 700;

/** How fast the readout chases the real figure, per 60Hz frame. */
const COUNT_LERP = 0.08;

const CORNERS = [
  "o-top-10 o-left-10 o-border-t o-border-l",
  "o-top-10 o-right-10 o-border-t o-border-r",
  "o-bottom-10 o-left-10 o-border-b o-border-l",
  "o-bottom-10 o-right-10 o-border-b o-border-r",
];

/**
 * The loading curtain.
 *
 * **Gated on real readiness, not on a timer.** It waits for the fonts to
 * resolve, for `window.load`, and for the hero's WebGL scene to report that its
 * model is compiled — the three things that decide whether the first screen is
 * actually there. A duration would be a promise about the network that nothing
 * can keep; this way a warm cache leaves almost immediately and a cold one is
 * told the truth. `PATIENCE_MS` is the backstop.
 *
 * The readout chases the real figure rather than showing it, so the count reads
 * as something filling rather than as three jumps between the gates.
 *
 * Rendered on the server so there is no flash of the page before it, and
 * removed from the flow entirely once it has gone — a `<noscript>` rule hides
 * it where scripts never run, which is the one case that could strand a reader
 * behind it.
 */
export const Preloader = () => {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const started = performance.now();
    let target = 0;
    let shown = 0;
    let finished = false;

    const gates = ["fonts", "load", "scene"];
    const met = new Set<string>();
    const settle = (gate: string) => {
      if (finished) return;
      met.add(gate);
      target = met.size / gates.length;
      if (met.size === gates.length) finish();
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      target = 1;
      const wait = Math.max(0, FLOOR_MS - (performance.now() - started));
      window.setTimeout(() => setDone(true), wait);
    };

    document.fonts?.ready.then(() => settle("fonts")).catch(() => settle("fonts"));

    if (document.readyState === "complete") settle("load");
    else window.addEventListener("load", () => settle("load"), { once: true });

    window.addEventListener("hero-scene-ready", () => settle("scene"), {
      once: true,
    });

    const patience = window.setTimeout(finish, PATIENCE_MS);

    const unsubscribe = subscribeToTicker(() => {
      // Creep towards the next gate rather than sitting still between them, but
      // never past it — the number should never have to go backwards.
      const ceiling = finished ? 1 : Math.min(0.97, target + 0.12);
      shown += (ceiling - shown) * COUNT_LERP;
      setProgress(shown);
    }, () => 0);

    return () => {
      window.clearTimeout(patience);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(() => setGone(true), 700);
    return () => window.clearTimeout(timer);
  }, [done]);

  if (gone) return null;

  const percent = Math.round(Math.min(1, progress) * 100);

  return (
    <div
      aria-hidden
      data-preloader
      className={`hero-lattice o-fixed o-inset-0 pf-z-100 o-grid o-place-items-center pf-font-mono o-transition-opacity pf-duration-500 pf-ease-entrance pf-motion-reduce-transition-none ${
        done ? "o-pointer-events-none o-opacity-0" : "o-opacity-100"
      }`}
    >
      {/* The frame closes on the page — the same gesture the buttons use when
          the pointer finds them, at the scale of the whole viewport. */}
      {CORNERS.map((corner) => (
        <span
          key={corner}
          className={`o-absolute o-size-10 pf-border-hero-content o-transition-all pf-duration-700 pf-ease-entrance pf-motion-reduce-transition-none ${corner} ${
            done ? "o-scale-150 o-opacity-0" : "o-scale-100 o-opacity-100"
          }`}
        />
      ))}

      {/* Wider, with a larger mark and a readable count, below the frame. The
          curtain is the first thing the page shows, and at the frame's own
          sizes it sat as a small island in the middle of a tablet screen with
          a 12px line under it. */}
      <div className="o-flex o-w-64 o-flex-col o-items-center o-gap-6 max-lg:o-w-80 max-lg:o-gap-8">
        <img
          src="/assets/ui/logo-mark.png"
          alt=""
          width={300}
          height={120}
          priority
          className={`o-h-12 o-w-auto o-object-contain max-lg:o-h-16 o-transition-transform pf-duration-700 pf-ease-entrance pf-motion-reduce-transition-none ${
            done ? "o-scale-105" : "o-scale-100"
          }`}
        />

        {/* The rule fills. One transform on one element, so the browser has a
            compositor job rather than a layout one on every frame. */}
        <div className="o-h-px o-w-full pf-bg-hero-rule max-lg:o-h-0.5">
          <div
            className="o-h-full o-origin-left pf-bg-hero-content"
            style={{ transform: `scaleX(${Math.min(1, progress)})` }}
          />
        </div>

        {/* Muted rather than faint below the frame: at 40% ink the readout was
            there without being legible, which is the one thing a loading count
            has to be. */}
        <p className="pf-text-hero-caption pf-leading-hero-display pf-tracking-hero-caption pf-text-hero-content-faint o-tabular-nums pf-max-lg-text-hero-body pf-max-lg-text-hero-content-muted">
          LOADING {String(percent).padStart(3, "0")}
        </p>
      </div>
    </div>
  );
};
