/**
 * Film — the levitation clip as a persistent full-bleed scene, and three
 * chapters that scroll over it.
 *
 * The stage is `sticky` for the height of the whole track, so the footage
 * stays put while the chapters pass; the same scroll drives a slow drift and
 * a swell on the plate — the picture moves a tenth as far as the page does,
 * which is what reads as depth — and a veil that deepens as the reader goes
 * further in, so the closing chapter sits on a quieter frame than the first.
 *
 * The clip loops muted. It plays only while the section is near the viewport
 * (an observer, not a scroll handler — this is a boolean that flips twice),
 * and under reduced motion it never starts: the poster is the picture.
 *
 * Grain, over the veil: the same emulsion the hero wears, held still here —
 * one stepping loop on the page is texture, two is a tic.
 *
 * 📖 Docs: obsidian/frontend/sections.md
 */

import { useEffect, useMemo, useRef } from "react";
import { animated, SpringValue } from "@react-spring/web";

import { useProgressTrigger } from "@/hooks/animation/use-progress-trigger";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { subscribeToTicker } from "@/lib/animation/ticker";
import { GRAIN, GRAIN_URI } from "@/views/home/hero/hero.geometry";

import { FilmChapter } from "./film-chapter";
import type { FilmContent } from "./film.types";

/** How far the plate travels across the whole track, as a share of its height. */
const DRIFT = 0.1;
/**
 * The plate is always drawn larger than the stage — by more than the drift
 * can move it — so the travel never bares the cinema black at the top edge on
 * the way in or the bottom edge on the way out. 1.12 covers a ±5% drift.
 */
const OVERSCAN = 1.12;
/** How much the plate swells on top of that at the middle of the track. */
const SWELL = 0.06;
/** The veil's range: lighter as the section arrives, deeper as it leaves. */
const VEIL = { from: 0.5, to: 0.82 } as const;
/** Grain, quieter than the hero's — the footage is the subject here. */
const GRAIN_OPACITY = 0.22;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export interface FilmProps {
  content: FilmContent;
}

export const Film = ({ content }: FilmProps) => {
  const trackRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  /** 0→1 from the track's top meeting the viewport's bottom to its bottom
   *  leaving the top — the whole passage, entry and exit included. */
  const { progress } = useProgressTrigger({
    elementRef: trackRef,
    start: "top bottom",
    end: "bottom top",
    frameInterval: 0,
  });

  /* Written every frame off the shared ticker, the way the hero does. */
  const drift = useMemo(() => new SpringValue(0), []);

  useEffect(
    () =>
      subscribeToTicker(
        () =>
          drift.set(prefersReducedMotion ? 0.5 : clamp01(progress.current)),
        () => 0,
      ),
    [drift, progress, prefersReducedMotion],
  );

  useEffect(() => {
    const video = videoRef.current;
    const track = trackRef.current;
    if (!video || !track || prefersReducedMotion) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          // A refusal is not an error — the poster is what answers it.
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "25% 0px" },
    );
    observer.observe(track);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [prefersReducedMotion]);

  const plate = drift.to((p) => {
    const centred = p - 0.5;
    const scale = OVERSCAN + SWELL * (1 - Math.abs(centred) * 2);
    return `translate3d(0, ${(-centred * DRIFT * 100).toFixed(2)}%, 0) scale(${scale.toFixed(4)})`;
  });

  const veil = drift.to((p) => VEIL.from + (VEIL.to - VEIL.from) * p);

  return (
    <section
      ref={trackRef}
      id="film"
      aria-label={content.ariaLabel}
      className="o-relative"
    >
      <div className="h-viewport jo-bg-surface-cinema o-sticky o-top-0 o-overflow-hidden">
        <animated.div
          className="o-absolute o-inset-0 o-will-change-transform"
          style={{ transform: plate }}
        >
          <video
            ref={videoRef}
            className="o-absolute o-inset-0 o-h-full o-w-full o-object-cover"
            src={content.video.src}
            poster={content.video.poster}
            width={content.video.width}
            height={content.video.height}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={content.video.alt}
          />
        </animated.div>

        <animated.div
          aria-hidden
          className="jo-bg-scrim-scene o-pointer-events-none o-absolute o-inset-0"
          style={{ opacity: veil }}
        />

        <div
          aria-hidden
          className="o-pointer-events-none o-absolute jo--inset-6rem jo--mix-blend-mode-overlay"
          style={{
            backgroundImage: GRAIN_URI,
            backgroundSize: `${GRAIN.tile}px ${GRAIN.tile}px`,
            opacity: GRAIN_OPACITY,
          }}
        />
      </div>

      {/* The chapters ride over the stage: pulled up by one viewport so the
          first one is on the picture from the moment the section arrives. */}
      <div className="pull-viewport o-relative">
        {content.chapters.map((chapter) => (
          <FilmChapter key={chapter.id} chapter={chapter} />
        ))}
      </div>
    </section>
  );
};
