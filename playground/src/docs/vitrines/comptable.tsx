/**
 * Grand Livre — cabinet d expertise comptable.
 *
 * ## Le parti pris — un bilan qu on remplit, et qui repond
 *
 * Un expert-comptable vend une lecture. La page ne la raconte pas : elle la
 * fait. Un bilan simplifie de huit postes se remplit dans la page, et les six
 * ratios s allument au fil de la frappe — fonds de roulement, besoin en fonds
 * de roulement, tresorerie nette, autonomie financiere, liquidite generale,
 * couverture des immobilisations. Chacun porte son seuil, son calcul en clair
 * et sa phrase de lecture.
 *
 * Le mecanisme tient parce qu il repose sur une identite vraie : la tresorerie
 * nette calculee — fonds de roulement moins besoin en fonds de roulement —
 * **doit** valoir le poste de tresorerie saisi. Quand les deux different,
 * l ecart est exactement le desequilibre du bilan, et la page le dit avec le
 * montant. C est ce qu un tableur ne montre jamais du premier coup.
 *
 * ## Le fond, le mouvement, les coupes
 *
 * F-statique : du papier de grand livre, dessine en gradients — la reglure,
 * la marge et le double filet de la colonne des montants. La signature est
 * M-empile : les trois missions s empilent et se reduisent. Une bande sombre
 * coupe la page claire, et elle porte la seule figure de la page : douze mois
 * de tresorerie dessines au trait, sans cadre, qui poussent a l entree dans le
 * champ.
 *
 * ## Les formes
 *
 * A26 — un devis en trois curseurs, le total en 120 px.
 * P18 — un ours en trois colonnes de chasse fixe, regle comme un grand livre.
 * C14 — un graphique en barres dessine au trait, sans cadre.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight, BookOpenText, Check, TriangleAlert } from '@odoro-cli/icons/outline'
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { StickyStack } from '@/odoro/section/StickyStack.jsx'
import { SpotlightText } from '@/odoro/text/SpotlightText.jsx'
import { ButtonGroupInput } from '@/odoro/ui/ButtonGroupInput.jsx'

import { nuit } from './communs.jsx'
import { accentDoux, encre, encreSurSombre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreFilet,
  Etiquette,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Flotte } from './scene.jsx'

/* ========================= Les constantes de dessin ===================== */

/** Le filet de la page, tire de l encre courante. */
const FILET = 'color-mix(in oklab, currentColor 15%, transparent)'

/** Le filet appuye : celui qui ferme une colonne de montants. */
const FILET_FORT = 'color-mix(in oklab, currentColor 38%, transparent)'

/** La voix mono des intitules et des notes. */
const NOTE =
  'o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400'

/** La meme voix, sur la bande toujours sombre. */
const NOTE_SUR_NUIT =
  'o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400'

/**
 * Une encre semantique, tiree vers l encre du theme.
 *
 * Le vert d un ratio tenu et le rouge d un ratio hors norme sont imposes par
 * le sens, pas par la palette de la vitrine. Les melanger a l encre du theme
 * leur garde un contraste tenable dans les deux themes, ce qu une nuance fixe
 * ne donne jamais.
 */
function semantique(jeton: string): string {
  return `color-mix(in oklab, var(${jeton}) 45%, var(--o-theme-fg))`
}

/**
 * Le papier du grand livre, dessine en gradients.
 *
 * Trois traits : la reglure horizontale, la marge de gauche, et le double
 * filet qui isole la colonne des montants a droite. Aucun octet telecharge, et
 * la reglure suit l encre courante — donc le theme — sans seconde valeur.
 */
const PAPIER: CSSProperties = {
  backgroundImage: [
    'repeating-linear-gradient(to bottom, transparent 0 27px, color-mix(in oklab, currentColor 8%, transparent) 27px 28px)',
    'linear-gradient(to right, transparent 0 70px, color-mix(in oklab, currentColor 16%, transparent) 70px 71px, transparent 71px)',
    'linear-gradient(to left, transparent 0 120px, color-mix(in oklab, currentColor 14%, transparent) 120px 121px, transparent 121px 125px, color-mix(in oklab, currentColor 14%, transparent) 125px 126px, transparent 126px)',
  ].join(','),
  maskImage: 'linear-gradient(to bottom, black, black 38%, transparent 86%)',
  WebkitMaskImage: 'linear-gradient(to bottom, black, black 38%, transparent 86%)',
}

/** Les liens de la barre a filet. */
const NAVIGATION = [
  ['#bilan', 'Le bilan'],
  ['#tresorerie', 'La tresorerie'],
  ['#missions', 'Les missions'],
  ['#devis', 'Le devis'],
] as const

/** Les montants, ecrits comme un comptable les ecrit. */
const EURO = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

/* ========================= Le mecanisme : le bilan ===================== */

/** Un poste du bilan : son intitule, son cote, et sa valeur de depart. */
interface Poste {
  readonly cle: string
  readonly intitule: string
  readonly aide: string
  readonly depart: number
}

/** Les quatre postes d actif, dans l ordre de liquidite croissante. */
const ACTIF: readonly Poste[] = [
  {
    cle: 'immo',
    intitule: 'Immobilisations nettes',
    aide: 'Materiel, agencements, logiciels, apres amortissement',
    depart: 180,
  },
  {
    cle: 'stocks',
    intitule: 'Stocks',
    aide: 'Marchandises et en-cours au dernier inventaire',
    depart: 62,
  },
  {
    cle: 'creances',
    intitule: 'Creances clients',
    aide: 'Factures emises et non encore encaissees',
    depart: 145,
  },
  {
    cle: 'treso',
    intitule: 'Tresorerie',
    aide: 'Soldes bancaires et placements a vue',
    depart: 48,
  },
]

