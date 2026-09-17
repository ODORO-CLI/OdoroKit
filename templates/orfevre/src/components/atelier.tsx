import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { ATELIER } from "@/data/content";
import { Reveal } from "@/components/reveal";
import { REDUCED, clamp, damp, lerp, onFrame, trackProgress } from "@/lib/scroll";

/* ══════════════════════════════════════════════════════════════════════════
   L'atelier — depth you can read.

   A cut-out of the hand (alpha-matted, so its silhouette is real, rings and
   all) is carried on a plane in a transparent WebGL canvas. UNDER that canvas,
   in the DOM, the wordmark travels across the screen — so it passes BEHIND the
   hand and comes out the other side.

   The word stays real text, not a canvas texture, so it keeps Caslon's
   thick-thins, stays selectable and is read aloud by a screen reader. The
   canvas only ever holds what has to occlude it.

   On a white-on-white page the usual depth cues are gone: no shadow, no dark
   ground, nothing to cast onto. Occlusion and differential speed are the only
   ones left, which is exactly what this section is made of.
   ══════════════════════════════════════════════════════════════════════════ */

const HAND_SRC = "/assets/hand.png";

export function Atelier() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const word = useRef<HTMLParagraphElement>(null);
  const [copyIn, setCopyIn] = useState(false);

  useEffect(() => {
    const host = section.current;
    const cv = canvas.current;
    if (!host || !cv) return;

    const renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearAlpha(0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.z = 10;

    const hand = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false })
    );
    scene.add(hand);

    let aspect = 752 / 1344;
    new THREE.TextureLoader().load(HAND_SRC, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const m = hand.material as THREE.MeshBasicMaterial;
      m.map = tex;
      m.needsUpdate = true;
      aspect = tex.image.width / tex.image.height;
      layout();
    });

    const heightAt = (z: number) =>
      2 * Math.tan((camera.fov * Math.PI) / 360) * (camera.position.z - z);

    function layout() {
      const w = host!.clientWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // The hand stands 86% of the frame height — tall enough to cut the word
      // in two, short enough to keep air above the fingertips.
      const hh = heightAt(0) * 0.86;
      hand.scale.set(hh * aspect, hh, 1);
    }

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(host);

    /* Only draw while the section is on screen: a WebGL loop running under a
       page the reader has already left is pure battery. */
    let visible = false;
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        setCopyIn((prev) => prev || e.intersectionRatio > 0.4);
      },
      { threshold: [0, 0.4] }
    );
    io.observe(host);

    const pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (!REDUCED) window.addEventListener("pointermove", onPointer, { passive: true });

    const state = { p: 0, camX: 0, camY: 0 };

    const stop = onFrame(({ delta }) => {
      if (!visible) return;

      state.p = damp(state.p, trackProgress(host!), 4.2, delta);
      const p = state.p;

      // The word crosses a screen and a half; the hand answers with a tenth of
      // that, so the two separate in depth instead of travelling together.
      if (word.current) {
        word.current.style.transform = `translate3d(${REDUCED ? 0 : lerp(58, -58, p)}vw,0,0)`;
      }
      hand.position.x = REDUCED ? 0 : lerp(-0.35, 0.35, p);
      hand.position.y = REDUCED ? 0 : lerp(-0.7, 0.5, p);

      // Pointer offset on the CAMERA, never on the objects, so the whole stack
      // shifts as one parallax instead of sliding apart.
      state.camX = damp(state.camX, pointer.x * 0.34, 2.6, delta);
      state.camY = damp(state.camY, -pointer.y * 0.2, 2.6, delta);
      camera.position.x = state.camX;
      camera.position.y = state.camY;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    });

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const m = o.material as THREE.MeshBasicMaterial;
          m.map?.dispose();
          m.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <section ref={section} id="atelier" className="o-relative" style={{ height: "240vh" }}>
      <div className="o-sticky o-top-0 h-dvh o-overflow-hidden o-border-t border-line bg-ground">
        {/* The wordmark, in the DOM, UNDER the canvas — the hand occludes it. */}
        <p
          ref={word}
          aria-label={ATELIER.behind}
          className="display o-pointer-events-none o-absolute o-left-1/2 o-top-1/2 o-z-0 -translate-x-1/2 -translate-y-1/2 o-whitespace-nowrap or-fs-27vw leading-none text-ink o-will-change-transform"
        >
          {ATELIER.behind}
        </p>

        <canvas ref={canvas} className="o-absolute o-inset-0 o-z-10 o-h-full o-w-full" aria-hidden />

        {/* Copy on glass, clear of the hand's silhouette. */}
        <div className="o-absolute o-inset-x-0 o-bottom-0 o-z-20 or-gouttiere or-pb-bas">
          <div className="glass or-mw-38 o-rounded-lg o-border-w-1 border-line o-p-8">
            <Reveal as="p" className="label o-block text-ink-muted" text={ATELIER.eyebrow} show={copyIn} stagger={30} />
            <Reveal
              as="h2"
              className="display o-mt-5 or-fs-t3"
              text={ATELIER.title}
              show={copyIn}
              stagger={75}
              delay={140}
            />
            <Reveal
              as="p"
              className="o-mt-5 or-mw-46ch or-fs-95 o-leading-relaxed text-ink-muted"
              text={ATELIER.body}
              show={copyIn}
              stagger={22}
              delay={140 + ATELIER.title.split(" ").length * 75 + 90}
            />
            <dl className="o-mt-8 o-flex o-flex-wrap o-gap-x-10 o-gap-y-4 o-border-t border-line o-pt-6">
              {ATELIER.metrics.map((m) => (
                <div key={m.label}>
                  <dt className="display or-fs-160">{m.value}</dt>
                  <dd className="label o-mt-1 text-ink-muted">{m.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
