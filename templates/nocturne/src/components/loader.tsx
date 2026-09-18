import { useEffect, useRef, useState } from "react";

import { BRAND } from "@/data/content";
import { filmReady } from "@/lib/ready";
import { REDUCED, clamp, lockScroll } from "@/lib/scroll";

/* ══════════════════════════════════════════════════════════════════════════
   The cover.

   The number is honest: it tracks real readiness — fonts resolved, the film's
   poster decoded, and the film element's first frame actually decoded — and it
   PARKS at 92 until all three have landed. If the film stalls, the counter sits
   at 92 for ever, which is the truth.

   The exit is the Style's: the cover does not fade, it LIFTS ALONG THE AXIS —
   −18°, up to the right, the same line every other gesture in this system
   travels on. Speed streaks cross on that line while it waits.

   The gate flips at the START of the exit: the hero's words arrive through the
   departing cover, so the two moves read as one gesture. Scroll is released
   later, on the cover's rest.
   ══════════════════════════════════════════════════════════════════════════ */

const MIN_VISIBLE = 1200;
const CAP = 7000;
const CEILING = 92;
const EXIT_MS = 900;

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

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
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

      if (v >= 99.99 && now - started >= MIN_VISIBLE && !fired.current) {
        fired.current = true;
        setLeaving(true);
        onReady(); // the gate, at the START of the exit
        window.setTimeout(
          () => {
            setGone(true);
            lockScroll(false); // released on the cover's rest, later than the copy
          },
          REDUCED ? 0 : EXIT_MS
        );
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
    <div
      className="o-fixed o-inset-0 o-z-50 o-overflow-hidden nc-bg-cover"
      style={{
        // Up and to the right, on the house axis: cos(18°), −sin(18°).
        transform: leaving ? "translate3d(152vmax, -49.4vmax, 0)" : "none",
        transition: REDUCED ? "opacity 150ms linear" : `transform ${EXIT_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`,
        opacity: REDUCED && leaving ? 0 : 1,
      }}
      aria-hidden={leaving}
    >
      {/* Streaks on the same axis, looping while the cover waits. */}
      {!REDUCED &&
        [0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="o-pointer-events-none o-absolute o-h-px nc-w-42vw nc-bg-ink-subtle"
            style={{
              top: `${14 + i * 17}%`,
              left: "-50vw",
              transform: "rotate(-18deg)",
              animation: `streak ${2.4 + i * 0.35}s linear ${i * 0.42}s infinite`,
            }}
          />
        ))}

      <div className="o-absolute nc-inset-x-max-1-25rem-3vw o-top-6 o-flex o-items-start o-justify-between">
        <p className="display nc-text-1-05rem nc-leading-none">{BRAND}</p>
        <p className="label nc-text-ink-muted">Chargement</p>
      </div>

      <div className="o-absolute nc-inset-x-max-1-25rem-3vw o-bottom-8">
        <div className="o-relative o-h-px o-w-full nc-bg-ink-subtle">
          <div className="o-absolute o-left-0 o-top-0 o-h-px nc-bg-ink" style={{ width: `${p}%` }} />
        </div>
        <p className="display o-mt-6 nc-text-clamp-3rem-10vw-7rem nc-leading-none o-tabular-nums">
          {String(Math.round(p)).padStart(3, "0")}
        </p>
      </div>
    </div>
  );
}
