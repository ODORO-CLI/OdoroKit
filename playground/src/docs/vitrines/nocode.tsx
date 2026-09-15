/**
 * Assemblee — l outil sans code.
 *
 * ## Le parti pris : on ne decrit pas le montage, on le fait
 *
 * Un outil sans code se vend d ordinaire par une capture d ecran de lui-meme et
 * trois colonnes de promesses. Celle-ci donne la chose : **trois tambours**, un
 * par brique — quand, si, alors — et, a cote, le resultat qui se construit
 * pendant qu on tourne.
 *
 * ## Le mecanisme : le montage
 *
 * Neuf evenements d une vraie semaine sont ecrits a la main : des paiements
 * avec leur montant, des formulaires, des lignes de tableur, un rendez-vous du
 * lundi. La regle montee par les trois tambours est **appliquee a chacun** :
 * le declencheur retient ceux de son espece, le filtre en ecarte, et l action
 * ecrit une ligne pour ceux qui restent. Le panneau de droite n est donc pas
 * une illustration — c est le journal d execution de la regle qu on vient de
 * composer, avec le temps qu elle fait gagner, calcule.
 *
 * La forme de chiffres de la page est **un seul pourcentage, en anneau** : la
 * part des evenements declenches qui passent le filtre. Il se remplit a chaque
 * changement de brique, et jamais au montage.
 *
 * ## Le rythme
 *
 * Sa signature est **M-perspective** : le tableau que les regles remplissent se
 * redresse au defilement. Autour, les ecarts — une **bande sombre** qui coupe
 * la page claire et ne porte qu une figure dessinee, celle des reprises quand
 * une action echoue, et un ecran ou une seule phrase tient toute la largeur.
 *
 * ## La palette
 *
 * Rien n est ecrit en lime. La page lit `--o-vitrine-*` : `encre()` pour ce qui
 * doit tenir sur les deux themes, `encreSurSombre()` sur la bande de nuit.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import {
  ArrowRight,
  Blocks,
  CircleCheck,
  Plug,
  TriangleAlert,
} from '@odoro-cli/icons/outline'
import {
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { BentoGrid } from '@/odoro/section/BentoGrid.jsx'
import { ContainerScroll } from '@/odoro/section/ContainerScroll.jsx'
import { RotatingWords } from '@/odoro/text/RotatingWords.jsx'
import { OptionWheel } from '@/odoro/ui/OptionWheel.jsx'
import { useInView } from '@/odoro/hooks/useInView'

import { nuit } from './communs.jsx'
import { accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreGelule,
  Coin,
  Encadre,
  Etiquette,
  Grain,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Nappe } from './scene.jsx'

/* ------------------------------------------------------------------------ */
/*                               Les encres                                 */
/* ------------------------------------------------------------------------ */

/** Le filet neutre, derive de l encre courante. */
const FILET = 'color-mix(in oklab, currentColor 14%, transparent)'

/** Le filet de la bande toujours sombre. */
const FILET_NUIT = 'color-mix(in oklab, #ffffff 16%, transparent)'

/** L encre d accent, lisible sur les deux themes. */
const ENCRE = encre()

/** L encre d accent sur la bande de nuit. */
const ENCRE_NUIT = encreSurSombre()

/** L aplat doux des panneaux. */
const VOILE = accentDoux(500, 10)

/** Les rubriques de la barre. */
const LIENS = [
  ['#montage', 'Le montage'],
  ['#tableau', 'Le tableau'],
  ['#casse', 'Quand ca casse'],
  ['#branche', 'Ce qu on branche'],
] as const

/* ------------------------------------------------------------------------ */
/*                        Les briques, et la semaine                        */
/* ------------------------------------------------------------------------ */

/** L espece d un evenement, qui decide du declencheur qui le retient. */
type Espece = 'paiement' | 'formulaire' | 'ligne' | 'lundi'

/** Un evenement de la semaine passee. */
interface Evenement {
  readonly id: string
  readonly jour: string
  readonly espece: Espece
  readonly qui: string
  /** En euros, quand l evenement en porte un. */
  readonly montant?: number
  readonly region?: string
  readonly nouveau: boolean
}

/**
 * Les neuf evenements d une semaine ordinaire.
 *
 * Ce ne sont pas des lignes de demonstration : ce sont eux que la regle montee
 * plus haut traverse, un a un. Ils sont ecrits pour que chaque filtre en
 * retienne un nombre different — sans quoi tourner les tambours ne changerait
 * rien de visible, et le mecanisme mentirait.
 */
const SEMAINE: readonly Evenement[] = [
  {
    id: 'e1',
    jour: 'Lun 06',
    espece: 'lundi',
    qui: 'Recapitulatif de la semaine',
    nouveau: false,
  },
  {
    id: 'e2',
    jour: 'Lun 06',
    espece: 'formulaire',
    qui: 'Atelier Kerzu — demande de devis',
    region: 'Bretagne',
    nouveau: true,
  },
  {
    id: 'e3',
    jour: 'Mar 07',
    espece: 'paiement',
    qui: 'Le Comptoir Vannetais — facture 118',
    montant: 1240,
    region: 'Bretagne',
    nouveau: false,
  },
  {
    id: 'e4',
    jour: 'Mar 07',
    espece: 'ligne',
    qui: 'Import du tableur fournisseurs',
    nouveau: false,
  },
  {
    id: 'e5',
    jour: 'Mer 08',
    espece: 'paiement',
    qui: 'Studio Plagne — facture 119',
    montant: 180,
    region: 'Auvergne',
    nouveau: true,
  },
  {
    id: 'e6',
    jour: 'Jeu 09',
    espece: 'formulaire',
    qui: 'Madame Toussaint — demande de rappel',
    region: 'Normandie',
    nouveau: true,
  },
  {
    id: 'e7',
    jour: 'Jeu 09',
    espece: 'paiement',
    qui: 'Brasserie du Blosne — facture 120',
    montant: 620,
    region: 'Bretagne',
    nouveau: false,
  },
  {
    id: 'e8',
    jour: 'Ven 10',
    espece: 'paiement',
    qui: 'Menuiserie Quere — acompte 121',
    montant: 3400,
    region: 'Bretagne',
    nouveau: true,
  },
  {
    id: 'e9',
    jour: 'Ven 10',
    espece: 'ligne',
    qui: 'Commande 8842 ajoutee au tableur',
    montant: 96.5,
    region: 'Pays de la Loire',
    nouveau: false,
  },
]

