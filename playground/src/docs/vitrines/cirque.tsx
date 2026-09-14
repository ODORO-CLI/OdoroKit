/**
 * Chapiteau — cirque contemporain.
 *
 * ## La reference : Tenora (Framer)
 *
 * Des degrades pastel, des tuiles inegales, et surtout **l escalier de
 * pixels** : la couture entre deux surfaces n est ni un trait ni un fondu,
 * c est une marche de carres qui descend. On lui prend cela, et sa maniere de
 * poser un titre enorme et rond au-dessus d une scene qui flotte.
 *
 * ## Le mecanisme : le montage
 *
 * Dix etapes, et le chapiteau se monte pour de bon. Le diorama
 * (`Profondeur` + `Couche`) tient la scene collee pendant six ecrans et n
 * ecrit qu une variable — `--p`. **Tout le chapiteau est du CSS pur** : chaque
 * piquet, chaque mat, chaque pan de toile lit `--p` dans un `clamp()` et
 * apparait, se leve ou se tend a son tour. Une scene de cinquante pieces ne
 * coute donc qu un abonnement, et le compositeur fait le reste.
 *
 * Sous mouvement reduit, `--p` est pose a un : le chapiteau est monte, et les
 * dix etapes se lisent les unes sous les autres. Ce que la scene racontait,
 * le texte le dit.
 *
 * ## Ce qui n est pas photographie
 *
 * Tout. Le chapiteau, les caravanes, les numeros, le compteur a rouleaux,
 * l etiquette de bagage du pied : un cirque qui voyage n a pas de banque
 * d images, il a un carnet de route.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { Reveal, useInView } from '@odoro-cli/libs/motion'
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { FloatingShapes } from '@/odoro/background/FloatingShapes.jsx'
import { WarpText } from '@/odoro/text/WarpText.jsx'
import { StarBorder } from '@/odoro/ui/StarBorder.jsx'

import { nuit } from './communs.jsx'
import { accent, accentDoux, aplat, encreSurSombre } from './palettes.js'
import {
  Actions,
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
import { Couche, Profondeur } from './scene.jsx'

/* ============================ Le montage =============================== */

/** Une etape du montage : ce qu on fait, avec qui, en combien de temps. */
interface Etape {
  readonly rang: string
  readonly titre: string
  readonly texte: string
  readonly equipe: string
  /** Duree de l etape, en minutes — la somme fait la journee. */
  readonly minutes: number
}

const ETAPES = [
  {
    rang: '01',
    titre: 'Le piquetage',
    texte:
      'On trace le cercle a la corde depuis le centre. Vingt-quatre reperes, un tous les quinze degres, et la porte toujours dos au vent dominant.',
    equipe: '2 personnes',
    minutes: 45,
  },
  {
    rang: '02',
    titre: 'Les ancrages',
    texte:
      'Douze pieux de 1,20 m battus au mouton hydraulique. Sur un sol gorge d eau on double, et on perd une heure : c est la seule etape qui depend du ciel.',
    equipe: '4 personnes',
    minutes: 110,
  },
  {
    rang: '03',
    titre: 'Le mat de centre',
    texte:
      'Onze metres d aluminium en trois troncons, monte au treuil depuis sa base. Une fois debout, plus rien ne le fera bouger de la journee.',
    equipe: '5 personnes',
    minutes: 60,
  },
  {
    rang: '04',
    titre: 'Les mats de peripherie',
    texte:
      'Six mats couches en etoile, tete vers le centre, pieds sur leurs ancrages. On ne les leve pas encore : la toile doit passer par-dessus.',
    equipe: '4 personnes',
    minutes: 40,
  },
  {
    rang: '05',
    titre: 'La toile au sol',
    texte:
      'Quatre cent dix metres carres deroules a plat autour du mat, coutures vers le haut. C est le moment ou l on voit si la bache a souffert de la derniere ville.',
    equipe: '6 personnes',
    minutes: 55,
  },
  {
    rang: '06',
    titre: 'Le lacage',
    texte:
      'Huit pans laces l un a l autre, a la main, trois cents oeillets. Un lacage trop serre au sol se paie au levage : la toile ne monte plus droit.',
    equipe: '6 personnes',
    minutes: 70,
  },
  {
    rang: '07',
    titre: 'Le levage',
    texte:
      'La couronne monte le long du mat, et la toile avec elle. Deux minutes de treuil, et personne ne parle : c est la seule etape ou tout le monde regarde la meme chose.',
    equipe: '7 personnes',
    minutes: 15,
  },
  {
    rang: '08',
    titre: 'Les mats releves',
    texte:
      'Les six mats de peripherie se redressent un a un, dans le sens des aiguilles. Le chapiteau prend sa forme en quarante minutes.',
    equipe: '6 personnes',
    minutes: 40,
  },
  {
    rang: '09',
    titre: 'Les haubans',
    texte:
      'Douze haubans tendus au palan, puis retendus une heure plus tard : une toile neuve travaille encore, et une toile detendue claque toute la nuit.',
    equipe: '3 personnes',
    minutes: 50,
  },
  {
    rang: '10',
    titre: 'La piste et les gradins',
    texte:
      'Treize metres de piste, deux cent quarante places en gradin, le tapis, et le fanion en dernier. On ouvre trois heures apres.',
    equipe: '8 personnes',
    minutes: 135,
  },
] as const satisfies readonly Etape[]

