/**
 * Cardan — ecurie de course.
 *
 * ## La reference : Kimi (GetLayers)
 *
 * Un fond blanc casse, une encre presque noire, **un seul accent** reserve a
 * l instrumentation, tout en capitales condensees. Aucun arrondi nulle part :
 * les panneaux sont marques par quatre equerres de coin, les plaques et les
 * boutons sont **chanfreines** — un coin coupe en bas a droite, trace en SVG,
 * parce qu une bordure ne suit pas un chanfrein.
 *
 * ## Les trois choses qu on lui prend, et pourquoi
 *
 * 1. **La pile qui recule et s assombrit.** Nos `StickyStack` retrecissent,
 *    mais le bloc recouvert reste eclaire : on ne lit pas qu il passe dessous.
 *    Ici chaque etage perd dix pour cent et prend un voile a cinquante-cinq,
 *    et l empilement se lit enfin.
 * 2. **La couture dessinee.** Nos coupes clair/sombre sont franches. Celle-ci
 *    est construite : le sol clair entre en rangees pleines, se casse en
 *    damier, puis se consume.
 * 3. **Un trace qui se remplit a sa propre vitesse.** Le circuit se dessine en
 *    un tour, et il n avance pas d un pas regulier — il freine dans les
 *    virages et s emballe dans les lignes droites. C est ce qui distingue un
 *    trace vivant d un `stroke-dashoffset` lineaire.
 *
 * ## Ce qui n appartient qu a elle
 *
 * Le **mecanisme** est le **banc de reglages** : trois curseurs — aileron,
 * pression des pneus, rapport final — qui recalculent un temps au tour et une
 * vitesse de pointe, et qui montrent le marche qu on fait a chaque fois. Un
 * reglage de course est une somme de compromis, pas une liste d options.
 *
 * ## Presque rien n est photographie
 *
 * La carte, le circuit, les courbes de niveau, le damier, les equerres : tout
 * est dessine. Une page d instrumentation qui charge des photographies pour
 * faire technique ment sur ce qu elle est.
 *
 * @module
 */

import { useMotionState, useScrollScrub } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight } from '@odoro-cli/icons/outline'
import { Reveal } from '@odoro-cli/libs/motion'
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

import { Crosshair } from '@/odoro/effect/Crosshair.jsx'
import { Marquee } from '@/odoro/effect/Marquee.jsx'
import { DecodeText } from '@/odoro/text/DecodeText.jsx'

