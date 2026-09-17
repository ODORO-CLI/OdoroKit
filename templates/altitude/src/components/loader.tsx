import { useEffect, useRef, useState } from "react";

import { BRAND } from "@/data/content";
import { filmReady } from "@/lib/ready";
import { REDUCED, clamp, lockScroll } from "@/lib/scroll";

/* ══════════════════════════════════════════════════════════════════════════
   The curtain.

   The number is honest: it tracks real readiness — fonts resolved, the film's
   poster decoded, and the film element's first frame actually decoded — and it
   PARKS at 92 until all three have landed. If the film stalls, the counter
   sits at 92 for ever, which is the truth. A percentage that is a setTimeout
   wearing a costume is the one thing this page will not ship.

   MIN_VISIBLE stops a warm cache from flashing a curtain; the cap stops a
   stalled asset from trapping the reader.

   The gate flips at the START of the exit, not on its rest: the hero's words
   arrive THROUGH the departing curtain, so the two moves read as one gesture.
   Scroll is released later, on the curtain's rest — that is a separate clock
   and it is correct for it to be late.
   ══════════════════════════════════════════════════════════════════════════ */

const MIN_VISIBLE = 1300;
const CAP = 7000;
const CEILING = 92;

export function Loader({ onReady }: { onReady: () => void }) {
  const [value, setValue] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const ready = useRef(false);
  const fired = useRef(false);

  useEffect(() => {
    lockScroll(true);
    const started = performance.now();

    const poster = new Image();
    poster.src = "/assets/film-poster.jpg";

    const signals = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      poster.decode().catch(() => undefined),
      filmReady,
    ]);

    signals.then(() => {
      ready.current = true;
    });
    // The cap is a floor under the experience, not a substitute for a signal.
    const capId = window.setTimeout(() => {
      ready.current = true;
    }, CAP);

    let raf = 0;
    let last = performance.now();
    let v = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      /* Two rates: a slow crawl toward the holding ceiling while we wait, and
         a fast run to 100 once every signal is in. */
      if (ready.current && v >= 99.4) v = 100;
      else {
        const ceiling = ready.current ? 100 : CEILING;
        v += (ceiling - v) * (ready.current ? 6 : 1.7) * dt;
      }
      setValue(v);

      const elapsed = now - started;
      if (v >= 99.99 && elapsed >= MIN_VISIBLE && !fired.current) {
        fired.current = true;
        setLeaving(true);
        // The gate, at the START of the exit.
        onReady();
        window.setTimeout(() => {
          setGone(true);
          lockScroll(false);
        }, REDUCED ? 0 : 1100);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(capId);
      lockScroll(false);
    };
  }, [onReady]);

  if (gone) return null;

  return (
    <div
      className="o-fixed o-inset-0 o-z-50 o-flex o-flex-col o-justify-between bg-ground al-gouttiere o-py-8"
      style={{
        // Four columns wipe away, alternating up and down, rather than a fade.
        clipPath: leaving ? "inset(0 0 100% 0)" : "inset(0 0 0 0)",
        transition: REDUCED
          ? "opacity 150ms linear"
          : "clip-path 1100ms cubic-bezier(0.76, 0, 0.24, 1)",
        opacity: REDUCED && leaving ? 0 : 1,
      }}
      aria-hidden={leaving}
    >
      <p className="display al-fs-105 al-track-34">{BRAND}</p>

      <div>
        {/* A rule that measures what the number claims. */}
        <div className="o-h-px o-w-full bg-line">
          <div
            className="o-h-px bg-ink"
            style={{ width: `${clamp(value, 0, 100)}%` }}
          />
        </div>
        <div className="o-mt-6 o-flex o-items-end o-justify-between">
          <p className="label">Chargement du film</p>
          <p className="display al-fs-geant leading-none o-tabular-nums">
            {Math.round(clamp(value, 0, 100))}
          </p>
        </div>
      </div>
    </div>
  );
}
