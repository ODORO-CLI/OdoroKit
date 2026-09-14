/**
 * Corde a Sauter — salle de boxe.
 *
 * ## La reference : Stride Nine
 *
 * Des capitales lourdes posees sur l image, un accent unique, et rien de
 * rond. Il n y a ici aucune photographie de salle utilisable — celles du
 * fonds portent toutes une marque lisible sur un disque ou un mur — donc les
 * capitales sont posees sur un **champ electrique** et sur des bandes qui
 * defilent. Le reste est trace.
 *
 * ## Le mecanisme : le round
 *
 * Un vrai minuteur de trois minutes. Il ne compte pas : il **mene**. Chaque
 * round porte ses annonces, a la seconde ou le coach les crie, et la page les
 * sort une par une — le coup en cours en grand, les trois suivants en file,
 * et la zone visee qui s allume sur la silhouette. Arreter le minuteur arrete
 * l enchainement ; le reprendre le reprend ou il en etait.
 *
 * ## Le compteur a rouleaux
 *
 * C est la forme C17 de la fiche. Les chiffres ne se remplacent pas : ils
 * **roulent**, comme un compteur de kilometrage — une colonne de dix chiffres
 * qu on translate. Sous mouvement reduit, la colonne se pose sans rouler ;
 * le temps reste juste, parce qu il est de l information et non un agrement.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { ElectricField } from '@/odoro/background/ElectricField.jsx'
import { GlitchHover } from '@/odoro/effect/GlitchHover.jsx'
import { EchoText } from '@/odoro/text/EchoText.jsx'
import { ElectricBorder } from '@/odoro/ui/ElectricBorder.jsx'

import { nuit } from './communs.jsx'
import {
  affiche,
  BarreCoins,
  CHROME,
  Etiquette,
  Grain,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { accent, accentDoux, aplat, encreSurSombre } from './palettes.js'
import { Bandeau } from './scene.jsx'

/* ============================ Le round ================================= */

/** Les zones de la silhouette, telles que le coach les nomme. */
type Zone = 'garde' | 'menton' | 'tempe-g' | 'tempe-d' | 'plexus' | 'foie' | 'jambes'

/** Une annonce du coach, a la seconde ou elle tombe. */
interface Annonce {
  readonly a: number
  readonly coup: string
  readonly zone: Zone
  readonly detail: string
}

/** Un round de trois minutes, et ce qu il mene. */
interface Round {
  readonly rang: number
  readonly nom: string
  readonly intention: string
  readonly annonces: readonly Annonce[]
}

/** La duree d un round, en secondes. */
const DUREE = 180

