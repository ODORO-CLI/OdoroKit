/**
 * Appui — cabinet d osteopathie.
 *
 * ## La reference : Flowstate (GetLayers)
 *
 * Le calme comme argument : peu de choses a l ecran, beaucoup d air, un
 * rythme lent, une seule couleur. Flowstate ne crie pas — et c est ce qui
 * convient a quelqu un qui arrive avec une douleur depuis trois semaines.
 *
 * ## Le mecanisme : le motif
 *
 * Deux silhouettes dessinees, de face et de dos, portant **dix zones
 * cliquables** — souris, doigt, clavier, chacune avec son nom annonce. On
 * designe ou l on a mal ; la page repond par le motif tel qu il se dit, ce
 * qui est examine, le protocole, et surtout sa **duree** : combien de seances,
 * de quelle longueur, espacees de combien.
 *
 * Deux curseurs entrent dans le calcul — l intensite et l anciennete — parce
 * qu une lombalgie de trois jours a huit sur dix et une lombalgie de six mois
 * a quatre ne se traitent pas au meme rythme. Et chaque zone dit ce qui **ne
 * releve pas** de l osteopathie : une page de sante qui ne sait pas s arreter
 * n est pas une page de sante.
 *
 * ## Le fond respire
 *
 * Aucune scene graphique, aucune photographie : trois anneaux qui s ouvrent et
 * se ferment a la cadence d une respiration lente, derriere toute la page. Le
 * fond est le sujet du metier.
 *
 * @module
 */

import { useMotionState, useScrollScrub } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight } from '@odoro-cli/icons/outline'
import { Reveal } from '@odoro-cli/libs/motion'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from 'react'

import { Timeline } from '@/odoro/section/Timeline.jsx'
import { ScrollReveal } from '@/odoro/text/ScrollReveal.jsx'
import { ElasticSlider } from '@/odoro/ui/ElasticSlider.jsx'

import { nuit } from './communs.jsx'
import { accent, accentDoux, encre, encreSurSombre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreGelule,
  CHROME,
  Coin,
  Etiquette,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Respire } from './scene.jsx'

/* ============================ Les zones ================================ */

/** Une zone du corps, et ce qu elle entraine. */
interface Zone {
  readonly cle: string
  /** Le nom annonce : il porte la vue, parce que la meme region existe des deux cotes. */
  readonly nom: string
  readonly vue: 'face' | 'dos'
  readonly cx: number
  readonly cy: number
  readonly rx: number
  readonly ry: number
  /** Le motif tel qu il se dit a la porte. */
  readonly motif: string
  /** Ce qui est examine, dans l ordre. */
  readonly examen: readonly string[]
  /** Le plancher de seances, avant l intensite et l anciennete. */
  readonly seances: number
  /** La duree d une seance, en minutes. */
  readonly duree: number
  /** Ce qui ne releve pas de l osteopathie, et ou l on vous renvoie. */
  readonly renvoi: string
}

