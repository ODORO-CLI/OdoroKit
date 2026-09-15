/**
 * Minute — etude notariale, Lyon.
 *
 * ## Le mecanisme : les frais
 *
 * « Frais de notaire » est le nom d un malentendu : sur cent euros verses au
 * jour de la signature, une douzaine seulement reviennent a l etude. Le reste
 * est de l impot, et il part au departement, a la commune et au Tresor.
 *
 * La page fait donc le calcul en entier, avec les taux reels :
 *
 * 1. les **emoluments** du notaire, au bareme reglemente par tranches —
 *    3,870 % jusqu a 6 500 EUR, 1,596 % jusqu a 17 000, 1,064 % jusqu a
 *    60 000, 0,799 % au-dela ;
 * 2. les **droits de mutation** — taxe departementale (4,50 % ou 3,80 %),
 *    taxe communale de 1,20 %, et 2,37 % de la part departementale pour
 *    l assiette et le recouvrement ;
 * 3. la **contribution de securite immobiliere**, 0,10 % du prix ;
 * 4. les **debours**, avances aux tiers, et la taxe sur la valeur ajoutee.
 *
 * Le resultat se lit sur une **reglette graduee** (forme C22) : un metre
 * pose sous le total, ou chaque poste occupe sa longueur reelle. On y voit
 * d un coup ce qui revient a l Etat, et ce qui revient a l etude.
 *
 * ## La mise en scene
 *
 * Filiation Forma : du papier, une gouttiere large, des coins en mono, aucune
 * rondeur inutile. Aucune photographie — une etude ne se photographie pas —
 * mais trois dessins : la minute et son sceau, la frise des delais de vente,
 * et le pied en papier millimetre, cotes comprises (forme P40).
 *
 * Signature de mouvement : **M-chapitres**. Trois chapitres a etiquette
 * collante, et une seule coupe sombre au milieu pour respirer.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowDown, ArrowUpRight, Scale } from '@odoro-cli/icons/outline'
import { useMemo, useState, type ReactElement } from 'react'

import { BlurWords } from '@/odoro/text/BlurWords.jsx'
import { ButtonGroupInput } from '@/odoro/ui/ButtonGroupInput.jsx'
import { CopyButton } from '@/odoro/ui/CopyButton.jsx'
import { SegmentedControl } from '@/odoro/ui/SegmentedControl.jsx'

import { BandeauMentions, Filigrane, nuit } from './communs.jsx'
import {
  Actions,
  affiche,
  BarreCoins,
  CHROME,
  Coin,
  Etiquette,
  Indice,
  Manifeste,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
  type Lien,
} from './marche.jsx'
import { accent, accentDoux, aplat, encre } from './palettes.js'
import { Chapitre, Parallaxe } from './scene.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Les rubriques, aux quatre coins. */
const NAVIGATION: readonly Lien[] = [
  ['#frais', 'Les frais'],
  ['#vente', 'La vente'],
  ['#minute', 'La minute'],
]

/* ============================ Le bareme ================================ */

/**
 * Le bareme des emoluments de vente, par tranches d assiette.
 *
 * Ce sont les taux du tarif reglemente : ils ne se negocient pas, et ils sont
 * les memes dans toutes les etudes de France. Le dernier plafond est un
 * nombre, et non l infini, pour que le calcul reste une somme finie.
 */
const TRANCHES: readonly (readonly [plafond: number, taux: number])[] = [
  [6500, 0.0387],
  [17000, 0.01596],
  [60000, 0.01064],
  [1e12, 0.00799],
]

/** Les debours avances aux tiers : cadastre, etat civil, syndic, publicite. */
const DEBOURS = 1100

/** La taxe sur la valeur ajoutee, appliquee aux emoluments et aux debours. */
const TVA = 0.2

/** Ce qu on achete, et le regime fiscal qui va avec. */
const NATURES = [
  { value: 'ancien', label: 'Un bien ancien' },
  { value: 'neuf', label: 'Un bien neuf' },
] as const

/** Le taux de la taxe departementale, la ou l etude travaille. */
const DEPARTEMENTS = [
  { cle: 'rhone', nom: 'Rhone', taux: 0.045 },
  { cle: 'isere', nom: 'Isere', taux: 0.038 },
] as const

/** Les emoluments du notaire, hors taxe, au bareme par tranches. */
function emoluments(prix: number): number {
  let bas = 0
  let total = 0
  for (const [plafond, taux] of TRANCHES) {
    const part = Math.max(0, Math.min(prix, plafond) - bas)
    total += part * taux
    bas = plafond
    if (prix <= plafond) break
  }
  return total
}

/** Un poste de frais, avec la poche ou il tombe. */
interface Poste {
  readonly cle: string
  readonly nom: string
  readonly detail: string
  readonly montant: number
  readonly poche: 'etat' | 'etude' | 'tiers'
}

