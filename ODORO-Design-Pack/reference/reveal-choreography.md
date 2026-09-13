# Reveal choreography — the house default

Every ODORO build gets this **by default**. A user can ask for it simplified or dropped; you
do not need permission to include it.

    immersive loader  →  gate  →  staggered content reveal  →  scene reveal

These rules were harvested from 11 templates, not invented. Where a number appears, it is a real
number from a shipped template. Where templates disagree, the disagreement is noted and a default
is chosen — with the reason.

---

## 1. The loader

**Be honest about what you are measuring, or don't show a number.**

Three legitimate designs, in descending order of preference:

**A. Asset-backed with a holding ceiling.** The counter tracks real readiness and *parks* short of
100 until the thing it's waiting for arrives.

    dt = min((now - last)/1000, 0.05)
    if (ready && v >= 99.4) v = 100                    // snap the last 0.6%
    else { ceiling = ready ? 100 : 92
           v += (ceiling - v) * (ready ? 6 : 1.7) * dt }

Two rates: a slow crawl toward a **92%** holding ceiling while loading, a fast run to 100 once
ready. If the asset stalls, the bar sits at 92 forever — which is honest. `altitude` does the same
with a 90 ceiling and two springs, and notes the ceiling is *a target, not a milestone*: on a warm
cache the interrupt lands at ~54, never touching 90.

**B. No counter at all.** A wordmark, a hairline, a veil. `halcyon` counts nothing and is the most
expensive-feeling loader in the library. `baseline`'s bar is a **timer, not a readout** — 1280ms
of `scaleX` timed to land flush with the end of the minimum-visible window. If you are not
measuring anything, do not draw a percentage.

**C. Paced curtain.** A fixed clock, honestly fixed. `artist` runs 0→100 over exactly 1500ms with
`1-(1-p)³` applied **to the number itself**, not to a CSS transition, so it decelerates into 100.

**Never** show a percentage that is a `setTimeout` dressed as progress.

### Always
- **`MIN_VISIBLE`** — 900–1600ms anti-flash floor, so a warm cache doesn't flash a curtain.
  (`forma` 900, `baseline` 1400, `altitude` 1300, `halcyon` 1600.)
- **A hard cap** — 2600–7000ms, so a stalled asset can never trap the visitor.
  (`baseline` 2600, `forma` 7000, `halcyon` 7000.)
- **"Ready" means ≥1 drawn frame.** Both templates that gate on WebGL fire `onReady` from *inside*
  the rAF loop, after the first `renderer.render` — so "ready" implies the shader compiled and the
  GPU drew. Resolving a promise is not readiness.

---

## 2. The gate

**Flip the gate at the START of the exit, never on its rest.** This is the single most consistent
finding in the library — `neural-monitor`, `forma`, `baseline`, `artist`, `halcyon`, `altitude`
and `marcus-vane` all do it, and the two that don't were judged worse by the people who read them.

The point is overlap. The content must animate in *through* the departing curtain:
- `marcus-vane` doesn't even use a callback — the hero runs on an absolute 2500ms clock, by which
  point the curtain is only **75% lifted**, so the wordmark rises behind the last quarter of the
  plate and the two moves read as one gesture.
- `halcyon` starts the copy while the veil is still **~40% opaque** and the camera entrance is
  mid-flight. Its porting agent shipped the "wait for rest" version first, saw it, and fixed it.
- `altitude` flips at 100 *before* the aperture starts opening, so the page animates in through the
  hole.

**Gate by holding state, not by withholding paint.** Mount everything at first paint and let it
sit at its `from` value. Reasons, all found in the wild:
- Crawlers and screen readers see the content (`altitude` keeps `spring-text-engine`'s hidden `seo`
  copy in the DOM).
- Text measuring and splitting happen behind the curtain, so the reveal is a cheap opacity/transform
  with no remount and cannot stall the frame (`flowstate`).
- Mounting late seeds scroll progress from a zero-height document and snaps a scroll-driven scene
  to its finale (`neural-monitor`).

Prefer `enabled={ready}` passed to each leaf over a global class. If an element must replay from
zero, force a remount with `key={ready ? 'on' : 'off'}` (`baseline`, `lumora`).

**Scroll release is separate from the visual gate.** Lock scroll on loader mount; release it on
the curtain's `onRest` — later than the content reveal, and that's correct.

---

## 3. Content reveal

**Per word or per line. Per character is for short display type only** — a wordmark, a hero line.
Never a paragraph.

Typical, from the library:

| unit | stagger | duration | used by |
|---|---|---|---|
| line | 90–140ms | 900–1100ms | `baseline`, `lumora`, `artist`, `gravity-webgl` |
| word | 20–85ms | 520–900ms | `flowstate` 85, `forma` 52, `halcyon` 75, `lumora` 35, `artist` 22 |
| char | 20–70ms | 720–950ms | `forma` 20, `altitude` 26, `marcus-vane` 52, `loopstack` 90 |

**Non-negotiable details, each learned the hard way:**

- **Protect descenders.** A clipped line mask crops descenders. Every template that clips adds
  `padding-bottom: .12–.15em; margin-bottom: -.12–-.15em`.
- **Never clip a blurred reveal.** `overflow` shears the blur halo at the line box — which is the
  entire point of the effect. `altitude` and `forma` found this independently.
