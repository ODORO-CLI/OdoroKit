/**
 * SSR-safe read of the OS "reduce motion" preference.
 *
 * `false` on the server and for the hydration pass, so the first client render
 * matches the markup; the real value arrives on the first effect and the
 * component re-renders once. A section that autoplays footage reads this to
 * hold its poster instead — `<ReducedMotion>` at the root covers every spring,
 * but a `<video>` loop is not a spring and has to be stopped by hand.
 */

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

const subscribe = (onChange: () => void): (() => void) => {
  const list = window.matchMedia(QUERY);
  list.addEventListener("change", onChange);
  return () => list.removeEventListener("change", onChange);
};

const read = (): boolean => window.matchMedia(QUERY).matches;

export const usePrefersReducedMotion = (): boolean =>
  useSyncExternalStore(subscribe, read, () => false);
