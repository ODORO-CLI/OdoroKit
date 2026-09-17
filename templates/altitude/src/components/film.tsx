import { useEffect, useRef, useState, type RefObject } from "react";

import { CHAPTERS, FILM_END } from "@/data/content";
import { REDUCED, clamp, damp, lerp, onFrame, trackProgress } from "@/lib/scroll";
import { Reveal } from "@/components/reveal";
import { markFilmReady } from "@/lib/ready";
import { HeroChrome } from "@/components/hero-chrome";

/* ══════════════════════════════════════════════════════════════════════════
   The film.

   One continuous 40-second take, never played — only seeked. The track is as
   tall as the chapters' own weights; a sticky stage holds the frame while the
   document scrolls past it, and the scroll position maps to a video time
   through a piecewise ramp built from those weights.

   The ramp is the whole trick. Each chapter is two legs: the camera MOVING
   (t0 → tHold) and the camera PARKED (tHold → t1). The parked leg is given
   more scroll than it has seconds, so the film appears to wait while the
   reader reads, then move again when they do. Keyframes land on panel
   boundaries, so a chapter's copy always arrives on a still camera.
   ══════════════════════════════════════════════════════════════════════════ */

type Leg = { p0: number; p1: number; t0: number; t1: number; ch: number; hold: boolean };

const LEGS: Leg[] = (() => {
  const legs: Leg[] = [];
  let acc = 0;
  for (const c of CHAPTERS) {
    legs.push({ p0: acc, p1: acc + c.wMove, t0: c.t0, t1: c.tHold, ch: c.id, hold: false });
    acc += c.wMove;
    legs.push({ p0: acc, p1: acc + c.wHold, t0: c.tHold, t1: c.t1, ch: c.id, hold: true });
    acc += c.wHold;
  }
  for (const l of legs) {
    l.p0 /= acc;
    l.p1 /= acc;
  }
  return legs;
})();

/** Total scroll weight, in viewports, plus one for the stage itself. */
const TRACK_VH =
  CHAPTERS.reduce((sum, c) => sum + c.wMove + c.wHold, 0) * 100 + 100;

function progressToTime(p: number) {
  p = clamp(p);
  for (const l of LEGS) {
    if (p <= l.p1 || l === LEGS[LEGS.length - 1]) {
      const u = (p - l.p0) / (l.p1 - l.p0);
      return lerp(l.t0, l.t1, clamp(u));
    }
  }
  return FILM_END;
}

/** Copy arrives as the camera decelerates, not after it has stopped. */
const textInOf = (i: number) => CHAPTERS[i].tHold - 0.3;

