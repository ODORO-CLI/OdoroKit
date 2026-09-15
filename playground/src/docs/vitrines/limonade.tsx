/**
 * Vif — limonaderie artisanale, quai Wilson a Nantes.
 *
 * ## Un seul ecran, et un seul geste
 *
 * La page tient en une ouverture. Au centre, **une canette en volume** dans
 * une lueur radiale ; autour d elle, en verre depoli, la barre et les cartes
 * de parfum. Le sujet de la page n est pas la canette : c est **le geste**.
 * Choisir un parfum fait tourner la canette d un tour et demi, **reteinte
 * toute la page** — le fond de la scene, la lueur, les bulles, le filet de la
 * bande — et **change les mentions** : l accroche, le titre, le fruit, la
 * maceration, le sucre, la saison.
 *
 * Rien d autre ne suit : une bande d appel, une lettre signee, et c est fini.
 * Une limonaderie qui fait cinq parfums n a pas douze sections a dire.
 *
 * ## D ou vient la couleur
 *
 * Jamais d un hexadecimal ecrit a la main. Les cinq parfums sont **cinq
 * points sur un segment** tendu entre deux jetons de la palette : l accent de
 * la vitrine (`--o-vitrine-*`) d un cote, la couleur d appoint
 * (`--o-vitrine-seconde`) de l autre. Le cedrat est a l accent, le cassis a
 * l appoint, les trois autres entre les deux. Repeindre la vitrine en bleu
 * depuis la barre repeint les cinq parfums, la canette comprise : la scene
 * relit les deux bornes a chaque rendu et la matiere rejoint la nouvelle
 * cible en fondu, sans se remonter.
 *
 * Le segment se parcourt **en polaire** des deux cotes : `color-mix(in oklch)`
 * en CSS, `Color.lerpHSL` dans la scene, sur les memes bornes lues par
 * `teinte()`. C est ce qui evite le gris du milieu — en coordonnees
 * rectangulaires, a mi-chemin entre un citron et un cassis on obtient un
 * acier. Ici la teinte tourne : citron, herbe, turquoise, bleu, cassis.
 *
 * Les **lumieres**, elles, restent des entiers : une lumiere n est pas du
 * texte, et une lampe teintee mentirait sur la couleur de la boisson.
 *
 * ## La surface
 *
 * Une seule surface graphique : la canette, en three.js. Aucun fond de
 * registre — le fond est la scene elle-meme, dont l arriere-plan porte la
 * teinte du parfum, plus une lueur radiale en `screen` par-dessus le canevas
 * et des bulles en CSS. Refusee (mouvement reduit, pas de WebGL, plafond
 * atteint), la scene cede la place a **la meme canette dessinee**, qui se
 * reteinte exactement pareil : la page ne perd pas son sujet.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { type SceneContext } from '@odoro-cli/engine/three'
import { Icon } from '@odoro-cli/icons'
import { ArrowUpRight } from '@odoro-cli/icons/outline'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { ClickSparks } from '@/odoro/effect/ClickSparks.jsx'
import { GradientFlow } from '@/odoro/text/GradientFlow.jsx'
import { GlassSurface } from '@/odoro/ui/GlassSurface.jsx'
import { LiquidButton } from '@/odoro/ui/LiquidButton.jsx'

import { nuit } from './communs.jsx'
import {
  affiche,
  BarreGelule,
  CHROME,
  Coin,
  Etiquette,
  Grain,
  Porte,
  Surgit,
  usePolices,
  verre,
} from './marche.jsx'
import { accent, aplat } from './palettes.js'
import { Aimant, Bandeau } from './scene.jsx'
import { eclairer, teinte, Volume } from './volume.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Une couleur de la scene, typee sans dependre du paquet `three`. */
type Couleur3D = InstanceType<SceneContext['three']['Color']>

/* ============================ Les parfums ============================== */

/** Un parfum de la gamme. */
interface Parfum {
  readonly cle: string
  readonly nom: string
  /** L article qui precede le nom dans le titre : « au », « a la ». */
  readonly article: string
  /**
   * Sa place sur le segment tendu entre les deux jetons de la palette.
   * Zero : l accent de la vitrine. Un : la couleur d appoint.
   */
  readonly t: number
  /** L accroche cursive de gauche. */
  readonly gauche: string
  /** L accroche cursive de droite. */
  readonly droite: string
  /** La phrase sous le titre. */
  readonly phrase: string
  readonly fruit: string
  readonly macere: string
  readonly sucre: string
  readonly saison: string
}

