/**
 * Onyx Cubes — the scene, ported from the GetLayers single-HTML master.
 *
 * Plain three.js + cannon-es behind a small class the canvas component owns:
 * construct it on a canvas, call `frame()` from the shared ticker, `resize()`
 * from a ResizeObserver, `dispose()` on unmount. Nothing here touches React.
 *
 * The chrome look comes from a self-contained RoomEnvironment-style PMREM —
 * a DARK surround with a few very bright softbox panels — independent of the
 * page behind the canvas (a "split env": light backdrop, dark reflections).
 * The canvas is transparent: the page's own porcelain wash is the ground, so
 * the copy beside the swarm keeps its ink.
 *
 * 📖 Docs: obsidian/workflows/optimize-3d-scene.md
 */

import * as CANNON from "cannon-es";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

import { onyxCubesConfig as C } from "./onyx-cubes.config";

export interface OnyxCubesPalette {
  /** The metal — the page's ink. */
  cube: string;
  /** The reflected surround — the page's accent, as light. */
  env: string;
}

export interface OnyxCubesOptions {
  /** No fine pointer: a lower pixel-ratio budget and no bow-wave. */
  touch: boolean;
}

interface CubeRecord {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  phase: number;
}

/** Deterministic-ish pseudo-random so a rebuild looks stable per session. */
const makeRand = () => {
  let seed = 1;
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
};

