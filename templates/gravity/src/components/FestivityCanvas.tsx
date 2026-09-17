import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BallPhysics, SimulationParams, SceneControl } from '../types';

interface FestivityCanvasProps {
  key?: string | number;
  onInteract: (isInteracting: boolean) => void;
  onReady: () => void;
  mousePosRef: React.RefObject<{ x: number; y: number; isDown: boolean }>;
  controlRef: React.RefObject<SceneControl>;
  ballColor: string;
}

// --- petits utilitaires mathématiques ---------------------------------------
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export default function FestivityCanvas({
  onInteract,
  onReady,
  mousePosRef,
  controlRef,
  ballColor,
}: FestivityCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // --- MISE EN PLACE DE LA SCÈNE ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // --- ÉCLAIRAGE ---
    const hemiLight = new THREE.HemisphereLight(0xffffff, new THREE.Color(ballColor), 1.6);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(-6, 10, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.radius = 12.0;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.25);
    rimLight.position.set(8, 7, -8);
    scene.add(rimLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, 0.4);
    frontLight.position.set(0, 0, 11);
    scene.add(frontLight);

    const sideBounceLight = new THREE.DirectionalLight(0xffffff, 0.3);
    sideBounceLight.position.set(-9, -2, 4);
    scene.add(sideBounceLight);

    // --- PROJECTION DES BORNES DE L'ÉCRAN ---
    let viewportWidth = 10;
    let viewportHeight = 6;

    const updateFrustumBounds = () => {
      const fovRad = THREE.MathUtils.degToRad(camera.fov);
      viewportHeight = 2 * Math.tan(fovRad / 2) * camera.position.z;
      viewportWidth = viewportHeight * (container.clientWidth / container.clientHeight);
    };
    updateFrustumBounds();

    // Moins de sphères sur petit écran, pour que ça reste fluide.
    const isMobile = window.innerWidth < 768;
    const ballCount = isMobile ? 54 : 96;

    // --- PALETTE ---
    const getDynamicColors = (baseColor: string) => {
      const hex = baseColor.toLowerCase();
      // AMBRE — le champ au repos, dans le masthead.
      if (hex === '#fdba74') {
        return {
          pastel: new THREE.Color('#FFF4E8'), light: new THREE.Color('#FEDFC0'),
          medium: new THREE.Color('#FDBA74'), deep: new THREE.Color('#F59042'),
          glass: new THREE.Color('#FECFA0'),
        };
      // CUIVRE — la chute. L'étape intermédiaire, où le champ se réchauffe.
      } else if (hex === '#fb923c') {
        return {
          pastel: new THREE.Color('#FFF0E0'), light: new THREE.Color('#FDC894'),
          medium: new THREE.Color('#FB923C'), deep: new THREE.Color('#EA700B'),
          glass: new THREE.Color('#FCAA66'),
        };
      // ORANGE ODORO — l'orange de marque EXACT (#f97316), et ce n'est pas un
      // hasard qu'il tombe ici : c'est l'étape où les sphères se réassemblent en
      // sigle. La page résout littéralement sur la couleur de la marque au moment
      // précis où la marque apparaît. Ne pas déplacer ce hex sans déplacer le logo.
      } else if (hex === '#f97316') {
        return {
          pastel: new THREE.Color('#FFEBD9'), light: new THREE.Color('#FDB77A'),
          medium: new THREE.Color('#F97316'), deep: new THREE.Color('#C2540A'),
          glass: new THREE.Color('#FB8F3E'),
        };
      } else if (hex === '#141414' || hex === '#000000') {
        return {
          pastel: new THREE.Color('#D8D8D8'), light: new THREE.Color('#555555'),
          medium: new THREE.Color('#242424'), deep: new THREE.Color('#0A0A0A'),
          glass: new THREE.Color('#1F1F1F'),
        };
      }
      const c = new THREE.Color(baseColor);
      return {
        pastel: c.clone().offsetHSL(0, -0.15, 0.25),
        light: c.clone().offsetHSL(0, -0.05, 0.12),
        medium: c.clone(),
        deep: c.clone().offsetHSL(0.01, 0.1, -0.12),
        glass: c.clone(),
      };
    };

    const palette = getDynamicColors(ballColor);
    const isBlack = ['#141414', '#18181b', '#000000'].includes(ballColor.toLowerCase());

    // Palettes pilotées par le scroll : masthead (base) → cuivre (chute) →
    // orange ODORO (sigle). UNE SEULE famille chromatique, qui se SATURE en
    // descendant : le champ part ambre clair et converge sur l'orange de marque
    // pile au moment où il forme le sigle. Le mécanisme de morph est celui de la
    // template, inchangé — seules les teintes de chaque étape sont à nous.
    const palHero = palette;
    const palCuivre = getDynamicColors('#FB923C');
    const palMarque = getDynamicColors('#F97316');
    type Role = BallPhysics['role'];
    const ROLES: Role[] = ['pastel', 'light', 'medium', 'deep', 'glass'];
    // Couleurs de travail réutilisées : le morph par image n'alloue donc rien.
    // À 60 images par seconde, allouer ici déclencherait le ramasse-miettes.
    const curPal: Record<Role, THREE.Color> = {
      pastel: new THREE.Color(), light: new THREE.Color(), medium: new THREE.Color(),
      deep: new THREE.Color(), glass: new THREE.Color(),
    };

    const sphereGeometry = new THREE.SphereGeometry(1, 48, 48);

    // --- CRÉATION DES SPHÈRES ---
    const balls: BallPhysics[] = [];
    for (let i = 0; i < ballCount; i++) {
      let radius = 0.33;
      const rand = Math.random();
      if (rand < 0.3) radius = 0.27 + Math.random() * 0.12;
      else if (rand < 0.8) radius = 0.42 + Math.random() * 0.18;
      else radius = 0.66 + Math.random() * 0.21;

      const mass = Math.pow(radius, 3);

      let chosenColor = palette.medium;
      let color = palette.medium;
      let sphereMat: THREE.MeshPhysicalMaterial;
      let role: BallPhysics['role'] = 'medium';

      const isGlass = Math.random() < 0.22 && !isBlack;

      if (isGlass) {
        sphereMat = new THREE.MeshPhysicalMaterial({
          color: palette.glass, roughness: 0.08, metalness: 0.0,
          clearcoat: 1.0, clearcoatRoughness: 0.03, transmission: 0.95,
          ior: 1.485, thickness: 2.2,
          specularColor: new THREE.Color('#ffffff'), specularIntensity: 1.0,
          attenuationColor: palette.pastel, attenuationDistance: 1.0,
          emissive: palette.glass, emissiveIntensity: 0.12,
          transparent: true, // enables the fly-away fade in section 4
        });
        color = palette.glass;
        role = 'glass';
      } else {
        const colorRand = Math.random();
        if (colorRand < 0.25) { chosenColor = palette.pastel; role = 'pastel'; }
        else if (colorRand < 0.55) { chosenColor = palette.light; role = 'light'; }
        else if (colorRand < 0.85) { chosenColor = palette.medium; role = 'medium'; }
        else { chosenColor = palette.deep; role = 'deep'; }

        sphereMat = new THREE.MeshPhysicalMaterial({
          color: chosenColor, roughness: 0.44, metalness: 0.0,
          clearcoat: 0.24, clearcoatRoughness: 0.35,
          emissive: isBlack ? new THREE.Color('#000000') : chosenColor,
          emissiveIntensity: isBlack ? 0.0 : 0.08,
          transparent: true, // enables the fly-away fade in section 4
        });
        color = chosenColor;
      }

      const group = new THREE.Group();
      const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMat);
      sphereMesh.scale.setScalar(radius);
      sphereMesh.castShadow = true;
      sphereMesh.receiveShadow = true;
      group.add(sphereMesh);
      scene.add(group);

      const position = new THREE.Vector3(0, 0, 0);
      const velocity = new THREE.Vector3();

      balls.push({
        id: i, radius, mass, position, velocity,
        meshGroup: group, sphere: sphereMesh, material: sphereMat, role, isGlass,
        visualScale: radius, color,
        restPosition: new THREE.Vector3(0, 0, 0),
        shapeTarget: new THREE.Vector3(),
        angleY: Math.random() * Math.PI * 2,
        angleZ: 0.1 + Math.random() * 0.45,
      });
    }

    const meanRadius = balls.reduce((sum, b) => sum + b.radius, 0) / balls.length;
    // De combien rétrécir les sphères quand elles forment le sigle (dépend du viewport).
    let shapeScale = 1;

    // --- SILHOUETTE DU SIGLE ODORO -------------------------------------------
    // Le champ de sphères se réassemble en SIGLE ODORO. C'est le sommet de la
    // page : la chorégraphie de la template — agglutination, chute, mise en
    // forme, envol — est intacte, et la mise en forme vise désormais la marque.
    //
    // LE TRACÉ. Le sigle est géométrique, repris tel quel de BrandMark.tsx :
    // dans une boîte 100 × 100, contour extérieur = rayon 50 centré sur (50, 50),
    // contour intérieur = rayon 35, coin carré en haut à gauche. Normalisé ici
    // en x, y ∈ [-1, 1] centré sur le disque, y VERS LE HAUT (le SVG compte y
    // vers le bas, d'où l'inversion) : rayon extérieur 1, intérieur 0.7 — les
    // 15 unités d'épaisseur du logo. Le SVG, le GLB et ce tracé partagent cette
    // définition et ne peuvent pas diverger : si l'un bouge, les trois bougent.
    //
    // LA RÉPARTITION. On place les sphères à PAS D'ARC CONSTANT le long de la
    // ligne médiane du trait (rayon 0.85), et non par échantillonnage par rejet
    // dans l'aire, comme le faisait le cœur d'origine.
    //
    // C'est le seul endroit où la reprise du cœur ne se transpose pas telle
    // quelle, et la raison est nette : le tirage aléatoire remplit très bien une
    // forme PLEINE — un cœur reste un cœur même si les sphères s'agglutinent —
    // mais il DÉCHIRE un TRAIT. À 96 sphères, l'anneau sortait grumeleux et
    // troué, et un logo troué n'est plus un logo. La médiane paramétrée monte la
    // couverture du sigle à 97.7 % contre environ 60 % en aléatoire, et elle est
    // DÉTERMINISTE : au redimensionnement le sigle se reforme à l'identique au
    // lieu de se rebattre.
    const R_MID = 0.85;        // (1 + 0.7) / 2 — la ligne médiane du trait
    const HALF = 0.07;         // demi-écart entre les deux rangées de sphères
    const ARC = Math.PI * 1.5; // les 270° de l'arc
    const LEN_TOP = R_MID;
    const LEN_ARC = R_MID * ARC;
    const LEN_TOTAL = LEN_TOP + LEN_ARC + R_MID;

    // Un point du tracé à l'abscisse curviligne t ∈ [0, 1[, décalé de `off` vers
    // l'extérieur du trait. Les trois segments se referment bout à bout : le
    // segment haut finit où l'arc commence, l'arc finit où le segment gauche
    // commence, et celui-ci remonte au coin carré d'où le segment haut part.
    const markPoint = (t: number, off: number): [number, number] => {
      const d = t * LEN_TOTAL;
      // 1. Segment HAUT : de (-0.85, 0.85) à (0, 0.85). Normale extérieure = +y.
      if (d < LEN_TOP) return [-R_MID + d, R_MID + off];
      // 2. ARC de 270°, de 90° à 180° dans le sens horaire. Normale = radiale.
      if (d < LEN_TOP + LEN_ARC) {
        const th = Math.PI / 2 - ((d - LEN_TOP) / LEN_ARC) * ARC;
        const r = R_MID + off;
        return [r * Math.cos(th), r * Math.sin(th)];
      }
      // 3. Segment GAUCHE : de (-0.85, 0) à (-0.85, 0.85). Normale = -x.
      return [-R_MID - off, d - LEN_TOP - LEN_ARC];
    };

    const assignMarkTargets = () => {
      // Le sigle est carré : il occupe 2·S sur les deux axes, donc l'échelle est
      // bornée par l'axe le plus court, avec de la marge pour qu'il respire.
      const S = Math.min(viewportWidth * 0.28, viewportHeight * 0.33);
      const baseCY = -viewportHeight * 0.02;

      // Rayon des sphères = 0.09·S, et il faut les DEUX contraintes qui le
      // tiennent. LE LONG du tracé : le pas par rangée vaut 0.119·S contre
      // 0.18·S de diamètre, donc les sphères se chevauchent et le trait ne se
      // coupe jamais. EN TRAVERS : les deux rangées couvrent [0.69, 1.01], soit
      // toute l'épaisseur de la bande [0.7, 1.0], avec 0.04 de recouvrement à la
      // couture — sans quoi une rainure claire courrait au milieu du trait.
      shapeScale = Math.max(0.3, Math.min(1, (S * 0.09) / meanRadius));

      for (let i = 0; i < balls.length; i++) {
        const t = (i + 0.5) / balls.length;
        // Le décalage alterne pendant que t avance : les deux rangées
        // s'imbriquent donc d'elles-mêmes en quinconce, sans calcul de plus.
        const off = ((i % 2) - 0.5) * 2 * HALF;
        const [x, y] = markPoint(t, off);
        balls[i].shapeTarget.set(x * S, y * S + baseCY, (Math.random() - 0.5) * 0.35);
      }
    };
    assignMarkTargets();

    // --- ENTRÉE : garer les sphères loin hors champ, libérer sur `started` ---
    const scatterFar = (withInwardVelocity: boolean) => {
      const R = Math.max(viewportWidth, viewportHeight) * 1.5;
      for (const b of balls) {
        const a = Math.random() * Math.PI * 2;
        // ellipse large, pour qu'elles déboulent « de partout »
        const px = Math.cos(a) * R * 1.25;
        const py = Math.sin(a) * R * 0.85;
        const pz = (Math.random() - 0.5) * 4;
        b.position.set(px, py, pz);
        b.meshGroup.position.copy(b.position);
        if (withInwardVelocity) {
          b.velocity.set(-px, -py, -pz).normalize().multiplyScalar(0.08 + Math.random() * 0.05);
        } else {
          b.velocity.set(0, 0, 0);
        }
      }
    };
    scatterFar(false); // parked off-screen until the loader reveals

    // --- PARAMÈTRES DE SIMULATION ---
    const params: SimulationParams = {
      gravity: 0,
      rebound: -0.3,
      mouseRepelForce: 0.05,    // stronger base shove for a more immersive cursor
      mouseRepelRadius: 4.4,
      damping: 0.91,
      centerAttractForce: 0.0035,
      bounciness: 0.02,
    };

    // --- PROJECTION DE LA SOURIS ---
    const mouseProjVec = new THREE.Vector3();
    const mouseWorld3D = new THREE.Vector3();
    const updateMouse3D = () => {
      if (!mousePosRef.current) return;
      mouseProjVec.set(mousePosRef.current.x, mousePosRef.current.y, 0.5);
      mouseProjVec.unproject(camera);
      const dir = mouseProjVec.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      mouseWorld3D.copy(camera.position).add(dir.multiplyScalar(distance));
    };

    // --- BOUCLE ANIMATION / PHYSIQUE ---
    let animationFrameId = 0;
    const clock = new THREE.Clock();
    let localStarted = false;
    let entranceStart = 0;
    let reportedReady = false;

    const diffVec = new THREE.Vector3();
    const collideDiff = new THREE.Vector3();
    const relVel = new THREE.Vector3();
    const deltaPos = new THREE.Vector3();
    const rotAxis = new THREE.Vector3();
    const prevMouseWorld = new THREE.Vector3();
    let mouseSpeed = 0; // world units the cursor swept this frame (drives momentum impulse)

    const simulateAndRender = () => {
      animationFrameId = requestAnimationFrame(simulateAndRender);

      const time = clock.getElapsedTime();
      clock.getDelta(); // keep clock advancing
      updateMouse3D();

      const ctrl = controlRef.current;

      // Libérer l'entrée en vol à la première image où le loader passe la main.
      if (ctrl?.started && !localStarted) {
        localStarted = true;
        entranceStart = time;
        scatterFar(true);
      }

      // Avant la libération, on rend quand même la scène (vide) : le GPU chauffe,
      // et surtout on peut prévenir le loader que la scène 3D a bien monté.
      // « Prêt » veut dire UNE IMAGE RÉELLEMENT DESSINÉE, pas une promesse résolue.
      if (!localStarted) {
        renderer.render(scene, camera);
        if (!reportedReady) {
          reportedReady = true;
          onReady();
        }
        return;
      }

      const progress = ctrl?.progress ?? 0;

      // --- facteurs de fondu entre les modes ---
      const heroF = 1 - smoothstep(0.30, 0.80, progress);
      const dropRaw = smoothstep(0.40, 0.95, progress);
      // Section 4 : le champ entier accélère vers la caméra et s'efface.
      const flyF = smoothstep(2.7, 3.45, progress);
      // Plage généreuse : le sigle s'assemble lentement et proprement au scroll,
      // et finit de se former quand la section 3 se centre ; puis il se relâche
      // quand on part vers la 4.
      const shapeF = smoothstep(1.40, 2.05, progress) * (1 - smoothstep(2.55, 3.0, progress));
      // La gravité se relâche doucement AVANT que la forme ne verrouille, pour que
      // le sigle se pose au lieu de s'affaisser sous la gravité résiduelle.
      const dropF = dropRaw * (1 - smoothstep(1.25, 1.75, progress));

      // --- morph de palette pilote par le scroll : masthead → cuivre → orange ODORO ---
      const bCuivre = smoothstep(0.55, 1.05, progress);
      const bMarque = smoothstep(1.40, 1.95, progress);
      for (const role of ROLES) {
        curPal[role].copy(palHero[role]).lerp(palCuivre[role], bCuivre).lerp(palMarque[role], bMarque);
      }
      hemiLight.groundColor.copy(curPal.medium);

      // Rampe d'entrée : une forte attraction qui se détend vers l'agglutination normale.
      const entranceT = easeOutCubic(clamp01((time - entranceStart) / 2.2));
      const attractionBoost = lerp(7.5, 1, entranceT);

      const isMouseInteracting = !!mousePosRef.current &&
        (Math.abs(mousePosRef.current.x) < 0.99 || Math.abs(mousePosRef.current.y) < 0.99);
      onInteract?.(isMouseInteracting);

      // Élan du curseur : la distance balayée sur cette image (0 hors écran).
      mouseSpeed = isMouseInteracting ? mouseWorld3D.distanceTo(prevMouseWorld) : 0;
      if (mouseSpeed > 3) mouseSpeed = 3; // clamp teleport spikes on re-entry
      prevMouseWorld.copy(mouseWorld3D);

      // L'amortissement change selon le mode : agglutination visqueuse → air léger
      // (pour que la chute rebondisse) → dépôt doux en mode forme → quasi sans
      // frottement à l'envol, où la vitesse s'accumule.
      let damping = 0.91;
      damping = lerp(damping, 0.992, dropF);
      damping = lerp(damping, 0.90, shapeF);
      damping = lerp(damping, 0.985, flyF);

      const camZ = camera.position.z;

      const clusterActive = Math.max(heroF, entranceT < 1 ? 1 : 0);

      // 1. ACCÉLÉRATIONS
      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];

        // Une dérive brownienne calme, uniquement pendant l'agglutination du masthead.
        if (heroF > 0.01) {
          b.velocity.x += Math.sin(time * 0.4 + b.id * 1.5) * 0.0004 * b.radius * heroF;
          b.velocity.y += Math.cos(time * 0.5 + b.id * 1.2) * 0.0004 * b.radius * heroF;
          b.velocity.z += Math.sin(time * 0.35 + b.id) * 0.0001 * heroF;
        }

        // Ressort d'agglutination elliptique vers l'origine (masthead et entrée).
        const clusterStrength = params.centerAttractForce * attractionBoost * clusterActive;
        if (clusterStrength > 0.00001) {
          b.velocity.x += (0 - b.position.x) * clusterStrength * 0.38;
          b.velocity.y += (0 - b.position.y) * clusterStrength * 1.85;
          b.velocity.z += (0 - b.position.z) * clusterStrength * 1.8;
        }

        // La chute gravitaire (section 2).
        if (dropF > 0.001) {
          b.velocity.y -= 0.011 * dropF;
        }

        // Ressort de mise en forme du sigle (section 3) — k doux, pour une arrivée lisse.
        if (shapeF > 0.001) {
          const k = 0.06 * shapeF;
          b.velocity.x += (b.shapeTarget.x - b.position.x) * k;
          b.velocity.y += (b.shapeTarget.y - b.position.y) * k;
          b.velocity.z += (b.shapeTarget.z - b.position.z) * k;
        }

        // Envol (section 4) : accélérer vers la caméra (+z) en s'écartant, décalé
        // sphère par sphère pour que le champ passe l'objectif en vague.
        if (flyF > 0.001) {
          const stagger = (b.id * 0.6180339887) % 1;           // 0..1 golden-ratio spread
          const local = smoothstep(stagger * 0.55, stagger * 0.55 + 0.45, flyF);
          b.velocity.z += 0.05 * local;                         // rush at the camera
          b.velocity.x += b.position.x * 0.006 * local;         // splay outward
          b.velocity.y += b.position.y * 0.006 * local;
        }

        // Répulsion par le curseur, active dans tous les modes. Un bonus d'élan fait
        // qu'un balayage rapide projette les sphères fort — c'est ce qui rend la
        // scène tactile plutôt que décorative.
        if (mousePosRef.current && isMouseInteracting) {
          diffVec.subVectors(b.position, mouseWorld3D);
          const rawDist = diffVec.length();
          const down = mousePosRef.current.isDown;
          const activeRepelRadius = down ? params.mouseRepelRadius * 1.4 : params.mouseRepelRadius;
          const activeRepelForce = down ? params.mouseRepelForce * 1.7 : params.mouseRepelForce;
          if (rawDist < activeRepelRadius && rawDist > 0.0001) {
            const ratio = rawDist / activeRepelRadius;
            const smoothFactor = 1.0 - (ratio * ratio * (3.0 - 2.0 * ratio));
            const speedBoost = 1 + mouseSpeed * 3.2; // up to ~10× on a quick flick
            const push = smoothFactor * activeRepelForce * speedBoost;
            diffVec.normalize();
            diffVec.z *= 0.12;
            diffVec.normalize();
            b.velocity.addScaledVector(diffVec, push);
          }
        }

        b.velocity.multiplyScalar(damping);
        b.position.addScaledVector(b.velocity, 1);

        // Le morph de couleur en direct, piloté par le scroll.
        const c = b.isGlass ? curPal.glass : curPal[b.role];
        b.material.color.copy(c);
        if (!isBlack) b.material.emissive.copy(c);

        // Effacement à mesure que la sphère fonce dans l'objectif (section 4).
        b.material.opacity = flyF > 0.001
          ? 1 - smoothstep(camZ - 2.6, camZ - 0.3, b.position.z)
          : 1;

        // Rétrécir vers l'échelle résolue pour le viewport, afin que le sigle lise
        // plein sur tout écran (le paysage rétrécit peu, le portrait beaucoup).
        const targetVis = b.radius * (1 - (1 - shapeScale) * shapeF);
        b.visualScale += (targetVis - b.visualScale) * 0.12;
        b.sphere.scale.setScalar(b.visualScale);
      }

      // 2. COLLISIONS DEUX À DEUX — quasi désactivées en mode forme, pour que
      // chaque sphère se plante sur sa cible exacte. C'est ce qui permet au trait
      // du sigle de lire continu : le chevauchement devient une surface lisse.
      const collideScale = 0.28 * (1 - 0.93 * shapeF) * (1 - flyF);
      const subSteps = 4;
      for (let step = 0; step < subSteps; step++) {
        for (let i = 0; i < balls.length; i++) {
          for (let j = i + 1; j < balls.length; j++) {
            const b1 = balls[i];
            const b2 = balls[j];
            collideDiff.subVectors(b2.position, b1.position);
            const dist = collideDiff.length();
            const minDist = b1.visualScale + b2.visualScale;
            if (dist < minDist && dist > 0.001) {
              const overlap = minDist - dist;
              collideDiff.multiplyScalar(1 / dist); // normalize
              const totalMass = b1.mass + b2.mass;
              const ratio1 = b2.mass / totalMass;
              const ratio2 = b1.mass / totalMass;
              b1.position.addScaledVector(collideDiff, -overlap * ratio1 * collideScale);
              b2.position.addScaledVector(collideDiff, overlap * ratio2 * collideScale);

              relVel.subVectors(b2.velocity, b1.velocity);
              const velAlongNormal = relVel.dot(collideDiff);
              if (velAlongNormal < -0.0001) {
                const impulse = -(1 + params.bounciness) * velAlongNormal / (1 / b1.mass + 1 / b2.mass);
                b1.velocity.addScaledVector(collideDiff, -impulse / b1.mass);
                b2.velocity.addScaledVector(collideDiff, impulse / b2.mass);
              }
            }
          }
        }
      }

      // 3. MURS DU VIEWPORT + SOL REBONDISSANT
      const borderPad = 0.2;
      const xBound = viewportWidth / 2 - borderPad;
      const topY = viewportHeight / 2 - 0.05;
      const floorY = -viewportHeight / 2 + 0.05;
      const zBound = 2.0;
      const restitution = 0.30 + 0.35 * dropF; // bouncy while falling, soft otherwise

      const contain = flyF < 0.5;   // walls release once the field flies away
      const zContain = flyF < 0.02; // z opens first so balls can rush the camera

      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];
        const r = b.visualScale; // effective radius (shrinks in shape mode)

        if (contain) {
          // Murs en X
          if (b.position.x < -xBound - r) {
            b.position.x = -xBound - r;
            b.velocity.x *= params.rebound;
          } else if (b.position.x > xBound + r) {
            b.position.x = xBound + r;
            b.velocity.x *= params.rebound;
          }

          // Le sol — celui de la deuxième section, sur lequel les sphères rebondissent
          if (b.position.y - r < floorY) {
            b.position.y = floorY + r;
            if (b.velocity.y < 0) b.velocity.y = -b.velocity.y * restitution;
            if (dropF > 0.3) { b.velocity.x *= 0.86; b.velocity.z *= 0.86; }
          }
          // Plafond
          if (b.position.y + r > topY) {
            b.position.y = topY - r;
            if (b.velocity.y > 0) b.velocity.y *= params.rebound;
          }
        }

        // Profondeur en Z
        if (zContain) {
          if (b.position.z < -zBound) { b.position.z = -zBound; b.velocity.z *= params.rebound; }
          else if (b.position.z > zBound) { b.position.z = zBound; b.velocity.z *= params.rebound; }
        }

        // Roulement et rotation, déduits du déplacement.
        deltaPos.copy(b.position).sub(b.meshGroup.position);
        if (deltaPos.lengthSq() > 0.000001) {
          rotAxis.set(deltaPos.y, -deltaPos.x, 0).normalize();
          const rotAngle = (deltaPos.length() / b.radius) * 0.95;
          b.meshGroup.rotateOnWorldAxis(rotAxis, rotAngle);
        }
        b.meshGroup.position.copy(b.position);
      }

      renderer.render(scene, camera);

      if (!reportedReady) {
        reportedReady = true;
        onReady();
      }
    };

    simulateAndRender();

    // --- REDIMENSIONNEMENT ---
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      updateFrustumBounds();
      assignMarkTargets();
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // --- NETTOYAGE ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      balls.forEach((b) => {
        b.meshGroup.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry.dispose();
            if (Array.isArray(node.material)) node.material.forEach((m) => m.dispose());
            else node.material.dispose();
          }
        });
      });
      sphereGeometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="o-fixed o-inset-0 o-w-full o-h-full o-z-0 o-pointer-events-none o-select-none">
      <canvas ref={canvasRef} className="o-w-full o-h-full o-block" />
    </div>
  );
}
