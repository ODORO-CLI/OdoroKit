/**
 * Axe — automobile electrique.
 *
 * ## Le parti pris
 *
 * Archetype : diptyque. Le heros est coupe en deux dans la hauteur de l ecran.
 * A gauche, sur le plan de travail clair, une barre fine non collante, le nom
 * de la voiture en tres gros et deux lignes. A droite, la route : une plaque
 * sombre qui touche le bord de la page, sans marge, sans texte, sans arrondi.
 * Rien n est centre ; sous sept cent soixante-huit pixels les deux moities
 * s empilent.
 *
 * Puis quatre ecrans, chacun avec sa forme : le poste de conduite qui se
 * redresse en perspective quand on defile ; la charge, epinglee — trois actes
 * qui se remplacent pendant qu on descend, l anneau se remplit et la duree
 * change de borne ; les notes de chantier, un texte court dont les chiffres
 * sont dans la marge ; et la date d essai a choisir dans une carte. Le pied
 * est une bande de partenaires en gris et une seule ligne.
 *
 * ## Ce que la page fait, et pas seulement montre
 *
 * La charge est calculee, jamais lue dans une table : la duree depend de la
 * batterie choisie, de la borne et de la fenetre, et la voiture bride au-dela
 * de quatre-vingts pour cent — le troisieme acte le montre. L essai a domicile
 * a un vrai tableau de creneaux : ceux qui sont pris ne se choisissent pas.
 *
 * ## Le relief
 *
 * La plaque de droite porte un relief en fil de fer dont les cretes defilent
 * vers la camera, une vallee menagee au centre : c est la route qui vient. Ses
 * trois couleurs citent `--o-vitrine-*` : la nuance 950 pour le brouillard,
 * les nuances 300 et 100 pour les lignes et les cretes.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight, Check } from '@odoro-cli/icons/outline'
import { Input } from '@odoro-cli/libs/ui'
import { useState, type CSSProperties, type ReactElement } from 'react'

import { TerrainWireframe } from '@/odoro/background/TerrainWireframe.jsx'
import { useInView } from '@/odoro/hooks/useInView'
import { ContainerScroll } from '@/odoro/section/ContainerScroll.jsx'
import { LogoBand } from '@/odoro/section/LogoBand.jsx'
import { ScrollFloat } from '@/odoro/text/ScrollFloat.jsx'
import { ProgressRing } from '@/odoro/ui/ProgressRing.jsx'

import { accent, accentDoux, encre } from './palettes.js'
import { affiche, Porte, Surgit, TitreVague, usePolices } from './marche.jsx'
import { Epingle } from './scene.jsx'

/**
 * L accent, ramene vers l encre du theme.
 *
 * La barre laisse choisir **n importe quelle** couleur : une nuance posee
 * telle quelle serait illisible des que le visiteur prend un accent tres clair
 * en theme clair, ou tres sombre en theme sombre. `encre()` choisit la nuance
 * qui tient.
 */
const ENCRE_ACCENT = encre()

/**
 * Le bouton plein et son encre.
 *
 * Un bouton peint a la couleur choisie porterait une encre blanche illisible
 * si le visiteur prend du jaune. L aplat est donc l accent ramene vers le noir
 * de moitie : il reste teinte, et l encre blanche y tient au-dessus de 6:1.
 */
const BOUTON_PLEIN: CSSProperties = {
  backgroundColor: `color-mix(in oklab, ${accent(500)} 50%, black)`,
  color: 'var(--o-palette-white)',
}

/** Les liens de la barre fine, posee dans la moitie textuelle. */
const NAVIGATION = [
  ['#poste', 'Le poste'],
  ['#charge', 'La charge'],
  ['#coupe', 'La coupe'],
  ['#notes', 'Les notes'],
  ['#essai', 'Essai'],
] as const

/** Une batterie, avec ce qu elle change a la charge. */
interface Batterie {
  readonly cle: string
  readonly nom: string
  /** Capacite utile, en kilowattheures. */
  readonly capacite: number
  /** Puissance de pointe admise en courant continu. */
  readonly pointe: number
  /** Nom commercial : Axe 60 ou Axe 80. */
  readonly serie: string
  /** Autonomie de reference, en jantes de 19 pouces. */
  readonly autonomie: number
}

/** Les deux batteries. */
const BATTERIES: readonly Batterie[] = [
  {
    cle: '60',
    nom: '60 kWh',
    capacite: 60,
    pointe: 150,
    serie: 'Axe 60',
    autonomie: 432,
  },
  {
    cle: '82',
    nom: '82 kWh',
    capacite: 82,
    pointe: 270,
    serie: 'Axe 80',
    autonomie: 612,
  },
]

/** Une borne de recharge, avec sa puissance et son prix au kilowattheure. */
interface Borne {
  readonly nom: string
  readonly kw: number
  /** Courant continu : la voiture accepte alors sa puissance de pointe. */
  readonly continu: boolean
  readonly prixKwh: number
  readonly ou: string
}

/** Les trois actes de la charge epinglee : une borne, une fenetre, un mot. */
const ACTES: readonly {
  readonly titre: string
  readonly mot: string
  readonly borne: Borne
  readonly debut: number
  readonly fin: number
}[] = [
  {
    titre: 'La nuit, au garage',
    mot: 'On branche en rentrant, on debranche en partant. Le compteur tourne au tarif de nuit.',
    borne: {
      nom: 'Borne murale, monophase',
      kw: 7.4,
      continu: false,
      prixKwh: 0.21,
      ou: 'A la maison, posee 1 190 €',
    },
    debut: 20,
    fin: 80,
  },
  {
    titre: 'Sur l aire, le temps d un cafe',
    mot: 'La voiture monte a sa pointe, puis redescend. Le calcul compte les trois quarts de la pointe jusqu a quatre-vingts.',
    borne: {
      nom: 'Borne ultra-rapide continue',
      kw: 270,
      continu: true,
      prixKwh: 0.59,
      ou: 'Aires d autoroute, 19 400 points',
    },
    debut: 10,
    fin: 80,
  },
  {
    titre: 'Viser cent pour cent',
    mot: 'Au-dela de quatre-vingts, la voiture bride : les vingt derniers pour cent coutent plus cher en temps qu en euros.',
    borne: {
      nom: 'Borne ultra-rapide continue',
      kw: 270,
      continu: true,
      prixKwh: 0.59,
      ou: 'Aires d autoroute, 19 400 points',
    },
    debut: 80,
    fin: 100,
  },
]

/** Le rendement de la chaine de charge, plus faible en alternatif. */
const RENDEMENT_CONTINU = 0.96
const RENDEMENT_ALTERNATIF = 0.89

/**
 * La duree d une charge, en minutes.
 *
 * En courant continu, la puissance annoncee n est jamais tenue de bout en
 * bout : la voiture monte a la pointe puis redescend. La courbe est donc
 * coupee en deux — jusqu a quatre-vingts pour cent, les trois quarts de la
 * pointe ; au-dela, un quart. En alternatif, le chargeur embarque tient sa
 * puissance du debut a la fin, et c est la prise qui limite.
 */
