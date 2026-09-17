import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { TOWER } from "@/data/content";
import { Reveal } from "@/components/reveal";
import { REDUCED, clamp, damp, lerp, onFrame, trackProgress } from "@/lib/scroll";

/* ══════════════════════════════════════════════════════════════════════════
   La tour — depth you can read.

   A cut-out of the tower (alpha-matted, so its silhouette is real) is carried
   on a plane in a transparent WebGL canvas. UNDER that canvas, in the DOM, the
   wordmark travels across the screen — so it passes BEHIND the building and
   comes out the other side. Cloud sprites drift in FRONT of the tower on a
   nearer plane.

   The word stays real text — not a canvas texture — so it keeps Gilda's
   contrast, stays selectable and is read aloud by a screen reader. The canvas
   only ever holds what has to occlude it.

   Three depths, three rates: clouds (nearest) > tower > word (furthest). That
   ratio is the whole illusion; the pointer adds a small camera offset on top.
   ══════════════════════════════════════════════════════════════════════════ */

const TOWER_SRC = "/assets/tower.png";
const CLOUD_SRC = "/assets/cloud.png";

export function TowerParallax() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const word = useRef<HTMLParagraphElement>(null);
  const [copyIn, setCopyIn] = useState(false);

  useEffect(() => {
    const host = section.current;
    const cv = canvas.current;
    if (!host || !cv) return;

    const renderer = new THREE.WebGLRenderer({
      canvas: cv,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearAlpha(0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.z = 10;

    const loader = new THREE.TextureLoader();
    const tower = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false })
    );
    tower.position.z = 0;
    scene.add(tower);

    /* The cloud plates are shot on black, so ADDITIVE blending is the matte:
       black contributes nothing and the vapour lights the frame. No alpha
       channel needed, and no cut-out edge to give itself away. */
    const clouds: THREE.Mesh[] = [];
    for (let i = 0; i < 2; i++) {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          opacity: i === 0 ? 0.5 : 0.34,
        })
      );
      m.position.z = i === 0 ? 3.4 : 5.2;
      scene.add(m);
      clouds.push(m);
    }

    let towerAspect = 752 / 1344;
    loader.load(TOWER_SRC, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      (tower.material as THREE.MeshBasicMaterial).map = tex;
      (tower.material as THREE.MeshBasicMaterial).needsUpdate = true;
      towerAspect = tex.image.width / tex.image.height;
      layout();
    });

    loader.load(CLOUD_SRC, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      for (const c of clouds) {
        (c.material as THREE.MeshBasicMaterial).map = tex;
        (c.material as THREE.MeshBasicMaterial).needsUpdate = true;
      }
    });

    /** World height visible at a given depth, for the current camera. */
    const heightAt = (z: number) =>
      2 * Math.tan((camera.fov * Math.PI) / 360) * (camera.position.z - z);

    function layout() {
      const w = host!.clientWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      // The tower stands 78% of the frame height — tall enough to cut the word
      // in two, short enough to keep sky above its crown.
      const th = heightAt(tower.position.z) * 0.78;
      tower.scale.set(th * towerAspect, th, 1);

      for (const c of clouds) {
        const ch = heightAt(c.position.z);
        c.scale.set(ch * 2.6, ch * 0.62, 1);
      }
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
        setCopyIn((prev) => prev || e.intersectionRatio > 0.45);
      },
      { threshold: [0, 0.45] }
    );
    io.observe(host);

    const pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (!REDUCED) window.addEventListener("pointermove", onPointer, { passive: true });

    const state = { p: 0, camX: 0, camY: 0 };

    const stop = onFrame(({ time, delta }) => {
      if (!visible) return;

      state.p = damp(state.p, trackProgress(host!), 4.2, delta);
      const p = state.p;

      // The word travels a full screen-width and a half across the stage; the
      // tower answers with a sixth of that, so the two separate in depth.
      if (word.current) {
        const travel = REDUCED ? 0 : lerp(62, -62, p);
        word.current.style.transform = `translate3d(${travel}vw,0,0)`;
      }

      tower.position.x = REDUCED ? 0 : lerp(-0.45, 0.45, p);
      tower.position.y = REDUCED ? 0 : lerp(-0.55, 0.35, p);

      if (!REDUCED) {
        const t = time / 1000;
        clouds[0].position.x = lerp(-2.2, 2.6, p) + Math.sin(t * 0.06) * 0.4;
        clouds[0].position.y = -1.4 + Math.sin(t * 0.09) * 0.16;
        clouds[1].position.x = lerp(3.4, -4.2, p) + Math.cos(t * 0.05) * 0.5;
        clouds[1].position.y = 1.9 + Math.cos(t * 0.07) * 0.2;
      }

      // Pointer offset: damped on the camera, never on the objects, so the
      // whole stack shifts as one parallax instead of sliding apart.
      state.camX = damp(state.camX, pointer.x * 0.42, 2.6, delta);
      state.camY = damp(state.camY, -pointer.y * 0.26, 2.6, delta);
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
    <section
      ref={section}
      id="tour"
      className="o-relative"
      style={{ height: "240vh" }}
    >
      <div className="o-sticky o-top-0 h-dvh o-overflow-hidden bg-ground">
        {/* The wordmark, in the DOM, UNDER the canvas — the tower occludes it. */}
        <p
          ref={word}
          aria-label={TOWER.behind}
          className="display o-pointer-events-none o-absolute o-left-1/2 o-top-1/2 o-z-0 -translate-x-1/2 -translate-y-1/2 o-whitespace-nowrap al-fs-26vw leading-none text-ink-strong o-will-change-transform"
        >
          {TOWER.behind}
        </p>

        <canvas
          ref={canvas}
          className="o-absolute o-inset-0 o-z-10 o-h-full o-w-full"
          aria-hidden
        />

        {/* Copy sits on the base, on glass, clear of the tower's silhouette. */}
        <div className="o-absolute o-inset-x-0 o-bottom-0 o-z-20 al-gouttiere al-pb-bas">
          <div className="glass al-mw-38 al-pilule o-border-w-1 border-line o-p-8">
            <Reveal as="p" className="label o-block" text={TOWER.eyebrow} show={copyIn} stagger={30} />
            <Reveal
              as="h2"
              className="display o-mt-5 al-fs-t3"
              text={TOWER.title}
              show={copyIn}
              stagger={75}
              delay={140}
            />
            <Reveal
              as="p"
              className="o-mt-5 al-mw-46ch al-fs-95 o-leading-relaxed text-ink-muted"
              text={TOWER.body}
              show={copyIn}
              stagger={22}
              delay={140 + TOWER.title.split(" ").length * 75 + 90}
            />
            <dl className="o-mt-8 o-flex o-flex-wrap o-gap-x-10 o-gap-y-4 o-border-t border-line o-pt-6">
              {TOWER.metrics.map((m) => (
                <div key={m.label}>
                  <dt className="display al-fs-160">{m.value}</dt>
                  <dd className="label o-mt-1">{m.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