const ROUNDS: readonly Round[] = [
  {
    rang: 1,
    nom: 'La garde',
    intention:
      'On ne frappe pas encore. On apprend a ne pas baisser les mains quand on souffle.',
    annonces: [
      {
        a: 0,
        coup: 'Garde haute',
        zone: 'garde',
        detail: 'Mains aux pommettes, coudes rentres, menton bas.',
      },
      {
        a: 14,
        coup: 'Pas chasse avant',
        zone: 'jambes',
        detail: 'Le pied avant part, l arriere suit. Jamais les pieds croises.',
      },
      {
        a: 30,
        coup: 'Pas chasse arriere',
        zone: 'jambes',
        detail: 'Meme chose a reculons, sans se redresser.',
      },
      {
        a: 46,
        coup: 'Jab',
        zone: 'menton',
        detail: 'Bras avant, epaule qui monte proteger la machoire.',
      },
      {
        a: 62,
        coup: 'Jab — jab',
        zone: 'menton',
        detail: 'Deux fois le meme, le second plus long que le premier.',
      },
      {
        a: 80,
        coup: 'Garde haute',
        zone: 'garde',
        detail: 'On ferme, dix secondes, sans bouger les pieds.',
      },
      {
        a: 94,
        coup: 'Esquive rotative',
        zone: 'tempe-g',
        detail: 'Le buste tourne, la tete sort de l axe. Les mains restent.',
      },
      {
        a: 110,
        coup: 'Jab — esquive',
        zone: 'tempe-d',
        detail: 'On frappe, on sort. Ne jamais rester ou l on a frappe.',
      },
      {
        a: 128,
        coup: 'Direct',
        zone: 'plexus',
        detail: 'Bras arriere, le talon arriere pivote, la hanche part avec.',
      },
      {
        a: 146,
        coup: 'Jab — direct',
        zone: 'menton',
        detail: 'Le un-deux. C est tout le reste de votre annee.',
      },
      {
        a: 164,
        coup: 'Garde haute',
        zone: 'garde',
        detail: 'Vingt dernieres secondes. Les mains ne descendent pas.',
      },
    ],
  },
  {
    rang: 2,
    nom: 'Les enchainements',
    intention:
      'Trois coups, jamais plus. Ce qui fatigue, ce n est pas de frapper : c est de revenir en garde.',
    annonces: [
      {
        a: 0,
        coup: 'Jab — direct',
        zone: 'menton',
        detail: 'On demarre chaud, deux coups, retour garde.',
      },
      {
        a: 12,
        coup: 'Jab — direct — crochet',
        zone: 'tempe-g',
        detail: 'Le crochet part du pied, pas de l epaule.',
      },
      {
        a: 28,
        coup: 'Double jab — direct',
        zone: 'menton',
        detail: 'Le second jab entre, le direct suit dans la meme foulee.',
      },
      {
        a: 44,
        coup: 'Direct — crochet au corps',
        zone: 'foie',
        detail: 'On plie les jambes pour descendre, pas le dos.',
      },
      {
        a: 60,
        coup: 'Esquive — crochet',
        zone: 'tempe-d',
        detail: 'On sort de l axe et on revient par le cote.',
      },
      {
        a: 76,
        coup: 'Jab au corps — direct',
        zone: 'plexus',
        detail: 'Le premier ouvre la garde, le second passe dessus.',
      },
      {
        a: 92,
        coup: 'Uppercut — crochet',
        zone: 'menton',
        detail: 'Uppercut court, coude sous la main. On ne s allonge pas.',
      },
      {
        a: 108,
        coup: 'Triple jab',
        zone: 'menton',
        detail: 'Trois fois, le troisieme plus dur que les deux autres.',
      },
      {
        a: 124,
        coup: 'Crochet — crochet au corps',
        zone: 'foie',
        detail: 'Haut puis bas. C est la meme rotation, deux hauteurs.',
      },
      {
        a: 140,
        coup: 'Un-deux-trois',
        zone: 'tempe-g',
        detail: 'Jab, direct, crochet. Retour garde avant de respirer.',
      },
      {
        a: 158,
        coup: 'Libre',
        zone: 'garde',
        detail: 'Vingt secondes a vous. Gardez la forme, pas la vitesse.',
      },
    ],
  },
  {
    rang: 3,
    nom: 'Le rythme',
    intention:
      'Le dernier round se gagne avec les jambes. Les bras, a ce stade, ne repondent plus.',
    annonces: [
      {
        a: 0,
        coup: 'Corde a sauter',
        zone: 'jambes',
        detail: 'Trente secondes, pieds joints, sans regarder la corde.',
      },
      {
        a: 30,
        coup: 'Jab en avancant',
        zone: 'menton',
        detail: 'On pousse le partenaire imaginaire vers les cordes.',
      },
      {
        a: 44,
        coup: 'Jab en reculant',
        zone: 'menton',
        detail: 'Meme coup, on recule. C est plus dur, et c est le point.',
      },
      {
        a: 60,
        coup: 'Esquive — esquive',
        zone: 'tempe-g',
        detail: 'Deux rotations d affilee, les mains hautes.',
      },
      {
        a: 74,
        coup: 'Un-deux — sortie laterale',
        zone: 'tempe-d',
        detail: 'Frapper, sortir de cote, jamais en ligne droite.',
      },
      {
        a: 92,
        coup: 'Crochet au foie',
        zone: 'foie',
        detail: 'Le coup qui finit les rounds. Court, sec, et on remonte.',
      },
      {
        a: 108,
        coup: 'Rafale libre',
        zone: 'plexus',
        detail: 'Quinze secondes plein regime. Respirez sur chaque coup.',
      },
      {
        a: 126,
        coup: 'Garde et pas',
        zone: 'jambes',
        detail: 'On recupere en bougeant, jamais a l arret.',
      },
      {
        a: 142,
        coup: 'Un-deux-trois',
        zone: 'tempe-g',
        detail: 'Dernier enchainement propre avant la cloche.',
      },
      {
        a: 160,
        coup: 'Tout ce qui reste',
        zone: 'garde',
        detail: 'Vingt secondes. Apres, vous vous asseyez.',
      },
    ],
  },
]

