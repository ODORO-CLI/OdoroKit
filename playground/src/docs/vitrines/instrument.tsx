/**
 * Chevalet — luthier.
 *
 * ## L objet est le site
 *
 * Filiation Laocoon : un seul objet, eclaire, et rien autour. Le violon est
 * **en volume** — une silhouette extrudee a partir du contour reel d un
 * quatre-quarts, ses deux ouies percees dans la table, son manche, son
 * chevillier, ses quatre cordes — et il reste colle derriere l ecran pendant
 * que quatre actes passent dessus : la table, l ame, le vernis, le chevalet.
 *
 * Le repli n est pas une image de remplacement : c est la meme silhouette,
 * dessinee au trait, avec ses ouies et ses cordes. Sous mouvement reduit ou
 * sans WebGL, la page garde son sujet.
 *
 * ## Ce que la page fait : l accord
 *
 * Le mecanisme est **le diapason**. On le regle entre 415 hertz — le la des
 * orchestres baroques — et 445, et tout se recalcule :
 *
 * - les quatre cordes sont accordees en quintes justes, donc
 *   `sol = la / 2,25`, `re = la / 1,5`, `mi = la x 1,5` ;
 * - la tension de chaque corde vient de la corde vibrante :
 *   `T = 4 L² f² µ`, avec `L = 32,5 cm` et la masse lineique de chaque corde ;
 * - la somme des quatre tensions, rabattue par l angle de cassure de 158
 *   degres, donne la **charge verticale sur la table** : c est elle qui
 *   interesse un luthier, et elle passe de soixante-dix-huit a quatre-vingt-
 *   quinze newtons entre les deux bouts de la reglette.
 *
 * On **pince** chaque corde : elle vibre, la table repond par des ondes, et
 * le violon en volume tremble une seconde. Rien de tout cela n est une
 * illustration — les chiffres affiches sont ceux du calcul.
 *
 * ## Les formes
 *
 * A36 : une enveloppe qui s ouvre au survol. P43 : un pied a une seule
 * colonne, centre. C23 : trois chiffres en relief, tailles dans l epaisseur.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowDown, ArrowUpRight } from '@odoro-cli/icons/outline'
import { Reveal } from '@odoro-cli/libs/motion'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'

import { CursorHalo } from '@/odoro/effect/CursorHalo.jsx'
import { ShineText } from '@/odoro/text/ShineText.jsx'
import { SplitLines } from '@/odoro/text/SplitLines.jsx'
import { ReflectiveCard } from '@/odoro/ui/ReflectiveCard.jsx'

import { nuit } from './communs.jsx'
import { accent, accentDoux, aplat, encreSurSombre } from './palettes.js'
import {
  affiche,
  BarreCoins,
  CHROME,
  Coin,
  Etiquette,
  Grain,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Epingle } from './scene.jsx'
import { eclairer, teinte, Volume } from './volume.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Le serif d affichage : Fraunces en 400, qui tient sur le noir. */
function serif(corps: 'm' | 'l' | 'xl'): CSSProperties {
  return { ...affiche(corps, 400), letterSpacing: '-0.02em' }
}

/* ============================ La feuille =============================== */

const STYLE_LUTHIER = 'o-vitrine-instrument'

/**
 * Ce que les utilitaires n ont pas : la corde pincee, l onde de la table,
 * le rabat de l enveloppe. Tout est coupe sous mouvement reduit.
 */
const CSS_LUTHIER = [
  '@keyframes o-lu-corde{',
  '0%{transform:translate3d(0,0,0)}',
  '8%{transform:translate3d(7px,0,0)}',
  '22%{transform:translate3d(-5px,0,0)}',
  '38%{transform:translate3d(3.4px,0,0)}',
  '56%{transform:translate3d(-2.1px,0,0)}',
  '74%{transform:translate3d(1.2px,0,0)}',
  '88%{transform:translate3d(-0.5px,0,0)}',
  '100%{transform:translate3d(0,0,0)}}',
  '@keyframes o-lu-onde{0%{transform:scale(0.2);opacity:0.85}100%{transform:scale(1);opacity:0}}',
  '@keyframes o-lu-trace{0%{stroke-dashoffset:var(--o-lu-l,1000)}100%{stroke-dashoffset:0}}',
  '[data-o-lu-corde]{animation:o-lu-corde 1200ms cubic-bezier(0.3,0,0.3,1) both}',
  '[data-o-lu-onde]{animation:o-lu-onde 1500ms ease-out var(--o-lu-delai,0s) both;transform-origin:center}',
  '[data-o-lu-trace]{animation:o-lu-trace 1600ms cubic-bezier(0.22,1,0.36,1) both}',
  '@media (prefers-reduced-motion:reduce){',
  '[data-o-lu-corde],[data-o-lu-onde]{animation:none}',
  '[data-o-lu-onde]{opacity:0}',
  '[data-o-lu-trace]{animation:none;stroke-dashoffset:0}}',
].join('')

function useFeuilleLuthier(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_LUTHIER) !== null) return
    const feuille = document.createElement('style')
    feuille.id = STYLE_LUTHIER
    feuille.textContent = CSS_LUTHIER
    document.head.append(feuille)
  }, [])
}

/* ============================ Le contour ============================== */

/**
 * Le contour d une table de violon quatre-quarts, moitie droite.
 *
 * Chaque ligne est une courbe cubique : deux points de controle puis le point
 * d arrivee, en unites de scene — l unite vaut cent millimetres. Les cotes
 * sont ceux d un instrument entier : trois cent cinquante-six millimetres de
 * caisse, cent soixante-huit aux hanches hautes, cent douze a la taille, deux
 * cent huit aux hanches basses.
 *
 * Le meme tableau sert au volume et au dessin de repli : une seule silhouette,
 * deux rendus.
 */
const CONTOUR: readonly (readonly [number, number, number, number, number, number])[] = [
  // La hanche basse, la plus large.
  [0.62, -1.8, 1.07, -1.54, 1.07, -1.1],
  // La rentree vers le coin bas de la taille.
  [1.07, -0.82, 0.82, -0.64, 0.66, -0.5],
  // La taille : concave, presque droite.
  [0.53, -0.36, 0.5, -0.18, 0.5, 0.02],
  // La sortie vers le coin haut.
  [0.5, 0.22, 0.55, 0.38, 0.69, 0.52],
  // La hanche haute.
  [0.83, 0.64, 0.87, 0.82, 0.87, 1.0],
  [0.87, 1.44, 0.56, 1.72, 0.32, 1.8],
  [0.22, 1.83, 0.11, 1.84, 0, 1.84],
]