function dureeCharge(
  capacite: number,
  pointe: number,
  debut: number,
  fin: number,
  borne: Borne,
): number {
  const utile = Math.min(borne.kw, borne.continu ? pointe : borne.kw)
  const rendement = borne.continu ? RENDEMENT_CONTINU : RENDEMENT_ALTERNATIF
  const basse = Math.max(0, Math.min(fin, 80) - debut)
  const haute = Math.max(0, fin - Math.max(debut, 80))
  const moyenneBasse = borne.continu ? utile * 0.74 : utile
  const moyenneHaute = borne.continu ? utile * 0.26 : utile
  const heures =
    (capacite * (basse / 100)) / (moyenneBasse * rendement) +
    (capacite * (haute / 100)) / (moyenneHaute * rendement)
  return Math.round(heures * 60)
}

/** Une duree en minutes, ecrite comme on la lit. */
function formaterDuree(minutes: number): string {
  if (minutes < 60) return `${String(minutes)} min`
  const heures = Math.floor(minutes / 60)
  const reste = minutes % 60
  return reste === 0
    ? `${String(heures)} h`
    : `${String(heures)} h ${String(reste).padStart(2, '0')}`
}

/**
 * Les notes de chantier : un texte court, et son chiffre dans la marge.
 *
 * L homologue d un cote, le releve de l autre : la page ne met aucun nombre
 * en scene, elle les annote. C est la forme C7.
 */
const NOTES: readonly {
  readonly marge: string
  readonly quoi: string
  readonly texte: string
}[] = [
  {
    marge: '548 km',
    quoi: 'releve, contre 612 homologues',
    texte:
      'Notre boucle fait 340 kilometres, a 17 degres, climatisation en automatique, deux passages. Le chiffre releve est celui du carnet remis a la livraison, pas celui de la brochure.',
  },
  {
    marge: '16,1 kWh',
    quoi: 'aux cent, contre 14,6',
    texte:
      'Le cycle compte l energie prise a la prise, pas celle sortie de la batterie : neuf pour cent partent en chaleur dans le chargeur embarque. Nous l ecrivons.',
  },
  {
    marge: '19 min',
    quoi: 'de 10 a 80 %, contre 18',
    texte:
      'Une minute d ecart sur une aire d autoroute a 12 degres, batterie preconditionnee par le planificateur. Sans preconditionnement, comptez un tiers de plus.',
  },
  {
    marge: '8 ans',
    quoi: 'ou 240 000 km',
    texte:
      'La batterie est garantie a soixante-dix pour cent de sa capacite, mesuree en atelier sur cycle normalise. Un entretien fait ailleurs ne fait pas tomber la garantie : la facture suffit.',
  },
  {
    marge: '815 €',
    quoi: 'd entretien sur 100 000 km',
    texte:
      'Pas de vidange, pas de courroie, pas de filtre a air moteur. Un controle tous les deux ans, le liquide de frein, le circuit de refroidissement tous les quatre ans. Nous publions le detail parce que c est la moitie de ce qu on paie ailleurs.',
  },
  {
    marge: '94 cm',
    quoi: 'aux genoux, place arriere',
    texte:
      'Plancher plat, banquette 40/20/40 rabattable depuis le coffre, trois ceintures trois points. Une berline compacte en donne 78 ; la moyenne du segment, 86.',
  },
]

/**
 * Les organes que la coupe numerote.
 *
 * La page disait tout en paragraphes ; une voiture se montre en coupe. Les
 * cinq renvois du dessin ont ici leur legende — c est elle qui porte le sens,
 * le dessin etant masque aux lecteurs d ecran.
 */
const ORGANES: readonly {
  readonly rang: string
  readonly organe: string
  readonly texte: string
}[] = [
  {
    rang: '01',
    organe: 'La batterie, dans le plancher',
    texte:
      'Quatre-vingt-deux kilowattheures utiles en douze modules boulonnes sous le plancher. Le centre de gravite tombe a quarante-quatre centimetres du sol.',
  },
  {
    rang: '02',
    organe: 'Le moteur arriere',
    texte:
      'Synchrone a aimants permanents, deux cent dix kilowatts. C est lui qui pousse ; l avant ne s enclenche qu en perte d adherence.',
  },
  {
    rang: '03',
    organe: 'Le bloc avant',
    texte:
      'Cinquante kilowatts, et cinquante-huit litres de rangement par-dessus. La trappe s ouvre depuis le trottoir, cable de charge dedans.',
  },
  {
    rang: '04',
    organe: 'L habitacle, plancher plat',
    texte:
      'Quatre-vingt-quatorze centimetres aux genoux a l arriere : ni tunnel de transmission, ni boite, ni echappement a loger.',
  },
  {
    rang: '05',
    organe: 'Le coffre',
    texte:
      'Cinq cent trente litres sous tablette, mille quatre cent dix banquette rabattue. Seuil de chargement a soixante-douze centimetres.',
  },
]

/**
 * L autonomie relevee selon l allure — la seule mesure que la page anime.
 *
 * Trois passages sur la meme boucle, le meme jour. La barre se remplit quand
 * la figure entre dans le champ : c est le mouvement le plus honnete qu on
 * puisse donner a un chiffre, puisqu il dit le rapport entre les trois.
 */
const ALLURES: readonly {
  readonly allure: string
  readonly km: number
  readonly note: string
}[] = [
  { allure: '90 km/h', km: 631, note: 'nationale, regulateur' },
  { allure: '110 km/h', km: 548, note: 'autoroute, deux passages' },
  { allure: '130 km/h', km: 452, note: 'autoroute, pleine charge' },
]

/** Le maximum de la mesure : c est lui qui donne l echelle des barres. */
const ALLURE_MAX = 631

/** Les creneaux d essai a domicile, sur quatre jours. */
const CRENEAUX: readonly {
  readonly jour: string
  readonly date: string
  readonly plages: readonly { readonly heure: string; readonly libre: boolean }[]
}[] = [
  {
    jour: 'Jeudi',
    date: '17 septembre',
    plages: [
      { heure: '9h - 11h', libre: false },
      { heure: '11h - 13h', libre: true },
      { heure: '14h - 16h', libre: true },
      { heure: '17h - 19h', libre: false },
    ],
  },
  {
    jour: 'Vendredi',
    date: '18 septembre',
    plages: [
      { heure: '9h - 11h', libre: true },
      { heure: '11h - 13h', libre: false },
      { heure: '14h - 16h', libre: false },
      { heure: '17h - 19h', libre: true },
    ],
  },
  {
    jour: 'Samedi',
    date: '19 septembre',
    plages: [
      { heure: '9h - 11h', libre: true },
      { heure: '11h - 13h', libre: true },
      { heure: '14h - 16h', libre: false },
      { heure: '17h - 19h', libre: false },
    ],
  },
  {
    jour: 'Lundi',
    date: '21 septembre',
    plages: [
      { heure: '9h - 11h', libre: true },
      { heure: '11h - 13h', libre: true },
      { heure: '14h - 16h', libre: true },
      { heure: '17h - 19h', libre: true },
    ],
  },
]