const ZONES: readonly Zone[] = [
  {
    cle: 'machoire',
    nom: 'Machoire, de face',
    vue: 'face',
    cx: 0,
    cy: 66,
    rx: 32,
    ry: 15,
    motif: 'Je serre des dents la nuit, et j ai mal devant l oreille au reveil.',
    examen: [
      'Ouverture buccale, en millimetres',
      'Deviation du menton a l ouverture',
      'Muscles masseter et temporal',
      'Cervicales hautes',
    ],
    seances: 2,
    duree: 45,
    renvoi:
      'Une douleur avec fievre, un gonflement ou une dent qui repond au froid est dentaire : c est le chirurgien-dentiste, pas moi.',
  },
  {
    cle: 'epaule',
    nom: 'Epaule droite, de face',
    vue: 'face',
    cx: -52,
    cy: 106,
    rx: 27,
    ry: 19,
    motif: 'Je ne peux plus lever le bras au-dessus de l horizontale sans accrocher.',
    examen: [
      'Amplitudes actives et passives, en degres',
      'Rythme entre omoplate et bras',
      'Premiere cote et clavicule',
      'Diaphragme, du meme cote',
    ],
    seances: 3,
    duree: 45,
    renvoi:
      'Une perte de force nette, un traumatisme recent ou une douleur nocturne qui reveille demande une imagerie avant toute manipulation.',
  },
  {
    cle: 'cotes',
    nom: 'Cage thoracique, de face',
    vue: 'face',
    cx: 0,
    cy: 182,
    rx: 47,
    ry: 32,
    motif:
      'Une pointe entre les cotes des que je respire a fond, depuis un faux mouvement.',
    examen: [
      'Ampliation thoracique, au metre ruban',
      'Mobilite des cotes, cote par cote',
      'Coupoles du diaphragme',
      'Charnieres du haut et du bas du dos',
    ],
    seances: 2,
    duree: 40,
    renvoi:
      'Une douleur qui serre, qui irradie dans le bras ou la machoire, ou qui vient avec un essoufflement : le 15, immediatement.',
  },
  {
    cle: 'hanche',
    nom: 'Hanche droite, de face',
    vue: 'face',
    cx: -36,
    cy: 300,
    rx: 26,
    ry: 17,
    motif: 'Ca tire dans le pli de l aine quand je monte en voiture.',
    examen: [
      'Rotations de hanche, couche puis debout',
      'Longueur apparente des membres',
      'Bassin, en appui bipodal et unipodal',
      'Psoas et adducteurs',
    ],
    seances: 3,
    duree: 45,
    renvoi:
      'Une boiterie qui s installe, une douleur la nuit au repos ou une limitation qui s aggrave de semaine en semaine relevent du medecin traitant.',
  },
  {
    cle: 'genou',
    nom: 'Genou droit, de face',
    vue: 'face',
    cx: -30,
    cy: 438,
    rx: 21,
    ry: 24,
    motif: 'Depuis que j ai repris la course, ca chauffe sur le cote du genou.',
    examen: [
      'Appui du pied, en charge',
      'Rotation du tibia sous le femur',
      'Course de la rotule',
      'Hanche et cheville du meme cote',
    ],
    seances: 2,
    duree: 40,
    renvoi:
      'Un genou qui gonfle, qui bloque ou qui lache est un avis orthopedique, et il passe avant moi.',
  },
  {
    cle: 'cervicales',
    nom: 'Cervicales, de dos',
    vue: 'dos',
    cx: 0,
    cy: 92,
    rx: 27,
    ry: 20,
    motif:
      'Je tourne la tete d un seul cote, et j ai des maux de tete en fin de journee.',
    examen: [
      'Rotations et inclinaisons, en degres',
      'Premiere et deuxieme cervicales',
      'Appui des yeux et de la machoire',
      'Poste de travail, en photo si vous en avez une',
    ],
    seances: 3,
    duree: 45,
    renvoi:
      'Vertiges, troubles de la vue, fourmillements dans les deux mains : pas de manipulation cervicale, et un avis medical d abord.',
  },
  {
    cle: 'dorsales',
    nom: 'Dorsales, de dos',
    vue: 'dos',
    cx: 0,
    cy: 168,
    rx: 42,
    ry: 28,
    motif: 'Un point entre les omoplates, tous les jours, vers seize heures.',
    examen: [
      'Courbures, debout et assis',
      'Mobilite des cotes en arriere',
      'Omoplates et muscles fixateurs',
      'Estomac et diaphragme, par le ventre',
    ],
    seances: 2,
    duree: 45,
    renvoi:
      'Une douleur dorsale qui ne change jamais avec la position, ni le jour ni la nuit, n est pas mecanique : elle se fait explorer.',
  },
  {
    cle: 'lombaires',
    nom: 'Lombaires, de dos',
    vue: 'dos',
    cx: 0,
    cy: 252,
    rx: 38,
    ry: 27,
    motif: 'Je me suis bloque en ramassant quelque chose et je marche plie.',
    examen: [
      'Position antalgique, debout',
      'Flexion, extension, inclinaisons',
      'Sacro-iliaques, en charge',
      'Test neurologique des membres inferieurs',
    ],
    seances: 3,
    duree: 50,
    renvoi:
      'Une douleur qui descend sous le genou, une perte de force au pied, ou le moindre trouble pour uriner : urgence medicale, pas osteopathie.',
  },
  {
    cle: 'sacrum',
    nom: 'Sacrum et bassin, de dos',
    vue: 'dos',
    cx: 0,
    cy: 306,
    rx: 31,
    ry: 19,
    motif: 'Une douleur d un seul cote, en bas, qui revient depuis ma grossesse.',
    examen: [
      'Sacro-iliaques, tests dynamiques',
      'Appui assis et appui debout',
      'Ligaments du bassin',
      'Plancher pelvien, par l exterieur seulement',
    ],
    seances: 4,
    duree: 50,
    renvoi:
      'Apres un accouchement, un avis de sage-femme ou de medecin precede la premiere seance. Je ne passe jamais avant.',
  },
  {
    cle: 'cheville',
    nom: 'Cheville droite, de dos',
    vue: 'dos',
    cx: -28,
    cy: 566,
    rx: 18,
    ry: 20,
    motif: 'Une vieille entorse qui n a jamais ete revue, et une cheville qui se derobe.',
    examen: [
      'Amplitude de flexion dorsale, en degres',
      'Jeu de l astragale et du calcaneum',
      'Appui du pied a la marche',
      'Genou et hanche, en remontant',
    ],
    seances: 2,
    duree: 40,
    renvoi:
      'Une entorse recente se radiographie avant tout : la regle est simple, si l appui est impossible, c est aux urgences.',
  },
]

/* ============================ La feuille =============================== */

const STYLE_OSTEO = 'o-vitrine-osteopathe'

const CSS_OSTEO = [
  '[data-o-os-zone]{cursor:pointer;outline:none}',
  '[data-o-os-zone] [data-o-os-focus]{opacity:0}',
  '[data-o-os-zone]:focus-visible [data-o-os-focus]{opacity:1}',
  '[data-o-os-zone]:hover [data-o-os-halo]{opacity:0.55}',
].join('')

function useFeuilleOsteo(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_OSTEO) !== null) return
    const feuille = document.createElement('style')
    feuille.id = STYLE_OSTEO
    feuille.textContent = CSS_OSTEO
    document.head.append(feuille)
  }, [])
}

/* ============================ La silhouette ============================ */

