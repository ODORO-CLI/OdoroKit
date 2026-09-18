import { animated, type SpringValue } from "@react-spring/web";
import { useEffect, useMemo, useRef } from "react";

import type { ImageAsset } from "@/data/mocks/home";
import { useSceneStore } from "@/hooks/scene/use-scene-store";
import { subscribeToTicker } from "@/lib/animation/ticker";
import { loadFrames, pickFrameTier } from "@/lib/scene/frames";
import { isBotAgent } from "@/utils/is-bot-agent";
import { canvasOpacity, sequenceFrame } from "@/utils/timeline/scene";

export interface SequenceCanvasProps {
  p: SpringValue<number>;
  /** False once ECHO has covered the canvas — nothing left worth drawing. */
  active: boolean;
  poster: ImageAsset;
}

/**
 * The house fly-through: a frame sequence scrubbed by the timeline and painted
 * to a 2D canvas.
 *
 * Draws on the shared ticker, and only when the wanted frame index changes, the
 * canvas is still visible and the tab is in front — a held scroll costs
 * nothing. The poster (frame zero) paints first and stays under the canvas, so
 * a crawler, a no-JS load or a failed fetch still shows the house.
 */
export const SequenceCanvas = ({ p, active, poster }: SequenceCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const setFramesProgress = useSceneStore((state) => state.setFramesProgress);
  const opacity = useMemo(() => p.to(canvasOpacity), [p]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    // A crawler gets the poster and never starts the download (ADR-0025).
    if (!canvas || !context || isBotAgent(navigator.userAgent)) {
      setFramesProgress(1);
      return;
    }

    const tier = pickFrameTier();
    canvas.width = tier.width;
    canvas.height = tier.height;
    const frames: (HTMLImageElement | null)[] = new Array(tier.count).fill(null);
    let settled = 0;
    let painted = -1;

    /** The nearest frame that has arrived — a fast flick early in loading
     *  shows the last frame that made it, never an empty canvas. */
    const nearest = (index: number) => {
      for (let step = 0; step < tier.count; step += 1) {
        const image = frames[index - step] ?? frames[index + step];
        if (image) return image;
      }
      return null;
    };

    const draw = (force = false) => {
      const index = sequenceFrame(p.get(), tier.count);
      if (!force && index === painted) return;
      const image = nearest(index);
      if (!image) return;
      context.drawImage(image, 0, 0, tier.width, tier.height);
      painted = index;
    };

    const controller = new AbortController();
    void loadFrames(
      tier,
      (index, image) => {
        frames[index] = image;
        settled += 1;
        setFramesProgress(settled / tier.count);
        if (image) draw(true);
      },
      controller.signal,
    );

    const unsubscribe = subscribeToTicker(() => {
      if (!activeRef.current || document.hidden) return;
      draw();
    }, () => 0);

    return () => {
      controller.abort();
      unsubscribe();
    };
  }, [p, setFramesProgress]);

  return (
    <animated.div className="o-absolute o-inset-0 cb-z-1" style={{ opacity }}>
      <img
        src={poster.src}
        alt={poster.alt}
        priority
        className="o-absolute o-inset-0 o-h-full o-w-full o-object-cover"
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className="o-absolute o-inset-0 o-size-full o-object-cover"
      />
    </animated.div>
  );
};
