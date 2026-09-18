// 📖 Docs: obsidian/frontend/components/common.md
/**
 * The client leaf that owns the Onyx Cubes canvas.
 *
 * Sized to its host, not the window, so the scene can sit in a section; the
 * palette is read from the page's tokens at mount, which is how the Style's
 * tint reaches the scene without a hex in the code. The loop runs on the
 * shared ticker only while the host is on screen and the tab is visible —
 * a swarm nobody can see costs nothing.
 *
 * Under reduced motion the sim draws one frame and stops: the cubes are
 * still there, they just do not float.
 */

import { useEffect, useRef } from "react";

import { subscribeToTicker } from "@/lib/animation/ticker";
import { OnyxCubesScene } from "@/lib/scene/onyx-cubes";
import { onyxCubesConfig } from "@/lib/scene/onyx-cubes.config";

export interface OnyxCubesCanvasProps {
  className?: string;
}

/** A renderer that cannot be created (no WebGL) is a scene that is not there. */
const createScene = (
  canvas: HTMLCanvasElement,
  palette: { cube: string; env: string },
  touch: boolean,
): OnyxCubesScene | null => {
  try {
    return new OnyxCubesScene(canvas, palette, { touch });
  } catch {
    return null;
  }
};

export const OnyxCubesCanvas = ({ className }: OnyxCubesCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement ?? canvas;
    const styles = getComputedStyle(canvas);
    const palette = {
      cube: styles.getPropertyValue("--foreground").trim(),
      env: styles.getPropertyValue("--accent").trim(),
    };
    const touch = !window.matchMedia("(hover: hover) and (pointer: fine)")
      .matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stacked = window.matchMedia(
      "(max-width: 1179px) and (max-aspect-ratio: 1/1)",
    );

    const scene = createScene(canvas, palette, touch);
    // No WebGL: the section keeps its copy and its ground, nothing else.
    if (!scene) return;

    const place = () => {
      const rect = host.getBoundingClientRect();
      scene.resize(rect.width, rect.height);
      if (stacked.matches) {
        scene.setFraming(
          onyxCubesConfig.centerXStacked,
          onyxCubesConfig.centerYStacked,
          onyxCubesConfig.camDistStacked,
        );
      } else {
        scene.setFraming(onyxCubesConfig.centerX, 0, onyxCubesConfig.camDist);
      }
    };
    place();
    const resizeObserver = new ResizeObserver(place);
    resizeObserver.observe(host);

    let unsubscribe: (() => void) | null = null;
    let onScreen = false;
    const start = () => {
      if (unsubscribe || reduce) return;
      unsubscribe = subscribeToTicker(() => scene.frame(), () => 0);
    };
    const stop = () => {
      unsubscribe?.();
      unsubscribe = null;
    };
    const sync = () => {
      if (onScreen && !document.hidden) start();
      else stop();
    };

    if (reduce) scene.frame();

    const intersection = new IntersectionObserver(
      ([entry]) => {
        onScreen = Boolean(entry?.isIntersecting);
        sync();
      },
      { rootMargin: "10% 0px" },
    );
    intersection.observe(host);
    document.addEventListener("visibilitychange", sync);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", sync);
      intersection.disconnect();
      resizeObserver.disconnect();
      scene.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      // Drag must move a cube, not the page.
      style={{ touchAction: "none" }}
    />
  );
};