import { nuit } from './communs.jsx'
import { accent, accentDoux, encre, encreSurSombre } from './palettes.js'
import {
  affiche,
  BarreCoins,
  CHROME,
  Etiquette,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'

/* ============================ La saison ================================ */

/** Une manche du championnat. */
interface Manche {
  readonly rang: string
  readonly nom: string
  readonly lieu: string
  readonly date: string
  readonly etat: 'courue' | 'prochaine' | 'a venir'
  readonly resultat?: string
}

const SAISON: readonly Manche[] = [
  {
    rang: '01',
    nom: 'Ouverture',
    lieu: 'Pau — circuit urbain',
    date: '12 avril',
    etat: 'courue',
    resultat: '2e — 1:12.884',
  },
  {
    rang: '02',
    nom: 'La Bresse',
    lieu: 'Vosges — 4,2 km',
    date: '3 mai',
    etat: 'courue',
    resultat: '1er — 1:38.207',
  },
  {
    rang: '03',
    nom: 'Nogaro',
    lieu: 'Gers — 3,6 km',
    date: '21 juin',
    etat: 'prochaine',
  },
  {
    rang: '04',
    nom: 'Le Val',
    lieu: 'Var — 2,9 km',
    date: '13 septembre',
    etat: 'a venir',
  },
  {
    rang: '05',
    nom: 'La finale',
    lieu: 'Magny-Cours — 4,4 km',
    date: '18 octobre',
    etat: 'a venir',
  },
]

/** Un etage de la pile : une saison, et ce qu elle a coute. */
interface Etage {
  readonly annee: string
  readonly titre: string
  readonly texte: string
  readonly releve: readonly (readonly [string, string])[]
}

const ETAGES: readonly Etage[] = [
  {
    annee: '2024',
    titre: 'On apprend le chassis',
    texte:
      'Premiere saison complete avec la coque en aluminium colle. Onze abandons sur vingt-deux departs, et une seule cause a chaque fois : la temperature d huile.',
    releve: [
      ['Departs', '22'],
      ['Arrivees', '11'],
      ['Meilleur tour', '1:41.902'],
      ['Podiums', '0'],
    ],
  },
  {
    annee: '2025',
    titre: 'On refait le refroidissement',
    texte:
      'Radiateur deplace derriere l habitacle, ecopes redessinees, et la temperature d huile cesse d etre un sujet. Le chassis, lui, n a pas bouge d un millimetre.',
    releve: [
      ['Departs', '22'],
      ['Arrivees', '21'],
      ['Meilleur tour', '1:39.114'],
      ['Podiums', '6'],
    ],
  },
  {
    annee: '2026',
    titre: 'On court pour le titre',
    texte:
      'Meme coque, troisieme saison. Ce qui a change tient dans le banc de reglages en bas de cette page : nous savons enfin ce que chaque cran nous coute ailleurs.',
    releve: [
      ['Departs', '2'],
      ['Arrivees', '2'],
      ['Meilleur tour', '1:38.207'],
      ['Podiums', '2'],
    ],
  },
]

/* ============================ Le trace ================================= */

/**
 * Le circuit, en coordonnees d un cadre de 1000 sur 560.
 *
 * Un trace ferme, avec deux longues lignes droites et un enchainement lent au
 * nord : c est ce contraste qui rend lisible le remplissage cadence.
 */
const TRACE =
  'M148 402 C120 330 132 244 198 206 C264 168 330 196 372 158 C414 120 470 96 552 104 C634 112 690 152 742 152 C812 152 862 120 892 152 C922 184 894 232 846 258 C798 284 742 268 700 300 C658 332 664 386 616 414 C568 442 486 432 400 438 C314 444 176 474 148 402 Z'

/** Les virages nommes, en fraction du tour. */
const VIRAGES = [
  { part: 0.12, nom: 'Epingle nord', x: 176, y: 236 },
  { part: 0.36, nom: 'Le gue', x: 560, y: 104 },
  { part: 0.58, nom: 'Double droite', x: 884, y: 190 },
  { part: 0.84, nom: 'Le puits', x: 448, y: 436 },
] as const

/* ============================ La feuille =============================== */

const STYLE_COURSE = 'o-vitrine-course'

/**
 * Ce que les utilitaires n ont pas.
 *
 * `o-cr-tour` est la seule chose qui compte : les paliers ne sont pas
 * regulierement espaces. Entre 0 et 18 pour cent, la ligne parcourt un tiers
 * du trace — c est la ligne droite. Entre 40 et 55, elle n en fait qu un
 * dixieme : c est l enchainement du nord. Une interpolation reguliere donnerait
 * un train miniature ; celle-ci donne une voiture.
 */
const CSS_COURSE = [
  '@keyframes o-cr-tour{',
  '0%{stroke-dashoffset:var(--o-cr-l)}',
  '18%{stroke-dashoffset:calc(var(--o-cr-l) * 0.66)}',
  '26%{stroke-dashoffset:calc(var(--o-cr-l) * 0.61)}',
  '40%{stroke-dashoffset:calc(var(--o-cr-l) * 0.44)}',
  '55%{stroke-dashoffset:calc(var(--o-cr-l) * 0.34)}',
  '68%{stroke-dashoffset:calc(var(--o-cr-l) * 0.19)}',
  '80%{stroke-dashoffset:calc(var(--o-cr-l) * 0.14)}',
  '100%{stroke-dashoffset:0}}',
  '@keyframes o-cr-crayon{0%{opacity:0}6%{opacity:1}94%{opacity:1}100%{opacity:0}}',
  '@keyframes o-cr-onde{0%{transform:translate3d(0,0,0)}100%{transform:translate3d(-80px,0,0)}}',
  '@keyframes o-cr-tiret{0%{stroke-dashoffset:0}100%{stroke-dashoffset:-28}}',
  '@keyframes o-cr-battement{0%,100%{opacity:0.25;transform:scale(1)}50%{opacity:1;transform:scale(1.9)}}',
  '@keyframes o-cr-case{0%{opacity:1}100%{opacity:0}}',
  '[data-o-cr-tour]{animation:o-cr-tour 6s cubic-bezier(0.4,0,0.6,1) 0.4s both}',
  '[data-o-cr-crayon]{animation:o-cr-tour 6s cubic-bezier(0.4,0,0.6,1) 0.4s both, o-cr-crayon 6.4s linear both}',
  '[data-o-cr-onde]{animation:o-cr-onde var(--o-cr-duree,22s) linear infinite}',
  '[data-o-cr-tiret]{animation:o-cr-tiret 1.6s linear infinite}',
  '[data-o-cr-battement]{animation:o-cr-battement 2.4s ease-in-out infinite}',
  '[data-o-cr-case]{animation:o-cr-case 1s ease-in var(--o-cr-delai,0s) both}',
  '@media (prefers-reduced-motion:reduce){',
  '[data-o-cr-tour],[data-o-cr-crayon]{animation:none;stroke-dashoffset:0}',
  '[data-o-cr-crayon]{opacity:0}',
  '[data-o-cr-onde],[data-o-cr-tiret],[data-o-cr-battement]{animation:none}',
  '[data-o-cr-case]{animation:none;opacity:0}}',
].join('')

function useFeuilleCourse(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_COURSE) !== null) return
    const feuille = document.createElement('style')
    feuille.id = STYLE_COURSE
    feuille.textContent = CSS_COURSE
    document.head.append(feuille)
  }, [])
}

/* ============================ La grammaire du cadre ==================== */

/** Le chanfrein : un coin coupe en bas a droite, en pourcentage de la boite. */
const CHANFREIN =
  'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)'

/**
 * Quatre equerres de coin.
 *
 * Un panneau n est pas borde : il est **marque**. C est la difference entre un
 * cadre et un reperage, et c est ce qui donne a la page son air d instrument.
 */
function Equerres({
  couleur,
  taille = 10,
}: {
  readonly couleur: string
  readonly taille?: number
}): ReactElement {
  const coins = [
    { haut: 0, gauche: 0, bords: '2px 0 0 2px' },
    { haut: 0, droite: 0, bords: '2px 2px 0 0' },
    { bas: 0, gauche: 0, bords: '0 0 2px 2px' },
    { bas: 0, droite: 0, bords: '0 2px 2px 0' },
  ] as const
  return (
    <>
      {coins.map((coin, rang) => (
        <span
          key={rang}
          aria-hidden="true"
          className="o-pointer-events-none o-absolute o-block"
          style={{
            top: 'haut' in coin ? coin.haut : undefined,
            bottom: 'bas' in coin ? coin.bas : undefined,
            left: 'gauche' in coin ? coin.gauche : undefined,
            right: 'droite' in coin ? coin.droite : undefined,
            width: taille,
            height: taille,
            borderColor: couleur,
            borderStyle: 'solid',
            borderWidth: coin.bords,
          }}
        />
      ))}
    </>
  )
}

