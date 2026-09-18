import { animated, useSpring, type SpringValue } from "@react-spring/web";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";

import type { ShowreelContent } from "@/data/mocks/home";
import { BADGE_FOLLOW } from "@/lib/springs/presets";
import { showreelClip, showreelTransform } from "@/utils/timeline/scene";

export interface ShowreelProps {
  content: ShowreelContent;
  p: SpringValue<number>;
  /** Plays only while its phase is near — a 37 s loop is not free to decode. */
  active: boolean;
}

/**
 * The showreel the star explodes into: uncovered bottom-up, then zoomed toward
 * full width. Grayscale until hovered, with a frosted PLAY badge trailing the
 * cursor over it (pointer devices only — touch never fires the hover).
 */
export const Showreel = ({ content, p, active }: ShowreelProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);
  const s = useMemo(
    () => ({ clip: p.to(showreelClip), transform: p.to(showreelTransform) }),
    [p],
  );
  const [badge, badgeApi] = useSpring(() => ({
    x: 0,
    y: 0,
    opacity: 0,
    scale: 0.7,
    config: BADGE_FOLLOW,
  }));

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      // Autoplay of a muted inline video can still be refused (Low Power Mode);
      // the poster then stands in, which is the right failure.
      video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [active]);

  const follow = (event: MouseEvent) =>
    badgeApi.start({ x: event.clientX, y: event.clientY });

  return (
    <>
      <animated.div
        className="o-absolute o-left-1/2 o-top-1/2 o-z-40 cb-aspect-showreel cb-w-showreel"
        style={{ clipPath: s.clip, transform: s.transform }}
      >
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          poster={content.poster}
          aria-label={content.label}
          className="o-size-full o-object-cover o-grayscale cb-transition-filter cb-duration-var-duration-slow cb-ease-glide hover:o-grayscale-0"
          onMouseEnter={(event) => {
            badgeApi.set({ x: event.clientX, y: event.clientY });
            badgeApi.start({ opacity: 1, scale: 1 });
          }}
          onMouseMove={follow}
          onMouseLeave={() => badgeApi.start({ opacity: 0, scale: 0.7 })}
        >
          <source src={content.src} type="video/mp4" />
        </video>
      </animated.div>

      {/* Portalled: every ancestor here carries a transform, which would make
          `fixed` relative to it instead of to the viewport. */}
      {mounted &&
        createPortal(
          <animated.div
            aria-hidden
            className="o-pointer-events-none o-fixed o-left-0 o-top-0 cb-z-110"
            style={badge}
          >
            <span className="o-block cb--translate-1-2 o-rounded-sm o-border-w-1 cb-border-foreground-25 cb-bg-foreground-12 o-px-6 o-py-2.5 cb-text-badge o-font-semibold o-uppercase cb-tracking-caps cb-text-foreground o-shadow-lg o-backdrop-blur-md">
              {content.badge}
            </span>
          </animated.div>,
          document.body,
        )}
    </>
  );
};
