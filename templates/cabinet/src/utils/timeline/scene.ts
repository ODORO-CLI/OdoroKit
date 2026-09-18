// 📖 Docs: obsidian/frontend/utils.md · ADR-0024

/**
 * The Cabinet Odoro scroll timeline — a port of the House template's `animate()`
 * loop (getlayers-house `script.js`).
 *
 * One normalised progress `p` (0 → 1) across the pinned scroll track drives the
 * whole scene. Every export below is a pure function of `p`, consumed as
 * `p.to(selector)` on a single react-spring value that one `ProgressTrigger`
 * scrubs — so N layers cost one scroll read and zero React renders per frame.
 * The phase windows are the source's, unchanged.
 */

import { easeInOutSine, span, type Range } from "@/utils/timeline/range";

/** Track height, in viewports. The source's `.scroll-track { height: 1400vh }`. */
export const TRACK_VH = 1400;
/** Distance the track scrolls while its sticky stage is pinned. */
export const TRAVEL_VH = TRACK_VH - 100;

/** Phase windows, as fractions of the track's travel. */
export const PHASE = {
  sequence: [0, 0.4],
  // ── LES SORTIES FINISSENT AVANT QUE L'ENTREE SUIVANTE COMMENCE ────────
  // Elles se touchaient (0,13 / 0,26). Or la sortie d'un bloc et l'entree du
  // suivant ne vivaient pas sur la meme horloge — voir `heroClock` plus bas —
  // et chaque lettre met encore ~0,4 s a se poser une fois basculee. Une marge
  // de 0,015 de course (~20 vh) absorbe ce reglage sans allonger la scene.
  heroOneExit: [0.075, 0.115],
  heroTwoEnter: [0.13, 0.18],
  heroTwoExit: [0.205, 0.245],
  heroThreeEnter: [0.26, 0.31],
  echo: [0.4, 0.53],
  details: [0.53, 0.66],
  star: [0.66, 0.74],
  showreelReveal: [0.74, 0.79],
  showreelZoom: [0.79, 1],
} as const satisfies Record<string, Range>;

/** In-page anchors inside the track, and the point each one lands on. */
export const SCENE_ANCHOR = { top: "top", echo: "expertises", details: "cabinet" } as const;
export const ANCHOR_AT = { echo: PHASE.echo[1], details: PHASE.details[1] } as const;

/** A length down the track, for a fraction of its travel. */
export const trackOffset = (fraction: number): string =>
  `${fraction * TRAVEL_VH}vh`;

/**
 * Geometry of a TextEngine trigger for `range`. The box starts where the phase
 * starts and is one viewport taller than the phase, read with `top top` →
 * `bottom bottom`: progress runs 0 → 1 across exactly the phase, and the box
 * is still on screen when it reaches 1 — so the engine's in-view gate never
 * freezes a reveal half-played after a fast scroll.
 */
export const triggerBox = ([start, end]: Range) => ({
  top: trackOffset(start),
  height: `${(end - start) * TRAVEL_VH + 100}vh`,
});

// ── Hero blocks ────────────────────────────────────────────────────────────
/**
 * Where each block has fully gone (opacity 0), and may stop painting.
 *
 * Deliberately NO start gate. A block's letters are driven by TextEngine off the
 * raw scroll, while `p` trails it by the spring's damping. Gating the start on
 * `p` switched a block on only once the raw scroll was already part-way through
 * its entrance, so the letters popped in half-revealed and carried on from
 * there. Before its entrance a block is already invisible — its letters rest in
 * TextEngine's out state — so it needs no gate; it only hides once it has left.
 */
const HERO_GONE_AT = [PHASE.heroOneExit[1], PHASE.heroTwoExit[1], PHASE.echo[1]] as const;

/**
 * Where each block STARTS to exist. Block one is there from the top ; blocks
 * two and three exist only once their entrance phase begins.
 *
 * ── POURQUOI UNE PORTE D'ENTREE, ALORS QUE LA NOTE CI-DESSUS LA REFUSE ──
 *
 * La note refusait une porte sur `p`, l'horloge AMORTIE — et elle avait
 * raison : `p` traine la molette de ~0,3 s, donc la porte s'ouvrait alors que
 * les lettres, pilotees par la molette brute, etaient deja a moitie entrees.
 *
 * Cette porte-ci lit la molette BRUTE (`heroClock`, ci-dessous), la meme que
 * les lettres. Elle n'a donc aucun retard a rattraper. Et elle est
 * necessaire : le moteur de lettres allume la lettre i des que
 * `progress > i/n`, donc la PREMIERE lettre — seuil zero — s'allume au
 * moindre epsilon, avant meme que sa phase ait commence. Mesure a la page au
 * repos : le « P » de « Precision » deja a 100 % par-dessus « Conseil avec
 * Conviction ». La porte tient le bloc cache tant que sa phase n'a pas
 * commence, et ce fantome disparait.
 */
const HERO_SHOWN_AT = [0, PHASE.heroTwoEnter[0], PHASE.heroThreeEnter[0]] as const;

export const heroVisibility = (index: number) => (p: number) =>
  p >= HERO_SHOWN_AT[index] && p < HERO_GONE_AT[index] ? "visible" : "hidden";