/** Une plaque chanfreinee, marquee aux quatre coins. */
function Plaque({
  children,
  fond,
  encreCoins,
  className,
  style,
}: {
  readonly children: ReactNode
  readonly fond: string
  readonly encreCoins: string
  readonly className?: string
  readonly style?: CSSProperties
}): ReactElement {
  return (
    <div
      className={`o-relative ${className ?? ''}`}
      style={{ clipPath: CHANFREIN, backgroundColor: fond, ...style }}
    >
      <Equerres couleur={encreCoins} />
      {children}
    </div>
  )
}

/** Le bouton de la page : chanfreine, jamais arrondi. */
function Bouton({
  href,
  children,
  pleine = true,
}: {
  readonly href: string
  readonly children: ReactNode
  readonly pleine?: boolean
}): ReactElement {
  return (
    <a
      href={href}
      className="o-inline-flex o-items-center o-gap-2 o-px-6 o-py-3 o-font-mono o-text-xs o-font-semibold o-uppercase o-tracking-widest o-no-underline o-transition-colors focus:o-ring"
      style={
        pleine
          ? { clipPath: CHANFREIN, backgroundColor: encre(), color: 'var(--o-theme-bg)' }
          : {
              clipPath: CHANFREIN,
              boxShadow: `inset 0 0 0 1px ${accentDoux(700, 40)}`,
              color: 'inherit',
            }
      }
    >
      {children}
    </a>
  )
}

/* ============================ Le fond de courbes ======================= */

/** Des courbes de niveau qui derivent : le fond de toute la page claire. */
function Courbes(): ReactElement {
  const lignes = useMemo(
    () =>
      Array.from({ length: 9 }, (_, rang) => {
        const y = 40 + rang * 46
        const amplitude = 14 + (rang % 3) * 7
        return `M-40 ${String(y)} q 40 ${String(-amplitude)} 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0`
      }),
    [],
  )
  return (
    <div
      aria-hidden="true"
      className="o-pointer-events-none o-absolute o-inset-0 o-overflow-hidden"
    >
      <svg viewBox="0 0 720 460" preserveAspectRatio="none" className="o-h-full o-w-full">
        {lignes.map((d, rang) => (
          <path
            key={rang}
            data-o-cr-onde=""
            d={d}
            fill="none"
            stroke={accentDoux(700, 26)}
            strokeWidth="1"
            style={{ '--o-cr-duree': `${String(16 + rang * 3)}s` } as CSSProperties}
          />
        ))}
      </svg>
    </div>
  )
}

/* ============================ La couture en damier ===================== */

/**
 * La couture entre le clair et le sombre.
 *
 * Six rangees : les premieres pleines, les suivantes en damier, les dernieres
 * qui se consument. Chaque case part avec son propre retard, calcule sur sa
 * rangee et sa colonne, si bien que la bande se defait de haut en bas et de
 * gauche a droite plutot que d un bloc.
 */
