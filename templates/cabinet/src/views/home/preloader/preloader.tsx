import { animated, to, useSpring } from "@react-spring/web";
import { useEffect, useMemo, useState } from "react";

import { Spring } from "@/components/animation/springs/spring";
import { useSceneStore } from "@/hooks/scene/use-scene-store";
import { useScroll } from "@/hooks/smooth-scroll/use-scroll";
import {
  PRELOADER_COUNT,
  PRELOADER_FADE,
  PRELOADER_RULE,
  PRELOADER_WIPE,
} from "@/lib/springs/presets";

import { Odometer } from "./odometer";

export interface PreloaderProps {
  label: string;
}

const COLUMNS = [0, 1, 2, 3] as const;
const COLUMN_STAGGER_MS = 100;
/** The hero starts its entrance while the wipe is still clearing. */
const INTRO_AFTER_MS = 1200;
/** Leave the DOM once the last column has gone. */
const UNMOUNT_AFTER_MS = 1600;

/**
 * The curtain over the scene while its frames load: brand label, a progress
 * rule, and the rolling counter. It lifts when BOTH the ~2.8 s clock has run
 * and every frame has settled — gated on the scene being ready, not on a
 * duration (optimize-3d-scene §3). Four columns then wipe away, alternating
 * up and down.
 *
 * Decorative to assistive tech: the page's content is already in the DOM
 * beneath it. Scroll is held while it is up, so the scene cannot be entered
 * half-loaded.
 */
export const Preloader = ({ label }: PreloaderProps) => {
  const framesProgress = useSceneStore((state) => state.framesProgress);
  const setIntroReady = useSceneStore((state) => state.setIntroReady);
  const [clockDone, setClockDone] = useState(false);
  const [gone, setGone] = useState(false);

  const [{ t }] = useSpring(() => ({
    from: { t: 0 },
    to: { t: 1 },
    config: PRELOADER_COUNT,
    onRest: () => setClockDone(true),
  }));
  const [{ loaded }, loadedApi] = useSpring(() => ({ loaded: 0 }));
  const rule = useMemo(
    () => to([t, loaded], (clock: number, done: number) => `scaleX(${Math.min(clock, done)})`),
    [t, loaded],
  );

  // Both inputs only ever grow, so once true this stays true.
  const exiting = clockDone && framesProgress >= 1;

  useEffect(() => {
    loadedApi.start({ loaded: framesProgress });
  }, [framesProgress, loadedApi]);

  useEffect(() => {
    const { stop, start } = useScroll.getState();
    stop();
    return start;
  }, []);

  useEffect(() => {
    if (!exiting) return;
    useScroll.getState().start();
    const intro = setTimeout(() => setIntroReady(true), INTRO_AFTER_MS);
    const unmount = setTimeout(() => setGone(true), UNMOUNT_AFTER_MS);
    return () => {
      clearTimeout(intro);
      clearTimeout(unmount);
    };
  }, [exiting, setIntroReady]);

  if (gone) return null;

  return (
    <div aria-hidden className="o-fixed o-inset-0 cb-z-200 cb-text-foreground">
      <div className="o-absolute o-inset-0 o-flex">
        {COLUMNS.map((column) => (
          <Spring
            key={column}
            tag="span"
            enabled={exiting}
            from={{ scaleY: 1 }}
            to={{ scaleY: 0 }}
            delayIn={column * COLUMN_STAGGER_MS}
            config={PRELOADER_WIPE}
            className={`o-h-full o-flex-1 cb-bg-background ${column % 2 === 0 ? "o-origin-top" : "o-origin-bottom"}`}
          />
        ))}
      </div>

      <Spring
        tag="p"
        enabled={exiting}
        from={{ opacity: 1, y: 0 }}
        to={{ opacity: 0, y: -40 }}
        config={PRELOADER_FADE}
        className="o-absolute o-left-10 o-top-10 cb-text-title-phone o-uppercase cb-tracking-title cb-sm-text-title max-md:o-left-6 max-md:o-top-6"
      >
        {label}
      </Spring>

      <Spring
        tag="span"
        enabled={exiting}
        from={{ scaleX: 1 }}
        to={{ scaleX: 0 }}
        config={PRELOADER_RULE}
        className="o-absolute cb-inset-x-10 o-top-1/2 o-h-px cb--translate-y-1-2 o-origin-right cb-bg-foreground-15 cb-max-md-inset-x-6"
      >
        <animated.span className="o-block o-h-full o-origin-left cb-bg-foreground" style={{ transform: rule }} />
      </Spring>

      <Odometer t={t} loaded={loaded} exiting={exiting} />
    </div>
  );
};