/** Les cinq coups qui defilent en bandeau, en capitales. */
const VOCABULAIRE = [
  'Jab',
  'Direct',
  'Crochet',
  'Uppercut',
  'Esquive',
  'Corde a sauter',
  'Garde haute',
]

/* ============================ Les seances ============================== */

/** Une seance de la semaine. */
interface Seance {
  readonly jour: string
  readonly heure: string
  readonly nom: string
  readonly qui: string
  readonly places: string
}

const SEMAINE: readonly Seance[] = [
  {
    jour: 'Lundi',
    heure: '12 h 15',
    nom: 'Boxe au sac',
    qui: 'Tous niveaux',
    places: '8 places',
  },
  {
    jour: 'Mardi',
    heure: '19 h',
    nom: 'Debutants',
    qui: 'Premiere fois — gants fournis',
    places: 'Offert',
  },
  {
    jour: 'Mercredi',
    heure: '18 h',
    nom: 'Enfants 8-12 ans',
    qui: 'Educatif, sans opposition',
    places: '4 places',
  },
  {
    jour: 'Jeudi',
    heure: '19 h 30',
    nom: 'Technique',
    qui: 'Deux annees de pratique',
    places: 'Complet',
  },
  {
    jour: 'Vendredi',
    heure: '12 h 15',
    nom: 'Boxe au sac',
    qui: 'Tous niveaux',
    places: '11 places',
  },
  {
    jour: 'Samedi',
    heure: '10 h',
    nom: 'Sparring encadre',
    qui: 'Sur avis du coach',
    places: '6 places',
  },
]

/* ============================ La feuille =============================== */

const STYLE_BOXE = 'o-vitrine-boxe'

/**
 * Ce que les utilitaires n ont pas : la cloche qui bat en fin de round, et la
 * pulsation de la zone visee sur la silhouette.
 */
const CSS_BOXE = [
  '@keyframes o-bo-cloche{0%,100%{opacity:0.25;transform:scale(1)}50%{opacity:1;transform:scale(1.6)}}',
  '@keyframes o-bo-zone{0%,100%{opacity:0.35}50%{opacity:1}}',
  '[data-o-bo-cloche]{animation:o-bo-cloche 1.1s ease-in-out infinite}',
  '[data-o-bo-zone]{animation:o-bo-zone 1.4s ease-in-out infinite}',
  '@media (prefers-reduced-motion:reduce){',
  '[data-o-bo-cloche],[data-o-bo-zone]{animation:none;opacity:1}}',
].join('')

function useFeuilleBoxe(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_BOXE) !== null) return
    const feuille = document.createElement('style')
    feuille.id = STYLE_BOXE
    feuille.textContent = CSS_BOXE
    document.head.append(feuille)
  }, [])
}

/* ============================ Le compteur a rouleaux =================== */

/** Hauteur d un rouleau, en pixels. */
const ROULEAU = 116

/**
 * Un chiffre monte sur un rouleau.
 *
 * La colonne porte les dix chiffres et se translate ; ce qui se voit est la
 * fenetre. Un chiffre qui se remplacerait par fondu n aurait pas ce poids —
 * et la fiche demande un compteur mecanique, pas un afficheur.
 */
function Rouleau({ chiffre }: { readonly chiffre: number }): ReactElement {
  const { reduced } = useMotionState()
  return (
    <span
      aria-hidden="true"
      className="o-relative o-inline-block o-overflow-hidden o-align-bottom"
      style={{ height: ROULEAU, width: Math.round(ROULEAU * 0.6) }}
    >
      <span
        className="o-block"
        style={{
          transform: `translate3d(0, ${String(-chiffre * ROULEAU)}px, 0)`,
          transition: reduced
            ? undefined
            : 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span
            key={n}
            className="o-block o-text-center o-tabular-nums"
            style={{
              height: ROULEAU,
              lineHeight: `${String(ROULEAU)}px`,
              fontSize: Math.round(ROULEAU * 0.74),
            }}
          >
            {n}
          </span>
        ))}
      </span>
      {/* Les joues du rouleau : l ombre qui dit que le chiffre est cylindrique. */}
      <span
        className="o-pointer-events-none o-absolute o-inset-0"
        style={{
          background:
            'linear-gradient(to bottom, var(--o-palette-zinc-900) 0%, transparent 15%, transparent 85%, var(--o-palette-zinc-900) 100%)',
        }}
      />
    </span>
  )
}

