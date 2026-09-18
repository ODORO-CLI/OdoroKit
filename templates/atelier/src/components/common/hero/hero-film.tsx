// 📖 Docs: obsidian/frontend/components/common.md
/**
 * The pinned film and the runway the chapters travel over it on.
 *
 * One `<video>` sits `sticky` inside a section several viewports tall, so the
 * copy layered over it scrolls at the page's own speed while the film stays —
 * that difference *is* the parallax. On top of it the film zooms and drifts a
 * little with the scroll, and a porcelain scrim gathers over it so the page's
 * own ground arrives before the next section does.
 *
 * **Readiness is a drawn frame, not a resolved promise.** The film reports to
 * the curtain on `loadeddata` — the first frame decoded and drawable — which is
 * what the counter behind it is waiting for.
 *
 * **The entrance is a spring written to the DOM.** A bare `SpringValue` for
 * the arrival scale and a ref for the scroll progress, composed in one
 * `paint()` per frame: scroll must never re-render the tree.
 *
 * **The reveal is one custom property.** `--stage-reveal` goes 0 → 1 on the
 * overlay once the curtain releases the page, and every block of the first
 * screen works out its own share of it in CSS (see `stageRise`). Content is
 * mounted from the first paint, hidden by that value, never withheld.
 */

import { SpringValue } from "@react-spring/web";
import type { AnimationResult } from "@react-spring/web";
import { useCallback, useEffect, useRef } from "react";

import { ProgressTrigger } from "@/components/animation/springs/progress-trigger";
import { Spring } from "@/components/animation/springs/spring";
import { usePreloader } from "@/hooks/preloader/use-preloader";
import { filmConfig } from "@/lib/film/film.config";
import { revealConfig } from "@/lib/reveal/reveal.config";

const { entranceScale, entrance, scrollScale, scrollDrift, scrim } = filmConfig;

export interface HeroFilmSource {
  mp4: string;
  webm: string;
  poster: string;
  alt: string;
}

export interface HeroFilmProps {
  film: HeroFilmSource;
  /** How many viewports the film is pinned for: the first screen plus one per chapter. */
  screens: number;
  /** A crawler gets no curtain, so nothing would ever release the page for it. */
  released?: boolean;
  children: React.ReactNode;
}

export const HeroFilm = ({
  film,
  screens,
  released: forceReleased = false,
  children,
}: HeroFilmProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const released = usePreloader((state) => state.released) || forceReleased;
  const markFilmReady = usePreloader((state) => state.markFilmReady);

  /** The arrival scale, `entranceScale` → 1. Bare: nothing is rendered from it. */
  const arriving = useRef<SpringValue<number> | null>(null);
  arriving.current ??= new SpringValue<number>(entranceScale);
  /** The section's scroll, 0–1. */
  const progress = useRef(0);

  const paint = useCallback(() => {
    const video = videoRef.current;
    const veil = scrimRef.current;
    const p = progress.current;
    if (video) {
      const scale = (arriving.current?.get() ?? 1) * (1 + scrollScale * p);
      video.style.transform = `translate3d(0, ${-scrollDrift * p}%, 0) scale(${scale})`;
    }
    if (veil) {
      const t = Math.min(1, Math.max(0, (p - scrim.from) / (1 - scrim.from)));
      veil.style.opacity = String(t * scrim.max);
    }
  }, []);

  const onProgress = useCallback(
    ({ progress: value }: { progress: number }) => {
      progress.current = value;
      paint();
    },
    [paint],
  );

  // A drawn frame is what the curtain waits for. A warm cache may already
  // have one before the listener is bound, hence the readyState check.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // Reduced motion: the poster is the film. Nothing to wait for.
      video.removeAttribute("autoplay");
      markFilmReady();
      return;
    }
    if (video.readyState >= 2) {
      markFilmReady();
      return;
    }
    const onReady = () => markFilmReady();
    video.addEventListener("loadeddata", onReady, { once: true });
    video.addEventListener("error", onReady, { once: true });
    return () => {
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("error", onReady);
    };
  }, [markFilmReady]);

  // The entrance plays the moment the curtain releases the page — under the
  // curtain's trailing edge, so the first screen is never empty.
  useEffect(() => {
    if (!released) return;
    const video = videoRef.current;
    void video?.play().catch(() => undefined);
    void arriving.current?.start({
      to: 1,
      config: entrance,
      onChange: (_result: AnimationResult<SpringValue<number>>) => paint(),
    });
  }, [released, paint]);

  // Decoding a film nobody can see is the one thing a phone cannot spare.
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          if (released && video.paused) void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { rootMargin: "20% 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [released]);

  useEffect(() => {
    paint();
  }, [paint]);

  return (
    <ProgressTrigger
      ref={sectionRef}
      tag="section"
      id="hero"
      aria-labelledby="hero-title"
      start="top top"
      end="bottom bottom"
      frameInterval={0}
      onChange={onProgress}
      // `overflow-x-clip`, not `hidden`: a hidden overflow makes this box the
      // scrollport for its sticky child, and the film would stop sticking.
      className="o-relative o-w-full at-overflow-x-clip"
      style={{ height: `${screens * 100}lvh` }}
    >
      {/* `lvh`, not `dvh`: a collapsing iOS URL bar must not resize the plate
          the film is sized from. */}
      <div className="o-sticky o-top-0 at-h-lvh o-w-full o-overflow-hidden at-bg-background">
        <video
          ref={videoRef}
          muted
          playsInline
          loop
          preload="auto"
          poster={film.poster}
          aria-hidden="true"
          className="o-absolute o-inset-0 o-h-full o-w-full o-object-cover o-will-change-transform"
        >
          {/* H.264 first: it plays everywhere and is the better-graded encode;
              the VP9 is the fallback for a browser without it. */}
          <source src={film.mp4} type="video/mp4" />
          <source src={film.webm} type="video/webm" />
        </video>
        <p className="o-sr-only">{film.alt}</p>
        {/* The porcelain that gathers over the film as the chapters pass. */}
        <div
          ref={scrimRef}
          aria-hidden="true"
          className="o-pointer-events-none o-absolute o-inset-0 at-bg-background o-opacity-0"
        />
        {/* A standing foot of porcelain, so the wordmark and the chapters'
            copy always have ground under them whatever the film is doing. */}
        <div
          aria-hidden="true"
          className="o-pointer-events-none o-absolute o-inset-x-0 o-bottom-0 at-h-46 at-bg-linear-to-t at-from-background-85 at-via-background-30 o-to-transparent"
        />
      </div>

      <Spring
        tag="div"
        mode="once"
        enabled={released}
        from={{ "--stage-reveal": 0 }}
        to={{ "--stage-reveal": 1 }}
        config={revealConfig.entrance}
        className="o-absolute o-inset-0"
      >
        {children}
      </Spring>
    </ProgressTrigger>
  );
};
