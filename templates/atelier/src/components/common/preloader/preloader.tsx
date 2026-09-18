// 📖 Docs: obsidian/frontend/components/common.md

/**
 * The opening curtain: the wordmark resolving letter by letter on the accent,
 * a counter filling beside it, and the whole plate leaving upward once the
 * film behind it has a frame.
 *
 * **What ends it is the film, not a clock.** The counter creeps to `hold` on
 * its own and parks there; the rest, and the exit, wait for `filmReady` — with
 * `minShow` as a **floor** so a warm cache still gets a curtain rather than a
 * flash, and `maxWait` as a **cap** so a stalled network never traps the
 * visitor. A percentage that is a timer dressed as progress is a lie; a floor
 * and a cap are only promises about the curtain itself.
 *
 * **The number is written to the DOM, not rendered from state.** A bare
 * `SpringValue` whose `onChange` writes `textContent`. A hundred counter ticks
 * are a hundred re-renders otherwise, and not one of them changes anything
 * React needs to know about.
 *
 * **The page is at its top when the curtain goes.** A reload restores the
 * browser's last scroll position *after* the layout's own scroll-to-top has
 * run. The curtain puts the page at the top itself, both when it locks the
 * scroll and again as it leaves — and the layout tells the browser not to
 * restore at all.
 *
 * **Released part-way through the exit, not on rest.** The hero's entrance
 * plays into the screen as it is uncovered rather than into an empty one
 * afterwards.
 */

import { SpringValue } from "@react-spring/web";
import type { AnimationResult } from "@react-spring/web";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { Spring } from "@/components/animation/springs/spring";
import { StageReveal } from "@/components/common/reveal/stage-reveal";
import { usePreloader } from "@/hooks/preloader/use-preloader";
import { useScroll } from "@/hooks/smooth-scroll/use-scroll";
import { preloaderConfig } from "@/lib/preloader/preloader.config";
import { revealConfig } from "@/lib/reveal/reveal.config";

const { hold, minShow, maxWait, fill, finish, exit, releaseAt } =
  preloaderConfig;

export interface PreloaderProps {
  wordmark: string;
  label: string;
}

export const Preloader = ({ wordmark, label }: PreloaderProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  const filmReady = usePreloader((state) => state.filmReady);
  const markFilmReady = usePreloader((state) => state.markFilmReady);
  const release = usePreloader((state) => state.release);
  const released = usePreloader((state) => state.released);
  /**
   * Whether the curtain has finished leaving — separate from `released`, which
   * fires part-way through the exit. The element stays until the travel is
   * done, or it would vanish mid-screen the moment the page was released.
   */
  const [gone, setGone] = useState(false);
  const [startScroll, stopScroll] = useScroll(
    useShallow((state) => [state.start, state.stop]),
  );

  /** The fill, 0–1. Bare, because nothing here is rendered from it. */
  const progress = useRef<SpringValue<number> | null>(null);
  /** The exit, 0–1: how far up its own height the curtain has gone. */
  const leaving = useRef<SpringValue<number> | null>(null);
  progress.current ??= new SpringValue(0);
  leaving.current ??= new SpringValue(0);

  // The reader must not be able to scroll the page they cannot see.
  // Unlocked on `released`, not only in the cleanup: returning `null` from a
  // component does not unmount it, so the cleanup never runs on the one path
  // that always happens.
  useEffect(() => {
    if (released) {
      startScroll();
      return;
    }
    stopScroll();
    window.scrollTo(0, 0);
    return () => startScroll();
  }, [released, startScroll, stopScroll]);

  /** The one place the number reaches the page. */
  const show = (value: number) => {
    const count = countRef.current;
    if (count) count.textContent = String(Math.round(value * 100));
  };

  useEffect(() => {
    const filling = progress.current;
    if (!filling) return;
    void filling.start({
      to: hold,
      config: fill,
      onChange: (result: AnimationResult<SpringValue<number>>) =>
        show(result.value),
    });
  }, []);

  // **The floor and the cap on the showing.** `filmReady` says the curtain
  // *may* finish; `waited` says it may not finish yet; the cap says it must.
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const floor = window.setTimeout(() => setWaited(true), minShow);
    const cap = window.setTimeout(() => markFilmReady(), maxWait);
    return () => {
      window.clearTimeout(floor);
      window.clearTimeout(cap);
    };
  }, [markFilmReady]);

  useEffect(() => {
    if (!filmReady || !waited) return;
    const value = progress.current;
    const away = leaving.current;
    if (!value || !away) return;

    void value.start({
      to: 1,
      config: finish,
      onChange: (result: AnimationResult<SpringValue<number>>) =>
        show(result.value),
      onRest: () => {
        // The first screen is what the curtain lifts onto, whatever the
        // browser remembered. Lenis is told as well as the window: stopped,
        // it keeps a target of its own.
        window.scrollTo(0, 0);
        useScroll
          .getState()
          .lenis?.scrollTo(0, { immediate: true, force: true });
        void away.start({
          to: 1,
          config: exit,
          onChange: (result: AnimationResult<SpringValue<number>>) => {
            const root = rootRef.current;
            if (!root) return;
            root.style.transform = `translate3d(0, ${-result.value * 100}%, 0)`;
            if (result.value >= releaseAt) release();
          },
          onRest: () => {
            release();
            setGone(true);
          },
        });
      },
    });
  }, [filmReady, waited, release]);

  // Gone, not merely transparent: it covers the whole viewport and would keep
  // the page's pointer for ever.
  if (gone) return null;

  return (
    <div
      ref={rootRef}
      // Above the cookie banner (`z-50`): a consent card floating over the
      // curtain is a second thing asking for attention before the page arrives.
      className="o-fixed o-inset-0 at-z-60 o-flex o-flex-col o-justify-between at-bg-accent at-px-frame-gutter at-py-frame-gutter at-text-accent-foreground o-will-change-transform"
    >
      {/* The wordmark resolves out of the accent the moment the curtain is
          up — the same letter-by-letter reveal the hero uses, so the name the
          reader waits behind is the name they land on. */}
      <Spring
        tag="div"
        mode="once"
        from={{ "--stage-reveal": 0 }}
        to={{ "--stage-reveal": 1 }}
        config={revealConfig.entrance}
        className="o-flex o-flex-1 o-items-center o-justify-center"
      >
        <StageReveal
          tag="p"
          unit="letter"
          className="at-font-display at-text-22vw at-leading-0-9 at-tracking-0-03em at-stacked-text-26vw"
        >
          {wordmark}
        </StageReveal>
      </Spring>

      <div className="o-flex o-items-end o-justify-between">
        <p className="at-font-sans at-text-frame-caption o-uppercase at-tracking-0-24em at-text-accent-foreground-70">
          {label}
        </p>
        <p
          role="status"
          aria-live="polite"
          className="at-font-serif at-text-frame-figure at-leading-none o-tabular-nums"
        >
          <span ref={countRef}>0</span>
          <span className="o-sr-only"> pour cent chargé</span>
        </p>
      </div>
    </div>
  );
};