/** Les reseaux de recharge acceptes par la carte incluse. */
const PARTENAIRES = [
  'Ionity',
  'Electra',
  'Freshmile',
  'Izivia',
  'Chargemap',
  'TotalEnergies',
  'Allego',
  'Fastned',
] as const

/**
 * Le theme sombre force de la plaque de droite et de la scene de charge.
 *
 * Les pieces qui lisent les variables de theme doivent y voir une plaque
 * sombre, quel que soit le theme du visiteur : la route est nocturne dans les
 * deux cas.
 */
const PLAQUE_SOMBRE: CSSProperties = {
  colorScheme: 'dark',
  ['--o-theme-bg' as string]: 'var(--o-palette-zinc-950)',
  ['--o-theme-surface' as string]: 'var(--o-palette-zinc-900)',
  ['--o-theme-fg' as string]: 'var(--o-palette-zinc-50)',
  ['--o-theme-muted' as string]: 'var(--o-palette-zinc-400)',
  ['--o-theme-line' as string]: 'var(--o-palette-zinc-800)',
}

/**
 * La lueur posee sous le relief.
 *
 * Le repli d une scene est une classe, et une classe ne peut pas citer la
 * palette de la vitrine. Le degrade est donc peint sur la plaque — il suit
 * l accent — et le repli de la scene est laisse transparent.
 */
const LUEUR_ROUTE: CSSProperties = {
  backgroundImage: `linear-gradient(to top, var(--o-palette-zinc-950) 42%, color-mix(in oklab, ${accent(500)} 45%, var(--o-palette-zinc-950)))`,
}

/** L accent tel qu il se lit sur la plaque sombre. */
const VIF = `color-mix(in oklab, ${accent(500)} 45%, white)`

/**
 * Le debord du tirage d essai, et le retour de sa legende.
 *
 * Le corps de la page tient dans six colonnes de soixante-douze rem centrees.
 * Le tirage, lui, sort de sa gouttiere jusqu au bord de la fenetre : la marge
 * negative vaut exactement la moitie de ce qui reste. Sous soixante-douze rem
 * il n y a plus rien a rendre, et `min` ramene le debord a zero. La legende
 * fait le chemin inverse pour se realigner sur la colonne.
 */
const DEBORDE = 'min(0px, calc((100vw - 72rem) / -2))'
const RENTRE = 'max(0px, calc((100vw - 72rem) / 2))'

/**
 * Le titre d une section, en Inter Tight leger, qui flotte puis se pose.
 *
 * L amplitude est courte et la course d un tiers d ecran : un titre qui met
 * un demi-ecran a se poser reste illisible pendant tout le temps ou on le
 * regarde. La flottaison doit se remarquer une fois, pas gener la lecture.
 */
function Titre({ children }: { readonly children: string }): ReactElement {
  return (
    <ScrollFloat
      as="h2"
      lift={16}
      period={3800}
      course={0.35}
      className="o-m-0 o-max-w-3xl o-text-balance o-text-zinc-950 dark:o-text-zinc-50"
      style={{ ...affiche('m', 300), fontSize: 'clamp(2.25rem, 5vw, 4.5rem)' }}
    >
      {children}
    </ScrollFloat>
  )
}

/**
 * La coupe longitudinale, dessinee au trait.
 *
 * ## Pourquoi un dessin, et pas une photographie de plus
 *
 * La moitie basse de la page tombait en paragraphes : six notes, un formulaire,
 * un pied. Une voiture electrique se distingue par ce qu on ne voit pas —
 * le plancher plein de modules, les deux blocs, le coffre avant. Une coupe le
 * montre d un seul regard, la ou trois paragraphes le decrivent mal.
 *
 * ## Le trace
 *
 * Chaque groupe part en pointille long et se referme : `stroke-dashoffset`
 * glisse de la longueur de la ligne a zero quand la figure entre dans le champ.
 * La valeur est volontairement large — plus longue que le plus long chemin du
 * groupe — pour qu aucun trait ne boucle. Sous mouvement reduit, tout est deja
 * trace : une figure qui ne se dessine pas reste une figure, une figure qui ne
 * s affiche pas est un trou.
 */
