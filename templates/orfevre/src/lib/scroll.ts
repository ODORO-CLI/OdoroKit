/* ══════════════════════════════════════════════════════════════════════════
   ONE clock for the whole page.

   Lenis owns the scroll; a single rAF loop reads it and pushes the raw value
   to every subscriber. Subscribers read it INSIDE the frame — nothing here
   ever calls setState, because scrolling a pinned film must not re-render the
   tree. Anything that needs discrete stages quantises from this same value, so
   the chrome can never disagree with the frame on screen.
   ══════════════════════════════════════════════════════════════════════════ */
import Lenis from "lenis";

export type Frame = { time: number; delta: number };
type Sub = (f: Frame) => void;

let lenis: Lenis | null = null;
let raf = 0;
let last = 0;
const subs = new Set<Sub>();

export const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function loop(now: number) {
  raf = requestAnimationFrame(loop);
  lenis?.raf(now);

  // Clamp: a tab restored after a minute must not hand every damper a delta
  // large enough to teleport it to its target.
  const delta = Math.min((now - last) / 1000, 0.1);
  last = now;

  const frame: Frame = { time: now, delta };
  for (const s of subs) s(frame);
}

export function startClock() {
  if (lenis) return;
  lenis = new Lenis({
    // The lag IS the weight: the page trails the wheel by about a third of a
    // second, which is what makes the film read as flown rather than scrubbed.
    lerp: REDUCED ? 1 : 0.085,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.4,
    smoothWheel: !REDUCED,
  });
  last = performance.now();
  raf = requestAnimationFrame(loop);
}

export function stopClock() {
  cancelAnimationFrame(raf);
  lenis?.destroy();
  lenis = null;
  raf = 0;
}

export function onFrame(fn: Sub) {
  subs.add(fn);
  /* Returns void, not the Set's boolean: this is used directly as a React
     effect destructor, and a destructor that returns a value is a type error. */
  return () => {
    subs.delete(fn);
  };
}

/** Scroll is locked while the loader holds, and released on the curtain's rest
    — later than the content reveal, which is correct. */
export function lockScroll(locked: boolean) {
  if (!lenis) return;
  locked ? lenis.stop() : lenis.start();
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

export function scrollTo(target: string) {
  lenis?.scrollTo(target, { duration: 1.4 });
}

/* ── small maths, shared ─────────────────────────────────────────────────── */
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** One frame-rate-independent damp. DAMP 3.2 → τ ≈ 312 ms. */
export const damp = (current: number, target: number, rate: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-rate * dt));

/** How far `el` has travelled through its own scrollable height: 0 when its
    top hits the viewport top, 1 when its bottom does. */
export function trackProgress(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const travel = rect.height - window.innerHeight;
  if (travel <= 0) return 0;
  return clamp(-rect.top / travel);
}
