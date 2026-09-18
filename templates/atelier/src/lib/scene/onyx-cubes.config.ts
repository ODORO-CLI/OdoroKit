/**
 * Onyx Cubes — GetLayers scene `onyx-cubes`, its CONFIG.
 *
 * A loose swarm of glossy black metal cubes hanging weightless in a bright
 * studio, shoved aside by the cursor's bow-wave, grabbed and flung on a press.
 * A live rigid-body sim (cannon-es) with a soft centre spring instead of
 * gravity, so the swarm never drifts off-screen and never dozes off.
 *
 * Every magic number the renderer reads is named here (hard rule #4). The
 * colours are the exception — they are design tokens, read from CSS at
 * runtime by the canvas component (`--foreground` for the metal, `--accent`
 * for the reflected surround), so the theme stays the source of truth. That is
 * the Style's tint applied where the contract says it must be: through the
 * CONFIG, never the shader.
 *
 * 📖 Docs: obsidian/workflows/optimize-3d-scene.md
 */
export const onyxCubesConfig = {
  // render
  exposure: 1,
  // material — the wet chrome-black look
  metalness: 1,
  roughness: 0.16,
  clearcoat: 0.6,
  clearcoatRoughness: 0.12,
  envIntensity: 1,
  /**
   * How much of the accent the reflected surround carries, 0–1. The cubes
   * are full metal, so they take their colour almost entirely from that
   * reflection: at 1 they read as blue chrome, at 0 as flat black. Kept
   * dark so the accent appears as light caught on black, not as paint.
   */
  envTintStrength: 0.42,
  // the swarm
  cubeCount: 12,
  cubeSize: 1.05,
  sizeVar: 0.32,
  cornerR: 0.1,
  spawnSpread: 2.6,
  /**
   * Where the swarm's spring pulls to, in world units. Right of centre on a
   * wide window so the copy keeps the left half of the frame; centred when
   * the copy stacks under it.
   */
  centerX: 2.4,
  centerXStacked: 0,
  centerYStacked: 2.2,
  // float dynamics
  centerPull: 5.5,
  bob: 0.9,
  bobSpeed: 0.55,
  linDamp: 0.32,
  angDamp: 0.28,
  spin: 0.8,
  restitution: 0.28,
  friction: 0.15,
  // cursor interaction
  pushRadius: 2.3,
  pushStrength: 34,
  dragForce: 90,
  // lighting
  keyLight: 0.55,
  ambient: 0.55,
  rim: 0.35,
  // contact shadow
  shadowOpacity: 0.12,
  shadowY: -3.4,
  // camera
  fov: 32,
  camDist: 10,
  /**
   * A portrait window is narrow, and the horizontal field of view narrows
   * with it: at the wide window's distance the swarm fills the whole screen.
   * Further back, it sits above the copy at the size it has on a desktop.
   */
  camDistStacked: 16,
  parallax: 0.4,
  parallaxEase: 0.05,
  // physics step
  fixedStep: 1 / 120,
  maxSubSteps: 4,
  maxDelta: 1 / 30,
  // device
  maxPixelRatio: 2,
  maxPixelRatioTouch: 1.5,
} as const;