/** La tete, le tronc, les bras, les jambes : un corps au trait, autour de x = 0. */
function Corps({ dos }: { readonly dos: boolean }): ReactElement {
  const ligne = accentDoux(800, 42)
  const chair = accentDoux(200, 30)
  const membre = (
    <>
      <path
        d="M-52 100 C-68 108 -74 124 -76 150 C-79 190 -84 232 -88 264 C-90 279 -72 282 -69 267 C-63 232 -56 192 -52 162 Z"
        fill={chair}
        stroke={ligne}
        strokeWidth="1.6"
      />
      <path
        d="M-42 302 C-47 344 -49 394 -47 444 C-45 504 -43 552 -41 586 C-40 598 -18 598 -17 586 C-15 544 -11 486 -7 436 L-5 320 Z"
        fill={chair}
        stroke={ligne}
        strokeWidth="1.6"
      />
    </>
  )
  return (
    <g>
      <circle cx="0" cy="44" r="28" fill={chair} stroke={ligne} strokeWidth="1.6" />
      <path d="M-10 68 h20 v18 h-20 Z" fill={chair} stroke={ligne} strokeWidth="1.6" />
      <path
        d="M-40 86 C-53 94 -59 110 -59 130 L-53 202 C-51 232 -47 262 -45 288 C-43 302 -31 308 0 308 C31 308 43 302 45 288 C47 262 51 232 53 202 L59 130 C59 110 53 94 40 86 Z"
        fill={chair}
        stroke={ligne}
        strokeWidth="1.6"
      />
      {membre}
      <g transform="scale(-1 1)">{membre}</g>
      {/* Le rachis, de dos seulement : c est ce qui distingue les deux vues. */}
      {dos && (
        <g stroke={ligne} strokeWidth="1.2" fill="none" opacity="0.75">
          <path d="M0 86 V300" />
          {Array.from({ length: 16 }, (_, rang) => (
            <path key={rang} d={`M-9 ${String(96 + rang * 13)} h18`} />
          ))}
          <path d="M-30 140 L-8 122 M30 140 L8 122" />
        </g>
      )}
    </g>
  )
}

/** Une zone cliquable, posee sur la silhouette. */
function ZoneDessinee({
  zone,
  choisie,
  surChoix,
}: {
  readonly zone: Zone
  readonly choisie: boolean
  readonly surChoix: (cle: string) => void
}): ReactElement {
  const surTouche = (evenement: KeyboardEvent<SVGGElement>): void => {
    if (evenement.key !== 'Enter' && evenement.key !== ' ') return
    evenement.preventDefault()
    surChoix(zone.cle)
  }
  return (
    <g
      data-o-os-zone=""
      role="button"
      tabIndex={0}
      aria-pressed={choisie}
      aria-label={`${zone.nom} — ${zone.motif}`}
      onClick={() => {
        surChoix(zone.cle)
      }}
      onKeyDown={surTouche}
    >
      <ellipse
        data-o-os-halo=""
        cx={zone.cx}
        cy={zone.cy}
        rx={zone.rx}
        ry={zone.ry}
        fill={accent(500)}
        opacity={choisie ? 0.9 : 0.16}
      />
      <ellipse
        cx={zone.cx}
        cy={zone.cy}
        rx={zone.rx}
        ry={zone.ry}
        fill="none"
        stroke={choisie ? encre() : accentDoux(700, 45)}
        strokeWidth={choisie ? 2.4 : 1.2}
        strokeDasharray={choisie ? undefined : '3 4'}
      />
      <ellipse
        data-o-os-focus=""
        cx={zone.cx}
        cy={zone.cy}
        rx={zone.rx + 7}
        ry={zone.ry + 7}
        fill="none"
        stroke={encre()}
        strokeWidth="2.5"
      />
    </g>
  )
}

/** Les deux silhouettes, de face et de dos, avec leurs dix zones. */
function Silhouettes({
  choisie,
  surChoix,
}: {
  readonly choisie: string
  readonly surChoix: (cle: string) => void
}): ReactElement {
  const legende = (x: number, mot: string): ReactElement => (
    <text
      x={x}
      y={632}
      textAnchor="middle"
      fontSize="13"
      fill="var(--o-theme-muted)"
      style={{
        fontFamily: 'var(--o-font-mono)',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
      }}
    >
      {mot}
    </text>
  )
  return (
    <svg
      viewBox="0 0 420 660"
      className="o-h-auto o-w-full"
      role="group"
      aria-label="Deux silhouettes, de face et de dos, avec dix zones a designer"
    >
      <g transform="translate(110 10)">
        <Corps dos={false} />
        {ZONES.filter((z) => z.vue === 'face').map((zone) => (
          <ZoneDessinee
            key={zone.cle}
            zone={zone}
            choisie={choisie === zone.cle}
            surChoix={surChoix}
          />
        ))}
      </g>
      <g transform="translate(310 10)">
        <Corps dos />
        {ZONES.filter((z) => z.vue === 'dos').map((zone) => (
          <ZoneDessinee
            key={zone.cle}
            zone={zone}
            choisie={choisie === zone.cle}
            surChoix={surChoix}
          />
        ))}
      </g>
      {legende(110, 'De face')}
      {legende(310, 'De dos')}
    </svg>
  )
}

/* ============================ Le protocole ============================= */

/** Ce que l estimation rend, une fois la zone et les deux curseurs connus. */
interface Estimation {
  readonly seances: number
  readonly duree: number
  readonly ecart: number
  readonly semaines: number
  readonly total: number
}

