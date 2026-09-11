import * as THREE from "three";

import { layers } from "../constants";
import { deviceTier, viewScale } from "@/lib/scene/device";
import { getMouseCoords, hasPointer } from "@/lib/scene/mouse";
import { Lerp } from "@/lib/scene/easing";
import { color } from "@/lib/scene/palette";
import { useSceneConfig, type LogoConfig } from "@/lib/scene/scene-config";
import { markPath } from "@/lib/brand/odoro-mark";

/**
 * The ODORO mark, assembled from particles — inside the main scene (not a
 * separate canvas), riding a fixed distance in front of the camera so its size is
 * constant while the dive flies right into it. It shares the one starfield,
 * camera and bloom: one continuous scene.
 *
 * Two bands, tagged `aTri` (ADR-0045): the mark itself (0) — the ring with the
 * square corner, held STILL because its orientation is its identity — and a thin
 * orbit (1) that spins clockwise around it, exactly like the hero emblem. Once
 * assembled the motes keep a gentle continuous flow, and a loose cloud of
 * background motes drifts chaotically behind the mark, fading in with it. Motes
 * fly IN from the frame edges to build it.
 */

/**
 * The raster box: 140 units, with the ODORO mark (diameter 100) centred in it and
 * a thin full-circle orbit at r 64–65.5 around it. `markSize` in `scene-config.ts`
 * maps the box width to scene units, so 14 keeps the mark 10 units across.
 */
const ICON_VB_W = 140;
const ICON_VB_H = 140;
const MARK_INSET = (ICON_VB_W - 100) / 2;
/** The mark — the ring with the square corner (`evenodd`), from the brand source. */
const MARK_PATH = markPath(100);
/**
 * A thin full-circle orbit around the mark. Rotation-invariant by construction,
 * so spinning it reads as particle FLOW around the mark, never as the brand
 * turning.
 */
const ORBIT_PATH =
  "M6 70a64 64 0 1 0 128 0a64 64 0 1 0 -128 0Z M7.5 70a62.5 62.5 0 1 0 125 0a62.5 62.5 0 1 0 -125 0Z";
/** One particle in every ORBIT_EVERY goes to the orbit; the rest build the mark. */
const ORBIT_EVERY = 6;

const MAX_COUNT = 24000;
/** How far in front of the camera the mark rides (fixes its on-screen size). */
const FRONT_DISTANCE = 10;
/** Chaotic-drift background motes, per tier. */
const BG_COUNT = { desktop: 1400, tablet: 800, mobile: 240 } as const;

/**
 * Tier multiplier on the foreground mark's particle count. The mark holds a fixed
 * on-screen size (`FRONT_DISTANCE`), so the same count packs into a much smaller area
 * on a phone — the additive sprites pile into a solid white blob instead of reading as
 * the mark's outline. Mobile is cut hard so the shape stays legible. ADR-0043.
 */
const COUNT_SCALE = { desktop: 1, tablet: 0.7, mobile: 0.38 } as const;

/**
 * Tier multiplier on the mark's point size. On a phone the mark fills a large
 * fraction of a narrow viewport, so full-size sprites read as a thick, chunky
 * outline; halving them keeps the twin-triangle line fine and crisp. Applied on top
 * of the dev-tunable `pointSize` and the height-based `viewScale`.
 */
const MARK_SIZE_SCALE = { desktop: 1, tablet: 1, mobile: 0.5 } as const;

class LogoMark {
  private readonly group: THREE.Group;
  private readonly points: THREE.Points;
  private material: THREE.ShaderMaterial;
  private geometry: THREE.BufferGeometry;
  private readonly bgPoints: THREE.Points;
  private readonly bgMaterial: THREE.ShaderMaterial;
  /** Per-tier point-size factor, resolved once (a device never changes tier). */
  private readonly markSizeScale = MARK_SIZE_SCALE[deviceTier()];
  private readonly forward = new THREE.Vector3();
  private rotX = 0;
  private rotY = 0;

  constructor(scene: THREE.Scene) {
    this.material = this.buildMaterial();
    this.geometry = this.buildGeometry(this.config());
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.points.layers.set(layers.ENTIRE_SCENE);

    const bg = this.buildBackground();
    this.bgMaterial = bg.material;
    this.bgPoints = new THREE.Points(bg.geometry, bg.material);
    this.bgPoints.frustumCulled = false;
    this.bgPoints.layers.set(layers.ENTIRE_SCENE);

    this.group = new THREE.Group();
    this.group.add(this.bgPoints);
    this.group.add(this.points);
    scene.add(this.group);
  }

  private config(): LogoConfig {
    return useSceneConfig.getState().logo;
  }

  /* ---------------------------------------------------------------- geometry */

