/**
 * Helion — ODORO, le constructeur d applications par le chat.
 *
 * ## Le mecanisme : un seul nuage de points qui est trois formes
 *
 * La page entiere est posee sur **une seule surface three.js**, collee
 * derriere l ecran du premier au dernier ecran. Un unique `THREE.Points`
 * porte, pour chaque particule, les parametres de **trois formes** — une
 * galaxie a deux bras, un souffle a filaments, un disque d accretion en
 * spirale logarithmique avec son entonnoir — et le vertex shader melange les
 * positions par deux poids `uT1` (galaxie vers souffle) et `uT2` (souffle vers
 * disque) ecrits par le defilement. Rien ne se fond, rien n est reconstruit :
 * c est la meme matiere, rearrangee.
 *
 * La camera est reellement pilotee : les trois formes gardent les ordres de
 * grandeur ou elles ont ete composees (galaxie ~7 unites, colonne 15,5, disque
 * 24 — ici doublees comme dans la source) et c est l oeil qui voyage entre les
 * trois cadrages, puis **plonge dans le trou du disque**. Une fois de l autre
 * cote, le **sigle ODORO s assemble en particules** sur le meme champ d etoiles :
 * les motes partent des bords du cadre et volent vers le trace, echantillonne
 * sur un canevas 2D a partir de `markPath`. Un champ d etoiles lointain et une
 * poussiere proche donnent la parallaxe du vol.
 *
 * La lueur se fait dans le fragment shader — un coeur net dans un halo large,
 * accumule en melange additif — jamais par une passe de bloom, ou des points
 * aussi fins scintillent.
 *
 * ## Le repli
 *
 * Sous mouvement reduit, sans WebGL ou quand le plafond de surfaces est
 * atteint, un champ d etoiles en SVG et le sigle au trait tiennent la place :
 * la page garde son sujet.
 *
 * Fond **F-volume** (la page entiere), signature **M-epingle** (cinq ecrans
 * colles sur la scene, un rail pour le parcours). Appel : la barre d attente en
 * verre du heros — prenom, e-mail, un bouton a disque. Pied : bande haute
 * mot-marque et slogan, bande de liens a filets, ligne de base.
 *
 * @module
 */

import { useMotionState, useScrollScrub } from '@odoro-cli/engine'
import { type SceneContext } from '@odoro-cli/engine/three'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight, ChevronRight } from '@odoro-cli/icons/outline'
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

import { DecodeText } from '@/odoro/text/DecodeText.jsx'
import { SplitLines } from '@/odoro/text/SplitLines.jsx'

import { nuit } from './communs.jsx'
import {
  affiche,
  BarreGelule,
  CHROME,
  Grain,
  Indice,
  Porte,
  Surgit,
  usePolices,
  type Lien,
} from './marche.jsx'
import { accent } from './palettes.js'
import { Aimant, Rail } from './scene.jsx'
import { Volume } from './volume.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/* ============================ La copie ================================= */

const NAVIGATION: readonly Lien[] = [
  ['#haut', 'Accueil'],
  ['#chaine', 'La chaine'],
  ['#parcours', 'Le parcours'],
  ['#lancement', 'Lancement'],
]

const HEROS = {
  haut: 'Decris ton application.',
  bas: 'Elle se construit.',
  texte:
    'Tu ecris ce que tu veux, en francais. Une equipe de quatre roles IA la transforme en application web qui tourne — sans code, sans cle API a fournir.',
  prenom: 'Ton prenom',
  courriel: 'Ton e-mail',
  envoyer: 'Etre prevenu',
} as const

/** La chaine : quatre roles, lus de gauche a droite puis de haut en bas. */
const CHAINE = {
  haut: 'Quatre roles en chaine.',
  bas: 'Pas une melee.',
  gauche: [
    {
      titre: '1. Architecte',
      texte: 'Comprend la demande, decide de la structure, ecrit le plan.',
    },
    {
      titre: '3. Relecteur',
      texte:
        'Relit chaque modification. Refuse ce qui casse ou ce qui depasse la demande.',
    },
  ],
  droite: [
    { titre: '2. Codeur', texte: 'Ecrit et modifie les fichiers de ton application.' },
    {
      titre: '4. Reparateur',
      texte: 'Boucle sur les erreurs jusqu a ce que l application tourne.',
    },
  ],
  note: 'Ailleurs, un seul modele reflechit, ecrit et corrige. Ici, chaque role peut etre tenu par un modele different — Claude, Gemini ou GLM — le plus fort la ou ca compte, le moins cher partout ailleurs.',
} as const

/** Le parcours : cinq chapitres sur le rail. */
const PARCOURS = {
  haut: 'De la phrase',
  bas: 'a l application.',
  etapes: [
    {
      indice: '01',
      titre: 'Tu decris',
      texte:
        'Une seule question : « Que veux-tu construire ? ». Tu reponds en langage ordinaire, en francais.',
    },
    {
      indice: '02',
      titre: 'Le plan',
      texte:
        'L Architecte comprend la demande et pose la structure. Le plan s ecrit sous tes yeux.',
    },
    {
      indice: '03',
      titre: 'Les fichiers',
      texte:
        'Le Codeur ecrit ton application fichier par fichier. Le Relecteur refuse ce qui casse ou ce qui depasse la demande.',
    },
    {
      indice: '04',
      titre: 'L apercu',
      texte:
        'A droite, ton application tourne dans un environnement isole et se rafraichit toute seule. Le Reparateur boucle jusqu a ce que ca marche.',
    },
    {
      indice: '05',
      titre: 'Tu ajustes',
      texte:
        '« Mets le bouton en rouge », « ajoute une page de contact » : seuls les morceaux concernes changent. Tu reviens plus tard, tout est la. Tu exportes quand tu es satisfait.',
    },
  ],
} as const

/** Sous le capot : le moteur, en trois pieces. Aucun chiffre invente. */
const MOTEUR = {
  rubrique: 'Sous le capot',
  titre: 'Ce qui tourne, sans chiffre invente.',
  pieces: [
    {
      mot: 'Projet virtuel',
      titre: 'Tes fichiers vivent dans notre base',
      texte:
        'Versionnes par instantanes, on peut revenir en arriere. Les modifications s appliquent en differences ciblees — on ne reecrit jamais un fichier entier pour changer une ligne.',
    },
    {
      mot: 'Executeur isole',
      titre: 'Ton code ne tourne jamais chez nous',
      texte:
        'L apercu s execute dans un environnement isole, sans acces a nos cles ni a notre base. Le code des utilisateurs est traite comme hostile — c est la piece la plus difficile du projet.',
    },
    {
      mot: 'Compteur',
      titre: 'Estime avant, mesure apres',
      texte:
        'Chaque appel de modele et chaque minute d execution sont ecrits dans un grand livre en ajout seul, au micro-dollar. La base est la seule source du solde.',
    },
  ],
  note: 'Des chiffres du moteur, pas d une clientele : ODORO n est pas encore ouvert.',
} as const

const FINAL = {
  haut: 'Tout converge',
  bas: 'vers ton application.',
  texte:
    'ODORO n est pas encore ouvert. Laisse ton adresse : on te previent a l ouverture, et rien d autre.',
} as const

const PIED = {
  slogan:
    'Decris ton application en francais. Repars avec une vraie application web qui fonctionne.',
  liens: [
    ['#chaine', 'La chaine'],
    ['#parcours', 'Le parcours'],
    ['#lancement', 'Lancement'],
  ] as const,
  mention: '© 2026 ODORO — Tous droits reserves',
} as const

/* ============================ Le sigle ================================= */

/** Epaisseur de l anneau : 0,3 du rayon. */
const SIGLE_INTERIEUR = 0.7

/**
 * Un anneau du sigle : un angle droit en haut a gauche, un arc de 270 degres,
 * et l arete gauche qui remonte fermer. En SVG, l axe des y descend.
 */
function anneauDuSigle(cx: number, cy: number, r: number): string {
  return `M${String(cx - r)} ${String(cy - r)}H${String(cx)}A${String(r)} ${String(r)} 0 1 1 ${String(cx - r)} ${String(cy)}Z`
}

/** Le sigle complet dans une boite carree de cote `taille`, a remplir en `evenodd`. */
function traceDuSigle(taille: number): string {
  const r = taille / 2
  return `${anneauDuSigle(r, r, r)} ${anneauDuSigle(r, r, r * SIGLE_INTERIEUR)}`
}

/** Le sigle en `currentColor`, pour la barre et le pied. */
function Sigle({ taille = 18 }: { readonly taille?: number }): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width={taille}
      height={taille}
      aria-hidden="true"
      className="o-inline-block o-shrink-0"
    >
      <path d={traceDuSigle(24)} fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}

/** Le degrade de la marque : l accent vers sa nuance pale. */
function DegradeMarque({ id }: { readonly id: string }): ReactElement {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="140" y2="56" gradientUnits="userSpaceOnUse">
      <stop stopColor={accent(500)} />
      <stop offset="1" stopColor={accent(200)} />
    </linearGradient>
  )
}

/**
 * L embleme du heros : le sigle, immobile — son angle est son identite —, et
 * une orbite fine qui tourne autour, comme dans la source.
 */
function Embleme({ className }: { readonly className?: string }): ReactElement {
  const orbite = 64
  const tiret = `${String(2 * Math.PI * orbite * 0.75)} ${String(2 * Math.PI * orbite)}`
  return (
    <div className={`o-relative ${className ?? ''}`} aria-hidden="true">
      <svg
        viewBox="0 0 140 140"
        className="o-absolute o-inset-0 o-size-full"
        data-vh-orbite=""
      >
        <circle
          cx="70"
          cy="70"
          r={orbite}
          fill="none"
          stroke="url(#vh-orbite)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={tiret}
          opacity="0.55"
        />
        <defs>
          <DegradeMarque id="vh-orbite" />
        </defs>
      </svg>
      <svg viewBox="0 0 140 140" className="o-absolute o-inset-0 o-size-full">
        <g transform="translate(20 20)">
          <path d={traceDuSigle(100)} fill="url(#vh-sigle)" fillRule="evenodd" />
        </g>
        <defs>
          <DegradeMarque id="vh-sigle" />
        </defs>
      </svg>
    </div>
  )
}
/* ============================ La feuille =============================== */

const STYLE_ID = 'o-vitrine-helion'

/**
 * Ce que les utilitaires n ont pas : l orbite qui tourne, les champs de la
 * barre d attente. Coupe sous mouvement reduit.
 */
const CSS = [
  '@keyframes vh-orbite{to{transform:rotate(360deg)}}',
  '[data-vh-orbite]{transform-origin:center;animation:vh-orbite 14s linear infinite}',
  '[data-vh-champ]{color:var(--o-palette-zinc-50);outline:none}',
  '[data-vh-champ]::placeholder{color:color-mix(in oklab, var(--o-palette-zinc-50) 78%, transparent)}',
  '[data-vh-champ]:focus-visible{box-shadow:0 0 0 2px var(--o-vitrine-400)}',
  '@media (prefers-reduced-motion:reduce){[data-vh-orbite]{animation:none}}',
  // Trois utilitaires que le systeme ne decline pas : `o-inset-x-*` au-dela
  // de zero, `o-col-start-*` au-dela de sept, et la variante de point
  // d arret de `o-rounded-full`. Les points d arret sont ceux du systeme.
  '.vh-filet{left:1.5rem;right:1.5rem}',
  '@media (min-width:768px){.vh-filet{left:3rem;right:3rem}.vh-col9{grid-column-start:9}}',
  '@media (min-width:640px){.vh-gelule{border-radius:9999px}}',
].join('')