/** Le contour complet, referme par symetrie. */
function contourFerme(): readonly (readonly [
  number,
  number,
  number,
  number,
  number,
  number,
])[] {
  const gauche = [...CONTOUR]
    .reverse()
    .map(
      (
        courbe,
        rang,
        tableau,
      ): readonly [number, number, number, number, number, number] => {
        const precedent = tableau[rang + 1]
        const arrivee: readonly [number, number] =
          precedent === undefined ? [0, -1.8] : [-precedent[4], precedent[5]]
        return [-courbe[2], courbe[3], -courbe[0], courbe[1], arrivee[0], arrivee[1]]
      },
    )
  return [...CONTOUR, ...gauche]
}

/* ============================ Le repli dessine ========================= */

const ECHELLE = 46
const AXE = 124
const SOL = 320

function enSvg(x: number, y: number): string {
  return `${(AXE + x * ECHELLE).toFixed(1)} ${(SOL - y * ECHELLE).toFixed(1)}`
}

/** Le chemin SVG de la caisse, deduit du meme contour que le volume. */
function cheminCaisse(): string {
  const courbes = contourFerme()
    .map((c) => `C${enSvg(c[0], c[1])} ${enSvg(c[2], c[3])} ${enSvg(c[4], c[5])}`)
    .join('')
  return `M${enSvg(0, -1.8)}${courbes}Z`
}

/**
 * Une ouie, cote droit ou gauche : deux yeux et la fente entre eux.
 *
 * Les cotes sont ceux des ouies du volume — meme geometrie, autre rendu — et
 * la fente est legerement inclinee, comme sur un instrument.
 */
const OUIE = {
  x: 0.4,
  haut: 0.32,
  bas: -0.5,
  oeilHaut: 0.095,
  oeilBas: 0.115,
  fente: 0.075,
} as const

function Ouie({ cote }: { readonly cote: 1 | -1 }): ReactElement {
  const x = OUIE.x * cote
  const decale = 0.07 * cote
  return (
    <g>
      <circle
        cx={AXE + x * ECHELLE}
        cy={SOL - OUIE.haut * ECHELLE}
        r={OUIE.oeilHaut * ECHELLE}
      />
      <circle
        cx={AXE + (x - decale) * ECHELLE}
        cy={SOL - OUIE.bas * ECHELLE}
        r={OUIE.oeilBas * ECHELLE}
      />
      <path
        d={`M${enSvg(x + OUIE.fente * cote, OUIE.haut)}L${enSvg(x - decale + OUIE.fente * cote, OUIE.bas)}L${enSvg(
          x - decale - OUIE.fente * cote,
          OUIE.bas,
        )}L${enSvg(x - OUIE.fente * cote, OUIE.haut)}Z`}
      />
    </g>
  )
}

/**
 * Le violon dessine au trait : le repli de la scene, et le meme objet.
 *
 * Caisse, ouies, manche, chevillier, volute, chevalet, cordier, quatre cordes.
 * Il se trace a l entree dans le champ, comme un releve de gabarit.
 */
function ViolonDessine(): ReactElement {
  const caisse = useMemo(() => cheminCaisse(), [])
  const cordes = [-0.048, -0.016, 0.016, 0.048]
  return (
    <svg
      viewBox="0 0 248 480"
      className="o-h-full o-w-full"
      role="img"
      aria-label="Un violon vu de face : la caisse, les deux ouies, le chevalet, le chevillier et les quatre cordes"
    >
      <g
        fill="none"
        stroke={accent(300)}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {/* Le manche et le chevillier, derriere la caisse. */}
        <path
          d={`M${enSvg(-0.16, 1.8)}L${enSvg(-0.16, 3.05)}L${enSvg(0.16, 3.05)}L${enSvg(0.16, 1.8)}`}
        />
        <path
          d={`M${enSvg(-0.13, 3.05)}L${enSvg(-0.15, 3.75)}L${enSvg(0.15, 3.75)}L${enSvg(0.13, 3.05)}Z`}
        />
        <path
          d={`M${enSvg(0.15, 3.75)}C${enSvg(0.36, 3.9)} ${enSvg(0.34, 4.18)} ${enSvg(0.1, 4.14)}C${enSvg(-0.08, 4.11)} ${enSvg(-0.06, 3.9)} ${enSvg(0.06, 3.92)}`}
        />
        {[3.2, 3.5].map((y) => (
          <g key={y}>
            <path d={`M${enSvg(-0.15, y)}L${enSvg(-0.34, y)}`} />
            <path d={`M${enSvg(0.15, y)}L${enSvg(0.34, y)}`} />
          </g>
        ))}

        {/* La caisse, tracee. */}
        <path
          data-o-lu-trace=""
          d={caisse}
          pathLength={1000}
          style={{ strokeDasharray: 1000, '--o-lu-l': 1000 } as CSSProperties}
        />
        <path
          d={caisse}
          opacity="0.22"
          transform={`translate(0 0) scale(1)`}
          style={{
            transformOrigin: `${String(AXE)}px ${String(SOL)}px`,
            transform: 'scale(0.965)',
          }}
        />

        {/* La touche, de la caisse au sillet. */}
        <path
          d={`M${enSvg(-0.12, 0.9)}L${enSvg(-0.13, 3.62)}L${enSvg(0.13, 3.62)}L${enSvg(0.12, 0.9)}Z`}
        />

        {/* Le chevalet et le cordier. */}
        <path
          d={`M${enSvg(-0.19, -0.2)}L${enSvg(-0.17, 0.02)}L${enSvg(0.17, 0.02)}L${enSvg(0.19, -0.2)}`}
        />
        <path
          d={`M${enSvg(-0.12, -0.52)}L${enSvg(-0.09, -1.28)}L${enSvg(0.09, -1.28)}L${enSvg(0.12, -0.52)}Z`}
        />
        <path d={`M${enSvg(0, -1.28)}L${enSvg(0, -1.78)}`} />
      </g>

      {/* Les ouies, pleines. */}
      <g fill={accent(300)} opacity="0.82">
        <Ouie cote={1} />
        <Ouie cote={-1} />
      </g>

      {/* Les quatre cordes. */}
      <g stroke={accent(200)} strokeWidth="1" opacity="0.9">
        {cordes.map((x) => (
          <path key={x} d={`M${enSvg(x, -1.2)}L${enSvg(x, 3.66)}`} />
        ))}
      </g>
    </svg>
  )
}

/* ============================ Les quatre actes ========================= */