/** Les quatre postes de passif, du plus stable au plus exigible. */
const PASSIF: readonly Poste[] = [
  {
    cle: 'capitaux',
    intitule: 'Capitaux propres',
    aide: 'Capital, reserves, resultat de l exercice',
    depart: 150,
  },
  {
    cle: 'dettesFi',
    intitule: 'Dettes financieres',
    aide: 'Emprunts a plus d un an, hors decouvert',
    depart: 120,
  },
  {
    cle: 'fournisseurs',
    intitule: 'Dettes fournisseurs',
    aide: 'Factures recues et non encore reglees',
    depart: 110,
  },
  {
    cle: 'autres',
    intitule: 'Autres dettes',
    aide: 'Fiscales, sociales, et comptes courants d associes',
    depart: 55,
  },
]

/** Un ratio : sa valeur, son seuil, et la phrase qui le lit. */
interface Ratio {
  readonly cle: string
  readonly nom: string
  readonly calcul: string
  readonly valeur: number
  /** Rendu de la valeur : tous ne s ecrivent pas en milliers d euros. */
  readonly rendu: string
  readonly seuil: string
  readonly etat: 'tenu' | 'a surveiller' | 'hors norme'
  readonly lecture: string
}

/** Le verdict d un ratio, a partir de deux bornes ecrites a la main. */
function verdict(valeur: number, alerte: number, confort: number): Ratio['etat'] {
  if (valeur >= confort) return 'tenu'
  if (valeur >= alerte) return 'a surveiller'
  return 'hors norme'
}

/** La couleur d un etat. */
function teinteEtat(etat: Ratio['etat'], surNuit = false): string {
  if (surNuit) {
    if (etat === 'tenu') return 'var(--o-palette-emerald-400)'
    return etat === 'a surveiller'
      ? 'var(--o-palette-amber-400)'
      : 'var(--o-palette-rose-400)'
  }
  if (etat === 'tenu') return semantique('--o-palette-emerald-600')
  return etat === 'a surveiller'
    ? semantique('--o-palette-amber-600')
    : semantique('--o-palette-rose-600')
}

/** Une ligne de saisie du bilan : l intitule a gauche, le montant en colonne. */
function Ligne({
  poste,
  valeur,
  onChange,
}: {
  readonly poste: Poste
  readonly valeur: number
  readonly onChange: (valeur: number) => void
}): ReactElement {
  const id = `poste-${poste.cle}`
  return (
    <div
      className="o-grid o-items-baseline o-gap-x-4 o-gap-y-1 o-py-3 sm:o-grid-cols-12"
      style={{ borderTop: `1px solid ${FILET}` }}
    >
      <div className="o-min-w-0 sm:o-col-span-8">
        <label
          htmlFor={id}
          className="o-block o-text-base o-text-zinc-950 dark:o-text-zinc-50"
        >
          {poste.intitule}
        </label>
        <p className={`o-m-0 o-mt-0.5 ${NOTE}`}>{poste.aide}</p>
      </div>
      <div className="o-flex o-items-baseline o-justify-end o-gap-2 sm:o-col-span-4">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          max={99999}
          step={1}
          value={String(valeur)}
          onChange={(evenement) => {
            const lu = Number.parseInt(evenement.target.value, 10)
            onChange(Number.isNaN(lu) ? 0 : Math.max(0, Math.min(99999, lu)))
          }}
          className="o-w-24 o-bg-transparent o-py-1 o-text-right o-font-mono o-text-lg o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50 focus:o-ring"
          style={{ borderBottom: `1px solid ${FILET_FORT}`, borderRadius: 0 }}
        />
        <span className={NOTE}>k€</span>
      </div>
    </div>
  )
}

/** La lecture d un ratio, en une carte sans carte : un filet et une pastille. */
function CarteRatio({ ratio }: { readonly ratio: Ratio }): ReactElement {
  const couleur = teinteEtat(ratio.etat)
  return (
    <div className="o-min-w-0 o-pt-4" style={{ borderTop: `2px solid ${couleur}` }}>
      <p className={`o-m-0 ${NOTE}`}>{ratio.nom}</p>
      <p
        className="o-m-0 o-mt-2 o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50"
        style={{ ...affiche('m', 300), fontSize: 'clamp(1.6rem, 2.8vw, 2.5rem)' }}
      >
        {ratio.rendu}
      </p>
      <p
        className="o-m-0 o-mt-2 o-inline-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest"
        style={{ color: couleur }}
      >
        <Icon
          icon={ratio.etat === 'tenu' ? Check : TriangleAlert}
          size={13}
          aria-hidden="true"
        />
        {ratio.etat}
      </p>
      <p className="o-m-0 o-mt-3 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
        {ratio.lecture}
      </p>
      <p
        className={`o-m-0 o-mt-3 o-normal-case ${NOTE}`}
        style={{ textTransform: 'none' }}
      >
        {ratio.calcul} · seuil {ratio.seuil}
      </p>
    </div>
  )
}

/**
 * Le bilan : huit postes, six ratios, et une identite qui ne pardonne rien.
 *
 * Les six ratios sont recalcules a chaque frappe, mais surtout : la tresorerie
 * nette deduite du haut de bilan est comparee au poste saisi, et l ecart entre
 * les deux **est** le desequilibre. La page l affiche avec son montant, ce qui
 * en fait le seul controle que le visiteur ne peut pas contourner.
 */
