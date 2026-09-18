import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { GARAGE } from "@/data/content";
import { Reveal } from "@/components/reveal";
import { REDUCED, clamp, damp, lerp, onFrame, trackProgress } from "@/lib/scroll";

/* ══════════════════════════════════════════════════════════════════════════
   Le garage — depth you can read.

   A cut-out of the car (alpha-matted, so the silhouette is real down to the
   wing and the wheel arches) is carried on a plane in a transparent WebGL
   canvas. UNDER that canvas, in the DOM, the wordmark travels across the
   screen — so it passes BEHIND the car and comes out the other side.

   The word stays real text, not a canvas texture: it keeps its tracking, stays
   selectable and is read aloud by a screen reader. The canvas only ever holds
   what has to occlude it.

   The car also drifts along the Style's one axis (−18°, up to the right)
   rather than straight across — every gesture in this system travels on that
   line, and a parallax that ignores it reads as borrowed from another page.
   ══════════════════════════════════════════════════════════════════════════ */

const CAR_SRC = "/assets/car-cutout.png";
const AXIS = (-18 * Math.PI) / 180;

export function Garage() {
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
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.z = 10;

    const car = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false })
    );
    scene.add(car);

    let aspect = 1344 / 752;
    new THREE.TextureLoader().load(CAR_SRC, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const m = car.material as THREE.MeshBasicMaterial;
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
      // The car spans 78% of the frame WIDTH — it is a wide object, so it is
      // fitted to the width and the height follows, or it overflows the stage
      // on a laptop.
      const cw = heightAt(0) * camera.aspect * 0.78;
      car.scale.set(cw, cw / aspect, 1);
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

      // The word crosses a screen and a half; the car answers with a fraction
      // of that, on the house axis, so the two separate in depth.
      if (word.current) {
        word.current.style.transform = `translate3d(${REDUCED ? 0 : lerp(58, -58, p)}vw,0,0)`;
      }
      const travel = REDUCED ? 0 : lerp(-0.5, 0.5, p);
      car.position.x = travel * Math.cos(AXIS);
      car.position.y = travel * Math.sin(AXIS) - 0.1;

      // Pointer offset on the CAMERA, never on the objects, so the whole stack
      // shifts as one parallax instead of sliding apart.
      state.camX = damp(state.camX, pointer.x * 0.3, 2.6, delta);
      state.camY = damp(state.camY, -pointer.y * 0.18, 2.6, delta);
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
    <section ref={section} id="garage" className="o-relative" style={{ height: "240vh" }}>
      <div className="o-sticky o-top-0 nc-h-dvh o-overflow-hidden nc-bg-cover">
        {/* The wordmark, in the DOM, UNDER the canvas — the car occludes it. */}
        <p
          ref={word}
          aria-label={GARAGE.behind}
          className="display o-pointer-events-none o-absolute o-left-1/2 o-top-1/2 o-z-0 nc--translate-x-1-2 nc--translate-y-1-2 o-whitespace-nowrap nc-text-26vw nc-leading-none nc-text-ink o-will-change-transform"
        >
          {GARAGE.behind}
        </p>

        <canvas ref={canvas} className="o-absolute o-inset-0 o-z-10 o-h-full o-w-full" aria-hidden />

        {/* Copy on the base, clear of the car's silhouette. No card: the Style
            has no page surface, so the scrim under it does the holding. */}
        <div className="o-absolute o-inset-x-0 o-bottom-0 o-z-20 nc-px-max-1-25rem-3vw nc-pb-max-2rem-5vh">
          <div
            className="o-pointer-events-none o-absolute o-inset-x-0 o-bottom-0 nc-h-70"
            style={{ background: "linear-gradient(to top, rgb(0 0 0 / 0.85), transparent)" }}
          />
          <div className="o-relative nc-max-w-38rem">
            <Reveal as="p" className="label o-block nc-text-ink-muted" text={GARAGE.eyebrow} show={copyIn} stagger={30} />
            <Reveal
              as="h2"
              className="display o-mt-5 nc-text-clamp-1-8rem-3vw-2-8rem"
              text={GARAGE.title}
              show={copyIn}
              stagger={70}
              delay={140}
            />
            <Reveal
              as="p"
              className="o-mt-5 nc-max-w-48ch nc-text-0-95rem o-leading-relaxed nc-text-ink-muted"
              text={GARAGE.body}
              show={copyIn}
              stagger={20}
              delay={140 + GARAGE.title.split(" ").length * 70 + 90}
            />
            <dl className="o-mt-8 o-flex o-flex-wrap o-gap-x-12 o-gap-y-4">
              {GARAGE.metrics.map((m) => (
                <div key={m.label}>
                  <span className="hairline o-mb-3 o-block o-w-12" />
                  <dt className="display nc-text-1-6rem">{m.value}</dt>
                  <dd className="label o-mt-2 nc-text-ink-muted">{m.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
