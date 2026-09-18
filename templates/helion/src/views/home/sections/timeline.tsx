import { useEffect, useRef, useState } from "react";
import { animated } from "@react-spring/web";

import { Spring } from "@/components/animation/springs/spring";
import { AnimatedHeading } from "@/components/animation/animated-heading";
import { easeReveal } from "@/utils/animation/easing";
import { useSections } from "@/hooks/sections/use-sections";
import { useSceneFade } from "@/hooks/sections/use-scene-fade";
import { useSlideProgress } from "@/hooks/sections/use-slide-progress";
import { useHeroLayout } from "@/hooks/use-hero-scale";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { screens } from "@/lib/scene/screens";
import type { TimelineContent, TimelineStep } from "@/data/mocks/home";

/**
 * Timeline — the getLayers redesign of the third slide (Figma node 669:1927).
 *
 * Same recipe as the other new sections: a fixed 1440×800 composition scaled to
 * the viewport width (`useHeroLayout("width")`), pinned so it fades in place
 * rather than scrolling. The novelty is intra-section motion: the roadmap slide
 * is 2.5 viewports tall, and its vertical scroll drives the rail **right-to-left**
 * across the whole scene via `useSlideProgress` (which reads the slide's local
 * scroll progress off the shared ticker).
 *
 * Each station is a tick rising from a shared baseline with a triangular marker
 * at its foot, a gradient index numeral, a Mulish title, and a line of body copy.
 * The masthead (mirror-image gradients, reusing the hero tokens) stays centred at
 * the top while the rail travels beneath it. The shared fixed `HeroNav` is the
 * section's nav.
 */


/* Design-pixel geometry, straight off the Figma frame. */
const FIRST_X = 73; // left edge of the first station's content
const STEP_GAP = 605; // horizontal pitch between stations
const CONTENT_TOP = 579;
const GROUP_WIDTH = 204; // index + title column
const ITEM_WIDTH = 405; // body wrap width
const TICK_OFFSET = 20; // tick sits this far left of the content
const TICK_HEIGHT = 174;
const BASELINE_Y = 754;
const TRI_SIZE = 19;
const SIDE_MARGIN = 73; // trailing margin past the last station

const STATION_REVEAL = { duration: 1200, easing: easeReveal } as const;

export interface TimelineProps {
  content: TimelineContent;
}

interface StationProps {
  step: TimelineStep;
  x: number;
  index: number;
  enabled: boolean;
}

const Station = ({ step, x, index, enabled }: StationProps) => {
  const tickX = x - TICK_OFFSET;
  const gradientId = `timeline-tri-${index}`;
  /* Each station drifts up softly, staggered along the rail. */
  const delayIn = 200 + index * 120;

  return (
    <>
      {/* Vertical tick rising from the baseline. */}
      <Spring
        tag="div"
        aria-hidden="true"
        enabled={enabled}
        mode="once"
        from={{ opacity: 0, scaleY: 0 }}
        to={{ opacity: 1, scaleY: 1 }}
        delayIn={delayIn}
        config={STATION_REVEAL}
        className="o-absolute o-w-px o-origin-bottom"
        style={{
          left: tickX,
          top: CONTENT_TOP,
          height: TICK_HEIGHT,
          backgroundImage: "var(--gradient-timeline-tick)",
        }}
      />
      {/* Triangular marker, centred on the tick, sitting on the baseline. */}
      <Spring
        tag="div"
        aria-hidden="true"
        enabled={enabled}
        mode="once"
        from={{ opacity: 0, scale: 0.4 }}
        to={{ opacity: 1, scale: 1 }}
        delayIn={delayIn}
        config={STATION_REVEAL}
        className="o-absolute"
        style={{ left: tickX - TRI_SIZE / 2, top: BASELINE_Y - TRI_SIZE }}
      >
        <svg
          width={TRI_SIZE}
          height={TRI_SIZE}
          viewBox="0 0 19 19"
          fill="none"
          className="o-block"
        >
          <path d="M9.5 0L19 19H0L9.5 0Z" fill={`url(#${gradientId})`} />
          <defs>
            <linearGradient
              id={gradientId}
              x1="0"
              y1="0"
              x2="19"
              y2="19"
              gradientUnits="userSpaceOnUse"
            >
              <stop style={{ stopColor: "var(--brand-orange)" }} />
              <stop offset="1" style={{ stopColor: "var(--brand-peach)" }} />
            </linearGradient>
          </defs>
        </svg>
      </Spring>

      {/* Content — index, title, body — to the right of the tick. */}
      <Spring
        tag="div"
        enabled={enabled}
        mode="once"
        from={{ opacity: 0, y: 26, filter: "blur(8px)" }}
        to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        delayIn={delayIn + 120}
        config={STATION_REVEAL}
        className="o-absolute o-flex o-flex-col hl-gap-24px"
        style={{ left: x, top: CONTENT_TOP, width: ITEM_WIDTH }}
      >
        <div
          className="o-flex o-flex-col hl-gap-12px"
          style={{ width: GROUP_WIDTH }}
        >
          <p className="o-m-0 hl-bg-image-var-gradient-hero-icon hl-bg-clip-text hl-font-mulish hl-text-16px hl-leading-1-2 o-font-normal o-text-transparent hl-clip-texte">
            {step.index}
          </p>
          <p className="o-m-0 hl-font-mulish hl-text-32px hl-leading-none o-font-light hl-text-foreground">
            {step.title}
          </p>
        </div>
        <p className="o-m-0 hl-font-mulish hl-text-16px hl-leading-1-2 o-font-normal hl-text-foreground">
          {step.body}
        </p>
      </Spring>
    </>
  );
};

