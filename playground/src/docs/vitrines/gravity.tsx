/**
 * Gravity — le studio numerique ODORO.
 *
 * ## Le mecanisme : quatre-vingt-seize spheres sous une gravite reelle
 *
 * Une seule scene three.js, fixee derriere toute la page. Quatre-vingt-seize
 * spheres de rayons varies — ambre, cuivre, papier, quelques-unes en verre —
 * s agglutinent au centre pendant l ouverture, puis **tombent** quand on
 * descend : la gravite est integree a chaque image par l horloge du moteur,
 * les spheres rebondissent au sol et entre elles, et l energie se depose. Au
 * deuxieme acte, un ressort attire chacune vers une cible echantillonnee sur
 * le trace du **sigle ODORO** — a pas d arc constant le long de la mediane du
 * trait, sur deux rangees en quinconce — et le champ se reassemble en marque.
 * Au dernier acte, les spheres accelerent vers l objectif et le depassent.
 *
 * La page part d un papier chaud, blanc vers abricot, et se **sature en
 * descendant** jusqu a l orange de marque exact, qui tombe pile quand les
 * spheres forment le sigle. Le fond du canevas, les spheres et l accent de
 * l interface suivent le defilement sur **une seule horloge**, amortie : un
 * cran de molette pousse la cible, et le champ continue de couler apres le
 * geste. Sous le theme sombre, le papier devient un zinc profond qui se
 * rechauffe de meme.
 *
 * ## Ce qui a ete remplace
 *
 * Lenis est devenu la glisse de l horloge ; Motion, des transitions CSS gardees
 * par le rideau et par l entree dans le champ ; three.js direct, `useScene` du
 * moteur ; le curseur maison, `CursorRing` ; les boutons magnetiques,
 * `Aimant` ; le grain, `Noise` ; le bandeau du pied, `Marquee`. Le repli, sous
 * mouvement reduit ou sans WebGL, est un semis de disques en SVG qui forment le
 * meme sigle.
 *
 * Forme d appel : l adresse de courriel en gelule aimantee, avec son orbe
 * flechee, dans le pied. Forme de pied : un pied toujours sombre a coins
 * arrondis — bandeau defilant, bloc d appel, trois colonnes de liens, barre
 * basse avec la marque, la mention et trois reseaux. Aucun chiffre invente :
 * les trois cartes de la chute sont celles de la source.
 *
 * @module
 */

import { CLOCK_PRIORITY, clock, useMotionState } from '@odoro-cli/engine'
import { useScene, type SceneContext, type SceneFrame } from '@odoro-cli/engine/three'
import { Icon } from '@odoro-cli/icons'
import {
  ArrowDown,
  ArrowUpRight,
  Menu,
  MousePointer_2,
  X,
} from '@odoro-cli/icons/outline'
import { Instagram, Linkedin, Twitter } from '@odoro-cli/icons/brands'
import { useInView } from '@odoro-cli/libs/motion'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { Noise } from '@/odoro/background/Noise.jsx'
import { CursorRing } from '@/odoro/effect/CursorRing.jsx'
import { Marquee } from '@/odoro/effect/Marquee.jsx'

import { nuit } from './communs.jsx'
import { affiche, CHROME, Porte, usePolices, usePret } from './marche.jsx'
import { accent } from './palettes.js'
import { Aimant } from './scene.jsx'
import { eclairer, teinte } from './volume.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/* ============================ Les encres =============================== */

const ENCRE = 'o-text-stone-950 dark:o-text-stone-50'
const DOUCE = 'o-text-stone-700 dark:o-text-stone-300'
const FAIBLE = 'o-text-stone-500 dark:o-text-stone-400'

/** La carte de verre, claire sur le papier, sombre sous la nuit. */
const VERRE =
  'o-border-w-1 o-border-white-60 o-bg-white-40 o-backdrop-blur-xl dark:o-border-zinc-700 dark:o-bg-zinc-900'

/** L orbe d accent : batie sur l accent vivant, elle morphe avec la scene. */
const ORBE =
  'radial-gradient(circle at 50% 28%, color-mix(in srgb, var(--o-gv-accent) 75%, #fff) 0%, var(--o-gv-accent) 48%, var(--o-vitrine-700) 100%)'

/** La courbe de sortie partagee par toutes les revelations. */
const COURBE = 'cubic-bezier(0.16, 1, 0.3, 1)'

/* ============================ Le sigle ================================= */

/**
 * Le trace du sigle ODORO : un coin carre en haut a gauche prolonge par un arc
 * de 270 degres, en trait d epaisseur constante (0,3 du rayon). Le contour
 * interieur est creuse par `evenodd`.
 */
const TRACE_SIGLE = 'M0 0H50A50 50 0 1 1 0 50Z M15 15H50A35 35 0 1 1 15 50Z'

/** Le sigle, en SVG. */
function Sigle({
  taille = 24,
  style,
}: {
  readonly taille?: number
  readonly style?: CSSProperties
}): ReactElement {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      className="o-shrink-0"
      style={style}
    >
      <path fillRule="evenodd" clipRule="evenodd" d={TRACE_SIGLE} fill="currentColor" />
    </svg>
  )
}

/*
 * La mediane du trait du sigle, normalisee dans [-1, 1], y vers le haut :
 * rayon exterieur 1, interieur 0,7, mediane 0,85. Les trois segments se
 * referment bout a bout : le segment haut, l arc de 270 degres, le segment
 * gauche qui remonte au coin carre.
 */
const R_MEDIAN = 0.85
const DEMI_ECART = 0.07
const ARC = Math.PI * 1.5
const LONG_HAUT = R_MEDIAN
const LONG_ARC = R_MEDIAN * ARC
const LONG_TOTAL = LONG_HAUT + LONG_ARC + R_MEDIAN

/** Un point du trace a l abscisse curviligne `t`, decale de `ecart` vers l exterieur du trait. */
function pointDuSigle(t: number, ecart: number): readonly [number, number] {
  const d = t * LONG_TOTAL
  if (d < LONG_HAUT) return [-R_MEDIAN + d, R_MEDIAN + ecart]
  if (d < LONG_HAUT + LONG_ARC) {
    const th = Math.PI / 2 - ((d - LONG_HAUT) / LONG_ARC) * ARC
    const r = R_MEDIAN + ecart
    return [r * Math.cos(th), r * Math.sin(th)]
  }
  return [-R_MEDIAN - ecart, d - LONG_HAUT - LONG_ARC]
}

/** Le nombre de spheres : moins sur petit ecran, pour que cela reste fluide. */
function nombreDeSpheres(): number {
  return typeof window !== 'undefined' && window.innerWidth < 768 ? 54 : 96
}

/**
 * Le repli dessine : un semis de disques qui forment le sigle.
 *
 * C est ce que montre la page sous mouvement reduit, sans WebGL, ou quand le
 * plafond de surfaces est atteint. Le meme trace, le meme pas, les memes
 * teintes — la marque reste le sujet.
 */
function SigleSeme(): ReactElement {
  const disques = useMemo(() => {
    const n = 96
    const teintes = [
      'var(--o-vitrine-300)',
      'var(--o-vitrine-100)',
      'var(--o-vitrine-400)',
      'var(--o-vitrine-500)',
      'var(--o-vitrine-200)',
    ]
    return Array.from({ length: n }, (_, i) => {
      const t = (i + 0.5) / n
      const ecart = ((i % 2) - 0.5) * 2 * DEMI_ECART
      const [x, y] = pointDuSigle(t, ecart)
      return {
        x,
        y: -y,
        r: 0.075 + ((i * 7) % 5) * 0.008,
        fill: teintes[(i * 3) % teintes.length] ?? teintes[0],
      }
    })
  }, [])
  return (
    <svg viewBox="-1.25 -1.25 2.5 2.5" className="o-h-full o-w-full" aria-hidden="true">
      {disques.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.fill} opacity={0.92} />
      ))}
    </svg>
  )
}

/* ============================ La scene ================================= */

type Trois = SceneContext['three']
type Vecteur = InstanceType<Trois['Vector3']>
type Couleur = InstanceType<Trois['Color']>
type Groupe = InstanceType<Trois['Group']>
type Maille = InstanceType<Trois['Mesh']>
type Matiere = InstanceType<Trois['MeshPhysicalMaterial']>

type Role = 'pastel' | 'claire' | 'moyenne' | 'profonde' | 'verre'
const ROLES: readonly Role[] = ['pastel', 'claire', 'moyenne', 'profonde', 'verre']