function Coupe(): ReactElement {
  const { reduced } = useMotionState()
  const { ref, vu } = useInView<HTMLDivElement>({ amount: 0.2 })

  /** Le pointille d un groupe : sa longueur, et le retard de son trace. */
  const trace = (longueur: number, delai: number): CSSProperties =>
    reduced
      ? {}
      : {
          strokeDasharray: longueur,
          strokeDashoffset: vu ? 0 : longueur,
          transition: `stroke-dashoffset 2200ms cubic-bezier(0.22, 1, 0.36, 1) ${String(delai)}ms`,
        }

  /** Un remplissage qui arrive apres son contour. */
  const apparait = (delai: number): CSSProperties =>
    reduced
      ? {}
      : { opacity: vu ? 1 : 0, transition: `opacity 700ms ease ${String(delai)}ms` }

  /** Un renvoi numerote : le disque, son chiffre, et son fil. */
  const renvoi = (
    rang: string,
    cx: number,
    cy: number,
    vers: readonly [number, number],
  ): ReactElement => (
    <g key={rang}>
      <path
        d={`M${String(cx)} ${String(cy)}L${String(vers[0])} ${String(vers[1])}`}
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
      />
      <circle cx={cx} cy={cy} r="14" fill="currentColor" stroke="none" />
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fontSize="13"
        fontFamily="var(--o-vitrine-mono, monospace)"
        fill="var(--o-theme-bg)"
        stroke="none"
      >
        {rang}
      </text>
    </g>
  )

  return (
    <div ref={ref}>
      <svg
        viewBox="0 0 1240 470"
        className="o-h-auto o-w-full"
        role="img"
        aria-label="Coupe longitudinale de l Axe 80 : la batterie dans le plancher, le moteur arriere, le bloc avant, l habitacle a plancher plat et le coffre"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Le sol, et la cote de longueur. */}
        <g opacity="0.35" style={trace(2600, 0)}>
          <path d="M40 394h1160" />
          <path d="M96 436h1030M96 428v16M1126 428v16" />
        </g>

        {/* La carrosserie : un seul contour, arches comprises. */}
        <g style={trace(3600, 120)}>
          <path d="M96 312v-44c2-24 28-36 80-42l124-10c68-68 152-104 300-106 142-2 226 34 290 102l186 10c44 6 50 24 50 54v36h-114a72 72 0 0 0-144 0H332a72 72 0 0 0-144 0Z" />
        </g>

        {/* La serre : ceinture de caisse, montants, lunette. */}
        <g opacity="0.55" style={trace(1800, 420)}>
          <path d="M330 212h546M344 208l118-62M596 112v96M742 110l122 96" />
        </g>

        {/* Les roues, jantes comprises. */}
        <g style={trace(1400, 300)}>
          <circle cx="260" cy="330" r="62" />
          <circle cx="260" cy="330" r="30" />
          <circle cx="940" cy="330" r="62" />
          <circle cx="940" cy="330" r="30" />
        </g>

        {/* (01) La batterie : le plancher, et ses douze modules. */}
        <g style={apparait(900)}>
          <rect
            x="316"
            y="282"
            width="568"
            height="30"
            rx="6"
            fill={accentDoux(500, 34)}
            stroke="currentColor"
          />
          <g opacity="0.45">
            {Array.from({ length: 11 }, (_, k) => (
              <path
                key={k}
                d={`M${String(316 + (k + 1) * 47.3)} 284v26`}
                strokeWidth="1"
              />
            ))}
          </g>
        </g>

        {/* (02) Le moteur arriere, (03) le bloc avant, (05) le coffre. */}
        <g style={apparait(1100)}>
          <rect
            x="884"
            y="254"
            width="84"
            height="44"
            rx="9"
            fill={accentDoux(500, 24)}
            stroke="currentColor"
          />
          <circle cx="926" cy="276" r="13" strokeWidth="1.2" />
          <rect
            x="108"
            y="234"
            width="98"
            height="38"
            rx="8"
            fill={accentDoux(500, 24)}
            stroke="currentColor"
          />
          <circle cx="157" cy="253" r="10" strokeWidth="1.2" />
          <rect
            x="984"
            y="222"
            width="118"
            height="34"
            rx="5"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </g>

        {/* (04) L habitacle : planche, deux sieges, et la cote aux genoux. */}
        <g style={trace(1800, 700)}>
          {/* La planche, la colonne et le volant. */}
          <path
            d="M338 234l70 14M404 246l18-34M412 206l20 12"
            strokeWidth="2"
            opacity="0.75"
          />
          {/* Les deux sieges : appuie-tete, dossier, assise. */}
          <rect x="450" y="192" width="26" height="16" rx="5" strokeWidth="2" />
          <path d="M458 210l14 72h72" strokeWidth="2.6" />
          <rect x="662" y="192" width="26" height="16" rx="5" strokeWidth="2" />
          <path d="M670 210l14 72h72" strokeWidth="2.6" />
          {/* La cote aux genoux, entre le dossier avant et le siege arriere. */}
          <path d="M548 252h116M548 244v16M664 244v16" strokeWidth="1.2" opacity="0.55" />
        </g>

        {/* Les cinq renvois. */}
        <g style={apparait(1500)}>
          {renvoi('01', 600, 358, [600, 314])}
          {renvoi('02', 826, 374, [884, 292])}
          {renvoi('03', 86, 176, [140, 234])}
          {renvoi('04', 586, 52, [586, 110])}
          {renvoi('05', 1160, 176, [1094, 224])}
        </g>
      </svg>
    </div>
  )
}

/**
 * L autonomie relevee selon l allure : trois barres qui se remplissent.
 *
 * Le nombre est ecrit en clair des le premier rendu — c est lui qu on copie et
 * qu un lecteur d ecran annonce. Seule la barre bouge, et seulement une fois,
 * a l entree dans le champ.
 */
/**
 * Le poste de conduite, dessine au trait.
 *
 * Il remplace une photographie qui montrait le volant d un constructeur reel,
 * logo compris, au milieu d une page qui vend une marque inventee. Une marque
 * qui emprunte le volant d une autre ne vend rien : elle se trahit. Et le
 * dessin dit mieux ce que la page raconte — les deux ecrans, la tete haute, la
 * planche basse — parce qu il ne montre que cela.
 */
function PosteDessine(): ReactElement {
  const trait = 'var(--o-theme-fg)'
  return (
    <svg
      viewBox="0 0 1400 900"
      className="o-h-auto o-w-full"
      role="img"
      aria-label="Le poste de conduite de l Axe 80 : un ecran de conduite de 12,3 pouces, un ecran central de 14 pouces, une planche basse et un volant a deux branches"
      fill="none"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <rect width="1400" height="900" fill={accentDoux(500, 8)} />
      {/* Le pare-brise et les montants. */}
      <path d="M92 96h1216l-96 236H188Z" stroke={trait} strokeWidth="3" opacity="0.35" />
      <path
        d="M188 332 92 96M1212 332l96-236"
        stroke={trait}
        strokeWidth="3"
        opacity="0.35"
      />
      {/* La tete haute, projetee sur le pare-brise. */}
      <g opacity="0.8">
        <rect
          x="386"
          y="168"
          width="196"
          height="54"
          rx="4"
          stroke={accent(500)}
          strokeWidth="2"
          strokeDasharray="7 6"
        />
        <text
          x="404"
          y="203"
          fontSize="26"
          fill={accent(500)}
          style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.08em' }}
        >
          112 km/h
        </text>
      </g>
      {/* La planche : une seule ligne basse, c est le parti pris de la voiture. */}
      <path d="M96 332h1208v104H96Z" stroke={trait} strokeWidth="3" />
      <path d="M96 436h1208" stroke={trait} strokeWidth="2" opacity="0.5" />
      {/* L ecran de conduite, derriere le volant. */}
      <rect
        x="240"
        y="352"
        width="268"
        height="64"
        rx="5"
        stroke={trait}
        strokeWidth="2.5"
        fill={accentDoux(500, 16)}
      />
      <path d="M262 400h40M318 400h28M362 400h52" stroke={accent(500)} strokeWidth="4" />
      {/* L ecran central. */}
      <rect
        x="612"
        y="344"
        width="336"
        height="82"
        rx="5"
        stroke={trait}
        strokeWidth="2.5"
        fill={accentDoux(500, 16)}
      />
      <path
        d="M636 372h104M636 392h72M636 410h140"
        stroke={trait}
        strokeWidth="3"
        opacity="0.45"
      />
      <circle cx="900" cy="386" r="22" stroke={accent(500)} strokeWidth="3" />
      {/* Les aerateurs, une fente continue. */}
      <path
        d="M980 368h300M980 386h300M980 404h300"
        stroke={trait}
        strokeWidth="2"
        opacity="0.3"
      />
      {/* Le volant, a deux branches. */}
      <g stroke={trait} strokeWidth="4">
        <path
          d="M256 470c0-58 44-102 100-102s100 44 100 102-44 102-100 102-100-44-100-102Z"
          opacity="0.9"
        />
        <path d="M276 470h160" />
        <circle cx="356" cy="470" r="26" />
      </g>
      {/* La console basse et le plancher plat. */}
      <path d="M604 470h248v148H604Z" stroke={trait} strokeWidth="2.5" opacity="0.7" />
      <path
        d="M640 508h70M640 540h108M640 572h48"
        stroke={trait}
        strokeWidth="3"
        opacity="0.35"
      />
      <path
        d="M96 700h1208"
        stroke={trait}
        strokeWidth="2"
        opacity="0.25"
        strokeDasharray="10 10"
      />
      <text
        x="106"
        y="736"
        fontSize="22"
        fill="var(--o-theme-muted)"
        style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
      >
        PLANCHER PLAT — AUCUN TUNNEL
      </text>
    </svg>
  )
}