/** Le decompte complet, pour un prix, une nature et un departement. */
function decompter(
  prix: number,
  nature: string,
  taux: number,
): {
  readonly postes: readonly Poste[]
  readonly total: number
  readonly parts: Readonly<Record<'etat' | 'etude' | 'tiers', number>>
} {
  const emolumentsHT = emoluments(prix)
  const ancien = nature === 'ancien'

  // Dans le neuf, la mutation n est pas soumise aux droits departementaux :
  // seule la taxe de publicite fonciere est due, a 0,715 %.
  const departementale = ancien ? prix * taux : 0
  const communale = ancien ? prix * 0.012 : 0
  const assiette = departementale * 0.0237
  const publicite = ancien ? 0 : prix * 0.00715
  const securite = prix * 0.001
  const taxe = (emolumentsHT + DEBOURS) * TVA

  const bruts: readonly Poste[] = [
    {
      cle: 'emoluments',
      nom: 'Emoluments de l etude',
      detail: 'Tarif reglemente, quatre tranches, identique dans toute la France',
      montant: emolumentsHT,
      poche: 'etude',
    },
    ancien
      ? {
          cle: 'departementale',
          nom: 'Taxe departementale',
          detail: `${(taux * 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} % du prix, votee par le conseil departemental`,
          montant: departementale,
          poche: 'etat' as const,
        }
      : {
          cle: 'publicite',
          nom: 'Taxe de publicite fonciere',
          detail: '0,715 % du prix — le neuf echappe aux droits de mutation',
          montant: publicite,
          poche: 'etat' as const,
        },
    {
      cle: 'communale',
      nom: 'Taxe communale',
      detail: '1,20 % du prix, pour la commune du bien',
      montant: communale,
      poche: 'etat',
    },
    {
      cle: 'assiette',
      nom: 'Assiette et recouvrement',
      detail: '2,37 % de la taxe departementale, pour le Tresor',
      montant: assiette,
      poche: 'etat',
    },
    {
      cle: 'securite',
      nom: 'Securite immobiliere',
      detail: '0,10 % du prix, pour le service de la publicite fonciere',
      montant: securite,
      poche: 'etat',
    },
    {
      cle: 'debours',
      nom: 'Debours',
      detail: 'Cadastre, etat civil, syndic, geometre — avances puis refactures a l euro',
      montant: DEBOURS,
      poche: 'tiers',
    },
    {
      cle: 'tva',
      nom: 'Taxe sur la valeur ajoutee',
      detail: '20 % sur les emoluments et les debours',
      montant: taxe,
      poche: 'etat',
    },
  ]
  const postes = bruts.filter((p) => p.montant > 0)

  const parts = { etat: 0, etude: 0, tiers: 0 }
  for (const poste of postes) parts[poste.poche] += poste.montant
  const total = parts.etat + parts.etude + parts.tiers
  return { postes, total, parts }
}

/** Les trois poches, avec leur nuance sur la reglette. */
const POCHES = [
  { cle: 'etat' as const, nom: 'L Etat et les collectivites', nuance: 700 },
  { cle: 'etude' as const, nom: 'L etude', nuance: 400 },
  { cle: 'tiers' as const, nom: 'Les tiers', nuance: 200 },
]

/** Un montant en euros, arrondi a l euro, ecrit a la francaise. */
function euros(n: number): string {
  return `${Math.round(n).toLocaleString('fr-FR')} EUR`
}

/* ============================ Les dessins ============================== */

/**
 * La minute et son sceau.
 *
 * La minute est l original de l acte : il ne sort jamais de l etude, et c est
 * la copie qui circule. Le dessin la montre telle qu elle se range — une
 * feuille de grand format, reglee, pliee au tiers, et le sceau en bas a
 * droite. Aucune photographie ne dirait cela mieux.
 */
