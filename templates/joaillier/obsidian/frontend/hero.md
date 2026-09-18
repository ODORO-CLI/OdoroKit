---
tags: [frontend, section, stable]
updated: 2026-09-14
---

# Hero — footage and a viewfinder

> [!important] This section is the GetLayers template *Wanderlust*'s hero, ported as-is (ADR-0025)
> The note below is the template's own documentation and still describes the
> code line for line. What ODORO changed is the **skin** and four numbers:
>
> | | Wanderlust | ODORO |
> |---|---|---|
> | Footage | aerial river valley, 4s, 2560×1440 | the champagne portrait, 10s, 1920×1080 (`/assets/hero/hero-video.mp4`) |
> | `VIDEO_RATE` | 2 | **1.75** — a 10s beauty clip at 2× hurries the blink; 1.75 lands the assembly at ~5.7s |
> | `ASSEMBLY_FALLBACK_MS` | 8000 | **9000** — must exceed the clip's wall-clock length |
> | Closing still | `hero-final-frame.jpg` | `hero-still.jpg`, the clip's own last frame via ffmpeg (ADR-0026) |
> | Chrome | `explore`, `destinations` | `cta` (DÉCOUVRIR LA COLLECTION), `collections` (Bracelets · Bagues · Colliers · Manchettes) |
> | Switcher | SLIDER / LIST | OR / ARGENT |
> | Tally lamp | signal red | **gold** — the one place the accent blinks |
> | Thumbnails | one aerial at two crops | the manchette portrait at two crops (`hero-thumbnails.tsx → CROP`) |
> | Type | Instrument Serif / Inter Tight | Cormorant / Inter Tight, via the framework's font loader |
>
> **One addition — the exit parallax.** The picture layers (footage, still, veil,
> vignette, grain) share one `animated.div` plate that sinks by `EXIT_PARALLAX`
> (28% of the stage) on the section's own `exit` value as the hero scrolls away,
> so the interface leaves at the page's speed and the picture lags behind it.
> The plate wraps the media only: the viewfinder is a sibling, so its
> `backdrop-filter` keeps an untransformed ancestor chain (see "Why the card
> cannot be centred with a transform" below — the same rule).
>
> Section names in the text below (Figma node ids, "block 2", "destinations",
> "EXPLORE DESTINATIONS") are the template's; read them as the ODORO equivalents.



The home page's only section so far. `src/views/home/hero/`.

Source: Figma *Get Layers*, file `WINXFW2nTM7zYwd5dGgm1T`, frames
`863:1005` (start), `868:1094` (middle), `774:254` (final). All three are
1440×800.

## The idea

A piece of footage, darkened, and a viewfinder that opens on it. **Three beats,
each waiting for the one before it** — and a fourth that is really the tail of
the second:

| # | Cue | What happens |
|---|---|---|
| 1 | the preloader lifts | the video plays; the veil closes over it across `VEIL_MS` |
| 2 | the video is `ASSEMBLY_LEAD_S` from its end | the mask scales open and follows the cursor |
| 2′ | the video reaches its last frame | a full-resolution still of that frame dissolves over it across `STILL_MS` |
| 3 | the mask lands | the interface gathers around it |

> [!important] Frames 1 and 2 were always placeholders — read their names
> `863:1005` is *"Hero 2 (Image 1 for **Video after Preloader**)"* and `868:1094`
> is *"Image 2 for Video after Preloader"*. The section used to fly between them:
> a composite scaled 1 → 1.9632 about a solved fixed point and cross-dissolved
> into the frame-3 landscape. That zoom was a rehearsal of a camera move a video
> does properly, and it is gone now that the footage exists —
> `public/assets/hero/Hero-video.mp4`, 2560×1440, four seconds.
>
> What survived intact is the **interface**: beat 3 is still one 0→1 value with
> every group interpolated off it, and not one coordinate in `CLASS` moved. That
> is what building the section on a single continuous value bought — replacing
> what the picture *is* cost nothing downstream.

Beat 3 plays on a clock rather than on the scroll, so the section is **one
viewport** at every width. Only `transform` and `opacity` animate.

> [!important] Lenis must agree with the real scroll position from frame one
> The browser restores the previous scroll offset on the `load` event, which is
> *after* `ScrollLayout` has reset to the top and handed Lenis a scroll of 0.
> The page then sits lower than Lenis believes, and the first wheel gesture is
> spent resyncing rather than driving the timeline — it reads as "you have to
> scroll one way and then the other before anything happens".
> `history.scrollRestoration = "manual"` in `scroll-layout.tsx` prevents it.
> The hero additionally calls `lenis.resize()` on mount and on any height change
> of the pinned track.

> [!important] Three pieces of chrome, not two
> The wordmark, the nav **and EXPLORE DESTINATIONS** are `fixed` and share
> `chromeGate`, so all three travel with the reader and stand down together when
> the footer arrives. The explore link was the odd one out for several passes —
> `absolute`, so it scrolled off with the hero while the other two stayed.
>
> It is `lg:fixed` rather than plain `fixed`, and that is not a hedge. Below the
> desktop base it is not in the top row at all: it drops to the foot of the hero,
> and on a phone it is the section's one call to action, centred above the safe
> area. Fixed there it would be a button floating over five other blocks that
> have calls to action of their own.

## Files

| File | What it holds |
|------|---------------|
| `hero.tsx` | The scene: video, closing still, veil, vignette, grain, and the beats |
| `hero-overlay.tsx` | The interface, its staggered reveal, and the tally lamp |
| `hero-thumbnails.tsx` | The two edge thumbnails |
| `hero-icons.tsx` | The three vector layers, inlined |
| `hero.geometry.ts` | Every measurement taken from Figma, with node ids |
| `hero.types.ts` | Content shape |

Copy and media come from `src/data/mocks/home.ts` through props — nothing is
hardcoded in a component.

## Timeline

### Beat 1 — the footage, and the dark

`<video>`, full-bleed and `object-cover`, `muted` + `playsInline` (neither is
optional — without both a browser will not start a clip without a gesture) and
`preload="auto"`. It is **not** `autoplay`: `play()` is called on the
preloader's handover, because a clip started at mount would run underneath the
loading card and be over before anyone saw it.

> [!warning] `isEnableScroll` starts `true`, so the hero's effect fires once
> before the preloader has said anything
> The store's initial value is `true` and the preloader's `stop()` runs in an
> effect, so the hero's first effect — which captured the value from a render
> that happened before any effect ran — sees `true` and plays. The store then
> flips to `false`, the effect re-runs and returns early, and the clip is left
> playing **under the card**.
>
> Invisible while the card was ~1.2s and the clip was 4s. Fatal the moment the
> card got a 2.2s floor and the clip ran at 2×: the whole thing was over before
> the card lifted and the reader was handed a still. Reported as "the video
> stopped playing after the preloader — it goes straight to the last frame".
>
> Two rules answer it, and neither depends on effect ordering — which is what
> made the bug invisible for a pass. **Cleanup pauses**, so a run that turns out
> not to be the handover stops within a frame. **Every run resets** — `progress`
> and `veil` to 0, `currentTime` to 0 — so the run that *is* the handover starts
> from nothing regardless of what happened before it.
>
> Traced: `play` at 766ms with the card up, `pause` 92ms later, real `play` at
> 3314ms as the card lifts.

It runs at **`VIDEO_RATE`, 2×**. The footage is a slow aerial and at 1× the hero
spent four seconds saying one thing before the page would start; doubling it
keeps every frame and halves the wait, which on an establishing shot reads as
confidence rather than as haste.

No `poster`. A poster is a *different* picture for the first beat and then a cut
to the clip's own first frame, which is a jump with no reason behind it; the
preloader already holds the page until the clip has frames to give.

| Layer | What it does |
|---|---|
| video | plays once, then holds its last frame |
| still | a full-resolution copy of that last frame, dissolved over it — beat 2′ |
| veil | `bg-scrim-page`, 0 → 1 across `VEIL_MS` (900ms) |
| vignette | 0 → 0.45 on the same value, centred, and stays |
| grain | over the veil, under everything else — see below |

The veil starts **with** the video rather than after it, so the hero opens bright
and settles into its own mood. It is a layer rather than a `brightness()` filter
on the video: a filter forces the element onto its own composited layer for every
frame and the result is identical.

> [!important] The window is a hole in the veil, and the correction is now a
> constant
> The card brightens its backdrop by `1 / (1 − 0.5·s)` — the exact reciprocal of
> what the 50% veil multiplied it by — so what shows through the viewfinder is
> the original pixels, not a second copy of them. That used to be an
> interpolation, because the scrim ramped across the same value the interface
> did. The veil belongs to beat 1 now and is long since full by the time the
> window opens, so the number to undo is a constant string.

### Beat 2 → 3 — and it can be reached three ways

The real cue is **`ASSEMBLY_LEAD_S` before the end**, not `ended` — 0.4 media
seconds, so 200ms of wall clock at 2×. Waiting for `ended` put a beat of nothing
between the shot finishing and the window opening: the video stopped, and then,
separately, the page began. Overlapping them makes it one gesture.

That is read off the shared ticker rather than from `timeupdate`, which fires
about four times a second — at 2× that is half a second of footage between
readings, against a lead of 0.4. A frame-accurate read of a number the ticker is
already awake for costs nothing. It carries beat 2′'s cue as well, so it
unsubscribes once both have fired rather than on the first.

`ended` stays attached underneath, and the other two paths exist because **the
interface must never fail to arrive** (ADR-0031): `ended` fires for none of a clip refused autoplay, a
clip stalled mid-decode, or a clip mounted again after it had already finished.

| Path | Covers |
|---|---|
| `ASSEMBLY_LEAD_S` on the ticker | the ordinary case |
| `ended` | a clip whose `duration` is `NaN` — a stream, a failed metadata load |
| `video.ended` checked on entry | a remount after the clip finished (Fast Refresh) |
| `error` | a clip that cannot decode at all |
| `ASSEMBLY_FALLBACK_MS` timer | autoplay refused, decode stalled, tab backgrounded |

The last three all go through `finish()`, which fires **both** cues — the
assembly *and* beat 2′ below. A clip that is not going to reach its own end has
no last frame to hand over from, so the still simply takes the frame; for an
`error` it is the only picture the section has.

The timer is **re-armed on `playing`**, not measured from the `play()` call. The
two are the same on a warm connection and are not on a cold one: a phone that
ignores `preload` and streams from the tap can spend seconds reaching its first
frame, and a deadline measured from the request would be counting down through a
clip that had not begun.

> [!warning] `done` is local to the effect run, not a ref
> Strict Mode mounts effects twice. A ref would survive the first cleanup and
> make the second run a no-op — which is the sequence never playing at all.

### Beat 2′ — the still takes the frame

The clip stops and holds its own last frame, and **that frame is then the
picture for the rest of the section** — while being the frame an encoder has the
least to give: the end of a four-second push-in, with nothing after it to
predict from. `public/assets/hero/hero-final-frame.jpg` is the same frame
upscaled and graded, 2560×1440, dissolved over the footage across `STILL_MS`
(520ms) the moment it stops. Next's optimiser serves it as AVIF — **148KB at
2560 wide** at `STILL_QUALITY`.

It is **the same frame**, not a similar one. The crop was solved against a
decode of the clip's last frame — a PSNR search over scale and offset, converging
on `crop=2800:1575+16+2` of the 2880×1600 upscale, then down to the clip's own
2560×1440. Measured on the running page, the two layers put the subject's
silhouette on the same pixels; what changes across the dissolve is detail and
nothing else. That is the whole requirement: the still and the video share one
box and one `object-cover`, so any disagreement about framing or aspect would
show up as the picture *jumping* at the handover.

| | Why |
|---|---|
| A dissolve, not a cut | the two are not the same bytes — a cut reads as the picture sharpening in one tick, a flicker with no cause. 520ms reads as the shot settling, and it runs while the mask is still opening. |
| Not a `poster` | same idea pointed the wrong way. A poster is what a video shows *before* it plays. |
| Gated on **both** `clipEnded` and `stillPainted` | started against an image the browser has not painted, the dissolve fades the footage out to a blank rectangle and brings the still in behind it. They arrive in either order. |
| Loaded **lazily** | it is in the viewport from mount, so the browser starts on it at once but behind the clip the preloader is actually waiting for. Arriving late costs a beat of the video's own last frame, not a flash of nothing. |
| Separate from `assemble` | the assembly deliberately starts `ASSEMBLY_LEAD_S` *before* the last frame, over footage still moving. Dissolving a still into a moving picture ghosts. |
| `aria-hidden`, `alt=""` | the `<video>` already names the shot for a screen reader. |

The ticker carries both cues now, so it only unsubscribes once both have fired.
Its reading of the last frame is guarded on `Number.isFinite`, where the
assembly's reading beside it deliberately is not: a `NaN` duration *fails* the
assembly comparison and so falls through to firing it, which is what that cue
wants — and is the opposite of what this one does. Unguarded, it would put the
still up before a frame had played.

> [!note] Reduced motion keeps the clip's **first** frame, and that is deliberate
> The sequence effect returns before it starts anything, so `clipEnded` never
> becomes true and the still never appears. That is right rather than merely
> convenient: the clip's first frame is a wide establishing shot and its last is
> an over-the-shoulder close. Swapping one for the other there would not be a
> change of quality, it would be a change of picture — chosen for the reader who
> asked to be shown no movement at all.

`clipEnded` is React state, so unlike the effect's own `let` bindings it survives
a cleanup. It is reset at the **top of every run**, next to `progress.set(0)` and
for the same reason: left standing it would hold the still over a clip about to
start again from frame 0.

### Beat 3 — the assembly

| Progress | What arrives |
|---|---|
| 0 → 0.30 | **the mask**, `scale` 0.62 → 1, alone |
| 0.30 → 0.885 | captions → titles → wordmark → nav → explore → destinations → switcher → thumbnails, 0.055 apart over 0.20 each |

**The card comes first now, and alone.** It used to be fifth: the chrome and the
headings arrived around an empty middle and the window then opened into a page
that was already assembled. The sequence reads the other way round — the lens
opens on the footage, and the interface gathers *around what it found*.
Everything after the card is text placed relative to that window, so all of it
waits for the window to be there to be placed relative to.

`uiStart` treats the card as the exception in both terms: it starts at 0, and the
stagger for everything else counts from *its* index rather than from the front of
the list.

> [!important] The master runs linearly and the easing is per group
> `groupEase` carries the smoothstep. Put it on the master spring instead and a
> group's local curve depends on where in the timeline it happens to sit — the
> first group would arrive slowly and the last would snap. Linear master +
> per-group curve means `uiStagger` is a real interval in milliseconds and every
> group gets the same shape.

> [!warning] The mask's scale has to be written by the ticker
> The card must carry exactly **one** transform: any wrapper with its own would
> become a backdrop root and clip what its `backdrop-filter` can sample. So the
> opening cannot live on a parent — `usePointerFollow` multiplies it into the
> same string as the follow, on the same frame:
> `translate3d(x, y, 0) scale(s)`. The follow is written first so the scale
> applies about the card's own centre wherever the pointer has taken it.

The captions are **their own group** now. They rode the card's while the card was
fifth and the whole interface arrived together; a caption is text *about* the
window and cannot arrive before there is a window for it to be about. They still
take the card's position vector, so the group cannot drift apart — only their
entry offset is their own.

### The tally lamp

A blinking dot in the window's top-left corner, 8px at 1440, on
`--foreground-signal` (`#ff3b30`). It is the one thing on the page that has to
read as a **signal** rather than as part of the composition, which is why it gets
a token of its own and deliberately not a `foreground-*` — those name the cream
the page is written in and must not be reachable by something looking for text
colour.

Two values multiplied: the `captions` group's arrival, so it turns on only once
the window has finished opening, and its own blink — `loop: { reverse: true }`
over `REC.pulseMs` (620ms), floored at `REC.dim` (0.18). It never goes fully out:
a dot that vanishes is a dot that has been removed; one that drops to 0.18 is the
same lamp, dark for a beat. `aria-hidden`, because a screen reader has no
viewfinder to be told is recording.

Paused under reduced motion, where a blinking indicator is precisely the kind of
repeating movement the preference is asking not to see.

### The grain

One `feTurbulence` tile as a data URI — a few hundred bytes instead of a request,
`stitchTiles` so it repeats seamlessly — **stepped** between 8 fixed offsets on a
loop rather than drifted smoothly. Grain that slides is dust on the lens; grain
that jumps is grain. The offsets are laid out on the golden angle (137.508°, the
same one block 2 spreads its card tilts on), so consecutive steps land as far
apart as the circle allows and eight of them never fall into a pattern the eye
can follow back.

`mix-blend-mode: overlay` at 0.3 rather than a flat alpha: overlay leaves the mid
tones alone and works into the shadows and highlights, which is where film grain
lives — over a dark veiled frame, a flat alpha would just turn the picture grey.

It sits **above the veil and below everything else**, which is deliberate: the
window's `backdrop-filter` samples it too, so the texture carries on *inside* the
viewfinder, brightened, instead of stopping at its edge.

Only the tile's `transform` animates, so the texture is generated once and the
animation costs a composited move.

### The display lines

**The two lines do not slide in from opposite edges — their letters do, and the
two sweeps are mirrors of each other.** Left line right-to-left, right line
left-to-right, so each runs outward from the middle of the screen towards its own
edge and the phrase opens from its centre. The block travel is gone (`from` is
empty): two movements on one element is one too many.

The beat is a **cue**, not a delay. It used to be
`uiStart("titles") × FLIGHT_MS` handed to `RevealTitle` as `startDelay`, which
was only correct while the timeline began at mount — and it no longer does: it
begins when a four-second video ends, and how long *that* takes depends on the
preloader, the network, and whether autoplay was allowed at all. A cue does not
care what happened before it. See
[[components/common#Reveal text — `ui/reveal-text.tsx`]].

## Tablet and mobile

Desktop (>1024) is untouched. The two ranges below it are laid out against the
grid's own base widths — 1024 and 360 — so everything inside a range scales by
itself. Positions live in `CLASS` in `hero.geometry.ts` as **literal class
strings** (the generator's scanner needs to see them) rather than inline styles,
because an inline style cannot be overridden by a media query.

Breakpoints are pinned to the grid: `max-lg:` is ≤1024, `max-md:` is ≤640.

| | Desktop | Tablet ≤1024 | Mobile ≤640 |
|---|---|---|---|
| Height | one viewport | one viewport | one viewport |
| Wordmark | 24px | 18px | 18px |
| Display type | 90px | 56px | 42px |
| Nav | four items, top-right | `MENU` disclosure | `MENU` disclosure |
| Switcher | bottom-left | top, centred | gone |
| Titles | flanking the card | one above it, one below | one above it, one below |
| Card | 500×315 | full width − margins, 315/500 kept | same |
| Destinations | list, bottom-right | list, bottom-left | label only, list hidden |
| Explore | top-right | bottom-right | bottom, centred, on the floor |
| Thumbnails | 227×132 | 11rem | gone |

**The two thumbnails part as the hero leaves.** One scroll-linked value — the
section's own `top top → bottom top` — takes the top one up by 9rem and the
bottom one down by the same, so the pair leaves as one gesture read in two
directions. Entry and exit share one transform string, because one element
carries one transform, and `direction` means the same thing at both ends: the
entry comes *from* that side and the exit leaves *towards* it.

Below the desktop base the heading is **split around the card** rather than
stacked above it — "Beyond Places." over the window, "Into Moments." under it,
each a 0.8×-of-its-own-type gap away from the caption row it faces. Stacking
both above left the bottom half of the screen empty and read as a caption to the
photograph rather than as the page's title.

### The phone's bottom edge

EXPLORE DESTINATIONS is the section's only call to action there, so it sits on
the floor of the first screen rather than floating above it:
`bottom: calc(24px + env(safe-area-inset-bottom))`, measured from the stage —
which is `min-h-viewport`, i.e. `100dvh`, the height actually visible. A bottom
offset inside a dynamic-height box is always that far above the real edge with
or without the address bar, so nothing can clip it. `100svh` would be the wrong
unit here: it would add the bar's height back as a gap every time the bar is
hidden, which is the opposite of pinning the control to the floor.

Its tap zone is 48px, grown with `padding-top` alone. The rule under the label
is the element's own bottom border and Figma draws a 6.5px gap above it, so
padding-bottom would detach the underline; padding-top is invisible because the
box is anchored by `bottom`.

Both thumbnails are hidden ≤640. At 6.5×4.4rem neither photograph reads, and
the pair was spending 152px of an 844px screen — the top one crowding the
wordmark row, the bottom one sitting exactly where the call to action belongs.
The `SLIDER / LIST` switcher goes with them: it is a control over the card, and
on a phone there is nowhere to put it that reads that way. In the top row it
became a third piece of chrome between the wordmark and MENU; parked under
"Beyond Places." it split the title from its own caption row. `UI_ORDER` still
lists the group — the element is simply not painted.

Both gaps between a heading and the caption row it faces are rungs on the
hero's own vertical ladder (24 · 34 · 46 · 5.5rem):

| | Gap | Offset that produces it |
|---|---|---|
| "Beyond Places." → `TRAVEL STORIES / JOURNAL` | 34 | −87 |
| `01. / REAL JOURNEYS / 42.` → "Into Moments." | 46 | +69 |

The pair is deliberately uneven. The upper gap separates a heading from the
caption *of the card below it*; the lower one separates a caption from the
heading *under it*, and that is where the phrase resumes — the larger break
belongs there. What is tuned is always the offset, never the gap: the gap is
picked off the ladder and the offset solved backwards through the line box.

The card's own caption gaps — 21 above, 12 below — are Figma's and are not on
this ladder. Nothing here touches them.

Two numbers on a phone are deliberately **px, not rem**: the display size and
the offsets that space it. The root font-size runs from 14.2 to 28.4 across the
≤640 range, so anything in rem that spaces fixed-px type comes out of proportion
at one end of it — that is what pulled the open `MENU` list apart at 390 while
looking right at 768.

The arrangement follows [jasonbergh.com](https://www.jasonbergh.com), which the
design derives from — it carries the same `SLIDER / LIST` switcher, cream serif
on dark, and edge-bled thumbnails. Two things measured off it drove the numbers:
display type is **not** scaled proportionally (it holds ~11% of the screen
width on a phone against 6.25% on desktop, i.e. relatively *larger*), and small
UI type does not scale at all. The reference has no scroll-driven hero — it is a
fixed viewport, which is what this section is too: the sequence plays on a clock
rather than on the scrollbar.

> [!note] Why the card cannot be centred with a transform
> `usePointerFollow` owns the card's `transform`. Its small-screen height is
> therefore `calc((100vw-3rem)*0.63)` and its top `calc(50%-(100vw-3rem)*0.315)`
> — half that height — which centres it without one.

## The card follows the pointer, and does not turn

**The tilt is gone.** The card used to take a rotation off its own velocity — up
to `maxTilt` degrees, eased in and out with the inertia — and on a window into a
photograph that reads as the window itself being crooked rather than as the view
moving. The lean belongs to block 5's plates, where what turns is a photograph
and not a frame; here the card is a hole in the scrim, and a hole has no business
rotating. `TILT_AT_SPEED` and the `maxTilt` knob are gone with it.

**There is a crosshair at its centre.** The card is a viewfinder, and a
viewfinder has a mark. Two hairlines rather than a glyph, so it is the same
thickness at every size and owes nothing to a font; cream at 40%, because a mark
that competes with the photograph is a mark in the way. It is a *child* of the
card, which is safe — what a `backdrop-filter` element must not have is an
**ancestor** carrying its own transform.

## How the card follows the pointer

The card drifts after the cursor with inertia, and reads as a window being
wiped clear rather than a floating picture. `use-pointer-follow.ts`.

| | Value |
|---|---|
| Card lerp | 0.08 — the captions share it, see below |
| Tilt | ±2°, from the card's own velocity, eased at 0.1 |
| Return to centre | 800ms, `easeOutCubic`, on `pointerleave` |
| Clamp | card stays fully inside the pinned stage |
| Off when | `(hover: hover) and (pointer: fine)` fails, or reduced motion |

The pointer handler only records coordinates. All arithmetic runs once per frame
on the shared ticker, and transforms are written straight to the DOM — following
costs zero React re-renders.

> [!important] The card and its captions share one position vector
> They each used to hold their own, on their own lerp, with a leash bounding how
> far apart they could get. A single vector makes drift **impossible by
> construction** rather than bounded after the fact: same number, same frame.
> Measured over 26 frames of a fast pointer sweep, the horizontal difference
> between the card and either caption is exactly 0.
>
> Only the tilt stays on the card — rotating the labels was never in the design.

> [!important] Why there is no registration maths
> The card holds no copy of the photo, so nothing has to be kept in phase with
> anything. `backdrop-filter` resamples whatever is painted behind the element
> at its **current position**, every frame — move the frame and the view
> through it changes by itself. `background-attachment: fixed` would register to
> the viewport (wrong: the landscape is 114.2% wide, offset −72.75px, and
> *scaled* by the timeline), and `background-position` compensation would need
> re-deriving on resize, on every progress frame, and on font-size change.
>
> **On resize, nothing happens.** The only thing re-measured is the clamp
> rectangle, debounced 150ms.

### Interaction

Every control is inert until its group has all but arrived: `Reveal` takes an
`interactive` flag that holds `pointer-events: none` until the group's reveal
passes 0.9. Before that the chrome is transparent, and a transparent link that
still takes the pointer is a trap.

| Control | State |
|---|---|
| Nav links | a 1px cream rule wipes in from the left on hover and focus |
| EXPLORE | the arrow travels a full 12px left→right and a second one arrives behind it — a spring, see below |
| Destination list | muted → full cream on hover and focus, and they are links |
| SLIDER / LIST | real `<button>`s with `aria-pressed`; the active one is cream |

> [!note] The EXPLORE arrow is the one that is not a CSS transition
> It is a 12px window over a 24px track holding **two** arrows. At rest the
> track sits at −50%, showing the second; on hover it springs to 0, carrying
> that one out past the right edge while the first arrives from the left.
> Two glyphs rather than one is what makes the movement read in a single
> direction — one arrow sliding right would have to slide back.
>
> A real transform over a real distance, driven from a different element, so it
> is `<Hover trigger={…}>` and a spring rather than a CSS transition — the line
> ADR-0014 draws. Measured: −12 → −9.5 → −6.1 → −3.4 → −1.6 → −0.6 → 0 with a
> 0.08px overshoot, and the same in reverse on leave.
>
> `<Hover>` disables itself at ≤768px wide (`springsConfig.disableOnMobile.hover`
> is always on), which is correct — there is no hover to have there.

The rest are colour, opacity or underline changes on token-backed timing
(`duration-[var(--duration-fast)] ease-entrance`), which is exactly the narrow
set ADR-0014 allows CSS transitions for — the arrow nudge is that ADR's own
worked example. Nothing here needs a spring. Focus is a 2px cream outline offset
4px, enough to stay legible over a photograph.

### The wordmark and the nav are the site's header

They are drawn in the hero's frame and they belong to it, but there is no second
header anywhere on the page — so the pair the flight reveals **is** the one the
reader keeps. `CLASS.wordmark` and `CLASS.nav` are `fixed z-50`; nothing else
changes. The coordinates are the same (the hero is full-bleed from x 0, so the
viewport and the section agree on every edge), the flight's own reveal still
plays on them, and no markup moves. `explore`, the switcher and the destinations
group stay `absolute`: they are hero content, not chrome.

**`z-50` and the number matters.** Block 2 sits at `z-10` so block 3 can be
pulled underneath it ([[destinations]]), and a fixed element with no z-index
would lose to it and slide behind the polaroids. The hero's own ancestors create
no stacking context — `relative` with no z-index — so this competes at the root.

> [!note] `overflow: hidden` on the stage does not clip them
> A fixed box is clipped by an ancestor's overflow only where that ancestor is
> also its containing block, which takes a `transform`, a `filter` or
> `will-change` **on that ancestor**. The stage has none — its animated layers
> are its children, not itself — so the chrome escapes the hero.

At the bottom of the page the pair fades out: the footer prints the same wordmark
and the same four links as its own content, so a fixed copy over them is
duplication. `Reveal` takes an optional `gate` — a second 0→1 multiplied into the
group's opacity and its pointer events, but deliberately **not** into its
transform, so the chrome fades where it is instead of retracing its entry. The
flag comes from [[components/common#Site chrome — `site-chrome/`]]. ADR-0023.

### Paint order

Bottom to top: footage → **closing still** → veil → vignette → grain →
**card window** → card captions → display headings → chrome (wordmark, nav,
explore, destinations, switcher).

The still sits directly on the video and **under** the veil, so everything that
was grading the footage goes on grading it, and the window's `backdrop-filter`
undoes the same 50% scrim it always did.

The headings sit **above** the card deliberately: `#ffedc3` is brand identity,
and a card painted over them would drag them through the window's brightness and
saturation filter and wash the cream out to white. Below the headings, the card
never touches them, and they stay crisp and their own colour.

### Tuning

All five numbers live in `hero.tuning.ts` and are read at module load, so
changing one there is the whole edit. They were dialled in on a temporary
`?debug=1` slider panel, which has been signed off and removed — if another
round is ever needed, the panel is in the history at `hero-debug-panel.tsx`.

## Things worth knowing

> [!important] The zoom origin is not the centre of the lens
> It is `28.839% 40.529%` — the fixed point of the frame-1 → frame-2 transform,
> solved from Figma's two crops. The lens's *visual* centre is roughly
> `42.6% 47.1%`, and using it would miss frame 2's crop. `50% 50%` is wrong by a
> mile. Full derivation: [[decisions-log]] ADR-0020.

> [!note] The centre card is a hole, not a copy
> Figma draws it as a second instance of the background photo at identical scale
> and offset — i.e. the same pixels without the 50% scrim. Rather than keep a
> registered second copy through the zoom, the card is
> `backdrop-filter: brightness(1 / (1 − 0.5·scrim))`, which restores the
> original pixels exactly and stays registered for free at any scale.

> [!warning] `overflow-x: hidden` on `body` breaks the pin
> It turns the body into a scroll container, which kills `position: sticky`.
> Use `overflow-x: clip`.

Reduced motion: the pin is removed and frame 3 renders immediately, driven by a
`SpringValue` parked at 1.

## Known gaps

- The frames 1–2 composite is **1536×854**, displayed at 2827px at frame 2 — a
  1.84× upscale. A ≥3000px source is the highest-value asset fix outstanding.
- Frame 3 uses a **different photograph** from frames 1–2, so the cross-dissolve
  is unavoidable rather than chosen.

> [!done] ~~Reduced motion held the preloader for its full 8s timeout~~ — fixed
> by the move to video
> The preloader counts the hero in by looking for elements whose source matches
> each name in `CRITICAL_MEDIA`. It used to be two photographs, and under
> `prefers-reduced-motion` the hero rendered the first of them **not at all** —
> the composite sat behind `{!staticFrame && …}`, because there was no
> fly-through to show it in. So the count stopped at one of two, `ready` never
> turned true, and the card sat there until the 8000ms timeout released it: a
> reader who asked for *less* motion waited the longest.
>
> The list is one entry now — the clip — and the `<video>` element is rendered
> unconditionally, because a still first frame is what reduced motion should be
> shown rather than nothing. There is no branch left for the count to fall
> through. `use-media-ready` grew a video arm to go with it: `readyState >= 3`
> (`HAVE_FUTURE_DATA`) rather than a `load` event, so the card lifts when the
> clip can be *played*, not when 8.9MB has arrived.
>
> Found 2026-08-13, fixed 2026-08-21.


## Related

[[animation-system]] · [[design-system]] · [[smooth-scroll]] · [[decisions-log]]
