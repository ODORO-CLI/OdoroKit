/**
 * Bobine — la plateforme video des editeurs.
 *
 * ## Le parti pris : une affiche, puis un banc de montage
 *
 * Une plateforme video se vend d ordinaire par une grille de fonctions et un
 * tableau de tarifs. Celle-ci ouvre comme une affiche — le mot-marque extrude
 * par-dessus un spectre audio, et rien d autre — puis elle donne le seul objet
 * qui compte : **la frise de lecture**, avec ses chapitres et le poids reel de
 * chaque qualite.
 *
 * ## Le mecanisme : le chapitrage, et le poids
 *
 * Neuf chapitres ecrits a la main pour un film de quarante-deux minutes. On en
 * choisit un sur la frise ; en meme temps, un curseur porte le debit dont
 * dispose le spectateur. La page applique alors la regle que suit tout lecteur
 * a debit adaptatif — prendre la plus haute qualite dont le debit tient sous
 * les trois quarts de la bande disponible — et en tire le reste par de
 * l arithmetique honnete : le poids du chapitre, celui du film entier, le
 * temps de mise en memoire tampon, et le delai avant la premiere image.
 *
 * La forme de chiffres de la page est cette **echelle verticale graduee** : les
 * sept qualites y sont posees a leur debit, et la valeur retenue s y inscrit.
 *
 * ## Le rythme
 *
 * Sa signature est **M-rail** : la chaine d encodage se parcourt de cote,
 * station par station, pendant qu on descend. Autour, les ecarts habituels —
 * une figure numerotee qui dessine la segmentation et le changement de qualite
 * en cours de lecture, une **bande claire** qui coupe la page sombre et ne
 * porte qu une phrase, et un bouton unique qui occupe toute la largeur.
 *
 * ## La palette
 *
 * Rien n est ecrit en rouge. La page lit `--o-vitrine-*`. Elle est sombre dans
 * les deux themes : `nuit()` la declare, et `encreSurSombre()` donne l encre.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { Clapperboard, Download, Gauge, Play, Subtitles } from '@odoro-cli/icons/filaire'
import { useMemo, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { AudioBars } from '@/odoro/background/AudioBars.jsx'
import { GradualBlur } from '@/odoro/effect/GradualBlur.jsx'
import { DepthText } from '@/odoro/text/DepthText.jsx'
import { ElasticSlider } from '@/odoro/ui/ElasticSlider.jsx'
import { useInView } from '@/odoro/hooks/useInView'
import { useMotionState } from '@odoro-cli/engine'

import { nuit } from './communs.jsx'
import { accent, accentDoux, encreSurSombre } from './palettes.js'
import {
  affiche,
  BarreGelule,
  Coin,
  Etiquette,
  Grain,
  Numerotee,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Rail } from './scene.jsx'

/* ------------------------------------------------------------------------ */
/*                               Les encres                                 */
/* ------------------------------------------------------------------------ */

/** Le filet de la page sombre. */
const FILET = 'color-mix(in oklab, #ffffff 15%, transparent)'

/** Le filet de la bande claire. */
const FILET_JOUR = 'color-mix(in oklab, #000000 15%, transparent)'

/** L encre d accent, sur une page sombre dans les deux themes. */
const ENCRE = encreSurSombre()

/**
 * Le jour d une bande.
 *
 * Le pendant de `nuit()` : une bande claire au milieu d une page sombre dans
 * les deux themes. Les variables du theme sont redeclarees, et non des classes
 * posees en dur, pour que ce qui tombe la-dedans se peigne en clair tout seul.
 */
const JOUR = {
  colorScheme: 'light',
  backgroundColor: 'var(--o-theme-bg)',
  color: 'var(--o-theme-fg)',
  '--o-theme-bg': 'var(--o-palette-zinc-50)',
  '--o-theme-surface': 'var(--o-palette-zinc-100)',
  '--o-theme-fg': 'var(--o-palette-zinc-950)',
  '--o-theme-muted': 'var(--o-palette-zinc-600)',
  '--o-theme-line': 'var(--o-palette-zinc-300)',
} as CSSProperties

/** Les rubriques de la barre. */
const LIENS = [
  ['#frise', 'La frise'],
  ['#segments', 'Les segments'],
  ['#chaine', 'La chaine'],
  ['#livraison', 'Ce qui part'],
] as const

/* ------------------------------------------------------------------------ */
/*                       Le film, et ses neuf chapitres                     */
/* ------------------------------------------------------------------------ */

/** Un chapitre du film. */
interface Chapitre {
  readonly rang: number
  readonly titre: string
  /** Debut, en secondes depuis l origine. */
  readonly debut: number
  /** Duree, en secondes. */
  readonly duree: number
  readonly note: string
}

/**
 * Les neuf chapitres d un film de quarante-deux minutes.
 *
 * Les durees sont ecrites a la main et s additionnent exactement : deux mille
 * cinq cent trente-huit secondes, soit 42:18. Tout ce que la page calcule part
 * de ces nombres-la, et d aucun autre.
 */
const CHAPITRES: readonly Chapitre[] = [
  { rang: 1, titre: 'Generique', debut: 0, duree: 48, note: 'Carton, titre, mention du fonds de soutien.' },
  { rang: 2, titre: 'Le chiffon et la cuve', debut: 48, duree: 372, note: 'Le tri des chiffons, le pourrissoir, la pile a maillets.' },
  { rang: 3, titre: 'La forme et le vergeur', debut: 420, duree: 330, note: 'Le geste de puise, l egouttage, la marque du filigrane.' },
  { rang: 4, titre: 'Le couchage', debut: 750, duree: 258, note: 'La feuille passe de la forme au feutre, sans un pli.' },
  { rang: 5, titre: 'La presse', debut: 1008, duree: 426, note: 'La porse, les six tours de vis, l eau qui part.' },
  { rang: 6, titre: 'Le sechoir', debut: 1434, duree: 312, note: 'Les cordes de crin, quatre jours a l ombre.' },
  { rang: 7, titre: 'L encollage', debut: 1746, duree: 276, note: 'La gelatine, le bain, l essorage a la main.' },
  { rang: 8, titre: 'Le calandrage', debut: 2022, duree: 324, note: 'Le lissage au marteau, puis au cylindre.' },
  { rang: 9, titre: 'Le tri et la signature', debut: 2346, duree: 192, note: 'Les feuilles fautives partent au rebut, les autres au paquet.' },
]