/** Les cinq parfums, du plus vert au plus noir. */
const PARFUMS = [
  {
    cle: 'cedrat',
    nom: 'cedrat',
    article: 'au',
    t: 0,
    gauche: 'pressee le jeudi,',
    droite: 'bue le dimanche.',
    phrase:
      'Le zeste avant le jus : les cedrats sont rapes entiers, et l amertume blanche part au couteau.',
    fruit: 'Cedrat de Corse, Ghisonaccia',
    macere: 'Quatre jours au froid',
    sucre: '3,8 g pour 100 ml',
    saison: 'Novembre a mars',
  },
  {
    cle: 'verveine',
    nom: 'verveine',
    article: 'a la',
    t: 0.26,
    gauche: 'cueillie a la main,',
    droite: 'infusee a froid.',
    phrase:
      'Trois cents feuilles par fournee, douze heures dans l eau froide. Chauffee, la verveine tourne au foin.',
    fruit: 'Verveine citronnee, Drome',
    macere: 'Douze heures a froid',
    sucre: '2,9 g pour 100 ml',
    saison: 'Juin a septembre',
  },
  {
    cle: 'sureau',
    nom: 'sureau',
    article: 'au',
    t: 0.5,
    gauche: 'ombelles ramassees,',
    droite: 'au bord du chemin.',
    phrase:
      'Les ombelles partent dans la cuve le matin meme : passe midi, elles ne donnent plus rien.',
    fruit: 'Sureau noir, bocage vendeen',
    macere: 'Deux jours en cuve ouverte',
    sucre: '4,4 g pour 100 ml',
    saison: 'Mai et juin, six semaines',
  },
  {
    cle: 'framboise',
    nom: 'framboise',
    article: 'a la',
    t: 0.76,
    gauche: 'ecrasee au tamis,',
    droite: 'jamais filtree.',
    phrase:
      'Pulpe entiere, pepins retires au tamis. Le trouble au fond de la bouteille, c est la framboise.',
    fruit: 'Framboise Tulameen, Anjou',
    macere: 'Vingt heures sur pulpe',
    sucre: '5,1 g pour 100 ml',
    saison: 'Juillet a octobre',
  },
  {
    cle: 'cassis',
    nom: 'cassis',
    article: 'au',
    t: 1,
    gauche: 'grappes egrappees,',
    droite: 'une a une.',
    phrase:
      'Un cassis noir de Bourgogne, egrappe a la fourchette, qui teint la bouteille avant la langue.',
    fruit: 'Cassis Noir de Bourgogne, Nuits',
    macere: 'Trois jours sur grappe',
    sucre: '4,7 g pour 100 ml',
    saison: 'Aout a novembre',
  },
] as const satisfies readonly Parfum[]

/** Les liens de la barre. */
const NAVIGATION = [
  ['#parfums', 'Les parfums'],
  ['#commander', 'Commander'],
  ['#lettre', 'La limonaderie'],
] as const

/** Les mots de la bande d appel, qui defilent dedans. */
const APPEL = [
  'Caisse de douze',
  'Verre consigne',
  'Livree a velo',
  'Nantes intra-muros',
  'Le jeudi et le samedi',
] as const

/** Les bulles qui montent, semees une fois pour toutes. */
const BULLES = [
  { x: 7, taille: 10, duree: 17, delai: 0, derive: 22, opacite: 0.5, repos: 12 },
  { x: 14, taille: 5, duree: 12, delai: 4, derive: -14, opacite: 0.4, repos: 58 },
  { x: 22, taille: 16, duree: 21, delai: 8, derive: 30, opacite: 0.34, repos: 31 },
  { x: 29, taille: 7, duree: 14, delai: 2, derive: -20, opacite: 0.46, repos: 74 },
  { x: 36, taille: 12, duree: 19, delai: 11, derive: 16, opacite: 0.3, repos: 20 },
  { x: 44, taille: 6, duree: 13, delai: 6, derive: 26, opacite: 0.5, repos: 66 },
  { x: 52, taille: 14, duree: 23, delai: 1, derive: -24, opacite: 0.28, repos: 44 },
  { x: 59, taille: 8, duree: 15, delai: 9, derive: 18, opacite: 0.44, repos: 85 },
  { x: 66, taille: 5, duree: 11, delai: 5, derive: -12, opacite: 0.5, repos: 27 },
  { x: 73, taille: 17, duree: 24, delai: 13, derive: 28, opacite: 0.26, repos: 52 },
  { x: 80, taille: 9, duree: 16, delai: 3, derive: -18, opacite: 0.42, repos: 9 },
  { x: 88, taille: 6, duree: 12, delai: 10, derive: 20, opacite: 0.48, repos: 71 },
  { x: 94, taille: 13, duree: 20, delai: 7, derive: -26, opacite: 0.32, repos: 38 },
] as const

/* ============================ Les teintes ============================== */

/**
 * La teinte d un parfum, a la nuance demandee.
 *
 * Le segment va de l accent de la vitrine a sa couleur d appoint : a `t` nul
 * la couleur est celle de l accent, a `t` plein celle de l appoint. C est ce
 * qui donne cinq parfums de cinq couleurs sans qu aucune soit ecrite.
 *
 * ## Pourquoi `oklch` et non `oklab`
 *
 * Melangees en coordonnees rectangulaires, deux teintes eloignees passent par
 * le gris : a mi-chemin entre un citron et un cassis, `oklab` rend un acier
 * sans couleur, et les parfums du milieu perdent leur identite. En polaire, la
 * teinte tourne au lieu de se traverser — le sureau devient turquoise, la
 * framboise bleue, et les cinq gardent la meme force.
 */