export class OnyxCubesScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly world: CANNON.World;
  private readonly cubes: CubeRecord[] = [];
  private readonly material: THREE.MeshPhysicalMaterial;
  private readonly pmrem: THREE.PMREMGenerator;
  private envTarget: THREE.WebGLRenderTarget | null = null;

  private readonly raycaster = new THREE.Raycaster();
  private readonly ndc = new THREE.Vector2();
  private readonly ndcPrev = new THREE.Vector2();
  private readonly parallax = new THREE.Vector2();
  private readonly center = new THREE.Vector3();
  private pointerSpeed = 0;
  private pointerInside = false;

  private grabbed: CubeRecord | null = null;
  private pointerBody: CANNON.Body | null = null;
  private dragConstraint: CANNON.PointToPointConstraint | null = null;
  private readonly dragPlane = new THREE.Plane();

  private readonly timer = new THREE.Timer();
  private readonly detach: Array<() => void> = [];

  // Reused per frame, never allocated in the loop.
  private readonly ray = new THREE.Ray();
  private readonly closest = new THREE.Vector3();
  private readonly bodyPos = new THREE.Vector3();
  private readonly dir = new THREE.Vector3();
  private readonly hit = new THREE.Vector3();
  private readonly force = new CANNON.Vec3();
  private readonly rand = makeRand();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    palette: OnyxCubesPalette,
    private readonly options: OnyxCubesOptions,
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = C.exposure;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.camera = new THREE.PerspectiveCamera(C.fov, 1, 0.1, 100);
    this.camera.position.set(0, 0, C.camDist);
    this.camera.lookAt(0, 0, 0);

    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    this.buildEnvironment(palette.env);
    this.buildLights();

    this.world = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, 0) });
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = false;

    this.material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(palette.cube),
      metalness: C.metalness,
      roughness: C.roughness,
      clearcoat: C.clearcoat,
      clearcoatRoughness: C.clearcoatRoughness,
      envMapIntensity: C.envIntensity,
    });
    this.buildSwarm();
    this.bindPointer();
  }

  /* ---------- environment: a dark rig with bright panels, baked to a PMREM ---------- */
  private buildEnvironment(accent: string) {
    const rig = new THREE.Scene();
    // The accent, dimmed: the surround is what the metal reflects, so this
    // is where the brand's one hue becomes light on black.
    rig.background = new THREE.Color(accent).multiplyScalar(C.envTintStrength);
    const panel = (
      value: number,
      position: [number, number, number],
      scale: [number, number],
      rotation: [number, number, number],
    ) => {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(value, value, value),
          toneMapped: false,
          side: THREE.DoubleSide,
        }),
      );
      mesh.position.set(...position);
      mesh.rotation.set(...rotation);
      mesh.scale.set(scale[0], scale[1], 1);
      rig.add(mesh);
    };
    panel(7, [0, 11, 3], [16, 8], [Math.PI / 2, 0, 0]); // overhead softbox
    panel(5, [7, 3, 4], [4, 12], [0, -Math.PI / 2.3, 0]); // right key strip
    panel(3.2, [-7, 2, 3], [4, 12], [0, Math.PI / 2.3, 0]); // left fill strip
    panel(1.1, [0, 0, 10], [18, 12], [0, 0, 0]); // faint front fill
    this.envTarget?.dispose();
    this.envTarget = this.pmrem.fromScene(rig, 0.04);
    this.scene.environment = this.envTarget.texture;
  }

  private buildLights() {
    this.scene.add(new THREE.AmbientLight(0xffffff, C.ambient));

    const key = new THREE.DirectionalLight(0xffffff, C.keyLight);
    key.position.set(3.5, 8, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.radius = 10;
    key.shadow.bias = -0.0005;
    const shadowCamera = key.shadow.camera;
    shadowCamera.near = 1;
    shadowCamera.far = 30;
    shadowCamera.left = -8;
    shadowCamera.right = 8;
    shadowCamera.top = 8;
    shadowCamera.bottom = -8;
    shadowCamera.updateProjectionMatrix();
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0xdfe6ff, C.rim);
    rim.position.set(-4, 2, -6);
    this.scene.add(rim);

    // An invisible floor that only catches the swarm's soft shadow, so the
    // cubes read as grounded rather than floating in a void.
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.ShadowMaterial({ opacity: C.shadowOpacity }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = C.shadowY;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  /* ---------- the swarm: one rounded box mesh + one box body each ---------- */
  private buildSwarm() {
    const cubeMaterial = new CANNON.Material("cube");
    this.world.addContactMaterial(
      new CANNON.ContactMaterial(cubeMaterial, cubeMaterial, {
        friction: C.friction,
        restitution: C.restitution,
      }),
    );
    const spread = C.spawnSpread;
    for (let i = 0; i < C.cubeCount; i++) {
      const size =
        C.cubeSize * (1 - C.sizeVar * 0.5 + this.rand() * C.sizeVar);
      const geometry = new RoundedBoxGeometry(
        size,
        size,
        size,
        4,
        Math.min(C.cornerR, size * 0.45),
      );
      const mesh = new THREE.Mesh(geometry, this.material);
      mesh.castShadow = true;
      this.scene.add(mesh);

      const body = new CANNON.Body({ mass: 1, material: cubeMaterial });
      body.addShape(new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2)));
      body.position.set(
        (this.rand() * 2 - 1) * spread,
        (this.rand() * 2 - 1) * spread * 0.7,
        (this.rand() * 2 - 1) * spread * 0.6,
      );
      body.quaternion.setFromEuler(
        this.rand() * 6.28,
        this.rand() * 6.28,
        this.rand() * 6.28,
      );
      body.linearDamping = C.linDamp;
      body.angularDamping = C.angDamp;
      body.angularVelocity.set(
        (this.rand() * 2 - 1) * C.spin,
        (this.rand() * 2 - 1) * C.spin,
        (this.rand() * 2 - 1) * C.spin,
      );
      this.world.addBody(body);
      this.cubes.push({ mesh, body, phase: this.rand() * 6.28 });
    }
  }

  /* ---------- pointer: bow-wave push + grab-drag ---------- */
  private setNDC(event: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    this.ndc.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
  }

  private bindPointer() {
    const { canvas } = this;
    const onDown = (event: PointerEvent) => {
      this.setNDC(event);
      this.pointerInside = true;
      this.raycaster.setFromCamera(this.ndc, this.camera);
      const hits = this.raycaster.intersectObjects(
        this.cubes.map((cube) => cube.mesh),
      );
      const first = hits[0];
      if (!first) return;
      const record = this.cubes.find((cube) => cube.mesh === first.object);
      if (!record) return;
      this.grabbed = record;

      const point = first.point;
      const anchor = new CANNON.Body({ mass: 0, type: CANNON.Body.KINEMATIC });
      anchor.position.set(point.x, point.y, point.z);
      this.world.addBody(anchor);
      this.pointerBody = anchor;

      const pivot = record.body.pointToLocalFrame(
        new CANNON.Vec3(point.x, point.y, point.z),
      );
      this.dragConstraint = new CANNON.PointToPointConstraint(
        record.body,
        pivot,
        anchor,
        new CANNON.Vec3(),
        C.dragForce,
      );
      this.world.addConstraint(this.dragConstraint);

      const normal = new THREE.Vector3();
      this.camera.getWorldDirection(normal);
      this.dragPlane.setFromNormalAndCoplanarPoint(normal, point);
      canvas.setPointerCapture(event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      this.setNDC(event);
      this.pointerInside = true;
      if (this.grabbed && this.pointerBody) {
        this.raycaster.setFromCamera(this.ndc, this.camera);
        if (this.raycaster.ray.intersectPlane(this.dragPlane, this.hit)) {
          this.pointerBody.position.set(this.hit.x, this.hit.y, this.hit.z);
        }
      }
    };
    const endGrab = (event?: PointerEvent) => {
      if (this.dragConstraint) {
        this.world.removeConstraint(this.dragConstraint);
        this.dragConstraint = null;
      }
      if (this.pointerBody) {
        this.world.removeBody(this.pointerBody);
        this.pointerBody = null;
      }
      this.grabbed = null;
      if (event && event.pointerId != null) {
        try {
          canvas.releasePointerCapture(event.pointerId);
        } catch {
          // Capture may already be gone; nothing to release.
        }
      }
    };
    const onLeave = () => {
      this.pointerInside = false;
    };

    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", endGrab);
    window.addEventListener("pointercancel", endGrab);
    canvas.addEventListener("pointerleave", onLeave);
    this.detach.push(() => {
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", endGrab);
      window.removeEventListener("pointercancel", endGrab);
      canvas.removeEventListener("pointerleave", onLeave);
      endGrab();
    });
  }

  /* ---------- per-frame forces: the float well + the cursor bow-wave ---------- */
  private applyForces(t: number) {
    this.raycaster.setFromCamera(this.ndc, this.camera);
    this.ray.copy(this.raycaster.ray);
    const { center, force } = this;

    for (const cube of this.cubes) {
      const body = cube.body;
      // Soft spring toward the centre — keeps the swarm framed, weightless otherwise.
      body.applyForce(
        force.set(
          -(body.position.x - center.x) * C.centerPull,
          -(body.position.y - center.y) * C.centerPull,
          -(body.position.z - center.z) * C.centerPull,
        ),
      );
      // Idle levitation drift so nothing ever sits perfectly still.
      body.applyForce(
        force.set(
          Math.sin(t * C.bobSpeed + cube.phase) * C.bob * 0.5,
          Math.cos(t * C.bobSpeed * 0.8 + cube.phase) * C.bob,
          Math.sin(t * C.bobSpeed * 1.1 + cube.phase * 1.7) * C.bob * 0.5,
        ),
      );
      // Cursor bow-wave — shove cubes away from the pointer ray, scaled by speed.
      if (this.pointerInside && !this.options.touch && cube !== this.grabbed) {
        this.bodyPos.set(body.position.x, body.position.y, body.position.z);
        this.ray.closestPointToPoint(this.bodyPos, this.closest);
        const d = this.bodyPos.distanceTo(this.closest);
        if (d < C.pushRadius) {
          const falloff = 1 - d / C.pushRadius;
          const gain = Math.min(1, this.pointerSpeed * 8) * 0.85 + 0.15;
          this.dir.copy(this.bodyPos).sub(this.closest);
          if (this.dir.lengthSq() < 1e-6) {
            this.dir.set(this.rand() - 0.5, this.rand() - 0.5, this.rand() - 0.5);
          }
          this.dir
            .normalize()
            .multiplyScalar(falloff * falloff * C.pushStrength * gain);
          body.applyForce(force.set(this.dir.x, this.dir.y, this.dir.z));
        }
      }
    }
  }

  /**
   * Where the swarm hangs, in world units, and how far back the camera
   * stands. The camera always looks at the origin, so an off-origin centre
   * is an off-centre swarm on screen.
   */
  setFraming(x: number, y = 0, distance: number = C.camDist) {
    this.center.set(x, y, 0);
    this.distance = distance;
  }

  private distance: number = C.camDist;

  resize(width: number, height: number) {
    if (!width || !height) return;
    const ratio = Math.min(
      window.devicePixelRatio,
      this.options.touch ? C.maxPixelRatioTouch : C.maxPixelRatio,
    );
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  /** One step of the sim and one draw. Call from the shared ticker. */
  frame() {
    this.timer.update();
    const dt = Math.min(this.timer.getDelta(), C.maxDelta);
    const t = this.timer.getElapsed();

    this.pointerSpeed = this.ndc.distanceTo(this.ndcPrev);
    this.ndcPrev.copy(this.ndc);

    this.applyForces(t);
    this.world.step(C.fixedStep, dt, C.maxSubSteps);

    for (const cube of this.cubes) {
      cube.mesh.position.copy(cube.body.position);
      cube.mesh.quaternion.copy(cube.body.quaternion);
    }

    // Gentle camera parallax toward the cursor, frozen while dragging so it
    // does not fight the grab. The camera looks at the world origin, not at
    // the swarm's centre: that is what lets the centre spring carry the
    // swarm off-centre on screen — beside the copy, or above it.
    const px = this.grabbed ? 0 : this.ndc.x * C.parallax;
    const py = this.grabbed ? 0 : this.ndc.y * C.parallax;
    this.parallax.x += (px - this.parallax.x) * C.parallaxEase;
    this.parallax.y += (py - this.parallax.y) * C.parallaxEase;
    this.camera.position.set(this.parallax.x, this.parallax.y, this.distance);
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    for (const off of this.detach) off();
    this.detach.length = 0;
    for (const cube of this.cubes) {
      this.scene.remove(cube.mesh);
      cube.mesh.geometry.dispose();
      this.world.removeBody(cube.body);
    }
    this.cubes.length = 0;
    this.material.dispose();
    this.envTarget?.dispose();
    this.pmrem.dispose();
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const material = object.material;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material.dispose();
      }
    });
    this.renderer.dispose();
  }
}