  private buildGeometry(c: LogoConfig): THREE.BufferGeometry {
    const n = Math.min(
      MAX_COUNT,
      Math.max(200, Math.round(c.count * COUNT_SCALE[deviceTier()])),
    );
    const start = new Float32Array(n * 3);
    const target = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    const size = new Float32Array(n);
    const tri = new Float32Array(n);

    for (let i = 0; i < n; i++) {
      // Start out at the edges of the frame — a wide ring in the billboard's own
      // (screen-facing) plane — and fly IN to the mark. `spread*` is that radius.
      const r = c.spreadMin + Math.random() * c.spreadSpan;
      const theta = Math.random() * Math.PI * 2;
      start[i * 3] = Math.cos(theta) * r;
      start[i * 3 + 1] = Math.sin(theta) * r;
      start[i * 3 + 2] = (Math.random() - 0.5) * 3;
      seed[i] = Math.random();
      size[i] = 0.5 + Math.random() * Math.random() * 1.7;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(start, 3));
    geometry.setAttribute("aTarget", new THREE.BufferAttribute(target, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geometry.setAttribute("aTri", new THREE.BufferAttribute(tri, 1));
    this.sampleTargets(geometry, n, c);
    return geometry;
  }

  /** Rasterise the mark and the orbit on their own, tag particles, and scatter their targets. */
  private sampleTargets(
    geometry: THREE.BufferGeometry,
    n: number,
    c: LogoConfig,
  ): void {
    const scale = 4;
    const w = Math.round(ICON_VB_W * scale);
    const h = Math.round(ICON_VB_H * scale);

    const raster = (path: string, inset: number): number[] => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return [];
      ctx.scale(scale, scale);
      ctx.translate(inset, inset);
      ctx.fillStyle = "#fff";
      ctx.fill(new Path2D(path), "evenodd");
      const data = ctx.getImageData(0, 0, w, h).data;
      const list: number[] = [];
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 40) list.push((i - 3) / 4);
      }
      return list;
    };

    const mark = raster(MARK_PATH, MARK_INSET);
    const orbit = raster(ORBIT_PATH, 0);
    if (mark.length === 0 || orbit.length === 0) return;

    const target = geometry.getAttribute("aTarget") as THREE.BufferAttribute;
    const tri = geometry.getAttribute("aTri") as THREE.BufferAttribute;
    const arr = target.array as Float32Array;
    const triArr = tri.array as Float32Array;