function Bilan(): ReactElement {
  const [postes, setPostes] = useState<Readonly<Record<string, number>>>(() =>
    Object.fromEntries([...ACTIF, ...PASSIF].map((p) => [p.cle, p.depart])),
  )

  const lire = (cle: string): number => postes[cle] ?? 0
  const poser = (cle: string) => (valeur: number) => {
    setPostes((precedent) => ({ ...precedent, [cle]: valeur }))
  }

  const calcul = useMemo(() => {
    const v = (cle: string): number => postes[cle] ?? 0
    const totalActif = ACTIF.reduce((somme, p) => somme + v(p.cle), 0)
    const totalPassif = PASSIF.reduce((somme, p) => somme + v(p.cle), 0)
    const permanents = v('capitaux') + v('dettesFi')
    const exigible = v('fournisseurs') + v('autres')
    const fondsDeRoulement = permanents - v('immo')
    const besoin = v('stocks') + v('creances') - exigible
    const tresorerieNette = fondsDeRoulement - besoin
    const autonomie = totalPassif === 0 ? 0 : (v('capitaux') / totalPassif) * 100
    const liquidite =
      exigible === 0 ? 0 : (v('stocks') + v('creances') + v('treso')) / exigible
    const couverture = v('immo') === 0 ? 0 : permanents / v('immo')

    const ratios: readonly Ratio[] = [
      {
        cle: 'fr',
        nom: 'Fonds de roulement',
        calcul: 'capitaux propres + dettes financieres − immobilisations',
        valeur: fondsDeRoulement,
        rendu: `${EURO.format(fondsDeRoulement)} k€`,
        seuil: 'positif',
        etat: verdict(fondsDeRoulement, 0, 1),
        lecture:
          fondsDeRoulement >= 0
            ? 'Les ressources durables financent les immobilisations et il en reste pour le cycle.'
            : 'Les immobilisations sont financees par du court terme. C est le defaut de structure le plus courant, et le plus cher.',
      },
      {
        cle: 'bfr',
        nom: 'Besoin en fonds de roulement',
        calcul: 'stocks + creances − dettes d exploitation',
        valeur: besoin,
        rendu: `${EURO.format(besoin)} k€`,
        seuil: 'a comparer au fonds de roulement',
        etat: besoin <= fondsDeRoulement ? 'tenu' : 'hors norme',
        lecture:
          besoin <= fondsDeRoulement
            ? 'Le cycle d exploitation est finance sans decouvert : c est ce que le banquier regarde en premier.'
            : 'Le cycle consomme plus que le fonds de roulement ne donne. La difference se paie en agios.',
      },
      {
        cle: 'tn',
        nom: 'Tresorerie nette',
        calcul: 'fonds de roulement − besoin en fonds de roulement',
        valeur: tresorerieNette,
        rendu: `${EURO.format(tresorerieNette)} k€`,
        seuil: 'doit egaler le poste tresorerie',
        etat: tresorerieNette === v('treso') ? 'tenu' : 'hors norme',
        lecture:
          tresorerieNette === v('treso')
            ? 'Elle tombe juste sur le poste saisi : le bilan est equilibre.'
            : `Elle differe du poste saisi de ${EURO.format(Math.abs(tresorerieNette - v('treso')))} k€ — c est exactement le desequilibre du bilan.`,
      },
      {
        cle: 'autonomie',
        nom: 'Autonomie financiere',
        calcul: 'capitaux propres ÷ total du bilan',
        valeur: autonomie,
        rendu: `${String(Math.round(autonomie * 10) / 10).replace('.', ',')} %`,
        seuil: '20 % · confort a 30 %',
        etat: verdict(autonomie, 20, 30),
        lecture:
          autonomie >= 30
            ? 'La maison tient sur ses propres fonds. Un emprunt se negocie dans ces conditions.'
            : 'Sous vingt pour cent, tout nouvel emprunt se paiera en garanties personnelles.',
      },
      {
        cle: 'liquidite',
        nom: 'Liquidite generale',
        calcul: 'actif circulant ÷ dettes d exploitation',
        valeur: liquidite,
        rendu: String(Math.round(liquidite * 100) / 100).replace('.', ','),
        seuil: '1,0 · confort a 1,3',
        etat: verdict(liquidite, 1, 1.3),
        lecture:
          liquidite >= 1.3
            ? 'Ce qui rentre dans l annee couvre largement ce qui sort : aucun sujet a court terme.'
            : 'Sous un, les dettes a payer depassent ce que le cycle rapportera dans l annee.',
      },
      {
        cle: 'couverture',
        nom: 'Couverture des immobilisations',
        calcul: 'ressources durables ÷ immobilisations',
        valeur: couverture,
        rendu: String(Math.round(couverture * 100) / 100).replace('.', ','),
        seuil: '1,0 · confort a 1,2',
        etat: verdict(couverture, 1, 1.2),
        lecture:
          couverture >= 1.2
            ? 'Le materiel est finance sur la meme duree qu il sert. C est la regle, et elle est respectee.'
            : 'Le materiel est finance plus court que sa duree de vie : la tresorerie paiera la difference.',
      },
    ]

    return { totalActif, totalPassif, ecart: totalActif - totalPassif, ratios }
  }, [postes])

  return (
    <div className="o-grid o-gap-12 lg:o-grid-cols-12">
      {/* ---- La saisie, en deux colonnes de grand livre ---------------------- */}
      <div className="o-min-w-0 lg:o-col-span-5">
        <div className="o-grid o-gap-10">
          <div>
            <p className={`o-m-0 ${NOTE}`} style={{ color: encre() }}>
              Actif
            </p>
            <div className="o-mt-3">
              {ACTIF.map((poste) => (
                <Ligne
                  key={poste.cle}
                  poste={poste}
                  valeur={lire(poste.cle)}
                  onChange={poser(poste.cle)}
                />
              ))}
              <p
                className="o-m-0 o-flex o-items-baseline o-justify-between o-gap-4 o-py-3"
                style={{ borderTop: `1px solid ${FILET_FORT}` }}
              >
                <span className={NOTE}>Total actif</span>
                <span className="o-font-mono o-text-xl o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50">
                  {EURO.format(calcul.totalActif)} k€
                </span>
              </p>
            </div>
          </div>

          <div>
            <p className={`o-m-0 ${NOTE}`} style={{ color: encre() }}>
              Passif
            </p>
            <div className="o-mt-3">
              {PASSIF.map((poste) => (
                <Ligne
                  key={poste.cle}
                  poste={poste}
                  valeur={lire(poste.cle)}
                  onChange={poser(poste.cle)}
                />
              ))}
              <p
                className="o-m-0 o-flex o-items-baseline o-justify-between o-gap-4 o-py-3"
                style={{ borderTop: `1px solid ${FILET_FORT}` }}
              >
                <span className={NOTE}>Total passif</span>
                <span className="o-font-mono o-text-xl o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50">
                  {EURO.format(calcul.totalPassif)} k€
                </span>
              </p>
            </div>
          </div>

          {/* Le controle d equilibre : la seule chose qu on ne peut pas contourner. */}
          <p
            aria-live="polite"
            className="o-m-0 o-flex o-flex-wrap o-items-center o-gap-3 o-rounded-xl o-px-4 o-py-3 o-text-sm o-leading-relaxed"
            style={{
              border: `1px solid ${teinteEtat(calcul.ecart === 0 ? 'tenu' : 'hors norme')}`,
              color: teinteEtat(calcul.ecart === 0 ? 'tenu' : 'hors norme'),
            }}
          >
            <Icon
              icon={calcul.ecart === 0 ? Check : TriangleAlert}
              size={15}
              aria-hidden="true"
            />
            {calcul.ecart === 0
              ? 'Le bilan est equilibre : actif et passif tombent au meme montant.'
              : `Ecart de ${EURO.format(Math.abs(calcul.ecart))} k€ entre l actif et le passif. Un bilan ne se rend jamais dans cet etat.`}
          </p>
        </div>
      </div>

      {/* ---- Les six ratios, qui s allument ---------------------------------- */}
      <div className="o-min-w-0 lg:o-col-span-7">
        <div className="o-grid o-gap-x-10 o-gap-y-10 sm:o-grid-cols-2">
          {calcul.ratios.map((ratio) => (
            <CarteRatio key={ratio.cle} ratio={ratio} />
          ))}
        </div>
        <p className="o-mt-12 o-max-w-2xl o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
          <span className="o-text-zinc-950 dark:o-text-zinc-50">
            Ce que cette page ne remplace pas.{' '}
          </span>
          Six ratios ne font pas un diagnostic : ils disent ou regarder. Le compte de
          resultat, le carnet de commandes et les echeances de l annee disent le reste, et
          cela se fait a deux, une heure, autour de la table.
        </p>
      </div>
    </div>
  )
}