/** Une sphere du champ. */
interface Sphere {
  readonly id: number
  readonly rayon: number
  readonly masse: number
  readonly position: Vecteur
  readonly vitesse: Vecteur
  readonly groupe: Groupe
  readonly maille: Maille
  readonly matiere: Matiere
  readonly role: Role
  readonly enVerre: boolean
  readonly cible: Vecteur
  echelle: number
}

/** Ce que la page dit a la scene, sans re-rendu React. */
interface Commande {
  /** Le defilement, amorti, en hauteurs d ecran. */
  progression: number
  /** Vrai quand le rideau a rendu la main : les spheres deboulent. */
  demarre: boolean
  pointeur: { x: number; y: number; enfonce: boolean; dedans: boolean }
}

const borne01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)
const lisse = (a: number, b: number, x: number): number => {
  const t = borne01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const entre = (a: number, b: number, t: number): number => a + (b - a) * t
const sortieCubique = (t: number): number => 1 - (1 - t) ** 3

/** Le theme courant, lu sur la racine : la librairie y pose `color-scheme`. */
function estSombre(): boolean {
  if (typeof document === 'undefined') return false
  // `color-scheme` prend trois valeurs utiles ici. La documentation ecrit
  // `dark` ou `light` quand le visiteur a choisi, et laisse `light dark`
  // quand il s en remet au systeme. Chercher « dark » dans la chaine rendait
  // donc la page sombre en plein jour ; comparer a « dark » tout court la
  // rendait claire sous un systeme en nuit. On lit le choix s il existe, et
  // on interroge le systeme sinon.
  const declare = getComputedStyle(document.documentElement).colorScheme.trim()
  if (declare === 'dark') return true
  if (declare === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Le champ de spheres : construction et image par image.
 *
 * Tout ce qui vit ici est alloue une fois ; la boucle n alloue rien, parce
 * qu a soixante images par seconde le ramasse-miettes se verrait.
 */
function construireLeChamp(
  contexte: SceneContext,
  commande: Commande,
  hote: HTMLElement,
): { animer: (image: SceneFrame) => void; demonter: () => void } {
  const { scene, camera, three, quality } = contexte

  camera.fov = 38
  camera.position.set(0, 0, 11)
  camera.lookAt(0, 0, 0)
  camera.updateProjectionMatrix()

  /* ----- Les palettes : ambre, cuivre, marque — puis le fond ------------ */

  const nuance = (n: number, repli: string): Couleur =>
    new three.Color(teinte(`--o-vitrine-${String(n)}`, repli))
  const palettes: Record<'ambre' | 'cuivre' | 'marque', Record<Role, Couleur>> = {
    ambre: {
      pastel: nuance(50, '#fff7ed'),
      claire: nuance(100, '#ffedd5'),
      moyenne: nuance(300, '#fdba74'),
      profonde: nuance(400, '#fb923c'),
      verre: nuance(200, '#fed7aa'),
    },
    cuivre: {
      pastel: nuance(50, '#fff7ed'),
      claire: nuance(200, '#fed7aa'),
      moyenne: nuance(400, '#fb923c'),
      profonde: nuance(500, '#f97316'),
      verre: nuance(300, '#fdba74'),
    },
    marque: {
      pastel: nuance(100, '#ffedd5'),
      claire: nuance(300, '#fdba74'),
      moyenne: nuance(500, '#f97316'),
      profonde: nuance(700, '#c2410c'),
      verre: nuance(400, '#fb923c'),
    },
  }
  const courante: Record<Role, Couleur> = {
    pastel: new three.Color(),
    claire: new three.Color(),
    moyenne: new three.Color(),
    profonde: new three.Color(),
    verre: new three.Color(),
  }

  // Le fond : trois anneaux de couleur (centre, mi-course, bord) par etape,
  // recalcules quand le theme bascule. Sur le papier : blanc vers abricot. Sous
  // la nuit : un zinc profond qui se rechauffe du meme mouvement.
  const fonds: { centre: Couleur; milieu: Couleur; bord: Couleur }[] = [0, 1, 2].map(
    () => ({
      centre: new three.Color(),
      milieu: new three.Color(),
      bord: new three.Color(),
    }),
  )
  const refaireLesFonds = (): void => {
    const sombre = estSombre()
    const nuit = new three.Color('#09090b')
    const blanc = new three.Color('#ffffff')
    const n100 = nuance(100, '#ffedd5')
    const n200 = nuance(200, '#fed7aa')
    const n300 = nuance(300, '#fdba74')
    const n800 = nuance(800, '#9a3412')
    for (let etape = 0; etape < 3; etape += 1) {
      const f = fonds[etape]
      if (f === undefined) continue
      if (sombre) {
        f.centre.copy(nuit)
        f.milieu.copy(nuit).lerp(n800, 0.08 + etape * 0.05)
        f.bord.copy(nuit).lerp(n800, 0.3 + etape * 0.12)
      } else {
        f.centre.copy(blanc)
        f.milieu.copy(blanc).lerp(n100, 0.32 + etape * 0.1)
        f.bord
          .copy(n100)
          .lerp(etape === 2 ? n300 : n200, etape === 0 ? 0.45 : etape === 1 ? 0.85 : 0.35)
      }
    }
  }
  refaireLesFonds()
  scene.background = fonds[0]?.centre.clone() ?? new three.Color('#ffffff')

  const observateurTheme = new MutationObserver(refaireLesFonds)
  observateurTheme.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'class', 'style'],
  })
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', refaireLesFonds)

  /* ----- La toile de fond : un eventail a trois anneaux, degrade radial --- */

  const SEGMENTS = 48
  const toile = new three.BufferGeometry()
  {
    const sommets: number[] = [0, 0, 0]
    for (const rayon of [0.42, 1]) {
      for (let i = 0; i < SEGMENTS; i += 1) {
        const a = (i / SEGMENTS) * Math.PI * 2
        sommets.push(Math.cos(a) * rayon, Math.sin(a) * rayon, 0)
      }
    }
    const index: number[] = []
    for (let i = 0; i < SEGMENTS; i += 1) {
      const suivant = (i + 1) % SEGMENTS
      index.push(0, 1 + i, 1 + suivant)
      const a = 1 + i,
        b = 1 + suivant,
        c = 1 + SEGMENTS + i,
        d = 1 + SEGMENTS + suivant
      index.push(a, c, d, a, d, b)
    }
    toile.setIndex(index)
    toile.setAttribute('position', new three.Float32BufferAttribute(sommets, 3))
    toile.setAttribute(
      'color',
      new three.Float32BufferAttribute(new Array(sommets.length).fill(1), 3),
    )
  }
  const matiereToile = new three.MeshBasicMaterial({
    vertexColors: true,
    toneMapped: false,
    depthWrite: false,
  })
  const fond = new three.Mesh(toile, matiereToile)
  fond.position.z = -8
  fond.renderOrder = -1
  scene.add(fond)
  const couleurToile = toile.getAttribute('color')
  const centreCourant = new three.Color()
  const milieuCourant = new three.Color()
  const bordCourant = new three.Color()
  const peindreLaToile = (): void => {
    couleurToile.setXYZ(0, centreCourant.r, centreCourant.g, centreCourant.b)
    for (let i = 0; i < SEGMENTS; i += 1) {
      couleurToile.setXYZ(1 + i, milieuCourant.r, milieuCourant.g, milieuCourant.b)
      couleurToile.setXYZ(1 + SEGMENTS + i, bordCourant.r, bordCourant.g, bordCourant.b)
    }
    couleurToile.needsUpdate = true
  }

  /* ----- L eclairage ---------------------------------------------------- */

  eclairer(contexte, {
    cle: 0xffffff,
    remplissage: 0xffe2c4,
    contour: 0xffffff,
    force: 0.55,
  })
  const ciel = new three.HemisphereLight(0xffffff, palettes.ambre.moyenne.getHex(), 1.5)
  const rasante = new three.DirectionalLight(0xffffff, 0.9)
  rasante.position.set(8, 7, -8)
  const face = new three.DirectionalLight(0xffffff, 0.35)
  face.position.set(0, 0, 11)
  scene.add(ciel, rasante, face)

  /* ----- Les bornes de l ecran ------------------------------------------ */

  let largeurVue = 10
  let hauteurVue = 6
  let aspect = 0
  const mesurer = (): void => {
    const fovRad = (camera.fov * Math.PI) / 180
    hauteurVue = 2 * Math.tan(fovRad / 2) * camera.position.z
    largeurVue = hauteurVue * camera.aspect
    aspect = camera.aspect
    // La toile de fond couvre tout le cadre a sa profondeur.
    const profondeur = camera.position.z - fond.position.z
    const hauteurToile = 2 * Math.tan(fovRad / 2) * profondeur
    const rayonToile = Math.hypot(hauteurToile, hauteurToile * camera.aspect) * 0.55
    fond.scale.setScalar(rayonToile)
  }

  /* ----- Les spheres ---------------------------------------------------- */

  const geometrie = new three.SphereGeometry(1, 40, 40)
  const spheres: Sphere[] = []
  const nombre = nombreDeSpheres()
  const verrePossible = quality !== 'low'

  for (let i = 0; i < nombre; i += 1) {
    let rayon = 0.33
    const tirage = Math.random()
    if (tirage < 0.3) rayon = 0.27 + Math.random() * 0.12
    else if (tirage < 0.8) rayon = 0.42 + Math.random() * 0.18
    else rayon = 0.66 + Math.random() * 0.21
    const masse = rayon ** 3

    const enVerre = Math.random() < 0.22
    let role: Role = 'moyenne'
    let matiere: Matiere
    if (enVerre) {
      role = 'verre'
      matiere = new three.MeshPhysicalMaterial({
        color: palettes.ambre.verre,
        roughness: 0.08,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        transmission: verrePossible ? 0.92 : 0,
        ior: 1.48,
        thickness: 2.2,
        specularIntensity: 1,
        attenuationColor: palettes.ambre.pastel,
        attenuationDistance: 1,
        emissive: palettes.ambre.verre,
        emissiveIntensity: 0.12,
        transparent: true,
        opacity: verrePossible ? 1 : 0.7,
      })
    } else {
      const t = Math.random()
      role = t < 0.25 ? 'pastel' : t < 0.55 ? 'claire' : t < 0.85 ? 'moyenne' : 'profonde'
      matiere = new three.MeshPhysicalMaterial({
        color: palettes.ambre[role],
        roughness: 0.44,
        metalness: 0,
        clearcoat: 0.24,
        clearcoatRoughness: 0.35,
        emissive: palettes.ambre[role],
        emissiveIntensity: 0.08,
        transparent: true,
      })
    }

    const groupe = new three.Group()
    const maille = new three.Mesh(geometrie, matiere)
    maille.scale.setScalar(rayon)
    groupe.add(maille)
    scene.add(groupe)

    spheres.push({
      id: i,
      rayon,
      masse,
      position: new three.Vector3(),
      vitesse: new three.Vector3(),
      groupe,
      maille,
      matiere,
      role,
      enVerre,
      cible: new three.Vector3(),
      echelle: rayon,
    })
  }

  const rayonMoyen = spheres.reduce((s, b) => s + b.rayon, 0) / spheres.length
  let echelleSigle = 1

  /**
   * Les cibles du sigle : a pas d arc constant sur la mediane du trait, deux
   * rangees en quinconce. Le sigle est carre, borne par l axe le plus court.
   */
  const viserLeSigle = (): void => {
    const S = Math.min(largeurVue * 0.28, hauteurVue * 0.33)
    const cy = -hauteurVue * 0.02
    echelleSigle = Math.max(0.3, Math.min(1, (S * 0.09) / rayonMoyen))
    for (let i = 0; i < spheres.length; i += 1) {
      const s = spheres[i]
      if (s === undefined) continue
      const t = (i + 0.5) / spheres.length
      const ecart = ((i % 2) - 0.5) * 2 * DEMI_ECART
      const [x, y] = pointDuSigle(t, ecart)
      s.cible.set(x * S, y * S + cy, (Math.random() - 0.5) * 0.35)
    }
  }

  /** Garer les spheres loin hors champ ; avec elan, elles deboulent de partout. */
  const disperser = (avecElan: boolean): void => {
    const R = Math.max(largeurVue, hauteurVue) * 1.5
    for (const s of spheres) {
      const a = Math.random() * Math.PI * 2
      const px = Math.cos(a) * R * 1.25
      const py = Math.sin(a) * R * 0.85
      const pz = (Math.random() - 0.5) * 4
      s.position.set(px, py, pz)
      s.groupe.position.copy(s.position)
      if (avecElan)
        s.vitesse
          .set(-px, -py, -pz)
          .normalize()
          .multiplyScalar(0.08 + Math.random() * 0.05)
      else s.vitesse.set(0, 0, 0)
    }
  }

  mesurer()
  viserLeSigle()
  disperser(false)

  /* ----- Le pointeur, projete dans le plan des spheres ------------------ */

  const projection = new three.Vector3()
  const pointeurMonde = new three.Vector3()
  const pointeurPrecedent = new three.Vector3()
  const projeter = (): void => {
    projection.set(commande.pointeur.x, commande.pointeur.y, 0.5).unproject(camera)
    const dir = projection.sub(camera.position).normalize()
    const distance = -camera.position.z / dir.z
    pointeurMonde.copy(camera.position).add(dir.multiplyScalar(distance))
  }

  const surMouvement = (e: PointerEvent): void => {
    const boite = hote.getBoundingClientRect()
    commande.pointeur.x = ((e.clientX - boite.left) / Math.max(1, boite.width)) * 2 - 1
    commande.pointeur.y = -((e.clientY - boite.top) / Math.max(1, boite.height)) * 2 + 1
    commande.pointeur.dedans = true
  }
  const surAppui = (): void => {
    commande.pointeur.enfonce = true
  }
  const surRelache = (): void => {
    commande.pointeur.enfonce = false
  }
  const surSortie = (): void => {
    commande.pointeur.dedans = false
  }
  window.addEventListener('pointermove', surMouvement, { passive: true })
  window.addEventListener('pointerdown', surAppui)
  window.addEventListener('pointerup', surRelache)
  document.addEventListener('pointerleave', surSortie)

  /* ----- La boucle ------------------------------------------------------ */

  const ecart = new three.Vector3()
  const ecartCollision = new three.Vector3()
  const vitesseRelative = new three.Vector3()
  const deplacement = new three.Vector3()
  const axe = new three.Vector3()
  let lance = false
  let debutEntree = 0
  const REBOND_MUR = -0.3
  const FORCE_POINTEUR = 0.05
  const RAYON_POINTEUR = 4.4
  const RESSORT_CENTRE = 0.0035
  const ELASTICITE = 0.02

  const animer = (image: SceneFrame): void => {
    const { time, delta } = image
    // Les vitesses sont exprimees par image a soixante hertz ; `pas` ramene
    // chaque image reelle a cette unite, pour que la chute pese pareil a
    // trente et a cent vingt images par seconde.
    const pas = Math.min(delta, 1 / 30) * 60

    if (camera.aspect !== aspect) {
      mesurer()
      viserLeSigle()
    }
    projeter()

    if (commande.demarre && !lance) {
      lance = true
      debutEntree = time
      disperser(true)
    }

    const p = commande.progression
    const etape = p > 1.55 ? 2 : p > 0.7 ? 1 : 0

    // Les fondus entre les modes : agglutination, chute, sigle, envol.
    const herosF = 1 - lisse(0.3, 0.8, p)
    const chuteBrute = lisse(0.4, 0.95, p)
    const envolF = lisse(2.7, 3.45, p)
    const sigleF = lisse(1.4, 2.05, p) * (1 - lisse(2.55, 3.0, p))
    const chuteF = chuteBrute * (1 - lisse(1.25, 1.75, p))

    // Le morph de palette, sur la meme horloge : ambre, cuivre, marque.
    const versCuivre = lisse(0.55, 1.05, p)
    const versMarque = lisse(1.4, 1.95, p)
    for (const role of ROLES) {
      courante[role]
        .copy(palettes.ambre[role])
        .lerp(palettes.cuivre[role], versCuivre)
        .lerp(palettes.marque[role], versMarque)
    }
    ciel.groundColor.copy(courante.moyenne)

    // Le fond suit l etape en fondant, jamais par a-coup.
    const f = fonds[etape] ?? fonds[0]
    if (f !== undefined) {
      const part = 1 - Math.exp(-2.2 * delta)
      centreCourant.lerp(f.centre, part)
      milieuCourant.lerp(f.milieu, part)
      bordCourant.lerp(f.bord, part)
      peindreLaToile()
      if (scene.background instanceof three.Color) scene.background.copy(bordCourant)
    }

    if (!lance) return

    const entreeT = sortieCubique(borne01((time - debutEntree) / 2.2))
    const renfort = entre(7.5, 1, entreeT)
    const pointeurActif =
      commande.pointeur.dedans &&
      (Math.abs(commande.pointeur.x) < 0.99 || Math.abs(commande.pointeur.y) < 0.99)
    let elan = pointeurActif ? pointeurMonde.distanceTo(pointeurPrecedent) : 0
    if (elan > 3) elan = 3
    pointeurPrecedent.copy(pointeurMonde)

    let amortissement = 0.91
    amortissement = entre(amortissement, 0.992, chuteF)
    amortissement = entre(amortissement, 0.9, sigleF)
    amortissement = entre(amortissement, 0.985, envolF)
    const amortiPas = amortissement ** pas
    const camZ = camera.position.z
    const agglutination = Math.max(herosF, entreeT < 1 ? 1 : 0)

    // 1. Les accelerations.
    for (const s of spheres) {
      if (herosF > 0.01) {
        s.vitesse.x += Math.sin(time * 0.4 + s.id * 1.5) * 0.0004 * s.rayon * herosF * pas
        s.vitesse.y += Math.cos(time * 0.5 + s.id * 1.2) * 0.0004 * s.rayon * herosF * pas
        s.vitesse.z += Math.sin(time * 0.35 + s.id) * 0.0001 * herosF * pas
      }
      const ressort = RESSORT_CENTRE * renfort * agglutination
      if (ressort > 0.00001) {
        s.vitesse.x += -s.position.x * ressort * 0.38 * pas
        s.vitesse.y += -s.position.y * ressort * 1.85 * pas
        s.vitesse.z += -s.position.z * ressort * 1.8 * pas
      }
      // La chute : la gravite, integree par l horloge.
      if (chuteF > 0.001) s.vitesse.y -= 0.011 * chuteF * pas
      // Le ressort de mise en forme du sigle.
      if (sigleF > 0.001) {
        const k = 0.06 * sigleF * pas
        s.vitesse.x += (s.cible.x - s.position.x) * k
        s.vitesse.y += (s.cible.y - s.position.y) * k
        s.vitesse.z += (s.cible.z - s.position.z) * k
      }
      // L envol : vers la camera, en s ecartant, decale sphere par sphere.
      if (envolF > 0.001) {
        const decalage = (s.id * 0.6180339887) % 1
        const local = lisse(decalage * 0.55, decalage * 0.55 + 0.45, envolF)
        s.vitesse.z += 0.05 * local * pas
        s.vitesse.x += s.position.x * 0.006 * local * pas
        s.vitesse.y += s.position.y * 0.006 * local * pas
      }
      // La repulsion par le pointeur, dans tous les modes ; un balayage rapide
      // projette fort — c est ce qui rend le champ tactile.
      if (pointeurActif) {
        ecart.subVectors(s.position, pointeurMonde)
        const distance = ecart.length()
        const enfonce = commande.pointeur.enfonce
        const rayonActif = enfonce ? RAYON_POINTEUR * 1.4 : RAYON_POINTEUR
        const forceActive = enfonce ? FORCE_POINTEUR * 1.7 : FORCE_POINTEUR
        if (distance < rayonActif && distance > 0.0001) {
          const ratio = distance / rayonActif
          const doux = 1 - ratio * ratio * (3 - 2 * ratio)
          const poussee = doux * forceActive * (1 + elan * 3.2) * pas
          ecart.normalize()
          ecart.z *= 0.12
          ecart.normalize()
          s.vitesse.addScaledVector(ecart, poussee)
        }
      }

      s.vitesse.multiplyScalar(amortiPas)
      s.position.addScaledVector(s.vitesse, pas)

      const c = courante[s.role]
      s.matiere.color.copy(c)
      s.matiere.emissive.copy(c)
      s.matiere.opacity =
        envolF > 0.001
          ? 1 - lisse(camZ - 2.6, camZ - 0.3, s.position.z)
          : s.enVerre && !verrePossible
            ? 0.7
            : 1

      const echelleVisee = s.rayon * (1 - (1 - echelleSigle) * sigleF)
      s.echelle += (echelleVisee - s.echelle) * 0.12
      s.maille.scale.setScalar(s.echelle)
    }

    // 2. Les collisions deux a deux — presque coupees en mode sigle, pour que
    // chaque sphere se plante sur sa cible et que le trait lise continu.
    const echelleCollision = 0.28 * (1 - 0.93 * sigleF) * (1 - envolF)
    for (let etapeCollision = 0; etapeCollision < 4; etapeCollision += 1) {
      for (let i = 0; i < spheres.length; i += 1) {
        const a = spheres[i]
        if (a === undefined) continue
        for (let j = i + 1; j < spheres.length; j += 1) {
          const b = spheres[j]
          if (b === undefined) continue
          ecartCollision.subVectors(b.position, a.position)
          const distance = ecartCollision.length()
          const minimum = a.echelle + b.echelle
          if (distance < minimum && distance > 0.001) {
            const chevauchement = minimum - distance
            ecartCollision.multiplyScalar(1 / distance)
            const masseTotale = a.masse + b.masse
            a.position.addScaledVector(
              ecartCollision,
              (-chevauchement * b.masse * echelleCollision) / masseTotale,
            )
            b.position.addScaledVector(
              ecartCollision,
              (chevauchement * a.masse * echelleCollision) / masseTotale,
            )
            vitesseRelative.subVectors(b.vitesse, a.vitesse)
            const normale = vitesseRelative.dot(ecartCollision)
            if (normale < -0.0001) {
              const impulsion =
                (-(1 + ELASTICITE) * normale) / (1 / a.masse + 1 / b.masse)
              a.vitesse.addScaledVector(ecartCollision, -impulsion / a.masse)
              b.vitesse.addScaledVector(ecartCollision, impulsion / b.masse)
            }
          }
        }
      }
    }

    // 3. Les murs, le sol qui rebondit, le plafond, la profondeur.
    const xMax = largeurVue / 2 - 0.2
    const haut = hauteurVue / 2 - 0.05
    const sol = -hauteurVue / 2 + 0.05
    const zMax = 2
    const restitution = 0.3 + 0.35 * chuteF
    const contenir = envolF < 0.5
    const contenirZ = envolF < 0.02
    for (const s of spheres) {
      const r = s.echelle
      if (contenir) {
        if (s.position.x < -xMax - r) {
          s.position.x = -xMax - r
          s.vitesse.x *= REBOND_MUR
        } else if (s.position.x > xMax + r) {
          s.position.x = xMax + r
          s.vitesse.x *= REBOND_MUR
        }
        if (s.position.y - r < sol) {
          s.position.y = sol + r
          if (s.vitesse.y < 0) s.vitesse.y = -s.vitesse.y * restitution
          if (chuteF > 0.3) {
            s.vitesse.x *= 0.86
            s.vitesse.z *= 0.86
          }
        }
        if (s.position.y + r > haut) {
          s.position.y = haut - r
          if (s.vitesse.y > 0) s.vitesse.y *= REBOND_MUR
        }
      }
      if (contenirZ) {
        if (s.position.z < -zMax) {
          s.position.z = -zMax
          s.vitesse.z *= REBOND_MUR
        } else if (s.position.z > zMax) {
          s.position.z = zMax
          s.vitesse.z *= REBOND_MUR
        }
      }
      // Le roulement, deduit du deplacement.
      deplacement.copy(s.position).sub(s.groupe.position)
      if (deplacement.lengthSq() > 0.000001) {
        axe.set(deplacement.y, -deplacement.x, 0).normalize()
        s.groupe.rotateOnWorldAxis(axe, (deplacement.length() / s.rayon) * 0.95)
      }
      s.groupe.position.copy(s.position)
    }
  }

  const demonter = (): void => {
    window.removeEventListener('pointermove', surMouvement)
    window.removeEventListener('pointerdown', surAppui)
    window.removeEventListener('pointerup', surRelache)
    document.removeEventListener('pointerleave', surSortie)
    observateurTheme.disconnect()
    media.removeEventListener('change', refaireLesFonds)
    for (const s of spheres) s.matiere.dispose()
    geometrie.dispose()
    toile.dispose()
    matiereToile.dispose()
  }

  return { animer, demonter }
}

