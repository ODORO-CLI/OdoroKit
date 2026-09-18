import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";

import type { Chapter } from "@/data/content";
import { Reveal } from "@/components/reveal";
import { markFilmReady } from "@/lib/ready";
import { REDUCED, clamp, damp, lerp, onFrame, trackProgress } from "@/lib/scroll";

/* ══════════════════════════════════════════════════════════════════════════
   A film, pinned and scrubbed.

   Used twice on this page — the fleet film and the macro film — so it is a
   component, not a copy. The video is never played: `currentTime` is written
   every frame and the element decodes on demand.

   Scroll maps to video time through a piecewise ramp built from the chapters'
   own weights. Each chapter is two legs — the camera MOVING, then the camera
   PARKED — and the parked leg is given more scroll than it has seconds, so the
   film appears to wait while the reader reads.

   THE STYLE'S RULE, HONOURED LITERALLY: there is no page surface here. The
   ground IS the footage, and legibility comes from a gradient scrim rather
   than from a card — heaviest at the top, where the header and eyebrow land.
   A panel behind this copy would be the one thing that breaks the premise.
   ══════════════════════════════════════════════════════════════════════════ */

type Leg = { p0: number; p1: number; t0: number; t1: number };

function buildLegs(chapters: Chapter[]) {
  const legs: Leg[] = [];
  let acc = 0;
  for (const c of chapters) {
    legs.push({ p0: acc, p1: acc + c.wMove, t0: c.t0, t1: c.tHold });
    acc += c.wMove;
    legs.push({ p0: acc, p1: acc + c.wHold, t0: c.tHold, t1: c.t1 });
    acc += c.wHold;
  }
  for (const l of legs) {
    l.p0 /= acc;
    l.p1 /= acc;
  }
  return { legs, weight: acc };
}

export function Film({
  id,
  src,
  src720,
  poster,
  chapters,
  filmEnd,
  side = "left",
  gatesLoader = false,
  chrome,
}: {
  id: string;
  src: string;
  src720: string;
  poster: string;
  chapters: Chapter[];
  filmEnd: number;
  side?: "left" | "right";
  gatesLoader?: boolean;
  chrome?: (shown: boolean) => ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const time = useRef(0);

  const { legs, weight } = useMemo(() => buildLegs(chapters), [chapters]);
  const trackVh = weight * 100 + 100;

  const [shown, setShown] = useState<boolean[]>(() => chapters.map(() => false));
  const shownRef = useRef(shown);
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);

  /* Which encode to fetch is decided here rather than in markup: <source
     media=""> is ignored by browsers for video, and a 1080p film scrubbed on a
     phone is a decode the phone cannot afford. No src is emitted server-side,
     so nothing is fetched twice. */
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.src = window.matchMedia("(max-width: 900px)").matches ? src720 : src;
    v.load();
  }, [src, src720]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;

    const progressToTime = (p: number) => {
      p = clamp(p);
      for (const l of legs) {
        if (p <= l.p1 || l === legs[legs.length - 1]) {
          const u = (p - l.p0) / (l.p1 - l.p0);
          return lerp(l.t0, l.t1, clamp(u));
        }
      }
      return filmEnd;
    };

    return onFrame(({ delta }) => {
      const target = progressToTime(trackProgress(el));

      /* A light damp on top of Lenis' own: it absorbs the step between two
         decoded frames without adding enough lag to feel disconnected. Under
         reduced motion the film still follows the reader's own scroll — that is
         their motion, not ours — but it stops trailing behind it. */
      time.current = REDUCED ? target : damp(time.current, target, 9, delta);

      const v = video.current;
      if (v && v.readyState >= 2) {
        // Seeking costs a decode; only ask for a frame we are not already on.
        if (Math.abs(time.current - v.currentTime) > 1 / 48) {
          v.currentTime = time.current;
        }
      }

      // Chapters quantise from the SAME value the frame does, so the copy can
      // never disagree with what is on screen.
      let dirty = false;
      const next = shownRef.current.slice();
      for (let i = 0; i < chapters.length; i++) {
        const c = chapters[i];
        const on = time.current >= c.tHold - 0.3 && time.current <= c.t1 + 0.35;
        if (on !== next[i]) {
          next[i] = on;
          dirty = true;
        }
      }
      if (dirty) {
        shownRef.current = next;
        setShown(next);
      }

      let ch = 0;
      for (let i = chapters.length - 1; i >= 0; i--) {
        if (time.current >= chapters[i].t0 - 0.001) {
          ch = i;
          break;
        }
      }
      if (ch !== currentRef.current) {
        currentRef.current = ch;
        setCurrent(ch);
      }
    });
  }, [chapters, filmEnd, legs]);

  return (
    <div
      ref={track}
      id={id}
      className="o-relative"
      /* The track is as tall as the chapters' own weights. That is right on a
         desktop wheel and tedious on a thumb, so a phone runs the same film
         over a shorter track: same chapters, same holds, less travel. */
      style={{ height: `calc(${trackVh}vh * var(--film-track-scale, 1))` }}
    >
      <div className="o-sticky o-top-0 nc-h-dvh o-w-full o-overflow-hidden nc-bg-cover">
        <video
          ref={video}
          className="o-absolute o-inset-0 o-h-full o-w-full o-object-cover"
          poster={poster}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
          /* "Ready" means a frame the GPU could actually draw — readyState 2,
             not a resolved promise. */
          onLoadedData={gatesLoader ? markFilmReady : undefined}
        />

        {/* The scrim, in its two load-bearing versions. The full-strength ramp
            turns the top of a phone screen into a black rectangle, so the
            compact one drops top density and stretches the falloff across half
            the screen. Both are the Style's, and both are needed. */}
        <div
          className="o-pointer-events-none o-absolute o-inset-0 md:o-hidden"
          style={{
            background:
              "linear-gradient(to bottom, rgb(0 0 0 / 0.46) 0%, rgb(0 0 0 / 0.12) 50%, rgb(0 0 0 / 0.55) 100%)",
          }}
        />
        <div
          className="o-pointer-events-none o-absolute o-inset-0 o-hidden md:o-block"
          style={{
            background:
              "linear-gradient(to bottom, rgb(0 0 0 / 0.78) 0%, rgb(0 0 0 / 0.32) 26%, rgb(0 0 0 / 0.12) 46%, rgb(0 0 0 / 0.30) 72%, rgb(0 0 0 / 0.72) 100%)",
          }}
        />

        {chrome?.(current === 0)}

        {chapters.map((c, i) =>
          c.title ? (
            <ChapterBlock key={c.id} chapter={c} show={shown[i]} side={side} time={time} />
          ) : null
        )}
      </div>
    </div>
  );
}