/* ========================= C14 : les barres au trait ==================== */

/** Les douze mois de tresorerie du dossier type, en milliers d euros. */
const MOIS: readonly { readonly mois: string; readonly valeur: number }[] = [
  { mois: 'jan', valeur: 48 },
  { mois: 'fev', valeur: 41 },
  { mois: 'mar', valeur: 55 },
  { mois: 'avr', valeur: 62 },
  { mois: 'mai', valeur: 58 },
  { mois: 'jui', valeur: 44 },
  { mois: 'jul', valeur: 29 },
  { mois: 'aou', valeur: 22 },
  { mois: 'sep', valeur: 37 },
  { mois: 'oct', valeur: 51 },
  { mois: 'nov', valeur: 66 },
  { mois: 'dec', valeur: 73 },
]

/** Le sommet de l echelle des barres. */
const SOMMET = 80

/**
 * Les douze mois, dessines au trait, sans cadre.
 *
 * Pas de boite, pas de quadrillage, pas d axe des ordonnees : douze traits
 * epais, leur valeur ecrite au-dessus, et le mois en dessous. Les barres
 * poussent quand la figure entre dans le champ — jouees au montage, elles
 * auraient ete vues par personne, la section etant a trois ecrans du sommet.
 * Sous mouvement reduit elles sont deja la, en entier.
 */
function BarresTresorerie(): ReactElement {
  const { reduced } = useMotionState()
  const cadre = useRef<SVGSVGElement>(null)
  const [vu, setVu] = useState(false)

  useEffect(() => {
    const element = cadre.current
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
      { threshold: 0.25 },
    )
    guetteur.observe(element)
    return () => {
      guetteur.disconnect()
    }
  }, [])

  const gris: CSSProperties = { color: 'var(--o-palette-zinc-400)' }
  const encreNuit = encreSurSombre()
  const base = 250

  return (
    <svg
      ref={cadre}
      viewBox="0 0 900 300"
      role="img"
      aria-label="Tresorerie mois par mois, en milliers d euros"
      className="o-w-full"
      style={{ minWidth: 640 }}
    >
      {MOIS.map((m, rang) => {
        const x = 46 + rang * 68
        const hauteur = (m.valeur / SOMMET) * 196
        const creux = m.valeur < 32
        return (
          <g key={m.mois}>
            <text
              x={x}
              y={base - hauteur - 12}
              textAnchor="middle"
              className="o-font-mono"
              fontSize="12"
              fill="currentColor"
              style={{ color: creux ? 'var(--o-palette-amber-400)' : encreNuit }}
            >
              {m.valeur}
            </text>
            <line
              x1={x}
              y1={base}
              x2={x}
              y2={base - hauteur}
              stroke={creux ? 'var(--o-palette-amber-400)' : encreNuit}
              strokeWidth="14"
              strokeLinecap="butt"
              style={
                reduced
                  ? undefined
                  : {
                      transformBox: 'fill-box',
                      transformOrigin: 'bottom center',
                      transform: vu ? 'scaleY(1)' : 'scaleY(0)',
                      transition: `transform 820ms cubic-bezier(0.16, 1, 0.3, 1) ${String(rang * 60)}ms`,
                    }
              }
            />
            <text
              x={x}
              y={base + 22}
              textAnchor="middle"
              className="o-font-mono"
              fontSize="11"
              fill="currentColor"
              style={gris}
            >
              {m.mois}
            </text>
          </g>
        )
      })}

      {/* Le seul trait qui n est pas une barre : la ligne de flottaison. */}
      <line
        x1="24"
        y1={base}
        x2="876"
        y2={base}
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
        style={gris}
      />
      <text
        x="24"
        y={base - (30 / SOMMET) * 196 - 6}
        className="o-font-mono"
        fontSize="10.5"
        fill="currentColor"
        style={gris}
      >
        seuil de vigilance — 30 k€
      </text>
      <line
        x1="24"
        y1={base - (30 / SOMMET) * 196}
        x2="876"
        y2={base - (30 / SOMMET) * 196}
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 6"
        opacity="0.45"
        style={gris}
      />
      <text
        x="24"
        y="286"
        className="o-font-mono"
        fontSize="10.5"
        fill="currentColor"
        style={gris}
      >
        Milliers d euros, solde de fin de mois — dossier type, exercice 2025
      </text>
    </svg>
  )
}