/** The exit is block-level: a slide left and a blur, per the source's letters. */
const EXIT_SHIFT_REM = 2.5;
const EXIT_BLUR_REM = 0.75;

export const exitOpacity = (range: Range) => (p: number) =>
  1 - easeInOutSine(span(p, range));
export const exitTransform = (range: Range) => (p: number) =>
  `translate3d(${-EXIT_SHIFT_REM * easeInOutSine(span(p, range))}rem, 0, 0)`;
export const exitFilter = (range: Range) => (p: number) => {
  const blur = EXIT_BLUR_REM * easeInOutSine(span(p, range));
  // `blur(0)` still allocates a filter surface; `none` does not.
  return blur > 0 ? `blur(${blur}rem)` : "none";
};

export const heroDescriptionOpacity = [
  (p: number) => 1 - span(p, PHASE.heroOneExit),
  (p: number) =>
    span(p, PHASE.heroTwoEnter) * (1 - span(p, PHASE.heroTwoExit)),
  (p: number) => span(p, PHASE.heroThreeEnter),
] as const;

/** Block three is never exited letter by letter — it dims with the canvas. */
export const heroThreeOpacity = (p: number) => 1 - span(p, PHASE.echo);

// ── Sequence + grid ───────────────────────────────────────────────────────
export const sequenceFrame = (p: number, count: number) =>
  Math.min(count - 1, Math.floor(span(p, PHASE.sequence) * count));

export const gridOpacity = (p: number) => 1 - span(p, PHASE.sequence);
export const gridVisibility = (p: number) =>
  gridOpacity(p) > 0 ? "visible" : "hidden";

export const canvasOpacity = (p: number) => 1 - span(p, PHASE.echo);

// ── ECHO (interior one) ───────────────────────────────────────────────────
export const echoTransform = (p: number) =>
  `translate3d(0, ${(1 - span(p, PHASE.echo)) * 100}%, 0)`;

/** Both interiors settle from a 1.1 overscan as they arrive — the parallax. */
export const interiorScale = (range: Range) => (p: number) =>
  `scale(${1.1 - 0.1 * span(p, range)})`;

// ── Details (interior two) ────────────────────────────────────────────────
export const detailsClip = (p: number) =>
  `inset(${(1 - span(p, PHASE.details)) * 100}% 0 0 0)`;

/** Power 5 is the source's "warp" — nothing, nothing, then the whole screen. */
export const starTransform = (p: number) =>
  `scale(${0.04 + Math.pow(span(p, PHASE.star), 5) * 16})`;
/**
 * 0 → 1 across the warp: how far the star has turned from white to sage.
 * A number, deliberately — the colours stay tokens on two stacked paths. A
 * `color-mix(… var(--token) …)` string does not survive react-spring: its
 * string interpolator resolves the `var()` and truncates the result, which
 * both broke hydration and fed the path an invalid fill.
 */
export const starTint = (p: number) => span(p, PHASE.star);

const reveal = (p: number) => span(p, PHASE.showreelReveal);
const zoom = (p: number) => easeInOutSine(span(p, PHASE.showreelZoom));

export const showreelClip = (p: number) => `inset(${(1 - reveal(p)) * 100}% 0 0 0)`;
export const showreelTransform = (p: number) =>
  `translate(-50%, calc(-50% + ${(1 - reveal(p)) * 10}%)) scale(${1 + zoom(p) * 0.8})`;

/** Overlays fade in with the reveal, then part outward as the showreel zooms. */
const OVERLAY_SHIFT_REM = 7.5;
export const overlayOpacity = reveal;
export const overlayVisibility = (p: number) =>
  reveal(p) > 0 ? "visible" : "hidden";
export const overlayLeadTransform = (p: number) =>
  `translate3d(${(1 - zoom(p)) * OVERLAY_SHIFT_REM}rem, -50%, 0)`;
export const overlayAsideTransform = (p: number) =>
  `translate3d(${-(1 - zoom(p)) * OVERLAY_SHIFT_REM}rem, -50%, 0)`;

// ── Discrete flags ────────────────────────────────────────────────────────
/**
 * Everything the scene switches rather than scrubs. Committed to React state
 * only when a flag flips, so a full scroll re-renders a handful of times.
 */
export interface SceneFlags {
  /** The canvas is still visible, so frames are worth drawing. */
  canvas: boolean;
  /** "Award winning / Project 2026" — the moment ECHO starts to rise. */
  echoLead: boolean;
  /** "Portfolio / Arch.Mono" — once ECHO is 90% up. */
  echoFoot: boolean;
  /** The stats count up as the details layer starts to reveal. */
  details: boolean;
  /** The showreel plays from the star zoom onward. */
  showreel: boolean;
  /** Zoom title reveal, as the showreel is uncovered. */
  zoom: boolean;
}

export const sceneFlags = (p: number): SceneFlags => ({
  canvas: p < PHASE.echo[1],
  echoLead: p >= PHASE.echo[0],
  echoFoot: span(p, PHASE.echo) >= 0.9,
  details: p >= PHASE.details[0],
  showreel: p >= PHASE.star[0],
  zoom: p >= PHASE.showreelReveal[0],
});

export const sameFlags = (a: SceneFlags, b: SceneFlags): boolean =>
  (Object.keys(a) as (keyof SceneFlags)[]).every((key) => a[key] === b[key]);
