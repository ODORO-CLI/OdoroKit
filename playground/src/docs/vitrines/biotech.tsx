/**
 * Cytea — laboratoire de biotechnologie.
 *
 * ## L architecture : une ouverture, puis des chapitres
 *
 * Landing page complete dont le **milieu est un pipeline qu on filtre**, et
 * c est ce qui n appartient qu a elle. Une societe de biotechnologie se juge
 * sur un pipeline date, une methode ecrite et des publications relues : la
 * page ouvre donc largement, puis se lit **en chapitres a etiquette collante**
 * — l indice et le titre restent poses a gauche pendant que le contenu defile
 * a droite, comme dans un rapport annuel qu on feuillette.
 *
 * L enchainement :
 *
 * - **ouverture** : l helice en plein cadre, le titre revele mot a mot, et le
 *   HUD de tresorerie pose a cote — c est la premiere question qu on pose a
 *   une biotech ;
 * - **chapitre 1, le pipeline** : le titre s epaissit sous le pointeur, la
 *   table se filtre par aire ;
 * - **la figure 1**, dessinee : la carte du pipeline, douze pastilles rangees
 *   par stade, qui suit le meme filtre que la table ;
 * - **la figure 2**, en pleine largeur, decouverte par bandes ;
 * - **chapitre 2, la methode**, avec deux photos du laboratoire qui se
 *   decouvrent au defilement ;
 * - **chapitre 3, les references** ;
 * - **le manifeste**, moitie eteint, signe de la directrice scientifique ;
 * - **la coupe** : une bande sombre au milieu de la page claire, ou la
 *   **figure 3** dessine les deux programmes arretes et ce qui en a ete
 *   publie — c est la seule preuve que la phrase du manifeste puisse avoir ;
 * - **les jauges** : ou en est chaque programme, en anneaux et en barres, qui
 *   partent de zero et se remplissent a l arrivee dans le champ ;
 * - **la lettre**, un formulaire en ligne avec son disque de soumission ;
 * - **le pied noir**, avec le formulaire de contact et les notes.
 *
 * ## Les figures
 *
 * Une page de biotechnologie se lit en figures numerotees, et trois se
 * suivent : une carte dessinee, une micrographie reelle, un axe de dates. Les
 * deux dessins sont en SVG et se teintent a l encre de la vitrine ; la figure
 * 2, elle, n est pas une scene mais une **micrographie**, legendee comme telle.
 *
 * ## Le fond
 *
 * L helice tient l ouverture, et reste la seule surface graphique.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Microscope,
} from '@odoro-cli/icons/filaire'
import { useMotionState } from '@odoro-cli/engine'
import { Reveal } from '@odoro-cli/libs/motion'
import { loadGoogleFonts } from '@odoro-cli/libs/styles'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactElement,
  type RefObject,
} from 'react'

import { DnaHelix } from '@/odoro/background/DnaHelix.jsx'
import { RevealMask } from '@/odoro/effect/RevealMask.jsx'
import { ScrollRevealImage } from '@/odoro/image/ScrollRevealImage.jsx'
import { CounterRoll } from '@/odoro/text/CounterRoll.jsx'
import { VariableProximity } from '@/odoro/text/VariableProximity.jsx'
import { ProgressRing } from '@/odoro/ui/ProgressRing.jsx'

import { nuit, Voile } from './communs.jsx'
import { photo } from './media.js'
import { aplat, encre, encreSurSombre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreGelule,
  Coin,
  Etiquette,
  Grain,
  Indice,
  Manifeste,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
  verre,
} from './marche.jsx'
import { Chapitre } from './scene.jsx'

/** Les aires therapeutiques. */
const AIRES = ['Oncologie', 'Auto-immun', 'Rare', 'Metabolique'] as const
type Aire = (typeof AIRES)[number]

/** Les stades reglementaires, du plus amont au plus aval. */
const PHASES = ['Decouverte', 'Preclinique', 'Phase I', 'Phase II', 'Phase III'] as const
type Phase = (typeof PHASES)[number]

/** Un programme du pipeline. */
interface Programme {
  readonly code: string
  readonly cible: string
  readonly indication: string
  readonly aire: Aire
  readonly phase: Phase
  readonly jalon: string
  readonly partenaire?: string
}

/** Le pipeline complet, du plus avance au plus amont. */
const PIPELINE: readonly Programme[] = [
  {
    code: 'CYT-101',
    cible: 'CD19 / CD22',
    indication: 'Leucemie aigue lymphoblastique, rechute',
    aire: 'Oncologie',
    phase: 'Phase III',
    jalon: 'Lecture principale au quatrieme trimestre 2027',
    partenaire: 'CHU de Nantes',
  },
  {
    code: 'CYT-114',
    cible: 'BCMA',
    indication: 'Myelome multiple refractaire',
    aire: 'Oncologie',
    phase: 'Phase II',
    jalon: 'Recrutement clos, 84 patients inclus sur 84',
  },
  {
    code: 'CYT-203',
    cible: 'Treg autologues',
    indication: 'Maladie de Crohn moderee a severe',
    aire: 'Auto-immun',
    phase: 'Phase II',
    jalon: 'Resultats a douze mois publies en mars 2026',
  },
  {
    code: 'CYT-127',
    cible: 'Claudine-18.2',
    indication: 'Adenocarcinome gastrique',
    aire: 'Oncologie',
    phase: 'Phase I',
    jalon: 'Escalade de dose, troisieme palier franchi',
    partenaire: 'Institut Curie',
  },
  {
    code: 'CYT-208',
    cible: 'Treg CAR anti-HLA',
    indication: 'Rejet de greffe renale',
    aire: 'Auto-immun',
    phase: 'Phase I',
    jalon: 'Six patients traites, aucun evenement de grade 3',
    partenaire: 'Inserm U1064',
  },
  {
    code: 'CYT-301',
    cible: 'Edition de base HBB',
    indication: 'Drepanocytose',
    aire: 'Rare',
    phase: 'Phase I',
    jalon: 'Autorisation obtenue, premier patient en mai 2026',
    partenaire: 'Genethon',
  },
  {
    code: 'CYT-214',
    cible: 'IL-2 mutee',
    indication: 'Lupus erythemateux systemique',
    aire: 'Auto-immun',
    phase: 'Preclinique',
    jalon: 'Dossier reglementaire depose au premier trimestre 2027',
  },
  {
    code: 'CYT-306',
    cible: 'AAV9 — SMN1',
    indication: 'Amyotrophie spinale de type II',
    aire: 'Rare',
    phase: 'Preclinique',
    jalon: 'Toxicologie reglementaire en cours',
  },
  {
    code: 'CYT-402',
    cible: 'GLP-1 / GIP orale',
    indication: 'Diabete de type 2 avec obesite',
    aire: 'Metabolique',
    phase: 'Preclinique',
    jalon: 'Formulation orale stabilisee, biodisponibilite a 14 %',
  },
  {
    code: 'CYT-312',
    cible: 'Correction ARN — CFTR',
    indication: 'Mucoviscidose, mutations rares',
    aire: 'Rare',
    phase: 'Decouverte',
    jalon: 'Criblage de 40 000 composes acheve',
    partenaire: 'EMBL Heidelberg',
  },
  {
    code: 'CYT-407',
    cible: 'ASGR1',
    indication: 'Steatohepatite metabolique',
    aire: 'Metabolique',
    phase: 'Decouverte',
    jalon: 'Trois series chimiques en optimisation',
  },
  {
    code: 'CYT-118',
    cible: 'NK allogeniques',
    indication: 'Tumeurs solides, ligne avancee',
    aire: 'Oncologie',
    phase: 'Decouverte',
    jalon: 'Preuve de concept sur modele murin',
    partenaire: 'Karolinska',
  },
]

