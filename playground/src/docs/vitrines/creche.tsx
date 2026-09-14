/**
 * Marelle — creche associative parentale.
 *
 * ## La reference : Creatie (Framer)
 *
 * Des autocollants penches, des aplats francs, une gaiete assumee — et, sous
 * la gaiete, une mise en page tenue. Creatie donne le ton ; le metier donne le
 * fond, qui n est ni un studio ni une marque mais **vingt-deux familles qui
 * font tourner une creche ensemble**.
 *
 * ## Le mecanisme : la journee
 *
 * Douze moments dessines, epingles : la scene reste collee pendant que l heure
 * avance, et chaque heure a son dessin, son texte et sa personne. Une reglette
 * de vingt-quatre heures, en bas de l ecran, situe le moment dans la journee
 * entiere — parce que ce qui interesse un parent, c est autant l heure ou on
 * ouvre que ce qui se passe a onze heures trente.
 *
 * Sous mouvement reduit, l epingle est abandonnee et les douze moments se
 * lisent les uns sous les autres : rien de la journee ne se perd.
 *
 * ## Aucun chiffre
 *
 * Forme C8. Une creche associative ne se vend pas au taux de remplissage ;
 * les seuls nombres de cette page sont des heures, et ce sont elles le sujet.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight, Baby } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { useEffect, useState, type ReactElement, type ReactNode } from 'react'

import { ClickSparks } from '@/odoro/effect/ClickSparks.jsx'
import { StickerPeel } from '@/odoro/effect/StickerPeel.jsx'
import { HandWritten } from '@/odoro/text/HandWritten.jsx'

import { BarrePilule, nuit } from './communs.jsx'
import { portrait } from './media.js'
import { accent, accentDoux, encre, encreSurSombre } from './palettes.js'
import {
  Actions,
  affiche,
  Autocollant,
  CHROME,
  Etiquette,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Epingle, Nappe } from './scene.jsx'

/* ============================ La journee =============================== */

/** Un moment de la journee : une heure, un dessin, une phrase. */
interface Moment {
  readonly heure: string
  /** L heure en minutes depuis minuit, pour la reglette de vingt-quatre heures. */
  readonly minutes: number
  readonly titre: string
  readonly texte: string
  /** Qui tient ce moment-la. */
  readonly qui: string
  readonly dessin: ReactElement
}

