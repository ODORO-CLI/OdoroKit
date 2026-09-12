import * as THREE from "three";

/**
 * Scene colours, as GPU-ready vectors.
 *
 * Shaders can't read CSS custom properties, so the palette is mirrored here.
 * Every value below is one of the design tokens in `globals.css` — keep the two
 * in step. Named by token, not by usage, so a scene can pick its own ramp.
 *
 * ODORO re-tint (ADR-0045): the ramp is the brand orange family — the scene's
 * "deep space" is now lit by ember rather than by blue. Two values diverge from
 * the CSS on purpose, as they did in the source: `accent900` is a SATURATED ember
 * (the corner flames in `final-pass.ts` need a hue, not the near-black the CSS
 * token is), and the two `signal*` keys are the scene's HEAT — a white-gold for
 * the plume's spine and the lensing crescent, an ice-white for the starfield's
 * rarest specks — never a second brand colour.
 */

const hexToVec3 = (hex: number): THREE.Vector3 =>
  new THREE.Vector3(
    ((hex >> 16) & 255) / 255,
    ((hex >> 8) & 255) / 255,
    (hex & 255) / 255,
  );

/** Raw hex defaults, mirroring `:root` in `src/app/globals.css`. */
export const paletteHex = {
  accent900: 0xff5a1f,
  accent800: 0xffc266,
  accent700: 0x5a2410,
  accent600: 0xa8420f,
  accent500: 0xf97316,
  accent400: 0xfb923c,
  accent300: 0xfdba74,
  accent200: 0xffedd5,
  signalGlow: 0xffcf7a,
  signalRing: 0xe4f1ff,
  foreground: 0xfff6ea,
} as const;

export type PaletteKey = keyof typeof paletteHex;

/**
 * Runtime copy the settings panel can override. `color()` reads from here, so a
 * scene rebuilt after an override picks up the new hues. The frozen `paletteHex`
 * above stays the reset baseline.
 */
const runtimeHex: Record<PaletteKey, number> = { ...paletteHex };

/**
 * Bumped on every override. Scene objects read colours from `color()` and cache
 * this generation, re-reading their colour uniforms only when it changes — so the
 * panel recolours the live scene each frame, no remount needed.
 */
let paletteGeneration = 0;

/** Override one palette entry (used by the dev settings panel). */
export const setPaletteHex = (key: PaletteKey, hex: number): void => {
  runtimeHex[key] = hex;
  paletteGeneration += 1;
};

/** Current palette generation — compare against a cached copy to detect changes. */
export const paletteGen = (): number => paletteGeneration;

/** Current runtime palette, for export / the panel's initial values. */
export const getRuntimePalette = (): Record<PaletteKey, number> => ({
  ...runtimeHex,
});

/** A fresh `Vector3` per call — uniforms mutate theirs, so never share one. */
export const color = (key: PaletteKey): THREE.Vector3 =>
  hexToVec3(runtimeHex[key]);