/* ============================ La feuille de survol ==================== */

const STYLE_ID = 'o-vitrine-gravity'

/**
 * Les survols composes : l orbe qui tourne, le lustre qui balaie la carte, la
 * fleche qui se decouvre. Le systeme n a pas de variante de groupe ; une regle
 * par geste, posee une fois par document.
 */
const FEUILLE = [
  '[data-gv-groupe]:hover [data-gv-orbe]{transform:rotate(45deg)}',
  '[data-gv-groupe]:hover [data-gv-lustre]{transform:translateX(140%) skewX(12deg)}',
  '[data-gv-groupe]:hover [data-gv-fleche]{opacity:1;transform:none}',
  '[data-gv-groupe][data-gv-carte]:hover{transform:translateY(-4px)}',
  '@media (prefers-reduced-motion:reduce){[data-gv-groupe]:hover [data-gv-lustre]{transform:translateX(-140%) skewX(12deg)}}',
].join('')

function useFeuille(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_ID) !== null) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = FEUILLE
    document.head.append(style)
  }, [])
}

/* ============================ Les petites pieces ======================= */

/** Le libelle d index, precede d une pastille a l accent vivant. */
function Surtitre({ children }: { readonly children: ReactNode }): ReactElement {
  return (
    <span
      className="o-inline-flex o-items-center o-gap-2.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-transition-colors"
      style={{ color: 'var(--o-gv-encre)', transitionDuration: '1100ms' }}
    >
      <span
        aria-hidden="true"
        className="o-inline-block o-size-1.5 o-rounded-full"
        style={{
          background: 'var(--o-gv-accent)',
          boxShadow: '0 0 10px var(--o-gv-accent)',
        }}
      />
      {children}
    </span>
  )
}

