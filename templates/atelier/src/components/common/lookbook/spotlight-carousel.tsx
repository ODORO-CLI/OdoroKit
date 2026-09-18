// 📖 Docs: obsidian/frontend/components/common.md
/**
 * The lookbook — GetLayers section `carousel-spotlight`, ported.
 *
 * An infinite concave ring of portrait cards on a bright stage (CSS 3D, no
 * WebGL) that wraps for ever: drag, swipe, arrow keys, prev/next, a dot, or a
 * tap on a card spin it, with snap-to-card settling. Around it the editorial
 * chrome: a masthead above the arc, a giant ghost index behind it, and a dock
 * at the foot whose title, meta, counter and dots stay synced to the front card.
 *
 * **The engine is preserved verbatim.** It is a rAF loop on the shared ticker
 * writing one `--rot` to the ring and syncing the dock through refs — none of
 * it goes through React state, because a frame is not a reason to re-render.
 * The snap lands *exactly* on target and is guarded by `lastRot`, so a scene
 * at rest stops mutating transforms and a hovered card is rock-steady.
 *
 * What is ours is the skin: the Style's tokens, faces and the looks.
 */

import { easings } from "@react-spring/web";
import { useEffect, useRef } from "react";
import TextEngine from "spring-text-engine";

import { subscribeToTicker } from "@/lib/animation/ticker";
import { spotlightConfig } from "@/lib/lookbook/spotlight.config";

const P = spotlightConfig;
const pad2 = (n: number) => String(n).padStart(2, "0");
const STEP = 360 / P.slots;

export interface LookbookItem {
  image: string;
  title: string;
  meta: string;
  alt: string;
}

export interface LookbookContent {
  eyebrow: string;
  headline: { lead: string; emphasis: string };
  edgeLeft: string;
  edgeRight: string;
  hint: string;
  items: readonly LookbookItem[];
}

interface RingApi {
  go: (delta: number) => void;
  focusWork: (index: number) => void;
}