const ACTES = [
  {
    mot: 'La table',
    titre: 'Une planche d epicea fendue, jamais sciee.',
    texte:
      'Le billon est fendu au coin pour que la fibre suive le fil du bois. Deux moities ouvertes en livre, collees a la colle chaude : la table entiere pese soixante-huit grammes une fois epaisse de deux millimetres huit au centre.',
  },
  {
    mot: 'L ame',
    titre: 'Six millimetres de diametre, et tout le son.',
    texte:
      'Un batonnet d epicea coince entre table et fond, a trois millimetres derriere le pied droit du chevalet. Le deplacer d un demi-millimetre change l instrument. C est pour cela qu on l appelle l ame.',
  },
  {
    mot: 'Le vernis',
    titre: 'Dix-huit couches, et six mois au soleil.',
    texte:
      'Une resine cuite a l huile de lin, etendue a la main, seche au jour. Trop dure elle etouffe, trop tendre elle marque. On ne rattrape pas un vernis : on le refait.',
  },
  {
    mot: 'Le chevalet',
    titre: 'Quatre-vingt-sept newtons appuient dessus.',
    texte:
      'Il ne colle pas, il tient par la seule pression des cordes. Sa courbe decide de la hauteur des cordes, ses evidements de la vitesse a laquelle la table repond. On le taille pour un instrument, pas pour un modele.',
  },
] as const

/* ============================ Les cordes =============================== */

/** Une corde : sa masse lineique, et ce qu on en dit. */
interface Corde {
  readonly cle: string
  readonly nom: string
  readonly note: string
  /** Rapport a la corde de la, en quintes justes. */
  readonly rapport: number
  /** Masse lineique, en grammes par metre. */
  readonly masse: number
  readonly matiere: string
}

/** La longueur vibrante d un quatre-quarts, en metres. */
const VIBRANTE = 0.325

const CORDES: readonly Corde[] = [
  {
    cle: 'sol',
    nom: 'Sol',
    note: 'sol 3',
    rapport: 1 / 2.25,
    masse: 2.94,
    matiere: 'Ame synthetique, filee argent',
  },
  {
    cle: 're',
    nom: 'Re',
    note: 're 4',
    rapport: 1 / 1.5,
    masse: 1.4,
    matiere: 'Ame synthetique, filee aluminium',
  },
  {
    cle: 'la',
    nom: 'La',
    note: 'la 4',
    rapport: 1,
    masse: 0.62,
    matiere: 'Ame synthetique, filee aluminium',
  },
  {
    cle: 'mi',
    nom: 'Mi',
    note: 'mi 5',
    rapport: 1.5,
    masse: 0.43,
    matiere: 'Acier plein, boucle',
  },
]

/** La tension d une corde, en newtons : T = 4 L² f² µ. */
function tension(corde: Corde, diapason: number): number {
  const f = diapason * corde.rapport
  return 4 * VIBRANTE * VIBRANTE * f * f * (corde.masse / 1000)
}

/** Le la de quelques maisons, pose sur la reglette. */
const REPERES = [
  { hz: 415, quoi: 'Baroque' },
  { hz: 430, quoi: 'Classique' },
  { hz: 440, quoi: 'Norme' },
  { hz: 443, quoi: 'Orchestre' },
] as const

/**
 * Le mecanisme : l accord.
 *
 * La reglette regle le la ; les trois autres cordes suivent en quintes justes,
 * les tensions se recalculent, et la charge sur la table avec elles. Pincer
 * une corde la fait vibrer, envoie une onde dans la table dessinee, et fait
 * trembler le violon en volume — c est `quiver` que la scene lit a l image.
 */