/* ── one chapter ─────────────────────────────────────────────────────────── */
function ChapterBlock({
  chapter: c,
  show,
  side,
  time,
}: {
  chapter: Chapter;
  show: boolean;
  side: "left" | "right";
  time: RefObject<number>;
}) {
  const inner = useRef<HTMLDivElement>(null);

  /* The parallax. The film is pinned and the copy is pinned with it, so
     without this they travel as one plate and the section reads flat. The
     block drifts a few viewport-percent against its own chapter — a different
     rate from the footage behind it, which is the definition of the effect.
     Written straight to the node inside the frame: this must never re-render
     the tree while the reader is scrolling. */
  useEffect(() => {
    if (REDUCED) return;
    return onFrame(() => {
      const el = inner.current;
      if (!el) return;
      const span = c.t1 - c.t0;
      const u = clamp((time.current - c.t0) / (span || 1));
      el.style.transform = `translate3d(0, ${lerp(3, -3, u)}vh, 0)`;
    });
  }, [c.t0, c.t1, time]);

  return (
    <div
      className={[
        "o-pointer-events-none o-absolute o-inset-y-0 o-flex o-w-full o-items-center nc-px-max-1-25rem-4vw nc-md-w-56",
        side === "left" ? "o-left-0" : "o-right-0",
      ].join(" ")}
      style={{ opacity: show ? 1 : 0, transition: "opacity 620ms var(--raw-ease)" }}
    >
      {/* The Style holds legibility with a VERTICAL ramp, deliberately light
          across the middle of the frame — which is exactly where a centred
          block of copy sits, and exactly where this footage puts a lit city.
          So each chapter brings its own wash, from ITS side. The Style's
          instrument is kept (a gradient, never a card); only its direction is
          added to, because the subject is a night skyline rather than a track. */}
      <div
        className="o-pointer-events-none o-absolute o-inset-0"
        style={{
          background: `linear-gradient(to ${side === "left" ? "right" : "left"}, rgb(0 0 0 / 0.74) 0%, rgb(0 0 0 / 0.45) 46%, transparent 100%)`,
        }}
      />

      <div ref={inner} className="nc-max-w-32rem o-will-change-transform">
        {c.eyebrow && (
          <Reveal as="p" className="label o-mb-6 o-block nc-text-ink-muted" text={c.eyebrow} show={show} stagger={30} />
        )}
        {c.title && (
          <Reveal
            as="h2"
            className="display nc-text-clamp-1-9rem-3-6vw-3-4rem"
            text={c.title}
            show={show}
            stagger={70}
            delay={120}
          />
        )}
        {c.body && (
          <Reveal
            as="p"
            className="o-mt-7 nc-max-w-40ch nc-text-0-95rem o-leading-relaxed nc-text-ink-muted"
            text={c.body}
            show={show}
            stagger={22}
            /* Continue from the title's count so the two engines read as one
               sweep rather than as two separate arrivals. */
            delay={120 + (c.title?.split(" ").length ?? 0) * 70 + 90}
          />
        )}
        {c.metrics && (
          <dl
            className="o-mt-10 o-flex o-flex-wrap o-gap-x-12 o-gap-y-5"
            style={{ opacity: show ? 1 : 0, transition: "opacity 700ms var(--raw-ease) 620ms" }}
          >
            {c.metrics.map((m) => (
              <div key={m.label}>
                <span className="hairline o-mb-4 o-block o-w-16" />
                <dt className="display nc-text-1-7rem">{m.value}</dt>
                <dd className="label o-mt-2 nc-max-w-18ch nc-text-ink-muted">{m.label}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