/**
 * L apparition d une piece du chapiteau, en fonction de l avancement.
 *
 * `--p` va de zero a un sur toute la traversee ; une piece de l etape `n`
 * arrive entre `n/10` et `n/10 + 0,06`. Le `clamp` fait tout : il n y a ni
 * etat, ni classe, ni observateur.
 */
function apparait(etape: number, apres = 0): CSSProperties {
  const seuil = (etape - 1) / ETAPES.length + apres
  return { opacity: `clamp(0, calc((var(--p, 0) - ${seuil.toFixed(3)}) * 16), 1)` }
}

/** La meme progression, rendue comme un facteur de zero a un. */
function part(etape: number, apres = 0): string {
  const seuil = (etape - 1) / ETAPES.length + apres
  return `clamp(0, calc((var(--p, 0) - ${seuil.toFixed(3)}) * 16), 1)`
}

/* ============================ Le chapiteau, dessine ==================== */

/** La toile : huit pans et un bord festonne. */
const TOILE =
  'M168 430 C 236 214 396 150 600 146 C 804 150 964 214 1032 430 C 962 468 886 430 806 460 C 726 490 686 438 600 460 C 514 482 474 434 394 460 C 314 486 238 466 168 430 Z'

/** Les six mats de peripherie, par leur abscisse au sol. */
const MATS = [232, 330, 470, 730, 870, 968] as const