/**
 * L Axe 80 de profil, au trait. Il remplace la seconde photographie de salon,
 * ou l on reconnaissait un autre constructeur et le public d un stand.
 */
function ProfilDessine(): ReactElement {
  const trait = 'var(--o-theme-fg)'
  return (
    <svg
      viewBox="0 0 1400 700"
      className="o-h-auto o-w-full"
      role="img"
      aria-label="L Axe 80 de profil : cinq portes, un long empattement et un pavillon fuyant"
      fill="none"
      strokeLinejoin="round"
    >
      <rect width="1400" height="700" fill={accentDoux(500, 8)} />
      <g stroke={trait} strokeWidth="4">
        {/* La caisse. */}
        <path d="M128 470c0-58 26-96 96-112l118-30c46-72 118-108 216-110 104-2 176 34 226 110l232 34c74 12 116 48 116 108 0 24-14 40-42 40h-40" />
        <path d="M262 510h480M932 510h286" />
        {/* Les roues. */}
        <circle cx="352" cy="510" r="84" />
        <circle cx="352" cy="510" r="40" opacity="0.5" />
        <circle cx="1022" cy="510" r="84" />
        <circle cx="1022" cy="510" r="40" opacity="0.5" />
      </g>
      {/* Le vitrage et les portes. */}
      <g stroke={trait} strokeWidth="2.5" opacity="0.55">
        <path d="M366 322c40-58 96-88 168-90 78-2 132 30 174 90Z" />
        <path d="M716 232v90M560 234v88M868 250v72" />
        <path d="M486 340v150M700 336v154M888 342v148" />
      </g>
      {/* La batterie, marquee dans le plancher — le sujet de la page. */}
      <path
        d="M300 546h772v34H300Z"
        stroke={accent(500)}
        strokeWidth="3"
        strokeDasharray="12 8"
      />
      <text
        x="306"
        y="620"
        fontSize="22"
        fill={accent(500)}
        style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
      >
        82 kWh DANS LE PLANCHER
      </text>
    </svg>
  )
}