/** Le mot d accent : l italique de serif, a l encre vivante. */
function Italique({ children }: { readonly children: ReactNode }): ReactElement {
  return (
    <em
      className="o-font-serif o-italic o-font-normal o-transition-colors"
      style={{
        color: 'var(--o-gv-encre)',
        letterSpacing: '-0.01em',
        transitionDuration: '1100ms',
      }}
    >
      {children}
    </em>
  )
}

/** Une entree gardee par le rideau : opacite et montee, sous un masque de ligne. */
function Ligne({
  delai,
  children,
}: {
  readonly delai: number
  readonly children: ReactNode
}): ReactElement {
  const pret = usePret()
  const { reduced } = useMotionState()
  return (
    <span
      className="o-block o-overflow-hidden"
      style={{ paddingBottom: '0.12em', marginBottom: '-0.12em' }}
    >
      <span
        className="o-block"
        style={{
          transform: pret || reduced ? 'none' : 'translate3d(0, 110%, 0)',
          opacity: pret ? 1 : 0,
          transition: reduced
            ? `opacity 300ms ease ${String(delai)}ms`
            : `transform 1000ms ${COURBE} ${String(delai)}ms, opacity 300ms ease ${String(delai)}ms`,
        }}
      >
        {children}
      </span>
    </span>
  )
}