/** La methode, en paragraphes numerotes comme une section de materiel. */
const METHODE: readonly {
  readonly numero: string
  readonly titre: string
  readonly texte: string
}[] = [
  {
    numero: '2.1',
    titre: 'Edition de base',
    texte:
      'La desaminase fusionnee a une Cas9 inactivee convertit une cytosine en thymine sans coupure double brin. Sur les douze sites testes par sequencage profond, le taux d edition hors cible reste sous le seuil de detection.',
  },
  {
    numero: '2.2',
    titre: 'Vecteurs lipidiques',
    texte:
      'Quatre formulations proprietaires, dont deux presentent un tropisme hepatique demontre chez le primate non humain apres injection unique. La cinetique d echange des apolipoproteines gouverne ce tropisme [4].',
  },
  {
    numero: '2.3',
    titre: 'Modeles patient',
    texte:
      'Une banque de 1 200 organoides derives de patients, appariee aux donnees cliniques. Tout candidat y est evalue avant tout passage chez l animal [3].',
  },
  {
    numero: '2.4',
    titre: 'Production clinique',
    texte:
      'Salle blanche de grade B a Nantes, certifiee bonnes pratiques de fabrication depuis 2023. Inspection ANSM de 2025 close sans ecart majeur.',
  },
]

/** Les publications, numerotees comme des references. */
const REFERENCES: readonly {
  readonly titre: string
  readonly auteurs: string
  readonly revue: string
  readonly annee: string
  readonly doi: string
}[] = [
  {
    titre:
      'Base editing of HBB restores adult hemoglobin in patient-derived erythroid progenitors',
    auteurs: 'Vasseur A., Kolb M., Ferreira L. et onze autres',
    revue: 'Nature Biotechnology',
    annee: '2026',
    doi: '10.1038/s41587-026-02114-8',
  },
  {
    titre:
      'Engineered regulatory T cells prevent renal allograft rejection in a humanized model',
    auteurs: 'Kolb M., Nseir H., Vasseur A. et sept autres',
    revue: 'Science Translational Medicine',
    annee: '2025',
    doi: '10.1126/scitranslmed.adk9917',
  },
  {
    titre:
      'A patient-derived organoid atlas of gastric adenocarcinoma predicts response to CLDN18.2 therapy',
    auteurs: 'Ferreira L., Bourdin C., Kolb M. et quatorze autres',
    revue: 'Cell Reports Medicine',
    annee: '2025',
    doi: '10.1016/j.xcrm.2025.101884',
  },
  {
    titre: 'Lipid nanoparticle tropism is governed by apolipoprotein exchange kinetics',
    auteurs: 'Bourdin C., Vasseur A.',
    revue: 'Journal of Controlled Release',
    annee: '2024',
    doi: '10.1016/j.jconrel.2024.06.031',
  },
]

/** Les notes, en pied, la ou d autres vitrines mettent un accordeon. */
const NOTES: readonly (readonly [string, string])[] = [
  [
    'a',
    'Tresorerie : la serie C de 190 millions close en septembre 2025 finance les operations jusqu au premier trimestre 2029, lecture de phase III comprise.',
  ],
  [
    'b',
    'Partenariats : les programmes en oncologie sont co-conduits avec un centre qui mene l essai. Aucun droit territorial n est cede avant la fin de phase II.',
  ],
  [
    'c',
    'Resultats negatifs : deux programmes arretes en 2024 — CYT-109 et CYT-211 — sont publies, et leurs donnees deposees sur le portail europeen des essais.',
  ],
  [
    'd',
    'Installations : laboratoire et salle blanche a Nantes ; chimie medicinale a Lyon. Aucune activite n est sous-traitee hors d Europe.',
  ],
]

/** Les recrutements en cours, pour les barres. */
const RECRUTEMENTS: readonly (readonly [string, string, number, number])[] = [
  ['CYT-101', 'Phase III — leucemie aigue lymphoblastique', 212, 300],
  ['CYT-114', 'Phase II — myelome multiple', 84, 84],
  ['CYT-208', 'Phase I — rejet de greffe renale', 6, 12],
  ['CYT-301', 'Phase I — drepanocytose', 2, 9],
]

/* ============================ Les figures ============================ */

/**
 * Vrai des que l element est entre dans le champ, et pour de bon.
 *
 * Les jauges et les figures de cette page se remplissent a l arrivee ; jouer
 * ce remplissage au montage, six ecrans plus haut, reviendrait a ne le montrer
 * a personne. L observateur se debranche des la premiere entree : une barre
 * qui se reremplit a chaque passage est une decoration, pas une mesure.
 */