/* ============================ La silhouette ============================ */

/** Ou tombe chaque zone sur la silhouette, en unites du cadre 300 x 460. */
const ZONES: Readonly<Record<Zone, readonly [number, number, number]>> = {
  garde: [150, 100, 54],
  menton: [150, 86, 18],
  'tempe-g': [126, 56, 19],
  'tempe-d': [174, 56, 19],
  plexus: [150, 158, 26],
  foie: [180, 198, 24],
  jambes: [150, 352, 46],
}

/** La silhouette de face, et la zone que le coach vient d annoncer. */
function Cible({ zone }: { readonly zone: Zone }): ReactElement {
  const { reduced } = useMotionState()
  const [x, y, r] = ZONES[zone]
  return (
    <svg
      viewBox="0 0 300 460"
      className="o-h-auto o-w-full"
      style={{ maxWidth: 300 }}
      role="img"
      aria-label={`Zone visee : ${zone.replace('-', ' ')}`}
    >
      {/* La silhouette : une masse sombre bordee, et non un bonhomme de fil. */}
      <g
        fill="color-mix(in oklab, white 12%, transparent)"
        stroke="color-mix(in oklab, white 42%, transparent)"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <circle cx="150" cy="64" r="27" />
        {/* Le buste, epaules larges, taille prise. */}
        <path d="M118 108 L182 108 L194 166 L184 254 L116 254 L106 166 Z" />
        {/* Les bras replies : epaule, coude bas, gant a hauteur de joue. */}
        <path d="M118 122 L98 180 L114 118" fill="none" />
        <path d="M182 122 L202 180 L186 118" fill="none" />
        {/* Les jambes, legerement ecartees. */}
        <path d="M126 254 L118 344 L112 420 L136 420 L140 344 L146 254 Z" />
        <path d="M174 254 L182 344 L188 420 L164 420 L160 344 L154 254 Z" />
      </g>
      {/* Les gants, en garde haute, de part et d autre du visage. */}
      <circle
        cx="114"
        cy="100"
        r="18"
        fill={accentDoux(600, 68)}
        stroke="color-mix(in oklab, white 30%, transparent)"
        strokeWidth="2"
      />
      <circle
        cx="186"
        cy="100"
        r="18"
        fill={accentDoux(600, 68)}
        stroke="color-mix(in oklab, white 30%, transparent)"
        strokeWidth="2"
      />

      {/* La zone visee : un anneau qui bat. */}
      <circle
        data-o-bo-zone={reduced ? undefined : ''}
        cx={x}
        cy={y}
        r={r}
        fill="none"
        stroke={encreSurSombre()}
        strokeWidth="3"
        style={{
          transition: reduced ? undefined : 'cx 320ms ease, cy 320ms ease, r 320ms ease',
        }}
      />
      <circle
        cx={x}
        cy={y}
        r="4"
        fill={encreSurSombre()}
        style={{ transition: reduced ? undefined : 'cx 320ms ease, cy 320ms ease' }}
      />
    </svg>
  )
}

/* ============================ Le minuteur : le mecanisme =============== */

