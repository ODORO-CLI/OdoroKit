/**
 * The two edge thumbnails — one photograph at two crops, bleeding off the top
 * and bottom edges of the frame, each rounded only on the edge that stays
 * inside it.
 *
 * The photograph is the manchette portrait (3:4). The top crop frames the
 * gold cuff on the outstretched hand; the bottom crop frames the turned head
 * and the bun. Both are percentages of the thumbnail's own box, so they hold
 * at every viewport the box is drawn at.
 *
 * 📖 Docs: obsidian/frontend/hero.md
 */

import { animated, to, type SpringValue } from "@react-spring/web";

import { PHASE, THUMBNAIL_CLASS, uiStart } from "./hero.geometry";
import type { HeroContent } from "./hero.types";

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/** Crops, as percentages of each thumbnail box. The box is 227×132 at 1440. */
const CROP = {
  /* The cuff and the rings, lower right of the photograph. */
  top: { width: "170%", left: "-78%", top: "-152%" },
  /* The bun and the turned profile, upper left. */
  bottom: { width: "150%", left: "-30%", top: "-6%" },
} as const;

/**
 * How far the pair parts as the hero is scrolled away, in rem.
 *
 * They are the two halves of one composition, so they leave as one gesture read
 * in two directions: the top one up and out, the bottom one down and out. A
 * fixed distance rather than a fraction of the screen, because what they are
 * leaving is not the screen but each other.
 */
const PART_TRAVEL = 9;

export interface HeroThumbnailsProps {
  media: HeroContent["media"]["thumbnail"];
  progress: SpringValue<number>;
  /** 0→1 as the hero scrolls away. The pair parts across it. */
  exit: SpringValue<number>;
}

export const HeroThumbnails = ({
  media,
  progress,
  exit,
}: HeroThumbnailsProps) => {
  const start = uiStart("thumbnails");
  const eased = progress.to((p) => clamp01((p - start) / PHASE.uiDuration));

  /*
   * Entry and exit on one transform, because one element carries one transform.
   * `direction` is −1 for the top thumbnail and +1 for the bottom, and it means
   * the same thing at both ends: the entry comes *from* that side, and the exit
   * leaves *towards* it.
   */
  const enter = (direction: -1 | 1) => ({
    opacity: eased,
    transform: to(
      [eased, exit],
      (v: number, out: number) =>
        `translate3d(0, ${((1 - v) * 1.25 + out * PART_TRAVEL) * direction}rem, 0)`,
    ),
  });

  return (
    <>
      <animated.div
        className={`jo-rounded-b-media o-overflow-hidden ${THUMBNAIL_CLASS.top}`}
        style={enter(-1)}
      >
        <img
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          sizes="30vw"
          className="o-absolute o-max-w-none"
          style={{ ...CROP.top, height: "auto" }}
        />
        <div className="jo-bg-scrim-media o-absolute o-inset-0" />
      </animated.div>

      <animated.div
        className={`jo-rounded-t-media o-overflow-hidden ${THUMBNAIL_CLASS.bottom}`}
        style={enter(1)}
      >
        <img
          src={media.src}
          alt=""
          width={media.width}
          height={media.height}
          sizes="30vw"
          className="o-absolute o-max-w-none"
          style={{ ...CROP.bottom, height: "auto" }}
        />
        <div className="jo-bg-scrim-media o-absolute o-inset-0" />
      </animated.div>
    </>
  );
};