/** Une entree gardee par le rideau, sans masque : opacite et petite montee. */
function Arrive({
  delai,
  className,
  children,
}: {
  readonly delai: number
  readonly className?: string
  readonly children: ReactNode
}): ReactElement {
  const pret = usePret()
  const { reduced } = useMotionState()
  return (
    <div
      className={className}
      style={{
        opacity: pret ? 1 : 0,
        transform: pret || reduced ? 'none' : 'translate3d(0, 16px, 0)',
        transition: reduced
          ? `opacity 300ms ease ${String(delai)}ms`
          : `opacity 800ms ${COURBE} ${String(delai)}ms, transform 800ms ${COURBE} ${String(delai)}ms`,
      }}
    >
      {children}
    </div>
  )
}

/** La revelation a l entree dans le champ : flou et montee, une fois. */
function Revele({
  delai = 0,
  className,
  children,
}: {
  readonly delai?: number
  readonly className?: string
  readonly children: ReactNode
}): ReactElement {
  const { reduced } = useMotionState()
  const [ref, vu] = useInView<HTMLDivElement>({ threshold: 0.35, once: true })
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: vu ? 1 : 0,
        transform: vu || reduced ? 'none' : 'translate3d(0, 42px, 0)',
        filter: vu || reduced ? 'none' : 'blur(8px)',
        transition: reduced
          ? `opacity 400ms ease ${String(delai)}ms`
          : `opacity 700ms ${COURBE} ${String(delai)}ms, transform 1400ms ${COURBE} ${String(delai)}ms, filter 1400ms ${COURBE} ${String(delai)}ms`,
      }}
    >
      {children}
    </div>
  )
}

/** L orbe flechee, au bout des gelules. */
function Orbe({ taille = 32 }: { readonly taille?: number }): ReactElement {
  return (
    <span
      data-gv-orbe=""
      className="o-flex o-shrink-0 o-items-center o-justify-center o-rounded-full o-text-white o-transition-transform"
      style={{
        width: taille,
        height: taille,
        background: ORBE,
        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)',
      }}
    >
      <Icon icon={ArrowUpRight} size={Math.round(taille / 2)} aria-hidden="true" />
    </span>
  )
}

/** Les trois cartes de la chute, telles que la source les ecrit. */
const CARTES = [
  {
    n: '01',
    k: 'Solveur',
    v: 'Verlet',
    u: '· 4 sous-pas',
    d: 'Empilement stable a 60 fps',
  },
  {
    n: '02',
    k: 'Restitution',
    v: '0,65',
    u: 'rebond',
    d: 'De l energie perdue a chaque contact',
  },
  {
    n: '03',
    k: 'Corps',
    v: 'Temps reel',
    u: 'sur GPU',
    d: 'Aucune animation pre-calculee',
  },
] as const

/** Les rubriques de la barre. */
const RUBRIQUES = [
  ['#physique', 'Realisations'],
  ['#forme', 'Services'],
  ['#liberation', 'Equipe'],
  ['#pied', 'Histoire'],
] as const

/** Les colonnes du pied. */
const COLONNES = [
  { titre: 'Studio', liens: ['Realisations', 'Services', 'Methode', 'Carrieres'] },
  { titre: 'Maison', liens: ['Histoire', 'Equipe', 'Journal', 'Contact'] },
  { titre: 'Reseaux', liens: ['Twitter', 'Instagram', 'LinkedIn', 'Dribbble'] },
] as const

const COURRIEL = 'mailto:bonjour@odoro.studio'

/* ============================ Le contenu =============================== */