export function Film({ ready }: { ready: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const time = useRef(0);

  /* The only piece of scroll-derived STATE on the page: which chapters are
     showing. It changes a handful of times across 1200vh, so the re-render is
     free — everything continuous stays in refs and is written inside the frame. */
  const [shown, setShown] = useState<boolean[]>(() => CHAPTERS.map(() => false));
  const shownRef = useRef(shown);
  /* The rail's lit tick. Quantised from the SAME time the frame is showing —
     a rail that reads its own scroll band drifts out of step with the picture,
     which is a bug shipped by more than one template in the wild. */
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);

  /* Which encode to fetch is decided here rather than in markup: <source
     media=""> is ignored by browsers for video, and a 1080p film scrubbed on a
     phone is a decode the phone cannot afford. No src is emitted server-side,
     so nothing is fetched twice. */
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const narrow = window.matchMedia("(max-width: 900px)").matches;
    v.src = narrow ? "/video/odoro-film-720.mp4" : "/video/odoro-film.mp4";
    v.load();
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;

    return onFrame(({ delta }) => {
      const p = trackProgress(el);
      const target = progressToTime(p);

      /* A light damp on top of Lenis' own: it absorbs the step between two
         decoded frames without adding enough lag to feel disconnected.
         Under reduced motion the film still follows the reader's own scroll —
         that is their motion, not ours — but it stops trailing behind it: a
         video loop is not covered by an animation library's global flag, so
         the lag is removed here, deliberately, rather than left running. */
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
      for (let i = 0; i < CHAPTERS.length; i++) {
        const c = CHAPTERS[i];
        const on = time.current >= textInOf(i) && time.current <= c.t1 + 0.35;
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
      for (let i = CHAPTERS.length - 1; i >= 0; i--) {
        if (time.current >= CHAPTERS[i].t0 - 0.001) {
          ch = i;
          break;
        }
      }
      if (ch !== currentRef.current) {
        currentRef.current = ch;
        setCurrent(ch);
      }
    });
  }, []);

  return (
    <div
      ref={track}
      className="o-relative"
      /* The track is as tall as the chapters' own weights — about twelve
         viewports. That is right on a desktop wheel and tedious on a thumb, so
         a phone runs the same film over a shorter track: same chapters, same
         holds, less travel. The scale is a token, not a second timeline. */
      style={{ height: `calc(${TRACK_VH}vh * var(--film-track-scale, 1))` }}
      aria-hidden={false}
    >
      <div className="o-sticky o-top-0 h-dvh o-w-full o-overflow-hidden">
        {/* The film. Never played: `currentTime` is written every frame and the
            element decodes on demand. */}
        <video
          ref={video}
          className="o-absolute o-inset-0 o-h-full o-w-full o-object-cover"
          poster="/assets/film-poster.jpg"
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
          /* "Ready" means a frame the GPU could actually draw — readyState 2,
             not a resolved promise. The loader parks at 92 until this fires. */
          onLoadedData={markFilmReady}
        />

        {/* A wash, not a plate: two stops that hold copy at the top and bottom
            edges and leave the middle of the frame alone. */}
        <div
          className="o-pointer-events-none o-absolute o-inset-0"
          style={{
            background:
              "linear-gradient(to bottom, var(--scrim-top) 0%, transparent 34%, transparent 52%, var(--scrim-bottom) 100%)",
          }}
        />

        {/* The two full-height hairlines that rule the frame into thirds. They
            are inset symmetrically, so they never drift on a wide viewport. */}
        <div className="o-pointer-events-none o-absolute o-inset-y-0 al-gauche-marge o-w-px bg-line-faint" />
        <div className="o-pointer-events-none o-absolute o-inset-y-0 al-droite-marge o-w-px bg-line-faint" />

        {/* The hero belongs to chapter 0 and leaves with it — waiting for
            chapter 1's copy would hold the headline over two and a half
            screens of scrolling and give the reader no clean frame between
            the two. `current` is the same quantised value the rail reads. */}
        <HeroChrome ready={ready} show={current === 0} />

        {/* The rail: five ticks on the right margin, the current one drawn out
            to full width. It never scrolls the page on its own — this film is
            a single continuous move and jumping into the middle of it would
            cut exactly what the page is built to avoid. */}
        <ul
          className="o-pointer-events-none o-absolute al-droite-serre o-top-1/2 o-z-20 o-hidden -translate-y-1/2 o-gap-4 md:o-grid"
          aria-hidden
        >
          {CHAPTERS.map((c, i) => (
            <li key={c.id} className="o-flex o-items-center o-justify-end o-gap-3">
              <span
                className="label al-fs-62 o-transition-opacity al-duree"
                style={{ opacity: i === current ? 1 : 0 }}
              >
                {c.label}
              </span>
              <span
                className="o-block o-h-px bg-ink o-transition-all al-duree al-ease"
                style={{
                  width: i === current ? "2.25rem" : "1rem",
                  opacity: i === current ? 1 : 0.28,
                }}
              />
            </li>
          ))}
        </ul>

        {CHAPTERS.slice(1).map((c, i) => (
          <ChapterBlock
            key={c.id}
            chapter={c}
            show={shown[i + 1]}
            index={i}
            time={time}
          />
        ))}
      </div>
    </div>
  );
}

/* ── one chapter ───────────────────────────────────────────────────────────
   The copy snaps to the columns the two hairlines already draw: left, right,
   left, then centred for the closing invitation — so the eye travels with the
   camera instead of sitting in one corner for four chapters. */