/** Une brique de declenchement. */
const QUAND: readonly {
  readonly value: Espece
  readonly label: string
  readonly phrase: string
}[] = [
  {
    value: 'paiement',
    label: 'un paiement est encaisse',
    phrase: 'un paiement est encaisse',
  },
  {
    value: 'formulaire',
    label: 'le formulaire est envoye',
    phrase: 'le formulaire du site est envoye',
  },
  {
    value: 'ligne',
    label: 'une ligne arrive au tableur',
    phrase: 'une ligne arrive dans le tableur',
  },
  {
    value: 'lundi',
    label: 'il est huit heures, lundi',
    phrase: 'il est huit heures, le lundi',
  },
]

/** Une brique de filtre. */
type Filtre = 'aucun' | 'montant' | 'region' | 'nouveau'

/** Les filtres proposes, et ce qu ils disent. */
const SI: readonly {
  readonly value: Filtre
  readonly label: string
  readonly phrase: string
}[] = [
  { value: 'aucun', label: 'sans condition', phrase: 'sans condition' },
  {
    value: 'montant',
    label: 'si le montant passe 300 EUR',
    phrase: 'si le montant depasse 300 EUR',
  },
  {
    value: 'region',
    label: 'si le client est en Bretagne',
    phrase: 'si le client est en Bretagne',
  },
  {
    value: 'nouveau',
    label: 'si le client est nouveau',
    phrase: 'si le client est nouveau',
  },
]

/** Une brique d action. */
type Action = 'fiche' | 'courriel' | 'tableau' | 'salon'

/** Les actions proposees. */
const ALORS: readonly {
  readonly value: Action
  readonly label: string
  readonly phrase: string
  readonly minutes: number
}[] = [
  {
    value: 'fiche',
    label: 'creer une fiche client',
    phrase: 'creer une fiche client',
    minutes: 4,
  },
  {
    value: 'courriel',
    label: 'envoyer un courriel',
    phrase: 'envoyer un courriel de remerciement',
    minutes: 3,
  },
  {
    value: 'tableau',
    label: 'ajouter au tableau de suivi',
    phrase: 'ajouter une ligne au tableau de suivi',
    minutes: 2,
  },
  {
    value: 'salon',
    label: 'prevenir le salon d equipe',
    phrase: 'prevenir le salon d equipe',
    minutes: 1,
  },
]

/** Une regle toute faite, qui regle les trois tambours d un coup. */
const MODELES: readonly {
  readonly nom: string
  readonly quand: Espece
  readonly si: Filtre
  readonly alors: Action
  readonly combien: string
}[] = [
  {
    nom: 'Le remerciement',
    quand: 'paiement',
    si: 'aucun',
    alors: 'courriel',
    combien: '612 maisons',
  },
  {
    nom: 'Le suivi des gros montants',
    quand: 'paiement',
    si: 'montant',
    alors: 'salon',
    combien: '418',
  },
  {
    nom: 'Le fichier client',
    quand: 'formulaire',
    si: 'nouveau',
    alors: 'fiche',
    combien: '377',
  },
  {
    nom: 'Le point du lundi',
    quand: 'lundi',
    si: 'aucun',
    alors: 'tableau',
    combien: '244',
  },
]

/** Les euros, a la francaise. */
const EN_EUROS = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Un montant, ecrit en euros. */
function euros(valeur: number | undefined): string {
  return valeur === undefined ? '—' : `${EN_EUROS.format(valeur)} EUR`
}

/** Le filtre applique a un evenement. */
function passe(evenement: Evenement, filtre: Filtre): boolean {
  if (filtre === 'aucun') return true
  if (filtre === 'montant')
    return evenement.montant !== undefined && evenement.montant > 300
  if (filtre === 'region') return evenement.region === 'Bretagne'
  return evenement.nouveau
}

/** La ligne que l action ecrirait, pour un evenement retenu. */
function ecriture(evenement: Evenement, action: Action): string {
  const nom = evenement.qui.split(' — ')[0] ?? evenement.qui
  if (action === 'fiche')
    return `Fiche creee — ${nom}${evenement.region === undefined ? '' : `, ${evenement.region}`}`
  if (action === 'courriel')
    return `Courriel parti a ${nom} — objet : « bien recu, merci »`
  if (action === 'tableau')
    return `Ligne ajoutee — ${evenement.jour}, ${nom}, ${euros(evenement.montant)}`
  return `Message dans le salon ventes — ${nom}, ${euros(evenement.montant)}`
}

/* ------------------------------------------------------------------------ */
/*                       C19 — un seul pourcentage, en anneau               */
/* ------------------------------------------------------------------------ */

/**
 * L anneau du taux de passage.
 *
 * Il n arrive jamais plein : il se remplit a l entree dans le champ, puis a
 * chaque changement de brique, parce que c est le changement qui est le sujet.
 * Le pourcentage est ecrit au centre, et la phrase qui le qualifie dessous —
 * un anneau sans son denominateur ne dit rien.
 */