    for (let i = 0; i < n; i++) {
      const useMark = i % ORBIT_EVERY !== 0; // most motes build the mark
      const list = useMark ? mark : orbit;
      triArr[i] = useMark ? 0 : 1;
      const pixel = list[(Math.random() * list.length) | 0];
      const px = pixel % w;
      const py = (pixel / w) | 0;
      arr[i * 3] = (px / w - 0.5) * c.markSize;
      arr[i * 3 + 1] = -(py / h - 0.5) * c.markSize;
      arr[i * 3 + 2] = (Math.random() - 0.5) * c.thickness;
    }
    target.needsUpdate = true;
    tri.needsUpdate = true;
  }

  rebuild(): void {
    const geometry = this.buildGeometry(this.config());
    this.points.geometry = geometry;
    this.geometry.dispose();
    this.geometry = geometry;
  }

  /* --------------------------------------------------------------- materials */

  private buildMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uAlpha: { value: 0 },
        uPointScale: { value: 1 },
        uViewScale: { value: 1 },
        uColorA: { value: new THREE.Color("#f97316") },
        uColorB: { value: new THREE.Color("#ffd1a6") },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aTarget; attribute float aSeed; attribute float aSize; attribute float aTri;
        uniform float uProgress; uniform float uTime; uniform float uAlpha; uniform float uPointScale; uniform float uViewScale;
        uniform vec3 uColorA; uniform vec3 uColorB;
        varying vec3 vCol; varying float vB;
        #define TAU 6.2831853
        void main() {
          float e = smoothstep(0.0, 1.0, clamp(uProgress * 1.35 - aSeed * 0.35, 0.0, 1.0));

          // The mark (aTri 0) holds still — its square corner is its identity —
          // while the orbit (aTri 1) spins clockwise about the centre, exactly
          // like the hero emblem. Same rotation path as the source; only the
          // mark's rate is zero (ADR-0045).
          float speed = (aTri < 0.5) ? 0.0 : 0.70;
          float a = uTime * speed;
          float cs = cos(a), sn = sin(a);
          vec3 tgt = aTarget;
          tgt.xy = mat2(cs, -sn, sn, cs) * aTarget.xy;

          vec3 p = mix(position, tgt, e);

          // A continuous flow once assembled, and a wider drift while flying in.
          float idle = e;
          p.x += sin(uTime * 0.9 + aSeed * TAU) * 0.12 * idle;
          p.y += cos(uTime * 0.8 + aSeed * TAU * 1.3) * 0.12 * idle;
          p.z += sin(uTime * 0.7 + aSeed * 30.0) * 0.10 * idle;
          float drift = (1.0 - e) * 0.5;
          p.x += sin(uTime * 0.6 + aSeed * TAU) * drift;
          p.y += cos(uTime * 0.55 + aSeed * TAU) * drift;

          float g = clamp(aTarget.x * 0.13 + 0.5, 0.0, 1.0);
          vCol = mix(uColorA, uColorB, g);
          float tw = 0.7 + 0.3 * sin(uTime * 1.6 + aSeed * TAU);
          vB = aSize * tw * uAlpha;

          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = clamp(aSize * uPointScale * uViewScale * (300.0 / -mv.z), 0.4, 9.0);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        varying vec3 vCol; varying float vB;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          gl_FragColor = vec4(vCol, vB * smoothstep(0.5, 0.05, d));
        }`,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });
  }

  /** A loose cloud of motes drifting chaotically behind the mark. */
  private buildBackground(): {
    geometry: THREE.BufferGeometry;
    material: THREE.ShaderMaterial;
  } {
    const n = BG_COUNT[deviceTier()];
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    const size = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 90;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 90;
      // Behind the mark (further from the camera, which the group faces).
      pos[i * 3 + 2] = -6 - Math.random() * 46;
      seed[i] = Math.random();
      size[i] = 0.6 + Math.random() * 1.7;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(size, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uAlpha: { value: 0 },
        uSpeed: { value: 1 },
        uSize: { value: 1 },
        uBright: { value: 1 },
        uViewScale: { value: 1 },
        uColor: { value: color("accent400") },
      },
      vertexShader: /* glsl */ `
        attribute float aSeed; attribute float aSize;
        uniform float uTime; uniform float uAlpha; uniform float uSpeed; uniform float uSize; uniform float uBright; uniform float uViewScale;
        varying float vB;
        void main() {
          float t = uTime * uSpeed;
          vec3 p = position;
          p.x += sin(t * 0.13 + aSeed * 40.0) * 4.0 + cos(t * 0.05 + aSeed * 11.0) * 3.0;
          p.y += cos(t * 0.11 + aSeed * 27.0) * 4.0 + sin(t * 0.06 + aSeed * 7.0) * 3.0;
          p.z += sin(t * 0.09 + aSeed * 19.0) * 3.0;
          vB = (0.10 + 0.10 * sin(t * 0.5 + aSeed * 20.0)) * uAlpha * uBright;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = clamp((1.0 + aSeed * 2.5) * uSize * uViewScale * (200.0 / -mv.z), 0.8, 40.0);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying float vB;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          gl_FragColor = vec4(uColor, vB * smoothstep(0.5, 0.0, d));
        }`,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });

    return { geometry, material };
  }

  /* ------------------------------------------------------------------ frame */

  render({
    camera,
    assembly,
    alpha,
    time,
  }: {
    camera: THREE.Camera;
    assembly: number;
    alpha: number;
    time: number;
  }): void {
    const c = this.config();
    const vs = viewScale();
    const u = this.material.uniforms;
    u.uProgress.value = assembly;
    u.uAlpha.value = alpha * c.brightness;
    u.uTime.value = time;
    u.uPointScale.value = c.pointSize * this.markSizeScale;
    u.uViewScale.value = vs;
    (u.uColorA.value as THREE.Color).set(c.colorA);
    (u.uColorB.value as THREE.Color).set(c.colorB);

    const bu = this.bgMaterial.uniforms;
    bu.uTime.value = time;
    bu.uAlpha.value = alpha;
    bu.uSpeed.value = c.bgSpeed;
    bu.uSize.value = c.bgSize;
    bu.uBright.value = c.bgBright;
    bu.uViewScale.value = vs;
    (bu.uColor.value as THREE.Vector3).copy(color("accent400"));

    // Fixed distance in front of the camera, facing it, with a small cursor tilt.
    let mx = 0;
    let my = 0;
    if (hasPointer()) {
      const m = getMouseCoords().window;
      if (m.x !== null) mx = (m.x / window.innerWidth) * 2 - 1;
      if (m.y !== null) my = (m.y / window.innerHeight) * -2 + 1;
    }
    this.rotY = Lerp(this.rotY, mx * c.mouseStrength * 0.4, 0.08);
    this.rotX = Lerp(this.rotX, c.tilt * 0.3 + my * c.mouseStrength * 0.2, 0.08);

    this.forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
    this.group.position
      .copy((camera as THREE.PerspectiveCamera).position)
      .addScaledVector(this.forward, FRONT_DISTANCE);
    this.group.quaternion.copy(camera.quaternion);
    this.group.rotateY(this.rotY);
    this.group.rotateX(this.rotX);
  }

  resize(): void {}

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.bgPoints.geometry.dispose();
    this.bgMaterial.dispose();
  }
}

export default LogoMark;