function Accord({ quiver }: { readonly quiver: { current: number } }): ReactElement {
  const { reduced } = useMotionState()
  const [diapason, setDiapason] = useState(440)
  const [pincee, setPincee] = useState<{ cle: string; coup: number } | null>(null)

  const tensions = useMemo(
    () => CORDES.map((corde) => tension(corde, diapason)),
    [diapason],
  )
  const totale = tensions.reduce((somme, t) => somme + t, 0)
  // Angle de cassure de 158 degres : la verticale vaut 2 T cos(79°).
  const charge = totale * 2 * Math.cos((79 * Math.PI) / 180)

  const pincer = (cle: string): void => {
    setPincee({ cle, coup: Date.now() })
    quiver.current = 1
  }

  return (
    <div className="o-grid o-gap-12 lg:o-grid-cols-12 lg:o-gap-16">
      {/* ----- La reglette du diapason ---------------------------------- */}
      <div className="o-min-w-0 lg:o-col-span-5">
        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
          Le diapason
        </p>
        <p
          className="o-m-0 o-mt-3 o-tabular-nums o-text-zinc-50"
          style={{
            ...serif('m'),
            fontSize: 'clamp(3rem, 7vw, 5.5rem)',
            lineHeight: 0.86,
          }}
        >
          {diapason} <span style={{ fontSize: '0.3em', letterSpacing: '0.1em' }}>Hz</span>
        </p>

        <label className="o-mt-6 o-block">
          <span className="o-sr-only">Frequence du la, en hertz</span>
          <input
            type="range"
            min={415}
            max={445}
            step={1}
            value={diapason}
            onChange={(evenement) => {
              setDiapason(Number(evenement.target.value))
            }}
            className="o-w-full o-accent-brand-500 focus:o-ring"
          />
        </label>
        <ul className="o-m-0 o-mt-3 o-flex o-list-none o-flex-wrap o-gap-2 o-p-0">
          {REPERES.map((repere) => (
            <li key={repere.hz}>
              <button
                type="button"
                onClick={() => {
                  setDiapason(repere.hz)
                }}
                aria-pressed={diapason === repere.hz}
                className="o-border-w-1 o-px-3 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-transition-colors focus:o-ring"
                style={
                  diapason === repere.hz
                    ? { ...aplat(), borderColor: 'transparent' }
                    : {
                        borderColor: 'var(--o-theme-line)',
                        color: 'var(--o-theme-muted)',
                      }
                }
              >
                {repere.hz} — {repere.quoi}
              </button>
            </li>
          ))}
        </ul>

        <div className="o-mt-10 o-border-t o-border-white-10 o-pt-8" aria-live="polite">
          <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
            Charge verticale sur la table
          </p>
          <p
            className="o-m-0 o-mt-2 o-tabular-nums"
            style={{
              ...serif('m'),
              fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
              lineHeight: 0.9,
              color: encreSurSombre(),
            }}
          >
            {charge.toFixed(1).replace('.', ',')} N
          </p>
          <p className="o-m-0 o-mt-4 o-max-w-sm o-text-sm o-leading-relaxed o-text-zinc-400">
            Somme des quatre tensions — {totale.toFixed(0)} newtons — rabattue par l angle
            de cassure de cent cinquante-huit degres. C est ce poids-la que l ame transmet
            au fond, et il decide de tout le reglage.
          </p>
        </div>
      </div>

      {/* ----- Les quatre cordes qu on pince ---------------------------- */}
      <div className="o-min-w-0 lg:o-col-span-7">
        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
          Pincez une corde
        </p>
        <div
          className="o-mt-4 o-grid o-grid-cols-4 o-gap-px"
          style={{ backgroundColor: 'var(--o-theme-line)' }}
        >
          {CORDES.map((corde, rang) => {
            const f = diapason * corde.rapport
            const active = pincee?.cle === corde.cle
            return (
              <button
                key={corde.cle}
                type="button"
                onClick={() => {
                  pincer(corde.cle)
                }}
                className="o-relative o-flex o-min-w-0 o-flex-col o-items-center o-justify-between o-overflow-hidden o-px-2 o-py-5 o-transition-colors hover:o-bg-white-10 focus:o-ring"
                style={{ backgroundColor: 'var(--o-theme-bg)' }}
              >
                <span
                  className="o-font-mono o-text-xs o-uppercase o-tracking-widest"
                  style={{ color: active ? encreSurSombre() : 'var(--o-theme-muted)' }}
                >
                  {corde.nom}
                </span>

                {/* La corde elle-meme : trois fils, dont deux fantomes. */}
                <span
                  aria-hidden="true"
                  className="o-relative o-block o-w-full"
                  style={{ height: 168 }}
                >
                  <svg
                    viewBox="0 0 40 168"
                    className="o-h-full o-w-full"
                    preserveAspectRatio="none"
                  >
                    <g
                      key={active ? String(pincee.coup) : 'repos'}
                      data-o-lu-corde={active && !reduced ? '' : undefined}
                    >
                      <path
                        d="M20 0V168"
                        stroke={accent(200)}
                        strokeWidth={3.4 - rang * 0.6}
                        strokeLinecap="round"
                      />
                      <path
                        d="M20 0V168"
                        stroke={accent(400)}
                        strokeWidth={1}
                        opacity="0.5"
                        transform="translate(2 0)"
                      />
                      <path
                        d="M20 0V168"
                        stroke={accent(400)}
                        strokeWidth={1}
                        opacity="0.5"
                        transform="translate(-2 0)"
                      />
                    </g>
                  </svg>
                </span>

                <span className="o-mt-3 o-block o-text-center">
                  <span className="o-block o-font-mono o-text-sm o-tabular-nums o-text-zinc-100">
                    {f.toFixed(1).replace('.', ',')} Hz
                  </span>
                  <span className="o-mt-1 o-block o-font-mono o-text-xs o-tabular-nums o-text-zinc-400">
                    {tensions[rang]?.toFixed(1).replace('.', ',')} N
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {/* La table qui repond : les ondes partent du chevalet. */}
        <div
          className="o-relative o-mt-8 o-overflow-hidden o-border-w-1 o-border-white-10"
          style={{ height: 210 }}
        >
          <svg viewBox="0 0 620 210" className="o-h-full o-w-full" aria-hidden="true">
            {/* La table, en coupe longitudinale : barre d harmonie et ame. */}
            <path
              d="M20 40h580v130H20Z"
              fill="none"
              stroke={accentDoux(300, 22)}
              strokeWidth="1"
            />
            <path d="M20 40h580" stroke={accent(300)} strokeWidth="3" opacity="0.8" />
            <path d="M20 170h580" stroke={accentDoux(300, 40)} strokeWidth="2" />
            <path
              d="M120 44v6h380v-6"
              fill="none"
              stroke={accent(400)}
              strokeWidth="4"
              opacity="0.55"
            />
            <rect
              x="352"
              y="43"
              width="10"
              height="124"
              fill={accent(400)}
              opacity="0.75"
            />
            <text
              x="368"
              y="112"
              fontSize="12"
              fill="currentColor"
              opacity="0.6"
              style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
            >
              L AME
            </text>
            <text
              x="126"
              y="70"
              fontSize="12"
              fill="currentColor"
              opacity="0.6"
              style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
            >
              BARRE D HARMONIE
            </text>
            <path d="M300 16v24M340 16v24" stroke={accent(200)} strokeWidth="3" />
            <text
              x="228"
              y="24"
              fontSize="12"
              fill="currentColor"
              opacity="0.6"
              style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
            >
              CHEVALET
            </text>

            {/* Les ondes, relancees a chaque pincement. */}
            {pincee !== null && !reduced && (
              <g key={pincee.coup}>
                {[0, 0.22, 0.44].map((retard) => (
                  <ellipse
                    key={retard}
                    data-o-lu-onde=""
                    cx="320"
                    cy="105"
                    rx="290"
                    ry="62"
                    fill="none"
                    stroke={encreSurSombre()}
                    strokeWidth="1.5"
                    style={
                      {
                        '--o-lu-delai': `${String(retard)}s`,
                        transformBox: 'fill-box',
                      } as CSSProperties
                    }
                  />
                ))}
              </g>
            )}
          </svg>
        </div>

        <p
          aria-live="polite"
          className="o-m-0 o-mt-5 o-max-w-xl o-text-sm o-leading-relaxed o-text-zinc-400"
        >
          {pincee === null
            ? 'Les quatre cordes sont accordees en quintes justes a partir du la : sol, re, la, mi. Pincez-en une.'
            : `${CORDES.find((c) => c.cle === pincee.cle)?.nom ?? ''} — ${
                CORDES.find((c) => c.cle === pincee.cle)?.matiere ?? ''
              }. L onde traverse la table en deux millisecondes, contourne l ame et ressort par les ouies.`}
        </p>
      </div>
    </div>
  )
}

/* ============================ Les chiffres en relief =================== */

/**
 * Un chiffre taille dans l epaisseur (C23).
 *
 * Douze copies decalees d un pixel forment la tranche ; la copie du dessus
 * porte l encre claire. C est la maniere dont un chiffre est grave dans une
 * eclisse, et c est du texte, pas une image.
 */
function Relief({
  children,
  taille = 'clamp(3rem, 9vw, 8rem)',
}: {
  readonly children: string
  readonly taille?: string
}): ReactElement {
  // La tranche est une pile d ombres portees, pas une pile de copies du texte :
  // une copie serait lue par l audit de contraste — et par un lecteur d ecran —
  // alors qu elle n est qu une epaisseur.
  const tranche = Array.from({ length: 14 }, (_, rang) => {
    const p = rang + 1
    return `${String(p)}px ${String(p)}px 0 ${accentDoux(900, 22 + p * 4)}`
  }).join(', ')

  return (
    <span
      className="o-inline-block o-tabular-nums"
      style={{
        ...serif('m'),
        fontSize: taille,
        lineHeight: 0.9,
        color: accent(200),
        textShadow: `${tranche}, 16px 16px 22px rgba(0, 0, 0, 0.55)`,
      }}
    >
      {children}
    </span>
  )
}

const CHIFFRES = [
  {
    valeur: '210',
    unite: 'heures d atelier par instrument',
    note: 'Du billon debite au premier coup d archet.',
  },
  {
    valeur: '3',
    unite: 'violons par an, pas davantage',
    note: 'Le vernis prend six mois a lui seul.',
  },
  {
    valeur: '78',
    unite: 'ans de sechage pour l epicea',
    note: 'Abattu en 1948 dans le val di Fiemme, en lune descendante.',
  },
] as const

/* ============================ L enveloppe ============================== */

/**
 * L enveloppe qui s ouvre au survol (A36).
 *
 * Le rabat bascule, la lettre monte, et l adresse se lit. Le rabat n est pas
 * un decor : tant qu il est ferme, la lettre est hors du champ, et c est ce
 * qui donne envie de passer dessus. Au clavier, le foyer ouvre la meme chose.
 */
function Enveloppe(): ReactElement {
  const { reduced } = useMotionState()
  const [ouverte, setOuverte] = useState(false)
  const montree = ouverte || reduced

  return (
    <div
      className="o-relative o-mx-auto o-w-full"
      style={{ maxWidth: 540, height: 330, perspective: 1100 }}
      onMouseEnter={() => {
        setOuverte(true)
      }}
      onMouseLeave={() => {
        setOuverte(false)
      }}
      onFocus={() => {
        setOuverte(true)
      }}
      onBlur={(evenement) => {
        if (!evenement.currentTarget.contains(evenement.relatedTarget)) setOuverte(false)
      }}
    >
      {/* La lettre, qui monte de l enveloppe. Posee en absolu : fermee, elle
          ne laisse pas un trou dans la page. */}
      <div
        className="o-absolute o-z-10 o-border-w-1 o-border-white-10 o-px-6 o-pb-10 o-pt-6 o-text-center md:o-px-10"
        style={{
          // Le bas de la lettre s arrete douze pixels sous le bord haut de
          // l enveloppe : elle en sort, mais son lien ne passe pas derriere.
          bottom: 146,
          left: 16,
          right: 16,
          backgroundColor: accentDoux(900, 22),
          transform: montree ? 'translate3d(0, 0, 0)' : 'translate3d(0, 118px, 0)',
          opacity: montree ? 1 : 0,
          transition: reduced
            ? 'opacity 240ms linear'
            : 'transform 760ms cubic-bezier(0.22,1,0.36,1) 120ms, opacity 480ms ease 120ms',
        }}
      >
        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
          Liste d attente — ouverte
        </p>
        <p className="o-m-0 o-mt-4 o-text-base o-leading-relaxed o-text-zinc-200">
          Trois instruments par an, et quatorze noms devant vous. On ecrit avant de
          commander : la seule question utile est celle du jeu, pas celle du modele.
        </p>
        <a
          href="mailto:atelier@chevalet-lutherie.fr"
          className="o-mt-6 o-inline-flex o-items-center o-gap-2 o-px-5 o-py-2.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-no-underline o-transition-opacity hover:o-opacity-85 focus:o-ring"
          style={aplat()}
        >
          atelier@chevalet-lutherie.fr
          <Icon icon={ArrowUpRight} size={14} aria-hidden="true" />
        </a>
      </div>

      {/* Le corps de l enveloppe, devant la lettre. */}
      <div
        className="o-absolute o-inset-x-0 o-bottom-8 o-z-20 o-border-w-1 o-border-white-10"
        style={{ backgroundColor: accentDoux(800, 30), height: 150 }}
      >
        <svg
          viewBox="0 0 540 150"
          className="o-h-full o-w-full"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <path
            d="M0 0 270 96 540 0"
            fill="none"
            stroke={accentDoux(300, 22)}
            strokeWidth="1"
          />
          <path
            d="M0 150 200 74M540 150 340 74"
            stroke={accentDoux(300, 16)}
            strokeWidth="1"
          />
        </svg>
        <p className="o-pointer-events-none o-absolute o-bottom-4 o-left-6 o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
          Chevalet — 6 rue des Trois-Bornes, Paris
        </p>
      </div>

      {/* Le rabat, qui bascule vers l arriere par-dessus tout. */}
      <div
        aria-hidden="true"
        className="o-pointer-events-none o-absolute o-inset-x-0"
        style={{
          // Ferme, le rabat est devant tout ; ouvert, il bascule derriere la
          // lettre — sans quoi il recouvrirait l adresse qu il vient de livrer.
          zIndex: montree ? 0 : 30,
          bottom: 62,
          height: 96,
          transformOrigin: 'top center',
          transformStyle: 'preserve-3d',
          transform: montree ? 'rotateX(-172deg)' : 'rotateX(0deg)',
          transition: reduced ? 'none' : 'transform 760ms cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <svg
          viewBox="0 0 540 96"
          className="o-h-full o-w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 0h540L270 96Z"
            fill={accentDoux(700, 44)}
            stroke={accentDoux(300, 26)}
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <p className="o-absolute o-inset-x-0 o-bottom-0 o-z-30 o-m-0 o-text-center o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
        {montree ? 'La lettre est sortie' : 'Passez sur l enveloppe'}
      </p>
    </div>
  )
}

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#instrument', 'L instrument'],
  ['#accord', 'L accord'],
  ['#atelier', 'L atelier'],
] as const

export default function Page(): ReactElement {
  const polices = usePolices('fraunces')
  useFeuilleLuthier()
  const { reduced } = useMotionState()
  const [piste, setPiste] = useState<HTMLElement | null>(null)

  // Ce que la scene lit a chaque image : une secousse qui s eteint seule.
  const quiver = useRef(0)

  // La lumiere d atelier derriere l objet : une seule fois, pour que le
  // changement d acte ne la remonte pas.
  const lueur = useMemo(
    () => (
      <div
        aria-hidden="true"
        className="o-pointer-events-none o-absolute o-inset-0 o-z-0"
        style={{
          background: [
            `radial-gradient(42% 52% at 62% 42%, ${accentDoux(400, 34)}, transparent 70%)`,
            `radial-gradient(78% 62% at 18% 96%, ${accentDoux(800, 34)}, transparent 76%)`,
          ].join(', '),
        }}
      />
    ),
    [],
  )

  const violon = useMemo(
    () => (
      <Volume
        nom="violon"
        className="o-pointer-events-none o-absolute o-inset-0 o-z-0"
        piste={piste}
        trajectoire={[
          { at: 0, position: [0, 0.1, 9.6] },
          { at: 0.5, position: [2.6, 0.4, 8.2] },
          { at: 1, position: [-1.4, 1.1, 7.4] },
        ]}
        repli={
          <div className="o-flex o-h-full o-items-center o-justify-center o-py-10 o-opacity-80">
            <ViolonDessine />
          </div>
        }
        construire={(contexte) => {
          const { scene, camera, three } = contexte
          const bois = teinte('--o-vitrine-400', '#c98b2f')
          const groupe = new three.Group()

          // ----- La caisse : le contour reel, extrude, ouies percees -----
          const forme = new three.Shape()
          forme.moveTo(0, -1.8)
          for (const c of contourFerme())
            forme.bezierCurveTo(c[0], c[1], c[2], c[3], c[4], c[5])

          for (const cote of [1, -1] as const) {
            const x = OUIE.x * cote
            const decale = 0.07 * cote
            const oeilHaut = new three.Path()
            oeilHaut.absarc(x, OUIE.haut, OUIE.oeilHaut, 0, Math.PI * 2, true)
            const oeilBas = new three.Path()
            oeilBas.absarc(x - decale, OUIE.bas, OUIE.oeilBas, 0, Math.PI * 2, true)
            const fente = new three.Path()
            fente.moveTo(x + OUIE.fente * cote, OUIE.haut)
            fente.lineTo(x - decale + OUIE.fente * cote, OUIE.bas)
            fente.lineTo(x - decale - OUIE.fente * cote, OUIE.bas)
            fente.lineTo(x - OUIE.fente * cote, OUIE.haut)
            fente.closePath()
            forme.holes.push(oeilHaut, oeilBas, fente)
          }

          const formeCaisse = new three.ExtrudeGeometry(forme, {
            depth: 0.42,
            // Un chanfrein court : au-dela de trois millimetres, la voute
            // arrondit les ouies et le contour, et le violon devient un galet.
            bevelEnabled: true,
            bevelThickness: 0.06,
            bevelSize: 0.03,
            bevelSegments: 3,
            curveSegments: 28,
          })
          formeCaisse.center()

          const vernis = new three.MeshPhysicalMaterial({
            color: bois,
            metalness: 0.05,
            roughness: 0.34,
            clearcoat: 0.9,
            clearcoatRoughness: 0.16,
            sheen: 0.5,
          })
          const caisse = new three.Mesh(formeCaisse, vernis)
          groupe.add(caisse)

          // ----- L ebene : manche, touche, chevillier, cordier ----------
          const ebene = new three.MeshPhysicalMaterial({
            color: 0x14100e,
            metalness: 0.1,
            roughness: 0.35,
            clearcoat: 0.6,
          })

          const formeManche = new three.BoxGeometry(0.34, 1.3, 0.24)
          const manche = new three.Mesh(formeManche, vernis)
          manche.position.set(0, 2.42, -0.06)
          groupe.add(manche)

          const formeTouche = new three.BoxGeometry(0.28, 2.7, 0.08)
          const touche = new three.Mesh(formeTouche, ebene)
          touche.position.set(0, 2.28, 0.13)
          groupe.add(touche)

          const formeChevillier = new three.BoxGeometry(0.3, 0.72, 0.26)
          const chevillier = new three.Mesh(formeChevillier, vernis)
          chevillier.position.set(0, 3.36, -0.02)
          groupe.add(chevillier)

          const formeVolute = new three.TorusGeometry(0.15, 0.08, 10, 20)
          const volute = new three.Mesh(formeVolute, vernis)
          volute.position.set(0, 3.84, -0.02)
          groupe.add(volute)

          const formeCheville = new three.CylinderGeometry(0.035, 0.05, 0.4, 10)
          for (const [rang, y] of [3.2, 3.5].entries()) {
            for (const cote of [1, -1] as const) {
              const cheville = new three.Mesh(formeCheville, ebene)
              cheville.rotation.z = Math.PI / 2
              cheville.position.set(cote * 0.24, y + rang * 0, -0.02)
              groupe.add(cheville)
            }
          }

          const formeCordier = new three.BoxGeometry(0.22, 0.78, 0.07)
          const cordier = new three.Mesh(formeCordier, ebene)
          cordier.position.set(0, -0.92, 0.2)
          groupe.add(cordier)

          const formeChevalet = new three.BoxGeometry(0.38, 0.3, 0.035)
          const chevalet = new three.Mesh(formeChevalet, vernis)
          chevalet.position.set(0, -0.1, 0.25)
          groupe.add(chevalet)

          // ----- Les quatre cordes --------------------------------------
          const acier = new three.MeshStandardMaterial({
            color: 0xd9d4c8,
            metalness: 0.9,
            roughness: 0.25,
          })
          const formeCorde = new three.CylinderGeometry(0.011, 0.011, 3.3, 6)
          for (const x of [-0.05, -0.017, 0.017, 0.05]) {
            const corde = new three.Mesh(formeCorde, acier)
            corde.position.set(x, 1.22, 0.27)
            groupe.add(corde)
          }

          // A droite du titre, incline : un violon debout et centre couperait
          // la colonne de texte en deux, et ne montrerait pas sa taille.
          groupe.position.set(1.85, -0.25, 0)
          groupe.rotation.z = -0.3
          groupe.scale.setScalar(0.92)
          scene.add(groupe)

          // ----- Les lampes : sans celle de dessous, c est une tache ----
          // Un vernis n est lisible que si la lumiere rase : l ambiante reste
          // basse, et trois lampes ponctuelles font le relief — dont une de
          // dessous, sans quoi la caisse est une tache.
          eclairer(contexte, {
            cle: 0xffe9c6,
            remplissage: 0x5c6f9e,
            contour: 0xfff6e6,
            force: 0.82,
          })
          const dessous = new three.PointLight(0xffcf92, 42, 20, 2)
          dessous.position.set(1.4, -3.4, 2.8)
          const rasante = new three.PointLight(0xfff4e0, 34, 18, 2)
          rasante.position.set(-2.6, 1.6, 3.4)
          const contre = new three.PointLight(0xffffff, 26, 18, 2)
          contre.position.set(3.6, 2.8, -3.2)
          scene.add(dessous, rasante, contre)

          camera.position.set(0, 0.1, 9.6)
          camera.lookAt(1.1, 0, 0)

          return () => {
            vernis.dispose()
            ebene.dispose()
            acier.dispose()
            formeCaisse.dispose()
            formeManche.dispose()
            formeTouche.dispose()
            formeChevillier.dispose()
            formeVolute.dispose()
            formeCheville.dispose()
            formeCordier.dispose()
            formeChevalet.dispose()
            formeCorde.dispose()
          }
        }}
        animer={({ scene }, { delta, time }) => {
          const groupe = scene.children[0]
          if (groupe === undefined) return
          // Un balancement, pas un tour : de profil, un violon est une planche.
          // Trente-trois degres de part et d autre suffisent a faire jouer la
          // lumiere sur la voute sans jamais perdre la table de vue.
          groupe.rotation.y = Math.sin(time * 0.28) * 0.58
          // La secousse du pincement : elle s eteint en une seconde.
          quiver.current = Math.max(0, quiver.current - delta * 1.1)
          const secousse = quiver.current * quiver.current
          groupe.rotation.z = -0.3 + Math.sin(time * 34) * 0.014 * secousse
          groupe.position.x = 1.85 + Math.sin(time * 47) * 0.06 * secousse
        }}
      />
    ),
    [piste],
  )

  return (
    <Porte forme="lettres" marque="Chevalet">
      <div className="o-relative o-text-zinc-50" style={{ ...polices, ...nuit('zinc') }}>
        {!reduced && <CursorHalo dotSize={5} haloSize={40} hoverScale={2} />}

        {/*
          ----- L etabli : le violon colle, l ouverture et quatre actes dessus
        */}
        <div ref={setPiste} className="o-relative">
          <div
            className="o-sticky o-z-0 o-overflow-hidden"
            style={{ top: CHROME, height: ECRAN }}
          >
            {lueur}
            {violon}
            <div
              aria-hidden="true"
              className="o-absolute o-inset-0 o-z-0"
              style={{
                background:
                  'linear-gradient(to top, var(--o-palette-zinc-950) 0%, color-mix(in oklab, var(--o-palette-zinc-950) 52%, transparent) 38%, transparent 74%)',
              }}
            />
            <Grain opacite={0.07} />
          </div>

          <div className="o-relative o-z-10" style={{ marginTop: `calc(-1 * ${ECRAN})` }}>
            {/* L ouverture. */}
            <section
              id="haut"
              className="o-relative o-flex o-flex-col"
              style={{ minHeight: ECRAN }}
            >
              <BarreCoins
                marque="Chevalet"
                liens={NAVIGATION}
                droite="Atelier — Paris XI"
              />
              <div className="o-flex o-grow o-flex-col o-justify-end o-px-6 o-pb-20 o-pt-12 md:o-px-14 md:o-pb-24">
                <Surgit>
                  <Etiquette>Lutherie du quatuor — trois instruments par an</Etiquette>
                </Surgit>
                <TitreVague
                  delai={120}
                  className="o-m-0 o-mt-6 o-max-w-2xl"
                  style={{ ...serif('l'), fontSize: 'clamp(2.35rem, 5.6vw, 5.75rem)' }}
                >
                  Le son sort par deux fentes de quatre-vingts millimetres.
                </TitreVague>
                <div className="o-mt-10 o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                  <Surgit
                    delai={520}
                    as="p"
                    className="o-m-0 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-300 md:o-col-span-6"
                  >
                    Un violon est une boite d epicea sous quatre-vingt-sept newtons. Tout
                    le metier tient a savoir ou porte cette charge, et a quelle epaisseur
                    la table y resiste sans se taire.
                  </Surgit>
                  <Surgit
                    delai={640}
                    className="md:o-col-span-6 md:o-flex md:o-justify-end"
                  >
                    <a
                      href="#accord"
                      className="o-inline-flex o-items-center o-gap-3 o-border-w-1 o-px-7 o-py-3.5 o-text-sm o-font-semibold o-no-underline o-transition-opacity hover:o-opacity-85 focus:o-ring"
                      style={aplat()}
                    >
                      Accorder l instrument{' '}
                      <Icon icon={ArrowDown} size={16} aria-hidden="true" />
                    </a>
                  </Surgit>
                </div>
              </div>
              <Coin position="bd">
                Epicea du val di Fiemme
                <br />
                Erable onde des Balkans
              </Coin>
            </section>

            {/* Les quatre actes, sur l objet. */}
            <Epingle ecrans={4} actes={ACTES.length}>
              {(acte, progression) => {
                const a = ACTES[acte] ?? ACTES[0]
                return (
                  <div className="o-relative o-flex o-h-full o-flex-col o-justify-center o-px-6 md:o-px-14">
                    <div className="o-grid o-gap-8 md:o-grid-cols-12">
                      <div className="md:o-col-span-3">
                        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                          {String(acte + 1).padStart(2, '0')} /{' '}
                          {String(ACTES.length).padStart(2, '0')}
                        </p>
                        <ol className="o-m-0 o-mt-6 o-list-none o-p-0">
                          {ACTES.map((autre, rang) => (
                            <li
                              key={autre.mot}
                              className="o-flex o-items-center o-gap-3 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                              style={{
                                color:
                                  rang === acte
                                    ? encreSurSombre()
                                    : 'var(--o-theme-muted)',
                              }}
                            >
                              <span
                                aria-hidden="true"
                                className="o-h-px o-transition-all"
                                style={{
                                  width: rang === acte ? 26 : 8,
                                  backgroundColor: 'currentColor',
                                }}
                              />
                              {autre.mot}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="o-min-w-0 md:o-col-span-9">
                        <h2
                          key={a.mot}
                          className="o-m-0 o-max-w-3xl o-text-balance"
                          style={{
                            ...serif('l'),
                            fontSize: 'clamp(2rem, 5.4vw, 5.5rem)',
                          }}
                        >
                          <ShineText
                            from="var(--o-palette-zinc-50)"
                            shine={accent(200)}
                            duration={4200}
                            width={22}
                          >
                            {a.titre}
                          </ShineText>
                        </h2>
                        <p
                          key={`${a.mot}-texte`}
                          className="o-m-0 o-mt-8 o-max-w-lg o-text-base o-leading-relaxed o-text-zinc-300 md:o-ml-auto md:o-text-right"
                        >
                          {a.texte}
                        </p>
                      </div>
                    </div>
                    <div
                      aria-hidden="true"
                      className="o-absolute o-bottom-8 o-left-6 o-right-6 o-h-px o-bg-white-10 md:o-left-12 md:o-right-12"
                    >
                      <div
                        className="o-h-full"
                        style={{
                          width: `${String(Math.round((reduced ? 1 : progression) * 100))}%`,
                          backgroundColor: encreSurSombre(),
                          transition: 'width 200ms linear',
                        }}
                      />
                    </div>
                  </div>
                )
              }}
            </Epingle>
          </div>
        </div>

        <main
          id="instrument"
          className="o-relative o-z-10 o-scroll-mt-24"
          style={{ backgroundColor: 'var(--o-palette-zinc-950)' }}
        >
          {/*
            ----- Le mecanisme : l accord --------------------------------------
          */}
          <section
            id="accord"
            className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-14 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="o-min-w-0 md:o-col-span-8">
                  <Reveal>
                    <Indice rang="01">L accord</Indice>
                  </Reveal>
                  <Reveal delay={80}>
                    <SplitLines
                      as="h2"
                      className="o-m-0 o-mt-5 o-max-w-3xl o-text-balance"
                      style={{ ...serif('m'), fontSize: 'clamp(1.9rem, 4.6vw, 4.25rem)' }}
                    >
                      Changez le la, et la table prend vingt newtons de plus.
                    </SplitLines>
                  </Reveal>
                </div>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400 md:o-col-span-4 md:o-text-right">
                  T = 4 L² f² µ
                  <br />L = 32,5 cm
                </p>
              </div>
              <div className="o-mt-16">
                <Accord quiver={quiver} />
              </div>
            </div>
          </section>

          {/*
            ----- La coupe, sur une carte qui reflete ---------------------------
          */}
          <section
            className="o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-14 md:o-py-32"
            style={{ backgroundColor: accentDoux(500, 5) }}
          >
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-12 lg:o-grid-cols-12 lg:o-gap-16 lg:o-items-center">
              <div className="o-min-w-0 lg:o-col-span-5">
                <Reveal>
                  <Indice rang="02">Le gabarit</Indice>
                </Reveal>
                <Reveal delay={80}>
                  <h2
                    className="o-m-0 o-mt-5 o-max-w-lg o-text-balance"
                    style={{ ...serif('m'), fontSize: 'clamp(1.8rem, 4vw, 3.5rem)' }}
                  >
                    Trois cent cinquante-six millimetres, et rien qui soit rond par
                    hasard.
                  </h2>
                </Reveal>
                <p className="o-m-0 o-mt-6 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-300">
                  Le contour de la caisse est celui d un quatre-quarts : cent
                  soixante-huit millimetres aux hanches hautes, cent douze a la taille,
                  deux cent huit aux hanches basses. Le meme releve sert au gabarit de l
                  atelier et au dessin de cette page.
                </p>
                <dl className="o-m-0 o-mt-10">
                  {(
                    [
                      ['Caisse', '356 mm'],
                      ['Corde vibrante', '325 mm'],
                      ['Table au centre', '2,8 mm'],
                      ['Fond au centre', '4,4 mm'],
                      ['Ame', '6 mm de diametre'],
                    ] as const
                  ).map(([quoi, valeur]) => (
                    <div
                      key={quoi}
                      className="o-flex o-items-baseline o-justify-between o-gap-4 o-border-t o-border-white-10 o-py-3"
                    >
                      <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                        {quoi}
                      </dt>
                      <dd className="o-m-0 o-font-mono o-text-sm o-tabular-nums o-text-zinc-100">
                        {valeur}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="o-min-w-0 lg:o-col-span-7">
                <ReflectiveCard shine={0.1} brush={0.05} className="o-p-8 md:o-p-12">
                  <div className="o-mx-auto" style={{ maxWidth: 340 }}>
                    <ViolonDessine />
                  </div>
                </ReflectiveCard>
              </div>
            </div>
          </section>

          {/*
            ----- Les chiffres, tailles dans l epaisseur ------------------------
          */}
          <section className="o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-14 md:o-py-32">
            <div className="o-mx-auto o-max-w-7xl">
              <Reveal>
                <Indice rang="03">Le compte</Indice>
              </Reveal>
              <ol className="o-m-0 o-mt-14 o-list-none o-p-0">
                {CHIFFRES.map((chiffre, rang) => (
                  <li
                    key={chiffre.valeur}
                    className="o-grid o-items-center o-gap-6 o-border-t o-border-white-10 o-py-12 md:o-grid-cols-12 md:o-gap-10"
                  >
                    <div className="o-min-w-0 md:o-col-span-4">
                      <Relief
                        taille={
                          rang === 0
                            ? 'clamp(3.5rem, 10vw, 9rem)'
                            : 'clamp(3rem, 8vw, 7rem)'
                        }
                      >
                        {chiffre.valeur}
                      </Relief>
                    </div>
                    <p className="o-m-0 o-text-xl o-leading-snug o-text-zinc-100 md:o-col-span-5">
                      {chiffre.unite}
                    </p>
                    <p className="o-m-0 o-text-sm o-leading-relaxed o-text-zinc-400 md:o-col-span-3">
                      {chiffre.note}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/*
            ----- L enveloppe ---------------------------------------------------
          */}
          <section
            id="atelier"
            className="o-scroll-mt-24 o-flex o-flex-col o-items-center o-justify-center o-border-t o-border-white-10 o-px-6 o-py-24 o-text-center md:o-py-32"
          >
            <Reveal>
              <h2
                className="o-m-0 o-max-w-2xl o-text-balance"
                style={{ ...serif('m'), fontSize: 'clamp(1.8rem, 4vw, 3.5rem)' }}
              >
                On ecrit d abord. La commande vient apres.
              </h2>
            </Reveal>
            <p className="o-m-0 o-mt-6 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-400">
              L atelier se visite le vendredi apres-midi, sans rendez-vous, a condition d
              apporter son archet.
            </p>
            <div className="o-mt-10 o-w-full">
              <Enveloppe />
            </div>
          </section>
        </main>

        {/*
          ----- Le pied : une seule colonne, centree --------------------------
        */}
        <footer
          className="o-relative o-z-10 o-border-t o-border-white-10 o-px-6 o-py-16"
          style={{ backgroundColor: 'var(--o-palette-zinc-950)' }}
        >
          <div className="o-mx-auto o-flex o-max-w-md o-flex-col o-items-center o-gap-6 o-text-center">
            <p
              className="o-m-0"
              style={{ ...serif('m'), fontSize: 'clamp(2.25rem, 5vw, 3.5rem)' }}
            >
              Chevalet
            </p>
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
              6 rue des Trois-Bornes, 75011 Paris
              <br />
              Vendredi 14 h — 19 h
            </p>
            <nav
              aria-label="Rubriques"
              className="o-flex o-flex-col o-items-center o-gap-3"
            >
              {(
                [
                  ['#instrument', 'L instrument'],
                  ['#accord', 'L accord'],
                  ['#atelier', 'Ecrire a l atelier'],
                  ['#haut', 'Remonter'],
                ] as const
              ).map(([cible, mot]) => (
                <a
                  key={mot}
                  href={cible}
                  className="o-text-sm o-text-zinc-300 o-no-underline o-transition-colors hover:o-text-zinc-50 focus:o-ring"
                >
                  {mot}
                </a>
              ))}
            </nav>
            <p className="o-m-0 o-max-w-sm o-text-xs o-leading-relaxed o-text-zinc-500">
              Reparation et sonorite du quatuor. Expertises ecrites sous quinze jours.
              Aucun instrument n est vendu sans essai d une semaine.
            </p>
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
              © 2026 Chevalet
            </p>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
