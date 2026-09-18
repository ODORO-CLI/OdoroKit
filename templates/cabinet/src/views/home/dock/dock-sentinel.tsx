import { useEffect, useRef } from "react";

import { useSceneStore } from "@/hooks/scene/use-scene-store";

/**
 * Marks the end of the reviews section. From the moment it reaches the bottom
 * of the viewport — the footer starting to show — the dock steps aside, and it
 * stays aside while the sentinel is anywhere above that line.
 */
export const DockSentinel = () => {
  const ref = useRef<HTMLSpanElement>(null);
  const setDockHidden = useSceneStore((state) => state.setDockHidden);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      setDockHidden(entry.boundingClientRect.top < window.innerHeight);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [setDockHidden]);

  return <span ref={ref} aria-hidden className="o-absolute o-inset-x-0 o-bottom-0 o-h-px" />;
};