/**
 * Le protocole estime.
 *
 * Rien de magique : le plancher de la zone, plus un cran par tranche de trois
 * points d intensite, plus un cran quand la chose traine depuis plus de deux
 * mois. L espacement suit l intensite — une douleur aigue se revoit a huit
 * jours, une douleur ancienne a quinze, parce que le corps met ce temps-la a
 * reorganiser ce qu on vient de lui demander.
 */
function estimer(zone: Zone, intensite: number, semaines: number): Estimation {
  const brut = zone.seances + Math.floor(intensite / 3) + (semaines > 8 ? 1 : 0)
  const seances = Math.max(1, Math.min(6, brut))
  const ecart = intensite >= 7 ? 8 : 15
  return {
    seances,
    duree: zone.duree,
    ecart,
    semaines: Math.round(((seances - 1) * ecart) / 7),
    total: seances * zone.duree,
  }
}

/** Une duree en minutes, dite comme on la dit. */
function heures(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${String(m)} min`
  return m === 0 ? `${String(h)} h` : `${String(h)} h ${String(m).padStart(2, '0')}`
}

/* ============================ La jauge ================================= */

/**
 * C11 : une jauge unique, qui se remplit au defilement.
 *
 * Un seul chiffre sur toute la page, et il est mesure : quatre cent douze
 * motifs vus l an dernier, dont trois sur quatre resolus en trois seances.
 */
function Jauge(): ReactElement {
  const { reduced } = useMotionState()
  const barre = useRef<HTMLDivElement>(null)
  const valeur = useRef<HTMLSpanElement>(null)
  const cible = 76

  const avancer = useCallback((p: number) => {
    // La jauge se remplit sur la premiere moitie de la traversee : au milieu
    // de l ecran elle est pleine, et le chiffre s est arrete avec elle.
    const part = Math.max(0, Math.min(1, p * 2 - 0.35))
    if (barre.current !== null)
      barre.current.style.transform = `scaleX(${part.toFixed(4)})`
    if (valeur.current !== null)
      valeur.current.textContent = String(Math.round(part * cible))
  }, [])

  const { ref } = useScrollScrub<HTMLDivElement>(reduced ? () => undefined : avancer, {
    name: 'jauge du cabinet',
  })

  return (
    <div ref={ref}>
      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
        412 motifs recus en 2025
      </p>
      <p
        className="o-m-0 o-mt-5 o-tabular-nums o-text-stone-900 dark:o-text-stone-50"
        style={{
          ...affiche('l', 300),
          fontSize: 'clamp(3.5rem, 12vw, 10rem)',
          lineHeight: 0.86,
        }}
      >
        <span ref={valeur}>{reduced ? cible : 0}</span>
        <span style={{ color: encre() }}> %</span>
      </p>
      <div
        aria-hidden="true"
        className="o-mt-8 o-h-3 o-w-full o-overflow-hidden o-rounded-full"
        style={{ backgroundColor: accentDoux(300, 26) }}
      >
        <div
          ref={barre}
          className="o-h-full o-w-full o-origin-left o-rounded-full"
          style={{
            backgroundColor: encre(),
            transform: reduced ? 'scaleX(1)' : 'scaleX(0)',
          }}
        />
      </div>
      <p className="o-m-0 o-mt-6 o-max-w-xl o-text-base o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
        Trois seances ou moins, et le motif ne revient pas dans l annee. Les vingt-quatre
        pour cent restants sont surtout des douleurs anciennes, et quelques renvois vers
        un medecin — qui comptent aussi comme un resultat.
      </p>
    </div>
  )
}

/* ============================ La frise du jour ========================= */

/** Une fenetre libre de la journee, en minutes depuis minuit. */
interface Fenetre {
  readonly debut: number
  readonly fin: number
}

const OUVERTURE = 8 * 60
const FERMETURE = 20 * 60

const LIBRES: readonly Fenetre[] = [
  { debut: 9 * 60 + 15, fin: 10 * 60 + 5 },
  { debut: 11 * 60 + 45, fin: 12 * 60 + 35 },
  { debut: 15 * 60, fin: 15 * 60 + 50 },
  { debut: 17 * 60 + 30, fin: 18 * 60 + 20 },
  { debut: 19 * 60, fin: 19 * 60 + 50 },
]

/** Une heure en chiffres, depuis des minutes. */
function horaire(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

/**
 * A23 : la journee de jeudi, dessinee comme une reglette.
 *
 * Pas des cases : une ligne de douze heures, graduee, sur laquelle les cinq
 * fenetres libres sont des segments qu on prend. Le rendez-vous n est pas une
 * case dans un tableau, c est une place dans une journee.
 */
function Reglette(): ReactElement {
  const [prise, setPrise] = useState<number | null>(15 * 60)
  const course = FERMETURE - OUVERTURE
  const part = (minutes: number): number => ((minutes - OUVERTURE) / course) * 100
  const choisie = LIBRES.find((f) => f.debut === prise)

  return (
    <div>
      {/*
        La reglette defile de cote sous 720 px. `overflow-y` est declare
        explicitement : laisse a `auto` par la cascade, la bande avalerait la
        molette et la page se figerait sous le pointeur.
      */}
      <div className="o-overflow-x-auto o-pb-2" style={{ overflowY: 'hidden' }}>
        <div className="o-relative o-w-full" style={{ minWidth: 720 }}>
          <div
            aria-hidden="true"
            className="o-relative o-h-px o-w-full"
            style={{ backgroundColor: accentDoux(700, 34) }}
          >
            {Array.from({ length: 13 }, (_, rang) => {
              const minutes = OUVERTURE + rang * 60
              return (
                <span
                  key={minutes}
                  className="o-absolute o-top-0 o-block o-w-px"
                  style={{
                    left: `${part(minutes).toFixed(3)}%`,
                    height: rang % 2 === 0 ? 14 : 8,
                    backgroundColor: accentDoux(700, 34),
                  }}
                />
              )
            })}
          </div>
          <div aria-hidden="true" className="o-relative o-mt-5 o-h-5 o-w-full">
            {Array.from({ length: 7 }, (_, rang) => {
              const minutes = OUVERTURE + rang * 120
              // Aux deux bouts, l etiquette se range sous la graduation plutot
              // que de la chevaucher : centree, elle sortirait de la reglette.
              const cale =
                rang === 0
                  ? 'translateX(0)'
                  : rang === 6
                    ? 'translateX(-100%)'
                    : 'translateX(-50%)'
              return (
                <span
                  key={minutes}
                  className="o-absolute o-top-0 o-block o-font-mono o-text-xs o-tabular-nums o-text-stone-500 dark:o-text-stone-400"
                  style={{ left: `${part(minutes).toFixed(3)}%`, transform: cale }}
                >
                  {horaire(minutes)}
                </span>
              )
            })}
          </div>

          <ul className="o-relative o-m-0 o-mt-4 o-block o-h-16 o-list-none o-p-0">
            {LIBRES.map((fenetre) => {
              const actif = prise === fenetre.debut
              return (
                <li
                  key={fenetre.debut}
                  className="o-absolute o-top-0"
                  style={{
                    left: `${part(fenetre.debut).toFixed(3)}%`,
                    width: `${(part(fenetre.fin) - part(fenetre.debut)).toFixed(3)}%`,
                  }}
                >
                  <button
                    type="button"
                    aria-pressed={actif}
                    onClick={() => {
                      setPrise(actif ? null : fenetre.debut)
                    }}
                    className="o-flex o-h-14 o-w-full o-cursor-pointer o-flex-col o-justify-center o-rounded-full o-border-w-1 o-px-3 o-text-left o-transition-colors focus:o-ring"
                    style={
                      actif
                        ? {
                            backgroundColor: encre(),
                            borderColor: encre(),
                            color: 'var(--o-theme-bg)',
                          }
                        : {
                            backgroundColor: accentDoux(200, 40),
                            borderColor: accentDoux(700, 34),
                            color: 'inherit',
                          }
                    }
                  >
                    <span className="o-block o-whitespace-nowrap o-font-mono o-text-xs o-tabular-nums">
                      {horaire(fenetre.debut)}
                    </span>
                    <span className="o-block o-whitespace-nowrap o-text-xs o-font-semibold">
                      {actif ? 'Retenu' : '50 min'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <p
        className="o-m-0 o-mt-10 o-max-w-2xl o-text-lg o-leading-relaxed o-text-stone-700 dark:o-text-stone-300"
        aria-live="polite"
      >
        {choisie === undefined
          ? 'Aucune place retenue. Les cinq segments clairs sont les fenetres encore libres de jeudi.'
          : `Jeudi 18 septembre, de ${horaire(choisie.debut)} a ${horaire(choisie.fin)} — cinquante minutes, au 6 rue Gaultier. Venez avec vos examens si vous en avez ; sinon, venez quand meme.`}
      </p>
    </div>
  )
}

/* ============================ L horloge du pied ======================== */

/**
 * P19 : une horloge unique, et une adresse.
 *
 * Les aiguilles sont a l heure du cabinet, relue chaque minute : c est la
 * seule chose que ce pied a besoin de dire, avec la rue.
 */
function Horloge(): ReactElement {
  const [instant, setInstant] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => {
      setInstant(new Date())
    }, 30_000)
    return () => {
      window.clearInterval(id)
    }
  }, [])

  const minutes = instant.getHours() * 60 + instant.getMinutes()
  const angleH = ((minutes % 720) / 720) * 360
  const angleM = ((minutes % 60) / 60) * 360
  const lu = `${String(instant.getHours()).padStart(2, '0')}:${String(instant.getMinutes()).padStart(2, '0')}`

  return (
    <figure className="o-m-0">
      <svg
        viewBox="0 0 240 240"
        className="o-h-auto o-w-full"
        role="img"
        aria-label={`Il est ${lu} au cabinet`}
      >
        <circle
          cx="120"
          cy="120"
          r="112"
          fill="none"
          stroke={accentDoux(300, 40)}
          strokeWidth="1.5"
        />
        {Array.from({ length: 12 }, (_, rang) => {
          const angle = (rang / 12) * Math.PI * 2
          const sin = Math.sin(angle)
          const cos = Math.cos(angle)
          const dedans = rang % 3 === 0 ? 92 : 100
          return (
            <path
              key={rang}
              d={`M${String(120 + sin * dedans)} ${String(120 - cos * dedans)} L${String(120 + sin * 108)} ${String(120 - cos * 108)}`}
              stroke={rang % 3 === 0 ? encreSurSombre() : accentDoux(300, 40)}
              strokeWidth={rang % 3 === 0 ? 2.5 : 1.5}
              strokeLinecap="round"
            />
          )
        })}
        <path
          d="M120 120 V56"
          stroke="var(--o-theme-fg)"
          strokeWidth="5"
          strokeLinecap="round"
          transform={`rotate(${angleH.toFixed(2)} 120 120)`}
        />
        <path
          d="M120 120 V34"
          stroke={encreSurSombre()}
          strokeWidth="2.5"
          strokeLinecap="round"
          transform={`rotate(${angleM.toFixed(2)} 120 120)`}
        />
        <circle cx="120" cy="120" r="5" fill="var(--o-theme-fg)" />
      </svg>
      <figcaption className="o-mt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">
        Heure du cabinet — {lu}
      </figcaption>
    </figure>
  )
}

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#motif', 'Le motif'],
  ['#protocole', 'Le protocole'],
  ['#limites', 'Mes limites'],
] as const

const FRISE = [
  {
    date: 'Seance 1',
    title: 'On ecoute, puis on teste',
    body: 'Vingt minutes d interrogatoire, trente de tests. Une seance sur dix s arrete la, avec une lettre pour votre medecin : c est un resultat, pas un echec.',
  },
  {
    date: 'Seance 2 — a huit ou quinze jours',
    title: 'On verifie ce qui a tenu',
    body: 'Ce qui a tenu se garde, ce qui est revenu se reprend autrement. Si rien n a bouge du tout, on change d hypothese plutot que de refaire la meme chose plus fort.',
  },
  {
    date: 'Seance 3 — a un mois',
    title: 'On rend le terrain',
    body: 'Trois ou quatre gestes a faire seul, ecrits sur une feuille, et le poste de travail revu si c est de la que ca vient. La suite ne doit plus passer par moi.',
  },
  {
    date: 'Au-dela',
    title: 'On s arrete, ou on passe la main',
    body: 'Quatre seances sans amelioration nette : le motif n est pas mecanique, ou pas seulement. Je le dis, j ecris a votre medecin, et je ne vous garde pas.',
  },
]

export default function Page(): ReactElement {
  const polices = usePolices('onest')
  useFeuilleOsteo()
  const [cle, setCle] = useState('lombaires')
  const [intensite, setIntensite] = useState(6)
  const [semaines, setSemaines] = useState(3)

  const zone = ZONES.find((z) => z.cle === cle) ?? ZONES[0]
  const estimation = useMemo(
    () => (zone === undefined ? undefined : estimer(zone, intensite, semaines)),
    [zone, intensite, semaines],
  )

  if (zone === undefined || estimation === undefined) return <div />

  return (
    <Porte forme="trou" marque="Appui" sombre={false}>
      <div
        className="o-relative o-bg-stone-50 dark:o-bg-stone-950 o-text-stone-800 dark:o-text-stone-200"
        style={polices}
      >
        {/*
          Le fond respire : trois anneaux, fixes derriere toute la page, qui
          s ouvrent et se ferment a la cadence d une inspiration lente. Aucun
          canevas, aucune image — le calme est dessine.
        */}
        <div
          aria-hidden="true"
          className="o-pointer-events-none o-fixed o-inset-0 o-z-0 o-overflow-hidden"
        >
          {[
            { taille: '76vmin', duree: 13, opacite: 0.3 },
            { taille: '54vmin', duree: 11, opacite: 0.24 },
            { taille: '32vmin', duree: 9, opacite: 0.18 },
          ].map((anneau) => (
            <Respire
              key={anneau.taille}
              duree={anneau.duree}
              className="o-absolute o-rounded-full o-border-w-1"
              style={{
                width: anneau.taille,
                height: anneau.taille,
                left: '50%',
                top: '42%',
                marginLeft: `calc(${anneau.taille} / -2)`,
                marginTop: `calc(${anneau.taille} / -2)`,
                borderColor: accentDoux(500, 30),
                opacity: anneau.opacite,
              }}
            />
          ))}
        </div>

        <div className="o-relative o-z-10">
          <BarreGelule
            marque="Appui"
            liens={NAVIGATION}
            action={['#jeudi', 'Jeudi, 5 places']}
            sombre={false}
          />

          {/* ================= L ouverture ================================ */}
          <header
            className="o-relative o-isolate o-flex o-flex-col o-justify-center o-px-6 o-pb-20 o-pt-36 md:o-px-10"
            style={{ minHeight: `calc(100vh - ${String(CHROME)}px)` }}
          >
            <Coin position="bd" sombre={false}>
              6 rue Gaultier
              <br />
              Rennes — 2e etage, sans ascenseur
            </Coin>

            <div className="o-mx-auto o-w-full o-max-w-5xl o-text-center">
              <Surgit>
                <Etiquette sombre={false}>Osteopathe D.O. — Rennes centre</Etiquette>
              </Surgit>
              <TitreVague
                delai={160}
                className="o-m-0 o-mt-8 o-text-stone-900 dark:o-text-stone-50"
                style={{
                  ...affiche('xl', 300),
                  fontSize: 'clamp(3.5rem, 15vw, 13rem)',
                  lineHeight: 0.84,
                }}
              >
                Appui
              </TitreVague>
              <Surgit
                delai={560}
                as="p"
                className="o-mx-auto o-m-0 o-mt-10 o-max-w-xl o-text-lg o-leading-relaxed o-text-stone-600 dark:o-text-stone-400"
              >
                Designez ou vous avez mal. Vous saurez combien de seances, de quelle
                duree, et ce qui ne releve pas de moi — avant d avoir pris le telephone.
              </Surgit>
              <Surgit delai={700} className="o-mt-11 o-flex o-justify-center">
                <Actions
                  pleine={[
                    '#motif',
                    <>
                      Designer le motif{' '}
                      <Icon icon={ArrowRight} size={15} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#jeudi', 'Les places de jeudi']}
                  sombre={false}
                />
              </Surgit>
            </div>
          </header>

          <main>
            {/* ================= M-allume : le paragraphe s allume ======== */}
            <section
              aria-labelledby="promesse-titre"
              className="o-px-6 o-py-28 md:o-px-10 md:o-py-40"
            >
              <div className="o-mx-auto o-max-w-4xl">
                <Indice rang="01" sombre={false}>
                  Ce que je fais
                </Indice>
                <h2 id="promesse-titre" className="o-sr-only">
                  Ce que je fais
                </h2>
                <ScrollReveal
                  as="p"
                  dim={0.14}
                  blur={5}
                  course={0.9}
                  className="o-m-0 o-mt-12 o-text-stone-900 dark:o-text-stone-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.5rem, 3.4vw, 3.25rem)',
                    lineHeight: 1.16,
                  }}
                >
                  Je cherche ou le corps ne bouge plus, et je lui rends l amplitude qui
                  lui manque. Ce n est ni une medecine ni un massage : c est un examen
                  mecanique, des tests, et trois ou quatre gestes qui vous restent une
                  fois la porte refermee.
                </ScrollReveal>
              </div>
            </section>

            {/* ================= Le mecanisme : le motif ================== */}
            <section id="motif" className="o-scroll-mt-24 o-px-6 o-pb-28 md:o-px-10">
              <div className="o-mx-auto o-max-w-6xl">
                <Reveal>
                  <Indice rang="02" sombre={false}>
                    Le motif
                  </Indice>
                </Reveal>
                <Reveal delay={80}>
                  <h2
                    className="o-m-0 o-mt-6 o-max-w-3xl o-text-stone-900 dark:o-text-stone-50"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.85rem, 4vw, 3.5rem)',
                      lineHeight: 1,
                    }}
                  >
                    Montrez-moi ou.
                  </h2>
                </Reveal>

                <div className="o-mt-14 o-grid o-items-start o-gap-14 lg:o-grid-cols-12">
                  <div className="lg:o-col-span-5">
                    <Silhouettes choisie={cle} surChoix={setCle} />
                    <p className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-stone-500 dark:o-text-stone-400">
                      Dix zones, a la souris, au doigt ou au clavier : la tabulation passe
                      de l une a l autre, Entree ou la barre d espace la designe.
                    </p>
                  </div>

                  <div className="lg:o-col-span-7">
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                      {zone.nom}
                    </p>
                    <p
                      className="o-m-0 o-mt-5 o-max-w-2xl o-text-stone-900 dark:o-text-stone-50"
                      aria-live="polite"
                      style={{
                        ...affiche('m', 300),
                        fontSize: 'clamp(1.3rem, 2.4vw, 2.1rem)',
                        lineHeight: 1.16,
                      }}
                    >
                      « {zone.motif} »
                    </p>

                    <div className="o-mt-10 o-grid o-gap-8 sm:o-grid-cols-2">
                      <ElasticSlider
                        label="Intensite, de zero a dix"
                        min={0}
                        max={10}
                        value={intensite}
                        onChange={setIntensite}
                        leading={
                          <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                            Intensite
                          </span>
                        }
                      />
                      <ElasticSlider
                        label="Depuis combien de semaines"
                        min={1}
                        max={26}
                        value={semaines}
                        onChange={setSemaines}
                        leading={
                          <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                            Semaines
                          </span>
                        }
                      />
                    </div>

                    <div
                      className="o-mt-10 o-rounded-3xl o-p-8 md:o-p-10"
                      style={{ backgroundColor: accentDoux(200, 34) }}
                    >
                      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
                        Le protocole estime
                      </p>
                      <p
                        className="o-m-0 o-mt-4 o-tabular-nums o-text-stone-900 dark:o-text-stone-50"
                        aria-live="polite"
                        style={{
                          ...affiche('m', 300),
                          fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
                          lineHeight: 0.94,
                        }}
                      >
                        {estimation.seances} seance{estimation.seances > 1 ? 's' : ''} de{' '}
                        {estimation.duree} min
                      </p>
                      <p className="o-m-0 o-mt-4 o-max-w-md o-text-base o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
                        Espacees de {estimation.ecart} jours, soit{' '}
                        {heures(estimation.total)} en cabinet sur{' '}
                        {estimation.semaines === 0
                          ? 'une seule visite'
                          : `${String(estimation.semaines)} semaines`}
                        .
                      </p>

                      <p className="o-m-0 o-mt-8 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
                        Ce que j examine
                      </p>
                      <ol className="o-m-0 o-mt-4 o-list-none o-p-0">
                        {zone.examen.map((quoi, rang) => (
                          <li
                            key={quoi}
                            className="o-flex o-items-baseline o-gap-4 o-border-t o-py-3 o-text-base o-leading-relaxed o-text-stone-800 dark:o-text-stone-200"
                            style={{ borderColor: accentDoux(700, 18) }}
                          >
                            <span
                              className="o-shrink-0 o-font-mono o-text-xs o-tabular-nums"
                              style={{ color: encre() }}
                            >
                              {String(rang + 1).padStart(2, '0')}
                            </span>
                            {quoi}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ================= La coupe sombre : mes limites ============ */}
            <section
              id="limites"
              className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
              style={nuit('stone')}
            >
              <div className="o-mx-auto o-max-w-4xl">
                <Indice rang="03">Mes limites</Indice>
                <h2
                  className="o-m-0 o-mt-8 o-text-stone-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 4vw, 3.25rem)',
                    lineHeight: 1.04,
                  }}
                >
                  <span className="o-text-stone-500">
                    Pour ce motif-la, il y a un endroit ou je m arrete{' '}
                  </span>
                  et ou je vous envoie ailleurs.
                </h2>
                <p
                  className="o-m-0 o-mt-10 o-max-w-2xl o-text-lg o-leading-relaxed o-text-stone-300"
                  aria-live="polite"
                >
                  {zone.renvoi}
                </p>
                <p className="o-m-0 o-mt-12 o-border-t o-border-white-10 o-pt-6 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-400">
                  Osteopathe D.O., titre reconnu — je ne pose pas de diagnostic medical et
                  je ne remplace personne
                </p>
              </div>
            </section>

            {/* ================= La jauge unique ========================== */}
            <section
              aria-labelledby="jauge-titre"
              className="o-px-6 o-py-28 md:o-px-10 md:o-py-36"
            >
              <div className="o-mx-auto o-max-w-4xl">
                <Indice rang="04" sombre={false}>
                  Le seul chiffre de cette page
                </Indice>
                <h2 id="jauge-titre" className="o-sr-only">
                  Le seul chiffre de cette page
                </h2>
                <div className="o-mt-12">
                  <Jauge />
                </div>
              </div>
            </section>

            {/* ================= Le protocole, dans le temps ============== */}
            <section id="protocole" className="o-scroll-mt-24 o-px-6 o-pb-28 md:o-px-10">
              <div className="o-mx-auto o-grid o-max-w-6xl o-gap-14 md:o-grid-cols-12">
                <div className="md:o-col-span-4">
                  <Indice rang="05" sombre={false}>
                    Le protocole
                  </Indice>
                  <h2
                    className="o-m-0 o-mt-6 o-text-stone-900 dark:o-text-stone-50"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.6rem, 3vw, 2.75rem)',
                      lineHeight: 1.02,
                    }}
                  >
                    Quatre moments, et une sortie.
                  </h2>
                  <p className="o-m-0 o-mt-6 o-max-w-sm o-text-base o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                    Le meme deroule pour tous les motifs. Ce qui change d une personne a l
                    autre, c est le nombre de fois qu on repasse par le deuxieme.
                  </p>
                </div>
                <div className="md:o-col-span-8">
                  <Timeline
                    events={FRISE}
                    label="Le deroule d un suivi, en quatre moments"
                  />
                </div>
              </div>
            </section>

            {/* ================= L appel : la reglette de jeudi =========== */}
            <section id="jeudi" className="o-scroll-mt-24 o-px-6 o-pb-32 md:o-px-10">
              <div className="o-mx-auto o-max-w-6xl">
                <Reveal>
                  <Indice rang="06" sombre={false}>
                    Jeudi
                  </Indice>
                </Reveal>
                <Reveal delay={80}>
                  <h2
                    className="o-m-0 o-mb-14 o-mt-6 o-max-w-2xl o-text-stone-900 dark:o-text-stone-50"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.85rem, 4vw, 3.5rem)',
                      lineHeight: 1,
                    }}
                  >
                    Cinq places, entre huit heures et vingt heures.
                  </h2>
                </Reveal>
                <Reglette />
              </div>
            </section>
          </main>

          {/* ================= Le pied : une horloge et une adresse ======= */}
          <footer className="o-px-6 o-py-24 md:o-px-10" style={nuit('stone')}>
            <div className="o-mx-auto o-grid o-max-w-4xl o-items-center o-gap-16 sm:o-grid-cols-2">
              <div className="o-mx-auto o-w-full o-max-w-3xs">
                <Horloge />
              </div>
              <address className="o-m-0 o-not-italic">
                <p
                  className="o-m-0 o-text-stone-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                    lineHeight: 1.1,
                  }}
                >
                  6 rue Gaultier
                  <br />
                  35000 Rennes
                </p>
                <p className="o-m-0 o-mt-8 o-font-mono o-text-sm o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-400">
                  Du mardi au samedi
                  <br />
                  <a
                    href="#jeudi"
                    className="o-no-underline focus:o-ring"
                    style={{ color: encreSurSombre() }}
                  >
                    02 99 00 00 00
                  </a>
                </p>
                <p className="o-m-0 o-mt-10 o-text-xs o-leading-relaxed o-text-stone-400">
                  © 2026 Appui — cabinet d osteopathie · Mentions legales · Accessibilite
                  : partiellement conforme
                </p>
              </address>
            </div>
          </footer>
        </div>
      </div>
    </Porte>
  )
}