/** Le minuteur de round, et l enchainement qu il mene. */
function Minuteur(): ReactElement {
  const { reduced } = useMotionState()
  const [rang, setRang] = useState(0)
  const [ecoule, setEcoule] = useState(0)
  const [enMarche, setEnMarche] = useState(false)
  const depart = useRef(0)

  const round = ROUNDS[rang] ?? ROUNDS[0]
  const annonces = round?.annonces ?? []

  useEffect(() => {
    if (!enMarche) return
    const id = window.setInterval(() => {
      const passe = (Date.now() - depart.current) / 1000
      if (passe >= DUREE) {
        setEcoule(DUREE)
        setEnMarche(false)
        return
      }
      setEcoule(passe)
    }, 120)
    return () => {
      window.clearInterval(id)
    }
  }, [enMarche])

  // Changer de round remet la cloche a zero : un round ne se reprend pas au
  // milieu d un autre.
  useEffect(() => {
    setEcoule(0)
    setEnMarche(false)
  }, [rang])

  const reste = Math.max(0, DUREE - Math.floor(ecoule))
  const minutes = Math.floor(reste / 60)
  const secondes = reste % 60
  const fini = reste === 0

  let courante = 0
  for (const [index, annonce] of annonces.entries()) {
    if (ecoule >= annonce.a) courante = index
  }
  const active = annonces[courante]
  const suite = annonces.slice(courante + 1, courante + 4)

  return (
    <div className="o-grid o-gap-10 lg:o-grid-cols-12 lg:o-gap-12">
      {/* ------- La cloche ------- */}
      <div className="lg:o-col-span-5">
        <div className="o-flex o-flex-wrap o-gap-2">
          {ROUNDS.map((autre, index) => {
            const actif = index === rang
            return (
              <button
                key={autre.rang}
                type="button"
                aria-pressed={actif}
                onClick={() => {
                  setRang(index)
                }}
                className={`o-px-5 o-py-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-transition-colors focus:o-ring ${
                  actif ? '' : 'o-text-zinc-400 hover:o-text-zinc-50'
                }`}
                style={
                  actif
                    ? { ...aplat(), border: 0 }
                    : { border: 0, backgroundColor: 'var(--o-palette-zinc-900)' }
                }
              >
                Round {String(autre.rang)}
              </button>
            )
          })}
        </div>

        <ElectricBorder
          colors={['--o-vitrine-500', '--o-vitrine-300']}
          thickness={2}
          radius={20}
          speed={fini ? 900 : 2600}
          intensity={enMarche ? 0.9 : 0.35}
          className="o-mt-6 o-block"
        >
          <div
            className="o-p-8 md:o-p-10"
            style={{ backgroundColor: 'var(--o-palette-zinc-900)' }}
          >
            <p className="o-m-0 o-flex o-items-center o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              {enMarche && !reduced && (
                <span
                  data-o-bo-cloche=""
                  aria-hidden="true"
                  className="o-block o-size-1.5"
                  style={{ backgroundColor: accent(500) }}
                />
              )}
              Round {String(round?.rang ?? 1)} — {round?.nom ?? ''}
            </p>

            {/* Le compteur a rouleaux : trois chiffres et deux points. */}
            <p
              className="o-m-0 o-mt-6 o-flex o-items-end o-text-zinc-50"
              style={{
                fontFamily: 'var(--o-vitrine-affichage, var(--o-font-sans))',
                fontWeight: 400,
              }}
            >
              <span className="o-sr-only" aria-live="polite">
                {fini
                  ? 'Round termine'
                  : `${String(minutes)} minutes ${String(secondes)} secondes restantes`}
              </span>
              <Rouleau chiffre={minutes} />
              <span
                aria-hidden="true"
                className="o-px-1"
                style={{
                  fontSize: Math.round(ROULEAU * 0.6),
                  lineHeight: `${String(ROULEAU)}px`,
                }}
              >
                :
              </span>
              <Rouleau chiffre={Math.floor(secondes / 10)} />
              <Rouleau chiffre={secondes % 10} />
            </p>

            {/* La barre du round : la seule chose qui avance en continu. */}
            <div
              aria-hidden="true"
              className="o-mt-6 o-h-1 o-w-full o-overflow-hidden o-bg-white-10"
            >
              <span
                className="o-block o-h-full"
                style={{
                  width: `${String(Math.min(100, (ecoule / DUREE) * 100).toFixed(2))}%`,
                  backgroundColor: accent(500),
                }}
              />
            </div>

            <div className="o-mt-8 o-flex o-flex-wrap o-gap-3">
              <button
                type="button"
                onClick={() => {
                  if (fini) {
                    setEcoule(0)
                    depart.current = Date.now()
                    setEnMarche(true)
                    return
                  }
                  if (enMarche) {
                    setEnMarche(false)
                    return
                  }
                  depart.current = Date.now() - ecoule * 1000
                  setEnMarche(true)
                }}
                className="o-inline-flex o-items-center o-gap-2 o-px-7 o-py-3 o-text-sm o-font-semibold o-transition-opacity hover:o-opacity-85 focus:o-ring"
                style={{ ...aplat(), border: 0 }}
              >
                {fini
                  ? 'Refaire le round'
                  : enMarche
                    ? 'Arreter'
                    : ecoule > 0
                      ? 'Reprendre'
                      : 'Lancer le round'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEnMarche(false)
                  setEcoule(0)
                }}
                className="o-inline-flex o-items-center o-gap-2 o-border-w-1 o-border-white-20 o-px-7 o-py-3 o-text-sm o-font-semibold o-text-zinc-100 o-transition-colors hover:o-bg-white-10 focus:o-ring"
              >
                Remettre a zero
              </button>
            </div>

            <p className="o-m-0 o-mt-8 o-max-w-md o-text-sm o-leading-relaxed o-text-zinc-400">
              {round?.intention ?? ''}
            </p>
          </div>
        </ElectricBorder>
      </div>

      {/* ------- La cible, entre l horloge et les mots ------- */}
      <div className="o-flex o-flex-col o-items-center o-justify-center lg:o-col-span-3">
        <Cible zone={active?.zone ?? 'garde'} />
        <p className="o-m-0 o-mt-4 o-text-center o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
          La zone visee
        </p>
      </div>

      {/* ------- L annonce, et ce qui vient ------- */}
      <div className="lg:o-col-span-4">
        <div>
          <div className="o-min-w-0">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              {fini
                ? 'Fin du round'
                : `A ${String(Math.floor((active?.a ?? 0) / 60))} min ${String((active?.a ?? 0) % 60)} s`}
            </p>
            <GlitchHover intensity={5} slices={3} className="o-mt-4 o-block">
              <h3
                className="o-m-0 o-uppercase o-text-zinc-50"
                aria-live="polite"
                style={{
                  ...affiche('m', 400),
                  fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                  lineHeight: 0.92,
                }}
              >
                {fini ? 'Cloche' : (active?.coup ?? '')}
              </h3>
            </GlitchHover>
            <p className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-300">
              {fini
                ? 'Une minute de repos, puis on repart. Buvez debout, pas assis.'
                : (active?.detail ?? '')}
            </p>

            <ol className="o-m-0 o-mt-8 o-list-none o-border-t o-border-white-10 o-p-0">
              {suite.map((annonce) => (
                <li
                  key={annonce.a}
                  className="o-flex o-items-baseline o-justify-between o-gap-4 o-border-b o-border-white-10 o-py-3"
                >
                  <span className="o-text-sm o-text-zinc-300">{annonce.coup}</span>
                  <span className="o-font-mono o-text-xs o-uppercase o-tabular-nums o-tracking-widest o-text-zinc-500">
                    dans {String(Math.max(0, Math.round(annonce.a - ecoule)))} s
                  </span>
                </li>
              ))}
              {suite.length === 0 && (
                <li className="o-border-b o-border-white-10 o-py-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
                  Plus rien apres celui-la.
                </li>
              )}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#round', 'Le round'],
  ['#semaine', 'La semaine'],
  ['#essai', 'Premier cours'],
] as const