function Anneau({
  part,
  dessus,
  dessous,
}: {
  readonly part: number
  readonly dessus: string
  readonly dessous: string
}): ReactElement {
  const { ref, vu } = useInView<SVGSVGElement>({ amount: 0.4 })
  const rayon = 62
  const tour = 2 * Math.PI * rayon
  const rempli = vu ? tour * part : 0
  return (
    <div className="o-flex o-flex-col o-items-center o-text-center">
      <svg
        ref={ref}
        viewBox="0 0 160 160"
        role="img"
        aria-label={`${String(Math.round(part * 100))} pour cent — ${dessous}`}
        style={{ width: 160, height: 160 }}
      >
        <circle
          cx="80"
          cy="80"
          r={rayon}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.14"
          strokeWidth="13"
        />
        <circle
          cx="80"
          cy="80"
          r={rayon}
          fill="none"
          stroke={ENCRE}
          strokeWidth="13"
          strokeLinecap="round"
          transform="rotate(-90 80 80)"
          style={{
            strokeDasharray: `${String(rempli)} ${String(tour)}`,
            transition: 'stroke-dasharray 900ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
        <text
          x="80"
          y="88"
          textAnchor="middle"
          className="o-tabular-nums"
          fontSize="34"
          fontWeight="600"
          fill="currentColor"
        >
          {Math.round(part * 100)} %
        </text>
      </svg>
      <p
        className="o-m-0 o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest"
        style={{ color: ENCRE }}
      >
        {dessus}
      </p>
      <p className="o-m-0 o-mt-1 o-max-w-xs o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
        {dessous}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/*                       Le mecanisme : trois tambours                      */
/* ------------------------------------------------------------------------ */

/** Le sort d un evenement, dans le journal : retenu, ecarte, ou d une autre espece. */
function Verdict({
  declenche,
  retenu,
}: {
  readonly declenche: boolean
  readonly retenu: boolean
}): ReactElement {
  if (retenu) {
    return (
      <span className="o-inline-flex o-items-center o-gap-1.5" style={{ color: ENCRE }}>
        <Icon icon={CircleCheck} size={13} aria-hidden="true" />
        retenu
      </span>
    )
  }
  return (
    <span className="o-text-zinc-500 dark:o-text-zinc-400">
      {declenche ? 'ecarte par le filtre' : 'autre espece'}
    </span>
  )
}

/** Le boitier d un tambour : son rang, son mot, et la roue. */
function Tambour({
  rang,
  mot,
  children,
}: {
  readonly rang: string
  readonly mot: string
  readonly children: ReactNode
}): ReactElement {
  return (
    <div
      className="o-relative o-rounded-2xl o-p-4"
      style={{ border: `1px solid ${FILET}`, backgroundColor: VOILE }}
    >
      <p
        className="o-m-0 o-mb-2 o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest"
        style={{ color: ENCRE }}
      >
        <span className="o-tabular-nums">{rang}</span>
        {mot}
      </p>
      {children}
    </div>
  )
}

/** Les trois briques, et le resultat qui se construit a cote. */
function Montage(): ReactElement {
  const [quand, setQuand] = useState<Espece>('paiement')
  const [si, setSi] = useState<Filtre>('montant')
  const [alors, setAlors] = useState<Action>('fiche')

  const bilan = useMemo(() => {
    const declenches = SEMAINE.filter((e) => e.espece === quand)
    const retenus = declenches.filter((e) => passe(e, si))
    const minutes = (ALORS.find((a) => a.value === alors)?.minutes ?? 0) * retenus.length
    return {
      declenches,
      retenus,
      part: declenches.length === 0 ? 0 : retenus.length / declenches.length,
      minutes,
      annee: Math.round((minutes * 52) / 6) / 10,
    }
  }, [quand, si, alors])

  const phrase = `Quand ${QUAND.find((q) => q.value === quand)?.phrase ?? ''}, ${
    SI.find((f) => f.value === si)?.phrase ?? ''
  }, alors ${ALORS.find((a) => a.value === alors)?.phrase ?? ''}.`

  return (
    <div className="o-grid o-gap-10 lg:o-grid-cols-12 lg:o-gap-12">
      {/* ----- Les trois tambours ---------------------------------------- */}
      <div className="o-min-w-0 lg:o-col-span-5">
        <div className="o-grid o-gap-4 sm:o-grid-cols-3 lg:o-grid-cols-1">
          <Tambour rang="01" mot="Quand">
            <OptionWheel
              options={QUAND}
              label="Le declencheur"
              value={quand}
              onChange={(v) => {
                setQuand(v as Espece)
              }}
              visible={3}
              curve={22}
              style={{ '--o-wheel-accent': ENCRE } as CSSProperties}
            />
          </Tambour>
          <Tambour rang="02" mot="Si">
            <OptionWheel
              options={SI}
              label="Le filtre"
              value={si}
              onChange={(v) => {
                setSi(v as Filtre)
              }}
              visible={3}
              curve={22}
              style={{ '--o-wheel-accent': ENCRE } as CSSProperties}
            />
          </Tambour>
          <Tambour rang="03" mot="Alors">
            <OptionWheel
              options={ALORS}
              label="L action"
              value={alors}
              onChange={(v) => {
                setAlors(v as Action)
              }}
              visible={3}
              curve={22}
              style={{ '--o-wheel-accent': ENCRE } as CSSProperties}
            />
          </Tambour>
        </div>

        <p className="o-m-0 o-mt-6 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
          Trois briques, et c est tout. Une quatrieme ferait un langage de programmation,
          et un langage de programmation demande un programmeur.
        </p>

        {/* Les quatre regles les plus montees : elles reglent les trois
            tambours d un coup, pour qui n a pas envie de chercher. */}
        <p className="o-m-0 o-mt-10 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
          Les quatre regles les plus montees
        </p>
        <ul className="o-m-0 o-mt-4 o-list-none o-p-0">
          {MODELES.map((modele, place) => {
            const pose =
              modele.quand === quand && modele.si === si && modele.alors === alors
            return (
              <li key={modele.nom} className="o-border-t" style={{ borderColor: FILET }}>
                <button
                  type="button"
                  aria-pressed={pose}
                  onClick={() => {
                    setQuand(modele.quand)
                    setSi(modele.si)
                    setAlors(modele.alors)
                  }}
                  className="o-flex o-w-full o-cursor-pointer o-items-baseline o-gap-3 o-bg-transparent o-px-0 o-py-3 o-text-left o-transition-opacity hover:o-opacity-70 focus:o-ring"
                  style={{ border: 'none' }}
                >
                  <span
                    aria-hidden="true"
                    className="o-font-mono o-text-xs o-tabular-nums"
                    style={{ color: ENCRE }}
                  >
                    {String(place + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="o-text-sm o-font-semibold"
                    style={pose ? { color: ENCRE } : undefined}
                  >
                    {modele.nom}
                  </span>
                  <span className="o-ml-auto o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                    {modele.combien}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* ----- Le resultat, qui se construit ------------------------------ */}
      <div className="o-min-w-0 lg:o-col-span-7">
        <div
          className="o-overflow-hidden o-rounded-2xl"
          style={{ border: `1px solid ${FILET}` }}
        >
          <p
            aria-live="polite"
            className="o-m-0 o-px-6 o-py-5 o-text-lg o-leading-snug o-font-semibold o-tracking-tight"
            style={{ backgroundColor: VOILE, borderBottom: `1px solid ${FILET}` }}
          >
            {phrase}
          </p>

          <div className="o-grid o-gap-6 o-p-6 md:o-grid-cols-12 md:o-items-center">
            <div className="o-min-w-0 md:o-col-span-5">
              <Anneau
                part={bilan.part}
                dessus="Passent le filtre"
                dessous={`${String(bilan.retenus.length)} des ${String(bilan.declenches.length)} evenements declenches la semaine du 6 avril.`}
              />
            </div>
            <dl className="o-m-0 o-min-w-0 o-grid o-grid-cols-2 o-gap-x-5 o-gap-y-4 md:o-col-span-7">
              {(
                [
                  ['Evenements de la semaine', String(SEMAINE.length)],
                  ['Retenus par la regle', String(bilan.retenus.length)],
                  ['Temps gagne, la semaine', `${String(bilan.minutes)} min`],
                  ['Sur une annee', `${String(bilan.annee).replace('.', ',')} h`],
                ] as const
              ).map(([quoi, valeur], place) => (
                <div key={quoi}>
                  <dt className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    {quoi}
                  </dt>
                  <dd
                    className="o-m-0 o-mt-1 o-text-2xl o-font-semibold o-tabular-nums o-tracking-tight"
                    style={place === 3 ? { color: ENCRE } : undefined}
                  >
                    {valeur}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Le journal : ce que la regle aurait fait, evenement par evenement. */}
          <div style={{ borderTop: `1px solid ${FILET}` }}>
            <p className="o-m-0 o-px-6 o-pt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              Le journal de la semaine du 6 avril
            </p>
            <ol className="o-m-0 o-list-none o-px-6 o-pb-6 o-pt-3 o-p-0">
              {SEMAINE.map((evenement) => {
                const declenche = evenement.espece === quand
                const retenu = declenche && passe(evenement, si)
                return (
                  <li
                    key={evenement.id}
                    className="o-grid o-grid-cols-12 o-items-baseline o-gap-x-3 o-gap-y-1 o-border-t o-py-2.5"
                    style={{ borderColor: FILET, opacity: declenche ? 1 : 0.35 }}
                  >
                    <span className="o-col-span-3 o-font-mono o-text-xs o-tabular-nums o-text-zinc-600 dark:o-text-zinc-400 sm:o-col-span-2">
                      {evenement.jour}
                    </span>
                    <span className="o-col-span-9 o-text-sm sm:o-col-span-6">
                      {evenement.qui}
                    </span>
                    <span className="o-col-span-12 o-font-mono o-text-xs sm:o-col-span-4 sm:o-text-right">
                      <Verdict declenche={declenche} retenu={retenu} />
                    </span>
                    {retenu && (
                      <span
                        className="o-col-span-12 o-mt-1 o-font-mono o-text-xs o-leading-relaxed sm:o-col-start-3 sm:o-col-span-10"
                        style={{ color: ENCRE }}
                      >
                        {ecriture(evenement, alors)}
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/*                   Figure 01 — les reprises, quand ca casse               */
/* ------------------------------------------------------------------------ */

/** Les quatre reprises, et leur attente. */
const REPRISES: readonly {
  readonly rang: string
  readonly apres: string
  readonly x: number
  readonly reussi?: boolean
}[] = [
  { rang: '1re tentative', apres: 'tout de suite', x: 120 },
  { rang: '2e', apres: 'une minute apres', x: 300 },
  { rang: '3e', apres: 'cinq minutes apres', x: 480 },
  { rang: '4e', apres: 'vingt-cinq minutes apres', x: 660 },
  { rang: '5e', apres: 'deux heures apres', x: 840, reussi: true },
]

/**
 * Figure 01 — ce qui arrive quand l autre bout ne repond pas.
 *
 * Une page d outil sans code ne parle jamais de cela, et c est pourtant la
 * seule question qu on se pose apres trois mois d usage. Le dessin repond :
 * cinq tentatives espacees, la piece gardee entiere, et une boite a lettres
 * mortes quand rien ne passe — avec le bouton qui rejoue tout d un coup.
 */
function FigureReprises(): ReactElement {
  const { ref, vu } = useInView<SVGSVGElement>({ amount: 0.3 })
  const gris: CSSProperties = { color: 'var(--o-palette-zinc-400)' }
  return (
    <svg
      ref={ref}
      viewBox="0 0 1000 270"
      aria-hidden="true"
      className="o-w-full"
      style={{ minWidth: 720 }}
    >
      <text
        x="40"
        y="30"
        className="o-font-mono"
        fontSize="10.5"
        fill="currentColor"
        style={gris}
      >
        l action echoue : le service d en face renvoie une erreur passagere
      </text>

      {/* Le rail du temps. */}
      <line
        x1="40"
        y1="120"
        x2="960"
        y2="120"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.45"
        style={gris}
      />

      {REPRISES.map((reprise, rang) => (
        <g
          key={reprise.rang}
          style={{
            opacity: vu ? 1 : 0,
            transform: vu ? 'none' : 'translateY(10px)',
            transition: `opacity 500ms ease ${String(rang * 160)}ms, transform 500ms ease ${String(rang * 160)}ms`,
          }}
        >
          <circle
            cx={reprise.x}
            cy="120"
            r="9"
            fill={reprise.reussi === true ? ENCRE_NUIT : 'var(--o-palette-zinc-900)'}
            stroke={reprise.reussi === true ? ENCRE_NUIT : 'currentColor'}
            strokeWidth="1.6"
          />
          <text
            x={reprise.x}
            y="98"
            textAnchor="middle"
            fontSize="13"
            fill="currentColor"
          >
            {reprise.rang}
          </text>
          <text
            x={reprise.x}
            y="150"
            textAnchor="middle"
            className="o-font-mono"
            fontSize="10.5"
            fill="currentColor"
            style={gris}
          >
            {reprise.apres}
          </text>
          <text
            x={reprise.x}
            y="170"
            textAnchor="middle"
            className="o-font-mono"
            fontSize="10.5"
            fill="currentColor"
            style={{
              color: reprise.reussi === true ? ENCRE_NUIT : 'var(--o-palette-amber-300)',
            }}
          >
            {reprise.reussi === true ? 'passe' : '503'}
          </text>
        </g>
      ))}

      {/* La lettre morte, au bout, quand meme la cinquieme echoue. */}
      <path
        d="M864 120h56"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="4 5"
        opacity="0.6"
        style={gris}
      />
      <rect
        x="700"
        y="206"
        width="260"
        height="44"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.4"
        rx="6"
      />
      <text
        x="716"
        y="226"
        className="o-font-mono"
        fontSize="11"
        fill="currentColor"
        style={gris}
      >
        sinon : boite a lettres mortes
      </text>
      <text
        x="716"
        y="242"
        className="o-font-mono"
        fontSize="10"
        fill="currentColor"
        style={{ color: ENCRE_NUIT }}
      >
        la piece est gardee entiere, et se rejoue d un bouton
      </text>

      <text
        x="40"
        y="226"
        className="o-font-mono"
        fontSize="10.5"
        fill="currentColor"
        style={gris}
      >
        rien n est perdu entre deux tentatives : l evenement d origine reste en file,
      </text>
      <text
        x="40"
        y="242"
        className="o-font-mono"
        fontSize="10.5"
        fill="currentColor"
        style={gris}
      >
        et l action porte une cle qui empeche de l executer deux fois.
      </text>
    </svg>
  )
}

/* ------------------------------------------------------------------------ */
/*                      Le tableau que les regles remplissent               */
/* ------------------------------------------------------------------------ */

/** Une ligne du tableau de suivi. */
const SUIVI: readonly (readonly [string, string, string, string])[] = [
  ['06/04', 'Atelier Kerzu', 'Devis a envoyer', 'Fiche creee'],
  ['07/04', 'Le Comptoir Vannetais', '1 240,00 EUR', 'Fiche creee'],
  ['07/04', 'Fournisseurs', '18 lignes', 'Importe'],
  ['08/04', 'Studio Plagne', '180,00 EUR', 'Sous le seuil'],
  ['09/04', 'Madame Toussaint', 'Rappel demande', 'Fiche creee'],
  ['09/04', 'Brasserie du Blosne', '620,00 EUR', 'Fiche creee'],
  ['10/04', 'Menuiserie Quere', '3 400,00 EUR', 'Fiche creee'],
]

/* ------------------------------------------------------------------------ */
/*                          Ce qu on branche (bento)                        */
/* ------------------------------------------------------------------------ */

/** Une tuile de la mosaique. */
function Tuile({ lignes }: { readonly lignes: readonly string[] }): ReactElement {
  return (
    <ul className="o-m-0 o-mt-3 o-flex o-list-none o-flex-col o-gap-1 o-p-0 o-font-mono o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
      {lignes.map((ligne) => (
        <li key={ligne}>{ligne}</li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------------------ */
/*                     A27 — la liste d attente numerotee                   */
/* ------------------------------------------------------------------------ */

/** Le nombre de maisons deja inscrites. */
const DEJA = 1417

/** Combien de places sont ouvertes chaque semaine. */
const PAR_SEMAINE = 60

/** La liste d attente : le rang qu on obtiendrait, et la semaine d ouverture. */
function Attente(): ReactElement {
  const [adresse, setAdresse] = useState('')
  const valide = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(adresse.trim())
  const rang = DEJA + 1
  const semaines = Math.ceil(rang / PAR_SEMAINE)

  return (
    <div className="o-grid o-gap-10 md:o-grid-cols-12 md:o-items-center">
      <div className="o-min-w-0 md:o-col-span-7">
        <form
          className="o-flex o-flex-wrap o-items-center o-gap-3"
          onSubmit={(evenement) => {
            evenement.preventDefault()
          }}
        >
          <label htmlFor="attente-adresse" className="o-sr-only">
            Votre adresse de courriel professionnelle
          </label>
          <input
            id="attente-adresse"
            name="attente-adresse"
            type="email"
            value={adresse}
            placeholder="vous@votre-maison.fr"
            onChange={(evenement) => {
              setAdresse(evenement.target.value)
            }}
            className="o-min-w-0 o-grow o-rounded-full o-bg-transparent o-px-5 o-py-3 o-text-sm focus:o-ring"
            style={{ border: `1px solid ${FILET}` }}
          />
          <button
            type="submit"
            className="o-inline-flex o-shrink-0 o-cursor-pointer o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-transition-opacity hover:o-opacity-85 focus:o-ring"
            style={{ ...aplat(), border: 'none' }}
          >
            Prendre un rang
            <Icon icon={ArrowRight} size={15} aria-hidden="true" />
          </button>
        </form>
        <p
          aria-live="polite"
          className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400"
        >
          {valide
            ? `Vous seriez le ${String(rang)}e. A soixante ouvertures par semaine, la votre tomberait en semaine ${String(semaines)}.`
            : 'Mille quatre cent dix-sept maisons attendent deja. Nous ouvrons soixante comptes par semaine, et pas un de plus : chacun est accompagne une heure.'}
        </p>
      </div>

      {/* Les rangs, en file : le votre est le premier a s allumer. */}
      <ul
        aria-hidden="true"
        className="o-m-0 o-flex o-min-w-0 o-list-none o-flex-wrap o-gap-1.5 o-p-0 md:o-col-span-5"
      >
        {Array.from({ length: 24 }, (_, place) => {
          const numero = DEJA - 22 + place
          const votre = place === 23
          return (
            <li
              key={numero}
              className="o-rounded-md o-px-2 o-py-1 o-font-mono o-text-xs o-tabular-nums"
              style={
                votre
                  ? { ...aplat(), fontWeight: 700 }
                  : { border: `1px solid ${FILET}`, color: 'var(--o-theme-muted)' }
              }
            >
              {votre ? String(rang) : String(numero)}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/*                          P31 — le pied en damier                         */
/* ------------------------------------------------------------------------ */

/** Les cases du damier : un lien, ou rien. */
const DAMIER: readonly (readonly [string, string] | null)[] = [
  ['#montage', 'Le montage'],
  null,
  ['#branche', 'Connecteurs'],
  null,
  ['#tableau', 'Le tableau'],
  null,
  ['#casse', 'Reprises'],
  null,
  ['#attente', 'Liste d attente'],
  null,
  ['#montage', 'Le journal'],
  null,
  ['#branche', 'Adresse web'],
  null,
  ['#casse', 'Etat du service'],
  null,
  ['#attente', 'Nous ecrire'],
  null,
  ['#branche', 'Documentation'],
  null,
]

/* ------------------------------------------------------------------------ */
/*                                 La page                                  */
/* ------------------------------------------------------------------------ */

/** Un intitule de section. */
function Titre({
  indice,
  id,
  children,
}: {
  readonly indice: string
  readonly id: string
  readonly children: ReactNode
}): ReactElement {
  return (
    <>
      <p
        className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
        style={{ color: ENCRE }}
      >
        {indice}
      </p>
      <h2
        id={id}
        className="o-m-0 o-mt-5 o-text-balance o-text-zinc-950 dark:o-text-zinc-50"
        style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)' }}
      >
        {children}
      </h2>
    </>
  )
}

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('bricolage')

  return (
    <Porte forme="zoom" marque="Assemblee" sombre={false}>
      <div
        className="o-bg-white dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-100"
        style={polices}
      >
        <BarreGelule
          marque="Assemblee"
          liens={LIENS}
          action={['#attente', 'Prendre un rang']}
          sombre={false}
        />

        <main>
          {/* =============== L ouverture : la nappe, et la promesse ======== */}
          <section
            id="sommet"
            aria-label="Ouverture"
            className="o-relative o-isolate o-overflow-hidden o-px-6 o-pb-24 o-pt-36 md:o-px-8 md:o-pb-28 md:o-pt-44"
          >
            <Nappe
              couleurs={[accentDoux(300, 60), accentDoux(500, 34), accentDoux(200, 46)]}
              opacite={0.55}
              className="o-z-0"
            />
            <div
              aria-hidden="true"
              className="o-pointer-events-none o-absolute o-inset-x-0 o-bottom-0 o-z-0 o-h-40"
              style={{
                background: 'linear-gradient(to bottom, transparent, var(--o-theme-bg))',
              }}
            />

            <div className="o-relative o-z-10 o-mx-auto o-max-w-5xl o-text-center">
              <Surgit delai={40} className="o-flex o-justify-center">
                <Etiquette sombre={false}>
                  Assemblee 2 — liste d attente ouverte
                </Etiquette>
              </Surgit>

              <TitreVague
                delai={140}
                cadence={72}
                className="o-mt-8 o-text-zinc-950 dark:o-text-zinc-50"
                style={affiche('l', 300)}
              >
                Trois briques, et la maison tourne toute seule.
              </TitreVague>

              <Surgit
                delai={480}
                as="p"
                className="o-mx-auto o-mt-8 o-max-w-2xl o-text-lg o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400"
              >
                Assemblee monte vos{' '}
                <span style={{ color: ENCRE }}>
                  <RotatingWords
                    words={[
                      'relances',
                      'devis',
                      'rapports du lundi',
                      'fiches client',
                      'exports',
                    ]}
                    interval={2100}
                  />
                </span>{' '}
                <Encadre>sans une ligne de code</Encadre>, et vous montre ce que la regle
                aurait fait la semaine derniere avant que vous l allumiez.
              </Surgit>

              <Surgit delai={620} className="o-mt-10 o-flex o-justify-center">
                <Actions
                  pleine={['#attente', 'Prendre un rang']}
                  fantome={['#montage', 'Voir le montage']}
                  sombre={false}
                />
              </Surgit>
            </div>

            <Coin position="bg" sombre={false}>
              Rennes · 35
              <br />
              Quatorze personnes
            </Coin>
            <Coin position="bd" sombre={false}>
              1 417 maisons en attente
              <br />
              60 comptes ouverts par semaine
            </Coin>
          </section>

          {/* =============== Le ruban de ce qu on branche ================== */}
          <div className="o-border-t o-border-b o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-4 md:o-px-8">
            <ul className="o-m-0 o-mx-auto o-flex o-max-w-7xl o-list-none o-flex-wrap o-items-center o-gap-x-9 o-gap-y-3 o-p-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              <li className="o-inline-flex o-items-center o-gap-2">
                <Icon icon={Plug} size={13} style={{ color: ENCRE }} aria-hidden="true" />
                Ce qu on branche
              </li>
              {[
                'Tableurs',
                'Messagerie',
                'Paiements',
                'Formulaires',
                'Agenda',
                'Facturation',
                'Adresse web',
              ].map((mot) => (
                <li key={mot}>{mot}</li>
              ))}
            </ul>
          </div>

          {/* =============== (01) Le montage =============================== */}
          <section
            id="montage"
            aria-labelledby="montage-titre"
            className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-8 md:o-py-28"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-7">
                  <Titre indice="(01) — Le montage" id="montage-titre">
                    Tournez les trois tambours.
                  </Titre>
                </div>
                <p className="o-m-0 o-max-w-sm o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 md:o-col-span-5">
                  La regle que vous montez est appliquee aux neuf evenements d une vraie
                  semaine, ecrits plus bas. Rien n est simule : le journal est le resultat
                  du calcul.
                </p>
              </div>

              <div className="o-mt-14">
                <Montage />
              </div>
            </div>
          </section>

          {/* =============== M-perspective : le tableau se redresse ========= */}
          <section
            id="tableau"
            aria-labelledby="tableau-titre"
            className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-pb-12 o-pt-20 md:o-px-8"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <ContainerScroll
                label="Le tableau de suivi"
                rotation={24}
                scale={0.88}
                title={
                  <span
                    className="o-text-balance o-text-zinc-950 dark:o-text-zinc-50"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)',
                    }}
                    id="tableau-titre"
                  >
                    Le tableau se remplit sans vous.
                  </span>
                }
                subtitle={
                  <span className="o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                    Une ligne par evenement retenu, dans le tableur que vous aviez deja.
                    Assemblee n en cree pas un nouveau.
                  </span>
                }
              >
                <div
                  className="o-h-full o-overflow-hidden o-rounded-xl"
                  style={{
                    backgroundColor: 'var(--o-theme-bg)',
                    border: `1px solid ${FILET}`,
                  }}
                >
                  <div
                    className="o-flex o-items-center o-gap-2 o-px-4 o-py-3"
                    style={{ borderBottom: `1px solid ${FILET}`, backgroundColor: VOILE }}
                  >
                    <Icon
                      icon={Blocks}
                      size={14}
                      style={{ color: ENCRE }}
                      aria-hidden="true"
                    />
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest">
                      suivi-clients.ods — avril 2026
                    </p>
                  </div>
                  <div className="o-overflow-x-auto" style={{ overflowY: 'hidden' }}>
                    <table
                      className="o-w-full o-text-left o-text-sm"
                      style={{ minWidth: 520 }}
                    >
                      <caption className="o-sr-only">
                        Le tableau de suivi rempli par la regle
                      </caption>
                      <thead>
                        <tr>
                          {['Jour', 'Qui', 'Quoi', 'Ce qu Assemblee a fait'].map(
                            (entete) => (
                              <th
                                key={entete}
                                scope="col"
                                className="o-px-4 o-py-2.5 o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
                                style={{ borderBottom: `1px solid ${FILET}` }}
                              >
                                {entete}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {SUIVI.map((ligne) => (
                          <tr key={`${ligne[0]}-${ligne[1]}`}>
                            <td
                              className="o-px-4 o-py-2.5 o-font-mono o-text-xs o-tabular-nums o-text-zinc-600 dark:o-text-zinc-400"
                              style={{ borderTop: `1px solid ${FILET}` }}
                            >
                              {ligne[0]}
                            </td>
                            <th
                              scope="row"
                              className="o-px-4 o-py-2.5 o-text-sm o-font-normal"
                              style={{ borderTop: `1px solid ${FILET}` }}
                            >
                              {ligne[1]}
                            </th>
                            <td
                              className="o-px-4 o-py-2.5 o-font-mono o-text-xs o-tabular-nums o-text-zinc-600 dark:o-text-zinc-400"
                              style={{ borderTop: `1px solid ${FILET}` }}
                            >
                              {ligne[2]}
                            </td>
                            <td
                              className="o-px-4 o-py-2.5 o-font-mono o-text-xs"
                              style={{
                                borderTop: `1px solid ${FILET}`,
                                color: ligne[3] === 'Sous le seuil' ? undefined : ENCRE,
                              }}
                            >
                              {ligne[3]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </ContainerScroll>
            </div>
          </section>

          {/* =============== La coupe sombre : Figure 01 ====================
              Une bande toujours sombre au milieu de la page claire, et rien
              dedans que la figure des reprises. */}
          <section
            id="casse"
            aria-labelledby="casse-titre"
            className="o-scroll-mt-24 o-relative o-isolate o-overflow-hidden o-px-6 o-py-24 o-text-zinc-50 md:o-px-8 md:o-py-32"
            style={nuit('zinc')}
          >
            <Grain opacite={0.05} />
            <div className="o-relative o-z-20 o-mx-auto o-grid o-max-w-7xl o-gap-10 lg:o-grid-cols-12">
              <div className="lg:o-col-span-3">
                <p
                  className="o-m-0 o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                  style={{ color: ENCRE_NUIT }}
                >
                  <Icon icon={TriangleAlert} size={13} aria-hidden="true" />
                  Figure 01
                </p>
                <h2
                  id="casse-titre"
                  className="o-m-0 o-mt-5 o-text-balance o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)',
                  }}
                >
                  Quand l autre bout ne repond pas.
                </h2>
                <p className="o-mt-5 o-text-sm o-leading-relaxed o-text-zinc-400">
                  C est la question qu on se pose au troisieme mois, jamais au premier
                  jour. Cinq tentatives espacees, puis une boite a lettres mortes ou la
                  piece attend, entiere.
                </p>
                <p className="o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-400">
                  L action porte une cle qui empeche de l executer deux fois : une reprise
                  ne cree pas une seconde fiche pour le meme paiement.
                </p>
              </div>

              <figure className="o-m-0 o-min-w-0 lg:o-col-span-9">
                <div className="o-overflow-x-auto o-pb-2" style={{ overflowY: 'hidden' }}>
                  <FigureReprises />
                </div>
                <ol className="o-sr-only">
                  {REPRISES.map((reprise) => (
                    <li key={reprise.rang}>
                      {reprise.rang}, {reprise.apres} —{' '}
                      {reprise.reussi === true ? 'passe' : 'erreur 503'}.
                    </li>
                  ))}
                  <li>
                    Au-dela, la piece part en boite a lettres mortes et se rejoue d un
                    bouton.
                  </li>
                </ol>
                <figcaption
                  className="o-mt-6 o-border-t o-pt-4 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-400"
                  style={{ borderColor: FILET_NUIT }}
                >
                  Figure 01 — les cinq tentatives d une action qui echoue, et ce qui reste
                  quand toutes echouent.
                </figcaption>
              </figure>
            </div>
          </section>

          {/* =============== (02) Ce qu on branche, en mosaique ============= */}
          <section
            id="branche"
            aria-labelledby="branche-titre"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-7">
                  <Titre indice="(02) — Ce qu on branche" id="branche-titre">
                    Vingt-neuf prises, et une prise pour tout le reste.
                  </Titre>
                </div>
                <p className="o-m-0 o-max-w-sm o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 md:o-col-span-5">
                  Aucune n est facturee a part. Quand une prise manque, la prise generique
                  suffit : elle parle a toute adresse web qui rend du JSON.
                </p>
              </div>

              <div className="o-mt-12">
                <BentoGrid
                  label="Ce qu Assemblee sait brancher"
                  columns={4}
                  rowHeight={190}
                  items={[
                    {
                      id: 'tableurs',
                      title: 'Les tableurs',
                      cols: 2,
                      body: (
                        <Tuile
                          lignes={[
                            'Lire une feuille',
                            'Ajouter une ligne',
                            'Mettre a jour une cellule',
                            'Guetter une nouvelle ligne',
                          ]}
                        />
                      ),
                    },
                    {
                      id: 'paiements',
                      title: 'Les paiements',
                      body: (
                        <Tuile
                          lignes={[
                            'Encaissement',
                            'Remboursement',
                            'Echec de prelevement',
                          ]}
                        />
                      ),
                    },
                    {
                      id: 'generique',
                      title: 'Une adresse web, et rien d autre',
                      featured: true,
                      cols: 2,
                      rows: 2,
                      body: (
                        <div className="o-mt-3">
                          <p className="o-m-0 o-text-sm o-leading-relaxed">
                            La prise generique appelle n importe quelle adresse, avec les
                            en-tetes que vous donnez, et lit la reponse. C est elle qui
                            couvre les outils que nous ne connaissons pas encore — et c
                            est la seule qui merite une demi-heure d apprentissage.
                          </p>
                          <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-opacity-70">
                            POST · GET · en-tetes · JSON
                          </p>
                        </div>
                      ),
                    },
                    {
                      id: 'messagerie',
                      title: 'La messagerie',
                      body: (
                        <Tuile
                          lignes={[
                            'Envoyer un courriel',
                            'Guetter une etiquette',
                            'Repondre dans un fil',
                          ]}
                        />
                      ),
                    },
                    {
                      id: 'formulaires',
                      title: 'Les formulaires',
                      body: (
                        <Tuile
                          lignes={['Reception', 'Champs nommes', 'Pieces jointes']}
                        />
                      ),
                    },
                    {
                      id: 'agenda',
                      title: 'L agenda',
                      body: (
                        <Tuile
                          lignes={['Creer un rendez-vous', 'Guetter un creneau libere']}
                        />
                      ),
                    },
                    {
                      id: 'facturation',
                      title: 'La facturation',
                      cols: 2,
                      body: (
                        <Tuile
                          lignes={[
                            'Emettre une facture',
                            'Relancer un impaye',
                            'Guetter un encaissement',
                            'Exporter le journal',
                          ]}
                        />
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          </section>

          {/* =============== Un ecran, une phrase =========================== */}
          <section
            aria-labelledby="phrase-titre"
            className="o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-32 md:o-px-8 md:o-py-44"
          >
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-10 md:o-grid-cols-12">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 md:o-col-span-3">
                Ce qui nous distingue
              </p>
              <div className="md:o-col-span-9">
                <h2 id="phrase-titre" className="o-sr-only">
                  Ce qui distingue Assemblee
                </h2>
                <p
                  className="o-m-0 o-max-w-4xl o-text-balance"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 3.6vw, 3.75rem)',
                    lineHeight: 1.1,
                  }}
                >
                  <span className="o-text-zinc-500 dark:o-text-zinc-500">
                    Les outils de ce genre vous font construire dans le vide, et decouvrir
                    le resultat le lendemain.
                  </span>{' '}
                  <span className="o-text-zinc-950 dark:o-text-zinc-50">
                    Celui-ci rejoue votre semaine passee avant que vous ayez allume quoi
                    que ce soit.
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* =============== A27 : la liste d attente numerotee ============= */}
          <section
            id="attente"
            aria-labelledby="attente-titre"
            className="o-scroll-mt-24 o-relative o-isolate o-overflow-hidden o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-24 md:o-px-8 md:o-py-32"
          >
            <Nappe
              couleurs={[accentDoux(300, 46), accentDoux(500, 26), accentDoux(200, 34)]}
              opacite={0.4}
              className="o-z-0"
            />
            <div className="o-relative o-z-10 o-mx-auto o-max-w-7xl">
              <h2
                id="attente-titre"
                className="o-m-0 o-max-w-3xl o-text-balance o-text-zinc-950 dark:o-text-zinc-50"
                style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
              >
                Prenez votre rang dans la file.
              </h2>
              <div className="o-mt-12">
                <Attente />
              </div>
            </div>
          </section>
        </main>

        {/* =============== P31 : le pied en damier ========================== */}
        <footer className="o-border-t o-border-black-10 dark:o-border-zinc-800">
          <div className="o-mx-auto o-max-w-7xl o-px-6 o-pt-14 md:o-px-8">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              Assemblee — plan du site
            </p>
          </div>

          <div className="o-mx-auto o-mt-8 o-max-w-7xl o-px-6 md:o-px-8">
            <ul
              className="o-m-0 o-grid o-list-none o-grid-cols-2 o-gap-px o-p-0 sm:o-grid-cols-3 lg:o-grid-cols-5"
              style={{ backgroundColor: FILET }}
            >
              {DAMIER.map((entree, place) => (
                <li
                  key={place}
                  className="o-flex o-items-center o-justify-center"
                  style={{
                    minHeight: 84,
                    backgroundColor: entree === null ? 'var(--o-theme-bg)' : VOILE,
                  }}
                >
                  {entree === null ? (
                    <span
                      aria-hidden="true"
                      className="o-font-mono o-text-xs o-text-zinc-400 dark:o-text-zinc-600"
                    >
                      ·
                    </span>
                  ) : (
                    <a
                      href={entree[0]}
                      className="o-block o-w-full o-px-3 o-py-6 o-text-center o-text-sm o-font-semibold o-no-underline o-transition-colors hover:o-opacity-75 focus:o-ring"
                      style={{ color: ENCRE }}
                    >
                      {entree[1]}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="o-mx-auto o-mt-10 o-max-w-7xl o-px-6 o-pb-10 md:o-px-8">
            <div className="o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-border-black-10 dark:o-border-zinc-800 o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              <span>Assemblee SAS — 9 rue Saint-Melaine, 35000 Rennes</span>
              <span>Donnees hebergees a Gravelines</span>
              <span>© 2026 Assemblee</span>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