function Couture({ colonnes = 32 }: { readonly colonnes?: number }): ReactElement {
  const rangees = 6
  return (
    <div
      aria-hidden="true"
      className="o-relative o-overflow-hidden"
      style={{ height: 108 }}
    >
      <div className="o-absolute o-inset-0 o-flex o-flex-col">
        {Array.from({ length: rangees }, (_, r) => (
          <div key={r} className="o-flex o-grow">
            {Array.from({ length: colonnes }, (_, c) => {
              const damier = (r + c) % 2 === 0
              // Les deux premieres rangees sont pleines : c est encore le sol.
              const plein = r < 2
              if (!plein && !damier) return <span key={c} className="o-grow" />
              return (
                <span
                  key={c}
                  data-o-cr-case=""
                  className="o-grow"
                  style={
                    {
                      backgroundColor: c % 17 === 0 ? accent(500) : 'var(--o-theme-bg)',
                      '--o-cr-delai': `${String((r * 0.12 + (c / colonnes) * 0.5).toFixed(2))}s`,
                    } as CSSProperties
                  }
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================ La carte ================================= */

/** La carte d instruments : un continent en demi-teinte, et le tour qui se trace. */
function Carte(): ReactElement {
  const { reduced } = useMotionState()
  return (
    <div className="o-relative">
      <svg
        viewBox="0 0 1000 560"
        className="o-h-auto o-w-full"
        role="img"
        aria-label="Le circuit de La Bresse, quatre virages nommes"
      >
        <defs>
          <pattern id="o-cr-points" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="7" cy="7" r="1.5" fill={accentDoux(300, 30)} />
          </pattern>
          <clipPath id="o-cr-terre">
            <path d="M60 470 C40 380 90 280 180 236 C270 192 300 120 420 88 C540 56 660 76 760 60 C860 44 960 84 962 160 C964 236 900 268 880 340 C860 412 900 470 800 502 C700 534 520 508 380 512 C240 516 80 560 60 470 Z" />
          </clipPath>
        </defs>

        {/* Le continent, en points : c est le papier de la carte. */}
        <rect
          width="1000"
          height="560"
          fill="url(#o-cr-points)"
          clipPath="url(#o-cr-terre)"
        />

        {/* Les axes en tirets, qui rampent. */}
        <g stroke={accentDoux(400, 22)} strokeWidth="1" strokeDasharray="6 8">
          <path data-o-cr-tiret="" d="M0 140h1000" />
          <path data-o-cr-tiret="" d="M0 420h1000" />
          <path data-o-cr-tiret="" d="M320 0v560" />
          <path data-o-cr-tiret="" d="M720 0v560" />
        </g>

        {/* Le tour au repos, puis le tour qui se remplit par-dessus. */}
        <path
          d={TRACE}
          fill="none"
          stroke={accentDoux(500, 26)}
          strokeWidth="10"
          strokeLinejoin="round"
        />
        <path
          data-o-cr-tour=""
          d={TRACE}
          fill="none"
          stroke={accent(500)}
          strokeWidth="6"
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength={1000}
          style={{ strokeDasharray: 1000, '--o-cr-l': 1000 } as CSSProperties}
        />
        {/* Le crayon : un dash tres court qui court devant, et s eteint a l arrivee. */}
        <path
          data-o-cr-crayon=""
          d={TRACE}
          fill="none"
          stroke="#ffffff"
          strokeWidth="9"
          strokeLinecap="round"
          pathLength={1000}
          style={{ strokeDasharray: '10 990', '--o-cr-l': 1000 } as CSSProperties}
        />

        {/* La ligne de depart, en damier. */}
        <g>
          {Array.from({ length: 8 }, (_, i) => (
            <rect
              key={i}
              x={140 + (i % 2) * 7}
              y={392 + Math.floor(i / 2) * 7}
              width="7"
              height="7"
              fill={i % 3 === 0 ? accent(500) : 'var(--o-theme-fg)'}
              opacity="0.9"
            />
          ))}
        </g>

        {/* Les virages nommes. */}
        {VIRAGES.map((virage) => (
          <g key={virage.nom}>
            <circle cx={virage.x} cy={virage.y} r="4" fill={accent(500)} />
            {!reduced && (
              <circle
                data-o-cr-battement=""
                cx={virage.x}
                cy={virage.y}
                r="4"
                fill="none"
                stroke={accent(500)}
                strokeWidth="1"
                style={{ transformOrigin: `${String(virage.x)}px ${String(virage.y)}px` }}
              />
            )}
            <text
              x={virage.x + 12}
              y={virage.y + 4}
              fontSize="13"
              fill="var(--o-theme-muted)"
              style={{
                fontFamily: 'var(--o-font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
              }}
            >
              {virage.nom}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ============================ La pile ================================== */

/**
 * Un etage de la pile : il se colle, puis **recule et s assombrit** quand le
 * suivant passe par-dessus.
 *
 * C est la lecon de la reference. Sans le voile, un bloc recouvert reste
 * eclaire et l empilement ne se lit pas — on croit a un defaut de rendu.
 */
function EtagePile({
  etage,
  rang,
  dernier,
}: {
  readonly etage: Etage
  readonly rang: number
  readonly dernier: boolean
}): ReactElement {
  const { reduced } = useMotionState()
  const carte = useRef<HTMLDivElement>(null)
  const voile = useRef<HTMLDivElement>(null)

  const onProgress = useCallback((p: number) => {
    // Seule la seconde moitie compte : avant, l etage n est pas encore
    // recouvert, et le voir reculer sans raison se lit comme un defaut.
    const couvert = Math.max(0, p * 2 - 1)
    if (carte.current !== null)
      carte.current.style.transform = `scale(${(1 - couvert * 0.1).toFixed(4)})`
    if (voile.current !== null) voile.current.style.opacity = (couvert * 0.55).toFixed(3)
  }, [])

  const { ref } = useScrollScrub<HTMLDivElement>(
    reduced || dernier ? () => undefined : onProgress,
    { name: 'pile de saisons' },
  )

  return (
    <div ref={ref} className="o-sticky" style={{ top: CHROME + rang * 18 }}>
      <div
        ref={carte}
        className={reduced ? 'o-origin-top' : 'o-origin-top o-will-change-transform'}
      >
        <Plaque
          fond="var(--o-theme-bg)"
          encreCoins={accent(500)}
          className="o-p-8 md:o-p-12"
          style={{ boxShadow: `inset 0 0 0 1px ${accentDoux(700, 20)}` }}
        >
          <div className="o-grid o-gap-8 md:o-grid-cols-12">
            <div className="md:o-col-span-4">
              <p
                className="o-m-0 o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('m', 700),
                  fontSize: 'clamp(3rem, 7vw, 6.5rem)',
                  lineHeight: 0.86,
                  letterSpacing: '-0.04em',
                }}
              >
                <DecodeText duration={900}>{etage.annee}</DecodeText>
              </p>
            </div>
            <div className="md:o-col-span-5">
              <h3
                className="o-m-0 o-uppercase o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('m', 500),
                  fontSize: 'clamp(1.35rem, 2.4vw, 2.25rem)',
                  lineHeight: 0.95,
                }}
              >
                {etage.titre}
              </h3>
              <p className="o-m-0 o-mt-5 o-max-w-md o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                {etage.texte}
              </p>
            </div>
            <dl className="o-m-0 md:o-col-span-3">
              {etage.releve.map(([quoi, valeur]) => (
                <div
                  key={quoi}
                  className="o-flex o-items-baseline o-justify-between o-gap-4 o-border-b o-border-black-10 dark:o-border-zinc-800 o-py-2"
                >
                  <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    {quoi}
                  </dt>
                  <dd className="o-m-0 o-font-mono o-text-sm o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50">
                    {valeur}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div
            ref={voile}
            aria-hidden="true"
            className="o-pointer-events-none o-absolute o-inset-0 o-bg-black"
            style={{ opacity: 0 }}
          />
        </Plaque>
      </div>
    </div>
  )
}

/* ============================ Le banc de reglages ====================== */

/**
 * Le mecanisme : trois crans, et ce qu ils coutent ailleurs.
 *
 * Les formules sont grossieres mais les arbitrages sont justes : de l aileron
 * fait gagner en courbe et perdre en ligne droite ; une pression basse
 * rechauffe et use ; un rapport court reprend mieux et plafonne plus tot.
 */
function Banc(): ReactElement {
  const [aileron, setAileron] = useState(6)
  const [pression, setPression] = useState(1.6)
  const [rapport, setRapport] = useState(4)

  const { tour, pointe, usure } = useMemo(() => {
    const reference = 98.2
    // L aileron : chaque cran rend 0,21 s en courbe et coute 0,17 s en ligne.
    const courbe = -0.21 * aileron
    const ligne = 0.17 * aileron
    // La pression : l optimum est a 1,55 bar ; s en ecarter coute des deux cotes.
    const ecart = Math.abs(pression - 1.55)
    const grip = 1.9 * ecart
    // Le rapport final : court = reprise, long = vitesse.
    const relance = -0.34 * (5 - rapport)
    const plafond = 0.28 * (5 - rapport)
    return {
      tour: reference + courbe + ligne + grip + relance + plafond,
      pointe: Math.round(268 - aileron * 3.1 + (5 - rapport) * -4.2),
      usure: Math.round(42 + ecart * 46 + aileron * 1.4),
    }
  }, [aileron, pression, rapport])

  const minutes = Math.floor(tour / 60)
  const secondes = (tour - minutes * 60).toFixed(3).padStart(6, '0')

  const curseurs = [
    {
      nom: 'Aileron arriere',
      valeur: aileron,
      min: 0,
      max: 12,
      pas: 1,
      unite: 'crans',
      poser: setAileron,
      note: 'Douze crans : la voiture colle en courbe et bouchonne en ligne droite.',
    },
    {
      nom: 'Pression pneus',
      valeur: pression,
      min: 1.2,
      max: 2,
      pas: 0.05,
      unite: 'bar',
      poser: setPression,
      note: 'L optimum de ce train est a 1,55 bar. De part et d autre, on perd.',
    },
    {
      nom: 'Rapport final',
      valeur: rapport,
      min: 3,
      max: 7,
      pas: 1,
      unite: '',
      poser: setRapport,
      note: 'Court, on sort fort des epingles ; long, on tient la ligne droite.',
    },
  ] as const

  return (
    <div className="o-grid o-gap-10 md:o-grid-cols-12">
      <div className="md:o-col-span-7">
        {curseurs.map((curseur) => (
          <div
            key={curseur.nom}
            className="o-border-b o-border-black-10 dark:o-border-zinc-800 o-py-6"
          >
            <label className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-3">
              <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
                {curseur.nom}
              </span>
              <span className="o-font-mono o-text-sm o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50">
                {curseur.pas < 1
                  ? curseur.valeur.toFixed(2).replace('.', ',')
                  : String(curseur.valeur)}{' '}
                {curseur.unite}
              </span>
              <input
                type="range"
                min={curseur.min}
                max={curseur.max}
                step={curseur.pas}
                value={curseur.valeur}
                onChange={(evenement) => {
                  curseur.poser(Number(evenement.target.value))
                }}
                className="o-mt-3 o-w-full o-accent-brand-500 focus:o-ring"
              />
            </label>
            <p className="o-m-0 o-mt-2 o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
              {curseur.note}
            </p>
          </div>
        ))}
      </div>

      <div className="md:o-col-span-5">
        <Plaque
          fond="var(--o-palette-zinc-950)"
          encreCoins={accent(400)}
          className="o-p-8"
          style={nuit('zinc')}
        >
          <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
            Temps au tour estime — La Bresse
          </p>
          <p
            className="o-m-0 o-mt-4 o-tabular-nums o-text-zinc-50"
            aria-live="polite"
            style={{
              ...affiche('m', 700),
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              lineHeight: 0.9,
              letterSpacing: '-0.05em',
            }}
          >
            {minutes}:{secondes}
          </p>
          <dl className="o-m-0 o-mt-8">
            {[
              ['Vitesse de pointe', `${String(pointe)} km/h`],
              ['Usure du train avant', `${String(usure)} %`],
              [
                'Ecart au record',
                `${tour - 98.207 >= 0 ? '+' : ''}${(tour - 98.207).toFixed(3).replace('.', ',')} s`,
              ],
            ].map(([quoi, valeur]) => (
              <div
                key={quoi}
                className="o-flex o-items-baseline o-justify-between o-gap-4 o-border-t o-border-white-10 o-py-3"
              >
                <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                  {quoi}
                </dt>
                <dd
                  className="o-m-0 o-font-mono o-text-sm o-tabular-nums"
                  style={{ color: encreSurSombre() }}
                >
                  {valeur}
                </dd>
              </div>
            ))}
          </dl>
          <p className="o-m-0 o-mt-6 o-text-xs o-leading-relaxed o-text-zinc-400">
            Estimation du banc, pas un chrono. Le record de la piste est a 1:38.207, pose
            le 3 mai avec l aileron a six crans.
          </p>
        </Plaque>
      </div>
    </div>
  )
}

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#circuit', 'Le circuit'],
  ['#saison', 'La saison'],
  ['#banc', 'Le banc'],
] as const

export default function Page(): ReactElement {
  const polices = usePolices('oswald')
  useFeuilleCourse()
  const { reduced } = useMotionState()

  return (
    <Porte forme="compteur" marque="Cardan" sombre={false}>
      <div
        className="o-bg-zinc-50 dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50"
        style={polices}
      >
        {/* ================= L ouverture : une planche de bord ============ */}
        <header
          className="o-relative o-isolate o-flex o-flex-col"
          style={{ minHeight: `calc(100vh - ${String(CHROME)}px)` }}
        >
          <Courbes />
          <BarreCoins
            marque="Cardan"
            liens={NAVIGATION}
            droite="Ecurie — Clermont-Ferrand"
            sombre={false}
          />

          <div className="o-relative o-flex o-grow o-flex-col o-justify-between o-gap-10 o-px-6 o-pb-10 md:o-px-10">
            <div className="o-grid o-items-end o-gap-8 md:o-grid-cols-12">
              <div className="md:o-col-span-8">
                <Surgit>
                  <Etiquette sombre={false}>
                    Championnat de France de la montagne — groupe A
                  </Etiquette>
                </Surgit>
                <TitreVague
                  delai={140}
                  className="o-m-0 o-mt-6 o-uppercase o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('l', 700),
                    fontSize: 'clamp(3rem, 11vw, 10rem)',
                    lineHeight: 0.82,
                    letterSpacing: '-0.045em',
                  }}
                >
                  Cardan
                </TitreVague>
                <Surgit
                  delai={520}
                  as="p"
                  className="o-m-0 o-mt-6 o-max-w-lg o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400"
                >
                  Meme coque depuis 2024. Ce qui a change tient dans les reglages, et nous
                  les publions apres chaque manche.
                </Surgit>
              </div>

              {/* Le numero de course, marque aux quatre coins. */}
              <Surgit delai={340} className="md:o-col-span-4 md:o-flex md:o-justify-end">
                <Plaque
                  fond="var(--o-palette-zinc-950)"
                  encreCoins={accent(400)}
                  className="o-px-10 o-py-6 o-text-center"
                  style={nuit('zinc')}
                >
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                    Voiture
                  </p>
                  <p
                    className="o-m-0 o-tabular-nums o-text-zinc-50"
                    style={{
                      ...affiche('m', 700),
                      fontSize: 'clamp(3.5rem, 8vw, 6rem)',
                      lineHeight: 0.86,
                      letterSpacing: '-0.05em',
                    }}
                  >
                    04
                  </p>
                </Plaque>
              </Surgit>
            </div>

            {/*
              La bande d instruments. Le heros faisait un ecran de haut avec un
              trou au milieu : une page d instrumentation ne laisse pas un vide,
              elle y met un releve.
            */}
            <Surgit
              delai={520}
              className="o-grid o-gap-px md:o-grid-cols-4"
              style={{ backgroundColor: accentDoux(700, 18) }}
            >
              {(
                [
                  ['Chassis', 'CN-04 — 2024', 'Aluminium colle, non modifie'],
                  ['Moteur', '2,0 l — 310 ch', 'Atmospherique, boite sequentielle'],
                  ['Masse', '742 kg', 'Avec pilote et plein complet'],
                  ['Classement', '2e — 38 points', 'Apres deux manches sur cinq'],
                ] as const
              ).map(([quoi, valeur, note]) => (
                <div
                  key={quoi}
                  className="o-relative o-bg-zinc-50 dark:o-bg-zinc-950 o-px-5 o-py-5"
                >
                  <Equerres couleur={accentDoux(700, 34)} taille={7} />
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    {quoi}
                  </p>
                  <p className="o-m-0 o-mt-3 o-font-mono o-text-base o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50">
                    {valeur}
                  </p>
                  <p className="o-m-0 o-mt-1 o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
                    {note}
                  </p>
                </div>
              ))}
            </Surgit>

            <Surgit
              delai={640}
              className="o-flex o-flex-wrap o-items-center o-justify-between o-gap-6"
            >
              <div className="o-flex o-flex-wrap o-gap-3">
                <Bouton href="#banc">
                  Ouvrir le banc de reglages{' '}
                  <Icon icon={ArrowRight} size={14} aria-hidden="true" />
                </Bouton>
                <Bouton href="#saison" pleine={false}>
                  La saison en cours
                </Bouton>
              </div>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 md:o-text-right">
                Prochaine manche — Nogaro, 21 juin
                <br />
                Record de la piste — 1:38.207
              </p>
            </Surgit>
          </div>
        </header>

        {/* ================= La couture, puis la carte ==================== */}
        <Couture />

        <section
          id="circuit"
          className="o-relative o-scroll-mt-24 o-px-6 o-py-20 md:o-px-10 md:o-py-28"
          style={nuit('zinc')}
        >
          <div className="o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="01">Le circuit</Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="o-m-0 o-mt-6 o-max-w-3xl o-uppercase o-text-zinc-50"
                style={{
                  ...affiche('m', 700),
                  fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                  lineHeight: 0.88,
                  letterSpacing: '-0.04em',
                }}
              >
                Quatre kilometres deux, et un seul endroit ou depasser.
              </h2>
            </Reveal>

            <div className="o-relative o-mt-14">
              {reduced ? (
                <Carte />
              ) : (
                <Crosshair thickness={1} gap={18} color={accent(400)} coords={false}>
                  <Carte />
                </Crosshair>
              )}
            </div>

            <div className="o-mt-10 o-grid o-gap-6 md:o-grid-cols-4">
              {[
                ['Longueur', '4 214 m'],
                ['Virages', '11 — dont 4 nommes'],
                ['Denivele', '+ 148 m'],
                ['Record', '1:38.207'],
              ].map(([quoi, valeur]) => (
                <div key={quoi} className="o-border-t o-border-white-10 o-pt-4">
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                    {quoi}
                  </p>
                  <p className="o-m-0 o-mt-2 o-font-mono o-text-sm o-tabular-nums o-text-zinc-50">
                    {valeur}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= La saison, en manches ======================== */}
        <section
          id="saison"
          className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
        >
          <div className="o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="02" sombre={false}>
                La saison
              </Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="o-m-0 o-mt-6 o-max-w-2xl o-uppercase o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('m', 700),
                  fontSize: 'clamp(1.85rem, 4vw, 3.5rem)',
                  lineHeight: 0.9,
                  letterSpacing: '-0.04em',
                }}
              >
                Cinq manches, deux courues.
              </h2>
            </Reveal>

            <ol className="o-m-0 o-mt-14 o-grid o-list-none o-gap-4 o-p-0 md:o-grid-cols-5">
              {SAISON.map((manche) => {
                const live = manche.etat === 'prochaine'
                return (
                  <li key={manche.rang} className="o-relative o-min-w-0">
                    {/* Le connecteur en tirets, qui rampe vers la manche en cours. */}
                    {live && !reduced && (
                      <svg
                        aria-hidden="true"
                        className="o-pointer-events-none o-absolute o-left-0 o-top-6 o-hidden o-h-px o-w-full md:o-block"
                        viewBox="0 0 100 1"
                        preserveAspectRatio="none"
                      >
                        <path
                          data-o-cr-tiret=""
                          d="M-100 0.5H0"
                          stroke={accent(500)}
                          strokeWidth="1"
                          strokeDasharray="6 8"
                        />
                      </svg>
                    )}
                    <Plaque
                      fond={live ? 'var(--o-palette-zinc-950)' : 'transparent'}
                      encreCoins={live ? accent(400) : accentDoux(700, 34)}
                      className="o-h-full o-p-5"
                      style={
                        live
                          ? nuit('zinc')
                          : { boxShadow: `inset 0 0 0 1px ${accentDoux(700, 18)}` }
                      }
                    >
                      <p
                        className="o-m-0 o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                        style={{
                          color: live ? encreSurSombre() : 'var(--o-theme-muted)',
                        }}
                      >
                        {live && (
                          <span
                            data-o-cr-battement=""
                            aria-hidden="true"
                            className="o-block o-size-1.5"
                            style={{ backgroundColor: accent(500) }}
                          />
                        )}
                        {manche.rang}
                      </p>
                      <h3
                        className={`o-m-0 o-mt-4 o-uppercase ${live ? 'o-text-zinc-50' : 'o-text-zinc-950 dark:o-text-zinc-50'}`}
                        style={{
                          ...affiche('m', 500),
                          fontSize: 'clamp(1.1rem, 1.6vw, 1.5rem)',
                          lineHeight: 0.96,
                        }}
                      >
                        {manche.nom}
                      </h3>
                      <p
                        className={`o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest ${live ? 'o-text-zinc-400' : 'o-text-zinc-500 dark:o-text-zinc-400'}`}
                      >
                        {manche.lieu}
                        <br />
                        {manche.date}
                      </p>
                      <p
                        className={`o-m-0 o-mt-4 o-border-t o-pt-3 o-font-mono o-text-xs o-tabular-nums ${live ? 'o-border-white-10' : 'o-border-black-10 dark:o-border-zinc-800'}`}
                        style={{
                          color:
                            manche.resultat === undefined
                              ? 'var(--o-theme-muted)'
                              : encre(),
                        }}
                      >
                        {manche.resultat ?? (live ? 'Prochaine' : 'A venir')}
                      </p>
                    </Plaque>
                  </li>
                )
              })}
            </ol>
          </div>
        </section>

        {/* ================= La pile des saisons ========================== */}
        <section
          aria-label="Trois saisons, empilees"
          className="o-px-6 o-pb-32 md:o-px-10"
        >
          <div className="o-mx-auto o-max-w-6xl">
            {ETAGES.map((etage, rang) => (
              <EtagePile
                key={etage.annee}
                etage={etage}
                rang={rang}
                dernier={rang === ETAGES.length - 1}
              />
            ))}
          </div>
        </section>

        {/* ================= Le banc ====================================== */}
        <section
          id="banc"
          className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
        >
          <div className="o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="03" sombre={false}>
                Le banc
              </Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="o-m-0 o-mt-6 o-max-w-2xl o-uppercase o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('m', 700),
                  fontSize: 'clamp(1.85rem, 4vw, 3.5rem)',
                  lineHeight: 0.9,
                  letterSpacing: '-0.04em',
                }}
              >
                Chaque cran se paie ailleurs.
              </h2>
            </Reveal>
            <p className="o-m-0 o-mt-6 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
              Reglez la voiture pour La Bresse. Le banc rend un temps au tour, une vitesse
              de pointe et l usure du train avant : il n existe pas de reglage qui gagne
              partout.
            </p>
            <div className="o-mt-14">
              <Banc />
            </div>
          </div>
        </section>

        {/* ================= L appel : une bande qui defile =============== */}
        <section
          aria-labelledby="appel-titre"
          className="o-py-6"
          style={{ backgroundColor: accent(500) }}
        >
          <h2 id="appel-titre" className="o-sr-only">
            Rouler avec l ecurie
          </h2>
          <Marquee speed={34} pauseOnHover={false} fade={0}>
            <span
              className="o-flex o-items-center o-whitespace-nowrap o-uppercase"
              style={{
                ...affiche('m', 700),
                fontSize: 'clamp(1.5rem, 3.4vw, 3rem)',
                color: 'var(--o-palette-zinc-950)',
                letterSpacing: '-0.03em',
              }}
            >
              {[
                'Deux baquets libres pour Nogaro',
                'Essais prives le jeudi',
                'Partenaires — la voiture est visible en stand',
                'Ecrire a stand@cardan.fr',
              ].map((mot) => (
                <span key={mot} className="o-flex o-items-center">
                  <span className="o-px-8">{mot}</span>
                  <span
                    aria-hidden="true"
                    className="o-opacity-50"
                    style={{ fontSize: '0.5em' }}
                  >
                    ///
                  </span>
                </span>
              ))}
            </span>
          </Marquee>
        </section>

        {/* ================= Le pied : le plan du stand =================== */}
        <footer className="o-px-6 o-py-16 md:o-px-10" style={nuit('zinc')}>
          <div className="o-mx-auto o-grid o-max-w-6xl o-gap-12 md:o-grid-cols-12">
            <div className="md:o-col-span-7">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                Atelier — 9 rue des Fonderies, Clermont-Ferrand
              </p>
              {/* Le plan du stand, dessine : trois travees et la porte. */}
              <svg
                viewBox="0 0 620 250"
                className="o-mt-5 o-w-full"
                aria-label="Plan de l atelier : trois travees, la porte au sud"
              >
                <rect
                  x="1"
                  y="1"
                  width="618"
                  height="248"
                  fill="none"
                  stroke={accentDoux(300, 26)}
                  strokeWidth="1"
                />
                <path
                  d="M210 1v248M410 1v248"
                  stroke={accentDoux(300, 18)}
                  strokeWidth="1"
                  strokeDasharray="5 7"
                />
                <rect
                  x="250"
                  y="96"
                  width="120"
                  height="58"
                  fill="none"
                  stroke={accent(400)}
                  strokeWidth="2"
                />
                <text
                  x="262"
                  y="130"
                  fontSize="13"
                  fill={accent(400)}
                  style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
                >
                  VOITURE 04
                </text>
                <text
                  x="20"
                  y="30"
                  fontSize="12"
                  fill="var(--o-theme-muted)"
                  style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
                >
                  TRAVEE A — MOTEUR
                </text>
                <text
                  x="228"
                  y="30"
                  fontSize="12"
                  fill="var(--o-theme-muted)"
                  style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
                >
                  TRAVEE B — CHASSIS
                </text>
                <text
                  x="428"
                  y="30"
                  fontSize="12"
                  fill="var(--o-theme-muted)"
                  style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
                >
                  TRAVEE C — BANC
                </text>
                <path d="M270 249h80" stroke={accent(400)} strokeWidth="4" />
                <text
                  x="358"
                  y="243"
                  fontSize="12"
                  fill="var(--o-theme-muted)"
                  style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
                >
                  PORTE
                </text>
              </svg>
            </div>

            <div className="o-grid o-gap-8 sm:o-grid-cols-2 md:o-col-span-5">
              {[
                {
                  titre: 'L ecurie',
                  liens: [
                    'La voiture',
                    'L equipe',
                    'Le banc de reglages',
                    'Les reglages publies',
                  ],
                },
                {
                  titre: 'Venir',
                  liens: [
                    'Essais prives',
                    'Stand ouvert le samedi',
                    'Partenaires',
                    'Nous ecrire',
                  ],
                },
              ].map((colonne) => (
                <nav key={colonne.titre} aria-label={colonne.titre}>
                  <h2
                    className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                    style={{ color: encreSurSombre() }}
                  >
                    {colonne.titre}
                  </h2>
                  <ul className="o-m-0 o-mt-4 o-list-none o-space-y-2 o-p-0">
                    {colonne.liens.map((lien) => (
                      <li key={lien}>
                        <a
                          href="#circuit"
                          className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400 o-no-underline o-transition-colors hover:o-text-zinc-50 focus:o-ring"
                        >
                          {lien}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
              <p className="o-m-0 sm:o-col-span-2">
                <a
                  href="#banc"
                  className="o-inline-flex o-items-center o-gap-2 o-font-mono o-text-sm o-uppercase o-tracking-widest o-no-underline focus:o-ring"
                  style={{ color: encreSurSombre() }}
                >
                  stand@cardan.fr{' '}
                  <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
                </a>
              </p>
            </div>
          </div>
          <p className="o-mx-auto o-mt-14 o-max-w-6xl o-border-t o-border-white-10 o-pt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
            Ecurie Cardan — association loi 1901 — licence FFSA 2026 — © 2026. Les temps
            publies sont ceux du chronometrage officiel.
          </p>
        </footer>
      </div>
    </Porte>
  )
}