/** La duree du film, en secondes. */
const DUREE = CHAPITRES.reduce((somme, c) => somme + c.duree, 0)

/** Un temps en secondes, ecrit en minutes et secondes. */
function horloge(secondes: number): string {
  const m = Math.floor(secondes / 60)
  const s = Math.round(secondes % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/* ------------------------------------------------------------------------ */
/*                        L echelle des qualites (C15)                      */
/* ------------------------------------------------------------------------ */

/** Une qualite de l echelle d encodage. */
interface Qualite {
  readonly nom: string
  readonly definition: string
  /** Debit video, en megabits par seconde. */
  readonly debit: number
}

/**
 * Les sept qualites produites pour chaque depot.
 *
 * L echelle n est pas geometrique par coquetterie : entre deux barreaux, le
 * debit double presque, parce qu en dessous le lecteur passerait son temps a
 * changer de qualite pour un gain que personne ne voit.
 */
const QUALITES: readonly Qualite[] = [
  { nom: '240p', definition: '426 x 240', debit: 0.4 },
  { nom: '360p', definition: '640 x 360', debit: 0.8 },
  { nom: '480p', definition: '854 x 480', debit: 1.4 },
  { nom: '720p', definition: '1280 x 720', debit: 3 },
  { nom: '1080p', definition: '1920 x 1080', debit: 6 },
  { nom: '1440p', definition: '2560 x 1440', debit: 9.5 },
  { nom: '2160p', definition: '3840 x 2160', debit: 16 },
]

/** Le debit de la piste sonore, en megabits par seconde. */
const SON = 0.128

/** Le haut de l echelle verticale, en megabits par seconde. */
const ECHELLE_HAUT = 18

/**
 * La qualite qu un lecteur choisirait, au debit donne.
 *
 * La regle est celle de tous les lecteurs a debit adaptatif : garder un quart
 * de marge, parce qu une bande passante mesuree sur les dernieres secondes ne
 * dit rien de la seconde suivante. Sous le premier barreau, on prend quand
 * meme le plus bas : mieux vaut une image degradee qu une roue qui tourne.
 */
function qualitePour(debit: number): Qualite {
  const plafond = debit * 0.75
  let retenue = QUALITES[0] as Qualite
  for (const qualite of QUALITES) {
    if (qualite.debit + SON <= plafond) retenue = qualite
  }
  return retenue
}

/** Un poids en megaoctets, ecrit a la francaise. */
function mega(valeur: number): string {
  return `${valeur.toFixed(valeur < 100 ? 1 : 0).replace('.', ',')} Mo`
}

/** Un nombre a une decimale, a la francaise. */
function une(valeur: number): string {
  return valeur.toFixed(1).replace('.', ',')
}

/* ------------------------------------------------------------------------ */
/*                       La vignette dessinee d un chapitre                 */
/* ------------------------------------------------------------------------ */

/**
 * La vignette d un chapitre, dessinee.
 *
 * Aucune photographie ne conviendrait : le film est invente, et une image de
 * banque au sujet approchant vaudrait moins que rien. C est donc une image de
 * pellicule — perforations, fenetre, numero de plan — et un motif propre au
 * chapitre, trace au trait.
 */
function Vignette({ chapitre }: { readonly chapitre: Chapitre }): ReactElement {
  const trait = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4 } as const
  const motifs: readonly ReactNode[] = [
    <g key="m1" {...trait}>
      <circle cx="160" cy="90" r="34" />
      <path d="M146 74v32l28-16z" />
    </g>,
    <g key="m2" {...trait}>
      <path d="M96 116h128l-14 34H110z" />
      <path d="M110 116c0-22 18-28 50-28s50 6 50 28" />
      <path d="M132 70c10 8 26 8 36 0M164 62c8 7 22 7 30 0" />
    </g>,
    <g key="m3" {...trait}>
      <path d="M92 70h136v72H92z" />
      {[110, 128, 146, 164, 182, 200].map((x) => (
        <path key={x} d={`M${String(x)} 70v72`} opacity="0.6" />
      ))}
      <path d="M92 106h136" />
    </g>,
    <g key="m4" {...trait}>
      <path d="M86 132c30-26 70-26 100 0s54 24 74 4" />
      <path d="M120 132V88h56v44" />
    </g>,
    <g key="m5" {...trait}>
      <path d="M108 142h104v14H108z" />
      <path d="M132 56h56v24h-56z" />
      <path d="M160 80v34" />
      <path d="M104 114h112v22H104z" />
      <path d="M148 56c0-14 24-14 24 0" />
    </g>,
    <g key="m6" {...trait}>
      {[72, 96, 120].map((y) => (
        <path key={y} d={`M84 ${String(y)}h152`} />
      ))}
      {[100, 140, 180, 220].map((x) => (
        <path key={x} d={`M${String(x)} 72v22M${String(x - 12)} 96v22M${String(x)} 120v20`} opacity="0.7" />
      ))}
    </g>,
    <g key="m7" {...trait}>
      <path d="M104 74h112v70H104z" />
      <path d="M104 110c24-14 44 14 68 0s20-14 44 0" />
      <path d="M140 58v16M180 58v16" />
    </g>,
    <g key="m8" {...trait}>
      <circle cx="128" cy="106" r="30" />
      <circle cx="196" cy="106" r="30" />
      <path d="M98 140h128" />
    </g>,
    <g key="m9" {...trait}>
      <path d="M96 142l24-72h80l24 72z" />
      <path d="M120 112h80" />
      <path d="M148 142V94" />
    </g>,
  ]
  return (
    <svg viewBox="0 0 320 200" aria-hidden="true" className="o-w-full" style={{ color: ENCRE }}>
      {/* La fenetre de pellicule, et ses perforations. */}
      <rect x="0" y="0" width="320" height="200" fill={accentDoux(500, 10)} />
      {[10, 46, 82, 118, 154, 190, 226, 262, 298].map((x) => (
        <g key={x}>
          <rect x={x} y="6" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeOpacity="0.45" />
          <rect x={x} y="184" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeOpacity="0.45" />
        </g>
      ))}
      <rect x="8" y="24" width="304" height="152" fill="none" stroke="currentColor" strokeOpacity="0.3" />
      <g style={{ color: ENCRE, opacity: 0.85 }} transform="translate(0, 6)">
        {motifs[chapitre.rang - 1]}
      </g>
      <text x="20" y="46" className="o-font-mono" fontSize="12" fill="currentColor" fillOpacity="0.8">
        {String(chapitre.rang).padStart(2, '0')}
      </text>
      <text x="300" y="46" textAnchor="end" className="o-font-mono" fontSize="12" fill="currentColor" fillOpacity="0.8">
        {horloge(chapitre.debut)}
      </text>
    </svg>
  )
}

/* ------------------------------------------------------------------------ */
/*                      Le mecanisme : la frise et le poids                 */
/* ------------------------------------------------------------------------ */

/** La frise de lecture, les chapitres, et l echelle des debits. */
function Frise(): ReactElement {
  const [rang, setRang] = useState(3)
  const [debit, setDebit] = useState(8)

  const chapitre = CHAPITRES.find((c) => c.rang === rang) ?? CHAPITRES[0]
  const qualite = qualitePour(debit)

  const calculs = useMemo(() => {
    const total = qualite.debit + SON
    const duree = chapitre?.duree ?? 0
    return {
      poidsChapitre: (duree * total) / 8,
      poidsFilm: (DUREE * total) / 8,
      tampon: (6 * total) / debit,
      demarrage: (4 * total) / debit + 0.12,
      plafond: debit * 0.75,
    }
  }, [chapitre, qualite, debit])

  if (chapitre === undefined) return <></>

  return (
    <div className="o-grid o-gap-10 lg:o-grid-cols-12 lg:o-gap-12">
      {/* ----- La frise, le chapitre, et ce qu il pese ------------------- */}
      <div className="o-min-w-0 lg:o-col-span-8">
        <div className="o-flex o-flex-wrap o-items-baseline o-gap-x-5 o-gap-y-1">
          <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
            La fabrique du papier — episode 3
          </p>
          <p className="o-m-0 o-ml-auto o-font-mono o-text-xs o-tabular-nums o-text-zinc-400">
            {horloge(chapitre.debut)} / {horloge(DUREE)}
          </p>
        </div>

        {/* La frise : chaque chapitre occupe sa part exacte de la duree. */}
        <div role="group" aria-label="Les chapitres du film" className="o-mt-4 o-flex o-w-full o-gap-px">
          {CHAPITRES.map((c) => {
            const actif = c.rang === rang
            return (
              <button
                key={c.rang}
                type="button"
                aria-pressed={actif}
                title={`${String(c.rang)}. ${c.titre}`}
                onClick={() => {
                  setRang(c.rang)
                }}
                className="o-block o-cursor-pointer o-p-0 focus:o-ring"
                style={{
                  flexGrow: c.duree,
                  flexBasis: 0,
                  height: 44,
                  border: 'none',
                  borderRadius: 0,
                  backgroundColor: actif ? accent(400) : accentDoux(500, 26),
                  transition: 'background-color 200ms linear',
                }}
              >
                <span className="o-sr-only">
                  Chapitre {c.rang} — {c.titre}
                </span>
              </button>
            )
          })}
        </div>
        <div aria-hidden="true" className="o-mt-1 o-flex o-w-full o-gap-px">
          {CHAPITRES.map((c) => (
            <span key={c.rang} className="o-block o-font-mono o-text-xs o-tabular-nums o-text-zinc-500" style={{ flexGrow: c.duree, flexBasis: 0, overflow: 'hidden' }}>
              {String(c.rang).padStart(2, '0')}
            </span>
          ))}
        </div>

        <div className="o-mt-8 o-grid o-gap-8 md:o-grid-cols-12">
          <div className="o-min-w-0 md:o-col-span-5">
            <Vignette chapitre={chapitre} />
          </div>
          <div className="o-min-w-0 md:o-col-span-7">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: ENCRE }}>
              Chapitre {String(chapitre.rang).padStart(2, '0')} — {horloge(chapitre.duree)}
            </p>
            <h3 className="o-m-0 o-mt-3 o-text-balance o-text-2xl o-font-semibold o-tracking-tight o-text-zinc-50 md:o-text-3xl">
              {chapitre.titre}
            </h3>
            <p className="o-mt-3 o-text-sm o-leading-relaxed o-text-zinc-400">{chapitre.note}</p>

            <dl className="o-m-0 o-mt-7 o-grid o-grid-cols-2 o-gap-x-6 o-gap-y-5">
              {([
                ['Ce chapitre', mega(calculs.poidsChapitre)],
                ['Le film entier', mega(calculs.poidsFilm)],
                ['Six secondes d avance', `${une(calculs.tampon)} s`],
                ['Avant la premiere image', `${une(calculs.demarrage)} s`],
              ] as const).map(([quoi, valeur], place) => (
                <div key={quoi}>
                  <dt className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">{quoi}</dt>
                  <dd
                    className="o-m-0 o-mt-1 o-font-mono o-text-xl o-tabular-nums o-tracking-tight"
                    style={place === 0 ? { color: ENCRE } : undefined}
                  >
                    {valeur}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="o-m-0 o-mt-7 o-border-t o-pt-4 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-400" style={{ borderColor: FILET }}>
              {horloge(chapitre.duree)} x ({une(qualite.debit)} + 0,128 Mb/s) / 8 = {mega(calculs.poidsChapitre)}. La piste sonore est comptee : elle ne change pas avec la qualite, et c est elle qui domine en 240p.
            </p>
          </div>
        </div>
      </div>

      {/* ----- C15 : l echelle verticale des debits ---------------------- */}
      <div className="o-min-w-0 lg:o-col-span-4">
        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
          Le debit du spectateur
        </p>
        <div className="o-mt-4">
          <ElasticSlider
            label="Debit disponible, en megabits par seconde"
            min={0.3}
            max={24}
            step={0.1}
            value={debit}
            onChange={setDebit}
            showValue={false}
            leading={<Icon icon={Gauge} size={16} style={{ color: ENCRE }} aria-hidden="true" />}
          />
        </div>
        <p className="o-m-0 o-mt-3 o-font-mono o-text-sm o-tabular-nums o-text-zinc-300">
          {une(debit)} Mb/s disponibles — plafond retenu {une(calculs.plafond)} Mb/s
        </p>

        <div className="o-mt-8">
          <EchelleDebits debit={debit} retenue={qualite} />
        </div>
      </div>
    </div>
  )
}

/**
 * L echelle verticale graduee, et la valeur posee dessus.
 *
 * Une barre de quatre compteurs aurait dit « 7 qualites ». L echelle dit ce
 * qu aucun compteur ne dit : que les barreaux du haut sont tres espaces, que
 * le plafond du spectateur tombe souvent entre deux, et qu au-dessus de ce
 * plafond tout est hors de portee.
 */
function EchelleDebits({ debit, retenue }: { readonly debit: number; readonly retenue: Qualite }): ReactElement {
  const { ref, vu } = useInView<SVGSVGElement>({ amount: 0.3 })
  const hauteur = 430
  const ordonnee = (valeur: number): number => 34 + (1 - Math.min(valeur, ECHELLE_HAUT) / ECHELLE_HAUT) * (hauteur - 82)
  const plafond = Math.min(debit * 0.75, ECHELLE_HAUT)
  const gris: CSSProperties = { color: 'var(--o-palette-zinc-500)' }

  // Les trois barreaux du bas tombent a douze pixels les uns des autres : leurs
  // etiquettes se recouvriraient. Elles sont donc ecartees, et un coude les
  // relie a leur vraie place sur l echelle. Le trait ne ment pas, le texte
  // respire.
  const places: number[] = []
  QUALITES.forEach((qualite, rang) => {
    const vrai = ordonnee(qualite.debit)
    const precedent = rang === 0 ? Number.POSITIVE_INFINITY : (places[rang - 1] ?? vrai)
    places[rang] = Math.min(vrai, precedent - 18)
  })

  return (
    <svg
      ref={ref}
      viewBox={`0 0 320 ${String(hauteur)}`}
      role="img"
      aria-label={`Echelle des debits : la qualite retenue est ${retenue.nom}, a ${une(retenue.debit)} megabits par seconde, sous un plafond de ${une(plafond)}`}
      className="o-w-full"
      style={{ maxWidth: 340 }}
    >
      {/* La colonne graduee : un trait, et ses reperes tous les deux Mb/s. */}
      <line x1="52" y1="26" x2="52" y2={hauteur - 40} stroke="currentColor" strokeWidth="1.4" opacity="0.5" style={gris} />
      {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18].map((valeur) => (
        <g key={valeur}>
          <line
            x1={valeur % 6 === 0 ? 40 : 46}
            y1={ordonnee(valeur)}
            x2="52"
            y2={ordonnee(valeur)}
            stroke="currentColor"
            strokeWidth="1"
            opacity={valeur % 6 === 0 ? 0.8 : 0.4}
            style={gris}
          />
          {valeur % 6 === 0 && (
            <text x="34" y={ordonnee(valeur) + 4} textAnchor="end" className="o-font-mono" fontSize="10" fill="currentColor" style={gris}>
              {valeur}
            </text>
          )}
        </g>
      ))}
      <text x="40" y="16" className="o-font-mono" fontSize="10" fill="currentColor" style={gris}>
        Mb/s
      </text>

      {/* Le plafond du spectateur : trois quarts de sa bande, pose sous tout. */}
      <line x1="40" y1={ordonnee(plafond)} x2="312" y2={ordonnee(plafond)} stroke={ENCRE} strokeWidth="1.1" strokeDasharray="5 5" opacity="0.85" />
      <text x="57" y={ordonnee(plafond) - 6} className="o-font-mono" fontSize="9.5" fill={ENCRE}>
        plafond
      </text>

      {/* Les sept barreaux, poses a leur debit, etiquettes ecartees. */}
      {QUALITES.map((qualite, rang) => {
        const vrai = ordonnee(qualite.debit)
        const pose = places[rang] ?? vrai
        const elue = qualite.nom === retenue.nom
        const horsPortee = qualite.debit + SON > plafond
        const teinte = elue ? ENCRE : 'currentColor'
        return (
          <g key={qualite.nom} style={{ opacity: vu ? 1 : 0, transition: `opacity 500ms ease ${String(rang * 70)}ms` }}>
            <path
              d={`M52 ${String(vrai)}H84L100 ${String(pose)}H${String(elue ? 120 : 112)}`}
              fill="none"
              stroke={teinte}
              strokeWidth={elue ? 3 : 1.3}
              opacity={horsPortee ? 0.3 : 0.9}
              style={horsPortee ? gris : undefined}
            />
            {/* Le fond de l etiquette : sans lui, le plafond en pointille
                traverserait le nom de la qualite qui tombe a sa hauteur. */}
            <rect
              x={elue ? 124 : 116}
              y={pose - 10}
              width={elue ? 186 : 194}
              height="20"
              fill="var(--o-theme-bg)"
            />
            <text
              x={elue ? 126 : 118}
              y={pose + 5}
              className="o-font-mono"
              fontSize={elue ? 15 : 12}
              fill={teinte}
              opacity={horsPortee ? 0.42 : 1}
              style={horsPortee ? gris : undefined}
            >
              {qualite.nom}
            </text>
            <text
              x="310"
              y={pose + 5}
              textAnchor="end"
              className="o-font-mono o-tabular-nums"
              fontSize={elue ? 15 : 10.5}
              fill={teinte}
              opacity={horsPortee ? 0.42 : elue ? 1 : 0.8}
              style={horsPortee ? gris : undefined}
            >
              {une(qualite.debit)}
              {elue ? ' Mb/s' : ''}
            </text>
          </g>
        )
      })}

      <text x="14" y={hauteur - 12} className="o-font-mono" fontSize="10" fill="currentColor" style={gris}>
        {retenue.definition} — ce que le lecteur prendrait
      </text>
    </svg>
  )
}

/* ------------------------------------------------------------------------ */
/*                 Figure 01 — la segmentation et le changement             */
/* ------------------------------------------------------------------------ */

/**
 * Le debit mesure sur quarante segments de quatre secondes.
 *
 * Une courbe inventee, mais plausible : un palier haut, un creux de tunnel,
 * une remontee lente. C est le creux qui rend la figure utile — sans lui, le
 * changement de qualite n aurait rien a expliquer.
 */
const MESURES: readonly number[] = [
  9.4, 9.8, 9.1, 9.6, 10.2, 9.9, 9.3, 8.8, 7.4, 5.2, 3.1, 1.8, 1.2, 0.9, 1.1, 1.6, 2.4, 3.6, 4.8,
  5.6, 6.1, 6.4, 6.2, 6.8, 7.3, 7.9, 8.4, 8.1, 8.6, 9.0, 9.2, 8.7, 9.1, 9.5, 9.3, 9.7, 9.4, 9.8,
  10.1, 9.6,
]

/**
 * Figure 01 — quarante segments, et la qualite qui suit le debit.
 *
 * Un tableau dirait « debit adaptatif, segments de quatre secondes ». Le
 * dessin montre ce qui compte : la qualite ne descend pas au fond du creux
 * mais **un segment avant**, parce que la decision se prend sur la mesure
 * precedente — et qu elle remonte toujours plus lentement qu elle n est
 * descendue.
 */
function FigureSegments(): ReactElement {
  const { ref, vu } = useInView<SVGSVGElement>({ amount: 0.25 })
  const gris: CSSProperties = { color: 'var(--o-palette-zinc-500)' }
  const large = 900
  const pas = large / MESURES.length
  const y = (valeur: number): number => 150 - (Math.min(valeur, 12) / 12) * 108

  // La qualite servie suit la mesure du segment precedent, jamais la sienne.
  const servies = MESURES.map((_, place) => qualitePour(MESURES[Math.max(0, place - 1)] ?? 1))
  const courbe = MESURES.map((valeur, place) => `${place === 0 ? 'M' : 'L'}${String(56 + place * pas)} ${String(y(valeur))}`).join(' ')

  return (
    <svg ref={ref} viewBox="0 0 1000 300" aria-hidden="true" className="o-w-full" style={{ minWidth: 760 }}>
      <text x="56" y="24" className="o-font-mono" fontSize="10.5" fill="currentColor" style={gris}>
        debit mesure, segment par segment — quarante segments de quatre secondes, soit 2:40 de lecture
      </text>

      {/* Le debit, en courbe. */}
      <path
        d={courbe}
        fill="none"
        stroke={ENCRE}
        strokeWidth="1.8"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 2000,
          strokeDashoffset: vu ? 0 : 2000,
          transition: 'stroke-dashoffset 1800ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
      <line x1="56" y1="150" x2={String(56 + large)} y2="150" stroke="currentColor" strokeWidth="1" opacity="0.4" style={gris} />
      <text x="42" y={y(12) + 4} textAnchor="end" className="o-font-mono" fontSize="10" fill="currentColor" style={gris}>
        12
      </text>
      <text x="42" y="154" textAnchor="end" className="o-font-mono" fontSize="10" fill="currentColor" style={gris}>
        0
      </text>

      {/* Les segments servis, en cases, sous la courbe. */}
      {servies.map((qualite, place) => {
        const rang = QUALITES.indexOf(qualite)
        return (
          <rect
            key={place}
            x={56 + place * pas + 0.8}
            y="176"
            width={pas - 1.6}
            height="30"
            fill={ENCRE}
            opacity={0.18 + (rang / (QUALITES.length - 1)) * 0.74}
            style={{
              transformBox: 'fill-box',
              transformOrigin: 'bottom center',
              transform: vu ? 'scaleY(1)' : 'scaleY(0)',
              transition: `transform 420ms cubic-bezier(0.16, 1, 0.3, 1) ${String(400 + place * 26)}ms`,
            }}
          />
        )
      })}
      <text x="56" y="170" className="o-font-mono" fontSize="10" fill="currentColor" style={gris}>
        qualite servie — la case est d autant plus pleine que la definition est haute
      </text>

      {/* Les deux moments qui font la figure. */}
      <path d={`M${String(56 + 9 * pas)} 214v22h120`} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 5" opacity="0.7" style={gris} />
      <text x={String(56 + 9 * pas + 126)} y="240" className="o-font-mono" fontSize="10.5" fill="currentColor" style={{ color: ENCRE }}>
        la qualite tombe un segment avant le creux
      </text>
      <path d={`M${String(56 + 26 * pas)} 214v44h100`} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 5" opacity="0.7" style={gris} />
      <text x={String(56 + 26 * pas + 106)} y="262" textAnchor="end" className="o-font-mono" fontSize="10.5" fill="currentColor" style={{ color: ENCRE }}>
        et remonte barreau par barreau
      </text>
    </svg>
  )
}

/* ------------------------------------------------------------------------ */
/*                     Le rail : la chaine d encodage                       */
/* ------------------------------------------------------------------------ */

/** Une station de la chaine. */
const STATIONS: readonly {
  readonly rang: string
  readonly nom: string
  readonly texte: string
  readonly mesure: string
}[] = [
  { rang: '01', nom: 'Le depot', texte: 'Le fichier arrive par morceaux de huit megaoctets, reprenables. Un depot coupe a 60 % repart ou il s est arrete, pas au debut.', mesure: 'jusqu a 240 Go' },
  { rang: '02', nom: 'La sonde', texte: 'Codec, definition, cadence, profondeur, pistes sonores, sous-titres incrustes. Ce qui est illisible est refuse tout de suite, avec la raison.', mesure: '1,2 s' },
  { rang: '03', nom: 'La coupe', texte: 'Le film est decoupe en segments de quatre secondes, alignes sur les images cles. C est l alignement qui permet de changer de qualite sans coupure.', mesure: '4,000 s par segment' },
  { rang: '04', nom: 'Les sept encodages', texte: 'Sept qualites, menees de front sur autant de machines. Le film de quarante-deux minutes est pret en onze minutes, et non en sept fois sa duree.', mesure: '11 min' },
  { rang: '05', nom: 'L empaquetage', texte: 'Deux manifestes, un par format de diffusion, qui decrivent les memes segments. Aucun fichier n est encode deux fois pour cela.', mesure: 'HLS et DASH' },
  { rang: '06', nom: 'Le controle', texte: 'Une mesure de qualite percue par qualite, et une comparaison image a image avec la source. Sous le seuil, le barreau est reencode plus haut.', mesure: 'VMAF 93 median' },
  { rang: '07', nom: 'La diffusion', texte: 'Les segments partent sur les points de presence. Le premier spectateur d une region attend cent millisecondes de plus que les suivants.', mesure: '38 points de presence' },
]

/* ------------------------------------------------------------------------ */
/*                           Le generique (P25)                             */
/* ------------------------------------------------------------------------ */

/** Un bloc du generique. */
const GENERIQUE: readonly { readonly role: string; readonly noms: readonly string[] }[] = [
  { role: 'Plateforme', noms: ['Bobine'] },
  { role: 'Direction', noms: ['Salome Verchant'] },
  { role: 'Chaine d encodage', noms: ['Tarek Boulanger', 'Lea Nardi', 'Come Ravel'] },
  { role: 'Lecteur et accessibilite', noms: ['Ines Delaunay', 'Hugo Vaury'] },
  { role: 'Diffusion', noms: ['Bastien Lecointre', 'Nadia Toussaint'] },
  { role: 'Assistance', noms: ['Claire Benali', 'Marc Arsac'] },
  { role: 'Tourne a', noms: ['Lyon, Villeurbanne'] },
  { role: 'Avec le concours de', noms: ['Le moulin a papier de Brousses', 'La cinematheque de Bourgogne'] },
  { role: 'Sous licence', noms: ['AV1, H.264, HEVC', 'Polices Oswald et Barlow'] },
  { role: 'Hebergement', noms: ['Gravelines et Strasbourg'] },
]

/** L identifiant de la feuille du generique. */
const FEUILLE = 'odoro-bobine-generique'

/** Pose l ascension du generique, une fois par document. */
function poserFeuille(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(FEUILLE) !== null) return
  const style = document.createElement('style')
  style.id = FEUILLE
  style.textContent = [
    '@keyframes o-bobine-roule{from{transform:translate3d(0,0,0)}to{transform:translate3d(0,-50%,0)}}',
    '[data-o-bobine-roule]{animation:o-bobine-roule 46s linear infinite}',
    '@media (prefers-reduced-motion:reduce){[data-o-bobine-roule]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Le generique de fin, qui defile.
 *
 * Ce n est pas le `CinematicFooter` du registre : celui-la se decouvre au
 * defilement de la page, celui-ci monte tout seul, sans fin, comme un
 * generique projete. Le bloc est duplique pour que la boucle ne se voie pas,
 * et la copie est retiree de l arbre d accessibilite.
 *
 * Sous mouvement reduit, l ascension s arrete et le generique se lit d un
 * bloc : la hauteur devient libre, et la copie disparait.
 */
function Generique(): ReactElement {
  const { reduced } = useMotionState()
  poserFeuille()

  const colonne = (double: boolean): ReactElement => (
    <div aria-hidden={double ? true : undefined} className="o-flex o-flex-col o-items-center o-gap-9 o-py-10">
      {GENERIQUE.map((bloc) => (
        <div key={`${bloc.role}-${String(double)}`} className="o-text-center">
          <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">{bloc.role}</p>
          {bloc.noms.map((nom) => (
            <p key={nom} className="o-m-0 o-mt-1.5 o-text-lg o-font-semibold o-tracking-tight o-text-zinc-100">
              {nom}
            </p>
          ))}
        </div>
      ))}
    </div>
  )

  if (reduced) return <div>{colonne(false)}</div>

  return (
    <div
      className="o-relative o-overflow-hidden"
      style={{
        height: 'clamp(360px, 46vh, 520px)',
        maskImage: 'linear-gradient(to bottom, transparent, black 16%, black 84%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 16%, black 84%, transparent)',
      }}
    >
      <div data-o-bobine-roule="">
        {colonne(false)}
        {colonne(true)}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/*                                 La page                                  */
/* ------------------------------------------------------------------------ */

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('oswald')

  return (
    <Porte forme="iris" marque="Bobine">
      <div className="o-text-zinc-100" style={{ ...polices, ...nuit('zinc') }}>
        <BarreGelule marque="Bobine" liens={LIENS} action={['#essai', 'Deposer un film']} sombre />

        <main>
          {/* =============== L affiche ===================================== */}
          <section id="sommet" aria-label="Ouverture" className="o-relative o-isolate o-overflow-hidden">
            <div aria-hidden="true" className="o-absolute o-inset-0 o-z-0">
              <AudioBars
                className="o-absolute o-inset-0"
                bars={64}
                speed={0.8}
                gap={0.4}
                segments={20}
                mirror
                colors={['--o-palette-zinc-950', '--o-vitrine-700', '--o-vitrine-300']}
                fallback="o-bg-gradient-to-t o-from-zinc-950 o-to-zinc-900"
              />
              <div
                className="o-absolute o-inset-0"
                style={{
                  background:
                    'linear-gradient(to bottom, color-mix(in oklab, var(--o-palette-zinc-950) 92%, transparent) 0%, color-mix(in oklab, var(--o-palette-zinc-950) 50%, transparent) 48%, var(--o-palette-zinc-950) 96%)',
                }}
              />
            </div>
            <Grain opacite={0.07} />

            <div className="o-relative o-z-20 o-px-6 o-pb-24 o-pt-40 md:o-px-8 md:o-pb-32 md:o-pt-48">
              <div className="o-mx-auto o-max-w-7xl">
                <Surgit delai={40}>
                  <Etiquette sombre>Video pour les editeurs — depot, encodage, lecteur</Etiquette>
                </Surgit>

                <Surgit delai={180} distance={40} className="o-mt-8 o-select-none">
                  <DepthText
                    depth={10}
                    step={3}
                    angle={11}
                    speed={9000}
                    couleur={accent(500)}
                    className="o-block o-text-zinc-50"
                    style={{ ...affiche('xxl', 700), lineHeight: 0.86 }}
                  >
                    BOBINE
                  </DepthText>
                </Surgit>

                <div className="o-mt-10 o-grid o-gap-10 o-border-t o-pt-10 md:o-grid-cols-12" style={{ borderColor: FILET }}>
                  <TitreVague
                    delai={420}
                    cadence={62}
                    className="o-m-0 o-text-balance o-text-zinc-50 md:o-col-span-7"
                    style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.4vw, 3.5rem)' }}
                  >
                    Un film, sept qualites, et le poids de chacune.
                  </TitreVague>
                  <Surgit delai={560} as="p" className="o-m-0 o-text-base o-leading-relaxed o-text-zinc-400 md:o-col-span-5">
                    Deposez le fichier tel qu il sort du montage. Bobine le sonde, le coupe en segments de quatre secondes, l encode sept fois, et sert au spectateur ce que sa ligne peut porter — pas davantage.
                  </Surgit>
                </div>
              </div>
            </div>

            <Coin position="bg" sombre>
              Bobine 6
              <br />
              Lyon, Villeurbanne
            </Coin>
            <Coin position="bd" sombre>
              38 points de presence
              <br />
              AV1, H.264, HEVC
            </Coin>
          </section>

          {/* =============== Le ruban des formats ========================== */}
          <div className="o-border-t o-border-b o-px-6 o-py-4 md:o-px-8" style={{ borderColor: FILET }}>
            <ul className="o-m-0 o-mx-auto o-flex o-max-w-7xl o-list-none o-flex-wrap o-items-center o-gap-x-9 o-gap-y-3 o-p-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              {['HLS', 'DASH', 'AV1', 'H.264', 'HEVC', 'WebVTT', 'Chapitres', 'Audiodescription'].map((mot) => (
                <li key={mot}>{mot}</li>
              ))}
              <li className="o-ml-auto o-normal-case o-tracking-normal o-text-zinc-400">Un seul depot, tout le reste suit.</li>
            </ul>
          </div>

          {/* =============== (01) La frise ================================= */}
          <section id="frise" aria-labelledby="frise-titre" className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-8 md:o-py-28">
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-7">
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: ENCRE }}>
                    (01) — Le chapitrage
                  </p>
                  <h2
                    id="frise-titre"
                    className="o-m-0 o-mt-5 o-text-balance o-text-zinc-50"
                    style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)' }}
                  >
                    Prenez un chapitre. Reglez la ligne.
                  </h2>
                </div>
                <p className="o-m-0 o-max-w-sm o-text-sm o-leading-relaxed o-text-zinc-400 md:o-col-span-5">
                  Les neuf chapitres occupent leur part exacte de la duree. Le curseur, lui, joue la ligne du spectateur : c est elle qui decide de la qualite, et donc du poids.
                </p>
              </div>

              <div className="o-mt-14">
                <Frise />
              </div>
            </div>
          </section>

          {/* =============== Figure 01 : les segments ======================= */}
          <section
            id="segments"
            aria-labelledby="segments-titre"
            className="o-scroll-mt-24 o-border-t o-px-6 o-py-24 md:o-px-8 md:o-py-32"
            style={{ borderColor: FILET }}
          >
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-10 lg:o-grid-cols-12">
              <div className="lg:o-col-span-3">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: ENCRE }}>
                  Figure 01
                </p>
                <h2
                  id="segments-titre"
                  className="o-m-0 o-mt-5 o-text-balance o-text-zinc-50"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)' }}
                >
                  Le tunnel, vu du lecteur.
                </h2>
                <p className="o-mt-5 o-text-sm o-leading-relaxed o-text-zinc-400">
                  Quarante segments de quatre secondes. Au-dessus, ce que la ligne portait vraiment ; en dessous, la qualite servie, case par case.
                </p>
                <p className="o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-400">
                  La descente est brutale, la remontee est prudente : un lecteur qui remonterait aussi vite qu il descend passerait son temps a se tromper.
                </p>
              </div>

              <figure className="o-m-0 o-min-w-0 lg:o-col-span-9">
                <div className="o-overflow-x-auto o-pb-2" style={{ overflowY: 'hidden' }}>
                  <FigureSegments />
                </div>
                <p className="o-sr-only">
                  Le debit mesure part de dix megabits par seconde, tombe sous un megabit au douzieme segment, puis remonte en vingt segments. La qualite servie suit avec un segment de retard.
                </p>
                <figcaption className="o-mt-6 o-border-t o-pt-4 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-400" style={{ borderColor: FILET }}>
                  Figure 01 — deux minutes quarante de lecture, dans un train. La courbe est le debit mesure ; les cases, la qualite servie au segment suivant.
                </figcaption>
              </figure>
            </div>
          </section>

          {/* =============== M-rail : la chaine d encodage ================== */}
          <section id="chaine" aria-labelledby="chaine-titre" className="o-scroll-mt-24 o-border-t" style={{ borderColor: FILET }}>
            <Rail
              ecrans={3.2}
              entete={
                <div className="o-px-6 o-pb-6 o-pt-10 md:o-px-8">
                  <div className="o-mx-auto o-flex o-max-w-7xl o-flex-wrap o-items-end o-justify-between o-gap-6">
                    <div>
                      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: ENCRE }}>
                        (02) — La chaine
                      </p>
                      <h2
                        id="chaine-titre"
                        className="o-m-0 o-mt-4 o-text-balance o-text-zinc-50"
                        style={{ ...affiche('m', 300), fontSize: 'clamp(1.6rem, 3vw, 3rem)' }}
                      >
                        Du depot a la premiere image.
                      </h2>
                    </div>
                    <p className="o-m-0 o-max-w-xs o-font-mono o-text-xs o-leading-relaxed o-uppercase o-tracking-widest o-text-zinc-400">
                      Sept stations
                      <br />
                      Onze minutes pour un film de quarante-deux
                    </p>
                  </div>
                </div>
              }
            >
              {STATIONS.map((station) => (
                <article
                  key={station.rang}
                  className="o-flex o-shrink-0 o-flex-col o-justify-between o-p-8 md:o-p-10"
                  style={{ width: 'min(84vw, 440px)', borderLeft: `1px solid ${FILET}` }}
                >
                  <div>
                    <p className="o-m-0 o-tabular-nums" style={{ ...affiche('l', 300), color: accent(500) }}>
                      {station.rang}
                    </p>
                    <h3 className="o-m-0 o-mt-6 o-text-balance o-text-2xl o-font-semibold o-tracking-tight o-text-zinc-50">
                      {station.nom}
                    </h3>
                    <p className="o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-400">{station.texte}</p>
                  </div>
                  <p className="o-m-0 o-mt-10 o-border-t o-pt-4 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ borderColor: FILET, color: ENCRE }}>
                    {station.mesure}
                  </p>
                </article>
              ))}
            </Rail>
          </section>

          {/* =============== La coupe claire : une phrase, un ecran ========= */}
          <section aria-labelledby="phrase-titre" className="o-px-6 o-py-32 md:o-px-8 md:o-py-44" style={JOUR}>
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-10 md:o-grid-cols-12">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 md:o-col-span-3">
                Ce que nous ne faisons pas
              </p>
              <div className="md:o-col-span-9">
                <h2 id="phrase-titre" className="o-sr-only">
                  Ce que Bobine ne fait pas
                </h2>
                <p
                  className="o-m-0 o-max-w-4xl o-text-balance"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.6vw, 3.75rem)', lineHeight: 1.1 }}
                >
                  <span className="o-text-zinc-500">Aucune recommandation, aucun suivi du spectateur, aucune publicite avant votre film. </span>
                  <span className="o-text-zinc-950">Votre audience ne nous appartient pas, et nous n avons rien a en tirer.</span>
                </p>
                <p className="o-mt-10 o-max-w-xl o-font-mono o-text-xs o-leading-relaxed o-text-zinc-600" style={{ borderTop: `1px solid ${FILET_JOUR}`, paddingTop: '1rem' }}>
                  Le lecteur n emet rien vers un tiers. Le journal de lecture reste chez vous, et il tient en cinq colonnes : le moment, le chapitre, la qualite servie, les changements, les arrets.
                </p>
              </div>
            </div>
          </section>

          {/* =============== (03) Ce qui part avec la video ================= */}
          <section id="livraison" aria-labelledby="livraison-titre" className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32">
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-7">
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: ENCRE }}>
                    (03) — Ce qui part
                  </p>
                  <h2
                    id="livraison-titre"
                    className="o-m-0 o-mt-5 o-text-balance o-text-zinc-50"
                    style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)' }}
                  >
                    Quatre choses sortent avec le film.
                  </h2>
                </div>
                <p className="o-m-0 o-max-w-sm o-text-sm o-leading-relaxed o-text-zinc-400 md:o-col-span-5">
                  Elles sont produites au depot, pas commandees ensuite. Aucune n est une option payante.
                </p>
              </div>

              <div className="o-mt-12">
                <Numerotee
                  sombre
                  lignes={[
                    {
                      titre: 'Les chapitres',
                      texte: 'Lus depuis les marqueurs du montage quand le fichier en porte, sinon proposes d apres les coupes detectees. Ils partent dans le manifeste, dans le lecteur, et dans le flux de publication.',
                    },
                    {
                      titre: 'Les sous-titres',
                      texte: 'Une transcription horodatee, puis une relecture humaine facturee au quart d heure. Le fichier est un WebVTT ordinaire, que vous emportez.',
                    },
                    {
                      titre: 'Les vignettes',
                      texte: 'Une image toutes les deux secondes, en planche unique, pour l apercu au survol de la frise. Douze kilooctets pour un film de quarante minutes.',
                    },
                    {
                      titre: 'Le journal de lecture',
                      texte: 'Cinq colonnes, une ligne par session, exportable. Ni identifiant de spectateur, ni empreinte de navigateur : nous ne saurions pas les produire.',
                    },
                  ]}
                />
              </div>
            </div>
          </section>

          {/* =============== A25 : un bouton, toute la largeur ==============
              Pas d appel encadre, pas de gelule centree : le bouton est la
              bande, du bord gauche au bord droit. */}
          <section id="essai" aria-labelledby="essai-titre" className="o-scroll-mt-24 o-border-t o-px-6 o-pb-8 o-pt-24 md:o-px-8 md:o-pt-32" style={{ borderColor: FILET }}>
            <div className="o-mx-auto o-max-w-7xl">
              <h2 id="essai-titre" className="o-m-0 o-max-w-3xl o-text-balance o-text-zinc-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)' }}>
                Le premier film est encode ce soir.
              </h2>
              <p className="o-mt-5 o-max-w-xl o-text-sm o-leading-relaxed o-text-zinc-400">
                Deux cents gigaoctets de depot, sans engagement, sans carte. Vous repartez avec les fichiers si cela ne vous convient pas.
              </p>
            </div>
          </section>
          <a
            href="#sommet"
            className="o-block o-w-full o-px-6 o-py-10 o-text-center o-no-underline o-transition-opacity hover:o-opacity-90 focus:o-ring md:o-py-14"
            style={{ backgroundColor: accent(400), color: 'var(--o-palette-zinc-950)' }}
          >
            <span className="o-inline-flex o-items-center o-gap-4 o-text-balance" style={{ ...affiche('m', 700), fontSize: 'clamp(1.75rem, 5vw, 4.5rem)' }}>
              <Icon icon={Play} size={40} aria-hidden="true" />
              Deposer un film
            </span>
          </a>
        </main>

        {/* =============== P25 : le generique de fin, qui defile =========== */}
        <footer className="o-border-t" style={{ borderColor: FILET }}>
          <div className="o-px-6 o-pt-12 md:o-px-8">
            <p className="o-m-0 o-text-center o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
              <span className="o-inline-flex o-items-center o-gap-2">
                <Icon icon={Clapperboard} size={13} aria-hidden="true" />
                Generique
              </span>
            </p>
          </div>

          <GradualBlur side="bottom" size={72} strength={6} scrollable={false}>
            <Generique />
          </GradualBlur>

          <div className="o-px-6 o-pb-10 md:o-px-8">
            <div className="o-mx-auto o-flex o-max-w-7xl o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400" style={{ borderColor: FILET }}>
              <span className="o-inline-flex o-items-center o-gap-2">
                <Icon icon={Subtitles} size={13} aria-hidden="true" />
                Sous-titres sur chaque film
              </span>
              <nav aria-label="Mentions" className="o-flex o-flex-wrap o-gap-x-6 o-gap-y-2">
                {([
                  ['#livraison', 'Formats acceptes'],
                  ['#chaine', 'Etat du service'],
                  ['#segments', 'Documentation du lecteur'],
                  ['#essai', 'Nous ecrire'],
                ] as const).map(([cible, mot]) => (
                  <a key={mot} href={cible} className="o-no-underline o-text-zinc-400 hover:o-text-zinc-100 o-transition-colors focus:o-ring">
                    {mot}
                  </a>
                ))}
              </nav>
              <span className="o-inline-flex o-items-center o-gap-2">
                <Icon icon={Download} size={13} aria-hidden="true" />© 2026 Bobine
              </span>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