function teinteParfum(t: number, nuance: number): string {
  const part = Math.round((1 - t) * 100)
  return `color-mix(in oklch, ${accent(nuance)} ${String(part)}%, var(--o-vitrine-seconde))`
}

/** La meme teinte, fondue dans le fond de la page : les aplats profonds. */
function fondParfum(t: number, part: number, nuance = 500): string {
  return `color-mix(in oklab, ${teinteParfum(t, nuance)} ${String(part)}%, var(--o-theme-bg))`
}

/** La meme teinte, rendue translucide : les lueurs et les filets. */
function voileParfum(t: number, part: number, nuance = 400): string {
  return `color-mix(in oklab, ${teinteParfum(t, nuance)} ${String(part)}%, transparent)`
}

/* ============================ Les petites pieces ======================= */

/**
 * Une entree douce, rejouee a chaque changement de parfum.
 *
 * Les mentions changent de cle avec le parfum : chacune revient d un flou et
 * d une courte montee, en meme temps que la canette finit son tour. Sous
 * mouvement reduit, l opacite seule.
 */
function Entre({
  children,
  as: Balise = 'div',
  className,
  delai = 0,
}: {
  readonly children: ReactNode
  readonly as?: 'div' | 'span' | 'p'
  readonly className?: string
  readonly delai?: number
}): ReactElement {
  const { reduced } = useMotionState()
  const [vu, setVu] = useState(false)
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      setVu(true)
    })
    return () => {
      window.cancelAnimationFrame(id)
    }
  }, [])
  return (
    <Balise
      className={className}
      style={{
        opacity: vu ? 1 : 0,
        transform: vu || reduced ? 'none' : 'translate3d(0, 14px, 0)',
        filter: vu || reduced ? 'none' : 'blur(7px)',
        transition: reduced
          ? `opacity 260ms ease ${String(delai)}ms`
          : `opacity 420ms cubic-bezier(0.16, 1, 0.3, 1) ${String(delai)}ms, transform 720ms cubic-bezier(0.16, 1, 0.3, 1) ${String(delai)}ms, filter 720ms cubic-bezier(0.16, 1, 0.3, 1) ${String(delai)}ms`,
      }}
    >
      {children}
    </Balise>
  )
}

/** Une accroche cursive, comme ecrite dans la marge du carnet de fabrication. */
function Accroche({
  children,
  angle,
}: {
  readonly children: string
  readonly angle: number
}): ReactElement {
  return (
    <p
      className="o-m-0 o-font-serif o-italic o-leading-tight o-text-zinc-100"
      style={{
        fontSize: 'clamp(1.25rem, 2vw, 1.85rem)',
        transform: `rotate(${String(angle)}deg)`,
      }}
    >
      {children}
    </p>
  )
}

/* ============================ La canette dessinee ====================== */

/**
 * La canette, dessinee au trait.
 *
 * C est le repli de la scene, et il montre la meme chose : le meme corps
 * legerement conique, le meme jonc en haut, la meme teinte de parfum — qui
 * change avec le parfum choisi, comme la vraie.
 */
function CanetteDessinee({ t }: { readonly t: number }): ReactElement {
  const corps = teinteParfum(t, 500)
  const ombre = teinteParfum(t, 700)
  const metal = accent(100)
  return (
    <svg
      viewBox="0 0 180 300"
      className="o-h-full o-w-full"
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <linearGradient id="o-limonade-corps" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={ombre} />
          <stop offset="0.08" stopColor={corps} />
          <stop offset="0.32" stopColor={metal} stopOpacity="0.5" />
          <stop offset="0.46" stopColor={corps} />
          <stop offset="0.88" stopColor={corps} />
          <stop offset="1" stopColor={ombre} />
        </linearGradient>
        <linearGradient id="o-limonade-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={ombre} />
          <stop offset="0.44" stopColor={metal} />
          <stop offset="1" stopColor={ombre} />
        </linearGradient>
      </defs>

      {/* Le fond de la canette, vu de trois quarts dessous. */}
      <ellipse
        cx="90"
        cy="240"
        rx="52"
        ry="15"
        fill="url(#o-limonade-metal)"
        opacity="0.85"
      />
      {/* Le corps, plus large en bas qu en haut. */}
      <path
        d="M44 72 L38 240 L142 240 L136 72 Z"
        fill="url(#o-limonade-corps)"
        stroke={metal}
        strokeWidth="1.2"
        strokeOpacity="0.5"
      />
      {/* L epaule qui rentre, le couvercle, et le jonc qui les serre. */}
      <path
        d="M56 44 L124 44 L136 72 L44 72 Z"
        fill="url(#o-limonade-metal)"
        opacity="0.9"
      />
      <ellipse cx="90" cy="44" rx="34" ry="9" fill={metal} opacity="0.9" />
      <ellipse cx="90" cy="44" rx="36" ry="10.5" stroke={metal} strokeWidth="3" />
      {/* Le jonc du bas, et le filet de ceinture. */}
      <ellipse
        cx="90"
        cy="240"
        rx="52"
        ry="15"
        stroke={metal}
        strokeWidth="2.5"
        opacity="0.7"
      />
      <path d="M41 156 L139 156" stroke={metal} strokeWidth="1.5" opacity="0.35" />
      {/* Le reflet vertical : sans lui, un metal peint est un carton. */}
      <path d="M67 72 L65 238 L75 238 L76 72 Z" fill={metal} opacity="0.34" />
      <text
        x="90"
        y="132"
        textAnchor="middle"
        fill={metal}
        style={{
          fontFamily: 'var(--o-vitrine-affichage, var(--o-font-sans))',
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: '-0.04em',
        }}
      >
        Vif
      </text>
    </svg>
  )
}