function useVu<T extends Element>(): {
  readonly ref: RefObject<T | null>
  readonly vu: boolean
} {
  const ref = useRef<T>(null)
  const [vu, setVu] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (element === null || typeof IntersectionObserver === 'undefined') {
      setVu(true)
      return
    }
    const guetteur = new IntersectionObserver(
      (entrees) => {
        if (entrees.some((entree) => entree.isIntersecting)) {
          setVu(true)
          guetteur.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    guetteur.observe(element)
    return () => {
      guetteur.disconnect()
    }
  }, [])
  return { ref, vu }
}

/**
 * La part d encre d une aire therapeutique.
 *
 * Quatre teintes franches trahiraient la palette du modele : le selecteur de
 * la barre reteinte la vitrine entiere, et une aire peinte en bleu resterait
 * bleue sur une vitrine ambre. Les aires se distinguent donc par la densite de
 * la meme encre, qui suit la couleur choisie et le theme.
 */
const DENSITE_AIRE: Readonly<Record<Aire, number>> = {
  Oncologie: 1,
  'Auto-immun': 0.72,
  Rare: 0.46,
  Metabolique: 0.26,
}

/**
 * Figure 1 — la carte du pipeline.
 *
 * La table dit ce que chaque programme est ; elle ne montre pas la **forme**
 * du portefeuille : trois programmes en decouverte, un seul en phase III, et
 * les aires reparties sur toute la largeur. La carte le montre d un coup
 * d oeil, et suit le filtre pose au-dessus d elle.
 */
function CartePipeline({ aire }: { readonly aire: Aire | 'Toutes' }): ReactElement {
  const { ref, vu } = useVu<SVGSVGElement>()
  const { reduced } = useMotionState()
  const gris: CSSProperties = { color: 'var(--o-theme-muted)' }

  return (
    <svg
      ref={ref}
      viewBox="0 0 1000 275"
      aria-hidden="true"
      className="o-w-full"
      style={{ minWidth: 760 }}
    >
      {PHASES.map((phase, colonne) => {
        const centre = 100 + colonne * 200
        const dansLaPhase = PIPELINE.filter((p) => p.phase === phase)
        return (
          <g key={phase}>
            <text
              x={centre}
              y="30"
              textAnchor="middle"
              className="o-font-mono"
              fontSize="10.5"
              fill="currentColor"
              style={gris}
            >
              {dansLaPhase.length} programme{dansLaPhase.length > 1 ? 's' : ''}
            </text>

            {dansLaPhase.map((programme, rang) => {
              const y = 54 + rang * 56
              const x = centre - 85
              const retenu = aire === 'Toutes' || programme.aire === aire
              return (
                <g
                  key={programme.code}
                  style={{
                    opacity: vu ? (retenu ? 1 : 0.2) : 0,
                    transform: vu || reduced ? 'none' : 'translateY(12px)',
                    transition: reduced
                      ? 'opacity 200ms linear'
                      : `opacity 520ms ease ${String((colonne * 3 + rang) * 45)}ms, transform 620ms cubic-bezier(0.16, 1, 0.3, 1) ${String((colonne * 3 + rang) * 45)}ms`,
                  }}
                >
                  <rect
                    x={x}
                    y={y}
                    width="170"
                    height="42"
                    rx="8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.35"
                    style={gris}
                  />
                  <rect
                    x={x + 1}
                    y={y + 8}
                    width="4"
                    height="26"
                    rx="2"
                    fill={encre()}
                    opacity={DENSITE_AIRE[programme.aire]}
                  />
                  <text
                    x={x + 16}
                    y={y + 19}
                    className="o-font-mono"
                    fontSize="11.5"
                    fill="currentColor"
                  >
                    {programme.code}
                  </text>
                  <text
                    x={x + 16}
                    y={y + 33}
                    fontSize="10"
                    fill="currentColor"
                    style={gris}
                  >
                    {programme.cible}
                  </text>
                </g>
              )
            })}

            <text
              x={centre}
              y="244"
              textAnchor="middle"
              className="o-font-mono"
              fontSize="10.5"
              fill="currentColor"
            >
              {phase}
            </text>
          </g>
        )
      })}

      {/* L axe du developpement, et son sens. */}
      <line
        x1="15"
        y1="222"
        x2="985"
        y2="222"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
        style={gris}
      />
      {[200, 400, 600, 800].map((x) => (
        <path
          key={x}
          d={`M${String(x - 4)} 217l5 5-5 5`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.55"
          style={gris}
        />
      ))}
      <text
        x="985"
        y="266"
        textAnchor="end"
        className="o-font-mono"
        fontSize="10"
        fill="currentColor"
        style={gris}
      >
        sens du developpement
      </text>
    </svg>
  )
}

/**
 * Les deux programmes arretes, avec leurs quatre dates.
 *
 * En mois ecoules depuis janvier 2021 : l axe de la figure porte cinq ans.
 */
const ARRETS: readonly {
  readonly code: string
  readonly quoi: string
  readonly motif: string
  readonly ouvert: number
  readonly arrete: number
  readonly depose: number
  readonly paru: number
  readonly dates: string
}[] = [
  {
    code: 'CYT-109',
    quoi: 'Inhibiteur covalent de KRAS G12C — adenocarcinome pulmonaire',
    motif: 'Arrete pour futilite a l analyse intermediaire de phase II',
    ouvert: 2,
    arrete: 42,
    depose: 46,
    paru: 49,
    dates:
      'ouvert 03/2021 — arrete 07/2024 — donnees deposees 11/2024 — article paru 02/2025',
  },
  {
    code: 'CYT-211',
    quoi: 'Anticorps anti-IL-23 en application locale — psoriasis en plaques',
    motif: 'Arrete sur un signal de tolerance cutanee, sans evenement grave',
    ouvert: 20,
    arrete: 46,
    depose: 49,
    paru: 53,
    dates:
      'ouvert 09/2022 — arrete 11/2024 — donnees deposees 02/2025 — article paru 06/2025',
  },
]

/** Le nombre de mois portes par l axe des arrets, de janvier 2021 a janvier 2026. */
const MOIS_ARRETS = 60

/** L abscisse d un mois, dans le repere de la figure des arrets. */
function abscisseArret(mois: number): number {
  return 70 + (mois / MOIS_ARRETS) * 870
}

/**
 * Figure 3 — les deux arrets, dessines.
 *
 * Le manifeste affirme que les programmes arretes sont publies. La figure le
 * montre : la barre s arrete, et deux reperes suivent — le depot des donnees,
 * puis la parution. Les barres poussent a l arrivee dans le champ.
 */
function FigureArrets(): ReactElement {
  const { ref, vu } = useVu<SVGSVGElement>()
  const { reduced } = useMotionState()
  const gris: CSSProperties = { color: 'var(--o-theme-muted)' }

  return (
    <svg
      ref={ref}
      viewBox="0 0 1000 288"
      aria-hidden="true"
      className="o-w-full"
      style={{ minWidth: 720 }}
    >
      {ARRETS.map((ligne, rang) => {
        const y = 40 + rang * 104
        const debut = abscisseArret(ligne.ouvert)
        const large = abscisseArret(ligne.arrete) - debut
        return (
          <g key={ligne.code}>
            <text
              x={debut}
              y={y}
              className="o-font-mono"
              fontSize="12"
              fill="currentColor"
            >
              {ligne.code}
            </text>
            <text x={debut + 62} y={y} fontSize="12" fill="currentColor">
              {ligne.quoi}
            </text>
            <text x={debut} y={y + 16} fontSize="10.5" fill="currentColor" style={gris}>
              {ligne.motif}
            </text>

            {/* La course de l essai, jusqu a son arret. */}
            <rect
              x={debut}
              y={y + 26}
              width={large}
              height="10"
              rx="5"
              fill={encreSurSombre()}
              opacity="0.55"
              style={
                reduced
                  ? undefined
                  : {
                      transformBox: 'fill-box',
                      transformOrigin: 'left center',
                      transform: vu ? 'scaleX(1)' : 'scaleX(0)',
                      transition: `transform 1000ms cubic-bezier(0.16, 1, 0.3, 1) ${String(rang * 180)}ms`,
                    }
              }
            />
            {/* La croix de l arret. */}
            <path
              d={`M${String(debut + large - 6)} ${String(y + 25)}l12 12m0-12l-12 12`}
              stroke={encreSurSombre()}
              strokeWidth="2"
              strokeLinecap="round"
              opacity={vu || reduced ? 1 : 0}
              style={{ transition: 'opacity 400ms ease 900ms' }}
            />

            {/*
              Les deux reperes qui suivent l arret. Leurs legendes sont posees
              sur deux lignes : quatre mois d ecart sur l axe font trente pixels,
              et deux legendes centrees s y chevaucheraient.
            */}
            {(
              [
                [ligne.depose, 'donnees deposees'],
                [ligne.paru, 'article paru'],
              ] as const
            ).map(([mois, mot], marque) => (
              <g
                key={mot}
                opacity={vu || reduced ? 1 : 0}
                style={{
                  transition: `opacity 400ms ease ${String(1100 + marque * 160)}ms`,
                }}
              >
                <circle
                  cx={abscisseArret(mois)}
                  cy={y + 31}
                  r="4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <line
                  x1={abscisseArret(mois)}
                  y1={y + 36}
                  x2={abscisseArret(mois)}
                  y2={y + 44 + marque * 14}
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.4"
                  style={gris}
                />
                <text
                  x={abscisseArret(mois)}
                  y={y + 54 + marque * 14}
                  textAnchor="middle"
                  className="o-font-mono"
                  fontSize="9.5"
                  fill="currentColor"
                  style={gris}
                >
                  {mot}
                </text>
              </g>
            ))}
          </g>
        )
      })}

      {/* L axe, une graduation par annee. */}
      <line
        x1="70"
        y1="252"
        x2="940"
        y2="252"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.45"
        style={gris}
      />
      {[0, 12, 24, 36, 48, 60].map((mois) => (
        <g key={mois}>
          <line
            x1={abscisseArret(mois)}
            y1="252"
            x2={abscisseArret(mois)}
            y2="260"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.6"
            style={gris}
          />
          <text
            x={abscisseArret(mois)}
            y="276"
            textAnchor="middle"
            className="o-font-mono"
            fontSize="10"
            fill="currentColor"
            style={gris}
          >
            {2021 + mois / 12}
          </text>
        </g>
      ))}
    </svg>
  )
}

/* ============================ Le rendu ============================ */

/** Un champ souligne, l etiquette en mono au-dessus. */
function Champ({
  nom,
  type = 'text',
  sombre = false,
  multiligne = false,
}: {
  readonly nom: string
  readonly type?: string
  readonly sombre?: boolean
  readonly multiligne?: boolean
}): ReactElement {
  const classes = `o-w-full o-border-b o-bg-transparent o-py-3 o-text-base focus:o-ring ${sombre ? 'o-border-white-20 o-text-zinc-50' : 'o-border-zinc-300 dark:o-border-zinc-700 o-text-zinc-950 dark:o-text-zinc-50'}`
  return (
    <label className="o-block">
      <span
        className={`o-block o-font-mono o-text-xs o-uppercase o-tracking-widest ${sombre ? 'o-text-zinc-400' : 'o-text-zinc-500 dark:o-text-zinc-400'}`}
      >
        {nom}
      </span>
      {multiligne ? (
        <textarea
          name={nom}
          rows={3}
          className={classes}
          style={{ borderRadius: 0, resize: 'vertical' }}
        />
      ) : (
        <input type={type} name={nom} className={classes} style={{ borderRadius: 0 }} />
      )}
    </label>
  )
}

/**
 * La lettre : un formulaire en ligne, nom et courriel, et un disque pour
 * l envoyer. La vitrine n a pas de service : elle refuse une adresse
 * personnelle, parce que la lettre est reservee aux investisseurs.
 */
function Lettre(): ReactElement {
  const [etat, setEtat] = useState<'repos' | 'accepte' | 'refuse'>('repos')
  const envoyer = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    const donnees = new FormData(e.currentTarget)
    const adresse = String(donnees.get('courriel') ?? '')
    setEtat(/@(gmail|yahoo|hotmail|outlook)\./i.test(adresse) ? 'refuse' : 'accepte')
  }
  return (
    <form
      onSubmit={envoyer}
      className="o-mt-12 o-grid o-items-end o-gap-x-10 o-gap-y-8 md:o-grid-cols-12"
    >
      <label className="o-block md:o-col-span-4">
        <span className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
          Votre nom
        </span>
        <input
          type="text"
          name="nom"
          autoComplete="name"
          required
          className="o-w-full o-border-b o-border-zinc-900 dark:o-border-zinc-100 o-bg-transparent o-py-3 o-text-xl o-text-zinc-950 dark:o-text-zinc-50 focus:o-ring"
          style={{ borderRadius: 0 }}
        />
      </label>
      <label className="o-block md:o-col-span-6">
        <span className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
          Adresse professionnelle
        </span>
        <input
          type="email"
          name="courriel"
          autoComplete="email"
          required
          className="o-w-full o-border-b o-border-zinc-900 dark:o-border-zinc-100 o-bg-transparent o-py-3 o-text-xl o-text-zinc-950 dark:o-text-zinc-50 focus:o-ring"
          style={{ borderRadius: 0 }}
        />
      </label>
      <div className="md:o-col-span-2 md:o-justify-self-end">
        <button
          type="submit"
          aria-label="Recevoir la lettre"
          className="o-flex o-size-20 o-items-center o-justify-center o-rounded-full o-transition-transform hover:o-scale-105 focus:o-ring"
          style={aplat()}
        >
          <Icon icon={ArrowRight} size={26} aria-hidden="true" />
        </button>
      </div>
      <p
        aria-live="polite"
        className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest md:o-col-span-12"
        style={{ color: etat === 'refuse' ? 'var(--o-theme-muted)' : encre() }}
      >
        {etat === 'accepte' &&
          'Bien recu — la prochaine lettre part le lendemain du conseil de decembre.'}
        {etat === 'refuse' && 'La lettre est reservee aux adresses professionnelles.'}
        {etat === 'repos' &&
          'Quatre envois par an, aucun autre. Adresse jamais transmise.'}
      </p>
    </form>
  )
}

/** La table du pipeline : un pipeline se compare colonne par colonne. */
function TablePipeline({
  lignes,
}: {
  readonly lignes: readonly Programme[]
}): ReactElement {
  return (
    <div className="o-overflow-x-auto o-scrollbar dark:o-scrollbar-dark">
      <table
        className="o-w-full o-text-sm"
        style={{ minWidth: '44rem', borderCollapse: 'collapse' }}
      >
        <caption className="o-sr-only">
          Pipeline de developpement, par stade reglementaire
        </caption>
        <thead>
          <tr className="o-border-b o-border-zinc-900 dark:o-border-zinc-100">
            {['Code', 'Indication', 'Cible', 'Stade', 'Jalon annonce'].map((entete) => (
              <th
                key={entete}
                scope="col"
                className="o-py-2.5 o-pr-6 o-text-left o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
              >
                {entete}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lignes.map((p) => (
            <tr
              key={p.code}
              className="o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-align-top"
            >
              <th
                scope="row"
                className="o-py-3.5 o-pr-6 o-text-left o-font-mono o-text-xs o-font-semibold o-whitespace-nowrap"
                style={{ color: encre() }}
              >
                {p.code}
              </th>
              <td className="o-py-3.5 o-pr-6 o-font-medium o-text-zinc-950 dark:o-text-zinc-50">
                {p.indication}
                <span className="o-mt-0.5 o-block o-text-xs o-font-normal o-text-zinc-500 dark:o-text-zinc-400">
                  {p.aire}
                </span>
              </td>
              <td className="o-py-3.5 o-pr-6 o-font-mono o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
                {p.cible}
              </td>
              <td className="o-py-3.5 o-pr-6 o-whitespace-nowrap">
                <span className="o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-zinc-950 dark:o-text-zinc-50">
                  {p.phase}
                </span>
                <span className="o-mt-1.5 o-flex o-gap-0.5" aria-hidden="true">
                  {PHASES.map((etape, rang) => (
                    <span
                      key={etape}
                      className="o-h-1 o-w-4 o-rounded-full"
                      style={{
                        backgroundColor:
                          rang <= PHASES.indexOf(p.phase)
                            ? encre()
                            : 'var(--o-theme-line)',
                      }}
                    />
                  ))}
                </span>
              </td>
              <td className="o-py-3.5 o-text-zinc-600 dark:o-text-zinc-400">
                {p.jalon}
                {p.partenaire !== undefined && (
                  <span className="o-mt-1 o-block o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                    Avec {p.partenaire}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** La vitrine complete. */
export default function Page(): ReactElement {
  const polices = usePolices('onest')
  const [aire, setAire] = useState<Aire | 'Toutes'>('Toutes')
  const lignes = useMemo(
    () => PIPELINE.filter((p) => aire === 'Toutes' || p.aire === aire),
    [aire],
  )

  // La loupe de graisse a besoin des coupes intermediaires d Onest : la voix
  // n en charge que trois, on ajoute les autres ici.
  useEffect(
    () => loadGoogleFonts([{ family: 'Onest', weights: [300, 400, 500, 600, 700, 800] }]),
    [],
  )

  const parPhase = PHASES.map((phase) => ({
    phase,
    combien: PIPELINE.filter((p) => p.phase === phase).length,
  }))
  const teinte = { '--o-palette-brand-500': encre() } as CSSProperties

  // Les anneaux et les barres partent de zero et se remplissent quand la
  // section entre dans le champ : une jauge posee pleine ne dit pas qu elle
  // mesure quelque chose.
  const { reduced } = useMotionState()
  const jauges = useVu<HTMLDivElement>()
  const rempli = jauges.vu || reduced

  return (
    <Porte forme="compteur" marque="Cytea">
      <div
        className="o-bg-white dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-100"
        style={polices}
      >
        {/* ================= L ouverture : l helice, le titre, le HUD ===== */}
        <header
          className="o-relative o-isolate o-min-h-screen o-overflow-hidden"
          style={nuit('zinc')}
        >
          <DnaHelix
            className="o-absolute o-inset-0 o-z-0 o-pointer-events-none"
            turns={6}
            rpm={1.4}
            colors={['--o-theme-bg', '--o-vitrine-400', '--o-vitrine-700']}
            poster="o-bg-zinc-950"
          />
          <Voile sens="gauche" />
          <Grain />

          <BarreGelule
            marque="Cytea"
            liens={[
              ['#pipeline', 'Pipeline'],
              ['#methode', 'Methode'],
              ['#references', 'Publications'],
              ['#lettre', 'La lettre'],
            ]}
            action={['#references', 'Lire les articles']}
          />

          <div className="o-relative o-z-10 o-mx-auto o-grid o-min-h-screen o-max-w-7xl o-items-center o-gap-10 o-px-6 o-pb-24 o-pt-32 md:o-px-10 lg:o-grid-cols-12">
            <div className="o-min-w-0 lg:o-col-span-7">
              <Surgit>
                <Etiquette>Edition de base — Nantes et Lyon</Etiquette>
              </Surgit>
              <TitreVague
                delai={120}
                className="o-m-0 o-mt-7 o-max-w-3xl o-text-zinc-50"
                style={affiche('l', 300)}
              >
                Une lettre du genome, corrigee sans couper le brin.
              </TitreVague>
              <Surgit
                delai={460}
                as="p"
                className="o-m-0 o-mt-7 o-max-w-lg o-text-lg o-leading-relaxed o-text-zinc-300"
              >
                Douze programmes, du criblage a la phase III. Deux ont ete arretes en 2024
                : ils sont publies, avec leurs donnees.
              </Surgit>
              <Surgit delai={580} className="o-mt-9">
                <Actions
                  pleine={[
                    '#pipeline',
                    <>
                      Lire le pipeline{' '}
                      <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#references', 'Les quarante-deux articles']}
                />
              </Surgit>
            </div>

            {/* Le HUD de tresorerie, en verre — Vesper. */}
            <Surgit
              delai={300}
              className={`${verre(true)} o-min-w-0 o-p-6 lg:o-col-span-5`}
            >
              <p className="o-m-0 o-flex o-items-center o-justify-between o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                Tresorerie{' '}
                <span style={{ color: encreSurSombre() }}>Serie C — 09.2025</span>
              </p>
              <p
                className="o-m-0 o-mt-4 o-flex o-items-baseline o-gap-3 o-text-zinc-50"
                style={{ ...affiche('l', 300), fontSize: 'clamp(3rem, 6vw, 5.5rem)' }}
              >
                <CounterRoll value={190} locale="fr-FR" />
                <span className="o-text-base o-font-normal o-text-zinc-400">M EUR</span>
              </p>
              <p className="o-m-0 o-mt-3 o-text-sm o-leading-relaxed o-text-zinc-300">
                Finance les operations jusqu au premier trimestre 2029, lecture de phase
                III comprise. Aucune levee n est prevue avant.
              </p>
              <dl className="o-m-0 o-mt-5 o-grid o-grid-cols-2 o-gap-x-5 o-gap-y-4 o-border-t o-border-white-10 o-pt-5">
                {(
                  [
                    ['Horizon', 'T1 2029'],
                    ['Effectif', '112 personnes'],
                    ['Sites', 'Nantes, Lyon'],
                    ['Salle blanche', 'Grade B, BPF 2023'],
                  ] as const
                ).map(([quoi, valeur]) => (
                  <div key={quoi}>
                    <dt className="o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-zinc-400">
                      {quoi}
                    </dt>
                    <dd className="o-m-0 o-mt-1 o-text-sm o-text-zinc-100">{valeur}</dd>
                  </div>
                ))}
              </dl>
            </Surgit>
          </div>
          <Coin position="bg">Releve du 9 septembre 2026</Coin>
          <Coin position="bd">RCS Nantes 842 119 006</Coin>
        </header>

        <main>
          {/* ================= (01) Le pipeline, en chapitre : le titre s epaissit sous le pointeur ===== */}
          <div
            id="pipeline"
            className="o-scroll-mt-24 o-mx-auto o-max-w-7xl o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          >
            {/* Le titre du chapitre, en trois lignes : chacune s epaissit sous le pointeur. */}
            <h2
              className="o-m-0 o-mb-14 o-text-zinc-950 dark:o-text-zinc-50"
              style={{ ...affiche('l', 300), fontSize: 'clamp(1.75rem, 5vw, 4.5rem)' }}
            >
              {(['Douze programmes,', 'du criblage', 'a la phase III.'] as const).map(
                (ligne) => (
                  <VariableProximity
                    key={ligne}
                    as="span"
                    rayon={160}
                    graisseBasse={300}
                    graisseHaute={800}
                    className="o-block"
                  >
                    {ligne}
                  </VariableProximity>
                ),
              )}
            </h2>
            <Chapitre
              indice="(01) — Pipeline"
              largeur={4}
              titre={
                <p className="o-m-0 o-text-lg o-font-medium o-tracking-tight o-text-zinc-950 dark:o-text-zinc-50">
                  Table 1 — le pipeline au 9 septembre 2026
                </p>
              }
              texte="Un programme n avance dans cette table qu apres decision du comite de developpement, jamais sur une lecture intermediaire. Approchez le pointeur du titre : la graisse suit la main, comme la lecture."
            >
              <div
                role="group"
                aria-label="Filtrer par aire"
                className="o-flex o-flex-wrap o-gap-2"
              >
                {(['Toutes', ...AIRES] as const).map((option) => {
                  const actif = aire === option
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={actif}
                      onClick={() => {
                        setAire(option)
                      }}
                      className={`o-rounded-full o-border-w-1 o-px-3 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-transition-colors focus:o-ring ${actif ? 'o-border-transparent' : 'o-border-zinc-300 dark:o-border-zinc-700 o-text-zinc-600 dark:o-text-zinc-400 hover:o-text-zinc-950 dark:hover:o-text-zinc-50'}`}
                      style={actif ? aplat() : undefined}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
              <div className="o-mt-6">
                <TablePipeline lignes={lignes} />
              </div>
              <p
                aria-live="polite"
                className="o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
              >
                {lignes.length} programme{lignes.length > 1 ? 's' : ''} sur{' '}
                {PIPELINE.length} — les jalons sont ceux communiques
              </p>
            </Chapitre>

            {/*
              La carte : la table dit ce que chaque programme est, la figure dit
              la forme du portefeuille. Elle suit le meme filtre, pose au-dessus.
            */}
            <figure className="o-m-0 o-mt-20 o-grid o-gap-10 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-pt-12 lg:o-grid-cols-12">
              <figcaption className="lg:o-col-span-3">
                <span
                  className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest"
                  style={{ color: encre() }}
                >
                  Figure 1
                </span>
                <span className="o-mt-3 o-block o-text-xl o-font-medium o-tracking-tight o-text-zinc-950 dark:o-text-zinc-50">
                  La carte du pipeline
                </span>
                <span className="o-mt-3 o-block o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                  Les douze programmes ranges par stade, du criblage a la phase III. La
                  densite de l encre donne l aire ; le filtre pose au-dessus de la table
                  agit aussi ici.
                </span>
                <ul className="o-m-0 o-mt-6 o-flex o-list-none o-flex-col o-gap-2 o-p-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
                  {AIRES.map((nom) => (
                    <li key={nom} className="o-flex o-items-center o-gap-3">
                      <span
                        aria-hidden="true"
                        className="o-block o-h-3 o-w-1 o-rounded-full"
                        style={{ backgroundColor: encre(), opacity: DENSITE_AIRE[nom] }}
                      />
                      {nom}
                    </li>
                  ))}
                </ul>
              </figcaption>
              <div className="o-min-w-0 o-overflow-x-auto o-pb-2 lg:o-col-span-9">
                <CartePipeline aire={aire} />
              </div>
            </figure>
          </div>

          {/* ================= La figure 2, pleine largeur, decouverte par bandes ===== */}
          <figure
            id="figure"
            className="o-m-0 o-relative o-isolate o-overflow-hidden"
            style={nuit('zinc')}
          >
            <RevealMask bands={6} step={70} color="var(--o-palette-zinc-950)">
              <img
                src={photo('cytea-mitose', 1600, 700)}
                alt="Cellules LLC-PK1 en mitose, noyaux marques en rouge et fuseau en vert"
                className="o-w-full o-object-cover"
                style={{ height: 'min(70vh, 34rem)' }}
              />
            </RevealMask>
            <figcaption className="o-flex o-flex-wrap o-items-baseline o-gap-x-3 o-gap-y-1 o-border-t o-border-zinc-800 o-px-6 o-py-4 o-font-mono o-text-xs md:o-px-10">
              <span
                className="o-flex o-items-center o-gap-2 o-font-semibold"
                style={{ color: encreSurSombre() }}
              >
                <Icon icon={Microscope} size={13} aria-hidden="true" />
                Figure 2
              </span>
              <span className="o-text-zinc-400">
                Cellules en division, marquage du fuseau mitotique. Microscopie de
                fluorescence ; barre d echelle de 20 micrometres a l image.
              </span>
            </figcaption>
          </figure>

          {/* ================= (02) La methode, en chapitre, avec deux photos qui se decouvrent ===== */}
          <div
            id="methode"
            className="o-scroll-mt-24 o-mx-auto o-max-w-7xl o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          >
            <Chapitre
              indice="(02) — Methode"
              largeur={4}
              titre={
                <h2
                  className="o-m-0 o-text-zinc-950 dark:o-text-zinc-50"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 3.6vw, 3.5rem)' }}
                >
                  Ce qu on fait, et comment on le verifie.
                </h2>
              }
              texte="Quatre paragraphes, numerotes comme une section de materiel et methodes. Les references entre crochets renvoient au chapitre suivant."
            >
              <ol className="o-m-0 o-list-none o-p-0">
                {METHODE.slice(0, 2).map((bloc) => (
                  <li
                    key={bloc.numero}
                    className="o-grid o-gap-x-6 o-gap-y-2 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-py-7 sm:o-grid-cols-12"
                  >
                    <p
                      className="o-m-0 o-font-mono o-text-xs o-tabular-nums sm:o-col-span-2"
                      style={{ color: encre() }}
                    >
                      {bloc.numero}
                    </p>
                    <div className="sm:o-col-span-10">
                      <h3 className="o-m-0 o-text-xl o-font-medium o-tracking-tight o-text-zinc-950 dark:o-text-zinc-50">
                        {bloc.titre}
                      </h3>
                      <p className="o-m-0 o-mt-2 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                        {bloc.texte}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              {/* Deux photos decalees, decouvertes au defilement. */}
              <div className="o-my-10 o-grid o-gap-6 sm:o-grid-cols-12">
                <figure className="o-m-0 sm:o-col-span-7">
                  <ScrollRevealImage
                    src={photo('cytea-cellules', 900, 600)}
                    alt="Cellules humaines en microscopie de fluorescence, cytosquelette marque"
                    ratio={1.5}
                    direction="up"
                    span={0.45}
                  />
                  <figcaption className="o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    Organoide, marquage du cytosquelette
                  </figcaption>
                </figure>
                <figure className="o-m-0 sm:o-col-span-5 sm:o-mt-20">
                  <ScrollRevealImage
                    src={photo('cytea-paillasse', 900, 600)}
                    alt="Poste de securite microbiologique, manipulation sous hotte"
                    ratio={0.9}
                    direction="left"
                    span={0.45}
                  />
                  <figcaption className="o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    Salle blanche, Nantes
                  </figcaption>
                </figure>
              </div>

              <ol className="o-m-0 o-list-none o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-p-0">
                {METHODE.slice(2).map((bloc) => (
                  <li
                    key={bloc.numero}
                    className="o-grid o-gap-x-6 o-gap-y-2 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-py-7 sm:o-grid-cols-12"
                  >
                    <p
                      className="o-m-0 o-font-mono o-text-xs o-tabular-nums sm:o-col-span-2"
                      style={{ color: encre() }}
                    >
                      {bloc.numero}
                    </p>
                    <div className="sm:o-col-span-10">
                      <h3 className="o-m-0 o-text-xl o-font-medium o-tracking-tight o-text-zinc-950 dark:o-text-zinc-50">
                        {bloc.titre}
                      </h3>
                      <p className="o-m-0 o-mt-2 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                        {bloc.texte}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Chapitre>
          </div>

          {/* ================= (03) Les references, en chapitre ===== */}
          <div
            id="references"
            className="o-scroll-mt-24 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <Chapitre
                indice="(03) — References"
                largeur={4}
                titre={
                  <h2
                    className="o-m-0 o-text-zinc-950 dark:o-text-zinc-50"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(2rem, 3.6vw, 3.5rem)',
                    }}
                  >
                    Quarante-deux articles, tous en acces ouvert.
                  </h2>
                }
                texte={
                  <>
                    Les quatre plus cites sont ici ; la liste complete est deposee sur
                    HAL.
                    <a
                      href="#references"
                      className="o-mt-4 o-flex o-items-center o-gap-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-no-underline focus:o-ring"
                      style={{ color: encre() }}
                    >
                      La liste sur HAL{' '}
                      <Icon icon={ArrowUpRight} size={12} aria-hidden="true" />
                    </a>
                  </>
                }
              >
                <ol className="o-m-0 o-list-none o-p-0">
                  {REFERENCES.map((ref, rang) => (
                    <li
                      key={ref.doi}
                      className="o-grid o-gap-x-6 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-py-6 sm:o-grid-cols-12"
                    >
                      <p
                        className="o-m-0 o-font-mono o-text-sm o-tabular-nums sm:o-col-span-2"
                        style={{ color: encre() }}
                      >
                        [{rang + 1}]
                      </p>
                      <div className="sm:o-col-span-10">
                        <p className="o-m-0 o-text-lg o-font-medium o-leading-snug o-text-zinc-950 dark:o-text-zinc-50">
                          {ref.titre}
                        </p>
                        <p className="o-m-0 o-mt-2 o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
                          {ref.auteurs}. <span className="o-italic">{ref.revue}</span>,{' '}
                          {ref.annee}.
                        </p>
                        <p className="o-m-0 o-mt-2 o-inline-flex o-items-center o-gap-1.5 o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                          <Icon icon={ExternalLink} size={11} aria-hidden="true" />
                          {ref.doi}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Chapitre>
            </div>
          </div>

          {/* ================= Le manifeste, moitie eteint, signe ===== */}
          <section
            aria-label="Ce que la societe promet"
            className="o-mx-auto o-max-w-7xl o-px-6 o-py-24 md:o-px-10 md:o-py-36"
          >
            <div className="o-grid o-gap-8 md:o-grid-cols-12">
              <div className="md:o-col-span-10 md:o-col-start-3">
                <Manifeste
                  sombre={false}
                  eteint="Une societe qui ne montre que ses reussites demande qu on la croie sur parole ;"
                >
                  nous preferons qu on nous relise. Deux programmes arretes en 2024,
                  publies avec leurs donnees.
                </Manifeste>
                <p className="o-m-0 o-mt-8 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  Marion Kolb — directrice scientifique, cofondatrice
                </p>
              </div>
            </div>
          </section>

          {/* ================= La coupe : ce qui a ete arrete =================
              Une bande sombre au milieu d une page claire, et la seule figure
              qui defende le manifeste juste au-dessus : les deux programmes
              arretes, leur date d arret et ce qui en a ete publie. */}
          <section
            aria-labelledby="arrets-titre"
            className="o-relative o-isolate o-overflow-hidden o-px-6 o-py-24 o-text-zinc-50 md:o-px-10 md:o-py-32"
            style={nuit('zinc')}
          >
            <Grain />
            <div className="o-relative o-z-10 o-mx-auto o-grid o-max-w-7xl o-gap-10 lg:o-grid-cols-12">
              <div className="lg:o-col-span-4">
                <p
                  className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                  style={{ color: encreSurSombre() }}
                >
                  Figure 3
                </p>
                <h2
                  id="arrets-titre"
                  className="o-m-0 o-mt-6 o-max-w-md o-text-zinc-50"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 3.6vw, 3.5rem)' }}
                >
                  Deux arrets, et ce qui en est sorti.
                </h2>
                <p className="o-m-0 o-mt-6 o-max-w-sm o-text-base o-leading-relaxed o-text-zinc-300">
                  CYT-109 et CYT-211 ont ete stoppes en 2024. Les donnees des deux essais
                  sont deposees sur le portail europeen, et les deux articles sont parus —
                  c est la seule preuve qu une phrase de manifeste puisse avoir.
                </p>
              </div>

              <figure className="o-m-0 o-min-w-0 lg:o-col-span-8">
                <div className="o-overflow-x-auto o-pb-2">
                  <FigureArrets />
                </div>
                <ul className="o-sr-only">
                  {ARRETS.map((ligne) => (
                    <li key={ligne.code}>
                      {ligne.code} — {ligne.quoi}. {ligne.motif}. {ligne.dates}.
                    </li>
                  ))}
                </ul>
                <figcaption className="o-mt-6 o-border-t o-border-white-10 o-pt-4 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-400">
                  Figure 3 — les deux programmes arretes, de leur ouverture a la parution
                  de leurs donnees. Le trait s arrete a la decision du comite ; les deux
                  reperes qui suivent sont le depot et l article.
                </figcaption>
              </figure>
            </div>
          </section>

          {/* ================= (04) Les jauges : ou en est chaque programme ===== */}
          <section
            aria-labelledby="jauges-titre"
            className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <Indice rang="04" sombre={false}>
                Ou en est chaque programme
              </Indice>
              <h2
                id="jauges-titre"
                className="o-m-0 o-mt-6 o-max-w-3xl o-text-zinc-950 dark:o-text-zinc-50"
                style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 3.6vw, 3.5rem)' }}
              >
                Douze programmes, cinq stades, quatre essais qui recrutent.
              </h2>

              <div ref={jauges.ref} className="o-mt-14 o-grid o-gap-14 lg:o-grid-cols-12">
                {/* Les anneaux : la part du pipeline a chaque stade. */}
                <ul
                  className="o-m-0 o-grid o-list-none o-grid-cols-2 o-gap-8 o-p-0 sm:o-grid-cols-3 lg:o-col-span-7 lg:o-grid-cols-5"
                  style={teinte}
                >
                  {parPhase.map(({ phase, combien }) => (
                    <li key={phase} className="o-flex o-flex-col o-items-start o-gap-3">
                      <ProgressRing
                        value={rempli ? Math.round((combien / PIPELINE.length) * 100) : 0}
                        size={108}
                        thickness={5}
                        label={`${phase} : ${String(combien)} programmes sur ${String(PIPELINE.length)}`}
                      />
                      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-950 dark:o-text-zinc-50">
                        {phase}
                      </p>
                      <p className="o-m-0 o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
                        {combien} programme{combien > 1 ? 's' : ''}
                      </p>
                    </li>
                  ))}
                </ul>

                {/* Les barres : les recrutements en cours. */}
                <ul className="o-m-0 o-list-none o-p-0 lg:o-col-span-5">
                  {RECRUTEMENTS.map(([code, quoi, inclus, cible], rang) => {
                    const part = Math.round((inclus / cible) * 100)
                    return (
                      <li
                        key={code}
                        className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-py-4"
                      >
                        <div className="o-flex o-items-baseline o-justify-between o-gap-4">
                          <span
                            className="o-font-mono o-text-xs o-font-semibold"
                            style={{ color: encre() }}
                          >
                            {code}
                          </span>
                          <span className="o-font-mono o-text-xs o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50">
                            {inclus} / {cible} patients
                          </span>
                        </div>
                        <p className="o-m-0 o-mt-1 o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
                          {quoi}
                        </p>
                        <div
                          role="progressbar"
                          aria-label={`${code}, recrutement`}
                          aria-valuenow={part}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          className="o-mt-3 o-h-1.5 o-w-full o-overflow-hidden o-rounded-full"
                          style={{ backgroundColor: 'var(--o-theme-line)' }}
                        >
                          <div
                            className="o-h-full o-rounded-full"
                            style={{
                              width: `${String(rempli ? part : 0)}%`,
                              backgroundColor: encre(),
                              transition: reduced
                                ? undefined
                                : `width 1000ms cubic-bezier(0.16, 1, 0.3, 1) ${String(rang * 140)}ms`,
                            }}
                          />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </section>

          {/* ================= (05) La lettre : un formulaire en ligne, un disque ===== */}
          <section
            id="lettre"
            aria-labelledby="lettre-titre"
            className="o-scroll-mt-24 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-24 md:o-px-10 md:o-py-36"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <Reveal>
                <Indice rang="05" sombre={false}>
                  La lettre aux investisseurs
                </Indice>
                <h2
                  id="lettre-titre"
                  className="o-m-0 o-mt-6 o-max-w-4xl o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('l', 300),
                    fontSize: 'clamp(2.5rem, 5.5vw, 5.5rem)',
                  }}
                >
                  Une lettre par trimestre, le lendemain du conseil.
                </h2>
                <p className="o-m-0 o-mt-6 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                  Ce qui a avance, ce qui a glisse, et pourquoi. Les lectures d essai y
                  figurent le jour ou elles sont connues, favorables ou non.
                </p>
              </Reveal>
              <Lettre />
            </div>
          </section>
        </main>

        {/* ================= Le pied noir : le contact integre, les notes ===== */}
        <footer
          className="o-px-6 o-pb-8 o-pt-20 o-text-zinc-50 md:o-px-10"
          style={nuit('zinc')}
        >
          <div className="o-mx-auto o-max-w-7xl">
            <div className="o-grid o-gap-16 lg:o-grid-cols-12">
              <div className="lg:o-col-span-5">
                <p
                  className="o-m-0 o-text-zinc-50"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 3.6vw, 3.5rem)' }}
                >
                  Cytea
                </p>
                <p className="o-m-0 o-mt-4 o-max-w-sm o-text-sm o-leading-relaxed o-text-zinc-400">
                  9 quai Moncousu, 44000 Nantes — 14 rue Bellecordiere, 69002 Lyon. Aucune
                  activite n est sous-traitee hors d Europe.
                </p>
                <ol className="o-m-0 o-mt-10 o-list-none o-border-t o-border-white-10 o-p-0">
                  {NOTES.map(([rang, texte]) => (
                    <li
                      key={rang}
                      className="o-grid o-grid-cols-12 o-gap-3 o-border-b o-border-white-10 o-py-3"
                    >
                      <span
                        className="o-col-span-1 o-font-mono o-text-xs"
                        style={{ color: encreSurSombre() }}
                      >
                        ({rang})
                      </span>
                      <span className="o-col-span-11 o-text-xs o-leading-relaxed o-text-zinc-400">
                        {texte}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="lg:o-col-span-6 lg:o-col-start-7">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                  Nous ecrire — partenariats, investisseurs, recrutement
                </p>
                <form
                  className="o-mt-8 o-grid o-gap-8 sm:o-grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                  }}
                >
                  <Champ nom="Votre nom" sombre />
                  <Champ nom="Votre organisation" sombre />
                  <div className="sm:o-col-span-2">
                    <Champ nom="Votre message" sombre multiligne />
                  </div>
                  <div className="o-flex o-items-center o-gap-6 sm:o-col-span-2">
                    <button
                      type="submit"
                      className="o-inline-flex o-items-center o-gap-2 o-px-6 o-py-3 o-text-sm o-font-semibold o-transition-transform hover:o-scale-105 focus:o-ring"
                      style={{
                        backgroundColor: encreSurSombre(),
                        color: 'var(--o-palette-zinc-950)',
                        borderRadius: 0,
                      }}
                    >
                      Envoyer <Icon icon={ArrowUpRight} size={16} aria-hidden="true" />
                    </button>
                    <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                      Reponse sous cinq jours ouvres
                    </span>
                  </div>
                </form>
                <dl className="o-m-0 o-mt-10 o-grid o-gap-x-8 o-gap-y-4 o-border-t o-border-white-10 o-pt-6 sm:o-grid-cols-3">
                  {(
                    [
                      ['Investisseurs', 'investisseurs@cytea.fr'],
                      ['Partenariats', 'partenariats@cytea.fr'],
                      ['Recrutement', 'recrutement@cytea.fr'],
                    ] as const
                  ).map(([quoi, ou]) => (
                    <div key={quoi}>
                      <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                        {quoi}
                      </dt>
                      <dd className="o-m-0 o-mt-1 o-text-sm o-text-zinc-200">{ou}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            <p className="o-m-0 o-mt-16 o-border-t o-border-white-10 o-pt-5 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
              © 2026 Cytea SA au capital de 4 812 000 EUR — RCS Nantes 842 119 006 — les
              produits candidats cites n ont recu aucune autorisation de mise sur le
              marche.
            </p>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
