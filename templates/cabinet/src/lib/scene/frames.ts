// 📖 Docs: obsidian/frontend/utils.md · ADR-0025

/**
 * The hero's frame sequence — tiers, paths and the loader.
 *
 * The Odoro library dolly is a 10 s, 24 fps, 1080p clip generated with
 * Seedance 2.5 (Higgsfield). It is re-encoded offline to WebP in two tiers —
 * see the changelog entry for the commands. The binding constraint on a phone
 * is memory, not bandwidth — a decoded 1280×720 frame is 3.7 MB whatever it
 * cost on the wire — so the mobile tier halves the count as well as the size.
 */

export interface FrameTier {
  name: "desktop" | "mobile";
  count: number;
  width: number;
  height: number;
}

export const FRAME_TIERS = {
  desktop: { name: "desktop", count: 240, width: 1920, height: 1080 },
  mobile: { name: "mobile", count: 120, width: 1280, height: 720 },
} as const satisfies Record<string, FrameTier>;

/** Below this width, or on a coarse pointer, the mobile tier is used. */
const TIER_BREAKPOINT = 1024;
const COARSE_POINTER_QUERY = "(hover: none) and (pointer: coarse)";

/** Frames in flight at once — enough to fill the pipe, few enough to stay ordered. */
const FETCH_CONCURRENCY = 6;

/**
 * Read once, at mount. Switching tiers mid-session would mean re-downloading the
 * whole set; a 2D canvas has no DPR or framebuffer to retune, so a window
 * dragged across the breakpoint simply keeps the frames it loaded with.
 */
export const pickFrameTier = (): FrameTier => {
  const coarse = window.matchMedia(COARSE_POINTER_QUERY).matches;
  return window.innerWidth < TIER_BREAKPOINT || coarse
    ? FRAME_TIERS.mobile
    : FRAME_TIERS.desktop;
};

export const framePath = (tier: FrameTier, index: number): string =>
  `/assets/scene/sequence/${tier.name}/${String(index).padStart(3, "0")}.webp`;

/** The first desktop frame — the poster under the canvas and the bot fallback. */
export const FRAME_POSTER = framePath(FRAME_TIERS.desktop, 0);

/**
 * Fetch and decode the set, in order, a few at a time. `decode()` resolves once
 * the frame is paintable, so the first `drawImage` of it never stalls on a
 * synchronous decode mid-scroll. A frame that fails is reported as `null` and
 * the canvas falls back to its nearest neighbour.
 */
export const loadFrames = async (
  tier: FrameTier,
  onFrame: (index: number, image: HTMLImageElement | null) => void,
  signal: AbortSignal,
): Promise<void> => {
  let cursor = 0;
  const pump = async (): Promise<void> => {
    while (!signal.aborted) {
      const index = cursor;
      cursor += 1;
      if (index >= tier.count) return;
      const image = new Image();
      image.decoding = "async";
      image.src = framePath(tier, index);
      let loaded: HTMLImageElement | null = image;
      try {
        await image.decode();
      } catch {
        loaded = null;
      }
      if (signal.aborted) return;
      onFrame(index, loaded);
    }
  };
  await Promise.all(Array.from({ length: FETCH_CONCURRENCY }, pump));
};