function Allures(): ReactElement {
  const { reduced } = useMotionState()
  const { ref, vu } = useInView<HTMLDListElement>({ amount: 0.4 })
  const ouvert = reduced || vu

  return (
    <dl ref={ref} className="o-m-0 o-flex o-flex-col o-gap-6">
      {ALLURES.map((a, rang) => (
        <div key={a.allure}>
          <div className="o-flex o-items-baseline o-justify-between o-gap-4">
            <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-300">
              {a.allure}
            </dt>
            <dd
              className="o-m-0 o-font-mono o-text-xl o-font-bold o-tabular-nums"
              style={{ color: ENCRE_ACCENT }}
            >
              {a.km} km
            </dd>
          </div>
          <div
            aria-hidden="true"
            className="o-mt-2 o-h-1.5 o-w-full o-rounded-full o-bg-zinc-200 dark:o-bg-zinc-800"
          >
            <div
              className="o-h-full o-rounded-full"
              style={{
                width: ouvert
                  ? `${String(Math.round((a.km / ALLURE_MAX) * 100))}%`
                  : '0%',
                backgroundColor: ENCRE_ACCENT,
                transition: reduced
                  ? undefined
                  : `width 1200ms cubic-bezier(0.22, 1, 0.36, 1) ${String(rang * 160)}ms`,
              }}
            />
          </div>
          <p className="o-m-0 o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
            {a.note}
          </p>
        </div>
      ))}
    </dl>
  )
}

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('inter')
  /** La batterie de la charge simulee. */
  const [batterie, setBatterie] = useState<string>('82')
  /** Le creneau d essai retenu. */
  const [creneau, setCreneau] = useState<string | undefined>(undefined)

  const choixBatterie =
    BATTERIES.find((b) => b.cle === batterie) ?? BATTERIES[1] ?? BATTERIES[0]!

  return (
    <Porte forme="compteur" marque="Axe">
      <div
        className="o-bg-zinc-50 o-text-zinc-900 dark:o-bg-zinc-950 dark:o-text-zinc-50"
        style={polices}
      >
        {/* ================= L ouverture : le diptyque ================= */}
        <section
          aria-label="Axe 80 Grande Autonomie"
          className="o-grid md:o-min-h-svh md:o-grid-cols-2"
        >
          <div className="o-flex o-flex-col o-px-6 md:o-px-10 lg:o-px-16">
            <nav
              aria-label="Navigation principale"
              className="o-flex o-flex-wrap o-items-baseline o-gap-x-7 o-gap-y-2 o-border-b o-border-zinc-300 o-py-5 o-font-mono o-text-xs o-uppercase o-tracking-widest dark:o-border-zinc-800"
            >
              <a
                href="#poste"
                className="o-font-bold o-text-zinc-900 o-no-underline dark:o-text-zinc-50 focus:o-ring"
              >
                Axe
              </a>
              {NAVIGATION.map(([href, libelle]) => (
                <a
                  key={href}
                  href={href}
                  className="o-text-zinc-600 o-no-underline o-transition-colors hover:o-text-zinc-950 dark:o-text-zinc-300 dark:hover:o-text-zinc-50 focus:o-ring"
                >
                  {libelle}
                </a>
              ))}
              <a
                href="#essai"
                className="o-ml-auto o-font-bold o-no-underline o-transition-colors focus:o-ring"
                style={{ color: ENCRE_ACCENT }}
              >
                Essai a domicile ↗
              </a>
            </nav>

            <div className="o-mt-auto o-py-14 md:o-py-20">
              <Surgit
                as="p"
                className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
              >
                Une seule voiture, trois finitions
              </Surgit>
              <TitreVague
                delai={100}
                className="o-m-0 o-mt-6 o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('xl', 800),
                  fontSize: 'clamp(5rem, 16vw, 14rem)',
                  lineHeight: 0.82,
                }}
              >
                Axe 80
              </TitreVague>
              <Surgit
                delai={360}
                as="p"
                className="o-m-0 o-mt-4 o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('m', 300),
                  fontSize: 'clamp(1.75rem, 3.6vw, 3.25rem)',
                }}
              >
                Grande Autonomie
              </Surgit>
              {/* La flottaison est reservee aux titres de section : une accroche
                  d ouverture doit se lire a la premiere image, pas apres un
                  demi-ecran de defilement. */}
              <Surgit
                delai={520}
                as="p"
                className="o-m-0 o-mt-8 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300 md:o-text-lg"
              >
                Six cent douze kilometres annonces, cinq cent quarante-huit releves. Nous
                publions les deux.
              </Surgit>
              <Surgit
                delai={660}
                className="o-mt-10 o-flex o-flex-wrap o-items-center o-gap-6"
              >
                <a
                  href="#essai"
                  className="o-inline-flex o-items-center o-gap-2 o-rounded-md o-px-6 o-py-3 o-text-base o-font-medium o-no-underline o-transition-opacity hover:o-opacity-90 focus:o-ring"
                  style={BOUTON_PLEIN}
                >
                  Essayer chez soi, deux heures
                  <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                </a>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  A partir de 41 900 € — livree sous 9 semaines
                </p>
              </Surgit>
            </div>
          </div>

          {/* La plaque : elle touche le bord, sans marge ni arrondi. */}
          <div
            className="o-relative o-isolate o-overflow-hidden o-bg-zinc-950 max-md:o-h-80"
            style={{ ...PLAQUE_SOMBRE, ...LUEUR_ROUTE }}
          >
            <TerrainWireframe
              aria-hidden="true"
              className="o-absolute o-inset-0 o-z-0"
              columns={84}
              speed={1.7}
              height={1.35}
              valley={0.62}
              colors={['--o-vitrine-950', '--o-vitrine-300', '--o-vitrine-100']}
              poster="o-bg-transparent"
            />
            <div
              aria-hidden="true"
              className="o-absolute o-inset-x-0 o-bottom-0 o-z-10 o-h-24"
              style={{
                backgroundImage:
                  'linear-gradient(to top, color-mix(in oklab, black 82%, transparent), transparent)',
              }}
            />
            <p className="o-absolute o-bottom-0 o-left-0 o-z-20 o-m-0 o-px-6 o-py-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-100">
              Paris — Lyon, une seule charge
            </p>
          </div>
        </section>

        <main>
          {/* ================= (01) Le poste de conduite, en perspective ================= */}
          <section
            id="poste"
            className="o-scroll-mt-24 o-overflow-hidden o-border-t o-border-zinc-300 o-px-6 o-pb-12 o-pt-20 dark:o-border-zinc-800 md:o-pt-28"
          >
            <div className="o-mx-auto o-max-w-6xl">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                (01) — Le poste de conduite
              </p>
              <div className="o-mt-5 o-grid o-items-end o-gap-6 md:o-grid-cols-12">
                <div className="md:o-col-span-8">
                  <Titre>A hauteur d oeil, sept boutons qui restent.</Titre>
                </div>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 md:o-col-span-4 md:o-text-right">
                  Ecran de conduite 12,3 pouces
                  <br />
                  ecran central 14 pouces
                  <br />
                  tete haute de serie
                </p>
              </div>
              <ContainerScroll
                label="Le poste de conduite de l Axe 80"
                rotation={22}
                scale={0.86}
                className="o-mt-4"
              >
                <PosteDessine />
              </ContainerScroll>
            </div>
          </section>

          {/* ================= (02) La charge, epinglee : trois actes ================= */}
          <section id="charge" className="o-scroll-mt-24">
            <Epingle
              ecrans={3.5}
              actes={3}
              className="o-text-zinc-50"
              style={PLAQUE_SOMBRE}
            >
              {(acte) => {
                const scene = ACTES[acte] ?? ACTES[0]
                if (scene === undefined) return null
                const minutes = dureeCharge(
                  choixBatterie.capacite,
                  choixBatterie.pointe,
                  scene.debut,
                  scene.fin,
                  scene.borne,
                )
                const fenetre = scene.fin - scene.debut
                const energie = (choixBatterie.capacite * fenetre) / 100
                const prise =
                  energie /
                  (scene.borne.continu ? RENDEMENT_CONTINU : RENDEMENT_ALTERNATIF)
                const km = Math.round((choixBatterie.autonomie * fenetre) / 100)
                return (
                  <div
                    className="o-relative o-flex o-size-full o-flex-col o-bg-zinc-950 o-px-6 o-py-10 md:o-px-10 lg:o-px-16"
                    style={LUEUR_ROUTE}
                  >
                    <div className="o-flex o-flex-wrap o-items-center o-justify-between o-gap-4">
                      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                        (02) — La charge, calculee — acte {String(acte + 1)} sur 3
                      </p>
                      <div role="group" aria-label="Batterie" className="o-flex o-gap-2">
                        {BATTERIES.map((b) => {
                          const actif = b.cle === choixBatterie.cle
                          return (
                            <button
                              key={b.cle}
                              type="button"
                              aria-pressed={actif}
                              onClick={() => {
                                setBatterie(b.cle)
                              }}
                              className="o-cursor-pointer o-rounded-full o-border-w-1 o-px-4 o-py-1.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-transition-colors focus:o-ring"
                              style={
                                actif
                                  ? {
                                      backgroundColor: VIF,
                                      color: 'var(--o-palette-zinc-950)',
                                      borderColor: VIF,
                                    }
                                  : {
                                      borderColor: 'var(--o-palette-zinc-700)',
                                      color: 'var(--o-palette-zinc-200)',
                                    }
                              }
                            >
                              {b.serie} — {b.nom}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="o-my-auto o-grid o-items-center o-gap-10 o-py-8 md:o-grid-cols-12">
                      <div className="md:o-col-span-5">
                        <p
                          key={scene.titre}
                          className="o-m-0 o-text-zinc-50"
                          style={{
                            ...affiche('l', 300),
                            fontSize: 'clamp(2.25rem, 5.5vw, 5.5rem)',
                          }}
                        >
                          {scene.titre}
                        </p>
                        <p className="o-m-0 o-mt-6 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-300 md:o-text-lg">
                          {scene.mot}
                        </p>
                        <p className="o-m-0 o-mt-6 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
                          {scene.borne.nom} — {scene.borne.kw.toLocaleString('fr-FR')} kW
                          <br />
                          {scene.borne.ou}
                        </p>
                      </div>

                      <div className="o-flex o-items-center o-justify-center md:o-col-span-3">
                        <ProgressRing
                          value={scene.fin}
                          size={220}
                          thickness={12}
                          label={`Charge visee, ${String(scene.fin)} pour cent`}
                          className="o-text-3xl o-text-zinc-50"
                        />
                      </div>

                      <dl className="o-m-0 o-border-t o-border-zinc-800 md:o-col-span-4">
                        {(
                          [
                            [
                              `De ${String(scene.debut)} a ${String(scene.fin)} %`,
                              formaterDuree(minutes),
                            ],
                            ['Autonomie reprise', `${String(km)} km`],
                            ['Energie prise', `${prise.toFixed(0)} kWh`],
                            [
                              'Prix de la session',
                              `${(prise * scene.borne.prixKwh).toFixed(2).replace('.', ',')} €`,
                            ],
                          ] as const
                        ).map(([terme, valeur], rang) => (
                          <div
                            key={terme}
                            className="o-flex o-items-baseline o-justify-between o-gap-4 o-border-b o-border-zinc-800 o-py-4"
                          >
                            <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                              {terme}
                            </dt>
                            <dd
                              className={`o-m-0 o-font-mono o-tabular-nums ${rang === 0 ? 'o-text-3xl o-font-bold md:o-text-4xl' : 'o-text-base'}`}
                              style={{
                                color: rang === 0 ? VIF : 'var(--o-palette-zinc-100)',
                              }}
                            >
                              {valeur}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <div className="o-flex o-items-center o-gap-3" aria-hidden="true">
                      {ACTES.map((a, rang) => (
                        <span
                          key={a.titre}
                          className="o-h-1 o-grow o-rounded-full"
                          style={{
                            backgroundColor:
                              rang <= acte ? VIF : 'var(--o-palette-zinc-800)',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )
              }}
            </Epingle>
          </section>

          {/* ================= (03) La coupe : ce que la page ne pouvait dire qu en mots ================= */}
          <section
            id="coupe"
            className="o-scroll-mt-24 o-border-t o-border-zinc-300 o-px-6 o-py-20 dark:o-border-zinc-800 md:o-py-28"
          >
            <div className="o-mx-auto o-max-w-6xl">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                (03) — La coupe, echelle 1 / 20
              </p>
              <div className="o-mt-5 o-grid o-items-end o-gap-6 md:o-grid-cols-12">
                <div className="md:o-col-span-8">
                  <Titre>Une voiture electrique se juge a ce qu on ne voit pas.</Titre>
                </div>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 md:o-col-span-4 md:o-text-right">
                  Longueur 4,74 m<br />
                  empattement 2,92 m<br />
                  garde au sol 14 cm
                </p>
              </div>

              <figure className="o-m-0 o-mt-12">
                <div
                  className="o-overflow-hidden o-rounded-2xl o-border-w-1 o-border-zinc-300 o-px-4 o-py-6 o-text-zinc-900 dark:o-border-zinc-800 dark:o-text-zinc-100 md:o-px-10 md:o-py-10"
                  style={{ backgroundColor: accentDoux(500, 5) }}
                >
                  <Coupe />
                </div>
                <figcaption className="o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  Fig. 01 — Axe 80 Grande Autonomie, coupe longitudinale, cotes en
                  millimetres au dossier technique
                </figcaption>
              </figure>

              <div className="o-mt-14 o-grid o-gap-12 lg:o-grid-cols-12">
                <ol className="o-m-0 o-grid o-list-none o-gap-x-10 o-gap-y-7 o-p-0 sm:o-grid-cols-2 lg:o-col-span-7">
                  {ORGANES.map((o) => (
                    <li
                      key={o.rang}
                      className="o-border-t o-border-zinc-300 o-pt-4 dark:o-border-zinc-800"
                    >
                      <p
                        className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                        style={{ color: ENCRE_ACCENT }}
                      >
                        ({o.rang})
                      </p>
                      <p className="o-m-0 o-mt-2 o-text-base o-font-medium o-text-zinc-950 dark:o-text-zinc-50">
                        {o.organe}
                      </p>
                      <p className="o-m-0 o-mt-2 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
                        {o.texte}
                      </p>
                    </li>
                  ))}
                </ol>

                <figure className="o-m-0 lg:o-col-span-5">
                  <figcaption className="o-mb-6 o-border-t o-border-zinc-300 o-pt-4 dark:o-border-zinc-800">
                    <span className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                      L autonomie selon l allure
                    </span>
                    <span className="o-mt-2 o-block o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
                      Meme boucle de 340 kilometres, meme journee, 17 degres. L
                      homologation en annonce 612 ; aucune des trois allures ne les rend.
                    </span>
                  </figcaption>
                  <Allures />
                </figure>
              </div>
            </div>
          </section>

          {/* ================= (04) Les notes de chantier : chiffres dans la marge (C7) ================= */}
          <section
            id="notes"
            className="o-scroll-mt-24 o-border-t o-border-zinc-300 o-px-6 o-py-20 dark:o-border-zinc-800 md:o-py-28"
          >
            <div className="o-mx-auto o-max-w-6xl">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                (04) — Notes de chantier
              </p>
              <div className="o-mt-5">
                <Titre>Ce que la voiture a fait, pas ce qu elle annonce.</Titre>
              </div>
              <ol className="o-m-0 o-mt-14 o-list-none o-border-t o-border-zinc-300 o-p-0 dark:o-border-zinc-800">
                {NOTES.map((note) => (
                  <li
                    key={note.marge}
                    className="o-grid o-gap-3 o-border-b o-border-zinc-300 o-py-7 dark:o-border-zinc-800 md:o-grid-cols-12 md:o-gap-8"
                  >
                    <div className="md:o-col-span-3">
                      <p
                        className="o-m-0 o-font-mono o-text-2xl o-font-bold o-tabular-nums o-tracking-tight md:o-text-3xl"
                        style={{ color: ENCRE_ACCENT }}
                      >
                        {note.marge}
                      </p>
                      <p className="o-m-0 o-mt-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                        {note.quoi}
                      </p>
                    </div>
                    <p className="o-m-0 o-max-w-2xl o-text-base o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-200 md:o-col-span-9 md:o-text-lg">
                      {note.texte}
                    </p>
                  </li>
                ))}
              </ol>
              <p className="o-m-0 o-mt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                Axe 80 Grande Autonomie, jantes de 19 pouces — carnet remis a la livraison
              </p>
            </div>
          </section>

          {/* ================= La coupe franche : une phrase, un ecran ================= */}
          <section
            aria-label="Ce que nous publions"
            className="o-relative o-isolate o-flex o-min-h-svh o-flex-col o-justify-center o-overflow-hidden o-bg-zinc-950 o-px-6 o-py-24 md:o-px-10 lg:o-px-16"
            style={{ ...PLAQUE_SOMBRE, ...LUEUR_ROUTE }}
          >
            <div className="o-mx-auto o-w-full o-max-w-6xl">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                Le protocole, en une phrase
              </p>
              <p
                className="o-m-0 o-mt-10 o-max-w-5xl o-text-balance o-text-zinc-50"
                style={{
                  ...affiche('l', 300),
                  fontSize: 'clamp(2.5rem, 6.5vw, 6rem)',
                  lineHeight: 1.02,
                }}
              >
                Une voiture se juge en fevrier, a cent trente,{' '}
                <span className="o-text-zinc-500">
                  avec quatre personnes et un coffre plein.
                </span>
              </p>
              <p className="o-m-0 o-mt-12 o-max-w-lg o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
                C est la seule boucle que nous publions. Les autres constructeurs publient
                la leur a vingt-trois degres, seul a bord, coffre vide.
              </p>
            </div>
          </section>

          {/* ================= (05) A15 : la date d essai, dans une carte ================= */}
          <section
            id="essai"
            className="o-scroll-mt-24 o-border-t o-border-zinc-300 o-px-6 o-py-20 dark:o-border-zinc-800 md:o-py-28"
            style={{ backgroundColor: accentDoux(500, 7) }}
          >
            <div className="o-mx-auto o-grid o-max-w-6xl o-items-start o-gap-12 lg:o-grid-cols-12">
              <div className="lg:o-col-span-5">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  (05) — Essai a domicile
                </p>
                <div className="o-mt-5">
                  <Titre>Deux heures, chez vous, sans vendeur a bord.</Titre>
                </div>
                <p className="o-m-0 o-mt-6 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
                  Nous amenons la voiture chargee a 90 %, nous vous laissons les clefs et
                  nous revenons deux heures plus tard. Vous conduisez vos trajets, pas un
                  parcours prepare.
                </p>
                <ul className="o-m-0 o-mt-8 o-flex o-list-none o-flex-col o-gap-3 o-p-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-700 dark:o-text-zinc-200">
                  {[
                    '214 communes, du lundi au samedi',
                    'Assurance tous risques, franchise a zero',
                    'Permis de plus de trois ans, aucune caution',
                  ].map((l) => (
                    <li key={l} className="o-flex o-items-center o-gap-3">
                      <Icon
                        icon={Check}
                        size={14}
                        aria-hidden="true"
                        style={{ color: ENCRE_ACCENT }}
                      />
                      {l}
                    </li>
                  ))}
                </ul>

                {/* La voiture qu on depose : elle passe sous la carte de creneaux,
                    debordant la colonne a gauche — la seule chose de cette page
                    qui sorte de sa gouttiere. */}
                <figure className="o-m-0 o-mt-12" style={{ marginLeft: DEBORDE }}>
                  <ProfilDessine />
                  <figcaption
                    className="o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
                    style={{ marginLeft: RENTRE }}
                  >
                    La voiture d essai, chargee a 90 %, deposee devant chez vous
                  </figcaption>
                </figure>
              </div>

              {/* La carte : le choix de date, puis deux champs. */}
              <form
                className="o-rounded-2xl o-border-w-1 o-border-zinc-300 o-bg-white o-p-6 o-shadow-2xl dark:o-border-zinc-800 dark:o-bg-zinc-900 md:o-p-8 lg:o-col-span-7"
                onSubmit={(evenement) => {
                  evenement.preventDefault()
                }}
              >
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  Choisir une date
                </p>
                <div className="o-mt-5 o-grid o-gap-5 sm:o-grid-cols-2">
                  {CRENEAUX.map((jour) => (
                    <div
                      key={jour.date}
                      className="o-border-t o-border-zinc-200 o-pt-4 dark:o-border-zinc-800"
                    >
                      <p className="o-m-0 o-text-lg o-font-medium o-tracking-tight o-text-zinc-950 dark:o-text-zinc-50">
                        {jour.jour}{' '}
                        <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                          {jour.date}
                        </span>
                      </p>
                      <ul className="o-m-0 o-mt-3 o-flex o-list-none o-flex-wrap o-gap-2 o-p-0">
                        {jour.plages.map((plage) => {
                          const cle = `${jour.jour} ${jour.date} — ${plage.heure}`
                          const retenu = cle === creneau
                          return (
                            <li key={plage.heure}>
                              <button
                                type="button"
                                disabled={!plage.libre}
                                aria-pressed={retenu}
                                onClick={() => {
                                  setCreneau(cle)
                                }}
                                className={
                                  !plage.libre
                                    ? 'o-cursor-not-allowed o-rounded-md o-border-w-1 o-border-zinc-200 o-px-3 o-py-1.5 o-font-mono o-text-xs o-tabular-nums o-text-zinc-500 o-line-through dark:o-border-zinc-800 dark:o-text-zinc-400'
                                    : retenu
                                      ? 'o-cursor-pointer o-rounded-md o-border-w-1 o-border-transparent o-px-3 o-py-1.5 o-font-mono o-text-xs o-tabular-nums o-transition-colors focus:o-ring'
                                      : 'o-cursor-pointer o-rounded-md o-border-w-1 o-border-zinc-300 o-px-3 o-py-1.5 o-font-mono o-text-xs o-tabular-nums o-text-zinc-700 o-transition-colors dark:o-border-zinc-700 dark:o-text-zinc-200 focus:o-ring'
                                }
                                style={retenu && plage.libre ? BOUTON_PLEIN : undefined}
                              >
                                {plage.heure}
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
                <p
                  aria-live="polite"
                  className="o-m-0 o-mt-5 o-text-sm o-text-zinc-600 dark:o-text-zinc-300"
                >
                  {creneau === undefined
                    ? 'Aucun creneau retenu. Sept plages restent libres cette semaine ; les autres sont deja prises.'
                    : `Creneau retenu : ${creneau}. Nous confirmons par courriel sous un jour ouvre.`}
                </p>
                <div className="o-mt-6 o-grid o-gap-5 o-border-t o-border-zinc-200 o-pt-6 dark:o-border-zinc-800 sm:o-grid-cols-2">
                  <Input
                    label="Code postal"
                    name="code-postal"
                    inputMode="numeric"
                    placeholder="69004"
                    required
                  />
                  <Input
                    label="Adresse electronique"
                    type="email"
                    name="courriel"
                    placeholder="vous@exemple.fr"
                    required
                  />
                </div>
                <div className="o-mt-6 o-flex o-flex-wrap o-items-center o-gap-4">
                  <button
                    type="submit"
                    className="o-cursor-pointer o-rounded-md o-px-6 o-py-3 o-text-base o-font-medium o-transition-opacity hover:o-opacity-90 focus:o-ring"
                    style={BOUTON_PLEIN}
                  >
                    Demander l essai
                  </button>
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    {choixBatterie.serie} livree — reponse sous un jour ouvre
                  </p>
                </div>
              </form>
            </div>
          </section>
        </main>

        {/* ================= P14 : partenaires en gris, et une ligne ================= */}
        <footer className="o-border-t o-border-zinc-300 o-px-6 o-pb-8 o-pt-6 dark:o-border-zinc-800">
          <div className="o-mx-auto o-max-w-7xl">
            <LogoBand
              speed={36}
              title="Les reseaux de recharge acceptes par la carte incluse"
              className="o-flex o-flex-col o-gap-6 o-py-8"
            >
              {PARTENAIRES.map((nom) => (
                <span
                  key={nom}
                  className="o-text-2xl o-font-bold o-tracking-tight o-text-zinc-500 dark:o-text-zinc-500"
                  style={{ fontFamily: 'var(--o-vitrine-affichage)' }}
                >
                  {nom}
                </span>
              ))}
            </LogoBand>
            <p className="o-m-0 o-flex o-flex-wrap o-items-center o-justify-between o-gap-x-8 o-gap-y-2 o-border-t o-border-zinc-300 o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-border-zinc-800 dark:o-text-zinc-400">
              <span>© 2026 Axe Automobiles SAS — Lyon</span>
              <span>12 boulevard Vivier-Merle — 04 72 60 18 40</span>
              <a
                href="mailto:essai@axe-automobile.fr"
                className="o-text-zinc-700 o-no-underline hover:o-underline dark:o-text-zinc-200 focus:o-ring"
              >
                essai@axe-automobile.fr ↗
              </a>
            </p>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
