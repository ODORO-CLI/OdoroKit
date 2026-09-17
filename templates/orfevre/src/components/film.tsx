import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";

import type { Chapter } from "@/data/content";
import { Reveal } from "@/components/reveal";
import { markFilmReady } from "@/lib/ready";
import { REDUCED, clamp, damp, lerp, onFrame, trackProgress } from "@/lib/scroll";

/* ══════════════════════════════════════════════════════════════════════════
   A film, pinned and scrubbed.

   Used twice on this page — the campaign film and the macro film — so it is a
   component, not a copy. The video is never played: `currentTime` is written
   every frame and the element decodes on demand.

   The scroll position maps to a video time through a piecewise ramp built from
   the chapters' own weights. Each chapter is two legs: the camera MOVING, then
   the camera PARKED, and the parked leg is given more scroll than it has
   seconds — so the film appears to wait while the reader reads, then move again
   when they do.

   ONE DEPARTURE FROM THE COMMITTED STYLE, AND IT IS DELIBERATE. Aerra sets
   type over a photograph in white, because in that Style every photograph is
   the dark area of a white page. Here the photograph is HIGH-KEY WHITE. White
   type on it would be invisible, so the copy is ink and the wash that holds it
   is white instead of black. The Style's intent — copy holding contrast
   without flattening the picture into a plate — is exactly preserved; only its
   polarity is inverted, because the subject is.
   ══════════════════════════════════════════════════════════════════════════ */

type Leg = { p0: number; p1: number; t0: number; t1: number; hold: boolean };

function buildLegs(chapters: Chapter[]) {
  const legs: Leg[] = [];
  let acc = 0;
  for (const c of chapters) {
    legs.push({ p0: acc, p1: acc + c.wMove, t0: c.t0, t1: c.tHold, hold: false });
    acc += c.wMove;
    legs.push({ p0: acc, p1: acc + c.wHold, t0: c.tHold, t1: c.t1, hold: true });
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
  /** Which third of the frame the copy stands in. */
  side?: "left" | "right";
  /** Only the first film reports readiness — the loader waits on that one. */
  gatesLoader?: boolean;
  /** The hero chrome, laid on the first chapter. */
  chrome?: (shown: boolean) => ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const time = useRef(0);

  /* The ramp is derived from the chapters, so it is memoised, not stashed in
     a ref: a ref read during render is a value React cannot see changing, and
     the track's own height is read during render. */
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
      <div className="o-sticky o-top-0 h-dvh o-w-full o-overflow-hidden bg-ground">
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
        "o-pointer-events-none o-absolute o-inset-y-0 o-flex o-w-full o-items-center or-gouttiere-film or-w-54",
        side === "left" ? "o-left-0" : "o-right-0",
      ].join(" ")}
      style={{ opacity: show ? 1 : 0, transition: "opacity 620ms var(--raw-ease)" }}
    >
      {/* The film is high-key white and the copy is ink, so the wash that holds
          it is WHITE — it lifts the half of the frame the words stand on and
          leaves the other half untouched. */}
      <div
        className="o-pointer-events-none o-absolute o-inset-0"
        style={{
          background: `linear-gradient(to ${side === "left" ? "right" : "left"}, rgb(255 255 255 / 0.82) 0%, rgb(255 255 255 / 0.55) 45%, transparent 100%)`,
        }}
      />

      <div ref={inner} className="or-mw-30 o-will-change-transform">
        {c.eyebrow && (
          <Reveal as="p" className="label o-mb-6 o-block text-ink-muted" text={c.eyebrow} show={show} stagger={30} />
        )}
        {c.title && (
          <Reveal
            as="h2"
            className="display or-fs-t2"
            text={c.title}
            show={show}
            stagger={75}
            delay={120}
          />
        )}
        {c.body && (
          <Reveal
            as="p"
            className="o-mt-6 or-mw-38ch or-fs-95 o-leading-relaxed text-ink-muted"
            text={c.body}
            show={show}
            stagger={22}
            /* Continue from the title's count so the two engines read as one
               sweep rather than as two separate arrivals. */
            delay={120 + (c.title?.split(" ").length ?? 0) * 75 + 90}
          />
        )}
        {c.metrics && (
          <dl
            className="o-mt-10 o-flex o-flex-wrap o-gap-x-12 o-gap-y-5 o-border-t border-line o-pt-6"
            style={{ opacity: show ? 1 : 0, transition: "opacity 700ms var(--raw-ease) 620ms" }}
          >
            {c.metrics.map((m) => (
              <div key={m.label}>
                <dt className="display or-fs-175">{m.value}</dt>
                <dd className="label o-mt-1 or-mw-18ch text-ink-muted">{m.label}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