- **Land opacity early in the curve.** `loopstack` hits full opacity at 25–30% of the timing
  function, so the type is *solid while still travelling and de-blurring*. That, not the translate,
  is what makes it read expensive.
- **One text engine per designed line.** One engine for a whole sentence re-wraps it — its
  container measures differently from a paragraph — and two designed lines come out as three.
  Continue the second engine's delay from the first's count so it still reads as one sweep.
- **Reveal in place when there's a scene behind.** `halcyon` uses opacity + blur with **no
  translate**, so words materialise without shifting over moving water.

**Below the fold is a different mechanic.** Gate only above-the-fold content on the loader;
everything else is plain viewport-entry, `once`, latching at 45–88% visible. Don't gate what
nobody can see.

---

## 4. Scroll

**One clock. One quantisation.** Lenis (or equivalent) drives a single normalised progress value;
everything reads from it.

- Write progress to a **ref**, not state, and read it imperatively inside the frame loop —
  scrolling must never re-render the tree.
- If DOM chrome needs discrete stages, quantise **from the same value** the scene uses.
  `neural-monitor` ships a genuine bug here: the camera uses `progress × 6` legs while the chrome
  uses `floor(progress × 7)` bands, so its takeover cover fades in ~29vh before its panel is framed.
- **Align keyframes to panel boundaries.** With N full-viewport panels, spread progress over N−1
  legs so keyframe *i* lands exactly when panel *i* fills the viewport. One panel of scrolling =
  one leg. `neural-monitor`'s camera is good almost entirely because of this.

Most reveals should be **viewport-entry**, not scroll-scrubbed. Scrub only what genuinely benefits:
a parallax plate, a counter, a camera. `lumora` scrubs exactly one thing (stat counters, which
count back down on scroll-up); `artist` scrubs two; `baseline` two.

---

## 5. The scene

**A 3D scene never fades in as a whole object.** Give it a physical entrance:

- **Full brightness on frame 0, then hand off.** `flowstate` detonates 34 ink splats at mount —
  the very first painted frame is peak brightness, no ramp — then re-ignites for 8 frames, then an
  invisible auto-cursor takes over at 700ms and orbits forever. Dye decays at 0.958/step, so the
  burst drains exactly across the content stagger. **Tune the content stagger so its midpoint sits
  in the decay valley between the burst and the ambient driver.** The scene never has a dead moment
  and the content never lands on a static ground.
- **Fly it in.** `gravity-webgl` parks 96 spheres off-screen with zero velocity, then on
  loader-complete re-scatters them inward with an `attractionBoost` of `lerp(7.5, 1, easeOutCubic(t/2.2))`
  — a 2.2s hard pull relaxing into the ambient spring. `neural-monitor` flies its brain in from
  `z 3.6 → 0` while unwinding a full `2π` turn, alpha 0→1, **all three on one shared eased scalar**
  so it lands as one gesture rather than three overlapping ones.
- **Dissolve, don't fade.** `halcyon` reveals through a 3D-noise dissolve band with an edge glow,
  and drops the camera from high above the sea to skimming it over 2.8s, out of a white-out.

**Interpolate linearly and damp once.** Do not hand-ease every segment. One frame-rate-independent
damp gives the whole thing weight:

    const k = 1 - Math.exp(-DAMP * Math.min(delta, 0.1))
    camera.position.lerp(target.position, k)
    lookAt.lerp(target.lookAt, k)          // damp separately, then camera.lookAt(lookAt)

`DAMP = 3.2` → τ ≈ 312ms, 95% settle ≈ 940ms. **That lag is the weight** — the camera sits a third
of a second behind your scroll, which is what makes it read as flown rather than scrubbed. Clamp
`delta` so a tab-restore can't teleport. Damp position and look-at as separate vectors so the
framing swings instead of pivoting rigidly. Pass **real `delta`** — a hardcoded `1/60` converges
twice as fast on a 120Hz display.

**Frame with the look-at, not the model.** A negative `target.x` puts the subject off-centre and
leaves the other half for copy, without moving the object.

**Shader uniforms usually should NOT be damped** — a soft falloff reads smooth on raw linear
values, and the camera's own damping already softens the apparent motion.

---

## 6. Reduced motion

`prefers-reduced-motion` must reach **everything**, and this is where the library is weakest.

The clean pattern: toggle the animation library's global skip (`skipAnimation` in react-spring) so
every spring jumps to its end state, loader included — `forma`, `baseline` and `flowstate` do this.

**But two templates ship a real bug you must not copy:** `flowstate`'s shader ignores the setting
and keeps running; `neural-monitor` pins its camera at progress 0 while the scene keeps scanning
regions and exploding at the finale — a frozen camera watching an animated brain. A canvas or
shader loop is not covered by your animation library's global flag. Turn it off yourself.

Reduce, don't delete: `gravity-webgl` drops translate and blur under reduced motion and **keeps
opacity**, so the page still resolves rather than snapping.

---

## When to simplify

Drop it to a plain fade — or nothing — when the user asks, or when the page is a dashboard, an app
shell, or anything a person will visit many times a day. An immersive loader is for a page someone
sees once and should remember. It is a first-impression instrument, not a habit.
