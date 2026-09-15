/**
 * Sangle — maroquinier, Graulhet.
 *
 * ## Ce que la page fait : le patron
 *
 * Un sac n est pas un objet : c est **six morceaux de cuir plats** qu on plie
 * et qu on coud. Le mecanisme de la page est ce passage-la. Le patron est
 * dessine a plat, cote en centimetres, et la section qui le porte est epinglee :
 * en defilant, **les panneaux se redressent** autour de leurs plis jusqu a
 * former le sac. Aucune scene graphique — six plans en perspective CSS,
 * pivotant chacun sur son arete, pilotes par une seule variable de defilement.
 *
 * Tout ce qui est ecrit a cote se calcule sur les memes cotes :
 *
 * - la **surface de cuir** est la somme des aires des panneaux, plus la part de
 *   chutes que le placement impose ;
 * - la **contenance** est le produit des trois cotes, en litres ;
 * - la **longueur de couture** est le perimetre des coutures, et le **nombre de
 *   points** s en deduit par la densite du point sellier ;
 * - les **heures de selle** suivent la cadence reelle d un point a la main ;
 * - la **masse** vient de la surface, de l epaisseur et de la densite du cuir.
 *
 * Changer de taille ou d epaisseur change les dix nombres ensemble, parce
 * qu ils viennent tous des memes six cotes.
 *
 * ## Les chiffres
 *
 * Il n y a pas de barre d indicateurs : les centimetres sont **le mecanisme**,
 * pas une preuve. C est la forme C8, et elle est tenue.
 *
 * ## Le theme
 *
 * La page suit le theme du visiteur. Rien n est ecrit en dur : les fonds
 * passent par les variables de theme et par l accent adouci, qui se melange au
 * fond courant ; les encres ont leur jumelle sombre.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowDown, ArrowUpRight } from '@odoro-cli/icons/outline'
import { useMemo, useState, type ReactElement, type ReactNode } from 'react'

import { RippleClick } from '@/odoro/effect/RippleClick.jsx'
import { FoldText } from '@/odoro/text/FoldText.jsx'
import { Stepper } from '@/odoro/ui/Stepper.jsx'

import {
  Actions,
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
import { accent, accentDoux, aplat, encre } from './palettes.js'
import { Epingle } from './scene.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Un centimetre de cuir, en pixels du dessin. */
const CM = 11

/* ============================ L atelier ================================ */

/** Une taille du sac, donnee par ses trois cotes en centimetres. */
interface Taille {
  readonly cle: string
  readonly nom: string
  /** Largeur du sac, en centimetres. */
  readonly largeur: number
  /** Profondeur — la largeur du soufflet. */
  readonly profondeur: number
  /** Hauteur du corps. */
  readonly hauteur: number
  /** Hauteur du rabat. */
  readonly rabat: number
  /** Longueur de la sangle, bouclerie comprise. */
  readonly sangle: number
  readonly pour: string
}

/** Les trois tailles cousues a l atelier. */
const TAILLES = [
  {
    cle: 'petit',
    nom: 'Le petit',
    largeur: 24,
    profondeur: 7,
    hauteur: 19,
    rabat: 13,
    sangle: 122,
    pour: 'Un carnet, un livre de poche, des cles',
  },
  {
    cle: 'moyen',
    nom: 'Le moyen',
    largeur: 32,
    profondeur: 9,
    hauteur: 26,
    rabat: 17,
    sangle: 138,
    pour: 'Un ordinateur de treize pouces, un dossier',
  },
  {
    cle: 'grand',
    nom: 'Le grand',
    largeur: 38,
    profondeur: 12,
    hauteur: 30,
    rabat: 19,
    sangle: 146,
    pour: 'Deux jours dehors, ou un appareil et ses optiques',
  },
] as const satisfies readonly Taille[]

/** Une epaisseur de croupon, et ce qu elle change. */
interface Cuir {
  readonly cle: string
  readonly nom: string
  /** Epaisseur, en millimetres. */
  readonly epaisseur: number
  /** Prix du decimetre carre, en euros. */
  readonly prix: number
  readonly tannage: string
  readonly note: string
}

/** Les deux cuirs tenus en croupon entier. */
const CUIRS = [
  {
    cle: 'seize',
    nom: 'Croupon 1,6 mm',
    epaisseur: 1.6,
    prix: 8.4,
    tannage: 'Tannage vegetal, mimosa et chataignier, douze semaines en fosse',
    note: 'Souple des le premier jour. Il se marque vite, et c est ce qu on lui demande.',
  },
  {
    cle: 'vingt',
    nom: 'Croupon 2,0 mm',
    epaisseur: 2,
    prix: 9.8,
    tannage: 'Tannage vegetal, meme fosse, coupe dans le dos de la bete',
    note: 'Raide six mois, puis il tombe. C est celui qui tient une sangle sans renfort.',
  },
] as const satisfies readonly Cuir[]