/* ============================ La page ================================== */

/** Ce que la scene garde sous la main d une image a l autre. */
interface MemoireDeScene {
  /** La borne basse du segment : l accent de la vitrine. */
  bas: Couleur3D
  /** La borne haute : la couleur d appoint. */
  haut: Couleur3D
  /** La couleur visee par la matiere du corps. */
  vise: Couleur3D
  /** La couleur visee par l arriere-plan de la scene. */
  viseFond: Couleur3D
  /** Les deux bornes telles qu elles ont ete lues : relire coute, comparer non. */
  lues: string
}

export default function Page(): ReactElement {
  const polices = usePolices('unbounded')

  const [rang, setRang] = useState(0)
  const parfum: Parfum = PARFUMS[rang] ?? PARFUMS[0]

  // Ce que la scene lit sans provoquer de rendu : la cible de rotation, la
  // place du parfum sur le segment, et les deux bornes relues du CSS.
  const visee = useRef<{ t: number; angle: number }>({ t: PARFUMS[0].t, angle: 0 })
  const bornes = useRef({ bas: '#b7e04a', haut: '#7c3aed' })
  const memoire = useRef<MemoireDeScene | null>(null)

  // Relues a chaque rendu : changer la palette dans la barre change ces deux
  // valeurs, et la matiere rejoint la nouvelle cible en fondu — sans remonter
  // la scene, qui repartirait a zero.
  useEffect(() => {
    bornes.current = {
      bas: teinte('--o-vitrine-300', '#b7e04a'),
      haut: teinte('--o-vitrine-seconde', '#7c3aed'),
    }
  })

  const choisir = useCallback((suivant: number) => {
    setRang(suivant)
    visee.current.t = PARFUMS[suivant]?.t ?? 0
    // Un tour et demi : assez pour qu on voie la canette tourner, pas assez
    // pour qu on attende qu elle s arrete.
    visee.current.angle += Math.PI * 1.5
  }, [])

  const servirLeSuivant = useCallback(() => {
    choisir((rang + 1) % PARFUMS.length)
  }, [choisir, rang])

  const lueur = [
    `radial-gradient(62% 50% at 50% 34%, transparent 2%, ${voileParfum(parfum.t, 40, 400)} 42%, transparent 80%)`,
    `radial-gradient(86% 46% at 50% 100%, ${voileParfum(parfum.t, 30, 600)}, transparent 70%)`,
  ].join(', ')

  return (
    <Porte forme="lettres" marque="Vif">
      <div className="o-relative o-text-zinc-50" style={{ ...polices, ...nuit('zinc') }}>
        {/* La regle des bulles : une montee, une derive laterale, et rien du
            tout sous mouvement reduit — ou elles restent posees, immobiles. */}
        <style>
          {[
            '@keyframes o-limonade-bulle{',
            '0%{transform:translate3d(0,0,0);opacity:0}',
            '14%{opacity:var(--o-bulle-opacite)}',
            '84%{opacity:var(--o-bulle-opacite)}',
            '100%{transform:translate3d(var(--o-bulle-derive),calc(-1 * var(--o-bulle-course)),0);opacity:0}',
            '}',
            '[data-o-limonade-bulle]{animation:o-limonade-bulle var(--o-bulle-duree) linear var(--o-bulle-delai) infinite}',
            '@media (prefers-reduced-motion:reduce){',
            '[data-o-limonade-bulle]{animation:none;opacity:calc(var(--o-bulle-opacite) * 0.7);transform:translate3d(var(--o-bulle-derive),var(--o-bulle-repos),0)}',
            '}',
          ].join('')}
        </style>

        <BarreGelule
          marque="Vif"
          liens={NAVIGATION}
          action={['#commander', 'Commander']}
        />

        {/*
          ----- L ouverture : la canette, et le geste qui reteinte tout -------

          La scene occupe le cadre entier ; son arriere-plan porte la teinte du
          parfum, donc c est elle le fond de la page. La lueur passe par-dessus
          en `screen` : sur du transparent elle ne fait rien, au centre elle
          allume. Le contenu, lui, est au-dessus des deux.
        */}
        <main>
          <section
            id="haut"
            className="o-relative o-isolate o-flex o-flex-col o-overflow-hidden"
            // Le verre du pupitre se teinte par jeton : la piece ne prend que
            // des noms de variables, on lui en pose donc une qui suit le
            // parfum plutot que l accent fixe de la vitrine.
            style={
              {
                minHeight: ECRAN,
                backgroundColor: fondParfum(parfum.t, 16),
                transition: 'background-color 700ms ease',
                '--o-limonade-verre': teinteParfum(parfum.t, 400),
              } as CSSProperties
            }
          >
            <Volume
              nom="canette Vif"
              className="o-pointer-events-none o-absolute o-inset-0 o-z-0"
              style={{
                backgroundColor: fondParfum(parfum.t, 16),
                transition: 'background-color 700ms ease',
              }}
              repli={
                <div className="o-flex o-h-full o-items-center o-justify-center o-px-6 o-py-24">
                  <div
                    className="o-h-full o-w-full o-max-w-xs"
                    style={{ maxHeight: 380 }}
                  >
                    <CanetteDessinee t={parfum.t} />
                  </div>
                </div>
              }
              construire={(contexte) => {
                const { scene, camera, three } = contexte

                // Les deux bornes du segment, lues une premiere fois ici pour
                // que la canette naisse deja a la bonne couleur.
                const memo: MemoireDeScene = {
                  bas: new three.Color(bornes.current.bas),
                  haut: new three.Color(bornes.current.haut),
                  vise: new three.Color(),
                  viseFond: new three.Color(),
                  lues: bornes.current.bas + bornes.current.haut,
                }
                memo.vise.copy(memo.bas).lerpHSL(memo.haut, visee.current.t)
                memo.viseFond.copy(memo.vise).multiplyScalar(0.02)
                memoire.current = memo

                // L arriere-plan de la scene est le fond de la page : le
                // canevas est opaque, rien de ce qui est dessous ne se voit.
                scene.background = new three.Color().copy(memo.viseFond)

                const alu = new three.MeshPhysicalMaterial({
                  color: teinte('--o-vitrine-100', '#eef3d9'),
                  metalness: 1,
                  roughness: 0.28,
                  clearcoat: 0.6,
                  clearcoatRoughness: 0.2,
                })
                const corps = new three.MeshPhysicalMaterial({
                  color: memo.vise.clone(),
                  metalness: 0.86,
                  roughness: 0.24,
                  clearcoat: 1,
                  clearcoatRoughness: 0.08,
                  iridescence: 0.55,
                  iridescenceIOR: 1.4,
                })

                // La canette : un cylindre legerement conique — plus etroit en
                // haut qu en bas, comme une boite de 33 cl —, une epaule
                // tronconique, un couvercle, et le jonc qui les serre. Les
                // proportions sont celles d une 33 cl reelle, 115 mm sur 66 :
                // un cylindre trapu se lit comme un fut, pas comme une canette.
                const gCorps = new three.CylinderGeometry(0.66, 0.72, 2.3, 64, 1)
                const gEpaule = new three.CylinderGeometry(0.5, 0.66, 0.22, 64, 1)
                const gCol = new three.CylinderGeometry(0.46, 0.5, 0.1, 64, 1)
                const gCouvercle = new three.CylinderGeometry(0.44, 0.44, 0.05, 64, 1)
                const gJonc = new three.TorusGeometry(0.47, 0.038, 12, 64)
                const gJoncBas = new three.TorusGeometry(0.715, 0.04, 12, 64)
                const geometries = [gCorps, gEpaule, gCol, gCouvercle, gJonc, gJoncBas]

                const canette = new three.Group()
                canette.name = 'canette'

                const meshCorps = new three.Mesh(gCorps, corps)
                meshCorps.name = 'corps'
                // L epaule rentre, un col droit la prolonge, le jonc la serre,
                // et le couvercle est en retrait dessous : c est cette suite-la
                // qui fait lire une canette plutot qu un pot.
                const epaule = new three.Mesh(gEpaule, alu)
                epaule.position.y = 1.26
                const col = new three.Mesh(gCol, alu)
                col.position.y = 1.42
                const couvercle = new three.Mesh(gCouvercle, alu)
                couvercle.position.y = 1.45
                const jonc = new three.Mesh(gJonc, alu)
                jonc.position.y = 1.47
                jonc.rotation.x = Math.PI / 2
                const joncBas = new three.Mesh(gJoncBas, alu)
                joncBas.position.y = -1.15
                joncBas.rotation.x = Math.PI / 2

                canette.add(meshCorps, epaule, col, couvercle, jonc, joncBas)
                canette.scale.setScalar(0.62)
                canette.rotation.z = 0.04
                scene.add(canette)

                // Un metal sans contour est une tache : la cle chaude devant,
                // le remplissage froid a gauche, et surtout la lumiere de
                // contour derriere, plus deux lampes rasantes qui posent le
                // trait clair sur les bords du cylindre. Entiers, tous : une
                // lampe n est pas du texte, et une lampe teintee mentirait sur
                // la couleur de la boisson.
                eclairer(contexte, {
                  cle: 0xfff4e2,
                  remplissage: 0x93a8d6,
                  contour: 0xffffff,
                  force: 1.2,
                })
                const rasanteGauche = new three.PointLight(0xffffff, 22, 14, 2)
                rasanteGauche.position.set(-2.6, 0.9, 2.2)
                const rasanteDroite = new three.PointLight(0xffffff, 26, 14, 2)
                rasanteDroite.position.set(2.8, 1.4, 1.6)
                const socle = new three.PointLight(0xfff0d6, 16, 12, 2)
                socle.position.set(0, -2.4, 1.8)
                scene.add(rasanteGauche, rasanteDroite, socle)

                // La canette occupe la bande libre entre les deux accroches,
                // au-dessus du titre : la camera vise sous elle, et l objet
                // remonte dans le cadre sans qu on ait a le deplacer.
                camera.position.set(0, 0.15, 5.1)
                camera.lookAt(0, -0.5, 0)

                return () => {
                  memoire.current = null
                  for (const g of geometries) g.dispose()
                  alu.dispose()
                  corps.dispose()
                }
              }}
              animer={(contexte, { delta, time }) => {
                const { scene, three } = contexte
                const memo = memoire.current
                const canette = scene.getObjectByName('canette')
                if (memo === null || canette === undefined) return

                // La palette a-t-elle bouge dans la barre ? Comparer deux
                // chaines coute moins qu un style calcule par image.
                const lues = bornes.current.bas + bornes.current.haut
                if (lues !== memo.lues) {
                  memo.bas.set(bornes.current.bas)
                  memo.haut.set(bornes.current.haut)
                  memo.lues = lues
                }
                memo.vise.copy(memo.bas).lerpHSL(memo.haut, visee.current.t)
                memo.viseFond.copy(memo.vise).multiplyScalar(0.02)

                const part = 1 - Math.exp(-3.2 * delta)
                const corps = scene.getObjectByName('corps')
                if (
                  corps instanceof three.Mesh &&
                  corps.material instanceof three.MeshPhysicalMaterial
                ) {
                  corps.material.color.lerp(memo.vise, part)
                }
                if (scene.background instanceof three.Color) {
                  scene.background.lerp(memo.viseFond, part)
                }

                // La derive lente, plus le tour et demi ajoute au choix : la
                // meme cible porte les deux, et le ressort fait le reste.
                // Le cadre commande la taille et la hauteur : en portrait, la
                // meme canette prendrait la moitie de l ecran et se poserait
                // sur le titre. Elle rapetisse et remonte dans le quart haut.
                const portrait = contexte.camera.aspect < 1
                const voulue = portrait ? 0.3 : 0.62
                canette.scale.setScalar(
                  canette.scale.x + (voulue - canette.scale.x) * part,
                )

                visee.current.angle += delta * 0.17
                canette.rotation.y +=
                  (visee.current.angle - canette.rotation.y) *
                  (1 - Math.exp(-4.5 * delta))
                canette.rotation.z = 0.04 + Math.sin(time * 0.5) * 0.018
                canette.position.y = (portrait ? 0.86 : 0) + Math.sin(time * 0.62) * 0.035
              }}
            />

            {/* Le voile du bas : le titre et les cartes tombent sur le bas du
                cadre, et un metal clair y passe. Il fonce ce quart-la, dans la
                teinte du parfum — pas en gris. */}
            <div
              aria-hidden="true"
              className="o-pointer-events-none o-absolute o-inset-0 o-z-10"
              style={{
                background: `linear-gradient(to top, ${fondParfum(parfum.t, 34)} 0%, ${fondParfum(parfum.t, 20)} 26%, transparent 58%)`,
                transition: 'background 700ms ease',
              }}
            />

            {/* La lueur radiale, par-dessus le canevas. */}
            <div
              aria-hidden="true"
              className="o-pointer-events-none o-absolute o-inset-0 o-z-10"
              style={{
                background: lueur,
                mixBlendMode: 'screen',
                transition: 'background 700ms ease',
              }}
            />

            {/* Les bulles, qui montent sans fin. */}
            <div
              aria-hidden="true"
              className="o-pointer-events-none o-absolute o-inset-0 o-z-10 o-overflow-hidden"
            >
              {BULLES.map((b) => (
                <span
                  key={b.x}
                  data-o-limonade-bulle=""
                  className="o-absolute o-block o-rounded-full o-border-w-1"
                  style={
                    {
                      left: `${String(b.x)}%`,
                      bottom: -40,
                      width: b.taille,
                      height: b.taille,
                      backgroundColor: voileParfum(parfum.t, 22, 100),
                      borderColor: voileParfum(parfum.t, 70, 50),
                      '--o-bulle-duree': `${String(b.duree)}s`,
                      '--o-bulle-delai': `-${String(b.delai)}s`,
                      '--o-bulle-derive': `${String(b.derive)}px`,
                      '--o-bulle-opacite': String(b.opacite),
                      '--o-bulle-course': 'calc(100vh + 80px)',
                      '--o-bulle-repos': `-${String(b.repos)}vh`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>

            <Grain opacite={0.05} />

            {/* ----- Le contenu, au-dessus de tout -------------------------

                Trois bandes : l etiquette en haut, la bande libre du milieu —
                ou la canette a la place, encadree par les deux accroches et le
                pupitre —, et en bas le titre a gauche, les cartes a droite.
            */}
            <div className="o-relative o-z-20 o-flex o-grow o-flex-col o-px-6 o-pb-10 o-pt-24 md:o-px-10">
              <div className="o-grid o-grow o-min-h-64 o-grid-cols-12 o-items-center o-gap-6 o-py-6 md:o-min-h-0">
                <div className="o-col-span-12 md:o-col-span-3">
                  <Entre key={`${parfum.cle}-gauche`} className="o-hidden md:o-block">
                    <Accroche angle={-4}>{parfum.gauche}</Accroche>
                  </Entre>
                </div>
                {/* La bande que la canette occupe : rien n y est pose. */}
                <div aria-hidden="true" className="o-hidden md:o-col-span-5 md:o-block" />
                <div className="o-col-span-12 o-hidden o-flex-col o-gap-5 md:o-col-span-4 md:o-flex md:o-items-end">
                  <Entre key={`${parfum.cle}-droite`} className="o-hidden md:o-block">
                    <Accroche angle={3}>{parfum.droite}</Accroche>
                  </Entre>
                  <GlassSurface
                    colors={['--o-limonade-verre', '--o-palette-white']}
                    blur={22}
                    tint={0.16}
                    thickness={1.2}
                    className="o-w-full o-rounded-2xl o-p-5"
                  >
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-200">
                      Ce qu il y a dedans
                    </p>
                    <Entre key={`${parfum.cle}-mentions`} delai={60}>
                      <dl
                        aria-live="polite"
                        className="o-m-0 o-mt-3 o-flex o-flex-col o-gap-2"
                      >
                        {(
                          [
                            ['Fruit', parfum.fruit],
                            ['Maceration', parfum.macere],
                            ['Sucre', parfum.sucre],
                            ['Saison', parfum.saison],
                          ] as const
                        ).map(([quoi, valeur]) => (
                          <div
                            key={quoi}
                            className="o-grid o-gap-x-4 o-border-t o-border-white-10 o-pt-2 lg:o-grid-cols-12"
                          >
                            <dt className="o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-zinc-300 lg:o-col-span-4">
                              {quoi}
                            </dt>
                            <dd className="o-m-0 o-text-sm o-text-zinc-50 lg:o-col-span-8">
                              {valeur}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </Entre>
                  </GlassSurface>
                </div>
              </div>

              {/* ----- Le titre, et le clavier des parfums ----------------- */}
              <div
                id="parfums"
                className="o-grid o-scroll-mt-24 o-gap-8 md:o-grid-cols-12 md:o-items-end"
              >
                <div className="md:o-col-span-6">
                  <Surgit>
                    <Etiquette>Limonaderie — Nantes, quai Wilson</Etiquette>
                  </Surgit>
                  <h1
                    className="o-m-0 o-mt-5"
                    style={{
                      ...affiche('l', 300),
                      fontSize: 'clamp(2.5rem, 5.2vw, 4.75rem)',
                    }}
                  >
                    <Surgit
                      as="span"
                      className="o-inline-block"
                      style={{ marginRight: '0.2em' }}
                    >
                      Limonade {parfum.article}
                    </Surgit>
                    <Entre key={`${parfum.cle}-nom`} as="span" className="o-inline-block">
                      <GradientFlow
                        speed={5200}
                        angle={104}
                        from={teinteParfum(parfum.t, 100)}
                        to={teinteParfum(parfum.t, 400)}
                      >
                        {parfum.nom}
                      </GradientFlow>
                    </Entre>
                    <span aria-hidden="true">.</span>
                  </h1>
                  <Entre
                    key={`${parfum.cle}-phrase`}
                    as="p"
                    className="o-m-0 o-mt-4 o-max-w-md o-text-balance o-text-sm o-leading-relaxed o-text-zinc-200"
                  >
                    {parfum.phrase}
                  </Entre>
                  {/* Les mentions du pupitre, en une ligne, quand l ecran est
                      trop etroit pour lui : une seule des deux est dans l arbre
                      d accessibilite a la fois. */}
                  <Entre
                    key={`${parfum.cle}-court`}
                    as="p"
                    className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-wider o-text-zinc-300 md:o-hidden"
                  >
                    {parfum.fruit} · {parfum.macere} · {parfum.sucre} · {parfum.saison}
                  </Entre>
                </div>

                <div className="md:o-col-span-6">
                  <div className="o-flex o-flex-wrap o-items-center o-justify-between o-gap-4">
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-200">
                      Un parfum choisi reteinte la page
                    </p>
                    <Aimant force={0.3}>
                      <LiquidButton
                        onClick={servirLeSuivant}
                        className="o-rounded-full o-px-5 o-py-2 o-text-sm o-font-semibold o-text-zinc-50 focus:o-ring"
                        style={
                          {
                            '--o-liquid-fill': teinteParfum(parfum.t, 400),
                            '--o-liquid-ink': 'var(--o-palette-zinc-950)',
                          } as CSSProperties
                        }
                      >
                        Servir le suivant
                      </LiquidButton>
                    </Aimant>
                  </div>

                  {/* La zone coupe ce qui deborde : le retrait interieur laisse
                      la carte grandir au survol sans se faire rogner. */}
                  <ClickSparks
                    color={teinteParfum(parfum.t, 200)}
                    count={12}
                    distance={58}
                    className="o-mt-3 o-rounded-2xl o-p-2"
                  >
                    <ul className="o-m-0 o-grid o-list-none o-grid-cols-2 o-gap-2 o-p-0 sm:o-grid-cols-3 lg:o-grid-cols-5">
                      {PARFUMS.map((p, index) => {
                        const actif = index === rang
                        return (
                          <li key={p.cle}>
                            <button
                              type="button"
                              aria-pressed={actif}
                              onClick={() => {
                                choisir(index)
                              }}
                              className={`o-w-full o-cursor-pointer o-p-3 o-text-left o-transition-transform hover:o-scale-105 focus:o-ring ${verre(true)}`}
                              style={{
                                borderColor: actif ? teinteParfum(p.t, 300) : undefined,
                                boxShadow: actif
                                  ? `0 12px 34px -18px ${teinteParfum(p.t, 400)}`
                                  : undefined,
                              }}
                            >
                              <span
                                aria-hidden="true"
                                className="o-block o-size-2.5 o-rounded-full"
                                style={{ backgroundColor: teinteParfum(p.t, 300) }}
                              />
                              <span className="o-mt-2 o-block o-text-sm o-font-semibold o-capitalize o-text-zinc-50">
                                {p.nom}
                              </span>
                              <span className="o-mt-0.5 o-block o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-zinc-300">
                                {p.sucre}
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </ClickSparks>
                </div>
              </div>
            </div>

            {/* Le coin croiserait la canette sur un ecran etroit : il n y
                parait pas. */}
            <div className="o-hidden lg:o-block">
              <Coin position="hd">
                33 cl — verre consigne
                <br />
                Fournee du jeudi
              </Coin>
            </div>
          </section>

          {/*
            ----- L appel : une bande pleine largeur, du texte qui defile ----
          */}
          <section
            id="commander"
            className="o-relative o-isolate o-scroll-mt-24 o-overflow-hidden o-py-14"
            style={aplat()}
          >
            {/* Le lavis du parfum, en fusion « color » : il prend la teinte de
                l aplat et lui laisse sa clarte. La bande suit donc le parfum
                sans que le contraste de son encre bouge d un dixieme. */}
            <div
              aria-hidden="true"
              className="o-pointer-events-none o-absolute o-inset-0"
              style={{
                backgroundColor: teinteParfum(parfum.t, 500),
                opacity: 0.9,
                mixBlendMode: 'color',
                transition: 'background-color 700ms ease',
              }}
            />
            <div className="o-relative">
              <Bandeau
                mots={[...APPEL]}
                separateur="●"
                vitesse={38}
                taille="clamp(1.75rem, 4.2vw, 4rem)"
                className="o-font-semibold"
              />
              <div className="o-mt-10 o-flex o-flex-col o-items-center o-gap-4 o-px-6 o-text-center">
                <h2 className="o-m-0 o-max-w-2xl o-text-balance o-text-2xl o-font-semibold o-tracking-tight">
                  La caisse part le jeudi soir, et revient vide le jeudi suivant.
                </h2>
                <Aimant force={0.35}>
                  <a
                    href="mailto:caisse@vif-limonaderie.fr"
                    className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-border-black-20 o-px-7 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                    style={{ color: 'inherit' }}
                  >
                    Commander une caisse de douze
                    <Icon icon={ArrowUpRight} size={17} aria-hidden="true" />
                  </a>
                </Aimant>
              </div>
            </div>
          </section>
        </main>

        {/*
          ----- Le pied : une lettre, et une signature ----------------------
        */}
        <footer
          id="lettre"
          className="o-relative o-scroll-mt-24 o-overflow-hidden o-px-6 o-pb-10 o-pt-20 md:o-px-10"
          style={{
            backgroundColor: fondParfum(parfum.t, 24, 800),
            transition: 'background-color 700ms ease',
          }}
        >
          <div className="o-max-w-3xl">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              Un mot de l atelier
            </p>
            <p className="o-m-0 o-mt-6 o-text-lg o-leading-relaxed o-text-zinc-200">
              Nous avons commence a trois, dans un local de quarante metres carres qui
              sentait le vinaigre, avec une soutireuse de 1974 qui refusait de demarrer en
              dessous de dix degres. Elle demarre toujours mal. Nous tirons quatre cents
              caisses par semaine, jamais plus : au-dela, il faudrait acheter des
              concentres, et ce serait une autre maison. Si un parfum manque, c est que le
              fruit n est pas la — il reviendra a sa saison, pas avant.
            </p>
            <p
              className="o-m-0 o-mt-8 o-font-serif o-italic o-text-zinc-100"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}
            >
              Mathilde Coutant
            </p>
            <p className="o-m-0 o-mt-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              Limonadiere, et celle qui redemarre la soutireuse
            </p>
          </div>

          <div className="o-mt-14 o-flex o-max-w-3xl o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-border-white-10 o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
            <span>© 2026 Vif</span>
            <span>
              14 quai Wilson, 44000 Nantes — vente au quai le samedi, 10 h a 13 h
            </span>
            <a
              href="#haut"
              className="o-text-zinc-400 o-no-underline hover:o-text-zinc-50 focus:o-ring"
            >
              Remonter ↑
            </a>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