function MinuteDessinee(): ReactElement {
  const lignes = Array.from({ length: 14 }, (_, rang) => 96 + rang * 17)
  return (
    <svg
      viewBox="0 0 320 420"
      className="o-h-full o-w-full"
      aria-hidden="true"
      fill="none"
    >
      <rect
        x="18"
        y="14"
        width="284"
        height="392"
        fill={accentDoux(200, 30)}
        stroke={accent(500)}
        strokeOpacity="0.5"
      />
      <path d="M18 14h284v392" stroke={accent(700)} strokeOpacity="0.28" />
      {/* L en-tete de l acte, et la mention marginale. */}
      <rect x="44" y="40" width="132" height="9" fill={accent(600)} fillOpacity="0.55" />
      <rect x="44" y="58" width="86" height="7" fill={accent(600)} fillOpacity="0.32" />
      <path d="M44 82h232" stroke={accent(700)} strokeOpacity="0.4" />
      {lignes.map((y, rang) => (
        <rect
          key={y}
          x="44"
          y={y}
          width={rang % 5 === 4 ? 128 : 232}
          height="5"
          fill={accent(700)}
          fillOpacity={rang % 5 === 4 ? 0.16 : 0.22}
        />
      ))}
      {/* Le pli au tiers : une etude plie ses minutes, toujours au meme endroit. */}
      <path
        d="M18 148h284M18 282h284"
        stroke={accent(700)}
        strokeOpacity="0.18"
        strokeDasharray="3 5"
      />
      {/* Le paraphe, d un seul trait. */}
      <path
        d="M52 372c22-26 32-38 40-34 7 4-8 22-14 32-4 7 0 10 8 6 12-6 24-24 34-38 6-9 12-8 10 2-2 8-8 18-6 22 3 5 14-2 26-16"
        stroke={encre()}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Le sceau. */}
      <g transform="translate(244 358)">
        <circle
          r="34"
          fill={accent(600)}
          fillOpacity="0.16"
          stroke={accent(600)}
          strokeOpacity="0.7"
        />
        <circle r="25" stroke={accent(700)} strokeOpacity="0.5" strokeDasharray="2 4" />
        {Array.from({ length: 24 }, (_, rang) => {
          const angle = (rang * Math.PI) / 12
          return (
            <path
              key={rang}
              d={`M${String((Math.cos(angle) * 34).toFixed(1))} ${String((Math.sin(angle) * 34).toFixed(1))}L${String((Math.cos(angle) * 40).toFixed(1))} ${String((Math.sin(angle) * 40).toFixed(1))}`}
              stroke={accent(600)}
              strokeOpacity="0.55"
            />
          )
        })}
        <path
          d="M-11 6 -3 14 12 -8"
          stroke={encre()}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

/** Une etape de la vente, avec son delai reel. */
interface Etape {
  readonly jour: string
  readonly titre: string
  readonly texte: string
}

/** Les six etapes d une vente, du compromis a la remise des clefs. */
const VENTE: readonly Etape[] = [
  {
    jour: 'J',
    titre: 'Le compromis',
    texte:
      'Signe a l etude ou sous seing prive. Le depot de garantie, cinq a dix pour cent, est sequestre sur le compte de l etude.',
  },
  {
    jour: 'J + 10',
    titre: 'La retractation',
    texte:
      'Dix jours pour l acquereur, sans motif et sans penalite. Le delai part de la premiere presentation du recommande.',
  },
  {
    jour: 'J + 30',
    titre: 'Les pieces',
    texte:
      'Urbanisme, cadastre, etat civil, syndic, diagnostics. C est ce qui prend le plus de temps, et ce qu on ne peut pas accelerer.',
  },
  {
    jour: 'J + 45',
    titre: 'Le pret',
    texte:
      'Offre emise, puis onze jours de reflexion imposes par la loi avant acceptation. Aucun notaire ne peut les raccourcir.',
  },
  {
    jour: 'J + 75',
    titre: 'L acte authentique',
    texte:
      'Lecture integrale, signature electronique, remise des clefs. Les fonds partent le jour meme au vendeur.',
  },
  {
    jour: 'J + 90',
    titre: 'La publication',
    texte:
      'L acte est publie au service de la publicite fonciere. Le titre de propriete arrive ensuite, par courrier.',
  },
]

/**
 * La frise des delais, dessinee.
 *
 * Un trait, six jalons, et la duree reelle entre chacun — pas un pictogramme.
 * Le trait se lit de gauche a droite au-dessus de 768 px, et se redresse en
 * colonne en dessous : une frise horizontale de six etapes sur un telephone
 * serait illisible.
 */
function FriseVente(): ReactElement {
  return (
    <ol className="o-m-0 o-grid o-list-none o-gap-0 o-p-0 md:o-grid-cols-6">
      {VENTE.map((etape, rang) => (
        <li
          key={etape.jour}
          className="o-relative o-flex o-gap-5 o-pb-10 md:o-block md:o-pb-0 md:o-pr-5"
        >
          {/*
            Le trait, en deux exemplaires plutot qu un seul a bascule : une
            classe de largeur et sa variante `md:` se disputent la meme
            propriete, et l ordre de la feuille decide — ce qui donnait une
            frise en petits traits verticaux.
          */}
          <span
            aria-hidden="true"
            className="o-absolute o-bottom-0 o-left-1.5 o-top-4 o-w-px md:o-hidden"
            style={{ backgroundColor: 'var(--o-theme-line)' }}
          />
          <span
            aria-hidden="true"
            className="o-absolute o-left-0 o-right-0 o-top-1.5 o-hidden o-h-px md:o-block"
            style={{ backgroundColor: 'var(--o-theme-line)' }}
          />
          <span
            aria-hidden="true"
            className="o-relative o-mt-3 o-block o-size-3 o-shrink-0 o-rounded-full md:o-mt-0"
            style={{
              backgroundColor: rang === 0 ? encre() : 'var(--o-theme-bg)',
              border: `2px solid ${encre()}`,
            }}
          />
          <div className="o-min-w-0 md:o-mt-6">
            <p
              className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-tabular-nums"
              style={{ color: encre() }}
            >
              {etape.jour}
            </p>
            <h3 className="o-m-0 o-mt-2 o-text-lg o-font-semibold o-tracking-tight o-text-stone-950 dark:o-text-stone-50">
              {etape.titre}
            </h3>
            <p className="o-m-0 o-mt-2 o-max-w-xs o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
              {etape.texte}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}

/* ============================ La reglette (C22) ======================== */

/**
 * La reglette graduee : le total etendu sur un metre.
 *
 * Chaque poste occupe sa longueur reelle, et les graduations sont des
 * milliers d euros — pas des pourcentages arrondis. C est la seule maniere
 * honnete de montrer un rapport de un a huit : un camembert le ferait
 * disparaitre, une liste de pourcentages le ferait oublier.
 */
function Reglette({
  parts,
  total,
}: {
  readonly parts: Readonly<Record<'etat' | 'etude' | 'tiers', number>>
  readonly total: number
}): ReactElement {
  // Un pas de graduation qui donne entre huit et seize traits, quel que soit
  // le montant : au-dela, la reglette devient une trame.
  const pas = total > 40000 ? 5000 : total > 16000 ? 2000 : 1000
  const graduations = Math.floor(total / pas)

  return (
    <figure className="o-m-0">
      <div
        className="o-relative o-h-16 o-w-full o-overflow-hidden o-border-w-1"
        style={{
          borderColor: 'var(--o-theme-line)',
          backgroundColor: 'var(--o-theme-bg)',
        }}
      >
        <div className="o-flex o-h-full">
          {POCHES.map((poche) => (
            <div
              key={poche.cle}
              className="o-h-full o-transition-all"
              style={{
                width: `${String((parts[poche.cle] / total) * 100)}%`,
                backgroundColor: accent(poche.nuance),
                transitionDuration: '420ms',
              }}
            />
          ))}
        </div>
        {/* Les graduations, posees par-dessus les bandes. */}
        <div aria-hidden="true" className="o-pointer-events-none o-absolute o-inset-0">
          {Array.from({ length: graduations }, (_, rang) => {
            const x = ((rang + 1) * pas) / total
            const majeure = (rang + 1) % 5 === 0
            return (
              <span
                key={rang}
                className="o-absolute o-top-0 o-w-px"
                style={{
                  left: `${String(x * 100)}%`,
                  height: majeure ? '100%' : '38%',
                  backgroundColor: 'var(--o-palette-zinc-950)',
                  opacity: majeure ? 0.55 : 0.3,
                }}
              />
            )
          })}
        </div>
      </div>

      {/* L echelle, sous la reglette. */}
      <div
        aria-hidden="true"
        className="o-mt-1 o-flex o-justify-between o-font-mono o-text-xs o-tabular-nums o-text-stone-500 dark:o-text-stone-400"
      >
        <span>0</span>
        <span>
          {(pas * 5).toLocaleString('fr-FR')} EUR entre deux grandes graduations
        </span>
        <span>{euros(total)}</span>
      </div>

      <figcaption className="o-mt-6 o-grid o-gap-4 sm:o-grid-cols-3">
        {POCHES.map((poche) => (
          <div
            key={poche.cle}
            className="o-border-t o-pt-3"
            style={{ borderColor: 'var(--o-theme-line)' }}
          >
            <span className="o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
              <span
                aria-hidden="true"
                className="o-size-2.5"
                style={{ backgroundColor: accent(poche.nuance) }}
              />
              {poche.nom}
            </span>
            <p
              className="o-m-0 o-mt-2 o-tabular-nums o-text-stone-950 dark:o-text-stone-50"
              style={{ ...affiche('m', 300), fontSize: 'clamp(1.5rem, 2.6vw, 2.25rem)' }}
            >
              {Math.round((parts[poche.cle] / total) * 100)} %
            </p>
            <p className="o-m-0 o-font-mono o-text-xs o-tabular-nums o-text-stone-500 dark:o-text-stone-400">
              {euros(parts[poche.cle])}
            </p>
          </div>
        ))}
      </figcaption>
    </figure>
  )
}

/* ============================ Le calcul ================================ */

/** Le mecanisme : trois reglages, sept postes, une reglette. */
function Frais(): ReactElement {
  const [prix, setPrix] = useState(300000)
  const [nature, setNature] = useState<string>('ancien')
  const [departement, setDepartement] = useState<(typeof DEPARTEMENTS)[number]>(
    DEPARTEMENTS[0],
  )

  const { postes, total, parts } = useMemo(
    () => decompter(prix, nature, departement.taux),
    [prix, nature, departement],
  )

  const recopie = useMemo(
    () =>
      [
        `Frais d acquisition — ${prix.toLocaleString('fr-FR')} EUR, ${nature === 'ancien' ? 'ancien' : 'neuf'}, ${departement.nom}`,
        ...postes.map((p) => `${p.nom} : ${euros(p.montant)}`),
        `Total : ${euros(total)}`,
      ].join('\n'),
    [postes, total, prix, nature, departement],
  )

  return (
    <div>
      {/* Les trois reglages. */}
      <div className="o-grid o-gap-8 md:o-grid-cols-12">
        <div className="md:o-col-span-7">
          <label
            htmlFor="notaire-prix"
            className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300"
          >
            Le prix d achat
          </label>
          <p
            className="o-m-0 o-mt-2 o-tabular-nums o-text-stone-950 dark:o-text-stone-50"
            style={{ ...affiche('m', 300), fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}
          >
            {prix.toLocaleString('fr-FR')}{' '}
            <span className="o-text-stone-500 dark:o-text-stone-400">EUR</span>
          </p>
          <input
            id="notaire-prix"
            type="range"
            min={80000}
            max={900000}
            step={5000}
            value={prix}
            onChange={(evenement) => {
              setPrix(Number(evenement.target.value))
            }}
            className="o-mt-4 o-w-full o-cursor-pointer focus:o-ring"
            style={{ accentColor: encre() }}
          />
          <p
            aria-hidden="true"
            className="o-m-0 o-mt-1 o-flex o-justify-between o-font-mono o-text-xs o-tabular-nums o-text-stone-500 dark:o-text-stone-400"
          >
            <span>80 000</span>
            <span>900 000</span>
          </p>
        </div>

        <div className="o-flex o-flex-col o-gap-6 md:o-col-span-5">
          <div>
            <p className="o-m-0 o-mb-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
              La nature du bien
            </p>
            <SegmentedControl
              label="La nature du bien"
              options={NATURES}
              value={nature}
              onChange={setNature}
            />
          </div>
          <div>
            <p className="o-m-0 o-mb-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
              Le departement
            </p>
            <div className="o-flex o-flex-wrap o-gap-2">
              {DEPARTEMENTS.map((d) => {
                const actif = d.cle === departement.cle
                return (
                  <button
                    key={d.cle}
                    type="button"
                    aria-pressed={actif}
                    onClick={() => {
                      setDepartement(d)
                    }}
                    className="o-cursor-pointer o-border-w-1 o-px-4 o-py-2 o-text-sm o-tabular-nums o-transition-colors focus:o-ring"
                    style={
                      actif
                        ? { ...aplat(), borderColor: 'transparent' }
                        : {
                            borderColor: 'var(--o-theme-line)',
                            color: 'var(--o-theme-fg)',
                            backgroundColor: 'transparent',
                          }
                    }
                  >
                    {d.nom} —{' '}
                    {(d.taux * 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}{' '}
                    %
                  </button>
                )
              })}
            </div>
            <p className="o-m-0 o-mt-2 o-max-w-xs o-text-xs o-leading-relaxed o-text-stone-500 dark:o-text-stone-400">
              Quatre departements seulement ont garde le taux plancher. Le notaire n y est
              pour rien : c est un vote du conseil departemental.
            </p>
          </div>
        </div>
      </div>

      {/* La reglette graduee — forme C22. */}
      <div className="o-mt-14">
        <Reglette parts={parts} total={total} />
      </div>

      {/* Le detail, poste par poste. */}
      <div className="o-mt-14 o-grid o-gap-10 md:o-grid-cols-12">
        <dl aria-live="polite" className="o-m-0 md:o-col-span-7">
          {postes.map((poste) => (
            <div
              key={poste.cle}
              className="o-grid o-gap-x-6 o-gap-y-1 o-border-t o-py-4 md:o-grid-cols-12"
              style={{ borderColor: 'var(--o-theme-line)' }}
            >
              <dt className="md:o-col-span-7">
                <span className="o-flex o-items-center o-gap-2 o-text-base o-font-medium o-text-stone-950 dark:o-text-stone-50">
                  <span
                    aria-hidden="true"
                    className="o-size-2.5 o-shrink-0"
                    style={{
                      backgroundColor: accent(
                        POCHES.find((p) => p.cle === poste.poche)?.nuance ?? 500,
                      ),
                    }}
                  />
                  {poste.nom}
                </span>
                <span className="o-mt-1 o-block o-max-w-md o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                  {poste.detail}
                </span>
              </dt>
              <dd className="o-m-0 o-font-mono o-tabular-nums o-text-stone-900 dark:o-text-stone-100 md:o-col-span-5 md:o-text-right">
                {euros(poste.montant)}
              </dd>
            </div>
          ))}
        </dl>

        <div className="md:o-col-span-5">
          <div
            className="o-border-w-1 o-p-6 md:o-sticky"
            style={{
              borderColor: encre(),
              backgroundColor: accentDoux(300, 12),
              top: CHROME + 32,
            }}
          >
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
              Total a verser a la signature
            </p>
            <p
              className="o-m-0 o-mt-3 o-whitespace-nowrap o-tabular-nums o-text-stone-950 dark:o-text-stone-50"
              style={{ ...affiche('m', 300), fontSize: 'clamp(1.9rem, 3.4vw, 3rem)' }}
            >
              {euros(total)}
            </p>
            <p className="o-m-0 o-mt-2 o-font-mono o-text-xs o-tabular-nums o-text-stone-600 dark:o-text-stone-300">
              soit{' '}
              {((total / prix) * 100).toLocaleString('fr-FR', {
                maximumFractionDigits: 2,
              })}{' '}
              % du prix
            </p>
            <p className="o-m-0 o-mt-5 o-text-sm o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
              Les fonds sont appeles huit jours avant la signature, sur le compte de l
              etude a la Caisse des depots. Le solde non employe est restitue dans le
              mois.
            </p>
            <div className="o-mt-6">
              <CopyButton
                value={recopie}
                label="Copier le detail"
                className="o-px-4 o-py-2 o-text-sm focus:o-ring"
                style={{ borderRadius: 0, gap: '0.5rem' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================ Le pied (P40) ============================ */

/**
 * Le pied sur papier millimetre, cotes comprises.
 *
 * Le papier est deux trames superposees — un millimetre pale, un centimetre
 * plus marque — et les cotes sont de vraies cotes : des lignes d attache, des
 * fleches, et une mesure en mono au milieu. C est le langage d un plan, et
 * c est celui d une etude qui mesure des parcelles.
 */
function PiedMillimetre(): ReactElement {
  const trame = [
    `linear-gradient(to right, ${accentDoux(700, 14)} 1px, transparent 1px)`,
    `linear-gradient(to bottom, ${accentDoux(700, 14)} 1px, transparent 1px)`,
    `linear-gradient(to right, ${accentDoux(700, 6)} 1px, transparent 1px)`,
    `linear-gradient(to bottom, ${accentDoux(700, 6)} 1px, transparent 1px)`,
  ].join(', ')

  return (
    <footer
      className="o-relative o-overflow-hidden o-border-t"
      style={{ borderColor: 'var(--o-theme-line)' }}
    >
      <div
        aria-hidden="true"
        className="o-pointer-events-none o-absolute o-inset-0"
        style={{
          backgroundImage: trame,
          backgroundSize: '50px 50px, 50px 50px, 10px 10px, 10px 10px',
        }}
      />
      <div className="o-relative o-mx-auto o-max-w-7xl o-px-6 o-py-16 md:o-px-10">
        {/* La cote du haut : la largeur du bloc. */}
        <div aria-hidden="true" className="o-mb-10 o-flex o-items-center o-gap-3">
          <span className="o-size-1.5 o-rotate-45" style={{ backgroundColor: encre() }} />
          <span
            className="o-h-px o-grow"
            style={{ backgroundColor: encre(), opacity: 0.6 }}
          />
          <span
            className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-tabular-nums"
            style={{ color: encre() }}
          >
            1 440 mm
          </span>
          <span
            className="o-h-px o-grow"
            style={{ backgroundColor: encre(), opacity: 0.6 }}
          />
          <span className="o-size-1.5 o-rotate-45" style={{ backgroundColor: encre() }} />
        </div>

        <div className="o-grid o-gap-10 md:o-grid-cols-12">
          <div className="md:o-col-span-5">
            <p
              className="o-m-0 o-flex o-items-center o-gap-3 o-text-stone-950 dark:o-text-stone-50"
              style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              <Icon
                icon={Scale}
                size={26}
                aria-hidden="true"
                style={{ color: encre() }}
              />
              Minute
            </p>
            <p className="o-m-0 o-mt-4 o-max-w-sm o-text-sm o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
              Etude notariale Vaury &amp; Delaunay, titulaire d un office cree en 1908.
              Deux notaires associes, neuf collaborateurs.
            </p>
            <dl className="o-m-0 o-mt-8 o-grid o-gap-x-6 o-gap-y-2 o-font-mono o-text-xs o-uppercase o-tracking-widest sm:o-grid-cols-2">
              {(
                [
                  ['Adresse', '14 quai Saint-Antoine, 69002 Lyon'],
                  ['Ouverture', 'Lundi au vendredi, 9 h — 18 h'],
                  ['Telephone', '04 78 42 19 06'],
                  ['Courriel', 'etude@minute-notaires.fr'],
                ] as const
              ).map(([quoi, valeur]) => (
                <div key={quoi}>
                  <dt className="o-text-stone-500 dark:o-text-stone-400">{quoi}</dt>
                  <dd
                    className="o-m-0 o-mt-1 o-normal-case o-text-stone-800 dark:o-text-stone-200"
                    style={{ letterSpacing: 0 }}
                  >
                    {valeur}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Les trois colonnes de liens, chacune cotee. */}
          {(
            [
              [
                'Les actes',
                [
                  ['#frais', 'Vente et acquisition'],
                  ['#vente', 'Delais et pieces'],
                  ['#minute', 'Conservation'],
                  ['#devis', 'Demander un devis'],
                ] as const,
                '320',
              ],
              [
                'La maison',
                [
                  ['#haut', 'L office'],
                  ['#frais', 'Le tarif reglemente'],
                  ['#minute', 'Le depot'],
                  ['#devis', 'Nous ecrire'],
                ] as const,
                '320',
              ],
              [
                'Mentions',
                [
                  ['#minute', 'Chambre des notaires'],
                  ['#minute', 'Mediation de la consommation'],
                  ['#minute', 'Donnees personnelles'],
                  ['#haut', 'Remonter'],
                ] as const,
                '320',
              ],
            ] as const
          ).map(([titre, liens, cote]) => (
            <div key={titre} className="o-relative md:o-col-span-2">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                {titre}
              </p>
              <ul className="o-m-0 o-mt-4 o-flex o-list-none o-flex-col o-gap-2 o-p-0">
                {liens.map(([cible, mot]) => (
                  <li key={`${cible}-${mot}`}>
                    <a
                      href={cible}
                      className="o-text-sm o-text-stone-700 o-no-underline o-transition-colors hover:o-text-stone-950 focus:o-ring dark:o-text-stone-300 dark:hover:o-text-stone-50"
                    >
                      {mot}
                    </a>
                  </li>
                ))}
              </ul>
              {/* La cote verticale de la colonne. */}
              <span
                aria-hidden="true"
                className="o-absolute o-bottom-0 o-right-0 o-top-0 o-hidden o-w-px md:o-block"
                style={{ backgroundColor: encre(), opacity: 0.35 }}
              />
              <span
                aria-hidden="true"
                className="o-absolute o-right-1 o-top-1/2 o-hidden o-font-mono o-text-xs o-tabular-nums md:o-block"
                style={{
                  color: encre(),
                  transform: 'rotate(90deg)',
                  transformOrigin: 'right center',
                }}
              >
                {cote}
              </span>
            </div>
          ))}
        </div>

        {/* La cartouche : echelle, date, indice — comme au bas d un plan. */}
        <dl
          className="o-m-0 o-mt-14 o-grid o-gap-px o-border-w-1 sm:o-grid-cols-4"
          style={{ borderColor: encre(), backgroundColor: 'var(--o-theme-line)' }}
        >
          {(
            [
              ['Echelle', '1 : 1'],
              ['Indice', 'C — 11.09.2026'],
              ['Office', '69 002 018'],
              ['Piece', 'Pied de page'],
            ] as const
          ).map(([quoi, valeur]) => (
            <div
              key={quoi}
              className="o-px-4 o-py-3"
              style={{ backgroundColor: 'var(--o-theme-bg)' }}
            >
              <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                {quoi}
              </dt>
              <dd className="o-m-0 o-mt-1 o-font-mono o-text-sm o-tabular-nums o-text-stone-900 dark:o-text-stone-100">
                {valeur}
              </dd>
            </div>
          ))}
        </dl>

        <p className="o-m-0 o-mt-8 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
          <span>© 2026 Minute — Vaury &amp; Delaunay, notaires associes</span>
          <a
            href="#haut"
            className="o-text-stone-500 o-no-underline hover:o-text-stone-950 focus:o-ring dark:o-text-stone-400 dark:hover:o-text-stone-50"
          >
            Remonter ↑
          </a>
        </p>
      </div>
    </footer>
  )
}

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('grotesk')
  const { reduced } = useMotionState()
  const [demande, setDemande] = useState('')

  return (
    <Porte forme="zoom" marque="Minute" sombre={false}>
      <div
        className="o-relative o-overflow-hidden"
        style={{ ...polices, backgroundColor: accentDoux(200, 12) }}
      >
        {/*
          ----- L ouverture : du papier, une gouttiere, la minute dessinee -----
        */}
        <section
          id="haut"
          className="o-relative o-isolate o-flex o-flex-col"
          style={{ minHeight: ECRAN }}
        >
          <Filigrane
            taille={30}
            opacite={6}
            className="o-pointer-events-none o-absolute o-inset-x-0 o-bottom-4 o-z-0"
          >
            MINUTE
          </Filigrane>

          <BarreCoins
            marque="Minute — notaires"
            liens={NAVIGATION}
            droite="Lyon, quai Saint-Antoine"
            sombre={false}
          />

          <div className="o-relative o-z-10 o-mx-auto o-grid o-w-full o-max-w-7xl o-grow o-items-center o-gap-10 o-px-6 o-pb-20 o-pt-10 md:o-grid-cols-12 md:o-px-10">
            <div className="md:o-col-span-8">
              <Surgit>
                <Etiquette sombre={false}>
                  Office cree en 1908 — deux notaires associes
                </Etiquette>
              </Surgit>
              <TitreVague
                delai={140}
                cadence={78}
                className="o-m-0 o-mt-7 o-max-w-4xl o-text-stone-950 dark:o-text-stone-50"
                style={{
                  ...affiche('l', 300),
                  fontSize: 'clamp(2.5rem, 7.6vw, 7.5rem)',
                  letterSpacing: '-0.045em',
                  lineHeight: 0.94,
                }}
              >
                Les frais de notaire, ecrits en entier.
              </TitreVague>
              <Surgit
                delai={560}
                as="p"
                className="o-m-0 o-mt-10 o-max-w-lg o-text-lg o-leading-relaxed o-text-stone-700 dark:o-text-stone-300"
              >
                Sur cent euros verses le jour de la signature, douze reviennent a l etude.
                Voici les quatre-vingt-huit autres, et a qui ils vont.
              </Surgit>
              <Surgit delai={700} className="o-mt-9">
                <Actions
                  pleine={[
                    '#frais',
                    <>
                      Faire le calcul{' '}
                      <Icon icon={ArrowDown} size={16} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#devis', 'Demander un devis']}
                  sombre={false}
                />
              </Surgit>
            </div>

            {/* La minute deborde sur la bande de mentions : une page dessinee
                prend ce risque-la, et c est ce qui la distingue d une grille. */}
            <Parallaxe
              vitesse={0.2}
              glisse={0.62}
              className="o-hidden md:o-col-span-4 md:o-block"
            >
              <div
                className="o-mx-auto o-w-full o-max-w-xs"
                style={{ transform: 'translateY(9%) rotate(-2.2deg)' }}
              >
                <MinuteDessinee />
              </div>
            </Parallaxe>
          </div>

          <div className="o-hidden md:o-block">
            <Coin position="bd" sombre={false}>
              Rendez-vous sous huit jours
              <br />
              Consultation de premiere heure, gratuite
            </Coin>
          </div>
        </section>

        <BandeauMentions
          mono
          mentions={[
            'Tarif reglemente',
            'Aucun honoraire libre sur une vente',
            'Fonds a la Caisse des depots',
            'Signature electronique',
            'Acte conserve soixante-quinze ans',
            'Devis chiffre sous 48 h',
            'Mediation de la consommation',
          ]}
        />

        {/*
          ----- Chapitre 01 : le mecanisme, les frais --------------------------
        */}
        <section
          id="frais"
          className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-10 md:o-py-28"
        >
          <div className="o-mx-auto o-max-w-7xl">
            <Chapitre
              indice="(01) — Le calcul"
              largeur={4}
              titre={
                <h2
                  className="o-m-0 o-max-w-sm o-text-balance o-text-stone-950 dark:o-text-stone-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 3.4vw, 3rem)',
                    letterSpacing: '-0.04em',
                  }}
                >
                  Ce que vous versez, et ou cela va
                </h2>
              }
              texte={
                <p className="o-m-0 o-text-stone-700 dark:o-text-stone-300">
                  Bougez le prix : les sept postes se recalculent aux taux en vigueur, et
                  la reglette montre la longueur reelle de chacun.
                </p>
              }
            >
              <Frais />
            </Chapitre>
          </div>
        </section>

        {/*
          ----- La coupe sombre : un ecran de texte seul ------------------------
        */}
        <section
          className="o-flex o-items-center o-px-6 o-py-24 md:o-px-10 md:o-py-36"
          style={nuit('stone')}
        >
          <div className="o-mx-auto o-w-full o-max-w-7xl">
            <Manifeste eteint="On appelle cela des frais de notaire.">
              Ce sont des impots, et nous les encaissons pour le compte de l Etat.
            </Manifeste>
            <BlurWords
              as="p"
              boucle={false}
              blur={6}
              dim={0.45}
              step={42}
              className="o-m-0 o-mt-10 o-max-w-2xl o-text-base o-leading-relaxed o-text-stone-300"
            >
              Le tarif est fixe par arrete. Il est le meme dans les six mille etudes de
              France, et il ne se negocie pas.
            </BlurWords>
          </div>
        </section>

        {/*
          ----- Chapitre 02 : la vente, et ses delais reels ---------------------
        */}
        <section
          id="vente"
          className="o-scroll-mt-24 o-border-t o-px-6 o-py-20 md:o-px-10 md:o-py-28"
          style={{ borderColor: 'var(--o-theme-line)' }}
        >
          <div className="o-mx-auto o-max-w-7xl">
            <Chapitre
              indice="(02) — Le calendrier"
              largeur={3}
              titre={
                <h2
                  className="o-m-0 o-max-w-sm o-text-balance o-text-stone-950 dark:o-text-stone-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 3.4vw, 3rem)',
                    letterSpacing: '-0.04em',
                  }}
                >
                  Quatre-vingt-dix jours, dont trente d attente
                </h2>
              }
              texte={
                <p className="o-m-0 o-text-stone-700 dark:o-text-stone-300">
                  Deux delais sur six sont imposes par la loi. Une etude qui promet une
                  vente en six semaines vous promet ce qu elle ne peut pas tenir.
                </p>
              }
            >
              <FriseVente />
            </Chapitre>
          </div>
        </section>

        {/*
          ----- Chapitre 03 : la minute --------------------------------------
        */}
        <section
          id="minute"
          className="o-scroll-mt-24 o-border-t o-px-6 o-py-20 md:o-px-10 md:o-py-28"
          style={{
            borderColor: 'var(--o-theme-line)',
            backgroundColor: accentDoux(300, 8),
          }}
        >
          <div className="o-mx-auto o-max-w-7xl">
            <Chapitre
              indice="(03) — Le depot"
              largeur={4}
              titre={
                <h2
                  className="o-m-0 o-max-w-sm o-text-balance o-text-stone-950 dark:o-text-stone-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 3.4vw, 3rem)',
                    letterSpacing: '-0.04em',
                  }}
                >
                  L original ne sort jamais
                </h2>
              }
              texte={
                <p className="o-m-0 o-text-stone-700 dark:o-text-stone-300">
                  Ce que vous emportez est une copie authentique. L original — la minute —
                  reste au rang des minutes de l etude.
                </p>
              }
            >
              <div className="o-grid o-gap-10 md:o-grid-cols-12 md:o-items-center">
                <dl className="o-m-0 md:o-col-span-7">
                  {(
                    [
                      [
                        'La minute',
                        'L acte signe, revetu du sceau. Elle est conservee au coffre, et elle n en sort que sur requisition d un juge.',
                      ],
                      [
                        'La copie authentique',
                        'Le document que vous recevez. Il a la meme force probante, et il se remplace : demandez-le, on le refait.',
                      ],
                      [
                        'Soixante-quinze ans',
                        'Duree de conservation a l etude. Passe ce delai, la minute part aux archives departementales, ou elle devient publique.',
                      ],
                      [
                        'Le repertoire',
                        'Chaque minute est inscrite le jour meme, a la suite, sous un numero qui ne se reutilise pas. C est ce registre qui fait foi de la date.',
                      ],
                    ] as const
                  ).map(([terme, valeur]) => (
                    <div
                      key={terme}
                      className="o-grid o-gap-x-6 o-gap-y-1 o-border-t o-py-5 sm:o-grid-cols-12"
                      style={{ borderColor: 'var(--o-theme-line)' }}
                    >
                      <dt
                        className="o-font-mono o-text-xs o-uppercase o-tracking-widest sm:o-col-span-4"
                        style={{ color: encre() }}
                      >
                        {terme}
                      </dt>
                      <dd className="o-m-0 o-text-sm o-leading-relaxed o-text-stone-700 dark:o-text-stone-300 sm:o-col-span-8">
                        {valeur}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="o-mx-auto o-w-full o-max-w-xs md:o-col-span-5">
                  <MinuteDessinee />
                  <p className="o-m-0 o-mt-4 o-text-center o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                    Minute pliee au tiers, sceau de l office
                  </p>
                </div>
              </div>
            </Chapitre>
          </div>
        </section>

        {/*
          ----- L appel : un devis demande par courrier, en une ligne (A38) -----
        */}
        <section
          id="devis"
          className="o-scroll-mt-24 o-border-t o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          style={{ borderColor: 'var(--o-theme-line)' }}
        >
          <div className="o-mx-auto o-max-w-4xl o-text-center">
            <Indice rang="04" sombre={false}>
              Le devis
            </Indice>
            <h2
              className="o-m-0 o-mt-6 o-text-balance o-text-stone-950 dark:o-text-stone-50"
              style={{
                ...affiche('l', 300),
                fontSize: 'clamp(2rem, 5.4vw, 4.75rem)',
                letterSpacing: '-0.045em',
                lineHeight: 0.96,
              }}
            >
              Une ligne suffit.
            </h2>
            <p className="o-m-0 o-mx-auto o-mt-6 o-max-w-xl o-text-base o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
              Laissez une adresse. Un clerc vous renvoie sous quarante-huit heures un
              devis chiffre sur votre dossier reel — pas une fourchette, un montant.
            </p>
            <div className="o-mt-10 o-flex o-justify-center">
              <ButtonGroupInput
                label="Votre adresse de courriel"
                type="email"
                placeholder="vous@exemple.fr"
                buttonLabel="Demander le devis"
                doneLabel="Demande notee"
                value={demande}
                onChange={setDemande}
                className="o-w-full o-max-w-lg"
                style={{ display: 'flex' }}
              />
            </div>
            <p className="o-m-0 o-mt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
              ou{' '}
              <a
                href="mailto:etude@minute-notaires.fr"
                className="o-no-underline focus:o-ring"
                style={{ color: encre() }}
              >
                etude@minute-notaires.fr
                <Icon icon={ArrowUpRight} size={13} aria-hidden="true" />
              </a>{' '}
              — 04 78 42 19 06
            </p>
            {reduced && (
              <p className="o-m-0 o-mt-4 o-text-xs o-text-stone-500 dark:o-text-stone-400">
                Le calcul des frais reste entierement utilisable sans animation.
              </p>
            )}
          </div>
        </section>

        {/*
          ----- Le pied : papier millimetre, cotes comprises (P40) -------------
        */}
        <PiedMillimetre />
      </div>
    </Porte>
  )
}