/** Les six panneaux du patron, chacun avec sa fonction. */
const PANNEAUX = [
  ['Fond', 'La seule piece qui ne se plie pas : tout le reste pivote dessus.'],
  ['Devant', 'Il remonte le premier, et il porte la patte de fermeture.'],
  ['Dos', 'Plus haut que le devant : le rabat en sort d une seule piece.'],
  ['Soufflets', 'Deux, symetriques. Ce sont eux qui font la contenance.'],
  ['Rabat', 'Prolonge le dos, sans couture : une charniere de cuir plein.'],
  ['Sangle', 'Une lauriere coupee dans la longueur du croupon, jamais aboutee.'],
] as const

/** Les six etapes du montage. */
const ETAPES = [
  { id: 'coupe', label: 'La coupe', hint: 'Au tranchet, sur marbre' },
  { id: 'parage', label: 'Le parage', hint: 'Les bords ramenes a 0,9 mm' },
  { id: 'teinte', label: 'La teinte', hint: 'Au tampon, trois passes' },
  { id: 'griffe', label: 'La griffe', hint: 'Six points au centimetre' },
  { id: 'selle', label: 'Le point sellier', hint: 'Deux aiguilles, un fil' },
  { id: 'lisse', label: 'Le lissage', hint: 'Gomme arabique et os' },
] as const

/** Ce que chaque etape demande, et ce qu on y voit. */
const DETAIL_ETAPES = [
  'Le croupon est pose a plat, cote fleur en dessus. Les six pieces sont placees a la main : on evite les plis du flanc, on garde le dos pour la sangle, et on accepte de perdre du cuir plutot que de couper dans une zone molle.',
  'Chaque bord qui sera cousu descend a neuf dixiemes de millimetre, a l abat-carre. Sans ce parage, la couture fait une bosse et le sac ne ferme pas droit.',
  'Teinte a l alcool, au tampon de laine, trois passes croisees. Le cuir vegetal boit de facon inegale : c est la troisieme passe qui egalise, jamais la premiere.',
  'La griffe a six dents marque les trous a six au centimetre. On griffe des deux cotes en partant du meme point, sinon les deux faces ne se rejoignent pas.',
  'Deux aiguilles sur un seul fil de lin cable, poissees. Chaque point croise dans son trou : si le fil casse quelque part, le reste ne se defait pas.',
  'Les tranches sont poncees, humidifiees, chargees de gomme arabique, puis lissees a l os jusqu au brillant. C est la seule etape qui ne sert qu a l oeil.',
] as const

/** Les liens des coins. */
const NAVIGATION = [
  ['#patron', 'Le patron'],
  ['#montage', 'Le montage'],
  ['#carte', 'La carte'],
] as const

/** Le nombre de cases de la carte de fidelite. */
const CASES = 8

/* ============================ Le calcul ================================ */

/** Ce que les six cotes donnent, et que rien n ecrit a la main. */
interface Devis {
  /** Surface des panneaux, en decimetres carres. */
  readonly surface: number
  /** Surface achetee, chutes comprises. */
  readonly achetee: number
  /** Contenance, en litres. */
  readonly contenance: number
  /** Longueur totale de couture, en centimetres. */
  readonly couture: number
  /** Nombre de points sellier. */
  readonly points: number
  /** Heures de selle, a la cadence de l atelier. */
  readonly heures: number
  /** Masse du sac vide, en grammes. */
  readonly masse: number
  /** Prix du cuir seul, en euros. */
  readonly cuir: number
}

/** La part de chutes qu un placement honnete laisse sur le croupon. */
const CHUTES = 0.24

/** Points sellier au centimetre, a la griffe a six dents. */
const POINTS_PAR_CM = 6

/** Points cousus en une heure, a la main, les deux aiguilles. */
const POINTS_PAR_HEURE = 190

/** Masse volumique du cuir a tannage vegetal, en grammes par centimetre cube. */
const DENSITE = 0.86

