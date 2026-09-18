/**
 * The page chrome — the header on the first screen, the floating pill for the
 * middle of the page — and when each is up.
 *
 * 📖 Docs: obsidian/frontend/components/common.md
 */
export const chromeConfig = {
  header: {
    /** The header arrives a beat after the curtain releases the page. */
    delay: 420,
    enter: { tension: 60, friction: 22, clamp: true },
    leave: { tension: 120, friction: 26, clamp: true },
    /** How far the header rises from, in px. */
    lift: 12,
  },
  pill: {
    /** Each label resolves this much of the opening after the previous one. */
    itemStagger: 0.08,
    enter: { tension: 150, friction: 24 },
    leave: { tension: 190, friction: 30, clamp: true },
    /** Up once this many viewports are behind the reader. */
    showAfterViewports: 0.9,
    /**
     * Down while a quiet section owns the foot of the screen — one that has
     * controls of its own there (the lookbook's dock, the closing pill) or a
     * ground the pill must not sit on (the accent footer). A section is
     * "owning the foot" once its top has climbed past this fraction of the
     * viewport and until its bottom has left the lower part of the screen.
     */
    quietFromTop: 0.5,
    quietUntilBottom: 0.6,
  },
} as const;
