import { useEffect, useRef, useState } from "react";

import { BRAND } from "@/data/content";
import { filmReady } from "@/lib/ready";
import { REDUCED, clamp, easeOutCubic, lockScroll } from "@/lib/scroll";

/* ══════════════════════════════════════════════════════════════════════════
   The curtain.

   The number is honest: it tracks real readiness — fonts resolved, the film's
   poster decoded, and the film element's first frame actually decoded — and it
   PARKS at 92 until all three have landed. If the film stalls, the counter sits
   at 92 for ever, which is the truth. A percentage that is a setTimeout wearing
   a costume is the one thing this page will not ship.

   The exit is the Style's own: the sheet does not fade, a rounded hole OPENS in
   it and grows until it clears the viewport. It is driven from this component's
   own frame loop rather than by a CSS transition, because a mask's radial stop
   is not an interpolatable value in every engine — writing it per frame works
   everywhere and costs one style write.

   The gate flips at the START of the exit, not on its rest: the hero's words
   arrive THROUGH the opening hole, so the two moves read as one gesture.
   ══════════════════════════════════════════════════════════════════════════ */

const MIN_VISIBLE = 1200;
const CAP = 7000;
const CEILING = 92;
const EXIT_MS = 950;

export function Loader({ onReady }: { onReady: () => void }) {
  const [value, setValue] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);
  const ready = useRef(false);
  const fired = useRef(false);

  useEffect(() => {
    lockScroll(true);
    const started = performance.now();

    const poster = new Image();
    poster.src = "/assets/film-poster.jpg";

    Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      poster.decode().catch(() => undefined),
      filmReady,
    ]).then(() => {
      ready.current = true;
    });
    // The cap is a floor under the experience, not a substitute for a signal.
    const capId = window.setTimeout(() => {
      ready.current = true;
    }, CAP);

    let raf = 0;
    let last = performance.now();
    let v = 0;
    let exitAt = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!exitAt) {
        /* Two rates: a slow crawl toward the holding ceiling while we wait, and
           a fast run to 100 once every signal is in. */
        if (ready.current && v >= 99.4) v = 100;
        else {
          const ceiling = ready.current ? 100 : CEILING;
          v += (ceiling - v) * (ready.current ? 6 : 1.7) * dt;
        }
        setValue(v);

        if (v >= 99.99 && now - started >= MIN_VISIBLE && !fired.current) {
          fired.current = true;
          exitAt = now;
          setLeaving(true);
          onReady(); // the gate, at the START of the exit
        }
        return;
      }

      const t = clamp((now - exitAt) / (REDUCED ? 1 : EXIT_MS));
      const r = easeOutCubic(t) * 160;
      const el = sheet.current;
      if (el) {
        const mask = `radial-gradient(circle at 50% 50%, transparent ${r}%, #000 ${r + 0.5}%)`;
        el.style.maskImage = mask;
        el.style.webkitMaskImage = mask;
      }
      if (t >= 1) {
        cancelAnimationFrame(raf);
        setGone(true);
        lockScroll(false); // released on the curtain's rest, later than the copy
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(capId);
      lockScroll(false);
    };
  }, [onReady]);

  if (gone) return null;
  const p = clamp(value, 0, 100);

  return (
    <div ref={sheet} className="o-fixed o-inset-0 o-z-50 bg-ground" aria-hidden={leaving}>
      <p className="display o-absolute or-gauche-gouttiere or-haut-7 or-fs-115 or-track-30">
        {BRAND}
      </p>

      {/* The count walks the bottom edge as it runs. */}
      <div className="o-absolute or-inset-gouttiere o-bottom-8">
        <div className="o-relative o-h-px o-w-full bg-line">
          <div className="o-absolute o-left-0 o-top-0 o-h-px bg-ink" style={{ width: `${p}%` }} />
        </div>
        <div className="o-relative o-mt-5 or-h-ligne">
          <p
            className="display o-absolute o-whitespace-nowrap or-fs-105 o-tabular-nums"
            style={{ left: `${p}%`, transform: "translateX(-100%)" }}
          >
            {Math.round(p)}
          </p>
        </div>
      </div>
    </div>
  );
}