export default function Page(): ReactElement {
  const polices = usePolices('affiche')
  useFeuilleBoxe()

  return (
    <Porte forme="iris" marque="Corde a Sauter">
      <div className="o-relative" style={{ ...nuit('zinc'), ...polices }}>
        {/* ================= L ouverture : le champ electrique ============ */}
        <header
          className="o-relative o-isolate o-flex o-flex-col o-justify-between o-overflow-hidden"
          style={{ minHeight: `calc(100vh - ${String(CHROME)}px)` }}
        >
          <ElectricField
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0"
            speed={0.5}
            jitter={0.62}
            glow={0.4}
            branches={4}
            colors={['--o-palette-zinc-950', '--o-vitrine-400', '--o-palette-zinc-100']}
            fallback="o-bg-zinc-950"
          />
          <Grain opacite={0.07} />

          <BarreCoins
            marque="Corde a Sauter"
            liens={NAVIGATION}
            droite="Salle — 3 rue du Gazometre"
          />

          <div className="o-relative o-z-20 o-px-6 o-pt-6 md:o-px-10">
            <Surgit>
              <Etiquette>
                Salle de boxe anglaise — quartier du Gazometre — depuis 1994
              </Etiquette>
            </Surgit>
            <TitreVague
              delai={140}
              className="o-m-0 o-mt-8 o-max-w-5xl o-uppercase o-text-zinc-50"
              style={{
                ...affiche('l', 400),
                fontSize: 'clamp(2.5rem, 10vw, 9.5rem)',
                lineHeight: 0.82,
                letterSpacing: '-0.04em',
              }}
            >
              Corde a Sauter
            </TitreVague>
          </div>

          <div className="o-relative o-z-20 o-flex o-flex-wrap o-items-end o-justify-between o-gap-8 o-px-6 o-pb-12 md:o-px-10">
            <Surgit
              delai={520}
              as="p"
              className="o-m-0 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-300"
            >
              Trois minutes, une minute de repos, trois fois. C est toute la boxe, et c
              est deja beaucoup. Lancez le round ci-dessous : le coach y est.
            </Surgit>
            <Surgit delai={640}>
              <a
                href="#round"
                className="o-inline-flex o-items-center o-gap-2 o-px-7 o-py-4 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                style={aplat()}
              >
                Lancer un round <Icon icon={ArrowRight} size={16} aria-hidden="true" />
              </a>
            </Surgit>
          </div>
        </header>

        {/* ================= Le bandeau : le vocabulaire ================== */}
        <section
          aria-labelledby="bandeau-titre"
          className="o-overflow-hidden o-border-t o-border-b o-border-white-10 o-py-6"
        >
          <h2 id="bandeau-titre" className="o-sr-only">
            Le vocabulaire de la salle
          </h2>
          <Bandeau
            mots={VOCABULAIRE.map((mot) => mot.toUpperCase())}
            separateur="+"
            vitesse={58}
            taille="clamp(2rem, 6vw, 5.5rem)"
            className="o-uppercase o-text-zinc-50"
            style={{
              fontFamily: 'var(--o-vitrine-affichage, var(--o-font-sans))',
              letterSpacing: '-0.03em',
            }}
          />
          <Bandeau
            mots={['Trois minutes', 'Une minute', 'Trois fois', 'Et on recommence']}
            separateur="/"
            vitesse={44}
            inverse
            taille="clamp(1.25rem, 3vw, 2.75rem)"
            className="o-mt-4 o-uppercase"
            style={{
              fontFamily: 'var(--o-vitrine-affichage, var(--o-font-sans))',
              color: encreSurSombre(),
              letterSpacing: '-0.02em',
            }}
          />
        </section>

        {/* ================= Le round : le mecanisme ====================== */}
        <section
          id="round"
          className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
        >
          <div className="o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="01">Le round</Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="o-m-0 o-mt-6 o-max-w-3xl o-uppercase o-text-zinc-50"
                style={{
                  ...affiche('m', 400),
                  fontSize: 'clamp(1.85rem, 4.4vw, 3.75rem)',
                  lineHeight: 0.9,
                  letterSpacing: '-0.04em',
                }}
              >
                <EchoText copies={2} lag={180} spread={2} style={{ color: 'inherit' }}>
                  Trois minutes
                </EchoText>{' '}
                menees a la seconde.
              </h2>
            </Reveal>
            <p className="o-m-0 o-mt-6 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-300">
              Ce minuteur n est pas une decoration : il porte les annonces du coach aux
              secondes ou elles tombent vraiment, et la zone visee s allume avec elles.
            </p>
            <div className="o-mt-14">
              <Minuteur />
            </div>
          </div>
        </section>

        {/* ================= La semaine =================================== */}
        <section
          id="semaine"
          className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
        >
          <div className="o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="02">La semaine</Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="o-m-0 o-mt-6 o-max-w-2xl o-uppercase o-text-zinc-50"
                style={{
                  ...affiche('m', 400),
                  fontSize: 'clamp(1.6rem, 3.6vw, 2.75rem)',
                  lineHeight: 0.92,
                  letterSpacing: '-0.04em',
                }}
              >
                Six seances, un seul vestiaire.
              </h2>
            </Reveal>

            <ol className="o-m-0 o-mt-14 o-list-none o-border-t o-border-white-10 o-p-0">
              {SEMAINE.map((seance) => (
                <li
                  key={seance.jour}
                  className="o-grid o-items-baseline o-gap-x-6 o-gap-y-1 o-border-b o-border-white-10 o-py-6 md:o-grid-cols-12"
                >
                  <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400 md:o-col-span-2">
                    {seance.jour}
                  </span>
                  <span className="o-font-mono o-text-sm o-tabular-nums o-text-zinc-100 md:o-col-span-2">
                    {seance.heure}
                  </span>
                  <span
                    className="o-uppercase o-text-zinc-50 md:o-col-span-4"
                    style={{
                      ...affiche('m', 400),
                      fontSize: 'clamp(1.1rem, 2vw, 1.6rem)',
                      lineHeight: 1,
                    }}
                  >
                    {seance.nom}
                  </span>
                  <span className="o-text-sm o-text-zinc-400 md:o-col-span-3">
                    {seance.qui}
                  </span>
                  <span
                    className="o-font-mono o-text-xs o-uppercase o-tracking-widest md:o-col-span-1 md:o-text-right"
                    style={{
                      color:
                        seance.places === 'Complet'
                          ? 'var(--o-palette-zinc-500)'
                          : encreSurSombre(),
                    }}
                  >
                    {seance.places}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ================= L appel : un seul bouton, plein cadre (A25) == */}
        <section
          id="essai"
          className="o-scroll-mt-24 o-px-6 o-py-14 md:o-px-10 md:o-py-20"
        >
          <a
            href="#semaine"
            className="o-flex o-w-full o-flex-col o-items-center o-justify-center o-gap-4 o-px-6 o-py-20 o-text-center o-no-underline o-transition-opacity hover:o-opacity-90 focus:o-ring md:o-py-28"
            style={aplat()}
          >
            <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-opacity-80">
              Mardi, 19 h — gants et bandes fournis
            </span>
            <span
              className="o-uppercase"
              style={{
                ...affiche('xl', 400),
                fontSize: 'clamp(2.25rem, 9vw, 8rem)',
                lineHeight: 0.84,
                letterSpacing: '-0.045em',
              }}
            >
              Le premier cours est offert
            </span>
            <span className="o-mt-2 o-inline-flex o-items-center o-gap-2 o-font-mono o-text-sm o-uppercase o-tracking-widest">
              Pousser la porte <Icon icon={ArrowRight} size={16} aria-hidden="true" />
            </span>
          </a>
        </section>

        {/* ================= Le pied : le mot-marque en negatif (P20) ===== */}
        <footer>
          <div className="o-overflow-hidden o-px-4 o-py-10" style={aplat()}>
            <p
              aria-hidden="true"
              className="o-m-0 o-select-none o-whitespace-nowrap o-text-center o-uppercase"
              style={{
                ...affiche('xxl', 400),
                fontSize: 'clamp(2rem, 13.5vw, 15rem)',
                lineHeight: 0.84,
                letterSpacing: '-0.05em',
              }}
            >
              Corde a Sauter
            </p>
          </div>
          <div className="o-mx-auto o-grid o-max-w-6xl o-gap-8 o-px-6 o-py-12 md:o-px-10 sm:o-grid-cols-3">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
              3 rue du Gazometre
              <br />
              Sous-sol, entree par la cour
              <br />
              Ouvert 12 h — 14 h et 17 h — 22 h
            </p>
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
              Club affilie a la federation
              <br />
              Deux entraineurs diplomes
              <br />
              Licence annuelle 148 EUR
            </p>
            <nav aria-label="Liens utiles">
              <ul className="o-m-0 o-list-none o-space-y-2 o-p-0">
                {[
                  'Le reglement de la salle',
                  'Materiel et vestiaires',
                  'Competition amateur',
                  'Nous ecrire',
                ].map((lien) => (
                  <li key={lien}>
                    <a
                      href="#round"
                      className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400 o-no-underline o-transition-colors hover:o-text-zinc-50 focus:o-ring"
                    >
                      {lien}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <p className="o-mx-auto o-max-w-6xl o-border-t o-border-white-10 o-px-6 o-py-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 md:o-px-10">
            Corde a Sauter — association loi 1901 — © 2026. Les enchainements publies sont
            ceux des seances du mardi.
          </p>
        </footer>
      </div>
    </Porte>
  )
}