/** Le chapiteau qui se monte : cinquante pieces, une seule variable. */
function Chapiteau(): ReactElement {
  const piquets = useMemo(
    () =>
      Array.from({ length: 24 }, (_, rang) => {
        const angle = (rang / 24) * Math.PI * 2
        return { x: 600 + Math.cos(angle) * 408, y: 552 + Math.sin(angle) * 64 }
      }),
    [],
  )
  const pieux = useMemo(
    () =>
      Array.from({ length: 12 }, (_, rang) => {
        const angle = (rang / 12) * Math.PI * 2 + 0.26
        return { x: 600 + Math.cos(angle) * 512, y: 552 + Math.sin(angle) * 84 }
      }),
    [],
  )
  const trait = accentDoux(300, 62)

  return (
    <svg
      viewBox="0 0 1200 700"
      className="o-h-full o-w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Le chapiteau se monte : piquetage, ancrages, mat de centre, mats de peripherie, toile, lacage, levage, haubans, piste et fanion."
    >
      {/* Le sol. */}
      <path d="M0 620h1200" stroke={accentDoux(300, 26)} strokeWidth="1.5" />

      {/* 01 — le piquetage. */}
      <g style={apparait(1)}>
        {piquets.map((p) => (
          <path
            key={`${String(p.x)}-${String(p.y)}`}
            d={`M${p.x.toFixed(0)} ${(p.y - 7).toFixed(0)}v14M${(p.x - 7).toFixed(0)} ${p.y.toFixed(0)}h14`}
            stroke={trait}
            strokeWidth="1.6"
          />
        ))}
      </g>

      {/* 02 — les ancrages. */}
      <g style={apparait(2)}>
        {pieux.map((p) => (
          <path
            key={`${String(p.x)}-${String(p.y)}`}
            d={`M${p.x.toFixed(0)} ${p.y.toFixed(0)}l0 -26`}
            stroke={accent(400)}
            strokeWidth="4"
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* 03 — le mat de centre, qui pousse depuis sa base. */}
      <g
        style={{
          ...apparait(3),
          transformOrigin: '600px 560px',
          transform: `scaleY(${part(3, 0.01)})`,
        }}
      >
        <path
          d="M600 560V142"
          stroke={accentDoux(200, 80)}
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle
          cx="600"
          cy="138"
          r="12"
          fill="none"
          stroke={accent(400)}
          strokeWidth="4"
        />
      </g>

      {/* 04 — les mats couches, tete vers le centre. */}
      <g style={{ opacity: `calc(${part(4)} - ${part(8)})` }}>
        {MATS.map((x) => (
          <path
            key={x}
            d={`M${String(x)} 556L${String(x + (x < 600 ? 120 : -120))} 548`}
            stroke={accentDoux(200, 60)}
            strokeWidth="5"
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* 05 et 06 — la toile au sol, puis ses coutures lacees. */}
      <g style={{ opacity: `calc(${part(5)} - ${part(7, 0.02)})` }}>
        <ellipse
          cx="600"
          cy="546"
          rx="392"
          ry="58"
          fill={accentDoux(700, 22)}
          stroke={trait}
          strokeWidth="1.5"
        />
        <g style={apparait(6)}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((rang) => {
            const angle = (rang / 8) * Math.PI * 2
            return (
              <path
                key={rang}
                d={`M600 546L${(600 + Math.cos(angle) * 392).toFixed(0)} ${(546 + Math.sin(angle) * 58).toFixed(0)}`}
                stroke={accent(400)}
                strokeWidth="1.4"
                strokeDasharray="4 7"
              />
            )
          })}
        </g>
      </g>

      {/* 07 — le levage : la toile monte le long du mat. */}
      <g
        style={{
          ...apparait(7),
          transform: `translate3d(0, calc((1 - ${part(7, 0.015)}) * 320px), 0)`,
        }}
      >
        <path
          d={TOILE}
          fill={accentDoux(700, 30)}
          stroke={accent(400)}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Les huit pans, tires de la couronne vers le bord. */}
        {[-1, -0.72, -0.42, -0.14, 0.14, 0.42, 0.72, 1].map((u) => (
          <path
            key={u}
            d={`M600 150L${(600 + u * 426).toFixed(0)} ${(432 + Math.abs(u) * 22).toFixed(0)}`}
            stroke={accentDoux(200, 34)}
            strokeWidth="1.4"
          />
        ))}
      </g>

      {/* 08 — les mats de peripherie se redressent. */}
      <g style={apparait(8)}>
        {MATS.map((x, rang) => (
          <path
            key={x}
            d={`M${String(x)} 560V${String(392 + (rang % 2) * 14)}`}
            stroke={accentDoux(200, 80)}
            strokeWidth="5"
            strokeLinecap="round"
            style={{
              transformOrigin: `${String(x)}px 560px`,
              transform: `scaleY(${part(8, rang * 0.006)})`,
            }}
          />
        ))}
      </g>

      {/* 09 — les haubans, du bord de toile aux pieux. */}
      <g style={apparait(9)}>
        {pieux.map((p, rang) => (
          <path
            key={`h-${String(rang)}`}
            d={`M${(600 + (p.x - 600) * 0.78).toFixed(0)} ${(452 - Math.abs(p.x - 600) * 0.02).toFixed(0)}L${p.x.toFixed(0)} ${(p.y - 22).toFixed(0)}`}
            stroke={accentDoux(300, 34)}
            strokeWidth="1.2"
          />
        ))}
      </g>

      {/* 10 — la piste, les gradins, la porte, le fanion. */}
      <g style={apparait(10)}>
        <ellipse
          cx="600"
          cy="556"
          rx="150"
          ry="26"
          fill="none"
          stroke={accent(500)}
          strokeWidth="3"
        />
        <ellipse
          cx="600"
          cy="556"
          rx="292"
          ry="46"
          fill="none"
          stroke={trait}
          strokeWidth="1.4"
          strokeDasharray="8 9"
        />
        <path
          d="M544 560v-92a56 56 0 0 1 112 0v92"
          fill={accentDoux(900, 60)}
          stroke={accent(400)}
          strokeWidth="2"
        />
        <path d="M600 138l86 -20-86 -22z" fill={accent(500)} />
      </g>
    </svg>
  )
}

/* ============================ Le compteur a rouleaux =================== */

/**
 * Un rouleau de compteur mecanique.
 *
 * La colonne porte les dix chiffres ; la fenetre n en laisse voir qu un. Elle
 * part de zero et roule jusqu au chiffre voulu, chaque rouleau un peu apres
 * son voisin de gauche — c est ce decalage qui fait l objet mecanique plutot
 * qu une suite de nombres qui changent.
 */
function Rouleau({
  chiffre,
  rang,
  lance,
}: {
  readonly chiffre: number
  readonly rang: number
  readonly lance: boolean
}): ReactElement {
  const { reduced } = useMotionState()
  // Sous mouvement reduit la valeur est posee telle quelle : elle n attend
  // meme pas d entrer dans le champ, elle est deja la.
  const pose = lance || reduced
  const tours = reduced ? chiffre : chiffre + 20
  return (
    <span
      aria-hidden="true"
      className="o-relative o-block o-overflow-hidden o-tabular-nums"
      style={{
        height: '1.15em',
        width: '0.72em',
        backgroundColor: accentDoux(950, 70),
        boxShadow: `inset 0 6px 10px -6px rgb(0 0 0 / 0.9), inset 0 -6px 10px -6px rgb(0 0 0 / 0.9)`,
      }}
    >
      <span
        className="o-absolute o-inset-x-0 o-top-0 o-block o-text-center"
        style={{
          transform: `translate3d(0, ${String(pose ? -(tours % 10) * 1.15 - Math.floor(tours / 10) * 11.5 : 0)}em, 0)`,
          transition: reduced
            ? undefined
            : `transform ${String(2400 + rang * 260)}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
        }}
      >
        {Array.from({ length: tours + 2 }, (_, i) => (
          <span
            key={i}
            className="o-block"
            style={{ height: '1.15em', lineHeight: '1.15em' }}
          >
            {i % 10}
          </span>
        ))}
      </span>
    </span>
  )
}

/** Le compteur : une valeur, ses rouleaux, et ce qu elle compte. */
function Compteur({
  valeur,
  quoi,
  note,
}: {
  readonly valeur: number
  readonly quoi: string
  readonly note: string
}): ReactElement {
  const [hote, vu] = useInView<HTMLDivElement>({ threshold: 0.4, once: true })
  const chiffres = String(valeur).padStart(6, '0').split('').map(Number)
  return (
    <div ref={hote}>
      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
        {quoi}
      </p>
      <p
        className="o-m-0 o-mt-4 o-flex o-gap-1"
        style={{
          ...affiche('m', 700),
          fontSize: 'clamp(2.25rem, 6vw, 5rem)',
          color: 'var(--o-palette-zinc-50)',
        }}
      >
        <span className="o-sr-only">{valeur.toLocaleString('fr-FR')}</span>
        {chiffres.map((chiffre, rang) => (
          <Rouleau key={rang} chiffre={chiffre} rang={rang} lance={vu} />
        ))}
      </p>
      <p className="o-m-0 o-mt-4 o-max-w-xs o-text-sm o-leading-relaxed o-text-zinc-400">
        {note}
      </p>
    </div>
  )
}

/* ============================ L escalier de pixels ===================== */

/** La couture de Tenora : une marche de carres, pas un trait. */
function Escalier({
  vers,
  hauteur = 12,
}: {
  readonly vers: string
  readonly hauteur?: number
}): ReactElement {
  const rangees = 5
  return (
    <div
      aria-hidden="true"
      className="o-relative o-overflow-hidden"
      style={{ height: hauteur * rangees }}
    >
      {Array.from({ length: rangees }, (_, r) => (
        <div key={r} className="o-flex" style={{ height: hauteur }}>
          {Array.from({ length: 40 }, (_, c) => (
            <span
              key={c}
              className="o-grow"
              style={{ backgroundColor: (c + r * 7) % 9 < 5 - r ? vers : 'transparent' }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/* ============================ Les numeros ============================== */

/** Un numero du spectacle, et sa place dans la mosaique. */
const NUMEROS: readonly {
  readonly nom: string
  readonly discipline: string
  readonly duree: string
  readonly texte: string
  /** Colonnes prises dans la mosaique de six. */
  readonly colonnes: 2 | 4 | 6
}[] = [
  {
    nom: 'Le fil, a trois',
    discipline: 'Fil souple',
    duree: '9 min',
    texte:
      'Un fil de six metres, trois corps dessus, et aucun balancier. Le numero se joue sans musique : on entend le fil.',
    colonnes: 6,
  },
  {
    nom: 'Mat chinois',
    discipline: 'Mat',
    duree: '7 min',
    texte: 'Neuf metres, une descente en chute libre arretee a un metre du tapis.',
    colonnes: 2,
  },
  {
    nom: 'Portes',
    discipline: 'Main a main',
    duree: '11 min',
    texte: 'Douze portes enchainees sans repose au sol.',
    colonnes: 2,
  },
  {
    nom: 'La roue',
    discipline: 'Roue Cyr',
    duree: '6 min',
    texte: 'Une roue, un cercle de piste, et la meme vitesse du debut a la fin.',
    colonnes: 2,
  },
  {
    nom: 'Final — la bascule',
    discipline: 'Bascule coreenne',
    duree: '13 min',
    texte:
      'Sept personnes, une bascule, et un triple qui n est pas garanti : il tombe une fois sur quatre, et on le laisse tomber.',
    colonnes: 4,
  },
]

/* ============================ Le compte a rebours ====================== */

/** La cloture des reservations pour la ville en cours. */
const CLOTURE = new Date('2026-10-04T19:00:00+02:00')

/** Le compte a rebours, lu sur l horloge du visiteur. */
function Rebours(): ReactElement {
  const [reste, setReste] = useState(() => CLOTURE.getTime() - Date.now())
  useEffect(() => {
    const id = window.setInterval(() => {
      setReste(CLOTURE.getTime() - Date.now())
    }, 1000)
    return () => {
      window.clearInterval(id)
    }
  }, [])

  if (reste <= 0) {
    return (
      <p
        className="o-m-0 o-text-zinc-300"
        style={{ ...affiche('m', 700), fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
      >
        Les reservations sont closes. Le chapiteau se demonte lundi.
      </p>
    )
  }

  const secondes = Math.floor(reste / 1000)
  const cases = [
    [Math.floor(secondes / 86400), 'jours'],
    [Math.floor((secondes % 86400) / 3600), 'heures'],
    [Math.floor((secondes % 3600) / 60), 'minutes'],
    [secondes % 60, 'secondes'],
  ] as const

  return (
    <dl className="o-m-0 o-flex o-flex-wrap o-gap-6" aria-live="off">
      {cases.map(([valeur, quoi]) => (
        <div key={quoi} className="o-min-w-0">
          <dt
            className="o-tabular-nums"
            style={{
              ...affiche('m', 700),
              fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
              lineHeight: 0.86,
              color: 'var(--o-palette-zinc-50)',
            }}
          >
            {String(valeur).padStart(2, '0')}
          </dt>
          <dd className="o-m-0 o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
            {quoi}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#montage', 'Le montage'],
  ['#route', 'La route'],
  ['#numeros', 'Les numeros'],
  ['#venir', 'Venir'],
] as const

/** La tournee de la saison : les villes, et ce qu on y a monte. */
const ROUTE: readonly (readonly [string, string, string])[] = [
  ['Avril', 'Sete — esplanade du port', '11 representations'],
  ['Juin', 'Clermont — parc Montjuzet', '9 representations'],
  ['Aout', 'Brest — plateau des Capucins', '14 representations'],
  ['Octobre', 'Nancy — prairie de la Meurthe', '12 representations'],
]

export default function Page(): ReactElement {
  const polices = usePolices('syne')
  const { reduced } = useMotionState()

  const journee = useMemo(() => {
    const total = ETAPES.reduce((somme, etape) => somme + etape.minutes, 0)
    return { heures: Math.floor(total / 60), minutes: total % 60 }
  }, [])

  return (
    <Porte forme="iris" marque="Chapiteau">
      <div className="o-relative" style={{ ...nuit('zinc'), ...polices }}>
        {/* ================= L ouverture : les formes qui flottent ======== */}
        <header
          className="o-relative o-isolate o-flex o-flex-col o-overflow-hidden"
          style={{ minHeight: `calc(100vh - ${String(CHROME)}px)` }}
        >
          <FloatingShapes
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0"
            shapes={16}
            speed={0.7}
            parallax={1.2}
            colors={['--o-palette-zinc-950', '--o-vitrine-500', '--o-vitrine-300']}
            poster="o-bg-zinc-950"
          />
          <div
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0"
            style={{
              background: `radial-gradient(120% 78% at 50% 106%, ${accentDoux(700, 46)} 0%, transparent 64%)`,
            }}
          />
          <div
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-10"
            style={{
              background: `radial-gradient(46% 34% at 50% 44%, ${accentDoux(950, 94)} 0%, transparent 76%)`,
            }}
          />
          <Grain opacite={0.07} />

          <BarreCoins
            marque="Chapiteau"
            liens={NAVIGATION}
            droite="Cirque contemporain — en tournee"
          />

          <div className="o-relative o-z-20 o-flex o-grow o-flex-col o-justify-between o-gap-10 o-px-6 o-pb-12 o-pt-10 md:o-px-10">
            <div className="o-text-center">
              <Surgit>
                <Etiquette>Creation 2026 · sept interpretes · 240 places</Etiquette>
              </Surgit>
              <WarpText
                as="h1"
                amplitude={26}
                inclinaison={7}
                course={1.2}
                className="o-m-0 o-mt-8 o-uppercase o-text-zinc-50"
                style={{
                  ...affiche('xl', 700),
                  fontSize: 'clamp(2.75rem, 13vw, 12rem)',
                  lineHeight: 0.86,
                  letterSpacing: '-0.045em',
                }}
              >
                Chapiteau
              </WarpText>
              <Surgit
                delai={480}
                as="p"
                className="o-mx-auto o-m-0 o-mt-8 o-max-w-xl o-text-lg o-leading-relaxed o-text-zinc-300"
              >
                Une toile de quatre cent dix metres carres, montee en huit heures, et un
                spectacle qui ne tient qu au sol sur lequel on l a plantee.
              </Surgit>
              <Surgit delai={600} className="o-mt-9 o-flex o-justify-center">
                <Actions
                  pleine={['#venir', 'Reserver a Nancy']}
                  fantome={['#montage', 'Voir le montage']}
                />
              </Surgit>
            </div>

            <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
              <TitreVague
                as="p"
                delai={700}
                className="o-m-0 o-max-w-xs o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400"
              >
                On monte le mardi, on joue du jeudi au dimanche, on demonte le lundi.
              </TitreVague>
              <Surgit
                delai={760}
                as="p"
                className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400 md:o-text-right"
              >
                Prairie de la Meurthe, Nancy
                <br />
                <span style={{ color: encreSurSombre() }}>Jusqu au 4 octobre</span>
              </Surgit>
            </div>
          </div>
        </header>

        <Escalier vers={accentDoux(950, 88)} />

        <main>
          {/* ================= Le mecanisme : le diorama du montage ======= */}
          <section id="montage" className="o-scroll-mt-24">
            <Profondeur
              ecrans={7}
              actes={ETAPES.length}
              course={70}
              glisse={0.78}
              style={
                {
                  '--p': reduced ? 1 : 0,
                  backgroundColor: accentDoux(950, 80),
                } as CSSProperties
              }
              hud={(acte: number) => {
                const etape = ETAPES[acte] ?? ETAPES[0]
                return (
                  <div className="o-flex o-h-full o-flex-col o-justify-between o-px-6 o-py-6 md:o-px-10 md:o-py-8">
                    <div className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-4">
                      <Indice rang="01">Le montage, en dix etapes</Indice>
                      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                        {etape.equipe} · {String(etape.minutes)} min
                      </p>
                    </div>
                    <div className="o-max-w-md">
                      <p
                        className="o-m-0 o-tabular-nums"
                        style={{
                          ...affiche('m', 700),
                          fontSize: 'clamp(3rem, 9vw, 7rem)',
                          lineHeight: 0.8,
                          color: accent(400),
                        }}
                      >
                        {etape.rang}
                      </p>
                      <h2
                        className="o-m-0 o-mt-3 o-text-zinc-50"
                        style={{
                          ...affiche('m', 700),
                          fontSize: 'clamp(1.5rem, 3.4vw, 2.75rem)',
                          lineHeight: 0.95,
                        }}
                      >
                        {etape.titre}
                      </h2>
                      <p className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-300">
                        {etape.texte}
                      </p>
                    </div>
                  </div>
                )
              }}
            >
              <Couche profondeur={0}>
                <div
                  className="o-absolute o-inset-0"
                  style={{
                    background: `linear-gradient(180deg, ${accentDoux(950, 92)} 0%, ${accentDoux(800, 34)} 68%, ${accentDoux(700, 44)} 100%)`,
                  }}
                />
              </Couche>
              <Couche profondeur={0.08} derive={16}>
                <svg
                  viewBox="0 0 1200 300"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="o-absolute o-inset-x-0 o-bottom-0 o-h-1/3 o-w-full"
                >
                  <path
                    d="M0 300V196c120-26 180 14 300-16s180-48 300-20 200 44 300 22 200-42 300-28v144z"
                    fill={accentDoux(900, 52)}
                  />
                </svg>
              </Couche>
              <Couche profondeur={0.06}>
                <div className="o-absolute o-inset-0 o-flex o-items-center o-justify-center">
                  <div className="o-h-full o-w-full o-max-w-6xl">
                    <Chapiteau />
                  </div>
                </div>
              </Couche>
              <Couche profondeur={0.24} derive={30}>
                {/* Les caravanes, garees au bord du terrain. */}
                <svg
                  viewBox="0 0 1200 200"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="o-absolute o-inset-x-0 o-bottom-0 o-h-16 o-w-full"
                >
                  {[80, 250, 940, 1080].map((x) => (
                    <g key={x}>
                      <rect
                        x={x}
                        y="110"
                        width="126"
                        height="56"
                        rx="8"
                        fill={accentDoux(900, 70)}
                        stroke={accentDoux(300, 30)}
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={x + 30}
                        cy="168"
                        r="9"
                        fill="none"
                        stroke={accentDoux(300, 30)}
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={x + 96}
                        cy="168"
                        r="9"
                        fill="none"
                        stroke={accentDoux(300, 30)}
                        strokeWidth="1.5"
                      />
                    </g>
                  ))}
                </svg>
              </Couche>
              <Couche profondeur={0.62} derive={54}>
                <svg
                  viewBox="0 0 1200 120"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="o-absolute o-inset-x-0 o-bottom-0 o-h-20 o-w-full"
                >
                  <path
                    d="M0 120V54c90 18 150-10 240 6s150 30 240 8 150-30 240-10 150 34 240 12 150-26 240-6v56z"
                    fill={accentDoux(950, 96)}
                  />
                </svg>
              </Couche>
            </Profondeur>
          </section>

          {/* ================= Le total, et la route ====================== */}
          <section
            id="route"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          >
            <div className="o-mx-auto o-grid o-max-w-6xl o-gap-12 md:o-grid-cols-12">
              <div className="o-min-w-0 md:o-col-span-7">
                <Reveal>
                  <Indice rang="02">La route</Indice>
                </Reveal>
                <Reveal delay={80}>
                  <h2
                    className="o-m-0 o-mt-6 o-max-w-xl o-text-zinc-50"
                    style={{
                      ...affiche('m', 700),
                      fontSize: 'clamp(1.85rem, 4.4vw, 3.5rem)',
                      lineHeight: 0.92,
                    }}
                  >
                    {journee.heures} h {String(journee.minutes).padStart(2, '0')} de
                    montage, quatre villes, une seule toile.
                  </h2>
                </Reveal>
                <p className="o-m-0 o-mt-6 o-max-w-lg o-text-base o-leading-relaxed o-text-zinc-300">
                  C est la somme des dix etapes ci-dessus, sans les pauses. Multipliee par
                  quatre villes et deux mouvements par ville, elle fait la moitie du
                  travail de l annee.
                </p>
                <ol className="o-m-0 o-mt-12 o-list-none o-border-t o-border-white-10 o-p-0">
                  {ROUTE.map(([mois, lieu, combien]) => (
                    <li
                      key={lieu}
                      className="o-grid o-items-baseline o-gap-2 o-border-b o-border-white-10 o-py-5 md:o-grid-cols-12 md:o-gap-6"
                    >
                      <span
                        className="o-font-mono o-text-xs o-uppercase o-tracking-widest md:o-col-span-3"
                        style={{ color: encreSurSombre() }}
                      >
                        {mois}
                      </span>
                      <span className="o-min-w-0 o-text-lg o-text-zinc-50 md:o-col-span-5">
                        {lieu}
                      </span>
                      <span className="o-whitespace-nowrap o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400 md:o-col-span-4 md:o-text-right">
                        {combien}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Le compteur a rouleaux : la forme C17. */}
              <div className="o-min-w-0 md:o-col-span-5">
                <div
                  className="o-flex o-flex-col o-gap-10 o-p-8"
                  style={{
                    backgroundColor: accentDoux(950, 76),
                    boxShadow: `inset 0 0 0 1px ${accentDoux(300, 22)}`,
                  }}
                >
                  <Compteur
                    valeur={41208}
                    quoi="Kilometres depuis 2019"
                    note="Le compteur du camion-porteur, releve au retour de chaque ville. Il ne compte pas les allers-retours a la dechetterie."
                  />
                  <Compteur
                    valeur={128460}
                    quoi="Spectateurs depuis 2019"
                    note="Billets vendus, invitations comprises, scolaires compris. Sept saisons, quatre-vingt-onze villes."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ================= Les numeros, en mosaique inegale ============ */}
          <section
            id="numeros"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
            style={{ backgroundColor: accentDoux(950, 84) }}
          >
            <div className="o-mx-auto o-max-w-6xl">
              <Reveal>
                <Indice rang="03">Le spectacle</Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="o-m-0 o-mt-6 o-max-w-2xl o-text-zinc-50"
                  style={{
                    ...affiche('m', 700),
                    fontSize: 'clamp(1.85rem, 4.4vw, 3.5rem)',
                    lineHeight: 0.92,
                  }}
                >
                  Cinq numeros, quarante-six minutes, aucun entracte.
                </h2>
              </Reveal>

              <div className="o-mt-14 o-grid o-gap-4 md:o-grid-cols-6">
                {NUMEROS.map((numero, rang) => {
                  const contenu: ReactNode = (
                    <div
                      className="o-flex o-h-full o-flex-col o-justify-between o-gap-8 o-p-7"
                      style={{
                        backgroundColor: accentDoux(900, 44),
                        minHeight: numero.colonnes >= 4 ? '15rem' : '13rem',
                      }}
                    >
                      <p className="o-m-0 o-flex o-items-baseline o-justify-between o-gap-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                        <span>{numero.discipline}</span>
                        <span style={{ color: encreSurSombre() }}>{numero.duree}</span>
                      </p>
                      <div>
                        <h3
                          className="o-m-0 o-text-zinc-50"
                          style={{
                            ...affiche('m', 700),
                            fontSize:
                              numero.colonnes >= 4
                                ? 'clamp(1.5rem, 3.2vw, 2.5rem)'
                                : 'clamp(1.2rem, 2vw, 1.6rem)',
                            lineHeight: 0.96,
                          }}
                        >
                          {numero.nom}
                        </h3>
                        <p className="o-m-0 o-mt-3 o-max-w-sm o-text-sm o-leading-relaxed o-text-zinc-300">
                          {numero.texte}
                        </p>
                      </div>
                    </div>
                  )
                  const large = {
                    2: 'md:o-col-span-2',
                    4: 'md:o-col-span-4',
                    6: 'md:o-col-span-6',
                  }[numero.colonnes]
                  return rang === NUMEROS.length - 1 ? (
                    <StarBorder
                      key={numero.nom}
                      color="--o-vitrine-400"
                      speed={5200}
                      thickness={1}
                      className={`o-min-w-0 ${large}`}
                      style={{ display: 'block', borderRadius: 0 }}
                    >
                      {contenu}
                    </StarBorder>
                  ) : (
                    <div key={numero.nom} className={`o-min-w-0 ${large}`}>
                      {contenu}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* ================= A19 : le compte a rebours =================== */}
          <section
            id="venir"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-6xl">
              <Reveal>
                <Indice rang="04">Avant la cloture</Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="o-m-0 o-mt-6 o-max-w-2xl o-text-zinc-50"
                  style={{
                    ...affiche('m', 700),
                    fontSize: 'clamp(1.85rem, 4.4vw, 3.5rem)',
                    lineHeight: 0.92,
                  }}
                >
                  La toile tombe le 5 octobre au matin.
                </h2>
              </Reveal>
              <div className="o-mt-12">
                <Rebours />
              </div>
              <p className="o-m-0 o-mt-8 o-max-w-lg o-text-base o-leading-relaxed o-text-zinc-300">
                Douze representations a Nancy, puis le chapiteau se demonte et part en
                garde jusqu en avril. Tarif unique a dix-huit euros, douze pour les moins
                de seize ans.
              </p>
              <p className="o-m-0 o-mt-9">
                <a
                  href="#numeros"
                  className="o-inline-flex o-items-center o-gap-3 o-rounded-full o-px-8 o-py-4 o-text-base o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                  style={aplat()}
                >
                  Reserver une place{' '}
                  <Icon icon={ArrowRight} size={17} aria-hidden="true" />
                </a>
              </p>
            </div>
          </section>
        </main>

        {/* ================= P46 : le pied en etiquette de bagage ========= */}
        <footer
          className="o-px-6 o-pb-16 o-pt-20 md:o-px-10"
          style={{ backgroundColor: accentDoux(950, 88) }}
        >
          <div className="o-mx-auto o-max-w-6xl">
            <div className="o-flex o-flex-wrap o-items-start o-gap-10">
              {/* L etiquette, avec son oeillet et sa ficelle. */}
              <div
                className="o-relative o-max-w-sm o-grow o-p-7"
                style={{
                  backgroundColor: accentDoux(900, 40),
                  boxShadow: `inset 0 0 0 1px ${accentDoux(300, 30)}`,
                  clipPath: 'polygon(0 8%, 14% 0, 100% 0, 100% 100%, 14% 100%, 0 92%)',
                }}
              >
                <span
                  aria-hidden="true"
                  className="o-absolute o-left-4 o-top-1/2 o-block o-size-3 o-rounded-full"
                  style={{ boxShadow: `0 0 0 2px ${accentDoux(300, 46)}` }}
                />
                <div className="o-pl-8">
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                    Chapiteau — compagnie itinerante
                  </p>
                  <dl className="o-m-0 o-mt-5">
                    {[
                      ['De', 'Brest, plateau des Capucins'],
                      ['Vers', 'Nancy, prairie de la Meurthe'],
                      ['Convoi', '2 porteurs, 4 caravanes'],
                      ['Masse', '18,4 t dont 1,9 t de toile'],
                      ['Retour', 'Avril 2027'],
                    ].map(([quoi, valeur]) => (
                      <div
                        key={quoi}
                        className="o-flex o-items-baseline o-justify-between o-gap-4 o-border-b o-border-white-10 o-py-2"
                      >
                        <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
                          {quoi}
                        </dt>
                        <dd className="o-m-0 o-text-right o-font-mono o-text-xs o-text-zinc-50">
                          {valeur}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <div className="o-min-w-0 o-grow">
                <p
                  className="o-m-0"
                  style={{
                    ...affiche('m', 700),
                    fontSize: 'clamp(2rem, 7vw, 5rem)',
                    lineHeight: 0.86,
                    color: accentDoux(300, 70),
                  }}
                >
                  Chapiteau
                </p>
                <nav
                  aria-label="Pied de page"
                  className="o-mt-8 o-flex o-flex-wrap o-gap-x-8 o-gap-y-3"
                >
                  {[
                    ['#montage', 'Le montage'],
                    ['#numeros', 'Le spectacle'],
                    ['#route', 'La tournee'],
                    ['#venir', 'Reserver'],
                    ['#route', 'Accueillir le chapiteau'],
                  ].map(([cible, mot], rang) => (
                    <a
                      key={`${cible}-${String(rang)}`}
                      href={cible}
                      className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400 o-no-underline o-transition-colors hover:o-text-zinc-50 focus:o-ring"
                    >
                      {mot}
                    </a>
                  ))}
                </nav>
                <p className="o-m-0 o-mt-10">
                  <a
                    href="#venir"
                    className="o-inline-flex o-items-center o-gap-2 o-font-mono o-text-sm o-uppercase o-tracking-widest o-no-underline focus:o-ring"
                    style={{ color: encreSurSombre() }}
                  >
                    route@chapiteau-cie.fr{' '}
                    <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
                  </a>
                </p>
                <p className="o-m-0 o-mt-8 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500">
                  © 2026 — compagnie conventionnee, licences 2 et 3
                  <br />
                  Toile controlee chaque avril, rapport disponible sur demande
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