/* ------------------------------------------------------------------- mobile */

interface TimelineMobileProps {
  content: TimelineContent;
  revealed: boolean;
  progress: ReturnType<typeof useSlideProgress>;
}

/**
 * Mobile timeline: the same right-to-left rail, turned on its side. The station
 * list is stacked vertically and the slide's scroll progress translates it *up*
 * through a fixed window — the vertical analogue of the desktop rail's translateX.
 * `travel` is the overflow past the window, measured from the DOM so it holds for
 * any station count or viewport height.
 */
const TimelineMobile = ({ content, revealed, progress }: TimelineMobileProps) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const [travel, setTravel] = useState(0);

  useEffect(() => {
    const measure = () => {
      const w = windowRef.current;
      const l = listRef.current;
      if (!w || !l) return;
      setTravel(Math.max(0, l.scrollHeight - w.clientHeight));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [content]);

  return (
    <div className="o-flex o-h-full o-w-full o-flex-col hl-px-24px hl-pt-92px hl-pb-20px">
      <AnimatedHeading
        tag="h2"
        id="timeline-heading"
        enabled={revealed}
        baseDelay={120}
        stagger={34}
        className="o-m-0 o-w-full o-text-center hl-font-mulish hl-text-clamp-24px-6-4vw-44px hl-leading-1-06 o-font-light"
        lines={[
          { text: content.titleTop, opaque: "left" },
          { text: content.titleBottom, opaque: "right" },
        ]}
      />

      <div ref={windowRef} className="o-relative hl-mt-22px o-flex-1 o-overflow-hidden">
        <animated.ol
          ref={listRef}
          style={{
            transform: progress.to((p) => `translateY(${(-p * travel).toFixed(1)}px)`),
          }}
          className="o-absolute o-inset-x-0 o-top-0 o-flex o-flex-col hl-gap-24px"
        >
          {content.steps.map((step, i) => (
            <Spring
              key={step.index}
              tag="li"
              enabled={revealed}
              mode="once"
              from={{ opacity: 0, y: 18, filter: "blur(6px)" }}
              to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              delayIn={160 + i * 90}
              config={STATION_REVEAL}
              className="o-flex hl-gap-16px"
            >
              <div className="o-flex hl-w-18px o-shrink-0 o-flex-col o-items-center hl-pt-6px">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 19 19"
                  fill="none"
                  aria-hidden="true"
                  className="o-shrink-0"
                >
                  <path d="M9.5 0L19 19H0L9.5 0Z" fill={`url(#tl-m-tri-${i})`} />
                  <defs>
                    <linearGradient
                      id={`tl-m-tri-${i}`}
                      x1="0"
                      y1="0"
                      x2="19"
                      y2="19"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop style={{ stopColor: "var(--brand-orange)" }} />
                      <stop offset="1" style={{ stopColor: "var(--brand-peach)" }} />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="hl-mt-8px o-w-px o-flex-1 hl-bg-color-var-timeline-rail" />
              </div>

              <div className="o-flex o-flex-col hl-gap-6px hl-pb-6px">
                <p className="o-m-0 hl-bg-image-var-gradient-hero-icon hl-bg-clip-text hl-font-mulish hl-text-14px hl-leading-none o-font-normal o-text-transparent hl-clip-texte">
                  {step.index}
                </p>
                <p className="o-m-0 hl-font-mulish hl-text-22px hl-leading-none o-font-light hl-text-foreground">
                  {step.title}
                </p>
                <p className="o-m-0 hl-font-mulish hl-text-15px hl-leading-1-35 o-font-normal hl-text-foreground-80">
                  {step.body}
                </p>
              </div>
            </Spring>
          ))}
        </animated.ol>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ section */

export const Timeline = ({ content }: TimelineProps) => {
  const active = useSections((state) => state.active);
  const isLoaded = useSections((state) => state.isLoaded);
  const isMobile = useIsMobile();
  const fade = useSceneFade(screens.ROADMAP);
  const progress = useSlideProgress(screens.ROADMAP);
  /* `width` fit: the rail spans the full viewport width, matching the mockup's
     edge-to-edge baseline and side insets on every screen. */
  const { scale } = useHeroLayout("width");

  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (active === screens.ROADMAP) setRevealed(true);
  }, [active]);

  const steps = content.steps;
  const lastX = FIRST_X + (steps.length - 1) * STEP_GAP;
  /* Travel brings the final station to where the first one started. */
  const travel = lastX - FIRST_X;
  const trackWidth = lastX + ITEM_WIDTH + SIDE_MARGIN;

  return (
    <section
      id="timeline"
      aria-labelledby="timeline-heading"
      className="o-relative o-h-svh o-w-full"
    >
      {/* Pinned to the viewport: fades in place, never scrolls. */}
      <animated.div
        style={{
          // Hidden until the scene has loaded, so it never bleeds through the
          // preloader.
          opacity: isLoaded ? fade.opacity : 0,
          pointerEvents: active === screens.ROADMAP ? "auto" : "none",
        }}
        className="o-fixed o-inset-0 o-overflow-hidden"
      >
        {isMobile ? (
          <TimelineMobile
            content={content}
            revealed={revealed}
            progress={progress}
          />
        ) : (
        /* The 1440×800 design frame, centred and scaled to viewport width. */
        <div
          className="o-absolute o-top-1/2 o-left-1/2 hl-h-800px hl-w-1440px"
          style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
        >
          {/* Masthead — per-letter cascade from the bright ends. */}
          <AnimatedHeading
            tag="h2"
            id="timeline-heading"
            enabled={revealed}
            baseDelay={120}
            className="o-absolute hl-top-100px hl-left-389px o-m-0 hl-w-663px o-text-center hl-font-mulish hl-text-56px hl-leading-none o-font-light"
            lines={[
              { text: content.titleTop, opaque: "left" },
              { text: content.titleBottom, opaque: "right" },
            ]}
          />

          {/* The rail — a wide track that travels right-to-left with scroll. */}
          <animated.div
            className="o-absolute o-top-0 o-left-0 hl-h-800px"
            style={{
              width: trackWidth,
              transform: progress.to(
                (p) => `translateX(${(-p * travel).toFixed(2)}px)`,
              ),
            }}
          >
            {/* Shared baseline. Gated on `revealed` (not just the layer's
                isLoaded fade): it is the one full-width static element here, and
                without its own gate it flashed as a horizontal stripe over the
                preloader in the load-race frame where `activeScreen` is still NONE
                (which makes every section's scene-fade read 1) but `isLoaded` has
                already flipped true. */}
            <Spring
              tag="div"
              aria-hidden="true"
              enabled={revealed}
              mode="once"
              from={{ opacity: 0, scaleX: 0 }}
              to={{ opacity: 1, scaleX: 1 }}
              delayIn={120}
              config={STATION_REVEAL}
              className="o-absolute o-h-px o-origin-left"
              style={{
                left: 50,
                top: BASELINE_Y,
                width: trackWidth - 100,
                backgroundColor: "var(--timeline-rail)",
              }}
            />
            {steps.map((step, i) => (
              <Station
                key={step.index}
                step={step}
                index={i}
                x={FIRST_X + i * STEP_GAP}
                enabled={revealed}
              />
            ))}
          </animated.div>
        </div>
        )}
      </animated.div>
    </section>
  );
};