/* ========================= M-empile : les trois missions ================ */

/** Une mission du cabinet, telle qu elle s empile. */
const MISSIONS: readonly {
  readonly cle: string
  readonly numero: string
  readonly titre: string
  readonly quand: string
  readonly texte: string
  readonly points: readonly string[]
}[] = [
  {
    cle: 'tenue',
    numero: '01',
    titre: 'La tenue',
    quand: 'Tous les mois, du 5 au 12',
    texte:
      'Nous saisissons, nous rapprochons, nous relancons les pieces manquantes. Vous ne classez rien : une photographie suffit, et le reste se fait ici.',
    points: [
      'Rapprochement bancaire au fil de l eau',
      'Declaration de TVA deposee avant le 20',
      'Relance des pieces manquantes, nommement',
    ],
  },
  {
    cle: 'revision',
    numero: '02',
    titre: 'La revision',
    quand: 'Deux fois l an, en juin et en janvier',
    texte:
      'Nous reprenons chaque compte, poste par poste, et nous vous montrons ce qui a bouge. Le bilan n est plus une surprise d avril : il est deja connu en janvier.',
    points: [
      'Situation intermediaire a six mois',
      'Comptes annuels et liasse fiscale',
      'Le projet de bilan relu avec vous avant depot',
    ],
  },
  {
    cle: 'conseil',
    numero: '03',
    titre: 'Le conseil',
    quand: 'Quand vous appelez, et une fois par trimestre',
    texte:
      'Un recrutement, un investissement, un associe qui part. Nous chiffrons les deux scenarios et nous disons celui que nous prendrions, avec ses risques.',
    points: [
      'Previsionnel de tresorerie a douze mois',
      'Choix de statut et remuneration du dirigeant',
      'Dossier de financement, monte avec vous',
    ],
  },
]

/* ========================= A26 : le devis en trois curseurs ============= */

/** Un curseur du devis : sa plage, son pas, et ce qu il coute. */
interface Curseur {
  readonly cle: 'chiffre' | 'salaries' | 'pieces'
  readonly intitule: string
  readonly unite: string
  readonly min: number
  readonly max: number
  readonly pas: number
  readonly depart: number
  readonly aide: string
}

/** Les trois curseurs, et rien de plus : un devis se lit en dix secondes. */
const CURSEURS: readonly Curseur[] = [
  {
    cle: 'chiffre',
    intitule: 'Chiffre d affaires',
    unite: 'k€ par an',
    min: 80,
    max: 4000,
    pas: 20,
    depart: 620,
    aide: 'Le dernier exercice connu, hors taxes',
  },
  {
    cle: 'salaries',
    intitule: 'Salaries',
    unite: 'bulletins par mois',
    min: 0,
    max: 60,
    pas: 1,
    depart: 9,
    aide: 'Y compris les temps partiels et les apprentis',
  },
  {
    cle: 'pieces',
    intitule: 'Pieces comptables',
    unite: 'par mois',
    min: 20,
    max: 900,
    pas: 10,
    depart: 180,
    aide: 'Factures, notes de frais, releves : tout ce qui se saisit',
  },
]

/**
 * La formule du devis, ecrite en clair.
 *
 * Un honoraire annonce sans sa formule n est pas un devis, c est un chiffre.
 * Celle-ci est affichee sous le total, avec ses quatre termes : le lecteur
 * peut la refaire de tete, et c est le but.
 */
const FORMULE =
  '1 400 € de base + 0,90 € par millier de chiffre d affaires + 240 € par bulletin mensuel + 31,20 € par piece mensuelle'

/** L honoraire annuel, en euros, a partir des trois curseurs. */
function honoraire(chiffre: number, salaries: number, pieces: number): number {
  return Math.round(1400 + 0.9 * chiffre + 240 * salaries + 31.2 * pieces)
}

/**
 * Le devis : trois curseurs, un total en 120 px, et la formule dessous.
 *
 * Les curseurs sont des champs `range` du navigateur, repeints a l accent de
 * la vitrine : un composant maison n aurait rien apporte au clavier, et aurait
 * coute le comportement que celui-ci a deja.
 */