/** Le trait commun a tous les dessins : rond, epais, sans remplissage. */
const TRAIT = {
  fill: 'none',
  strokeWidth: 4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const MOMENTS: readonly Moment[] = [
  {
    heure: '07:30',
    minutes: 450,
    titre: 'On ouvre',
    texte:
      'La porte, le portemanteau a sa hauteur, le doudou qui reste dans la poche du manteau si on prefere.',
    qui: 'Nadia, referente du matin',
    dessin: (
      <g {...TRAIT}>
        <path d="M74 34h96v122H74z" />
        <circle cx="152" cy="98" r="5" />
        <path d="M36 52h18v12" />
        <path d="M30 70c0-10 16-10 16 0s10 16 10 34-10 24-18 24-16-8-16-24 8-24 8-34Z" />
        <path d="M74 156h96" />
      </g>
    ),
  },
  {
    heure: '08:30',
    minutes: 510,
    titre: 'Le petit-dejeuner de ceux qui n ont pas eu le temps',
    texte:
      'Un bol, du pain, et aucune obligation : certains ont dejeune a six heures, d autres pas du tout.',
    qui: 'Come, en cuisine',
    dessin: (
      <g {...TRAIT}>
        <path d="M24 140h192" />
        <path d="M52 96a24 24 0 0 0 48 0Z" />
        <path d="M120 96a24 24 0 0 0 48 0Z" />
        <path d="M168 84h14a10 10 0 0 1 0 20h-8" />
        <path d="M60 70c0-8 8-8 8-16M84 70c0-8 8-8 8-16" />
      </g>
    ),
  },
  {
    heure: '09:15',
    minutes: 555,
    titre: 'L atelier du jour',
    texte:
      'Peinture au doigt le lundi, pate a modeler le mardi, transvasement de graines le jeudi. Rien n est obligatoire.',
    qui: 'Salome, educatrice',
    dessin: (
      <g {...TRAIT}>
        <path d="M40 92h40v52H40zM96 78h40v66H96zM152 100h40v44h-40z" />
        <path d="M40 92h40M96 78h40M152 100h40" />
        <path d="M116 58V34M112 40l4-8 4 8" />
      </g>
    ),
  },
  {
    heure: '10:30',
    minutes: 630,
    titre: 'Le jardin, meme sous la pluie',
    texte:
      'Trente minutes dehors tous les jours. Nous avons dix combinaisons de pluie et deux paires de bottes par pointure.',
    qui: 'Hugo, animateur',
    dessin: (
      <g {...TRAIT}>
        <path d="M70 150V96" />
        <path d="M70 96a34 34 0 1 1 0-2Z" />
        <circle cx="160" cy="128" r="24" />
        <path d="M136 128h48M160 104c10 12 10 36 0 48" />
        <path d="M24 150h192" />
      </g>
    ),
  },
  {
    heure: '11:30',
    minutes: 690,
    titre: 'Le repas',
    texte:
      'Fait sur place, menu affiche la veille, et le meme plat pour tout le monde sauf regime medical.',
    qui: 'Come, en cuisine',
    dessin: (
      <g {...TRAIT}>
        <circle cx="120" cy="104" r="42" />
        <circle cx="120" cy="104" r="26" />
        <path d="M52 78v52M176 78v34M188 78v34M182 112v18" />
      </g>
    ),
  },
  {
    heure: '12:30',
    minutes: 750,
    titre: 'La sieste',
    texte:
      'Chacun a son lit et son drap, toujours le meme. On reveille personne : on attend que ca vienne.',
    qui: 'Lea, referente de l apres-midi',
    dessin: (
      <g {...TRAIT}>
        <path d="M28 152v-56M196 152v-38" />
        <path d="M28 136h168v18H28z" />
        <path d="M48 122h36v14H48z" />
        <path d="M98 136v-8c26-10 76-10 98 0v8" />
        <circle cx="66" cy="108" r="12" />
        <path d="M146 42h28l-28 24h28" />
      </g>
    ),
  },
  {
    heure: '14:30',
    minutes: 870,
    titre: 'Le reveil, un par un',
    texte:
      'Les volets s ouvrent au fur et a mesure. Un enfant qui dort jusqu a quinze heures trente dort jusqu a quinze heures trente.',
    qui: 'Lea, referente de l apres-midi',
    dessin: (
      <g {...TRAIT}>
        <path d="M62 40h116v104H62z" />
        <path d="M120 40v104M62 92h116" />
        <circle cx="120" cy="92" r="20" />
        <path d="M120 58v-14M120 140v-14M86 92H72M168 92h-14" />
      </g>
    ),
  },
  {
    heure: '15:15',
    minutes: 915,
    titre: 'Le gouter',
    texte:
      'Pain, fruit, eau. Les gateaux d anniversaire sont les bienvenus, les bougies restent a la maison.',
    qui: 'Nadia, referente du matin',
    dessin: (
      <g {...TRAIT}>
        <path d="M44 128V86c0-14 12-24 30-24s30 10 30 24v42Z" />
        <path d="M44 100h60" />
        <path d="M136 78h48v36a24 24 0 0 1-48 0Z" />
        <path d="M184 86h12a10 10 0 0 1 0 20h-12" />
        <path d="M28 144h184" />
      </g>
    ),
  },
  {
    heure: '16:00',
    minutes: 960,
    titre: 'Le tapis et les livres',
    texte:
      'Quatre-vingts albums, empruntes a la mediatheque toutes les six semaines. On lit a voix haute, ou pas.',
    qui: 'Salome, educatrice',
    dessin: (
      <g {...TRAIT}>
        <path d="M40 124l80-16 80 16" />
        <path d="M40 124V88l80-16 80 16v36" />
        <path d="M120 72v52" />
        <path d="M28 144h184" />
      </g>
    ),
  },
  {
    heure: '16:45',
    minutes: 1005,
    titre: 'Les grands ressortent',
    texte:
      'Tricycles, craies et le bac a sable, jusqu a ce que les premiers parents arrivent.',
    qui: 'Hugo, animateur',
    dessin: (
      <g {...TRAIT}>
        <circle cx="66" cy="124" r="24" />
        <circle cx="172" cy="132" r="16" />
        <path d="M66 124l34-48h40" />
        <path d="M100 76l30 56h42" />
        <path d="M140 66h22" />
      </g>
    ),
  },
  {
    heure: '17:30',
    minutes: 1050,
    titre: 'Les retrouvailles',
    texte:
      'Deux minutes de transmission, toujours : ce qui a ete mange, ce qui a ete dormi, ce qui a ete difficile.',
    qui: 'L equipe, a tour de role',
    dessin: (
      <g {...TRAIT}>
        <circle cx="82" cy="54" r="18" />
        <path d="M82 72v46M60 96h44M70 152l12-34 12 34" />
        <circle cx="156" cy="96" r="12" />
        <path d="M156 108v28M142 120h28M148 152l8-16 8 16" />
        <path d="M104 96h38" />
      </g>
    ),
  },
  {
    heure: '18:30',
    minutes: 1110,
    titre: 'On ferme',
    texte:
      'Le menage est fait par deux parents de permanence. C est ecrit dans les statuts, et ca tient depuis 1998.',
    qui: 'Les parents de permanence',
    dessin: (
      <g {...TRAIT}>
        <circle cx="72" cy="96" r="22" />
        <path d="M94 96h68M146 96v18M162 96v22" />
        <path d="M188 46l-14 34h28Z" />
        <path d="M188 80v52M170 150h36" />
      </g>
    ),
  },
]

const OUVERTURE = 450
const FERMETURE = 1110

/* ============================ La marelle =============================== */

/**
 * L objet de l ouverture : une marelle dessinee a la craie.
 *
 * Les huit cases sont celles d une vraie marelle — deux paires, trois simples,
 * le ciel au bout. La craie tremble : chaque bord est un trait legerement
 * irregulier, ce qu une bordure CSS ne sait pas faire.
 */
function Marelle(): ReactElement {
  const craie = accentDoux(600, 70)
  const cases: readonly (readonly [number, number, number, number, string])[] = [
    [60, 430, 100, 70, '1'],
    [60, 356, 100, 70, '2'],
    [60, 282, 100, 70, '3'],
    [8, 208, 100, 70, '4'],
    [112, 208, 100, 70, '5'],
    [60, 134, 100, 70, '6'],
    [8, 60, 100, 70, '7'],
    [112, 60, 100, 70, '8'],
  ]
  return (
    <svg
      viewBox="0 0 220 520"
      className="o-h-auto o-w-full"
      role="img"
      aria-label="Une marelle dessinee a la craie, huit cases et le ciel"
    >
      {cases.map(([x, y, l, h, mot]) => (
        <g key={mot}>
          <path
            d={`M${String(x + 1)} ${String(y + 2)} L${String(x + l - 2)} ${String(y)} L${String(x + l)} ${String(y + h - 1)} L${String(x + 2)} ${String(y + h)} Z`}
            fill="none"
            stroke={craie}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <text
            x={x + l / 2}
            y={y + h / 2 + 9}
            textAnchor="middle"
            fontSize="26"
            fill={craie}
            style={{ fontFamily: 'var(--o-vitrine-affichage)', fontWeight: 500 }}
          >
            {mot}
          </text>
        </g>
      ))}
      <path
        d="M8 42c60-14 146-14 204 0"
        fill="none"
        stroke={craie}
        strokeWidth="3"
        strokeDasharray="10 9"
      />
      <text
        x="110"
        y="24"
        textAnchor="middle"
        fontSize="18"
        fill={craie}
        style={{
          fontFamily: 'var(--o-font-mono)',
          textTransform: 'uppercase',
          letterSpacing: '0.22em',
        }}
      >
        Ciel
      </text>
    </svg>
  )
}

/* ============================ La reglette de 24 h ====================== */

/** Les vingt-quatre heures, et l endroit ou l on se trouve dedans. */
function VingtQuatre({ minutes }: { readonly minutes: number }): ReactElement {
  const part = (m: number): number => (m / 1440) * 100
  return (
    <div>
      <div
        className="o-relative o-h-2 o-w-full o-overflow-hidden o-rounded-full"
        style={{ backgroundColor: accentDoux(700, 14) }}
      >
        <span
          aria-hidden="true"
          className="o-absolute o-top-0 o-block o-h-full"
          style={{
            left: `${part(OUVERTURE).toFixed(2)}%`,
            width: `${(part(FERMETURE) - part(OUVERTURE)).toFixed(2)}%`,
            backgroundColor: accentDoux(500, 40),
          }}
        />
        <span
          aria-hidden="true"
          className="o-absolute o-top-0 o-block o-h-full o-w-1 o-rounded-full"
          style={{
            left: `${part(minutes).toFixed(2)}%`,
            backgroundColor: encre(),
            transition: 'left 500ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>
      <div className="o-mt-3 o-flex o-justify-between o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
        <span>00 h</span>
        <span>La creche est ouverte de 07:30 a 18:30</span>
        <span>24 h</span>
      </div>
    </div>
  )
}

/* ============================ Un moment ================================ */

/** La scene d un moment : le dessin, l heure, le texte. */
function Scene({
  moment,
  rang,
  epingle,
}: {
  readonly moment: Moment
  readonly rang: number
  readonly epingle: boolean
}): ReactElement {
  return (
    <div
      className={
        epingle
          ? 'o-grid o-items-center o-gap-10 md:o-grid-cols-12'
          : 'o-grid o-items-center o-gap-8 md:o-grid-cols-12'
      }
    >
      <div className="md:o-col-span-5">
        <div
          className="o-mx-auto o-w-full o-max-w-sm o-rounded-3xl o-p-8"
          style={{ backgroundColor: accentDoux(200, 40), color: encre() }}
        >
          <svg
            viewBox="0 0 240 180"
            className="o-h-auto o-w-full"
            role="img"
            aria-label={moment.titre}
          >
            <g stroke="currentColor">{moment.dessin}</g>
          </svg>
        </div>
      </div>
      <div className="md:o-col-span-7">
        <p className="o-m-0 o-mb-5 o-font-mono o-text-xs o-uppercase o-tabular-nums o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
          Moment {String(rang + 1).padStart(2, '0')} sur {String(MOMENTS.length)}
        </p>
        <p
          className="o-m-0 o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50"
          style={{
            ...affiche('m', 800),
            fontSize: 'clamp(3rem, 7vw, 5.5rem)',
            lineHeight: 0.86,
            letterSpacing: '-0.05em',
          }}
        >
          {moment.heure}
        </p>
        <h3
          className="o-m-0 o-mt-5 o-max-w-xl o-text-zinc-950 dark:o-text-zinc-50"
          style={{
            ...affiche('m', 300),
            fontSize: 'clamp(1.3rem, 2.6vw, 2.25rem)',
            lineHeight: 1.06,
          }}
        >
          {moment.titre}
        </h3>
        <p className="o-m-0 o-mt-5 o-max-w-lg o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
          {moment.texte}
        </p>
        <p
          className="o-m-0 o-mt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest"
          style={{ color: encre() }}
        >
          {moment.qui}
        </p>
      </div>
    </div>
  )
}

/* ============================ L equipe ================================= */

/** Les cinq salaries, en monogrammes : les personnes sont inventees. */
const EQUIPE = [
  {
    graine: 'portrait-nord-nadia',
    nom: 'Nadia Belkacem',
    role: 'Educatrice de jeunes enfants, direction',
    mot: 'Je connais le prenom des vingt-deux, et celui des quarante et un parents.',
  },
  {
    graine: 'portrait-nord-salome',
    nom: 'Salome Rivet',
    role: 'Educatrice',
    mot: 'Un atelier rate est un atelier ou j ai decide a leur place.',
  },
  {
    graine: 'portrait-nord-lea',
    nom: 'Lea Mourier',
    role: 'Auxiliaire de puericulture',
    mot: 'La sieste est le moment le plus technique de la journee. Personne ne le croit.',
  },
  {
    graine: 'portrait-nord-come',
    nom: 'Come Delaporte',
    role: 'Cuisine et entretien',
    mot: 'Quatre-vingts repas par semaine, zero plat reconditionne.',
  },
  {
    graine: 'portrait-nord-hugo',
    nom: 'Hugo Vasseur',
    role: 'Animateur, temps partiel',
    mot: 'Dehors, meme trente minutes, change tout le reste de la journee.',
  },
] as const

/* ============================ La question unique ======================= */

/** A22 : une question, trois reponses, trois adresses. */
const REPONSES = [
  {
    mot: 'Une place pour mon enfant',
    detail: 'Six places se liberent en septembre 2026. La commission se reunit en mars.',
    cible: '#inscription',
    vers: 'inscriptions@marelle-creche.fr',
  },
  {
    mot: 'Un poste dans l equipe',
    detail: 'Un remplacement de six mois a partir de janvier, diplome EJE ou auxiliaire.',
    cible: '#equipe',
    vers: 'recrutement@marelle-creche.fr',
  },
  {
    mot: 'Donner un coup de main',
    detail: 'Bricolage le samedi, lecture le mardi matin, ou la compta de l association.',
    cible: '#association',
    vers: 'bonjour@marelle-creche.fr',
  },
] as const

/* ============================ Le pied qui se plie ====================== */

/** Un volet du pied : il se deplie, et il reste trouvable par la recherche. */
function Volet({
  titre,
  children,
}: {
  readonly titre: string
  readonly children: ReactNode
}): ReactElement {
  return (
    <details className="o-border-t o-border-white-10 o-py-5">
      <summary
        className="o-flex o-cursor-pointer o-items-center o-justify-between o-gap-4 o-text-left o-font-mono o-text-xs o-uppercase o-tracking-widest focus:o-ring"
        style={{ color: encreSurSombre() }}
      >
        {titre}
        <span aria-hidden="true" className="o-text-zinc-400">
          +
        </span>
      </summary>
      <div className="o-mt-5 o-text-sm o-leading-relaxed o-text-zinc-300">{children}</div>
    </details>
  )
}

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#journee', 'La journee'],
  ['#equipe', 'L equipe'],
  ['#association', 'L association'],
  ['#inscription', 'Inscrire'],
] as const

export default function Page(): ReactElement {
  const polices = usePolices('unbounded')
  const { reduced } = useMotionState()
  const [reponse, setReponse] = useState(0)

  // La creche « ouvre » a l heure de la page : l etiquette de l ouverture dit
  // si l on est dans les horaires, ce qu aucun texte fige ne saurait dire.
  const [maintenant, setMaintenant] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => {
      setMaintenant(new Date())
    }, 60_000)
    return () => {
      window.clearInterval(id)
    }
  }, [])
  const minutesCourantes = maintenant.getHours() * 60 + maintenant.getMinutes()
  const jour = maintenant.getDay() >= 1 && maintenant.getDay() <= 5
  const ouvert = jour && minutesCourantes >= OUVERTURE && minutesCourantes < FERMETURE

  const choisie = REPONSES[reponse] ?? REPONSES[0]

  return (
    <Porte forme="lettres" marque="Marelle" sombre={false}>
      <div
        className="o-relative o-bg-white dark:o-bg-zinc-950 o-text-zinc-800 dark:o-text-zinc-200"
        style={polices}
      >
        {/* La nappe pastel derive derriere toute la page : F-css, sans canevas. */}
        <div aria-hidden="true" className="o-pointer-events-none o-fixed o-inset-0 o-z-0">
          <Nappe
            couleurs={[
              accentDoux(300, 60),
              accentDoux(500, 34),
              'color-mix(in oklab, var(--o-vitrine-seconde) 40%, transparent)',
            ]}
            opacite={0.34}
          />
        </div>

        <div className="o-relative o-z-10">
          <BarrePilule marque="Marelle" icone={Baby} liens={NAVIGATION} collante />

          {/* ================= L ouverture ================================ */}
          <header
            className="o-relative o-isolate o-px-6 o-pb-20 o-pt-10 md:o-px-10"
            style={{ minHeight: `calc(100vh - ${String(CHROME)}px)` }}
          >
            <div className="o-mx-auto o-grid o-max-w-7xl o-items-center o-gap-12 md:o-grid-cols-12">
              <div className="md:o-col-span-7">
                <Surgit>
                  <Etiquette sombre={false}>
                    {ouvert
                      ? 'Ouvert en ce moment — jusqu a 18:30'
                      : 'Ferme en ce moment — ouverture a 07:30'}
                  </Etiquette>
                </Surgit>
                <TitreVague
                  delai={140}
                  className="o-m-0 o-mt-7 o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('xl', 800),
                    fontSize: 'clamp(3rem, 12vw, 10.5rem)',
                    lineHeight: 0.84,
                    letterSpacing: '-0.05em',
                  }}
                >
                  Marelle
                </TitreVague>
                <Surgit
                  delai={520}
                  as="p"
                  className="o-m-0 o-mt-8 o-max-w-lg o-text-lg o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400"
                >
                  Creche associative parentale, vingt-deux berceaux, depuis 1998. Les
                  parents sont aux statuts, au menage du samedi et au conseil d
                  administration.
                </Surgit>
                <Surgit delai={660} className="o-mt-10">
                  <Actions
                    pleine={[
                      '#journee',
                      <>
                        Voir une journee{' '}
                        <Icon icon={ArrowRight} size={15} aria-hidden="true" />
                      </>,
                    ]}
                    fantome={['#inscription', 'Inscrire un enfant']}
                    sombre={false}
                  />
                </Surgit>

                <Surgit
                  delai={800}
                  className="o-mt-12 o-flex o-flex-wrap o-items-center o-gap-x-10 o-gap-y-6"
                >
                  <Autocollant angle={-7}>22 berceaux</Autocollant>
                  <Autocollant angle={5}>1 parent de permanence par samedi</Autocollant>
                </Surgit>
              </div>

              <Surgit delai={400} className="md:o-col-span-5">
                <div className="o-mx-auto o-w-full o-max-w-2xs">
                  <Marelle />
                </div>
              </Surgit>
            </div>
          </header>

          <main>
            {/* ================= Une phrase, seule ======================== */}
            <section
              aria-labelledby="phrase-titre"
              className="o-px-6 o-py-24 md:o-px-10 md:o-py-32"
            >
              <div className="o-mx-auto o-max-w-5xl">
                <Indice rang="01" sombre={false}>
                  Ce qu est une creche parentale
                </Indice>
                <h2
                  id="phrase-titre"
                  className="o-m-0 o-mt-10 o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.9rem, 4.6vw, 4.25rem)',
                    lineHeight: 1.04,
                  }}
                >
                  <span className="o-text-zinc-500">
                    Ce n est pas une garderie moins chere.{' '}
                  </span>
                  C est un lieu que les parents font tourner, et qui ne tient que si
                  chacun y met une journee par trimestre.
                </h2>
              </div>
            </section>

            {/* ================= Le mecanisme : la journee epinglee ======= */}
            <section id="journee" className="o-scroll-mt-24">
              <div className="o-px-6 o-pb-10 md:o-px-10">
                <div className="o-mx-auto o-max-w-6xl">
                  <Reveal>
                    <Indice rang="02" sombre={false}>
                      La journee
                    </Indice>
                  </Reveal>
                  <Reveal delay={80}>
                    <h2
                      className="o-m-0 o-mt-6 o-max-w-2xl o-text-zinc-950 dark:o-text-zinc-50"
                      style={{
                        ...affiche('m', 300),
                        fontSize: 'clamp(1.85rem, 4vw, 3.5rem)',
                        lineHeight: 1,
                      }}
                    >
                      Douze moments, du portemanteau au trousseau de cles.
                    </h2>
                  </Reveal>
                </div>
              </div>

              {reduced ? (
                <div className="o-px-6 o-pb-16 md:o-px-10">
                  <ol className="o-mx-auto o-m-0 o-flex o-max-w-6xl o-list-none o-flex-col o-gap-16 o-p-0">
                    {MOMENTS.map((moment, rang) => (
                      <li key={moment.heure}>
                        <Scene moment={moment} rang={rang} epingle={false} />
                        <div className="o-mt-8">
                          <VingtQuatre minutes={moment.minutes} />
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <Epingle ecrans={9} actes={MOMENTS.length}>
                  {(acte) => {
                    const moment = MOMENTS[acte] ?? MOMENTS[0]
                    if (moment === undefined) return null
                    return (
                      <div className="o-flex o-h-full o-flex-col o-px-6 o-py-10 md:o-px-10">
                        <div className="o-mx-auto o-flex o-w-full o-max-w-6xl o-grow o-items-center">
                          <div className="o-w-full">
                            <Scene moment={moment} rang={acte} epingle />
                          </div>
                        </div>
                        {/* La reglette reste calee au bas de l ecran epingle :
                            c est un repere, et un repere ne flotte pas. */}
                        <div className="o-mx-auto o-w-full o-max-w-6xl o-pt-8">
                          <VingtQuatre minutes={moment.minutes} />
                        </div>
                      </div>
                    )
                  }}
                </Epingle>
              )}
            </section>

            {/* ================= L equipe ================================= */}
            <section
              id="equipe"
              className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
            >
              <div className="o-mx-auto o-max-w-6xl">
                <Reveal>
                  <Indice rang="03" sombre={false}>
                    L equipe
                  </Indice>
                </Reveal>
                <Reveal delay={80}>
                  <h2
                    className="o-m-0 o-mt-6 o-max-w-2xl o-text-zinc-950 dark:o-text-zinc-50"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.85rem, 4vw, 3.5rem)',
                      lineHeight: 1,
                    }}
                  >
                    Cinq salaries, et quarante et un parents.
                  </h2>
                </Reveal>

                <ul className="o-m-0 o-mt-14 o-grid o-list-none o-gap-x-8 o-gap-y-12 o-p-0 sm:o-grid-cols-2 lg:o-grid-cols-3">
                  {EQUIPE.map((personne, rang) => {
                    const image = portrait(
                      personne.graine,
                      `${personne.nom}, ${personne.role}`,
                    )
                    return (
                      <li
                        key={personne.nom}
                        className={rang % 3 === 1 ? 'lg:o-mt-14' : ''}
                      >
                        <div className="o-flex o-items-center o-gap-5">
                          <img
                            src={image.src}
                            alt={image.alt}
                            width={72}
                            height={72}
                            className="o-size-16 o-shrink-0 o-rounded-2xl"
                            style={{
                              transform: `rotate(${String(rang % 2 === 0 ? -4 : 4)}deg)`,
                            }}
                          />
                          <div className="o-min-w-0">
                            <p className="o-m-0 o-text-lg o-font-semibold o-tracking-tight o-text-zinc-950 dark:o-text-zinc-50">
                              {personne.nom}
                            </p>
                            <p className="o-m-0 o-mt-1 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                              {personne.role}
                            </p>
                          </div>
                        </div>
                        <p className="o-m-0 o-mt-5 o-max-w-xs o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                          « {personne.mot} »
                        </p>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </section>

            {/* ================= La lettre, et sa signature =============== */}
            <section
              id="association"
              className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
              style={nuit('zinc')}
            >
              <div className="o-mx-auto o-max-w-3xl">
                <Indice rang="04">L association</Indice>
                <p
                  className="o-m-0 o-mt-10 o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.25rem, 2.6vw, 2rem)',
                    lineHeight: 1.32,
                  }}
                >
                  Aux familles qui nous decouvrent : nous ne cherchons pas a vous
                  convaincre. Une creche parentale demande une journee de permanence par
                  trimestre, une reunion tous les deux mois, et l acceptation d etre
                  employeur avec quarante autres personnes. Quand cela ne va pas, c est a
                  nous de le regler — pas a un siege social. C est plus exigeant qu une
                  place en municipale, et c est le seul endroit ou vous saurez vraiment ce
                  que votre enfant a fait de sa journee.
                </p>
                <div className="o-mt-12 o-flex o-flex-wrap o-items-end o-gap-8">
                  <HandWritten
                    duration={2200}
                    width={230}
                    color={encreSurSombre()}
                    className="o-block"
                  >
                    Nadia Belkacem
                  </HandWritten>
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
                    Nadia Belkacem
                    <br />
                    Directrice, pour le conseil d administration
                  </p>
                </div>
              </div>
            </section>

            {/* ================= A22 : une question, trois reponses ======= */}
            <section
              id="inscription"
              className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
            >
              <div className="o-mx-auto o-max-w-5xl">
                <Reveal>
                  <Indice rang="05" sombre={false}>
                    Nous ecrire
                  </Indice>
                </Reveal>
                <Reveal delay={80}>
                  <h2
                    className="o-m-0 o-mt-6 o-text-zinc-950 dark:o-text-zinc-50"
                    style={{
                      ...affiche('m', 800),
                      fontSize: 'clamp(2rem, 6vw, 5rem)',
                      lineHeight: 0.94,
                      letterSpacing: '-0.04em',
                    }}
                  >
                    Vous venez pour quoi ?
                  </h2>
                </Reveal>

                <ClickSparks color={accent(500)} count={10} distance={54}>
                  <ul className="o-m-0 o-mt-12 o-grid o-list-none o-gap-4 o-p-0 md:o-grid-cols-3">
                    {REPONSES.map((r, rang) => {
                      const actif = rang === reponse
                      return (
                        <li key={r.mot}>
                          <button
                            type="button"
                            aria-pressed={actif}
                            onClick={() => {
                              setReponse(rang)
                            }}
                            className="o-flex o-h-full o-w-full o-cursor-pointer o-flex-col o-items-start o-gap-3 o-rounded-3xl o-border-w-1 o-p-6 o-text-left o-transition-colors focus:o-ring"
                            style={
                              actif
                                ? {
                                    backgroundColor: encre(),
                                    borderColor: encre(),
                                    color: 'var(--o-theme-bg)',
                                  }
                                : {
                                    borderColor: accentDoux(700, 34),
                                    backgroundColor: 'transparent',
                                  }
                            }
                          >
                            <span className="o-block o-text-lg o-font-semibold o-tracking-tight">
                              {r.mot}
                            </span>
                            <span
                              className="o-block o-text-sm o-leading-relaxed"
                              style={{ opacity: actif ? 0.9 : 0.75 }}
                            >
                              {r.detail}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </ClickSparks>

                <p className="o-m-0 o-mt-12" aria-live="polite">
                  <a
                    href="#association"
                    className="o-inline-flex o-items-center o-gap-3 o-no-underline o-text-zinc-950 dark:o-text-zinc-50 focus:o-ring"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.25rem, 3.2vw, 2.5rem)',
                      lineHeight: 1.1,
                    }}
                  >
                    <span
                      style={{
                        textDecoration: 'underline',
                        textUnderlineOffset: '0.16em',
                      }}
                    >
                      {choisie?.vers}
                    </span>
                    <Icon icon={ArrowUpRight} size={26} aria-hidden="true" />
                  </a>
                </p>

                <div className="o-mt-14 o-inline-block">
                  <StickerPeel corner="top-right" size={54} back={accentDoux(700, 40)}>
                    <span
                      className="o-block o-max-w-2xs o-rounded-3xl o-p-6 o-text-sm o-leading-relaxed"
                      style={{
                        backgroundColor: accent(400),
                        color: 'var(--o-palette-zinc-950)',
                      }}
                    >
                      La commission d admission se tient le 14 mars. Les dossiers arrives
                      apres le 1er mars passent a la session de juin.
                    </span>
                  </StickerPeel>
                </div>
              </div>
            </section>
          </main>

          {/* ================= Le pied : trois volets qu on deplie ======== */}
          <footer className="o-px-6 o-py-16 md:o-px-10" style={nuit('zinc')}>
            <div className="o-mx-auto o-max-w-4xl">
              <p
                className="o-m-0 o-text-zinc-50"
                style={{
                  ...affiche('m', 800),
                  fontSize: 'clamp(2rem, 7vw, 5rem)',
                  lineHeight: 0.9,
                  letterSpacing: '-0.05em',
                }}
              >
                Marelle
              </p>
              <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
                Association loi 1901 — 12 rue des Lices, 49100 Angers
              </p>

              <div className="o-mt-10">
                <Volet titre="L association">
                  Creee en 1998 par sept familles. Vingt-deux berceaux agrees par la
                  protection maternelle et infantile, cinq salaries, un conseil d
                  administration de neuf parents elus en octobre. Les comptes et le
                  proces-verbal de la derniere assemblee sont remis a toute famille qui
                  les demande.
                </Volet>
                <Volet titre="Venir">
                  Tram ligne A, arret Lices, puis deux minutes a pied. Une cour fermee, un
                  local a poussettes, et quatre places de depose-minute devant le numero
                  12. L entree est de plain-pied.
                </Volet>
                <Volet titre="Les papiers">
                  Dossier d inscription, attestation de la caisse d allocations
                  familiales, carnet de vaccinations a jour, et une attestation d
                  assurance responsabilite civile. Le tarif suit le bareme national : il
                  depend de vos revenus et du nombre d enfants, pas de nous.
                </Volet>
              </div>

              <p className="o-m-0 o-mt-10 o-border-t o-border-white-10 o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
                © 2026 Marelle · Mentions legales · Accessibilite : partiellement conforme
              </p>
            </div>
          </footer>
        </div>
      </div>
    </Porte>
  )
}