/** Le devis complet, deduit des cotes et du cuir. */
function devisDe(t: Taille, cuir: Cuir): Devis {
  // Les six panneaux, en centimetres carres. Le dos porte le rabat d une seule
  // piece : sa hauteur est celle du corps plus celle du rabat.
  const aires = [
    t.largeur * t.profondeur,
    t.largeur * t.hauteur,
    t.largeur * (t.hauteur + t.rabat),
    t.profondeur * t.hauteur,
    t.profondeur * t.hauteur,
    4 * t.sangle,
  ]
  const surfaceCm = aires.reduce((somme, aire) => somme + aire, 0)
  const surface = surfaceCm / 100
  const achetee = surface * (1 + CHUTES)

  // Les coutures : les quatre aretes verticales des soufflets, et leurs quatre
  // aretes sur le fond. Plus les deux points d attache de la sangle.
  const couture = 4 * t.hauteur + 2 * t.largeur + 2 * t.profondeur + 2 * 8
  const points = Math.round(couture * POINTS_PAR_CM)

  return {
    surface,
    achetee,
    contenance: (t.largeur * t.profondeur * t.hauteur) / 1000,
    couture,
    points,
    heures: points / POINTS_PAR_HEURE,
    masse: Math.round(surfaceCm * (cuir.epaisseur / 10) * DENSITE),
    cuir: achetee * cuir.prix,
  }
}