/** Le site, sous le rideau. */
function Contenu({
  commande,
  onPret,
}: {
  readonly commande: Commande
  readonly onPret: () => void
}): ReactElement {
  useFeuille()
  const { reduced } = useMotionState()
  const pret = usePret()
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [etape, setEtape] = useState(0)
  const [racine, setRacine] = useState<HTMLDivElement | null>(null)
  const rail = useRef<HTMLDivElement>(null)
  const hote = useRef<HTMLDivElement | null>(null)

  // Le champ : construit une fois, anime a chaque image par l horloge.
  const champ = useRef<ReturnType<typeof construireLeChamp> | null>(null)
  const construire = useCallback(
    (contexte: SceneContext) => {
      const element = hote.current
      if (element === null) return
      champ.current = construireLeChamp(contexte, commande, element)
      return () => {
        champ.current?.demonter()
        champ.current = null
      }
    },
    [commande],
  )
  const animer = useCallback((_contexte: SceneContext, image: SceneFrame) => {
    champ.current?.animer(image)
  }, [])
  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'champ de gravite',
    setup: construire,
    frame: animer,
    pauseOffscreen: false,
  })

  useEffect(() => {
    if (ready || refused !== undefined) onPret()
  }, [ready, refused, onPret])

  // Le rideau a rendu la main : les spheres deboulent.
  useEffect(() => {
    if (pret) commande.demarre = true
  }, [pret, commande])

  // Une seule horloge de defilement, amortie : elle nourrit la scene, l etape
  // de couleur et le rail d avancement. Un cran de molette pousse la cible ;
  // la valeur rendue la rattrape, et continue de couler apres le geste.
  useEffect(() => {
    if (racine === null) return
    let haut = 0
    const mesurer = (): void => {
      haut = racine.getBoundingClientRect().top + window.scrollY
    }
    mesurer()
    const observateur = new ResizeObserver(mesurer)
    observateur.observe(document.documentElement)

    const brut = (): number =>
      (window.scrollY - haut) / Math.max(1, window.innerHeight - CHROME)
    let courant = brut()
    let etapeCourante = -1
    const appliquer = (): void => {
      commande.progression = courant
      const e = courant > 1.55 ? 2 : courant > 0.7 ? 1 : 0
      if (e !== etapeCourante) {
        etapeCourante = e
        setEtape(e)
      }
      const course = document.documentElement.scrollHeight - window.innerHeight || 1
      const pct = Math.min(1, Math.max(0, window.scrollY / course))
      if (rail.current !== null)
        rail.current.style.height = `${String(Math.round(pct * 100))}%`
    }
    appliquer()

    if (reduced) {
      const surDefilement = (): void => {
        courant = brut()
        appliquer()
      }
      window.addEventListener('scroll', surDefilement, { passive: true })
      return () => {
        window.removeEventListener('scroll', surDefilement)
        observateur.disconnect()
      }
    }

    const abonnement = clock.subscribe(
      ({ delta }) => {
        const cible = brut()
        courant += (cible - courant) * (1 - Math.exp(-4.2 * delta))
        if (Math.abs(cible - courant) < 0.00005) courant = cible
        appliquer()
      },
      { name: 'gravity : defilement', priority: CLOCK_PRIORITY.input },
    )
    return () => {
      abonnement.unsubscribe()
      observateur.disconnect()
    }
  }, [racine, commande, reduced])

  // L accent d interface suit la palette vivante : ambre, cuivre, orange ODORO.
  // L encre fonce a mesure que la teinte sature — sinon le texte se delave sur
  // un fond de plus en plus chaud ; sous la nuit, elle s eclaircit.
  const accents = {
    '--o-gv-accent': accent(300 + etape * 100),
    '--o-gv-encre': `light-dark(var(--o-vitrine-${String(700 + etape * 100)}), var(--o-vitrine-${String(300 - Math.min(etape, 1) * 100)}))`,
  } as CSSProperties

  const gelule = `o-inline-flex o-items-center o-rounded-full o-no-underline o-transition-colors ${VERRE} focus:o-ring`

  return (
    <div ref={setRacine} className={`o-relative ${ENCRE}`} style={accents}>
      {/*
        ----- Le champ, fixe derriere toute la page ---------------------------

        Le contexte est opaque : le fond du papier est peint dans la scene.
        Sous mouvement reduit ou sans WebGL, le semis de disques prend la place.
      */}
      {refused === undefined ? (
        <div
          ref={(element) => {
            ref.current = element
            hote.current = element
          }}
          aria-hidden="true"
          className="o-pointer-events-none o-fixed o-inset-x-0 o-bottom-0 o-z-0"
          style={{ top: CHROME }}
        />
      ) : (
        <div
          aria-hidden="true"
          className="o-pointer-events-none o-fixed o-inset-x-0 o-bottom-0 o-z-0 o-flex o-items-center o-justify-center o-p-10"
          style={{
            top: CHROME,
            background: `radial-gradient(circle at center, var(--o-theme-bg) 0%, color-mix(in oklab, var(--o-vitrine-100) 40%, var(--o-theme-bg)) 38%, color-mix(in oklab, var(--o-vitrine-300) 45%, var(--o-theme-bg)) 100%)`,
          }}
        >
          <div
            className="o-size-full"
            style={{ maxWidth: 'min(70vh, 80vw)', maxHeight: 'min(70vh, 80vw)' }}
          >
            <SigleSeme />
          </div>
        </div>
      )}

      {/* Le grain argentique, sur toute l experience. */}
      <Noise
        className="o-pointer-events-none o-fixed o-inset-x-0 o-bottom-0 o-z-20"
        style={{ top: CHROME }}
        opacity={0.05}
        scale={0.9}
      />

      {/* Le rail d avancement, sur le bord droit. */}
      <div
        aria-hidden="true"
        className="o-fixed o-z-30 o-hidden o-rounded-full md:o-block"
        style={{
          right: 22,
          top: `calc(50% + ${String(CHROME / 2)}px)`,
          transform: 'translateY(-50%)',
          height: 140,
          width: 1,
          background: 'color-mix(in srgb, currentColor 14%, transparent)',
          opacity: pret ? 1 : 0,
          transition: 'opacity 1000ms ease 600ms',
        }}
      >
        <div
          ref={rail}
          className="o-absolute o-left-0 o-top-0 o-w-px o-rounded-full"
          style={{
            height: '0%',
            background: 'var(--o-gv-encre)',
            boxShadow: '0 0 8px var(--o-gv-accent)',
            transition: 'height 200ms linear',
          }}
        />
      </div>

      {/*
        ----- L en-tete -------------------------------------------------------
      */}
      <header
        className="o-pointer-events-none o-fixed o-inset-x-0 o-z-40 o-flex o-items-center o-justify-between o-px-6 md:o-px-12"
        style={{
          top: CHROME,
          height: 88,
          opacity: pret ? 1 : 0,
          transform: pret || reduced ? 'none' : 'translate3d(0, -16px, 0)',
          transition: `opacity 800ms ${COURBE}, transform 800ms ${COURBE}`,
        }}
      >
        <Aimant force={0.25} className="o-pointer-events-auto">
          <a
            href="#haut"
            className={`o-flex o-items-center o-gap-2.5 o-no-underline o-select-none ${ENCRE} focus:o-ring`}
            aria-label="odoro, revenir en haut"
          >
            <Sigle
              taille={26}
              style={{
                color: 'var(--o-gv-accent)',
                filter: 'drop-shadow(0 0 10px var(--o-gv-accent))',
                transition: 'color 1100ms',
              }}
            />
            <span className="o-text-xl o-font-semibold o-lowercase o-tracking-tight md:o-text-2xl">
              odoro
            </span>
          </a>
        </Aimant>

        <div className="o-pointer-events-auto o-flex o-items-center o-gap-2 md:o-gap-3">
          <nav
            aria-label="Navigation"
            className={`o-hidden o-items-center o-gap-1 o-rounded-full o-px-2 o-py-1.5 o-text-sm o-font-medium md:o-flex ${VERRE}`}
          >
            {RUBRIQUES.map(([href, mot]) => (
              <a
                key={href}
                href={href}
                className={`o-rounded-full o-px-4 o-py-1.5 o-no-underline o-transition-colors ${ENCRE} hover:o-bg-white-40 dark:hover:o-bg-zinc-800 focus:o-ring`}
              >
                {mot}
              </a>
            ))}
          </nav>

          <Aimant force={0.35}>
            <a
              href={COURRIEL}
              data-gv-groupe=""
              className={`o-gap-3.5 o-py-1.5 o-pl-6 o-pr-1.5 o-text-sm o-font-medium ${gelule} ${ENCRE} hover:o-bg-white-70 dark:hover:o-bg-zinc-800`}
            >
              Parlons-en
              <Orbe />
            </a>
          </Aimant>

          <button
            type="button"
            onClick={() => {
              setMenuOuvert(true)
            }}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOuvert}
            className={`o-flex o-size-11 o-items-center o-justify-center o-rounded-full md:o-hidden ${VERRE} ${ENCRE} focus:o-ring`}
          >
            <Icon icon={Menu} size={20} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/*
        ----- 01 — Le heros ---------------------------------------------------
      */}
      <section
        id="haut"
        className="o-relative o-z-10 o-flex o-w-full o-items-end"
        style={{ minHeight: ECRAN }}
      >
        <div className="o-w-full o-px-6 o-pb-12 md:o-px-12 md:o-pb-16">
          <div className="o-flex o-flex-col o-justify-between o-gap-8 md:o-flex-row md:o-items-end">
            <div className="o-flex o-flex-col o-items-start o-gap-5 md:o-gap-6">
              <Arrive delai={150}>
                <Surtitre>Studio numerique independant</Surtitre>
              </Arrive>
              <h1
                className="o-m-0 o-select-none"
                style={{
                  ...affiche('l', 500),
                  fontSize: 'clamp(3rem, 8.4vw, 7rem)',
                  letterSpacing: '-0.035em',
                  lineHeight: 0.92,
                }}
              >
                <Ligne delai={250}>Moins de bruit.</Ligne>
                <Ligne delai={380}>
                  Plus de <Italique>gravite.</Italique>
                </Ligne>
              </h1>
            </div>

            <Arrive
              delai={550}
              className="o-shrink-0 o-pb-1 o-text-left md:o-w-72 md:o-pb-3"
            >
              <p className={`o-m-0 o-text-base o-leading-snug ${ENCRE}`}>
                Nous concevons des experiences numeriques qui ecartent la distraction et
                mettent l attention en orbite.
              </p>
              <p
                className={`o-m-0 o-mt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest ${FAIBLE}`}
              >
                © 2026 — Studio ODORO
              </p>
              <div
                className={`o-mt-5 o-hidden o-items-center o-gap-2 md:o-flex ${DOUCE}`}
              >
                <span
                  className={reduced ? 'o-inline-flex' : 'o-inline-flex o-animate-bounce'}
                  aria-hidden="true"
                >
                  <Icon icon={ArrowDown} size={14} />
                </span>
                <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest">
                  Faites defiler pour entrer
                </span>
              </div>
            </Arrive>
          </div>
        </div>
      </section>

      {/*
        ----- 02 — La chute ---------------------------------------------------
      */}
      <section
        id="physique"
        className="o-relative o-z-10 o-flex o-w-full o-scroll-mt-24 o-items-center o-px-6 o-pb-40 o-pt-32 md:o-px-12 md:o-pt-40"
        style={{ minHeight: ECRAN }}
      >
        <div className="o-grid o-w-full o-items-start o-gap-10 lg:o-grid-cols-12 lg:o-gap-16">
          <div className="o-min-w-0 lg:o-col-span-7">
            <Revele>
              <Surtitre>02 — Physique</Surtitre>
            </Revele>
            <Revele delai={100}>
              <h2
                className="o-m-0 o-mt-7"
                style={{
                  ...affiche('m', 500),
                  letterSpacing: '-0.035em',
                  lineHeight: 0.92,
                }}
              >
                Quand la structure
                <br className="o-hidden sm:o-block" /> <Italique>lache.</Italique>
              </h2>
            </Revele>
            <Revele delai={200}>
              <p
                className={`o-m-0 o-mt-8 o-max-w-lg o-text-base o-leading-relaxed md:o-text-lg ${DOUCE}`}
              >
                Continuez a faire defiler et le champ cede a la gravite. Chaque sphere
                obeit a une physique reellement simulee — masse, quantite de mouvement,
                restitution — degringole et rebondit sur le sol jusqu a ce que l energie
                finisse par se deposer.
              </p>
            </Revele>
          </div>

          <div className="o-min-w-0 lg:o-col-span-5 lg:o-pt-3">
            <Revele delai={250} className="o-relative o-flex o-flex-col o-gap-4">
              {CARTES.map((carte) => (
                <div
                  key={carte.k}
                  data-gv-groupe=""
                  data-gv-carte=""
                  className="o-relative o-flex o-items-center o-gap-5 o-overflow-hidden o-border-w-1 o-border-white-60 o-bg-white-40 o-px-6 o-py-5 o-backdrop-blur-2xl o-transition-transform md:o-gap-7 md:o-px-8 md:o-py-6 dark:o-border-zinc-700 dark:o-bg-zinc-900"
                >
                  {/* Le balayage de lustre en diagonale, au survol. */}
                  <span
                    aria-hidden="true"
                    data-gv-lustre=""
                    className="o-pointer-events-none o-absolute o-inset-0 o-transition-transform"
                    style={{
                      transform: 'translateX(-140%) skewX(12deg)',
                      background:
                        'linear-gradient(to right, transparent, rgba(255,255,255,0.55), transparent)',
                      transitionDuration: '1100ms',
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className="o-shrink-0 o-select-none o-font-light o-tracking-tight"
                    style={{
                      lineHeight: 1,
                      fontSize: 'clamp(2.75rem, 4vw, 3.4rem)',
                      backgroundImage:
                        'linear-gradient(140deg, var(--o-gv-accent) 0%, var(--o-gv-encre) 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    {carte.n}
                  </span>
                  <span
                    aria-hidden="true"
                    className="o-my-1.5 o-w-px o-shrink-0 o-self-stretch"
                    style={{ backgroundColor: 'var(--o-theme-line)' }}
                  />
                  <div className="o-min-w-0 o-flex-1">
                    <div className="o-flex o-items-center o-gap-2">
                      <span
                        className={`o-font-mono o-text-xs o-uppercase o-tracking-widest ${FAIBLE}`}
                      >
                        {carte.k}
                      </span>
                      <span className="o-ml-auto o-flex o-items-center o-gap-1.5">
                        <span className="o-relative o-flex o-size-1.5" aria-hidden="true">
                          <span
                            className={`o-absolute o-inline-flex o-size-full o-rounded-full o-opacity-60 ${reduced ? '' : 'o-animate-ping'}`}
                            style={{ background: 'var(--o-gv-accent)' }}
                          />
                          <span
                            className="o-relative o-inline-flex o-size-1.5 o-rounded-full"
                            style={{ background: 'var(--o-gv-accent)' }}
                          />
                        </span>
                        <span
                          className={`o-font-mono o-text-xs o-uppercase o-tracking-widest ${FAIBLE}`}
                        >
                          direct
                        </span>
                      </span>
                    </div>
                    <p
                      className={`o-m-0 o-mt-1.5 o-text-xl o-font-semibold o-leading-tight md:o-text-2xl ${ENCRE}`}
                    >
                      {carte.v}{' '}
                      <span className={`o-text-base o-font-normal ${FAIBLE}`}>
                        {carte.u}
                      </span>
                    </p>
                    <p className={`o-m-0 o-mt-0.5 o-text-sm ${FAIBLE}`}>{carte.d}</p>
                  </div>
                </div>
              ))}
            </Revele>
          </div>
        </div>
      </section>

      {/*
        ----- 03 — La forme : le sigle ----------------------------------------
      */}
      <section
        id="forme"
        className="o-relative o-z-10 o-flex o-w-full o-scroll-mt-24 o-flex-col o-justify-between o-px-6 o-py-36 md:o-px-12 md:o-py-44"
        style={{ minHeight: ECRAN }}
      >
        <div>
          <Revele>
            <Surtitre>03 — Forme</Surtitre>
          </Revele>
          <Revele delai={100}>
            <h2
              className="o-m-0 o-mt-7 o-max-w-2xl"
              style={{
                ...affiche('m', 500),
                letterSpacing: '-0.035em',
                lineHeight: 0.92,
              }}
            >
              Le chaos, puis la <Italique>forme.</Italique>
            </h2>
          </Revele>
        </div>

        <div className="o-max-w-sm o-self-end o-text-left md:o-text-right">
          <Revele delai={150}>
            <p className={`o-m-0 o-text-base o-leading-relaxed md:o-text-lg ${DOUCE}`}>
              Sortie de la chute libre, le champ se reassemble — chaque sphere trouve sa
              place dans le sigle ODORO. Promenez le curseur au travers, et regardez l
              ordre onduler, se disperser, puis se reprendre.
            </p>
          </Revele>
          <Revele delai={280}>
            <span
              className={`o-mt-7 o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-4 o-py-2.5 ${VERRE} ${DOUCE}`}
            >
              <Icon icon={MousePointer_2} size={14} aria-hidden="true" />
              <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest">
                Balayez au travers
              </span>
            </span>
          </Revele>
        </div>
      </section>

      {/*
        ----- 04 — La liberation : l envol dans l objectif --------------------
      */}
      <section
        id="liberation"
        className="o-relative o-z-10 o-flex o-w-full o-scroll-mt-24 o-flex-col o-items-center o-justify-center o-px-6 o-py-36 o-text-center md:o-px-12 md:o-py-44"
        style={{ minHeight: ECRAN }}
      >
        <div className="o-max-w-3xl">
          <Revele>
            <Surtitre>04 — Liberation</Surtitre>
          </Revele>
          <Revele delai={120}>
            <h2
              className="o-m-0 o-mt-8"
              style={{
                ...affiche('m', 500),
                fontSize: 'clamp(2.8rem, 7vw, 6rem)',
                letterSpacing: '-0.035em',
                lineHeight: 0.92,
              }}
            >
              Et puis,
              <br /> <Italique>l apesanteur.</Italique>
            </h2>
          </Revele>
          <Revele delai={240}>
            <p
              className={`o-m-0 o-mx-auto o-mt-8 o-max-w-md o-text-base o-leading-relaxed md:o-text-lg ${DOUCE}`}
            >
              Le champ tout entier decolle de l ecran et vous depasse — chaque sphere
              accelere dans l objectif jusqu a ce qu il ne reste que la lumiere. Moins de
              bruit.
            </p>
          </Revele>
        </div>
      </section>

      {/*
        ----- Le pied : toujours sombre, a coins arrondis ---------------------
      */}
      <footer
        id="pied"
        className="o-relative o-z-10 o-w-full o-scroll-mt-24 o-overflow-hidden o-rounded-t-3xl o-text-zinc-50"
        style={nuit('zinc')}
      >
        {/* Les halos doux, en echo a l accent vivant. */}
        <div
          aria-hidden="true"
          className="o-pointer-events-none o-absolute o-rounded-full o-opacity-40 o-blur-3xl"
          style={{
            top: -128,
            right: -96,
            width: 448,
            height: 448,
            background: 'radial-gradient(circle, var(--o-gv-accent) 0%, transparent 65%)',
          }}
        />
        <div
          aria-hidden="true"
          className="o-pointer-events-none o-absolute o-rounded-full o-opacity-25 o-blur-3xl"
          style={{
            bottom: -160,
            left: -128,
            width: 512,
            height: 512,
            background: 'radial-gradient(circle, var(--o-gv-accent) 0%, transparent 65%)',
          }}
        />

        {/* Le bandeau defilant. */}
        <div
          className="o-border-b o-border-white-10 o-py-6"
          style={{ overflowY: 'hidden' }}
        >
          <Marquee speed={60} fade={0} pauseOnHover={false}>
            {(
              [
                'Moins de bruit',
                'Plus de gravite',
                'Concevoir avec du poids',
                'Construisons',
              ] as const
            ).map((mot) => (
              <span
                key={mot}
                className="o-flex o-shrink-0 o-items-center o-whitespace-nowrap o-font-medium o-tracking-tight o-text-zinc-100"
                style={{ fontSize: 'clamp(28px, 6vw, 64px)', lineHeight: 1.1 }}
              >
                <span className="o-px-8">
                  {mot === 'Plus de gravite' ? (
                    <>
                      Plus de{' '}
                      <em className="o-font-serif o-italic o-font-normal">gravite</em>
                    </>
                  ) : (
                    mot
                  )}
                </span>
                <span
                  aria-hidden="true"
                  className="o-size-2.5 o-rounded-full"
                  style={{ background: 'var(--o-gv-accent)' }}
                />
              </span>
            ))}
          </Marquee>
        </div>

        <div className="o-relative o-px-6 o-pb-10 o-pt-16 md:o-px-12 md:o-pt-24">
          <div className="o-grid o-grid-cols-1 o-gap-12 lg:o-grid-cols-12 lg:o-gap-8">
            {/* Le bloc d appel. */}
            <Revele className="lg:o-col-span-5">
              <p className="o-m-0 o-mb-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                [ Collaborons ]
              </p>
              <h2
                className="o-m-0 o-font-medium"
                style={{
                  ...affiche('m', 500),
                  fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)',
                  lineHeight: 0.95,
                  letterSpacing: '-0.03em',
                }}
              >
                Une idee qui a
                <br />
                du{' '}
                <em
                  className="o-font-serif o-italic o-font-normal"
                  style={{ color: 'var(--o-gv-accent)' }}
                >
                  poids ?
                </em>
              </h2>
              <div className="o-mt-9">
                <Aimant force={0.25}>
                  <a
                    href={COURRIEL}
                    data-gv-groupe=""
                    className="o-inline-flex o-items-center o-gap-4 o-rounded-full o-border-w-1 o-border-white-20 o-bg-white-10 o-py-2 o-pl-7 o-pr-2 o-text-zinc-50 o-no-underline o-transition-colors hover:o-bg-white-20 focus:o-ring"
                  >
                    <span className="o-text-base o-font-medium md:o-text-lg">
                      bonjour@odoro.studio
                    </span>
                    <Orbe taille={40} />
                  </a>
                </Aimant>
              </div>
            </Revele>

            {/* Les colonnes de liens. */}
            <div className="o-grid o-grid-cols-2 o-gap-8 sm:o-grid-cols-3 lg:o-col-span-7">
              {COLONNES.map((col, rang) => (
                <Revele key={col.titre} delai={80 * (rang + 1)}>
                  <h3 className="o-m-0 o-mb-5 o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-zinc-400">
                    {col.titre}
                  </h3>
                  <ul className="o-m-0 o-flex o-list-none o-flex-col o-gap-3 o-p-0">
                    {col.liens.map((lien) => (
                      <li key={lien}>
                        <a
                          href="#haut"
                          data-gv-groupe=""
                          className="o-inline-flex o-items-center o-gap-1 o-text-sm o-text-zinc-300 o-no-underline o-transition-colors hover:o-text-white focus:o-ring"
                        >
                          <span>{lien}</span>
                          <span
                            aria-hidden="true"
                            data-gv-fleche=""
                            className="o-inline-flex o-opacity-0 o-transition-all"
                            style={{ transform: 'translateX(-4px)' }}
                          >
                            <Icon icon={ArrowUpRight} size={14} />
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </Revele>
              ))}
            </div>
          </div>

          {/* La barre basse. */}
          <div className="o-mt-20 o-flex o-flex-col o-items-start o-justify-between o-gap-5 o-border-t o-border-white-10 o-pt-7 sm:o-flex-row sm:o-items-center md:o-mt-28">
            <div className="o-flex o-flex-wrap o-items-center o-gap-3">
              <span className="o-inline-flex o-items-center o-gap-2 o-select-none">
                <Sigle taille={18} style={{ color: 'var(--o-gv-accent)' }} />
                <span className="o-text-base o-font-semibold o-lowercase o-tracking-tight o-text-white">
                  odoro
                </span>
              </span>
              <span
                aria-hidden="true"
                className="o-size-1.5 o-rounded-full"
                style={{ background: 'var(--o-gv-accent)' }}
              />
              <p className="o-m-0 o-font-mono o-text-xs o-text-zinc-400">
                © 2026 Studio ODORO — Tous droits reserves.
              </p>
            </div>
            <div className="o-flex o-items-center o-gap-3">
              {(
                [
                  [Twitter, 'Twitter'],
                  [Instagram, 'Instagram'],
                  [Linkedin, 'LinkedIn'],
                ] as const
              ).map(([icone, nom]) => (
                <a
                  key={nom}
                  href="#haut"
                  aria-label={nom}
                  className="o-flex o-size-10 o-items-center o-justify-center o-rounded-full o-border-w-1 o-border-white-20 o-text-zinc-300 o-no-underline o-transition-colors hover:o-border-white-40 hover:o-bg-white-10 hover:o-text-white focus:o-ring"
                >
                  <Icon icon={icone} size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/*
        ----- Le menu de navigation mobile -----------------------------------
      */}
      {menuOuvert && (
        <div
          className="o-fixed o-inset-x-0 o-bottom-0 o-z-50 md:o-hidden"
          style={{ top: CHROME }}
        >
          <div
            className="o-absolute o-inset-0 o-backdrop-blur-2xl"
            style={{
              backgroundColor: 'color-mix(in oklab, var(--o-theme-bg) 85%, transparent)',
            }}
            onClick={() => {
              setMenuOuvert(false)
            }}
            aria-hidden="true"
          />
          <div className="o-relative o-flex o-h-full o-flex-col o-px-6 o-pb-10 o-pt-6">
            <div className="o-flex o-items-center o-justify-between">
              <span
                className="o-inline-flex o-items-center o-gap-2.5 o-select-none"
                aria-label="odoro"
              >
                <Sigle taille={22} style={{ color: 'var(--o-gv-accent)' }} />
                <span
                  className={`o-text-xl o-font-semibold o-lowercase o-tracking-tight ${ENCRE}`}
                >
                  odoro
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setMenuOuvert(false)
                }}
                aria-label="Fermer le menu"
                className={`o-flex o-size-11 o-items-center o-justify-center o-rounded-full ${VERRE} ${ENCRE} focus:o-ring`}
              >
                <Icon icon={X} size={20} aria-hidden="true" />
              </button>
            </div>

            <nav
              aria-label="Menu"
              className="o-mb-auto o-mt-auto o-flex o-flex-col o-gap-1"
            >
              {([...RUBRIQUES, ['#pied', 'Contact']] as const).map(([href, mot], i) => (
                <a
                  key={mot}
                  href={href}
                  onClick={() => {
                    setMenuOuvert(false)
                  }}
                  className={`o-flex o-items-center o-gap-3 o-no-underline ${ENCRE} focus:o-ring`}
                  style={{ ...affiche('m', 500), fontSize: '3.25rem', lineHeight: 1.05 }}
                >
                  <span
                    className="o-font-mono o-text-xs o-font-normal o-tracking-widest"
                    style={{ color: 'var(--o-gv-encre)' }}
                  >
                    0{i + 1}
                  </span>
                  <span>{mot}</span>
                </a>
              ))}
            </nav>

            <a
              href={COURRIEL}
              onClick={() => {
                setMenuOuvert(false)
              }}
              data-gv-groupe=""
              className={`o-justify-between o-gap-4 o-py-2 o-pl-7 o-pr-2 ${gelule} ${ENCRE}`}
            >
              <span className="o-text-base o-font-medium">bonjour@odoro.studio</span>
              <Orbe taille={40} />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  // La grotesque serree pour le titre et le corps, le serif optique pour le
  // mot d accent en italique : deux voix, la seconde ne donnant que son serif.
  const polices = usePolices('manrope')
  const serif = usePolices('fraunces')
  const voix = useMemo(() => {
    const s = serif as Record<string, string>
    return {
      ...polices,
      '--o-font-serif': s['--o-vitrine-affichage'] ?? 'serif',
    } as CSSProperties
  }, [polices, serif])

  // Ce que la scene lit a chaque image, sans re-rendu.
  const commande = useMemo<Commande>(
    () => ({
      progression: 0,
      demarre: false,
      pointeur: { x: 99, y: 99, enfonce: false, dedans: false },
    }),
    [],
  )

  // Le rideau attend la premiere image du champ : le compteur dit la verite.
  const [pret, setPret] = useState(false)
  const surPret = useCallback(() => {
    setPret(true)
  }, [])

  return (
    <Porte forme="compteur" marque="odoro" sombre={false} pret={pret}>
      <CursorRing
        size={38}
        lag={1.2}
        grow={1.7}
        color="var(--o-gv-encre)"
        className="o-relative"
        style={voix}
      >
        <Contenu commande={commande} onPret={surPret} />
      </CursorRing>
    </Porte>
  )
}