function ChapterBlock({
  chapter: c,
  show,
  index,
  time,
}: {
  chapter: (typeof CHAPTERS)[number];
  show: boolean;
  index: number;
  time: RefObject<number>;
}) {
  const last = index === CHAPTERS.length - 2;
  const side = last ? "center" : index % 2 === 0 ? "left" : "right";
  const inner = useRef<HTMLDivElement>(null);

  /* The parallax. The film is pinned and the copy is pinned with it, so
     without this they travel as one plate and the section reads flat. The
     block drifts a few viewport-percent against its own chapter — a different
     rate from the footage behind it, which is the whole definition of the
     effect. Written straight to the node inside the frame: this must never
     re-render the tree while the reader is scrolling. */
  useEffect(() => {
    if (REDUCED) return;
    return onFrame(() => {
      const el = inner.current;
      if (!el) return;
      const span = c.t1 - c.t0;
      const u = clamp((time.current - c.t0) / (span || 1));
      el.style.transform = `translate3d(0, ${lerp(3.2, -3.2, u)}vh, 0)`;
    });
  }, [c.t0, c.t1, time]);

  return (
    <div
      className={[
        "o-pointer-events-none o-absolute o-inset-y-0 o-flex o-items-center al-gouttiere-film",
        side === "left" && "o-left-0 o-w-full o-justify-start o-text-left al-w-62",
        side === "right" && "o-right-0 o-w-full o-justify-end o-text-left al-w-62",
        side === "center" && "o-inset-x-0 o-justify-center o-text-center",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        opacity: show ? 1 : 0,
        transition: "opacity 620ms var(--raw-ease)",
      }}
    >
      {/* The copy sits in the vertical middle of the frame, which is exactly
          where the film's own top-and-bottom wash leaves the picture clear —
          so each chapter brings its own wash, from ITS side. A plate across
          the whole frame would flatten the shot; this darkens the half the
          words are standing on and leaves the other half alone. */}
      <div
        className="o-pointer-events-none o-absolute o-inset-0"
        style={{
          opacity: show ? 1 : 0,
          transition: "opacity 620ms var(--raw-ease)",
          background:
            side === "center"
              ? "radial-gradient(60% 50% at 50% 50%, var(--scrim-bottom) 0%, transparent 100%)"
              : `linear-gradient(to ${side === "left" ? "right" : "left"}, var(--scrim-bottom) 0%, transparent 62%)`,
        }}
      />

      <div
        ref={inner}
        className={`o-will-change-transform ${side === "center" ? "al-mw-34" : "al-mw-30"}`}
      >
        {c.eyebrow && (
          <Reveal
            as="p"
            className="label o-mb-6 o-block"
            text={c.eyebrow}
            show={show}
            stagger={30}
          />
        )}

        {c.title && (
          <Reveal
            as="h2"
            className="display al-fs-t2c text-ink"
            text={c.title}
            show={show}
            stagger={75}
            delay={120}
          />
        )}

        {c.body && (
          <Reveal
            as="p"
            className="o-mt-6 al-mw-34ch al-fs-975 o-leading-relaxed text-ink-muted"
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
            className="o-mt-10 o-flex o-flex-wrap o-gap-x-10 o-gap-y-5 o-border-t border-line o-pt-6"
            style={{
              opacity: show ? 1 : 0,
              transition: "opacity 700ms var(--raw-ease) 620ms",
            }}
          >
            {c.metrics.map((m) => (
              <div key={m.label}>
                <dt className="display al-fs-175 text-ink">{m.value}</dt>
                <dd className="label o-mt-1 al-mw-18ch">{m.label}</dd>
              </div>
            ))}
          </dl>
        )}

        {c.action && (
          <div
            className="o-pointer-events-auto o-mt-10"
            style={{
              opacity: show ? 1 : 0,
              transition: "opacity 700ms var(--raw-ease) 700ms",
            }}
          >
            <a
              href={c.action.href}
              /* Invisible copy stays readable by a screen reader — it is the
                 page's content, not decoration — but an invisible link must
                 not be a tab stop. */
              tabIndex={show ? 0 : -1}
              className="o-inline-flex o-h-12 o-items-center al-pilule o-px-8 al-fs-90 o-font-medium"
              style={{ background: "var(--action)", color: "var(--action-ink)" }}
            >
              {c.action.label}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