export const SpotlightCarousel = ({ content }: { content: LookbookContent }) => {
  const { items } = content;
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const metaRef = useRef<HTMLParagraphElement>(null);
  const currentRef = useRef<HTMLElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const api = useRef<RingApi | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const ring = ringRef.current;
    if (!stage || !ring) return;
    const count = items.length;
    const cards = Array.from(ring.children) as HTMLElement[];
    const dots = dotsRef.current
      ? (Array.from(dotsRef.current.children) as HTMLElement[])
      : [];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- geometry (responsive) ---------- */
    const layout = () => {
      const vw = stage.clientWidth;
      const cw =
        Math.min(P.cardWidth.max, Math.max(P.cardWidth.min, vw * P.cardWidth.share)) *
        P.cardScale;
      const ch = cw * P.cardRatio;
      const r = cw * P.radiusK;
      stage.style.setProperty("--cw", `${cw}px`);
      stage.style.setProperty("--ch", `${ch}px`);
      stage.style.setProperty("--r", `${r}px`);
      stage.style.setProperty("--push", `${r * (1 - P.arcDepth)}px`);
      stage.style.perspective = `${Math.max(700, vw * 0.8 * P.perspective)}px`;
    };

    /* ---------- front-card tracking → dock + ghost ---------- */
    let rot = 0;
    let vel = 0;
    let dragging = false;
    let lastX = 0;
    let downX = 0;
    let moved = false;
    let targetIndex = 0;
    let settled = true;
    let lastRot = NaN;
    let lastCard = -1;
    let lastFrontSlot = -1;

    const applyRot = () => {
      if (rot !== lastRot) {
        ring.style.setProperty("--rot", `${rot}deg`);
        lastRot = rot;
      }
    };
    const frontSlot = () =>
      ((Math.round(-rot / STEP) % P.slots) + P.slots) % P.slots;
    const render = () => {
      const fs = frontSlot();
      if (fs !== lastFrontSlot) {
        cards[lastFrontSlot]?.removeAttribute("data-front");
        cards[fs]?.setAttribute("data-front", "");
        lastFrontSlot = fs;
      }
      const ci = fs % count;
      if (ci !== lastCard) {
        lastCard = ci;
        const item = items[ci];
        if (!item) return;
        if (titleRef.current) titleRef.current.textContent = item.title;
        if (metaRef.current) metaRef.current.textContent = item.meta;
        if (currentRef.current) currentRef.current.textContent = pad2(ci + 1);
        if (ghostRef.current) ghostRef.current.textContent = pad2(ci + 1);
        dots.forEach((dot, i) => {
          dot.dataset.on = String(i === ci);
          dot.setAttribute("aria-selected", String(i === ci));
        });
      }
    };

    /* ---------- interaction: drag / inertia / snap / prev-next / keyboard / tap ---------- */
    const nearestCenter = () => Math.round(-rot / STEP);
    const go = (delta: number) => {
      targetIndex = nearestCenter() + delta;
      settled = true;
      vel = 0;
    };
    const focusSlot = (slot: number) => {
      const cs = nearestCenter();
      let d = (((slot - (cs % P.slots)) % P.slots) + P.slots) % P.slots;
      if (d > P.slots / 2) d -= P.slots;
      targetIndex = cs + d;
      settled = true;
      vel = 0;
    };
    const focusWork = (i: number) => {
      const cs = nearestCenter();
      let d = (((i - (cs % count)) % count) + count) % count;
      if (d > count / 2) d -= count;
      targetIndex = cs + d;
      settled = true;
      vel = 0;
    };

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = downX = e.clientX;
      moved = false;
      vel = 0;
      settled = false;
      stage.dataset.drag = "";
      stage.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      if (Math.abs(e.clientX - downX) > P.tapSlop) moved = true;
      const d = -dx * P.drag;
      rot += d;
      vel = d;
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      settled = false;
      delete stage.dataset.drag;
      if (!moved) {
        // Pointer capture redirects the target to the stage, so hit-test at
        // the release point to find the card under the finger.
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const card = el?.closest<HTMLElement>("[data-slot]");
        if (card) focusSlot(Number(card.dataset.slot));
      }
    };
    const onCancel = () => {
      dragging = false;
      delete stage.dataset.drag;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        go(1);
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        go(-1);
        e.preventDefault();
      }
    };

    const tick = () => {
      if (!dragging) {
        rot += vel;
        vel *= P.damp;
        if (P.autoSpin > 0) {
          rot += P.autoSpin;
        } else if (Math.abs(vel) < P.restVelocity) {
          if (!settled) {
            targetIndex = nearestCenter();
            settled = true;
          }
          const diff = -targetIndex * STEP - rot;
          // Land exactly → `--rot` stops changing → a hovered card is steady.
          if (Math.abs(diff) < 0.01) rot = -targetIndex * STEP;
          else rot += diff * (reduce ? 1 : P.snap);
        } else settled = false;
      }
      applyRot();
      render();
    };

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onCancel);
    stage.addEventListener("keydown", onKey);
    const observer = new ResizeObserver(layout);
    observer.observe(stage);

    layout();
    applyRot();
    render();
    const unsubscribe = subscribeToTicker(tick, () => 0);
    api.current = { go, focusWork };

    return () => {
      unsubscribe();
      observer.disconnect();
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onCancel);
      stage.removeEventListener("keydown", onKey);
      api.current = null;
    };
  }, [items]);

  return (
    <section
      id="lookbook"
      aria-labelledby="lookbook-title"
      className="o-relative at-h-lvh o-w-full o-overflow-hidden at-bg-background"
    >
      {/* ---------- stage + ring ---------- */}
      <div
        ref={stageRef}
        tabIndex={0}
        role="region"
        aria-label="Lookbook — carrousel 3D. Glisser, ou utiliser les flèches gauche et droite pour changer de silhouette."
        className="o-absolute o-inset-0 o-grid o-cursor-grab o-touch-none o-select-none o-place-items-center at-bg-linear-to-b at-from-background at-to-surface-raised o-outline-none at-data-drag-cursor-grabbing"
      >
        {/* A soft floor shadow that grounds the arc. */}
        <div
          aria-hidden="true"
          className="o-pointer-events-none o-absolute o-left-1/2 at-top-68 at-h-26vh at-w-62vw at--translate-x-1-2 at--translate-y-1-2 at-rounded-50 at-bg-foreground-10 o-blur-lg"
        />
        {/* The giant ghost index behind the arc. */}
        <div
          ref={ghostRef}
          aria-hidden="true"
          className="o-pointer-events-none o-absolute o-left-1/2 at-top-51 at--translate-x-1-2 at--translate-y-1-2 o-select-none at-font-display at-text-42vh at-leading-0-8 at-tracking-0-03em at-text-foreground-0-045 o-tabular-nums at-stacked-text-30vh"
        >
          01
        </div>
        <div
          ref={ringRef}
          className="o-relative at-z-1 o-h-0 o-w-0 at-transform-3d"
          style={{
            transform: "translateZ(var(--push, 0px)) rotateY(var(--rot, 0deg))",
          }}
        >
          {Array.from({ length: P.slots }, (_, slot) => {
            const item = items[slot % items.length];
            if (!item) return null;
            return (
              <article
                key={slot}
                data-slot={slot}
                className="o-absolute at-backface-hidden at-transform-3d"
                style={{
                  width: "var(--cw)",
                  height: "var(--ch)",
                  left: "calc(var(--cw) / -2)",
                  top: "calc(var(--ch) / -2)",
                  transform: `rotateY(${slot * STEP}deg) translateZ(calc(var(--r) * -1))`,
                }}
              >
                <div className="o-absolute o-inset-0 o-overflow-hidden at-rounded-card at-bg-foreground at-shadow-0-26px-60px-18px-var-tw-shadow-color at-shadow-foreground-40 at-backface-hidden o-will-change-transform o-transition-transform at-duration-var-duration-slow at-ease-entrance at-hover-scale-1-05 at-in-data-front-shadow-0-40px-90px-20px-var-tw-shadow-color">
                  <img
                    src={item.image}
                    alt={item.alt}
                    draggable={false}
                    className="o-absolute o-inset-0 o-h-full o-w-full o-object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="o-pointer-events-none o-absolute o-inset-0 at-bg-linear-to-t at-from-foreground-85 at-via-foreground-25 at-via-30 o-to-transparent at-to-55"
                  />
                  <span className="o-absolute o-left-3 o-top-3 at-z-2 at-font-sans at-text-frame-caption at-tracking-0-12em at-text-background-90 o-tabular-nums">
                    {pad2((slot % items.length) + 1)}
                  </span>
                  <h3 className="o-absolute at-inset-x-3-5 o-bottom-3 at-z-2 at-font-serif at-text-max-15px-1-2vw at-leading-1-05 at-text-background">
                    {item.title}
                  </h3>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* ---------- masthead ---------- */}
      <div className="o-pointer-events-none o-absolute o-inset-x-0 at-top-max-80px-13vh o-z-10 o-px-5 o-text-center">
        <p className="o-inline-flex o-items-center o-gap-2.5 at-font-sans at-text-frame-caption o-uppercase at-tracking-0-26em at-text-foreground-muted-70 at-before-h-px at-before-w-6 at-before-bg-line-20 at-after-h-px at-after-w-6 at-after-bg-line-20">
          {content.eyebrow}
        </p>
        <TextEngine
          tag="h2"
          id="lookbook-title"
          mode="once"
          overflow
          className="o-mt-3.5 o-justify-center o-text-center at-font-display at-text-4-6vw at-leading-display at-tracking-0-018em at-text-foreground o-text-balance at-stacked-text-9vw"
          wrapWordClassName="at-py-0-15em at--my-0-15em"
          lineIn={{ y: "0%", opacity: 1 }}
          lineOut={{ y: "100%", opacity: 0 }}
          lineStagger={110}
          lineConfig={{ duration: 1000, easing: easings.easeOutCubic }}
        >
          {content.headline.lead}{" "}
          <em className="at-font-serif o-italic">{content.headline.emphasis}</em>
        </TextEngine>
      </div>

      {/* ---------- edge labels + hint ---------- */}
      <span className="o-pointer-events-none o-absolute at-left-clamp-22px-3-4vw-40px o-top-1/2 o-z-10 o-origin-left at--translate-y-1-2 at--rotate-90 o-whitespace-nowrap at-font-sans at-text-frame-caption o-uppercase at-tracking-0-28em at-text-foreground-muted-60 at-stacked-hidden">
        {content.edgeLeft}
      </span>
      <span className="o-pointer-events-none o-absolute at-right-clamp-22px-3-4vw-40px o-top-1/2 o-z-10 o-origin-right at--translate-y-1-2 o-rotate-90 o-whitespace-nowrap at-font-sans at-text-frame-caption o-uppercase at-tracking-0-28em at-text-foreground-muted-60 at-stacked-hidden">
        {content.edgeRight}
      </span>
      <p className="o-pointer-events-none o-absolute at-bottom-clamp-124px-17vh-156px o-left-1/2 o-z-10 at--translate-x-1-2 o-select-none at-font-sans at-text-frame-caption o-uppercase at-tracking-0-3em at-text-foreground-muted-60 at-stacked-hidden">
        {content.hint}
      </p>

      {/* ---------- dock (front-card caption + controls) ---------- */}
      <div className="o-pointer-events-none o-absolute o-inset-x-0 o-bottom-0 o-z-10 o-grid at-grid-cols-1fr-auto-1fr o-items-end o-gap-6 at-px-frame-gutter at-pb-clamp-22px-4vh-40px at-stacked-grid-cols-auto-1fr-auto at-stacked-items-center at-stacked-gap-3">
        <p className="at-font-sans at-text-frame-caption at-tracking-0-04em at-text-foreground-muted-70 o-tabular-nums">
          <b
            ref={currentRef}
            className="at-font-display at-text-2-1rem o-font-light o-tracking-normal at-text-foreground at-stacked-text-1-5rem"
          >
            01
          </b>{" "}
          <span className="at-stacked-hidden">/ {pad2(items.length)}</span>
        </p>
        <div
          className="o-pointer-events-auto o-flex o-flex-col o-items-center o-gap-3 o-text-center at-stacked-gap-2"
          aria-live="polite"
        >
          <h3
            ref={titleRef}
            className="at-font-serif at-text-clamp-22px-2-8vw-34px at-leading-none at-text-foreground"
          >
            —
          </h3>
          <p
            ref={metaRef}
            className="at-font-sans at-text-frame-caption o-uppercase at-tracking-0-16em at-text-foreground-muted-70"
          >
            —
          </p>
          <div
            ref={dotsRef}
            role="tablist"
            aria-label="Aller à une silhouette"
            className="o-flex o-items-center at-gap-7px max-sm:o-hidden"
          >
            {items.map((item, i) => (
              <button
                key={item.title}
                type="button"
                role="tab"
                aria-label={`Aller au ${item.title}`}
                aria-selected={i === 0}
                data-on={i === 0}
                onClick={() => api.current?.focusWork(i)}
                className="o-h-2 o-w-2 o-rounded-full at-bg-foreground-15 at-transition-width-background-color at-duration-var-duration-normal at-ease-entrance at-data-on-true-w-6 at-data-on-true-bg-accent"
              />
            ))}
          </div>
        </div>
        <div className="o-pointer-events-auto o-flex o-items-center o-justify-end o-gap-3">
          <button
            type="button"
            aria-label="Silhouette précédente"
            onClick={() => api.current?.go(-1)}
            className="o-grid o-size-12 o-place-items-center o-rounded-full o-border-w-1 at-border-line-15 at-bg-background-60 at-font-serif at-text-19px at-leading-none at-text-foreground o-backdrop-blur-sm o-transition-colors at-duration-var-duration-fast at-ease-entrance at-hover-border-foreground at-hover-bg-foreground at-hover-text-background at-stacked-size-11"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Silhouette suivante"
            onClick={() => api.current?.go(1)}
            className="o-grid o-size-12 o-place-items-center o-rounded-full o-border-w-1 at-border-line-15 at-bg-background-60 at-font-serif at-text-19px at-leading-none at-text-foreground o-backdrop-blur-sm o-transition-colors at-duration-var-duration-fast at-ease-entrance at-hover-border-foreground at-hover-bg-foreground at-hover-text-background at-stacked-size-11"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
};