/** Un nombre a la francaise. */
function nombre(valeur: number, decimales = 0): string {
  return valeur.toLocaleString('fr-FR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}

/** Un montant en euros. */
function euros(valeur: number): string {
  return `${nombre(Math.round(valeur))} EUR`
}

/* ============================ Le patron plie =========================== */

/**
 * Un panneau du patron.
 *
 * Il est pose a plat dans la scene, et pivote sur son arete quand la traversee
 * avance. `--p` est ecrite par la section epinglee : les six panneaux ne
 * coutent donc qu un seul abonnement au defilement, et le compositeur fait le
 * reste.
 */
function Panneau({
  nom,
  largeur,
  hauteur,
  gauche,
  haut,
  origine,
  pivot,
  teinte,
  children,
}: {
  readonly nom: string
  /** Largeur du panneau, en centimetres. */
  readonly largeur: number
  readonly hauteur: number
  /** Position du coin haut-gauche dans la scene, en centimetres. */
  readonly gauche: number
  readonly haut: number
  /** L arete sur laquelle le panneau pivote. */
  readonly origine: string
  /** La rotation atteinte au bout de la traversee. */
  readonly pivot: string
  /** Part de l accent dans la couleur du panneau. */
  readonly teinte: number
  readonly children?: ReactNode
}): ReactElement {
  return (
    <div
      aria-hidden="true"
      className="o-absolute"
      style={{
        left: gauche * CM,
        top: haut * CM,
        width: largeur * CM,
        height: hauteur * CM,
        transformOrigin: origine,
        transform: pivot,
        transformStyle: 'preserve-3d',
        backgroundColor: accentDoux(500, teinte),
        boxShadow: `inset 0 0 0 1px ${accentDoux(800, 55)}`,
      }}
    >
      {/* La griffe : la ligne des points, marquee en retrait du bord, comme le
          tranchet la trace avant de coudre. */}
      <span
        aria-hidden="true"
        className="o-absolute"
        style={{ inset: 6, border: `1px dashed ${accentDoux(800, 62)}` }}
      />
      <span
        className="o-absolute o-left-3 o-top-2 o-font-mono o-text-xs o-uppercase o-tracking-wider"
        style={{ color: encre() }}
      >
        {nom}
      </span>
      <span className="o-absolute o-bottom-2 o-right-3 o-font-mono o-text-xs o-tabular-nums o-text-zinc-600 dark:o-text-zinc-300">
        {`${nombre(largeur)} x ${nombre(hauteur)}`}
      </span>
      {children}
    </div>
  )
}

/**
 * Le patron, a plat puis plie.
 *
 * Le developpement est celui d une boite : le fond au centre, le dos et le
 * devant au-dessus et en dessous, les deux soufflets a droite et a gauche.
 * Chaque panneau pivote sur l arete qu il partage avec le fond, et le fond ne
 * bouge pas — c est exactement ce qui se passe sur l etabli.
 *
 * La scene entiere passe d une vue de dessus, ou le patron se lit comme sur la
 * table de coupe, a une vue de trois quarts. Les deux mouvements sont sur la
 * meme variable : ils ne peuvent pas se desynchroniser.
 */
function Patron({ taille }: { readonly taille: Taille }): ReactElement {
  const { largeur: L, profondeur: P, hauteur: H, rabat: R, sangle: S } = taille

  // Le developpement en croix : deux hauteurs de soufflet de part et d autre
  // du fond, le dos et le devant au-dessus et en dessous.
  const largeurScene = H + L + H
  const hauteurScene = H + R + P + H + 10

  return (
    <div
      className="o-relative"
      style={{
        width: largeurScene * CM,
        height: hauteurScene * CM,
        transformStyle: 'preserve-3d',
        transform:
          'rotateX(calc(56deg - var(--p, 0) * 38deg)) rotateZ(calc(var(--p, 0) * -12deg))',
      }}
    >
      {/* Le dos, et le rabat qui le prolonge sans couture. Il se releve vers
          l arriere du sac. */}
      <Panneau
        nom="Dos"
        largeur={L}
        hauteur={H + R}
        gauche={H}
        haut={0}
        origine="bottom center"
        pivot="rotateX(calc(var(--p, 0) * -90deg))"
        teinte={26}
      >
        <span
          aria-hidden="true"
          className="o-absolute o-inset-x-0"
          style={{ top: R * CM, borderTop: `1px dashed ${accentDoux(800, 70)}` }}
        />
      </Panneau>

      {/* Le fond : la seule piece qui ne bouge pas. */}
      <Panneau
        nom="Fond"
        largeur={L}
        hauteur={P}
        gauche={H}
        haut={H + R}
        origine="center"
        pivot="none"
        teinte={34}
      />

      {/* Le devant, qui remonte vers l avant. */}
      <Panneau
        nom="Devant"
        largeur={L}
        hauteur={H}
        gauche={H}
        haut={H + R + P}
        origine="top center"
        pivot="rotateX(calc(var(--p, 0) * 90deg))"
        teinte={26}
      />

      {/* Les deux soufflets, couches de part et d autre du fond : ils pivotent
          sur l arete qu ils partagent avec lui. */}
      <Panneau
        nom="Soufflet"
        largeur={H}
        hauteur={P}
        gauche={0}
        haut={H + R}
        origine="right center"
        pivot="rotateY(calc(var(--p, 0) * 90deg))"
        teinte={20}
      />
      <Panneau
        nom="Soufflet"
        largeur={H}
        hauteur={P}
        gauche={H + L}
        haut={H + R}
        origine="left center"
        pivot="rotateY(calc(var(--p, 0) * -90deg))"
        teinte={20}
      />

      {/* La lauriere : coupee dans la longueur du croupon, elle reste sur la
          table pendant que le sac se monte. Elle se pose en dernier, et la
          page ne pretend pas la coudre a votre place. */}
      <div
        aria-hidden="true"
        className="o-absolute"
        style={{
          left: 0,
          top: (H + R + P + H + 4) * CM,
          width: largeurScene * CM,
          height: 4 * CM,
          backgroundColor: accentDoux(500, 18),
          boxShadow: `inset 0 0 0 1px ${accentDoux(800, 55)}`,
          opacity: 'calc(1 - var(--p, 0) * 1.6)',
        }}
      >
        <span
          className="o-absolute o-left-3 o-top-1 o-font-mono o-text-xs o-uppercase o-tracking-wider"
          style={{ color: encre() }}
        >
          Sangle
        </span>
        <span className="o-absolute o-bottom-1 o-right-3 o-font-mono o-text-xs o-tabular-nums o-text-zinc-600 dark:o-text-zinc-300">
          {`${nombre(S)} x 4`}
        </span>
      </div>
    </div>
  )
}

/* ============================ La carte a poinconner ==================== */

/**
 * La carte de l atelier : huit cases, un poincon par entretien.
 *
 * Le poincon n est pas un dessin fixe : chaque case percee garde sa marque, et
 * la huitieme retourne la carte. C est le seul appel de la page.
 */
function CarteAPoinconner(): ReactElement {
  const [perces, setPerces] = useState<readonly number[]>([0, 1, 2])
  const pleine = perces.length >= CASES

  const poinconner = (rang: number): void => {
    setPerces((liste) =>
      liste.includes(rang) ? liste.filter((n) => n !== rang) : [...liste, rang],
    )
  }

  return (
    <div
      className="o-relative o-w-full o-max-w-xl o-overflow-hidden o-p-6 md:o-p-8"
      style={{
        backgroundColor: accentDoux(400, 16),
        boxShadow: `inset 0 0 0 1px ${accentDoux(700, 46)}`,
        borderRadius: 6,
      }}
    >
      <div className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-3">
        <p
          className="o-m-0"
          style={{
            ...affiche('m', 800),
            fontSize: 'clamp(1.25rem, 2.6vw, 1.875rem)',
            lineHeight: 1,
          }}
        >
          Carte d entretien
        </p>
        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-300">
          Sangle — Graulhet
        </p>
      </div>

      <p className="o-m-0 o-mt-3 o-max-w-sm o-text-sm o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300">
        Un poincon par nourrissage a l atelier. A la huitieme case, la reparation est
        offerte — couture, bouclerie, tranches refaites.
      </p>

      <ul className="o-m-0 o-mt-6 o-grid o-list-none o-grid-cols-4 o-gap-3 o-p-0 sm:o-grid-cols-8">
        {Array.from({ length: CASES }, (_, rang) => {
          const perce = perces.includes(rang)
          return (
            <li key={rang}>
              <RippleClick color={accent(700)} opacity={0.3} className="o-block">
                <button
                  type="button"
                  aria-pressed={perce}
                  onClick={() => {
                    poinconner(rang)
                  }}
                  className="o-flex o-aspect-square o-w-full o-cursor-pointer o-items-center o-justify-center o-font-mono o-text-sm o-tabular-nums o-transition-colors focus:o-ring"
                  style={{
                    borderRadius: 999,
                    boxShadow: `inset 0 0 0 1px ${accentDoux(700, 55)}`,
                    backgroundColor: perce ? accentDoux(700, 78) : 'transparent',
                    color: perce ? 'var(--o-theme-bg)' : 'var(--o-theme-muted)',
                  }}
                >
                  <span className="o-sr-only">
                    {perce ? 'Case poinconnee ' : 'Case libre '}
                  </span>
                  {perce ? '✕' : String(rang + 1)}
                </button>
              </RippleClick>
            </li>
          )
        })}
      </ul>

      <p
        aria-live="polite"
        className="o-m-0 o-mt-6 o-text-sm o-font-semibold"
        style={{ color: encre() }}
      >
        {pleine
          ? 'Carte pleine. Rapportez-la : la prochaine reparation ne vous coute rien.'
          : `${String(CASES - perces.length)} entretiens avant la reparation offerte.`}
      </p>
    </div>
  )
}

/* ============================ Les petites pieces ======================= */

/** Un choix : une gelule bordee, pleine quand elle est prise. */
function Choix({
  actif,
  onClick,
  children,
}: {
  readonly actif: boolean
  readonly onClick: () => void
  readonly children: ReactNode
}): ReactElement {
  return (
    <button
      type="button"
      aria-pressed={actif}
      onClick={onClick}
      className="o-rounded-full o-border-w-1 o-px-4 o-py-1.5 o-text-sm o-transition-colors focus:o-ring"
      style={
        actif
          ? { ...aplat(), borderColor: 'transparent' }
          : { borderColor: 'var(--o-theme-line)', color: 'var(--o-theme-muted)' }
      }
    >
      {children}
    </button>
  )
}

/** Une valeur du devis, posee sur un filet. */
function Ligne({
  quoi,
  valeur,
  note,
}: {
  readonly quoi: string
  readonly valeur: string
  readonly note?: string
}): ReactElement {
  return (
    <div className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-py-3.5">
      <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
        {quoi}
      </dt>
      <dd
        className="o-m-0 o-mt-1 o-tabular-nums"
        style={{
          ...affiche('m', 800),
          fontSize: 'clamp(1.125rem, 2vw, 1.625rem)',
          lineHeight: 1.05,
        }}
      >
        {valeur}
      </dd>
      {note !== undefined && (
        <p className="o-m-0 o-mt-1 o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
          {note}
        </p>
      )}
    </div>
  )
}

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('bricolage')
  const { reduced } = useMotionState()

  const [cleTaille, setCleTaille] = useState<string>(TAILLES[1].cle)
  const [cleCuir, setCleCuir] = useState<string>(CUIRS[1].cle)
  const [etape, setEtape] = useState(0)

  const taille: Taille = TAILLES.find((t) => t.cle === cleTaille) ?? TAILLES[1]
  const cuir: Cuir = CUIRS.find((c) => c.cle === cleCuir) ?? CUIRS[1]
  const devis = useMemo(() => devisDe(taille, cuir), [taille, cuir])

  return (
    <Porte forme="lettres" marque="Sangle" sombre={false}>
      <div
        className="o-relative o-bg-white dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50"
        style={polices}
      >
        {/* Le papier : une trame de coupe, tres pale, comme le papier kraft
            quadrille sur lequel un patron se trace. */}
        <div
          aria-hidden="true"
          className="o-pointer-events-none o-fixed o-inset-0 o-z-0"
          style={{
            backgroundImage: [
              `linear-gradient(to right, ${accentDoux(400, 9)} 1px, transparent 1px)`,
              `linear-gradient(to bottom, ${accentDoux(400, 9)} 1px, transparent 1px)`,
            ].join(', '),
            backgroundSize: '52px 52px',
          }}
        />

        <div className="o-relative o-z-10">
          <BarreCoins
            marque="Sangle"
            liens={NAVIGATION}
            droite="Graulhet, Tarn"
            sombre={false}
          />

          <main>
            {/*
              ----- L ouverture : le nom, et la premiere phrase --------------
            */}
            <section
              id="haut"
              className="o-relative o-flex o-flex-col o-justify-end o-px-6 o-pb-16 o-pt-10 md:o-px-12"
              style={{ minHeight: `calc(${ECRAN} * 0.82)` }}
            >
              <Surgit>
                <Etiquette sombre={false}>
                  Graulhet — croupons entiers, coupe a la main
                </Etiquette>
              </Surgit>

              <TitreVague
                delai={140}
                className="o-m-0 o-mt-7 o-max-w-4xl"
                style={{
                  ...affiche('l', 800),
                  fontSize: 'clamp(2.25rem, 7.2vw, 7.5rem)',
                  lineHeight: 0.92,
                }}
              >
                Six morceaux plats, et deux aiguilles.
              </TitreVague>

              <div className="o-mt-10 o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <Surgit
                  delai={560}
                  as="p"
                  className="o-m-0 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300 md:o-col-span-6"
                >
                  Un sac ne se dessine pas en volume : il se dessine a plat, et le volume
                  arrive quand on plie. Le patron est ici, cote au centimetre, et il se
                  monte au defilement.
                </Surgit>
                <Surgit
                  delai={700}
                  className="md:o-col-span-6 md:o-flex md:o-justify-end"
                >
                  <Actions
                    sombre={false}
                    pleine={[
                      '#patron',
                      <>
                        Plier le patron{' '}
                        <Icon icon={ArrowDown} size={16} aria-hidden="true" />
                      </>,
                    ]}
                    fantome={['#montage', 'Les six etapes']}
                  />
                </Surgit>
              </div>

              {/* Le mot plie : il se deplie a l entree dans le champ, et c est
                  le meme geste que celui de la page. */}
              <Surgit delai={860} className="o-mt-16">
                <FoldText
                  as="p"
                  step={52}
                  duration={720}
                  className="o-m-0"
                  style={{
                    ...affiche('xl', 300),
                    fontSize: 'clamp(2.5rem, 12vw, 11rem)',
                    lineHeight: 0.86,
                    color: accentDoux(600, 62),
                  }}
                >
                  Sangle
                </FoldText>
              </Surgit>
            </section>

            {/*
              ----- Le mecanisme : le patron qui se plie --------------------
            */}
            <div
              id="patron"
              className="o-scroll-mt-24 o-border-t o-border-zinc-200 dark:o-border-zinc-800"
            >
              <Epingle ecrans={3}>
                <div className="o-flex o-h-full o-flex-col o-overflow-hidden o-px-6 o-py-8 md:o-px-12">
                  <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
                    <div>
                      <Indice rang="01" sombre={false}>
                        Le patron
                      </Indice>
                      <h2
                        className="o-m-0 o-mt-4 o-max-w-lg"
                        style={{
                          ...affiche('m', 800),
                          fontSize: 'clamp(1.5rem, 3.2vw, 2.5rem)',
                          lineHeight: 1,
                        }}
                      >
                        {taille.nom} — {nombre(taille.largeur)} x{' '}
                        {nombre(taille.profondeur)} x {nombre(taille.hauteur)} cm.
                      </h2>
                    </div>
                    <div className="o-flex o-flex-wrap o-gap-2">
                      {TAILLES.map((t) => (
                        <Choix
                          key={t.cle}
                          actif={t.cle === cleTaille}
                          onClick={() => {
                            setCleTaille(t.cle)
                          }}
                        >
                          {t.nom}
                        </Choix>
                      ))}
                    </div>
                  </div>

                  <div className="o-grid o-min-h-0 o-grow o-gap-8 lg:o-grid-cols-12">
                    {/* La scene : une perspective, et six plans dedans. */}
                    <div
                      className="o-flex o-min-h-0 o-items-center o-justify-center o-overflow-hidden lg:o-col-span-8"
                      style={{ perspective: 1500, perspectiveOrigin: '50% 40%' }}
                    >
                      <div style={{ transform: 'scale(0.78)' }}>
                        <Patron taille={taille} />
                      </div>
                    </div>

                    <div className="o-hidden o-flex-col o-justify-center lg:o-col-span-4 lg:o-flex">
                      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                        {reduced
                          ? 'Patron monte — mouvement reduit'
                          : 'Defilez : les panneaux se redressent'}
                      </p>
                      <dl className="o-m-0 o-mt-4">
                        <Ligne
                          quoi="Contenance"
                          valeur={`${nombre(devis.contenance, 1)} litres`}
                        />
                        <Ligne
                          quoi="Cuir achete"
                          valeur={`${nombre(devis.achetee, 1)} dm²`}
                          note={`Dont ${nombre(CHUTES * 100)} % de chutes, placement compris.`}
                        />
                        <Ligne
                          quoi="Couture"
                          valeur={`${nombre(devis.couture)} cm`}
                          note={`${nombre(devis.points)} points a six au centimetre.`}
                        />
                      </dl>
                    </div>
                  </div>
                </div>
              </Epingle>
            </div>

            {/*
              ----- Les six panneaux, et le devis --------------------------
            */}
            <section className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-16 md:o-px-12 md:o-py-24">
              <div className="o-grid o-gap-10 lg:o-grid-cols-12 lg:o-gap-14">
                <div className="lg:o-col-span-7">
                  <h2
                    className="o-m-0 o-max-w-xl"
                    style={{
                      ...affiche('m', 800),
                      fontSize: 'clamp(1.625rem, 3.4vw, 2.75rem)',
                      lineHeight: 1,
                    }}
                  >
                    Ce qu il y a sur la table de coupe.
                  </h2>
                  <ol className="o-m-0 o-mt-10 o-list-none o-p-0">
                    {PANNEAUX.map(([quoi, texte], rang) => (
                      <li
                        key={quoi}
                        className="o-grid o-gap-x-6 o-gap-y-1 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-py-5 sm:o-grid-cols-12"
                      >
                        <span className="o-flex o-items-baseline o-gap-4 sm:o-col-span-4">
                          <span
                            className="o-font-mono o-text-xs o-tabular-nums"
                            style={{ color: encre() }}
                          >
                            {String(rang + 1).padStart(2, '0')}
                          </span>
                          <span
                            style={{
                              ...affiche('m', 800),
                              fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
                              lineHeight: 1,
                            }}
                          >
                            {quoi}
                          </span>
                        </span>
                        <span className="o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300 sm:o-col-span-8">
                          {texte}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="lg:o-col-span-5">
                  <div
                    className="o-p-6 md:o-p-8"
                    style={{ backgroundColor: accentDoux(400, 12), borderRadius: 6 }}
                  >
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-300">
                      Le devis, pour {taille.nom.toLowerCase()}
                    </p>
                    <div className="o-mt-4 o-flex o-flex-wrap o-gap-2">
                      {CUIRS.map((c) => (
                        <Choix
                          key={c.cle}
                          actif={c.cle === cleCuir}
                          onClick={() => {
                            setCleCuir(c.cle)
                          }}
                        >
                          {c.nom}
                        </Choix>
                      ))}
                    </div>
                    <p className="o-m-0 o-mt-3 o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
                      {cuir.note}
                    </p>

                    <dl className="o-m-0 o-mt-6">
                      <Ligne
                        quoi="Surface des panneaux"
                        valeur={`${nombre(devis.surface, 1)} dm²`}
                      />
                      <Ligne
                        quoi="Masse du sac vide"
                        valeur={`${nombre(devis.masse)} g`}
                        note={`${nombre(cuir.epaisseur, 1)} mm d epaisseur, ${nombre(DENSITE, 2)} g par centimetre cube.`}
                      />
                      <Ligne
                        quoi="Heures de selle"
                        valeur={`${nombre(devis.heures, 1)} h`}
                        note={`${nombre(POINTS_PAR_HEURE)} points a l heure, les deux aiguilles.`}
                      />
                      <Ligne
                        quoi="Cuir seul"
                        valeur={euros(devis.cuir)}
                        note={`${nombre(cuir.prix, 2)} EUR le decimetre carre, ${cuir.tannage.toLowerCase()}.`}
                      />
                    </dl>
                    <p className="o-m-0 o-mt-6 o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
                      Le prix de vente ajoute la bouclerie, le fil, la teinte et les
                      heures. Il est ecrit sur le devis nominatif, ligne par ligne, et
                      jamais arrondi.
                    </p>
                  </div>
                  <p className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
                    {taille.pour}.
                  </p>
                </div>
              </div>
            </section>

            {/*
              ----- Le montage, en six etapes -------------------------------
            */}
            <section
              id="montage"
              className="o-scroll-mt-24 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-16 md:o-px-12 md:o-py-24"
              style={{ backgroundColor: accentDoux(400, 7) }}
            >
              <Indice rang="02" sombre={false}>
                Le montage
              </Indice>
              <h2
                className="o-m-0 o-mt-4 o-max-w-2xl"
                style={{
                  ...affiche('m', 800),
                  fontSize: 'clamp(1.625rem, 3.4vw, 2.75rem)',
                  lineHeight: 1,
                }}
              >
                Six etapes, et une seule qui ne sert qu a l oeil.
              </h2>

              <div className="o-mt-12">
                <Stepper
                  label="Les etapes du montage"
                  steps={[...ETAPES]}
                  value={etape}
                  onChange={setEtape}
                  reach="all"
                >
                  <div className="o-grid o-gap-8 o-pt-8 md:o-grid-cols-12">
                    <p
                      className="o-m-0 o-text-base o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-200 md:o-col-span-7"
                      style={{ fontSize: 'clamp(1rem, 1.6vw, 1.25rem)' }}
                    >
                      {DETAIL_ETAPES[etape] ?? DETAIL_ETAPES[0]}
                    </p>
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 md:o-col-span-5 md:o-text-right">
                      Etape {String(etape + 1)} sur {String(ETAPES.length)}
                      <br />
                      {ETAPES[etape]?.hint ?? ''}
                    </p>
                  </div>
                </Stepper>
              </div>
            </section>

            {/*
              ----- La carte a poinconner ----------------------------------
            */}
            <section
              id="carte"
              className="o-flex o-scroll-mt-24 o-flex-col o-justify-center o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-20 md:o-px-12"
              style={{ minHeight: `calc(${ECRAN} * 0.9)` }}
            >
              <div className="o-grid o-gap-12 lg:o-grid-cols-12 lg:o-items-center">
                <div className="lg:o-col-span-5">
                  <Indice rang="03" sombre={false}>
                    La carte
                  </Indice>
                  <h2
                    className="o-m-0 o-mt-4 o-max-w-md"
                    style={{
                      ...affiche('m', 800),
                      fontSize: 'clamp(1.625rem, 3.4vw, 2.75rem)',
                      lineHeight: 1,
                    }}
                  >
                    Un sac nourri deux fois par an tient trente ans.
                  </h2>
                  <p className="o-m-0 o-mt-5 o-max-w-sm o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
                    Nous ne vendons pas d entretien : nous le faisons. Passez le samedi,
                    laissez le sac deux heures, repartez avec un poincon de plus sur la
                    carte.
                  </p>
                  <div className="o-mt-8">
                    <a
                      href="mailto:atelier@sangle-graulhet.fr"
                      className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-7 o-py-3.5 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                      style={aplat()}
                    >
                      Demander une carte
                      <Icon icon={ArrowUpRight} size={17} aria-hidden="true" />
                    </a>
                  </div>
                </div>
                <div className="lg:o-col-span-7">
                  <CarteAPoinconner />
                </div>
              </div>
            </section>
          </main>

          {/*
            ----- Le pied : dans la marge, aligne a droite ------------------

            Trois quarts de la largeur restent vides. Ce n est pas une
            economie : c est la marge d une page d atelier, ou tout ce qui
            n est pas le patron se range a droite.
          */}
          <footer className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-pb-10 o-pt-14 md:o-px-12">
            <div className="o-grid md:o-grid-cols-12">
              <div className="md:o-col-start-7 md:o-col-span-6 o-text-right">
                <p
                  className="o-m-0"
                  style={{
                    ...affiche('m', 800),
                    fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                    lineHeight: 1,
                  }}
                >
                  Sangle
                </p>
                <p className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
                  11 rue de la Megisserie
                  <br />
                  81300 Graulhet
                  <br />
                  Atelier ouvert le samedi, 10 h a 13 h
                </p>
                <ul className="o-m-0 o-mt-6 o-flex o-list-none o-flex-col o-gap-1.5 o-p-0">
                  {NAVIGATION.map(([cible, mot]) => (
                    <li key={cible}>
                      <a
                        href={cible}
                        className="o-text-sm o-text-zinc-600 dark:o-text-zinc-300 o-no-underline hover:o-text-zinc-950 dark:hover:o-text-zinc-50 focus:o-ring"
                      >
                        {mot}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="o-m-0 o-mt-8 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  © 2026 Sangle — cotes en centimetres
                </p>
                <a
                  href="#haut"
                  className="o-mt-3 o-inline-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 o-no-underline hover:o-text-zinc-950 dark:hover:o-text-zinc-50 focus:o-ring"
                >
                  Remonter ↑
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </Porte>
  )
}