function useFeuille(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_ID) !== null) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = CSS
    document.head.append(style)
  }, [])
}
/* ============================ Les couleurs ============================= */

/**
 * La couleur d un jeton, lue sur la racine de la vitrine et convertie en
 * `#rrggbb` par un contexte de dessin — les nuances arrivent en `oklch` ou en
 * `color-mix`, que three.js refuse.
 */
function couleurDuJeton(racine: HTMLElement, jeton: string, repli: string): string {
  const valeur = getComputedStyle(racine).getPropertyValue(jeton).trim()
  if (valeur === '') return repli
  const toile = document.createElement('canvas')
  toile.width = 1
  toile.height = 1
  const pot = toile.getContext('2d', { willReadFrequently: true })
  if (pot === null) return repli
  pot.fillStyle = '#000000'
  pot.fillStyle = valeur
  pot.fillRect(0, 0, 1, 1)
  const [r, v, b] = pot.getImageData(0, 0, 1, 1).data
  const deux = (n: number): string => n.toString(16).padStart(2, '0')
  return `#${deux(r ?? 0)}${deux(v ?? 0)}${deux(b ?? 0)}`
}

/** Les canaux d une couleur `#rrggbb`, bruts, de 0 a 1 : le shader les ecrit tels quels. */
function canaux(hexadecimal: string): [number, number, number] {
  const n = Number.parseInt(hexadecimal.replace('#', ''), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}
/* ============================ La scene ================================= */

/** Ce que la page mesure pour la scene : ou sont les cinq ecrans. */
interface Plage {
  top: number
  bottom: number
}

interface Mesures {
  haut: Plage
  chaine: Plage
  parcours: Plage
  lancement: Plage
  final: Plage
}

/** Ce que la scene rend a chaque image. */
interface Monde {
  rendre: (mesures: Mesures | null, time: number, delta: number) => void
  liberer: () => void
}

const TAU = Math.PI * 2

function borne(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

function lisse(a: number, b: number, x: number): number {
  const t = borne((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * Les reglages des trois formes, ceux de la source avec ses multiplicateurs
 * de forme appliques : la galaxie, le souffle, le disque, et le morphe.
 */
const FORMES = {
  uniEuler: [1, -1.2, 0.5] as const,
  uniScale: 1.86,
  uniEllipse: 0.8,
  uniLife: 6,
  uniSpawnSpread: 1,
  uniPrime: 6,
  uniOmega: 1.26,
  uniV0: 0.72,
  uniDecay: 0.036,
  uniSize: 70,
  uniBright: 0.58,
  uniGlow: 0.8,

  burstSpread: 3,
  burstCurl: 0.475,
  burstBend: 0.44,
  burstCoreStart: 0.06,
  burstTipFade: 0.42,
  burstSway: 0.08,
  burstSwaySpeed: 1.1,
  burstShimmer: 0.55,
  burstShimmerSpeed: 3,
  burstScale: 3.85,
  burstSize: 68,
  burstBright: 0.85,
  burstGlow: 1.25,

  maelRInner: 7.36,
  maelROuter: 55.2,
  maelTightness: 2.3,
  maelThickness: 0.9,
  maelBulge: 1,
  maelFunnel: 1.05,
  maelTilt: 0.95,
  maelSpin: 0.255,
  maelTwinkle: 0.75,
  maelCrescent: 0.9,
  maelCrescentAngle: -0.7,
  maelSize: 96,
  maelBright: 0.56,
  maelGlow: 1.15,

  stagger: 0.55,
  arc1: 1.1,
  swirl1: 2.2,
  arc2: 9,
  swirl2: 3.4,
  midBoost: 0.7,
} as const

/** La lueur, par forme : un coeur net dans un halo, melanges au fil du morphe. */
interface Lueur {
  coreStrength: number
  coreSize: number
  coreSharp: number
  haloAmount: number
  haloFalloff: number
}

const LUEUR: Record<'uni' | 'burst' | 'mael', Lueur> = {
  uni: {
    coreStrength: 1.5,
    coreSize: 0.5,
    coreSharp: 2.4,
    haloAmount: 0.6,
    haloFalloff: 1.5,
  },
  burst: {
    coreStrength: 1.7,
    coreSize: 0.34,
    coreSharp: 3,
    haloAmount: 0.3,
    haloFalloff: 1.9,
  },
  mael: {
    coreStrength: 1.35,
    coreSize: 0.4,
    coreSharp: 2.8,
    haloAmount: 0.38,
    haloFalloff: 1.9,
  },
}

function melangeLueur(a: Lueur, b: Lueur, t: number): Lueur {
  return {
    coreStrength: lerp(a.coreStrength, b.coreStrength, t),
    coreSize: lerp(a.coreSize, b.coreSize, t),
    coreSharp: lerp(a.coreSharp, b.coreSharp, t),
    haloAmount: lerp(a.haloAmount, b.haloAmount, t),
    haloFalloff: lerp(a.haloFalloff, b.haloFalloff, t),
  }
}

/** La trajectoire de camera : les trois cadrages et les mouvements entre eux. */
const CAMERA = {
  morph1Start: 0.25,
  morph2Start: 0.3,
  morph2End: 0.95,
  scrollDive: 3.5,
  uniSway: 0.16,
  uniSwayRate: 0.035,
  uniRise: 2.2,
  uniRiseRate: 0.05,
  burstScroll: 2.6,
  burstSway: 0.09,
  burstSwayRate: 0.05,
  burstOrbitParallax: 0.6,
  burstRise: 6,
  burstPull: 1.8,
  maelDrift: 2.4,
  maelDriftRate: 0.1,
  maelOrbitFrom: 26,
  maelOrbitTo: 28,
  maelOrbitHeight: 14,
  maelSwing: 2.6,
  maelFovFrom: 66,
  maelFovTo: 76,
  appearMs: 1800,
  introDolly: 8,
  diveLeadVh: 2,
  diveSpanVh: 2.4,
  diveThrough: -22,
  diveAhead: 40,
  diveFov: 104,
  logoLeadVh: 0.35,
  logoSpanVh: 1.3,
  uni: { z: 10.5, y: 0, fov: 58, px: 0.6, py: 0.6 },
  burst: { z: 11, y: 2, fov: 62, px: 0, py: 2.2 },
  mael: { px: 8.85, py: 7.08 },
  pointerForce: {
    uni: { radius: 3.4, push: 0.42, swirl: 0.75, glow: 1.1 },
    burst: { radius: 3.6, push: 0.5, swirl: 0.95, glow: 1.3 },
    mael: { radius: 10, push: 1.3, swirl: 2.2, glow: 0.9 },
  },
} as const

/** Le sigle en particules : la boite de tramage et ses reglages. */
const SIGLE = {
  boite: 140,
  marge: 20,
  count: 19900,
  markSize: 14,
  thickness: 1.5,
  spreadMin: 10,
  spreadSpan: 13.5,
  pointSize: 0.2,
  brightness: 3,
  mouseStrength: 0.94,
  tilt: 0.02,
  devant: 10,
  orbiteTousLes: 6,
  fond: 1400,
} as const

/** L orbite fine autour du sigle, dans la boite de 140. */
const ORBITE_DU_SIGLE =
  'M6 70a64 64 0 1 0 128 0a64 64 0 1 0 -128 0Z M7.5 70a62.5 62.5 0 1 0 125 0a62.5 62.5 0 1 0 -125 0Z'

/** Les comptes de la source par qualite : ceux du bureau, puis divises. */
function comptes(qualite: SceneContext['quality']): {
  arms: number
  perArm: number
  stars: number
  dust: number
  sigle: number
  fond: number
} {
  if (qualite === 'high')
    return {
      arms: 520,
      perArm: 161,
      stars: 2520,
      dust: 455,
      sigle: SIGLE.count,
      fond: SIGLE.fond,
    }
  if (qualite === 'medium')
    return {
      arms: 340,
      perArm: 119,
      stars: 1540,
      dust: 280,
      sigle: Math.round(SIGLE.count * 0.7),
      fond: 800,
    }
  return {
    arms: 260,
    perArm: 161,
    stars: 1260,
    dust: 228,
    sigle: Math.round(SIGLE.count * 0.5),
    fond: 700,
  }
}

/** Un tirage normal, pour donner un profil a l epaisseur du disque. */
function gauss(): number {
  return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(TAU * Math.random())
}

/** Le vertex shader du nuage : les trois formes, le morphe, le pointeur. */
const VERTEX_NUAGE = /* glsl */ `
  attribute vec4 aUni;
  attribute vec4 aBurst;
  attribute vec2 aSeed;

  uniform float iTime; uniform float uAlpha; uniform vec2 uRes;
  uniform float uT1; uniform float uT2;
  uniform float uNeedUni; uniform float uNeedBurst; uniform float uNeedMael;
  uniform vec3 uPointer; uniform vec3 uPointerAxis;
  uniform float uPointerR; uniform float uPointerPush;
  uniform float uPointerSwirl; uniform float uPointerGlow;
  uniform float uStagger; uniform float uMidBoost;
  uniform float uArc1; uniform float uSwirl1; uniform float uArc2; uniform float uSwirl2;

  uniform float uUniTime; uniform mat3 uUniRot; uniform float uUniScale;
  uniform float uUniEllipse; uniform float uUniLife; uniform float uUniSpawnSpread;
  uniform float uUniOmega; uniform float uUniV0; uniform float uUniDecay;
  uniform float uUniSize; uniform float uUniBright;

  uniform float uBurstScale; uniform float uBurstSway; uniform float uBurstSwaySpeed;
  uniform float uBurstShimmer; uniform float uBurstShimmerSpeed;
  uniform float uBurstTipFade; uniform float uBurstSize; uniform float uBurstBright;

  uniform mat3 uMaelRot; uniform float uRInner; uniform float uROuter;
  uniform float uSpin; uniform float uMaelTwinkle;
  uniform float uCrescent; uniform float uCrescentAngle;
  uniform float uMaelSize; uniform float uMaelBright; uniform float uMaelPhase;

  uniform vec3 uUniDeep; uniform vec3 uUniMid; uniform vec3 uUniBrightC;
  uniform vec3 uBurstCore; uniform vec3 uBurstInner;
  uniform vec3 uBurstMid; uniform vec3 uBurstOuter;
  uniform vec3 uArm; uniform vec3 uArmHot; uniform vec3 uMaelCore; uniform vec3 uHeat;

  varying vec3 vCol; varying float vB;
  #define TAU 6.2831853

  vec2 rot2(vec2 v, float a) {
    float c = cos(a), s = sin(a);
    return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
  }

  float stagger(float t, float seed) {
    float s = clamp(t * (1.0 + uStagger) - seed * uStagger, 0.0, 1.0);
    return s * s * (3.0 - 2.0 * s);
  }

  void main() {
    float seed = aSeed.x;

    vec3 pUni = vec3(0.0); vec3 cUni = uUniDeep; float bUni = 0.0; float sUni = 1.0;
    if (uNeedUni > 0.5) {
      float born = uUniTime / uUniLife - aUni.z * uUniSpawnSpread;
      float alive = step(0.0, born);
      float life = fract(max(born, 0.0));
      float age = life * uUniLife;
      float ang = uUniOmega * (uUniTime - age);
      float radius = aUni.x + uUniV0 * age - uUniDecay * age * age;
      pUni = vec3(cos(ang) * radius * uUniEllipse, aUni.y, sin(ang) * radius);
      pUni.xz *= mix(1.0, -1.0, aUni.w);
      pUni = uUniRot * pUni * uUniScale;
      bUni = alive * smoothstep(0.0, 0.14, life) * (1.0 - smoothstep(0.18, 1.0, life)) * uUniBright;
      cUni = uUniDeep;
      cUni = mix(cUni, uUniMid, step(0.34, seed));
      cUni = mix(cUni, uUniBrightC, step(0.67, seed));
      cUni = mix(cUni, uHeat, step(0.94, seed));
      sUni = 0.35 + 0.65 * fract(seed * 17.0);
    }

    vec3 pBurst = vec3(0.0); vec3 cBurst = uBurstMid; float bBurst = 0.0; float sBurst = 1.0;
    if (uNeedBurst > 0.5) {
      vec3 f = aBurst.xyz;
      float along = aBurst.w;
      vec3 d = normalize(f + 1e-5);
      vec3 ax = normalize(cross(d, abs(d.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0)));
      vec3 ay = cross(d, ax);
      float amp = uBurstSway * along;
      float ph = seed * TAU;
      float ts = iTime * uBurstSwaySpeed;
      float w1 = sin(ts + ph + along * 5.0);
      float w2 = cos(ts * 1.27 + ph * 1.7 + along * 9.0);
      float w3 = 0.5 * sin(ts * 0.6 + ph);
      f += ax * (w1 + w3) * amp;
      f += ay * w2 * amp * 0.8;
      pBurst = f * uBurstScale;
      float sh = max(0.0, 0.6 + uBurstShimmer * 0.55 * sin(along * 16.0 - iTime * uBurstShimmerSpeed + seed * 28.0));
      float fade = mix(1.15, uBurstTipFade, smoothstep(0.0, 1.0, along));
      float fn = clamp((aSeed.y - 0.55) / 0.45, 0.0, 1.0);
      float fil = 0.035 + 2.4 * pow(fn, 2.6);
      bBurst = sh * fade * fil * uBurstBright;
      cBurst = mix(uBurstInner, uBurstMid, smoothstep(0.0, 0.5, along));
      cBurst = mix(cBurst, uBurstOuter, smoothstep(0.5, 1.0, along));
      cBurst = mix(cBurst, uBurstCore, (1.0 - smoothstep(0.0, 0.12, along)) * 0.9);
      cBurst = mix(cBurst, uHeat, step(0.94, seed) * smoothstep(0.45, 1.0, along));
      sBurst = 0.8 + 0.45 * (1.0 - along);
    }

    vec3 pMael = vec3(0.0); vec3 cMael = uArm; float bMael = 0.0; float sMael = 1.0;
    if (uNeedMael > 0.5) {
      vec3 m = position;
      m.xy = rot2(m.xy, iTime * uSpin);
      float radius = length(position.xy);
      float core = clamp((uROuter - radius) / (uROuter - uRInner), 0.0, 1.0);
      float a2 = atan(m.y, m.x) - uCrescentAngle;
      float dd = abs(atan(sin(a2), cos(a2)));
      float crescent = smoothstep(1.5 + uMaelPhase * 0.9, 0.0, dd) * core * core * uCrescent * (1.0 + 0.5 * uMaelPhase);
      pMael = uMaelRot * m;
      float tw = 1.0 - uMaelTwinkle * (0.5 + 0.5 * sin(iTime * 3.0 + seed * TAU));
      float bright = aSeed.y * (0.3 + 0.7 * core);
      cMael = mix(mix(uArm, uArmHot, uMaelPhase), uMaelCore, core * core);
      cMael = mix(cMael, uHeat, clamp(crescent, 0.0, 1.0));
      bMael = (bright * tw * (0.7 + core) + crescent * 1.5) * uMaelBright * (1.0 + 0.18 * uMaelPhase);
      sMael = 1.0 + core * 1.1 + crescent * 1.6;
    }

    float t1 = stagger(uT1, seed);
    float t2 = stagger(uT2, fract(seed * 3.7 + 0.31));
    vec3 dir = normalize(vec3(sin(seed * 91.3 + 0.7), cos(seed * 57.1 + 2.1), sin(seed * 33.7 + 4.3)) + 1e-4);

    vec3 p = mix(pUni, pBurst, t1);
    float mid1 = 4.0 * t1 * (1.0 - t1);
    p += dir * (uArc1 * mid1);
    p.xz = rot2(p.xz, mid1 * uSwirl1 * (0.6 + 0.8 * seed));

    p = mix(p, pMael, t2);
    float mid2 = 4.0 * t2 * (1.0 - t2);
    p += dir * (uArc2 * mid2);
    p.xz = rot2(p.xz, mid2 * uSwirl2 * (0.6 + 0.8 * seed));

    vec3 pd = p - uPointer;
    float pl = length(pd);
    float infl = exp(-(pl * pl) / max(0.001, uPointerR * uPointerR));
    vec3 pdir = normalize(pd + 1e-4);
    p += pdir * (infl * uPointerPush);
    p += normalize(cross(uPointerAxis, pdir) + 1e-4) * (infl * uPointerSwirl);

    vCol = mix(mix(cUni, cBurst, t1), cMael, t2);
    vB = mix(mix(bUni, bBurst, t1), bMael, t2) * uAlpha * (1.0 + uMidBoost * (mid1 + mid2)) * (1.0 + infl * uPointerGlow);

    if (vB < 0.004) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      return;
    }

    float size = mix(mix(uUniSize * sUni, uBurstSize * sBurst, t1), uMaelSize * sMael, t2);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = clamp(size * uRes.y / 1000.0 / -mv.z, 1.0, 15.0);
    gl_Position = projectionMatrix * mv;
  }`

/** Le fragment shader du nuage : la lueur, un coeur net dans un halo large. */
const FRAGMENT_NUAGE = /* glsl */ `
  uniform float uCoreStrength; uniform float uCoreSize; uniform float uCoreSharp;
  uniform float uHaloAmount; uniform float uHaloFalloff;
  varying vec3 vCol; varying float vB;
  void main() {
    float pd = length(2.0 * gl_PointCoord - 1.0);
    if (pd > 1.0) discard;
    float core = pow(max(0.0, 1.0 - pd / max(0.001, uCoreSize)), uCoreSharp) * uCoreStrength;
    float halo = pow(max(0.0, 1.0 - pd), uHaloFalloff) * uHaloAmount;
    float mask = (core + halo) * vB;
    if (mask <= 0.006) discard;
    gl_FragColor = vec4(vCol, mask);
  }`

/** Un point rond et doux, pour les etoiles, la poussiere et le sigle. */
const FRAGMENT_DOUX = /* glsl */ `
  varying vec3 vCol; varying float vB;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vCol, vB * smoothstep(0.5, 0.06, d));
  }`

/**
 * Construit tout le monde dans la scene, et rend ce qu il faut pour le
 * piloter image par image et le liberer.
 */
function construireLeMonde(
  contexte: SceneContext,
  racine: HTMLElement,
  hote: HTMLElement,
): Monde {
  const { scene, camera, renderer, three, quality } = contexte
  const n = comptes(quality)

  // Le nuage est additif et ecrit ses couleurs telles quelles : un report de
  // tons les ecraserait, et l espace de sortie est celui du shader.
  renderer.toneMapping = three.NoToneMapping
  scene.background = new three.Color(0x000000)
  // Le champ d etoiles pend a plus de deux cents unites ; la camera va a 56.
  camera.far = 600
  camera.near = 0.1
  camera.updateProjectionMatrix()

  const jeton = (nom: string, repli: string): InstanceType<typeof three.Vector3> => {
    const [r, v, b] = canaux(couleurDuJeton(racine, nom, repli))
    return new three.Vector3(r, v, b)
  }
  // La rampe de la source, lue dans l echelle de la vitrine pour se reteinter.
  const couleurs = {
    accent500: jeton('--o-vitrine-500', '#f97316'),
    accent400: jeton('--o-vitrine-400', '#fb923c'),
    accent300: jeton('--o-vitrine-300', '#fdba74'),
    accent200: jeton('--o-vitrine-100', '#ffedd5'),
    accent600: jeton('--o-vitrine-700', '#a8420f'),
    accent700: jeton('--o-vitrine-900', '#5a2410'),
    heat: jeton('--o-vitrine-200', '#ffcf7a'),
    ring: new three.Vector3(0.894, 0.945, 1),
    foreground: new three.Vector3(1, 0.965, 0.918),
    sigleA: jeton('--o-vitrine-500', '#f97316'),
    sigleB: jeton('--o-vitrine-200', '#ffd1a6'),
  }

  const rotation = (
    x: number,
    y: number,
    z: number,
  ): InstanceType<typeof three.Matrix3> =>
    new three.Matrix3().setFromMatrix4(
      new three.Matrix4().makeRotationFromEuler(new three.Euler(x, y, z)),
    )

  /* ------------------------------------------------ le champ d etoiles */

  const etoiles = (() => {
    const positions = new Float32Array(n.stars * 3)
    const tailles = new Float32Array(n.stars)
    const graines = new Float32Array(n.stars)
    const chaudes = new Float32Array(n.stars)
    for (let i = 0; i < n.stars; i += 1) {
      const u = Math.random() * 2 - 1
      const theta = Math.random() * TAU
      const anneau = Math.sqrt(1 - u * u)
      const rayon = 70 + Math.random() * 160
      positions[i * 3] = Math.cos(theta) * anneau * rayon
      positions[i * 3 + 1] = Math.sin(theta) * anneau * rayon
      positions[i * 3 + 2] = u * rayon - 40
      tailles[i] = 0.14 + Math.pow(Math.random(), 8) * 0.85
      graines[i] = Math.random()
      chaudes[i] = Math.random() < 0.12 ? Math.random() : 0
    }
    const geometrie = new three.BufferGeometry()
    geometrie.setAttribute('position', new three.BufferAttribute(positions, 3))
    geometrie.setAttribute('aSize', new three.BufferAttribute(tailles, 1))
    geometrie.setAttribute('aSeed', new three.BufferAttribute(graines, 1))
    geometrie.setAttribute('aPink', new three.BufferAttribute(chaudes, 1))
    const uniformes = {
      iTime: { value: 0 },
      uAlpha: { value: 0 },
      uViewScale: { value: 1 },
      uCool: { value: couleurs.accent200 },
      uPink: { value: couleurs.ring },
    }
    const matiere = new three.ShaderMaterial({
      uniforms: uniformes,
      vertexShader: /* glsl */ `
        attribute float aSize; attribute float aSeed; attribute float aPink;
        uniform float iTime; uniform float uAlpha; uniform float uViewScale;
        uniform vec3 uCool; uniform vec3 uPink;
        varying vec3 vCol; varying float vB;
        #define TAU 6.2831853
        void main() {
          float tw = 0.6 + 0.4 * sin(iTime * 1.4 + aSeed * TAU);
          vCol = mix(uCool, uPink, aPink);
          vB = aSize * tw * 2.0 * uAlpha;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = clamp(aSize * 1.5 * uViewScale * (300.0 / -mv.z), 0.5, 10.0);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: FRAGMENT_DOUX,
      blending: three.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    })
    const points = new three.Points(geometrie, matiere)
    points.frustumCulled = false
    scene.add(points)
    return { geometrie, matiere, uniformes }
  })()

  /* ------------------------------------------------ la poussiere proche */

  const poussiere = (() => {
    const positions = new Float32Array(n.dust * 3)
    const graines = new Float32Array(n.dust)
    for (let i = 0; i < n.dust; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 90
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50 + 10
      graines[i] = Math.random()
    }
    const geometrie = new three.BufferGeometry()
    geometrie.setAttribute('position', new three.BufferAttribute(positions, 3))
    geometrie.setAttribute('aSeed', new three.BufferAttribute(graines, 1))
    const uniformes = {
      iTime: { value: 0 },
      uAlpha: { value: 0 },
      uViewScale: { value: 1 },
      uColor: { value: couleurs.accent500 },
    }
    const matiere = new three.ShaderMaterial({
      uniforms: uniformes,
      vertexShader: /* glsl */ `
        attribute float aSeed;
        uniform float iTime; uniform float uAlpha; uniform float uViewScale; uniform vec3 uColor;
        varying vec3 vCol; varying float vB;
        #define TAU 6.2831853
        void main() {
          vec3 p = position;
          p.x += sin(iTime * 0.2 + aSeed * TAU) * 1.4;
          p.y += cos(iTime * 0.17 + aSeed * TAU) * 1.1;
          vCol = uColor;
          vB = (0.10 + 0.10 * sin(iTime * 0.8 + aSeed * 12.0)) * uAlpha;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = clamp((1.0 + aSeed * 2.0) * uViewScale * (200.0 / -mv.z), 0.8, 44.0);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: FRAGMENT_DOUX,
      blending: three.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    })
    const points = new three.Points(geometrie, matiere)
    points.frustumCulled = false
    scene.add(points)
    return { geometrie, matiere, uniformes }
  })()

  /* ------------------------------------------------ le nuage, trois formes */

  const nuage = (() => {
    const { arms, perArm } = n
    const total = arms * perArm
    const positions = new Float32Array(total * 3)
    const uni = new Float32Array(total * 4)
    const burst = new Float32Array(total * 4)
    const graines = new Float32Array(total * 2)
    const logSpan = Math.log(FORMES.maelROuter / FORMES.maelRInner)

    const dir = new three.Vector3()
    const bu = new three.Vector3()
    const bv = new three.Vector3()
    const bend = new three.Vector3()
    const p = new three.Vector3()
    const haut = new three.Vector3()

    let k = 0
    for (let a = 0; a < arms; a += 1) {
      const armPhase = Math.random() * TAU
      const armBright = 0.55 + 0.45 * Math.random()

      // Un filament du souffle : une direction sur la sphere, deux axes en
      // travers pour la courbure, une longueur, une flexion.
      const bz = Math.random() * 2 - 1
      const bth = Math.random() * TAU
      const brr = Math.sqrt(1 - bz * bz)
      dir.set(brr * Math.cos(bth), brr * Math.sin(bth), bz)
      haut.set(Math.abs(dir.y) > 0.99 ? 1 : 0, Math.abs(dir.y) > 0.99 ? 0 : 1, 0)
      bu.crossVectors(dir, haut).normalize()
      bv.crossVectors(dir, bu).normalize()
      let len = FORMES.burstSpread * (0.28 + Math.random() * Math.random() * 1.15)
      if (Math.random() > 0.86) len *= 1.7
      const f1 = 2 + Math.random() * 5
      const f2 = 2 + Math.random() * 5
      const p1 = Math.random() * TAU
      const p2 = Math.random() * TAU
      const curl = FORMES.burstCurl * (0.45 + Math.random())
      bend
        .set(0, 0, 0)
        .addScaledVector(bu, Math.random() - 0.5)
        .addScaledVector(bv, Math.random() - 0.5)
        .normalize()
        .multiplyScalar(FORMES.burstBend * (0.4 + Math.random()))

      for (let i = 0; i < perArm; i += 1) {
        const t = perArm > 1 ? i / (perArm - 1) : 0

        // Le disque : un point sur une spirale logarithmique, avec son
        // epaisseur profilee et son entonnoir vers le trou.
        const radius =
          FORMES.maelRInner * Math.exp(logSpan * t) * (1 + (Math.random() - 0.5) * 0.05)
        const angle =
          armPhase +
          FORMES.maelTightness * Math.log(radius / FORMES.maelRInner) +
          (Math.random() - 0.5) * 0.06
        const inner = radius / FORMES.maelRInner - 1
        const bulge = 1 + FORMES.maelBulge * Math.exp(-inner * inner * 1.6)
        const rNorm = Math.min(1, radius / FORMES.maelROuter)
        const funnelZ =
          -FORMES.maelFunnel * FORMES.maelROuter * 0.4 * Math.pow(1 - rNorm, 1.8)
        positions[k * 3] = radius * Math.cos(angle)
        positions[k * 3 + 1] = radius * Math.sin(angle)
        positions[k * 3 + 2] =
          funnelZ + gauss() * 0.5 * FORMES.maelThickness * (0.4 + radius * 0.03) * bulge

        // La galaxie : un point de la distribution sphere-et-tube de la source.
        const theta = TAU * Math.random()
        const phi = Math.acos(2 * Math.random() - 1)
        const sinPhi = Math.sin(phi)
        const spread = Math.random() * (Math.random() < 0.3 ? 4 : 1) * 0.4
        const ux = sinPhi * Math.cos(theta) * spread
        const uy = sinPhi * Math.sin(theta) * spread
        const uz = Math.cos(phi) * spread
        uni[k * 4] = Math.hypot(ux - 2.5, uz)
        uni[k * 4 + 1] = uy
        uni[k * 4 + 2] = Math.random()
        uni[k * 4 + 3] = a % 2

        // Le souffle : la place du point sur son filament, resolue ici.
        const rad = FORMES.burstCoreStart + len * t
        p.copy(dir).multiplyScalar(rad)
        p.addScaledVector(bu, Math.sin(t * f1 * Math.PI + p1) * curl * t)
        p.addScaledVector(bv, Math.cos(t * f2 * Math.PI + p2) * curl * t)
        p.addScaledVector(bend, t * t)
        burst[k * 4] = p.x
        burst[k * 4 + 1] = p.y
        burst[k * 4 + 2] = p.z
        burst[k * 4 + 3] = t

        graines[k * 2] = Math.random()
        graines[k * 2 + 1] = armBright
        k += 1
      }
    }

    const geometrie = new three.BufferGeometry()
    geometrie.setAttribute('position', new three.BufferAttribute(positions, 3))
    geometrie.setAttribute('aUni', new three.BufferAttribute(uni, 4))
    geometrie.setAttribute('aBurst', new three.BufferAttribute(burst, 4))
    geometrie.setAttribute('aSeed', new three.BufferAttribute(graines, 2))

    const [ex, ey, ez] = FORMES.uniEuler
    const uniformes = {
      iTime: { value: 0 },
      uAlpha: { value: 0 },
      uRes: { value: new three.Vector2(1, 1) },
      uT1: { value: 0 },
      uT2: { value: 0 },
      uNeedUni: { value: 1 },
      uNeedBurst: { value: 0 },
      uNeedMael: { value: 0 },
      uPointer: { value: new three.Vector3() },
      uPointerAxis: { value: new three.Vector3(0, 0, -1) },
      uPointerR: { value: 1 },
      uPointerPush: { value: 0 },
      uPointerSwirl: { value: 0 },
      uPointerGlow: { value: 0 },
      uStagger: { value: FORMES.stagger },
      uMidBoost: { value: FORMES.midBoost },
      uArc1: { value: FORMES.arc1 },
      uSwirl1: { value: FORMES.swirl1 },
      uArc2: { value: FORMES.arc2 },
      uSwirl2: { value: FORMES.swirl2 },
      uUniTime: { value: 0 },
      uUniRot: { value: rotation(ex, ey, ez) },
      uUniScale: { value: FORMES.uniScale },
      uUniEllipse: { value: FORMES.uniEllipse },
      uUniLife: { value: FORMES.uniLife },
      uUniSpawnSpread: { value: FORMES.uniSpawnSpread },
      uUniOmega: { value: FORMES.uniOmega },
      uUniV0: { value: FORMES.uniV0 },
      uUniDecay: { value: FORMES.uniDecay },
      uUniSize: { value: FORMES.uniSize },
      uUniBright: { value: FORMES.uniBright },
      uBurstScale: { value: FORMES.burstScale },
      uBurstSway: { value: FORMES.burstSway },
      uBurstSwaySpeed: { value: FORMES.burstSwaySpeed },
      uBurstShimmer: { value: FORMES.burstShimmer },
      uBurstShimmerSpeed: { value: FORMES.burstShimmerSpeed },
      uBurstTipFade: { value: FORMES.burstTipFade },
      uBurstSize: { value: FORMES.burstSize },
      uBurstBright: { value: FORMES.burstBright },
      uMaelRot: { value: rotation(FORMES.maelTilt, 0, 0) },
      uRInner: { value: FORMES.maelRInner },
      uROuter: { value: FORMES.maelROuter },
      uSpin: { value: FORMES.maelSpin },
      uMaelTwinkle: { value: FORMES.maelTwinkle },
      uCrescent: { value: FORMES.maelCrescent },
      uCrescentAngle: { value: FORMES.maelCrescentAngle },
      uMaelSize: { value: FORMES.maelSize },
      uMaelBright: { value: FORMES.maelBright },
      uMaelPhase: { value: 0 },
      uUniDeep: { value: couleurs.accent500 },
      uUniMid: { value: couleurs.accent400 },
      uUniBrightC: { value: couleurs.accent200 },
      uBurstCore: { value: couleurs.foreground },
      uBurstInner: { value: couleurs.accent200 },
      uBurstMid: { value: couleurs.accent500 },
      uBurstOuter: { value: couleurs.accent600 },
      uArm: { value: couleurs.accent500 },
      uArmHot: { value: couleurs.accent300 },
      uMaelCore: { value: couleurs.accent700 },
      uHeat: { value: couleurs.heat },
      uCoreStrength: { value: LUEUR.uni.coreStrength },
      uCoreSize: { value: LUEUR.uni.coreSize },
      uCoreSharp: { value: LUEUR.uni.coreSharp },
      uHaloAmount: { value: LUEUR.uni.haloAmount },
      uHaloFalloff: { value: LUEUR.uni.haloFalloff },
    }
    const matiere = new three.ShaderMaterial({
      uniforms: uniformes,
      vertexShader: VERTEX_NUAGE,
      fragmentShader: FRAGMENT_NUAGE,
      blending: three.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    })
    const points = new three.Points(geometrie, matiere)
    points.frustumCulled = false
    scene.add(points)
    return { geometrie, matiere, uniformes }
  })()

  /* ------------------------------------------------ le sigle en particules */

  const sigle = (() => {
    const echelle = 4
    const w = SIGLE.boite * echelle
    const h = SIGLE.boite * echelle

    // Le trace est trame sur un canevas 2D : c est de la geometrie, jamais
    // une image. Chaque particule vise un pixel plein du sigle ou de l orbite.
    const tramer = (trace: string, marge: number): number[] => {
      const toile = document.createElement('canvas')
      toile.width = w
      toile.height = h
      const pot = toile.getContext('2d', { willReadFrequently: true })
      if (pot === null) return []
      pot.scale(echelle, echelle)
      pot.translate(marge, marge)
      pot.fillStyle = '#fff'
      pot.fill(new Path2D(trace), 'evenodd')
      const data = pot.getImageData(0, 0, w, h).data
      const liste: number[] = []
      for (let i = 3; i < data.length; i += 4)
        if ((data[i] ?? 0) > 40) liste.push((i - 3) / 4)
      return liste
    }
    const marque = tramer(traceDuSigle(100), SIGLE.marge)
    const orbite = tramer(ORBITE_DU_SIGLE, 0)

    const total = Math.max(200, n.sigle)
    const depart = new Float32Array(total * 3)
    const cible = new Float32Array(total * 3)
    const graines = new Float32Array(total)
    const tailles = new Float32Array(total)
    const bande = new Float32Array(total)
    for (let i = 0; i < total; i += 1) {
      // Les motes partent des bords du cadre — un large anneau dans le plan
      // qui fait face a la camera — et volent vers le trace.
      const r = SIGLE.spreadMin + Math.random() * SIGLE.spreadSpan
      const theta = Math.random() * TAU
      depart[i * 3] = Math.cos(theta) * r
      depart[i * 3 + 1] = Math.sin(theta) * r
      depart[i * 3 + 2] = (Math.random() - 0.5) * 3
      graines[i] = Math.random()
      tailles[i] = 0.5 + Math.random() * Math.random() * 1.7

      const surLaMarque = i % SIGLE.orbiteTousLes !== 0
      const liste = surLaMarque ? marque : orbite
      bande[i] = surLaMarque ? 0 : 1
      const pixel =
        liste.length > 0 ? (liste[(Math.random() * liste.length) | 0] ?? 0) : 0
      const px = pixel % w
      const py = (pixel / w) | 0
      cible[i * 3] = (px / w - 0.5) * SIGLE.markSize
      cible[i * 3 + 1] = -(py / h - 0.5) * SIGLE.markSize
      cible[i * 3 + 2] = (Math.random() - 0.5) * SIGLE.thickness
    }
    const geometrie = new three.BufferGeometry()
    geometrie.setAttribute('position', new three.BufferAttribute(depart, 3))
    geometrie.setAttribute('aTarget', new three.BufferAttribute(cible, 3))
    geometrie.setAttribute('aSeed', new three.BufferAttribute(graines, 1))
    geometrie.setAttribute('aSize', new three.BufferAttribute(tailles, 1))
    geometrie.setAttribute('aTri', new three.BufferAttribute(bande, 1))

    const uniformes = {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uAlpha: { value: 0 },
      uPointScale: { value: 1 },
      uViewScale: { value: 1 },
      uColorA: { value: couleurs.sigleA },
      uColorB: { value: couleurs.sigleB },
    }
    const matiere = new three.ShaderMaterial({
      uniforms: uniformes,
      vertexShader: /* glsl */ `
        attribute vec3 aTarget; attribute float aSeed; attribute float aSize; attribute float aTri;
        uniform float uProgress; uniform float uTime; uniform float uAlpha; uniform float uPointScale; uniform float uViewScale;
        uniform vec3 uColorA; uniform vec3 uColorB;
        varying vec3 vCol; varying float vB;
        #define TAU 6.2831853
        void main() {
          float e = smoothstep(0.0, 1.0, clamp(uProgress * 1.35 - aSeed * 0.35, 0.0, 1.0));
          // Le sigle reste immobile ; l orbite tourne autour, comme l embleme.
          float speed = (aTri < 0.5) ? 0.0 : 0.70;
          float a = uTime * speed;
          float cs = cos(a), sn = sin(a);
          vec3 tgt = aTarget;
          tgt.xy = mat2(cs, -sn, sn, cs) * aTarget.xy;
          vec3 p = mix(position, tgt, e);
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
      fragmentShader: FRAGMENT_DOUX,
      blending: three.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    })
    const points = new three.Points(geometrie, matiere)
    points.frustumCulled = false

    // Un nuage lache de motes qui derivent derriere le sigle.
    const fondPositions = new Float32Array(n.fond * 3)
    const fondGraines = new Float32Array(n.fond)
    const fondTailles = new Float32Array(n.fond)
    for (let i = 0; i < n.fond; i += 1) {
      fondPositions[i * 3] = (Math.random() - 0.5) * 90
      fondPositions[i * 3 + 1] = (Math.random() - 0.5) * 90
      fondPositions[i * 3 + 2] = -6 - Math.random() * 46
      fondGraines[i] = Math.random()
      fondTailles[i] = 0.6 + Math.random() * 1.7
    }
    const fondGeometrie = new three.BufferGeometry()
    fondGeometrie.setAttribute('position', new three.BufferAttribute(fondPositions, 3))
    fondGeometrie.setAttribute('aSeed', new three.BufferAttribute(fondGraines, 1))
    fondGeometrie.setAttribute('aSize', new three.BufferAttribute(fondTailles, 1))
    const fondUniformes = {
      uTime: { value: 0 },
      uAlpha: { value: 0 },
      uViewScale: { value: 1 },
      uColor: { value: couleurs.accent400 },
    }
    const fondMatiere = new three.ShaderMaterial({
      uniforms: fondUniformes,
      vertexShader: /* glsl */ `
        attribute float aSeed; attribute float aSize;
        uniform float uTime; uniform float uAlpha; uniform float uViewScale; uniform vec3 uColor;
        varying vec3 vCol; varying float vB;
        void main() {
          vec3 p = position;
          p.x += sin(uTime * 0.13 + aSeed * 40.0) * 4.0 + cos(uTime * 0.05 + aSeed * 11.0) * 3.0;
          p.y += cos(uTime * 0.11 + aSeed * 27.0) * 4.0 + sin(uTime * 0.06 + aSeed * 7.0) * 3.0;
          p.z += sin(uTime * 0.09 + aSeed * 19.0) * 3.0;
          vCol = uColor;
          vB = (0.10 + 0.10 * sin(uTime * 0.5 + aSeed * 20.0)) * uAlpha;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = clamp((1.0 + aSeed * 2.5) * uViewScale * (200.0 / -mv.z), 0.8, 40.0);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: FRAGMENT_DOUX,
      blending: three.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    })
    const fond = new three.Points(fondGeometrie, fondMatiere)
    fond.frustumCulled = false

    const groupe = new three.Group()
    groupe.add(fond, points)
    scene.add(groupe)
    return {
      geometrie,
      matiere,
      uniformes,
      fondGeometrie,
      fondMatiere,
      fondUniformes,
      groupe,
    }
  })()

  /* ------------------------------------------------ le pointeur */

  const pointeur = { cible: { x: 0, y: 0 }, x: 0, y: 0, actif: 0, present: false }
  const fin = window.matchMedia('(pointer: fine)').matches
  const bouger = (evenement: PointerEvent): void => {
    pointeur.present = true
    pointeur.cible.x = (evenement.clientX / window.innerWidth) * 2 - 1
    pointeur.cible.y = (evenement.clientY / window.innerHeight) * -2 + 1
  }
  if (fin) window.addEventListener('pointermove', bouger, { passive: true })

  /* ------------------------------------------------ le vol */

  const oeil = new three.Vector3()
  const regard = new three.Vector3()
  const oeilUni = new three.Vector3()
  const oeilBurst = new three.Vector3()
  const oeilMael = new three.Vector3()
  const regardMael = new three.Vector3()
  const avant = new three.Vector3()
  const droite = new three.Vector3()
  const force = {
    world: new three.Vector3(),
    axis: new three.Vector3(0, 0, -1),
    radius: 1,
    push: 0,
    swirl: 0,
    glow: 0,
  }
  const tampon = new three.Vector2()

  /** Un point du repere du disque, ramene dans le monde. */
  const depuisLeDisque = (
    sortie: InstanceType<typeof three.Vector3>,
    x: number,
    y: number,
    z: number,
  ): void => {
    const c = Math.cos(FORMES.maelTilt)
    const s = Math.sin(FORMES.maelTilt)
    sortie.set(x, y * c - z * s, y * s + z * c)
  }

  let yLisse: number | null = null
  let debut: number | null = null

  const rendre = (mesures: Mesures | null, time: number, delta: number): void => {
    if (debut === null) debut = time
    // L arrivee : la camera part plus loin que tout cadrage et se pose.
    const appear =
      1 - Math.pow(1 - borne(((time - debut) * 1000 - 700) / CAMERA.appearMs), 3)

    // Le defilement, lisse : la molette avance par crans, la camera non.
    const vue = window.innerHeight - CHROME
    const brut = window.scrollY + CHROME
    if (yLisse === null || Math.abs(brut - yLisse) > vue * 1.5) yLisse = brut
    else yLisse += (brut - yLisse) * (1 - Math.exp(-14 * delta))
    const y = yLisse

    let t1 = 0
    let t2 = 0
    let dive = 0
    let burstPhase = 0
    let phase = 0
    let exit = 0
    let logo = 0
    let fini = 0
    if (mesures !== null) {
      const { haut, chaine, parcours, lancement, final } = mesures
      const s1 = borne((y - haut.top) / Math.max(1, chaine.top - haut.top))
      const s2 = borne((y - chaine.top) / Math.max(1, parcours.top - chaine.top))
      t1 = lisse(CAMERA.morph1Start, 1, s1)
      t2 = lisse(CAMERA.morph2Start, CAMERA.morph2End, s2)
      dive = s1
      const burstBegins = haut.top + CAMERA.morph1Start * (chaine.top - haut.top)
      burstPhase = borne((y - burstBegins) / Math.max(1, parcours.top - burstBegins))
      phase = borne(
        (y - parcours.top) / Math.max(1, parcours.bottom - parcours.top - vue),
      )
      exit = borne(
        (y + vue * CAMERA.diveLeadVh - lancement.top) /
          Math.max(1, vue * CAMERA.diveSpanVh),
      )
      logo = borne(
        (y - lancement.top + vue * CAMERA.logoLeadVh) / (vue * CAMERA.logoSpanVh),
      )
      fini = borne((y - final.top + vue * 0.7) / (vue * 0.7))
    }

    // Le pointeur, amorti.
    pointeur.actif += ((pointeur.present ? 1 : 0) - pointeur.actif) * 0.03
    pointeur.x += (pointeur.cible.x - pointeur.x) * 0.05
    pointeur.y += (pointeur.cible.y - pointeur.y) * 0.05
    const mx = pointeur.x
    const my = pointeur.y

    // La galaxie : un balancement, une montee, et le plongeon au defilement.
    const uniDist = CAMERA.uni.z - CAMERA.scrollDive * dive
    const uniAngle = Math.sin(time * CAMERA.uniSwayRate) * CAMERA.uniSway
    oeilUni.set(
      Math.sin(uniAngle) * uniDist,
      CAMERA.uni.y + Math.sin(time * CAMERA.uniRiseRate) * CAMERA.uniRise,
      Math.cos(uniAngle) * uniDist,
    )

    // Le souffle : une orbite pilotee par le defilement, l horloge en dessous.
    const orbit =
      burstPhase * CAMERA.burstScroll +
      Math.sin(time * CAMERA.burstSwayRate) * CAMERA.burstSway +
      mx * CAMERA.burstOrbitParallax * pointeur.actif
    const burstDist = CAMERA.burst.z + CAMERA.burstPull * burstPhase
    oeilBurst.set(
      Math.sin(orbit) * burstDist,
      CAMERA.burst.y + CAMERA.burstRise * burstPhase,
      Math.cos(orbit) * burstDist,
    )

    // Le disque : une orbite dans le repere du disque, puis le plongeon
    // dans le trou — le rayon s effondre, la hauteur passe de l autre cote.
    const pass = lisse(0, 1, phase)
    const swing = pass * CAMERA.maelSwing
    const onAxis = lisse(0, 0.65, exit)
    const through = Math.pow(lisse(0.15, 1, exit), 3)
    const ahead = lisse(0.12, 0.5, exit)
    const maelRadius = lerp(CAMERA.maelOrbitFrom, CAMERA.maelOrbitTo, pass) * (1 - onAxis)
    const eyeZ = lerp(CAMERA.maelOrbitHeight, CAMERA.diveThrough, through)
    depuisLeDisque(
      oeilMael,
      Math.cos(swing) * maelRadius,
      Math.sin(swing) * maelRadius,
      eyeZ,
    )
    depuisLeDisque(regardMael, 0, 0, lerp(0, eyeZ - CAMERA.diveAhead, ahead))
    const drift = Math.sin(time * CAMERA.maelDriftRate) * CAMERA.maelDrift * (1 - pass)

    oeil.copy(oeilUni).lerp(oeilBurst, t1).lerp(oeilMael, t2)
    oeil.x += drift * t2
    regard.set(0, 0, 0).lerp(regardMael, t2)

    const px = lerp(lerp(CAMERA.uni.px, CAMERA.burst.px, t1), CAMERA.mael.px, t2)
    const py = lerp(lerp(CAMERA.uni.py, CAMERA.burst.py, t1), CAMERA.mael.py, t2)
    const tenu = pointeur.actif * (1 - onAxis)
    oeil.x += mx * px * tenu
    oeil.y += my * py * tenu
    oeil.z += (1 - appear) * CAMERA.introDolly

    camera.position.copy(oeil)
    camera.lookAt(regard)

    const maelFov = lerp(
      lerp(CAMERA.maelFovFrom, CAMERA.maelFovTo, pass),
      CAMERA.diveFov,
      through,
    )
    const fov = lerp(lerp(CAMERA.uni.fov, CAMERA.burst.fov, t1), maelFov, t2)
    if (Math.abs(camera.fov - fov) > 1e-3) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }

    // Le curseur, comme un corps dans la matiere : projete a la profondeur
    // de ce que la camera regarde.
    force.axis.copy(regard).sub(oeil).normalize()
    const profondeur = regard.distanceTo(oeil)
    force.world
      .set(mx, my, 0.5)
      .unproject(camera)
      .sub(oeil)
      .normalize()
      .multiplyScalar(profondeur)
      .add(oeil)
    const pf = CAMERA.pointerForce
    force.radius = lerp(lerp(pf.uni.radius, pf.burst.radius, t1), pf.mael.radius, t2)
    force.push = lerp(lerp(pf.uni.push, pf.burst.push, t1), pf.mael.push, t2) * tenu
    force.swirl = lerp(lerp(pf.uni.swirl, pf.burst.swirl, t1), pf.mael.swirl, t2) * tenu
    force.glow = lerp(lerp(pf.uni.glow, pf.burst.glow, t1), pf.mael.glow, t2) * tenu

    // Les etoiles, la poussiere.
    const echelleVue = Math.min(1, Math.max(0.5, hote.clientHeight / 1080))
    etoiles.uniformes.iTime.value = time
    etoiles.uniformes.uAlpha.value = Math.min(1, appear * 1.4)
    etoiles.uniformes.uViewScale.value = echelleVue
    poussiere.uniformes.iTime.value = time
    poussiere.uniformes.uAlpha.value = appear
    poussiere.uniformes.uViewScale.value = echelleVue

    // Le nuage.
    const u = nuage.uniformes
    renderer.getDrawingBufferSize(tampon)
    u.uRes.value.copy(tampon)
    u.iTime.value = time
    u.uUniTime.value = time - debut + FORMES.uniPrime
    u.uAlpha.value = appear * (1 - lisse(0.15, 0.9, logo))
    u.uT1.value = t1
    u.uT2.value = t2
    u.uNeedUni.value = t1 < 1 ? 1 : 0
    u.uNeedBurst.value = t1 > 0 && t2 < 1 ? 1 : 0
    u.uNeedMael.value = t2 > 0 ? 1 : 0
    u.uMaelPhase.value = phase
    u.uPointer.value.copy(force.world)
    u.uPointerAxis.value.copy(force.axis)
    u.uPointerR.value = force.radius
    u.uPointerPush.value = force.push
    u.uPointerSwirl.value = force.swirl
    u.uPointerGlow.value = force.glow
    const glow = lerp(lerp(FORMES.uniGlow, FORMES.burstGlow, t1), FORMES.maelGlow, t2)
    const lueur = melangeLueur(melangeLueur(LUEUR.uni, LUEUR.burst, t1), LUEUR.mael, t2)
    u.uCoreStrength.value = lueur.coreStrength * glow
    u.uCoreSize.value = lueur.coreSize
    u.uCoreSharp.value = lueur.coreSharp
    u.uHaloAmount.value = lueur.haloAmount * glow
    u.uHaloFalloff.value = lueur.haloFalloff

    // Le sigle : a distance fixe devant la camera, decale a droite pendant
    // que le moteur se lit, puis recentre pour la scene finale.
    const s = sigle.uniformes
    const large = hote.clientWidth > hote.clientHeight
    s.uProgress.value = logo
    s.uAlpha.value = borne(logo * 1.6) * SIGLE.brightness
    s.uTime.value = time
    s.uPointScale.value = SIGLE.pointSize * (large ? 1 : 0.5)
    s.uViewScale.value = echelleVue
    const f = sigle.fondUniformes
    f.uTime.value = time
    f.uAlpha.value = borne(logo * 1.6)
    f.uViewScale.value = echelleVue

    avant.set(0, 0, -1).applyQuaternion(camera.quaternion)
    droite.set(1, 0, 0).applyQuaternion(camera.quaternion)
    const decalage = (1 - fini) * (large ? 5.2 : 0)
    const descente = (1 - fini) * (large ? 0 : -2.4)
    sigle.groupe.position
      .copy(camera.position)
      .addScaledVector(avant, SIGLE.devant)
      .addScaledVector(droite, decalage)
    sigle.groupe.position.y += descente
    sigle.groupe.quaternion.copy(camera.quaternion)
    sigle.groupe.rotateY(mx * SIGLE.mouseStrength * 0.4 * pointeur.actif)
    sigle.groupe.rotateX(
      SIGLE.tilt * 0.3 + my * SIGLE.mouseStrength * 0.2 * pointeur.actif,
    )
  }

  const liberer = (): void => {
    if (fin) window.removeEventListener('pointermove', bouger)
    etoiles.geometrie.dispose()
    etoiles.matiere.dispose()
    poussiere.geometrie.dispose()
    poussiere.matiere.dispose()
    nuage.geometrie.dispose()
    nuage.matiere.dispose()
    sigle.geometrie.dispose()
    sigle.matiere.dispose()
    sigle.fondGeometrie.dispose()
    sigle.fondMatiere.dispose()
  }

  return { rendre, liberer }
}
/* ============================ Le repli dessine ========================= */

/** Un tirage stable, pour un ciel qui ne change pas d un rendu a l autre. */
function tirage(graine: number): () => number {
  let s = graine
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

/**
 * Le champ d etoiles et le sigle, au trait : ce que la page montre quand la
 * scene est refusee. La moitie des etoiles de la source, et les deux bras de
 * la galaxie esquisses en pointille.
 */
function CielDessine(): ReactElement {
  const etoiles = useMemo(() => {
    const hasard = tirage(7)
    return Array.from({ length: 1260 }, () => ({
      x: Math.round(hasard() * 1440),
      y: Math.round(hasard() * 900),
      r: 0.4 + Math.pow(hasard(), 6) * 2,
      o: 0.25 + hasard() * 0.6,
      chaude: hasard() < 0.12,
    }))
  }, [])
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      className="o-h-full o-w-full"
      aria-hidden="true"
    >
      <rect width="1440" height="900" fill="var(--o-palette-zinc-950)" />
      <g>
        {etoiles.map((e, rang) => (
          <circle
            key={rang}
            cx={e.x}
            cy={e.y}
            r={e.r}
            fill={e.chaude ? accent(200) : 'var(--o-palette-zinc-100)'}
            opacity={e.o}
          />
        ))}
      </g>
      {/* Les deux bras de la galaxie, en pointille. */}
      <g
        fill="none"
        stroke={accent(400)}
        strokeWidth="1.6"
        strokeDasharray="1 7"
        strokeLinecap="round"
        opacity="0.7"
      >
        <path d="M300 620 C 420 420, 760 330, 1080 400 C 1260 440, 1330 540, 1240 660" />
        <path d="M1160 260 C 1040 430, 700 560, 380 520 C 210 500, 150 420, 250 300" />
      </g>
      <g transform="translate(650 380)">
        <circle
          cx="70"
          cy="70"
          r="64"
          fill="none"
          stroke="url(#vh-repli-orbite)"
          strokeWidth="1.5"
          opacity="0.6"
          strokeDasharray="302 402"
        />
        <g transform="translate(20 20)">
          <path d={traceDuSigle(100)} fill="url(#vh-repli-sigle)" fillRule="evenodd" />
        </g>
        <defs>
          <DegradeMarque id="vh-repli-orbite" />
          <DegradeMarque id="vh-repli-sigle" />
        </defs>
      </g>
    </svg>
  )
}
/* ============================ Les pieces de page ======================= */

/**
 * Un titre en miroir : deux lignes, la premiere s eteint vers la droite, la
 * seconde s allume vers la droite, mot a mot a travers le rideau.
 */
function TitreMiroir({
  haut,
  bas,
  as: Balise = 'h2',
  delai = 0,
  className,
  style,
}: {
  readonly haut: string
  readonly bas: string
  readonly as?: 'h1' | 'h2'
  readonly delai?: number
  readonly className?: string
  readonly style?: CSSProperties
}): ReactElement {
  const clair = 'var(--o-palette-zinc-50)'
  const brume = `color-mix(in oklab, ${accent(200)} 66%, var(--o-palette-zinc-950))`
  const ligne = (texte: string, inverse: boolean, depart: number): ReactElement => {
    const mots = texte.split(' ')
    return (
      <span className="o-block">
        {mots.map((mot, rang) => {
          const de = rang / mots.length
          const a = (rang + 1) / mots.length
          const teinteA = inverse ? 1 - de : de
          const teinteB = inverse ? 1 - a : a
          const couleur = (t: number): string =>
            `color-mix(in oklab, ${clair} ${String(Math.round((1 - t) * 100))}%, ${brume})`
          return (
            <Surgit
              key={`${mot}-${String(rang)}`}
              as="span"
              delai={depart + rang * 80}
              distance={22}
              className="o-inline-block"
              style={{
                marginRight: rang === mots.length - 1 ? 0 : '0.24em',
                backgroundImage: `linear-gradient(90deg, ${couleur(teinteA)}, ${couleur(teinteB)})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              <span aria-hidden="true">{mot}</span>
            </Surgit>
          )
        })}
      </span>
    )
  }
  return (
    <Balise
      className={`o-m-0 o-text-center ${className ?? ''}`}
      style={{ ...affiche('m', 300), ...style }}
      aria-label={`${haut} ${bas}`}
    >
      {ligne(haut, false, delai)}
      {ligne(bas, true, delai + 240)}
    </Balise>
  )
}

/** Une entree a la vue : l element monte cache et se revele quand il arrive dans le champ. */
function Entre({
  children,
  className,
  delai = 0,
  style,
}: {
  readonly children: ReactNode
  readonly className?: string
  readonly delai?: number
  readonly style?: CSSProperties
}): ReactElement {
  const { reduced } = useMotionState()
  const [ref, vu] = useInView<HTMLDivElement>({ threshold: 0.2, once: true })
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: vu ? 1 : 0,
        transform: vu || reduced ? 'none' : 'translate3d(0, 24px, 0)',
        filter: vu || reduced ? 'none' : 'blur(8px)',
        transition: reduced
          ? `opacity 300ms ease ${String(delai)}ms`
          : `opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) ${String(delai)}ms, transform 1100ms cubic-bezier(0.16, 1, 0.3, 1) ${String(delai)}ms, filter 1100ms cubic-bezier(0.16, 1, 0.3, 1) ${String(delai)}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Un ecran colle sur la scene, qui s efface a la fin de sa course.
 *
 * Le conteneur fait `ecrans` hauteurs d ecran ; la composition reste collee
 * sous les barres pendant qu on les parcourt, et s eteint sur le dernier
 * quart, avant de rendre la place au suivant. Sous mouvement reduit, un ecran
 * ordinaire.
 */
function Ecran({
  id,
  ecrans,
  className,
  children,
  style,
}: {
  readonly id: string
  readonly ecrans: number
  readonly className?: string
  readonly style?: CSSProperties
  readonly children: ReactNode
}): ReactElement {
  const { reduced } = useMotionState()
  const scene = useRef<HTMLDivElement>(null)
  const onProgress = useCallback((p: number) => {
    const el = scene.current
    if (el === null) return
    el.style.opacity = String(1 - borne((p - 0.74) / 0.22))
  }, [])
  const { ref } = useScrollScrub<HTMLElement>(reduced ? () => undefined : onProgress, {
    start: 'top top',
    end: 'bottom bottom',
    name: `ecran ${id}`,
  })
  return (
    <section
      ref={ref}
      id={id}
      data-o-epingle
      className={`o-relative o-scroll-mt-24 ${className ?? ''}`}
      style={{ height: reduced ? 'auto' : `calc(${String(ecrans)} * 100vh)`, ...style }}
    >
      <div
        ref={scene}
        className={
          reduced ? 'o-relative o-overflow-hidden' : 'o-sticky o-overflow-hidden'
        }
        style={reduced ? { minHeight: ECRAN } : { top: CHROME, height: ECRAN }}
      >
        {children}
      </div>
    </section>
  )
}

/** Le degrade des gelules d action : l accent, sa nuance sombre, le noir. */
function gelule(): CSSProperties {
  return {
    backgroundImage: `linear-gradient(107deg, ${accent(500)} 0%, ${accent(800)} 51%, var(--o-palette-zinc-950) 100%)`,
    color: 'var(--o-palette-zinc-50)',
  }
}

/** La barre d attente : prenom, e-mail et le bouton a disque, en une seule gelule de verre. Inerte. */
function BarreAttente(): ReactElement {
  const [envoye, setEnvoye] = useState(false)
  const champ =
    'o-min-w-0 o-w-full o-bg-transparent o-border-none o-text-base o-leading-tight sm:o-w-44'
  if (envoye) {
    return (
      <p
        role="status"
        className="o-m-0 o-flex o-h-12 o-items-center o-justify-center o-rounded-full o-border-w-1 o-border-white-20 o-px-8 o-text-base o-text-zinc-50 o-backdrop-blur-md"
        style={{
          backgroundColor:
            'color-mix(in oklab, var(--o-palette-zinc-950) 80%, transparent)',
        }}
      >
        C est note. On te previent a l ouverture.
      </p>
    )
  }
  return (
    <form
      id="prevenu"
      onSubmit={(evenement) => {
        evenement.preventDefault()
        setEnvoye(true)
      }}
      className="o-flex o-flex-col o-gap-2 o-rounded-3xl o-border-w-1 o-border-white-20 o-p-2 o-backdrop-blur-md sm:o-flex-row sm:o-items-center sm:o-gap-5 vh-gelule sm:o-py-0.5 sm:o-pl-8 sm:o-pr-0.5"
      style={{
        backgroundColor:
          'color-mix(in oklab, var(--o-palette-zinc-950) 80%, transparent)',
      }}
    >
      <input
        data-vh-champ=""
        type="text"
        name="prenom"
        autoComplete="given-name"
        required
        aria-label={HEROS.prenom}
        placeholder={HEROS.prenom}
        className={`${champ} o-rounded-2xl o-px-4 o-py-3 sm:o-p-0`}
      />
      <input
        data-vh-champ=""
        type="email"
        name="courriel"
        autoComplete="email"
        required
        aria-label={HEROS.courriel}
        placeholder={HEROS.courriel}
        className={`${champ} o-rounded-2xl o-px-4 o-py-3 sm:o-p-0`}
      />
      <Aimant force={0.25} className="o-shrink-0">
        <button
          type="submit"
          className="o-flex o-w-full o-shrink-0 o-items-center o-justify-center o-gap-2 o-rounded-full o-py-0.5 o-pl-0.5 o-pr-7 o-transition-transform hover:o-scale-105 focus:o-ring"
          style={gelule()}
        >
          <span
            className="o-flex o-size-10 o-items-center o-justify-center o-rounded-full o-bg-zinc-50 o-text-zinc-950"
            aria-hidden="true"
          >
            <Icon icon={ChevronRight} size={20} />
          </span>
          <span className="o-whitespace-nowrap o-text-base">{HEROS.envoyer}</span>
        </button>
      </Aimant>
    </form>
  )
}

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('manrope')
  useFeuille()
  const { reduced } = useMotionState()

  const [racine, setRacine] = useState<HTMLElement | null>(null)
  const mesures = useRef<Mesures | null>(null)
  const monde = useRef<Monde | null>(null)

  // Ou sont les cinq ecrans : mesure au montage, a chaque changement de
  // taille, et une fois les polices arrivees. Jamais a l image.
  useEffect(() => {
    if (racine === null) return
    const mesurer = (): void => {
      const lire = (id: string): Plage | null => {
        const el = document.getElementById(id)
        if (el === null) return null
        const boite = el.getBoundingClientRect()
        return { top: boite.top + window.scrollY, bottom: boite.bottom + window.scrollY }
      }
      const haut = lire('haut')
      const chaine = lire('chaine')
      const parcours = lire('parcours')
      const lancement = lire('lancement')
      const final = lire('final')
      mesures.current =
        haut && chaine && parcours && lancement && final
          ? { haut, chaine, parcours, lancement, final }
          : null
    }
    mesurer()
    const observateur = new ResizeObserver(mesurer)
    observateur.observe(document.documentElement)
    observateur.observe(racine)
    const tard = window.setTimeout(mesurer, 900)
    return () => {
      observateur.disconnect()
      window.clearTimeout(tard)
    }
  }, [racine])

  // La scene est montee une fois : rien de ce qui defile au-dessus ne doit
  // la reconstruire. Elle lit la racine pour ses couleurs.
  const scene = useMemo(
    () =>
      racine === null ? null : (
        <Volume
          nom="helion"
          className="o-pointer-events-none o-absolute o-inset-0 o-z-0"
          repli={<CielDessine />}
          construire={(contexte) => {
            const hote = contexte.renderer.domElement.parentElement ?? racine
            const m = construireLeMonde(contexte, racine, hote)
            monde.current = m
            return () => {
              m.liberer()
              monde.current = null
            }
          }}
          animer={(_contexte, { time, delta }) => {
            monde.current?.rendre(mesures.current, time, delta)
          }}
        />
      ),
    [racine],
  )

  return (
    <Porte forme="compteur" marque="ODORO">
      <div
        ref={setRacine}
        className="o-relative o-text-zinc-50"
        style={{ ...polices, ...nuit('zinc') }}
      >
        <BarreGelule
          marque={
            <span
              className="o-inline-flex o-items-center o-gap-2 o-lowercase"
              style={{ color: accent(400) }}
            >
              <Sigle taille={17} />
              odoro
            </span>
          }
          liens={NAVIGATION}
          action={['#prevenu', 'Etre prevenu']}
        />

        <div className="o-relative">
          {/* La scene, collee du premier au dernier ecran. */}
          <div
            className="o-sticky o-z-0 o-overflow-hidden"
            style={{ top: CHROME, height: ECRAN }}
          >
            {scene}
            {/* Le voile : la bande du haut pour la barre, celle du bas pour les actions. */}
            <div
              aria-hidden="true"
              className="o-pointer-events-none o-absolute o-inset-0 o-z-10"
              style={{
                background:
                  'linear-gradient(to bottom, color-mix(in oklab, var(--o-palette-zinc-950) 70%, transparent) 0%, transparent 22%, transparent 74%, color-mix(in oklab, var(--o-palette-zinc-950) 62%, transparent) 100%)',
              }}
            />
            <Grain opacite={0.05} />
          </div>

          <main
            className="o-relative o-z-10"
            style={{ marginTop: `calc(-1 * ${ECRAN})` }}
          >
            {/*
              ----- Le heros : la galaxie ----------------------------------------
            */}
            <Ecran id="haut" ecrans={1.4}>
              <div className="o-flex o-h-full o-flex-col o-items-center o-justify-between o-px-6 o-pb-8 o-pt-24 o-text-center md:o-pt-28">
                <TitreMiroir
                  as="h1"
                  haut={HEROS.haut}
                  bas={HEROS.bas}
                  delai={120}
                  className="o-max-w-4xl"
                  style={{ fontSize: 'clamp(2.1rem, 5.2vw, 4.75rem)', lineHeight: 1.02 }}
                />

                {/* L embleme, dans son anneau, sur un disque sombre qui le decolle du champ. */}
                <Surgit
                  delai={360}
                  duree={1400}
                  distance={0}
                  className="o-relative o-flex o-items-center o-justify-center"
                >
                  <span
                    aria-hidden="true"
                    className="o-pointer-events-none o-absolute o-rounded-full"
                    style={{
                      width: 'clamp(150px, 26vh, 230px)',
                      height: 'clamp(150px, 26vh, 230px)',
                      background:
                        'radial-gradient(circle, color-mix(in oklab, var(--o-palette-zinc-950) 85%, transparent) 0%, color-mix(in oklab, var(--o-palette-zinc-950) 55%, transparent) 55%, transparent 72%)',
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className="o-pointer-events-none o-absolute o-rounded-full o-border-w-1 o-border-white-20"
                    style={{
                      width: 'clamp(190px, 34vh, 290px)',
                      height: 'clamp(190px, 34vh, 290px)',
                    }}
                  />
                  <Embleme className="o-size-24 md:o-size-32" />
                </Surgit>

                <div className="o-flex o-w-full o-flex-col o-items-center o-gap-6">
                  <Surgit
                    delai={520}
                    as="p"
                    className="o-m-0 o-max-w-md o-text-base o-leading-snug o-text-zinc-50"
                  >
                    {HEROS.texte}
                  </Surgit>
                  <Surgit delai={660} className="o-w-full o-max-w-2xl">
                    <BarreAttente />
                  </Surgit>
                </div>
              </div>
            </Ecran>

            {/*
              ----- La chaine : le souffle ----------------------------------------
            */}
            <Ecran id="chaine" ecrans={1.4}>
              <div className="o-flex o-h-full o-flex-col o-justify-between o-px-6 o-pb-10 o-pt-24 md:o-px-12 md:o-pt-28">
                <TitreMiroir
                  haut={CHAINE.haut}
                  bas={CHAINE.bas}
                  style={{ fontSize: 'clamp(2rem, 4.6vw, 4.25rem)', lineHeight: 1.02 }}
                />

                {/* Quatre cellules aux deux bords ; le coeur du souffle tombe au milieu. */}
                <div className="o-grid o-gap-x-10 o-gap-y-7 md:o-grid-cols-12">
                  {[
                    CHAINE.gauche[0],
                    CHAINE.droite[0],
                    CHAINE.gauche[1],
                    CHAINE.droite[1],
                  ].map((role, rang) => {
                    const droite = rang % 2 === 1
                    return (
                      <Entre
                        key={role.titre}
                        delai={rang * 110}
                        className={`o-max-w-sm ${droite ? 'md:o-col-span-4 vh-col9 md:o-justify-self-end md:o-text-right' : 'md:o-col-span-4'}`}
                      >
                        <p
                          className="o-m-0 o-text-2xl o-font-light o-text-zinc-50 md:o-text-3xl"
                          style={{
                            lineHeight: 1,
                            fontFamily: 'var(--o-vitrine-affichage)',
                          }}
                        >
                          {role.titre}
                        </p>
                        <p className="o-m-0 o-mt-3 o-text-base o-leading-snug o-text-zinc-50">
                          {role.texte}
                        </p>
                        <span
                          aria-hidden="true"
                          className="o-mt-4 o-block o-h-px o-w-full"
                          style={{
                            backgroundImage: droite
                              ? `linear-gradient(90deg, transparent, ${accent(200)})`
                              : `linear-gradient(90deg, ${accent(500)}, transparent)`,
                          }}
                        />
                      </Entre>
                    )
                  })}
                </div>

                <div className="o-mx-auto o-max-w-md o-text-center o-text-base o-leading-snug o-text-zinc-50">
                  <SplitLines as="p" className="o-m-0" stagger={110}>
                    {CHAINE.note}
                  </SplitLines>
                </div>
              </div>
            </Ecran>

            {/*
              ----- Le parcours : le rail sur le maelstrom ------------------------
            */}
            <section
              id="parcours"
              className="o-scroll-mt-24"
              style={{ marginTop: reduced ? 0 : 'clamp(140px, 30vh, 300px)' }}
            >
              <Rail
                ecrans={3.2}
                entete={
                  <div className="o-px-6 o-pb-4 o-pt-24 md:o-pt-28">
                    <TitreMiroir
                      haut={PARCOURS.haut}
                      bas={PARCOURS.bas}
                      style={{
                        fontSize: 'clamp(2rem, 4.6vw, 4.25rem)',
                        lineHeight: 1.02,
                      }}
                    />
                  </div>
                }
              >
                {/* Une frise : cinq stations sur une meme ligne de base. */}
                <div className="o-relative o-flex o-items-end o-pb-10 o-pt-16 md:o-pt-24">
                  <span
                    aria-hidden="true"
                    className="o-absolute o-bottom-10 o-left-12 o-right-12 o-h-px"
                    style={{
                      backgroundColor: `color-mix(in oklab, ${accent(400)} 30%, transparent)`,
                    }}
                  />
                  {PARCOURS.etapes.map((etape, rang) => (
                    <div
                      key={etape.indice}
                      className="o-relative o-shrink-0 o-pl-6 md:o-pl-12"
                      style={{
                        width: 'clamp(300px, 34vw, 560px)',
                        marginRight:
                          rang === PARCOURS.etapes.length - 1
                            ? 'clamp(24px, 6vw, 96px)'
                            : 0,
                      }}
                    >
                      {/* La tige qui monte de la ligne de base, et son repere triangulaire. */}
                      <span
                        aria-hidden="true"
                        className="o-absolute o-bottom-0 o-left-0 o-w-px md:o-left-6"
                        style={{
                          top: 0,
                          backgroundImage: `linear-gradient(180deg, transparent, ${accent(500)})`,
                          opacity: 0.6,
                        }}
                      />
                      <svg
                        aria-hidden="true"
                        width="19"
                        height="19"
                        viewBox="0 0 19 19"
                        className="o-absolute o-bottom-0 o-left-0 md:o-left-6"
                        style={{ transform: 'translateX(-9px)' }}
                      >
                        <path
                          d="M9.5 0L19 19H0L9.5 0Z"
                          fill={`url(#vh-tri-${etape.indice})`}
                        />
                        <defs>
                          <linearGradient
                            id={`vh-tri-${etape.indice}`}
                            x1="0"
                            y1="0"
                            x2="19"
                            y2="19"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor={accent(500)} />
                            <stop offset="1" stopColor={accent(200)} />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="o-pb-8 o-pl-4">
                        <p
                          className="o-m-0 o-text-base o-tabular-nums"
                          style={{ color: accent(300) }}
                        >
                          {etape.indice}
                        </p>
                        <h3
                          className="o-m-0 o-mt-3 o-text-3xl o-font-light o-text-zinc-50 md:o-text-4xl"
                          style={{
                            lineHeight: 1,
                            fontFamily: 'var(--o-vitrine-affichage)',
                          }}
                        >
                          <DecodeText as="span" duration={900}>
                            {etape.titre}
                          </DecodeText>
                        </h3>
                        <p className="o-m-0 o-mt-5 o-max-w-sm o-text-base o-leading-snug o-text-zinc-50">
                          {etape.texte}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Rail>
            </section>

            {/*
              ----- Sous le capot : le sigle s assemble ---------------------------
            */}
            <Ecran id="lancement" ecrans={2.4} style={{ marginTop: reduced ? 0 : 96 }}>
              <div className="o-flex o-h-full o-flex-col o-justify-between o-px-6 o-pb-10 o-pt-24 md:o-max-w-xl md:o-px-12 md:o-pt-28">
                <div>
                  <Indice rang="03">{MOTEUR.rubrique}</Indice>
                  <h2
                    className="o-m-0 o-mt-5 o-max-w-lg o-text-balance o-font-light o-text-zinc-50"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.75rem, 3.4vw, 3rem)',
                      lineHeight: 1.1,
                    }}
                  >
                    {MOTEUR.titre}
                  </h2>
                </div>

                <ol className="o-m-0 o-list-none o-p-0">
                  {MOTEUR.pieces.map((piece, rang) => (
                    <li
                      key={piece.mot}
                      className="o-border-t o-border-white-10 o-py-4 md:o-py-5"
                      style={rang === 0 ? { borderTopWidth: 0 } : undefined}
                    >
                      <Entre delai={rang * 120}>
                        <p
                          className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                          style={{ color: accent(300) }}
                        >
                          {String(rang + 1).padStart(2, '0')} — {piece.mot}
                        </p>
                        <p
                          className="o-m-0 o-mt-2 o-text-xl o-font-light o-leading-tight o-text-zinc-50 md:o-text-2xl"
                          style={{ fontFamily: 'var(--o-vitrine-affichage)' }}
                        >
                          {piece.titre}
                        </p>
                        <p className="o-m-0 o-mt-2 o-max-w-md o-text-sm o-leading-relaxed o-text-zinc-300">
                          {piece.texte}
                        </p>
                      </Entre>
                    </li>
                  ))}
                </ol>

                <p className="o-m-0 o-max-w-md o-text-xs o-leading-relaxed o-tracking-wide o-text-zinc-400">
                  {MOTEUR.note}
                </p>
              </div>
            </Ecran>

            {/*
              ----- La scene finale : le heros, sans formulaire -------------------
            */}
            <Ecran id="final" ecrans={1.6}>
              <div className="o-flex o-h-full o-flex-col o-items-center o-justify-between o-px-6 o-pb-10 o-pt-24 o-text-center md:o-pt-28">
                <TitreMiroir
                  haut={FINAL.haut}
                  bas={FINAL.bas}
                  style={{ fontSize: 'clamp(2.1rem, 5.2vw, 4.75rem)', lineHeight: 1.02 }}
                />
                <div className="o-flex o-flex-col o-items-center o-gap-6">
                  <p className="o-m-0 o-max-w-md o-text-base o-leading-snug o-text-zinc-50">
                    {FINAL.texte}
                  </p>
                  <Aimant force={0.3}>
                    <a
                      href="#prevenu"
                      className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-border-white-20 o-bg-white-10 o-px-6 o-py-3 o-text-sm o-font-semibold o-text-zinc-50 o-no-underline o-backdrop-blur-md o-transition-colors hover:o-bg-white-20 focus:o-ring"
                    >
                      Laisser mon adresse
                      <Icon icon={ArrowUpRight} size={16} aria-hidden="true" />
                    </a>
                  </Aimant>
                </div>
              </div>
            </Ecran>
          </main>
        </div>

        {/*
          ----- Le pied : bande haute, bande de liens, ligne de base --------------
        */}
        <footer
          className="o-relative o-z-10 o-px-6 o-pb-10 o-pt-16 md:o-px-12"
          style={{ backgroundColor: 'var(--o-palette-zinc-950)' }}
        >
          <span
            aria-hidden="true"
            className="vh-filet o-absolute o-top-0 o-h-px"
            style={{
              backgroundImage: `linear-gradient(90deg, transparent, ${accent(300)} 50%, transparent)`,
              opacity: 0.4,
            }}
          />
          <div className="o-flex o-flex-col o-items-start o-justify-between o-gap-8 o-pb-12 md:o-flex-row md:o-items-end">
            <div>
              <p
                className="o-m-0 o-flex o-items-center o-gap-4 o-lowercase o-text-zinc-50"
                style={{
                  lineHeight: 1,
                  ...affiche('l', 300),
                  fontSize: 'clamp(2.75rem, 7vw, 5.75rem)',
                  letterSpacing: '0.02em',
                }}
              >
                <span style={{ color: accent(400) }}>
                  <Sigle taille={44} />
                </span>
                odoro
              </p>
              <p className="o-m-0 o-mt-5 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-300">
                {PIED.slogan}
              </p>
            </div>
            <a
              href="#prevenu"
              className="o-inline-flex o-shrink-0 o-items-center o-gap-3 o-rounded-full o-border-w-1 o-border-white-20 o-px-6 o-py-3.5 o-text-sm o-font-medium o-tracking-wide o-text-zinc-50 o-no-underline o-transition-colors hover:o-bg-white-10 focus:o-ring"
            >
              Etre prevenu
              <Icon
                icon={ArrowRight}
                size={15}
                aria-hidden="true"
                style={{ color: accent(400) }}
              />
            </a>
          </div>

          <nav
            aria-label="Pied de page"
            className="o-flex o-flex-wrap o-items-center o-gap-7 o-border-t o-border-b o-border-white-10 o-py-6"
          >
            {PIED.liens.map(([href, mot]) => (
              <a
                key={href}
                href={href}
                className="o-text-sm o-tracking-wide o-text-zinc-300 o-no-underline o-transition-colors hover:o-text-zinc-50 focus:o-ring"
              >
                {mot}
              </a>
            ))}
          </nav>

          <div className="o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-pt-7 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
            <span>{PIED.mention}</span>
            <a
              href="#haut"
              className="o-inline-flex o-items-center o-gap-2 o-text-zinc-300 o-no-underline hover:o-text-zinc-50 focus:o-ring"
            >
              Haut de page ↑
            </a>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