function Devis(): ReactElement {
  const [valeurs, setValeurs] = useState<Record<Curseur['cle'], number>>({
    chiffre: 620,
    salaries: 9,
    pieces: 180,
  })
  const identifiant = useId()
  const total = honoraire(valeurs.chiffre, valeurs.salaries, valeurs.pieces)

  return (
    <div className="o-grid o-gap-12 lg:o-grid-cols-12 lg:o-items-start">
      <div className="o-min-w-0 lg:o-col-span-6">
        <div className="o-grid o-gap-9">
          {CURSEURS.map((curseur) => {
            const id = `${identifiant}-${curseur.cle}`
            const valeur = valeurs[curseur.cle]
            return (
              <div key={curseur.cle}>
                <div className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-3">
                  <label
                    htmlFor={id}
                    className="o-text-base o-text-zinc-950 dark:o-text-zinc-50"
                  >
                    {curseur.intitule}
                  </label>
                  <p
                    className="o-m-0 o-font-mono o-text-lg o-tabular-nums"
                    style={{ color: encre() }}
                  >
                    {EURO.format(valeur)}{' '}
                    <span className="o-text-xs o-uppercase o-tracking-widest">
                      {curseur.unite}
                    </span>
                  </p>
                </div>
                <input
                  id={id}
                  type="range"
                  min={curseur.min}
                  max={curseur.max}
                  step={curseur.pas}
                  value={valeur}
                  onChange={(evenement) => {
                    const lu = Number(evenement.target.value)
                    setValeurs((precedent) => ({ ...precedent, [curseur.cle]: lu }))
                  }}
                  className="o-mt-4 o-block o-w-full o-cursor-pointer focus:o-ring"
                  style={{ accentColor: encre() }}
                />
                <p className={`o-m-0 o-mt-2 ${NOTE}`}>{curseur.aide}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="o-min-w-0 lg:o-col-span-6">
        <p className={`o-m-0 ${NOTE}`}>Honoraires, pour une annee complete</p>
        <p
          aria-live="polite"
          className="o-m-0 o-mt-4 o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50"
          style={{
            ...affiche('xl', 300),
            fontSize: 'clamp(3rem, 9vw, 7.5rem)',
            lineHeight: 0.86,
          }}
        >
          {EURO.format(total)} €
        </p>
        <p className="o-m-0 o-mt-5 o-text-lg o-text-zinc-700 dark:o-text-zinc-300">
          soit{' '}
          <span className="o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50">
            {EURO.format(Math.round(total / 12))} €
          </span>{' '}
          par mois, preleves le 5.
        </p>
        <p
          className={`o-m-0 o-mt-8 o-pt-4 ${NOTE}`}
          style={{ borderTop: `1px solid ${FILET}`, textTransform: 'none' }}
        >
          {FORMULE}
        </p>
        <p className="o-mt-6 o-max-w-md o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
          Ce montant est celui de la lettre de mission, pas un point de depart. Il ne
          bouge en cours d annee que si votre activite change, et nous vous le disons
          avant, jamais apres.
        </p>
        <div className="o-mt-8 o-min-w-0">
          {/*
            La pilule est en `inline-flex` : sa largeur est celle de son
            contenu, et le champ garde la taille intrinseque d un `input`. A
            380 px elle poussait la page de soixante-dix pixels. Posee en
            `flex` sur toute la largeur, elle se plie comme le reste.
          */}
          <ButtonGroupInput
            label="Votre adresse de courriel"
            type="email"
            placeholder="vous@votre-maison.fr"
            buttonLabel="Recevoir ce devis"
            doneLabel="Envoye"
            style={{ display: 'flex', width: '100%' }}
          />
        </div>
      </div>
    </div>
  )
}

/* ========================= P18 : l ours du pied ======================== */

/** Les trois colonnes de l ours, de chasse fixe. */
const OURS: readonly { readonly titre: string; readonly lignes: readonly ReactNode[] }[] =
  [
    {
      titre: 'Le cabinet',
      lignes: [
        'Grand Livre, societe d expertise comptable a responsabilite limitee au capital de 60 000 €.',
        '22 rue Thiers, 76000 Rouen — 02 35 71 08 44. Second bureau au Havre, 5 quai George-V.',
        'SIREN 504 218 663 — TVA FR 89 504 218 663 — APE 6920Z.',
      ],
    },
    {
      titre: 'L ordre',
      lignes: [
        'Inscrite au tableau de l ordre des experts-comptables de Normandie. Trois experts-comptables diplomes, neuf collaborateurs.',
        'Responsabilite civile professionnelle souscrite aupres de l assureur agree par l ordre, garantie de 5 M€ par sinistre.',
        'Aucun maniement de fonds pour le compte des clients, en aucune circonstance : ni encaissement, ni reglement, ni detention.',
      ],
    },
    {
      titre: 'Le lecteur',
      lignes: [
        'Honoraires fixes par lettre de mission annuelle, revisables une fois l an et jamais retroactivement. Le devis engage le cabinet trente jours.',
        'Reclamation : le conseil regional de l ordre peut etre saisi apres une reclamation ecrite restee sans reponse pendant deux mois.',
        'Donnees conservees dix ans, duree legale de conservation des pieces comptables, ni cedees ni prospectees. Site partiellement conforme au referentiel d accessibilite.',
      ],
    },
  ]

/* ========================= La vitrine ================================== */

/**
 * La page du grand livre, dessinee : l objet unique de l ouverture — Lumen.
 *
 * Ni photographie ni scene graphique : une page reglee, deux colonnes, six
 * ecritures et un total, posee de biais et flottant lentement. Elle donne
 * l echelle du titre, et elle dit le metier avant la premiere phrase.
 */
function PageDeLivre(): ReactElement {
  const ecritures: readonly [string, string, string, string][] = [
    ['04/01', 'Report a nouveau', '', '128 400'],
    ['09/01', 'Vente 2026-0114', '', '18 600'],
    ['12/01', 'Achat fournitures', '2 340', ''],
    ['18/01', 'Salaires janvier', '21 180', ''],
    ['24/01', 'Vente 2026-0121', '', '9 750'],
    ['31/01', 'TVA collectee', '4 070', ''],
  ]
  return (
    <Flotte amplitude={9} duree={9} angle={-1.6} className="o-w-full">
      <div
        aria-hidden="true"
        className="o-overflow-hidden o-rounded-lg o-bg-white o-shadow-xl dark:o-bg-zinc-900"
        style={{ border: `1px solid ${FILET_FORT}` }}
      >
        <div
          className="o-flex o-items-baseline o-justify-between o-gap-4 o-px-5 o-py-3"
          style={{
            borderBottom: `1px solid ${FILET}`,
            backgroundColor: accentDoux(300, 14),
          }}
        >
          <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-700 dark:o-text-zinc-300">
            Grand livre — 512 Banque
          </span>
          <span className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
            Exercice 2026
          </span>
        </div>
        <div
          className="o-grid o-grid-cols-12 o-gap-2 o-px-5 o-py-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
          style={{ borderBottom: `1px solid ${FILET}` }}
        >
          <span className="o-col-span-2">Date</span>
          <span className="o-col-span-6">Libelle</span>
          <span className="o-col-span-2 o-text-right">Debit</span>
          <span className="o-col-span-2 o-text-right">Credit</span>
        </div>
        {ecritures.map(([date, libelle, debit, credit]) => (
          <div
            key={`${date}-${libelle}`}
            className="o-grid o-grid-cols-12 o-gap-2 o-px-5 o-py-2 o-font-mono o-text-xs o-tabular-nums o-text-zinc-700 dark:o-text-zinc-300"
            style={{ borderBottom: `1px solid ${FILET}` }}
          >
            <span className="o-col-span-2">{date}</span>
            <span className="o-col-span-6 o-truncate">{libelle}</span>
            <span className="o-col-span-2 o-text-right">{debit}</span>
            <span className="o-col-span-2 o-text-right">{credit}</span>
          </div>
        ))}
        <div
          className="o-grid o-grid-cols-12 o-gap-2 o-px-5 o-py-3 o-font-mono o-text-sm o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50"
          style={{ borderTop: `2px solid ${FILET_FORT}` }}
        >
          <span className="o-col-span-8 o-text-xs o-uppercase o-tracking-widest">
            Solde au 31/01
          </span>
          <span className="o-col-span-4 o-text-right" style={{ color: encre() }}>
            127 760
          </span>
        </div>
      </div>
    </Flotte>
  )
}

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('onest')

  return (
    <Porte forme="compteur" marque="Grand Livre" sombre={false}>
      <div
        className="o-bg-zinc-50 dark:o-bg-zinc-950 o-text-zinc-800 dark:o-text-zinc-200"
        style={polices}
      >
        {/*
          ----- L affiche d ouverture — Lumen --------------------------------

          Un objet unique, decale d un tiers, sur du papier de grand livre.
          L objet est dessine : une page reglee avec ses six ecritures.
        */}
        <div id="haut" className="o-relative o-isolate o-overflow-hidden">
          <div aria-hidden="true" className="o-absolute o-inset-0 o-z-0" style={PAPIER} />

          <div className="o-relative o-z-10">
            <BarreFilet
              marque="Grand Livre"
              liens={NAVIGATION}
              action={['#devis', 'Un devis en trois curseurs']}
              sombre={false}
            />

            <div className="o-grid o-items-center o-gap-12 o-px-6 o-pb-20 o-pt-16 md:o-px-8 lg:o-grid-cols-12 lg:o-gap-16 lg:o-pt-24">
              <div className="o-min-w-0 lg:o-col-span-7">
                <Surgit>
                  <Etiquette sombre={false}>
                    Expertise comptable — Rouen et Le Havre
                  </Etiquette>
                </Surgit>
                <TitreVague
                  delai={120}
                  className="o-m-0 o-mt-7 o-max-w-3xl o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('l', 300),
                    fontSize: 'clamp(2.5rem, 6vw, 6.25rem)',
                  }}
                >
                  Votre bilan, explique avant d etre depose.
                </TitreVague>
                <Surgit delai={460}>
                  <p className="o-mt-8 o-max-w-xl o-text-lg o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                    Remplissez huit postes ici meme : la page allume les six ratios que
                    votre banquier regardera, et vous dit lequel ne tient pas. C est
                    exactement ce que nous faisons, en plus long et avec vos vrais
                    chiffres.
                  </p>
                  <div className="o-mt-9">
                    <Actions
                      sombre={false}
                      pleine={[
                        '#bilan',
                        <>
                          Remplir le bilan{' '}
                          <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                        </>,
                      ]}
                      fantome={['#devis', 'Combien ca coute']}
                    />
                  </div>
                </Surgit>
              </div>
              <Surgit delai={620} className="o-min-w-0 lg:o-col-span-5">
                <PageDeLivre />
              </Surgit>
            </div>
          </div>
        </div>

        <main>
          {/*
            ----- Le mecanisme : le bilan --------------------------------------
          */}
          <section
            id="bilan"
            aria-labelledby="bilan-titre"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32"
            style={{ borderTop: `1px solid ${FILET}` }}
          >
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-8">
                <Indice rang="01" sombre={false}>
                  Le bilan
                </Indice>
                <h2
                  id="bilan-titre"
                  className="o-m-0 o-mt-5 o-max-w-3xl o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(2rem, 4.4vw, 4.25rem)',
                  }}
                >
                  <SpotlightText radius={180} rest={0.45}>
                    Huit postes, six ratios, une identite.
                  </SpotlightText>
                </h2>
              </div>
              <p className={`md:o-col-span-4 md:o-text-right ${NOTE}`}>
                Tout se calcule dans cette page
                <br />
                Aucun chiffre ne nous est envoye
              </p>
            </div>

            <div className="o-mt-16">
              <Bilan />
            </div>
          </section>

          {/*
            ----- La coupe sombre : C14, les douze mois au trait ----------------
          */}
          <section
            id="tresorerie"
            aria-labelledby="tresorerie-titre"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32"
            style={nuit('zinc')}
          >
            <div className="o-grid o-gap-12 lg:o-grid-cols-12">
              <div className="lg:o-col-span-4">
                <p
                  className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                  style={{ color: encreSurSombre() }}
                >
                  Figure unique
                </p>
                <h2
                  id="tresorerie-titre"
                  className="o-m-0 o-mt-5 o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)',
                  }}
                >
                  Le creux d aout n est pas une surprise.
                </h2>
                <p className="o-mt-5 o-text-sm o-leading-relaxed o-text-zinc-300">
                  Douze soldes de fin de mois, sur un dossier type. Le trou de juillet et
                  d aout est la somme de trois choses connues d avance : la TVA du
                  deuxieme trimestre, les conges payes, et des clients qui paient en
                  septembre.
                </p>
                <p className="o-mt-5 o-text-sm o-leading-relaxed o-text-zinc-300">
                  Un previsionnel de tresorerie le montre en janvier. C est le premier
                  document que nous montons avec un nouveau dossier, et le seul que nous
                  refusons de facturer a part.
                </p>
                <p className={`o-mt-8 ${NOTE_SUR_NUIT}`}>
                  Douze points · un seuil · aucun cadre
                </p>
              </div>
              <figure className="o-m-0 o-min-w-0 lg:o-col-span-8">
                {/*
                  La figure defile de cote sur un ecran etroit, et declare
                  `overflow-y: hidden` explicitement : sinon la cascade met les
                  deux axes a `auto` et la bande avale la molette.
                */}
                <div
                  className="o-min-w-0 o-overflow-x-auto o-pb-2"
                  style={{ overflowY: 'hidden' }}
                >
                  <BarresTresorerie />
                </div>
                <figcaption className="o-mt-6 o-border-t o-border-white-10 o-pt-4 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-400">
                  Les deux mois en ambre passent sous le seuil de vigilance. Aucun n a
                  donne lieu a un decouvert : ils etaient prevus, et la ligne de credit
                  court terme avait ete negociee en mars.
                </figcaption>
              </figure>
            </div>
          </section>

          {/*
            ----- M-empile : les trois missions qui s empilent ------------------
          */}
          <section
            id="missions"
            aria-labelledby="missions-titre"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32"
            style={{ borderTop: `1px solid ${FILET}` }}
          >
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-8">
                <Indice rang="02" sombre={false}>
                  Les missions
                </Indice>
                <h2
                  id="missions-titre"
                  className="o-m-0 o-mt-5 o-max-w-3xl o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(2rem, 4.4vw, 4.25rem)',
                  }}
                >
                  Trois missions, dans cet ordre.
                </h2>
              </div>
              <p className={`md:o-col-span-4 md:o-text-right ${NOTE}`}>
                Elles se prennent ensemble
                <br />
                ou pas du tout
              </p>
            </div>

            <div className="o-mt-16">
              <StickyStack offset={140} gap={26} shrink={0.06}>
                {MISSIONS.map((mission) => (
                  <div
                    key={mission.cle}
                    className="o-overflow-hidden o-rounded-2xl o-bg-white o-p-8 dark:o-bg-zinc-900 md:o-p-12"
                    style={{ border: `1px solid ${FILET_FORT}` }}
                  >
                    <div className="o-grid o-gap-8 md:o-grid-cols-12">
                      <div className="md:o-col-span-4">
                        <p
                          className="o-m-0 o-tabular-nums"
                          style={{
                            ...affiche('l', 300),
                            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                            color: encre(),
                          }}
                        >
                          {mission.numero}
                        </p>
                        <h3 className="o-m-0 o-mt-3 o-text-3xl o-font-medium o-tracking-tight o-text-zinc-950 dark:o-text-zinc-50">
                          {mission.titre}
                        </h3>
                        <p className={`o-m-0 o-mt-3 ${NOTE}`}>{mission.quand}</p>
                      </div>
                      <div className="o-min-w-0 md:o-col-span-8">
                        <p className="o-m-0 o-max-w-xl o-text-lg o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300">
                          {mission.texte}
                        </p>
                        <ul className="o-m-0 o-mt-8 o-list-none o-p-0">
                          {mission.points.map((point) => (
                            <li
                              key={point}
                              className="o-flex o-items-baseline o-gap-3 o-py-3 o-text-base o-text-zinc-950 dark:o-text-zinc-50"
                              style={{ borderTop: `1px solid ${FILET}` }}
                            >
                              <Icon
                                icon={Check}
                                size={15}
                                style={{ color: encre() }}
                                aria-hidden="true"
                              />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </StickyStack>
            </div>
          </section>

          {/*
            ----- A26 : le devis en trois curseurs, le total en 120 px ----------
          */}
          <section
            id="devis"
            aria-labelledby="devis-titre"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32"
            style={{
              borderTop: `1px solid ${FILET}`,
              backgroundColor: accentDoux(300, 7),
            }}
          >
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-8">
                <Indice rang="03" sombre={false}>
                  Le devis
                </Indice>
                <h2
                  id="devis-titre"
                  className="o-m-0 o-mt-5 o-max-w-3xl o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(2rem, 4.4vw, 4.25rem)',
                  }}
                >
                  Trois curseurs, et le chiffre.
                </h2>
              </div>
              <p className={`md:o-col-span-4 md:o-text-right ${NOTE}`}>
                La formule est sous le total
                <br />
                Refaites-la de tete
              </p>
            </div>

            <div className="o-mt-16">
              <Devis />
            </div>
          </section>
        </main>

        {/*
          ----- P18 : l ours en trois colonnes, regle comme un grand livre -----
        */}
        <footer
          className="o-px-6 o-pb-10 o-pt-14 md:o-px-8"
          style={{ borderTop: `2px solid ${FILET_FORT}` }}
        >
          <div className="o-flex o-flex-wrap o-items-baseline o-gap-x-6 o-gap-y-2 o-pb-8">
            <span className="o-inline-flex o-items-center o-gap-2 o-text-xl o-font-medium o-tracking-tight o-text-zinc-950 dark:o-text-zinc-50">
              <Icon
                icon={BookOpenText}
                size={18}
                style={{ color: encre() }}
                aria-hidden="true"
              />
              Grand Livre
            </span>
            <span className={NOTE}>Experts-comptables inscrits — Rouen et Le Havre</span>
          </div>

          <div
            className="o-flex o-flex-wrap o-gap-x-12 o-gap-y-10 o-pt-8"
            style={{ borderTop: `1px solid ${FILET}` }}
          >
            {OURS.map((colonne, rang) => (
              <div
                key={colonne.titre}
                className="o-min-w-0"
                style={{ width: '21rem', maxWidth: '100%' }}
              >
                <p
                  className="o-m-0 o-flex o-items-baseline o-gap-3 o-pb-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-950 dark:o-text-zinc-50"
                  style={{ borderBottom: `1px solid ${FILET_FORT}` }}
                >
                  <span style={{ color: encre() }}>
                    {String(rang + 1).padStart(2, '0')}
                  </span>
                  {colonne.titre}
                </p>
                {colonne.lignes.map((ligne, index) => (
                  <p
                    key={index}
                    className="o-m-0 o-py-2.5 o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400"
                    style={{ borderBottom: `1px solid ${FILET}` }}
                  >
                    {ligne}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <p
            className={`o-mt-12 o-flex o-flex-wrap o-justify-between o-gap-4 o-pt-6 ${NOTE}`}
            style={{ borderTop: `1px solid ${FILET}` }}
          >
            <span>© 2026 Grand Livre SARL</span>
            <span>
              <a href="#haut" className="o-no-underline o-text-current focus:o-ring">
                Mentions legales
              </a>
              {' · '}
              <a href="#haut" className="o-no-underline o-text-current focus:o-ring">
                Donnees personnelles
              </a>
              {' · '}
              <a href="#haut" className="o-no-underline o-text-current focus:o-ring">
                Accessibilite : partiellement conforme
              </a>
            </span>
          </p>
        </footer>
      </div>
    </Porte>
  )
}
